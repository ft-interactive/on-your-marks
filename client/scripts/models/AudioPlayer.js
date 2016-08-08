import { Howl } from 'howler';
import { EventEmitter } from 'events';
import Bluebird from 'bluebird';

const config = window.__gameConfig;
const qs = selector => document.querySelector(selector);

const soundTypes = [{
  name: 'ambient',
  loop: true,
}, {
  name: 'presignal', // TODO allow skipping this for the bike one
}, {
  name: 'signal',
}, {
  name: 'roar', // should play after the signal (or maybe after user goes?)
}, {
  name: 'groan', // should play after the signal (or maybe after user goes?)
}];

const imageTypes = ['bg'];

/**
 * Returns a promise for a new Howl instance. Resolves when the sound is loaded
 * and ready to play.
 */
const getSound = options => new Bluebird((resolve, reject) => {
  const sound = new Howl({
    ...options,
    onload: () => resolve(sound),
    onloaderror: (id, error) => {
      reject(error instanceof Error ? error : new Error(error));
    },
  });
});

/**
 * This is a kind of model/state machine, but also takes care of playing sounds, so it's
 * a bit of a 'view' too...
 */
export default class AudioPlayer extends EventEmitter {
  constructor(options) {
    super();

    for (const key of Object.keys(options)) {
      Object.defineProperty(this, key, { value: options[key], enumerable: true });
    }
  }

  /**
   * Returns a promise that resolves when `this._sounds` is ready to use.
   * Can be called multiple times; only the first time does it start downloads.
   */
  async ready() {
    if (!this._readyPromise) {
      this._readyPromise = Promise.resolve().then(async () => {
        const soundPromises = {};

        for (const { name, loop } of soundTypes) {
          if (this[`hasno${name}`]) continue;

          soundPromises[name] = getSound({
            src: [`${config.assetRoot}/audio/${this.slug}-${name}.mp3`],
            loop,
          });
        }

        this._sounds = await Bluebird.props(soundPromises);
      });
    }

    return this._readyPromise;
  }

  /**
   * Stops all/any sounds that are playing.
   */
  async _stopSounds() {
    await this.ready();

    await Bluebird.map(Object.keys(this._sounds), soundType => new Bluebird(resolve => {
      const sound = this._sounds[soundType];
      sound.once('stop', () => resolve());
      sound.stop();
    }));
  }

  /**
   * Plays the named sound clip, and waits for it to finish.
   * Or, if you set awaitCompletion to false, it resolves as soon as the sound
   * has started playing.
   */
  async _playSound(name, volume = 1, awaitCompletion = true) {
    if (this[`hasno${name}`]) return;

    if (this._state === 'played' && name !== 'groan') {
      return;
    }

    await new Bluebird(resolve => {

      if ( this.slug == 'sprint' && name == 'presignal' ){
        Bluebird.delay(4050).then(function() {
          qs('.game__panel--cue').classList.add('set');
        });
      }

      const sound = this._sounds[name];
      sound.once((awaitCompletion ? 'end' : 'play'), () => resolve());
      sound.volume(volume);
      qs('.game__panel--cue').classList.add(name);
      sound.play();
    });
  }

  /**
   * Fades the given already-playing sound. Waits for the fade to complete.
   */
  async _fadeSound(name, fromVolume, toVolume, duration) {
    if (!this._active) return;

    await new Bluebird(resolve => {
      const sound = this._sounds[name];
      sound.once('fade', () => resolve());
      sound.fade(fromVolume, toVolume, duration);
    });
  }

  /**
   * Stops all sounds and disables 'active' flag in attempt to stop new sounds
   * starting.
   */
  async stop() {
    this._active = false;
    this._stopSounds();
  }

}

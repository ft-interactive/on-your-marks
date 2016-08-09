import { Howl } from 'howler';
import { EventEmitter } from 'events';
import Bluebird from 'bluebird';

const config = window.__gameConfig;
const qs = selector => document.querySelector(selector);
const assetRoot = config.assetRoot;

const soundTypes = [{
  name: 'countdown',
  loop: false,
}, {
  name: 'signal',
  loop: false,
}, {
  name: 'false',
  loop: false,
}];


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
  constructor(slug) {
    super();

    this.slug = slug
  }

  /**
   * Returns a promise that resolves when `this._sounds` is ready to use.
   * Can be called multiple times; only the first time does it start downloads.
   */
  async load() {
    if (!this._readyPromise) {
      this._readyPromise = Promise.resolve().then(async () => {
        const soundPromises = {};

        for (const { name, loop } of soundTypes) {
          soundPromises[name] = getSound({
            src: [`${assetRoot}/audio/${this.slug}-${name}.mp3`],
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
  async stop() {
    await this.load();
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
  async play(name, volume = 1, awaitCompletion = true) {
    await new Bluebird(resolve => {
      const sound = this._sounds[name];
      sound.once((awaitCompletion ? 'end' : 'play'), () => resolve());
      sound.volume(volume);
      sound.play();
    });
  }

  /**
   * Fades the given already-playing sound. Waits for the fade to complete.
   */
  async fade(name, fromVolume, toVolume, duration) {
    await new Bluebird(resolve => {
      const sound = this._sounds[name];
      sound.once('fade', () => resolve());
      sound.fade(fromVolume, toVolume, duration);
    });
  }

}

import { Howl } from 'howler';
import { EventEmitter } from 'events';
import Bluebird from 'bluebird';

const config = window.__gameConfig;
const qs = selector => document.querySelector(selector);

/**
 * A level instance can be in one of three states:
 *
 * - unplayed (intro screen, proceeds to 'playing' when user clicks)
 * - playing (sounds are playing, button panel showing, automatically proceeds
 * to 'played' after timed sequence)
 * - played (results panel showing)
 */
export const states = [
  'unplayed', 'playing', 'played',
];

const soundTypes = [{
  name: 'ambient',
  loop: true,
}, {
  name: 'presignal', // TODO allow skipping this for the bike one
}, {
  name: 'signal',
}, {
  name: 'roar', // should play after the signal (or maybe after user goes?)
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
export default class Level extends EventEmitter {
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
   * Sets the level's state, and emits a statechanged event if it changed.
   */
  _setState(newState) {
    if (states.indexOf(newState) === -1) throw new Error(`Unknown state: ${newState}`);

    if (this._state !== newState) {
      this._state = newState;
      this.emit('statechanged', newState);
    }
  }

  /**
   * Plays the named sound clip, and waits for it to finish.
   * Or, if you set awaitCompletion to false, it resolves as soon as the sound
   * has started playing.
   */
  async _playSound(name, volume = 1, awaitCompletion = true) {
    if (this[`hasno${name}`]) return;

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

  /**
   * From a stopped/never-started state, this transitions to the first state.
   */
  async startIntro() {
    if (this._active) throw new Error('Cannot call startIntro when level is already active');

    delete this._userReactedAt;

    await this.ready();
    this._active = true;
    if (this.slug === 'cycle') {
      this._setState('unplayed');
      await this._playSound('ambient', 0, false);
 -    await this._fadeSound('ambient', 0, 1, 2000);
    } else {
      await this.startPlaying();
    }

  }

  /**
   * Kicks off the timed game.
   */
  async startPlaying() {
    if (!this._state === 'unplayed') {
      throw new Error('Cannot call startPlaying unless in current state is "unplayed"');
    }

    this._setState('playing');

    // wait a second then start fading down the ambient noise

    await this._playSound('ambient', 1, false);
    await Bluebird.delay(300);
    if (this.slug === 'sprint') {
      await this._fadeSound('ambient', 1, 0.1, 1800);

      setTimeout(async ()=> {
        await this._fadeSound('ambient', 0.1, 0.05, 600);
        await this._fadeSound('ambient', 0.05, 0.0055, 1000);
        await this._fadeSound('ambient', 0.0055, 0, 3000);
      }, 60);
    } else {
      await this._fadeSound('ambient', 1, 0.1, 1500);
      setTimeout(async ()=> {
        await this._fadeSound('ambient', 0.1, 0, 600);
      }, 60);
    }


    // play the presignal
    await this._playSound('presignal'); // TODO skip if no presignal, as is the case in the bike one


    // perform a nice staggered fade-down of the ambient noise
    // await this._fadeSound('ambient', 1, 0.4, 1500);
    // await Bluebird.delay(1000);
    // await this._fadeSound('ambient', 0.4, 0.15, 1000);
    // await this._fadeSound('ambient', 0.15, 0, 1500);


    // wait for the delay
    await Bluebird.delay(this.delay + (Math.random() * this.delayrandomness));

    // start play the signal
    const signalPlayed = this._playSound('signal');

    // record time at the actual signal (which might be after an offset into the sound clip)
    if (this.signaloffset) await Bluebird.delay(this.signaloffset);
    this._signalTime = Date.now(); // TODO add any offset, like there is for the cycling

    // start the roar now (but don't wait for it)
    await this._playSound('roar', 1, false);

    // let the signal finish playing, plus a bit of extra time for them to react
    await signalPlayed;
    await Bluebird.delay(500); // TODO race this against a promise that gets resolved shortly after user's reaction is registered?

    // transition to the final state, showing the result panel
    this._setState('played');
    qs('.game__panel--cue').classList.remove("ambient","presignal","signal","set","roar");
  }

  /**
   * When the user actually clicks to race/dive/whatever, the view should call
   * this to register the time.
   */
  registerReactionNow() {
    this._userReactedAt = Date.now();
    this._setState('played');
  }

  getReactionTime() {
    if (!this._userReactedAt) {
      return 'You never left the blocks!';
    }

    if (!this._signalTime) {
      return 'False start - you\'re disqualified';
    }

    return `${(this._userReactedAt - this._signalTime) / 1000} seconds`;
  }
}

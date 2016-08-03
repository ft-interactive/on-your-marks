/**
 * Level class
 * A kind of state machine for a level.
 *
 * - Knows the full config of a level, as well as its current state
 * -
 *
 * Three states:
 * - unplayed (intro screen, proceeds to 'playing' when user clicks)
 * - playing (sounds are playing)
 * - played
 */

import { Howl } from 'howler';
import { EventEmitter } from 'events';
import Bluebird from 'bluebird';

export const states = [
  'off', 'unplayed', 'playing', 'played',
];

const config = window.__gameConfig;

const soundTypes = [{
  name: 'ambient',
  loop: true,
}];

const imageTypes = ['bg'];

const getSound = options => new Bluebird((resolve, reject) => {
  const sound = new Howl({
    ...options,
    // sprite,
    onload: () => resolve(sound),
    onloaderror: (id, error) => {
      reject(error instanceof Error ? error : new Error(error));
    },
  });
});

export default class Level extends EventEmitter {
  constructor(options) {
    super();

    this._state = 'off';

    for (const key of Object.keys(options)) {
      Object.defineProperty(this, key, { value: options[key], enumerable: true });
    }
  }

  // TODO remove this method
  async getAssets() {
    if (!this._getAssetsPromise) {
      const soundPromises = {};
      for (const { name, loop } of soundTypes) {
        soundPromises[name] = getSound({
          src: [`${config.assetRoot}/audio/${this.slug}-${name}.mp3`],
          loop,
        });
      }

      const imagePromises = {};
      for (const imageType of imageTypes) {
        const url = `${config.assetRoot}/images/${this.slug}-${imageType}.jpg`;
        // const ratio = devicePixelRatio || 1;
        // const imageServiceURL = `https://image.webservices.ft.com/v1/images/raw/${encodeURIComponent(url)}?source=IG&width=${screen.width * ratio}&height=${screen.height * ratio}`;
        const imageServiceURL = url; // TEMPORARY

        imagePromises[imageType] = fetch(imageServiceURL)
          .then(res => res.blob())
          /* .then(blob => {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(blob);
            return img;
          })*/;
      }

      this._getAssetsPromise = Bluebird.props({
        sounds: Bluebird.props(soundPromises),
        images: Bluebird.props(imagePromises),
      });
    }

    return await this._getAssetsPromise;
  }

  async ready() {
    const { sounds } = await this.getAssets();
    this._sounds = sounds;
  }

  async stopSounds() {
    await this.ready();

    await Bluebird.map(Object.keys(this._sounds), soundType => new Bluebird(resolve => {
      const sound = this._sounds[soundType];
      sound.once('stop', () => resolve());
      sound.stop();
    }));
  }

  _setState(newState) {
    if (states.indexOf(newState) === -1) {
      throw new Error(`Unknown state: ${newState}`);
    }

    if (this._state !== newState) {
      this._state = newState;
      this.emit('statechanged', newState);
    }
  }

  async _startAmbient() {
    await new Promise(resolve => {
      const ambientSound = this._sounds.ambient;
      ambientSound.once('play', () => resolve());
      ambientSound.volume(0);
      ambientSound.play();
      this._fadeAmbient(0, 1, 1000);
    });
  }

  async _fadeAmbient(fromVolume, toVolume, duration) {
    await new Bluebird(resolve => {
      const ambientSound = this._sounds.ambient;
      ambientSound.once('fade', () => resolve());
      ambientSound.fade(fromVolume, toVolume, duration);
    });
  }

  /**
   * Sets it to the initial state.
   */
  async reset() {
    await this.stopSounds();
    this._setState('off');
  }

  async startIntro() {
    if (!this._state === 'off') {
      throw new Error('Expected current state to be "off"');
    }

    this._setState('unplayed');
    await this._startAmbient();
  }

  /**
   * Kicks off the timed game
   */
  async startPlaying() {
    if (!this._state === 'unplayed') {
      throw new Error('Cannot call startPlaying unless in current state is "unplayed"');
    }

    this._setState('playing');

    // wait a second then start fading down the ambient noise
    await Bluebird.delay(1000);

    // TODO determine up front the timings we're going to use for this run, including any randomness.
    // (should be determined up front so a negative reaction time, ie false start, can be known accurately)

    await this._fadeAmbient(1, 0.4, 1500);
    await Bluebird.delay(1000);
    await this._fadeAmbient(0.4, 0.15, 1000);
    await this._fadeAmbient(0.15, 0.01, 1500);
  }

  /**
   * For when the user actually clicks to race/dive/whatever.
   */
  async registerReactionNow() {
    // assert state is 'playing'.
    // determine how long before/after the actual click time it is.
  }
}

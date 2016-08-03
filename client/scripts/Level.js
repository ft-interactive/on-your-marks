import { Howl } from 'howler';
import Bluebird from 'bluebird';

const config = window.__gameConfig;

const soundTypes = [{
  name: 'ambient',
  loop: true,
}];

const imageTypes = ['bg'];

const getSound = options => new Promise((resolve, reject) => {
  const sound = new Howl({
    ...options,
    // sprite,
    onload: () => resolve(sound),
    onloaderror: (id, error) => {
      reject(error instanceof Error ? error : new Error(error));
    },
  });
});

export default class Level {
  constructor(options) {
    for (const key of Object.keys(options)) {
      Object.defineProperty(this, key, { value: options[key], enumerable: true });
    }
  }

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
}

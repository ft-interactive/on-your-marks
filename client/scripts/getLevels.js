import { Howl } from 'howler';
import Bluebird from 'bluebird';

let levels;

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

const soundTypes = [{
  name: 'ambient',
  loop: true,
}];

const imageTypes = ['bg']; // no need to preload icon, it just gets used directly on the front page

/**
 * Function that prepares and returns the array of levels.
 * Memoized so multiple calls return the same array.
 * Each level includes a 'ready' promise that resolves with loaded assets.
 *
 * @param  {Object} config The main config object for the app.
 * @return {Array}        An array of levels.
 */
export default config => {
  if (!levels) {
    levels = config.levels.map(level => {
      /**
       * Async function that returns (memoized) a promise.
       * Does not start loading until the first time it's called.
       * Usage: `level.ready().then(({ sounds, images }) => { ... });`
       */
      const ready = (() => {
        let readyPromise;

        return () => {
          if (!readyPromise) {
            const soundPromises = {};
            for (const { name, loop } of soundTypes) {
              soundPromises[name] = getSound({
                src: [`${config.assetRoot}/audio/${level.slug}-${name}.mp3`],
                loop,
              });
            }

            const imagePromises = {};
            for (const imageType of imageTypes) {
              imagePromises[imageType] = fetch(
                `${config.assetRoot}/images/${level.slug}-${imageType}.jpg`
              )
                .then(res => res.blob())
                .then(blob => {
                  const img = document.createElement('img');
                  img.src = URL.createObjectURL(blob);
                  return img;
                });
            }

            readyPromise = Bluebird.props({
              sounds: Bluebird.props(soundPromises),
              images: Bluebird.props(imagePromises),
            });
          }

          return readyPromise;
        };
      })();

      return {
        ...level,
        ready,
      };
    });
  }

  return levels;
};

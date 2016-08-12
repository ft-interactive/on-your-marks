import { Howl } from 'howler';

const assetRoot = window.__gameConfig.assetRoot;

function createHowl(slug, name) {
  const h = new Howl({
    src: [
      `${assetRoot}/audio/${slug}-${name}.mp3`,
    ],
    volume: 1,
    pool: 10,
    preload: true,
    loop: false,
    onloaderror: () => {
      h.loaderror = true;
    },
  });

  return h;
}

function fadeOutAndReturnToStart(sound, duration = 200) {
  if (!sound.playing()) return;
  sound.once('fade', () => {
    sound.stop();
  });
  sound.fade(1, 0, duration);
}

function transition(from, to) {
  fadeOutAndReturnToStart(from);

  return new Promise((resolve, reject) => {
    if (to.loaderror) {
      reject();
      return;
    }
    to.onloaderror = (id, reason) => {
      reject(reason);
    };

    if (to.playing()) {
      resolve();
      return;
    }

    to.once('play', resolve);
    to.volume(1);
    to.play();
  });
}

export default class AudioPlayer {

  constructor(slug) {
    this.countdown = createHowl(slug, 'countdown');
    this.falseStart = createHowl(slug, 'false');
    this.signal = createHowl(slug, 'signal');
  }

  playCountdownClip() {
    if (this.signal.playing()) {
      fadeOutAndReturnToStart(this.signal, 300);
    }
    return transition(this.falseStart, this.countdown);
  }

  playFalseStartClip() {
    return transition(this.countdown, this.falseStart);
  }

  playSignalClip() {
    return transition(this.countdown, this.signal);
  }

  stopAll() {
    this.countdown.stop();
    this.falseStart.stop();
    this.signal.stop();
  }
}

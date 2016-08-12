import { Howl } from 'howler';

const assetRoot = window.__gameConfig.assetRoot;

function createHowl(slug, name) {
  const h = new Howl({
    src: [
      `${assetRoot}/audio/${slug}-${name}.mp3`,
    ],
    volume: 1,
    //pool: 5,
    preload: true,
    loop: false,
    onload: () => {
      console.log('loaded', slug, name);
    },
    onloaderror: () => {
      console.log('load error', slug, name);
      h.loaderror = true;
    },
  });

  return h;
}

function fadeOutAndReturnToStart(sound, duration = 200) {
  if (!sound.playing()) return;
  sound.once('fade', () => {
    console.log('fade out done');
    sound.stop();
  });
  console.log('fade out');
  sound.fade(1, 0, duration);
}

function transition(from, to) {
  fadeOutAndReturnToStart(from);

  return new Promise((resolve, reject) => {
    if (to.loaderror) {
      console.log('reject due to load error');
      reject();
      return;
    }
    to.onloaderror = (id, reason) => {
      console.log('reject due to previous load error');
      reject(reason);
    };

    if (to.playing()) {
      console.log('is already playing');
      resolve();
      return;
    }

    console.log('play');
    to.once('play', resolve);
    to.volume(1);
    to.play();
  });
}

export default class AudioPlayer {

  constructor(slug) {
    this.slug = slug;
    this.countdown = createHowl(slug, 'countdown');
    this.falseStart = createHowl(slug, 'false');
    this.signal = createHowl(slug, 'signal');
  }

  playCountdownClip() {
    console.log('Play coundown', this.slug);
    if (this.signal.playing()) {
      console.log('but first fade out signal');
      fadeOutAndReturnToStart(this.signal, 300);
    }
    return transition(this.falseStart, this.countdown);
  }

  playFalseStartClip() {
    console.log('Play flase start', this.slug);
    return transition(this.countdown, this.falseStart);
  }

  playSignalClip() {
    console.log('Play signal', this.slug);
    return transition(this.countdown, this.signal);
  }

  stopAll() {
    console.log('Stop all', this.slug);
    this.countdown.stop();
    this.falseStart.stop();
    this.signal.stop();
  }
}

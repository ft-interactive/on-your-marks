import AudioPlayer from './AudioPlayer';

export default class LevelView {
  constructor(el, level) {
    this.el = el;
    this.level = level;
    this.hideAllState();
    this.audio = new AudioPlayer(this.level.slug);
    this.level.on('result', () => this.updateState());
    this.level.on('start', () => this.updateCountdownStatus());
    this.level.on('countdownprogress', () => this.updateCountdownStatus());
    this._loaded = false;
  }

  hideAllState() {
    [...this.el.querySelectorAll('[data-state]')].map(e => e.style.display = 'none');
  }

  updateState() {
    switch (this.level.result) {
      case 'NO_START':
        this.noStart();
        break;
      case 'FALSE_START':
        this.falseStart();
        break;
      case 'NORMAL_START':
        this.normalStart();
        break;
      case 'INCOMPLETE':
        this.incomplete();
        break;
      default:
        //console.log('WHAT STATE??');
    }
  }

  updateCountdownStatus() {
    const _el = this.getStateElement('countdown');
    const msgEl = _el.querySelector('.countdown-status');
    const countdown = this.level.countdown;

    if (countdown.complete) {
      this.audio.playSignalClip();
      msgEl.classList.remove('countdown', 'error');
      msgEl.classList.add('go');
    } else if (countdown.running) {
      msgEl.classList.remove('go', 'error');
      msgEl.classList.add('countdown');
    } else {
      msgEl.classList.remove('go', 'countdown');
    }
    msgEl.innerHTML = this.level.countdown.status || 'WAIT';
  }

  falseStart() {
    this.audio.playFalseStartClip();
    const btn = this.el.querySelector('.countdown-status');
    btn.innerHTML = 'FALSE START!';
    setTimeout(() => {
      btn.classList.add('shrinkAway');
    }, 90);
    setTimeout(() => {
      this.hideAllState();
      this.el.querySelector('.level__complete').style.display = 'block';
      const _el = this.getStateElement('false-start');
      _el.style.display = 'block';
      btn.classList.remove('shrinkAway');
      this.el.style.overflow = 'auto';
    }, 555);
    setTimeout(() => {
      this.el.querySelector('.next-level__container').style.display = 'block';
    }, 2800);
    {
      const _el = this.getStateElement('countdown');
      const msgEl = _el.querySelector('.countdown-status');
      msgEl.classList.remove('go', 'countdown');
      msgEl.classList.add('error');
    }
  }

  noStart() {
    this.hideAllState();
    this.el.querySelector('.level__complete').style.display = 'block';
    const _el = this.getStateElement('no-start');
    _el.style.display = 'block';
    this.el.style.overflow = 'auto';
    setTimeout(() => {
      this.el.querySelector('.next-level__container').style.display = 'block';
    }, 1500);
  }

  normalStart() {
    const btn = this.el.querySelector('.countdown-status');
    btn.classList.add('puffOut');
    const _el = this.getStateElement('normal-start');
    setTimeout(() => {
      this.hideAllState();
      this.el.querySelector('.level__complete').style.display = 'block';
      _el.style.display = 'block';
      btn.classList.remove('puffOut');
      this.el.style.overflow = 'auto';
    }, 800);
    setTimeout(() => {
      this.el.querySelector('.next-level__container').style.display = 'block';
    }, 4000);
  }

  incomplete() {
    this.hideAllState();
    this.el.querySelector('.level__complete').style.display = 'none';
    const _el = this.getStateElement('countdown');
    _el.style.display = 'block';
    const msgEl = _el.querySelector('.countdown-status');
    msgEl.classList.remove('go', 'error', 'countdown');
    this.el.style.overflow = 'hidden';
    this.el.querySelector('.next-level__container').style.display = 'none';
  }

  show() {
    this.hideAllState();
    this.el.style.display = 'block';
    this.el.style.overflow = 'hidden';
    this.el.querySelector('.level__complete').style.display = 'none';
    this.el.querySelector('.next-level__container').style.display = 'none';
    const loader = this.el.querySelector('.game__race-loader');
    const showLoader = setTimeout(() => {
      loader.style.display = 'block';
    }, 800);
    this.audio.playCountdownClip().then(() => {
      this.level.restart();
      clearTimeout(showLoader);
      loader.style.display = 'none';
    });
  }

  hide() {
    this.el.style.display = 'none';
    this.level.stop();
    this.audio.stopAll();
  }

  getStateElement(state) {
    return this.el.querySelector(`[data-state="${state}"]`);
  }

}

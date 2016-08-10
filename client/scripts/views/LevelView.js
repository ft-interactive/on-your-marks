import { scaleThreshold } from 'd3-scale';
import AudioPlayer from './AudioPlayer';

// TODO: dont hard code these values, use real data
//       to generate a histogram to make the domain
//       - or at least make the reflect the sport's data
// TODO: tweak the messages
const messageScale = scaleThreshold()
                        .domain([0, 180, 380, 620, 1100, 2000])
                        .range(['False start', 'Incredible!!', 'Pretty good!', 'Fair',
                                'Poor Effort', 'Terrible', 'Did you fall asleep?'])

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
        console.log('WHAT STATE??');
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
    setTimeout(() => {
      this.hideAllState();
      this.el.querySelector('.level__complete').style.display = 'block';
      const _el = this.getStateElement('false-start');
      _el.style.display = 'block';
    }, 700);
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
  }

  normalStart() {
    const _el = this.getStateElement('normal-start');
    const msg = messageScale(this.level.time);
    _el.querySelector('.result-summary').innerHTML = msg;
    setTimeout(() => {
      this.hideAllState();
      this.el.querySelector('.level__complete').style.display = 'block';
      _el.style.display = 'block';
    }, 800);
  }

  incomplete() {
    this.hideAllState();
    this.el.querySelector('.level__complete').style.display = 'none';
    const _el = this.getStateElement('countdown');
    _el.style.display = 'block';
    const msgEl = _el.querySelector('.countdown-status');
    msgEl.classList.remove('go', 'error', 'countdown');
  }

  show() {
    this.hideAllState();
    this.el.style.display = 'block';
    this.el.querySelector('.level__complete').style.display = 'none';
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

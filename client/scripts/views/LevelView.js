import { scaleThreshold } from 'd3-scale';
import AudioPlayer from './AudioPlayer';

export default class LevelView {
  constructor(el, level) {
    this.el = el;
    this.level = level;
    this.hideAllState();
    this.level.on('result', () => this.updateState());
    this.level.on('start', () => {
      // TODO: inc ase of replay fix
      // fading out of false start audio clip
      //this.audio.fade('false', 1, 0, 600);
      this.audio.play('countdown');
      this.updateCountdownStatus()
    });

    // TODO: dont hard code these values, use real data
    //       to generate a histogram to make the domain
    //       - or at least make the reflect the sport's data
    // TODO: tweak the messages
    this.messageScale = scaleThreshold()
                            .domain([0, 200, 400, 650, 1100, 2000])
                            .range(['False start', 'Incredible!!', 'Pretty good!', 'Fair',
                                    'Poor Effort', 'Terrible', 'Did you fall asleep?'])

    this.level.on('countdownprogress', () => this.updateCountdownStatus());
    this.audio = new AudioPlayer(this.level.slug);
    setTimeout(async () => {
      await this.audio.load();
    }, 0);
    this.updateState();
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
      this.audio.play('signal')
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
    this.audio.fade('countdown', 1, 0, 300);
    this.audio.play('false');
    setTimeout(()=>{
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
    const msg = this.messageScale(this.level.time);
    _el.querySelector('.result-summary').innerHTML = msg;
    console.log(msg, this.level.time);
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
    this.el.style.display = 'block';
    // TODO: dont let the user play and dont start countdown until
    //       the audio is loaded
  }

  hide() {
    this.el.style.display = 'none';
  }

  getStateElement(state) {
    return this.el.querySelector(`[data-state="${state}"]`);
  }

}

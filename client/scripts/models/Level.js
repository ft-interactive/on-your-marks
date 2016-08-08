import { EventEmitter } from 'events';
import Bluebird from 'bluebird';
import Countdown from './Countdown';
import * as Timings from './Timings';

const Result = {
  INCOMPLETE: 'INCOMPLETE',
  NO_START: 'NO_START',
  FALSE_START: 'FALSE_START',
  NORMAL_START: 'NORMAL_START',
};


/**
 * This is a kind of model/state machine, but also takes care of playing sounds, so it's
 * a bit of a 'view' too...
 */
export default class Level extends EventEmitter {
  constructor(options) {
    super();
    this.setResult();

    for (const key of Object.keys(options)) {
      Object.defineProperty(this, key, { value: options[key], enumerable: true });
    }

    // Delay is not really in use at the moment
    // this.pause = 0;

    this.noStartTimeout = 5000;

    this.technicalFalseStartDuration = 0;

    if (this.slug === 'sprint') {
      this.technicalFalseStart = 2000;
    }

    // const delay = options.delay || 0;
    // const signaloffset = options.signaloffset || 0;
    // const countdownLength = delay + signaloffset;
    //this.totalWait = this.pause + this.countdownLength;
    const timings = Timings[this.slug];
    this.countdown = new Countdown(timings, options.delayrandomness);
    this._timers = [];
  }

  step(event, pause = 0, callback) {
    if (this.complete) return;
    this._timers.push(setTimeout(callback, pause));
    this.emit(event);
  }

  start() {
    if (this.complete) return;

    this.countdown.onend = () => {
      if (this.complete) return;
      this.step('go', this.noStartTimeout, () => {
        this.step('timeout', 0, () => {
          this.setResult(Result.NO_START);
        });
      });
    };

    this.countdown.onupdate = this.onCountdownProgress.bind(this);
    this.countdown.start();
    this.onCountdownProgress();
    this.emit('start');
  }

  onCountdownProgress() {
    const message = this.countdown.status;
    this.emit('countdownprogress', message);
  }

  stop(time) {
    if (this.complete) return;

    let result;

    this.istechnicalFalseStart = false;

    if (time > 0 && time < this.technicalFalseStartDuration) {
      result = Result.FALSE_START;
      this.countdown.cancel();
      this.istechnicalFalseStart = true;
    } else if (time > 0) {
      result = Result.NORMAL_START;
    } else if (this.countdown.running) {
      console.log('rununggnng');
      result = Result.FALSE_START;
      this.countdown.cancel();
    }

    if (!result) return;

    this.setResult(result, time);
    this.emit('stop');
    const timers = this._timers;
    this._timers = [];
    timers.forEach(t => clearTimeout(t));
  }

  replay() {
    this.setResult();
    this.emit('replay');
    this.start();
  }

  setResult(result = Result.INCOMPLETE, time) {
    this.complete = result !== Result.INCOMPLETE;
    this.result = result;
    this.time = !this.complete ? null : time;
    this.emit('result', this.result, this.time, this.complete);
  }

}

import { EventEmitter } from 'events';
import Bluebird from 'bluebird';
import Countdown from './Countdown';

function randomTime(min = 0, extra = 0) {
  const stableValue = Math.max(0, min - 1);
  const random = Math.random() * extra;
  return Math.round(stableValue + random);
}

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
      Object.defineProperty(this, key, { value: options[key], enumerable: true, writable: true });
    }

    this.delay = this.delay || 0;
    this.signaloffset = this.signaloffset || 0;
    this.pause = 500;
    this.countdownLength = this.delay + this.signaloffset;
    this.totalWait = this.pause + this.countdownLength;
    this.noStartTimeout = 5000;
    this._timers = [];
  }

  step(event, pause = 0, callback) {
    if (this.complete) return;
    this.emit(event);
    this._timers.push(setTimeout(callback, pause));
  }

  start() {
    const pause = randomTime(this.pause, 100);
    const countdown = randomTime(this.countdownLength, this.delayrandomness);
    this.cd = new Countdown();
    const timeout = this.noStartTimeout;
    console.log(this.slug, pause, countdown, timeout)
    this.step('start', pause, () => {
      this.countdown = countdown;
      this.falseStart = countdown + 0;
      this.step('countdown', countdown, () => {
        this.step('go', timeout, () => {
          this.step('timeout', 0, () => {
            this.setResult(Result.NO_START);
          });
        });
      });
    });
  }

  stop(time) {
    if (this.complete) return;
    console.log('is normal start', time, time > 0);
    this.setResult(time > 0 ? Result.NORMAL_START : Result.FALSE_START, time);
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
    // negative time is false start
    this.time = !this.complete ? null : time;
    this.emit('result', this.result, this.time, this.complete);
  }

}

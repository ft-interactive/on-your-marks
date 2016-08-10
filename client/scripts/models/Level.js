import { EventEmitter } from 'events';
import Countdown from './Countdown';

const Result = {
  INCOMPLETE: 'INCOMPLETE',
  NO_START: 'NO_START',
  FALSE_START: 'FALSE_START',
  NORMAL_START: 'NORMAL_START',
};

const technicalFalseStarts = {
  spring: 100,
};

export default class Level extends EventEmitter {

  constructor(options) {
    super();
    this.setResult();

    for (const key of Object.keys(options)) {
      Object.defineProperty(this, key, { value: options[key], enumerable: true });
    }

    this.noStartTimeout = 5000;
    this.technicalFalseStartDuration = 0;

    if (technicalFalseStarts[this.slug]) {
      this.technicalFalseStartDuration = technicalFalseStarts[this.slug];
    }

    this.countdown = Countdown.createInstance(this.slug);
    this._timers = [];
  }

  step(event, pause = 0, callback) {
    if (this.complete) return;
    this._timers.push(setTimeout(callback, pause));
    this.emit(event);
  }

  start() {
    if (this.complete) return;

    this.countdown.on('complete', () => {
      if (this.complete) return;
      this.step('go', this.noStartTimeout, () => {
        this.step('timeout', 0, () => {
          this.setResult(Result.NO_START);
        });
      });
    });

    this.countdown.on('update', () => this.emit('countdownprogress', this.countdown.status));
    this.countdown.on('start', () => this.emit('start'));
    this.countdown.start();
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
      result = Result.FALSE_START;
      this.countdown.cancel();
    }

    const timers = this._timers;
    this._timers = [];
    timers.forEach(t => clearTimeout(t));

    if (!result) return;
    this.setResult(result, time);
    this.emit('stop');
  }

  restart() {
    this.countdown.cancel();
    this.setResult();
    this.stop();
    this.start();
    this.emit('replay');
  }

  setResult(result = Result.INCOMPLETE, time) {
    this.complete = result !== Result.INCOMPLETE;
    this.result = result;
    this.time = !this.complete ? null : time;
    this.emit('result', this.result, this.time, this.complete);
  }

  static async loadLevels() {
    return window.__gameConfig.levels
                      .map(level => new Level(level))
                      .map((level, index, arr) => {
                        level.isFirst = index === 0;
                        level.nextLevel = arr[index + 1];
                        level.isLast = index === arr.length - 1;
                        return level;
                      });
  }

}

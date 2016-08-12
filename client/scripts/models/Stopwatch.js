import { EventEmitter } from 'events';

let P = ('performance' in window) ? window.performance : Date;

if (typeof P.now !== 'function') {
  P.now = function() {
    return new Date().getTime();
  };
}

export default class Stopwatch extends EventEmitter {

  constructor() {
    super();
    this.reset();
  }

  start() {
    if (this._begin) return;
    this._begin = P.now();
    this._end = null;
    this.emit('start', this.getCurrentTime());
  }

  stop() {
    if (!this._end && this._begin) {
      this._end = P.now();
      this.emit('stop', this.getCurrentTime());
    }
  }

  reset() {
    this._begin = null;
    this._end = null;
    this.emit('reset');
  }

  getCurrentTime() {
    if (this._begin && !this._end) {
      return P.now() - this._begin;
    } else if (this._begin && this._end) {
      return this._end - this._begin;
    }

    return 0;
  }

  static getInstance() {
    return new Stopwatch();
  }

}

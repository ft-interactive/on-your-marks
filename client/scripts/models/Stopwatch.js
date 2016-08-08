import { EventEmitter } from 'events';

const P = performance || Date;

export default class Level extends EventEmitter {

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
    console.log('call stop');
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
}

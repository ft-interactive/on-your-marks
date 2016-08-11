import { EventEmitter } from 'events';
import * as Timings from './Timings';

export default class Countdown extends EventEmitter {

  constructor(timings) {
    super();
    this.timings = timings;
    this._reset();
    this.status = '';
  }

  async start() {
    if (this._started) return;

    const delays = [...this.timings];
    const first = delays[0];
    const last = delays[delays.length - 1];

    this._started = true;
    this.status = '';
    this.emit('start');
    this.emit('update');

    for (const delay of delays) {
      this.status = await delay();

      if (delay === first && delay !== last) {
        this._running = true;
        this.emit('running', true);
      } else if (!this._running) {
        break;
      } else if (delay === last) {
        this._started = false;
        this._running = false;
        this._complete = true;
        this.emit('running', false);
        this.emit('complete');
      }
      this.emit('update');
    }
  }

  async restart() {
    if (this._started) {
      this.cancel();
    }

    await this.start();
  }

  _reset() {
    this._running = false;
    this._started = false;
    this._complete = false;
    this.status = '';
  }

  cancel() {
    this._reset();
    this.emit('cancel');
  }

  get running() {
    return this._running;
  }

  get complete() {
    return this._complete;
  }

  static getTimings(id) {
    return Timings[id];
  }

  static createInstance(id) {
    return new Countdown(Countdown.getTimings(id));
  }
}

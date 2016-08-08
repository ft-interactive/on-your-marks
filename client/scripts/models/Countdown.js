export default class Countdown {

  constructor(timings, onend = function (){}) {
    this.timings = timings;
    this.onend = onend;
    this._timers = [];
    this._running = false;
    this._complete = false;
    this._status = null;
  }

  async start() {
    this._running = true;
    this._status = '';

    const delays = [...this.timings];
    const last = delays[delays.length - 1];

    for (let delay of delays) {
      this._status = await delay();
      if (delay === last) {
        this._running = false;
        this._complete = true;
        this.onend();
      }
      this.onupdate();
    }
  }

  cancel() {
    console.log('cancel countdown');
    this._timers.forEach(clearTimeout);
    this._timers = [];
    this._running = false;
  }

  get running() {
    return this._running;
  }

  get complete() {
    return this._complete;
  }

  get status() {
    return this._status;
  }
}

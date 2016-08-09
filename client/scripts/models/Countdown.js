export default class Countdown {

  constructor(timings, onend = function () {}) {
    this.timings = timings;
    this.onend = onend;
    this._started = false;
    this._running = false;
    this._complete = false;
    this.status = '';
  }

  async start() {
    if (this._started) return;

    const delays = [...this.timings];
    const first = delays[0];
    const last = delays[delays.length - 1];

    this._started = true;
    this.status = '';
    this.onupdate();

    for (const delay of delays) {
      this.status = await delay();

      if (delay === first && delay !== last) {
        this._running = true;
      } else if (!this._running) {
        break;
      } else if (delay === last) {
        this._started = false;
        this._running = false;
        this._complete = true;
        this.onend();
      }
      this.onupdate();
    }
  }

  cancel() {
    this._running = false;
    this._started = false;
  }

  get running() {
    return this._running;
  }

  get complete() {
    return this._complete;
  }
}

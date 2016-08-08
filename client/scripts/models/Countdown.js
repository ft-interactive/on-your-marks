export default class Countdown {
  constructor(onend = function (){}) {
    this.onend = onend;
    this._timers = [];
  }

  start() {
    setTimeout(() => {
      this.onend();
    }, 1000);
  }

  cancel() {
    this._timers.forEach(clearTimeout);
    this._timers = [];
  }
}

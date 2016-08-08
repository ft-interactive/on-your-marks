function pad(n, width) {
  const z = '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - (n.length + 1)).join(z) + n;
}

function formatTime(time) {
  return (time/1000).toFixed(2);
}

export default class StopwatchView {
  constructor(el, stopwatch) {
    this._interval = null;
    this.stopwatch = stopwatch;
    this.el = el;
    stopwatch.on('start', () => this.start());
    stopwatch.on('stop', () => this.stop());
    stopwatch.on('reset', () => this.stop());
  }

  displayTime() {
    if (!this.el) return;
    this.el.innerHTML = formatTime(this.stopwatch.getCurrentTime());
  }

  start() {
    this.displayTime();
    this._interval = setInterval(() => {
      this.displayTime();
    }, 66);
  }

  stop() {
    console.log('=STOP=');
    clearInterval(this._interval);
    this.displayTime();
  }

}

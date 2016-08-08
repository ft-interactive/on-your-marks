function formatTime(time) {
  return (time / 1000).toFixed(2);
}

export default class StopwatchView {
  constructor(el, stopwatch) {
    this.stopwatch = stopwatch;
    this.el = el;
    stopwatch.on('start', () => this.start());
    stopwatch.on('stop', () => this.stop());
    stopwatch.on('reset', () => this.stop());
  }

  render() {
    if (!this.el) return;
    this.el.innerHTML = formatTime(this.stopwatch.getCurrentTime());
  }

  start() {
    this.render();
    this._interval = setInterval(() => {
      this.render();
    }, 66);
  }

  stop() {
    clearInterval(this._interval);
    this.render();
  }
}

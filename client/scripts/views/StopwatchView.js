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

  get el() {
    return this._el;
  }

  set el(element) {
    this._el = element;
    if (element) {
      this._msgEl = element.querySelector('.clock__event');
      this._timeEl = element.querySelector('.clock__time');
    } else {
      this._msgEl = null;
      this._timeEl = null;
    }
  }

  render() {
    if (!this._timeEl) return;
    this._timeEl.innerHTML = formatTime(this.stopwatch.getCurrentTime());
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

  setMessage() {

  }

  flashMessage(message) {
    const el = this._msgEl;
    const timeEl = this._timeEl;
    let counter = 0;
    const len = message.length;
    console.log(el);
    const unblink = () => {
      el.classList.remove('clock__blink');
      timeEl.classList.remove('clock__blink');
    };
    const blink = () => {
      el.classList.add('clock__blink');
      timeEl.classList.add('clock__blink');
      setTimeout(unblink, 4444);
    };
    const write = () => {
      if (counter > len) {
        console.log('clear');
        setTimeout(blink, 444);
        return;
      }
      el.innerHTML = !counter ? '' : message.substr(0, counter);
      counter++;
      setTimeout(write, 180);
    };

    setTimeout(write, 222);
  }
}

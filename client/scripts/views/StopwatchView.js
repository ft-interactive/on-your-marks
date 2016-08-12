function formatTime(time) {
  return (time / 1000).toFixed(2);
}

let timers = [];

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

  setMessage(value) {
    if (this._msgEl) {
      this._msgEl.innerHTML = value;
      this._msgEl.classList.remove('clock__blink');
      this._timeEl.classList.remove('clock__blink');
      timers.map(clearTimeout);
      timers = [];
    }
  }

  blink({ duration = 4444, pause = 0, msgEl, timeEl }) {
    const m = msgEl || this._msgEl;
    const t = timeEl || this._timeEl;

    if (m.classList.contains('clock__blink')) return;

    const off = () => {
      m.classList.remove('clock__blink');
      t.classList.remove('clock__blink');
    };
    const on = () => {
      m.classList.add('clock__blink');
      t.classList.add('clock__blink');
      timers.push(setTimeout(off, duration));
    };

    if (pause) {
      timers.push(setTimeout(on, pause));
    } else {
      on();
    }
  }

  flashMessage(message) {
    const msgEl = this._msgEl;
    const timeEl = this._timeEl;
    let counter = 0;
    const len = message.length;

    const write = () => {
      if (counter > len) {
        this.blink({ pause: 444, timeEl, msgEl });
        return;
      }
      msgEl.innerHTML = !counter ? '&nbsp;' : message.substr(0, counter);
      timers.push(setTimeout(write, !counter ? 180 : 90));
      counter++;
    };

    timers.push(setTimeout(write, 100));
  }
}

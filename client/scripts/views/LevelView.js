export default class LevelView {
  constructor(el, level) {
    this.el = el;
    this.level = level;
    this.hideAllState();

    this.level.on('result', () => {
      console.log('RESULT');
      this.updateState();
    });

    this.updateState();
  }

  hideAllState() {
    [...this.el.querySelectorAll('[data-state]')].map(e => e.style.display = 'none');
  }

  updateState() {
    console.log('Update state', this.level.result);
    switch (this.level.result) {
      case 'NO_START':
        this.noStart();
        break;
      case 'FALSE_START':
        this.falseStart();
        break;
      case 'NORMAL_START':
        this.normalStart();
        break;
      case 'INCOMPLETE':
        this.incomplete();
        break;
      default:
        console.log('WHAT STATE??')
    }
  }

  falseStart() {
    this.hideAllState();
    const _el = this.getStateElement('false-start');
    _el.style.display = 'block';
  }

  noStart() {
    this.hideAllState();
    const _el = this.getStateElement('no-start');
    _el.style.display = 'block';
  }

  normalStart() {
    this.hideAllState();
    const _el = this.getStateElement('normal-start');
    _el.style.display = 'block';
  }

  incomplete() {
    this.hideAllState();
    const _el = this.getStateElement('countdown');
    _el.style.display = 'block';
  }

  show() {
    this.el.style.display = 'block';
  }

  hide() {
    this.el.style.display = 'none';
  }

  getStateElement(state) {
    return this.el.querySelector(`[data-state="${state}"]`);
  }

}

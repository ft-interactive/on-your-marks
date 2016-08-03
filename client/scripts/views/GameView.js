export default class GameView {
  constructor(el) {
    this._el = el;
  }

  render() {
    this._el.innerHTML = [
      '<a href="#">Close game</a>',
    ];
  }

  async show(level) {
    const assets = await level.ready();

    this._el.style.display = 'block';

    // initialise the level...
    this._el.style.backgroundImage = `url(${URL.createObjectURL(assets.images.bg)})`;
  }

  hide() {
    this._el.style.display = 'none';
  }
}

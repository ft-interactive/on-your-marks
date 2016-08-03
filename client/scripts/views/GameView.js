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
    this._currentLevel = level;

    const assets = await level.ready();

    this._el.style.display = 'block';

    // initialise the level...
    this._el.style.backgroundImage = `url(${URL.createObjectURL(assets.images.bg)})`;

    assets.sounds.ambient.volume(0).play();
    assets.sounds.ambient.fade(0, 0.6, 3000);
  }

  async hide() {
    const level = this._currentLevel;
    if (level) {
      const assets = await level.ready();
      assets.sounds.ambient.stop();
      delete this._currentLevel;
    }

    this._el.style.display = 'none';
  }
}

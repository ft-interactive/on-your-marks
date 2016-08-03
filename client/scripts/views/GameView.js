export default class GameView {
  constructor(el, config) {
    this._el = el;
    this._config = config;
  }

  render() {
    this._el.innerHTML = [
      '<a href="#">Close game</a>',
      '<ul class="level-chooser">',
      ...this._config.levels.map(level =>
        `<li><a href="#${level.slug}">${level.name}</a></li>`
      ),
      '</ul>',
    ].join('');
  }

  async unloadLevel() {
    const level = this._currentLevel;

    if (level) {
      const assets = await level.ready();
      assets.sounds.ambient.stop();
      delete this._currentLevel;
    }
  }

  async show(level) {
    await this.unloadLevel();

    this._currentLevel = level;

    const assets = await level.ready();

    this._el.style.display = 'block';
    this._el.offsetHeight; // eslint-disable-line no-unused-expressions
    this._el.style.opacity = '1';

    // initialise the level...
    this._el.style.backgroundImage = `url(${URL.createObjectURL(assets.images.bg)})`;

    assets.sounds.ambient.volume(0).play();
    assets.sounds.ambient.fade(0, 0.6, 3000);
  }

  async hide() {
    await this.unloadLevel();

    this._el.style.display = 'none';
    this._el.style.opacity = '0';
  }
}

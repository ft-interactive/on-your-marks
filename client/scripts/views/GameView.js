export default class GameView {
  constructor(el, levels) {
    this._el = el;
    this._levels = levels;
  }

  render() {
    /* eslint-disable indent */
    this._el.innerHTML = [
      '<header>',
        '<a href="#">Close game</a>',
        '<ul class="level-chooser">',
          ...this._levels.map(level =>
            `<li><a href="#${level.slug}">${level.name}</a></li>`
          ),
        '</ul>',
      '</header>',
      '<div class="game__content"></div>',
    ].join('');
    /* eslint-enable indent */

    this._contentEl = this._el.querySelector('.game__content');
  }

  async _unloadLevel() {
    const level = this._currentLevel;

    if (level) {
      const assets = await level.getAssets();
      assets.sounds.ambient.stop();
      delete this._currentLevel;
    }
  }

  async _loadLevel(level) {
    await this._unloadLevel();

    this._currentLevel = level;

    const assets = await level.getAssets();

    // initialise the level...
    this._el.style.backgroundImage = `url(${URL.createObjectURL(assets.images.bg)})`;

    assets.sounds.ambient.volume(0).play();
    assets.sounds.ambient.fade(0, 0.6, 3000);
  }

  async show(level) {
    await this._loadLevel(level);

    // show it
    // this._el.style.display = 'block';
    this._el.setAttribute('aria-hidden', 'false');
    this._el.offsetHeight; // eslint-disable-line no-unused-expressions
    this._el.style.opacity = '1';
  }

  async hide() {
    await this._unloadLevel();

    this._el.setAttribute('aria-hidden', 'true');
    this._el.style.opacity = '0';
  }
}

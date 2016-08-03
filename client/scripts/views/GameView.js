import { states } from '../Level';
import introPanelTemplate from '../templates/introPanel';
import buttonPanelTemplate from '../templates/buttonPanel';
import resultPanelTemplate from '../templates/resultPanel';
import { Delegate } from 'dom-delegate';

const config = window.__gameConfig;

export default class GameView {
  constructor(el, levels) {
    this._el = el;
    this._levels = levels;

    this.onLevelStateChanged = GameView.prototype.onLevelStateChanged.bind(this);
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
      '<div class="game__content">',
        '<div class="game__panel game__panel--intro">',
        '</div>',
        '<div class="game__panel game__panel--button">',
        '</div>',
        '<div class="game__panel game__panel--result">',
        '</div>',
      '</div>',
    ].join('');
    /* eslint-enable indent */

    this._introPanelEl = this._el.querySelector('.game__panel--intro');
    this._buttonPanelEl = this._el.querySelector('.game__panel--button');
    this._resultPanelEl = this._el.querySelector('.game__panel--result');

    // handle clicks on key elements
    {
      const delegate = new Delegate(this._el);

      delegate.on('click', '.game__ready-button', () => {
        this._currentLevel.startPlaying();
      });

      delegate.on('click', '.game__race-button', () => {
        console.log('click on race button!');
        this._currentLevel.registerReactionNow();
      });
    }
  }

  async _unloadLevel() {
    const level = this._currentLevel;

    if (level) {
      console.log('level', level);
      level.removeListener('statechanged', this.onLevelStateChanged);
      level.stopSounds();
      delete this._currentLevel;
    }
  }

  async _loadLevel(level) {
    await this._unloadLevel();

    level.on('statechanged', this.onLevelStateChanged);

    this._currentLevel = level;

    // show bg image
    {
      const url = `${config.assetRoot}/images/${level.slug}-bg.jpg`;
      // const ratio = devicePixelRatio || 1;
      // const imageServiceURL = `https://image.webservices.ft.com/v1/images/raw/${encodeURIComponent(url)}?source=IG&width=${screen.width * ratio}&height=${screen.height * ratio}`;
      const imageServiceURL = url; // TEMPORARY
      this._el.style.backgroundImage = `url(${imageServiceURL})`;
    }

    // get to the intro state
    await level.reset();
    await level.startIntro();
  }

  async show(level) {
    await this._loadLevel(level);

    // show it
    this._el.setAttribute('aria-hidden', 'false');
  }

  async onLevelStateChanged(newState) {
    for (const state of states) {
      this._el.classList.toggle(`game--${state}`, state === newState);
    }

    // set content of all panels according to level state
    this._introPanelEl.innerHTML = introPanelTemplate(this);
    this._buttonPanelEl.innerHTML = buttonPanelTemplate(this);
    this._resultPanelEl.innerHTML = resultPanelTemplate(this);
  }

  async hide() {
    await this._unloadLevel();

    this._el.setAttribute('aria-hidden', 'true');
  }
}

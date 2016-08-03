import { Delegate } from 'dom-delegate';
import { states } from '../Level';
import introPanelTemplate from '../templates/introPanel';
import buttonPanelTemplate from '../templates/buttonPanel';
import resultPanelTemplate from '../templates/resultPanel';

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

      delegate.on('click', '.game__race-button', event => {
        this._currentLevel.registerReactionNow();

        event.target.disabled = true; // eslint-disable-line no-param-reassign
      });
    }
  }

  async _unloadLevel() {
    const level = this._currentLevel;

    if (level) {
      level.removeListener('statechanged', this.onLevelStateChanged);
      level.stop();
      delete this._currentLevel;
    }
  }

  async _loadLevel(level) {
    level.on('statechanged', this.onLevelStateChanged);

    this._currentLevel = level;

    // set the level's "bg" image as the background for the whole game element
    {
      const url = `${config.assetRoot}/images/${level.slug}-bg.jpg`;
      // TODO use image service
      // const ratio = devicePixelRatio || 1;
      // const imageServiceURL = `https://image.webservices.ft.com/v1/images/raw/${encodeURIComponent(url)}?source=IG&width=${screen.width * ratio}&height=${screen.height * ratio}`;
      const imageServiceURL = url; // FOR NOW
      this._el.style.backgroundImage = `url(${imageServiceURL})`;
    }

    // transition to the first state
    await level.startIntro();
  }

  /**
   * Shows the game element and loads the the given level.
   */
  async show(level) {
    await this._unloadLevel();

    // show it
    this._el.setAttribute('aria-hidden', 'false');

    await this._loadLevel(level);
  }

  /**
   * A this-bound function that's called whenever the current level's state changes.
   */
  async onLevelStateChanged(newState) {
    for (const state of states) {
      this._el.classList.toggle(`game--${state}`, state === newState);
    }

    // set content of all panels according to level state
    this._introPanelEl.innerHTML = introPanelTemplate(this);
    this._buttonPanelEl.innerHTML = buttonPanelTemplate(this);
    this._resultPanelEl.innerHTML = resultPanelTemplate(this);
  }

  /**
   * Hides the entire game element.
   */
  async hide() {
    await this._unloadLevel();

    this._el.setAttribute('aria-hidden', 'true');
  }
}

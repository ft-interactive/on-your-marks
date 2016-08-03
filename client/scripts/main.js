import 'babel-polyfill';
import Bluebird from 'bluebird';
import Level from './Level';
import GameView from './views/GameView';

const qs = selector => document.querySelector(selector);

// grab key elements from DOM
const gameEl = qs('.game');
const playGameButton = qs('.play-game-button');
const loadingIndicator = qs('.loading-indicator');

(async () => {
  // declare interactive to have loaded now, as the initial page is ready anyway
  document.dispatchEvent(new CustomEvent('ig.Loaded'));

  const config = window.__gameConfig;

  const levels = config.levels.map(options => new Level(options));

  // preload levels in order (but don't wait for them all to load)
  Bluebird.mapSeries(levels, level => level.getAssets());

  const gameView = new GameView(gameEl, levels);
  gameView.render();

  const handleHash = () => {
    if (location.hash === '#' || location.hash === '') {
      history.replaceState({}, document.title, '.');
    }

    const slug = location.hash.substring(1);

    for (const level of levels) {
      if (level.slug === slug) {
        document.documentElement.classList.add('game-on');
        gameView.show(level);
        return;
      }
    }

    // not found; just revert to normal view
    gameView.hide();
    document.documentElement.classList.remove('game-on');
  };

  // handle hash
  window.addEventListener('hashchange', handleHash);
  handleHash();

  // start game when button clicked
  playGameButton.addEventListener('click', () => {
    // just visit the first level's hash
    window.location = `#${levels[0].slug}`;
  });

  // once the first level is loaded, replace the 'loading' graphic with a 'play' button
  await levels[0].getAssets();
  loadingIndicator.style.display = 'none';
  playGameButton.style.display = 'block';
})();

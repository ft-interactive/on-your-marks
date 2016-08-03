import 'babel-polyfill';
import Bluebird from 'bluebird';
import getLevels from './getLevels';

const qs = selector => document.querySelector(selector);

// grab key elements from DOM
const gameEl = qs('.game');
const playGameButton = qs('.play-game-button');
const loadingIndicator = qs('.loading-indicator');

(async () => {
  // declare interactive to have loaded now, as the initial page is ready anyway
  document.dispatchEvent(new CustomEvent('ig.Loaded'));

  const config = window.__gameConfig;

  const levels = getLevels(config);

  // preload levels in order (but don't wait for them all to load)
  Bluebird.mapSeries(levels, level => level.ready());

  const handleHash = () => {
    const slug = window.location.hash.substring(1);

    for (const level of levels) {
      if (level.slug === slug) {
        document.body.style.overflow = '';
        gameEl.style.display = 'block';
        return;
      }
    }

    // not found; just revert to normal view
    gameEl.style.display = 'none';
    document.body.style.overflow = '';

    console.log(slug);
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
  const stuff = await levels[0].ready();

  loadingIndicator.style.display = 'none';
  playGameButton.style.display = 'block';

  console.log('stuff', stuff);

  // stuff.sounds.ambient.volume(0).play();
  // stuff.sounds.ambient.fade(0, 1, 1500);
})();

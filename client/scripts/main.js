import 'babel-polyfill';
import Bluebird from 'bluebird';
import Level from './Level';
import GameView from './views/GameView';

(async () => {
  // grab key elements from DOM
  const qs = selector => document.querySelector(selector);
  const gameEl = qs('.game');
  const playGameButton = qs('.play-game-button');
  const loadingIndicator = qs('.loading-indicator');

  // grab config that was dumped in the <head>
  const config = window.__gameConfig;

  // construct the three level instances
  const levels = config.levels.map((options, i) => {
    const plusOne = config.levels[i + 1];

    // determine details of 'next' level, for link at the end of this one
    let nextLevel;


    if (plusOne) {
      nextLevel = {
        name: plusOne.name,
        slug: plusOne.slug,
      };
    } else {
      const firstLevel = config.levels[0];
      nextLevel = {
        name: firstLevel.name,
        slug: firstLevel.slug,
        isRestart: true,
      };
    }

    return new Level({
      ...options,
      nextLevel,
      isLast: !!plusOne,
      isFirst: i === 0,
    });
  });

  // start preloading level assets in series
  Bluebird.mapSeries(levels, level => level.ready());

  // construct a came view
  const gameView = new GameView(gameEl, levels);
  gameView.render();

  // start game when play button is clicked
  playGameButton.addEventListener('click', () => {
    window.location = `#${levels[0].slug}`;
  });

  // update the page according to the hash (#swim, #sprint, etc)
  {
    const updatePage = () => {
      if (location.hash === '#' || location.hash === '') {
        history.replaceState({}, document.title, '.');
      }

      const slug = location.hash.substring(1);

      for (const level of levels) {
        if (level.slug === slug) {
          // add a class that hides landing page content, shows game element, and disables scrolling
          document.documentElement.classList.add('game-on');

          // load in the level
          gameView.show(level);

          return;
        }
      }

      // not found; revert to normal landing page view
      gameView.hide();
      document.documentElement.classList.remove('game-on');
    };

    updatePage();

    window.addEventListener('hashchange', updatePage);
  }

  // as soon as the first level is loaded, hide the 'loading' indicator and show the play button
  await levels[0].ready();
  loadingIndicator.style.display = 'none';
  playGameButton.style.display = 'block';

  document.dispatchEvent(new CustomEvent('ig.Loaded'));
})();

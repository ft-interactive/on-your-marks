import 'babel-polyfill';
import fastclick from 'fastclick';
import Level from './models/Level';
import Stopwatch from './models/Stopwatch';
import Game from './models/Game';
import GameView from './views/GameView';
import StopwatchView from './views/StopwatchView';

(async () => {
  const touch = 'ontouchstart' in document.documentElement;
  document.documentElement.classList.add(touch ? 'touch' : 'no-touch');
  window.touch = touch;

  async function init() {
    const stopwatch = new Stopwatch();
    const levels = await Level.loadLevels();
    return new GameView(
      document.body,
      new Game(levels, stopwatch),
      new StopwatchView(null, stopwatch)
    );
  }

  const view = await init();

  if (touch) {
    fastclick(document.body);
  }
  // add references on the window to allow
  // easier debugging
  window.view = view;
  window.game = view.game;
  window.stopwatch = view.stopwatchView.stopwatch;
  window.levels = view.game.levels;

  document.dispatchEvent(new CustomEvent('ig.Loaded'));
})();

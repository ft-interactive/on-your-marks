import 'babel-polyfill';
import Level from './models/Level';
import Stopwatch from './models/Stopwatch';
import Game from './models/Game';
import GameView from './views/GameView';
import StopwatchView from './views/StopwatchView';

(async () => {

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

  // add references on the window to allow
  // easier debugging
  window.view = view;
  window.game = view.game;
  window.stopwatch = view.stopwatchView.stopwatch;
  window.levels = view.game.levels;

  document.dispatchEvent(new CustomEvent('ig.Loaded'));
})();

import 'babel-polyfill';
import Level from './models/Level';
import Stopwatch from './models/Stopwatch';
import Game from './models/Game';
import GameView from './views/GameView';
import StopwatchView from './views/StopwatchView';

async function init() {
  const stopwatch = new Stopwatch();
  return new GameView(
    document.body,
    new Game(await Level.loadLevels(), stopwatch),
    new StopwatchView(null, stopwatch)
  );
}

(async () => {
  const view = init();

  // add references on the window to allow
  // easier debugging
  window.view = view;
  window.game = view.game;
  window.stopwatch = view.stopwatchView.stopwatch;
  window.levels = view.game.levels;

  document.dispatchEvent(new CustomEvent('ig.Loaded'));
})();

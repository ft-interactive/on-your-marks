import 'babel-polyfill';
import Level from './models/Level';
import Stopwatch from './models/Stopwatch';
import Game from './models/Game';
import GameView from './views/GameView';
import StopwatchView from './views/StopwatchView';


function loadLevels() {
  return window.__gameConfig.levels
                    .map(level => new Level(level))
                    .map((level, index, arr) => {
                      level.isFirst = index === 0;
                      level.nextLevel = arr[index + 1];
                      level.isLast = index === arr.length - 1;
                      return level;
                    });
}

(async () => {

  const stopwatch = new Stopwatch();
  const stopwatchView = new StopwatchView(null, stopwatch);
  const game = new Game(await loadLevels(), stopwatch)
  const gameView = new GameView(
    document.body,
    game,
    stopwatchView
  );

  window.gameView = gameView;
  window.game = game;
  window.stopwatch = stopwatch;

  document.dispatchEvent(new CustomEvent('ig.Loaded'));
})();

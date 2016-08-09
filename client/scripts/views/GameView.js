import { Delegate } from 'dom-delegate';
import LevelView from './LevelView';

const qs = (s) => document.querySelector(s);
const getLevelElement = (slug) => qs(`.level[data-level="${slug}"]`);

export default class GameView {
  constructor(el, game, stopwatchView) {
    this.el = el;
    this.game = game;
    this.stopwatchView = stopwatchView;

    const delegate = new Delegate(this.el);

    ['mousedown', 'mouseup', 'mouseout', 'click',
      'touchstart', 'touchmove', 'touchmove'].forEach(type => {
        this.el.addEventListener(type, event => event.preventDefault());
      });

    delegate.on('click', '[name="first-level"]', () => {
      game.begin();
    });

    delegate.on('click', '[name="next-level"]', () => {
      game.nextLevel();
    });

    delegate.on('click', '[name="replay-level"]', event => {
      const slug = event.target.value;
      game.replayLevel(slug);
    });

    delegate.on('mousedown', '[name="stopwatch-stop"]', () => {
      game.currentLevel.stop(game.stopwatch.getCurrentTime());
    });

    // TODO: handle spacebar activation
    // delegate.on('keydown', '[name="stopwatch-stop"]', event => {
    //   game.currentLevel.stop();
    // });

    this.levelViews = game.levels.map(level => new LevelView(getLevelElement(level.slug), level));

    game.levels.forEach(l => {
      l.on('start', () => {
        this.showLevel(l);
      });
      l.on('replay', () => this.resetLevel(l));
    });
  }

  showLevel() {
    document.body.style.overflow = 'hidden';

    if (this.stopwatchView) {
      this.stopwatchView.el = document.querySelector(`[data-clock=${this.game.currentLevel.slug}]`);
    }

    this.levelViews.forEach(view => {
      if (view.level.slug === this.game.currentLevel.slug) {
        view.show();
      } else {
        view.hide();
      }
    });
  }

  resetLevel() {
    this.showLevel();
  }

}

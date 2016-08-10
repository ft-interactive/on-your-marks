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

    game.on('changelevel', this.showLevel.bind(this));

    delegate.on('click', '[name="first-level"]', () => {
      game.firstLevel();
    });

    delegate.on('click', '[name="next-level"]', () => {
      game.nextLevel();
    });

    delegate.on('click', '[name="replay-level"]', event => {
      this.game.currentLevel = this.game.getLevelBySlug(event.target.value);
    });

    delegate.on('mousedown', '[name="stopwatch-stop"]', () => {
      if (game.currentLevel.slug === 'swim') return;
      game.currentLevel.stop(game.stopwatch.getCurrentTime());
    });

    // For swimming add a little bit of time to leave the block
    delegate.on('click', '[name="stopwatch-stop"]', () => {
      if (game.currentLevel.slug !== 'swim') return;
      setTimeout(() => {
        game.currentLevel.stop(game.stopwatch.getCurrentTime());
      }, 60);
    });

    // TODO: handle spacebar activation
    // delegate.on('keydown', '[name="stopwatch-stop"]', event => {
    //   game.currentLevel.stop(game.stopwatch.getCurrentTime());
    // });

    this.levelViews = game.levels.map(level => new LevelView(getLevelElement(level.slug), level));
  }

  showLevel(level, previous) {

    if (this.stopwatchView) {
      this.stopwatchView.el = document.querySelector(`[data-clock=${level.slug}]`);
    }

    if (level) {
      document.body.style.overflow = 'hidden';
      this.levelViews.find(v => v.level === level).show();
    } else {
      document.body.style.overflow = null;
      // TODO: what to do if there's no level
    }

    if (previous && previous !== level) {
      this.levelViews.find(v => v.level === previous).hide();
    }
  }

}

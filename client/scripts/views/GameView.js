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

    this.levelContainer = this.el.querySelector('.level');

    ['mousedown', 'mouseup', 'mouseout', 'click', 'touchmove'].forEach(type => {
      this.levelContainer.addEventListener(type, event => event.preventDefault());
    });

    game.on('changelevel', this.showLevel.bind(this));

    delegate.on('click', '[name="first-level"]', event => {
      this.game.firstLevel();
    });

    delegate.on('click', '[name="next-level"]', () => {
      this.game.nextLevel();
    });

    delegate.on('click', '[name="replay-level"]', event => {
      this.game.currentLevel = this.game.getLevelBySlug(event.target.value);
    });

    delegate.on(window.touch ? 'touchstart' : 'mousedown', '[name="stopwatch-stop"]', () => {
      if (this.game.currentLevel.slug === 'swim') return;
      this.game.currentLevel.stop(game.stopwatch.getCurrentTime());
    });

    // For swimming add a little bit of time to leave the block
    delegate.on('click', '[name="stopwatch-stop"]', () => {
      if (this.game.currentLevel.slug !== 'swim') return;
      setTimeout(() => {
        this.game.currentLevel.stop(game.stopwatch.getCurrentTime());
      }, 60);
    });

    // TODO: handle spacebar activation
    // delegate.on('keydown', '[name="stopwatch-stop"]', event => {
    //   this.game.currentLevel.stop(game.stopwatch.getCurrentTime());
    // });


    this.levelViews = this.game.levels.map(level =>
                    new LevelView(getLevelElement(level.slug), level));

    this.game.levels.forEach(level => {
      level.on('result', () => {
        this.showLastResult(level);
      });
    })
  }

  showLastResult(level) {
    if (!this.stopwatchView) return;
    const msg = level.getResultMessage();
    if (!msg) return;
    switch (level.result) {
      case 'NO_START':
        this.stopwatchView.setMessage('------------');
        break;
      case 'FALSE_START':
        this.stopwatchView.flashMessage('DISQUALIFIED');
        break;
      case 'NORMAL_START':
        this.stopwatchView.flashMessage(
          level.getResultMessage()
        );
        break;
      case 'INCOMPLETE':
        this.stopwatchView.setMessage(level.clockname);
        break;
      default:
        console.log('????');
    }
  }

  showLevel(level, previous) {

    if (this.stopwatchView) {
      this.stopwatchView.el = document.querySelector(`[data-level=${level.slug}] .clock`);
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

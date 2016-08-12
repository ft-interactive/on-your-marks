import { EventEmitter } from 'events';
import userData from './UserData';

export default class Game extends EventEmitter {

  constructor(levels, stopwatch) {
    super();
    this._currentLevel = null;
    this.levels = levels;
    this.stopwatch = stopwatch;
    levels.forEach(level => {
      level.on('start', () => this.stopwatch.reset());
      level.on('replay', () => this.stopwatch.reset());
      level.on('go', () => this.stopwatch.start());
      level.on('stop', () => this.stopwatch.stop());
      level.on('timeout', () => this.stopwatch.stop());
      level.on('result', () => this.onResult());
    });
  }

  onResult() {
    if(this.currentLevel.complete){
        userData({
          cycle: this.levels.indexOf(this.currentLevel) == 0 ? this.levels[this.levels.indexOf(this.currentLevel)].time:'NA',
          swim: this.levels.indexOf(this.currentLevel) == 1 ? this.levels[this.levels.indexOf(this.currentLevel)].time:'NA',
          sprint: this.levels.indexOf(this.currentLevel) == 2 ? this.levels[this.levels.indexOf(this.currentLevel)].time:'NA',
        })
        .then(() => {
          console.log('Sent');
        })
        .catch( reason => {
          console.log('Error sending user data', reason);
        });
    }
  }

  firstLevel() {
    this.currentLevel = this.levels[0];
  }

  lastLevel() {
    this.currentLevel = this.levels[this.levels.length - 1];
  }

  end() {
    if (this.currentLevel) {
      this.currentLevel.stop(0);
    }
    this.lastLevel();
    setTimeout(() => {
      this.currentLevel.stop(101);
    }, 1);
  }

  nextLevel() {
    if (!this.currentLevel) {
      this.firstLevel();
    } else if (!this.currentLevel.isLast) {
      this.currentLevel = this.currentLevel.nextLevel;
    }
  }

  get currentLevel() {
    return this._currentLevel;
  }

  set currentLevel(level) {
    const previous = this._currentLevel;
    this._currentLevel = level;
    this.emit('changelevel', level, previous);
  }

  getLevelBySlug(slug) {
    return this.levels.find(l => l.slug === slug);
  }

}

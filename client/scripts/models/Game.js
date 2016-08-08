import { EventEmitter } from 'events';

export default class Game extends EventEmitter {
  constructor(levels, stopwatch) {
    super();
    this.currentLevel = null;
    this.levels = levels;
    this.stopwatch = stopwatch;

    levels.forEach(level => {
      level.on('start', e => {
        this.stopwatch.reset();
        // showLevel(l)
      });
      level.on('replay', e => {
        this.stopwatch.reset();
      });
      level.on('go', e => this.stopwatch.start());
      level.on('stop', e => this.stopwatch.stop());
      level.on('timeout', e => this.stopwatch.stop());
    });
  }

  begin() {
    this.setCurrentLevel(this.levels[0]);
  }

  lastLevel() {
    this.setCurrentLevel(this.levels[this.levels.length - 1]);
  }

  end() {
    this.lastLevel();
    setTimeout(()=> {
      this.currentLevel.stop();
    }, 1);
  }

  nextLevel() {
    if (!this.currentLevel) {
      this.begin();
    } else if (!this.currentLevel.isLast) {
      this.setCurrentLevel(this.currentLevel.nextLevel);
    }
  }

  replayLevel(slug) {
    if (this.currentLevel && this.currentLevel.slug === slug) {
      this.currentLevel.replay();
      return;
    }

    this.setCurrentLevelSlug(slug);
  }

  setCurrentLevel(level) {
    console.log('set surrent level', level, level.slug);
    this.currentLevel = level;
    this.currentLevel.start();
  }

  setCurrentLevelSlug(slug) {
    this.setCurrentLevel(this.levels.find(l => l.slug === slug));
  }
}

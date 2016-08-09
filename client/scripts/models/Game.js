import { EventEmitter } from 'events';

export default class Game extends EventEmitter {

  constructor(levels, stopwatch) {
    super();
    this.currentLevel = null;
    this.levels = levels;
    this.stopwatch = stopwatch;
    levels.forEach(level => {
      level.on('start', () => this.stopwatch.reset());
      level.on('replay', () => this.stopwatch.reset());
      level.on('go', () => this.stopwatch.start());
      level.on('stop', () => this.stopwatch.stop());
      level.on('timeout', () => this.stopwatch.stop());
    });
  }

  begin() {
    this.setCurrentLevel(this.levels[0]);
  }

  lastLevel() {
    this.setCurrentLevel(this.levels[this.levels.length - 1]);
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
    this.currentLevel = level;
    this.currentLevel.start();
  }

  setCurrentLevelSlug(slug) {
    this.setCurrentLevel(this.levels.find(l => l.slug === slug));
  }

}

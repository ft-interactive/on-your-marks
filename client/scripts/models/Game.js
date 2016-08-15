import { EventEmitter } from 'events';
import userData from './UserData';
const berthaURL = 'https://bertha.ig.ft.com/view/publish/ig/1omXt6YmJin_xbbOd9zljIZAAgL3SvM4z4ZCKxBRHcME/basic';

function nooppromise(){
  const o = {then:function(){return o;},catch:function(){return o;}};
  return o;
}

const fetch = window.fetch || nooppromise;

const comparisonData = fetch(berthaURL).then(res => res.json()).catch(reason => {
  console.log('failed to fetch comparison data');
  console.log(reason);
});

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
      comparisonData.then(d => {
          if (!this.currentLevel) return;
          const {slug, result, time} = this.currentLevel;
          const el = document.querySelector(`[data-level=${slug}] .level__comparison`);
          if (!el) return;
          if(result === 'NORMAL_START') {
            const percentile = d.data.filter(o => o[slug] < time)[0].percentile;
            el.style.padding = '10px 10px 15px 10px';
            el.innerHTML = `You were quicker than ${percentile}% of players of the ${this.currentLevel.clockname.toLowerCase()} round!`;
            el.style.display = 'block';
          }else{
            el.innerHTML = '';
            el.style.display = 'none';
          }

        });
      userData({
        cycle: this.levels.indexOf(this.currentLevel) == 0 ? this.levels[this.levels.indexOf(this.currentLevel)].time:'NA',
        swim: this.levels.indexOf(this.currentLevel) == 1 ? this.levels[this.levels.indexOf(this.currentLevel)].time:'NA',
        sprint: this.levels.indexOf(this.currentLevel) == 2 ? this.levels[this.levels.indexOf(this.currentLevel)].time:'NA',
      }).then(() => {
        console.log('Sent');
      }).catch(reason => {
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

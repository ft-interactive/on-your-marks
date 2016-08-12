import 'babel-polyfill';
import fastclick from 'fastclick';
import Level from './models/Level';
import Stopwatch from './models/Stopwatch';
import Game from './models/Game';
import GameView from './views/GameView';
import StopwatchView from './views/StopwatchView';
import UserData from './models/UserData';

(async () => {
  const touch = 'ontouchstart' in document.documentElement;
  document.documentElement.classList.add(touch ? 'touch' : 'no-touch');
  window.touch = touch;

  async function init() {
    const stopwatch = Stopwatch.getInstance();
    const levels = await Level.loadLevels();
    return new GameView(
      document.body,
      new Game(levels, stopwatch),
      new StopwatchView(null, stopwatch)
    );
  }

  const view = await init();

  if (touch) {
    fastclick(document.body);
  }
  // add references on the window to allow
  // easier debugging
  window.view = view;
  window.game = view.game;
  window.stopwatch = view.stopwatchView.stopwatch;
  window.levels = view.game.levels;

  function swapadyswapswap(event) {
    const btn = event.currentTarget;
    const legitStarts = view.game.levels.filter(o => o.result == 'NORMAL_START');
    if(legitStarts.length == 0) {
      btn.href = `https://twitter.com/intent/tweet?text=Can%20you%20react%20faster%20than%20an%20Olympic%20athlete?%20Find%20out%20with%20@ft's%20On%20Your%20Marks%20https://ig.ft.com/on-your-marks`;
    }else{
      const bestLevel = legitStarts.reduce((v, e) => (v.time < e.time) ? v : e);
      console.log(bestLevel);
      const time = (bestLevel.time/1000).toFixed(3);
      const event = bestLevel.clockname.toLowerCase();
    btn.href = `https://twitter.com/intent/tweet?text=I%20got%20out%20of%20the%20blocks%20in%20the%20${event}%20in%20${time}%20seconds.%20What's%20your%20PB?%20Find%20out%20with%20@ft's%20On%20Your%20Marks%20https://ig.ft.com/on-your-marks`;
     console.log('change the link', bestLevel, btn, btn.href);
    }
  } 

  [...document.querySelectorAll('.o-share__action--twitter a')].forEach((el)=>{
    el.addEventListener('click', swapadyswapswap, true);
  })

  document.dispatchEvent(new CustomEvent('ig.Loaded'));
})();

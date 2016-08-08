import Bluebird from 'bluebird';

function randomTime(min = 0, extra = 0) {
  const stableValue = Math.max(0, min - 1);
  const random = Math.random() * extra;
  return Math.round(stableValue + random);
}

const delay = (name, duration = 0) => async () => {
  const d = typeof duration === 'function' ? duration() : duration;
  await Bluebird.delay(d);
  return name;
};

const createDelay = ([name, duration]) => delay(name, duration);

export const cycle = [
  ['1', 3000],
  ['2', 1000],
  ['3', 1000],
  ['4', 1000],
  ['5', 1000],
].map(createDelay);

export const swim = [
  ['Marks', 2000],
  ['Beep', 1500],
].map(createDelay);

export const sprint = [
  ['On your marks', 3000],
  ['Set', 1000],
  ['Bang', () => randomTime(1000, 2500)],
].map(createDelay);

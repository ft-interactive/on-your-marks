import Bluebird from 'bluebird';

function randomTime(min = 0, extra = 0) {
  const stableValue = Math.max(0, min - 1);
  const random = Math.random() * extra;
  return Math.round(stableValue + random);
}

const delay = (name, duration = 0, random) => async () => {
  const d = random ? randomTime(duration, random) : duration;
  await Bluebird.delay(d);
  return name;
};

const createDelay = args => delay(...args);

export const cycle = [
  ['5', 9000],
  ['4', 1000],
  ['3', 1000],
  ['2', 1000],
  ['1', 1000],
  ['Doink', 1000],
].map(createDelay);

export const swim = [
  ['Take you marks', 5000],
  ['Beep', 2000, 1000],
].map(createDelay);

export const sprint = [
  ['On your marks', 3000],
  ['Set', 1500],
  ['Bang', 2000, 2500],
].map(createDelay);

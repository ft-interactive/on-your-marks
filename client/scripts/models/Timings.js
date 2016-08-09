import Bluebird from 'bluebird';

const randomDuration = (min = 0, extra = 0) =>
  Math.round(Math.max(0, min - 1) + (Math.random() * extra));

const delay = (name, duration = 0, random) => async () => {
  await Bluebird.delay(random ? randomDuration(duration, random) : duration);
  return name;
};

const sequence = (...arr) => arr.map(args => delay(...args));

const secs = (s = 1) => s * 1000;

export const cycle = sequence(
  ['5', secs(9)],
  ['4', secs(1)],
  ['3', secs(1)],
  ['2', secs(1)],
  ['1', secs(1)],
  ['Peddle!', secs(1)]
);

export const swim = sequence(
  ['Take you marks', secs(5)],
  ['Dive!', secs(2), secs(1)]
);

export const sprint = sequence(
  ['On your marks', secs(7.98)],
  ['Set', secs(4)],
  ['Run!', secs(2), secs(2.5)]
);

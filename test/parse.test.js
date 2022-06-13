import { expect } from 'chai';
import better from '../dist/index.js';

const tests = {
  'rgb(128, 128, 128)': '#808080',
  'rgb(128 128 128)': '#808080',
  'rgba(128, 128, 128, 0.5)': '#80808080',
  'rgb(128 128 128/0.5)': '#80808080',
  'rgba(128 128 128/0.5)': '#80808080',
  'rgba(50%, 50%, 50%)': '#808080',
  'rgba(50%, 50%, 50%, 50%)': '#80808080',
  'rgba(50% 50% 50%)': '#808080',
  'rgba(50% 50% 50% 50%)': '#80808080',
  'hsl(0, 0%, 50%)': '#808080',
  'hsl(120, 0%, 50%)': '#808080',
  'hsl(0, 0%, 50%, 50%)': '#80808080',
  'hsl(0 0% 50%)': '#808080',
  'hsla(0, 0%, 50%, 50%)': '#80808080',
  'hwb(0, 50%, 50%)': '#808080',
  'hwb(0 50% 50%)': '#808080',
  'hwba(0, 50%, 50%, 0.5)': '#80808080',
  'color(display-p3 0.5 0.5 0.5)': '#808080',
  'color(display-p3 0.5 0.5 0.5/1)': '#808080',
  'color(display-p3 0.5 0.5 0.5/0.5)': '#80808080',
  'color(hwb 0 50% 50%)': '#808080',
  'color(hwb 0 50% 50%/0.5)': '#80808080',
  'color(xyz 0.20518 0.21586 0.23507)': '#808080',
  'color(xyz-d65 0.20518 0.21586 0.23507)': '#808080',
  'color(xyz 0.20518 0.21586 0.23507/1)': '#808080',
  'color(xyz 0.20518 0.21586 0.23507/0.5)': '#80808080',
  'color(xyz 20.518% 21.586% 23.507%)': '#808080',
  'color(oklab 0.59987 0 0)': '#808080',
  'oklab(59.987% 0 0)': '#808080',
  'color(oklch 0.59987 0 89.87556)': '#808080',
  'oklch(59.987% 0 89.87556)': '#808080',
  'oklch(0.59987 0 89.87556)': '#808080',
};

describe('CSS parsing', () => {
  // any browser-understood string should be parseable by this library,
  // even if the string is “invalid” according to spec

  for (const [name, val] of Object.entries(tests)) {
    it(name, () => {
      expect(better.from(name).hex).to.equal(val);
    });
  }
});

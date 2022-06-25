import { expect } from 'chai';
import { lightOrDark } from '../dist/index.js'

const tests = [
  ['#000000', 'dark'],
  ['#101010', 'dark'],
  ['#202020', 'dark'],
  ['#303030', 'dark'],
  ['#404040', 'dark'],
  ['#505050', 'dark'],
  ['#606060', 'dark'],
  ['#707070', 'dark'],
  ['#808080', 'dark'],
  ['#909090', 'dark'],
  ['#a0a0a0', 'dark'],
  ['#b0b0b0', 'light'],
  ['#c0c0c0', 'light'],
  ['#d0d0d0', 'light'],
  ['#e0e0e0', 'light'],
  ['#f0f0f0', 'light'],
  ['#ffffff', 'light'],
  ['#800000', 'dark'],
  ['#ff0000', 'dark'],
  ['#ff8080', 'light'],
  ['#808000', 'dark'],
  ['#ffff00', 'light'],
  ['#ffff80', 'light'],
  ['#008000', 'dark'],
  ['#00ff00', 'light'],
  ['#80ff80', 'light'],
  ['#008080', 'dark'],
  ['#00ffff', 'light'],
  ['#80ffff', 'light'],
  ['#000080', 'dark'],
  ['#0000ff', 'dark'],
  ['#8080ff', 'dark'],
  ['#800080', 'dark'],
  ['#ff00ff', 'dark'],
  ['#ff80ff', 'light'],
];

describe('lightOrDark', () => {
  for(const [c, value] of tests) {
    it(c, () => {
      expect(lightOrDark(c)).to.equal(value);
    });
  }
});

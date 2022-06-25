import { expect } from 'chai';
import { contrastRatio } from '../dist/index.js';
import { round } from '../dist/utils.js';

const tests = [
  ['#000000', '#000000', 1],
  ['#000000', '#ffffff', 21],
  ['#ffffff', '#000000', 21],
  ['#800000', '#000000', 1.918],
  ['#ff0000', '#000000', 5.253],
  ['#ff8080', '#000000', 8.652],
  ['#808000', '#000000', 5.006],
  ['#ffff00', '#000000', 19.556],
  ['#ffff80', '#000000', 19.868],
  ['#008000', '#000000', 4.088],
  ['#00ff00', '#000000', 15.303],
  ['#80ff80', '#000000', 16.533],
  ['#008080', '#000000', 4.399],
  ['#00ffff', '#000000', 16.747],
  ['#80ffff', '#000000', 17.665],
  ['#000080', '#000000', 1.312],
  ['#0000ff', '#000000', 2.444],
  ['#8080ff', '#000000', 6.449],
  ['#800080', '#000000', 2.23],
  ['#ff00ff', '#000000', 6.697],
  ['#ff80ff', '#000000', 9.784],
  ['#800000', '#ffffff', 10.949],
  ['#ff0000', '#ffffff', 3.998],
  ['#ff8080', '#ffffff', 2.427],
  ['#808000', '#ffffff', 4.195],
  ['#ffff00', '#ffffff', 1.074],
  ['#ffff80', '#ffffff', 1.057],
  ['#008000', '#ffffff', 5.138],
  ['#00ff00', '#ffffff', 1.372],
  ['#80ff80', '#ffffff', 1.27],
  ['#008080', '#ffffff', 4.774],
  ['#00ffff', '#ffffff', 1.254],
  ['#80ffff', '#ffffff', 1.189],
  ['#000080', '#ffffff', 16.01],
  ['#0000ff', '#ffffff', 8.593],
  ['#8080ff', '#ffffff', 3.256],
  ['#800080', '#ffffff', 9.418],
  ['#ff00ff', '#ffffff', 3.136],
  ['#ff80ff', '#ffffff', 2.146],
];

describe('WCAG 2.1 contrast', () => {
  for (const [c1, c2, ratio] of tests) {
    it(`${c1}/${c2}`, () => {
      const result = contrastRatio(c1, c2);
      const passesAA = ratio >= 4.5;
      const passesAAA = ratio >= 7;
      expect(round(result.ratio, 3)).to.equal(ratio);
      expect(result.AA).to.equal(passesAA);
      expect(result.AAA).to.equal(passesAAA);
    });
  }
})

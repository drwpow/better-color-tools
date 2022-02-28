import { expect } from 'chai';
import fs from 'fs';
import { default as sass } from 'sass';

const SEMI_RE = /;?$/
const CB_CLOSE_RE = /}$/

const colorUtils = fs.readFileSync(new URL('../index.scss', import.meta.url));

function test(css) {
  const input = `${colorUtils}

.sel {
  ${css.replace(SEMI_RE, ';')}
}`;
  const result = sass.compileString(input);
  const [, output] = result.css.split('.sel {');
  return output.replace(CB_CLOSE_RE, '').trim();
}

const R = 'red';
const Y = 'yellow';
const G = 'lime';
const C = 'aqua';
const B = 'blue';
const M = '#ff00ff';
const K = 'black';
const W = 'white';

describe('better.mix', () => {
  const tests = [
    ['r -> y', R, Y, '#ffa000'],
    ['r -> g', R, G, '#d0a800'],
    ['r -> c', R, C, '#d2a993'],
    ['y -> g', Y, G, '#b0ff00'],
    ['g -> c', G, C, '#00ffa9'],
    ['g -> b', G, B, '#00aabf'],
    ['g -> m', G, M, '#c6b4b4'],
    ['c -> b', C, B, '#00a0ff'],
    ['b -> m', B, M, '#9038ff'],
    ['b -> r', B, R, '#8c53a2'],
    ['b -> y', B, Y, '#6cabc7'],
    ['m -> r', M, R, '#fd2d9b'],
    ['k -> w', K, W, '#646362'],
  ];

  for (const [name, c1, c2, mid] of tests) {
    it(name, () => {
      expect(test(`color: mix(${c1}, ${c2}, 0);`)).to.equal(`color: ${c1};`);
      expect(test(`color: mix(${c1}, ${c2}, 0.5);`)).to.equal(`color: ${mid};`);
      expect(test(`color: mix(${c1}, ${c2}, 1);`)).to.equal(`color: ${c2};`);
    });
  }

  // grayscale
  const grayscale = ['black', '#030303', '#161616', '#2e2e2d', '#484847', '#646362', '#81807f', '#9f9e9d', '#bebdbc', '#dfdedc', 'white'];
  for (let n = 0; n < grayscale.length; n++) {
    it (`k -> w (${n * 10}%)`, () => {
      expect(test(`color: mix(black, white, ${n/10})`)).to.equal(`color: ${grayscale[n]};`);
    });
  }

  it('Sass works as expected', () => {
    expect(test('color: color.mix(#ff0000, #ffff00, 50%);')).to.equal(`color: #ff8000;`);
    expect(test('color: color.mix(#ff0000, #00ff00, 50%);')).to.equal(`color: olive;`);
    expect(test('color: color.mix(#ffff00, #00ff00, 50%);')).to.equal(`color: #80ff00;`);
    expect(test('color: color.mix(#00ff00, #00ffff, 50%);')).to.equal(`color: #00ff80;`);
    expect(test('color: color.mix(#00ff00, #0000ff, 50%);')).to.equal(`color: teal;`);
    expect(test('color: color.mix(#00ffff, #0000ff, 50%);')).to.equal(`color: #0080ff;`);
    expect(test('color: color.mix(#0000ff, #ff00ff, 50%);')).to.equal(`color: #8000ff;`);
    expect(test('color: color.mix(#0000ff, #ff0000, 50%);')).to.equal(`color: purple;`);
    expect(test('color: color.mix(#ff00ff, #ff0000, 50%);')).to.equal(`color: #ff0080;`);
  });
});

describe('p3', () => {
  it('g', () => {
    expect(test('color: p3(#00ff00);')).to.equal('color: color(display-p3 0 1 0);')
  });
});

describe('fallback', () => {
  it('color', () => {
    expect(test('@include fallback(color, p3(#00ffff), #00ffff)')).to.equal('color: #00ffff;\n  color: color(display-p3 0 1 1);');
  });
});

describe('lightness', () => {
  const lightness = [
    ['r', R, '0.6337714281'],
    ['y', Y, '0.9678103203'],
    ['g', G, '0.8671007367'],
    ['c', C, '0.9067133452'],
    ['b', B, '0.4538660491'],
    ['m', M, '0.7034243341'],
    ['k', K, '0'],
    ['w', W, '0.9999999978'],
  ];

  // note: opacity is only a way to store the value for comparison
  for (const [name, given, want] of lightness) {
    it(name, () => {
      expect(test(`opacity: lightness(${given})`)).to.equal(`opacity: ${want};`);
    });
  }
});

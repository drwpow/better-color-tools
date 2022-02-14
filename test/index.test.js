import { expect } from 'chai';
import { performance } from 'perf_hooks';
import better from '../dist/index.js';
import cssNames from '../dist/css-names.js';

const HEX_CHARS = '0123456789abcdef'.split('');

function randomColor() {
  return `#${[...new Array(6)].map(() => HEX_CHARS[Math.floor(Math.random() * HEX_CHARS.length)]).join('')}`;
}

const R = [1, 0, 0, 1];
const Y = [1, 1, 0, 1];
const G = [0, 1, 0, 1];
const C = [0, 1, 1, 1];
const B = [0, 0, 1, 1];
const M = [1, 0, 1, 1];
const K = [0, 0, 0, 1];
const W = [1, 1, 1, 1];

describe('better.mix', () => {
  const tests = [
    ['r -> y', R, Y, '#ffba00'],
    ['r -> g', R, G, '#baba00'],
    ['y -> g', Y, G, '#baff00'],
    ['g -> c', G, C, '#00ffba'],
    ['g -> b', R, Y, '#ffba00'],
    ['c -> b', R, Y, '#ffba00'],
    ['r -> y', R, Y, '#ffba00'],
  ];

  it('r -> y', () => {
    expect(better.mix(R, Y, 0).rgbVal).to.deep.equal(R);
    expect(better.mix(R, Y, 0.5).hex).to.equal('#ffba00');
    expect(better.mix(R, Y, 1).rgbVal).to.deep.equal(Y);
  });
  it('r -> g', () => {
    expect(better.mix(R, G, 0).rgbVal).to.deep.equal(R);
    expect(better.mix(R, G, 0.5).hex).to.equal('#baba00'); // incorrect: [0.5, 0.5, 0, 1]
    expect(better.mix(R, G, 1).rgbVal).to.deep.equal(G);
  });
  it('y -> g', () => {
    expect(better.mix(Y, G, 0).rgbVal).to.deep.equal(Y);
    expect(better.mix(Y, G, 0.5).hex).to.equal('#baff00');
    expect(better.mix(Y, G, 1).rgbVal).to.deep.equal(G);
  });
  it('g -> c', () => {
    expect(better.mix(G, C, 0).rgbVal).to.deep.equal(G);
    expect(better.mix(G, C, 0.5).hex).to.equal('#00ffba');
    expect(better.mix(G, C, 1).rgbVal).to.deep.equal(C);
  });
  it('g -> b', () => {
    expect(better.mix(G, B, 0).rgbVal).to.deep.equal(G);
    expect(better.mix(G, B, 0.5).hex).to.equal('#00baba');
    expect(better.mix(G, B, 1).rgbVal).to.deep.equal(B);
  });
  it('c -> b', () => {
    expect(better.mix(C, B, 0).rgbVal).to.deep.equal(C);
    expect(better.mix(C, B, 0.5).hex).to.equal('#00baff');
    expect(better.mix(C, B, 1).rgbVal).to.deep.equal(B);
  });
  it('b -> m', () => {
    expect(better.mix(B, M, 0).rgbVal).to.deep.equal(B);
    expect(better.mix(B, M, 0.5).hex).to.equal('#ba00ff');
    expect(better.mix(B, M, 1).rgbVal).to.deep.equal(M);
  });
  it('b -> r', () => {
    expect(better.mix(B, R, 0).rgbVal).to.deep.equal(B);
    expect(better.mix(B, R, 0.5).hex).to.equal('#ba00ba');
    expect(better.mix(B, R, 1).rgbVal).to.deep.equal(R);
  });
  it('m -> r', () => {
    expect(better.mix(M, R, 0).rgbVal).to.deep.equal(M);
    expect(better.mix(M, R, 0.5).hex).to.equal('#ff00ba');
    expect(better.mix(M, R, 1).rgbVal).to.deep.equal(R);
  });

  // complements
  it('r -> c', () => {
    expect(better.mix(R, C, 0.5).hex).to.equal('#bababa');
  });
  it('g -> m', () => {
    expect(better.mix(G, M, 0.5).hex).to.equal('#bababa');
  });
  it('b -> y', () => {
    expect(better.mix(B, Y, 0.5).hex).to.equal('#bababa');
  });

  // grayscale
  it('k -> w', () => {
    expect(better.mix('black', 'white', 0.1).hex).to.equal('#5a5a5a');
    expect(better.mix('black', 'white', 0.2).hex).to.equal('#7b7b7b');
    expect(better.mix('black', 'white', 0.3).hex).to.equal('#949494');
    expect(better.mix('black', 'white', 0.4).hex).to.equal('#a8a8a8');
    expect(better.mix('black', 'white', 0.5).hex).to.equal('#bababa');
    expect(better.mix('black', 'white', 0.6).hex).to.equal('#cacaca');
    expect(better.mix('black', 'white', 0.7).hex).to.equal('#d9d9d9');
    expect(better.mix('black', 'white', 0.8).hex).to.equal('#e6e6e6');
    expect(better.mix('black', 'white', 0.9).hex).to.equal('#f3f3f3');
  });
});

describe('better.from', () => {
  it('rgb -> hex', () => {
    expect(better.from('rgb(127, 255, 212)').hex).to.equal('#7fffd4');
    expect(better.from('rgba(127, 255, 212, 0.5)').hex).to.equal('#7fffd480');
    expect(better.from('rgb(127, 255, 212)').hexVal).to.equal(0x7fffd4);
    expect(better.from([127/255, 255/255, 212/255]).hexVal).to.equal(0x7fffd4);
    expect(better.from('rgba(127, 255, 212, 0.5)').hexVal).to.equal(0x7fffd480);
    expect(better.from('rgb(252, 9, 172)').hex).to.equal('#fc09ac');
    expect(better.from('rgb(127.5, 127.5, 127.5)').hex).to.equal('#808080');

    // random color test (if it fails, add a test!)
    const expected = randomColor();
    const generated = better.from(better.from(expected).hex).hex;
    expect(generated, `rgb: ${expected} failed to generate hex`).to.equal(expected);
  });

  it('rgb -> p3', () => {
    const tests = [
      ['rgb(255, 0, 0)', 'color(display-p3 1 0 0)'],
      ['rgb(128, 128, 128)', 'color(display-p3 0.50196 0.50196 0.50196)'],
      ['rgba(192, 192, 0, 0.5)', 'color(display-p3 0.75294 0.75294 0/0.5)'],
      ['rgba(196, 67, 43, 0.8)', 'color(display-p3 0.76863 0.26275 0.16863/0.8)'],
    ];

    for (const [given, want] of tests) {
      expect(better.from(given).p3).to.equal(want);
    }
  });

  it('hex -> rgb', () => {
    const tests = [
      ['#f00', 'rgb(255, 0, 0)'],
      ['#888', 'rgb(136, 136, 136)'],
      ['#4b0082', 'rgb(75, 0, 130)'],
      ['#ffffff80', 'rgba(255, 255, 255, 0.50196)'],
      [0x4b008240, 'rgba(75, 0, 130, 0.25098)'],
      [0x000001, 'rgb(0, 0, 1)'],
    ];

    for (const [given, want] of tests) {
      expect(better.from(given).rgb).to.equal(want);
    }

    // random test
    const expected = randomColor();
    const generated = better.from(better.from(expected).hex).hex;
    expect(generated).to.equal(expected);
  });

  it('name -> hex', () => {
    expect(better.from('rebeccapurple').hex).to.equal('#663399');
  });

  it('p3 -> hex', () => {
    expect(better.from('color(display-p3 0 1 1)').hex).to.equal('#00ffff');
    expect(better.from('color(display-p3 0.23 0.872 0.918)').hex).to.equal('#3bdeea');
    expect(better.from('color(display-p3 0 1 1/1)').rgb).to.equal('rgb(0, 255, 255)');
    expect(better.from('color(display-p3 1 0 0/0.5)').rgb).to.equal('rgba(255, 0, 0, 0.5)');
    expect(better.from('color(display-p3 1 0 0/0)').rgb).to.equal('rgba(255, 0, 0, 0)');
  });

  it('CSS names', () => {
    for (const [name, hex] of Object.entries(cssNames)) {
      expect(better.from(name).hexVal).to.equal(hex);
    }
  });

  it('allows out-of-bounds values', () => {
    expect(better.from('rgb(-100, 500, -100)').hex).to.equal('#00ff00');
    expect(better.from('hsl(0, -100%, 200%)').hex).to.equal('#ffffff');
  });

  it('rgb -> oklab', () => {
    const tests = [
      ['#7ae573', 'color(oklab 0.83195 -0.14445 0.11064)'],
      ['#5a659a', 'color(oklab 0.52054 0.00614 -0.08466)'],
      ['#9d0cab', 'color(oklab 0.50093 0.18528 -0.13592)'],
      ['#978d9a', 'color(oklab 0.65626 0.016602 -0.01474)'],
    ];

    for (const [given, want] of tests) {
      expect(better.from(given).oklab).to.equal(want);
    }
  });

  it('rgb -> oklch', () => {
    const tests = [
      ['#1cfb45', 'color(oklch 0.83195 0.26967 144.43573)'],
      ['#2df4f7', 'color(oklch 0.87965 0.14363 196.51326)'],
      ['#054828', 'color(oklch 0.35432 0.08340 155.63368)'],
      ['#f83f74', 'color(oklch 0.65646 0.22070 9.1864)'],
    ];

    for (const [given, want] of tests) {
      expect(better.from(given).oklab).to.equal(want);
    }
  });
});

describe.skip('gradient', () => {
  it('b -> g', () => {
    expect(better.gradient(
      'linear-gradient(90deg, blue, lime)'
    )).to.equal(
      'linear-gradient(90deg,#0000ff,#0088e0,#00baba,#00e088,#00ff00)'
    );
    expect(better.gradient(
      'linear-gradient(90deg, blue, lime)', true
    )).to.equal(
      'linear-gradient(90deg,color(display-p3 0 0 1),color(display-p3 0 0.53252 0.87742),color(display-p3 0 0.72974 0.72974),color(display-p3 0 0.87742 0.53252),color(display-p3 0 1 0))'
    );
  });

  it('r -> o -> g', () => {
    expect(better.gradient(
      'linear-gradient(90deg, red 0%, orange 40%, lime 100%)'
    )).to.equal(
      'linear-gradient(90deg,#ff0000 0%,#ff3400 10%,#ff4700 20%,#ff5600 30%,#ffa500 40%,#e09c00 55%,#bac400 70%,#88e400 85%,#00ff00 100%)'
    );
  });

  it('r -> o -> y -> g -> b -> i -> v', () => {
    expect(better.gradient(
      'linear-gradient(90deg, red, orange, yellow, limegreen, blue, indigo, purple)'
    )).to.equal(
      'linear-gradient(90deg,#ff0000 0%,#ff3400 10%,#ff4700 20%,#ff5600 30%,#ffa500 40%,#e09c00 55%,#bac400 70%,#88e400 85%,#00ff00 100%)'
    );
  });

  it('overlapping stops', () => {
    // don’t insert the same blues over and over again
    expect(better.gradient(
      'linear-gradient(90deg, blue, blue 8px, lime 16px)'
    )).to.equal(
      'linear-gradient(90deg,#0000ff,#0000ff 8px,#0088e0 10px,#00baba 12px,#00e088 14px,#00ff00 16px)'
    );
  });
});

describe('lightness', () => {
  const tests = [
    ['R', R, 0.62796],
    ['Y', Y, 0.96798],
    ['G', G, 0.86644],
    ['C', C, 0.9054],
    ['B', B, 0.45201],
    ['M', M, 0.70167],
    ['K', K, 0],
    ['W', W, 1],
  ];

  for (const [name, given, want] of tests) {
    it(name, () => {
      expect(better.lightness(given)).to.equal(want);
    });
  }
});

describe.skip('benchmark', () => {
  it('rgb -> hex: 80k ops/s', () => {
    const start = performance.now();
    for (let n = 0; n < 80000; n ++) {
      better.from([1, 0, 0]).hexVal;
    }
    const end = performance.now() - start;
    expect(end).to.be.lessThan(1000);
  });

  it('rgb -> p3: 80k ops/s', () => {
    const start = performance.now();
    for (let n = 0; n < 80000; n ++) {
      better.from([1, 0, 0]).p3;
    }
    const end = performance.now() - start;
    expect(end).to.be.lessThan(1000);
  });
});

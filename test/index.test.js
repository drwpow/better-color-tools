import { expect } from 'chai';
import {performance} from 'perf_hooks';
import color from '../dist/index.js';
import cssNames from '../dist/css-names.js';

function randomColor() {
  const chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
  return `#${[...new Array(6)].map(() => chars[Math.floor(Math.random() * chars.length)]).join('')}`;
}

describe('JS', () => {
  describe('color.mix', () => {
    const R = [1, 0, 0, 1];
    const Y = [1, 1, 0, 1];
    const G = [0, 1, 0, 1];
    const C = [0, 1, 1, 1];
    const B = [0, 0, 1, 1];
    const M = [1, 0, 1, 1];

    it('r -> y', () => {
      expect(color.mix(R, Y, 0).rgbVal).to.deep.equal(R);
      expect(color.mix(R, Y, 0.5).hex).to.equal('#ffba00');
      expect(color.mix(R, Y, 1).rgbVal).to.deep.equal(Y);
    });
    it('r -> g', () => {
      expect(color.mix(R, G, 0).rgbVal).to.deep.equal(R);
      expect(color.mix(R, G, 0.5).hex).to.equal('#baba00'); // incorrect: [0.5, 0.5, 0, 1]
      expect(color.mix(R, G, 1).rgbVal).to.deep.equal(G);
    });
    it('y -> g', () => {
      expect(color.mix(Y, G, 0).rgbVal).to.deep.equal(Y);
      expect(color.mix(Y, G, 0.5).hex).to.equal('#baff00');
      expect(color.mix(Y, G, 1).rgbVal).to.deep.equal(G);
    });
    it('g -> c', () => {
      expect(color.mix(G, C, 0).rgbVal).to.deep.equal(G);
      expect(color.mix(G, C, 0.5).hex).to.equal('#00ffba');
      expect(color.mix(G, C, 1).rgbVal).to.deep.equal(C);
    });
    it('g -> b', () => {
      expect(color.mix(G, B, 0).rgbVal).to.deep.equal(G);
      expect(color.mix(G, B, 0.5).hex).to.equal('#00baba');
      expect(color.mix(G, B, 1).rgbVal).to.deep.equal(B);
    });
    it('c -> b', () => {
      expect(color.mix(C, B, 0).rgbVal).to.deep.equal(C);
      expect(color.mix(C, B, 0.5).hex).to.equal('#00baff');
      expect(color.mix(C, B, 1).rgbVal).to.deep.equal(B);
    });
    it('b -> m', () => {
      expect(color.mix(B, M, 0).rgbVal).to.deep.equal(B);
      expect(color.mix(B, M, 0.5).hex).to.equal('#ba00ff');
      expect(color.mix(B, M, 1).rgbVal).to.deep.equal(M);
    });
    it('b -> r', () => {
      expect(color.mix(B, R, 0).rgbVal).to.deep.equal(B);
      expect(color.mix(B, R, 0.5).hex).to.equal('#ba00ba');
      expect(color.mix(B, R, 1).rgbVal).to.deep.equal(R);
    });
    it('m -> r', () => {
      expect(color.mix(M, R, 0).rgbVal).to.deep.equal(M);
      expect(color.mix(M, R, 0.5).hex).to.equal('#ff00ba');
      expect(color.mix(M, R, 1).rgbVal).to.deep.equal(R);
    });

    // complements
    it('r -> c', () => {
      expect(color.mix(R, C, 0.5).hex).to.equal('#bababa');
    });
    it('g -> m', () => {
      expect(color.mix(G, M, 0.5).hex).to.equal('#bababa');
    });
    it('b -> y', () => {
      expect(color.mix(B, Y, 0.5).hex).to.equal('#bababa');
    });

    // grayscale
    it('k -> w', () => {
      expect(color.mix('black', 'white', 0.1).hex).to.equal('#5a5a5a');
      expect(color.mix('black', 'white', 0.2).hex).to.equal('#7b7b7b');
      expect(color.mix('black', 'white', 0.3).hex).to.equal('#949494');
      expect(color.mix('black', 'white', 0.4).hex).to.equal('#a8a8a8');
      expect(color.mix('black', 'white', 0.5).hex).to.equal('#bababa');
      expect(color.mix('black', 'white', 0.6).hex).to.equal('#cacaca');
      expect(color.mix('black', 'white', 0.7).hex).to.equal('#d9d9d9');
      expect(color.mix('black', 'white', 0.8).hex).to.equal('#e6e6e6');
      expect(color.mix('black', 'white', 0.9).hex).to.equal('#f3f3f3');
    });
  });

  describe('color.from', () => {
    it('rgb -> hex', () => {
      expect(color.from('rgb(127, 255, 212)').hex).to.equal('#7fffd4');
      expect(color.from('rgba(127, 255, 212, 0.5)').hex).to.equal('#7fffd480');
      expect(color.from('rgb(127, 255, 212)').hexVal).to.equal(0x7fffd4);
      expect(color.from([127/255, 255/255, 212/255]).hexVal).to.equal(0x7fffd4);
      expect(color.from('rgba(127, 255, 212, 0.5)').hexVal).to.equal(0x7fffd480);
      expect(color.from('rgb(252, 9, 172)').hex).to.equal('#fc09ac');
      expect(color.from('rgb(127.5, 127.5, 127.5)').hex).to.equal('#808080');

      // random color test (if it fails, add a test!)
      const expected = randomColor();
      const generated = color.from(color.from(expected).hex).hex;
      expect(generated, `rgb: ${expected} failed to generate hex`).to.equal(expected);
    });

    it('rgb -> hsl', () => {
      expect(color.from('rgb(173, 255, 47)').hsl).to.equal('hsl(83.654, 100%, 59.216%, 1)');
      expect(color.from('#C4432B').hsl).to.equal('hsl(9.412, 64.017%, 46.863%, 1)');
      expect(color.from('rgb(173, 255, 47)').hslVal.toString()).to.equal([83.654, 1, 0.59216, 1].toString());
      expect(color.from('rgb(162, 61, 149)').hsl).to.equal('hsl(307.723, 45.291%, 43.725%, 1)');
      expect(color.from('rgb(220, 37, 149)').hsl).to.equal('hsl(323.279, 72.332%, 50.392%, 1)');

      // random test
      const expected = randomColor();
      const generated = color.from(color.from(expected).hsl).hex;
      expect(generated, `rgb: ${expected} failed to generate HSL`).to.equal(expected);
    });

    it('rgb -> p3', () => {
      expect(color.from('rgb(255, 0, 0)').p3).to.equal('color(display-p3 1 0 0)');
      expect(color.from('rgb(128, 128, 128)').p3).to.equal('color(display-p3 0.50196 0.50196 0.50196)');
      expect(color.from('rgba(192, 192, 0, 0.5)').p3).to.equal('color(display-p3 0.75294 0.75294 0/0.5)');
      expect(color.from('rgba(196, 67, 43, 0.8)').p3).to.equal('color(display-p3 0.76863 0.26275 0.16863/0.8)');
    });

    it('hex -> rgb', () => {
      expect(color.from('#f00').rgb).to.equal('rgb(255, 0, 0)');
      expect(color.from('#888').rgb).to.equal('rgb(136, 136, 136)');
      expect(color.from('#4b0082').rgb).to.equal('rgb(75, 0, 130)');
      expect(color.from('#ffffff80').rgb).to.equal('rgba(255, 255, 255, 0.50196)');
      expect(color.from(0x4b008240).rgb).to.equal('rgba(75, 0, 130, 0.25098)');
      expect(color.from(0x000001).rgb).to.equal('rgb(0, 0, 1)');

      // random test
      const expected = randomColor();
      const generated = color.from(color.from(expected).hex).hex;
      expect(generated).to.equal(expected);
    });

    it('hex -> hsl', () => {
      expect(color.from('#fa8072').hsl).to.equal('hsl(6.176, 93.151%, 71.373%, 1)');

      // random test
      const expected = randomColor();
      const generated = color.from(color.from(color.from(expected).hex).hsl).hex;
      expect(generated).to.equal(expected);
    });

    it('hsl -> rgb', () => {
      expect(color.from('hsl(328, 100%, 54%)').rgb).to.equal('rgb(255, 20, 146)');
      expect(color.from('hsl(328, 100%, 54%, 0.8)').rgb).to.equal('rgba(255, 20, 146, 0.8)');
      expect(color.from('hsl(323.279, 72.3%, 50.4%)').rgb).to.equal('rgb(220, 37, 149)');
      expect(color.from('hsl(361, 100%, 50%)').rgb).to.equal('rgb(255, 4, 0)');
      expect(color.from('hsl(-361, 100%, 50%)').rgb).to.equal('rgb(255, 4, 0)');
      expect(color.from('hsl(178, 0%, 0%)').rgb).to.equal('rgb(0, 0, 0)');

      // random test
      const expected = randomColor();
      const generated = color.from(color.from(color.from(expected).hsl).hsl).hex;
      expect(generated, `rgb: ${expected} failed multiple HSL <> RGB conversions`).to.equal(expected);
    });

    it('hsl -> hex', () => {
      expect(color.from('hsl(40, 100%, 97%)').hex).to.equal('#fffaf0');
      expect(color.from('hsl(40, 100%, 97%, 0.75)').hex).to.equal('#fffaf0bf');
    });

    it('name -> hex', () => {
      expect(color.from('rebeccapurple').hex).to.equal('#663399');
    });

    it('p3 -> hex', () => {
      expect(color.from('color(display-p3 0 1 1)').hex).to.equal('#00ffff');
      expect(color.from('color(display-p3 0.23 0.872 0.918)').hex).to.equal('#3bdeea');
      expect(color.from('color(display-p3 0 1 1/1)').rgb).to.equal('rgb(0, 255, 255)');
      expect(color.from('color(display-p3 1 0 0/0.5)').rgb).to.equal('rgba(255, 0, 0, 0.5)');
      expect(color.from('color(display-p3 1 0 0/0)').rgb).to.equal('rgba(255, 0, 0, 0)');
    });

    it('CSS names', () => {
      for (const [name, hex] of Object.entries(cssNames)) {
        expect(color.from(name).hexVal).to.equal(hex);
      }
    });

    it('allows out-of-bounds values', () => {
      expect(color.from('rgb(-100, 500, -100)').hex).to.equal('#00ff00');
      expect(color.from('hsl(0, -100%, 200%)').hex).to.equal('#ffffff');
    });
  });

  describe('gradient', () => {
    it('b -> g', () => {
      expect(color.gammaGradient('linear-gradient(90deg, blue, lime)')).to.equal('linear-gradient(90deg,#0000ff,#0088e0,#00baba,#00e088,#00ff00)');
      expect(color.gammaGradient('linear-gradient(90deg, blue, lime)', true)).to.equal('linear-gradient(90deg,color(display-p3 0 0 1),color(display-p3 0 0.53252 0.87742),color(display-p3 0 0.72974 0.72974),color(display-p3 0 0.87742 0.53252),color(display-p3 0 1 0))');
    });

    it('r -> o -> g', () => {
      expect(
        color.gammaGradient('linear-gradient(90deg, red 0%, orange 40%, lime 100%)')
      ).to.equal('linear-gradient(90deg,#ff0000 0%,#ff3400 10%,#ff4700 20%,#ff5600 30%,#ffa500 40%,#e09c00 55%,#bac400 70%,#88e400 85%,#00ff00 100%)')
    })/

    it('overlapping stops', () => {
      expect(color.gammaGradient('linear-gradient(90deg, blue, blue 8px, lime 16px)')).to.equal('linear-gradient(90deg,#0000ff,#0000ff 8px,#0088e0 10px,#00baba 12px,#00e088 14px,#00ff00 16px)');
    });
  });

  describe.skip('benchmark', () => {
    it('rgb -> hex: 75,000 ops/s', () => {
      const start = performance.now();
      for (let n = 0; n < 75000; n ++) {
        color.from([1, 0, 0]).hexVal;
      }
      const end = performance.now() - start;
      expect(end).to.be.lessThan(1000);
    });

    it('rgb -> hsl: 75,000 ops/s', () => {
      const start = performance.now();
      for (let n = 0; n < 75000; n ++) {
        color.from([1, 0, 0]).hslVal;
      }
      const end = performance.now() - start;
      expect(end).to.be.lessThan(1000);
    });

    it('rgb -> p3: 75,000 ops/s', () => {
      const start = performance.now();
      for (let n = 0; n < 75000; n ++) {
        color.from([1, 0, 0]).hslVal;
      }
      const end = performance.now() - start;
      expect(end).to.be.lessThan(1000);
    });
  });
});

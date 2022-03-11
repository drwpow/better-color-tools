import { expect } from 'chai';
import better from '../dist/index.js';
import { colorFn, rgbFn, round } from '../dist/utils.js';

const colors = [
  // basic colors
  { hex: '#000000', rgb: [0, 0, 0, 1], luv: [0, 0, 0, 0], oklab: [0, 0, 0, 1], oklch: [0, 0, 0, 1] },
  { hex: '#ffffff', rgb: [1, 1, 1, 1], luv: [0, 0, 0, 0], oklab: [1, 0, 0, 1], oklch: [1, 0, 89.87556, 1] },
  { hex: '#ff0000', rgb: [1, 0, 0, 1], luv: [0, 0, 0, 0], oklab: [0.62796,  0.22486,  0.12585, 1], oklch: [0.62796, 0.25768, 29.23389,  1] },
  { hex: '#ffff00', rgb: [1, 1, 0, 1], luv: [0, 0, 0, 0], oklab: [0.96798, -0.07137,  0.19857, 1], oklch: [0.96798, 0.21101, 109.76923, 1] },
  { hex: '#00ff00', rgb: [0, 1, 0, 1], luv: [0, 0, 0, 0], oklab: [0.86644, -0.23389,  0.1795,  1], oklch: [0.86644, 0.29483, 142.49534, 1] },
  { hex: '#00ffff', rgb: [0, 1, 1, 1], luv: [0, 0, 0, 0], oklab: [0.9054,  -0.14944, -0.0394,  1], oklch: [0.9054,  0.15455, 194.76895, 1] },
  { hex: '#0000ff', rgb: [0, 0, 1, 1], luv: [0, 0, 0, 0], oklab: [0.45201, -0.03246, -0.31153, 1], oklch: [0.45201, 0.31321, 264.05202, 1] },
  { hex: '#ff00ff', rgb: [1, 0, 1, 1], luv: [0, 0, 0, 0], oklab: [0.70167,  0.27457, -0.16916, 1], oklch: [0.70167, 0.32249, 328.36342, 1] },

  // alpha 50%
  { hex: '#00000080', rgb: [0, 0, 0, 0.50196], luv: [0, 0, 0, 0.50196], p3: 'color(display-p3 0 0 0/0.50196)', oklab: [0, 0, 0, 0.50196], oklch: [0, 0, 0, 0.50196] },
];

// add p3 (don’t manage manually)
for (const c of colors) {
  c.p3 = colorFn('display-p3', c.rgb);
}

function roundAll(arr) {
  return arr.map((v) => round(v, 5));
}


describe('hex <-> rgb', () => {
  for (const c of colors) {
    const given = c.hex;
    const want = rgbFn(c.rgb);
    it(given, () => {
      expect(better.from(given).rgb).to.deep.equal(want);
    });
  }
  for (const c of colors) {
    const given = rgbFn(c.rgb);
    const want = c.hex;
    it(given, () => {
      expect(better.from(given).hex).to.equal(want);
    });
  }
  // shorthand (#fff)
  for (const c of colors) {
    if (c.hex[1] === c.hex[2] && c.hex[3] === c.hex[4] && c.hex[5] === c.hex[6]) {
      const given = `#${c.hex[1]}${c.hex[3]}${c.hex[5]}`;
      const want = c.hex;
      it(given, () => {
        expect(better.from(given).hex).to.equal(want);
      });
    }
  }
});

describe('hex int', () => {
  for (const c of colors) {
    if (c.rgb[3] !== 1) continue; // can’t handle alpha

    const intStr = c.hex.replace('#', '0x')
    const given = parseInt(intStr, 16);
    const want = c.hex;
    it(intStr, () => {
      expect(better.from(given).hex).to.equal(want);
    });
  }
})

describe('hex <-> oklab', () => {
  for (const c of colors) {
    const given = c.hex;
    const want = c.oklab;
    it(given, () => {
      expect(roundAll(better.from(given).oklabVal)).to.deep.equal(want);
    });
  }
  for (const c of colors) {
    const given = colorFn('oklab', c.oklab);
    const want = c.hex;
    it(given, () => {
      expect(better.from(colorFn('oklab', c.oklab)).hex).to.equal(want);
    });
  }
});

describe('hex <-> oklch', () => {
  for (const c of colors) {
    const given = c.hex;
    const want = c.oklch;
    it(given, () => {
      expect(roundAll(better.from(given).oklchVal)).to.deep.equal(want);
    });
  }
  for (const c of colors) {
    const given = colorFn('oklch', c.oklch);
    const want = c.hex;
    it(given, () => {
      expect(better.from(given).hex).to.equal(want);
    });
  }
});

describe('hex <-> p3', () => {
  for (const c of colors) {
    const given = c.hex;
    const want = c.p3;
    it(given, () => {
      expect(better.from(given).p3).to.deep.equal(want);
    });
  }
  for (const c of colors) {
    const given = colorFn('display-p3', c.rgb);
    const want = c.hex;
    it(given, () => {
      expect(better.from(given).hex).to.deep.equal(want);
    });
  }
});

describe.skip('hex <-> luv', () => {
  for (const c of colors) {
    const given = c.hex;
    const want = c.luv;
    it(given, () => {
      expect(roundAll(better.from(given).luvVal)).to.deep.equal(want);
    });
  }
  for (const c of colors) {
    const given = colorFn('luv', c.luv);
    const want = c.oklch;
    it(given, () => {
      expect(roundAll(better.from(given).oklchVal)).to.deep.equal(want);
    });
  }
});

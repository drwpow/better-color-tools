import { expect } from 'chai';
import better from '../dist/index.js';
import { colorFn, round } from '../dist/utils.js';

const colors = [
  // basic colors
  { hex: '#000000', rgb: [0,       0,       0,       1], xyz: [0,       0,       0,       1], luv: [0,        0,        0,        1], oklab: [0,        0,        0,       1], oklch: [0,       0,         0,       1] },
  { hex: '#404040', rgb: [0.25098, 0.25098, 0.25098, 1], xyz: [0.04873, 0.05127, 0.05583, 1], luv: [0.27093, -0.00355, -0.00111,  1], oklab: [0.37149,  0,        0,       1], oklch: [0.37149, 0,        89.87556, 1] },
  { hex: '#808080', rgb: [0.50196, 0.50196, 0.50196, 1], xyz: [0.20518, 0.21586, 0.23507, 1], luv: [0.53585, -0.00702, -0.00219,  1], oklab: [0.59987,  0,        0,       1], oklch: [0.59987, 0,        89.87556, 1] },
  { hex: '#c0c0c0', rgb: [0.75294, 0.75294, 0.75294, 1], xyz: [0.50102, 0.52712, 0.57403, 1], luv: [0.77704, -0.01018, -0.00318,  1], oklab: [0.8078,   0,        0,       1], oklch: [0.8078,  0,        89.87556, 1] },
  { hex: '#ffffff', rgb: [1,       1,       1,       1], xyz: [0.9505,  1,       1.089,   1], luv: [1,       -0.0131,  -0.00409,  1], oklab: [1,        0,        0,       1], oklch: [1,       0,        89.87556, 1] },
  { hex: '#ff0000', rgb: [1,       0,       0,       1], xyz: [0.4124,  0.2126,  0.0193,  1], luv: [0.53233,  1.74355,  0.37542,  1], oklab: [0.62796,  0.22486,  0.12585, 1], oklch: [0.62796, 0.25768,  29.23389, 1] },
  { hex: '#ffff00', rgb: [1,       1,       0,       1], xyz: [0.77,    0.9278,  0.1385,  1], luv: [0.97138,  0.0643,   1.06408,  1], oklab: [0.96798, -0.07137,  0.19857, 1], oklch: [0.96798, 0.21101, 109.76923, 1] },
  { hex: '#00ff00', rgb: [0,       1,       0,       1], xyz: [0.3576,  0.7152,  0.1192,  1], luv: [0.87737, -0.8423,   1.07058,  1], oklab: [0.86644, -0.23389,  0.1795,  1], oklch: [0.86644, 0.29483, 142.49534, 1] },
  { hex: '#00ffff', rgb: [0,       1,       1,       1], xyz: [0.5381,  0.7874,  1.0697,  1], luv: [0.91117, -0.71667, -0.15574,  1], oklab: [0.9054,  -0.14944, -0.0394,  1], oklch: [0.9054,  0.15455, 194.76895, 1] },
  { hex: '#0000ff', rgb: [0,       0,       1,       1], xyz: [0.1805,  0.0722,  0.9505,  1], luv: [0.32303, -0.09823, -1.30485,  1], oklab: [0.45201, -0.03246, -0.31153, 1], oklch: [0.45201, 0.31321, 264.05202, 1] },
  { hex: '#ff00ff', rgb: [1,       0,       1,       1], xyz: [0.5929,  0.2848,  0.9698,  1], luv: [0.6032,   0.83284, -1.08948,  1], oklab: [0.70167,  0.27457, -0.16916, 1], oklch: [0.70167, 0.32249, 328.36342, 1] },

  // alpha 50%
  { hex: '#00000080', rgb: [0, 0, 0, 0.50196], xyz: [0, 0, 0, 0.50196], luv: [0, 0, 0, 0.50196], oklab: [0, 0, 0, 0.50196], oklch: [0, 0, 0, 0.50196] },
];

// add p3 (don’t manage manually)
for (const c of colors) {
  c.p3 = colorFn('display-p3', roundAll(c.rgb));
}

function roundAll(arr) {
  return arr.map((v) => round(v, 5));
}


describe('hex <-> rgb', () => {
  // hex -> rgb
  for (const c of colors) {
    const given = c.hex;
    const want = colorFn('rgb', c.rgb);
    it(given, () => {
      expect(better.from(given).rgb).to.deep.equal(want);
    });
  }
  // rgb -> hex
  for (const c of colors) {
    const given = colorFn('rgb', c.rgb);
    const want = c.hex;
    it(given, () => {
      expect(better.from(given).hex).to.equal(want);
    });
  }
  // shorthand (#f00)
  for (const c of colors) {
    const canBeShortened = c.hex[1] === c.hex[2] && c.hex[3] === c.hex[4] && c.hex[5] === c.hex[6] && c.hex[7] === c.hex[8];
    if (!canBeShortened) continue;
    const given = `#${c.hex[1]}${c.hex[3]}${c.hex[5]}`;
    const want = c.hex;
    it(given, () => {
      expect(better.from(given).hex).to.equal(want);
    });
  }
});

describe('hex int', () => {
  // hex int -> hex
  for (const c of colors) {
    if (c.rgb[3] !== 1) continue; // skip alpha

    const intStr = c.hex.replace('#', '0x');
    const given = parseInt(intStr, 16);
    const want = c.hex;
    it(intStr, () => {
      expect(better.from(given).hex).to.equal(want);
    });
  }
  // hex -> hex int -> hex
  for (const c of colors) {
    if (c.rgb[3] !== 1) continue; // skip alpha

    const given = c.hex;
    const intStr = given.replace('#', '0x');
    const want = parseInt(intStr, 16);
    it(`${intStr} (output)`, () => {
      expect(better.from(given).hexVal).to.equal(want);
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
    const given = colorFn('display-p3', roundAll(c.rgb));
    const want = c.hex;
    it(given, () => {
      expect(better.from(given).hex).to.deep.equal(want);
    });
  }
});

describe('hex <-> xyz', () => {
  for (const c of colors) {
    const given = c.hex;
    const want = c.xyz;
    it(given, () => {
      expect(roundAll(better.from(given).xyzVal)).to.deep.equal(want);
    });
  }
  for (const c of colors) {
    const given = colorFn('xyz', c.xyz);
    const want = c.hex;
    it(given, () => {
      expect(better.from(given).hex).to.deep.equal(want);
    });
  }
});

describe('hex <-> luv', () => {
  for (const c of colors) {
    const given = c.hex;
    const want = c.luv;
    it(given, () => {
      expect(roundAll(better.from(given).luvVal)).to.deep.equal(want);
    });
  }
  for (const c of colors) {
    const given = colorFn('luv', c.luv);
    const want = c.hex;
    it(given, () => {
      expect(better.from(given).hex).to.deep.equal(want);
    });
  }
});

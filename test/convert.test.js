import { expect } from 'chai';
import better from '../dist/index.js';
import { colorFn, round } from '../dist/utils.js';

const colors = [
  // basic colors
  { hex: '#000000', rgb: [0,          0,          0,          1], oklab: [0,         0,         0,        1], oklch: [0,        0,          0,        1], xyz: [0,        0,        0,        1] },
  { hex: '#404040', rgb: [0.25098039, 0.25098039, 0.25098039, 1], oklab: [0.371495,  0,         0,        1], oklch: [0.371495, 0,          0,        1], xyz: [0.048729, 0.051269, 0.055835, 1] },
  { hex: '#808080', rgb: [0.50196078, 0.50196078, 0.50196078, 1], oklab: [0.599871,  0,         0,        1], oklch: [0.599871, 0,          0,        1], xyz: [0.205166, 0.215861, 0.235085, 1] },
  { hex: '#c0c0c0', rgb: [0.75294118, 0.75294118, 0.75294118, 1], oklab: [0.807796,  0,         0,        1], oklch: [0.807796, 0,          0,        1], xyz: [0.501,    0.527115, 0.574059, 1] },
  { hex: '#ffffff', rgb: [1,          1,          1,          1], oklab: [1,         0,         0,        1], oklch: [1,        0,          0,        1], xyz: [0.950456, 1,        1.089058, 1] },
  { hex: '#ff0000', rgb: [1,          0,          0,          1], oklab: [0.627955,  0.224863,  0.125846, 1], oklch: [0.627955, 0.257683,  29.233885, 1], xyz: [0.412391, 0.212639, 0.019331, 1] },
  { hex: '#ffff00', rgb: [1,          1,          0,          1], oklab: [0.967983, -0.071369,  0.19857,  1], oklch: [0.967983, 0.211006, 109.769232, 1], xyz: [0.769975, 0.927808, 0.138526, 1] },
  { hex: '#00ff00', rgb: [0,          1,          0,          1], oklab: [0.86644,  -0.233888,  0.179498, 1], oklch: [0.86644,  0.294827, 142.495339, 1], xyz: [0.357584, 0.715169, 0.119195, 1] },
  { hex: '#00ffff', rgb: [0,          1,          1,          1], oklab: [0.905399, -0.149444, -0.039398, 1], oklch: [0.905399, 0.15455,  194.768948, 1], xyz: [0.538065, 0.787361, 1.069727, 1] },
  { hex: '#0000ff', rgb: [0,          0,          1,          1], oklab: [0.452014, -0.032457, -0.311528, 1], oklch: [0.452014, 0.313214, 264.052021, 1], xyz: [0.180481, 0.072192, 0.950532, 1] },
  { hex: '#ff00ff', rgb: [1,          0,          1,          1], oklab: [0.701674,  0.274566, -0.169156, 1], oklch: [0.701674, 0.322491, 328.363418, 1], xyz: [0.592872, 0.284831, 0.969863, 1] },

  // alpha 50%
  { hex: '#00000080', rgb: [0, 0, 0, 0.501961], oklab: [0, 0, 0, 0.501961], oklch: [0, 0, 0, 0.501961], xyz: [0, 0, 0, 0.501961] },
];

function roundAll(arr, prec = 6) {
  return arr.map((v) => round(v, prec));
}
describe('sRGB', () => {
  for (const c of colors) {
    it(c.hex, () => {
      expect(better.from(c.hex).rgb).to.equal(colorFn('rgb', c.rgb));
    });
    it(`${c.hex} (inverse)`, () => {
      expect(better.from(colorFn('rgb', c.rgb)).hex).to.equal(c.hex);
    });

    const canBeShortened = c.hex[1] === c.hex[2] && c.hex[3] === c.hex[4] && c.hex[5] === c.hex[6] && c.hex[7] === c.hex[8];
    if (canBeShortened) {
      const shortHex = `#${c.hex[1]}${c.hex[3]}${c.hex[5]}`;
      it(shortHex, () => {
        expect(better.from(shortHex).hex).to.equal(c.hex);
      });
    }

    if (c.rgb[3] === 1) {
      const hexInt = parseInt(c.hex.replace('#', '0x'));
      it(`${c.hex} (int)`, () => {
        expect(better.from(c.hex).hexVal).to.equal(hexInt);
      });
      it(`${c.hex} (from int)`, () => {
        expect(better.from(hexInt).hex).to.equal(c.hex);
      });
    }
  }
});

describe('oklab', () => {
  for (const c of colors) {
    it(c.hex, () => {
      expect(roundAll(better.from(c.hex).oklabVal)).to.deep.equal(c.oklab);
    });
    it(`${c.hex} (inverse)`, () => {
      expect(better.from(colorFn('oklab', c.oklab)).hex).to.equal(c.hex);
    });
    it(`${c.hex} (roundtrip)`, () => {
      expect(better.from(better.from(c.hex).oklab).hex).to.equal(c.hex);
    });
  }
});

describe('oklch', () => {
  for (const c of colors) {
    const oklchStr = colorFn('oklch', c.oklch)
    it(oklchStr, () => {
      expect(roundAll(better.from(c.hex).oklchVal)).to.deep.equal(c.oklch);
    });
    it(`${oklchStr} (inverse)`, () => {
      expect(better.from(oklchStr).hex).to.equal(c.hex);
    });
    it(`${oklchStr} (roundtrip)`, () => {
      expect(better.from(better.from(c.hex).oklch).hex).to.equal(c.hex);
    });
  }
  // non-recursive/out-of-gamut oklch tests
  // note: these aren’t “correct” per-se; more just a test for regressions/changes
  const oklchTests = [
    { oklch: [0.0457, 0.026829970225814147, 264.05202063805507, 1], hex: '#000003' },
    { oklch: [0,      0.00000002,            89.8755635095349,  1], hex: '#000000' },
    { oklch: [1,      0.12801375474374593,  168.89572110316647, 1], hex: '#00ffe7' },
    { oklch: [0.85,   0.17463268857418898,   54.10799672454288, 1], hex: '#ff9f00' },
  ];
  for (const t of oklchTests) {
    const oklchStr = colorFn('oklch', t.oklch);
    it(oklchStr, () => {
      expect(better.from(oklchStr).hex).to.equal(t.hex);
    });
  }
});

describe('p3', () => {
  for (const c of colors) {
    const p3Str = colorFn('display-p3', c.rgb);
    it(p3Str, () => {
      expect(better.from(c.hex).p3).to.equal(p3Str);
    });
    it(`${p3Str} (inverse)`, () => {
      expect(better.from(p3Str).hex).to.equal(c.hex);
    })
  }
});

describe('xyz', () => {
  for (const c of colors) {
    const xyzStr = colorFn('xyz-d65', c.xyz);
    it(xyzStr, () => {
      expect(roundAll(better.from(c.hex).xyzVal)).to.deep.equal(c.xyz);
    });
    it(`${xyzStr} (inverse)`, () => {
      expect(better.from(xyzStr).hex).to.equal(c.hex);
    });
    it(`${xyzStr} (roundtrip)`, () => {
      expect(better.from(colorFn('xyz-d65', better.from(c.hex).xyzVal)).hex).to.equal(c.hex);
    })
  }
});

// describe.skip('luv', () => {
//   for (const c of colors) {
//     const alpha = c.rgb[3];
//     const { l, u, v } = luv(c.hex);
//     const luvVal = [l, u, v, alpha];
//     const luvStr = colorFn('luv', luvVal);
//     it(luvStr, () => {
//       expect(roundAll(better.from(c.hex).luvVal)).to.deep.equal(roundAll(luvVal));
//     });
//     it(`${luvStr} (inverse)`, () => {
//       expect(better.from(luvStr).hex).to.deep.equal(c.hex);
//     })
//     it(`${luvStr} (roundtrip)`, () => {
//       expect(better.from(colorFn('luv', better.from(c.hex).luvVal)).hex).to.equal(c.hex);
//     });
//   }
// });

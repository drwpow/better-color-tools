import { describe, expect, it } from 'vitest';
import better from '../dist/index.js';
import { colorFn, round } from '../dist/utils.js';

const colors = [
  // basic colors
  { hex: '#000000', rgb: {r: 0,          g: 0,          b: 0,          alpha: 1}, oklab: {l: 0,        a:  0,        b:  0,        alpha: 1}, oklch: {l: 0,        c: 0,        h:   0,        alpha: 1}, xyz: {x: 0,        y: 0,        z: 0,        alpha: 1} },
  { hex: '#404040', rgb: {r: 0.25098039, g: 0.25098039, b: 0.25098039, alpha: 1}, oklab: {l: 0.371495, a:  0,        b:  0,        alpha: 1}, oklch: {l: 0.371495, c: 0,        h:   0,        alpha: 1}, xyz: {x: 0.048729, y: 0.051269, z: 0.055835, alpha: 1} },
  { hex: '#808080', rgb: {r: 0.50196078, g: 0.50196078, b: 0.50196078, alpha: 1}, oklab: {l: 0.599871, a:  0,        b:  0,        alpha: 1}, oklch: {l: 0.599871, c: 0,        h:   0,        alpha: 1}, xyz: {x: 0.205166, y: 0.215861, z: 0.235085, alpha: 1} },
  { hex: '#c0c0c0', rgb: {r: 0.75294118, g: 0.75294118, b: 0.75294118, alpha: 1}, oklab: {l: 0.807796, a:  0,        b:  0,        alpha: 1}, oklch: {l: 0.807796, c: 0,        h:   0,        alpha: 1}, xyz: {x: 0.501,    y: 0.527115, z: 0.574059, alpha: 1} },
  { hex: '#ffffff', rgb: {r: 1,          g: 1,          b: 1,          alpha: 1}, oklab: {l: 1,        a:  0,        b:  0,        alpha: 1}, oklch: {l: 1,        c: 0,        h:   0,        alpha: 1}, xyz: {x: 0.950456, y: 1,        z: 1.089058, alpha: 1} },
  { hex: '#ff0000', rgb: {r: 1,          g: 0,          b: 0,          alpha: 1}, oklab: {l: 0.627955, a:  0.224863, b:  0.125846, alpha: 1}, oklch: {l: 0.627955, c: 0.257683, h:  29.233885, alpha: 1}, xyz: {x: 0.412391, y: 0.212639, z: 0.019331, alpha: 1} },
  { hex: '#ffff00', rgb: {r: 1,          g: 1,          b: 0,          alpha: 1}, oklab: {l: 0.967983, a: -0.071369, b:  0.19857,  alpha: 1}, oklch: {l: 0.967983, c: 0.211006, h: 109.769232, alpha: 1}, xyz: {x: 0.769975, y: 0.927808, z: 0.138526, alpha: 1} },
  { hex: '#00ff00', rgb: {r: 0,          g: 1,          b: 0,          alpha: 1}, oklab: {l: 0.86644,  a: -0.233888, b:  0.179498, alpha: 1}, oklch: {l: 0.86644,  c: 0.294827, h: 142.495339, alpha: 1}, xyz: {x: 0.357584, y: 0.715169, z: 0.119195, alpha: 1} },
  { hex: '#00ffff', rgb: {r: 0,          g: 1,          b: 1,          alpha: 1}, oklab: {l: 0.905399, a: -0.149444, b: -0.039398, alpha: 1}, oklch: {l: 0.905399, c: 0.15455,  h: 194.768948, alpha: 1}, xyz: {x: 0.538065, y: 0.787361, z: 1.069727, alpha: 1} },
  { hex: '#0000ff', rgb: {r: 0,          g: 0,          b: 1,          alpha: 1}, oklab: {l: 0.452014, a: -0.032457, b: -0.311528, alpha: 1}, oklch: {l: 0.452014, c: 0.313214, h: 264.052021, alpha: 1}, xyz: {x: 0.180481, y: 0.072192, z: 0.950532, alpha: 1} },
  { hex: '#ff00ff', rgb: {r: 1,          g: 0,          b: 1,          alpha: 1}, oklab: {l: 0.701674, a:  0.274566, b: -0.169156, alpha: 1}, oklch: {l: 0.701674, c: 0.322491, h: 328.363418, alpha: 1}, xyz: {x: 0.592872, y: 0.284831, z: 0.969863, alpha: 1} },

  // alpha 50%
  { hex: '#00000080', rgb: {r: 0, g: 0, b: 0, alpha: 0.501961}, oklab: {l: 0, a: 0, b: 0, alpha: 0.501961}, oklch: {l: 0, c: 0, h: 0, alpha: 0.501961}, xyz: {x: 0, y: 0, z: 0, alpha: 0.501961} },
];

function roundAll(arr: number[], prec = 6): number[] {
  return arr.map((v) => round(v, prec));
}
describe('sRGB', () => {
  for (const c of colors) {
    it(c.hex, () => {
      expect(better.from(c.hex).rgb).toBe(colorFn('rgb', c.rgb));
    });
    it(`${c.hex} (inverse)`, () => {
      expect(better.from(colorFn('rgb', c.rgb)).hex).toBe(c.hex);
    });

    const canBeShortened = c.hex[1] === c.hex[2] && c.hex[3] === c.hex[4] && c.hex[5] === c.hex[6] && c.hex[7] === c.hex[8];
    if (canBeShortened) {
      const shortHex = `#${c.hex[1]}${c.hex[3]}${c.hex[5]}`;
      it(shortHex, () => {
        expect(better.from(shortHex).hex).toBe(c.hex);
      });
    }

    if (c.rgb[3] === 1) {
      const hexInt = parseInt(c.hex.replace('#', '0x'));
      it(`${c.hex} (int)`, () => {
        expect(better.from(c.hex).hexVal).toBe(hexInt);
      });
      it(`${c.hex} (from int)`, () => {
        expect(better.from(hexInt).hex).toBe(c.hex);
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
      expect(better.from(colorFn('oklab', c.oklab)).hex).toBe(c.hex);
    });
    it(`${c.hex} (roundtrip)`, () => {
      expect(better.from(better.from(c.hex).oklab).hex).toBe(c.hex);
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
      expect(better.from(oklchStr).hex).toBe(c.hex);
    });
    it(`${oklchStr} (roundtrip)`, () => {
      expect(better.from(better.from(c.hex).oklch).hex).toBe(c.hex);
    });
  }
  // non-recursive/out-of-gamut oklch tests
  // note: these aren’t “correct” per-se; more just a test for regressions/changes
  const oklchTests = [
    { oklch: {l: 0.0457, c: 0.026829970225814147, h: 264.05202063805507, alpha: 1}, hex: '#000003' },
    { oklch: {l: 0,      c: 0.00000002,           h:  89.8755635095349,  alpha: 1}, hex: '#000000' },
    { oklch: {l: 1,      c: 0.12801375474374593,  h: 168.89572110316647, alpha: 1}, hex: '#ffffff' },
    { oklch: {l: 0.85,   c: 0.17463268857418898,  h:  54.10799672454288, alpha: 1}, hex: '#ffbd93' },
  ];
  for (const t of oklchTests) {
    const oklchStr = colorFn('oklch', t.oklch);
    it(oklchStr, () => {
      expect(better.from(oklchStr).hex).toBe(t.hex);
    });
  }
});

describe('p3', () => {
  for (const c of colors) {
    const p3Str = colorFn('display-p3', c.rgb);
    it(p3Str, () => {
      expect(better.from(c.hex).p3).toBe(p3Str);
    });
    it(`${p3Str} (inverse)`, () => {
      expect(better.from(p3Str).hex).toBe(c.hex);
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
      expect(better.from(xyzStr).hex).toBe(c.hex);
    });
    it(`${xyzStr} (roundtrip)`, () => {
      expect(better.from(colorFn('xyz-d65', better.from(c.hex).xyzVal)).hex).toBe(c.hex);
    })
  }
});



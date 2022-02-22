import type { Color, LRGB, Oklab, Oklch, sRGB } from './colorspace.js';

import NP from 'number-precision';
import { hslTosRGB, labToLCH, lchToLAB, LMSToLRGB, LMSToOklab, LRGBToLMS, LRGBTosRGB, OklabToLMS, sRGBToLRGB } from './colorspace.js';
import cssNames from './css-names.js';
import { clamp, leftPad } from './utils.js';

NP.enableBoundaryChecking(false); // don’t throw error on inaccurate calculation

export interface ColorOutput {
  /** `#000000` */
  hex: string;
  /** `rgb(0, 0, 0)` */
  rgb: string;
  /** `rgba(0, 0, 0, 1)` */
  rgba: string;
  /** 0x000000 */
  hexVal: number;
  /** [R, G, B, alpha] */
  rgbVal: sRGB;
  /** [R, G, B, alpha] */
  rgbaVal: sRGB;
  /** [R, G, B, alpha] */
  linearRGB: LRGB;
  /** `color(display-p3 0 0 0/1)` */
  p3: string;
  /** [R, G, B, alpha] */
  p3Val: sRGB;
  /** `color(oklab 0 0 0/1)` */
  oklab: string;
  /** [L, a, b, alpha] */
  oklabVal: Oklab;
  /** `color(oklch 0 0 0/1)` */
  oklch: string;
  /** [L, C, h, alpha] */
  oklchVal: Oklch;
  toString(): string; // JS helper
}

// constants
const P = 5; // standard precision: 16-bit
const FLOAT_RE = /[0-9.-]+%?/g;
const HEX_RE = /^#?[0-9a-f]{3,8}$/i;

/**
 * Parse any valid CSS color color string and convert to:
 * - hex:       '#ff0000'
 * - hexVal:    0xff0000
 * - rgb:       'rgb(255, 0, 0)'
 * - rgbVal:    [1, 0, 0, 1]
 * - rgba:      'rgba(255, 0, 0, 1)'
 * - rgbaVal:   [1, 0, 0, 1]   // alias of rgbVal
 * - linearRGB: [1, 0, 0, 0]   // https://en.wikipedia.org/wiki/Gamma_correction
 * - hslVal:    [0, 1, 1, 1]   // 0% = 0, 100% = 1
 * - p3:        'color(display-p3 1 0 0)'
 * - p3Val:     '[1, 0, 0, 0]'
 */
export function from(rawColor: Color): ColorOutput {
  const color = parse(rawColor);

  const outputs = {
    get hex(): string {
      return `#${color
        .map((v, n) => {
          if (n < 3) return leftPad(NP.round(v * 255, 0).toString(16), 2);
          return v < 1 ? NP.round(v * 255, 0).toString(16) : '';
        })
        .join('')}`;
    },
    get hexVal(): number {
      const hex = color.map((v, n) => {
        if (n < 3) return leftPad(NP.round(v * 255, 0).toString(16), 2);
        return v < 1 ? leftPad((v * 256).toString(16), 2) : '';
      });
      return parseInt(`0x${hex.join('')}`, 16);
    },
    get rgb(): string {
      if (color[3] == 1) {
        return `rgb(${NP.round(color[0] * 255, 0)}, ${NP.round(color[1] * 255, 0)}, ${NP.round(color[2] * 255, 0)})`;
      } else {
        return `rgba(${NP.round(color[0] * 255, 0)}, ${NP.round(color[1] * 255, 0)}, ${NP.round(color[2] * 255, 0)}, ${NP.round(color[3], P)})`;
      }
    },
    rgbVal: color,
    get rgba(): string {
      return `rgba(${NP.round(color[0] * 255, 0)}, ${NP.round(color[1] * 255, 0)}, ${NP.round(color[2] * 255, 0)}, ${NP.round(color[3], P)})`;
    },
    rgbaVal: color,
    get linearRGB(): sRGB {
      return sRGBToLRGB(color);
    },
    get p3(): string {
      const [r, g, b, a] = color;
      return `color(display-p3 ${NP.round(r, P)} ${NP.round(g, P)} ${NP.round(b, P)}${a < 1 ? `/${NP.round(a, P)}` : ''})`;
    },
    p3Val: color,
    get oklab(): string {
      const lrgb = sRGBToLRGB(color);
      const lms = LRGBToLMS(lrgb);
      const [l, a, b, alpha] = LMSToOklab(lms);
      return `color(oklab ${NP.round(l, P)} ${NP.round(a, P)} ${NP.round(b, P)}${alpha < 1 ? `/${NP.round(alpha, P)}` : ''})`;
    },
    get oklabVal(): Oklab {
      const lrgb = sRGBToLRGB(color);
      const lms = LRGBToLMS(lrgb);
      const oklab = LMSToOklab(lms);
      return oklab;
    },
    get oklch(): string {
      const lrgb = sRGBToLRGB(color);
      const lms = LRGBToLMS(lrgb);
      const oklab = LMSToOklab(lms);
      const [l, c, h, alpha] = labToLCH(oklab);
      return `color(oklch ${NP.round(l, P)} ${NP.round(c, P)} ${NP.round(h, P)}${alpha < 1 ? `/${NP.round(alpha, P)}` : ''})`;
    },
    get oklchVal(): Oklch {
      const lrgb = sRGBToLRGB(color);
      const lms = LRGBToLMS(lrgb);
      const oklab = LMSToOklab(lms);
      const lch = labToLCH(oklab);
      return lch;
    },
  };

  // JS helper
  outputs.toString = (): string => outputs.hex;

  return outputs;
}

/** Convert any number of user inputs into RGBA array */
function parse(rawColor: Color): sRGB {
  /** Convert 0xff0000 to RGBA array */
  function parseHexVal(hexVal: number): sRGB {
    const hexStr = leftPad(clamp(hexVal, 0, 0xffffffff).toString(16), 6); // note: 0x000001 will convert to '1'
    return [
      parseInt(hexStr.substring(0, 2), 16) / 255, // r
      parseInt(hexStr.substring(2, 4), 16) / 255, // g
      parseInt(hexStr.substring(4, 6), 16) / 255, // b
      parseInt(hexStr.substring(6, 8) || 'ff', 16) / 255, // a
    ];
  }

  /** only grabs numbers from a color string (ignores spaces, commas, slashes, etc.) */
  function parseValueStr(colorStr: string, normalize: number[]): [number, number, number, number] {
    const matches = colorStr.match(FLOAT_RE);
    if (!matches) throw new Error(`Unexpected color format: ${colorStr}`);
    const values: [number, number, number, number] = [0, 0, 0, 1]; // always start alpha at 1 unless overridden
    matches.forEach((value, n) => {
      // percentage (already normalized)
      if (value.includes('%')) values[n] = parseFloat(value) / 100;
      // unbounded
      else if (normalize[n] === Infinity) values[n] = parseFloat(value);
      // bounded
      else values[n] = parseFloat(value) / normalize[n];
    });
    return values;
  }

  // [R, G, B] or [R, G, B, A]
  if (Array.isArray(rawColor)) {
    if (rawColor.some((val) => typeof val != 'number')) throw new Error(`Color array must be numbers, received ${rawColor}`);
    if (rawColor.length < 3 || rawColor.length > 4) throw new Error(`Expected [R, G, B, A?], received ${rawColor}`);
    return [
      clamp(rawColor[0], 0, 1), // r
      clamp(rawColor[1], 0, 1), // g
      clamp(rawColor[2], 0, 1), // b
      typeof rawColor[3] === 'number' ? clamp(rawColor[3], 0, 1) : 1, // apha
    ];
  }

  // 0xff0000 (number)
  if (typeof rawColor == 'number') {
    return parseHexVal(rawColor);
  }

  // '#ff0000' / 'red' / 'rgb(255, 0, 0)' / 'hsl(0, 1, 1)'
  if (typeof rawColor == 'string') {
    const strVal = rawColor.trim();
    if (!strVal) throw new Error(`Expected color, received empty string`);

    // named color
    // console.log({ val: strVal, name: (cssNames as any)[strVal] });
    // note: 0 (black) is a valid color! so don’t check for “truthy” here
    if (typeof cssNames[strVal.toLowerCase() as keyof typeof cssNames] === 'number') {
      return parseHexVal(cssNames[strVal as keyof typeof cssNames] as number);
    }
    // hex
    if (HEX_RE.test(strVal)) {
      const hex = strVal.replace('#', '');
      const hexNum = parseInt(
        hex.length < 6
          ? hex
              .split('')
              .map((d) => `${d}${d}`)
              .join('') // handle shortcut (#fff)
          : hex,
        16
      );
      return parseHexVal(hexNum);
    }

    // color functions
    let [colorspace, rest] = strVal.split('(');
    if (colorspace === 'color') colorspace = rest.split(' ')[0];
    switch (colorspace) {
      case 'rgb':
      case 'rgba':
      case 'srgb': {
        const [r, g, b, a] = parseValueStr(rest, [255, 255, 255]);
        return [clamp(r, 0, 1), clamp(g, 0, 1), clamp(b, 0, 1), clamp(a, 0, 1)];
      }
      case 'srgb-linear': {
        const [r, g, b, a] = parseValueStr(rest, [255, 255, 255]);
        return LRGBTosRGB([clamp(r, 0, 1), clamp(g, 0, 1), clamp(b, 0, 1), clamp(a, 0, 1)]);
      }
      case 'hsl': {
        const [h, s, l, a] = parseValueStr(rest, [Infinity, 1, 1]);
        return hslTosRGB([h, clamp(s, 0, 1), clamp(l, 0, 1), clamp(a, 0, 1)]);
      }
      case 'p3':
      case 'display-p3': {
        const [r, g, b, a] = parseValueStr(rest, [1, 1, 1]);
        return [clamp(r, 0, 1), clamp(g, 0, 1), clamp(b, 0, 1), clamp(a, 0, 1)];
      }
      case 'oklab': {
        const lab = parseValueStr(rest, [1, 1, 1]); // note: Lab allows negative values but this library is unable to preserve those
        const lms = OklabToLMS(lab);
        const lrgb = LMSToLRGB(lms);
        return LRGBTosRGB(lrgb);
      }
      case 'oklch': {
        const lch = parseValueStr(rest, [1, 1, Infinity]);
        const lab = lchToLAB(lch);
        const lms = OklabToLMS(lab);
        const lrgb = LMSToLRGB(lms);
        return LRGBTosRGB(lrgb);
      }
    }
  }

  throw new Error(`Unable to parse color "${rawColor}"`);
}

/**
 * Lightness
 * Shortcut of "L” from oklab
 */
export function lightness(color: Color): number {
  return NP.round(from(color).oklabVal[0], 5); // l == lightness
}

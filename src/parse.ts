import type { AdjustOptions } from './adjust.js';
import type { Color, LinearRGBD65, Oklab, Oklch, sRGB, XYZ } from './colorspace.js';

import adjust from './adjust.js';
import { hslTosRGB, hwbTosRGB, linearRGBD65TosRGB, linearRGBD65ToXYZ, oklabTosRGB, oklchTosRGB, sRGBToLinearRGBD65, sRGBToOklab, sRGBToOklch, xyzToLinearRGBD65 } from './colorspace.js';
import cssNames from './css-names.js';
import { clamp, colorFn, leftPad } from './utils.js';

/** note: values must be normalized to 1 (e.g. `255 -> 1`) */
export interface RGBObj {
  r: number;
  g: number;
  b: number;
  alpha?: number;
}

export interface HSLObj {
  h: number;
  s: number;
  l: number;
  alpha?: number;
}

export interface HWBObj {
  h: number;
  w: number;
  b: number;
  alpha?: number;
}

export interface OklabObj {
  l: number;
  a: number;
  b: number;
  alpha?: number;
}

export interface OklchObj {
  l: number;
  c: number;
  h: number;
  alpha?: number;
}

export interface XYZObj {
  x: number;
  y: number;
  z: number;
  alpha?: number;
}

export type ColorInput = Color | RGBObj | HSLObj | HWBObj | OklabObj | OklchObj | XYZObj;

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
  /** `color(srgb-linear 0 0 0)` */
  linearRGB: string;
  /** [R, G, B, alpha] */
  linearRGBVal: LinearRGBD65;
  /** `color(luv 0 0 0/1)` */
  // luv: string;
  /** [L, u, v, alpha] */
  // luvVal: LUV;
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
  /** `color(xyz 0 0 0/1)` */
  xyz: string;
  /** [X, Y, Z, alpha] */
  xyzVal: XYZ;
  /** Adjust color through oklab/oklch colorspace */
  adjust: (options: AdjustOptions) => ColorOutput;
  toString(): string; // JS helper
}

// constants
const FLOAT_RE = /-?[0-9.]+%?/g;
const HEX_RE = /^#[0-9a-f]{3,8}$/i;
const COLOR_FN_RE = /^([^( ]+)\s*\(\s*([^)]+)\)$/;
const RGB_RANGE = 16 ** 6;
const R_FACTOR = 16 ** 4; // base 16, starting after 4 digits (GGBB)
const G_FACTOR = 16 ** 2; // base 16, starting after 2 digits (BB)
// B_FACTOR = 1 (16 ** 0); not really needed

/**
 * Parse any valid CSS color or object and convert to:
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
export function from(rawColor: ColorInput): ColorOutput {
  const color = parse(rawColor);

  const outputs = {
    get hex(): string {
      const [r, g, b, a] = color;
      let hexString = '#';
      hexString += leftPad(Math.round(clamp(r * 255, 0, 255)).toString(16), 2); // r
      hexString += leftPad(Math.round(clamp(g * 255, 0, 255)).toString(16), 2); // g
      hexString += leftPad(Math.round(clamp(b * 255, 0, 255)).toString(16), 2); // b
      if (color[3] < 1) hexString += leftPad(Math.round(a * 255).toString(16), 2); // a
      return hexString;
    },
    get hexVal(): number {
      let [r, g, b, a] = color;
      if (a < 1) console.warn(`hexVal converted a semi-transparent color (${a * 100}%) to fully opaque`); // eslint-disable-line no-console
      r = Math.round(clamp(r * 255, 0, 255));
      g = Math.round(clamp(g * 255, 0, 255));
      b = Math.round(clamp(b * 255, 0, 255));
      return r * R_FACTOR + g * G_FACTOR + b;
    },
    // get luv(): string {
    //   return colorFn('luv', sRGBToLuv(color));
    // },
    // get luvVal(): LUV {
    //   return sRGBToLuv(color);
    // },
    get rgb(): string {
      return colorFn('rgb', color);
    },
    rgbVal: color,
    get rgba(): string {
      return colorFn('rgb', color);
    },
    rgbaVal: color,
    get linearRGB(): string {
      return colorFn('srgb-linear', sRGBToLinearRGBD65(color));
    },
    get linearRGBVal(): LinearRGBD65 {
      return sRGBToLinearRGBD65(color);
    },
    get p3(): string {
      return colorFn('display-p3', color);
    },
    p3Val: color,
    get oklab(): string {
      return colorFn('oklab', sRGBToOklab(color));
    },
    get oklabVal(): Oklab {
      return sRGBToOklab(color);
    },
    get oklch(): string {
      return colorFn('oklch', sRGBToOklch(color));
    },
    get oklchVal(): Oklch {
      return sRGBToOklch(color);
    },
    get xyz(): string {
      return colorFn('xyz-d65', linearRGBD65ToXYZ(sRGBToLinearRGBD65(color)));
    },
    get xyzVal(): XYZ {
      return linearRGBD65ToXYZ(sRGBToLinearRGBD65(color));
    },
    adjust(options: AdjustOptions): ColorOutput {
      return from(adjust(color, options));
    },
  };

  // JS helper
  outputs.toString = (): string => outputs.hex;

  return outputs;
}

/**
 * hex num to sRGB (doesn’t support alpha as 0x000000 == 0x00000000)
 * V8 handles number ops ~ 2x faster than parseInt(hex, 16) with string manipulations
 */
export function hexNumTosRGB(hex: number): sRGB {
  if (hex > RGB_RANGE) throw new Error('8-digit hex values (with transparency) aren’t supported');
  let remaining = hex;
  const r = Math.floor(remaining / R_FACTOR); // Math.floor gets rid of G + B
  remaining -= r * R_FACTOR;
  const g = Math.floor(remaining / G_FACTOR); // Math.floor gets rid of B
  remaining -= g * G_FACTOR;
  const b = remaining;
  return [r / 255, g / 255, b / 255, 1];
}

/** only grabs numbers from a color string (ignores spaces, commas, slashes, etc.) */
function parseValueStr(colorStr: string, normalize?: number[]): number[] {
  const matches = colorStr.match(FLOAT_RE);
  if (!matches) throw new Error(`Unexpected color format: ${colorStr}`);
  const values = [0, 0, 0, 1]; // always start alpha at 1 unless overridden
  for (let n = 0; n < matches.length; n++) {
    if (!matches[n]) continue;
    // percentage (already normalized)
    if (matches[n].includes('%')) values[n] = parseFloat(matches[n]) / 100;
    // unbounded
    else if (!normalize || normalize[n] === Infinity || normalize[n] === 1) values[n] = parseFloat(matches[n]);
    // bounded
    else values[n] = parseFloat(matches[n]) / normalize[n];
  }
  return values;
}

/** Convert any number of user inputs into RGBA array */
export function parse(rawColor: ColorInput): sRGB {
  const unparsable = new Error(`Unable to parse color ${JSON.stringify(rawColor)}`);

  if (rawColor == undefined || rawColor == null || typeof rawColor === 'boolean') throw unparsable;

  // [R, G, B] or [R, G, B, A]
  if (Array.isArray(rawColor)) {
    if (rawColor.some((v) => typeof v !== 'number')) throw new Error(`Color array must be numbers, received ${rawColor}`);
    if (rawColor.length < 3 || rawColor.length > 4) throw new Error(`Expected [R, G, B, A?], received ${rawColor}`);
    const [r, g, b, a] = rawColor;
    return [
      clamp(r, 0, 1), // r
      clamp(g, 0, 1), // g
      clamp(b, 0, 1), // b
      typeof a === 'number' ? clamp(a, 0, 1) : 1, // alpha
    ];
  }

  // 0xff0000 (number)
  // !note: doesn’t support alpha
  if (typeof rawColor == 'number') {
    return hexNumTosRGB(rawColor);
  }

  // '#ff0000' / 'red' / 'rgb(255, 0, 0)' / 'hsl(0, 1, 1)'
  if (typeof rawColor == 'string') {
    const strVal = rawColor.trim();
    if (!strVal) throw new Error(`Expected color, received empty string`);

    // named color
    const lc = strVal.toLowerCase();
    if (typeof cssNames[lc] === 'number') {
      return hexNumTosRGB(cssNames[lc]);
    }

    // hex
    if (HEX_RE.test(lc)) {
      const hex = lc.replace('#', '');
      const rgb: sRGB = [0, 0, 0, 1];
      if (hex.length === 6 || hex.length === 8) {
        for (let n = 0; n < hex.length / 2; n++) {
          const start = n * 2;
          const end = start + 2;
          const value = hex.substring(start, end);
          rgb[n] = parseInt(value, 16) / 255;
        }
      } else if (hex.length === 3 || hex.length === 4) {
        for (let n = 0; n < hex.length; n++) {
          const value = hex.charAt(n);
          rgb[n] = parseInt(`${value}${value}`, 16) / 255;
        }
      } else {
        throw new Error(`Hex value "${lc}" not a valid sRGB color`);
      }
      return rgb;
    }

    // color functions
    const matches = strVal.match(COLOR_FN_RE);
    if (!matches) throw unparsable;
    let [, colorspace, valueStr] = matches;
    if (colorspace === 'color') {
      // if color() function, then split string by first occurrence of space
      const spaceI = valueStr.indexOf(' ');
      colorspace = valueStr.substring(0, spaceI);
      valueStr = valueStr.substring(spaceI);
    }
    switch (colorspace) {
      case 'rgb':
      case 'rgba':
      case 'srgb': {
        const [r, g, b, a] = parseValueStr(valueStr, [255, 255, 255, 1]);
        return [clamp(r, 0, 1), clamp(g, 0, 1), clamp(b, 0, 1), clamp(a, 0, 1)];
      }
      case 'linear-rgb':
      case 'linear-srgb':
      case 'rgb-linear':
      case 'srgb-linear': {
        const rgb = parseValueStr(valueStr);
        return linearRGBD65TosRGB(rgb);
      }
      case 'hsl':
      case 'hsla': {
        const [h, s, l, a] = parseValueStr(valueStr);
        return hslTosRGB([h, clamp(s, 0, 1), clamp(l, 0, 1), clamp(a, 0, 1)]);
      }
      case 'hwb':
      case 'hwba': {
        const [h, w, b, a] = parseValueStr(valueStr);
        return hwbTosRGB([h, clamp(w, 0, 1), clamp(b, 0, 1), clamp(a, 0, 1)]);
      }
      case 'p3':
      case 'display-p3': {
        const [r, g, b, a] = parseValueStr(valueStr);
        return [clamp(r, 0, 1), clamp(g, 0, 1), clamp(b, 0, 1), clamp(a, 0, 1)];
      }
      // case 'luv': {
      //   const luv = parseValueStr(valueStr);
      //   return luvTosRGB(luv);
      // }
      case 'oklab': {
        return oklabTosRGB(parseValueStr(valueStr));
      }
      case 'oklch': {
        return oklchTosRGB(parseValueStr(valueStr));
      }
      case 'xyz':
      case 'xyz-d65': {
        return linearRGBD65TosRGB(xyzToLinearRGBD65(parseValueStr(valueStr)));
      }
    }
  }

  if (typeof rawColor == 'object') {
    const c = { ...(rawColor as RGBObj | HSLObj | HWBObj | OklabObj | OklchObj | XYZObj) };
    let alpha = 1;
    // grab alpha, ensure keys are lowercase
    for (const k of Object.keys(c)) {
      if (k === 'alpha') {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        alpha = clamp(c[k]!, 0, 1);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (c as any)[k.toLowerCase()] = (c as any)[k];
      }
    }
    // RGB
    if ('r' in c && 'g' in c && 'b' in c) {
      return [
        clamp(c.r, 0, 1), // r
        clamp(c.g, 0, 1), // g
        clamp(c.b, 0, 1), // b
        alpha, // alpha
      ];
    }
    // HSL
    if ('h' in c && 's' in c && 'l' in c) return hslTosRGB([c.h, clamp(c.s, 0, 1), clamp(c.l, 0, 1), alpha]);
    // HWB
    if ('h' in c && 'w' in c && 'b' in c) return hwbTosRGB([c.h, clamp(c.w, 0, 1), clamp(c.b, 0, 1), alpha]);
    // Oklab
    if ('l' in c && 'a' in c && 'b' in c) return oklabTosRGB([c.l, c.a, c.b, alpha]);
    // Oklch
    if ('l' in c && 'c' in c && 'h' in c) return oklchTosRGB([c.l, c.c, c.h, alpha]);
    // XYZ
    if ('x' in c && 'y' in c && 'z' in c) return linearRGBD65TosRGB(xyzToLinearRGBD65([c.x, c.y, c.z, alpha]));
    // unknown object
    throw unparsable;
  }

  throw unparsable;
}

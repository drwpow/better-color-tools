import type { AdjustOptions } from './adjust.js';
import type { Color, HSL, HWB, LinearRGBD65, LMS, Oklab, Oklch, sRGB, XYZ } from './colorspace.js';

import adjust from './adjust.js';
import cssNames from './css-names.js';
import { linearRGBD65ToOklab, lmsToOklab, oklabToLinearRGBD65, oklabTosRGB, oklabToXYZ, sRGBToOklab, xyzToOklab } from './colorspace.js';
import { hexNumTosRGB, hslTosRGB, hwbTosRGB, labToLCH, lchToLAB, MiniCache, sRGBToHex, sRGBToHexNum } from './format.js';
import { clamp, colorFn } from './utils.js';

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
export function from(rawColor: Color): ColorOutput {
  const oklabVal = parse(rawColor);
  // mini-cache: don’t redo work already done
  const miniCache: MiniCache = {};

  function rgb(): string {
    if (!miniCache.rgbVal) miniCache.rgbVal = oklabTosRGB(oklabVal);
    if (!miniCache.rgb) miniCache.rgb = colorFn('rgb', [miniCache.rgbVal.r, miniCache.rgbVal.g, miniCache.rgbVal.b, miniCache.rgbVal.alpha ?? 1]);
    return miniCache.rgb;
  }
  function rgbVal(): sRGB {
    if (!miniCache.rgbVal) miniCache.rgbVal = oklabTosRGB(oklabVal);
    return miniCache.rgbVal;
  }

  const outputs = {
    /**
     * Hexadecimal CSS string
     * @example "#ff0000"
     */
    get hex(): string {
      if (!miniCache.rgbVal) miniCache.rgbVal = oklabTosRGB(oklabVal);
      return sRGBToHex(miniCache.rgbVal, miniCache);
    },
    /**
     * Hexadecimal number
     * @example 0xff0000
     */
    get hexVal(): number {
      if (!miniCache.rgbVal) miniCache.rgbVal = oklabTosRGB(oklabVal);
      return sRGBToHexNum(miniCache.rgbVal, miniCache);
    },
    /**
     * sRGB CSS string
     * @example "rgb(0, 128, 256)"
     */
    get rgb(): string {
      return rgb();
    },
    /**
     * (Alias of `rgb`)
     * sRGB CSS string
     * @example "rgb(0, 128, 256)"
     */
    get rgba(): string {
      return rgb();
    },
    /**
     * sRGB object
     * @example {r: 0.5, g: 0, b: 0, alpha: 1}
     */
    get rgbVal() {
      return rgbVal();
    },
    /**
     * (Alias of `rgbVal`)
     * sRGB object
     * @example {r: 0.5, g: 0, b: 0, alpha: 1}
     */
    get rgbaVal() {
      return rgbVal();
    },
    /**
     * Linear RGB CSS string
     * @example "color(srgb-linear 1 0 0)"
     */
    get linearRGB(): string {
      if (!miniCache.linearRGBVal) miniCache.linearRGBVal = oklabToLinearRGBD65(oklabVal);
      if (!miniCache.linearRGB) miniCache.linearRGB = colorFn('srgb-linear', [miniCache.linearRGBVal.r, miniCache.linearRGBVal.g, miniCache.linearRGBVal.b, miniCache.linearRGBVal.alpha ?? 1]);
      return miniCache.linearRGB;
    },
    /**
     * Linear RGB object
     * @example {r: number, g: number, b: number, alpha: number}
     */
    get linearRGBVal(): LinearRGBD65 {
      if (!miniCache.linearRGBVal) miniCache.linearRGBVal = oklabToLinearRGBD65(oklabVal);
      return miniCache.linearRGBVal;
    },
    /**
     * P3 CSS string
     * @example "color(display-p3 1 0 0)"
     */
    get p3(): string {
      if (!miniCache.rgbVal) miniCache.rgbVal = oklabTosRGB(oklabVal, false); // TODO: should P3 support HDR?
      if (!miniCache.p3) miniCache.p3 = colorFn('display-p3', [miniCache.rgbVal.r, miniCache.rgbVal.g, miniCache.rgbVal.b, miniCache.rgbVal.alpha ?? 1]);
      return miniCache.p3;
    },
    /**
     * (Alias of `rgbVal`)
     * sRGB object
     * @example {r: 0.5, g: 0, b: 0, alpha: 1}
     */
    get p3Val(): sRGB {
      return rgbVal();
    },
    /**
     * Oklab CSS string
     * @example "color(oklab 62.7955% 0.224863 0.125846)"
     */
    get oklab(): string {
      if (!miniCache.oklab) miniCache.oklab = colorFn('oklab', [oklabVal.l, oklabVal.a, oklabVal.b, oklabVal.alpha ?? 1]);
      return miniCache.oklab;
    },
    /**
     * OKLAB object
     * @example {l: 0.627955, a: 0.224863, b: 0.125846, alpha: 1}
     */
    get oklabVal(): Oklab {
      return oklabVal;
    },
    /**
     * OKLCH CSS string
     * @example "color(oklch 62.7955% 0.257683 29.233885)"
     */
    get oklch(): string {
      if (!miniCache.oklchVal) miniCache.oklchVal = labToLCH(oklabVal);
      if (!miniCache.oklch) miniCache.oklch = colorFn('oklch', [miniCache.oklchVal!.l, miniCache.oklchVal!.c, miniCache.oklchVal!.h, miniCache.oklchVal!.alpha ?? 1]);
      return miniCache.oklch;
    },
    /**
     * OKLCH object
     * @examaple {l: 0.627955, c: 0.257683, h: 29.233885, alpha: 1}
     */
    get oklchVal(): Oklch {
      if (!miniCache.oklchVal) miniCache.oklchVal = labToLCH(oklabVal);
      return miniCache.oklchVal;
    },
    /**
     * XYZ CSS string
     * @example "color(xyz 0.4124564 0.2126729 0.0193339)"
     */
    get xyz(): string {
      if (!miniCache.xyzVal) miniCache.xyzVal = oklabToXYZ(oklabVal);
      if (!miniCache.xyz) miniCache.xyz = colorFn('xyz-d65', [miniCache.xyzVal.x, miniCache.xyzVal.y, miniCache.xyzVal.z, miniCache.xyzVal.alpha ?? 1]);
      return miniCache.xyz;
    },
    /**
     * XYZ object
     * @example {x: 0.4124564, y: 0.2126729, z: 0.0193339}
     */
    get xyzVal(): XYZ {
      if (!miniCache.xyzVal) miniCache.xyzVal = oklabToXYZ(oklabVal);
      return miniCache.xyzVal;
    },
    /**
     * Adjust a color through Oklch by lightness, chroma, and/or hue.
     * (optional) specify `mode: "relative"` or `mode: "absolute"`
     */
    adjust(options: AdjustOptions): ColorOutput {
      return from(adjust(labToLCH(oklabVal), options));
    },
  };

  // JS helper
  outputs.toString = (): string => outputs.oklab;

  return outputs;
}

/** only grabs numbers from a color string (ignores spaces, commas, slashes, etc.) */
function parseValueStr(colorStr: string, normalize?: number[]): [number, number, number, number] {
  const matches = colorStr.match(FLOAT_RE);
  if (!matches) throw new Error(`Unexpected color format: ${colorStr}`);
  const values: [number, number, number, number] = [0, 0, 0, 1]; // always start alpha at 1 unless overridden
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

/** Convert any number of user inputs into Oklab color */
export function parse(rawColor: Color): Oklab {
  const unparsable = new Error(`Unable to parse color ${JSON.stringify(rawColor)}`);

  if (rawColor == undefined || rawColor == null || typeof rawColor === 'boolean') throw unparsable;

  // [R, G, B] or [R, G, B, A]
  if (Array.isArray(rawColor)) {
    if (rawColor.length < 3 || rawColor.length > 4) throw new Error(`Expected [R, G, B, A?], received ${rawColor}`);
    const [r, g, b, a] = rawColor;
    if (typeof r !== 'number' || typeof g !== 'number' || typeof b !== 'number' || (typeof a !== 'undefined' && typeof a !== 'number')) throw new Error(`Color array must be numbers, received ${rawColor}`);
    const srgb: sRGB = { r: clamp(r, 0, 1), g: clamp(g, 0, 1), b: clamp(b, 0, 1), alpha: typeof a === 'number' ? clamp(a, 0, 1) : 1 };
    return sRGBToOklab(srgb);
  }

  // 0xff0000 (number)
  // !note: doesn’t support alpha
  if (typeof rawColor == 'number') {
    return sRGBToOklab(hexNumTosRGB(rawColor));
  }

  // '#ff0000' / 'red' / 'rgb(255, 0, 0)' / 'hsl(0, 1, 1)'
  if (typeof rawColor == 'string') {
    const strVal = rawColor.trim();
    if (!strVal) throw new Error(`Expected color, received empty string`);

    // named color
    const lc = strVal.toLowerCase();
    if (typeof cssNames[lc] === 'number') {
      return sRGBToOklab(hexNumTosRGB(cssNames[lc]));
    }

    // hex
    if (HEX_RE.test(lc)) {
      const hex = lc.replace('#', '');
      const rgb: [number, number, number, number] = [0, 0, 0, 1];
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
      return sRGBToOklab({ r: rgb[0], g: rgb[1], b: rgb[2], alpha: rgb[3] });
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
        const [r, g, b, alpha] = parseValueStr(valueStr, [255, 255, 255, 1]);
        return sRGBToOklab({ r: clamp(r, 0, 1), g: clamp(g, 0, 1), b: clamp(b, 0, 1), alpha: clamp(alpha, 0, 1) });
      }
      case 'linear-rgb':
      case 'linear-srgb':
      case 'rgb-linear':
      case 'srgb-linear': {
        const [r, g, b, alpha] = parseValueStr(valueStr);
        return linearRGBD65ToOklab({ r, g, b, alpha });
      }
      case 'hsl':
      case 'hsla': {
        const [h, s, l, alpha] = parseValueStr(valueStr);
        return sRGBToOklab(hslTosRGB({ h: h, s: clamp(s, 0, 1), l: clamp(l, 0, 1), alpha: clamp(alpha, 0, 1) }));
      }
      case 'hwb':
      case 'hwba': {
        const [h, w, b, alpha] = parseValueStr(valueStr);
        return sRGBToOklab(hwbTosRGB({ h: h, w: clamp(w, 0, 1), b: clamp(b, 0, 1), alpha: clamp(alpha, 0, 1) }));
      }
      case 'p3':
      case 'display-p3': {
        const [r, g, b, alpha] = parseValueStr(valueStr);
        return sRGBToOklab({ r: clamp(r, 0, 2), g: clamp(g, 0, 2), b: clamp(b, 0, 2), alpha: clamp(alpha, 0, 1) }); // note: clamp, but allow 2x for HDR
      }
      case 'lab':
      case 'oklab': {
        const [l, a, b, alpha] = parseValueStr(valueStr);
        return { l, a, b, alpha };
      }
      case 'lch':
      case 'oklch': {
        const [l, c, h, alpha] = parseValueStr(valueStr);
        return lchToLAB({ l, c, h, alpha });
      }
      case 'xyz':
      case 'xyz-d65': {
        const [x, y, z, alpha] = parseValueStr(valueStr);
        return xyzToOklab({ x, y, z, alpha });
      }
    }
  }

  if (typeof rawColor == 'object') {
    const c = { ...(rawColor as sRGB | HSL | HWB | LMS | Oklab | Oklch | XYZ) };
    let alpha = 1;
    // grab alpha, ensure keys are lowercase
    for (const k of Object.keys(c)) {
      if (k === 'alpha') {
        alpha = clamp(c[k]!, 0, 1);
      } else {
        (c as any)[k.toLowerCase()] = (c as any)[k];
      }
    }
    // RGB
    if ('r' in c && 'g' in c && 'b' in c) return sRGBToOklab({ r: clamp(c.r, 0, 1), g: clamp(c.g, 0, 1), b: clamp(c.b, 0, 1), alpha });
    // HSL
    if ('h' in c) {
      if ('s' in c && 'l' in c) return sRGBToOklab(hslTosRGB({ h: c.h, s: clamp(c.s, 0, 1), l: clamp(c.l, 0, 1), alpha }));
      // HWB
      if ('w' in c && 'b' in c) return sRGBToOklab(hwbTosRGB({ h: c.h, w: clamp(c.w, 0, 1), b: clamp(c.b, 0, 1), alpha }));
    }
    if ('l' in c) {
      // Oklab
      if ('a' in c && 'b' in c) return { l: c.l, a: c.a, b: c.b, alpha };
      // Oklch
      if ('c' in c && 'h' in c) return lchToLAB({ l: c.l, c: c.c, h: c.h, alpha });
      // LMS
      if ('m' in c && 's' in c) return lmsToOklab({ l: c.l, m: c.m, s: c.s, alpha });
    }
    // XYZ
    if ('x' in c && 'y' in c && 'z' in c) return xyzToOklab({ x: c.x, y: c.y, z: c.z, alpha });
    // unknown object
    throw unparsable;
  }

  throw unparsable;
}

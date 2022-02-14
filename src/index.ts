export type { LMS } from './lms';
export type { sRGB, LRGB } from './rgb';
export type { Oklab } from './oklab';
export type { Oklch } from './oklch';

import type { LMS } from './lms.js';
import type { Oklab } from './oklab.js';
import type { Oklch } from './oklch.js';

export type Color = string | number | sRGB | LRGB | LMS | Oklab | Oklch;
export interface ColorOutput {
  hex: string;
  rgb: string;
  rgba: string;
  hexVal: number;
  rgbVal: sRGB;
  rgbaVal: sRGB;
  linearRGB: LRGB;
  p3: string;
  oklab: string;
  oklabVal: Oklab;
  oklch: string;
  oklchVal: Oklch;
}
export type GradientStop = { color: sRGB; position: number };
export type MixColorSpace = 'oklch' | 'oklab' | 'linearRGB' | 'sRGB';

import NP from 'number-precision';
import cssNames from './css-names.js';
import { clamp, leftPad } from './utils.js';
import { hslTosRGB } from './hsl.js';
import { labToLCH } from './lab.js';
import { lchToLAB } from './lch.js';
import { LMSToLRGB, LMSToOklab } from './lms.js';
import { LRGB, LRGBTosRGB, LRGBToLMS, sRGB, sRGBToLRGB } from './rgb.js';
import { OklabToLMS } from './oklab.js';

NP.enableBoundaryChecking(false); // don’t throw error on inaccurate calculation

// internal constants
const P = 5; // standard precision: 16-bit
export const HEX_RE = /^#?[0-9a-f]{3,8}$/i;
export const LIN_GRAD_RE = /^linear-gradient\s*\((.*)\);?$/;
export const RAD_GRAD_RE = /^radial-gradient\s*\((.*)\);?$/;
export const CON_GRAD_RE = /^conic-gradient\s*\((.*)\);?$/;
const { round } = NP;

/** compose a color function */
export function colorFn(space: 'string', values: number[]): string {
  return `color(${space} ${values[0]} ${values[1]} ${values[2]}${values[3] !== 1 ? `/${values[3]}` : ''})`;
}

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

  return {
    get hex(): string {
      return `#${color
        .map((v, n) => {
          if (n < 3) return leftPad(round(v * 255, 0).toString(16), 2);
          return v < 1 ? round(v * 255, 0).toString(16) : '';
        })
        .join('')}`;
    },
    get hexVal(): number {
      const hex = color.map((v, n) => {
        if (n < 3) return leftPad(round(v * 255, 0).toString(16), 2);
        return v < 1 ? leftPad((v * 256).toString(16), 2) : '';
      });
      return parseInt(`0x${hex.join('')}`, 16);
    },
    get rgb(): string {
      if (color[3] == 1) {
        return `rgb(${round(color[0] * 255, 0)}, ${round(color[1] * 255, 0)}, ${round(color[2] * 255, 0)})`;
      } else {
        return `rgba(${round(color[0] * 255, 0)}, ${round(color[1] * 255, 0)}, ${round(color[2] * 255, 0)}, ${round(color[3], P)})`;
      }
    },
    rgbVal: color,
    get rgba(): string {
      return `rgba(${round(color[0] * 255, 0)}, ${round(color[1] * 255, 0)}, ${round(color[2] * 255, 0)}, ${round(color[3], P)})`;
    },
    rgbaVal: color,
    get linearRGB(): sRGB {
      return sRGBToLRGB(color);
    },
    get p3(): string {
      const [r, g, b, a] = color;
      return `color(display-p3 ${round(r, P)} ${round(g, P)} ${round(b, P)}${a < 1 ? `/${round(a, P)}` : ''})`;
    },
    get oklab(): string {
      const lrgb = sRGBToLRGB(color);
      const lms = LRGBToLMS(lrgb);
      const [l, a, b, alpha] = LMSToOklab(lms);
      return `color(oklab ${round(l, P)} ${round(a, P)} ${round(b, P)}${alpha < 1 ? `/${round(alpha, P)}` : ''})`;
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
      return `color(oklch ${round(l, P)} ${round(c, P)} ${round(h, P)}${alpha < 1 ? `/${round(alpha, P)}` : ''})`;
    },
    get oklchVal(): Oklch {
      const lrgb = sRGBToLRGB(color);
      const lms = LRGBToLMS(lrgb);
      const oklab = LMSToOklab(lms);
      const lch = labToLCH(oklab);
      return lch;
    },
  };
}

/**
 * Mix colors with gamma correction
 * @param {Color}  color1
 * @param {Color}  color2
 * @param {number} weight
 * @param {number} gamma {default: 2.2}
 * https://observablehq.com/@sebastien/srgb-rgb-gamma
 */
export function mix(color1: Color, color2: Color, weight = 0.5, colorSpace: MixColorSpace = 'oklch'): ColorOutput {
  const w = clamp(weight, 0, 1);

  // save calc if possible
  if (weight === 0) return from(color1);
  else if (weight === 1) return from(color2);

  const w1 = 1 - w;
  const w2 = w;
  const converters: Record<MixColorSpace, ((color: sRGB) => sRGB)[]> = {
    oklch: [sRGBToLRGB, LRGBToLMS, LMSToOklab, labToLCH],
    oklab: [sRGBToLRGB, LRGBToLMS, LMSToOklab],
    linearRGB: [sRGBToLRGB],
    sRGB: [],
  };
  // conversions aren’t invertible!
  const deconverters: Record<MixColorSpace, ((color: sRGB) => sRGB)[]> = {
    oklch: [lchToLAB, OklabToLMS, LMSToLRGB, LRGBTosRGB],
    oklab: [OklabToLMS, LMSToLRGB, LRGBTosRGB],
    linearRGB: [LRGBTosRGB],
    sRGB: [],
  };
  const converter = converters[colorSpace];
  const deconverter = deconverters[colorSpace];
  if (!converter) throw new Error(`Unknown color space "${colorSpace}", try "oklch", "oklab", "linearRGB", or "sRGB"`);

  // convert color into mix colorspace
  const [x1, y1, z1, a1] = converter.reduce((c, next) => next(c), from(color1).rgbVal);
  const [x2, y2, z2, a2] = converter.reduce((c, next) => next(c), from(color2).rgbVal);
  // find euclidean distance
  const newColor: sRGB = [
    x1 * w1 + x2 * w2, // x
    y1 * w1 + y2 * w2, // y
    z1 * w1 + z2 * w2, // z
    a1 * w1 + a2 * w2, // alpha
  ];
  // convert back to sRGB for final value
  return from(deconverter.reduce((c, next) => next(c), newColor));
}

/** Convert any number of user inputs into RGBA array */
export function parse(rawColor: Color): sRGB {
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

  function parseValueStr(colorStr: string, normalize: number[]): [number, number, number, number] {
    let values: number[] = [];
    let lastVal = '';
    for (let i = 0; i < colorStr.length; i++) {
      const c = colorStr.charAt(i);
      switch (c) {
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
        case '.': {
          lastVal += c;
          break;
        }
        case '%': {
          if (!lastVal) throw new Error(`Unexpected color format: ${colorStr}`);
          values.push(clamp(parseFloat(lastVal) / 100, 0, 1));
          lastVal = '';
          break;
        }
        default: {
          if (lastVal) {
            let val = parseFloat(lastVal);
            lastVal = '';
            if (normalize[values.length] === Infinity) {
              values.push(val);
              break;
            }
            if (values.length === 3) {
              values.push(clamp(val, 0, 1));
              break;
            }
            values.push(val / normalize[values.length]);
          }
          break;
        }
      }
    }
    return values as any;
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
 * Darken
 * Mix color with black
 * @param {Color} color Starting color
 * @param {number} value 1 = make fully black, 0 = original color, -1 = make fully white,
 *
 */
export function darken(color: Color, value: number): ColorOutput {
  const amt = clamp(value, -1, 1);
  if (amt === 0) return from(color);
  if (amt === 1) return from('black');
  if (amt >= 0) {
    const [l, a, b, alpha] = from(color).oklabVal;
    const l2 = l - l * value; // to lighten, create a Luv color with darkness increased by [value]
    return from(`color(oklab ${l2} ${a} ${b}/${alpha})`);
  } else {
    return lighten(color, -amt);
  }
}

/**
 * Lighten
 * Mix color with white
 * @param {Color} color Starting color
 * @param {number} value 1 = make fully white, 0 = original color, -1 = make fully black
 *
 */
export function lighten(color: Color, value: number): ColorOutput {
  const amt = clamp(value, -1, 1);
  if (amt === 0) return from(color);
  if (amt === 1) return from('white');
  if (amt >= 0) {
    const [l, a, b, alpha] = from(color).oklabVal;
    const l2 = l + l * value; // to lighten, create a Luv color with lightness increased by [value]
    return from(`color(oklab ${l2} ${a} ${b}/${alpha})`);
  } else {
    return darken(color, -amt);
  }
}

/**
 * Lightness
 * Shortcut of "L” from oklab
 */
export function lightness(color: Color): number {
  return NP.round(from(color).oklabVal[0], 5); // l == lightness
}

/**
 * Parse CSS gradient
 * Parse any valid CSS gradient and convert to stops
 */
export function parseGradient(input: string): { type: 'linear-gradient' | 'radial-gradient' | 'conic-gradient'; position?: string; stops: GradientStop[] } {
  const gradString = input.trim();
  let gradType: 'linear-gradient' | 'radial-gradient' | 'conic-gradient' = 'linear-gradient';
  let position: string | undefined;
  let rawStops: string[] = [];
  if (LIN_GRAD_RE.test(gradString)) {
    rawStops = (gradString.match(LIN_GRAD_RE) as RegExpMatchArray)[1].split(',').map((p) => p.trim());
    if (rawStops[0].includes('deg') || rawStops[0].includes('turn') || rawStops[0].includes('to ')) {
      position = rawStops.shift();
    }
  } else if (RAD_GRAD_RE.test(gradString)) {
    gradType = 'radial-gradient';
    rawStops = (gradString.match(RAD_GRAD_RE) as RegExpMatchArray)[1].split(',').map((p) => p.trim());
    if (rawStops[0].includes('circle') || rawStops[0].includes('ellipse') || rawStops[0].includes('closest-') || rawStops[0].includes('farthest-')) {
      position = rawStops.shift();
    }
  } else if (CON_GRAD_RE.test(gradString)) {
    gradType = 'conic-gradient';
    rawStops = (gradString.match(CON_GRAD_RE) as RegExpMatchArray)[1].split(',').map((p) => p.trim());
    if (rawStops[0].includes('from')) {
      position = rawStops.shift();
    }
  } else throw new Error(`Unable to parse gradient "${input}"`);
  if (rawStops.length < 2) {
    throw new Error('Gradient must have at least 2 stops');
  }
  let unitCount = 0;
  for (const unit of ['%', 'px', 'em', 'rem', 'pt', 'ch', 'cm', 'in', 'mm', 'vh', 'vm']) {
    if (gradString.includes(unit)) unitCount += 1;
  }
  if (unitCount > 1) throw new Error(`Can’t normalize gradients with mixed units`);

  const stops: GradientStop[] = [];

  const rawPositions = rawStops.map((s) => parseFloat(s.substring(s.indexOf(' '))) || -Infinity);
  const max = Math.max(...rawPositions);

  for (let n = 0; n < rawStops.length; n++) {
    // color is easy
    stops[n].color = from(rawStops[n].split(' ')[0]).rgbVal;

    // position is not (if omitted, we’ll have to figure out averages)
    if (rawPositions[n] >= 0) {
      stops[n].position = Math.min(rawPositions[n] / max, 1);
      continue;
    } else if (n === 0) {
      stops[n].position = 0;
      continue;
    } else if (n === rawStops.length - 1) {
      stops[n].position = 1;
    }
    let startPosition = stops[n - 1].position;
    let endPosition = rawStops.findIndex((s) => parseFloat(s.substring(s.indexOf(' '))) > 0);
    if (endPosition === -1) endPosition = rawStops.length - 1;
    stops[n].position = (endPosition - startPosition) / endPosition;
  }

  return {
    type: gradType,
    position,
    stops,
  };
}

export default {
  darken,
  from,
  lighten,
  lightness,
  mix,
  parse,
};

import NP from 'number-precision';
import cssNames from './css-names.js';
import { clamp, leftPad } from './utils.js';

export type RGB = [number, number, number];
export type RGBA = [number, number, number, number];
export type HSL = [number, number, number, number];
export type P3 = [number, number, number, number];
export type Color = string | number | RGB | RGBA;
export type ColorOutput = {
  hex: string;
  rgb: string;
  rgba: string;
  hexVal: number;
  rgbVal: RGBA;
  rgbaVal: RGBA;
  hsl: string;
  hslVal: RGBA;
  p3: string;
};

NP.enableBoundaryChecking(false); // don’t throw error on inaccurate calculation

const P = 5; // standard precision: 16-bit
const COMMA = '(\\s*,\\s*|\\s+)';
const FLOAT = '-?[0-9]+(\\.[0-9]+)?';
export const HEX_RE = /^#?[0-9a-f]{3,8}$/i;
export const RGB_RE = new RegExp(`^rgba?\\(\\s*(?<R>${FLOAT})${COMMA}(?<G>${FLOAT})${COMMA}(?<B>${FLOAT})(${COMMA}(?<A>${FLOAT}))?\\s*\\)$`, 'i');
export const HSL_RE = new RegExp(`^hsla?\\(\\s*(?<H>${FLOAT})${COMMA}(?<S>${FLOAT})%${COMMA}(?<L>${FLOAT})%(${COMMA}(?<A>${FLOAT}))?\\s*\\)$`, 'i');
export const P3_RE = new RegExp(`^color\\(\\s*display-p3\\s+(?<R>${FLOAT})\\s+(?<G>${FLOAT})\\s+(?<B>${FLOAT})(\\s*\\/\\s*(?<A>${FLOAT}))?\\s*\\)$`, 'i');
const { minus, round, strip, times } = NP;

/**
 * Parse any valid CSS color color string and convert to:
 * - hex:     '#ff0000'
 * - hexVal:  0xff0000
 * - rgb:     'rgb(255, 0, 0)'
 * - rgbVal:  [255, 0, 0, 1]
 * - rgba:    'rgba(255, 0, 0, 1)'
 * - rgbaVal: [255, 0, 0, 1] // alias of rgbVal
 * - hslVal:  [0, 1, 1, 1]   // 0% = 0, 100% = 1
 * - p3:      'color(display-p3 1 0 0)'
 */
export function from(rawColor: Color): ColorOutput {
  const color = parse(rawColor);

  return {
    get hex(): string {
      return `#${color
        .map((v, n) => {
          if (n < 3) return leftPad(round(v, 0).toString(16), 2);
          return v < 1 ? round(times(255, v), 0).toString(16) : '';
        })
        .join('')}`;
    },
    get hexVal(): number {
      const hex = color.map((v, n) => {
        if (n < 3) return leftPad(round(v, 0).toString(16), 2);
        return v < 1 ? leftPad(times(256, v).toString(16), 2) : '';
      });
      return parseInt(`0x${hex.join('')}`, 16);
    },
    get rgb(): string {
      if (color[3] == 1) {
        return `rgb(${round(color[0], 0)}, ${round(color[1], 0)}, ${round(color[2], 0)})`;
      } else {
        return `rgba(${round(color[0], 0)}, ${round(color[1], 0)}, ${round(color[2], 0)}, ${round(color[3], P)})`;
      }
    },
    rgbVal: color,
    get rgba(): string {
      return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`;
    },
    rgbaVal: color,
    get hsl(): string {
      const [h, s, l, a] = rgbToHSL(color);
      return `hsl(${h}, ${strip(s * 100)}%, ${strip(l * 100)}%, ${round(a, P)})`;
    },
    get hslVal(): RGBA {
      return rgbToHSL(color);
    },
    get p3(): string {
      const [r, g, b, a] = color;
      return `color(display-p3 ${round(r / 255, P)} ${round(g / 255, P)} ${round(b / 255, P)}${a < 1 ? `/${round(a, P)}` : ''})`;
    },
  };
}

/**
 * Mix colors using more-correct equation
 * @param {Color}  color1
 * @param {Color}  color2
 * @param {number} weight
 * Explanation: https://www.youtube.com/watch?v=LKnqECcg6Gw
 */
export function mix(color1: Color, color2: Color, weight = 0.5): RGBA {
  const w = clamp(weight, 0, 1);
  const w1 = minus(1, w);
  const w2 = w;
  const [r1, g1, b1, a1] = from(color1).rgbVal;
  const [r2, g2, b2, a2] = from(color2).rgbVal;
  return [round(r1 ** 2 * w1 + r2 ** 2 * w2, 0), round(g1 ** 2 * w1 + g2 ** 2 * w2, 0), round(b1 ** 2 * w1 + b2 ** 2 * w2, 0), round(a1 * w1 + a2 * w2, 0)];
}

/** Convert any number of user inputs into RGBA array */
export function parse(rawColor: Color): RGBA {
  /** Convert 0xff0000 to RGBA array */
  function parseHexVal(hexVal: number): RGBA {
    const hexStr = leftPad(clamp(hexVal, 0, 0xffffffff).toString(16), 6); // note: 0x000001 will convert to '1'
    return [
      parseInt(hexStr.substring(0, 2), 16), // r
      parseInt(hexStr.substring(2, 4), 16), // g
      parseInt(hexStr.substring(4, 6), 16), // b
      round(parseInt(hexStr.substring(6, 8) || 'ff', 16) / 255, P), // a
    ];
  }

  // [R, G, B] or [R, G, B, A]
  if (Array.isArray(rawColor)) {
    if (rawColor.some((val) => typeof val != 'number')) throw new Error(`Color array must be numbers, received ${rawColor}`);
    if (rawColor.length < 3 || rawColor.length > 4) throw new Error(`Expected [R, G, B, A?], received ${rawColor}`);
    // create new array & copy values
    const color: RGBA = [0, 0, 0, 1]; // note: alpha defaults to 1
    for (let n = 0; n < rawColor.length; n++) {
      const v = rawColor[n];
      color[n] = clamp(v, 0, n == 3 ? 1 : 255);
    }
    return color;
  }

  // 0xff0000 (number)
  if (typeof rawColor == 'number') {
    const color = parseHexVal(rawColor);
    return color;
  }

  // '#ff0000' / 'red' / 'rgb(255, 0, 0)' / 'hsl(0, 1, 1)'
  if (typeof rawColor == 'string') {
    const strVal = rawColor.trim();
    if (!strVal) throw new Error(`Expected color, received empty string`);

    // named color
    if (cssNames[strVal as keyof typeof cssNames]) {
      const color = parseHexVal(cssNames[strVal as keyof typeof cssNames] as number);
      return color;
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
      const color = parseHexVal(hexNum);
      return color;
    }
    // rgb
    if (RGB_RE.test(strVal)) {
      const v: Record<string, string> = (RGB_RE.exec(strVal) as any).groups || {};
      const color: RGBA = [clamp(parseFloat(v.R), 0, 255), clamp(parseFloat(v.G), 0, 255), clamp(parseFloat(v.B), 0, 255), v.A ? clamp(parseFloat(v.A), 0, 1) : 1];
      return color;
    }
    // hsl
    if (HSL_RE.test(strVal)) {
      const hsl: HSL = [0, 0, 0, 1];
      const v: Record<string, string> = (HSL_RE.exec(strVal) as any).groups || {};
      hsl[0] = parseFloat(v.H);
      const isPerc = strVal.includes('%');
      let sVal = parseFloat(v.S);
      let lVal = parseFloat(v.L);
      if (isPerc) sVal /= 100;
      if (isPerc) lVal /= 100;
      hsl[1] = clamp(sVal, 0, 1);
      hsl[2] = clamp(lVal, 0, 1);
      hsl[3] = v.A ? parseFloat(v.A) : 1;
      const color = hslToRGB(hsl);
      return color;
    }
    // p3
    if (P3_RE.test(strVal)) {
      const v: Record<string, string> = (P3_RE.exec(strVal) as any).groups || {};
      return [times(clamp(parseFloat(v.R), 0, 1), 255), times(clamp(parseFloat(v.G), 0, 1), 255), times(clamp(parseFloat(v.B), 0, 1), 255), v.A ? clamp(parseFloat(v.A), 0, 1) : 1];
    }
  }

  throw new Error(`Unable to parse color "${rawColor}"`);
}

/**
 * Alpha
 * Manipulate alpha value
 * @param {Color} color Starting color
 * @param {number} value float between 0 and 1
 */
export function alpha(rawColor: Color, value: number): RGBA {
  if (!(value >= 0 && value <= 1)) throw new Error(`Alpha must be between 0 and 1, received ${alpha}`);
  const c = parse(rawColor);
  return [c[0], c[1], c[2], value];
}

/**
 * Darken
 * Mix color with black
 * @param {Color} color Starting color
 * @param {number} value 1 = make fully black, 0 = original color, -1 = make fully white,
 *
 */
export function darken(color: Color, value: number): RGBA {
  if (!(value >= -1 && value <= 1)) throw new Error(`Value must be between -1 and 1, received ${value}`);
  if (value >= 0) {
    return mix(color, [0, 0, 0, 1], value);
  } else {
    return lighten(color, -value);
  }
}

/**
 * Lighten
 * Mix color with white
 * @param {Color} color Starting color
 * @param {number} value 1 = make fully white, 0 = original color, -1 = make fully black
 *
 */
export function lighten(color: Color, value: number): RGBA {
  if (!(value >= -1 && value <= 1)) throw new Error(`Value must be between -1 and 1, received ${value}`);
  if (value >= 0) {
    return mix(color, [255, 255, 255, 1], value);
  } else {
    return darken(color, -value);
  }
}

/**
 * HSL to RGB
 * Convert RGBA array to HSL
 */
export function hslToRGB(hsl: HSL): RGBA {
  let [H, S, L, A] = hsl;
  H = Math.abs(H % 360); // allow < 0 and > 360

  const C = S * (1 - Math.abs(2 * L - 1));
  const X = C * (1 - Math.abs(((H / 60) % 2) - 1));

  let R = 0;
  let G = 0;
  let B = 0;

  if (0 <= H && H < 60) {
    R = C;
    G = X;
  } else if (60 <= H && H < 120) {
    R = X;
    G = C;
  } else if (120 <= H && H < 180) {
    G = C;
    B = X;
  } else if (180 <= H && H < 240) {
    G = X;
    B = C;
  } else if (240 <= H && H < 300) {
    R = X;
    B = C;
  } else if (300 <= H && H < 360) {
    R = C;
    B = X;
  }
  const m = L - C / 2;

  return [round((R + m) * 255, P), round((G + m) * 255, P), round((B + m) * 255, P), round(A, P)];
}

/**
 * HSL to RGB
 * Convert HSLA array to RGBA
 */
export function rgbToHSL(rgb: RGBA): HSL {
  const [R, G, B, A] = rgb;

  const M = Math.max(R, G, B); // max
  const m = Math.min(R, G, B); // min

  // initial H, S, L
  let H = 0;
  let S = 0;
  let L = (M + m) / 2; // default: standard HSL (“fill”) calculation

  // if white/black/gray, exit early
  if (M == m) return [H, S, NP.round(L / 255, 4), A];

  // if any other color, calculate hue & saturation
  const C = M - m;

  // Hue
  if (C != 0) {
    switch (M) {
      case R:
        H = (60 * (G - B)) / C;
        break;
      case G:
        H = 60 * (2 + (B - R) / C);
        break;
      case B:
        H = 60 * (4 + (R - G) / C);
        break;
    }
    while (H < 0) {
      H += 360;
    }
  }

  // Saturation
  if (L != 0 && L != 1) {
    S = (M - L) / Math.min(L, 255 - L);
  }

  return [round(H, P - 2), round(S, P), round(L / 255, P), A];
}

export default {
  alpha,
  darken,
  from,
  hslToRGB,
  lighten,
  mix,
  parse,
  rgbToHSL,
};

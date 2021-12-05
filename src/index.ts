import NP from 'number-precision';
import cssNames from './css-names.js';
import { leftPad } from './utils.js';

export type RGB = [number, number, number];
export type RGBA = [number, number, number, number];
export type HSL = [number, number, number, number];
export type Color = string | number | RGB | RGBA;
export type ColorOutput = { hex: string; rgb: string; rgba: string; hexVal: number; rgbVal: RGBA; rgbaVal: RGBA; hsl: string; hslVal: RGBA };

NP.enableBoundaryChecking(false); // don’t throw error on inaccurate calculation

/**
 * Parse any valid CSS color color string and convert to:
 * - hex:     '#ff0000'
 * - hexVal:  0xff0000
 * - rgb:     'rgb(255, 0, 0)'
 * - rgbVal:  [255, 0, 0, 1]
 * - rgba:    'rgba(255, 0, 0, 1)'
 * - rgbaVal: [255, 0, 0, 1] // alias of rgbVal
 * - hslVal:  [0, 1, 1, 1]   // 0% = 0, 100% = 1
 */
export function from(rawColor: Color): ColorOutput {
  const color = parse(rawColor);

  return {
    get hex(): string {
      return `#${color
        .map((v, n) => {
          if (n < 3) return leftPad(v.toString(16), 2);
          return v < 1 ? NP.round(255 * v, 0).toString(16) : '';
        })
        .join('')}`;
    },
    get hexVal(): number {
      const hex = color.map((v, n) => {
        if (n < 3) return leftPad(v.toString(16), 2);
        return v < 1 ? leftPad((256 * v).toString(16), 2) : '';
      });
      return parseInt(`0x${hex.join('')}`, 16);
    },
    get rgb(): string {
      if (color[3] == 1) {
        return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
      } else {
        return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`;
      }
    },
    rgbVal: color,
    get rgba(): string {
      return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`;
    },
    rgbaVal: color,
    get hsl(): string {
      const [h, s, l, a] = rgbToHSL(color);
      return `hsl(${h}, ${NP.strip(s * 100)}%, ${NP.strip(l * 100)}%, ${a})`;
    },
    get hslVal(): RGBA {
      return rgbToHSL(color);
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
  if (!(weight >= 0 && weight <= 1)) throw new Error(`Weight must be between 0 and 1, received ${weight}`);
  const w1 = 1 - weight;
  const w2 = weight;
  const [r1, g1, b1, a1] = from(color1).rgbVal;
  const [r2, g2, b2, a2] = from(color2).rgbVal;
  return [Math.round(r1 ** 2 * w1 + r2 ** 2 * w2), Math.round(g1 ** 2 * w1 + g2 ** 2 * w2), Math.round(b1 ** 2 * w1 + b2 ** 2 * w2), Math.round(a1 * w1 + a2 * w2)];
}

/** Convert any number of user inputs into RGBA array */
export function parse(rawColor: Color): RGBA {
  /** Convert 0xff0000 to RGBA array */
  function parseHexVal(hexVal: number): RGBA {
    if (hexVal < 0 || hexVal > 0xffffffff) throw new Error(`Expected color in hex range (0xff0000), received ${hexVal.toString(16) || hexVal}`);
    const hexStr = leftPad(hexVal.toString(16), 6); // note: 0x000001 will convert to '1'
    return [
      parseInt(hexStr.substring(0, 2), 16), // r
      parseInt(hexStr.substring(2, 4), 16), // g
      parseInt(hexStr.substring(4, 6), 16), // b
      parseInt(hexStr.substring(6, 8) || 'ff', 16) / 255, // a
    ];
  }

  /** Validate RGBA array */
  function validate(c: RGBA): RGBA {
    if (!(c[0] >= 0 && c[0] <= 255)) throw new Error(`${rawColor} Expected r to be between 0 and 255, received ${c[0]}`);
    if (!(c[1] >= 0 && c[1] <= 255)) throw new Error(`${rawColor} Expected g to be between 0 and 255, received ${c[1]}`);
    if (!(c[2] >= 0 && c[2] <= 255)) throw new Error(`${rawColor} Expected b to be between 0 and 255, received ${c[2]}`);
    if (!(c[3] >= 0 && c[3] <= 1)) throw new Error(`${rawColor} Expected alpha to be between 0 and 1, received ${c[3]}`);
    return c;
  }

  // [R, G, B] or [R, G, B, A]
  if (Array.isArray(rawColor)) {
    if (rawColor.some((val) => typeof val != 'number')) throw new Error(`Color array must be numbers, received ${rawColor}`);
    if (rawColor.length < 3 || rawColor.length > 4) throw new Error(`Expected [R, G, B, A?], received ${rawColor}`);
    // create new array & copy values
    const color: RGBA = [0, 0, 0, 1]; // note: alpha defaults to 1
    for (let n = 0; n < rawColor.length; n++) {
      const v = rawColor[n];
      if (n == 3 && (v < 0 || v > 1)) throw new Error(`Alpha must be between 0 and 1, received ${v}`);
      else if (v < 0 || v > 255) throw new Error(`Color channel must be between 0 and 255, received ${v}`);
      color[n] = rawColor[n];
    }
    return validate(color);
  }

  // 0xff0000 (number)
  if (typeof rawColor == 'number') {
    const color = parseHexVal(rawColor);
    return validate(color);
  }

  // '#ff0000' / 'red' / 'rgb(255, 0, 0)' / 'hsl(0, 1, 1)'
  if (typeof rawColor == 'string') {
    const strVal = rawColor.trim();
    if (!strVal) throw new Error(`Expected color, received empty string`);

    // named color
    if (cssNames[strVal as keyof typeof cssNames]) {
      const color = parseHexVal(cssNames[strVal as keyof typeof cssNames] as number);
      return validate(color);
    }
    // hex
    const maybeHex = parseInt(strVal.replace(/^#/, ''), 16);
    if (!Number.isNaN(maybeHex)) {
      const color = parseHexVal(maybeHex);
      return validate(color);
    }
    // hsl
    if (strVal.toLocaleLowerCase().startsWith('hsl')) {
      const hsl: HSL = [0, 0, 0, 1];
      const values = strVal
        .replace(/hsl\s*\(/i, '')
        .replace(/\)\s*$/, '')
        .split(',');
      hsl[0] = parseFloat(values[0]);
      hsl[1] = values[1].includes('%') ? parseFloat(values[1]) / 100 : parseFloat(values[1]);
      hsl[2] = values[2].includes('%') ? parseFloat(values[2]) / 100 : parseFloat(values[2]);
      hsl[3] = parseFloat(values[3] || '1');
      const color = hslToRGB(hsl);
      return validate(color);
    }
    // rgb (and fallbacks)
    const rawStr = strVal.replace(/rgba?\s*\(/i, '').replace(/\)\s*$/, '');
    const values = rawStr.includes(',') ? rawStr.split(',').filter((v) => !!v.trim()) : rawStr.split(' ').filter((v) => !!v.trim());
    if (values.length != 3 && values.length != 4) throw new Error(`Unable to parse color "${rawColor}"`);
    const color: RGBA = [
      parseInt(values[0], 10), // r
      parseInt(values[1], 10), // g
      parseInt(values[2], 10), // b
      parseFloat((values[3] || '1').trim()), // a
    ];
    return validate(color);
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

  const C = (1 - Math.abs(2 * L - 1)) * S;
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

  return [Math.round((R + m) * 255), Math.round((G + m) * 255), Math.round((B + m) * 255), A];
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
  if (M == m) return [H, S, NP.round(L / 255, 3), A];

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

  return [NP.round(H, 3), NP.round(S, 3), NP.round(L / 255, 3), NP.round(A, 3)];
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

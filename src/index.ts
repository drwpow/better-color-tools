import NP from 'number-precision';
import cssNames from './css-names.js';
import { clamp, leftPad, splitDistance } from './utils.js';

export type RGB = [number, number, number];
export type RGBA = [number, number, number, number];
export type HSL = [number, number, number, number];
export type P3 = [number, number, number, number];
export type Color = string | number | RGB | RGBA | HSL | P3;
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
export const RGB_RE = new RegExp(['^rgba?\\(\\s*', `(?<R>${FLOAT}%?)`, COMMA, `(?<G>${FLOAT}%?)`, COMMA, `(?<B>${FLOAT}%?)`, `(${COMMA}(?<A>${FLOAT}%?))?`, '\\s*\\)$'].join(''), 'i');
export const HSL_RE = new RegExp(['^hsla?\\(\\s*', `(?<H>${FLOAT})`, COMMA, `(?<S>${FLOAT})%`, COMMA, `(?<L>${FLOAT})%`, `(${COMMA}(?<A>${FLOAT})%?)?`, '\\s*\\)$'].join(''), 'i');
export const P3_RE = new RegExp(['^color\\(\\s*display-p3\\s+', `(?<R>${FLOAT}%?)`, '\\s+', `(?<G>${FLOAT}%?)`, '\\s+', `(?<B>${FLOAT}%?)`, `(\\s*\\/\\s*(?<A>${FLOAT}%?))?`, '\\s*\\)$'].join(''), 'i');
export const LIN_GRAD_RE = /^linear-gradient\((.*)\);?$/;
export const RAD_GRAD_RE = /^radial-gradient\((.*)\);?$/;
export const CON_GRAD_RE = /^conic-gradient\((.*)\);?$/;
export const STOP_POS_RE = /\s[^\s]+$/;
const { round, strip } = NP;

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
    get hsl(): string {
      const [h, s, l, a] = rgbToHSL(color);
      return `hsl(${h}, ${strip(s * 100)}%, ${strip(l * 100)}%, ${round(a, P)})`;
    },
    get hslVal(): RGBA {
      return rgbToHSL(color);
    },
    get p3(): string {
      const [r, g, b, a] = color;
      return `color(display-p3 ${round(r, P)} ${round(g, P)} ${round(b, P)}${a < 1 ? `/${round(a, P)}` : ''})`;
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
export function mix(color1: Color, color2: Color, weight = 0.5, γ = 2.2): ColorOutput {
  const w = clamp(weight, 0, 1);
  const w1 = 1 - w;
  const w2 = w;
  const tf = 1 / γ; // transfer function (https://en.wikipedia.org/wiki/SRGB#Transfer_function_(%22gamma%22))
  const itf = γ; // inverse transfer function

  // expanded gamma
  const c1 = from(color1).rgbVal;
  const c2 = from(color2).rgbVal;
  const r1 = c1[0] ** itf;
  const g1 = c1[1] ** itf;
  const b1 = c1[2] ** itf;
  const a1 = c1[3];
  const r2 = c2[0] ** itf;
  const g2 = c2[1] ** itf;
  const b2 = c2[2] ** itf;
  const a2 = c2[3];

  return from([
    clamp((r1 ** itf * w1 + r2 ** itf * w2) ** tf, 0, 1), // r
    clamp((g1 ** itf * w1 + g2 ** itf * w2) ** tf, 0, 1), // g
    clamp((b1 ** itf * w1 + b2 ** itf * w2) ** tf, 0, 1), // b
    a1 * w1 + a2 * w2, // a
  ]);
}

/** Convert any number of user inputs into RGBA array */
export function parse(rawColor: Color): RGBA {
  /** Convert 0xff0000 to RGBA array */
  function parseHexVal(hexVal: number): RGBA {
    const hexStr = leftPad(clamp(hexVal, 0, 0xffffffff).toString(16), 6); // note: 0x000001 will convert to '1'
    return [
      parseInt(hexStr.substring(0, 2), 16) / 255, // r
      parseInt(hexStr.substring(2, 4), 16) / 255, // g
      parseInt(hexStr.substring(4, 6), 16) / 255, // b
      parseInt(hexStr.substring(6, 8) || 'ff', 16) / 255, // a
    ];
  }

  // [R, G, B] or [R, G, B, A]
  if (Array.isArray(rawColor)) {
    if (rawColor.some((val) => typeof val != 'number')) throw new Error(`Color array must be numbers, received ${rawColor}`);
    if (rawColor.length < 3 || rawColor.length > 4) throw new Error(`Expected [R, G, B, A?], received ${rawColor}`);
    return rawColor.map((v) => clamp(v, 0, 1)) as RGBA;
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
    // rgb
    if (RGB_RE.test(strVal)) {
      const v: Record<string, string> = (RGB_RE.exec(strVal) as any).groups || {};
      if (![v.R, v.G, v.B].every((c) => c.includes('%') || !c.includes('%'))) throw new Error('Mix of integers and %');
      let r = parseFloat(v.R) / (v.R.includes('%') ? 100 : 255);
      let g = parseFloat(v.G) / (v.G.includes('%') ? 100 : 255);
      let b = parseFloat(v.B) / (v.B.includes('%') ? 100 : 255);
      let a = 1;
      if (v.A) {
        a = parseFloat(v.A);
        if (v.A.includes('%')) a /= 100;
      }
      return [clamp(r, 0, 1), clamp(g, 0, 1), clamp(b, 0, 1), clamp(a, 0, 1)];
    }
    // hsl
    if (HSL_RE.test(strVal)) {
      const v: Record<string, string> = (HSL_RE.exec(strVal) as any).groups || {};
      let h = parseFloat(v.H);
      let s = parseFloat(v.S) / 100;
      let l = parseFloat(v.L) / 100;
      let a = 1;
      if (v.A) {
        a = parseFloat(v.A);
        if (v.A.includes('%')) a /= 100;
      }
      return hslToRGB([h, clamp(s, 0, 1), clamp(l, 0, 1), clamp(a, 0, 1)]);
    }
    // p3
    if (P3_RE.test(strVal)) {
      const v: Record<string, string> = (P3_RE.exec(strVal) as any).groups || {};
      let r = parseFloat(v.R);
      if (v.R.includes('%')) r /= 100;
      let g = parseFloat(v.G);
      if (v.G.includes('%')) g /= 100;
      let b = parseFloat(v.B);
      if (v.B.includes('%')) b /= 100;
      let a = 1;
      if (v.A) {
        a = parseFloat(v.A);
        if (v.A.includes('%')) a /= 100;
      }
      return [clamp(r, 0, 1), clamp(g, 0, 1), clamp(b, 0, 1), clamp(a, 0, 1)];
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
export function alpha(rawColor: Color, value: number): ColorOutput {
  const c = parse(rawColor);
  return from([c[0], c[1], c[2], clamp(value, 0, 1)]);
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
  if (amt >= 0) {
    return mix(color, [0, 0, 0, 1], amt);
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
  if (amt >= 0) {
    return mix(color, [1, 1, 1, 1], amt);
  } else {
    return darken(color, -amt);
  }
}

/**
 * Luminance
 * Get absolute brightness of a color (hint: you may want "lightness")
 */
export function luminance(color: Color): number {
  const [r, g, b] = parse(color);
  return NP.round(0.2126 * Math.pow(r, 2.2) + 0.7152 * Math.pow(g, 2.2) + 0.0722 * Math.pow(b, 2.2), P);
}

/**
 * Lightness
 * Get perceived lightness of a color according to human vision (not to be confused with HSL!)
 */
export function lightness(color: Color): number {
  const luma = luminance(color);
  return NP.round((luma <= 216 / 24389 ? luma * (24389 / 27) : Math.pow(luma, 1 / 3) * 116 - 16) / 100, P);
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

  return [round(R + m, P), round(G + m, P), round(B + m, P), round(A, P)];
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
  if (M == m) return [H, S, NP.round(L, 4), A];

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
    S = (M - L) / Math.min(L, 1 - L);
  }

  return [round(H, P - 2), round(S, P), round(L, P), A];
}

/**
 * Gamma Gradient
 * Take any CSS gradient and correct gamma
 */
function gradient(input: string, p3 = false): string {
  const gradString = input.trim();
  let gradType: 'linear-gradient' | 'radial-gradient' | 'conic-gradient' = 'linear-gradient';
  let position: string | undefined;
  let stops: string[] = [];
  if (LIN_GRAD_RE.test(gradString)) {
    stops = (gradString.match(LIN_GRAD_RE) as RegExpMatchArray)[1].split(',').map((p) => p.trim());
    if (stops[0].includes('deg') || stops[0].includes('turn') || stops[0].includes('to ')) {
      position = stops.shift();
    }
  } else if (RAD_GRAD_RE.test(gradString)) {
    gradType = 'radial-gradient';
    stops = (gradString.match(RAD_GRAD_RE) as RegExpMatchArray)[1].split(',').map((p) => p.trim());
    if (stops[0].includes('circle') || stops[0].includes('ellipse') || stops[0].includes('closest-') || stops[0].includes('farthest-')) {
      position = stops.shift();
    }
  } else if (CON_GRAD_RE.test(gradString)) {
    gradType = 'conic-gradient';
    stops = (gradString.match(CON_GRAD_RE) as RegExpMatchArray)[1].split(',').map((p) => p.trim());
    if (stops[0].includes('from')) {
      position = stops.shift();
    }
  } else throw new Error(`Unable to parse gradient "${input}"`);

  const newGradient: { color: string; pos?: string | number }[] = [];

  for (const stop of stops) {
    let pos2 = '';
    let color2 = stop;
    const posMatch = stop.match(STOP_POS_RE);
    if (posMatch) {
      pos2 = posMatch[0].trim();
      color2 = stop.replace(pos2, '').trim();
    }
    if (newGradient.length) {
      const prevItem = newGradient[newGradient.length - 1];
      const { pos: pos1, color: color1 } = prevItem;
      const skipTransitions = (splitDistance(pos1, pos2) as number) <= 0 || from(color1).hex === from(color2).hex; // stops are on top of each other; skip

      // TODO: increase/decrease stops
      if (!skipTransitions) {
        for (let i = 1; i <= 3; i++) {
          const p = 0.25 * i;
          let c = mix(color1, color2, p);
          newGradient.push({ color: p3 ? c.p3 : c.hex, pos: splitDistance(pos1 || 0, pos2, p) });
        }
      }
    }
    const c = from(color2);
    newGradient.push({ color: p3 ? c.p3 : c.hex, pos: pos2 });
  }

  return `${gradType}(${[...(position ? [position] : []), ...newGradient.map(({ color, pos }) => `${color}${pos ? ` ${pos}` : ''}`)].join(',')})`;
}
/** @deprecated (use gradient instead) */
export const gammaGradient = gradient;

export default {
  alpha,
  darken,
  from,
  gammaGradient,
  gradient,
  hslToRGB,
  lighten,
  lightness,
  luminance,
  mix,
  parse,
  rgbToHSL,
};

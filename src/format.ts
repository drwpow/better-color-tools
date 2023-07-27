/**
 * Transformations within the same colorspace (e.g. LAB <> LCH, hex <> RGB, RGB <> HSL)
 */

import { HSL, HWB, LAB, LCH, LinearRGBD65, Oklch, XYZ, sRGB } from './colorspace.js';
import { clamp, degToRad, leftPad, radToDeg } from './utils.js';

const RGB_RANGE = 16 ** 6;
const R_FACTOR = 16 ** 4; // base 16, starting after 4 digits (GGBB)
const G_FACTOR = 16 ** 2; // base 16, starting after 2 digits (BB)

export interface MiniCache {
  hex?: string;
  hexVal?: number;
  linearRGB?: string;
  linearRGBVal?: LinearRGBD65;
  oklab?: string;
  oklch?: string;
  oklchVal?: Oklch;
  p3?: string;
  rgb?: string;
  rgbVal?: sRGB;
  xyz?: string;
  xyzVal?: XYZ;
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
  return { r: r / 255, g: g / 255, b: b / 255, alpha: 1 };
}

/** HSL -> sRGB */
export function hslTosRGB({ h, s, l, alpha = 1 }: HSL): sRGB {
  let H = Math.abs(h % 360); // allow < 0 and > 360

  const C = s * (1 - Math.abs(2 * l - 1));
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
  const m = l - C / 2;

  return { r: R + m, g: G + m, b: B + m, alpha };
}

/** HWB -> sRGB (https://www.w3.org/TR/css-color-4/#hwb-to-rgb) */
export function hwbTosRGB({ h, w, b, alpha = 1 }: HWB): sRGB {
  if (w + b >= 1) {
    const gray = w / (w + b);
    return { r: gray, g: gray, b: gray, alpha };
  }
  const rgb = hslTosRGB({ h, s: 100, l: 50, alpha });
  for (const k of ['r', 'g', 'b'] as const) {
    rgb[k] *= 1 - w - b;
    rgb[k] += w;
  }
  return rgb;
}

/** Lab -> LCh / Oklab -> Oklch) */
export function labToLCH({ l, a, b, alpha = 1 }: LAB, ε = 0.0002): LCH {
  let h = Math.abs(a) < ε && Math.abs(b) < ε ? 0 : radToDeg(Math.atan2(b, a)); // if desaturated, set hue to 0
  while (h < 0) h += 360;
  while (h >= 360) h -= 360;
  return { l, c: Math.sqrt(a ** 2 + b ** 2), h, alpha };
}

/** LCh -> Lab / Oklch -> Oklab */
export function lchToLAB({ l, c, h, alpha = 1 }: LCH): LAB {
  // treat L === 0 as pure black
  if (l === 0) {
    return { l: 0, a: 0, b: 0, alpha };
  }
  while (h < 0) h += 360;
  while (h >= 360) h -= 360;
  const h2 = degToRad(h);
  return { l, a: Math.cos(h2) * c, b: Math.sin(h2) * c, alpha };
}

/** sRGB -> hex */
export function sRGBToHex({ r, g, b, alpha = 1 }: sRGB, cache: MiniCache): string {
  if (cache.hex) return cache.hex;
  let hexString = '#';
  hexString += leftPad(Math.round(clamp(r * 255, 0, 255)).toString(16), 2); // r
  hexString += leftPad(Math.round(clamp(g * 255, 0, 255)).toString(16), 2); // g
  hexString += leftPad(Math.round(clamp(b * 255, 0, 255)).toString(16), 2); // b
  if (alpha < 1) hexString += leftPad(Math.round(alpha * 255).toString(16), 2); // a
  cache.hex = hexString;
  return hexString;
}

/** sRGB -> hex (number) */
export function sRGBToHexNum({ r, g, b, alpha = 1 }: sRGB, cache: MiniCache): number {
  if (typeof cache.hexVal === 'number') return cache.hexVal;
  if (alpha < 1) console.warn(`hexVal converted a semi-transparent color (${alpha * 100}%) to fully opaque`); // eslint-disable-line no-console
  r = Math.round(clamp(r * 255, 0, 255));
  g = Math.round(clamp(g * 255, 0, 255));
  b = Math.round(clamp(b * 255, 0, 255));
  cache.hexVal = r * R_FACTOR + g * G_FACTOR + b;
  return cache.hexVal;
}

export type LRGB = [number, number, number, number];
export type sRGB = [number, number, number, number];

import type { LMS } from './lms.js';
import { multiplyColorMatrix } from './utils.js';

export const LRGB_TO_LMS = [
  [0.4122214708, 0.5363325363, 0.0514459929],
  [0.2119034982, 0.6806995451, 0.1073969566],
  [0.0883024619, 0.2817188376, 0.6299787005],
];

/** Linear RGB -> sRGB */
export function LRGBTosRGB(rgb: LRGB): sRGB {
  return rgb.map((value, n) => {
    if (n === 3) return value; // alpha

    if (value <= 0.0031308) return value * 12.92;
    else return 1.055 * value ** (1 / 2.4) - 0.055;
  }) as sRGB;
}

/** sRGB -> Linear RGB */
export function sRGBToLRGB(rgb: sRGB): LRGB {
  return rgb.map((value, n) => {
    if (n === 3) return value; // alpha

    if (value <= 0.04045) return value / 12.92;
    else return ((value + 0.055) / 1.055) ** 2.4;
  }) as LRGB;
}

/** LRGB -> LMS */
export function LRGBToLMS(lrgb: LRGB): LMS {
  return multiplyColorMatrix(lrgb, LRGB_TO_LMS);
}

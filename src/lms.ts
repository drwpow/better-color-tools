export type LMS = [number, number, number, number]; // with alpha

import type { LRGB } from './rgb.js';
import type { Oklab } from './oklab.js';
import { multiplyColorMatrix } from './utils.js';

export const LMS_TO_OKLAB = [
  [0.2104542553, 0.793617785, -0.0040720468],
  [1.9779984951, -2.428592205, 0.4505937099],
  [0.0259040371, 0.7827717662, -0.808675766],
];

export const LMS_TO_LRGB = [
  [4.0767416621, -3.3077115913, 0.2309699292],
  [-1.2684380046, 2.6097574011, -0.3413193965],
  [-0.0041960863, -0.7034186147, 1.707614701],
];

/** LRGB -> Oklab (via LMS) */
export function LMSToOklab(lms: LMS): Oklab {
  let l2 = lms[0] ** (1 / 3);
  let m2 = lms[1] ** (1 / 3);
  let s2 = lms[2] ** (1 / 3);
  let alpha = lms[3];
  return multiplyColorMatrix([l2, m2, s2, alpha], LMS_TO_OKLAB);
}

/** LMS -> LRGB */
export function LMSToLRGB(lms: LMS): LRGB {
  return multiplyColorMatrix(lms, LMS_TO_LRGB);
}

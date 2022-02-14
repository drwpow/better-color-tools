export type Oklab = [number, number, number, number]; // with alpha

import type { sRGB } from './rgb.js';
import { multiplyColorMatrix } from './utils.js';

export const OKLAB_TO_LMS = [
  [1, 0.3963377774, 0.2158037573],
  [1, -0.1055613458, -0.0638541728],
  [1, -0.0894841775, -1.291485548],
];

/** Oklab -> LMS */
export function OklabToLMS(oklab: Oklab): sRGB {
  const lms = multiplyColorMatrix(oklab, OKLAB_TO_LMS);
  return [
    lms[0] ** 3, // l
    lms[1] ** 3, // m
    lms[2] ** 3, // s
    lms[3], // alpha
  ];
}

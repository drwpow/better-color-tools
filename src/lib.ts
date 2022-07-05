import type { ColorMatrix } from './index';
import { lmsToLinearRGBD65, oklabToLMS } from './colorspace.js';

// https://observablehq.com/@danburzo/color-matrix-calculator
export const LINEAR_RGB_D65_TO_XYZ: ColorMatrix = [
  [0.4123907992659593, 0.357584339383878, 0.1804807884018343],
  [0.2126390058715102, 0.715168678767756, 0.0721923153607337],
  [0.0193308187155918, 0.119194779794626, 0.9505321522496607],
];
export const XYZ_TO_LINEAR_RGB_D65: ColorMatrix = [
  [3.2409699419045221, -1.5373831775700939, -0.4986107602930034],
  [-0.9692436362808793, 1.8759675015077202, 0.0415550574071756],
  [0.0556300796969937, -0.2039769588889766, 1.0569715142428782],
];

// The MIT License (MIT)
//
// Copyright (c) 2020 Björn Ottosson
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
// of the Software, and to permit persons to whom the Software is furnished to do
// so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
export const LMS_TO_OKLAB: ColorMatrix = [
  [0.2104542553, 0.793617785, -0.0040720468],
  [1.9779984951, -2.428592205, 0.4505937099],
  [0.0259040371, 0.7827717662, -0.808675766],
];
export const LMS_TO_LINEAR_RGB: ColorMatrix = [
  [4.0767416621, -3.3077115913, 0.2309699292],
  [-1.2684380046, 2.6097574011, -0.3413193965],
  [-0.0041960863, -0.7034186147, 1.707614701],
];
export const LINEAR_RGB_TO_LMS: ColorMatrix = [
  [0.4122214708, 0.5363325363, 0.0514459929],
  [0.2119034982, 0.6806995451, 0.1073969566],
  [0.0883024619, 0.2817188376, 0.6299787005],
];
export const OKLAB_TO_LMS: ColorMatrix = [
  [1, 0.39633779217376774, 0.2158037580607588],
  [1, -0.10556134232365633, -0.0638541747717059],
  [1, -0.08948418209496574, -1.2914855378640917],
];

/**
 * Finds the maximum saturation possible for a given hue that fits in sRGB
 * Saturation here is defined as S = C/L
 * a and b must be normalized so a^2 + b^2 == 1
 */
function computeMaxSaturation(a: number, b: number): number {
  // Max saturation will be when one of r, g or b goes below zero.

  // Select different coefficients depending on which component goes below zero first
  let k: [number, number, number, number, number] = [Infinity, Infinity, Infinity, Infinity, Infinity];
  let wl = Infinity;
  let wm = Infinity;
  let ws = Infinity;

  if (-1.88170328 * a - 0.80936493 * b > 1) {
    // Red component
    k = [1.19086277, 1.76576728, 0.59662641, 0.75515197, 0.56771245];
    wl = 4.0767416621;
    wm = -3.3077115913;
    ws = 0.2309699292;
  } else if (1.81444104 * a - 1.19445276 * b > 1) {
    // Green component
    k = [0.73956515, -0.45954404, 0.08285427, 0.1254107, 0.14503204];
    wl = -1.2684380046;
    wm = 2.6097574011;
    ws = -0.3413193965;
  } else {
    // Blue component
    k = [1.35733652, -0.00915799, -1.1513021, -0.50559606, 0.00692167];
    wl = -0.0041960863;
    wm = -0.7034186147;
    ws = 1.707614701;
  }

  // Approximate max saturation using a polynomial:
  let S = k[0] + k[1] * a + k[2] * b + k[3] * a * a + k[4] * a * b;

  // Do one step Halley's method to get closer
  // this gives an error less than 10e6, except for some blue hues where the dS/dh is close to infinite
  // this should be sufficient for most applications, otherwise do two/three steps
  const k_l = 0.3963377774 * a + 0.2158037573 * b;
  const k_m = -0.1055613458 * a - 0.0638541728 * b;
  const k_s = -0.0894841775 * a - 1.291485548 * b;

  {
    const l_ = 1 + S * k_l;
    const m_ = 1 + S * k_m;
    const s_ = 1 + S * k_s;

    const l = l_ ** 3;
    const m = m_ ** 3;
    const s = s_ ** 3;

    const l_dS = 3 * k_l * l_ ** 2;
    const m_dS = 3 * k_m * m_ ** 2;
    const s_dS = 3 * k_s * s_ ** 2;

    const l_dS2 = 6 * k_l ** 2 * l_;
    const m_dS2 = 6 * k_m ** 2 * m_;
    const s_dS2 = 6 * k_s ** 2 * s_;

    const f = wl * l + wm * m + ws * s;
    const f1 = wl * l_dS + wm * m_dS + ws * s_dS;
    const f2 = wl * l_dS2 + wm * m_dS2 + ws * s_dS2;

    S = S - (f * f1) / (f1 * f1 - 0.5 * f * f2);
  }

  return S;
}

export interface Cusp {
  L: number;
  C: number;
}

/**
 * finds L_cusp and C_cusp for a given hue
 * a and b must be normalized so a^2 + b^2 == 1
 */
export function findCusp(a: number, b: number): Cusp {
  // First, find the maximum saturation (saturation S = C/L)
  const S_cusp = computeMaxSaturation(a, b);

  // Convert to linear RGB (D65) to find the first point where at least one of r,g or b >= 1:
  const rgb_at_max = lmsToLinearRGBD65(oklabToLMS([1, S_cusp * a, S_cusp * b, 1]));
  const L_cusp = Math.cbrt(1 / Math.max(rgb_at_max[0], rgb_at_max[1], rgb_at_max[3]));
  const C_cusp = L_cusp * S_cusp;

  return { L: L_cusp, C: C_cusp };
}

/**
 * Finds intersection of the line defined by
 * L = L0 * (1 - t) + t * L1;
 * C = t * C1;
 * a and b must be normalized so a^2 + b^2 == 1
 */
export function findGamutIntersection(a: number, b: number, L1: number, C1: number, L0: number): number {
  // Find the cusp of the gamut triangle
  const cusp = findCusp(a, b);

  // Find the intersection for upper and lower half seprately

  if ((L1 - L0) * cusp.C - (cusp.L - L0) * C1 <= 0) {
    // Lower half

    return (cusp.C * L0) / (C1 * cusp.L + cusp.C * (L0 - L1));
  }
  // Upper half

  // First intersect with triangle
  const t = (cusp.C * (L0 - 1)) / (C1 * (cusp.L - 1) + cusp.C * (L0 - L1));

  // Then one step Halley's method

  const dL = L1 - L0;
  const dC = C1;

  const k_l = 0.3963377774 * a + 0.2158037573 * b;
  const k_m = -0.1055613458 * a - 0.0638541728 * b;
  const k_s = -0.0894841775 * a - 1.291485548 * b;

  const l_dt = dL + dC * k_l;
  const m_dt = dL + dC * k_m;
  const s_dt = dL + dC * k_s;

  // If higher accuracy is required, 2 or 3 iterations of the following block can be used:

  const L = L0 * (1 - t) + t * L1;
  const C = t * C1;

  const l_ = L + C * k_l;
  const m_ = L + C * k_m;
  const s_ = L + C * k_s;

  const lms = [
    [l_ ** 3, m_ ** 3, s_ ** 3],
    [3 * l_dt * l_ ** 2, 3 * m_dt * m_ ** 2, 3 * s_dt * s_ ** 2],
    [6 * l_dt ** 2 * l_, 6 * m_dt ** 2 * m_, 6 * s_dt ** 2 * s_],
  ];

  const red = LMS_TO_LINEAR_RGB[0][0] * lms[0][0] + LMS_TO_LINEAR_RGB[0][1] * lms[0][1] + LMS_TO_LINEAR_RGB[0][2] * lms[0][2] - 1;
  const red1 = LMS_TO_LINEAR_RGB[0][0] * lms[1][0] + LMS_TO_LINEAR_RGB[0][1] * lms[1][1] + LMS_TO_LINEAR_RGB[0][2] * lms[1][2];
  const red2 = LMS_TO_LINEAR_RGB[0][0] * lms[2][0] + LMS_TO_LINEAR_RGB[0][1] * lms[2][1] + LMS_TO_LINEAR_RGB[0][2] * lms[2][2];
  const u_red = red1 / (red1 * red1 - 0.5 * red * red2);
  const t_red = u_red >= 0 ? -red * u_red : Infinity;

  const green = LMS_TO_LINEAR_RGB[1][0] * lms[0][0] + LMS_TO_LINEAR_RGB[1][1] * lms[0][1] + LMS_TO_LINEAR_RGB[1][2] * lms[0][2] - 1;
  const green1 = LMS_TO_LINEAR_RGB[1][0] * lms[1][0] + LMS_TO_LINEAR_RGB[1][1] * lms[1][1] + LMS_TO_LINEAR_RGB[1][2] * lms[1][2];
  const green2 = LMS_TO_LINEAR_RGB[1][0] * lms[2][0] + LMS_TO_LINEAR_RGB[1][1] * lms[2][1] + LMS_TO_LINEAR_RGB[1][2] * lms[2][2];
  const u_green = green1 / (green1 * green1 - 0.5 * green * green2);
  const t_green = u_green >= 0 ? -green * u_green : Infinity;

  const blue = LMS_TO_LINEAR_RGB[2][0] * lms[0][0] + LMS_TO_LINEAR_RGB[2][1] * lms[0][1] + LMS_TO_LINEAR_RGB[2][2] * lms[0][2] - 1;
  const blue1 = LMS_TO_LINEAR_RGB[2][0] * lms[1][0] + LMS_TO_LINEAR_RGB[2][1] * lms[1][1] + LMS_TO_LINEAR_RGB[2][2] * lms[1][2];
  const blue2 = LMS_TO_LINEAR_RGB[2][0] * lms[2][0] + LMS_TO_LINEAR_RGB[2][1] * lms[2][1] + LMS_TO_LINEAR_RGB[2][2] * lms[2][2];
  const u_blue = blue1 / (blue1 * blue1 - 0.5 * blue * blue2);
  const t_blue = u_blue >= 0 ? -blue * u_blue : Infinity;

  return t + Math.min(t_red, t_green, t_blue);
}

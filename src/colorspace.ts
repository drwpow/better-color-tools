/**
 * Transformations from one colorspace to another (where loss may occur)
 */

export type HSL = { h: number; s: number; l: number; alpha?: number };
export type HWB = { h: number; w: number; b: number; alpha?: number };
export type LAB = { l: number; a: number; b: number; alpha?: number };
export type LCH = { l: number; c: number; h: number; alpha?: number };
export type LMS = { l: number; m: number; s: number; alpha?: number };
export type LinearRGBD65 = sRGB;
export type Oklab = LAB;
export type Oklch = LCH;
export type sRGB = { r: number; g: number; b: number; alpha?: number };
export type XYZ = { x: number; y: number; z: number; alpha?: number };
export type Color = string | number | sRGB | LinearRGBD65 | LMS | Oklab | Oklch;

import { clamp, multiplyColorMatrix } from './utils.js';
import { LMS_TO_OKLAB, LMS_TO_LINEAR_RGB, LINEAR_RGB_TO_LMS, OKLAB_TO_LMS, LINEAR_RGB_D65_TO_XYZ, XYZ_TO_LINEAR_RGB_D65, findGamutIntersection, XYZ_TO_LMS, LMS_TO_XYZ } from './lib.js';
import { labToLCH, lchToLAB } from './format.js';

// const D65_κ = 24389 / 27;
// const D65_X = 0.950489;
// const D65_Y = 1;
// const D65_Z = 1.08884;
// const D65_LUV_DENOMINATOR = D65_X + 0.15 * D65_Y + 0.03 * D65_Z;
// const D65_U_REF = (4 * D65_X) / D65_LUV_DENOMINATOR;
// const D65_V_REF = (9 * D65_Y) / D65_LUV_DENOMINATOR;

type MatrixRow = [number, number, number];
export type ColorMatrix = [MatrixRow, MatrixRow, MatrixRow];

/** Linear RGB D65 -> sRGB */
export function linearRGBD65TosRGB({ r, g, b, alpha = 1 }: LinearRGBD65): sRGB {
  return { r: sRGBTransferFunction(r), g: sRGBTransferFunction(g), b: sRGBTransferFunction(b), alpha };
}

/** Linear RGB D65 -> LMS */
export function linearRGBD65ToLMS({ r, g, b, alpha = 1 }: LinearRGBD65): LMS {
  const result = multiplyColorMatrix([r, g, b], LINEAR_RGB_TO_LMS);
  return { l: Math.cbrt(result[0]), m: Math.cbrt(result[1]), s: Math.cbrt(result[2]), alpha };
}

/** Linear RGB D65 -> Oklab */
export function linearRGBD65ToOklab(rgb: LinearRGBD65): Oklab {
  return lmsToOklab(linearRGBD65ToLMS(rgb));
}

/** Linear RGB D65 -> XYZ */
export function linearRGBD65ToXYZ({ r, g, b, alpha = 1 }: LinearRGBD65): XYZ {
  const result = multiplyColorMatrix([r, g, b], LINEAR_RGB_D65_TO_XYZ);
  return { x: result[0], y: result[1], z: result[2], alpha };
}

/** LMS -> Oklab (via LMS) */
export function lmsToOklab({ l, m, s, alpha = 1 }: LMS): Oklab {
  const result = multiplyColorMatrix([l, m, s], LMS_TO_OKLAB);
  return { l: result[0], a: result[1], b: result[2], alpha };
}

/** LMS -> Linear RGB D65 */
export function lmsToLinearRGBD65({ l, m, s, alpha = 1 }: LMS): LinearRGBD65 {
  const [r, g, b] = multiplyColorMatrix([l ** 3, m ** 3, s ** 3], LMS_TO_LINEAR_RGB);
  return { r, g, b, alpha };
}

/** LMS -> XYZ */
export function lmsToXYZ({ l, m, s, alpha = 1 }: LMS): XYZ {
  const [x, y, z] = multiplyColorMatrix([l ** 3, m ** 3, s ** 3], LMS_TO_XYZ);
  return { x, y, z, alpha };
}

/** Oklab -> LMS */
export function oklabToLMS({ l, a, b, alpha = 1 }: Oklab): LMS {
  const result = multiplyColorMatrix([l, a, b], OKLAB_TO_LMS);
  return { l: result[0], m: result[1], s: result[2], alpha };
}

/** Oklab -> Linear RGB D65 */
export function oklabToLinearRGBD65(oklab: Oklab): LinearRGBD65 {
  return lmsToLinearRGBD65(oklabToLMS(oklab));
}

/** Oklab -> XYZ */
export function oklabToXYZ(oklab: Oklab): XYZ {
  return lmsToXYZ(oklabToLMS(oklab));
}

/**
 * Oklab -> sRGB
 * - `hdr: false` (default) restricts it to [1, 1, 1]
 * - `hdr: true` allows HDR colors (> 1))
 */
export function oklabTosRGB(oklab: Oklab, hdr = false): sRGB {
  const { r, g, b, alpha } = oklabToLinearRGBD65(oklab);

  // “Preserve light, clamp Chroma” method from https://bottosson.github.io/posts/gamutclipping/
  if (hdr === false && (r > 1.001 || r < -0.001 || g > 1.001 || g < -0.001 || b > 1.001 || b < -0.001)) {
    const ε = 0.00001;
    const C = Math.max(ε, Math.sqrt(oklab.a ** 2 + oklab.b ** 2));
    const Lgamut = clamp(oklab.l, 0, 1);
    const aNorm = oklab.a / C;
    const bNorm = oklab.b / C;
    const t = findGamutIntersection(aNorm, bNorm, oklab.b, C, Lgamut);

    return linearRGBD65TosRGB(
      lmsToLinearRGBD65(
        oklabToLMS({
          l: Lgamut * (1 - t) + t * oklab.l,
          a: aNorm * (t * C),
          b: bNorm * (t * C),
          alpha,
        })
      )
    );
  }

  return linearRGBD65TosRGB({ r, g, b, alpha });
}

/** Oklch -> sRGB */
export function oklchTosRGB(oklch: Oklch): sRGB {
  return oklabTosRGB(lchToLAB(oklch));
}

/** sRGB -> Linear RGB D65 */
export function sRGBToLinearRGBD65({ r, g, b, alpha }: sRGB): LinearRGBD65 {
  return { r: sRGBInverseTransferFunction(r), g: sRGBInverseTransferFunction(g), b: sRGBInverseTransferFunction(b), alpha };
}

/** sRGB -> Oklab */
export function sRGBToOklab(rgb: sRGB): Oklab {
  return lmsToOklab(linearRGBD65ToLMS(sRGBToLinearRGBD65(rgb)));
}

/** sRGB -> Oklch */
export function sRGBToOklch(rgb: sRGB): Oklch {
  return labToLCH(sRGBToOklab(rgb));
}

/** sRGB transfer function (D65 illuminant) */
export function sRGBTransferFunction(value: number): number {
  const abs = Math.abs(value);
  return abs <= 0.0031308 ? value * 12.92 : 1.055 * Math.pow(abs, 1 / 2.4) - 0.055;
}

/** sRGB inverse transfer function (D65 illuminant) */
export function sRGBInverseTransferFunction(value: number): number {
  return Math.abs(value) <= 0.04045 ? value / 12.92 : ((Math.abs(value) + 0.055) / 1.055) ** 2.4;
}

/** XYZ -> Linear RGB D65 */
export function xyzToLinearRGBD65({ x, y, z, alpha = 1 }: XYZ): sRGB {
  const [r, g, b] = multiplyColorMatrix([x, y, z], XYZ_TO_LINEAR_RGB_D65);
  return { r, g, b, alpha };
}

/** XYZ -> LMS */
export function xyzToLMS({ x, y, z, alpha = 1 }: XYZ): LMS {
  const [l, m, s] = multiplyColorMatrix([x, y, z], XYZ_TO_LMS);
  return { l: l ** (1 / 3), m: m ** (1 / 3), s: s ** (1 / 3), alpha };
}

/** XYZ -> Oklab */
export function xyzToOklab(xyz: XYZ): Oklab {
  return lmsToOklab(xyzToLMS(xyz));
}

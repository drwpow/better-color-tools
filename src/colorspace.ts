export type HSL = number[];
export type HWB = number[];
export type LAB = number[];
export type LCH = number[];
export type LUV = number[];
export type LMS = number[];
export type LinearRGBD65 = number[];
export type Oklab = number[];
export type Oklch = number[];
export type sRGB = number[];
export type XYZ = number[];
export type Color = string | number | sRGB | LinearRGBD65 | LMS | Oklab | Oklch;

import { clamp, degToRad, multiplyColorMatrix, radToDeg } from './utils.js';
import { LMS_TO_OKLAB, LMS_TO_LINEAR_RGB, LINEAR_RGB_TO_LMS, OKLAB_TO_LMS, LINEAR_RGB_D65_TO_XYZ, XYZ_TO_LINEAR_RGB_D65, findGamutIntersection } from './lib.js';

// const D65_κ = 24389 / 27;
// const D65_X = 0.950489;
// const D65_Y = 1;
// const D65_Z = 1.08884;
// const D65_LUV_DENOMINATOR = D65_X + 0.15 * D65_Y + 0.03 * D65_Z;
// const D65_U_REF = (4 * D65_X) / D65_LUV_DENOMINATOR;
// const D65_V_REF = (9 * D65_Y) / D65_LUV_DENOMINATOR;

type MatrixRow = [number, number, number];
export type ColorMatrix = [MatrixRow, MatrixRow, MatrixRow];

/** sRGB transfer function (D65 illuminant) */
export function sRGBTransferFunction(value: number): number {
  const abs = Math.abs(value);
  return abs <= 0.0031308 ? value * 12.92 : 1.055 * Math.pow(abs, 1 / 2.4) - 0.055;
}

/** sRGB inverse transfer function (D65 illuminant) */
export function sRGBInverseTransferFunction(value: number): number {
  return Math.abs(value) <= 0.04045 ? value / 12.92 : ((Math.abs(value) + 0.055) / 1.055) ** 2.4;
}

/** HSL -> sRGB */
export function hslTosRGB(hsl: HSL): sRGB {
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

  return [R + m, G + m, B + m, A];
}

/** HWB -> sRGB (https://www.w3.org/TR/css-color-4/#hwb-to-rgb) */
export function hwbTosRGB(hwb: HWB): sRGB {
  const [h, w, b, alpha] = hwb;
  if (w + b >= 1) {
    const gray = w / (w + b);
    return [gray, gray, gray, alpha];
  }
  const rgb = hslTosRGB([h, 100, 50, alpha]);
  for (let i = 0; i < 3; i++) {
    rgb[i] *= 1 - w - b;
    rgb[i] += w;
  }
  return rgb;
}

/** Lab -> LCh / Oklab -> Oklch) */
export function labToLCH(lab: LAB, ε = 0.0002): LCH {
  const [L, a, b, alpha] = lab;

  let h = Math.abs(a) < ε && Math.abs(b) < ε ? 0 : radToDeg(Math.atan2(b, a)); // if desaturated, set hue to 0
  while (h < 0) h += 360;
  while (h >= 360) h -= 360;
  return [
    L, // L
    Math.sqrt(a ** 2 + b ** 2), // C
    h,
    alpha, // alpha;
  ];
}

/** LCh -> Lab / Oklch -> Oklab */
export function lchToLAB(lch: LCH): LAB {
  let [L, C, h, alpha] = lch;
  // treat L === 0 as pure black
  if (L === 0) {
    return [0, 0, 0, alpha];
  }
  while (h < 0) h += 360;
  while (h >= 360) h -= 360;
  const h2 = degToRad(h);
  return [
    L, // l
    Math.cos(h2) * C, // a
    Math.sin(h2) * C, // b,
    alpha, // alpha
  ];
}

/** LMS -> Oklab (via LMS) */
export function lmsToOklab(lms: LMS): Oklab {
  return multiplyColorMatrix(lms, LMS_TO_OKLAB);
}

/** LMS -> Linear RGB D65 */
export function lmsToLinearRGBD65(lms: LMS): LinearRGBD65 {
  const [l, m, s, a] = lms;
  const [r, g, b] = multiplyColorMatrix([l ** 3, m ** 3, s ** 3, a], LMS_TO_LINEAR_RGB);
  return [
    r, // r
    g, // g
    b, // b
    a, // alpha
  ];
}

/** Linear RGB D65 -> sRGB */
export function linearRGBD65TosRGB(rgb: LinearRGBD65): sRGB {
  const [r, g, b, a] = rgb;
  return [
    sRGBTransferFunction(r), // r
    sRGBTransferFunction(g), // g
    sRGBTransferFunction(b), // b
    a, // alpha
  ];
}

/** Linear RGB D65 -> LMS */
export function linearRGBD65ToLMS(lrgb: LinearRGBD65): LMS {
  const [l, m, s, a] = multiplyColorMatrix(lrgb, LINEAR_RGB_TO_LMS);
  return [
    Math.cbrt(l), // L
    Math.cbrt(m), // M
    Math.cbrt(s), // S
    a, // alpha
  ];
}

/** Linear RGB D65 -> XYZ */
export function linearRGBD65ToXYZ(rgb: LinearRGBD65): XYZ {
  return multiplyColorMatrix(rgb, LINEAR_RGB_D65_TO_XYZ);
}

/** LUV -> sRGB */
// export function luvTosRGB(luv: LUV): sRGB {
//   return linearRGBD65TosRGB(xyzToLinearRGB(luvToXYZ(luv)));
// }

/** LUV -> XYZ (D65) */
// export function luvToXYZ(luv: LUV, ε = 216 / 24389): XYZ_D65 {
//   let [L, u, v, alpha] = luv;

//   L;
//   u;
//   v;
//   const y = L > ε * D65_κ ? ((L + 16) / 116) ** 3 : L / D65_κ;
//   const a = ((52 * L) / (u + 13 * L * D65_U_REF) - 1) / 3 || 0;
//   const b = -5 * y || 0;
//   const c = -1 / 3;
//   const d = y * ((39 * L) / (v + 13 * L * D65_V_REF) - 5) || 0;
//   const x = (d - b) / (a - c) || 0;
//   const z = x * a + b;

//   return [x, y, z, alpha];
// }

/** Oklab -> LMS */
export function oklabToLMS(oklab: Oklab): sRGB {
  return multiplyColorMatrix(oklab, OKLAB_TO_LMS);
}

/** Oklab -> sRGB */
export function oklabTosRGB(oklab: Oklab): sRGB {
  const [R, G, B, alpha] = lmsToLinearRGBD65(oklabToLMS(oklab));

  if (R > 1.001 || R < -0.001 || G > 1.001 || G < -0.001 || B > 1.001 || B < -0.001) {
    // “Preserve light, clamp Chroma” method from https://bottosson.github.io/posts/gamutclipping/
    const ε = 0.00001;
    const [L, a, b] = oklab;
    const C = Math.max(ε, Math.sqrt(a ** 2 + b ** 2));
    const Lgamut = clamp(L, 0, 1);
    const aNorm = a / C;
    const bNorm = b / C;
    const t = findGamutIntersection(aNorm, bNorm, L, C, Lgamut);

    return linearRGBD65TosRGB(
      lmsToLinearRGBD65(
        oklabToLMS([
          Lgamut * (1 - t) + t * L, // L
          aNorm * (t * C), // a
          bNorm * (t * C), // b
          alpha,
        ])
      )
    );
  }

  return linearRGBD65TosRGB([R, G, B, alpha]);
}

/** Oklch -> sRGB */
export function oklchTosRGB(oklch: Oklch): sRGB {
  return oklabTosRGB(lchToLAB(oklch));
}

/** sRGB -> Linear RGB D65 */
export function sRGBToLinearRGBD65(rgb: sRGB): LinearRGBD65 {
  const [r, g, b, a] = rgb;
  return [
    sRGBInverseTransferFunction(r), // r
    sRGBInverseTransferFunction(g), // g
    sRGBInverseTransferFunction(b), // b
    a, // alpha
  ];
}

/** Linear RGB D65 -> Luv */
// export function sRGBToLuv(rgb: LinearRGB): LUV {
//   return xyzToLuv(linearRGBD65ToXYZ(sRGBToLinearRGB(rgb)));
// }

/** sRGB -> Oklab */
export function sRGBToOklab(rgb: sRGB): Oklab {
  return lmsToOklab(linearRGBD65ToLMS(sRGBToLinearRGBD65(rgb)));
}

/** sRGB -> Oklch */
export function sRGBToOklch(rgb: sRGB): Oklch {
  return labToLCH(sRGBToOklab(rgb));
}

/** XYZ -> Linear RGB D65 */
export function xyzToLinearRGBD65(xyz: XYZ): sRGB {
  return multiplyColorMatrix(xyz, XYZ_TO_LINEAR_RGB_D65);
}

/** XYZ (D65) -> Luv */
// export function xyzToLuv(xyz: XYZ_D65, ε = 216 / 24389): LUV {
//   const [x, y, z, alpha] = xyz;

//   const denominator = x + 15 * y + 3 * z;
//   const _u = (4 * x) / denominator || 0;
//   const _v = (9 * y) / denominator || 0;
//   const L = x > ε ? 116 * Math.pow(y, 1 / 3) - 16 : D65_κ * y;
//   const u = 13 * L * (_u - D65_U_REF) || 0; // `|| 0` fixes -0
//   const v = 13 * L * (_v - D65_V_REF) || 0;

//   return [L, u, v, alpha];
// }

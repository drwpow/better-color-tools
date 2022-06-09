export type HSL = [number, number, number, number];
export type HWB = [number, number, number, number];
export type LAB = [number, number, number, number];
export type LCH = [number, number, number, number];
export type LUV = [number, number, number, number];
export type LMS = [number, number, number, number];
export type LinearRGB = [number, number, number, number];
export type Oklab = [number, number, number, number];
export type Oklch = [number, number, number, number];
export type sRGB = [number, number, number, number];
export type XYZ_D65 = [number, number, number, number];
export type Color = string | number | sRGB | LinearRGB | LMS | Oklab | Oklch;

import { clamp, degToRad, multiplyColorMatrix, radToDeg } from './utils.js';
import { LMS_TO_OKLAB, LMS_TO_LINEAR_RGB, LINEAR_RGB_TO_LMS, OKLAB_TO_LMS, LINEAR_RGB_TO_XYZ_D65, XYZ_D65_TO_LINEAR_RGB, findGamutIntersection } from './lib.js';

// const D65_κ = 24389 / 27;
// const D65_X = 0.950489;
// const D65_Y = 1;
// const D65_Z = 1.08884;
// const D65_LUV_DENOMINATOR = D65_X + 0.15 * D65_Y + 0.03 * D65_Z;
// const D65_U_REF = (4 * D65_X) / D65_LUV_DENOMINATOR;
// const D65_V_REF = (9 * D65_Y) / D65_LUV_DENOMINATOR;

type MatrixRow = [number, number, number];
export type ColorMatrix = [MatrixRow, MatrixRow, MatrixRow];

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
    return [0, 0, 0, lch[3]];
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

/** LMS -> Linear sRGB */
export function lmsToLinearRGB(lms: LMS): LinearRGB {
  const [r, g, b, a] = multiplyColorMatrix([lms[0] ** 3, lms[1] ** 3, lms[2] ** 3, lms[3]], LMS_TO_LINEAR_RGB);
  return [
    r, // r
    g, // g
    b, // b
    a, // a
  ];
}

/** Linear sRGB -> sRGB */
export function linearRGBTosRGB(rgb: LinearRGB): sRGB {
  const r = Math.abs(rgb[0]);
  const g = Math.abs(rgb[1]);
  const b = Math.abs(rgb[2]);
  return [
    r < 0.0031308 ? rgb[0] * 12.92 : 1.055 * Math.pow(r, 1 / 2.4) - 0.055, // r
    g < 0.0031308 ? rgb[1] * 12.92 : 1.055 * Math.pow(g, 1 / 2.4) - 0.055, // g
    b < 0.0031308 ? rgb[2] * 12.92 : 1.055 * Math.pow(b, 1 / 2.4) - 0.055, // b
    rgb[3], // alpha
  ];
}

/** Linear sRGB -> LMS */
export function linearRGBToLMS(lrgb: LinearRGB): LMS {
  const lms = multiplyColorMatrix(lrgb, LINEAR_RGB_TO_LMS);
  return [
    Math.cbrt(lms[0]), // L
    Math.cbrt(lms[1]), // M
    Math.cbrt(lms[2]), // S
    lms[3],
  ];
}

/** Linear sRGB -> XYZ (D65) */
export function linearRGBToXYZ(rgb: LinearRGB): XYZ_D65 {
  return multiplyColorMatrix(rgb, LINEAR_RGB_TO_XYZ_D65);
}

/** LUV -> sRGB */
// export function luvTosRGB(luv: LUV): sRGB {
//   return linearRGBTosRGB(xyzToLinearRGB(luvToXYZ(luv)));
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
  const rgb = linearRGBTosRGB(lmsToLinearRGB(oklabToLMS(oklab)));

  if (rgb[0] > 1.001 || rgb[0] < -0.001 || rgb[1] > 1.001 || rgb[1] < -0.001 || rgb[2] > 1.001 || rgb[2] < -0.001) {
    // “Preserve light, clamp Chroma” method from https://bottosson.github.io/posts/gamutclipping/
    const ε = 0.00001;
    const [L, a, b, alpha] = oklab;
    const C = Math.max(ε, Math.sqrt(a ** 2 + b ** 2));
    const Lgamut = clamp(L, 0, 1);
    const aNorm = a / C;
    const bNorm = b / C;
    const t = findGamutIntersection(aNorm, bNorm, L, C, Lgamut);

    return linearRGBTosRGB(
      lmsToLinearRGB(
        oklabToLMS([
          Lgamut * (1 - t) + t * L, // L
          aNorm * (t * C), // a
          bNorm * (t * C), // b
          alpha,
        ])
      )
    );
  }

  return rgb;
}

/** Oklch -> sRGB */
export function oklchTosRGB(oklch: Oklch): sRGB {
  return oklabTosRGB(lchToLAB(oklch));
}

/** sRGB -> Linear sRGB */
export function sRGBToLinearRGB(rgb: sRGB): LinearRGB {
  const r = Math.abs(rgb[0]);
  const g = Math.abs(rgb[1]);
  const b = Math.abs(rgb[2]);
  return [
    r < 0.04045 ? rgb[0] / 12.92 : ((r + 0.055) / 1.055) ** 2.4, // r
    g < 0.04045 ? rgb[1] / 12.92 : ((g + 0.055) / 1.055) ** 2.4, // g
    b < 0.04045 ? rgb[2] / 12.92 : ((b + 0.055) / 1.055) ** 2.4, // b
    rgb[3], // alpha
  ];
}

/** Linear sRGB -> Luv */
// export function sRGBToLuv(rgb: LinearRGB): LUV {
//   return xyzToLuv(linearRGBToXYZ(sRGBToLinearRGB(rgb)));
// }

/** sRGB -> Oklab */
export function sRGBToOklab(rgb: sRGB): Oklab {
  return lmsToOklab(linearRGBToLMS(sRGBToLinearRGB(rgb)));
}

/** sRGB -> Oklch */
export function sRGBToOklch(rgb: sRGB): Oklch {
  return labToLCH(sRGBToOklab(rgb));
}

/** XYZ (D65) -> Linear sRGB */
export function xyzToLinearRGB(xyz: XYZ_D65): sRGB {
  return multiplyColorMatrix(xyz, XYZ_D65_TO_LINEAR_RGB);
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

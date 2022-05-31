// note: these types are all interchangeable, but are kept separate for readability
// all color spaces’ 4th number is alpha
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

const ε = 216 / 24389;
const κ = 24389 / 27;
const D65_WHITEPOINT = [95.47, 100, 108.33];
const D65_LUV_DENOMINATOR = D65_WHITEPOINT[0] + 15 * D65_WHITEPOINT[1] + 3 * D65_WHITEPOINT[2];
const D65_U_REF = (4 * D65_WHITEPOINT[0]) / D65_LUV_DENOMINATOR;
const D65_V_REF = (9 * D65_WHITEPOINT[1]) / D65_LUV_DENOMINATOR;

type MatrixRow = [number, number, number];
export type ColorMatrix = [MatrixRow, MatrixRow, MatrixRow];

// https://bottosson.github.io/posts/oklab/
export const LMS_TO_OKLAB: ColorMatrix = [
  [0.2104542553, 0.793617785, -0.0040720468],
  [1.9779984951, -2.428592205, 0.4505937099],
  [0.0259040371, 0.7827717662, -0.808675766],
];

// https://bottosson.github.io/posts/oklab/
export const LMS_TO_LINEAR_RGB: ColorMatrix = [
  [4.0767416621, -3.3077115913, 0.2309699292],
  [-1.2684380046, 2.6097574011, -0.3413193965],
  [-0.0041960863, -0.7034186147, 1.707614701],
];

// https://github.com/muak/ColorMinePortable/
export const LINEAR_RGB_TO_XYZ_D65: ColorMatrix = [
  [0.4124, 0.3576, 0.1805],
  [0.2126, 0.7152, 0.0722],
  [0.0193, 0.1192, 0.9505],
];

// https://bottosson.github.io/posts/oklab/
export const LINEAR_RGB_TO_LMS: ColorMatrix = [
  [0.4122214708, 0.5363325363, 0.0514459929],
  [0.2119034982, 0.6806995451, 0.1073969566],
  [0.0883024619, 0.2817188376, 0.6299787005],
];

// https://bottosson.github.io/posts/oklab/
export const OKLAB_TO_LMS: ColorMatrix = [
  [1, 0.3963377774, 0.2158037573],
  [1, -0.1055613458, -0.0638541728],
  [1, -0.0894841775, -1.291485548],
];

// http://www.easyrgb.com/
export const XYZ_D65_TO_LINEAR_RGB: ColorMatrix = [
  [3.2406, -1.5372, -0.4986],
  [-0.9689, 1.8758, 0.0415],
  [0.0557, -0.204, 1.057],
];

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
export function labToLCH(lab: LAB): LCH {
  const [L, a, b, alpha] = lab;
  const h = a === 0 && b === 0 ? 0 : radToDeg(Math.atan2(b, a)); // if desaturated, set hue to 0
  return [
    L, // L
    Math.sqrt(a ** 2 + b ** 2), // C
    h < 0 ? h + 360 : h, // h (enforce 0–360° hue)
    alpha, // alpha
  ];
}

/** LCh -> Lab / Oklch -> Oklab */
export function lchToLAB(lch: LCH): LAB {
  const [L, C, h, alpha] = lch;
  const h2 = degToRad(h);
  return [
    L, // l
    C * Math.cos(h2), // a
    C * Math.sin(h2), // b,
    alpha, // alpha
  ];
}

/** LMS -> Oklab (via LMS) */
export function lmsToOklab(lms: LMS): Oklab {
  let l2 = Math.cbrt(lms[0]);
  let m2 = Math.cbrt(lms[1]);
  let s2 = Math.cbrt(lms[2]);
  let alpha = lms[3];
  return multiplyColorMatrix([l2, m2, s2, alpha], LMS_TO_OKLAB);
}

/** LMS -> Linear sRGB */
export function lmsToLinearRGB(lms: LMS): LinearRGB {
  const [r, g, b, a] = multiplyColorMatrix(lms, LMS_TO_LINEAR_RGB);
  // bump any negative #s to 0
  return [
    Math.max(0, r), // r
    Math.max(0, g), // g
    Math.max(0, b), // b
    Math.max(0, a), // a
  ];
}

/** Linear sRGB -> sRGB */
export function linearRGBTosRGB(rgb: LinearRGB): sRGB {
  return rgb.map((value, n) => {
    if (n === 3) return clamp(value, 0, 1); // alpha

    if (value <= 0.0031308) return clamp(value * 12.92, 0, 1);
    else return clamp(1.055 * Math.pow(value, 1 / 2.4) - 0.055, 0, 1);
  }) as sRGB;
}

/** Linear sRGB -> LMS */
export function linearRGBToLMS(lrgb: LinearRGB): LMS {
  return multiplyColorMatrix(lrgb, LINEAR_RGB_TO_LMS);
}

/** LUV -> XYZ (D65) */
export function luvToXYZ(luv: LUV): XYZ_D65 {
  let [L, u, v, alpha] = luv;

  L *= 100;
  u *= 100;
  v *= 100;
  const y = L > ε * κ ? ((L + 16) / 116) ** 3 : L / κ;
  const a = ((52 * L) / (u + 13 * L * D65_U_REF) - 1) / 3 || 0;
  const b = -5 * y || 0;
  const c = -1 / 3;
  const d = y * ((39 * L) / (v + 13 * L * D65_V_REF) - 5) || 0;
  const x = (d - b) / (a - c) || 0;
  const z = x * a + b;

  return [x, y, z, alpha];
}

/** LUV -> sRGB */
export function luvTosRGB(luv: LUV): sRGB {
  return xyzTosRGB(luvToXYZ(luv));
}

/** Oklab -> LMS */
export function oklabToLMS(oklab: Oklab): sRGB {
  const lms = multiplyColorMatrix(oklab, OKLAB_TO_LMS);
  return [
    lms[0] ** 3, // l
    lms[1] ** 3, // m
    lms[2] ** 3, // s
    lms[3], // alpha
  ];
}

/** Oklab -> sRGB */
export function oklabTosRGB(oklab: Oklab): sRGB {
  return linearRGBTosRGB(lmsToLinearRGB(oklabToLMS(oklab)));
}

/** Oklch -> sRGB */
export function oklchTosRGB(oklch: Oklch): sRGB {
  return oklabTosRGB(lchToLAB(oklch));
}

/** sRGB -> Linear RGB */
export function sRGBToLinearRGB(rgb: sRGB): LinearRGB {
  return rgb.map((value, n) => {
    if (n === 3) return value; // alpha

    if (value <= 0.04045) return value / 12.92;
    else return ((value + 0.055) / 1.055) ** 2.4;
  }) as LinearRGB;
}

/** sRGB -> Luv */
export function sRGBToLuv(rgb: sRGB): LUV {
  return xyzToLuv(sRGBToXYZ(rgb));
}

/** sRGB -> Oklab */
export function sRGBToOklab(rgb: sRGB): Oklab {
  return lmsToOklab(linearRGBToLMS(sRGBToLinearRGB(rgb)));
}

/** sRGB -> Oklch */
export function sRGBToOklch(rgb: sRGB): Oklch {
  return labToLCH(sRGBToOklab(rgb));
}

/** sRGB -> XYZ (D65) */
export function sRGBToXYZ(rgb: sRGB): XYZ_D65 {
  return multiplyColorMatrix(sRGBToLinearRGB(rgb), LINEAR_RGB_TO_XYZ_D65);
}

/** XYZ (D65) -> sRGB */
export function xyzTosRGB(xyz: XYZ_D65): LinearRGB {
  return linearRGBTosRGB(multiplyColorMatrix(xyz, XYZ_D65_TO_LINEAR_RGB));
}

/** XYZ (D65) -> Luv */
export function xyzToLuv(xyz: XYZ_D65): LUV {
  const [x, y, z, alpha] = xyz;

  const denominator = x + 15 * y + 3 * z;
  const _u = (4 * x) / denominator || 0;
  const _v = (9 * y) / denominator || 0;
  const L = x > ε ? 116 * Math.pow(y, 1 / 3) - 16 : κ * y;
  const u = 13 * L * (_u - D65_U_REF) || 0; // `|| 0` fixes -0
  const v = 13 * L * (_v - D65_V_REF) || 0;

  return [L / 100, u / 100, v / 100, alpha];
}

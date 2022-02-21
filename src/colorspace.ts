export type HSL = [number, number, number, number]; // with alpha
export type LAB = [number, number, number, number];
export type LCH = [number, number, number, number];
export type LMS = [number, number, number, number];
export type LRGB = [number, number, number, number];
export type Oklab = [number, number, number, number]; // with alpha
export type Oklch = [number, number, number, number];
export type sRGB = [number, number, number, number];
export type Color = string | number | sRGB | LRGB | LMS | Oklab | Oklch;

import { clamp, degToRad, multiplyColorMatrix, radToDeg } from './utils.js';

// https://bottosson.github.io/posts/oklab/
export const LMS_TO_OKLAB = [
  [0.2104542553, 0.793617785, -0.0040720468],
  [1.9779984951, -2.428592205, 0.4505937099],
  [0.0259040371, 0.7827717662, -0.808675766],
];

// https://bottosson.github.io/posts/oklab/
export const LMS_TO_LRGB = [
  [4.0767416621, -3.3077115913, 0.2309699292],
  [-1.2684380046, 2.6097574011, -0.3413193965],
  [-0.0041960863, -0.7034186147, 1.707614701],
];

// https://bottosson.github.io/posts/oklab/
export const LRGB_TO_LMS = [
  [0.4122214708, 0.5363325363, 0.0514459929],
  [0.2119034982, 0.6806995451, 0.1073969566],
  [0.0883024619, 0.2817188376, 0.6299787005],
];

// https://bottosson.github.io/posts/oklab/
export const OKLAB_TO_LMS = [
  [1, 0.3963377774, 0.2158037573],
  [1, -0.1055613458, -0.0638541728],
  [1, -0.0894841775, -1.291485548],
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

/** Lab -> LCh / Oklab -> Oklch)*/
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
  const [r, g, b, a] = multiplyColorMatrix(lms, LMS_TO_LRGB);
  // bump any negative #s to 0
  return [
    Math.max(0, r), // r
    Math.max(0, g), // g
    Math.max(0, b), // b
    Math.max(0, a), // a
  ];
}

/** Linear RGB -> sRGB */
export function LRGBTosRGB(rgb: LRGB): sRGB {
  return rgb.map((value, n) => {
    if (n === 3) return clamp(value, 0, 1); // alpha

    if (value <= 0.0031308) return clamp(value * 12.92, 0, 1);
    else return clamp(1.055 * value ** (1 / 2.4) - 0.055, 0, 1);
  }) as sRGB;
}

/** LRGB -> LMS */
export function LRGBToLMS(lrgb: LRGB): LMS {
  return multiplyColorMatrix(lrgb, LRGB_TO_LMS);
}

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

/** sRGB -> Linear RGB */
export function sRGBToLRGB(rgb: sRGB): LRGB {
  return rgb.map((value, n) => {
    if (n === 3) return value; // alpha

    if (value <= 0.04045) return value / 12.92;
    else return ((value + 0.055) / 1.055) ** 2.4;
  }) as LRGB;
}

import type { Color, sRGB } from './colorspace.js';
import type { ColorOutput } from './parse.js';

import { linearRGBTosRGB, sRGBToOklab, sRGBToOklch, sRGBToLinearRGB, oklabTosRGB, oklchTosRGB } from './colorspace.js';
import { from } from './parse.js';
import { clamp } from './utils.js';

export type MixColorSpace = 'oklab' | 'oklch' | 'linearRGB' | 'sRGB';

/**
 * Mix colors via Oklch (better for preserving hue than Oklab)
 * @param {Color}  color1
 * @param {Color}  color2
 * @param {number} weight
 * @param {string='oklch'} colorSpace
 */
export function mix(color1: Color, color2: Color, weight = 0.5, colorSpace: MixColorSpace = 'oklab'): ColorOutput {
  const w = clamp(weight, 0, 1);

  // save calc if possible
  if (weight === 0) return from(color1);
  if (weight === 1) return from(color2);

  const w1 = 1 - w;
  const w2 = w;
  const converters: Record<MixColorSpace, (color: sRGB) => sRGB> = {
    oklch: sRGBToOklch,
    oklab: sRGBToOklab,
    linearRGB: sRGBToLinearRGB,
    sRGB: (c) => c,
  };
  // conversions aren’t invertible!
  const deconverters: Record<MixColorSpace, (color: sRGB) => sRGB> = {
    oklch: oklchTosRGB,
    oklab: oklabTosRGB,
    linearRGB: linearRGBTosRGB,
    sRGB: (c) => c,
  };
  let converter = converters[colorSpace];
  let deconverter = deconverters[colorSpace];
  if (!converter) throw new Error(`Unknown color space "${colorSpace}", try "oklab", "oklch", "linearRGB", or "sRGB"`);

  const rgb1 = from(color1).rgbVal;
  const rgb2 = from(color2).rgbVal;

  // Oklch fix: if one color is neutral, use Oklab to prevent hue shifting
  if (colorSpace === 'oklch' && ((rgb1[0] === rgb1[1] && rgb1[1] === rgb1[2]) || (rgb2[0] === rgb2[1] && rgb2[1] === rgb2[2]))) {
    converter = converters.oklab;
    deconverter = deconverters.oklab;
  }

  // convert color into mix colorspace
  let [x1, y1, z1, a1] = converter(rgb1);
  let [x2, y2, z2, a2] = converter(rgb2);

  // Oklch: take shortest hue distance (e.g. 0 and 359 should only be 1 degree apart, not 359)
  if (colorSpace === 'oklch' && Math.abs(z2 - z1) > 180) {
    if (Math.max(z1, z2) === z2) z2 -= 360;
    else z1 -= 360;
  }

  // find euclidean distance & convert back to sRGB for final value
  return from(
    deconverter([
      x1 * w1 + x2 * w2, // x
      y1 * w1 + y2 * w2, // y
      z1 * w1 + z2 * w2, // z
      a1 * w1 + a2 * w2, // alpha
    ])
  );
}

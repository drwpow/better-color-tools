import { Color, Oklab, linearRGBD65ToOklab, lmsToOklab, oklabToLMS, oklabToLinearRGBD65, oklabToXYZ, xyzToOklab } from './colorspace.js';
import type { ColorOutput } from './parse.js';

import { sRGBToOklab, oklabTosRGB } from './colorspace.js';
import { from } from './parse.js';
import { clamp } from './utils.js';
import { labToLCH, lchToLAB } from './format.js';

export type MixColorSpace = 'oklab' | 'oklch' | 'lms' | 'linearRGB' | 'sRGB' | 'xyz';

const CONVERTER: Record<MixColorSpace, (color: Oklab) => [number, number, number, number]> = {
  oklch(color: Oklab) {
    const { l, c, h, alpha = 1 } = labToLCH(color);
    return [l, c, h, alpha];
  },
  oklab({ l, a, b, alpha = 1 }: Oklab) {
    return [l, a, b, alpha];
  },
  lms(color: Oklab) {
    const { l, m, s, alpha = 1 } = oklabToLMS(color);
    return [l, m, s, alpha];
  },
  linearRGB(color: Oklab) {
    const { r, g, b, alpha = 1 } = oklabToLinearRGBD65(color);
    return [r, g, b, alpha];
  },
  sRGB(color: Oklab) {
    const { r, g, b, alpha = 1 } = oklabTosRGB(color);
    return [r, g, b, alpha];
  },
  xyz(color: Oklab) {
    const { x, y, z, alpha = 1 } = oklabToXYZ(color);
    return [x, y, z, alpha];
  },
};
// conversions aren’t invertible!
const DECONVERTER: Record<MixColorSpace, (color: [number, number, number, number]) => Oklab> = {
  oklch([l, c, h, alpha]) {
    return lchToLAB({ l, c, h, alpha });
  },
  oklab([l, a, b, alpha]) {
    return { l, a, b, alpha };
  },
  lms([l, m, s, alpha]) {
    return lmsToOklab({ l, m, s, alpha });
  },
  linearRGB([r, g, b, alpha]) {
    return linearRGBD65ToOklab({ r, g, b, alpha });
  },
  sRGB([r, g, b, alpha]) {
    return sRGBToOklab({ r, g, b, alpha });
  },
  xyz([x, y, z, alpha]) {
    return xyzToOklab({ x, y, z, alpha });
  },
};

/**
 * Mix colors via LMS (better for preserving hue than Oklab)
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

  let converter = CONVERTER[colorSpace];
  let deconverter = DECONVERTER[colorSpace];
  if (!converter) throw new Error(`Unknown color space "${colorSpace}", try "oklab", "oklch", "lms", "linearRGB", "sRGB", or "xyz"`);

  const oklab1 = from(color1).oklabVal;
  const oklab2 = from(color2).oklabVal;

  // Oklch fix: if one color is desaturated, use Oklab to prevent hue shifting
  if (colorSpace === 'oklch' && ((oklab1.a === 0 && oklab2.b === 0) || (oklab2.a === 0 && oklab2.b === 0))) {
    converter = CONVERTER.oklab;
    deconverter = DECONVERTER.oklab;
  }

  // convert color into mix colorspace
  let [x1, y1, z1, alpha1] = converter(oklab1);
  let [x2, y2, z2, alpha2] = converter(oklab2);

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
      alpha1 * w1 + alpha2 * w2,
    ])
  );
}

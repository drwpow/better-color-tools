import type { Color } from './colorspace.js';
import type { MixColorSpace } from './mix.js';
import type { ColorOutput } from './parse.js';
import { mix } from './mix.js';
import { from } from './parse.js';
import { clamp, round } from './utils.js';

/**
 * Darken
 * @param {Color} color Starting color
 * @param {number} value 1 = make fully black, 0 = original color, -1 = make fully white,
 *
 */
export function darken(color: Color, value: number, colorSpace: MixColorSpace = 'oklab'): ColorOutput {
  const amt = clamp(value, -1, 1);
  if (amt >= 0) {
    return mix(color, 'black', amt, colorSpace);
  } else {
    return lighten(color, -amt);
  }
}

/**
 * Lighten
 * @param {Color} color Starting color
 * @param {number} value 1 = make fully white, 0 = original color, -1 = make fully black
 *
 */
export function lighten(color: Color, value: number, colorSpace: MixColorSpace = 'oklab'): ColorOutput {
  const amt = clamp(value, -1, 1);
  if (amt >= 0) {
    return mix(color, 'white', amt, colorSpace);
  } else {
    return darken(color, -amt);
  }
}

/**
 * Luminance
 * "Y" value of sRGB -> XYZ
 */
export function luminance(color: Color): number {
  return from(color).xyzVal.y;
}

/**
 * Lightness
 * Shortcut of "L” from oklab
 */
export function lightness(color: Color): number {
  return round(from(color).oklabVal.l, 5); // l == lightness
}

/**
 * Is this color “light“ or “dark”?
 * Helps with choosing whether text should be white or black overlaying color
 * Uses Myndex’s “Flip for Color” technique: https://gist.github.com/Myndex/e1025706436736166561d339fd667493
 */
export function lightOrDark(color: Color): 'light' | 'dark' {
  return luminance(color) < 0.36 ? 'dark' : 'light';
}

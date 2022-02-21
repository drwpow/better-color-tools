import type { Color } from './colorspace.js';
import type { ColorOutput } from './parse.js';

import { mix } from './mix.js';
import { clamp } from './utils.js';

export type LightenDarkenColorSpace = 'oklab' | 'oklch' | 'linearRGB' | 'sRGB';

/**
 * Darken
 * @param {Color} color Starting color
 * @param {number} value 1 = make fully black, 0 = original color, -1 = make fully white,
 *
 */
export function darken(color: Color, value: number, colorSpace: LightenDarkenColorSpace = 'oklab'): ColorOutput {
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
export function lighten(color: Color, value: number, colorSpace: LightenDarkenColorSpace = 'oklab'): ColorOutput {
  const amt = clamp(value, -1, 1);
  if (amt >= 0) {
    return mix(color, 'white', amt, colorSpace);
  } else {
    return darken(color, -amt);
  }
}

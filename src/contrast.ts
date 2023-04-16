import type { Color } from './colorspace.js';
import { luminance } from './luminance.js';

/**
 * WCAG 2.1 Contrast Ratio
 */
export function contrastRatio(c1: Color, c2: Color): { ratio: number; AA: boolean; AAA: boolean } {
  const l1 = luminance(c1);
  const l2 = luminance(c2);
  let lighter = Math.max(l1, l2);
  let darker = Math.min(l1, l2);
  const ratio = (lighter + 0.05) / (darker + 0.05);
  return {
    ratio,
    AA: ratio >= 4.5,
    AAA: ratio >= 7,
  };
}

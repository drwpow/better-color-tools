import { type Oklch } from './colorspace.js';

export interface AdjustOptions {
  /** type of adjustment (default: `"absolute"`) */
  mode?: 'absolute' | 'relative';
  lightness?: number;
  chroma?: number;
  hue?: number;
  alpha?: number;
}

/** Adjust color through oklab/oklch colorspace */
export default function adjust(oklch: Oklch, options: AdjustOptions): Oklch {
  let { l, c, h, alpha = 1 } = oklch;
  if (typeof options.lightness === 'number') {
    if (options.mode === 'relative') l += options.lightness;
    else l = options.lightness;
  }
  if (typeof options.chroma === 'number') {
    if (options.mode === 'relative') c += options.chroma;
    else c = options.chroma;
  }
  if (typeof options.hue === 'number') {
    if (options.mode === 'relative') h += options.hue;
    else h = options.hue;
  }
  if (typeof options.alpha === 'number') {
    if (options.mode === 'relative') alpha += options.alpha;
    else alpha = options.alpha;
  }
  return { l, c, h, alpha };
}

import { type sRGB, sRGBToOklch, oklchTosRGB } from './colorspace.js';

export interface AdjustOptions {
  /** type of adjustment (default: `"absolute"`) */
  mode: 'absolute' | 'relative';
  lightness?: number;
  chroma?: number;
  hue?: number;
  alpha?: number;
}

export default function adjust(color: sRGB, options: AdjustOptions): sRGB {
  let [l, c, h, a] = sRGBToOklch(color);
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
    if (options.mode === 'relative') a += options.alpha;
    else a = options.alpha;
  }
  return oklchTosRGB([l, c, h, a]);
}

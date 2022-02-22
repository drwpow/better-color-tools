export type { LMS, LRGB, Oklab, Oklch, sRGB } from './colorspace.js';
export type { LightenDarkenColorSpace } from './lighten-darken.js';
export type { MixColorSpace } from './mix.js';
export type { ColorOutput } from './parse.js';

export { darken, lighten } from './lighten-darken.js';
export { mix } from './mix.js';
export { from, lightness } from './parse.js';

import { darken, lighten } from './lighten-darken.js';
import { mix } from './mix.js';
import { from, lightness } from './parse.js';

export default {
  darken,
  from,
  lighten,
  lightness,
  mix,
};

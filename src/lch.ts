export type LCH = [number, number, number, number];
import type { LAB } from './lab.js';

/** LCh -> Lab */
export function lchToLAB(lch: LCH): LAB {
  const [l, c, h, alpha] = lch;
  const h2 = h * (Math.PI / 180);
  return [
    l, // l
    c * Math.cos(h2), // a
    c * Math.sin(h2), // b,
    alpha, // alpha
  ];
}

export type LAB = [number, number, number, number];
import type { LCH } from './lch.js';

/** Lab -> LCh */
export function labToLCH(lab: LAB): LCH {
  const [l, a, b, alpha] = lab;
  return [
    l, // L
    Math.sqrt(a ** 2 + b ** 2), // C
    Math.atan2(b, a) / (Math.PI / 180), // h
    alpha, // alpha
  ];
}

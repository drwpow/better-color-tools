import type { sRGB } from './index';
import NP from 'number-precision';

/** you know it, you love it */
export function leftPad(input: string, min = 2): string {
  let output = input;
  while (output.length < min) {
    output = `0${output}`;
  }
  return output;
}

export function degToRad(degrees: number): number {
  return NP.divide(NP.times(degrees * Math.PI), 180);
}

export function radToDeg(radians: number): number {
  return NP.divide(NP.times(radians, 180), Math.PI);
}

export function clamp(input: number, min: number, max: number): number {
  return Math.min(Math.max(input, min), max);
}

export function splitDistance(low: string | number | undefined, high: string | number | undefined, weight = 0.5): string | number | undefined {
  if (!low || (!low && !high)) return undefined;
  let lowN = typeof low === 'number' ? low : 0; // n = number
  let lowU: string | undefined; // u = unit
  if (typeof low === 'string') {
    lowN = parseFloat(low);
    lowU = low.replace(lowN.toString(), '');
  }
  let highN = typeof high === 'number' ? high : 0;
  let highU: string | undefined;
  if (typeof high === 'string') {
    highN = parseFloat(high);
    highU = high.replace(highN.toString(), '');
  }
  if (lowU && highU && lowU !== highU) return undefined; // unit mismatch
  let avg = lowN * (1 - weight) + highN * weight;
  if (lowU || highU) return `${avg}${lowU || highU}`;
  return avg;
}

/** multiply 3x1 color matrix with colorspace */
export function multiplyColorMatrix(color: sRGB, matrix: number[][]): sRGB {
  const product: sRGB = [...color];
  for (let row = 0; row < matrix.length; row++) {
    let sum = 0;
    for (let col = 0; col < matrix[0].length; col++) {
      sum += color[col] * matrix[row][col];
    }
    product[row] = sum;
  }
  return product;
}

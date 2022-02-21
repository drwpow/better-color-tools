import type { sRGB } from './index';
import NP from 'number-precision';

NP.enableBoundaryChecking(false);

/** you know it, you love it */
export function leftPad(input: string, min = 2): string {
  let output = input;
  while (output.length < min) {
    output = `0${output}`;
  }
  return output;
}

export function degToRad(degrees: number): number {
  return NP.times(degrees, NP.divide(Math.PI, 180));
}

export function radToDeg(radians: number): number {
  return NP.times(radians, NP.divide(180, Math.PI));
}

export function clamp(input: number, min: number, max: number): number {
  return Math.min(Math.max(input, min), max);
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

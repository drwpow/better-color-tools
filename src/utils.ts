import type { sRGB } from './index';

/** you know it, you love it */
export function leftPad(input: string, min = 2): string {
  let output = input;
  while (output.length < min) {
    output = `0${output}`;
  }
  return output;
}

export function degToRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function radToDeg(radians: number): number {
  return radians * (180 / Math.PI);
}

export function clamp(input: number, min: number, max: number): number {
  return Math.min(Math.max(input, min), max);
}

/** CSS Color Module 5 function */
export function colorFn(colorSpace: string, rgb: sRGB): string {
  return `color(${colorSpace} ${round(rgb[0], 5)} ${round(rgb[1], 5)} ${round(rgb[2], 5)}${rgb[3] < 1 ? `/${round(rgb[3], 5)}` : ''})`;
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

export function round(number: number, precision = 2): number {
  const factor = 10 ** precision;
  return Math.round(number * factor) / factor;
}

export function rgbFn(rgb: sRGB): string {
  const channels = `${Math.round(rgb[0] * 255)}, ${Math.round(rgb[1] * 255)}, ${Math.round(rgb[2] * 255)}`;
  if (rgb[3] !== 1) {
    return `rgba(${channels}, ${round(rgb[3], 5)})`;
  }
  return `rgb(${channels})`;
}

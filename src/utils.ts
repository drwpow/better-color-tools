import type { ColorMatrix } from './index.js';

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

/** CSS Color Module 4 function */
export function colorFn(colorSpace: string, val: [number, number, number, number]): string {
  const [x, y, z, alpha] = val;
  const alphaSlash = alpha < 1 ? `/${round(alpha, 5)}` : '';

  // note: JavaScript abbreviates anything > 6 decimal places as 1e-7, etc.
  switch (colorSpace) {
    case 'rgb':
    case 'rgba': {
      if (alpha < 1) {
        return `rgba(${Math.round(x * 255)}, ${Math.round(y * 255)}, ${Math.round(z * 255)}, ${round(alpha, 5)})`;
      }
      return `rgb(${Math.round(x * 255)}, ${Math.round(y * 255)}, ${Math.round(z * 255)})`;
    }
    // oklab(54.0% -0.10 -0.02)
    case 'oklab':
    case 'oklch': {
      return `${colorSpace}(${round(x * 100, 6)}% ${round(y, 6)} ${round(z, 6)}${alphaSlash})`;
    }
    // color(display-p3 0.4 0.2 0.6)
    // color(xyz-d65 0.4 0.2 0.6)
    default:
      return `color(${colorSpace} ${round(x, 6)} ${round(y, 6)} ${round(z, 6)}${alphaSlash})`;
  }
}

/** apply 3x3 color matrix to color */
export function multiplyColorMatrix(color: [number, number, number], matrix: ColorMatrix): [number, number, number] {
  const product: typeof color = [...color];
  for (let y = 0; y < matrix.length; y++) {
    let sum = 0;
    for (let x = 0; x < matrix[y].length; x++) {
      sum += color[x] * matrix[y][x];
    }
    product[y] = sum;
  }
  return product;
}

export function round(number: number, precision = 2): number {
  const factor = 10 ** precision;
  return Math.round(number * factor) / factor;
}

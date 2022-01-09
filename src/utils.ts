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

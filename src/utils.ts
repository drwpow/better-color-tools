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

export function splitDistance(p1: string | number | undefined, p2: string | number | undefined, weight = 0.5): string | number | undefined {
  if (!p1 || (!p1 && !p2)) return undefined;
  let n1 = typeof p1 === 'number' ? p1 : 0;
  let u1: string | undefined;
  if (typeof p1 === 'string') {
    n1 = parseFloat(p1);
    u1 = p1.replace(n1.toString(), '');
  }
  let n2 = typeof p2 === 'number' ? p2 : 0;
  let u2: string | undefined;
  if (typeof p2 === 'string') {
    n2 = parseFloat(p2);
    u2 = p2.replace(n2.toString(), '');
  }
  if (u1 && u2 && u1 !== u2) return undefined; // unit mismatch
  let avg = n1 * (1 - weight) + n2 * weight;
  if (u1 && u2) return `${avg}${u1 || u2}`;
  return avg;
}

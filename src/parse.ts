import type { Color, LinearRGB, Oklab, Oklch, sRGB } from './colorspace.js';

import { hslTosRGB, linearRGBTosRGB, luvTosRGB, oklabTosRGB, oklchTosRGB, sRGBToLinearRGB, sRGBToOklab, sRGBToOklch } from './colorspace.js';
import cssNames from './css-names.js';
import { clamp, colorFn, leftPad, rgbFn, round } from './utils.js';

export interface ColorOutput {
  /** `#000000` */
  hex: string;
  /** `rgb(0, 0, 0)` */
  rgb: string;
  /** `rgba(0, 0, 0, 1)` */
  rgba: string;
  /** 0x000000 */
  hexVal: number;
  /** [R, G, B, alpha] */
  rgbVal: sRGB;
  /** [R, G, B, alpha] */
  rgbaVal: sRGB;
  /** [R, G, B, alpha] */
  linearRGB: LinearRGB;
  /** `color(luv 0 0 0/1)` */
  // luv: string; // TODO: fix bug
  /** [L, u, v, alpha] */
  // luvVal: LUV;
  /** `color(display-p3 0 0 0/1)` */
  p3: string;
  /** [R, G, B, alpha] */
  p3Val: sRGB;
  /** `color(oklab 0 0 0/1)` */
  oklab: string;
  /** [L, a, b, alpha] */
  oklabVal: Oklab;
  /** `color(oklch 0 0 0/1)` */
  oklch: string;
  /** [L, C, h, alpha] */
  oklchVal: Oklch;
  toString(): string; // JS helper
}

// constants
const FLOAT_RE = /[0-9.-]+%?/g;
const HEX_RE = /^#?[0-9a-f]{3,8}$/i;

/**
 * Parse any valid CSS color color string and convert to:
 * - hex:       '#ff0000'
 * - hexVal:    0xff0000
 * - rgb:       'rgb(255, 0, 0)'
 * - rgbVal:    [1, 0, 0, 1]
 * - rgba:      'rgba(255, 0, 0, 1)'
 * - rgbaVal:   [1, 0, 0, 1]   // alias of rgbVal
 * - linearRGB: [1, 0, 0, 0]   // https://en.wikipedia.org/wiki/Gamma_correction
 * - hslVal:    [0, 1, 1, 1]   // 0% = 0, 100% = 1
 * - p3:        'color(display-p3 1 0 0)'
 * - p3Val:     '[1, 0, 0, 0]'
 */
export function from(rawColor: Color): ColorOutput {
  const color = parse(rawColor);

  const outputs = {
    get hex(): string {
      let hexString = '#';
      hexString += leftPad(Math.round(color[0] * 255).toString(16), 2); // r
      hexString += leftPad(Math.round(color[1] * 255).toString(16), 2); // g
      hexString += leftPad(Math.round(color[2] * 255).toString(16), 2); // b
      if (color[3] < 1) hexString += leftPad(Math.round(color[3] * 255).toString(16), 2); // a
      return hexString;
    },
    get hexVal(): number {
      const r = Math.round(color[0] * 255);
      const g = Math.round(color[1] * 255);
      const b = Math.round(color[2] * 255);
      const a = Math.round(color[3] * 255);
      if (color[3] < 1) return r + 256 ** 3 + g + 256 ** 2 + b + 256 + a;
      return r + 256 ** 2 + g + 256 + b;
    },
    // get luv(): string {
    //   return colorFn('luv', sRGBToLuv(color));
    // },
    // get luvVal(): LUV {
    //   return sRGBToLuv(color);
    // },
    get rgb(): string {
      return rgbFn(color);
    },
    rgbVal: color,
    get rgba(): string {
      return rgbFn(color);
    },
    rgbaVal: color,
    get linearRGB(): sRGB {
      return sRGBToLinearRGB(color);
    },
    get p3(): string {
      return colorFn('display-p3', color);
    },
    p3Val: color,
    get oklab(): string {
      return colorFn('oklab', sRGBToOklab(color));
    },
    get oklabVal(): Oklab {
      return sRGBToOklab(color);
    },
    get oklch(): string {
      return colorFn('oklch', sRGBToOklch(color));
    },
    get oklchVal(): Oklch {
      return sRGBToOklch(color);
    },
  };

  // JS helper
  outputs.toString = (): string => outputs.hex;

  return outputs;
}

/** Convert any number of user inputs into RGBA array */
function parse(rawColor: Color): sRGB {
  /** Convert 0xff0000 to RGBA array */
  function parseHexVal(hexVal: number): sRGB {
    const hexStr = leftPad(clamp(hexVal, 0, 0xffffffff).toString(16), 6); // note: 0x000001 will convert to '1'
    return [
      parseInt(hexStr.substring(0, 2), 16) / 255, // r
      parseInt(hexStr.substring(2, 4), 16) / 255, // g
      parseInt(hexStr.substring(4, 6), 16) / 255, // b
      parseInt(hexStr.substring(6, 8) || 'ff', 16) / 255, // a
    ];
  }

  /** only grabs numbers from a color string (ignores spaces, commas, slashes, etc.) */
  function parseValueStr(colorStr: string, normalize: number[]): [number, number, number, number] {
    const matches = colorStr.match(FLOAT_RE);
    if (!matches) throw new Error(`Unexpected color format: ${colorStr}`);
    const values: [number, number, number, number] = [0, 0, 0, 1]; // always start alpha at 1 unless overridden
    matches.forEach((value, n) => {
      // percentage (already normalized)
      if (value.includes('%')) values[n] = parseFloat(value) / 100;
      // unbounded
      else if (normalize[n] === Infinity) values[n] = parseFloat(value);
      // bounded
      else values[n] = parseFloat(value) / normalize[n];
    });
    return values;
  }

  // [R, G, B] or [R, G, B, A]
  if (Array.isArray(rawColor)) {
    if (rawColor.some((val) => typeof val != 'number')) throw new Error(`Color array must be numbers, received ${rawColor}`);
    if (rawColor.length < 3 || rawColor.length > 4) throw new Error(`Expected [R, G, B, A?], received ${rawColor}`);
    return [
      clamp(rawColor[0], 0, 1), // r
      clamp(rawColor[1], 0, 1), // g
      clamp(rawColor[2], 0, 1), // b
      typeof rawColor[3] === 'number' ? clamp(rawColor[3], 0, 1) : 1, // apha
    ];
  }

  // 0xff0000 (number)
  if (typeof rawColor == 'number') {
    return parseHexVal(rawColor);
  }

  // '#ff0000' / 'red' / 'rgb(255, 0, 0)' / 'hsl(0, 1, 1)'
  if (typeof rawColor == 'string') {
    const strVal = rawColor.trim();
    if (!strVal) throw new Error(`Expected color, received empty string`);

    // named color
    // console.log({ val: strVal, name: (cssNames as any)[strVal] });
    // note: 0 (black) is a valid color! so don’t check for “truthy” here
    if (typeof cssNames[strVal.toLowerCase() as keyof typeof cssNames] === 'number') {
      return parseHexVal(cssNames[strVal as keyof typeof cssNames] as number);
    }
    // hex
    if (HEX_RE.test(strVal)) {
      const hex = strVal.replace('#', '');
      let hexNum = 0;
      // according to spec, any shortened hex should have characters doubled
      if (hex.length < 6) {
        let expandedHex = '';
        for (let n = 0; n < hex.length; n++) {
          let c = hex.substring(n, n + 1);
          expandedHex += c;
          expandedHex += c;
        }
        hexNum = parseInt(expandedHex, 16);
      } else {
        hexNum = parseInt(hex, 16);
      }
      return parseHexVal(hexNum);
    }

    // color functions
    let [colorspace, rest] = strVal.split('(');
    if (colorspace === 'color') colorspace = rest.split(' ')[0];
    switch (colorspace) {
      case 'rgb':
      case 'rgba':
      case 'srgb': {
        const [r, g, b, a] = parseValueStr(rest, [255, 255, 255]);
        return [clamp(r, 0, 1), clamp(g, 0, 1), clamp(b, 0, 1), clamp(a, 0, 1)];
      }
      case 'srgb-linear': {
        const [r, g, b, a] = parseValueStr(rest, [255, 255, 255]);
        return linearRGBTosRGB([clamp(r, 0, 1), clamp(g, 0, 1), clamp(b, 0, 1), clamp(a, 0, 1)]);
      }
      case 'hsl': {
        const [h, s, l, a] = parseValueStr(rest, [Infinity, 1, 1]);
        return hslTosRGB([h, clamp(s, 0, 1), clamp(l, 0, 1), clamp(a, 0, 1)]);
      }
      case 'p3':
      case 'display-p3': {
        const [r, g, b, a] = parseValueStr(rest, [1, 1, 1]);
        return [clamp(r, 0, 1), clamp(g, 0, 1), clamp(b, 0, 1), clamp(a, 0, 1)];
      }
      case 'luv': {
        return luvTosRGB(parseValueStr(rest, [1, 1, 1]));
      }
      case 'oklab': {
        return oklabTosRGB(parseValueStr(rest, [1, 1, 1]));
      }
      case 'oklch': {
        return oklchTosRGB(parseValueStr(rest, [1, 1, Infinity]));
      }
    }
  }

  throw new Error(`Unable to parse color "${rawColor}"`);
}

/**
 * Lightness
 * Shortcut of "L” from oklab
 */
export function lightness(color: Color): number {
  return round(from(color).oklabVal[0], 5); // l == lightness
}

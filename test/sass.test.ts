import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import { default as sass } from 'sass';

const CB_CLOSE_RE = /}$/;

const colorUtils = fs.readFileSync(new URL('../index.scss', import.meta.url));

function test(css: string): string {
  const input = `${colorUtils}

.sel {
  ${css}
}`;
  const result = sass.compileString(input);
  const [, output] = result.css.split('.sel {');
  return output.replace(CB_CLOSE_RE, '').trim();
}

const R = 'red';
const Y = 'yellow';
const G = 'lime';
const C = 'aqua';
const B = 'blue';
const M = '#ff00ff';
const K = 'black';
const W = 'white';

describe('better.mix', () => {
  const tests = [
    ['r -> y', R, Y, '#ffa000'],
    ['r -> g', R, G, '#d0a800'],
    ['r -> c', R, C, '#d2a993'],
    ['y -> g', Y, G, '#b0ff00'],
    ['g -> c', G, C, '#00ffa9'],
    ['g -> b', G, B, '#00aabf'],
    ['g -> m', G, M, '#c6b4b4'],
    ['c -> b', C, B, '#00a0ff'],
    ['b -> m', B, M, '#9038ff'],
    ['b -> r', B, R, '#8c53a2'],
    ['b -> y', B, Y, '#6cabc7'],
    ['m -> r', M, R, '#fd2d9b'],
    ['k -> w', K, W, '#636363'],
  ];

  for (const [name, c1, c2, mid] of tests) {
    it(name, () => {
      expect(test(`color: mix(${c1}, ${c2}, 0);`)).toBe(`color: ${c1};`);
      expect(test(`color: mix(${c1}, ${c2}, 0.5);`)).toBe(`color: ${mid};`);
      expect(test(`color: mix(${c1}, ${c2}, 1);`)).toBe(`color: ${c2};`);
    });
  }

  // grayscale
  const grayscale = ['black', '#030303', '#161616', '#2e2e2e', '#484848', '#636363', 'gray', '#9e9e9e', '#bebebe', '#dedede', 'white'];
  for (let n = 0; n < grayscale.length; n++) {
    it(`k -> w (${n * 10}%)`, () => {
      expect(test(`color: mix(black, white, ${n / 10})`)).toBe(`color: ${grayscale[n]};`);
    });
  }

  it('Sass works as expected', () => {
    expect(test('color: color.mix(#ff0000, #ffff00, 50%);')).toBe(`color: #ff8000;`);
    expect(test('color: color.mix(#ff0000, #00ff00, 50%);')).toBe(`color: olive;`);
    expect(test('color: color.mix(#ffff00, #00ff00, 50%);')).toBe(`color: #80ff00;`);
    expect(test('color: color.mix(#00ff00, #00ffff, 50%);')).toBe(`color: #00ff80;`);
    expect(test('color: color.mix(#00ff00, #0000ff, 50%);')).toBe(`color: teal;`);
    expect(test('color: color.mix(#00ffff, #0000ff, 50%);')).toBe(`color: #0080ff;`);
    expect(test('color: color.mix(#0000ff, #ff00ff, 50%);')).toBe(`color: #8000ff;`);
    expect(test('color: color.mix(#0000ff, #ff0000, 50%);')).toBe(`color: purple;`);
    expect(test('color: color.mix(#ff00ff, #ff0000, 50%);')).toBe(`color: #ff0080;`);
  });
});

describe('p3', () => {
  it('g', () => {
    expect(test('color: p3(#00ff00);')).toBe('color: color(display-p3 0 1 0);');
  });
});

describe('fallback', () => {
  it('color', () => {
    expect(test('@include fallback(color, p3(#00ffff), #00ffff)')).toBe('color: #00ffff;\n  color: color(display-p3 0 1 1);');
  });
});

describe('lightness', () => {
  const lightness = [
    ['r', R, '0.6279553606'],
    ['y', Y, '0.9679827203'],
    ['g', G, '0.8664396115'],
    ['c', C, '0.9053992301'],
    ['b', B, '0.4520137184'],
    ['m', M, '0.7016738559'],
    ['k', K, '0'],
    ['w', W, '0.9999999935'],
  ];

  // note: opacity is just a way to store the value for comparison
    it.each(lightness)('%s', (_, given, want) => {
      expect(test(`opacity: lightness(${given})`)).toBe(`opacity: ${want};`);
    });
});

describe('rgbToOklab', () => {
  const colors = [
    ['r', R, '0.6279553606',  '0.2248630611',  '0.1258462985'],
    ['y', Y, '0.9679827203', '-0.0713690804',  '0.1985697547'],
    ['g', G, '0.8664396115', '-0.2338875742',  '0.1794984799'],
    ['c', C, '0.9053992301', '-0.1494439396', '-0.0393981577'],
    ['b', B, '0.4520137184', '-0.0324569842', '-0.3115281477'],
    ['m', M, '0.7016738559',  '0.2745662943', '-0.1691560593'],
    ['k', K, '0',             '0',             '0'],
    ['w', W, '0.9999999935',  '0.0000000001',  '0.0000000373'],
  ];

  it.each(colors)('%s', (_, given, l, a, b) => {
    expect(test(`$oklab: rgbToOklab(${given});

--l: #{map.get($oklab, 'l')};
--a: #{map.get($oklab, 'a')};
--b: #{map.get($oklab, 'b')};`)).toBe(`--l: ${l};
  --a: ${a};
  --b: ${b};`);
  });
});

describe('oklabToRGB', () => {
  const colors = [
    ['r', '(l: 0.6279553606, a:  0.2248630611, b:  0.1258462985)', 'rgb(255, 0, 0)'],
    ['y', '(l: 0.9679827203, a: -0.0713690804, b:  0.1985697547)', 'rgb(255, 255, 0)'],
    ['g', '(l: 0.8664396115, a: -0.2338875742, b:  0.1794984799)', 'rgb(0, 255, 0)'],
    ['c', '(l: 0.9053992301, a: -0.1494439396, b: -0.0393981577)', 'rgb(0, 255, 255)'],
    ['b', '(l: 0.4520137184, a: -0.0324569842, b: -0.3115281477)', 'rgb(0, 0, 255)'],
    ['m', '(l: 0.7016738559, a:  0.2745662943, b: -0.1691560593)', 'rgb(255, 0, 255)'],
    ['k', '(l: 0,            a:  0,            b:  0)',            'rgb(0, 0, 0)'],
    ['w', '(l: 0.9999999935, a:  0.0000000001, b:  0.0000000373)', 'rgb(255, 255, 255)'],
  ];

  it.each(colors)('%s', (_, given, want) => {
    expect(test(`color: oklabToRGB(${given});`)).toBe(`color: ${want};`);
  });
});

describe('rgbToOklch', () => {
  const colors = [
    ['r', R, '0.6279553606', '0.2576833077',  '29.2338851923'],
    ['y', Y, '0.9679827203', '0.2110059077', '109.7692320765'],
    ['g', G, '0.8664396115', '0.2948272403', '142.4953388878'],
    ['c', C, '0.9053992301', '0.1545500111', '194.768947932'],
    ['b', B, '0.4520137184', '0.3132143717', '264.0520206381'],
    ['m', M, '0.7016738559', '0.3224909648', '328.3634179235'],
    ['k', K, '0',            '0',              '0'],
    ['w', W, '0.9999999935', '0.0000000373',   '0'],
  ];

  it.each(colors)('%s', (_, given, l, c, h) => {
    expect(test(`$oklch: rgbToOklch(${given});

--l: #{map.get($oklch, 'l')};
--c: #{map.get($oklch, 'c')};
--h: #{map.get($oklch, 'h')};`)).toBe(`--l: ${l};
  --c: ${c};
  --h: ${h};`);
  });
});

describe('oklchToRGB', () => {
  const colors = [
    ['r', '(l: 0.6279553606, c: 0.2576833077, h: 29.2338851923)',  'rgb(255, 0, 0)'],
    ['y', '(l: 0.9679827203, c: 0.2110059077, h: 109.7692320765)', 'rgb(255, 255, 0)'],
    ['g', '(l: 0.8664396115, c: 0.2948272403, h: 142.4953388878)', 'rgb(0, 255, 0)'],
    ['c', '(l: 0.9053992301, c: 0.1545500111, h: 194.768947932)',  'rgb(0, 255, 255)'],
    ['b', '(l: 0.4520137184, c: 0.3132143717, h: 264.0520206381)', 'rgb(0, 0, 255)'],
    ['m', '(l: 0.7016738559, c: 0.3224909648, h: 328.3634179235)', 'rgb(255, 0, 255)'],
    ['k', '(l: 0,            c: 0,            h: 0)',              'rgb(0, 0, 0)'],
    ['w', '(l: 1,            c: 0,            h: 0)',              'rgb(255, 255, 255)'],
  ];

  it.each(colors)('%s', (_, given, want) => {
    expect(test(`color: oklchToRGB(${given});`)).toBe(`color: ${want};`);
  });
});

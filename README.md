# better-color-tools

Color parser and better color manipulation through **the power of science!** 🧪 Uses [Oklab]/[Oklch] for better color operations.

The JS version of this libray is fast (`~200k` ops/s), lightweight (`5.7 kB` gzip), and dependency-free. The Sass version… is Sass (which has no runtime).

[🏀 **Playground**](https://better-color-tools.pages.dev/)

## Usage

```
npm install better-color-tools
```

### JavaScript

Works in the browser (ESM) and Node (14+).

**Importing**

```js
import better from 'better-color-tools';
```

**Input**

```js
// CSS format
better.from('#b3f6e6'); // hex string
better.from('rebeccapurple'); // CSS keyword
better.from('rgb(136, 48, 62)'); // CSS sRGB
better.from('hsl(210, 85%, 37%)'); // CSS HSL
better.from('hwb(210, 6%, 31%)'); // CSS HWB
better.from('oklab(48.56949% -0.03971 -0.14459)'); // CSS Oklab
better.from('oklch(83.11253% 0.22612 147.35276)'); // CSS Oklch

// Other JS formats
better.from(0xb3f6e6); // hex integer (note: only mode that doesn’t support transparency)
better.from([0.533, 0.188, 0.243, 1]); // sRGB array/P3 (normalized to 1)
better.from({ r: 0.533, g: 0.188, b: 0.243, alpha: 1 }); // sRGB/P3 object (normalized to 1)
better.from({ h: 210, s: 0.85, l: 0.37, alpha: 1 }); // HSL object
better.from({ h: 210, w: 0.06, b: 0.31, alpha: 1 }); // HWB object
better.from({ l: 0.4856949, a: -0.03971, b: -0.14459, alpha: 1 }); // Oklab object (not CIELAB)
better.from({ l: 0.8311253, c: 0.22612, h: 147.35276, alpha: 1 }); // Oklch object (not CIELCh)
```

This library understands **any CSS-valid color**, including [CSS Color Module 4](https://www.w3.org/TR/css-color-4/) (but if some aspect isn’t implemented yet, please request it!).

[Playground](https://better-color-tools.pages.dev/)

**Output**

This library converts to most web-compatible formats¹, with an emphasis on usefulness over completeness:

```js
const c = better.from('rgba(136, 48, 62, 1)');

// CSS formats
c.hex; // #b3f6e6
c.rgb; // rgb(179, 246, 230) (note: will output rgba() if alpha < 1)
c.p3; // color(display-p3 0.701961 0.964706 0.901961)
c.linearRGB; // color(srgb-linear 0.450786 0.921582 0.791298)
c.oklab; // oklab(92.404387% -0.070395 0.002188)
c.oklch; // oklch(92.404387% 0.070429 178.219895)
c.xyz; // color(xyz-d65 0.658257 0.812067 0.870716)

// JS formats
c.hexVal; // 0xb3f6e6
const [r, g, b, alpha] = c.rgbVal; // [0.701961, 0.964706, 0.901961, 1]
const [r, g, b, alpha] = c.p3Val; // [0.701961, 0.964706, 0.901961, 1]
const [lr, lg, lb, alpha] = c.linearRGBVal; // [0.450786, 0.921582, 0.791298, 1]
const [l, a, b, alpha] = c.oklabVal; // [0.924044, -0.070395, 0.002188, 1]
const [l, c, h, alpha] = c.oklchVal; // [0.924044, 0.070429, 178.219895, 1]
const [x, y, z, alpha] = c.xyzVal; // [0.658257, 0.812067, 0.870716, 1]
```

As a minor implementation detail, all of those properties are [getters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get), so no work is wasted converting to colorspaces you haven’t explicitly asked for.

_¹The following formats aren’t supported as outputs:_

- HSL isn’t supported because [you shouldn’t use it](https://pow.rs/blog/dont-use-hsl-for-anything/)
- HWB isn’t supported because it’s another form of HSL
- CIELAB/CIELCh aren’t supported because Oklab/Oklch [are superior][oklab]

For a comprehensive color conversion library, see [Culori].

**Adjust**

To adjust a color via Oklch, append `.adjust()` along with the adjustments to make:

```js
better.from('#0060ff').adjust({ lightness: 0.5 }); // set lightness to 50% (absolute)
better.from('#0060ff').adjust({ mode: 'relative', lightness: -0.1 }); // darken lightness by 10%
```

You can adjust `lightness`, `chroma`, and `hue` altogether, and you can either operate in `relative` or `absolute` (default) mode.

**P3**

This library supports [P3] by expanding the sRGB space into the P3 gamut 1:1. For example, 100% red sRGB is converted to 100% red P3:

```js
const red = '#ff0000';
better.from(red).rgb; // rgb(255, 0, 0)
better.from(red).p3; // color(display-p3 1 0 0)
```

[Playground](https://better-color-tools.pages.dev/)

This is [the practice recommended by WebKit][p3] because when dealing with web colors you probably intend to take full advantage of that expanded gamut and this is the easiest, quickest way to do so without dealing with the specifics of both the sRGB and
P3 gamuts. This gives you more vibrant colors in supporting browsers without your colors appearing “off.”

While you wouldn’t want to use this technique for other methods such as photo manipulation, for CSS purposes this method is ideal (which better-color-tools assumes you’re using this for). Any deviation between this library’s implementation of P3 from
others’ are intentional.

**Mix**

This uses Oklab (best) by default, but also supports `oklch`, `lms`, `sRGB`, and `linearRGB` colorspaces for mixing.

```js
better.mix('red', 'lime', 0.35); // Mix `red` and `lime` 35%, i.e. more red
better.mix('blue', 'magenta', 0.5, 'linearRGB'); // Mix `blue` and `magenta` 50% using linearRGB colorspace
```

[Playground](https://better-color-tools.pages.dev/mix)

**Lighten / Darken**

This takes hue and human perception into account for visually-accurate results. Also, fun fact: both functions accept negative values.

```js
better.lighten('red', 0.5); // Lighten color by 50%
better.darken('red', 0.5); // Darken color by 50%
```

[Playground](https://better-color-tools.pages.dev/color-scale)

**Lightness**

Get the human-perceived lightness of any color (identical to the first value of `.oklabVal`)

```js
better.lightness('#fc7030'); // 0.7063999
```

[Playground](https://better-color-tools.pages.dev/grayscale)

**Adjust**

Manipulation is done through [Oklch] which is optimized for manual tweaking. Call the `.adjust()` method to manipulate the color (they can even be chained together for multiple, incremental adjustments

```js
import better from 'better-color-tools';
better
  .from('#5a00a6')
  .adjust({
    mode: 'relative',
    hue: 5, // rotate hue by 5° (from wherever it was)
    chroma: 0.1, // increase chroma by `0.1`
  })
  .adjust({
    mode: 'absolute',
    lightnes: 0.6, // set lightness to absolute 60%
  }).hex; // #60009e
```

Note that if `mode` is omitted, the default value is `'absolute'`.

**Contrast Ratio**

Get [WCAG 2.1 contrast ratio](https://www.w3.org/WAI/WCAG21/quickref/?showtechniques=141%2C146#contrast-minimum) for 2 colors. The order doesn’t matter.

```js
better.contrastRatio('#37ca93', '#055af6'); // { ratio: 2.4,   AA: false, AAA: false }
better.contrastRatio('#37ca93', '#4474cc'); // { ratio: 4.5,   AA: true,  AAA: false }
better.contrastRatio('#37ca93', '#002c7b'); // { ratio: 12.76, AA: true,  AAA: true }
```

**Light or dark?**

Should you overlay white or black text over a color? This will figure out whether a color is perceptually “dark” or “light,” taken directly from [Myndex’s “flip for color” technique](https://gist.github.com/Myndex/e1025706436736166561d339fd667493). You can
then use white text for dark colors, and vice-versa.

_Note: though it would be reasonable to assume this just checks whether Oklab’s `l` (lightness) value is over or under `0.5`, [there’s a bit more to it](https://gist.github.com/Myndex/e1025706436736166561d339fd667493))_

```js
better.lightOrDark('#2d659e'); // "dark" (white text will show better)
better.lightOrDark('#b2d6d3'); // "light" (black text will show better)
```

### Sass

Works with any version of [Dart Sass](https://sass-lang.com/dart-sass) (the current version).

**Importing**

```scss
@use 'better-color-tools' as better;
```

**Mix**

```scss
.foo {
  color: better.mix('red', 'lime', 0.35);
}
```

Uses Oklab for best results (which yields much better results than Sass’ [mix](https://sass-lang.com/documentation/modules/color#mix)).

**Lighten / Darken**

```scss
.foo:hover {
  color: better.lighten('blue', 0.2);
  border-color: better.darken('blue', 0.15);
}
```

Lightens (or darkens) color via Oklab for human-perceived lightness value (which yields much better results than Sass’ [lighten](https://sass-lang.com/documentation/modules/color#lighten)/[darken](https://sass-lang.com/documentation/modules/color#darken):

**P3**

```scss
.foo {
  color: better.p3(#f00); // color(display-p3 1 0 0)
}
```

Convert any Sass-readable color to [P3].

**Fallback**

```scss
.foo {
  @include better.fallback('color', better.p3(#f00), #f00);
  // color: #f00;
  // color: color(display-p3 1 0 0);
}
```

Mixin for adding CSS fallbacks. Can take infinite arguments. Specify desired format first, followed by fallbacks.

**Oklab**

```scss
$oklab: better.rgbToOklab(#f00); // (l: 0.6279554, a: 0.22486, b: 0.12585)
$rgb: better.oklabToRGB($oklab); // #f00
```

Converts any Sass-readable color to an Oklab [map](https://sass-lang.com/documentation/modules/map) of `(l: …, a: …, b: –)`. The Sass map can either be used to make a CSS string:

```scss
@use 'sass:map';

.foo {
  color: oklab(#{map.get($oklab, 'l')} #{map.get($oklab, 'a')} #{map.get($oklab, 'b')});
  color: better.oklabToRGB($oklab); // fallback
}
```

Or for color manipulation:

```scss
$oklab-lighter: map.set($oklab, 'l', 0.8);
```

**Lightness**

Get the human-perceived lightness of any color (identical to the first value of `.oklabVal`):

```scss
$lightness: better.lightness(#f00);
```

## Project summary

This project is meant to provide **the best possible method** for common color operations such as mixing, lightening/darkening, and conversion. This library is _not_ comprehensive, and doesn’t support any colorspaces that don’t serve a practical purpose
(limiting colorspaces helps this library optimize for performance over completeness, not to mention ease-of-use). If you are well-versed in color science and need a comprehensive library, consider [Culori] or [Color.js][colorjs] instead.

To learn more, see [Project Goals](./docs/project-goals.md)

[culori]: https://culorijs.org/
[colorjs]: https://colorjs.io/
[oklab]: https://bottosson.github.io/posts/oklab/
[oklch]: https://oklch.evilmartians.io/
[p3]: https://webkit.org/blog/10042/wide-gamut-color-in-css-with-display-p3/

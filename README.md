# better-color-tools

Color parser and better color manipulation through **the power of science!** 🧪 Uses [Oklab](https://bottosson.github.io/posts/oklab/)/Oklch for better color operations.

The JS version of this libray is fast (`> 225k` ops/s), lightweight (`4.3 kB` gzip), and dependency-free. The Sass version… is Sass (which has no runtime).

👉 **Playground**: https://better-color-tools.pages.dev/

## Usage

```
npm install better-color-tools
```

### JavaScript

Works in the browser (ESM) and Node (14+).

```js
import better from 'better-color-utils';

better.from('rebeccapurple').hex; // #663399
better.from('rebeccapurple').p3; // color(display-p3 0.4 0.2 0.6)
better.from('rebeccapurple').oklch; // color(oklch 0.44027 0.1603 303.37299)
```

#### Quick guide

| Code                              | Description                                                                                                                                        |
| :-------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `better.from('red')`              | Parse any valid CSS color (including [color()][css-color])                                                                                         |
| `better.from('red').[colorspace]` | Convert color to [another colorspace](#supported-colorspaces)                                                                                      |
| `better.mix('red', 'lime', 0.35)` | Mix `red` and `lime` 35%, i.e. more red. Uses Oklab for better color mixing.                                                                       |
| `better.lighten('red', 0.5)`      | Lighten color by 50%, i.e. halfway to white (100% is white; 0% is original color). Better than Sass’ builtin.                                      |
| `better.darken('red', 0.5)`       | Darken color by 50%, i.e. halfway to black (100% is black; 0% is original color). Better than Sass’ builtin.                                       |
| `better.lightness('red', 0.5)`    | Get the human-perceived value of lightness from `0` (pure black) to `1` (pure white). Alias for `better.from().oklabVal`’s lightness (first value) |

#### Supported colorspaces

| Colorspace                             | Example                   | Result                                     |
| :------------------------------------- | :------------------------ | :----------------------------------------- |
| sRGB (hex)                             | `better.from(…).hex`      | `'#ff0000'`                                |
| sRGB (hex int)                         | `better.from(…).hexVal`   | `0xff0000`                                 |
| sRGB (RGB)                             | `better.from(…).rgb`      | `'rgb(255, 0, 0)'`                         |
| sRGB (RGB array)                       | `better.from(…).rgbVal`   | `[1, 0, 0, 1]`                             |
| [P3][p3] ([Color Module 4][cm4])       | `better.from(…).p3`       | `'color(display-p3 0.4 0.2 0.6)'`          |
| [P3][p3] (array)                       | `better.from(…).p3Val`    | (alias for `rgbVal`)                       |
| [Oklab][oklab] ([Color Module 4][cm4]) | `better.from(…).oklab`    | `'color(oklab 0.44027 0.08818 -0.13386)'`  |
| [Oklab][oklab] (array)                 | `better.from(…).oklabVal` | `[0.44027, 0.08818, -0.13386, 1]`          |
| [Oklch][oklab] ([Color Module 4][cm4]) | `better.from(…).oklch`    | `'color(oklch 0.44027 0.1603 303.37299)'`  |
| [Oklch][oklab] (array)                 | `better.from(…).oklchVal` | `[0.44027, 0.1603, 303.37299, 1]`          |
| [XYZ D65][xyz] ([Color Module 4][cm4]) | `better.from(…).xyz`      | `'color(xyz-d65 0.12413 0.07492 0.30929)'` |
| [XYZ D65][xyz] (array)                 | `better.from(…).xyzVal`   | `[0.12413, 0.07492, 0.30929, 1]`           |
| [Luv][luv] ([Color Module 4][cm4])     | `better.from(…).luv`      | `'color(luv 0.53241 1.75015 0.2979)'`      |
| [Luv][luv] (array)                     | `better.from(…).luvVal`   | `[0.53241, 1.75015, 0.2979, 1]`            |

[cm4]: https://www.w3.org/TR/css-color-4/
[luv]: https://en.wikipedia.org/wiki/CIELUV
[oklab]: https://bottosson.github.io/posts/oklab/
[p3]: https://webkit.org/blog/10042/wide-gamut-color-in-css-with-display-p3/
[xyz]: https://en.wikipedia.org/wiki/CIE_1931_color_space

- **Oklch** (and Oklab) are always preferred. Oklch works like HSL (1 value for lightness, 1 value for chroma/saturation, and 1 value for hue degrees) but is vastly superior.
- All values are normalized to `1` besides hue degrees (e.g. Oklch). Values < 0 and > 1 are still valid; they just represent a value darker or brigher than the display is able to reproduce
- **Luv** is [a close runner-up to Oklch/Oklab](https://gist.github.com/Myndex/47c793f8a054041bd2b52caa7ad5271c)
- HSL can be parsed, but not output (and [you shouldn’t use it anyway](https://better-color-tools.pages.dev/terminology#hsl))
- All colorspaces use the [CIE standard 2•, D65 white point observer](https://en.wikipedia.org/wiki/Illuminant_D65).

### Sass

Works with any version of [Dart Sass](https://sass-lang.com/dart-sass) (the current version).

```scss
@use 'better-color-tools' as better;
```

#### Quick guide

| Code                                                            | Description                                                                           |
| :-------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `better.p3(#f00)`                                               | Convert RGB color to [P3][p3] (`color(display-p3 …)`) ([CSS Module 5][css-color])     |
| `better.rgbToOklab(#f00)`                                       | Convert RGB to Oklab `color(oklab …)` ([CSS Module 5][css-color])                     |
| `better.oklabToRGB(('l': 0.87421, 'a': -0.19121, 'b': 0.1174))` | Convert Oklab map of `l`, `a`, `b` to Sass color (with all values normalized to `1`). |
| `better.fallback('color', better.p3(#f00), #f00)`               | Easy fallback constructor (meant for color, but may be used for anything).            |
| `better.mix(red, lime, 0.35)`                                   | Mix `red` and `lime` 35%, i.e. more red. Uses Oklab for improved mixing.              |
| `better.lighten(#f00, 0.5)`                                     | Lighten color by 50%, i.e. halfway to white (`1` is white; `0` is original color)     |
| `better.darken(#f00, 0.5)`                                      | Darken color by 50%, i.e. halfway to black (`1` is black; `0` is original color)      |
| `better.lightness(#f00, 0.5)`                                   | Get the human-perceived value of lightness from `0` (pure black) to `1` (pure white). |

## Project summary

This project is meant to provide **the best possible method** for common color operations such as mixing, lightening/darkening, and conversion. This library is _not_ comprehensive, and doesn’t support any colorspaces that don’t serve a practical purpose
(limiting colorspaces helps this library optimize for performance over completeness, not to mention ease-of-use). If you are well-versed in color science and need a comprehensive library, consider [Culori][culori] or [Color.js][colorjs] instead.

To learn more, see [Project Goals](./docs/faq.md#project-goals)

[culori]: https://culorijs.org/
[colorjs]: https://colorjs.io/
[css-color]: https://www.w3.org/TR/css-color-5/#color-function
[faq]: https://github.com/drwpow/better-color-tools/blob/main/faq.md
[p3]: https://webkit.org/blog/10042/wide-gamut-color-in-css-with-display-p3/

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

| Colorspace  | Type       | Example                                     |
| :---------- | :--------- | :------------------------------------------ |
| `.hex`      | `string`   | `'#ff0000'`                                 |
| `.hexVal`   | `number`   | `0xff0000`                                  |
| `.rgb`      | `string`   | `'rgb(255, 0, 0)'`                          |
| `.rgbVal`   | `number[]` | `[1, 0, 0, 1]`                              |
| `.p3`       | `string`   | `'color(display-p3 1 0 0)'`                 |
| `.p3Val`    | `number[]` | (alias for `rgbVal`)                        |
| `.oklab`    | `string`   | `'color(oklab 0.62796 0.22486 0.12585)'`    |
| `.oklabVal` | `number[]` | `[0.62796, 0.22486, 0.12585, 1]`            |
| `.oklch`    | `string`   | `'color(oklch 0.62796 0.25768 29.23389)'`   |
| `.oklchVal` | `number[]` | `[0.62796, 0.25768, 29.23389, 1]`           |
| `.xyz`      | `string`   | `'color(xyz-d65 0.62796 0.25768 29.23389)'` |
| `.xyzVal`   | `number[]` | `[0.62796, 0.25768, 29.23389, 1]`           |
| `.luv`      | `string`   | `'color(luv 0.53241 1.75015 0.2979)'`       |
| `.luvVal`   | `number[]` | `[0.53241, 1.75015, 0.2979, 1]`             |

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

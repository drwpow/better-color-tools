# better-color-tools

Better color manipulation through **the power of science!** 🧪 Uses [Oklab](https://bottosson.github.io/posts/oklab/)/Oklch for better color operations.

The JS version of this libray is fast (`80,000` ops/s), dependency-free, and lightweight (`4.4 kB` gzip). The Sass version… is Sass (which has no runtime).

👉 **Playground**: https://better-color-tools.pages.dev/

## Usage

```
npm install better-color-tools
```

### JavaScript

Works in the browser (ESM) and Node (14+).

```js
import better from 'better-color-utils';
```

#### Quick guide

| Code                              | Description                                                                                                                                        | Docs                 |
| :-------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| `better.from('red')`              | Parse any valid CSS color (including [color()][css-color])                                                                                         | [Docs](./docs/js.md) |
| `better.from('red').[format]`     | Reformat color in any format such as hex, RGB, [P3][p3] (Safari), Oklab, Oklch, and more.                                                          | [Docs](./docs/js.md) |
| `better.mix('red', 'lime', 0.35)` | Mix `red` and `lime` 35%, i.e. more red. Uses Oklch for better color mixing than any Sass builtin ([why?][faq]).                                   | [Docs](./docs/js.md) |
| `better.lighten('red', 0.5)`      | Lighten color by 50%, i.e. halfway to white (100% is white; 0% is original color). Better than Sass’ builtin.                                      | [Docs](./docs/js.md) |
| `better.darken('red', 0.5)`       | Darken color by 50%, i.e. halfway to black (100% is black; 0% is original color). Better than Sass’ builtin.                                       | [Docs](./docs/js.md) |
| `better.lightness('red', 0.5)`    | Get the human-perceived value of lightness from `0` (pure black) to `1` (pure white). Alias for `better.from().oklabVal`’s lightness (first value) | [Docs](./docs/js.md) |

[JS Docs](./docs/js.md)

### Sass

Works with any version of [Dart Sass](https://sass-lang.com/dart-sass) (the current version).

```scss
@use 'better-color-tools' as better;
```

#### Quick guide

| Code                                                | Description                                                                                                                                        | Docs                   |
| :-------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| `better.p3('red')`                                  | Reformat any Sass-parseable color as [P3][p3] (Safari)                                                                                             | [Docs](./docs/sass.md) |
| `better.oklab('red')`                               | Reformat any Sass-parseable color as `color(oklab …)` ([CSS Module 5][css-color])                                                                  | [Docs](./docs/sass.md) |
| `better.oklch('red')`                               | Reformat any Sass-parseable color as `color(oklch …)` ([CSS Module 5][css-color])                                                                  | [Docs](./docs/sass.md) |
| `better.fallback('color', better.p3('red'), 'red')` | Easy fallback constructor (meant for color, but may be used for anything).                                                                         | [Docs](./docs/sass.md) |
| `better.mix('red', 'lime', 0.35)`                   | Mix `red` and `lime` 35%, i.e. more red. Uses Oklch for true color mixing ([why?][faq]).                                                           | [Docs](./docs/sass.md) |
| `better.lighten('red', 0.5)`                        | Lighten color by 50%, i.e. halfway to white (100% is white; 0% is original color)                                                                  | [Docs](./docs/sass.md) |
| `better.darken('red', 0.5)`                         | Darken color by 50%, i.e. halfway to black (100% is black; 0% is original color)                                                                   | [Docs](./docs/sass.md) |
| `better.lightness('red', 0.5)`                      | Get the human-perceived value of lightness from `0` (pure black) to `1` (pure white). Alias for `better.from().oklabVal`’s lightness (first value) | [Docs](./docs/sass.md) |

[Sass Docs](./docs/sass.md)

## Project summary

This project is meant to provide **the best possible method** for common color operations such as mixing, lightening/darkening, and conversion. This library is _not_ comprehensive, and doesn’t support any colorspaces that don’t serve a practical purpose
(limiting colorspaces helps this library optimize for performance over completeness, not to mention ease-of-use). If you are well-versed in color science and need a comprehensive library, consider [Culori][culori] or [Color.js][colorjs] instead.

To learn more, see [Project Goals](./docs/faq.md#project-goals)

[culori]: https://culorijs.org/
[colorjs]: https://colorjs.io/
[css-color]: https://www.w3.org/TR/css-color-5/#color-function
[faq]: https://github.com/drwpow/better-color-tools/blob/main/faq.md
[p3]: https://webkit.org/blog/10042/wide-gamut-color-in-css-with-display-p3/

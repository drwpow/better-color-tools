# better-color-tools

Better color manipulation through **the power of science!** 🧪

The JS version of this libray is fast (`80,000` ops/s), dependency-free, and lightweight (`4.4 kB` gzip). The Sass version… is Sass (which has no runtime).

👉 **Docs**: https://better-color-tools.pages.dev/
## Usage

```
npm install better-color-tools
```

### JavaScript

Better Color Tools works in the browser and Node.

```js
import better from 'better-color-utils';
```

### Sass

```scss
@use 'better-color-tools' as better;
```

## Mix

Mix 2 colors without it looking horrible. Uses fancy algorithms that take into account human color perception to produce the best result between any 2 colors. Compare better-color-tools (top, cool and beautiful) with compressed sRGB averaging found in most other tools (bottom, lame and icky):

![](./.github/images/r-g.png)

![](./.github/images/g-b.png)

![](./.github/images/b-y.png)

![](./.github/images/k-c.png)

![](./.github/images/k-w.png)

```scss
// Sass
@use 'better-color-tools' as better;

$mix: better.mix(#1a7f37, #cf222e, 0);    // 100% color 1, 0% color 2
$mix: better.mix(#1a7f37, #cf222e, 0.25); // 75%, 25%
$mix: better.mix(#1a7f37, #cf222e, 0.5);  // 50%, 50%
$mix: better.mix(#1a7f37, #cf222e, 0.75); // 25%, 75%
$mix: better.mix(#1a7f37, #cf222e, 1);    // 0%, 100%
```

```ts
// JavaScript / TypeScript
import better from 'better-color-tools';

const mix = better.mix(0x1a7f37, 0xcf222e, 0);    // 100% color 1, 0% color 2
const mix = better.mix(0x1a7f37, 0xcf222e, 0.25); // 75%, 25%
const mix = better.mix(0x1a7f37, 0xcf222e, 0.5);  // 50%, 50%
const mix = better.mix(0x1a7f37, 0xcf222e, 0.75); // 25%, 75%
const mix = better.mix(0x1a7f37, 0xcf222e, 1);    // 0%, 100%
```

_Note: `0xcf222e` in JS is just another way of writing `'#cf222e'` (replacing the `#` with `0x`). Either are valid; use whichever you prefer!_

## Lighten / Darken

![](./.github/images/k-c.png)

_Top: better-color-utils / Bottom: compressed sRGB averaging_

Lighten or darken a color by a relative amount from that color. Also takes human color perception into account, and works well for colorblind users (assuming starting from a colorblind-friendly color in the first place).

```scss
// Sass
@use 'better-color-tools' as better;

$lighter: better.lighten(#cf222e, 0);    // 0% lighter (original color)
$lighter: better.lighten(#cf222e, 0.25); // 25% lighter
$lighter: better.lighten(#cf222e, 1);    // 100% lighter (pure white)

$darker: better.darken(#cf222e, 0);      // 0% darker (original color)
$darker: better.darken(#cf222e, 0.25);   // 25% darker
$darker: better.darken(#cf222e, 1);      // 100% darker (pure black)
```

```ts
// JavaScript / TypeScript
import better from 'better-color-tools';

better.lighten(0xcf222e, 0);    // 0% lighter (original color)
better.lighten(0xcf222e, 0.25); // 25% lighter
better.lighten(0xcf222e, 1);    // 100% lighter (pure white)

better.darken(0xcf222e, 0);     // 0% darker (original color)
better.darken(0xcf222e, 0.25);  // 25% darker
better.darken(0xcf222e, 1);     // 100% darker (pure black)
```

## Gradient

⚠️ **Temporarily removed**

Generate a more perceptually-accurate gradient from any CSS gradient string. Temporarily removed to be improved upon.

## Lightness

Used for determining whether or not a color is “dark” or “light,” which helps you predict whether white or black text on top would give the biggest contrast, e.g.:

- `0 – 0.5`: dark
- `0.5 – 1`: light
- `0.5` exactly: 🤷‍♂️ (perfect midtone—your call)

```scss
@use 'better-color-tools' as better;

$medium-blue: rgb(23, 79, 210);
$is-dark: better.lightness($medium-blue) < 0.5; // true

.card {
  @if $is-dark {
    color: white; // white text over dark color
  } @else {
    color: black; // black text over light color
  }
}
```

```js
import better from 'better-color-tools';

const DARK_PURPLE = 0x542be9;
const isDark = better.lightness(DARK_PURPLE) < 0.5; // true

if (isDark) {
  someEl.classList.add('is-dark');
} else {
  someEl.classList.add('is-light');
}
```

💁 _Tip: this is useful because the “lightness” in HSL [is worthless](https://better-color-tools.dev/terminology#hsl)_

## Utilities

### Sass

#### P3

The `p3()` function can convert any Sass-readable color into [P3][p3]:

```scss
@use 'better-color-tools' as better;

$green: #00ff00;
$blue: #0000ff;

// usage: p3($color)
color: better.p3($green); // color(display-p3 0 1 0)
background: linear-gradient(135deg, better.p3($green), better.p3($blue)); // linear-gradient(135deg, color(display-p3 0 1 0), color(dipslay-p3 0 0 1)))
```

#### Fallback Mixin

The fallback mixin can be used in tandem with `.p3()` to support wider color gamut in a backwards-compatible way:

```scss
@use 'better-color-tools' as better;

.button {
  // usage: fallback($property, $preferred, $fallback-1, $fallback-2, … $fallback-n);
  @include better.fallback(background, better.p3(#174fd2), #174fd2);
}

// .button {
//   background: #174fd2;
//   background: color(display-p3 0.090196 0.3098 0.823529);
// }
```

### JavaScript / TypeScript

`better.from()` takes any valid CSS string, hex number, or RGBA array (values normalized to `1`) as an input, and can generate any desired output as a result:

```ts
import better from 'better-color-tools';

better.from('rgb(196, 67, 43)').hex; // '#c4432b'
better.from('rebeccapurple').lchVal; // [0.46875, 0.65317, 0.39732]
```

| Code                       |    Type    | Example                     |
| :------------------------- | :--------: | :-------------------------- |
| `from(color).hex`       |  `string`  | `"#ffffff"`                 |
| `from(color).hexVal`    |  `number`  | `0xffffff`                  |
| `from(color).rgb`       |  `string`  | `"rgb(255, 255, 255)"`      |
| `from(color).rgbVal`    | `number[]` | `[1, 1, 1, 1]`              |
| `from(color).rgba`      |  `string`  | `"rgba(255, 255, 255, 1)"`  |
| `from(color).linearRGB` | `number[]` | `[1, 1, 1, 1]"`             |
| `from(color).p3`        |  `string`  | `"color(display-p3 1 1 1)"` |

#### A note on CSS color names

This library can convert _FROM_ a CSS color name, but can’t convert _INTO_ one (as over 99% of colors have no standardized name). However, you may import `better-color-tools/dist/css-names.js` for an easy-to-use map for your purposes.

#### A note on P3

When converting between sRGB and P3, this library converts R/G/B channels 1:1:1, the approach [recommended by Apple for Safari](https://webkit.org/blog/10042/wide-gamut-color-in-css-with-display-p3/). Compare this to alternate methods that treat P3 as a distinct space from sRGB where R/G/B don’t align neatly (such as [ColorJS][colorjs]), which in one sense may be more technically-correct for non-web applications. But for the purposes of managing web color, any alternate method of P3 conversion is not only unhelpful; it produces inconsistent results in Safari and should be avoided for that reason alone.

## Project Goals (or this library vs X)

I started this library because I frequently need to mix colors, but was constantly disappointed at how bad the results were using common tools available (see examples above; if you’ve found a tool you’re happy with, more power to you, but I never did). I had avoided using any libraries or tools for this reason for my entire career, and instead always mixed color manually in graphics programs (in full disclosure I have a fine arts degree with a concentration in painting, which helps explain why I felt most color tools were primitive and unusable). But over time, I had this growing feeling that others had dealt with this problem and had been similarly disappointed, and that there were solutions available; they just were just unknown to the authors making simple color functions (including the Sass authors). After all, most programmers aren’t color scientists. And so this library is the product of finding solutions to the (deceptively-complex) problem of color mixing that aren’t god-awful, and are at least as good as I can achieve mixing colors manually if not better.

On the other side of the divide, there are plenty of color tools that comprehensively deal with most major color spaces accurately, and are capable of mixing colors precisely. However, they posess a steep learning curve to use, and a user must have a deep knowledge of the tool and theory to accomplish basic tasks for the purpose of making websites. And for good reason, too—there’s over a century of color science history to tackle, and those libraries are also dealing with myriad other applications beyond computer monitor color including physical paint, printing, etc. By limiting scope to _just computer monitor color_ and more specifically _computer monitor color for the web_, we can cut down on most complexity of other tools and are left with only a subset of options, which is sadly an untapped space.

So in essence, this library aims to fill the void between those two sides by prioritizing **practicality** and **precision** (as opposed to completeness in the latter side and, uh, I’m not sure what outlines the former side other than fundamental misunderstandings of color 🤷‍♂️).

### Practicality

This tool is to be task-oriented rather than theory-oriented (or color space-oriented). Use whatever color space or algorithms arguably solve a task better than others. Make it opaque to the user. If a color space is not absolutely necessary to perform any tasks, don’t support it in this library (which is why HSL isn’t used for any operation¹).

Going further, supporting all browser or web standards are not a priority for this library². The best results are all that matters.

> 1: HSL isn’t used because it’s an outdated colorspace not suitable for any practical application ([more explanation](https://better-color-tools.pages.dev/terminology#hsl)).

> 2: This comment about not prioritizing standards refers to the [upcoming color spaces in CSS](https://www.w3.org/TR/css-color-5/#color-function). There are some curious choices such as [using D50 rather than the widely-agreed-upon D65 for the center whitepoint](https://gist.github.com/Myndex/47c793f8a054041bd2b52caa7ad5271c#myth-destruction), which has a huge impact on how colors are displayed, and differs from most other applications without a clear reason. Further, the standards merely open more options to implementors, and those options may not necessarily be cutting-edge or the best options available. The need for standard-based tooling is important! But this library is not concerned with standards or popularity, only color science. If the best tools available happen to be in the new CSS standards, fantastic. But that would be only a coincidence and not a restriction.

### Precision

Given a particular color space and constraints of a task, this library will be as precise as any other tool available. In a scenario where performance must be sacrificed for precision, precision will always be preferred. After all, while this _can_ run effectively in a browser, many color operations can also be frontloaded such that they don’t have to happen at runtime (which is always true for the Sass version of this library). Precision should be at least of 16-bit quality (higher than the 8-bit sRGB standard). The reliability of all color matrices should be sweated; after all, if Better Color Tools isn’t _better_, what’s the point?

### Performance (side-goal)

Though no library prioritizes slowness and this is usually a given, assuming the previous two goals are met, make this library operate as quickly as possible. A great side effect of ignoring most color spaces is performance by default. Comprehensive color libraries must include bulky data tables for whitepoints and observers and must support a litany of color spaces which makes them impractical to use in any browser unless that application is specifically for color science. This library keeps only what’s essential for a few tasks, and discards the rest. As a result, the JS version of this library ships very little code to the browser (a few kB gzipped), and can be used clientside without much thought.

Performance is also a nice side effect of only ever dealing with at most 2 color spaces for any given task (the color space used for any calculation + sRGB). As a result, this library will perform the fewest operations between those 2 spaces³.

> 3: CIE XYZ is a common starting point, especially when converting from one color space to another. For libraries concerned with making the most color spaces available, converting to/from XYZ is necessary to achieve the best results. And also because trying to optimize every permutation of color space conversion would be overkill/unmanageable. But for Better Color Tools, those direct conversions matter, so XYZ can be skipped. While this is moot for a single conversion, across an entire website at scale this can have an impact on developing and building websites, so these micro-optimizations do matter.


### See also

For the people that understand color science and need a comprehensive tool, they may want to consider [Culori](https://culorijs.org/) or [ColorJS][colorjs] instead.

[colorjs]: https://colorjs.io
[luv]: https://gist.github.com/Myndex/47c793f8a054041bd2b52caa7ad5271c
[gamma]: https://observablehq.com/@sebastien/srgb-rgb-gamma
[number-precision]: https://github.com/nefe/number-precision
[p3]: https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/color()
[sass-color]: https://sass-lang.com/documentation/modules/color
[sass-color-scale]: https://sass-lang.com/documentation/modules/color#scale

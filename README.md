# better-color-tools

Better color manipulation for Sass and JavaScript/TypeScript.

## Installing

```
npm install better-color-tools
```

## Sass

Sass has built-in [color][sass-color] functions, but they aren’t as usable as they could be. Here’s why this library exists as an alternative.

### Mix

Let’s compare this library’s mix function to Sass’ (Sass on top; better-color-tools on bottom):

<table>
  <thead>
    <th>Blend</th>
    <th>Comparison</th>
  </thead>
  <tbody>
    <tr>
      <td>red–lime</td>
      <td><img src="./.github/images/red-lime-sass.png"><img src="./.github/images/red-lime-better.png"></td>
    </tr>
    <tr>
      <td>red–yellow</td>
      <td><img src="./.github/images/red-yellow-sass.png"><img src="./.github/images/red-yellow-better.png"></td>
    </tr>
    <tr>
      <td>blue–yellow</td>
      <td><img src="./.github/images/blue-yellow-sass.png"><img src="./.github/images/blue-yellow-better.png"></td>
    </tr>
    <tr>
      <td>blue–fuchsia</td>
      <td><img src="./.github/images/blue-fuchsia-sass.png"><img src="./.github/images/blue-fuchsia-better.png"></td>
    </tr>
    <tr>
      <td>blue–lime</td>
      <td><img src="./.github/images/blue-lime-sass.png"><img src="./.github/images/blue-lime-better.png"></td>
    </tr>
  </tbody>
</table>

It may be hard to tell a difference at first, but upon closer inspection you’ll see better results with the bottom colors in each row:

- better-color-utils produces brighter, more vibrant colors when mixing complementary colors, while Sass results in [dark, muddy colors][computer-color] (compare mid tones in all examples)
- better-color-utils gives better spacing between colors while Sass inconsistently clumps certain hues together (compare blues in all examples)
- better-color-utils produces more expected colors than Sass (compare how better-color-tools passes through teal in **blue–lime** while Sass doesn’t)

#### Usage

```scss
@use 'better-color-tools' as color;

$mix: color.mix(#1a7f37, #cf222e, 0); // 100% color 1, 0% color 2
$mix: color.mix(#1a7f37, #cf222e, 0.25); // 75%, 25%
$mix: color.mix(#1a7f37, #cf222e, 0.5); // 50%, 50%
$mix: color.mix(#1a7f37, #cf222e, 0.75); // 25%, 75%
$mix: color.mix(#1a7f37, #cf222e, 1); // 0%, 100%
```

### Lighten / Darken

⚠️ Still in development. It’s important to note that Sass’ new [`color.scale()`][sass-color-scale] utility is now a fantastic way to lighten / darken colors (previous attempts had been lacking). `color.scale()` produces better results than this library,
currently, and I’m not happy with that 🙂.

```scss
@use 'better-color-tools' as color;

$lighter: color.lighten(#cf222e, 0); // 0% lighter (original color)
$lighter: color.lighten(#cf222e, 0.25); // 25% lighter
$lighter: color.lighten(#cf222e, 1); // 100% lighter (pure white)

$darker: color.darken(#cf222e, 0); // 0% darker (original color)
$darker: color.darken(#cf222e, 0.25); // 25% darker
$darker: color.darken(#cf222e, 1); // 100% darker (pure black)
```

## JavaScript / TypeScript

### Mix

[View comparison](#mix) (Sass’ mix function is a generic implementation of mixing you’ll find with other libraries in JavaScript)

_Note: you’ll see `0xcf222e` in the examples which is just another way of writing `'#cf222e'`. It’s just replacing the `#` with `0x`. Use what you prefer!_

```ts
import color from 'better-color-tools';

const mix = color.mix(0x1a7f37, 0xcf222e, 0); // 100% color 1, 0% color 2
const mix = color.mix(0x1a7f37, 0xcf222e, 0.25); // 75%, 25%
const mix = color.mix(0x1a7f37, 0xcf222e, 0.5); // 50%, 50%
const mix = color.mix(0x1a7f37, 0xcf222e, 0.75); // 25%, 75%
const mix = color.mix(0x1a7f37, 0xcf222e, 1); // 0%, 100%
```

### Lighten / Darken

⚠️ In development ([see note](#lighten--darken))

```ts
import color from 'better-color-tools';

color.lighten(0xcf222e, 0); // 0% lighter (original color)
color.lighten(0xcf222e, 0.25); // 25% lighter
color.lighten(0xcf222e, 1); // 100% lighter (pure white)

color.darken(0xcf222e, 0); // 0% darker (original color)
color.darken(0xcf222e, 0.25); // 25% darker
color.darken(0xcf222e, 1); // 100% darker (pure black)
```

### Conversion

Color conversion between RGB and hexadecimal is a trivial 1:1 conversion, so this library isn’t better than any other in that regard.

It’s in HSL handling where approaches differ. Because HSL is a smaller color space than RGB, in order to use it, it **requires at least 1 decimal place.** So any library that rounds out-of-the-box will produce inaccurate results (compare this library to
[color-convert] converting from RGB -> HSL and back again):

```ts
color.from(color.from([167, 214, 65]).hsl).rgbVal; // ✅ [167, 214, 65]
convert.hsl.rgb(convert.rgb.hsl(167, 214, 65)); // ❌ [168, 215, 66]
```

The reason, again, is rounding by default. This is a [known limitation of HSL][hsl], so many libraries can disable rounding with overrides, but in addition to that not being default behavior it also produces noisy results:

```ts
color.from([167, 214, 65]).hsl; // hsl(78.93, 64.5%, 54.71%)
convert.rgb.hsl.raw([167, 214, 65]); // hsl(78.9261744966443, 64.50216450216452%, 54.70588235294118%)
```

This library takes the opinion that **HSL should have RGB precision by default.** So this library generates values that support infinite conversions without quality loss that are still readable.

#### Usage

```ts
import color from 'better-color-tools';

// convert color to hex
color.from('rgb(196, 67, 43)').hex; // '#c4432b'
color.from([196, 67, 43]).hex; // '#c4432b'
color.from('rgb(196, 67, 43)').hexVal; // 0xc4432b

// convert color to rgb
color.from('#C4432B').rgb; // 'rgb(196, 67, 43)'
color.from(0xc4432b).rgb; // 'rgb(196, 67, 43)'
color.from('#C4432B').rgbVal; // [196, 67, 43, 1]

// convert color to rgba
color.from('#C4432B').rgba; // 'rgba(196, 67, 43, 1)'
color.from(0xc4432b).rgba; // 'rgba(196, 67, 43, 1)'
color.from('#C4432B').rgbaVal; // [196, 67, 43, 1]

// convert color to hsl
color.from('#C4432B').hsl; // 'hsl(9.41, 64.02%, 46.86%, 1)'
color.from(0xc4432b).hsl; // 'hsl(9.41, 64.02%, 46.86%, 1)'
color.from('#C4432B').hslVal; // [9.41, 0.6402, 0.4686, 1]

// convert color names to hex
color.from('rebeccapurple').hex; // '#663399'
```

## TODO / Roadmap

- Adding color spaces like [Adobe](https://en.wikipedia.org/wiki/Adobe_RGB_color_space) and [Rec 709](https://en.wikipedia.org/wiki/Rec._709) to allow color mixing and lightening/darkening to use different perceptual color algorithms
- This library currently only supports 8-bit RGB (web & apps); is 16-bit useful? (create an issue!)

[color-convert]: https://github.com/Qix-/color-convert
[computer-color]: https://www.youtube.com/watch?v=LKnqECcg6Gw&vl=en
[hsl]: https://en.wikipedia.org/wiki/HSL_and_HSV#Disadvantages
[number-precision]: https://github.com/nefe/number-precision
[sass-color]: https://sass-lang.com/documentation/modules/color
[sass-color-scale]: https://sass-lang.com/documentation/modules/color#scale

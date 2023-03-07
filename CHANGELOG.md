# better-color-tools

## 0.12.1

### Patch Changes

- 2ab2559: Parse Lab and LCh as Oklab and Oklch

## 0.12.0

### Minor Changes

- c3aa03c: Add Oklch functions to Sass

### Patch Changes

- c3aa03c: Improve rgb <> hex performance

## 0.11.0

### Minor Changes

- 7b8a07b: Add chroma/lightness table

## 0.10.2

### Patch Changes

- a800574: Fix TypeScript types

## 0.10.0

### Minor Changes

- c8cb79a: Add adjust() function

### Patch Changes

- 07fff97: Only allow 3, 4, 6, 8 length hex colors
- 07fff97: Fix RGB object parsing
- c8cb79a: Fix critical mix() bug with blue channel being ignored

## 0.9.1

### Patch Changes

- c8dbd0e: Fix linearRGB output consistency

## 0.9.0

### Minor Changes

- 286d114: Add WCAG 2.1 contrast ratios
- 286d114: Add lightOrDark utility
- a5fc64b: Allow object notation inputs

## 0.8.1

### Patch Changes

- 2dde7ca: Fixed implementation of Björn's gamut clipping to sRGB in Oklab

## 0.8.0

### Minor Changes

- a6f9631: Adds sRGB gamut clamping for Oklab/Oklch
- a6f9631: Improve XYZ accuracy

### Patch Changes

- a6f9631: Improved mix() function
- a6f9631: Remove luv colorspace (at least until CSS Color Module mentions it)
- a6f9631: Minor performance improvements
- a6f9631: Output oklab() and oklch() functions for CSS

## 0.7.3

### Patch Changes

- b09be1a: Fix Oklab/Oklch color() function output

## 0.7.2

### Patch Changes

- aa0e0c4: Add HWB parsing, fix HSLA parsing bug

## 0.7.1

### Patch Changes

- 5d93f00: Add Luv colorspace to mix
- 614a81e: Fix CSS names bug in silver, darkorchid, darkturqoise

## 0.7.0

### Minor Changes

- ee8f8e1: Add Luv colorspace, fix Sass bugs

## 0.6.3

### Patch Changes

- 1f108f4: fix: bug in hexVal output

## 0.6.2

### Patch Changes

- 59acc29: fix parsing bug for hex integers

## 0.6.1

### Patch Changes

- 7ecdf62: fix hex rounding error, color() fn parse error, improve perf

## 0.6.0

### Minor Changes

- 13bfe18: Reorg library around Oklab colorspace

### Patch Changes

- 4b27c6b: improve performance

## 0.5.0

### Minor Changes

- ad44c9b: Add fallback Sass function

## 0.4.0

### Minor Changes

- ffa4509: Add perceived lightness & luminance

## 0.3.1

### Patch Changes

- 913f34c: Fix gammaGradient bug for gradients with many stops

## 0.3.0

### Minor Changes

- 61062ac: Add gradient tool
- 9256660: Add Sass p3() function, improve gradient tool

## 0.2.0

### Minor Changes

- 90b85ee: Improve mix(), lighten(), and darken()

## 0.1.0

### Minor Changes

- Add P3 support

## 0.0.2

### Patch Changes

- 181de13: Improve HSL accuracy by standardizing to 2 decimal places for all 3 values (before, hue had 3; saturation & lightness had 1)

## 0.0.1

### Patch Changes

- ce992b2: Fixed hex and HSL bugs

<script lang="ts">
  import better, { colorFn } from '../lib/better.min.js';
  import Slider from './slider.svelte';

  export let color = [0, 0, 0, 1];
  export let onUpdate: (value: number[]) => void;

  function onHexChange(evt: Event): void {
    try {
      const hex = (evt.target as HTMLInputElement).value.trim();
      better.from(hex); // will throw if invalid
      onUpdate(better.from(hex).rgbVal);
    } catch {
      // ignore
    }
  }

  let cMin = 0;
  let cMax = 0.4;
  let aMin = -0.3;
  let aMax = 0.3;
  let bMin = -0.3;
  let bMax = 0.3;
  let xMin = 0;
  let xMax = 1;
  let yMin = 0;
  let yMax = 1;
  let zMin = 0;
  let zMax = 1.1;

  $: hex = better.from(color).hex;
  $: linearRGB = better.from(color).linearRGBVal;
  $: oklch = better.from(color).oklchVal;
  $: oklab = better.from(color).oklabVal;
  $: xyz = better.from(color).xyzVal;
  $: textColor = better.lightOrDark(color) === 'dark' ? 'white' : 'black';
  $: rainbow = [...new Array(360 / 8)].map((_, h) => better.from({ l: oklch[0], c: oklch[1], h: h * 8 }).hex);
  $: lrgbRGradient = [...new Array(16)].map((_, r) => better.from(colorFn('srgb-linear', [r / 16, linearRGB[1], linearRGB[2]])).hex);
  $: lrgbGGradient = [...new Array(16)].map((_, g) => better.from(colorFn('srgb-linear', [linearRGB[0], g / 16, linearRGB[2]])).hex);
  $: lrgbBGradient = [...new Array(16)].map((_, b) => better.from(colorFn('srgb-linear', [linearRGB[0], linearRGB[1], b / 16])).hex);
  $: cGradient = [...new Array(8)].map((_, c) => better.from({ l: oklab[0], c: (c / 8) * (cMax - cMin) + cMin, h: oklch[2] }).hex);
  $: lGradient = [...new Array(8)].map((_, l) => better.from({ l: l / 8, a: oklab[1], b: oklab[2] }).hex);
  $: aGradient = [...new Array(8)].map((_, a) => better.from({ l: oklab[0], a: (a / 8) * (aMax - aMin) + aMin, b: oklab[2] }).hex);
  $: bGradient = [...new Array(8)].map((_, b) => better.from({ l: oklab[0], a: oklab[1], b: (b / 8) * (bMax - bMin) + bMin }).hex);
  $: xGradient = [...new Array(8)].map((_, x) => better.from({ x: (x / 8) * (xMax - xMin) + xMin, y: xyz[1], z: xyz[2] }).hex);
  $: yGradient = [...new Array(8)].map((_, y) => better.from({ x: xyz[0], y: (y / 8) * (yMax - yMin) + yMin, z: xyz[2] }).hex);
  $: zGradient = [...new Array(8)].map((_, z) => better.from({ x: xyz[0], y: xyz[1], z: (z / 8) * (zMax - zMin) + zMin }).hex);
</script>

<div class="wrapper" style={`background-color:${hex};background-color:${better.from(color).p3};color:${textColor}`}>
  <div class="blank" />
  <div class="analyzer">
    <div class="color">
      <input class="input color-hex" type="text" maxlength="7" value={hex} on:input={onHexChange} />
      <div class="color-randomize">
        <button class="btn" type="text" on:click={() => onUpdate([Math.random(), Math.random(), Math.random(), 1])}>randomize</button>
      </div>
    </div>
    <fieldset class="colorspace colorspace--rgb">
      <legend class="colorspace-title">sRGB</legend>
      <Slider label="R" title="Red" value={color[0]} percentage onUpdate={(r) => onUpdate([r, color[1], color[2]])} bg={`linear-gradient(90deg, ${better.from([0, color[1], color[2]]).hex}, ${better.from([1, color[1], color[2]]).hex})`} />
      <Slider label="G" title="Green" value={color[1]} percentage onUpdate={(g) => onUpdate([color[0], g, color[2]])} bg={`linear-gradient(90deg, ${better.from([color[0], 0, color[2]]).hex}, ${better.from([color[0], 1, color[2]]).hex})`} />
      <Slider label="B" title="Blue" value={color[2]} percentage onUpdate={(b) => onUpdate([color[0], color[1], b])} bg={`linear-gradient(90deg, ${better.from([color[0], color[1], 0]).hex}, ${better.from([color[0], color[1], 1]).hex})`} />
      <input class="colorspace-code" readonly type="text" value={`${better.from(color).rgb} / ${better.from(color).p3}`} />
    </fieldset>
    <fieldset class="colorspace colorspace--linearrgb">
      <legend class="colorspace-title">Linear RGB (<a href="https://en.wikipedia.org/wiki/SRGB#Transfer_function_(%22gamma%22)" target="_blank">IEC transfer function</a>)</legend>
      <Slider label="R" title="Red (linear)" value={linearRGB[0]} percentage onUpdate={(r) => onUpdate(better.from(colorFn('srgb-linear', [r, linearRGB[1], linearRGB[2]])).rgbVal)} bg={`linear-gradient(90deg, ${lrgbRGradient.join(',')})`} />
      <Slider label="G" title="Green (linear)" value={linearRGB[1]} percentage onUpdate={(g) => onUpdate(better.from(colorFn('srgb-linear', [linearRGB[0], g, linearRGB[2]])).rgbVal)} bg={`linear-gradient(90deg, ${lrgbGGradient.join(',')})`} />
      <Slider label="B" title="Blue (linear)" value={linearRGB[2]} percentage onUpdate={(b) => onUpdate(better.from(colorFn('srgb-linear', [linearRGB[0], linearRGB[1], b])).rgbVal)} bg={`linear-gradient(90deg, ${lrgbBGradient.join(',')})`} />
      <input class="colorspace-code" readonly type="text" value={better.from(color).linearRGB} />
    </fieldset>
    <fieldset class="colorspace colorspace--oklch">
      <legend class="colorspace-title">OKLCH</legend>
      <Slider label="L" title="Lightness" value={oklch[0]} percentage onUpdate={(l) => onUpdate(better.from({ l, c: oklch[1], h: oklch[2] }).rgbVal)} bg={`linear-gradient(90deg, ${lGradient.join(',')})`} />
      <Slider label="C" title="Chroma" value={oklch[1]} min={cMin} max={cMax} onUpdate={(c) => onUpdate(better.from({ l: oklch[0], c, h: oklch[2] }).rgbVal)} bg={`linear-gradient(90deg, ${cGradient})`} />
      <Slider label="H" title="Hue" value={oklch[2]} min={0} max={360} onUpdate={(h) => onUpdate(better.from({ l: oklch[0], c: oklch[1], h }).rgbVal)} bg={`linear-gradient(90deg, ${rainbow.join(',')}`} />
      <input class="colorspace-code" readonly type="text" value={better.from(color).oklch} />
    </fieldset>
    <fieldset class="colorspace colorspace--oklab">
      <legend class="colorspace-title">OKLAB</legend>
      <Slider label="L" title="Lightness" value={oklab[0]} percentage onUpdate={(l) => onUpdate(better.from({ l, a: oklab[1], b: oklab[2] }).rgbVal)} bg={`linear-gradient(90deg, ${lGradient.join(',')})`} />
      <Slider label="a" title="Red / Green" value={oklab[1]} min={aMin} max={aMax} onUpdate={(a) => onUpdate(better.from({ l: oklab[0], a, b: oklab[2] }).rgbVal)} bg={`linear-gradient(90deg, ${aGradient.join(',')})`} />
      <Slider label="b" title="Blue / Yellow" value={oklab[2]} min={bMin} max={bMax} onUpdate={(b) => onUpdate(better.from({ l: oklab[0], a: oklab[1], b }).rgbVal)} bg={`linear-gradient(90deg, ${bGradient.join(',')})`} />
      <input class="colorspace-code" readonly type="text" value={better.from(color).oklab} />
    </fieldset>
    <fieldset class="colorspace colorspace--xyz">
      <legend class="colorspace-title">XYZ</legend>
      <Slider label="X" value={xyz[0]} percentage min={xMin} max={xMax} onUpdate={(x) => onUpdate(better.from({ x, y: xyz[1], z: xyz[2] }).rgbVal)} bg={`linear-gradient(90deg, ${xGradient.join(',')})`} />
      <Slider label="Y" value={xyz[1]} percentage min={yMin} max={yMax} onUpdate={(y) => onUpdate(better.from({ x: xyz[0], y, z: xyz[2] }).rgbVal)} bg={`linear-gradient(90deg, ${yGradient.join(',')})`} />
      <Slider label="Z" value={xyz[2]} percentage min={zMin} max={zMax} onUpdate={(z) => onUpdate(better.from({ x: xyz[0], y: xyz[1], z }).rgbVal)} bg={`linear-gradient(90deg, ${zGradient.join(',')}`} />
      <input class="colorspace-code" readonly type="text" value={better.from(color).xyz} />
    </fieldset>
  </div>
</div>

<style lang="scss">
  a {
    color: inherit;
  }

  .wrapper {
    display: grid;
    grid-template-columns: 1fr 1fr;
    min-height: calc(100vh - 3rem);
    transition: color 200ms linear;
  }

  .analyzer {
    padding: 2rem;
    position: relative;
  }

  .color {
    align-items: center;
    display: flex;

    &-hex {
      font-size: 24px;
    }
  }

  .colorspace {
    border: none;
    display: block;
    margin: 1rem 0 0;
    padding: 0;

    &-title {
      display: block;
      font-size: 12px;
      letter-spacing: 0.0625em;
      margin: 0 0 0.5rem;
      padding: 0;
    }

    &-code {
      background: none;
      border: none;
      color: inherit;
      font-family: var(--font-mono);
      font-size: 12px;
      font-weight: 300;
      margin-top: 0.5rem;
      outline: none;
      padding: 0;
      width: 100%;
    }
  }
</style>

<script lang="ts">
  import Slider from './slider.svelte';
  import better from '../lib/better.min.js';

  export let color: number[];
  export let onUpdate: (value: number[]) => void;

  let cMin = 0;
  let cMax = 0.4;

  function onHexChange(evt: Event): void {
    try {
      let hex = (evt.target as HTMLInputElement).value.trim();
      if (hex.length !== 7) return;
      const inputColor = better.from(hex).rgbVal;
      onUpdate(inputColor);
    } catch {
      // ignore
    }
  }

  $: oklch = better.from(color).oklchVal;
  $: lGradient = [...new Array(8)].map((_, l) => better.from({ l: l / 8, c: oklch[1], h: oklch[2] }).hex);
  $: cGradient = [...new Array(8)].map((_, c) => better.from({ l: oklch[0], c: (c / 8) * (cMax - cMin) + cMin, h: oklch[2] }).hex);
  $: rainbow = [...new Array(360 / 8)].map((_, h) => better.from({ l: oklch[0], c: oklch[1], h: h * 8 }).hex);
</script>

<div class="picker">
  <fieldset class="colorspace">
    <legend class="title">OKLCH</legend>
    <Slider label="L" title="Lightness" value={oklch[0]} percentage onUpdate={(l) => onUpdate(better.from({ l, c: oklch[1], h: oklch[2] }).rgbVal)} bg={`linear-gradient(90deg, ${lGradient.join(',')})`} />
    <Slider label="C" title="Chroma" value={oklch[1]} min={cMin} max={cMax} onUpdate={(c) => onUpdate(better.from({ l: oklch[0], c, h: oklch[2] }).rgbVal)} bg={`linear-gradient(90deg, ${cGradient})`} />
    <Slider label="H" title="Hue" value={oklch[2]} min={0} max={360} onUpdate={(h) => onUpdate(better.from({ l: oklch[0], c: oklch[1], h }).rgbVal)} bg={`linear-gradient(90deg, ${rainbow.join(',')}`} />
  </fieldset>
  <input class="hex" type="text" value={better.from(color).hex} on:input={onHexChange} />
</div>

<style lang="scss">
  .colorspace {
    appearance: none;
    border: none;
    display: block;
    margin-bottom: 0.5rem;
    padding: 0;
  }

  .title {
    margin: 0;
    padding: 0 0 0.5rem;
  }

  .hex {
    background: none;
    border-color: currentColor;
    border-radius: 0;
    border-style: solid;
    border-width: 0 0 1px 0;
    color: inherit;
    font-family: var(--font-mono);
    font-size: 0.75rem;
    line-height: 1.5;
    padding: 0;
    text-indent: 0.25em;
    width: 5em;

    &:focus {
      outline: none;
    }
  }
</style>

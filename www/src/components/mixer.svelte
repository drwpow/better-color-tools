<script lang="ts">
  import better from '../lib/better.min.js';
  import Slider from './slider.svelte';
  import Stepper from './stepper.svelte';

  // props
  export let from: number[];
  export let to: number[];
  export let onUpdate: (from: number[], to: number[]) => void;

  // state
  let steps = 9;

  // dynamic
  $: ramp = {
    oklab: [...new Array(steps)].map((_, i) => better.mix(from, to, i / (steps - 1)).hex),
    oklch: [...new Array(steps)].map((_, i) => better.mix(from, to, i / (steps - 1), 'oklch').hex),
    srgb: [...new Array(steps)].map((_, i) => better.mix(from, to, i / (steps - 1), 'sRGB').hex),
    linearRGB: [...new Array(steps)].map((_, i) => better.mix(from, to, i / (steps - 1), 'linearRGB').hex),
    lms: [...new Array(steps)].map((_, i) => better.mix(from, to, i / steps - 1, 'lms').hex),
  };

  function onHexChange(evt: Event, target: 'from' | 'to'): void {
    try {
      let hex = (evt.target as HTMLInputElement).value.trim();
      if (hex.length !== 7) return;
      const inputColor = better.from(hex).rgbVal;
      if (target === 'from') onUpdate(inputColor, to);
      else if (target === 'to') onUpdate(from, inputColor);
    } catch {}
  }
</script>

<main class="wrapper">
  <header class="settings">
    <fieldset class="group group--picker">
      <legend>From</legend>
      <div class="color">
        <input type="text" class="input color-hex" maxlength="7" value={better.from(from).hex} on:input={(evt) => onHexChange(evt, 'from')} />
        <button class="btn" type="button" on:click={() => onUpdate([Math.random(), Math.random(), Math.random(), 1], to)}>randomize</button>
      </div>
      <Slider label="R" title="Red" value={from[0]} percentage onUpdate={(r) => onUpdate([r, from[1], from[2]], to)} bg={`linear-gradient(90deg, ${better.from([0, from[1], from[2]]).hex}, ${better.from([1, from[1], from[2]]).hex})`} />
      <Slider label="G" title="Green" value={from[1]} percentage onUpdate={(g) => onUpdate([from[0], g, from[2]], to)} bg={`linear-gradient(90deg, ${better.from([from[0], 0, from[2]]).hex}, ${better.from([from[0], 1, from[2]]).hex})`} />
      <Slider label="B" title="Blue" value={from[2]} percentage onUpdate={(b) => onUpdate([from[0], from[1], b], to)} bg={`linear-gradient(90deg, ${better.from([from[0], from[1], 0]).hex}, ${better.from([from[0], from[1], 1]).hex})`} />
    </fieldset>
    <fieldset class="group group--picker">
      <legend>To</legend>
      <div class="color">
        <input type="text" class="input color-hex" maxlength="7" value={better.from(to).hex} on:input={(evt) => onHexChange(evt, 'to')} />
        <button class="btn" type="button" on:click={() => onUpdate(from, [Math.random(), Math.random(), Math.random(), 1])}>randomize</button>
      </div>
      <Slider label="R" title="Red" value={to[0]} percentage onUpdate={(r) => onUpdate(from, [r, to[1], to[2]])} bg={`linear-gradient(90deg, ${better.from([0, to[1], to[2]]).hex}, ${better.from([1, to[1], to[2]]).hex})`} />
      <Slider label="G" title="Green" value={to[1]} percentage onUpdate={(g) => onUpdate(from, [to[0], g, to[2]])} bg={`linear-gradient(90deg, ${better.from([to[0], 0, to[2]]).hex}, ${better.from([to[0], 1, to[2]]).hex})`} />
      <Slider label="B" title="Blue" value={to[2]} percentage onUpdate={(b) => onUpdate(from, [to[0], to[1], b])} bg={`linear-gradient(90deg, ${better.from([to[0], to[1], 0]).hex}, ${better.from([to[0], to[1], 1]).hex})`} />
    </fieldset>
    <fieldset class="group group--other">
      <Stepper id="steps" label="Steps" min={3} max={100} value={steps} onChange={(v) => (steps = v)} />
    </fieldset>
  </header>

  <section class="colorspace">
    <h3>OKLAB (best)</h3>
    <ul class="ramp">
      {#each ramp.oklab as step}
        <li class="swatch ramp-swatch" aria-label={step} style={`background-color:${step};color:${better.lightOrDark(step) === 'dark' ? 'white' : 'black'}`}>{step}</li>
      {/each}
    </ul>
  </section>

  <section class="colorspace">
    <h3>OKLCH</h3>
    <ul class="ramp">
      {#each ramp.oklch as step}
        <li class="swatch ramp-swatch" aria-label={step} style={`background-color:${step};color:${better.lightOrDark(step) === 'dark' ? 'white' : 'black'}`}>{step}</li>
      {/each}
    </ul>
  </section>

  <section class="colorspace">
    <h3>sRGB</h3>
    <ul class="ramp">
      {#each ramp.srgb as step}
        <li class="swatch ramp-swatch" aria-label={step} style={`background-color:${step};color:${better.lightOrDark(step) === 'dark' ? 'white' : 'black'}`}>{step}</li>
      {/each}
    </ul>
  </section>

  <section class="colorspace">
    <h3>Linear RGB</h3>
    <ul class="ramp">
      {#each ramp.linearRGB as step}
        <li class="swatch ramp-swatch" aria-label={step} style={`background-color:${step};color:${better.lightOrDark(step) === 'dark' ? 'white' : 'black'}`}>{step}</li>
      {/each}
    </ul>
  </section>

  <section class="colorspace">
    <h3>LMS</h3>
    <ul class="ramp">
      {#each ramp.lms as step}
        <li class="swatch ramp-swatch" aria-label={step} style={`background-color:${step};color:${better.lightOrDark(step) === 'dark' ? 'white' : 'black'}`}>{step}</li>
      {/each}
    </ul>
  </section>
</main>

<style lang="scss">
  .settings {
    display: grid;
    grid-gap: 2rem;
    padding: 0 1rem;

    @media (min-width: 800px) {
      grid-template-columns: 1fr 1fr 9rem;
    }
  }

  legend {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.0625em;
    display: block;
    margin: 0 0 0.25rem;
    padding: 0;
  }

  .group {
    -webkit-appearance: none;
    appearance: none;
    border: none;
    margin: 0;
    padding: 0;
  }

  .color {
    align-items: center;
    display: flex;
    margin-bottom: 0.5rem;

    &-hex {
      font-size: 18px;
    }
  }

  .ramp {
    display: flex;
    height: 6rem;
    overflow-x: auto;
    list-style: none;
    padding: 0;
    width: 100%;

    &-swatch {
      flex: 1 1;

      &::before {
        content: counter(step);
      }
    }
  }

  .colorspace {
    margin: 1rem 0;
    width: 100%;

    h3 {
      font-size: 20px;
      font-weight: 400;
      margin: 0 0 0.5rem 1rem;
    }
  }
</style>

<script lang="ts">
  import better from '../lib/better.min.js';
  import Picker from './picker.svelte';
  import EditableRamp from './editable-ramp.svelte';

  let bg = [1, 1, 1, 1];
  let pickerOpen = false;
  let colors: Record<number, number[]>[] = [
    {
      10: better.from('#030017').rgbVal,
      15: better.from('#07042a').rgbVal,
      20: better.from('#0c0e3d').rgbVal,
      25: better.from('#111953').rgbVal,
      30: better.from('#172568').rgbVal,
      40: better.from('#223e98').rgbVal,
      50: better.from('#2d58ca').rgbVal,
      60: better.from('#3874fe').rgbVal,
      70: better.from('#6b9bff').rgbVal,
      80: better.from('#9cbeff').rgbVal,
      85: better.from('#b5ceff').rgbVal,
      90: better.from('#cedfff').rgbVal,
      95: better.from('#e6efff').rgbVal,
      100: better.from('#ffffff').rgbVal,
    },
    {
      10: better.from('#01001a').rgbVal,
      15: better.from('#000a23').rgbVal,
      20: better.from('#00182c').rgbVal,
      25: better.from('#002633').rgbVal,
      30: better.from('#00353b').rgbVal,
      40: better.from('#00544d').rgbVal,
      50: better.from('#00755e').rgbVal,
      60: better.from('#00976e').rgbVal,
      70: better.from('#51b48e').rgbVal,
      80: better.from('#80d1af').rgbVal,
      85: better.from('#97e0c0').rgbVal,
      90: better.from('#adefd2').rgbVal,
      95: better.from('#c2fee3').rgbVal,
      100: better.from('#ffffff').rgbVal,
    },
  ];
</script>

<div class="wrapper" style={`--color-bg: ${better.from(bg).hex}; --color-fg: ${better.lightOrDark(bg) === 'light' ? '#000' : '#fff'};background:var(--color-bg);color:var(--color-fg);`}>
  <div class="bg-select">
    Background <button class="bg" type="button" on:click={() => (pickerOpen = true)}>{better.from(bg).hex}</button>{#if pickerOpen}<div class="picker">
        <Picker
          color={bg}
          onUpdate={(newBg) => {
            bg = newBg;
          }}
        />
      </div>
      <div class="picker-overlay" on:click={() => (pickerOpen = false)} />{/if}
  </div>
  {#each colors as ramp, i}
    <EditableRamp
      {ramp}
      onUpdate={(newRamp) => {
        colors[i] = newRamp;
        colors = colors;
      }}
      onDelete={() => {
        colors.splice(i, 1);
        colors = colors;
      }}
    />
  {/each}
  <div class="menu">
    <button
      class="add"
      type="button"
      on:click={() => {
        const base = better.from({ l: 0.6, c: 0.4, h: Math.random() * 360 }).rgbVal;
        const dark = better.from(base).adjust({ lightness: 0.1 }).rgbVal;
        const light = better.from(base).adjust({ lightness: 1 }).rgbVal;

        colors.push({
          10: dark,
          15: better.mix(dark, base, 5 / 50).rgbVal,
          20: better.mix(dark, base, 10 / 50).rgbVal,
          25: better.mix(dark, base, 15 / 50).rgbVal,
          30: better.mix(dark, base, 20 / 50).rgbVal,
          40: better.mix(dark, base, 30 / 50).rgbVal,
          50: better.mix(dark, base, 40 / 50).rgbVal,
          60: base,
          70: better.mix(base, light, 10 / 40).rgbVal,
          80: better.mix(base, light, 20 / 40).rgbVal,
          85: better.mix(base, light, 25 / 40).rgbVal,
          90: better.mix(base, light, 30 / 40).rgbVal,
          95: better.mix(base, light, 35 / 40).rgbVal,
          100: light,
        });
        colors = colors;
      }}>+</button
    >
  </div>
</div>

<style lang="scss">
  .bg-select {
    align-items: center;
    display: flex;
    cursor: pointer;
    gap: 0.5rem;
    justify-content: center;
    padding-bottom: 0.5rem;
    padding-left: 1rem;
    padding-right: 1rem;
    padding-top: 0.5rem;
    position: relative;
  }

  .bg {
    background: none;
    border: 1px solid currentColor;
    border-radius: 0.25rem;
    color: inherit;
    font-family: var(--font-mono);
    font-size: 12px;
    padding: 0.125rem 0.25rem;
  }

  .picker {
    border: 1px solid currentColor;
    background-color: var(--color-bg);
    position: absolute;
    padding: 1rem;
    top: 100%;
    width: 30rem;
    z-index: 110;
  }

  .picker-overlay {
    height: 100%;
    left: 0;
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 100;
  }

  .menu {
    display: flex;
    justify-content: flex-end;
    margin-top: 1rem;
    padding-bottom: 2rem;
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .add {
    align-items: center;
    background: none;
    border: 1px solid currentColor;
    border-radius: 50%;
    color: inherit;
    cursor: pointer;
    display: flex;
    font-size: 18px;
    height: 1.25em;
    justify-content: center;
    line-height: 1.25;
    padding: 0;
    width: 1.25em;

    &:hover {
      background: rgba(0, 0, 0, 0.2);
    }
  }

  .wrapper {
    min-height: calc(100vh - 3.25rem);
  }
</style>

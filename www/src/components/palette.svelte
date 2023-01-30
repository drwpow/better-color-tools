<script lang="ts">
  import better from '../lib/better.min.js';
  import Picker from './picker.svelte';
  import EditableRamp from './editable-ramp.svelte';

  let bg = [1, 1, 1, 1];
  let pickerOpen = false;
  let colors = [
    [
      [1 / 255, 20 / 255, 34 / 255, 1],
      [4 / 255, 35 / 255, 65 / 255, 1],
      [13 / 255, 50 / 255, 99 / 255, 1],
      [23 / 255, 66 / 255, 136 / 255, 1],
      [34 / 255, 83 / 255, 174 / 255, 1],
      [46 / 255, 100 / 255, 214 / 255, 1],
      [57 / 255, 117 / 255, 255 / 255, 1],
      [108 / 255, 156 / 255, 255 / 255, 1],
      [157 / 255, 190 / 255, 255 / 255, 1],
      [206 / 255, 223 / 255, 255 / 255, 1],
      [1, 1, 1, 1],
    ],
    [
      [0, 2 / 255, 27 / 255, 1],
      [0, 21 / 255, 40 / 255, 1],
      [0, 43 / 255, 52 / 255, 1],
      [0, 66 / 255, 65 / 255, 1],
      [0, 90 / 255, 79 / 255, 1],
      [0, 115 / 255, 91 / 255, 1],
      [9 / 255, 141 / 255, 103 / 255, 1],
      [95 / 255, 169 / 255, 139 / 255, 1],
      [150 / 255, 198 / 255, 176 / 255, 1],
      [203 / 255, 226 / 255, 215 / 255, 1],
      [1, 1, 1, 1],
    ],
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
      colors={ramp}
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
        const random = better.from({ l: 0.6, c: 0.4, h: Math.random() * 360 }).rgbVal;
        const dark = better.from(random).adjust({ lightness: 0.1 }).rgbVal;
        const light = [1, 1, 1, 1];
        colors.push([
          dark,
          better.mix(dark, random, 1 / 6).rgbVal,
          better.mix(dark, random, 2 / 6).rgbVal,
          better.mix(dark, random, 3 / 6).rgbVal,
          better.mix(dark, random, 4 / 6).rgbVal,
          better.mix(dark, random, 5 / 6).rgbVal,
          random,
          better.mix(random, light, 1 / 4).rgbVal,
          better.mix(random, light, 2 / 4).rgbVal,
          better.mix(random, light, 3 / 4).rgbVal,
          [1, 1, 1, 1],
        ]);
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

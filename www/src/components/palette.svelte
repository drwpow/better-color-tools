<script lang="ts">
  import better from '../lib/better.min.js';
  import Picker from './picker.svelte';
  import EditableRamp from './editable-ramp.svelte';

  let bg = [1, 1, 1, 1];
  let pickerOpen = false;
  let colors = [
    [
      better.from('#030017').rgbVal,
      better.from('#0c0e3d').rgbVal,
      better.from('#172568').rgbVal,
      better.from('#223e98').rgbVal,
      better.from('#2d58ca').rgbVal,
      better.from('#3874fe').rgbVal,
      better.from('#6b9bff').rgbVal,
      better.from('#9cbeff').rgbVal,
      better.from('#cedfff').rgbVal,
      better.from('#ffffff').rgbVal,
    ],
    [
      better.from('#01001a').rgbVal,
      better.from('#00182c').rgbVal,
      better.from('#00353b').rgbVal,
      better.from('#00544d').rgbVal,
      better.from('#00755e').rgbVal,
      better.from('#00976e').rgbVal,
      better.from('#51b48e').rgbVal,
      better.from('#80d1af').rgbVal,
      better.from('#adefd2').rgbVal,
      better.from('#ffffff').rgbVal,
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
          better.mix(dark, random, 1 / 5).rgbVal,
          better.mix(dark, random, 2 / 5).rgbVal,
          better.mix(dark, random, 3 / 5).rgbVal,
          better.mix(dark, random, 4 / 5).rgbVal,
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

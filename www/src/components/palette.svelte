<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import better from '../lib/better.min.js';
  import Picker from './picker.svelte';
  import EditableRamp from './editable-ramp.svelte';
  import Export from './export.svelte';

  let bg = [1, 1, 1, 1];
  let pickerOpen = false;
  let exportOpen = false;
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

  function onKeydown(evt: KeyboardEvent) {
    if (evt.key === 'Escape') {
      pickerOpen = false;
      exportOpen = false;
    }
  }

  onMount(() => {
    if (typeof document !== 'undefined') {
      document.body.addEventListener('keydown', onKeydown);
    }
  });
  onDestroy(() => {
    if (typeof document !== 'undefined') {
      document.body.removeEventListener('keydown', onKeydown);
    }
  });
</script>

<div class="wrapper" style={`--color-bg: ${better.from(bg).hex}; --color-fg: ${better.lightOrDark(bg) === 'light' ? '#000' : '#fff'};background:var(--color-bg);color:var(--color-fg);`}>
  <div class="header">
    <div />
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
    <div class="export">
      <button class="export-btn" type="button" on:click={() => (exportOpen = true)}
        >Export
        <svg class="icon-share" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
          ><path
            d="M11,6 C11.5523,6 12,6.44772 12,7 C12,7.55228 11.5523,8 11,8 L5,8 L5,19 L16,19 L16,13 C16,12.4477 16.4477,12 17,12 C17.5523,12 18,12.4477 18,13 L18,19 C18,20.1046 17.1046,21 16,21 L5,21 C3.89543,21 3,20.1046 3,19 L3,8 C3,6.89543 3.89543,6 5,6 L11,6 Z M20,3 C20.5523,3 21,3.44772 21,4 L21,4 L21,9 C21,9.55228 20.5523,10 20,10 C19.4477,10 19,9.55228 19,9 L19,9 L19,6.41421 L10.7071,14.7071 C10.3166,15.0976 9.68342,15.0976 9.29289,14.7071 C8.90237,14.3166 8.90237,13.6834 9.29289,13.2929 L9.29289,13.2929 L17.5858,5 L15,5 C14.4477,5 14,4.55229 14,4 C14,3.44772 14.4477,3 15,3 L15,3 Z"
          /></svg
        >
      </button>
      {#if exportOpen}<div class="export-menu">
          <button type="button" class="close" on:click={() => (exportOpen = false)}>✕</button>
          <Export {colors} />
        </div>
        <div class="export-menu-overlay" on:click={() => (exportOpen = false)} />{/if}
    </div>
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

  .close {
    align-items: center;
    -webkit-appearance: none;
    appearance: none;
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    display: flex;
    font: inherit;
    height: 2rem;
    justify-content: center;
    padding: 0;
    position: absolute;
    right: 0;
    top: 0;
    width: 2rem;
  }

  .export {
    display: flex;
    justify-content: flex-end;
  }

  .export-btn {
    align-items: center;
    background-color: var(--color-bg);
    border-radius: 0.25rem;
    border: 1px solid currentColor;
    color: var(--color-fg);
    cursor: pointer;
    display: inline-flex;
    font-family: var(--font-sans);
    gap: 0.25em;
    font-size: 14px;
    line-height: 1;
    padding: 0.375em 0.625em;

    &:hover {
      background-color: #ececec;
    }
  }

  .export-menu {
    border: 1px solid currentColor;
    background-color: var(--color-bg);
    display: flex;
    flex-direction: column;
    height: 75vh;
    left: 50%;
    margin-left: auto;
    margin-right: auto;
    max-width: 100%;
    overflow: hidden;
    padding: 1.5rem;
    position: fixed;
    top: 50%;
    transform: translate3d(-50%, -50%, 0);
    width: 40rem;
    z-index: 200;
  }

  .export-menu-overlay {
    height: 100%;
    left: 0;
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 199;
  }

  .header {
    align-items: center;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    justify-content: center;
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .icon-share {
    fill: currentColor;
    height: 1rem;
    width: 1rem;
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

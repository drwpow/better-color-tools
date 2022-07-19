<script lang="ts">
  import { round } from '../lib/better.min.js';
  import { onMount, onDestroy } from 'svelte';

  // props
  export let label = '';
  export let value = 0;
  export let max = 1;
  export let min = 0;
  export let title: string | undefined = undefined;
  export let bg = '';
  export let percentage = false;
  export let onUpdate: (value: number) => void;

  // internal
  let sliderEl: HTMLDivElement;
  let isDragging = false;

  // derivative
  $: scale = max - min;
  $: precision = scale > 1 || percentage ? 2 : 5;
  $: displayValue = round((percentage ? 100 : 1) * value, precision);
  $: delta = sliderEl ? ((value - min) / scale) * sliderEl.getBoundingClientRect().width - 2 : min;

  function inputHandler(evt: Event) {
    if (!evt.target || typeof onUpdate !== 'function') return;
    let val = parseFloat((evt.target as HTMLInputElement).value);
    if (Number.isNaN(val)) return;
    if (percentage) val /= 100;
    val = Math.max(min, Math.min(max, val));
    onUpdate(val);
  }

  function onKeyDown(evt: Event) {
    console.log({ evt });
  }

  function onStartDrag() {
    isDragging = true;
    if (sliderEl) document.body.classList.add('is-dragging');
  }

  function onEndDrag() {
    isDragging = false;
    if (sliderEl) document.body.classList.remove('is-dragging');
  }

  function onDrag(evt: Event) {
    if (isDragging === false) return;
    const { left, width } = sliderEl.getBoundingClientRect();
    const pos = (scale * ((evt as MouseEvent).clientX - left)) / width + min;
    onUpdate(Math.max(min, Math.min(max, pos)));
  }

  function onClick(evt: Event) {
    if (evt.target instanceof HTMLButtonElement) return;
    const { left, width } = sliderEl.getBoundingClientRect();
    const pos = (scale * ((evt as MouseEvent).clientX - left)) / width + min;
    onUpdate(Math.max(min, Math.min(max, pos)));
  }

  onMount(() => {
    document.body.addEventListener('mousemove', onDrag);
    document.body.addEventListener('touchmove', onDrag);
    document.body.addEventListener('mouseup', onEndDrag);
    document.body.addEventListener('touchend', onEndDrag);
  });

  onDestroy(() => {
    if (typeof document === 'object') {
      document.body.removeEventListener('mousemove', onDrag);
      document.body.removeEventListener('touchmove', onDrag);
      document.body.removeEventListener('mouseup', onEndDrag);
      document.body.removeEventListener('touchend', onEndDrag);
    }
  });
</script>

<div class="wrapper">
  <label class="label" for={`input-${label}`} {title}>{label}</label>
  <div class="slider" style={`background:${bg}`} on:click={onClick} bind:this={sliderEl}>
    <button type="button" class="slider-handle" style={`transform:translateX(${delta}px)`} {value} on:mousedown={onStartDrag} on:touchstart={onStartDrag} tabindex="-1" />
  </div>
  <div class="value">
    <input id={`input-${label}`} class="input" type="text" inputmode="digit" value={displayValue} on:input={inputHandler} />
    {#if percentage}%{/if}
  </div>
</div>

<style lang="scss">
  .wrapper {
    align-items: center;
    display: grid;
    grid-gap: 1.5rem;
    grid-template-columns: min-content auto min-content;
  }

  .label {
    font-size: 12px;
    font-weight: 500;
    width: 0.5rem;
  }

  .slider {
    border-radius: 1rem;
    cursor: pointer;
    height: 8px;
    position: relative;
    width: 100%;

    &-handle {
      -webkit-appearance: none;
      appearance: none;
      background: none;
      border: 1px solid currentColor;
      border-radius: 50%;
      color: inherit;
      cursor: grab;
      display: block;
      height: 1rem;
      left: -6px;
      padding: 0;
      position: absolute;
      top: -4px;
      width: 1rem;
    }
    // -webkit-appearance: none;
    // appearance: none;
    // background: none;

    // &::-webkit-slider-runnable-track,
    // &::-moz-range-track {
    //   background: tomato;
    //   border-radius: 1rem;
    //   height: 5px;
    // }

    // states
    &.is-dragging {
      cursor: grabbing;
    }
  }

  .value {
    align-items: center;
    display: flex;
    justify-content: space-between;
    grid-gap: 0.5rem;
    width: 5.5rem;
  }

  .input {
    background: none;
    border: 1px solid currentColor;
    color: inherit;
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 300;
    height: 20px;
    line-height: 20px;
    max-width: 4rem;
    padding: 0;
    text-indent: 4px;
  }

  :global(body.is-dragging, body.is-dragging *) {
    cursor: grabbing !important;
  }
</style>

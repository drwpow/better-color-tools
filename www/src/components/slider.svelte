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
  export let vertical = false;

  // internal
  let sliderEl: HTMLDivElement;
  let isDragging = false;
  let pos = `translate3d(0, 0, 0)`;

  // derivative
  $: scale = max - min;
  $: precision = scale > 1 || percentage ? 2 : 5;
  $: displayValue = round((percentage ? 100 : 1) * value, precision);
  $: {
    if (sliderEl) {
      const delta = (value - min) / scale;
      pos = vertical ? `translate3d(0, ${-(delta * sliderEl.getBoundingClientRect().height - 2)}px, 0)` : `translate3d(${delta * sliderEl.getBoundingClientRect().width - 2}px, 0, 0)`;
    }
  }

  function inputHandler(evt: Event) {
    if (!evt.target || typeof onUpdate !== 'function') return;
    let val = parseFloat((evt.target as HTMLInputElement).value);
    if (Number.isNaN(val)) return;
    if (percentage) val /= 100;
    val = Math.max(min, Math.min(max, val));
    onUpdate(val);
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
    if (vertical) {
      const { bottom, height } = sliderEl.getBoundingClientRect();
      const pos = (scale * (bottom - (evt as MouseEvent).clientY)) / height + min;
      onUpdate(Math.max(min, Math.min(max, pos)));
    } else {
      const { left, width } = sliderEl.getBoundingClientRect();
      const pos = (scale * ((evt as MouseEvent).clientX - left)) / width + min;
      onUpdate(Math.max(min, Math.min(max, pos)));
    }
  }

  function onClick(evt: Event) {
    if (evt.target instanceof HTMLButtonElement) return;
    if (vertical) {
      const { bottom, height } = sliderEl.getBoundingClientRect();
      const pos = (scale * (bottom - (evt as MouseEvent).clientY)) / height + min;
      onUpdate(Math.max(min, Math.min(max, pos)));
    } else {
      const { left, width } = sliderEl.getBoundingClientRect();
      const pos = (scale * ((evt as MouseEvent).clientX - left)) / width + min;
      onUpdate(Math.max(min, Math.min(max, pos)));
    }
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

<div class="wrapper" data-vertical={vertical || undefined}>
  <label class="label" for={`input-${label}`} {title}>{label}</label>
  <div class="slider" style={`background:${bg}`} on:click={onClick} bind:this={sliderEl}>
    <button type="button" class="slider-handle" style={`transform:${pos}`} {value} on:mousedown={onStartDrag} on:touchstart={onStartDrag} tabindex="-1" />
  </div>
  <div class="value">
    <input id={`input-${label}`} class="input" type="text" inputmode="digit" value={displayValue} on:input={inputHandler} />
    {#if percentage}<div class="value-percentage">%</div>{/if}
  </div>
</div>

<style lang="scss">
  .wrapper {
    align-items: center;
    display: grid;
    grid-gap: 1.5rem;
    grid-template-columns: min-content auto min-content;

    &[data-vertical='true'] {
      align-items: stretch;
      justify-items: center;
      grid-template-columns: 1fr;
      grid-template-rows: min-content auto min-content;
    }
  }

  .label {
    font-size: 12px;
    font-weight: 500;
    width: 0.5rem;
  }

  .slider {
    border-radius: 1rem;
    cursor: pointer;
    min-height: 8px;
    height: 8px;
    position: relative;
    min-width: 8rem;
    width: 100%;

    .wrapper[data-vertical='true'] & {
      min-height: 8rem;
      height: 100%;
      min-width: 8px;
      width: 8px;
    }

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

      .wrapper[data-vertical='true'] & {
        bottom: -6px;
        left: -4px;
        top: auto;
      }
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
    justify-content: flex-start;
    width: 5.5rem;

    &-percentage {
      font-family: var(--font-mono);
      font-size: 12px;
      margin-left: 0.375rem;
    }

    .wrapper[data-vertical='true'] & {
      justify-content: center;
    }
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
    margin: 0;
    max-width: 4rem;
    padding: 0;
    text-indent: 4px;
  }

  :global(body.is-dragging, body.is-dragging *) {
    cursor: grabbing !important;
  }
</style>

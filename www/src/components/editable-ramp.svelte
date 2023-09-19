<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import better, { round } from '../lib/better.min.js';
  import AreaChart from './area-chart.svelte';
  import Picker from './picker.svelte';

  // props
  export let ramp: Record<string, number[]>;
  export let onUpdate: (ramp: Record<string, number[]>) => void;
  export let onDelete: () => void;

  // state
  let panel = {
    l: false,
    c: false,
    h: false,
  };

  $: sortedRamp = Object.entries(ramp).map<[number, number[]]>(([id, color]) => [parseInt(id, 10), color]);
  $: sortedRamp.sort((a, b) => a[0] - b[0]);

  let colorPickerOpen: Record<string, boolean> = {};
  let baseID = 60; // the most saturated colors are at ~60% lightness in Oklch. We’ll get the best results focusing on this benchmark.
  let lightnessChartLines = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
  let chromaChartLines = [0.1, 0.2, 0.3, 0.4];
  let chartW = 800;
  let chartH = 160;
  let hRangeMin = 30; // always show at least +/- 30°

  $: base = ramp[baseID];
  $: baseIDI = sortedRamp.findIndex(([id]) => id === baseID);
  $: lowID = Math.min(...Object.keys(ramp).map((id) => parseInt(id, 10) || Infinity));
  $: highID = Math.max(...Object.keys(ramp).map((id) => parseInt(id, 10) || -Infinity));
  $: baseLCH = better.from(base).oklchVal;
  $: hex = sortedRamp.map(([id, color]) => better.from(color).hex);
  $: lchVal = sortedRamp.map(([id, color]) => better.from(color).oklchVal);
  $: cDelta = lchVal.map((c) => c[1] - baseLCH[1]);
  $: hDelta = lchVal.map((c) => {
    const delta = c[2] - baseLCH[2];
    if (delta < -180) return delta + 360; // always show shortest path to Hue degree (e.g. prefer -1° over 359°)
    if (delta > 180) return delta - 360;
    return delta;
  });
  $: hMin = Math.min(...lchVal.map(([, , h]) => h));
  $: hMax = Math.max(...lchVal.map(([, , h]) => h));
  $: hRange = Math.max(Math.max(Math.abs(baseLCH[2] - hMin), Math.abs(baseLCH[2] - hMax)), hRangeMin);

  onMount(() => {
    if (typeof window !== 'undefined') {
      chartW = window.innerWidth - 180;
    }
    // only once on mount, apply more advanced color smoothing to newly-created color ramps
    updateRamp(ramp);
  });

  // methods
  function sign(n: number): string {
    return n >= 0 ? `+${n}` : String(n);
  }

  function updateRamp(ramp: Record<string, number[]>) {
    const colors = Object.keys(ramp).map((id) => parseInt(id, 10));
    const nextRamp: Record<string, number[]> = {};

    for (const id of colors) {
      if (id === lowID || id === baseID || id === highID) {
        nextRamp[id] = ramp[id];
        continue;
      }
      if (id < baseID) {
        const progress = (id - lowID) / (baseID - lowID);
        nextRamp[id] = better.mix(ramp[lowID], base, progress).rgbVal;
      } else {
        const lastC = lchVal[lchVal.length - 1];
        const lDelta = lastC[0] - baseLCH[0];
        const progress = (id - baseID) / (highID - baseID);
        const nextColor = better.mix(base, ramp[highID], progress);
        // colors get washed out while mixing lighter, however, if we try and keep saturation, it results in awkward steps
        // split the difference (average) between base chroma and the LAB-mixed chroma. Results in slightly-more-saturated colors
        // but without completely throwing it out of whack
        const avgChroma = (baseLCH[1] + nextColor.oklchVal[1]) / 2;
        nextRamp[id] = better.from({ l: baseLCH[0] + lDelta * progress, c: avgChroma, h: baseLCH[2] }).rgbVal;
      }
    }

    // TODO: allow per-stop tweaks of HCL
    onUpdate(nextRamp);
  }

  function onKeydown(evt: KeyboardEvent) {
    if (evt.key === 'Escape') {
      for (const id of Object.keys(colorPickerOpen)) {
        colorPickerOpen[id] = false;
      }
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

<div class="wrapper" style={`--cols: ${sortedRamp.length}`}>
  <div class="ramp" style={`background-color: ${hex[0]};background-color:${better.from(sortedRamp[0][1]).p3};`}>
    <button class="delete" on:click={onDelete}>✕</button>
    {#each sortedRamp as [id, color], i}
      <div class="swatch" style={`background-color: ${hex[i]};background-color:${better.from(color).p3};color:${better.lightOrDark(color) === 'light' ? '#000' : '#fff'}`} data-id={id}>
        {#if i === 0 || i === baseIDI || i === sortedRamp.length - 1}
          <button class="swatch-hex swatch-hex--editable" on:click={() => (colorPickerOpen[id] = true)}>{hex[i]}</button>
          {#if colorPickerOpen[id]}
            <div class="picker" style={id === highID ? `right: 0` : 'left: 0'}>
              <Picker
                {color}
                onUpdate={(newColor) => {
                  ramp[id] = newColor;
                  updateRamp({ ...ramp });
                }}
              />
            </div>
            <div
              class="picker-overlay"
              on:click={() => {
                colorPickerOpen[id] = false;
                colorPickerOpen = colorPickerOpen;
              }}
            />
          {/if}
        {:else}
          <div class="swatch-hex">{hex[i]}</div>
        {/if}
      </div>
    {/each}
  </div>
  <div class="menu" role="menu">
    <div class="panel" data-expanded={panel.l || undefined}>
      <div class="panel-summary" on:click={() => (panel.l = !panel.l)}>
        <div class="panel-heading">L</div>
        <div class="columns">
          {#each lchVal as lch}
            <div>{round(lch[0] * 100, 1)}%</div>
          {/each}
        </div>
      </div>
      <div class="panel-detail">
        <div class="chart">
          <div class="chart-axis-x">Lightness</div>
          <div class="chart-container">
            <AreaChart data={lchVal.map(([l], i) => [i / (sortedRamp.length - 1), l])} width={chartW} height={chartH} />
            {#each lightnessChartLines as l}
              <div class="chart-line" style={`top: ${100 - l * 100}%`}>{l * 100}%</div>
            {/each}
          </div>
        </div>
      </div>
    </div>
    <div class="panel" data-expanded={panel.c || undefined}>
      <div class="panel-summary" on:click={() => (panel.c = !panel.c)}>
        <div class="panel-heading">C</div>
        <div class="columns">
          {#each cDelta as delta, i}
            <div>
              {#if i === baseIDI}{round(lchVal[i][1], 4)}{:else}{sign(round(delta, 4))}{/if}
            </div>
          {/each}
        </div>
      </div>
      <div class="panel-detail">
        <div class="chart">
          <div class="chart-axis-x">Chroma</div>
          <div class="chart-container">
            <AreaChart data={lchVal.map(([, c], i) => [i / (sortedRamp.length - 1), c / 0.4])} width={chartW} height={chartH} />
            {#each chromaChartLines as c}
              <div class="chart-line" style={`top: ${((0.4 - c) / 0.4) * 100}%`}>{c}</div>
            {/each}
          </div>
        </div>
      </div>
    </div>
    <div class="panel" data-expanded={panel.h || undefined}>
      <div class="panel-summary" on:click={() => (panel.h = !panel.h)}>
        <div class="panel-heading">H</div>
        <div class="columns">
          {#each hDelta as delta, i}
            <div>
              {#if i === baseIDI}{round(lchVal[i][2], 0)}°{:else}{sign(round(delta, 0))}°{/if}
            </div>
          {/each}
        </div>
      </div>
      <div class="panel-detail">
        <div class="chart">
          <div class="chart-axis-x">Hue</div>
          <div class="chart-container">
            <AreaChart data={lchVal.map(([, , h], i) => [i / (sortedRamp.length - 1), (h - baseLCH[2] + hRange) / (hRange * 2)])} fill="none" width={chartW} height={chartH} />
            <div class="chart-line" style="top: 0">{round(baseLCH[2] + hRange, 0)}°</div>
            <div class="chart-line" style="top: 25%">{round(baseLCH[2] + 0.5 * hRange, 0)}°</div>
            <div class="chart-line" style="top: 50%">{round(baseLCH[2], 0)}°</div>
            <div class="chart-line" style="top: 75%">{round(baseLCH[2] - 0.5 * hRange, 0)}°</div>
            <div class="chart-line" style="top: 100%">{round(baseLCH[2] - hRange, 0)}°</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  .wrapper {
  }

  .ramp {
    display: grid;
    grid-template-columns: repeat(var(--cols), 1fr);
    padding: 2rem;
    position: relative;
  }

  .delete {
    align-items: center;
    background: none;
    border: none;
    color: #fff;
    cursor: pointer;
    display: flex;
    font-size: 1rem;
    height: 1rem;
    justify-content: center;
    position: absolute;
    right: 0.75rem;
    top: 0.75rem;
    width: 1rem;
  }

  .swatch {
    height: 0;
    padding-top: 100%;
    position: relative;
    width: 100%;

    &::before {
      content: attr(data-id);
      position: absolute;
      left: 0.5rem;
      top: 0.5rem;
    }

    &-hex {
      font-family: var(--font-mono);

      &--editable {
        background: none;
        border: 1px solid currentColor;
        border-radius: 0.25rem;
        color: inherit;
        cursor: pointer;
        font-size: 100%;
        margin-bottom: -0.25rem;
        padding: 0.125rem 0.25rem;
      }
    }
  }

  .menu {
    border-top: 1.5px solid currentColor;
  }

  .columns {
    display: grid;
    font-size: 12px;
    grid-template-columns: repeat(var(--cols), 1fr);
    text-align: center;
  }

  .panel {
    border-bottom: 1.5px solid currentColor;

    // components
    &-heading {
      position: absolute;
      left: 1rem;
      top: 0.875rem;
    }

    &-summary {
      cursor: pointer;
      font-family: var(--font-mono);
      padding: 1rem 2rem;
      position: relative;

      &:hover {
        background-color: rgba(0, 0, 0, 0.1);
      }

      &::after {
        content: '';
        position: absolute;
        pointer-events: none;
        right: 1rem;
        top: 50%;
        width: 0.375rem;
        height: 0.375rem;
        border-style: solid;
        border-color: currentColor;
        border-width: 0 0 1.5px 1.5px;
        transform: translate3d(0, -62.5%, 0) rotate(-45deg);
      }

      .panel[data-expanded='true'] & {
        &::after {
          transform: translate3d(0, -62.5%, 0) rotate(-225deg);
        }
      }
    }

    &-detail {
      display: none;
      padding: 1rem 2rem;
    }

    // state
    &[data-expanded='true'] {
      .panel-detail {
        display: block;
      }
    }
  }

  .picker {
    background-color: var(--color-bg);
    border: 1px solid currentColor;
    color: var(--color-fg);
    padding: 1rem;
    position: absolute;
    top: 100%;
    width: 22rem;
    z-index: 110;

    &-overlay {
      height: 100%;
      left: 0;
      position: fixed;
      top: 0;
      width: 100%;
      z-index: 100;
    }
  }

  .chart {
    position: relative;

    &-axis-x {
      bottom: 0;
      font-size: 12px;
      left: 0;
      letter-spacing: 0.125em;
      position: absolute;
      text-align: center;
      text-transform: uppercase;
      transform: rotate(-90deg);
      transform-origin: 0 100%;
      width: 10rem;
    }

    &-container {
      border-bottom: 1px solid currentColor;
      border-left: 1px solid currentColor;
      height: 10rem;
      overflow: hidden;
      position: relative;
      margin-left: auto;
      margin-right: auto;
      width: calc(100% - 9vw); // TODO: fix this hack assuming 12 columns
    }

    &-line {
      display: grid;
      font-family: var(--font-mono);
      font-size: 10px;
      grid-template-columns: 3em auto;
      opacity: 0.75;
      position: absolute;
      text-align: right;
      width: 100%;

      &::after {
        content: '';
        border-top: 1px dashed currentColor;
        display: block;
        left: 4em;
        opacity: 0.5;
        position: absolute;
        top: 50%;
        transform: translate3d(0, -50%, 0);
        width: 100%;
      }
    }
  }
</style>

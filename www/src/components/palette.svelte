<script lang="ts">
  import { onMount } from 'svelte';
  import better, { round } from '../lib/better.min.js';
  import Stepper from './stepper.svelte';
  import IconLightness from './icon-lightness.svelte';

  let t = 0;

  function onUpdate(newPalette: PaletteColor[]): void {
    palette = newPalette;
    if (typeof window !== undefined) {
      clearTimeout(t);
      t = setTimeout(() => {
        const colors: string[] = [];
        for (const p of palette) {
          colors.push(p.dark, p.base, p.light, `${p.steps}`, p.colorspace);
        }
        const search = new URLSearchParams({ 'palette[]': colors.join(',') });
        window.location.hash = `#${search.toString()}`;
      }, 50);
    }
  }

  onMount(() => {
    let hash = window.location.hash;
    let defaultPalette: PaletteColor[] = [
      { base: '#3881ed', dark: '#020307', light: '#ffffff', steps: 9, colorspace: 'oklab' },
      { base: '#5ae3aa', dark: '#020307', light: '#ffffff', steps: 9, colorspace: 'oklab' },
    ];
    if (!hash || hash === '#') {
      onUpdate(defaultPalette);
      return;
    }
    const search = new URLSearchParams(hash.substring(1));
    const colors = `${search.get('palette')}`.split(',');
    const savedPalette: PaletteColor[] = [];
    if (colors.length >= 3) {
      let n = 0;
      while (true) {
        if (!colors[n + 4]) break;
        const next: PaletteColor = { base: colors[n + 1], dark: colors[n], light: colors[n + 2], steps: parseInt(colors[n + 3], 10) || 9, colorspace: colors[n + 4] as any };
        savedPalette.push(next);
        n += 5;
      }
    }
    if (!savedPalette.length) onUpdate(defaultPalette);
  });

  interface PaletteColor {
    base: string;
    dark: string;
    light: string;
    steps: number;
    colorspace: 'oklab' | 'oklch' | 'sRGB' | 'lms' | 'linearRGB';
  }

  let palette: PaletteColor[] = [];

  function onRemove(index: number): void {
    if (confirm('Delete color?')) {
      palette.splice(index, 1);
      onUpdate(palette);
    }
  }

  function onAdd(): void {
    const last = palette[palette.length - 1];
    console.log({ last });
    palette.push({
      base: better.from([Math.random(), Math.random(), Math.random()]).hex,
      dark: last.dark || '#020307',
      light: last.light || '#ffffff',
      steps: last.steps || 9,
      colorspace: last.colorspace || 'oklab',
    });
    onUpdate(palette);
  }

  function buildRamp({ base, dark, light, steps, colorspace }: { base: string; dark: string; light: string; steps: number; colorspace: string }): string[] {
    const ramp: string[] = [];
    const mid = steps / 2 - 0.5;
    for (let n = 0; n < steps; n++) {
      if (n === mid) {
        ramp.push(base);
      }
      if (n < mid) {
        ramp.push(better.mix(dark, base, (n + 1) / (mid + 1), colorspace).hex);
      }
      if (n > mid) {
        ramp.push(better.mix(base, light, (n - mid) / (mid + 1), colorspace).hex);
      }
    }
    // TODO: half-steps
    return ramp;
  }

  function formatPerc(num: number): string {
    return `${round(num * 100, 1)}%`;
  }

  function onColorChange(evt: Event, id: keyof PaletteColor, i: number): void {
    if (palette[i]) {
      try {
        let hex = (evt.target as HTMLInputElement).value.trim();
        if (hex.length !== 7) return;
        (palette[i] as any)[id] = hex;
        onUpdate(palette);
      } catch {}
    }
  }

  function onColorspaceChange(evt: Event, i: number): void {
    if (evt.target as HTMLSelectElement) {
      palette[i].colorspace = (evt.target as HTMLSelectElement).value as any;
      onUpdate(palette);
    }
  }
</script>

<div class="palette">
  <aside class="palette-sidebar">
    <ul class="palette-colors">
      {#each palette as { base }, i}
        <li class="palette-root" style={`background:${base};color:${better.lightOrDark(base) === 'light' ? 'black' : 'white'}`}>
          <button class="palette-color-remove" type="button" on:click={() => onRemove(i)}>✗</button>
          <input class="input" type="text" maxlength="7" value={base} on:input={(evt) => onColorChange(evt, 'base', i)} />
        </li>
      {/each}
    </ul>
    <button class="palette-add" on:click={onAdd}>+</button>
  </aside>
  <main class="palette-builder">
    {#each palette as { base, dark, light, steps, colorspace }, i}
      <div class="palette-family">
        <div class="palette-ctrls">
          <div class="palette-ctrls-colorspace">
            <label class="label" for={`palette-${i}-colorspace`}>Colorspace</label>
            <select class="select" id={`palette-${i}-colorspace`} value={colorspace} on:change={(evt) => onColorspaceChange(evt, i)}>
              <option value="oklab">OKLAB (best)</option>
              <option value="oklch">OKLCH</option>
              <option value="sRGB">sRGB</option>
              <option value="linearRGB">Linear RGB</option>
              <option value="lms">LMS</option>
            </select>
          </div>
          <div class="palette-ctrls-steps">
            <Stepper
              id={`palette-${i}-steps`}
              label="Steps"
              min={3}
              value={steps}
              onChange={(value) => {
                palette[i].steps = value;
                onUpdate(palette);
              }}
            />
          </div>
        </div>
        <ul class="palette-ramp">
          <li class="swatch palette-ramp-step palette-ramp-step--dark" style={`background:${dark};color:${better.lightOrDark(dark) === 'light' ? 'black' : 'white'}`}>
            <span class="palette-stats"><IconLightness />{formatPerc(better.lightness(dark))}</span>
            <input class="input" type="text" maxlength="7" value={dark} on:input={(evt) => onColorChange(evt, 'dark', i)} />
          </li>
          {#each buildRamp({ base, dark, light, steps, colorspace }) as color}
            <li class="swatch palette-ramp-step" style={`background:${color};color:${better.lightOrDark(color) === 'light' ? 'black' : 'white'}`}>
              <span class="palette-stats"><IconLightness />{formatPerc(better.lightness(color))}</span>
              {color}
            </li>
          {/each}
          <li class="swatch palette-ramp-step palette-ramp-step--light" style={`background:${light};color:${better.lightOrDark(light) === 'light' ? 'black' : 'white'}`}>
            <span class="palette-stats"><IconLightness />{formatPerc(better.lightness(light))}</span>
            <input class="input" type="text" maxlength="7" value={light} on:input={(evt) => onColorChange(evt, 'light', i)} />
          </li>
        </ul>
      </div>
    {/each}
  </main>
</div>

<style lang="scss">
  $ctrl-height: 4.5rem;
  $h-m: 9rem;
  $sidebar-width: 120px;

  .palette {
    display: grid;
    grid-gap: 1rem;
    grid-template-columns: min-content auto;
    padding-left: 1rem;

    &-add {
      appearance: none;
      background: none;
      border: none;
      color: var(--color-fg);
      cursor: pointer;
      display: flex;
      font-size: 20px;
      font-weight: 300;
      justify-content: center;
      padding-bottom: 0.625em;
      padding-top: 0.5em;
      position: relative;
      width: 100%;

      &::after {
        border: 1px solid currentColor;
        border-radius: 50%;
        content: '';
        display: block;
        height: 1em;
        left: 50%;
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 1em;
      }
    }

    &-color-remove {
      align-items: center;
      appearance: none;
      background: none;
      border: none;
      color: currentColor;
      cursor: pointer;
      display: flex;
      height: 1.5rem;
      justify-content: center;
      position: absolute;
      right: 0;
      top: 0;
      width: 1.5rem;
    }

    &-colors {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    &-ctrls {
      align-items: center;
      display: flex;
      padding-left: 0.25rem;
      padding-right: 0.5rem;

      &-steps {
        margin-left: auto;
        width: 10rem;
      }
    }

    &-family {
      display: grid;
      grid-gap: 0.25rem;
      grid-template-rows: $ctrl-height auto;
      height: $h-m;
      margin-bottom: 1px;
    }

    &-stats {
      align-items: center;
      display: grid;
      font-weight: 200;
      grid-gap: 0.25rem;
      grid-template-columns: min-content auto;
      margin-bottom: auto;
      opacity: 0.625;
      position: absolute;
      right: 0.5rem;
      top: 0.5rem;
    }

    &-sidebar {
      width: $sidebar-width;
    }

    &-ramp {
      box-sizing: border-box;
      display: flex;
      height: $h-m - $ctrl-height;
      margin: 0;
      max-width: calc(100vw - #{$sidebar-width + 16px});
      overflow-x: auto;
      padding: 0;
      width: 100%;

      &-step {
        flex: 1;
        min-width: 5.5rem;
        position: relative;

        &::before {
          content: counter(step);
        }

        &--dark,
        &--light {
          counter-set: step 0;

          &::before {
            content: none;
          }
        }
      }
    }

    &-root {
      align-items: flex-end;
      display: flex;
      flex-direction: column;
      font-family: var(--font-mono);
      font-size: 12px;
      height: $h-m;
      justify-content: flex-end;
      margin-bottom: 1px;
      padding: 0.75em;
      position: relative;
      width: 8rem;
    }
  }
</style>

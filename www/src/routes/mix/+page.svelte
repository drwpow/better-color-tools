<script lang="ts">
  import { onMount } from 'svelte';
  import Mixer from '../../components/mixer.svelte';
  import better from '../../lib/better.min.js';

  let t = 0;
  let from = [0, 0, 0, 1];
  let to = [0.4, 0.4, 0.4, 1];

  function updateColors(newFrom: number[], newTo: number[]): void {
    from = newFrom;
    to = newTo;
    if (typeof window !== 'undefined') {
      clearTimeout(t);
      t = window.setTimeout(() => {
        const search = new URLSearchParams({ from: better.from(newFrom).hex, to: better.from(newTo).hex });
        window.location.hash = `#${search.toString()}`;
      }, 50);
    }
  }

  onMount(() => {
    let hash = window.location.hash;
    const random1 = [Math.random(), Math.random(), Math.random(), 1];
    const random2 = [Math.random(), Math.random(), Math.random(), 1];
    if (!hash || hash === '#') {
      updateColors(random1, random2);
      return;
    }
    const search = new URLSearchParams(hash.substring(1));
    const from = search.get('from');
    const to = search.get('to');
    updateColors(from ? better.from(from).rgbVal : [Math.random(), Math.random(), Math.random(), 1], to ? better.from(to).rgbVal : [Math.random(), Math.random(), Math.random(), 1]);
  });
</script>

<Mixer {from} {to} onUpdate={updateColors} />

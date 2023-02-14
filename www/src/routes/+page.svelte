<script lang="ts">
  import { onMount } from 'svelte';
  import better from '../lib/better.min.js';
  import Analyzer from '../components/analyzer.svelte';

  let color = [0, 0, 0, 1];

  let t = 0;

  function updateColor(newColor: number[]): void {
    color = newColor;
    if (typeof window !== 'undefined') {
      clearTimeout(t);
      t = window.setTimeout(() => {
        const search = new URLSearchParams({ c: better.from(newColor).hex });
        window.location.hash = `#${search.toString()}`;
      }, 50);
    }
  }

  onMount(() => {
    let hash = window.location.hash;
    if (!hash || hash === '#') {
      updateColor([Math.random(), Math.random(), Math.random(), 1]);
      return;
    }
    const search = new URLSearchParams(hash.substring(1));
    const c = search.get('c');
    updateColor(c ? better.from(c).rgbVal : [Math.random(), Math.random(), Math.random(), 1]);
  });
</script>

<svelte:head>
  <title>Better Color Tools</title>
</svelte:head>
<Analyzer {color} onUpdate={updateColor} />

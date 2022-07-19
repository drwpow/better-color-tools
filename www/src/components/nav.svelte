<script lang="ts">
  import { page } from '$app/stores';

  $: currentPathname = $page.url.pathname;
</script>

<header class="site-header">
  <h1 class="site-title">Better Color Tools</h1>
  <nav class="site-nav">
    <ul class="site-nav-linklist">
      <li class="site-nav-link"><a href="/" aria-current={currentPathname === '/' ? 'page' : undefined}>Analyze</a></li>
      <li class="site-nav-link"><a href="/mix" aria-current={currentPathname === '/mix' ? 'page' : undefined}>Mix</a></li>
      <li class="site-nav-link"><a href="/palette" aria-current={currentPathname === '/palette' ? 'page' : undefined}>Palette</a></li>
      <li class="site-nav-link"><a href="/learn" aria-current={currentPathname === '/learn' ? 'page' : undefined}>Learn</a></li>
    </ul>
  </nav>
</header>

<style lang="scss">
  .site-header {
    align-items: baseline;
    display: grid;
    grid-gap: 1rem;
    grid-template-columns: min-content auto;
    padding: 1rem;
  }

  .site-title {
    font-size: 1em;
    font-weight: 550;
    margin: 0;
    white-space: nowrap;
  }

  .site-nav-linklist {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .site-nav-link {
    font-size: 14px;

    + .site-nav-link {
      margin-left: 1rem;
    }
  }

  a {
    text-decoration: none;

    &[aria-current='page'] {
      color: var(--color-fg);
    }
  }
</style>

<script lang="ts">
  import better from '../lib/better.min.js';

  export let colors: Record<number, number[]>[];

  let activeTab = 0;
  let tsOutput = '';
  let coOutput = '';
  let tsCopyText = 'Copy';
  let coCopyText = 'Copy';

  /** lazy color naming */
  function getColorName(color: number[]): string {
    const [_, c, h] = better.from(color).oklchVal;
    if (c <= 0.05) return 'gray';
    if (h > 0 && h < 10) return 'magenta';
    if (h >= 10 && h < 18) return 'pink';
    if (h >= 18 && h < 36) return 'red';
    if (h >= 36 && h < 60) return 'orange';
    if (h >= 60 && h < 90) return 'yellow';
    if (h >= 90 && h < 110) return 'olive';
    if (h >= 110 && h < 170) return 'green';
    if (h >= 170 && h < 220) return 'teal';
    if (h >= 220 && h < 280) return 'blue';
    if (h >= 280 && h < 330) return 'purple';
    if (h >= 330) return 'fuschia';
    return 'red';
  }

  $: {
    let nextTSOutput: Record<string, any> = { color: {} };
    let nextCoOutput: Record<string, any> = { color: { $type: 'color' } };

    for (const group of colors) {
      let name = getColorName(group[60]);
      // if name is already taken, append -[n]
      if (name in nextTSOutput.color) {
        let n = 1;
        for (const colorName of Object.keys(nextTSOutput.color)) {
          if (colorName.includes(name)) n++;
        }
        name = `${name}-${n}`;
      }
      nextTSOutput.color[name] = {};
      nextCoOutput.color[name] = {};
      for (const [id, color] of Object.entries(group)) {
        nextTSOutput.color[name][id] = {
          type: 'color',
          value: better.from(color).hex,
        };
        nextCoOutput.color[name][id] = {
          $value: better.from(color).oklch,
        };
      }
    }

    tsOutput = JSON.stringify(nextTSOutput, undefined, 2);
    coOutput = JSON.stringify(nextCoOutput, undefined, 2);
  }
</script>

<div class="wrapper">
  <h2>Export</h2>

  <div class="center">
    <nav class="tablist" role="tablist">
      <li><button class="tab" role="tab" type="button" aria-selected={activeTab === 0} on:click={() => (activeTab = 0)}>Tokens Studio</button></li>
      <li><button class="tab" role="tab" type="button" aria-selected={activeTab === 1} on:click={() => (activeTab = 1)}>Cobalt</button></li>
    </nav>
  </div>

  <div role="tabpanel" class="tabpanel" hidden={activeTab !== 0}>
    <h3>Tokens Studio</h3>
    <p>
      Copy & paste the following in the <b>JSON</b> tab in the <a href="https://tokens.studio/" target="_blank" rel="noopener noreferrer">Tokens Studio for Figma plugin</a> (<a href="https://docs.tokens.studio/" target="_blank" rel="noopener noreferrer"
        >docs</a
      >)
    </p>
    <div class="output-wrapper">
      <textarea readonly class="output output-ts">{tsOutput}</textarea>
      <button
        class="copy"
        type="button"
        on:click={() => {
          if (tsCopyText !== 'Copy') return;
          tsCopyText = 'Copied';
          setTimeout(() => (tsCopyText = 'Copy'), 2000);
          navigator.clipboard.writeText(tsOutput);
        }}>{tsCopyText}</button
      >
    </div>
  </div>

  <div role="tabpanel" class="tabpanel" hidden={activeTab !== 1}>
    <h3>Cobalt UI</h3>
    <p>
      Copy & paste the following in a <code>tokens.json</code> file that <a href="https://cobalt-ui.pages.dev" target="_blank" rel="noopener noreferrer">Cobalt UI</a> can reach (<a
        href="https://cobalt-ui.pages.dev"
        target="_blank"
        rel="noopener noreferrer">docs</a
      >)
    </p>
    <div class="output-wrapper">
      <textarea readonly class="output output-cobalt">{coOutput}</textarea>
      <button
        class="copy"
        type="button"
        on:click={() => {
          if (coCopyText !== 'Copy') return;
          coCopyText = 'Copied';
          setTimeout(() => (coCopyText = 'Copy'), 2000);
          navigator.clipboard.writeText(coOutput);
        }}>{coCopyText}</button
      >
    </div>
  </div>
</div>

<style lang="scss">
  h2 {
    font-size: 24px;
    font-weight: 600;
    margin: 0;
    text-align: center;
  }

  h3 {
    font-size: 28px;
    font-weight: 500;
    margin: 0;
  }

  .wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .center {
    display: flex;
    justify-content: center;
  }

  .copy {
    background-color: var(--color-bg);
    border: 1px solid currentColor;
    border-radius: 0.25rem;
    color: inherit;
    cursor: pointer;
    font-family: inherit;
    font-size: 0.75rem;
    line-height: 1;
    padding: 0.375em 0.5em;
    position: absolute;
    right: 0.5rem;
    top: 0.5rem;
  }

  .tab {
    background: var(--color-bg);
    border-width: 0 0 0 1px;
    border-style: solid;
    border-color: currentColor;
    color: inherit;
    cursor: pointer;
    font-family: var(--font-sans);
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;

    .tablist li:first-child & {
      border-bottom-left-radius: 0.25rem;
      border-top-left-radius: 0.25rem;
      border-left-width: 0;
    }

    .tablist li:last-child & {
      border-bottom-right-radius: 0.25rem;
      border-top-right-radius: 0.25rem;
    }

    &[aria-selected='true'] {
      background-color: var(--color-fg);
      color: var(--color-bg);
    }
  }

  .tablist {
    border: 1px solid currentColor;
    border-radius: 0.25rem;
    display: inline-flex;
    list-style: none;
    margin-bottom: 1rem;
    margin-left: auto;
    margin-right: auto;
    margin-top: 1rem;
    width: max-content;
  }

  .tabpanel {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    position: relative;

    &[hidden] {
      display: none;
    }
  }

  .output {
    background-color: #ededed;
    border: none;
    border-radius: 0.25rem;
    font-family: var(--font-mono);
    font-size: 0.75rem;
    min-height: 8rem;
    flex-grow: 1;
    overflow: auto;
    resize: none;
    width: 100%;

    code {
      display: block;
      padding: 1rem;
    }
  }

  .output-wrapper {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    position: relative;
  }
</style>

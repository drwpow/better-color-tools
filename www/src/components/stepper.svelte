<script lang="ts">
  export let value = 0;
  export let min = -Infinity;
  export let max = Infinity;
  export let step = 1;
  export let id: string;
  export let label: string;
  export let onChange: (value: number) => void;

  function update(newValue: number) {
    if (typeof newValue !== 'number' || Number.isNaN(newValue)) return;
    onChange(Math.min(max, Math.max(min, Math.round(newValue * (step / 1)) / step)));
  }

  function onInput(evt: Event): void {
    if (!evt || !evt.target) return;
    update(parseFloat((evt.target as HTMLInputElement).value));
  }
</script>

<label class="label" for={id}>{label}</label>
<div class="fieldset">
  <button type="button" class="down" on:click={() => update(value - step)}>-</button>
  <input {id} class="field" type="text" inputmode="decimal" {value} on:input={onInput} />
  <button type="button" class="up" on:click={() => update(value + step)}>+</button>
</div>

<style lang="scss">
  .label {
    padding-left: 2rem;
  }

  .fieldset {
    align-items: center;
    display: grid;
    grid-template-columns: 1.5rem auto 1.5rem;
    grid-gap: 0.5rem;
  }

  .field {
    -webkit-appearance: none;
    appearance: none;
    background: none;
    border: 1px solid currentColor;
    color: inherit;
    font-family: var(--font-mono);
    font-size: 14px;
    height: 24px;
    line-height: 24px;
    max-width: 100%;
    min-width: none;
    padding: 0;
    text-indent: 0.375em;
    width: 100%;

    &:focus {
      outline: none;
    }
  }

  .up,
  .down {
    -webkit-appearance: none;
    appearance: none;
    background: none;
    border-radius: 50%;
    border: 1px solid currentColor;
    color: inherit;
    cursor: pointer;
    display: flex;
    height: 1.5rem;
    justify-content: center;
    line-height: 1.25rem;
    padding: 0;
    width: 1.5rem;
  }
</style>

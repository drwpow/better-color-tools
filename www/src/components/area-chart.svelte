<script lang="ts">
  import { round } from '$lib/better.min';

  export let fill = '#cedfff';
  export let stroke = '#3975ff';
  export let width = 400;
  export let height = 128;

  /** [x, y] */
  type Coord = [number, number];

  export let data: Coord[];
</script>

<div class="area-chart" style={`width: ${width}px;height:${height}px`}>
  <svg class="chart" viewBox={`0 0 ${width} ${height}`}>
    <path d={`M0 ${height}L${data.map(([x, y]) => `${round(x * width, 2)} ${round(height - y * height, 2)}`).join('L')}L${width} ${height}Z`} {fill} />
    <path d={`M${data.map(([x, y]) => `${round(x * width, 2)} ${round(height - y * height, 2)}`).join('L')}`} {stroke} stroke-width="1" stroke-linecap="round" fill="none" />
  </svg>
</div>

<style lang="scss">
  .area-chart {
    height: 12rem;
    position: relative;
  }

  .chart {
    display: block;
    height: 100%;
    left: 0;
    position: absolute;
    top: 0;
    width: 100%;
  }
</style>

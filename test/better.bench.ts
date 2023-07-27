import { bench, describe } from 'vitest';
import better from '../dist/index.js';

// note: unskip, and run `test:benchmark` script! otherwise this won’t be accurate
describe('benchmark', () => {
  bench('rgb -> hex', () => {
    better.from(`rgb(255, 0, 0)`).hexVal;
  });

  bench('rgb -> p3', () => {
    better.from(`rgb(255, 0, 0)`).p3;
  });

  bench('rgb -> oklab', () => {
    better.from(`rgb(255, 0, 0)`).oklab;
  });

  bench('rgb -> oklch', () => {
    better.from(`rgb(255, 0, 0)`).oklch;
  });

  bench('parse speed: hex string', () => {
    better.from('#ff0000');
  });

  bench('parse speed: hex number', () => {
    better.from(0xff0000);
  });

  bench('parse speed: rgb object', () => {
    better.from({r: 1, g: 0, b: 0, alpha: 1});
  });
});

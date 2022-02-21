import { expect } from 'chai';
import { performance } from 'perf_hooks';
import better from '../dist/index.js';

// note: run `test:benchmark` script! otherwise this won’t be accurate
describe.skip('benchmark', () => {
  it('rgb -> hex: 80k ops/s', () => {
    const start = performance.now();
    for (let n = 0; n < 80000; n ++) {
      better.from(`rgb(255, 0, 0)`).hexVal;
    }
    const end = performance.now() - start;
    expect(end).to.be.lessThan(1000);
  });

  it('rgb -> p3: 80k ops/s', () => {
    const start = performance.now();
    for (let n = 0; n < 80000; n ++) {
      better.from(`rgb(255, 0, 0)`).p3;
    }
    const end = performance.now() - start;
    expect(end).to.be.lessThan(1000);
  });

  it('rgb -> oklab: 80k ops/s', () => {
    const start = performance.now();
    for (let n = 0; n < 80000; n ++) {
      better.from(`rgb(255, 0, 0)`).oklab;
    }
    const end = performance.now() - start;
    expect(end).to.be.lessThan(1000);
  });


  it('rgb -> oklch: 80k ops/s', () => {
    const start = performance.now();
    for (let n = 0; n < 80000; n ++) {
      better.from(`rgb(255, 0, 0)`).oklch;
    }
    const end = performance.now() - start;
    expect(end).to.be.lessThan(1000);
  });
});

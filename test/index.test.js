import { expect } from 'chai';
import { performance } from 'perf_hooks';
import better from '../dist/index.js';

const OPS_PER_S = 200000;

// note: unskip, and run `test:benchmark` script! otherwise this won’t be accurate
describe.skip('benchmark', () => {
  it('rgb -> hex: 200k ops/s', () => {
    const start = performance.now();
    for (let n = 0; n < OPS_PER_S; n ++) {
      better.from(`rgb(255, 0, 0)`).hexVal;
    }
    const end = performance.now() - start;
    expect(end).to.be.lessThan(1000);
  });

  it('rgb -> p3: 200k ops/s', () => {
    const start = performance.now();
    for (let n = 0; n < OPS_PER_S; n ++) {
      better.from(`rgb(255, 0, 0)`).p3;
    }
    const end = performance.now() - start;
    expect(end).to.be.lessThan(1000);
  });

  it('rgb -> oklab: 200k ops/s', () => {
    const start = performance.now();
    for (let n = 0; n < OPS_PER_S; n ++) {
      better.from(`rgb(255, 0, 0)`).oklab;
    }
    const end = performance.now() - start;
    expect(end).to.be.lessThan(1000);
  });


  it('rgb -> oklch: 200k ops/s', () => {
    const start = performance.now();
    for (let n = 0; n < OPS_PER_S; n ++) {
      better.from(`rgb(255, 0, 0)`).oklch;
    }
    const end = performance.now() - start;
    expect(end).to.be.lessThan(1000);
  });
});

import { expect } from 'chai';
import { performance } from 'perf_hooks';
import better from '../dist/index.js';

const OPS_PER_S = 225000;

// note: unskip, and run `test:benchmark` script! otherwise this won’t be accurate
describe.skip('benchmark', () => {
  it('rgb -> hex: 225k ops/s', () => {
    const start = performance.now();
    for (let n = 0; n < OPS_PER_S; n ++) {
      better.from(`rgb(255, 0, 0)`).hexVal;
    }
    const end = performance.now() - start;
    expect(end).to.be.lessThan(1000);
  });

  it('rgb -> p3: 225k ops/s', () => {
    const start = performance.now();
    for (let n = 0; n < OPS_PER_S; n ++) {
      better.from(`rgb(255, 0, 0)`).p3;
    }
    const end = performance.now() - start;
    expect(end).to.be.lessThan(1000);
  });

  it('rgb -> oklab: 225k ops/s', () => {
    const start = performance.now();
    for (let n = 0; n < OPS_PER_S; n ++) {
      better.from(`rgb(255, 0, 0)`).oklab;
    }
    const end = performance.now() - start;
    expect(end).to.be.lessThan(1000);
  });


  it('rgb -> oklch: 225k ops/s', () => {
    const start = performance.now();
    for (let n = 0; n < OPS_PER_S; n ++) {
      better.from(`rgb(255, 0, 0)`).oklch;
    }
    const end = performance.now() - start;
    expect(end).to.be.lessThan(1000);
  });

  it('parse speed: hex string', (done) => {
    const start = performance.now();
    for (let n = 0; n < 1000000; n++) {
      better.from('#ff0000');
    }
    const end = performance.now() - start;
    console.log(`hex string: 1m ops in ${end/1000}s`);
    done();
  });

  it('parse speed: hex number', (done) => {
    const start = performance.now();
    for (let n = 0; n < 1000000; n++) {
      better.from(0xff0000);
    }
    const end = performance.now() - start;
    console.log(`hex number: 1m ops in ${end/1000}s`);
    done();
  });

  it('parse speed: rgb array', (done) => {
    const start = performance.now();
    for (let n = 0; n < 1000000; n++) {
      better.from([1, 0, 0, 1]);
    }
    const end = performance.now() - start;
    console.log(`rgb array: 1m ops in ${end/1000}s`);
    done();
  });
});

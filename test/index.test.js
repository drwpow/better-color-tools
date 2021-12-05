import { expect } from 'chai';
import color from '../dist/index.js';

function randomColor() {
  return [Math.round(Math.random() * 255), Math.round(Math.random() * 255), Math.round(Math.random() * 255), 1];
}

describe('color.from', () => {
  it('rgb -> hex', () => {
    expect(color.from('rgb(127, 255, 212)').hex).to.equal('#7fffd4');
    expect(color.from('rgba(127, 255, 212, 0.5)').hex).to.equal('#7fffd480');
    expect(color.from('rgb(127, 255, 212)').hexVal).to.equal(0x7fffd4);
    expect(color.from([127, 255, 212]).hexVal).to.equal(0x7fffd4);
    expect(color.from('rgba(127, 255, 212, 0.5)').hexVal).to.equal(0x7fffd480);
    expect(color.from('rgb(252, 9, 172)').hex).to.equal('#fc09ac');

    // random color test (if it fails, add a test!)
    const c = randomColor();
    expect(color.from(color.from(c).hex).rgbVal.toString(), `rgb: ${c} failed to generate hex`).to.equal(c.toString());
  });

  it('rgb -> hsl', () => {
    expect(color.from([173, 255, 47]).hsl).to.equal('hsl(83.65, 100%, 59.22%, 1)');
    expect(color.from('#C4432B').hsl).to.equal('hsl(9.41, 64.02%, 46.86%, 1)');
    expect(color.from([173, 255, 47]).hslVal.toString()).to.equal([83.65, 1, 0.5922, 1].toString());
    expect(color.from([162, 61, 149]).hsl).to.equal('hsl(307.72, 45.29%, 43.73%, 1)');
    expect(color.from([220, 37, 149]).hsl).to.equal('hsl(323.28, 72.33%, 50.39%, 1)');

    // random test
    const c = randomColor();
    expect(color.from(color.from(c).hsl).rgbVal.toString(), `rgb: ${c} failed to generate HSL`).to.equal(c.toString());
  });

  it('hex -> rgb', () => {
    expect(color.from('#4b0082').rgb).to.equal('rgb(75, 0, 130)');
    expect(color.from(0x4b008240).rgb).to.equal('rgba(75, 0, 130, 0.25098039215686274)');
    expect(color.from(0x000001).rgb).to.equal('rgb(0, 0, 1)');

    // random test
    const c = randomColor();
    expect(color.from(color.from(c).hex).rgbVal.toString()).to.equal(c.toString());
  });

  it('hex -> hsl', () => {
    expect(color.from('#fa8072').hsl).to.equal('hsl(6.18, 93.15%, 71.37%, 1)');

    // random test
    const c = randomColor();
    expect(color.from(color.from(color.from(c).hex).hsl).rgbVal.toString()).to.equal(c.toString());
  });

  it('hsl -> rgb', () => {
    expect(color.from('hsl(328, 100%, 54%)').rgb).to.equal('rgb(255, 20, 146)');
    expect(color.from('hsl(328, 100%, 54%, 0.8)').rgb).to.equal('rgba(255, 20, 146, 0.8)');
    expect(color.from('hsl(323.279, 72.3%, 50.4%)').rgb).to.equal('rgb(220, 37, 149)');
    expect(color.from('hsl(361, 100%, 50%)').rgb).to.equal('rgb(255, 4, 0)');
    expect(color.from('hsl(-361, 100%, 50%)').rgb).to.equal('rgb(255, 4, 0)');
    expect(color.from('hsl(178, 0%, 0%)').rgb).to.equal('rgb(0, 0, 0)');

    // random test
    const c = randomColor();
    expect(color.from(color.from(color.from(c).hsl).hsl).rgbVal.toString(), `rgb: ${c} failed multiple HSL <> RGB conversions`).to.equal(c.toString());
  });

  it('hsl -> hex', () => {
    expect(color.from('hsl(40, 100%, 97%)').hex).to.equal('#fffaf0');
    expect(color.from('hsl(40, 100%, 97%, 0.75)').hex).to.equal('#fffaf0bf');
  });

  it('name -> hex', () => {
    expect(color.from('rebeccapurple').hex).to.equal('#663399');
  });
});

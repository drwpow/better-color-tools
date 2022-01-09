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
    expect(color.from('rgb(127.5, 127.5, 127.5)').hex).to.equal('#808080');

    // random color test (if it fails, add a test!)
    const expected = randomColor();
    const generated = color.from(color.from(expected).hex).rgbVal.map((n) => Math.round(n));
    expect(generated.toString(), `rgb: ${expected} failed to generate hex`).to.equal(expected.toString());
  });

  it('rgb -> hsl', () => {
    expect(color.from([173, 255, 47]).hsl).to.equal('hsl(83.654, 100%, 59.216%, 1)');
    expect(color.from('#C4432B').hsl).to.equal('hsl(9.412, 64.017%, 46.863%, 1)');
    expect(color.from([173, 255, 47]).hslVal.toString()).to.equal([83.654, 1, 0.59216, 1].toString());
    expect(color.from([162, 61, 149]).hsl).to.equal('hsl(307.723, 45.291%, 43.725%, 1)');
    expect(color.from([220, 37, 149]).hsl).to.equal('hsl(323.279, 72.332%, 50.392%, 1)');

    // random test
    const expected = randomColor();
    const generated = color.from(color.from(expected).hsl).rgbVal.map((n) => Math.round(n));
    expect(generated.toString(), `rgb: ${expected} failed to generate HSL`).to.equal(expected.toString());
  });

  it('rgb -> p3', () => {
    expect(color.from([255, 0, 0]).p3).to.equal('color(display-p3 1 0 0)');
    expect(color.from([128, 128, 128]).p3).to.equal('color(display-p3 0.50196 0.50196 0.50196)');
    expect(color.from([192, 192, 0, 0.5]).p3).to.equal('color(display-p3 0.75294 0.75294 0/0.5)');
    expect(color.from('rgb(196, 67, 43, 0.8)').p3).to.equal('color(display-p3 0.76863 0.26275 0.16863/0.8)');
  });

  it('hex -> rgb', () => {
    expect(color.from('#f00').rgb).to.equal('rgb(255, 0, 0)');
    expect(color.from('#888').rgb).to.equal('rgb(136, 136, 136)');
    expect(color.from('#4b0082').rgb).to.equal('rgb(75, 0, 130)');
    expect(color.from('#ffffff80').rgb).to.equal('rgba(255, 255, 255, 0.50196)');
    expect(color.from(0x4b008240).rgb).to.equal('rgba(75, 0, 130, 0.25098)');
    expect(color.from(0x000001).rgb).to.equal('rgb(0, 0, 1)');

    // random test
    const expected = randomColor();
    const generated = color.from(color.from(expected).hex).rgbVal.map((n) => Math.round(n));
    expect(generated.toString()).to.equal(expected.toString());
  });

  it('hex -> hsl', () => {
    expect(color.from('#fa8072').hsl).to.equal('hsl(6.176, 93.151%, 71.373%, 1)');

    // random test
    const expected = randomColor();
    const generated = color.from(color.from(color.from(expected).hex).hsl).rgbVal.map((n) => Math.round(n));
    expect(generated.toString()).to.equal(expected.toString());
  });

  it('hsl -> rgb', () => {
    expect(color.from('hsl(328, 100%, 54%)').rgb).to.equal('rgb(255, 20, 146)');
    expect(color.from('hsl(328, 100%, 54%, 0.8)').rgb).to.equal('rgba(255, 20, 146, 0.8)');
    expect(color.from('hsl(323.279, 72.3%, 50.4%)').rgb).to.equal('rgb(220, 37, 149)');
    expect(color.from('hsl(361, 100%, 50%)').rgb).to.equal('rgb(255, 4, 0)');
    expect(color.from('hsl(-361, 100%, 50%)').rgb).to.equal('rgb(255, 4, 0)');
    expect(color.from('hsl(178, 0%, 0%)').rgb).to.equal('rgb(0, 0, 0)');

    // random test
    const expected = randomColor();
    const generated = color.from(color.from(color.from(expected).hsl).hsl).rgbVal.map((n) => Math.round(n));
    expect(generated.toString(), `rgb: ${expected} failed multiple HSL <> RGB conversions`).to.equal(expected.toString());
  });

  it('hsl -> hex', () => {
    expect(color.from('hsl(40, 100%, 97%)').hex).to.equal('#fffaf0');
    expect(color.from('hsl(40, 100%, 97%, 0.75)').hex).to.equal('#fffaf0bf');
  });

  it('name -> hex', () => {
    expect(color.from('rebeccapurple').hex).to.equal('#663399');
  });

  it('p3 -> hex', () => {
    expect(color.from('color(display-p3 0 1 1)').hex).to.equal('#00ffff');
    expect(color.from('color(display-p3 0.23 0.872 0.918)').hex).to.equal('#3bdeea');
    expect(color.from('color(display-p3 0 1 1/1)').rgb).to.equal('rgb(0, 255, 255)');
    expect(color.from('color(display-p3 1 0 0/0.5)').rgb).to.equal('rgba(255, 0, 0, 0.5)');
    expect(color.from('color(display-p3 1 0 0/0)').rgb).to.equal('rgba(255, 0, 0, 0)');
  });

  it('allows out-of-bounds values', () => {
    expect(color.from('rgb(-100, 500, -100)').hex).to.equal('#00ff00');
    expect(color.from('hsl(0, -100%, 200%)').hex).to.equal('#ffffff');
  });
});

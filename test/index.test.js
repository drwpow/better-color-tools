import { expect } from 'chai';
import color from '../dist/index.js';

describe('color.from', () => {
  it('rgb -> hex', () => {
    expect(color.from('rgb(127, 255, 212)').hex).to.equal('#7fffd4');
    expect(color.from('rgba(127, 255, 212, 0.5)').hex).to.equal('#7fffd480');
    expect(color.from('rgb(127, 255, 212)').hexVal).to.equal(0x7fffd4);
    expect(color.from([127, 255, 212]).hexVal).to.equal(0x7fffd4);
    expect(color.from('rgba(127, 255, 212, 0.5)').hexVal).to.equal(0x7fffd480);
  });

  it('rgb -> hsl', () => {
    expect(color.from([173, 255, 47]).hsl).to.equal('hsl(83.654, 100%, 59.2%, 1)');
    expect(color.from('#C4432B').hsl).to.equal('hsl(9.412, 64%, 46.9%, 1)');
    expect(color.from([173, 255, 47]).hslVal.toString()).to.equal([83.654, 1, 0.592, 1].toString());
  });

  it('hex -> rgb', () => {
    expect(color.from('#4b0082').rgb).to.equal('rgb(75, 0, 130)');
    expect(color.from(0x4b008240).rgb).to.equal('rgba(75, 0, 130, 0.25098039215686274)');
    expect(color.from(0x000001).rgb).to.equal('rgb(0, 0, 1)');
  });

  it('hex -> hsl', () => {
    expect(color.from('#fa8072').hsl).to.equal('hsl(6.176, 93.2%, 71.4%, 1)');
  });

  it('hsl -> rgb', () => {
    expect(color.from('hsl(328, 100%, 54%)').rgb).to.equal('rgb(255, 20, 146)');
    expect(color.from('hsl(328, 100%, 54%, 0.8)').rgb).to.equal('rgba(255, 20, 146, 0.8)');
  });

  it('hsl -> hex', () => {
    expect(color.from('hsl(40, 100%, 97%)').hex).to.equal('#fffaf0');
    expect(color.from('hsl(40, 100%, 97%, 0.75)').hex).to.equal('#fffaf0bf');
  });

  it('name -> hex', () => {
    expect(color.from('rebeccapurple').hex).to.equal('#663399');
  });
});

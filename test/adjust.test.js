import { expect } from 'chai'
import better from '../dist/index.js'

const tests = [
  { name: 'r', rgb: [1, 0, 0], l5: '#bc0000', 'l-1': '#cb0000' },
  { name: 'y', rgb: [1, 1, 0], l5: '#686800', 'l-1': '#dddd00' },
  { name: 'g', rgb: [0, 1, 0], l5: '#007900', 'l-1': '#00d900' },
  { name: 'c', rgb: [0, 1, 1], l5: '#007272', 'l-1': '#00dada' },
  { name: 'b', rgb: [0, 0, 1], l5: '#043fff', 'l-1': '#0000b7' },
  { name: 'm', rgb: [1, 0, 1], l5: '#a200a2', 'l-1': '#d000d0' },
];

describe('better.adjust', () => {
  for (const t of tests) {
    it(`${t.name}: L=0`, () => {
      expect(better.from(t.rgb).adjust({ lightness: 0 }).hex).to.equal('#000000');
    });
    it(`${t.name}: L=1`, () => {
      expect(better.from(t.rgb).adjust({ lightness: 1 }).hex).to.equal('#ffffff');
    });
    it(`${t.name}: L=0.5`, () => {
      expect(better.from(t.rgb).adjust({ lightness: 0.5 }).hex).to.equal(t.l5);
    });
    it(`${t.name}: L-=0.1`, () => {
      expect(better.from(t.rgb).adjust({ mode: 'relative', lightness: -0.1 }).hex).to.equal(t['l-1']);
    });
  }
});

import { expect } from 'chai';
import fs from 'fs';
import { default as sass } from 'sass';
import { fileURLToPath } from 'url';

const colorUtils = fs.readFileSync(new URL('../index.scss', import.meta.url));

function test(css) {
  const input = `${colorUtils}

.sel {
  ${css.replace(/;?$/, ';')}
}`;
  const result = sass.compileString(input);
  const [, output] = result.css.split('.sel {');
  return output.replace(/}$/, '').trim();
}

describe('color.mix', () => {
  // analog
  it('r -> y', () => {
    expect(test('color: mix(#ff0000, #ffff00, 0.5);')).to.equal(`color: #ffba00;`);
  });
  it('r -> g', () => {
    expect(test('color: mix(#ff0000, #00ff00, 0.5);')).to.equal(`color: #baba00;`);
  });
  it('y -> g', () => {
    expect(test('color: mix(#ffff00, #00ff00, 0.5);')).to.equal(`color: #baff00;`);
  });
  it('g -> c', () => {
    expect(test('color: mix(#00ff00, #00ffff, 0.5);')).to.equal(`color: #00ffba;`);
  });
  it('g -> b', () => {
    expect(test('color: mix(#00ff00, #0000ff, 0.5);')).to.equal(`color: #00baba;`);
  });
  it('c -> b', () => {
    expect(test('color: mix(#00ffff, #0000ff, 0.5);')).to.equal(`color: #00baff;`);
  });
  it('b -> m', () => {
    expect(test('color: mix(#0000ff, #ff00ff, 0.5);')).to.equal(`color: #ba00ff;`);
  });
  it('b -> r', () => {
    expect(test('color: mix(#0000ff, #ff0000, 0.5);')).to.equal(`color: #ba00ba;`);
  });
  it('m -> r', () => {
    expect(test('color: mix(#ff00ff, #ff0000, 0.5);')).to.equal(`color: #ff00ba;`);
  });

  // complements
  it('r -> c', () => {
    expect(test('color: mix(#ff0000, #00ffff, 0.5);')).to.equal(`color: #bababa;`);
  });
  it('g -> m', () => {
    expect(test('color: mix(#00ff00, #ff00ff, 0.5);')).to.equal(`color: #bababa;`);
  });
  it('b -> y', () => {
    expect(test('color: mix(#0000ff, #ffff00, 0.5);')).to.equal(`color: #bababa;`);
  });

  it('Sass works as expected', () => {
    expect(test('color: color.mix(#ff0000, #ffff00, 50%);')).to.equal(`color: #ff8000;`);
    expect(test('color: color.mix(#ff0000, #00ff00, 50%);')).to.equal(`color: olive;`);
    expect(test('color: color.mix(#ffff00, #00ff00, 50%);')).to.equal(`color: #80ff00;`);
    expect(test('color: color.mix(#00ff00, #00ffff, 50%);')).to.equal(`color: #00ff80;`);
    expect(test('color: color.mix(#00ff00, #0000ff, 50%);')).to.equal(`color: teal;`);
    expect(test('color: color.mix(#00ffff, #0000ff, 50%);')).to.equal(`color: #0080ff;`);
    expect(test('color: color.mix(#0000ff, #ff00ff, 50%);')).to.equal(`color: #8000ff;`);
    expect(test('color: color.mix(#0000ff, #ff0000, 50%);')).to.equal(`color: purple;`);
    expect(test('color: color.mix(#ff00ff, #ff0000, 50%);')).to.equal(`color: #ff0080;`);
  });
});

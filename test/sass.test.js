import { expect } from 'chai';
import fs from 'fs';
import { default as sass } from 'sass';

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

describe('mix', () => {
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

  // grayscale
  it('k -> w', () => {
    expect(test('color: mix(black, white, 0.1);')).to.equal('color: #5a5a5a;');
    expect(test('color: mix(black, white, 0.2);')).to.equal('color: #7b7b7b;');
    expect(test('color: mix(black, white, 0.3);')).to.equal('color: #949494;');
    expect(test('color: mix(black, white, 0.4);')).to.equal('color: #a8a8a8;');
    expect(test('color: mix(black, white, 0.5);')).to.equal('color: #bababa;');
    expect(test('color: mix(black, white, 0.6);')).to.equal('color: #cacaca;');
    expect(test('color: mix(black, white, 0.7);')).to.equal('color: #d9d9d9;');
    expect(test('color: mix(black, white, 0.8);')).to.equal('color: #e6e6e6;');
    expect(test('color: mix(black, white, 0.9);')).to.equal('color: #f3f3f3;');
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

describe.skip('gradient', () => {
  it('b -> g', () => {
    expect(test('background: linear-gradient(90deg, #{gradient(blue, lime)});')).to.equal('background: linear-gradient(90deg, #0000ff, #0088e0, #00baba, #00e088, #00ff00);');
  });
});

describe('p3', () => {
  it('g', () => {
    expect(test('color: p3(#00ff00);')).to.equal('color: color(display-p3 0 1 0);')
  });
});

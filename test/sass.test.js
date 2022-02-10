import { expect } from 'chai';
import fs from 'fs';
import { default as sass } from 'sass';

const SEMI_RE = /;?$/
const CB_CLOSE_RE = /}$/

const colorUtils = fs.readFileSync(new URL('../index.scss', import.meta.url));

function test(css) {
  const input = `${colorUtils}

.sel {
  ${css.replace(SEMI_RE, ';')}
}`;
  const result = sass.compileString(input);
  const [, output] = result.css.split('.sel {');
  return output.replace(CB_CLOSE_RE, '').trim();
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
    expect(test(
      'background: linear-gradient(90deg, #{gradient(blue 0%, lime 100%)});'
    )).to.equal(
      'background: linear-gradient(90deg, #0000ff, #0088e0, #00baba, #00e088, #00ff00);'
    );
  });

  it('r -> o -> g', () => {
    expect(test(
      'linear-gradient(90deg, #{gradient(red 0%, orange 40%, lime 100%)})'
    )).to.equal(
      'linear-gradient(90deg,#ff0000 0%,#ff3400 10%,#ff4700 20%,#ff5600 30%,#ffa500 40%,#e09c00 55%,#bac400 70%,#88e400 85%,#00ff00 100%)'
    );
  })/

  it('overlapping stops', () => {
    // don’t insert the same blues over and over again
    expect(test(
      'linear-gradient(90deg, #{gradient(blue 0px, blue, 8px, lime 16px)})'
    )).to.equal(
      'linear-gradient(90deg,#0000ff,#0000ff 8px,#0088e0 10px,#00baba 12px,#00e088 14px,#00ff00 16px)'
    );
  });
});

describe('p3', () => {
  it('g', () => {
    expect(test('color: p3(#00ff00);')).to.equal('color: color(display-p3 0 1 0);')
  });
});

describe('fallback', () => {
  it('color', () => {
    expect(test('@include fallback(color, p3(#00ffff), #00ffff)')).to.equal('color: #00ffff;\n  color: color(display-p3 0 1 1);');
  });
});

describe('lightness', () => {
  // note: opacity is only a way to store the value for comparison
  it('R', () => {
    expect(test('opacity: lightness(#f00)')).to.equal('opacity: 0.5323288179;');
  });

  it('Y', () => {
    expect(test('opacity: lightness(#ff0)')).to.equal('opacity: 0.9713824698;');
  });

  it('G', () => {
    expect(test('opacity: lightness(#0f0)')).to.equal('opacity: 0.8773703347;');
  });

  it('C', () => {
    expect(test('opacity: lightness(#0ff)')).to.equal('opacity: 0.9111652111;');
  });

  it('B', () => {
    expect(test('opacity: lightness(#00f)')).to.equal('opacity: 0.3230258667;');
  });

  it('M', () => {
    expect(test('opacity: lightness(#f0f)')).to.equal('opacity: 0.6031993366;');
  });

  it('K', () => {
    expect(test('opacity: lightness(#000)')).to.equal('opacity: 0;');
  });

  it('W', () => {
    expect(test('opacity: lightness(#fff)')).to.equal('opacity: 1;');
  });
});

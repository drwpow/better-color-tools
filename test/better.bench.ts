import { formatCss, formatHex, useMode, modeOklab, modeOklch, modeP3, modeRgb } from 'culori/fn';
import { bench, describe } from 'vitest';
import better from '../dist/index.js';

describe('rgb -> hex', () => {
  bench('better', () => {
    better.from(`rgb(255, 0, 0)`).hex;
  });

  bench('culori', () => {
    const rgb = useMode(modeRgb);
    formatHex(rgb('rgb(255, 0, 0)'));
  })
})

describe('rgb -> p3', () => {
  bench('better', () => {
    better.from(`rgb(255, 0, 0)`).p3;
  });

  bench('culori', () => {
    const p3 = useMode(modeP3);
    formatCss(p3('rgb(255, 0, 0)'));
  });
});

describe('hsl -> rgb', () => {
  bench('better', () => {
    better.from('hsl(0, 100%, 50%)').rgb;
  });

  bench('culori', () => {
    const rgb = useMode(modeRgb);
    formatCss(rgb('hsl(0, 100%, 50%)'));
  });
});

describe('rgb -> oklab', () => {
  bench('better', () => {
    better.from(`rgb(255, 0, 0)`).oklab;
  });

  bench('culori', () => {
    const oklab = useMode(modeOklab);
    formatCss(oklab('rgb(255, 0, 0)'));
  });
});

describe('rgb -> oklch', () => {
  bench('better', () => {
    better.from(`rgb(255, 0, 0)`).oklch;
  });

  bench('culori', () => {
    const oklch = useMode(modeOklch);
    formatCss(oklch('rgb(255, 0, 0)'));
  });
});

describe('parse speed: hex string', () => {
  bench('better', () => {
    better.from('#ff0000');
  });

  bench('culori', () => {
    const rgb = useMode(modeRgb);
    rgb('#ff0000');
  })
});

describe('parse speed: hex number', () => {
  bench('better', () => {
    better.from(0xff0000);
  });
})

describe('parse speed: rgb object', () => {
  bench('better', () => {
    better.from({r: 1, g: 0, b: 0, alpha: 1});
  });
});

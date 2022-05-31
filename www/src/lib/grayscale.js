import NP from 'number-precision';
import better from './better.min.js';

NP.enableBoundaryChecking(false); // don’t throw error on inaccurate calculation

const start = document.querySelector('#start');
const startString = document.querySelector('#start-string');
const end = document.querySelector('#end');
const endString = document.querySelector('#end-string');
const steps = document.querySelector('#steps');
const palette = document.querySelector('.color');

function render() {
  let stepCount = parseInt(steps.value, 10);
  const lastStep = stepCount + 1; // add one for last stop

  // sync values
  search.set('start', start.value);
  search.set('end', end.value);
  search.set('steps', steps.value);

  let rows = [];

  const colorSpaces = ['oklab', 'oklch', 'luv', 'linearRGB', 'sRGB'];

  for (let row = 0; row < colorSpaces.length; row++) {
    const colorSpace = document.createElement('div');
    colorSpace.classList.add('color-scale');
    colorSpace.innerHTML = `<h2 class="color-scale-title">${colorSpaces[row]}${row === 0 ? '<sup>Best</sup>' : ''}</h2>`;

    for (let col = 0; col <= lastStep; col++) {
      const color = better.mix(start.value, end.value, col / lastStep, colorSpaces[row]);
      const block = document.createElement('div');
      block.classList.add('color-block', 'color-block--s');
      block.setAttribute('style', `background:${color.hex};background:${color.p3}`);

      const [L] = color.oklchVal;
      if (L >= 0.5) {
        block.classList.remove('dark');
        block.classList.add('light');
      } else {
        block.classList.add('dark');
        block.classList.remove('light');
      }
      block.innerHTML = `<div class="color-block-info">${color.hex}<br />L: ${NP.round(L * 100, 2)}%</div>`;
      colorSpace.append(block);
    }

    rows.push(colorSpace);
  }

  // erase HTML (safely)
  while (palette.firstChild) {
    palette.removeChild(palette.firstChild);
  }
  // update HTML
  palette.append(...rows);

  // update URL
  window.location.hash = `#${search.toString()}`;
}

// init
const search = new URLSearchParams(window.location.hash.substring(1));
if (search.get('start')) {
  start.value = search.get('start');
  startString.value = search.get('start');
}
if (search.get('end')) {
  end.value = search.get('end');
  endString.value = search.get('end');
}
if (search.get('steps')) {
  steps.value = search.get('steps');
}
render();

// update
start.addEventListener('change', (evt) => {
  startString.value = evt.target.value;
  render();
});
startString.addEventListener('keyup', (evt) => {
  try {
    const c = better.from(evt.target.value);
    start.value = c.hex;
    render();
  } catch {
    // ignore
  }
});
end.addEventListener('change', (evt) => {
  endString.value = evt.target.value;
  render();
});
endString.addEventListener('keyup', (evt) => {
  try {
    const c = better.from(evt.target.value);
    end.value = c.hex;
    render();
  } catch {
    // ignore
  }
});
steps.addEventListener('keyup', (evt) => {
  if (parseInt(evt.target.value) > 0 === false) return;
  render();
});

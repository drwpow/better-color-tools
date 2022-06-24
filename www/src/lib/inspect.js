import NP from 'number-precision';
import better from './better.min.js';

NP.enableBoundaryChecking(false); // don’t throw error on inaccurate calculation

const picker = document.querySelector('#picker');
const colorString = document.querySelector('#color-string');
const block = document.querySelector('.color-block');

function render() {
  const c = better.from(picker.value);
  search.set('c', picker.value);

  block.style.backgroundColor = c.hex;

  if (c.oklabVal[0] >= 0.5) {
    block.classList.remove('dark');
    block.classList.add('light');
  } else {
    block.classList.add('dark');
    block.classList.remove('light');
  }

  document.querySelector('#hex').innerHTML = c.hex;
  document.querySelector('#rgb').innerHTML = c.rgb;
  document.querySelector('#p3').innerHTML = c.p3;
  document.querySelector('#oklab').innerHTML = c.oklab;
  document.querySelector('#oklch').innerHTML = c.oklch;

  window.location.hash = `#${search.toString()}`;
}

// init
const search = new URLSearchParams(window.location.hash.substring(1));
if (search.get('c')) {
  try {
    const c = better.from(search.get('c'));
    picker.value = c.hex;
    colorString.value = search.get('c');
  } catch {
    const rand = better.from([Math.random(), Math.random(), Math.random()]).hex;
    picker.value = rand;
    colorString.value = rand;
  }
} else {
  const rand = better.from([Math.random(), Math.random(), Math.random()]).hex;
  picker.value = rand;
  colorString.value = rand;
}
render();

// update
picker.addEventListener('change', (evt) => {
  colorString.value = evt.target.value;
  render();
});
colorString.addEventListener('keyup', (evt) => {
  try {
    const c = better.from(evt.target.value);
    picker.value = c.hex;
    render();
  } catch {
    // ignore
  }
});

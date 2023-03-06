import better, { round } from '../dist/index.js';

/* eslint-disable no-console */

const chromaTable = {};

/**
 * Script used to make approximations on max chroma
 */
for (let h = 0; h < 360; h++) {
  let maxLightness = 0;
  let maxChroma = 0;
  for (let l = 0.5; l < 0.9; l += 0.001) {
    const [nextL, nextC] = better.from({ l, c: 0.4, h }).oklchVal;
    if (nextC > maxChroma) {
      maxLightness = round(nextL, 3);
      maxChroma = round(nextC, 5);
    }
  }
  chromaTable[h] = { l: maxLightness, c: maxChroma };
}
console.log(JSON.stringify(chromaTable, undefined, 2));

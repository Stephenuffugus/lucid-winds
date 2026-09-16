#!/usr/bin/env node
/* TINT P0: the colour pipeline (plans/tint/HANDOFF-TINT.md 3.2 and 3.3; the handoff's section 4, "the single most important test
 * in this file").
 *
 *   node test/colour.mjs
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. sRGB bytes to linear light and back is exact for all 256 values
 *   2. reduceRatio gives lowest whole terms, halves included (5 : 2.5 is 2 : 1, 6 : 3 is 2 : 1, 0.5 : 1 is 1 : 2, 3 : 2 stays)
 *   3. T10 and 3.2: equivalent ratios mix to IDENTICAL colour, the floats and the bytes, for every dye, seven ratio families and
 *      factors 1, 2, 3, 5, 7, 1.5 and 2.5; and the handoff's own mix(2,1) === mix(4,2) === mix(6,3)
 *   4. all dye and no white is the dye; no dye is white; more white in the same dye is lighter, never darker
 *   5. 3.3: every dye has a CIE lightness of 35 or under, and every "different" pair of the trap set is 2.5 or more apart in
 *      lightness with every dye
 *   6. colour.js touches no screen, clock or unseeded die
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const TINT = join(dirname(fileURLToPath(import.meta.url)), '..');
const fails = [];
const say = (ok, line) => { console.log((ok ? '  ok    ' : '  FAIL  ') + line); if (!ok) fails.push(line); };
let C = null;
try { C = await import('../colour.js'); say(true, 'colour.js loads as an ES module'); }
catch (e) { say(false, 'colour.js loads as an ES module (' + e.message.split('\n')[0] + ')'); }

const FAMILIES = [[2, 1], [3, 2], [3, 1], [5, 2], [4, 3], [5, 3], [7, 4]];
const FACTORS = [1, 2, 3, 5, 7, 1.5, 2.5];
const DIFFERENT = [[[2, 1], [3, 2], 'additive'], [[3, 2], [6, 3], 'magical doubling'], [[3, 1], [2, 2], 'constant sum'], [[2, 1], [5, 3], 'build up']];

if (C) {
  /* 1 */
  {
    const bad = [];
    for (let v = 0; v < 256; v++) if (C.toSrgb(C.toLinear(v)) !== v) bad.push(v);
    say(bad.length === 0, 'sRGB bytes to linear light and back is exact for all 256 values' + (bad.length ? ': ' + bad.slice(0, 6).join(', ') : ''));
  }
  /* 2 */
  {
    const cases = [[[5, 2.5], [2, 1]], [[6, 3], [2, 1]], [[0.5, 1], [1, 2]], [[3, 2], [3, 2]], [[9, 6], [3, 2]], [[4, 0], [1, 0]], [[7.5, 5], [3, 2]]];
    const bad = cases.filter(([[a, b], want]) => JSON.stringify(C.reduceRatio(a, b)) !== JSON.stringify(want)).map(([[a, b], want]) => a + ':' + b + ' gave ' + JSON.stringify(C.reduceRatio(a, b)) + ' for ' + JSON.stringify(want));
    say(bad.length === 0, 'reduceRatio gives lowest whole terms, halves included' + (bad.length ? ': ' + bad.join('; ') : ''));
  }
  /* 3 */
  {
    let n = 0;
    const bad = [];
    for (const dye of Object.values(C.DYES)) for (const [a, b] of FAMILIES) {
      const base = C.mixLinear(dye, a, b);
      for (const k of FACTORS) {
        const m = C.mixLinear(dye, a * k, b * k);
        n++;
        if (m.hex !== base.hex || m.lin.some((v, i) => v !== base.lin[i])) bad.push(dye + ' ' + a + ':' + b + ' times ' + k + ' gave ' + m.hex + ' ' + JSON.stringify(m.lin) + ' for ' + base.hex + ' ' + JSON.stringify(base.lin));
      }
    }
    const dye = Object.values(C.DYES)[0], h = [C.mixLinear(dye, 2, 1), C.mixLinear(dye, 4, 2), C.mixLinear(dye, 6, 3)];
    const handoff = h[0].hex === h[1].hex && h[1].hex === h[2].hex && h[0].lin.every((v, i) => v === h[1].lin[i] && v === h[2].lin[i]);
    say(bad.length === 0 && handoff, 'T10: equivalent ratios mix to identical colour, floats and bytes, over ' + n + ' pairs, and mix(2,1) === mix(4,2) === mix(6,3)' + (bad.length ? ': ' + bad.slice(0, 2).join('; ') : ''));
  }
  /* 4 */
  {
    const bad = [];
    for (const [name, dye] of Object.entries(C.DYES)) {
      if (C.mixLinear(dye, 3, 0).hex.toLowerCase() !== dye.toLowerCase()) bad.push(name + ' with no white is ' + C.mixLinear(dye, 3, 0).hex);
      if (C.mixLinear(dye, 0, 3).hex.toLowerCase() !== '#ffffff') bad.push(name + ' with no dye is ' + C.mixLinear(dye, 0, 3).hex);
      let last = -1;
      for (let w = 0; w <= 20; w++) { const L = C.lightness(C.mixLinear(dye, 10, w).hex); if (L < last - 1e-9) bad.push(name + ' darker at ' + w + ' white'); last = L; }
    }
    say(bad.length === 0, 'all dye is the dye, no dye is white, and more white is never darker' + (bad.length ? ': ' + bad.slice(0, 4).join('; ') : ''));
  }
  /* 5 */
  {
    const bad = [], rows = [];
    for (const [name, dye] of Object.entries(C.DYES)) {
      const L = C.lightness(dye);
      if (L > 35) bad.push(name + ' has lightness ' + L.toFixed(1));
      const gaps = DIFFERENT.map(([p, q, why]) => [why, C.lightnessGap(dye, p, q)]);
      for (const [why, g] of gaps) if (!(g >= 2.5)) bad.push(name + ' ' + why + ' ' + g.toFixed(2));
      rows.push(name + ' ' + Math.min(...gaps.map(x => x[1])).toFixed(1));
    }
    say(Object.keys(C.DYES).length >= 3 && bad.length === 0, '3.3: every dye has lightness 35 or under and every different trap pair is 2.5 or more apart (least gaps: ' + rows.join(', ') + ')' + (bad.length ? ': ' + bad.join('; ') : ''));
  }
  /* 6 */
  {
    let src = null;
    try { src = readFileSync(join(TINT, 'colour.js'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, ''); } catch (e) { src = null; }
    const names = src === null ? ['(no file)'] : ['document', 'window', 'Date', 'performance', 'setTimeout', 'requestAnimationFrame'].filter(w => new RegExp('\\b' + w + '\\b').test(src)).concat(/Math\.random/.test(src) ? ['Math.random'] : []);
    say(names.length === 0, 'colour.js touches no screen, clock or unseeded die' + (names.length ? ': it names ' + names.join(', ') : ''));
  }
}

console.log('');
if (fails.length) { console.log(fails.length + ' COLOUR FAILURE(S)'); process.exit(1); }
console.log('COLOUR OK');

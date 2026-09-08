/* MARROWDEEP prototype harness. Node 24, no dependencies.
 *   node sim.mjs --table   the R1.4 master table and the R1.5 floor rows, measured through roll()
 *   node sim.mjs --test    the assertions over R1 to R9
 * The engine is the law's only implementation; this file only measures it.
 */
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const MD = require('./engine.js');

const ARG = process.argv.slice(2);
const has = (f) => ARG.indexOf(f) >= 0;

/* ============================ --table ============================ */
function tableMode() {
  const N = 200000;
  const DICE = [4, 6, 8, 10, 12];
  const TNS = [3, 4, 5, 6, 7];
  // R1.4 CORRECTED. If the engine disagrees with this, the engine is wrong.
  const TRUTH = {
    4:  { 3: 50.0, 4: 25.0,  5: 25.0, 6: 18.75, 7: 12.5 },
    6:  { 3: 66.7, 4: 50.0,  5: 33.3, 6: 16.7,  7: 16.7 },
    8:  { 3: 75.0, 4: 62.5,  5: 50.0, 6: 37.5,  7: 25.0 },
    10: { 3: 80.0, 4: 70.0,  5: 60.0, 6: 50.0,  7: 40.0 },
    12: { 3: 83.3, 4: 75.0,  5: 66.7, 6: 58.3,  7: 50.0 }
  };
  let bad = 0;
  const pad = (s, n) => String(s).padStart(n);

  console.log('MARROWDEEP master table, R1.4 CORRECTED. ' + N.toLocaleString('en-US') + ' rolls per cell, no modifiers.');
  console.log('  measured / RULES R1.4      (a cell off by more than 0.50 points fails)');
  console.log('  die  ' + TNS.map((t) => pad('TN' + t, 15)).join(''));
  for (const die of DICE) {
    const rng = MD.makeRng(MD.seedFromString('table:d' + die));
    const hits = { 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
    for (let i = 0; i < N; i++) {
      const r = MD.roll(die, { rng });
      for (const tn of TNS) if (r.total >= tn) hits[tn]++;
    }
    let row = '  d' + pad(die, 2) + '  ';
    for (const tn of TNS) {
      const got = (hits[tn] / N) * 100;
      const want = TRUTH[die][tn];
      const off = Math.abs(got - want);
      if (off > 0.5) bad++;
      row += pad(got.toFixed(2) + '/' + want.toFixed(2) + (off > 0.5 ? ' X' : '  '), 15);
    }
    console.log(row);
  }

  console.log('');
  console.log('Surge rate per die (R1.2: only the top face surges, so 1/die).');
  for (const die of DICE) {
    const rng = MD.makeRng(MD.seedFromString('surge:d' + die));
    let s = 0;
    for (let i = 0; i < N; i++) if (MD.roll(die, { rng }).surged) s++;
    const got = (s / N) * 100, want = 100 / die;
    if (Math.abs(got - want) > 0.5) bad++;
    console.log('  d' + pad(die, 2) + '   measured ' + pad(got.toFixed(2), 6) + '   R1.2 ' + pad(want.toFixed(2), 6) + (Math.abs(got - want) > 0.5 ? '   X' : ''));
  }

  console.log('');
  console.log('Floor rows, R1.5 CORRECTED (the first die only, so no surge dice: spec 2.4 measures the face).');
  console.log('  config          base EV   floored EV   gain     RULES gain   (tolerance 0.05)');
  // spec 2.4 with the d12 floor 6 row corrected by R1.5
  const FLOORS = [
    { die: 8, floor: 3, evWant: 4.875, gainWant: 0.375 },
    { die: 8, floor: 4, evWant: 5.25, gainWant: 0.75 },
    { die: 10, floor: 4, evWant: 6.10, gainWant: 0.60 },
    { die: 12, floor: 4, evWant: 7.00, gainWant: 0.50 },
    { die: 12, floor: 6, evWant: 7.75, gainWant: 1.25 }
  ];
  for (const f of FLOORS) {
    const r1 = MD.makeRng(MD.seedFromString('floorbase:' + f.die + ':' + f.floor));
    const r2 = MD.makeRng(MD.seedFromString('floored:' + f.die + ':' + f.floor));
    let base = 0, fl = 0;
    for (let i = 0; i < N; i++) base += MD.roll(f.die, { rng: r1 }).floored;
    for (let i = 0; i < N; i++) fl += MD.roll(f.die, { rng: r2, floor: f.floor }).floored;
    base /= N; fl /= N;
    const gain = fl - base;
    const offEv = Math.abs(fl - f.evWant), offGain = Math.abs(gain - f.gainWant);
    if (offEv > 0.05 || offGain > 0.05) bad++;
    console.log('  d' + pad(f.die, 2) + ' floor ' + f.floor + '   ' + pad(base.toFixed(3), 7) + '   ' +
      pad(fl.toFixed(3), 10) + '   ' + pad(gain.toFixed(3), 6) + '   ' + pad(f.gainWant.toFixed(3), 10) +
      ((offEv > 0.05 || offGain > 0.05) ? '   X' : ''));
  }

  console.log('');
  if (bad) { console.log('TABLE FAILED: ' + bad + ' cell(s) off. The engine is wrong, not R1.4.'); process.exit(1); }
  console.log('TABLE OK');
}

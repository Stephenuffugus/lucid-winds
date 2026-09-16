#!/usr/bin/env node
/* GAUGE P0: decimals as strings and scaled integers, never floats (plans/gauge/HANDOFF-GAUGE.md 3.5; GA9).
 *
 *   node test/decimal.mjs
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. parse keeps the places as written (0.50 has two places) and refuses anything that is not a plain decimal string
 *   2. compare orders decimals exactly, against a hand checked table (0.125 < 0.3, 0.4 > 0.35, 5.736 > 5.62, 0.5 = 0.50, 2.6 > 2.06,
 *      0.705 > 0.7, 10.01 > 9.999 ...)
 *   3. add is exact on strings: 0.1 + 0.2 is 0.3, 0.125 + 0.875 is 1, 9.99 + 0.01 is 10
 *   4. rational gives a BigInt numerator over a power of ten: 0.125 is 125 over 1000, 2.06 is 206 over 100
 *   5. sameValue is true for 0.5 and 0.50 and false for 0.5 and 0.05; sameDigits tells 0.5 and 0.50 apart
 *   6. decimal.js names no parseFloat, no Number( and no Math.random, and touches no screen or clock
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const GAUGE = join(dirname(fileURLToPath(import.meta.url)), '..');
const fails = [];
const say = (ok, line) => { console.log((ok ? '  ok    ' : '  FAIL  ') + line); if (!ok) fails.push(line); };
let D = null;
try { D = await import('../decimal.js'); say(true, 'decimal.js loads as an ES module'); }
catch (e) { say(false, 'decimal.js loads as an ES module (' + e.message.split('\n')[0] + ')'); }

if (D) {
  /* 1 */
  {
    const bad = [];
    const cases = [['0.125', '0', '125'], ['5', '5', ''], ['0.50', '0', '50'], ['12.006', '12', '006'], ['0.0', '0', '0']];
    for (const [s, whole, places] of cases) { const p = D.parse(s); if (!p || String(p.whole) !== whole || p.places !== places) bad.push(s + ' gave ' + JSON.stringify(p && { whole: String(p.whole), places: p.places })); }
    for (const s of ['1e3', '.5', '5.', '-0.5', '0,5', ' 0.5', '0.5.1', '', 'NaN']) { let threw = false; try { D.parse(s); } catch (e) { threw = true; } if (!threw) bad.push(JSON.stringify(s) + ' was accepted'); }
    say(bad.length === 0, 'parse keeps the places as written and refuses anything that is not a plain decimal string' + (bad.length ? ': ' + bad.join('; ') : ''));
  }
  /* 2 */
  {
    const table = [['0.125', '0.3', -1], ['0.3', '0.496', -1], ['0.4', '0.35', 1], ['5.736', '5.62', 1], ['0.05', '0.4', -1], ['0.5', '0.50', 0], ['2.6', '2.06', 1],
      ['0.705', '0.7', 1], ['10.01', '9.999', 1], ['0.60', '0.58', 1], ['0.03', '0.125', -1], ['1', '0.999', 1], ['3.20', '3.2', 0], ['0.1', '0.10000', 0]];
    const bad = table.filter(([a, b, w]) => D.compare(a, b) !== w || D.compare(b, a) !== -w).map(([a, b, w]) => a + ' vs ' + b + ' gave ' + D.compare(a, b) + ' for ' + w);
    say(bad.length === 0, 'compare orders decimals exactly against a hand checked table of ' + table.length + ' pairs, both ways' + (bad.length ? ': ' + bad.join('; ') : ''));
  }
  /* 3 */
  {
    const cases = [['0.1', '0.2', '0.3'], ['0.125', '0.875', '1'], ['9.99', '0.01', '10'], ['2.06', '0.4', '2.46'], ['0.5', '0.50', '1']];
    const bad = cases.filter(([a, b, w]) => D.add(a, b) !== w).map(([a, b, w]) => a + ' + ' + b + ' gave ' + D.add(a, b) + ' for ' + w);
    say(bad.length === 0 && D.compare(D.add('0.1', '0.2'), '0.3') === 0, 'add is exact on strings: 0.1 + 0.2 is 0.3' + (bad.length ? ': ' + bad.join('; ') : ''));
  }
  /* 4 */
  {
    const cases = [['0.125', 125n, 1000n], ['2.06', 206n, 100n], ['7', 7n, 1n], ['0.50', 50n, 100n]];
    const bad = cases.filter(([s, n, d]) => { const q = D.rational(s); return !q || q.num !== n || q.den !== d; }).map(([s]) => s + ' gave ' + JSON.stringify(D.rational(s), (k, v) => (typeof v === 'bigint' ? String(v) : v)));
    say(bad.length === 0, 'rational gives a BigInt numerator over a power of ten' + (bad.length ? ': ' + bad.join('; ') : ''));
  }
  /* 5 */
  say(D.sameValue('0.5', '0.50') && !D.sameValue('0.5', '0.05') && D.sameValue('3.2', '3.200') && !D.sameDigits('0.5', '0.50') && D.sameDigits('0.5', '0.5'), 'sameValue sees 0.5 and 0.50 as one value and 0.5 and 0.05 as two; sameDigits tells 0.5 and 0.50 apart');
  /* 6 */
  {
    let src = null;
    try { src = readFileSync(join(GAUGE, 'decimal.js'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, ''); } catch (e) { src = null; }
    const names = src === null ? ['(no file)'] : ['parseFloat', 'document', 'window', 'Date', 'performance'].filter(w => new RegExp('\\b' + w + '\\b').test(src))
      .concat(/\bNumber\(/.test(src) ? ['Number('] : []).concat(/Math\.random/.test(src) ? ['Math.random'] : []).concat(/toFixed\(/.test(src) ? ['toFixed('] : []);
    say(names.length === 0, 'decimal.js names no parseFloat, Number( or toFixed(, and touches no screen, clock or unseeded die' + (names.length ? ': it names ' + names.join(', ') : ''));
  }
}

console.log('');
if (fails.length) { console.log(fails.length + ' DECIMAL FAILURE(S)'); process.exit(1); }
console.log('DECIMAL OK');

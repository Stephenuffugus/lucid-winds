#!/usr/bin/env node
/* CREASE P0: FRACTION_BANK's laws (plans/crease/HANDOFF-CREASE.md 3.1, 3.2, 3.13).
 *
 *   node test/bank.mjs
 *
 * Nothing here trusts a label the bank writes about itself: an item's grade is recomputed from its denominator, a
 * fraction's value from its numerator and denominator.
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. bank.js loads as an ES module and exports FRACTION_BANK and TAGS
 *   2. the tag names are exactly the handoff's six, in any order, and every item carries one of them
 *   3. every item's grade is the lowest grade whose CCSS denominators admit it (3: 2 3 4 6 8; 4: 2 3 4 5 6 8 10 12 100;
 *      otherwise extended)
 *   4. every tag has at least one grade 3 item
 *   5. every one of the handoff's seed items is in the bank under its tag
 *   6. the tags mean what they say: equivalence chains hold equal values, whole-equals-one items equal one, improper
 *      items exceed one, unit-inversion pairs share a numerator with the larger denominator the smaller value,
 *      benchmark-half items lie within an eighth of a half and are not a half, near-miss pairs differ by less than a tenth
 *   7. bank.js names no document, window, Date or Math.random (checked by the lint as well)
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const CREASE = join(dirname(fileURLToPath(import.meta.url)), '..');
const fails = [];
const say = (ok, line) => { console.log((ok ? '  ok    ' : '  FAIL  ') + line); if (!ok) fails.push(line); };
let B;
try { B = await import('../bank.js'); } catch (e) { say(false, 'bank.js loads as an ES module (' + e.message.split('\n')[0] + ')'); }

const HANDOFF_TAGS = ['unit-inversion', 'benchmark-half', 'equivalence', 'whole-equals-one', 'improper', 'near-miss-pairs'];
const SEED = {
  'unit-inversion': [['1/3', '1/8'], ['2/5', '2/9'], ['3/4', '3/10']],
  'benchmark-half': [['4/9'], ['5/9'], ['6/11'], ['7/15']],
  'equivalence': [['1/2', '2/4', '3/6', '4/8'], ['2/3', '4/6', '6/9', '8/12']],
  'whole-equals-one': [['4/4'], ['6/6'], ['8/8']],
  'improper': [['7/4'], ['9/8'], ['11/3']],
  'near-miss-pairs': [['3/5', '4/6'], ['5/8', '7/12']]
};
const G3 = [2, 3, 4, 6, 8], G4 = [2, 3, 4, 5, 6, 8, 10, 12, 100];
const gradeOf = d => G3.includes(d) ? 3 : G4.includes(d) ? 4 : 'extended';
const RANK = { 3: 0, 4: 1, extended: 2 };
const text = f => f.n + '/' + f.d;

if (B) {
  say(Array.isArray(B.FRACTION_BANK) && Array.isArray(B.TAGS), 'bank.js exports FRACTION_BANK and TAGS');
  const bank = Array.isArray(B.FRACTION_BANK) ? B.FRACTION_BANK : [];
  /* an item is { tag, fractions: [{ n, d }], grade }: a set that belongs together (a pair, a chain, or one fraction) */
  const tags = Array.isArray(B.TAGS) ? B.TAGS : [];
  say(tags.length === 6 && HANDOFF_TAGS.every(t => tags.includes(t)) && bank.every(it => tags.includes(it.tag)),
    'the tag names are exactly the handoff\'s six and every item carries one (' + tags.join(', ') + ')');

  const wrongGrade = bank.filter(it => {
    const want = it.fractions.map(f => gradeOf(f.d)).reduce((a, g) => RANK[g] > RANK[a] ? g : a, 3);
    return it.grade !== want;
  }).map(it => it.fractions.map(text).join(' ') + ' says ' + it.grade);
  say(bank.length > 0 && wrongGrade.length === 0, 'every item\'s grade is the lowest grade whose denominators admit all its fractions' + (wrongGrade.length ? ': ' + wrongGrade.slice(0, 4).join('; ') : ' (' + bank.length + ' items)'));

  const empty = HANDOFF_TAGS.filter(t => !bank.some(it => it.tag === t && it.grade === 3));
  say(empty.length === 0, 'every tag has a grade 3 item' + (empty.length ? ': none for ' + empty.join(', ') : ''));

  const missing = [];
  for (const [tag, sets] of Object.entries(SEED)) for (const set of sets) {
    if (!bank.some(it => it.tag === tag && set.every(s => it.fractions.some(f => text(f) === s)))) missing.push(tag + ' ' + set.join('·'));
  }
  say(missing.length === 0, 'every one of the handoff\'s seed items is in the bank under its tag' + (missing.length ? ': missing ' + missing.join('; ') : ''));

  const v = f => f.n / f.d, bad = [];
  for (const it of bank) {
    const fs = it.fractions, vs = fs.map(v), label = it.tag + ' ' + fs.map(text).join('·');
    if (it.tag === 'equivalence' && !(fs.length >= 2 && vs.every(x => Math.abs(x - vs[0]) < 1e-12))) bad.push(label);
    if (it.tag === 'whole-equals-one' && !vs.every(x => x === 1)) bad.push(label);
    if (it.tag === 'improper' && !vs.every(x => x > 1)) bad.push(label);
    if (it.tag === 'unit-inversion' && !(fs.length === 2 && fs[0].n === fs[1].n && fs[0].d !== fs[1].d && (fs[0].d > fs[1].d) === (vs[0] < vs[1]))) bad.push(label);
    if (it.tag === 'benchmark-half' && !vs.every(x => Math.abs(x - 0.5) <= 0.125 && x !== 0.5)) bad.push(label);
    if (it.tag === 'near-miss-pairs' && !(fs.length === 2 && Math.abs(vs[0] - vs[1]) < 0.1 && vs[0] !== vs[1])) bad.push(label);
  }
  say(bad.length === 0, 'every item means what its tag says, read from its own fractions' + (bad.length ? ': ' + bad.slice(0, 4).join('; ') : ''));
  const src = readFileSync(join(CREASE, 'bank.js'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  const names = ['document', 'window', 'Date', 'performance'].filter(w => new RegExp('\\b' + w + '\\b').test(src)).concat(/Math\.random/.test(src) ? ['Math.random'] : []);
  say(names.length === 0, 'bank.js is data: it names no screen, clock or unseeded die' + (names.length ? ': ' + names.join(', ') : ''));
}

console.log('');
if (fails.length) { console.log(fails.length + ' BANK FAILURE(S)'); process.exit(1); }
console.log('BANK OK');

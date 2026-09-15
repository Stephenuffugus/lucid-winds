#!/usr/bin/env node
/* BRIM P0: PAIR_BANK's laws (plans/brim/HANDOFF-BRIM.md 3.2, 3.4, 3.5).
 *
 *   node test/pairs.mjs
 *
 * Asserted, each watched to fail on a planted fault:
 *   1. pairs.js and engine.js load as ES modules
 *   2. every one of the handoff's seed pairs is in the bank under its tag, and 1/8 vs 7/8 under same-denominator
 *   3. every pair's tag is one of its own features (the handoff's "classify tags all case types across the full bank")
 *   4. no pair is two equal fractions, and every gap trap has the same gap between numerator and denominator
 *   5. every pair's grade is recomputed from its numbers: 3 for the same numerator or denominator on {2, 3, 4, 6, 8}, 4
 *      for any pair on grade 4's list, 5 otherwise
 *   6. grade 3 holds pairs for same-denominator and same-numerator; grade 4 holds pairs for all six tags, and gap traps
 *      that straddle or hold a half, for HALF before its streak (3.16)
 *   7. the tags are exactly the six case types
 */
import { GRADE_DENOMINATORS } from '../../crease/bank.js';

const fails = [];
const say = (ok, line) => { console.log((ok ? '  ok    ' : '  FAIL  ') + line); if (!ok) fails.push(line); };
let P = null, E = null;
try { P = await import('../pairs.js'); say(true, 'pairs.js loads as an ES module'); } catch (e) { say(false, 'pairs.js loads as an ES module (' + e.message.split('\n')[0] + ')'); }
try { E = await import('../engine.js'); say(true, 'engine.js loads as an ES module'); } catch (e) { say(false, 'engine.js loads as an ES module (' + e.message.split('\n')[0] + ')'); }

const CASES = ['same-denominator', 'same-numerator', 'straddle-half', 'same-side-half', 'residual', 'gap-trap'];
const SEED = {
  'same-denominator': ['3/8 5/8', '2/6 5/6', '7/12 4/12', '1/8 7/8'],
  'same-numerator': ['1/3 1/8', '2/5 2/9', '3/4 3/10', '5/6 5/12'],
  'gap-trap': ['3/5 5/7', '2/3 5/6', '1/2 6/7', '4/5 8/9'],
  'straddle-half': ['5/8 3/7', '4/9 7/12', '5/11 6/10'],
  'same-side-half': ['5/8 7/10', '2/7 3/11'],
  'residual': ['5/6 7/8', '3/4 7/9', '9/10 11/12', '4/5 7/9']
};
const text = f => f.n + '/' + f.d;
const keys = p => [text(p.left) + ' ' + text(p.right), text(p.right) + ' ' + text(p.left)];
const value = f => f.n / f.d;
const gradeOf = p => {
  const ds = [p.left.d, p.right.d];
  if (ds.every(d => GRADE_DENOMINATORS[3].includes(d)) && (p.left.n === p.right.n || p.left.d === p.right.d)) return 3;
  if (ds.every(d => GRADE_DENOMINATORS[4].includes(d))) return 4;
  return 5;
};

if (P && E) {
  const bank = P.PAIR_BANK;
  say(Array.isArray(bank) && bank.length > 0, 'PAIR_BANK is a list of pairs (' + (bank ? bank.length : 0) + ')');
  const missing = [];
  for (const [tag, list] of Object.entries(SEED)) for (const k of list) if (!bank.some(p => p.tag === tag && keys(p).includes(k))) missing.push(tag + ' ' + k);
  say(missing.length === 0, 'every one of the handoff\'s seed pairs is in the bank under its tag, with 1/8 vs 7/8' + (missing.length ? ': missing ' + missing.join(', ') : ''));
  const offTag = bank.filter(p => !E.features(p).includes(p.tag)).map(p => p.tag + ' ' + keys(p)[0] + ' has ' + E.features(p).join(','));
  say(offTag.length === 0, 'every pair\'s tag is one of its own features' + (offTag.length ? ': ' + offTag.slice(0, 4).join('; ') : ''));
  const equal = bank.filter(p => value(p.left) === value(p.right)).map(p => keys(p)[0]);
  const gaps = bank.filter(p => p.tag === 'gap-trap' && (p.left.d - p.left.n) !== (p.right.d - p.right.n)).map(p => keys(p)[0]);
  say(equal.length === 0 && gaps.length === 0, 'no pair is two equal fractions, and every gap trap shares its gap' + (equal.length || gaps.length ? ': equal ' + equal.join(', ') + '; gaps differ ' + gaps.join(', ') : ''));
  const wrongGrade = bank.filter(p => p.grade !== gradeOf(p)).map(p => keys(p)[0] + ' says ' + p.grade + ', is ' + gradeOf(p));
  say(wrongGrade.length === 0, 'every pair\'s grade is recomputed from its numbers' + (wrongGrade.length ? ': ' + wrongGrade.slice(0, 4).join('; ') : ''));
  const at = (grade, tag) => bank.filter(p => p.tag === tag && p.grade <= grade).length;
  const thin = [];
  for (const tag of ['same-denominator', 'same-numerator']) if (at(3, tag) < 2) thin.push('grade 3 ' + tag + ' ' + at(3, tag));
  for (const tag of CASES) if (at(4, tag) < 2) thin.push('grade 4 ' + tag + ' ' + at(4, tag));
  const halfTraps = bank.filter(p => p.tag === 'gap-trap' && p.grade <= 4 && !E.features(p).includes('same-side-half')).length;
  if (halfTraps < 3) thin.push('grade 4 gap traps that straddle or hold a half ' + halfTraps);
  say(thin.length === 0, 'grade 3 holds same-denominator and same-numerator pairs, grade 4 every tag, and gap traps HALF can serve before its streak' + (thin.length ? ': ' + thin.join('; ') : ''));
  const tags = Array.from(new Set(bank.map(p => p.tag))).sort();
  say(JSON.stringify(tags) === JSON.stringify([...CASES].sort()), 'the tags are exactly the six case types (' + tags.join(', ') + ')');
}

console.log('');
if (fails.length) { console.log(fails.length + ' PAIRS FAILURE(S)'); process.exit(1); }
console.log('PAIRS OK');

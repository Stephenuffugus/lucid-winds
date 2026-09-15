/* BRIM's PAIR_BANK (plans/brim/HANDOFF-BRIM.md 3.2, 3.4, 3.5, 3.16): the pairs of fractions a child compares, each tagged
 * by the case it was written to be. Pure data, plus the grade worked out from its own numbers.
 *
 * A pair's tag is the case it was chosen for; its features (engine.js) are every case its numbers have, and the tag is one
 * of them (test/pairs.mjs). The handoff's seed pairs are all here; the added ones fill each case at the grades it can live
 * in: grade 3 compares only the same numerator or the same denominator on {2, 3, 4, 6, 8} (3.NF.A.3.d), grade 4 any pair on
 * grade 4's list (4.NF.A.2), and a pair holding 7, 9 or 11 is grade 5 (5.NF.A.2), served only when a link asks.
 */
import { GRADE_DENOMINATORS } from '../crease/bank.js?v=20260916b';

export const CASE_TYPES = Object.freeze(['same-denominator', 'same-numerator', 'straddle-half', 'same-side-half', 'residual', 'gap-trap']);

const frac = t => { const [n, d] = t.split('/').map(Number); return Object.freeze({ n, d }); };
const gradeOf = (left, right) => {
  const ds = [left.d, right.d];
  if (ds.every(d => GRADE_DENOMINATORS[3].includes(d)) && (left.n === right.n || left.d === right.d)) return 3;
  if (ds.every(d => GRADE_DENOMINATORS[4].includes(d))) return 4;
  return 5;
};
function pair(tag, a, b) {
  const left = frac(a), right = frac(b);
  return Object.freeze({ tag, left, right, grade: gradeOf(left, right) });
}

export const PAIR_BANK = Object.freeze([
  /* the same denominator: the numerators say it; the first round of a first session is the obvious one */
  pair('same-denominator', '1/8', '7/8'),
  pair('same-denominator', '3/8', '5/8'),
  pair('same-denominator', '2/6', '5/6'),
  pair('same-denominator', '7/12', '4/12'),
  pair('same-denominator', '1/4', '3/4'),
  pair('same-denominator', '2/3', '1/3'),
  pair('same-denominator', '5/6', '1/6'),
  /* the same numerator: more parts, smaller pieces (harder than it looks: the handoff's difficulty order) */
  pair('same-numerator', '1/3', '1/8'),
  pair('same-numerator', '2/5', '2/9'),
  pair('same-numerator', '3/4', '3/10'),
  pair('same-numerator', '5/6', '5/12'),
  pair('same-numerator', '1/2', '1/6'),
  pair('same-numerator', '2/3', '2/8'),
  pair('same-numerator', '3/4', '3/8'),
  pair('same-numerator', '1/6', '1/3'),
  /* the same gap between numerator and denominator, and unequal: the gap thinker says equal */
  pair('gap-trap', '3/5', '5/7'),
  pair('gap-trap', '2/3', '5/6'),
  pair('gap-trap', '1/2', '6/7'),
  pair('gap-trap', '4/5', '8/9'),
  pair('gap-trap', '3/4', '4/5'),
  pair('gap-trap', '4/5', '5/6'),
  /* gap traps that straddle or hold a half, so HALF can serve them before its streak (3.16) */
  pair('gap-trap', '2/5', '5/8'),
  pair('gap-trap', '1/2', '3/4'),
  pair('gap-trap', '3/6', '5/8'),
  /* one either side of a half */
  pair('straddle-half', '5/8', '3/7'),
  pair('straddle-half', '4/9', '7/12'),
  pair('straddle-half', '5/11', '6/10'),
  pair('straddle-half', '3/5', '5/12'),
  pair('straddle-half', '2/5', '7/10'),
  pair('straddle-half', '4/10', '5/8'),
  /* both on one side of a half */
  pair('same-side-half', '5/8', '7/10'),
  pair('same-side-half', '2/7', '3/11'),
  pair('same-side-half', '1/5', '1/3'),
  pair('same-side-half', '3/4', '5/6'),
  /* both near the brim: what is missing decides it; 3/4 vs 7/9 is the handoff's boss */
  pair('residual', '5/6', '7/8'),
  pair('residual', '3/4', '7/9'),
  pair('residual', '9/10', '11/12'),
  pair('residual', '4/5', '7/9'),
  pair('residual', '7/8', '6/8')
]);

/* CREASE's FRACTION_BANK (plans/crease/HANDOFF-CREASE.md 3.1, 3.2, 3.13): the fractions that set a trap for whole number
 * bias, grouped by the trap. BRIM imports this file; the six tag names are the handoff's and must not be renamed.
 *
 * Pure data. An item is { tag, fractions: [{ n, d }], grade }: one fraction, a pair meant to be compared, or a chain of
 * equal fractions served one after another. Its grade is the lowest CCSS grade whose denominators admit every fraction in
 * it: grade 3 is {2, 3, 4, 6, 8}, grade 4 is {2, 3, 4, 5, 6, 8, 10, 12, 100}, anything else is `extended` (9, 11, 15), which a
 * run serves only when it asks for it (docs/DECISIONS.md). test/bank.mjs recomputes every grade from the denominators.
 */
export const TAGS = Object.freeze(['unit-inversion', 'benchmark-half', 'equivalence', 'whole-equals-one', 'improper', 'near-miss-pairs']);

export const GRADE_DENOMINATORS = Object.freeze({
  3: Object.freeze([2, 3, 4, 6, 8]),
  4: Object.freeze([2, 3, 4, 5, 6, 8, 10, 12, 100])
});

const gradeOfDenominator = d => GRADE_DENOMINATORS[3].includes(d) ? 3 : GRADE_DENOMINATORS[4].includes(d) ? 4 : 'extended';
const RANK = { 3: 0, 4: 1, extended: 2 };

/* 'n/d' strings into an item with its grade worked out from its own denominators */
function item(tag, ...texts) {
  const fractions = texts.map(t => { const [n, d] = t.split('/').map(Number); return Object.freeze({ n, d }); });
  const grade = fractions.map(f => gradeOfDenominator(f.d)).reduce((a, g) => RANK[g] > RANK[a] ? g : a, 3);
  return Object.freeze({ tag, fractions: Object.freeze(fractions), grade });
}

export const FRACTION_BANK = Object.freeze([
  /* the same numerator, a larger denominator, a smaller piece: 1/8 is not more than 1/3 */
  item('unit-inversion', '1/3', '1/8'),
  item('unit-inversion', '2/5', '2/9'),
  item('unit-inversion', '3/4', '3/10'),
  item('unit-inversion', '1/2', '1/6'),
  item('unit-inversion', '2/3', '2/8'),
  /* just either side of a half */
  item('benchmark-half', '4/9'),
  item('benchmark-half', '5/9'),
  item('benchmark-half', '6/11'),
  item('benchmark-half', '7/15'),
  item('benchmark-half', '3/8'),
  item('benchmark-half', '5/8'),
  item('benchmark-half', '5/12'),
  item('benchmark-half', '7/12'),
  item('benchmark-half', '4/10'),
  item('benchmark-half', '6/10'),
  /* equal fractions that land on one point (C4): served in order, the third revealed with the others stacked */
  item('equivalence', '1/2', '2/4', '3/6', '4/8'),
  item('equivalence', '2/3', '4/6', '6/9', '8/12'),
  item('equivalence', '2/3', '4/6', '8/12'),
  item('equivalence', '1/3', '2/6', '4/12'),
  /* the whole strip */
  item('whole-equals-one', '4/4'),
  item('whole-equals-one', '6/6'),
  item('whole-equals-one', '8/8'),
  item('whole-equals-one', '2/2'),
  item('whole-equals-one', '3/3'),
  /* more than one whole, on a strip long enough to hold it */
  item('improper', '7/4'),
  item('improper', '9/8'),
  item('improper', '11/3'),
  item('improper', '3/2'),
  /* close enough to mistake for each other */
  item('near-miss-pairs', '3/5', '4/6'),
  item('near-miss-pairs', '5/8', '7/12'),
  item('near-miss-pairs', '2/3', '3/4'),
  item('near-miss-pairs', '3/8', '2/6')
]);

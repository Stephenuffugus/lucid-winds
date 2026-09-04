/**
 * The words a marble is described with.
 *
 * DESIGN 20 shows integrity, hardness and weight as WORDS rather than numbers: a
 * marble that "endures" tells you what it is for, and 1.3 tells you nothing and
 * invites a spreadsheet.
 *
 * ⛔ THIS FILE IMPORTS NOTHING. It lives apart from collection.js for the same
 * reason tiers.js does: collection.js imports three, so anything living inside it
 * cannot be measured in Node, and a hand written word ladder is exactly the kind
 * of thing that drifts away from generated data when nothing can check it. The
 * first weight ladder topped out at 25 grams over a catalogue whose heaviest
 * marble is 16.7 g, so 58 of 65 marbles printed "barely there" and two of its
 * four words could never appear. `test/words.mjs` measures both ladders against
 * every marble in the catalogue.
 */

/** Hardness and integrity in words. DESIGN 20, and the reason there is no table. */
export function hardnessWord(h) {
  if (h == null) return 'holds together';
  if (h >= 1.35) return 'shrugs it off';
  if (h >= 1.2) return 'endures';
  if (h >= 1.05) return 'holds together';
  if (h >= 0.9) return 'takes its chances';
  return 'chips easily';
}

/**
 * Weight in words, banded against the REAL catalogue:
 *
 *   2.3 g  Peewee            barely there
 *   3.9 g  the clays         light, and quick off the thumb
 *   5.4 g  glass and agate   the usual heft          (49 of 65)
 *  13.2 g  the big agates    heavy in the hand
 *  16.7 g  the steelies      arrives, and stays
 */
export function weightWord(spec) {
  const g = spec.mass * 1000;
  if (g >= 14) return 'arrives, and stays';
  if (g >= 8) return 'heavy in the hand';
  if (g >= 4.5) return 'the usual heft';
  if (g >= 3) return 'light, and quick off the thumb';
  return 'barely there';
}

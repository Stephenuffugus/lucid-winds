/* BRIM's words and colours (plans/brim/HANDOFF-BRIM.md 3.8, 3.15).
   Every string a child or a teacher reads lives in COPY or is composed by caption() below, which tools/lint.mjs reads for
   dashes, exclamation points, the studio's name, the catalog's words and B8's. The page shows numerals and glasses; the
   words are the labels a screen reader speaks and the reveal's one line of fact. */
export const COPY = Object.freeze({
  start: 'Start',
  startMatching: 'Which is fuller',
  startHalf: 'More or less than half',
  startBrim: 'Nearer the brim',
  startLevel: 'The same level',
  next: 'Next',
  again: 'Play on',
  left: 'Left glass',
  right: 'Right glass',
  over: 'over',
  more: 'is more than',
  same: 'is the same as',
  toBrim: 'to the brim',
  and: 'and',
  glass: 'Glass',
  goal: 'Make it read',
  splitInto: 'Cut each part into'
});

/* the reveal's caption, a fact and never a verdict (G7): the larger named first, or the two equal */
export function caption(larger, smaller, equal) {
  const t = f => f.n + '/' + f.d;
  return equal ? t(larger) + ' ' + COPY.same + ' ' + t(smaller) : t(larger) + ' ' + COPY.more + ' ' + t(smaller);
}

/* BRIM mode's caption: how much is missing */
export function brimCaption(f) {
  return (f.d - f.n) + '/' + f.d + ' ' + COPY.toBrim;
}

/* deep teal and muted plum, apart in lightness as well as hue (B5); nothing here means right or wrong */
export const PALETTE = Object.freeze({
  paper: '#efe9dd', ink: '#26282b', inkSoft: '#5f625f', bench: '#c9b89a', benchDark: '#8f7c5c',
  glass: '#f7f6f1', glassEdge: '#7d8a8c', etch: '#9aa6a8', half: '#4e5b5d',
  teal: '#1f6f73', plum: '#9c7d95', empty: '#fff4c4'
});

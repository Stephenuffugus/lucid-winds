/* CREASE's words and colours (plans/crease/HANDOFF-CREASE.md section 4).
   Every string a child or a teacher reads lives in COPY, which tools/lint.mjs reads for dashes, exclamation points, the
   studio's name and the catalog's words. The page shows numerals and pictures; the words here are the labels a screen
   reader speaks. */
export const COPY = Object.freeze({
  start: 'Start',
  next: 'Next',
  again: 'Play on',
  strip: 'Paper strip',
  clip: 'Clip',
  foldMore: 'Fold again',
  foldLess: 'Unfold once',
  less: 'Less than a half',
  more: 'More than a half',
  half: 'Exactly a half',
  over: 'over'
});

/* one palette for the strip; nothing here means right or wrong (the reveal contract, rule 6) */
export const PALETTE = Object.freeze({
  paper: '#f3ecdc', ink: '#2b2721', inkSoft: '#6a6154', board: '#8a6f4d', boardDark: '#5e4a33', strip: '#fbf7ee',
  stripEdge: '#b9ab91', crease: '#8f826c', clip: '#3d5a78', truth: '#b0572f', hatch: 'rgba(43, 39, 33, 0.16)'
});

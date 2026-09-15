/* GLIMPSE's words and colours (plans/glimpse/HANDOFF-GLIMPSE.md sections 3 and 7).
   Every string a child or a teacher reads lives in COPY, which tools/lint.mjs reads for dashes, exclamation points, the
   studio's name and the catalog's words. The page shows fireflies, numerals and dot patterns; the words are the labels a
   screen reader speaks. Nothing here is about speed (GL3). */
export const COPY = Object.freeze({
  start: 'Start',
  startFlash: 'How many fireflies',
  startGroups: 'Two groups',
  startFrame: 'Fill the frame',
  startSpread: 'The same or more',
  next: 'Next',
  again: 'Play on',
  meadow: 'Meadow',
  pad: 'Answer',
  left: 'More on the left',
  right: 'More on the right',
  same: 'The same'
});

/* the dark meadow, and blue and amber swarms apart in lightness as well as hue (GL8); nothing here means right or wrong */
export const PALETTE = Object.freeze({
  night: '#10161f', grass: '#1f3526', grassLit: '#2f4d36', ink: '#e9eef2', inkSoft: '#9fb0bd',
  blue: '#6fb7ff', amber: '#ffcb5c', pad: '#1a2330', padEdge: '#3a4a5c'
});

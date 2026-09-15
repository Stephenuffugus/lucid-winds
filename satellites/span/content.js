/* SPAN's words and colours (plans/span/HANDOFF-SPAN.md section 4).
   Every string a child or a teacher reads lives in COPY, which tools/lint.mjs reads for dashes, exclamation
   points, the studio's name and S7's words; the page never writes a sentence from anywhere else. Captions are
   built from these pieces and the numbers on the piers, and state facts only. */
export const COPY = Object.freeze({
  start: 'Start',
  again: 'Play on',
  stone: 'Stone',
  slab: 'Slab',
  block: 'Block',
  lay: 'Lay the span',
  next: 'Next',
  canyon: 'Canyon',
  sameAs: ' is the same as ',
  is: ' is ',
  and: ' and ',
  oneSide: 'One side is ',
  otherSide: 'the other side is ',
  same: 'The same',
  apart: 'Not the same',
  /* the screener: the teacher's control and the three result lines, shown only after a two second hold */
  teacher: 'Teacher, press and hold',
  correct: 'Correct: ',
  nonstandardCorrect: 'Nonstandard correct: ',
  reached: 'Reached: ',
  of: ' of '
});

/* one palette for the whole canyon; nothing here means right or wrong (the reveal contract, rule 6) */
export const PALETTE = Object.freeze({
  paper: '#efe6d2', ink: '#2b2620', inkSoft: '#6b6154', sky: '#cfdde3', rock: '#a38b6c', rockDark: '#6f5c46',
  stone: '#8c8272', stoneEdge: '#4f483e', span: '#4a3f33', shade: 'rgba(43, 38, 32, 0.22)'
});

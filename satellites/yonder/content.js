/* YONDER's words and colours (plans/yonder/HANDOFF-YONDER.md section 4).
   Every string a child or a teacher reads lives in COPY, which tools/lint.mjs reads for dashes, exclamation points, the
   studio's name, the catalog's words and any word naming a child's reading of the road (Y5). The page shows numerals and
   pictures; the words here are the labels a screen reader speaks. */
export const COPY = Object.freeze({
  start: 'Start',
  startRace: 'The squares',
  next: 'Next',
  again: 'Play on',
  road: 'The road',
  flag: 'Flag',
  track: 'Squares',
  card: 'Card'
});

/* one palette for the road; nothing here means right or wrong (the reveal contract, rule 6) */
export const PALETTE = Object.freeze({
  paper: '#f1e9d8', ink: '#2a2722', inkSoft: '#655d50', sky: '#d7e3e6', grass: '#8aa866', grassDark: '#5f7c45',
  road: '#c7a878', roadEdge: '#6d5a3e', flag: '#c2553a', pole: '#3b3129', traveler: '#35506b', coat: '#d9a441',
  post: '#7a5a3a', truth: '#2f5f86'
});

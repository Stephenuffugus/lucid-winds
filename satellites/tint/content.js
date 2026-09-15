/* TINT's words (plans/tint/HANDOFF-TINT.md sections 3 and 4). Every string a child or teacher sees lives here, so the lint's copy
   scan reads one file: no dash, no exclamation point, and never a word that teaches cross multiplication (T6). */
export const COPY = Object.freeze({
  title: 'Tint',
  studio: 'Sky Wolf Studio',
  startCompare: 'Same colour',
  startFill: 'Fill the vat',
  startScales: 'Does it scale',
  same: 'The same colour',
  different: 'A different colour',
  scales: 'It scales',
  not: 'It does not scale',
  go: 'Go on',
  dye: 'dye',
  white: 'white',
  and: 'and',
  half: 'and a half',
  vatLeft: 'The left vat and its cloth',
  vatRight: 'The right vat and its cloth',
  paintSays: 'The paint says',
  recipe: 'The recipe',
  vatTakes: 'This vat takes',
  howMuchWhite: 'How much white',
  rinseSmall: 'A small vat was rinsed with',
  rinseBig: 'This vat is bigger and takes',
  rinseAsk: 'How much white rinses it',
  tableDye: 'Dye',
  tableWhite: 'White',
  addRow: 'Add a row',
  lessWhite: 'Less white',
  moreWhite: 'More white',
  whiteJugs: 'Jugs of white',
  pour: 'Pour',
  matches: 'It matches the recipe',
  notMatch: 'It does not match the recipe',
  rinseSame: 'A rinse does not grow with the vat, it takes',
  clothMine: 'Your cloth',
  clothRecipe: 'The recipe cloth',
  demo: 'What happens',
  answerIs: 'The answer is'
});

/* DOES IT SCALE (Mode 4): each item of engine.js's NONLINEAR_BANK, asked, and why its answer is what it is */
export const SITUATIONS = Object.freeze({
  dry: Object.freeze({ ask: 'One cloth dries on the line in 2 hours. Four cloths hang side by side on the same line. How many hours until they are all dry?', why: 'They hang side by side and dry at the same time.' }),
  area: Object.freeze({ ask: 'A small square cloth takes 1 jug of dye. A cloth twice as wide and twice as tall takes how many jugs?', why: 'Twice as wide and twice as tall is four of the small squares.' }),
  heat: Object.freeze({ ask: 'The vat takes 10 minutes to heat, then 2 minutes for each jug. How many minutes for 10 jugs?', why: 'The 10 minutes of heating happen once, whatever the jugs.' }),
  dyers: Object.freeze({ ask: '2 dyers dye 6 cloths in an hour. How many cloths do 5 dyers dye in an hour?', why: 'Each dyer dyes 3 cloths an hour, so more dyers dye more.' }),
  boil: Object.freeze({ ask: 'A pot of dye boils in 10 minutes on its own fire. Three pots sit on three fires. How many minutes until all three boil?', why: 'Every pot has its own fire, so they boil together.' }),
  age: Object.freeze({ ask: 'When the dyer was 20, her apprentice was 10. When the apprentice is 20, how old is the dyer?', why: 'They are always 10 years apart.' }),
  sun: Object.freeze({ ask: 'A cloth left in the sun fades in 5 days. Three cloths lie in the sun together. How many days until they fade?', why: 'They lie in the same sun at the same time.' }),
  song: Object.freeze({ ask: '3 dyers sing a work song in 4 minutes. How many minutes does the song take when 6 dyers sing it?', why: 'More singers sing the same song, not a longer one.' }),
  square: Object.freeze({ ask: 'A square cloth 2 tiles wide is covered by 4 tiles. A square cloth 4 tiles wide is covered by how many tiles?', why: 'Twice as wide is also twice as tall, four times the tiles.' }),
  jugs: Object.freeze({ ask: '2 jugs of dye colour 6 cloths. How many cloths do 5 jugs colour?', why: 'Each jug colours 3 cloths, so more jugs colour more.' }),
  rope: Object.freeze({ ask: '3 metres of rope weigh 6 kilograms. How many kilograms do 5 metres weigh?', why: 'Each metre weighs 2 kilograms.' }),
  basket: Object.freeze({ ask: '4 baskets hold 20 skeins of yarn. How many skeins do 7 baskets hold?', why: 'Each basket holds 5 skeins.' }),
  walk: Object.freeze({ ask: 'The dyer walks 3 kilometres in an hour. How many kilometres in 4 hours at the same pace?', why: 'Each hour adds the same 3 kilometres.' })
});

/* CORE's colour tokens for TINT's page: the workshop's plaster, the ink, the madder */
export const PALETTE_TOKENS = Object.freeze({ paper: '#efe6d8', ink: '#2b2a26', accent: '#8e2a2a' });

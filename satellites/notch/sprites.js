/* NOTCH's pixel sprites (CATALOG-PLAN section 5: the pieces are SVG, the workshop and the village may be pixel; plans/notch/
   HANDOFF-NOTCH.md 3.13): eight small carved buildings for the village, drawn by hand. The roof is palette index 8, which the
   village swaps for one of three inks, so eight buildings in three inks make twenty four places with no two alike. Painted
   sheets are Stephen's, later.

   A sprite is rows of equal width; '.' is nothing, a hex digit is a PALETTE index. tools/lint.mjs holds that. */
export const PALETTE = Object.freeze([
  '#2a2119', /* 0 the dim workshop */
  '#5a4330', /* 1 the board */
  '#c89a63', /* 2 wood */
  '#8c6239', /* 3 grain */
  '#1b140e', /* 4 a notch's dark */
  '#3a2a1c', /* 5 an edge */
  '#efe3cf', /* 6 ink */
  '#d9a45b', /* 7 the lamp */
  '#8a4b3a', /* 8 a roof (swapped per ink) */
  '#5b6e4a', /* 9 a green roof */
  '#4f5f7a', /* a a slate roof */
  '#d8c3a0', /* b a wall */
  '#2b2a26', /* c a window */
  '#6b4a2e', /* d a door */
  '#7d7066', /* e stone */
  '#5f7d4a'  /* f grass */
]);

/* the three roof inks, as palette indices */
export const ROOFS = Object.freeze([8, 9, 10]);

export const SPRITES = Object.freeze({
  house: Object.freeze([
    '.....88.....',
    '....8888....',
    '...888888...',
    '..88888888..',
    '.8888888888.',
    '..bbbbbbbb..',
    '..bccbbccb..',
    '..bccbbccb..',
    '..bbbbbbbb..',
    '..bbbddbbb..',
    '..bbbddbbb..',
    'ffffffffffff'
  ]),
  tower: Object.freeze([
    '.....88.....',
    '....8888....',
    '....8888....',
    '....bbbb....',
    '....bccb....',
    '....bbbb....',
    '....bccb....',
    '....bbbb....',
    '....bccb....',
    '....bbbb....',
    '....bddb....',
    'ffffffffffff'
  ]),
  barn: Object.freeze([
    '...888888...',
    '..88888888..',
    '.8888888888.',
    '888888888888',
    '.bbbbbbbbbb.',
    '.bbbbccbbbb.',
    '.bbbbbbbbbb.',
    '.bbbddddbbb.',
    '.bbbddddbbb.',
    '.bbbddddbbb.',
    '.bbbddddbbb.',
    'ffffffffffff'
  ]),
  cottage: Object.freeze([
    '........ee..',
    '....88..ee..',
    '...888888...',
    '..88888888..',
    '.8888888888.',
    '.bbbbbbbbbb.',
    '.bccbbbbccb.',
    '.bbbbbbbbbb.',
    '.bbbbddbbbb.',
    '.bbbbddbbbb.',
    '.bbbbddbbbb.',
    'ffffffffffff'
  ]),
  shop: Object.freeze([
    '............',
    '888888888888',
    '8bbbbbbbbbb8',
    '.bbbbbbbbbb.',
    '.bccccbccbb.',
    '.bccccbccbb.',
    '.bbbbbbbbbb.',
    '.bbbbbbddbb.',
    '.bbbbbbddbb.',
    '.bbbbbbddbb.',
    '.bbbbbbddbb.',
    'ffffffffffff'
  ]),
  well: Object.freeze([
    '............',
    '....8888....',
    '...888888...',
    '...e....e...',
    '...e....e...',
    '...e....e...',
    '...e....e...',
    '..bbbbbbbb..',
    '..bccccccb..',
    '..bbbbbbbb..',
    '............',
    'ffffffffffff'
  ]),
  bridge: Object.freeze([
    '............',
    '............',
    '............',
    '............',
    '8..........8',
    '888888888888',
    'bbbbbbbbbbbb',
    'bb........bb',
    'b..........b',
    'b..........b',
    'b..........b',
    'ffffffffffff'
  ]),
  hall: Object.freeze([
    '.....88.....',
    '.....88.....',
    '...888888...',
    '..88888888..',
    '.8888888888.',
    'bbbbbbbbbbbb',
    'bccbccbccbcc',
    'bbbbbbbbbbbb',
    'bbbbbddbbbbb',
    'bbbbbddbbbbb',
    'bbbbbddbbbbb',
    'ffffffffffff'
  ])
});

export const BUILDINGS = Object.freeze(['house', 'tower', 'barn', 'cottage', 'shop', 'well', 'bridge', 'hall']);

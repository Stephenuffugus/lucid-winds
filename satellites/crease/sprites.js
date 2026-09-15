/* CREASE's sprites, drawn in code as pixels through CORE's sprite.draw (CATALOG-PLAN section 5; plans/crease/HANDOFF-CREASE.md
   section 7): the child's clip and the truth's clip, the pins, the fold controls' pictures, the three doors' pictures and the
   folded paper specimens. The strip, its creases and the hatching stay CSS, flat and exact, because a crease's place is the
   lesson. Painted sheets are Stephen's, later; these ship until then.

   A sprite is rows of equal width; '.' is nothing, a hex digit is a PALETTE index. tools/lint.mjs holds that, and
   `node ../math/core/tools/sheet.mjs sprites.js docs/shots/p3-sprites-sheet.png` draws the table to be opened.
   A specimen's paper is indices 9 and a; draw.js's paletteFor swaps in another pair from PAPERS, so eight shapes on three
   papers make the shelf's twenty four. */
export const PALETTE = Object.freeze([
  '#2b2721', /* 0 ink, every outline */
  '#fbf7ee', /* 1 the strip's paper */
  '#b9ab91', /* 2 the strip's edge, a folded back panel */
  '#3d5a78', /* 3 the child's clip */
  '#1f2f40', /* 4 the clip's foot */
  '#b0572f', /* 5 the truth's clip */
  '#5a2a14', /* 6 the truth's foot */
  '#8a6f4d', /* 7 the board */
  '#5e4a33', /* 8 a pin, the middle fold */
  '#e7c7a0', /* 9 specimen paper */
  '#c49a6c', /* a its shade */
  '#a9c49a', /* b green paper */
  '#7f9c70', /* c its shade */
  '#a8bfd6', /* d blue paper */
  '#7d97b3', /* e its shade */
  '#8f826c'  /* f a crease */
]);

/* the paper pairs a specimen may be folded from, as PALETTE indices */
export const PAPERS = Object.freeze([Object.freeze([9, 10]), Object.freeze([11, 12]), Object.freeze([13, 14])]);

export const SPRITES = Object.freeze({
  clip: Object.freeze([
    '..444..',
    '.4...4.',
    '4..3..4',
    '4.3.3.4',
    '4.3.3.4',
    '4.3.3.4',
    '4.3.3.4',
    '4.3.3.4',
    '4.3.3.4',
    '4.3.3.4',
    '4.3.3.4',
    '4.....4',
    '.4...4.',
    '..444..',
    '...4...',
    '...4...'
  ]),
  truthClip: Object.freeze([
    '..666..',
    '.6...6.',
    '6..5..6',
    '6.5.5.6',
    '6.5.5.6',
    '6.5.5.6',
    '6.5.5.6',
    '6.5.5.6',
    '6.5.5.6',
    '6.5.5.6',
    '6.5.5.6',
    '6.....6',
    '.6...6.',
    '..666..',
    '...6...',
    '...6...'
  ]),
  pin: Object.freeze([
    '0000',
    '0880',
    '0880',
    '0880',
    '0880',
    '0880',
    '0880',
    '0880',
    '0880',
    '0880',
    '0880',
    '0880',
    '0880',
    '0880',
    '0880',
    '0880',
    '0880',
    '0000'
  ]),
  foldLess: Object.freeze([
    '.............',
    '0000000000000',
    '0111111111110',
    '0111111111110',
    '0111111111110',
    '0111111111110',
    '0111111111110',
    '0111111111110',
    '0000000000000',
    '.............'
  ]),
  foldMore: Object.freeze([
    '.............',
    '0000000000000',
    '011111f222220',
    '011111f222220',
    '011111f222220',
    '011111f222220',
    '011111f222220',
    '011111f222220',
    '0000000000000',
    '.............'
  ]),
  doorFreehand: Object.freeze([
    '........0........',
    '.......030.......',
    '.......030.......',
    '.......030.......',
    '........4........',
    '00000000000000000',
    '01111111111111110',
    '01111111111111110',
    '01111111111111110',
    '00000000000000000'
  ]),
  doorCrease: Object.freeze([
    '.................',
    '.................',
    '.................',
    '.................',
    '.................',
    '00000000000000000',
    '0111f111f111f1110',
    '0111f111f111f1110',
    '0111f111f111f1110',
    '00000000000000000'
  ]),
  /* ⛔ the arrows first stood on bars and read as a barbell (docs/shots/p3-doors-375x667.png); now two open chevrons, one
     pointing out each way from the middle fold */
  doorHalfway: Object.freeze([
    '.................',
    '..0...........0..',
    '.0......8......0.',
    '0.......8.......0',
    '.0......8......0.',
    '..0.....8.....0..',
    '00000000800000000',
    '01111111811111110',
    '01111111811111110',
    '00000000000000000'
  ]),
  boat: Object.freeze([
    '............',
    '......0.....',
    '.....090....',
    '....0990....',
    '...09990....',
    '..099990....',
    '000000000000',
    '0aaaaaaaaaa0',
    '.0aaaaaaaa0.',
    '..0aaaaaa0..',
    '...000000...',
    '............'
  ]),
  cup: Object.freeze([
    '............',
    '000000000000',
    '099999999990',
    '.0999999990.',
    '.0aaaaaaaa0.',
    '..0aaaaaa0..',
    '..09999990..',
    '...099990...',
    '...0aaaa0...',
    '....0990....',
    '....0000....',
    '............'
  ]),
  hat: Object.freeze([
    '............',
    '.....00.....',
    '....0990....',
    '....09a0....',
    '...099aa0...',
    '...099aa0...',
    '..0999aaa0..',
    '..0999aaa0..',
    '.0000000000.',
    '0aaaaaaaaaa0',
    '000000000000',
    '............'
  ]),
  dart: Object.freeze([
    '............',
    '0...........',
    '090.........',
    '09990.......',
    '0999990.....',
    '099999990...',
    '0aaaaaaaa000',
    '0aaaaaa0....',
    '0aaaa0......',
    '0aa0........',
    '00..........',
    '............'
  ]),
  fan: Object.freeze([
    '............',
    '000000000000',
    '09a09a09a090',
    '09a09a09a090',
    '09a09a09a090',
    '.09a09a09a0.',
    '.09a09a09a0.',
    '..09a09a90..',
    '..09a09a90..',
    '...0a09a0...',
    '....0000....',
    '............'
  ]),
  kite: Object.freeze([
    '.....00.....',
    '....09a0....',
    '...099aa0...',
    '..0999aaa0..',
    '.09999aaaa0.',
    '099999aaaaa0',
    '.09999aaaa0.',
    '..0999aaa0..',
    '...099aa0...',
    '....09a0....',
    '.....00.....',
    '............'
  ]),
  envelope: Object.freeze([
    '............',
    '000000000000',
    '0a99999999a0',
    '09a999999a90',
    '099a9999a990',
    '0999a99a9990',
    '09999aa99990',
    '099999999990',
    '099999999990',
    '0aaaaaaaaaa0',
    '000000000000',
    '............'
  ]),
  house: Object.freeze([
    '............',
    '.....00.....',
    '....0990....',
    '...099990...',
    '..09999990..',
    '.0999999990.',
    '000000000000',
    '.0aaaaaaaa0.',
    '.0aa0000aa0.',
    '.0aa0110aa0.',
    '.0000110000.',
    '............'
  ])
});

/* the shelf's shapes, in the order they are earned */
export const SPECIMENS = Object.freeze(['boat', 'cup', 'hat', 'dart', 'fan', 'kite', 'envelope', 'house']);

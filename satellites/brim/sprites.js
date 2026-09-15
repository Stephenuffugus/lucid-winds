/* BRIM's sprites, drawn in code as pixels through CORE's sprite.draw (CATALOG-PLAN section 5; plans/brim/HANDOFF-BRIM.md
   section 7): the four doors' pictures and the bottles on the shelf. The glasses, their water, the half line, the empty band
   and the etching stay CSS, flat and exact, because a level is the lesson. Painted sheets are Stephen's, later.

   A sprite is rows of equal width; '.' is nothing, a hex digit is a PALETTE index. tools/lint.mjs holds that, and
   `node ../math/core/tools/sheet.mjs sprites.js docs/shots/p3-sprites-sheet.png` draws the table to be opened.
   A bottle's glass is indices 9 and a; draw.js's paletteFor swaps in another pair from GLASSES, so eight shapes in three
   glasses make the shelf's twenty four. Teal and plum, the two glasses of the game, differ in lightness as well as hue (B5). */
export const PALETTE = Object.freeze([
  '#26282b', /* 0 ink, every outline */
  '#f7f6f1', /* 1 glass, empty */
  '#7d8a8c', /* 2 a glass's edge */
  '#1f6f73', /* 3 teal water */
  '#15504f', /* 4 teal in shade */
  '#b89ab0', /* 5 plum water, twenty and more lighter than teal in CIE L (B5) */
  '#8a6f84', /* 6 plum in shade */
  '#d49a3a', /* 7 amber */
  '#8f7c5c', /* 8 a cork, the bench's edge */
  '#1f6f73', /* 9 a bottle's glass */
  '#15504f', /* a its shade */
  '#c9b89a', /* b the bench */
  '#4e5b5d', /* c the half line */
  '#ffe98a', /* d the lit empty band */
  '#a86f1c', /* e amber in shade */
  '#9aa6a8'  /* f an etch */
]);

/* the glass pairs a bottle may be blown from, as PALETTE indices */
export const GLASSES = Object.freeze([Object.freeze([3, 4]), Object.freeze([5, 6]), Object.freeze([7, 14])]);

export const SPRITES = Object.freeze({
  doorMatching: Object.freeze([
    '.................',
    '.0...0.....0...0.',
    '.0...0.....0...0.',
    '.0...0.....0...0.',
    '.0...0.....05550.',
    '.0...0.....05550.',
    '.03330.....05550.',
    '.03330.....05550.',
    '.03330.....05550.',
    '.00000.....00000.',
    'bbbbbbbbbbbbbbbbb',
    '.................'
  ]),
  doorHalf: Object.freeze([
    '.................',
    '.0...0.....0...0.',
    '.0...0.....0...0.',
    '.0...0.....0...0.',
    '.0...0.....0...0.',
    '.0ccc0.....0ccc0.',
    '.0...0.....05550.',
    '.03330.....05550.',
    '.03330.....05550.',
    '.00000.....00000.',
    'bbbbbbbbbbbbbbbbb',
    '.................'
  ]),
  doorBrim: Object.freeze([
    '.................',
    '.....0.....0.....',
    '.....0ddddd0.....',
    '.....0ddddd0.....',
    '.....0333330.....',
    '.....0333330.....',
    '.....0333330.....',
    '.....0333330.....',
    '.....0333330.....',
    '.....0000000.....',
    'bbbbbbbbbbbbbbbbb',
    '.................'
  ]),
  doorLevel: Object.freeze([
    '.................',
    '.....0.....0.....',
    '.....0ff...0.....',
    '.....0.....0.....',
    '.....0ff...0.....',
    '.....0333330.....',
    '.....0ff3330.....',
    '.....0333330.....',
    '.....0ff3330.....',
    '.....0000000.....',
    'bbbbbbbbbbbbbbbbb',
    '.................'
  ]),
  flask: Object.freeze([
    '...0000...',
    '...0990...',
    '...0990...',
    '..099990..',
    '..099990..',
    '.09999990.',
    '.09a99990.',
    '0999999990',
    '09aa999990',
    '0999999990',
    '0aaaaaaaa0',
    '0000000000'
  ]),
  jar: Object.freeze([
    '.00000000.',
    '.08888880.',
    '.00000000.',
    '0999999990',
    '09a9999990',
    '09a9999990',
    '0999999990',
    '0999999990',
    '0999999990',
    '0aaaaaaaa0',
    '0000000000',
    '..........'
  ]),
  bottle: Object.freeze([
    '....00....',
    '....80....',
    '....90....',
    '...0990...',
    '..099990..',
    '.09999990.',
    '.09a99990.',
    '.09a99990.',
    '.09999990.',
    '.09999990.',
    '.0aaaaaa0.',
    '.00000000.'
  ]),
  vial: Object.freeze([
    '...0000...',
    '...0880...',
    '...0990...',
    '...0990...',
    '...0a90...',
    '...0a90...',
    '...0990...',
    '...0990...',
    '...0990...',
    '...0aa0...',
    '...0000...',
    '..........'
  ]),
  beaker: Object.freeze([
    '0000000000',
    '.09999990.',
    '.09a99990.',
    '.09a99990.',
    '.09999990.',
    '.09999990.',
    '.09999990.',
    '.09999990.',
    '.0aaaaaa0.',
    '.00000000.',
    '..........',
    '..........'
  ]),
  gourd: Object.freeze([
    '....00....',
    '...0990...',
    '...0990...',
    '....00....',
    '...0990...',
    '..099990..',
    '.09a99990.',
    '.09a99990.',
    '.09999990.',
    '..0aaaa0..',
    '...0000...',
    '..........'
  ]),
  cruet: Object.freeze([
    '....00....',
    '....88....',
    '..000000..',
    '.09999990.',
    '0999999990',
    '09a9999990',
    '09a9999990',
    '0999999990',
    '.09999990.',
    '.0aaaaaa0.',
    '..000000..',
    '..........'
  ]),
  drop: Object.freeze([
    '....00....',
    '...0990...',
    '...0990...',
    '..099990..',
    '..099990..',
    '.09999990.',
    '.09a99990.',
    '.09a99990.',
    '.09999990.',
    '..0aaaa0..',
    '...0000...',
    '..........'
  ])
});

/* the shelf's shapes, in the order they are earned */
export const BOTTLES = Object.freeze(['flask', 'jar', 'bottle', 'vial', 'beaker', 'gourd', 'cruet', 'drop']);

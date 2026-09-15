/* SPAN's sprites, drawn in code as pixels through CORE's sprite.draw (CATALOG-PLAN section 5; plans/span/HANDOFF-SPAN.md
   section 7): the stones a child lays, the mason who crosses the finished span, the arch pieces of the viaduct, the
   canyon's far wall and the dust of a stone set down. Painted sheets are Stephen's, later; these ship until then.

   A sprite is rows of equal width; '.' is nothing, a hex digit is a PALETTE index. tools/lint.mjs holds that, and
   `node ../math/core/tools/sheet.mjs sprites.js docs/shots/p3-sprites-sheet.png` draws the table to be opened. */
export const PALETTE = Object.freeze([
  '#2b2620', /* 0 ink, the mason's outline */
  '#4f483e', /* 1 a stone's edge */
  '#6b6154', /* 2 a stone's shade */
  '#8c8272', /* 3 stone */
  '#a89f8e', /* 4 a stone's lit face */
  '#4a3f33', /* 5 the span */
  '#6f5c46', /* 6 the canyon's dark rock */
  '#a38b6c', /* 7 the canyon's rock */
  '#cfdde3', /* 8 sky */
  '#efe6d2', /* 9 paper */
  '#d8ccb4', /* a dust */
  '#b0482e', /* b the mason's tunic */
  '#e0b48a', /* c skin */
  '#3d5a73', /* d the mason's trousers */
  '#f3eee2', /* e a highlight */
  '#000000'  /* f unused */
]);

export const SPRITES = Object.freeze({
  stone: [
    '.111111.',
    '13444431',
    '13343331',
    '13333331',
    '12333321',
    '.111111.'
  ],
  slab: [
    '.1111111111.',
    '134444444431',
    '133433343331',
    '133333333331',
    '123333333321',
    '.1111111111.'
  ],
  block: [
    '111111111111',
    '144444444441',
    '134333333331',
    '133333333331',
    '111111111111',
    '133331333331',
    '133331333331',
    '133331333331',
    '123331233321',
    '111111111111'
  ],
  pierCap: [
    '1111111111111111',
    '1444444444444441',
    '1343333333333431',
    '1333333333333331',
    '1111111111111111'
  ],
  masonWalk1: [
    '...0000...',
    '..0bbbb0..',
    '...0cc0...',
    '...0cc0...',
    '..0bbbb0..',
    '.0bbbbbb0.',
    '.0cbbbbc0.',
    '..0bbbb0..',
    '..0dddd0..',
    '..0d00d0..',
    '..0d0.0d0.',
    '.0d0...0d0',
    '.00.....00',
    '..........'
  ],
  masonWalk2: [
    '...0000...',
    '..0bbbb0..',
    '...0cc0...',
    '...0cc0...',
    '..0bbbb0..',
    '.0bbbbbb0.',
    '.0cbbbbc0.',
    '..0bbbb0..',
    '..0dddd0..',
    '..0d00d0..',
    '...0dd0...',
    '...0dd0...',
    '...0dd0...',
    '...0000...'
  ],
  masonWalk3: [
    '...0000...',
    '..0bbbb0..',
    '...0cc0...',
    '...0cc0...',
    '..0bbbb0..',
    '.0bbbbbb0.',
    '.0cbbbbc0.',
    '..0bbbb0..',
    '..0dddd0..',
    '..0d00d0..',
    '.0d0.0d0..',
    '0d0...0d0.',
    '00.....00.',
    '..........'
  ],
  masonWalk4: [
    '...0000...',
    '..0bbbb0..',
    '...0cc0...',
    '...0cc0...',
    '..0bbbb0..',
    '.0bbbbbb0.',
    '.0cbbbbc0.',
    '..0bbbb0..',
    '..0dddd0..',
    '..0d00d0..',
    '...0dd0...',
    '...0dd0...',
    '...0dd0...',
    '...0000...'
  ],
  archLeft: [
    '......11',
    '....1334',
    '...13343',
    '..133333',
    '.1333331',
    '.133331.',
    '1333331.',
    '133331..'
  ],
  archRight: [
    '11......',
    '4331....',
    '34331...',
    '333331..',
    '1333331.',
    '.133331.',
    '.1333331',
    '..133331'
  ],
  keystone: [
    '111111',
    '134431',
    '133331',
    '.1331.',
    '.1331.',
    '..11..'
  ],
  farWall: [
    '7777777777777777',
    '7767777776777777',
    '6666666666666666',
    '6676666666667666',
    '7777777777777777',
    '6667766667776666',
    '6666666666666666',
    '2222222222222222'
  ],
  dust: [
    '..aa..',
    '.aaaa.',
    'aaeaaa',
    '.aaaa.',
    '..aa..',
    '......'
  ]
});

/* YONDER's sprites, drawn in code as pixels through CORE's sprite.draw (CATALOG-PLAN section 5; plans/yonder/HANDOFF-YONDER.md
   section 7): the traveler walking, the flag, the signpost, a milepost, the card face down and showing 1 and 2, the map's
   pieces and a grass tuft. Painted sheets are Stephen's, later; these ship until then.

   ⛔ Y1 holds for sprites too: nothing round. No pip, eye, wheel, sun or tree top is a circle; a tree is a stack of
   steps, a hill is terraced, a card's count is square pips.
   ⛔ From the first sheet, opened: the signpost was a flat board centred on its post and read as a table (now a board
   with a pointed end, on a post at its left); the hill was a hollow outline and read as a tent (now filled terraces);
   the house's windows and door read as a face, and its foundation ran off the tile (now one window, a door to the side).

   A sprite is rows of equal width; '.' is nothing, a hex digit is a PALETTE index. tools/lint.mjs holds that, and
   `node ../math/core/tools/sheet.mjs sprites.js docs/shots/p3-sprites-sheet.png` draws the table to be opened. */
export const PALETTE = Object.freeze([
  '#2a2722', /* 0 ink, every outline */
  '#e0b48a', /* 1 skin */
  '#35506b', /* 2 the traveler's coat */
  '#4a6a88', /* 3 the coat's lit side */
  '#c2553a', /* 4 the flag */
  '#8e3a26', /* 5 the flag's shade */
  '#3b3129', /* 6 a pole, boots */
  '#7a5a3a', /* 7 wood */
  '#a07a50', /* 8 wood's lit side */
  '#c7a878', /* 9 the road */
  '#6d5a3e', /* a the road's edge */
  '#8aa866', /* b grass */
  '#5f7c45', /* c grass in shade */
  '#d7e3e6', /* d sky, water */
  '#f7f1e3', /* e paper, a card's face */
  '#2f5f86'  /* f the truth's post */
]);

export const SPRITES = Object.freeze({
  travelerWalk1: [
    '....0000....',
    '...011110...',
    '...011110...',
    '...011110...',
    '....0000....',
    '...022220...',
    '..02233220..',
    '..02233220..',
    '..01222210..',
    '...022220...',
    '...060060...',
    '...060060...',
    '..0660.0660.',
    '..000...000.'
  ],
  travelerWalk2: [
    '....0000....',
    '...011110...',
    '...011110...',
    '...011110...',
    '....0000....',
    '...022220...',
    '..02233220..',
    '..02233220..',
    '..01222210..',
    '...022220...',
    '....0660....',
    '....0660....',
    '...06600....',
    '...0000.....'
  ],
  travelerWalk3: [
    '....0000....',
    '...011110...',
    '...011110...',
    '...011110...',
    '....0000....',
    '...022220...',
    '..02233220..',
    '..02233220..',
    '..01222210..',
    '...022220...',
    '...060060...',
    '..060..060..',
    '.0660...0660',
    '.000.....000'
  ],
  travelerWalk4: [
    '....0000....',
    '...011110...',
    '...011110...',
    '...011110...',
    '....0000....',
    '...022220...',
    '..02233220..',
    '..02233220..',
    '..01222210..',
    '...022220...',
    '....0660....',
    '....0660....',
    '....00660...',
    '.....0000...'
  ],
  flag: [
    '06..........',
    '0600000000..',
    '0604444440..',
    '06044444440.',
    '06044444550.',
    '06044455550.',
    '0600000000..',
    '06..........',
    '06..........',
    '06..........',
    '06..........',
    '00..........'
  ],
  signpost: [
    '.0000000000...',
    '.08888888880..',
    '.087777777770.',
    '.0877777777770',
    '.087777777770.',
    '.00000000000..',
    '..0870........',
    '..0870........',
    '..0870........',
    '..0870........',
    '.000000.......',
    '0cccccc0......'
  ],
  milepost: [
    '0000',
    '0870',
    '0870',
    '0000',
    '0870',
    '0870',
    '0870',
    '0870',
    '0870',
    '0000'
  ],
  cardDown: [
    '0000000000000000',
    '0233233233233230',
    '0322322322322320',
    '0233233233233230',
    '0322322322322320',
    '0233233233233230',
    '0322322322322320',
    '0233233233233230',
    '0322322322322320',
    '0233233233233230',
    '0322322322322320',
    '0000000000000000'
  ],
  cardOne: [
    '0000000000000000',
    '0eeeeeeeeeeeeee0',
    '0eeeeeeeeeeeeee0',
    '0eeeeeeeeeeeeee0',
    '0eeeeee00eeeeee0',
    '0eeeeee00eeeeee0',
    '0eeeeee00eeeeee0',
    '0eeeeeeeeeeeeee0',
    '0eeeeeeeeeeeeee0',
    '0eeeeeeeeeeeeee0',
    '0eeeeeeeeeeeeee0',
    '0000000000000000'
  ],
  cardTwo: [
    '0000000000000000',
    '0eeeeeeeeeeeeee0',
    '0eeeeeeeeeeeeee0',
    '0eeeeeeeeeeeeee0',
    '0eee00eeee00eee0',
    '0eee00eeee00eee0',
    '0eeeeeeeeeeeeee0',
    '0eeeeeeeeeeeeee0',
    '0eeeeeeeeeeeeee0',
    '0eeeeeeeeeeeeee0',
    '0eeeeeeeeeeeeee0',
    '0000000000000000'
  ],
  pipsOne: [
    '00',
    '00'
  ],
  pipsTwo: [
    '00..00',
    '00..00'
  ],
  roadTile: [
    'aaaaaaaa',
    '99999999',
    '99989999',
    '99999999',
    '99999899',
    'aaaaaaaa'
  ],
  grassTuft: [
    '..c...c.',
    '.c.c.c..',
    '.cbc.cb.',
    'cbbbcbbc'
  ],
  mapField: [
    'bbbbbbbbbbbb',
    'bbbbbcbbbbbb',
    'bbcbbbbbbcbb',
    'bbbbbbbbbbbb',
    'bbbbbbbcbbbb',
    'bcbbbbbbbbbb',
    'bbbbbbbbbbcb',
    'bbbbcbbbbbbb',
    'bbbbbbbbbbbb',
    'bbbbbbbcbbbb',
    'bbcbbbbbbbbb',
    'bbbbbbbbbbbb'
  ],
  mapTrees: [
    'bbbbbbbbbbbb',
    'bbcbbbbbbcbb',
    'bcccbbbbcccb',
    'cccccbbccccc',
    'bb7bbbbbb7bb',
    'bbbbbcbbbbbb',
    'bbbbcccbbbbb',
    'bbbcccccbbbb',
    'bbbbb7bbbbbb',
    'bbbbbbbbbbbb',
    'bcbbbbbbbbcb',
    'bbbbbbbbbbbb'
  ],
  mapHill: [
    'bbbbbbbbbbbb',
    'bbbbbbbbbbbb',
    'bbbbbbbbbbbb',
    'bbbbbccbbbbb',
    'bbbbccccbbbb',
    'bbbbccccbbbb',
    'bbbccccccbbb',
    'bbbccccccbbb',
    'bbccccccccbb',
    'bbccccccccbb',
    'bccccccccccb',
    'bbbbbbbbbbbb'
  ],
  mapRiver: [
    'bbbbbbbbbbbb',
    'bbbbbbbbbbbb',
    'bbbbbbbbbbbb',
    'dddddddddddd',
    'dddddddddddd',
    'dddddddddddd',
    'bbbbbbbbbbbb',
    'bbbcbbbbbbbb',
    'bbbbbbbbcbbb',
    'bbbbbbbbbbbb',
    'bbbbbbbbbbbb',
    'bbbbbbbbbbbb'
  ],
  mapHouse: [
    'bbbbbbbbbbbb',
    'bbbbbbbbbbbb',
    'bbbbb00bbbbb',
    'bbbb0550bbbb',
    'bbb055550bbb',
    'bb05555550bb',
    'bb00000000bb',
    'bb0eeeeee0bb',
    'bb0e00e770bb',
    'bb0eeee770bb',
    'bb00000000bb',
    'bbbbbbbbbbbb'
  ],
  mapRoad: [
    'bbbbbbbbbbbb',
    'bbbbbbbbbbbb',
    'bbbbbbbbbbbb',
    'bbbbbbbbbbbb',
    'aaaaaaaaaaaa',
    '999999999999',
    '999899999899',
    'aaaaaaaaaaaa',
    'bbbbbbbbbbbb',
    'bbbbbbbbbbbb',
    'bbbbbbbbbbbb',
    'bbbbbbbbbbbb'
  ]
});

/* the map's pieces in the order they are earned, westward from the first */
export const MAP_ORDER = Object.freeze(['mapRoad', 'mapField', 'mapTrees', 'mapRiver', 'mapHill', 'mapHouse']);

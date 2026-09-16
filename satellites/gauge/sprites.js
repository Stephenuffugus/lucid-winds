/* GAUGE's sprites, drawn in code as pixels through CORE's sprite.draw (CATALOG-PLAN section 5; plans/gauge/HANDOFF-GAUGE.md
   section 7): the instruments in the case. The rule, its ticks and the marker stay CSS, flat and exact, because a position is the
   lesson. Painted sheets are Stephen's, later.

   A sprite is rows of equal width; '.' is nothing, a hex digit is a PALETTE index. An instrument's metal is indices 9 and a;
   case.js swaps in another pair from METALS, so eight instruments in three metals make the case's twenty four. */
export const PALETTE = Object.freeze([
  '#26282b', /* 0 ink, every outline */
  '#f7f2e7', /* 1 a dial's face */
  '#6f9f4f', /* 2 a level's bubble */
  '#b08a3e', /* 3 brass */
  '#7d6128', /* 4 brass in shade */
  '#a3adb5', /* 5 steel */
  '#687279', /* 6 steel in shade */
  '#b8733e', /* 7 copper */
  '#7f4b24', /* 8 copper in shade */
  '#b08a3e', /* 9 an instrument's metal */
  '#7d6128', /* a its shade */
  '#c9b89a', /* b the case's felt */
  '#26282b', /* c */
  '#26282b', /* d */
  '#26282b', /* e */
  '#26282b'  /* f */
]);

/* the metals an instrument may be made in, as PALETTE indices */
export const METALS = Object.freeze([Object.freeze([3, 4]), Object.freeze([5, 6]), Object.freeze([7, 8])]);

export const SPRITES = Object.freeze({
  rule: Object.freeze([
    '..........',
    '..........',
    '..........',
    '0000000000',
    '09a9a9a9a0',
    '0999999990',
    '0999999990',
    '0000000000',
    '..........',
    '..........',
    '..........',
    '..........'
  ]),
  calipers: Object.freeze([
    '.000......',
    '.090......',
    '.090000000',
    '.099999990',
    '.0a0000000',
    '.0a0......',
    '.0a0..000.',
    '.0a0..090.',
    '.0a0000990',
    '.099999990',
    '.000000000',
    '..........'
  ]),
  plumb: Object.freeze([
    '....00....',
    '....0.....',
    '....0.....',
    '....0.....',
    '...0000...',
    '..099990..',
    '.09999990.',
    '.0999aa90.',
    '..0999a0..',
    '...0990...',
    '....00....',
    '..........'
  ]),
  dial: Object.freeze([
    '..000000..',
    '.01111110.',
    '0111111110',
    '0111101110',
    '0111011110',
    '0110111110',
    '0111111110',
    '.01111110.',
    '..000000..',
    '....09....',
    '...0990...',
    '...0000...'
  ]),
  level: Object.freeze([
    '..........',
    '..........',
    '..........',
    '0000000000',
    '0999999990',
    '0999229990',
    '09a9229a90',
    '0999999990',
    '0000000000',
    '..........',
    '..........',
    '..........'
  ]),
  micrometer: Object.freeze([
    '..........',
    '0000......',
    '0990......',
    '09.0......',
    '09.0000000',
    '09.999aa90',
    '09.0000000',
    '09.0......',
    '0990......',
    '0000......',
    '..........',
    '..........'
  ]),
  square: Object.freeze([
    '0.........',
    '00........',
    '090.......',
    '0990......',
    '09a90.....',
    '09.a90....',
    '09..a90...',
    '09...a90..',
    '09....a90.',
    '0999999990',
    '0000000000',
    '..........'
  ]),
  dividers: Object.freeze([
    '....00....',
    '....99....',
    '...0990...',
    '...0990...',
    '..09..90..',
    '..09..90..',
    '.09....90.',
    '.09....90.',
    '09......90',
    '0a......a0',
    '0........0',
    '..........'
  ])
});

/* the case's order of instruments, one a run */
export const INSTRUMENTS = Object.freeze(['rule', 'calipers', 'plumb', 'dial', 'level', 'micrometer', 'square', 'dividers']);

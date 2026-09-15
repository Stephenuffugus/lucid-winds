/* GLIMPSE's sprites, drawn in code as pixels through CORE's sprite.draw (CATALOG-PLAN section 5; plans/glimpse/HANDOFF-GLIMPSE.md
   section 7 and 3.8): the firefly's glow in blue and in amber, drawn once and blitted for every firefly (never a blur), and the
   grass tuft the mask is tiled from. Painted sheets are Stephen's, later.

   A sprite is rows of equal width; '.' is nothing, a hex digit is a PALETTE index. tools/lint.mjs holds that. */
export const PALETTE = Object.freeze([
  '#10161f', /* 0 night */
  '#1f3526', /* 1 grass */
  '#2f4d36', /* 2 grass in the light */
  '#e6f3ff', /* 3 blue firefly, its heart */
  '#6fb7ff', /* 4 blue firefly */
  '#2d5b86', /* 5 blue firefly, its halo */
  '#fff3cf', /* 6 amber firefly, its heart */
  '#ffcb5c', /* 7 amber firefly */
  '#8a6420', /* 8 amber firefly, its halo */
  '#e9eef2', /* 9 ink */
  '#1a2330', /* a a pad */
  '#3a4a5c', /* b a pad's edge */
  '#9fb0bd', /* c soft ink */
  '#4f7a55', /* d a grass tip */
  '#26323f', /* e the meadow's edge */
  '#000000'  /* f black */
]);

export const SPRITES = Object.freeze({
  glowBlue: Object.freeze([
    '...555...',
    '..54445..',
    '.5443445.',
    '544333445',
    '543333345',
    '544333445',
    '.5443445.',
    '..54445..',
    '...555...'
  ]),
  glowAmber: Object.freeze([
    '...888...',
    '..87778..',
    '.8776778.',
    '877666778',
    '876666678',
    '877666778',
    '.8776778.',
    '..87778..',
    '...888...'
  ]),
  /* the field journal's sketched pages (3.10): soft paper, a sketch in the page's ink (indices 9 and a, swapped per ink) */
  pageFirefly: Object.freeze([
    'cccccccccc',
    'cccccccccc',
    'ccccc9cccc',
    'cccc999ccc',
    'ccccc9cccc',
    'cccccccccc',
    'cc9ccccccc',
    'c999cccacc',
    'cc9ccccccc',
    'ccccccaaac',
    'cccccccacc',
    'cccccccccc'
  ]),
  pageGrass: Object.freeze([
    'cccccccccc',
    'cccccccccc',
    'cccccccccc',
    'cccccccccc',
    'cccccccccc',
    'cccccccccc',
    'cc9cccc9cc',
    'c9c9cc9c9c',
    'c9c9c9cc9c',
    '9cc9c9c9c9',
    'aaaaaaaaaa',
    'cccccccccc'
  ]),
  pageMoon: Object.freeze([
    'cccccccccc',
    'ccc999cccc',
    'cc99cccccc',
    'c99ccccccc',
    'c99ccccccc',
    'c99ccccccc',
    'cc99cccccc',
    'ccc999cccc',
    'cccccccccc',
    'cccccccacc',
    'ccccccaaac',
    'cccccccacc'
  ]),
  pageFrame: Object.freeze([
    'cccccccccc',
    'cccccccccc',
    'aaaaaaaaaa',
    'a9ca9ca9ca',
    'aaaaaaaaaa',
    'a9ca9ccaca',
    'aaaaaaaaaa',
    'cccccccccc',
    'cccccccccc',
    'cccccccccc',
    'cccccccccc',
    'cccccccccc'
  ]),
  pageLeaf: Object.freeze([
    'cccccccccc',
    'ccccccc99c',
    'ccccc999cc',
    'cccc99a9cc',
    'ccc99a99cc',
    'cc99a99ccc',
    'cc9a99cccc',
    'c9a9cccccc',
    'cacccccccc',
    'accccccccc',
    'cccccccccc',
    'cccccccccc'
  ]),
  pageStar: Object.freeze([
    'cccccccccc',
    'cccc99cccc',
    'cccc99cccc',
    'c99999999c',
    'cccc99cccc',
    'cccc99cccc',
    'cccccccccc',
    'caccccccac',
    'cccccccccc',
    'ccccaccccc',
    'cccccccccc',
    'cccccccccc'
  ]),
  pageJar: Object.freeze([
    'cccccccccc',
    'ccaaaaaacc',
    'cca0000acc',
    'ca009000ac',
    'ca000090ac',
    'ca090000ac',
    'ca000900ac',
    'ca900009ac',
    'ca000000ac',
    'caaaaaaaac',
    'cccccccccc',
    'cccccccccc'
  ]),
  pagePair: Object.freeze([
    'cccccccccc',
    'cccccccccc',
    'c99cccc9cc',
    'c99ccc999c',
    'cccccccccc',
    'c99cccc9cc',
    'c99ccccccc',
    'cccccccccc',
    'cc9ccccccc',
    'cccccccccc',
    'aaaaaaaaaa',
    'cccccccccc'
  ]),
  tuft: Object.freeze([
    '........',
    '....d...',
    '..d.2...',
    '..2.2.d.',
    '.12.21d.',
    '.1212.2.',
    '11211212',
    '11111111'
  ])
});

/* the journal's pages in the order they are earned, and the inks a page is sketched in (PALETTE index pairs for 9 and a) */
export const PAGES = Object.freeze(['pageFirefly', 'pageGrass', 'pageMoon', 'pageFrame', 'pageLeaf', 'pageStar', 'pageJar', 'pagePair']);
export const INKS = Object.freeze([Object.freeze([4, 5]), Object.freeze([7, 8]), Object.freeze([13, 1])]);

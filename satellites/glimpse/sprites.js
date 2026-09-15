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

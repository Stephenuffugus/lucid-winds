/* MOONGRAFT LAYER BANK

   The room grows one plant together, blind. Every player gets ONE layer and
   never sees anybody else's until the reveal.

   ⭐ THE RULE THAT MAKES EXQUISITE CORPSE WORK IS THE ZONE. Each layer owns a
   rectangle of the finished card, and the phone shows that rectangle as the
   WHOLE drawing surface, so you draw big and comfortable and it still lands in
   the right place. Without zones you get eight drawings stacked on top of each
   other and a smear.

   zone is [x, y, w, h] in 0 to 1 of the card, which is portrait 3:4.
   z is paint order, back to front. The ARRAY ORDER is assignment priority: a
   room of three gets the first three, a room of eight gets them all, and
   everybody always draws exactly one layer.

   Regenerate or extend with this exact prompt, then hand-audit every entry:

   "Write layer briefs for a party game where each player secretly draws one
   part of a shared imaginary plant. Each brief is one short instruction under
   45 characters, and one hint under 70 characters that gives permission rather
   than direction. Warm, cozy, general audience, no dash characters of any kind.
   The hint should make a person who cannot draw feel fine about it."

   AUDIT RULE: read each hint and ask whether it would relax somebody who says
   "I cannot draw". If it reads as an instruction instead of permission, rewrite.

   Launch bank 2026-08-08: 8 layers, 8 colours, 3 brush sizes. */
window.MOONGRAFT_LAYERS = [
  {key:'pot',       z:40, zone:[0.24,0.60,0.52,0.30],
   brief:'The vessel it grows in.',
   hint:'A pot, a jar, an old boot. Anything that could hold soil.'},

  {key:'bloom',     z:70, zone:[0.24,0.03,0.52,0.30],
   brief:'The flower at the very top.',
   hint:'Any shape at all. Nobody is watching you draw it.'},

  {key:'leaves',    z:60, zone:[0.06,0.26,0.88,0.36],
   brief:'The leaves along the stem.',
   hint:'Big, small, spiky, curling. However many you feel like.'},

  {key:'stem',      z:50, zone:[0.34,0.28,0.32,0.36],
   brief:'The stem that holds it all up.',
   hint:'Straight, twisting or branching. It does not have to be neat.'},

  {key:'companion', z:80, zone:[0.58,0.56,0.40,0.36],
   brief:'A small creature that lives here.',
   hint:'Something that would happily sit beside this plant.'},

  {key:'aura',      z:20, zone:[0.02,0.02,0.96,0.74],
   brief:'The light or weather around it.',
   hint:'Glow, rain, stars, mist. It sits behind everything else.'},

  {key:'roots',     z:30, zone:[0.18,0.85,0.64,0.14],
   brief:'What is happening under the soil.',
   hint:'Roots, stones, a sleeping thing. Only you will know.'},

  {key:'sky',       z:10, zone:[0.00,0.00,1.00,0.58],
   brief:'The sky behind all of it.',
   hint:'Moons, clouds, or nothing much at all.'}
];

/* A fixed palette instead of a colour picker: fewer taps, always in key with
   the house look, and nobody ever picks a colour that fights the card. */
window.MOONGRAFT_PALETTE = [
  '#e8dcc8', '#7ab356', '#c8a84b', '#e08a4a',
  '#a8d4f0', '#c98fb8', '#8a9178', '#5b7fb0'
];
window.MOONGRAFT_WIDTHS = [3, 7, 14];

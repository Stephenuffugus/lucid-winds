# Sheet 04 — FX: fizz burst · chain flash · cork-pop · glow · bubbles

**PATCH-REQUIRED wiring:** today the only FX is a yellow fizz FLASH over the bottle
(`CUR.flashT` counts down after a match). The state carries an unused `CUR.popFx:[]` array — the
intended hook: on `clearMarked()`, push each cleared cell's (x,y) into `popFx` and `drawImage` a
burst frame there in `render()`, ticking it down like `flashT`. Cork-pop fires on `doWin()` /
`sndWin()`; the chain flash is the existing `flashT` tint (swap for the overlay sprite);
the soft glow sits under matched cells or the equipped-highlight. Audio cues already exist
(`sndFizz` scales with chain length, `sndGrump`, `sndWin`). In-game cells are 44px; bursts read
best at ~1.5× a cell, so render at 200px and downscale.

**PROMPT (copy-paste):**

Apothecary Fizz style: moonlit tonic-apothecary game art — hand-blown tinted glass, cork and
brass fittings, tinctures lit from within, deep plum-indigo cellar shadows warmed by candle-gold
rim light, glossy but crisp game-asset silhouettes, no text, no watermark, flat FF00FF magenta
background for cutout. A sprite sheet, 3 rows x 4 columns, each cell 200x200 pixels on flat
magenta FF00FF, subjects centered, nothing touching cell edges.
Row 1, a FIZZ BURST animation of a tonic cap dissolving into soda, four frames left to right:
(1) a bright cream-gold ring just starting to crack, (2) an expanding spray of tiny gold and
cream bubbles, (3) a fuller fizz cloud with a warm C8A84B glow, (4) the last faint bubbles
dissipating. Warm cream E8DCC8 and gold FFD76A tones.
Row 2, (1) a CHAIN FLASH overlay, a soft radiant sheet of warm gold light with a scalloped edge
for a big multi-fizz combo; (2) a soft GLOW DISC, a gentle round candle-gold halo with a
transparent falloff, reusable behind matched caps or the equipped highlight; (3) a small drifting
BUBBLE CLUSTER of five glossy soda bubbles; (4) a single sparkle STAR twinkle in cream.
Row 3, the CORK POP victory moment, four frames: (1) a brass cork just launching upward with a
puff, (2) the cork mid-air with a fan of gold fizz spray erupting below it, (3) a big celebratory
fountain of cream and gold bubbles, (4) a shower of settling sparkle motes. Even spacing, no
text anywhere.

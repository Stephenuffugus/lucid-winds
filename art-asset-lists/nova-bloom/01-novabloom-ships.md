# Sheet 01 — Seedcraft (player ships) + petal-fire trails

**PATCH-REQUIRED wiring:** ships render in `drawShip(c,x,y,ang,skin,col)` as vector strokes.
To use sprites: load per-skin PNG, `c.drawImage` centered at (x,y) rotated `ang`, ~34px wide
in-game (render at 128px, downscale). Trails recolor bullets — see `render()` `bcol` ternary
(`ember`=palette gold, `petal`=#ffb0c8, `aurora`=#9ef0d0); sprite trails would replace the
two-pass line strokes. Until patched, this sheet doubles as wardrobe CARD ART (the `.wcard`
icons in the Wardrobe screen — drop-in, no engine change).

**PROMPT (copy-paste):**

Vector Nova style: pristine neon vector arcade art on pure black, laser-etched glowing
linework with soft chromatic bloom, high contrast, no text, no watermark, crisp game-asset
silhouettes, flat FF00FF magenta background for cutout. A sprite sheet, 2 rows x 4 columns,
each cell 256x256 pixels on flat magenta FF00FF.
Row 1, four glowing neon spacecraft seen from above, nose pointing RIGHT, cream-white
E8DCC8 linework with colored glow accents:
(1) DANDELION DART, a slim arrowhead dart with three trailing seed-filament fins, sage
7AB356 glow accents.
(2) MAPLE CROSS, an X-wing style four-vane cross craft with angular cut vanes, gold
C8A84B glow accents.
(3) FIREFLY NEEDLE, an ultra-thin needle interceptor with a bright abdomen lamp at the
tail, cyan 9EE6FF glow accents.
(4) COMET BUD, a round pod craft inside a thin halo ring with a short comet tail, pink
E58FA0 glow accents.
Row 2, four ammunition trail swatches, each a horizontal streak of 3 tracer bolts with
motion glow, left to right: EMBER bolts in warm gold FFD76A, PETAL STREAM bolts in soft
pink FFB0C8 with tiny petal flecks, AURORA THREAD bolts in mint 9EF0D0 with ribbon
shimmer, and one spare bolt row in cream E8DCC8. Even spacing, nothing touching cell
edges, no text anywhere.

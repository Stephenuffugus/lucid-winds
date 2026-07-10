# Sheet 02 — Enemy constellation (6 types, shape-first)

**PATCH-REQUIRED wiring:** enemies render in `drawEnemy(c,e)` as vectors keyed by `e.t`
(moth/wasp/dart/serpent/mine/bulb) with fixed hues in `ENEMY_COL`. Sprite swap = drawImage
per type (serpent = head sprite + repeated segment sprite along `e.segs`). SHAPES ARE THE
COLORBLIND LANGUAGE — silhouettes below must stay wildly distinct even in grayscale.
In-game sizes: moth/wasp ~24px, dart ~20px, mine ~28px, bulb ~36px, serpent head 22px,
segment 18px. Render 4x, downscale.

**PROMPT (copy-paste):**

Vector Nova style: pristine neon vector arcade art on pure black, laser-etched glowing
linework with soft chromatic bloom, high contrast, no text, no watermark, crisp game-asset
silhouettes, flat FF00FF magenta background for cutout. A sprite sheet, 2 rows x 4 columns,
each cell 256x256 pixels on flat magenta FF00FF, glowing neon hollow-line arcade enemies:
(1) MOTH, a bow-tie shaped fluttering moth glyph of angular folded wings, rose pink E58FA0
glow, wings mid-flutter.
(2) WASP, a sharp chevron arrowhead chaser with a pinched waist, amber FFB84D glow, aimed
right, aggressive.
(3) DART, a thin needle javelin with a small charging ring at its center, ice cyan 9EE6FF
glow, speed lines.
(4) THORN MINE, an eight-point star burr of alternating long and short spikes, violet
C98BDE glow, menacing stillness.
(5) SERPENT HEAD, a bright luminous ring skull with an inner pulsing core, pale lime
EAFFCE glow, clearly the weak point.
(6) SERPENT SEGMENT, a single leaf-oval armor bead designed to repeat in a chain, sage
7AB356 glow, subtly darker than the head.
(7) GRAVITY BULB, a heavy sphere with concentric distortion rings being pulled inward,
deep blue 5B9BD5 glow, a swallowing whirl at its heart.
(8) GRAVITY BULB OVERFED, the same sphere bulging and cracking with inner gold FFD76A
light bursting through seams. Even spacing, nothing touching cell edges, no text anywhere.

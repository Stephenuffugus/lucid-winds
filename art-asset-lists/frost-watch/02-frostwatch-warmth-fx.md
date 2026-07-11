# Sheet 02 — Warmth fx (bolts, rings, melts, strikes)

**PATCH-REQUIRED wiring:** bolts render in the bolt loop of `render()` (glowing dot + trail,
~12px), rings in the ring loop (stroked circles, radius grows 6 → 64px, three cosmetic styles
from `RINGSTYLES`: warmglow / petal / aurora), impact effects in the puff loop (`kind`:
melt / frost / steam / boom / hit). Sprite rings should be drawn scaled to `r*2` diameter with
`globalAlpha` fade in phase 2. Until patched this sheet is wardrobe card art for the three
ring cosmetics (drop-in).

**PROMPT (copy-paste):**

Midnight Vigil style: storybook paper-cut winter night art, layered matte flat shapes with
subtle paper grain, deep indigo midnight tones, crisp faceted ice-crystal geometry, warm
amber firelight accents with soft glow, clean bold silhouettes, cozy but composed, no text,
no watermark, crisp game-asset edges, flat FF00FF magenta background for cutout.
A sprite sheet, 2 rows x 4 columns, each cell 256x256 pixels on flat magenta FF00FF.
Row 1, four warmth burst effects:
(1) WARMTH BOLT, a small bright ember spark with a short comet trail of amber FFB347 light
and two tiny trailing sparks, flying upward.
(2) WARM GLOW RING, a wide hollow circle of solid amber FFB347 flame light with a thin
cream FFF4DC inner ring and gentle heat shimmer.
(3) PETAL RING, the same wide hollow circle drawn as a dashed ring of soft pink E58FA0
segments like drifting petals, thin blush FFE0EA inner ring.
(4) AURORA RING, the same wide hollow circle as a finely dotted ring of mint 9EF0D0 light
with an icy C9F4FF inner ring and faint northern lights shimmer.
Row 2, four impact effects:
(5) MELT SPARKLE, a four point warm star glint in gold FFE4A0 with tiny floating motes,
the moment a shard turns to water.
(6) FROST PUFF, a cold expanding ring of pale ice BFE0F2 mist with tiny crystal flecks.
(7) STEAM WISP, three soft grey C8D2DC steam curls rising from a doused fire.
(8) STRIKE BLOOM, a heavier warm orange FF8A5C shock ring with dark smoke notch, the sad
thud of a shard hitting home.
Even spacing, one effect per cell, nothing touching cell edges, no text anywhere.

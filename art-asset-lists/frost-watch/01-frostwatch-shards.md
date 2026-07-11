# Sheet 01 — Frost shards (the four falling enemies)

**PATCH-REQUIRED wiring:** shards render in `drawShard(s)` as vector paths. To use sprites:
load per-type PNG, `c.drawImage` centered at (s.x, s.y); seeker rotates by
`Math.atan2(s.vx, s.vy)`. In-game sizes: straight ~14x28px, splitter ~26x30px, seeker ~20x28px,
glacier ~42x42px — render cells at 4x and downscale. The cracked glacier is a STATE
(`s.cracked`), so it needs its own cell, not a decal. Until patched, this sheet doubles as
wardrobe/how-screen card art (drop-in, no engine change).

**Shape law (colorblind):** each type must be identifiable by silhouette alone at 30px.
Do not let the artist round them into similar blobs.

**PROMPT (copy-paste):**

Midnight Vigil style: storybook paper-cut winter night art, layered matte flat shapes with
subtle paper grain, deep indigo midnight tones, crisp faceted ice-crystal geometry, warm
amber firelight accents with soft glow, clean bold silhouettes, cozy but composed, no text,
no watermark, crisp game-asset edges, flat FF00FF magenta background for cutout.
A sprite sheet, 2 rows x 3 columns, each cell 256x256 pixels on flat magenta FF00FF.
Row 1, three falling ice shard game pieces, points aimed DOWN:
(1) STRAIGHT SHARD, a slim elongated faceted kite crystal like a falling icicle dagger,
pale ice BFE0F2 with white F2FBFF facet edges.
(2) SPLITTER SHARD, a wide barbed chevron crystal with two side prongs flaring out and a
carved Y shaped fork groove down its center, frosty white E8F4FF with steel blue 4A6A8A
groove lines.
(3) SEEKER SHARD, a comma shaped crystal with a round faceted head and one long curled
tail whipping sideways, pale lavender C9B8F0 with white highlight.
Row 2:
(4) GLACIER SHARD, a massive fat hexagonal ice boulder with heavy facets and inner fracture
lines, deep glacier blue 7FA8D8 with pale D8ECFF rim.
(5) GLACIER SHARD CRACKED, the same hexagonal boulder split by a bright white lightning
crack across its face, one facet sagging loose.
(6) shard shatter burst, the straight shard breaking into six tiny drifting crystal chips
with a soft warm glint at the center.
Even spacing, one object per cell, nothing touching cell edges, no text anywhere.

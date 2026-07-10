# Sheet 03 — FX: pollen, flowers, bloom bomb, gates, sparks

**Wiring:** flowers render in `render()` (seedling arc ring growing by `f.age`, mature =
5-petal ellipse fan pulsing at 480+ ticks); pollen = 2.6px gold dots; bomb = white flash +
`gridImpulse(60,620)`; pacifist gates = dashed gold bar between two post rings. Sprite swaps
are drop-in for flowers/gates (single drawImage each); particle sprites optional (the pooled
squares in `PARTS` can become tiny textured quads). Keepsake Grove cards use `drawKeepsake`
(procedural, keep) — sheet's FRAME cells wrap those canvases in the Grove screen (pure CSS/DOM,
no engine change).

**PROMPT (copy-paste):**

Vector Nova style: pristine neon vector arcade art on pure black, laser-etched glowing
linework with soft chromatic bloom, high contrast, no text, no watermark, crisp game-asset
silhouettes, flat FF00FF magenta background for cutout. A sprite sheet, 3 rows x 4 columns,
each cell 220x220 pixels on flat magenta FF00FF:
Row 1, growth stages of a neon energy flower: (1) a tiny sprouting spark ring in sage
7AB356, (2) a half-grown bud ring with two leaf ticks, (3) a MATURE five-petal radiant
bloom in warm gold FFD76A with a rose E58FA0 core, gently pulsing halo, (4) the same bloom
BURSTING into harvest sparkles.
Row 2, (1) a small drifting pollen mote, a single warm gold FFD76A firefly dot with soft
trail, (2) a cluster of five pollen motes drifting together, (3) the BLOOM BOMB detonation,
a huge concentric ring shockwave of gold and white petals radiating outward, (4) a player
death burst, a sharp white starburst with cream E8DCC8 shards.
Row 3, (1) a pacifist GATE, two glowing gold post rings connected by a dashed energy bar,
horizontal, (2) the same gate DETONATING in a gold flood, (3) a serpent kill chain of small
sage explosions in a row, (4) a generic small neon impact spark, cyan 9EE6FF. Even spacing,
nothing touching cell edges, no text anywhere.

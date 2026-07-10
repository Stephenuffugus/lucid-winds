<!-- Plot Bloom · Sheet 5: FX & Keepsakes — Harmony Bloom burst, petals, expansion dust, tintable keepsake-flower parts -->
<!-- Copy everything below into your image generator to make this ONE sheet. -->

STYLE — "Skyshard Isles" (Plot Bloom / Sky Wolf Studios cozy floating-garden placement puzzle). Celebration and keepsake art: warm bloom-light bursts, drifting petals, dew sparkle, and painted flower parts for the procedural keepsake blooms. Chunky rounded shapes, soft luminous edges, restrained bloom — joyful but gentle, never fireworks-harsh; painterly gouache-over-cel, subtle paper grain. Palette: midnight #0d100c/#0b0f0b; sage #7ab356, deep leaf #3f6b34, stem #5c8f3f, spring #9fd07a, good-glow #a8e06a; gold #c8a84b + warm bloom flash #ffe9a8; cream #e8dcc8, moss #8a9178, stone #6f7a5f; petal pink #e58fa0, warning rose #e08a8a; pond blue #5b9bd5, dew #bfe0f2. NO photoreal, NO harsh keylines, NO text/letters/numbers/logos/watermarks. Compress under 150KB.

Create one sprite sheet. File: pb_fx.png. Grid: 4 columns x 4 rows (16 cells, left-to-right, top-to-bottom). Cell: 512x512. Master: 2048x2048.

KNOCKOUT: Flat magenta #FF00FF fills the entire background of every cell. NO magenta / hot-pink ANYWHERE inside the art (keep petal pink #e58fa0 and warning rose #e08a8a clearly distinct from #FF00FF). Each element centered, fully inside its cell with margin, NO ground shadow (FX float and composite over the board). Glow contained per cell — never tint the magenta field. Cells marked NEUTRAL/TINTABLE must carry NO hue at all (cream-to-grey only) so the engine can multiply-tint them to any keepsake color.

HARMONY BLOOM CELEBRATION (cells 1-8) — the moment a single placement scores 6+ (the engine flashes the screen, chimes a rising triad, and mints a keepsake):

1. bloom_burst_core — the heart of the Harmony Bloom: a radial burst of warm #ffe9a8 light with a cream-white hot center and soft petal-shaped rays, feathering to nothing. The hero flash that matches the engine's radial screen glow.
2. petal_single — ONE soft rounded petal in petal pink #e58fa0 with a cream edge light, slightly curled; the confetti unit, spun and scattered in code.
3. leaf_single — ONE small sage #7ab356 leaf with a #5c8f3f midrib, gently bowed; the second confetti unit.
4. spark_gold — a small four-point gold #c8a84b sparkle with a tiny #ffe9a8 halo; the glitter unit for bursts and unlock moments.
5. ring_shock — a thin luminous cream #e8dcc8 ring with a soft trailing edge, transparent center; the expanding pulse that leads the petal burst outward from the placed tile.
6. confetti_cluster — a loose handful of petals, leaves and gold sparks (cells 2-4's shapes) mid-scatter as one composite drift, for low-effort celebration on the results screen.
7. glow_vignette — a soft warm #ffe9a8 vignette overlay: gentle light pooling in from all four edges, transparent middle; laid over the whole stage for the bloom instant then faded (the engine's flash overlay, upgraded).
8. bee_loop — the celebration bee: the plump gold #c8a84b/#2a331f pictographic bee flying a small loop-the-loop with a dotted #ffe9a8 glow trail behind it; cameo flourish over a Harmony Bloom.

EXPANSION & AMBIENT (cells 9-10):

9. expand_dust — a drifting square-ish cloud of dew #bfe0f2 and cream #e8dcc8 motes with faint wind-wisp curls, transparent middle; blows across the board when the plot grows and new shard tiles arrive.
10. mote_pair — two tiny floating dew-blue #bfe0f2 light motes with soft halos at different sizes; the ambient twilight drifter, scattered sparingly over menus and the play sky.

KEEPSAKE FLOWER PARTS (cells 11-16) — the engine currently draws each Gallery keepsake as flat vector petals from a stored seed (petal count 5-9, random hue, stem + two leaves). These painted parts upgrade that draw: the engine layers and multiply-tints them per seed, so NEUTRAL cells must be hue-free:

11. keep_petal — NEUTRAL/TINTABLE: one plump teardrop petal in pure cream-to-grey (#e8dcc8→#8a9178) with a baked soft rim-light and center crease, point DOWN toward the flower heart; rotated 5-9 times per keepsake by the engine and tinted to the seed's hue.
12. keep_petal_alt — NEUTRAL/TINTABLE: a slightly slimmer, more pointed petal variant, same finish; the engine alternates petals for the two-tone effect its code already paints on odd/even petals.
13. keep_center — NEUTRAL/TINTABLE: the round flower heart — a plush dotted disc (tiny stamen bumps) in cream-grey with a soft inner glow, tinted separately to the seed's accent hue.
14. keep_stem — the stem-and-leaves base in FIXED color: a short curved stem in stem green #5c8f3f with two small sage #7ab356 leaves, matching the engine's fixed green base under every keepsake. Not tintable — stays green for every bloom.
15. keep_sparkle — a faint cream #e8dcc8 twinkle pair (one large, one small) to float over a freshly-minted keepsake in the results screen; on transparent.
16. keep_pot_shard — a tiny floating turf shard pedestal (mossy sage top, stone #6f7a5f taper, one hanging root) sized to sit UNDER a keepsake bloom on the results screen and in the Gallery, so every kept flower stands on its own little island.

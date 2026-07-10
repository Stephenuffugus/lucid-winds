<!-- Plot Bloom · Sheet 2: Plot Tiles & Shards — cell faces, score-chip plates, board frame, expansion FX -->
<!-- Copy everything below into your image generator to make this ONE sheet. -->

STYLE — "Skyshard Isles" (Plot Bloom / Sky Wolf Studios cozy floating-garden placement puzzle). The plot itself: small square turf-and-soil shard tiles floating in a twilight void, each a snippable garden bed. Chunky, rounded, painterly gouache-over-cel, crisp edges, subtle paper grain; ONE soft warm rim-light upper-left, gentle inner glow, restrained bloom, never neon-blown. Tiles must stay QUIET — they are the stage, the pieces are the show; must read at 68px. Palette: midnight #0d100c/#0b0f0b/#0e140d/#05070a; soil faces #141b0d/#12180e/#1e2a14, edge lines #1c2614/#2a3a1c, sel edge #2c3a1c, seam #2a331f; sage #7ab356, deep leaf #3f6b34, spring rim #9fd07a, good-glow #a8e06a; gold #c8a84b + bloom #ffe9a8; cream #e8dcc8, moss #8a9178, stone #6f7a5f; warning rose #e08a8a; pond blue #5b9bd5, dew #bfe0f2. NO photoreal, NO harsh black outlines, NO text/letters/numbers/logos/watermarks. Compress under 150KB.

Create one sprite sheet. File: pb_tiles.png. Grid: 4 columns x 4 rows (16 cells, left-to-right, top-to-bottom). Cell: 512x512. Master: 2048x2048.

KNOCKOUT: Flat magenta #FF00FF fills the entire background of every cell. NO magenta / hot-pink ANYWHERE inside the art (keep warning rose #e08a8a clearly distinct from #FF00FF). Each tile face is a rounded-corner SQUARE filling most of its cell with an even margin (the engine's cells are square with ~10px radius corners); overlays and rings are centered on transparent-over-magenta. NO ground shadow — tiles ARE the ground; the board composites them edge to edge with a 5px gap. Glow contained per cell.

TILE FACES (cells 1-5) — the four DOM cell states plus one variant. All are calm, dark, low-contrast so pieces and the engine's preview numbers pop on top:

1. tile_empty — the resting plot square: a dark tilled-soil face #141b0d with the faintest turf speckle at the edges, a thin #1c2614 rounded border, one soft moss corner. The default empty bed — quiet, plantable.
2. tile_empty_alt — the same empty bed with a slightly different speckle and a tiny pebble, for the cut script to alternate so big boards do not wallpaper. Identical palette and border weight to cell 1.
3. tile_empty_sel — the "aiming" bed shown while a piece is selected: face lifts to #18220f-warm, border brightens to #2c3a1c-sage (the code's selected-empty edge — keep it visibly distinct from the filled bed's #2a3a1c) with a very soft inner sage #7ab356 glow. THE CENTER MUST STAY EMPTY AND CALM — the engine prints its live +/− preview number in the middle of this tile.
4. tile_filled — the occupied bed: a richer radial warmth #1e2a14 rising from center, border #2a3a1c, faint root veins in the soil. A piece miniature composites on top of this face.
5. tile_locked — the not-yet-arrived shard: a barely-there dashed #161d10-style outline square, interior almost void, one faint dew #bfe0f2 mote drifting inside. Reads as "a shard that has not drifted in yet" (the engine dims these to 28% — keep it ghostly even at full opacity).

SCORE-CHIP PLATES (cells 6-8) — small rounded plates the engine layers BEHIND its printed preview numbers on empty tiles. Pictographic plates ONLY — absolutely no digits, plus or minus signs baked in:

6. chip_pos — a small rounded pill plate with a soft good-glow #a8e06a rim and a warm sage inner wash; the "good neighbours here" plate.
7. chip_zero — the same pill in neutral stone #6f7a5f, flat and calm; the "nothing gained" plate.
8. chip_neg — the same pill rimmed in warning rose #e08a8a, slightly dimmed; the "bad neighbours" plate. Gentle, not alarming.

BOARD DRESSING (cells 9-16):

9. board_frame — a thin rounded frame of woven root and mossy stone (sage #7ab356 over #2a331f) sized to hug the whole grid; clean straight runs and simple corners so it can be 9-sliced to fit the 3×3, 5×5 and 7×7 plot sizes.
10. underisle — the floating island's UNDERSIDE: a wide shallow rocky taper in stone #6f7a5f falling to #0d100c, with three hanging root wisps and two drifting dew #bfe0f2 motes. Sits below the board frame so the whole plot reads as one levitating shard.
11. expand_ring — the "plot grows" ripple: a luminous expanding ring blending sage #7ab356 into gold #c8a84b with a trailing soft edge, transparent center. Fires once from board center when the garden steps 3×3→5×5→7×7.
12. tile_newshard — a sparkle-dust overlay for freshly-arrived tiles: a square-shaped drift of dew #bfe0f2 and cream #e8dcc8 motes hugging the tile edges, transparent middle. Laid over new empty tiles for a few seconds after expansion.
13. tile_bloom — the Harmony Bloom tile overlay: a warm radial #ffe9a8 glow burst shaped to a rounded tile square, brightest at center, feathering out. Laid over the placed tile in the bloom instant, under the FX sheet's petal burst.
14. corner_tuft — a tiny sage #7ab356 grass tuft with one cream bud, on transparent; scattered sparingly on random tile corners by the cut script so the plot feels alive, never on the tile center.
15. pebble_cluster — three tiny stacked stones in stone #6f7a5f with a moss cap, on transparent; the second scatter décor, same rules as the tuft.
16. hover_brackets (OPTIONAL — no wiring target yet) — four thin gold #c8a84b corner brackets forming an open square, transparent middle; a tap-target affordance for the selected empty tile, sitting under the engine's preview number for extra clarity at small sizes. NO current code draws this overlay — it ships only if the optional hover_brackets wiring step in the 00 wire notes is taken; the cut script should cut it but flag it unwired (spare) until then.

<!-- Silt · Sheet 3: Wardrobe pieces — vessel frames, brush cursors, palette tokens — 💰 COSMETICS / ECONOMY -->
<!-- Copy everything below into your image generator to make this ONE sheet. -->

STYLE — "Terrarium Nocturne" (Silt / Lucid Winds midnight-garden). Painted matte-gouache terrarium fittings: aged cedar #6d4a2a, warm brass #b08d3e, cool slate #4a4c52, thick hand-blown glass edges catching cream #e8dcc8 / gold #c8a84b rims, deep-night grounds #0d100c/#05070a, sage #7ab356 / deep #3f6b34, dew #bfe0f2/#5b9bd5, lantern glow #ffe9a8, moss #8a9178, seed-rose #e58fa0, ember #f08c32, violet #a468d8, amber #e2b34d. FLAT fills, gentle grain, NO gloss, NO harsh black keylines, bold silhouettes readable at 44px. NO text, letters, numbers, logos, watermarks. Compress under 150KB.

Create one sprite sheet. File: silt_cosmetics.png. Grid: 4 columns x 3 rows (12 cells, left-to-right, top-to-bottom). Cell: 512x512. Master: 2048x1536.

KNOCKOUT: Flat magenta #FF00FF fills every cell's background. NO magenta / hot-pink inside the art (seed-rose #e58fa0 must stay clearly distinct). Each piece centered with margin, NO ground shadow. The three FRAMES are drawn as complete rectangular border frames around an EMPTY magenta center (the engine 9-slices them around the live simulation) — the center opening must be a clean rectangle roughly 60% of the cell, pure #FF00FF.

1. frame_slate — the free frame: a plain squared vessel border of cool slate stone #4a4c52 with a thin glass inner rim catching a moon-dew highlight; quiet, unadorned.
2. frame_cedar — the 100-blooms frame: an aged cedar-plank border #6d4a2a with visible wood grain, tiny brass corner brackets, one small sage sprig growing from the lower-left corner.
3. frame_gilded — the 5-keepsakes capstone frame: a brass-and-gold border #b08d3e/#c8a84b with engraved vine scrollwork, corner rosettes, and a soft #ffe9a8 lantern sheen; celebratory but not gaudy.
4. brush_ring — the free brush cursor: a thin cream #e8dcc8 open circle with four tiny tick marks (a gentle reticle); must read over any background.
5. brush_trowel — the 30-blooms brush cursor: a small cedar-handled brass garden trowel seen from above, tip pointing up-left; the paint point is the trowel TIP.
6. brush_dragonfly — the streak-3 brush cursor: a jeweled dragonfly seen from above, dew-blue #bfe0f2 double wings with violet #a468d8 veins and a slim sage body; the paint point is the HEAD.
7. token_earthen — wardrobe token for the Earthen palette: a small round glass vial of layered golden sand #c8a84b over umber #5e4228 with a cork.
8. token_nocturne — token for Nocturne: the same vial re-lit cool blue-violet, silvery sand #a8966e under a #5b9bd5 moon glint, tiny crescent charm on the cork twine.
9. token_ember — token for Ember Glass: the vial glowing warm amber #e2b34d/#f08c32 as if lit from inside, faint heat shimmer above the cork.
10. token_prisma — token for Prisma: the vial refracting a contained rainbow band (#e58fa0/#c8a84b/#7ab356/#5b9bd5/#a468d8) through jewel-toned sand; the all-12-trials capstone.
11. grove_mat — a small pressed-flower display mat for Grove cards: a rounded dark #0f150c card with a thin brass rim and a faint cream pressing-tissue texture; EMPTY center (engine draws the keepsake on its own 84px canvas over it).
12. lock_charm — the locked-wardrobe glyph: a tiny brass padlock with a sage keyhole glow, hanging from a twine loop.

WIRE NOTES: 1-3 → a new absolutely-positioned 9-slice border layer around `canvas#game`, swapped by `PROG.frame` ("slate"/"cedar"/"gilded" — key exists and is equippable in the live `WARD`/`renderWard()` but is not yet consumed by any draw path; this sheet is what wires it). 4-6 → a pointer-following cursor ghost swapped by `PROG.brushSkin` ("ring"/"trowel"/"dragonfly", same status), anchored to the paint cell from `evCell()`; scale ~2× the current BRUSH radius (brush S=2 cells, L=5). 7-10 → the `.wi` icon slot in `renderWard()` wardrobe cards (replacing 🎨🌒🧡🌈) and optionally the Settings palette row. 11 → `.grovecard` background mat in `renderGrove()`. 12 → the 🔒 in locked `.we` buttons and `.lvlcard.locked`. Unlock thresholds are live in code and must not change: palettes free/3/8/12 trials, brushes free/30 blooms/streak 3, frames free/100 blooms/15 gardens.

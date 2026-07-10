<!-- Silt · Sheet 2: UI / HUD — dock chips, element icons, buttons, pulse meter, goal pill -->
<!-- Copy everything below into your image generator to make this ONE sheet. -->

STYLE — "Terrarium Nocturne" (Silt / Lucid Winds midnight-garden). Painted matte-gouache UI on aged cedar #6d4a2a and brass #b08d3e, thick-glass edge highlights in cream #e8dcc8 / gold #c8a84b, deep-night grounds #0d100c/#05070a, lantern-warm accents #ffe9a8, cool dew accents #bfe0f2/#5b9bd5, sage #7ab356 / deep #3f6b34, moss #8a9178, dusk line #2a331f. FLAT fills, gentle grain, NO gloss, NO bevel-emboss, NO harsh black keylines. Icons are bold PICTOGRAPHIC papercut-simple glyphs that must read at 44px. NO text, letters, numbers, logos, watermarks anywhere. Compress under 150KB.

Create one sprite sheet. File: silt_ui.png. Grid: 4 columns x 4 rows (16 cells, left-to-right, top-to-bottom). Cell: 512x512. Master: 2048x2048.

KNOCKOUT: Flat magenta #FF00FF fills the entire background of every cell. NO magenta / hot-pink / hot-purple inside the art (keep seed-rose #e58fa0 clearly distinct from #FF00FF). Each element centered, fully inside its cell with margin, NO ground shadow (UI composites flat). Plates are drawn centered and the engine 9-slice-stretches them. Every element icon must be distinguishable by SILHOUETTE alone (colorblind requirement).

1. btn_plate — the default menu button plate: a wide rounded cedar-and-dark-paper plate, #1a2415 face over a #121a0f base layer, thin sage rim-glow, corner grain.
2. btn_plate_primary — the call-to-action plate: warm brass-gold face #c8a84b over #9a7d2e with a #e8d08a rim-light and a soft lantern glow; reads "press me."
3. chip_plate — the dock element-chip plate: a squarish rounded dark plate #121a0f with a thin dusk-line #2a331f edge and a faint glass-highlight top edge; the engine overlays icon + budget count.
4. goal_pill — the trial goal pill: a wide lozenge of dark glass #0f150c with a brass rim and tiny cork-and-twine end caps; calm center for engine text.
5. icon_silt — falling golden sand: a small papercut dune with three chunky square grains dropping onto it, silt gold #c8a84b family; SQUARE grains (pixel homage).
6. icon_water — a fat dew droplet #bfe0f2 over #5b9bd5 with one cream specular, a tiny ripple arc beneath.
7. icon_soil — a rounded earth mound in umber #5e4228 with a darker wet base #3a281a and one thin root line.
8. icon_seed — a plump seed #e58fa0 with a single sage sprout-curl emerging from the top.
9. icon_stone — a stacked two-boulder cairn in slate #4a4c52 with a cool moon highlight edge.
10. icon_oil — a viscous black-plum #342c3c drip forming a rounded blob with a violet #a468d8 sheen line.
11. icon_fire — a compact papercut flame, ember #f08c32 core with a #ffe9a8 heart; UNMISTAKABLY pointed-flame silhouette.
12. icon_erase — a soft moss #8a9178 sponge with three cream scrub sparkles; clearly hollow/cleaning, not an element.
13. icon_brush — the brush-size toggle: one small dot and one big dot side by side in cream, joined by a thin arc (small↔large).
14. icon_reset — a sage leaf curled into a circular refresh arrow; the wash-away/reset glyph.
15. icon_home — a rounded doorway arch in cedar with a warm lantern glow inside; the home/back glyph.
16. pulse_meter — the Garden Pulse meter set: a long dark glass trough with brass caps, plus (above it, separated) its fill bar as a seamless horizontal gradient strip deep #3f6b34 → sage #7ab356 → gold #c8a84b, plus a tiny heart-bud cap glyph.

WIRE NOTES: 1-2 → `.btn` / `.btn.primary` CSS backgrounds; 3 → `.chip` plates in `renderDock()` (selected state keeps the live gold border `.chip.sel`); 4 → `#goalchip`; 5-11 → replace the emoji `ICONS` map (`{2:⏳,4:💧,3:🟫,5:🌰,1:🪨,10:🛢,8:🔥}`, line ~653) as `<img>` swaps inside `.ci`; 12-14 → the Erase / Brush / Reset chips in dock row 2; 15 → `#hud-back` (⌂); 16 → `#pulsebar` trough + `#pulsefill` strip + a cap on `#pulselabel`. Budget counts, names and pause glyphs stay engine text. Keep every emoji as the no-asset fallback via `onerror`.

<!-- Meadow Weave · Sheet 2: Desk HUD & UI — bar/tray plates, buttons, rotate pill, counters, quest flags, toggles -->
<!-- Copy everything below into your image generator to make this ONE sheet. -->

STYLE — "Lantern Atlas" (Meadow Weave / Sky Wolf Studios moonlit hex tile-laying). A cartographer's night desk: UI chrome as desk furniture — dark vellum plates, gilded pin-lines, warm lantern accents on a deep midnight table. Crisp rounded-rectangle geometry, engraved ink detailing, kid-friendly storybook-explorer, calm. Straight-on view, every subject centered and upright. Palette: table #0d100c/#0b0f0b, wash #111a12→#0c130e→#080d0a, screen slate #0e140d, panel #0f150c, ink line #2a331f, moss #8a9178, cream vellum #e8dcc8, lantern gold #c8a84b, seam-light #eafbd6/#c8e896, sage #7ab356 (#1f3016/#5c8f3f depths), button greens #6ea34a→#4a7a2f edged #8fc86a shadow #2f5020, pill leather #241d10; land accents Meadow #7ab356, Pond #5b9bd5, Forest #3f6b34, Field #d9b85a, Orchard #e58fa0, dew #bfe0f2. Gouache wash + engraved ink lines + faint paper grain, restrained glow, NO photoreal, NO neon, NO outlines heavier than #2a331f ink, NO text/letters/numbers/logos/watermarks (all labels, scores and glyph text are drawn by code ON TOP of these plates — leave their faces calm and empty). Compress under 150KB.

Create one sprite sheet. File: mw_ui.png. Grid: 4 columns x 4 rows (16 cells, left-to-right, top-to-bottom). Cell: 512x512. Master: 2048x2048.

KNOCKOUT: Flat magenta #FF00FF fills the entire background of every cell. NO magenta / hot-pink ANYWHERE inside the art (keep Orchard rose #e58fa0 clearly distinct from #FF00FF). Every plate is a clean 9-slice-friendly shape: uniform corner radii, borders and detail hugging the edges, the CENTER FACE flat and quiet so code-drawn text sits on it and the plate can stretch. Centered, upright, generous margin, no drop shadows (code layers plates over live scenes).

PLATES (cells 1-6):
1. plate_topbar — the HUD top bar (the engine's `rgba(12,18,12,0.82)` strip): a wide low rounded plate of dark desk vellum #0f150c with a hairline gilded #c8a84b rule along its BOTTOM edge and faint paper grain; score / seeds / tiles text renders on it.
2. plate_tray — the bottom NEXT-TILE tray (the engine's `rgba(12,18,12,0.9)` band): a deeper desk-edge plate, slightly warmer #111a12, a thin #2a331f ink rule along its TOP edge with three tiny gilt rivets — reads as the writing ledge of the desk.
3. plate_btn_primary — the big menu button (.btn.primary): a sage-green lacquered plate, vertical gradient #6ea34a→#4a7a2f, crisp #8fc86a edge light on top, solid #2f5020 base shadow lip; center face empty for the label.
4. plate_btn — the standard dark button (.btn): #1a2415→#121a0f vertical gradient, thin #2a331f ink border, faint cream top sheen; quiet.
5. plate_btn_ghost — the muted button (.btn.ghost): flat #0f150c face, thin ink border, no sheen — clearly the "lesser" action.
6. plate_panel — the settings / list row panel (.settingline and screen cards): a #0f150c rounded panel with a thin #2a331f border and the faintest inner vellum vignette; 9-slice friendly.

HUD FURNITURE (cells 7-12):
7. chip_back — the small square corner chip (the engine's `hudBtn`, 44px, `rgba(15,21,12,0.7)` + sage stroke): a compact rounded chip of dark vellum with a thin sage #7ab356 rim glow; FACE EMPTY (code stamps the ‹ glyph).
8. plate_rotate — the ROTATE pill (the engine's `roundBtn`, mossy `rgba(90,120,60,0.6)` + `rgba(200,232,150,0.5)` stroke): a wide rounded pill of deep moss green with a seam-light #c8e896 rim and a soft inner lantern warmth; face empty for the code label.
9. pict_rotate — a circular-arrows pictogram: two chunky cream #e8dcc8 curved arrows chasing each other clockwise around a small hex silhouette; the icon that sits beside the code's "Rotate" label.
10. pict_seed — the SEEDS counter pictogram (replaces the 🌱 glyph in the HUD): a tiny pressed sprout — two sage leaves on a stem rising from a cream seed — inked-stamp style with a faint gold press-ring.
11. pict_tiles — the TILES-remaining counter pictogram: a neat stack of three pointy-top hex plates in cream/gold line art, the top one slightly lifted.
12. pict_zen — the Zen/endless pictogram (backs the ∞ readout): a single leaf whose stem loops into a lying figure-eight, cream line art with a sage wash.

FLAGS & TOGGLES (cells 13-16):
13. quest_flag — the Quest Weave open-quest marker (the 🚩 fiction, code shows quest text in gold #c8a84b): a small triangular expedition pennant in lantern gold on a thin ink pole, gently waving; pictographic, no letters.
14. quest_flag_done — the same pennant completed: sage #7ab356 cloth with a small cream blossom stamped where the goal was — celebratory but calm (the ✓ text stays code-drawn beside it).
15. toggle_set — the settings toggle in BOTH states in one cell, each state centered in its OWN HALF: left half of the cell an OFF track (#26301c rounded track, cream #e8dcc8 knob at left), right half an ON track (deep sage #3f6b34 track, pale #eafbd6 knob at right); clean 64x36 proportions scaled up, with a clear vertical band of pure magenta separating the two halves. CUT NOTE (exception to the one-asset-per-cell rule): the cutter must split this cell at the vertical midline into TWO assets — `toggle_off` (left 256x512) and `toggle_on` (right 256x512) — a naive whole-cell knockout would emit one merged blob.
16. plate_pill — the best-score pill (.pill): a small rounded leather chip #241d10 with a thin #2a331f border and a warm gold inner glow at the center; face empty for the code's gold text.

<!-- Mini Crossword · Sheet 1: Papers & Board — 4 board backdrops (full-bleed) + cell-tile treatments + paper shop chips -->
<!-- 💰 COSMETICS sheet (the four papers are half the wardrobe). This sheet makes TWO outputs: GROUP A (four full-bleed backdrops, NO magenta) and GROUP B (one magenta-keyed cell-tile sheet). Copy everything below into your image generator. -->

STYLE — "Sunday Inkwell" (Mini Crossword / Sky Wolf Studios five-by-five word puzzle). A midnight newspaper puzzle desk under one warm lamp: aged paper stocks, quiet lamplight over deep plum-black, halftone print dots, soft deckled paper edges, flat gouache-and-ink rendering, ONE warm lamp key light from the upper-left, faint warm vignette; matte, restrained, never glossy, never neon. Rounded, kid-friendly, readable at thumbnail size. Palette: plum-black #0d0a14 / #070510 / #0a0714; lamp gold #c8a84b, warm #ffd76a, gilt #ffe6a0; cream #e8dcc8, muted #94889f; ink-rule plum #2c2440; paper stocks — newsprint bed #181228 on #0d0a14, graph bed #122028 on #0a1216 with teal rule #1f3a44, parchment bed #241a0c on #161006 with amber rule #4a3820, midnight-slate bed #141428 on #0a0a16 with indigo rule #28285a; black-square inks #050308 / #04080a / #0a0703 / #040410; SELECT amber #3a3016, IN-WORD amber #241f14. This is a WORD game — LETTERS and CLUE NUMBERS are drawn live as engine TEXT on top, so this art has ABSOLUTELY NO letters, numbers, words, glyphs, logos or watermarks; every paper and cell tile is blank, and each cell's CENTER and TOP-LEFT number corner stay calm. State cues are shape-distinct, never hue-only. Compress each PNG under 150KB.

============================================================
GROUP A — BOARD BACKDROPS (four full-bleed files, NO magenta)
============================================================
Four separate full-bleed portrait desk scenes, one per paper stock. File / size each: 540 x 820 (matches the game canvas). These composite BEHIND the engine-drawn grid, so they are FULL-BLEED — no magenta, no cutout, the paper color runs edge to edge.

CALM-CENTER RULE (critical): the 5x5 grid is drawn by the engine as a centered 410 x 410 square at x 65 to 475, y 96 to 506. Keep that central bed (x 60 to 480, y 90 to 510) a QUIET flat field of the paper's BED color so the engine cells read cleanly on top. Put ALL desk flourish — lamp glow, halftone dots, a folded-paper corner, a small brass pen rest, deckle edge, warm vignette — into the TOP STRIP (y 0 to 90), the LOWER APRON (y 510 to 820) and the SIDE MARGINS (x 0 to 60 and 480 to 540). The upper-left lamp glow may spill faintly toward the grid but must never rise above ~8% contrast over the bed.

Each backdrop = the desk in the paper's SCREEN color, a soft warm lamp bloom from the upper-left, a barely-there halftone dot texture, a torn deckled paper edge framing the grid bed, and a tiny brass pen rest tucked into the lower apron (empty — the pen art lives in sheet 02). Match each hex exactly:
1. mc_paper_newsprint_bg.png — desk #0d0a14, grid bed a flat #181228 field, warm gold lamp bloom upper-left, faint cream halftone print dots in the apron. The everyone-starts-here stock.
2. mc_paper_graph_bg.png — desk #0a1216, grid bed a flat #122028 field, the apron dressed with a faint teal #1f3a44 engineer's graph rule receding into shadow (keep it OUT of the central grid bed). Cool, precise.
3. mc_paper_parchment_bg.png — desk #161006, grid bed a flat #241a0c field, warm amber #4a3820 lamplight and a deckled aged-parchment edge; the coziest, oldest stock. Unlocked at Ink Streak 5.
4. mc_paper_midnight_bg.png — desk #0a0a16, grid bed a flat #141428 field, cool indigo #28285a haze and a scatter of tiny gilt star-flecks in the apron; the premium slate. Unlocked at 💧 140 ink.

============================================================
GROUP B — CELL TILES (one magenta-keyed sheet)
============================================================
File: mc_cells.png. Grid: 4 columns x 4 rows (16 cells, left-to-right, top-to-bottom). Cell: 128x128. Master: 512x512.

KNOCKOUT: Flat magenta #FF00FF fills the entire background of every cell. NO magenta / hot-pink ANYWHERE inside the art. Cells 1-8 (the cell fields + black squares) are FULL-BLEED SEAMLESS TILES — they fill their whole 128x128 cell edge to edge with no magenta and must tile cleanly against themselves (the engine paints one per board square). Cells 9-16 (states, seam, frame, chips) sit centered on magenta with margin. Every field tile keeps its CENTER and TOP-LEFT corner calm (engine letter + number land there). Do NOT bake the 1.5px cell separator into the field tiles — the engine keeps stroking `pp.line`; the seam overlay is cell 13.

NORMAL CELL FIELDS (cells 1-4) — one seamless paper-bed tile per stock, a flat quiet field of its exact BED hex with only the faintest fiber grain / halftone at under 10% contrast:
1. cell_newsprint — #181228.
2. cell_graph — #122028.
3. cell_parchment — #241a0c.
4. cell_midnight — #141428.

BLACK SQUARES (cells 5-8) — one solid inked block per stock, a shape-distinct blocked-out square (NOT a paper field), matte, its exact hex, with a soft inked edge so it reads as "no letter here":
5. black_newsprint — #050308.
6. black_graph — #04080a.
7. black_parchment — #0a0703.
8. black_midnight — #040410.

STATE TILES (cells 9-10) — the two highlight beds. These are currently PAPER-INDEPENDENT in code (one shared amber across all four stocks), so ship them as single shared tiles:
9. cell_inword — the current-word bed: a flat dim warm-amber field #241f14, seamless, calm center (marks every cell in the word you are on).
10. cell_selected — the selected-cell bed: a warmer amber field #3a3016, one step brighter than in-word, seamless, calm center (the pen-color ring from sheet 02 rides on top of this).

SEAM & FRAME (cells 11-13) — board furniture:
11. grid_frame_corner — a rounded outer bezel corner that seats the 5x5 into the desk: a thin cream #e8dcc8 hairline rule with a faint gold #c8a84b inner glint and a tiny letterpress registration-cross tucked in the corner (pictographic, no letters). The engine draws no outer frame today, so this is a small NEW WIRE — ships dark until the frame path is added; do not hunt for a hook.
12. grid_frame_edge — a straight, tileable segment of that same outer bezel (cream hairline + gold glint), to run between the four corners. NEW WIRE, same note.
13. seam_tile — a faint seamless cross / plus-shaped separator overlay (hair-thin plum #2c2440 lines along a tile's edges at low opacity) so the cell grid reads as gently pressed squares. Optional richer seam; the engine's `pp.line` 1.5px stroke stays the drop-in default (retint via that hex).

PAPER SHOP CHIPS (cells 14-16... use 14-16 for three, and repeat the fourth on any spare margin) — the little preview chip each paper shows on its shop card (replaces the procedural mini-grid in `drawSwatch`). Each is a folded-corner paper swatch in that stock's bed color with a 2x2 hint of cells (one blocked-out) and a thin cream rim-glint so it reads as a collectible. There are FOUR papers, so lay these out as four chips filling cells 13-16 and move the seam_tile up if you need the room — the artist should ensure all four chips (newsprint / graph / parchment / midnight, matching Group A hexes) are present, each a blank folded paper corner, NO letters:
14. chip_newsprint — folded #181228 swatch on #0d0a14.
15. chip_graph — folded #122028 swatch on #0a1216, faint teal rule.
16. chip_midnight — folded #141428 swatch on #0a0a16, gilt fleck.
(chip_parchment — folded #241a0c swatch on #161006 — place on the remaining spare cell; if the 16-grid is full, add a 17th cell / a 4x5 master instead so all four chips ship.)

WIRE: GROUP A backdrops are a PATCH — blit `mc_paper_<id>_bg.png` at the top of `render()` before the cell loop (index.html ~1129), keyed off `PROG.paper`, keeping the `pp.bg` fill as fallback. GROUP B cells 1-10 patch the cell-fill branch in `render()` (~1132-1135): `pp.cell`→cell_<id>, `pp.black`→black_<id>, `#241f14`→cell_inword, `#3a3016`→cell_selected, each a `drawImage` keyed off `PROG.paper` / state, behind an image-loaded check. Cells 11-13 (frame + seam) are new wire. Cells 14-16 (+parchment) patch the paper branch of `drawSwatch` (~1194-1197). Path-version every file `?v=BUILD`.

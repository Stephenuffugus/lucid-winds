<!-- Star Field · Sheet 2: Chart Board — ten region vellum tiles + inked borders + frame (colorblind-critical) -->
<!-- Copy everything below into your image generator to make this ONE sheet. -->

STYLE — "Astrolabe Atlas" (Star Field / Sky Wolf Studios celestial-cartography logic puzzle). Antique star-atlas art: fine cream ink linework and flat vellum-gouache washes on deep green-black night charts, warm lamplight from upper-left. The board is a plate from an old celestial atlas: constellation "provinces" as flat dark vellum washes, separated by THICK hand-inked cream coastlines. Flat painterly ink-and-gouache, subtle vellum grain, crisp edges, NO photoreal, NO 3D bevels, NO text/letters/numbers/logos/watermarks. COLORBLIND LAW (restated from the game): region identity is carried by the THICK CREAM BORDERS, never by fill color — so the ten province tints stay deliberately LOW-CONTRAST, dark and quiet, while the borders stay bright, thick and unbroken. Palette: voids #05070a/#0b0f0b/#0d100c/#0f150c, gold-shadow #1a1405; gilt #c8a84b, lit gold #f2d98a; chart-ink cream #e8dcc8, high-contrast cream #f5ebd0; sage #7ab356, moss #8a9178, seam #2a331f; province tints #33402a #2c3a3f #3f3326 #2e3a2a #3a2e3a #26343f #3f2e2e #333f2a #2a2f3f #3f3a2a. Compress under 150KB.

Create one sprite sheet. File: sf_board.png. Grid: 4 columns x 4 rows (16 cells, left-to-right, top-to-bottom). Cell: 512x512. Master: 2048x2048.

KNOCKOUT: Flat magenta #FF00FF fills the entire background of every cell. NO magenta / hot-pink ANYWHERE inside the art. Region tiles (cells 1-10) are FULL-BLEED SEAMLESS TILES — they fill their whole 512x512 cell edge-to-edge with no magenta visible and must tile perfectly against themselves (the engine pattern-fills board cells of any size with them). Border and frame pieces (cells 11-16) sit centered on magenta with margin, upright, NO ground shadow. Keep any gilt glint contained within its cell.

REGION PROVINCE TILES (cells 1-10) — ten seamless vellum washes, one per engine tint, each a flat quiet field of its exact hex with only the faintest vellum grain and one or two BARELY-visible chart flecks (a pin-prick star, a hair-thin arc) at under 10% contrast. These are backgrounds for gold stars and cream dots — nothing in them may compete. Match each hex exactly:
1. province_moss — #33402a (mossy green-black).
2. province_slate — #2c3a3f (blue-grey slate).
3. province_umber — #3f3326 (warm umber).
4. province_fern — #2e3a2a (deep fern).
5. province_plum — #3a2e3a (dusky plum).
6. province_petrel — #26343f (dark petrel blue).
7. province_rust — #3f2e2e (muted rust).
8. province_olive — #333f2a (olive green).
9. province_indigo — #2a2f3f (ink indigo).
10. province_bronze — #3f3a2a (dark bronze).

INKED BORDERS & FRAME (cells 11-16) — the meaning-carrying strokes. All border art must read as ONE continuous confident hand-inked line, fully opaque, no gaps, no decorative breaks:
11. border_stroke — a straight horizontal segment of the thick region border in chart-ink cream #e8dcc8: a hand-inked coastline stroke with the tiniest organic waver and softly rounded ends, tileable end-to-end. This is the 3px separator between constellations — the engine stretches and rotates it.
12. border_node — the junction knot where two or more borders meet: a small round cream #e8dcc8 ink node, slightly plumper than the stroke, that hides corner joins cleanly. (WIRE NOTE, needs new wire: the engine strokes continuous per-edge border lines, index.html ~334-340, and never draws junctions — node placement gets computed at region-corner joins in new code when the art path lands.)
13. border_stroke_hc — the HIGH-CONTRAST variant of cell 11 in brighter cream #f5ebd0, visibly heavier weight (the engine swaps to this thicker, brighter stroke when the player turns on the "High-contrast regions" setting). Same character, more presence.
14. frame_edge — a straight segment of the OUTER chart frame: a double-inked cream #e8dcc8 rule (one heavy line with a hair-thin companion line inside it), tileable end-to-end, heavier than the region border.
15. frame_corner — the outer frame corner: the double rule turning a rounded 90-degree corner, dressed with a SMALL gilt #c8a84b compass-rose quarter-ornament tucked into the outside of the bend (pictographic, tiny, no letters).
16. cell_hairline — a faint seamless overlay tile of the inner grid seams: hair-thin near-black #1a1405 lines along the tile's edges at low opacity, so individual cells read as gently engraved squares inside a province without ever competing with the cream borders.

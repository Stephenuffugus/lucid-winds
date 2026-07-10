<!-- Meadow Weave · Sheet 1: Atlas Hexes — the five lands as full tiles + rotatable edge wedges + colorblind symbol chips + slot / seam / frame -->
<!-- Copy everything below into your image generator to make this ONE sheet. -->

STYLE — "Lantern Atlas" (Meadow Weave / Sky Wolf Studios moonlit hex tile-laying). A cartographer's night desk: hand-inked landscape hexes washed in soft gouache, lit as if a warm lantern glows beneath the vellum — luminous landforms with engraved ink-line textures and thin gilded seams on a deep midnight table. Crisp hex geometry, rounded organic interiors, kid-friendly storybook-explorer, calm. Reads by VALUE + TEXTURE first, hue second (colorblind requirement — each land carries a signature engraving: Meadow fine double grass-ticks, Pond horizontal wave lines, Forest peaked conifer hatching, Field straight vertical furrows, Orchard small blossom dots — the five lands MUST stay distinguishable in grayscale). Flat top-down map view, everything centered and upright. Palette: table #0d100c/#0b0f0b, wash #111a12→#0c130e→#080d0a, ink line #2a331f, moss #8a9178, cream vellum #e8dcc8, lantern gold #c8a84b, seam-light #eafbd6/#c8e896, sage #7ab356 (#1f3016/#5c8f3f depths); THE FIVE LANDS: Meadow #4f8038→#7ab356, Pond #2b567c→#5b9bd5, Forest #24421f→#3f6b34, Field #9c7f2e→#d9b85a, Orchard #7d3450→#e58fa0; accents dew #bfe0f2, moon-blue #5b9bd5, rose #e58fa0. Gouache wash + engraved ink lines + faint paper grain, restrained glow, NO photoreal, NO neon, NO outlines heavier than #2a331f ink, NO text/letters/numbers/logos/watermarks. Compress under 150KB.

Create one sprite sheet. File: mw_tiles.png. Grid: 4 columns x 5 rows (20 cells, left-to-right, top-to-bottom). Cell: 512x512. Master: 2048x2560.

KNOCKOUT: Flat magenta #FF00FF fills the entire background of every cell. NO magenta / hot-pink ANYWHERE inside the art (keep Orchard's plum #7d3450 and rose #e58fa0 clearly distinct from #FF00FF). Every hex is POINTY-TOP (one corner straight up, flat edges facing left and right) and fills ~85% of its cell, centered, NO ground shadow (tiles butt flush against each other on the board — any shadow would double at seams). Wedges follow the wedge rule in their section. Keep lantern glow contained inside each cell.

COLORBLIND RULE (restated — non-negotiable): the five lands must be tellable apart with the color stripped. Each land's engraving motif is baked into its paint at all sizes, and the value ladder holds: Forest darkest, Pond dark-cool, Orchard mid-plum, Meadow mid-green, Field lightest/warmest. The engine ALSO overlays a symbol glyph per edge at 0.64 of the hex radius (a player toggle) — keep that anchor zone free of competing micro-detail.

FULL LAND HEXES (cells 1-5) — one complete pointy-top hex per land, all six edges the same land, drawn as a lantern-lit atlas plate: gouache land fill, the land's signature engraving motif across it, a faint warm under-glow at center fading to a slightly deeper tone at the rim, and a thin #2a331f ink outline with a hair of gilded #c8a84b catch-light. These are the fast-path sprites for a solid tile:
1. tile_meadow — Meadow #4f8038 lifting to #7ab356 at the glow; fine double grass-tick engraving scattered like combed turf, two or three tiny inked wildflower dots.
2. tile_pond — Pond #2b567c lifting to #5b9bd5; horizontal engraved wave lines with one small dew #bfe0f2 lantern-glint; reads clearly WATER at 34px.
3. tile_forest — Forest #24421f lifting to #3f6b34; peaked conifer hatching (little inked ^ canopies in overlapping rows); the darkest plate on the sheet.
4. tile_field — Field #9c7f2e lifting to #d9b85a; straight vertical furrow stripes like combed grain; the lightest, warmest plate.
5. tile_orchard — Orchard plum #7d3450 lifting to rose #e58fa0; small engraved blossom dots in loose orchard rows with tiny ink branch ticks.

EDGE WEDGES (cells 6-10) — the engine paints each hex as SIX rotated pie sectors, one per edge. Each wedge is a 60° sector: apex at the exact CENTER of the cell, widening to a flat outer hex edge at the RIGHT of the cell (pointing RIGHT, 3 o'clock — this orientation is load-bearing: canvas angle 0 = RIGHT and `EDGE_ANG[0]=0`, so a right-authored wedge drops in with rotation = `EDGE_ANG[i]` exactly, no offset. If a wedge were authored pointing UP instead, every placement would need a constant +90° base offset on top of `EDGE_ANG` — rotations 90/30/330/270/210/150 — and rotating by `EDGE_ANG` alone would land every wedge 90° off). Same paint language as the full hexes: land fill + engraving motif + under-glow near the apex, NO outline on the two straight sides (they must butt seamlessly against neighbor wedges), engraving oriented to still read after any rotation:
6. wedge_meadow — Meadow sector, grass-tick engraving.
7. wedge_pond — Pond sector, wave lines running parallel to the outer edge.
8. wedge_forest — Forest sector, conifer hatching.
9. wedge_field — Field sector, furrows running from apex to outer edge (so they stay radial under rotation).
10. wedge_orchard — Orchard sector, blossom dots.

SYMBOL CHIPS (cells 11-15) — pictographic replacements for the engine's per-edge colorblind glyphs (" ~ ^ | *), drawn as small embossed cream #e8dcc8 ink stamps at ~55% opacity feel, ONE glyph filling most of the cell, on the magenta knockout, no plate behind it (the engine stamps it straight onto any wedge at 0.64 radius). Silhouette must echo the original glyph so long-time players keep their read:
11. sym_meadow — two short parallel grass blades (the `"` double-tick), slightly splayed.
12. sym_pond — one clean single wave (`~`), two gentle humps.
13. sym_forest — one peaked pine tip (`^`), a triangle-mountain with a tiny trunk tick.
14. sym_field — one straight upright stalk (`|`) with two tiny grain barbs at the top.
15. sym_orchard — one five-petal blossom asterisk (`*`), petals as five rounded ticks around a dot.

BOARD SUPPORT (cells 16-20):
16. hex_rim — a pointy-top hex OUTLINE only (transparent center): the #2a331f ink line the engine strokes around every placed tile, with a whisper of inner gilded #c8a84b catch-light on the upper edges. Replaces the plain `strokeStyle rgba(10,14,9,0.85)` stroke.
17. hex_ghost — the legal-slot hint: a pointy-top hex of faint sage — a barely-there #7ab356 wash (think 5% fill) inside a dashed sage rim glow — inviting but quiet, matching the engine's dashed `rgba(122,179,86,0.22)` slots. Transparent center wash only, no engraving.
18. seam_glow — the matched-edge flash: ONE straight soft-glow bar (a hex edge length, horizontal) in seam-light #eafbd6 core fading through #c8e896, rounded ends, on transparent. The engine lays it along each newly matched seam and fades it out.
19. hex_vellum_center — the soft cream center blush: a round #e8dcc8 lantern-glow blob at very low opacity (the engine's `rgba(232,220,200,0.05)` arc at 0.34 radius), feathered to nothing — the "lit from beneath" heart of every tile.
20. preview_frame — the NEXT-TILE tray frame: a pointy-top hex frame in warm gilded #c8a84b (the engine's `rgba(200,180,120,0.6)` stroke, upgraded): thin double gilt line with tiny corner rivets, transparent center so the live preview wedges composite inside.

<!-- OriVex · Sheet 1: the paper — 10 digit-stock triangle facets + tile base + states -->
<!-- Copy everything below into your image generator to make this ONE sheet. -->

STYLE — "Clean Paper Meets Pixel" (OriVex / Sky Wolf Studios, the TetraVex edge-matcher). Premium origami paper photographed flat in soft north-window light: barely-there washi fiber texture with a few silk flecks, ONE soft crease highlight per facet along its fold edge, a whisper of lifted-edge shadow, zero gloss. Silhouettes stay CRISP and perfectly geometric — softness lives only in the texture. These are letterless plates: the engine prints the digits on top in ink, so surfaces must stay quiet and evenly lit. NO text, letters, numbers, glyphs, logos, watermarks. Compress under 150KB.

Create one sprite sheet. File: ov_paper.png. Grid: 4 columns x 4 rows (16 cells). Cell: 512x512. Master: 2048x2048.

KNOCKOUT: Flat magenta #FF00FF fills the entire background of every cell. NO magenta or hot pink anywhere in the art (rose stock #d9a0ac must stay clearly soft and grey-warm). Triangle facets are RIGHT ISOSCELES triangles filling the TOP quarter of a square tile (apex at center, base along the top edge) drawn at full cell width with margin — the engine rotates the same facet for east/south/west, so bake NO direction-specific shadow; keep the crease highlight along the two equal (inner) edges and the paper edge along the base.

PAPER STOCK FACETS (cells 1-10, one per digit, colors exact):
1. facet_0 mist grey #d8d8d4 · 2. facet_1 washi cream #efe6cf · 3. facet_2 sky #a8c8e0 · 4. facet_3 sage #adc9a0 · 5. facet_4 butter #e8d48a · 6. facet_5 terracotta #d99a72 · 7. facet_6 rose #d9a0ac · 8. facet_7 lavender #b3a0cd · 9. facet_8 slate blue #7a8fb0 · 10. facet_9 charcoal ink #4a4a50.
Each: that stock's flat paper tone, its own faint fiber personality (0 smooth, 1 visible washi strands, 2 cold-press dots, 3 leaf-fleck inclusions, 4 fine laid lines, 5 kraft flecks, 6 cotton softness, 7 subtle sheen threads, 8 dense smooth stock, 9 deep lacquer-flat ink paper), one crease highlight, one whisper edge shadow.

TILE FURNITURE & STATES (cells 11-16):
11. tile_base — the square under-tile: a folded-paper square seen from above, four faint fold valleys meeting at the center (an X of creases), soft outer edge shadow — facets composite on top of this.
12. tile_seams — overlay: just the X crease-lines and center pinpoint fold, slightly darkened valleys with hairline highlights, transparent elsewhere — laid over assembled facets to unify them into one folded square.
13. tile_selected — overlay: a clean lifted-paper effect — soft wide drop shadow ring and a 1px brighter rim, as if the tile rose 4mm off the desk.
14. edge_match_shimmer — overlay strip: a slim horizontal band (full tile width, ~14% tall) of gentle gold-dust glimmer #d9c27a fading at both ends — the engine lays it on a shared edge when two edges agree.
15. edge_mismatch_scuff — overlay strip: same geometry, but a faint graphite scuff #8a8a90 with two tiny eraser crumbs — the quiet "not quite" cue (never red, never loud).
16. tile_ghost — the drag ghost: the folded square at 60% opacity with a soft ground shadow beneath, edges kept crisp.

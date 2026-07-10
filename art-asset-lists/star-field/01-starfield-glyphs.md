<!-- Star Field · Sheet 1: Star Glyphs — the four star marks + conflict states + dot + halos -->
<!-- Copy everything below into your image generator to make this ONE sheet. -->

STYLE — "Astrolabe Atlas" (Star Field / Sky Wolf Studios celestial-cartography logic puzzle). Antique star-atlas art: fine cream ink linework and flat vellum-gouache washes with gold-leaf illumination on deep green-black night charts, warm lamplight from upper-left. Rounded, friendly, storybook-antique shapes (kid-safe, nothing sharp or scary); gilded glints, restrained glow, never neon; everything reads at thumbnail size and the four star glyphs MUST stay distinguishable by SILHOUETTE alone (colorblind requirement — 5-petal marigold / 5-point star / round firefly lamp / 6-petal rose). Flat painterly ink-and-gouache, subtle vellum grain, crisp edges, NO photoreal, NO 3D bevels, NO text/letters/numbers/logos/watermarks. Palette: voids #05070a/#0b0f0b/#0d100c/#0f150c, gold-shadow #1a1405; gilt #c8a84b, lit gold #f2d98a, warm cores #fff4cf/#fff6d0; chart-ink cream #e8dcc8, ash mark #c8c4b4; sage #7ab356, moss #8a9178, seam #2a331f; conflict rose #e58fa0, moon-blue #5b9bd5, dew-thread #bfe0f2. Compress under 150KB.

Create one sprite sheet. File: sf_glyphs.png. Grid: 4 columns x 3 rows (12 cells, left-to-right, top-to-bottom). Cell: 512x512. Master: 2048x1536.

KNOCKOUT: Flat magenta #FF00FF fills the entire background of every cell. NO magenta / hot-pink ANYWHERE inside the art (keep conflict rose #e58fa0 clearly softer and duskier than #FF00FF). Each glyph centered, upright, fully inside its cell with generous margin, NO ground shadow (glyphs sit flat on the chart — the engine composites them onto board cells, the win card and tiny 96x84 Grove tiles). Keep every glow contained within its cell — no glow tinting the magenta field. CRITICAL: these four glyphs are re-drawn by the engine at roughly 18px on keepsake cards, so silhouettes must be bold, simple and unmistakable from one another at that size.

THE FOUR STAR GLYPHS (cells 1-4) — the placed-star mark, one per unlockable skin, each a gold-leaf illumination in lit gold #f2d98a with gilt #c8a84b edging, one warm lamplight catch upper-left, and a soft contained gilt glow:
1. glyph_marigold — "Marigold" (the free starter, the engine's default): FIVE plump rounded petals arranged like a pressed flower stamped in gold leaf, with a pale warm #fff4cf center boss. Reads as a chunky 5-lobe flower, clearly NOT a pointed star.
2. glyph_star — "Classic Star": a FIVE-POINT compass star, points softened and rounded (a friendly cartographer's star, not a blade), lit gold #f2d98a faces with a slightly darker #c8a84b lower-right shading, tiny #fff4cf glint at the top point.
3. glyph_firefly — "Firefly": a simple ROUND lamp-orb in lit gold #f2d98a with one bright off-center #fff6d0 core glint upper-left, like a firefly caught in a bell jar. The cleanest, roundest silhouette of the four.
4. glyph_rose — "Rose": SIX rounded petals in a ring (visibly more and slimmer petals than the Marigold's five fat lobes) around a solid gilt #c8a84b center boss; a gilded heraldic rose illumination.

CONFLICT STATES (cells 5-8) — the SAME four glyphs with IDENTICAL silhouettes, repainted in conflict rose #e58fa0 with a dusky #7d5560-ish shading and a soft rose glow (the engine swaps to this when two stars touch or share a row/column/constellation — silhouette must NOT change, color is the only difference, because a status line in text also announces the conflict):
5. glyph_marigold_bad — the Marigold in conflict rose.
6. glyph_star_bad — the Classic Star in conflict rose.
7. glyph_firefly_bad — the Firefly in conflict rose.
8. glyph_rose_bad — the Rose in conflict rose.

MARKS & HALOS (cells 9-12):
9. mark_dot — the astronomer's pencil tick: one soft round graphite-chalk dot in ash-cream #c8c4b4 with a gently feathered edge, small within the cell (the engine draws it at one-tenth of a board cell — the "ruled out" mark auto-mark scatters). Quiet and unassuming next to the gold stars.
10. halo_gold — a soft radial gilt #c8a84b glow disc fading to fully transparent at the rim, EMPTY transparent center bias (the engine paints this halo UNDER every placed star before the glyph). No hard edges.
11. halo_rose — the same soft radial halo in conflict rose #e58fa0, for stars in conflict.
12. keepsake_node — a tiny simplified gilt star-bead: a small round #f2d98a bead with a minimal four-point #fff4cf twinkle, engineered to stay legible at 18px — the fallback node for keepsake constellation charts and Grove thumbnails.

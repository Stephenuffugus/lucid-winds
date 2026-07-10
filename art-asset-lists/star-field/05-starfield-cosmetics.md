<!-- Star Field · Sheet 5: Cosmetics — Glyph skins + Night Sky themes + wardrobe & Grove furniture -->
<!-- 💰 COSMETICS / ECONOMY sheet. Copy everything below into your image generator to make this ONE sheet. -->

STYLE — "Astrolabe Atlas" (Star Field / Sky Wolf Studios celestial-cartography logic puzzle). Antique star-atlas collectibles: gilded glyph illuminations, miniature night-sky vignettes and wardrobe furniture from an old observatory desk, warm lamplight from upper-left. Rounded, friendly, storybook-antique shapes; flat painterly ink-and-gouache, subtle vellum grain, restrained gilt glints, NO photoreal, NO 3D bevels, NO text/letters/numbers/logos/watermarks. The four glyphs MUST stay distinguishable by SILHOUETTE alone (colorblind requirement — 5-petal marigold / 5-point star / round firefly lamp / 6-petal rose). Palette: voids #05070a/#0b0f0b/#0d100c/#0f150c, gold-shadow #1a1405; gilt #c8a84b, lit gold #f2d98a, button gold #e8cd78, warm cores #fff4cf/#fff6d0; chart-ink cream #e8dcc8, ash #c8c4b4; sage #7ab356 + deep green #3f6b34, moss #8a9178, seam #2a331f; conflict rose #e58fa0 (sparing), moon-blue #5b9bd5, dew-thread #bfe0f2; sky moods Midnight #0b0f0b, Dusk #141018, Frost #0a1016, Ember #150e0a. Compress under 150KB.

Create one sprite sheet. File: sf_cosmetics.png. Grid: 4 columns x 4 rows (16 cells, left-to-right, top-to-bottom). Cell: 512x512. Master: 2048x2048.

KNOCKOUT: Flat magenta #FF00FF fills the entire background of every cell. NO magenta / hot-pink ANYWHERE inside the art. Each item centered, upright, fully inside its cell with margin, NO ground shadow (these composite into the wardrobe cards, the Grove gallery and gameplay). Every collectible gets a thin cream rim-glint so it reads as a prize. These are PURELY VISUAL skins — they never change grid size, region shapes, the unique solution, conflict rules or payouts.

STAR GLYPH SKINS (cells 1-4) — the four wearable star marks as wardrobe showpieces: each glyph presented slightly larger and more ornate than its in-play sprite, resting on a tiny ghosted cream chart-flourish. Named and gated to match the code (`GLYPHS`, unlocked by total solves):
1. skin_marigold — "Marigold" (starter, free): the five-fat-petal gold-leaf flower with warm #fff4cf boss, presented proudly; the everyone-starts-here glyph.
2. skin_star — "Classic Star" (unlock: 5 solves): the rounded five-point compass star in lit gold #f2d98a with a #e8cd78 edge polish and a tiny orbit-ring flourish.
3. skin_firefly — "Firefly" (unlock: 15 solves): the round lamp-orb glyph with its bright #fff6d0 core, dressed with two hair-thin trailing glow-arcs like a firefly's wander.
4. skin_rose — "Rose" (unlock: 40 solves): the six-petal gilded heraldic rose with #c8a84b center boss, the most ornate illumination of the four — the long-haul prize.

NIGHT SKY THEMES (cells 5-8) — each a small rounded-rectangle sky vignette card (landscape, generous corner radius): a miniature painting of that sky mood with a hint of cream chart filigree and three tiny gilt stars, exactly matching its stage color. Named and gated to match the code (`THEMES`, unlocked by HINTLESS solves — the mastery lane):
5. sky_midnight — "Midnight" (starter, free): the deep green-black #0b0f0b night vellum, faint sage-tinted ink filigree.
6. sky_dusk — "Dusk" (unlock: 6 hintless solves): dusky violet-plum #141018 with a soft rose-grey horizon glow.
7. sky_frost — "Frost" (unlock: 20 hintless solves): blue-steel #0a1016 with moon-blue #5b9bd5 and dew #bfe0f2 shimmer accents.
8. sky_ember — "Ember" (unlock: 45 hintless solves): warm ember-brown #150e0a with low gilt lamp-glow rising from the bottom; the prestige sky.

WARDROBE FURNITURE (cells 9-12) — the pieces the Star Skins screen composites around every card:
9. ward_card_frame — the wardrobe card plate: a rounded vellum tile, near-black #0f150c face, thin dark seam #2a331f rim, faint cream inner hairline mat (the engine composites the glyph/sky preview and its label on top).
10. ward_card_locked — the locked variant of the same plate: dimmed and slightly desaturated, with a small brass padlock resting centered on the face.
11. ward_equipped_rim — the "equipped" overlay: a clean gilt #c8a84b glowing border rim (frame only, transparent center) that hugs the currently-worn card, matching the game's gold on-state border.
12. lock_padlock — a standalone chunky rounded brass padlock in gold-shadow #1a1405 / gilt #c8a84b with a tiny cream keyhole glint, for any locked slot.

GROVE & KEEPSAKE FURNITURE (cells 13-16) — the pieces around the keepsake constellations every solve mints:
13. grove_tile_frame — the Grove gallery tile: a small rounded landscape plate (matching the 96x84 gallery canvases), near-black #0f150c face, dark seam #2a331f border, the faintest vellum grain — the little chart-card each keepsake constellation is drawn onto.
14. constellation_thread — the dew thread: one straight segment of the line that joins keepsake stars, in translucent dew-blue #bfe0f2 with a whisper-soft glow, hand-inked with the tiniest waver, tileable end-to-end (the engine stretches it point-to-point between solution stars).
15. perfect_badge — the hintless-solve seal: a small round gilt wax-seal medallion stamped with a tiny star and ringed by two cream laurel-like ink flourishes (pictographic, NO letters) — the flourish for "A perfect constellation!" wins. WIRE NOTE (light new wire): the clean-solve state already exists (`win()` line ~421 swaps the title when `G.hints===0`) but no badge is drawn today — compositing this seal onto the win screen is a small new wire, not an existing hook.
16. progress_token — the next-unlock token: a thin rounded gilt arc partly filled, with a tiny four-point star at the goal end and three ash #c8c4b4 tick dots along the way (shows "progress toward the next skin" with NO numbers). WIRE NOTE (needs new wire): no engine surface exists today — `renderWardrobe()` (index.html ~486-495) only prints "unlock: N solves / clean" text on locked cards, no progress arc — so this cell ships dark until that small UI wire is added; don't hunt for a hook.

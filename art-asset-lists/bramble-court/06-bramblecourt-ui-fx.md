# Sheet 06 — UI + FX (1024×1024, grid 4×4 cells of 256px)

**Copy-paste prompt:**

Illuminated-manuscript trading card art, aged vellum texture, burnished gold leaf accents, woodcut engraving linework, deep walnut and brass surroundings, soft candlelit shading, no text anywhere in the image, flat magenta #FF00FF background for knockout. A sprite sheet on a 4×4 grid of 256px cells, each cell one isolated element on flat magenta #FF00FF:

Row 1: (1) wide vellum button plaque, brass-pinned corners, empty center; (2) same plaque, gold primary variant; (3) small square icon plaque; (4) home/back roundel with tiny door.
Row 2: (1) turn banner ribbon, sage end-caps (player); (2) turn banner ribbon, rust end-caps (rival); (3) rule chip cartouche, small oval vellum tag (SAME/PLUS/OPEN text is engine-rendered); (4) question-mark-free help roundel with an open book.
Row 3 — FX: (1) card FLIP burst: ring of gold sparks with two curved motion crescents; (2) capture puff: soft rust-to-sage color swirl; (3) claim sparkle: rising gold star motes; (4) booster seedling: two small sprouting cards fanned.
Row 4: (1) daily streak flame-leaf token; (2) draft pick hand cursor glove; (3) win laurel: gold laurel half-wreath; (4) loss token: gracefully wilted thorn circlet (gentle, not punishing).

**Wire notes:** plaques skin `.btn/.btn.primary` (painted-plaque button rule: art fills the button, engine text on top); banners back `#turnbanner`; flip burst replaces the CSS `flp` keyframe moment (fires at the 180ms owner-swap in `animateFlips`); claim sparkle plays over `#claimwrap` picks; win/loss tokens decorate `#over-title`.

# Sheet 01 — Card frames, emblems, backs (1024×1024, grid 4×4 cells of 256px)

**Copy-paste prompt:**

Illuminated-manuscript trading card art, aged vellum texture, burnished gold leaf accents, woodcut engraving linework, single rich accent color per subject, deep walnut and brass surroundings, soft candlelit shading, crisp silhouettes readable at 90px, no text anywhere in the image, flat magenta #FF00FF background for knockout. A sprite sheet on a 4×4 grid of 256px cells, each cell one isolated object on flat magenta #FF00FF:

Row 1 — empty card FRAMES (vellum face + border only, open center): (1) common frame, plain pewter border #8a9178; (2) uncommon frame, sage-touched silver #7ab356; (3) rare frame, cool moonlit silver-blue #5b9bd5; (4) epic frame, amethyst-and-gold filigree #a468d8.
Row 2: (1) LEGENDARY frame, full gold-leaf illumination with tiny flourishes #c8a84b; (2) PLAYER side frame: gently ROUNDED corners, sage #7ab356 inner glow, small leaf sigil top-right; (3) RIVAL side frame: sharp ANGULAR corners, rust #c86a4b inner glow, small thorn sigil top-right; (4) selection glow ring, warm gold halo.
Row 3 — CARD BACKS (full 5:6.5 card, ornate): (1) Bramble back: interlaced dark bramble knot on deep green vellum; (2) Koi Pond back: brass koi circling on midnight blue-green; (3) Beholder's Eye back: single closed golden eye amid violet filigree; (4) claim-a-card glow burst, radiant gold rays.
Row 4: (1) fertile square inlay: warm luminous brass-green floor tile with faint upward motes; (2) thorn square inlay: darkened tile with iron thorn ring; (3) score pip PLAYER: small sage blossom token; (4) score pip RIVAL: small rust thorn token.

**Wire notes:** frames replace the flat `RARC` border strokes in `portrait()`; player/rival side frames replace `.cardel.own1/.own2` CSS borders (KEEP rounded-vs-angular silhouettes — colorblind rule); backs are `.cardel.back` variants `bk-koi`, `bk-eye`; fertile/thorn inlays underlay `.bcell.fert/.thorn` with engine text tags kept on top; pips replace the ✿ / ▲ text in `#scorewrap`.

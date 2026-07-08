# SERIOUSLY GOOD MAHJONG — Art Asset List
_Working folder: `satellites/mahjong/` · display name TBD (see bottom). One combined game replacing Jade + Flower Press._

**Total distinct tile faces: 42** (all painted once, reused up to 4× pixel-identical). Plus tile chrome, backgrounds, and UI.

## How to paint these (matches your existing cutout pipeline)
- Paint each **face motif only** — the ivory tile PLATE (cream body, bevel, gold hairline, 3D side-lip) is drawn by the game in CSS, so you paint just the botanical motif that sits ON the plate.
- Background: **magenta `#FF00FF`** flat behind each motif (same chroma-key sheets we cut Burr Blast / Bramblewick / Sprout Dice from). One motif per cell; leave clear margin so nothing touches the magenta edge.
- Motif art is a **light/warm motif on nothing** (the plate under it is warm cream `#e8dcc8`), so paint for readability against cream, not against black.
- Export target per face: **~256–320px** square on transparent/magenta (game downscales to ~40–64px, so paint bold: 2–3 colours, strokes ≥3px, clear silhouette). **Must read at 40px AND in grayscale** (colourblind-safe: suits differ by SHAPE first, colour second).
- Filenames below are exact — the game loads `assets/tiles/<name>.png`; until a PNG exists it shows an emoji/vector fallback, so the game is fully playable while you paint.

---

## 1 — NUMBER SUITS (27 faces · each used ×4 = 108 tiles)
Rank reads by **counting** the motif in the classic fixed mahjong arrangement (1 center · 2 vertical · 3 diagonal · 4 corners · 5 quincunx · 6 = 2×3 · 7 · 8 = 2×4 · 9 = 3×3), PLUS a **small gold corner numeral** as the safety net. The **"1" of each suit is one ornate HERO painting** (like the classic 1-Bamboo bird).

### Bloom suit — warm rose + gold ROUNDED blossoms  `bloom-1.png … bloom-9.png`
- `bloom-1.png` … `bloom-9.png` — that many rounded rose/gold blossoms; Bloom 1 = a single ornate hero blossom. Rounded silhouette (must stay distinct from Leaf/Seed when half-covered).

### Leaf suit — sage-green POINTED leaves w/ dark midrib  `leaf-1.png … leaf-9.png`
- `leaf-1.png` … `leaf-9.png` — that many pointed sage leaves with a dark midrib; Leaf 1 = a single hero leaf with veining. Pointed silhouette.

### Seed suit — amber/brown OVAL seed-pods / concentric rings  `seed-1.png … seed-9.png`
- `seed-1.png` … `seed-9.png` — that many round ringed seeds in the classic dot grid (what you see is what you count); Seed 1 = a single large ringed hero seed. Round silhouette, counts must never muddy.

## 2 — HONORS (7 faces · each used ×4 = 28 tiles)
Centered single hero motif, **no numeral**, small gold corner honor-mark. These match ONLY their exact same face.

### Companion (the "winds") — 4 hero pollinators
- `companion-butterfly.png` — butterfly, rose hue
- `companion-honeybee.png` — honeybee, amber-gold
- `companion-ladybird.png` — ladybird beetle, red + black
- `companion-dragonfly.png` — dragonfly, teal

### Root (the "dragons") — 3 hero root spirits
- `root-taproot.png` — a single deep-gold taproot spike
- `root-bulb.png` — a rounded cream tuber/bulb with rootlets
- `root-rhizome.png` — a spreading sage/bark horizontal rhizome network

## 3 — BONUS WILDS (8 faces · each used ×1 = 8 tiles)
**Season = any Season matches any Season** (GOLD wild frame accent — the game draws the frame, you paint the bloom). **Element = any Element matches any Element** (SILVER wild frame). Tiny glyph in corner, no numeral.

### Season (gold-frame group)
- `season-spring.png` — cherry blossom (pink)
- `season-summer.png` — sunflower (gold)
- `season-autumn.png` — maple leaf (copper)
- `season-winter.png` — frost-branch (ice blue)

### Element (silver-frame group)
- `element-rain.png` — rain droplets (blue)
- `element-sun.png` — sun rays (gold)
- `element-soil.png` — loam mound (bark brown)
- `element-wind.png` — wind swirl (pale grey)

---

## 4 — TILE CHROME (mostly CSS — paint only if you want extra richness)
- `tile-back.png` **(wanted)** — Lucid Winds card-back style: deep sage + gold botanical filigree on a midnight field. Used for the deal animation, Daily calendar cells, and locked-layout thumbnails.
- `tile-plate.png` _(optional)_ — a painted bone/ivory face texture if you want more than the CSS cream plate. Default = CSS.
- `tile-lip.png` _(optional)_ — painted bone side-strip for the 3D thickness. Default = CSS box-shadow lip.

## 5 — BACKGROUNDS (540×960)
- `bg-table.png` **(default board)** — deep near-black greenhouse table, soft sage/gold top vignette, faint glass-roof rafters + dew. Low-contrast + uncluttered so ivory tiles pop.
- `bg-menu.png` — painted midnight-greenhouse doorway behind Title / picker / Daily / Win; cream headroom for the wordmark.
- Unlockable tables (later, optional 4): `bg-table-moss.png`, `bg-table-oak.png`, `bg-table-glass.png`, `bg-table-nightbloom.png` — same dark, low-contrast discipline.

## 6 — UI & META
- `wordmark.png` — painted wordmark (final name TBD) in cream+gold serif with a small pressed-flower/tile emblem.
- `thumb.jpg` — portal thumbnail, ≤480px & ≤150KB: a small cluster of painted ivory tiles (a Bloom, Leaf, Seed + a wild) on the midnight table, instantly "botanical Mahjong."
- Difficulty badges (4): `badge-easy.png` `badge-medium.png` `badge-hard.png` `badge-expert.png` — small star-ribbons, sage → gold → copper → ice.
- Daily trophies (3): `trophy-bronze.png` `trophy-silver.png` `trophy-gold.png` — pressed-flower medallions for ~10 / ~20 / full-month Daily completion.
- `garland.png` _(optional)_ — laurel/garland accent (sage + gold) for the win card.
- Match particles (optional): `particle-petal.png` `particle-spore.png` — canvas-drawn particles are the default, so these are polish-only.

---

## Priority order for painting
1. **The 42 tile faces** (this is the whole game — everything else has a working default).
2. `tile-back.png`, `bg-table.png`, `thumb.jpg` (deal/board/portal).
3. `wordmark.png`, `bg-menu.png`, difficulty badges.
4. Everything optional / unlockable / Daily-trophy (fast-follow).

## Open decisions for the Director (don't block painting the 42 faces)
- **Final name + home:** merged name (e.g. "Jade Garden") vs keep "Flower Press"/"Jade Mahjong"; upgrade `/satellites/flowerpress/` in place or ship new `/satellites/mahjong/`, and retire `games/jade.js`.
- **Launch roster:** ship 6–8 layouts now and grow to 19, or full 19 day one?
- **Numerals:** keep the small gold corner numeral alongside the countable motif (recommended), or pure-count no-numeral?
- Challenge-mode scoring values + Daily Sunbeam tiers (within the locked 30/day, 12/run policy) — needed only when those modes are built.

# Nova Bloom — Art Direction

**Game:** `satellites/nova-bloom/index.html` — twin-stick neon arena shooter (Geometry Wars homage).
Left thumb flies, right thumb fires, kills seed flowers, mature flowers charge the Bloom Bomb.
4 modes: Arena / Deadline Daily / Pacifist Run / Zen Drift.

**What is art-wireable vs engine-drawn (read first):**
The game draws everything as PROCEDURAL NEON VECTORS (two-pass stroke glow: thick low-alpha
+ thin bright — see `neonStroke()`, `drawShip()`, `drawEnemy()` in the code). That vector look
IS the genre's identity, so this pack's default scope is:
1. **Full-bleed backdrops** behind the warp grid (one per palette in `PALS`: meadow/violet/dawn) — drop-in, zero engine changes (draw before grid in `render()`).
2. **UI chrome** — HUD chips, bomb button, mode buttons, over/wardrobe/grove screens, title art.
3. **Keepsake frames** for the Grove gallery canvases.
4. *(Optional, needs a small render patch)* sprite swaps for ships/enemies via `drawImage` in `drawShip`/`drawEnemy` — spec included in sheets 01/02, flagged as PATCH-REQUIRED so nothing here is a dead-end.

---

## Style options (pick one; all sheets bake the chosen STYLE block)

### Option A — **Vector Nova** (RECOMMENDED)
Pure synthwave arcade: jet-black space, laser-etched neon linework, chromatic bloom halos,
scanline-free crispness. Backdrops are near-black with faint nebula dust and horizon glow so
the game's own vectors stay the star. Mature, timeless, exactly what Geometry Wars players expect —
and our flowers/pollen read as radiant energy glyphs, not garden decor.
*Palette anchors:* #0a0e0b base, sage #7ab356 grid, gold #ffd76a, pink #e58fa0, cyan #9ee6ff.

### Option B — **Chromatic Deep Space**
Painterly cosmos: rich nebulae, star fields, aurora ribbons in each palette's hue. Heavier
backdrops, more color drama; vectors sit ON the painting. Prettier stills, slightly busier in motion.

### Option C — **Bioluminal Abyss** (mature organic, NOT garden-cute)
Deep-ocean darkness with bioluminescent plankton drifts and abyssal gradients. The "flowers"
read as glowing sea-life. Moodier and heavier; overlaps Spore Drift's Inkwater look, so only
pick if we want the two games visually paired.

**Recommendation: Option A (Vector Nova).** The engine's procedural glow does the heavy
lifting; art should frame it, not fight it. Cheapest to wire, best motion clarity, most faithful
to the classic.

---

## Cosmetics economy (already live in code — `WARD` array, `novabloom_save`)

| Lane | Item | Threshold (from code) |
|---|---|---|
| Seedcraft (ship) | Dandelion Dart | free |
| Seedcraft | Maple Cross | 5,000 cleared lifetime |
| Seedcraft | Firefly Needle | multiplier x20 |
| Seedcraft | Comet Bud | daily streak 3 |
| Petal fire (trail) | Ember | free |
| Petal fire | Petal Stream | 1,000 cleared lifetime |
| Petal fire | Aurora Thread | pacifist score 5,000 |
| Garden (palette) | Midnight Meadow | free |
| Garden | Deep Violet | 25,000 cleared lifetime |
| Garden | Dawn Chorus | daily streak 7 |

No lootboxes. Item NAMES are debatable pre-art (Director note Jul 10); ids in code stay stable.

---

## STYLE BLOCK (bake into every sheet prompt — Option A)

> Vector Nova style: pristine neon vector arcade art on pure black, laser-etched glowing
> linework with soft chromatic bloom, high contrast, no gradients banding, no text, no
> watermark, crisp game-asset silhouettes, flat FF00FF magenta background for cutout.

Sheets: 01 ships+trails · 02 enemies · 03 fx (pollen/flowers/bomb/gates) · 04 backdrops · 05 UI.
Every sheet: flat #FF00FF magenta ground, cells annotated with hex sizes, cut via
magenta-KEY-distance (NOT hue) per `reference_cutout_script`.

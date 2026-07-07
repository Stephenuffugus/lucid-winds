# SATELLITE ART QUEUE — the master hand-off list
*Every art asset the satellites still want, so you can hand ChatGPT one list at a time.*
*Rebuilt 2026-07-07 from a full, file-by-file audit of every satellite (ART keys vs. files
on disk). The fleet is now **almost entirely art-complete** — the remaining list is short.*

Every satellite ships **100% playable with canvas-drawn art**, so **nothing here blocks**.
Each asset is an optional drop-in upgrade: the moment a correctly-named file lands in the
game's `assets/` folder, the game uses it; if it's missing, the code keeps drawing its own
version. Paint any subset, in any order, and hand me batches whenever.

---

## ⭐ THE ACTUAL REMAINING ART (short list, in priority order)

### 1. Bramblewick — the 4 new bosses  ·  **the one visible gap**
The five grounds each have a boss; two are painted (Grubfather, Stormwing), **four are still
procedural blobs** sitting next to them and reading as unfinished:
`boss_tideshell`, `boss_broodmother`, `boss_frostmaw`, `boss_wiltqueen`.
**→ Paste-ready spec: `satellites/bramblewick/BOSS_ART_LIST.md`** (Sheet A). One 2×2 magenta sheet.

### 2. Sprout Dice — portal thumbnail  ·  *tiny art, every visitor sees it*
Sprout Dice is the last satellite card still showing only its 🎲 glyph.
**→ Paste-ready spec: `satellites/sprout-dice/THUMBNAIL_SPEC.md`** (`portal-assets/thumbs/sprout-dice.jpg`,
~480×480, ≤150 KB, full-bleed). Hero shot: a living-wooden garden die tumbling over a glowing gold
target ring, a pest recoiling from a thorn strike — midnight-greenhouse palette.

### 3. Bramblewick — the 5 ground backgrounds  ·  *optional polish*
Per-ground floors (`bg_greenhouse/sunkenbeds/sundrift/understory/longdark.jpg`). Optional — the
game tints each ground procedurally and the generic floor already covers them.
**→ Same file: `satellites/bramblewick/BOSS_ART_LIST.md`** (Sheet B).

### 4. Dragon Philosophy — illustration set  ·  *not a drop-in; separate repo*
A built React/Vite bundle, so art must be added in its **source project** and rebuilt
(`npm run build` base:'./'), then re-vendored — not a magenta-cut drop-in. Wants **8 dragon-patron
portraits, 10 threat illos, 17 chase-card illustrations (~640×512)**, all placeholders today.
Lower priority for that reason; flag me when you want to tackle it and we pull the source repo.

---

## ✅ ALREADY ART-COMPLETE (audited 2026-07-07 — nothing to make)
| Game | art model | state |
|---|---|---|
| **Burr Blast** | 63-entry `ART_FILES` map | 63/63 files present, thumb ✓ |
| **Garden Guard** (`garden-td`) | `manifest.json` (90 keys) | 90/90 present (9 towers + tier heads + variants, 16 pests, 4 bosses, keeper, projectiles, FX), thumb ✓ |
| **Petal Plunge** | `ART.load` key-list (42) | 42/42 present (13 riders, 9 sleds, gnome ×2, 13 obstacles, 5 biome bgs), thumb ✓ |
| **Vine Runner** | `ART` object (13) + 2 skins | 23/23 present, thumb ✓ |
| **Bramblewick** | `ART.load` key-list (71) | 62/71 present — only the 9 items above are open, thumb ✓ |
| **Blooming Words** | procedural SVG | no art keys, thumb ✓ |
| **Vinewinder** | procedural canvas | no art keys, thumb ✓ |
| Bloom Breaker · Budburst · Pong Arena · Power Scalers · Sproing · Hues · Picnic Panic · Pollen Panic · Shell Shuffle | colour/canvas-driven | complete, all have portal thumbs |

**Pit Bike Rally** — art was already supplied (the Jul-04 root zip: bikes, terrain tiles, FX
strips, props, logo, 3 scene bgs). It's a **cut+repack-the-atlas job for me**, not a ChatGPT job.

---

## OPTIONAL POLISH (files/hooks exist; not gaps — flag me if you want them)
- ~~**Petal Plunge** — 7 trail swooshes unwired~~ ✅ **WIRED 2026-07-07** (`37debfc`): the equipped trail
  now streams its painted swoosh ribbon behind the sled (and shows in the shop).
- **Garden Guard** — 4 painted map backdrops (540×960) would lift the boards, but each map already has
  a distinct procedural look, so they're polish, not a hole.
- **Burr Blast** — currency HUD chips still use emoji; painted pips are a minor nicety.

---

## THE FLEET CONVENTION (read once, paste the relevant bits into ChatGPT)
- **Deliver a transparent PNG, OR paint on a flat magenta `#FF00FF` background** and I'll chroma-key
  it to transparent. Full-bleed backdrops/thumbnails don't need magenta — they fill the frame.
- **Paint big, never pre-shrink.** Sizes are listed per asset. **Keep every file under 1600px** on its
  long side (the host down-samples larger) and reasonably small in KB. I version-bust on deploy.
- **No text baked in** (except a logo/wordmark that's meant to be text).
- **House style for all of them:** cozy children's-storybook, soft painterly/gouache, warm rim light,
  big readable silhouettes, a little glow. **Midnight-greenhouse palette:** deep near-black grounds,
  sage green, warm gold, cream, a touch of rose. Match the Lucid Winds card-art mood.

---

## RECOMMENDED ORDER
1. **Bramblewick's 4 bosses** (`BOSS_ART_LIST.md` Sheet A) — the only art that currently reads as unfinished.
2. **Sprout Dice thumbnail** — smallest possible art, every portal visitor sees it.
3. **Bramblewick's 5 ground backgrounds** (Sheet B) — optional atmosphere.
4. Dragon Philosophy's illustration set, whenever you want to pull that source repo.

Hand me any batch (magenta sheet or transparent PNGs) and I'll cut, quantize, cache-bust, wire and
re-vendor it — one game at a time.

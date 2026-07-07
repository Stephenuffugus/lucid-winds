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

### 1. ~~Bramblewick — 4 bosses + 5 grounds~~  ·  ✅ **DONE (d26314a)**
All 4 boss sprites and all 5 ground backgrounds are painted, cut and wired. Bramblewick is
art-complete. Only **Sprout Dice** art remains (below).

### 2. Sprout Dice — full art pass (it's emoji + CSS today)  ·  the Director wants to build it out
**→ Full list: `satellites/sprout-dice/ASSET_LIST.md`** — 7 face symbols (biggest bang), 12 pests +
4 bosses, rarity die faces, board bg + logo. Thumbnail spec at `THUMBNAIL_SPEC.md`
(`portal-assets/thumbs/sprout-dice.jpg`, ~480×480, ≤150 KB — last glyph-only card).

### 3. The three retro remakes — all procedural today (each has a paste-ready PROMPTS.md)
- **Bloomzap** (`satellites/bloomzap/PROMPTS.md`) — letter tile, 4 rival portraits, zap FX, logo, win/lose splash.
- **Rootbound** (`satellites/rootbound/PROMPTS.md`) — the golden bloom hero, 3 planter pots, gate, bed texture, logo.
- **Petalvex** (`satellites/petalvex/PROMPTS.md`) — tile wedge texture, bed backdrop, logo, 5 mode badges, win art.
*(All keep working with canvas/CSS art until painted — nothing blocking.)*

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
| **Bramblewick** | `ART.load` key-list (71) | 71/71 present (all sprites + 6 bosses + 5 ground bgs), thumb ✓ |
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
- **Burr Blast** — 9 building materials now have a wired **seamless-tile** hook (`mat-<name>.png`);
  spec at `satellites/burr-blast/design/MATERIAL_ART_LIST.md`. Optional — the canvas materials already
  look finished. Also: currency HUD chips still use emoji (minor).

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
1. **Sprout Dice** — face symbols → pests/bosses → dice → board, + the thumbnail (the last art gap in the
   drop-in fleet; `ASSET_LIST.md` + `THUMBNAIL_SPEC.md`). *(Bramblewick is now fully done.)*
2. Dragon Philosophy's illustration set, whenever you want to pull that source repo.

Hand me any batch (magenta sheet or transparent PNGs) and I'll cut, quantize, cache-bust, wire and
re-vendor it — one game at a time.

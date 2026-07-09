# Sproing — Sprite-Sheet Asset List

**Game:** Sproing (Sky Wolf Studios satellite) — a botanical Doodle-Jump-style vertical jumper. The player bounces up an endless beanstalk landing on leaf-pads, stomping garden pests, grabbing nectar coins and seed-powerups, climbing through 6 biome bands from a garden bed to the starfield.

**Scope note (read first):** Do NOT make player-character sprites. The climber is procedural / player-drawn on purpose ("Draw Your Climber" studio) and must stay that way. Do NOT skin hats, skins, trails, or sky-themes — those are procedural studio cosmetics. This list skins ONLY the world the game draws around the player: backgrounds, leaf platforms, critters/pickups, and powerup pods. That is the smallest set that fully skins the game.

---

## STYLE (shared — prepend to every sheet prompt)

Bright, colorful, fun handmade paper-craft game art. Cozy midnight-garden world climbing from a garden bed up to a starfield, with deep near-black green shadows, saturated sage greens, antique gold rewards, cream highlights, rose accent for peaks/danger. Tactile fiber-art materials: cut paper, wool felt, macrame cord, beads, sequins, glitter, scrapbook layers, stitched edges, soft handmade texture. Leaf platforms, cute botanical garden critters (aphids, snails, beetles, wasps, spiders), dandelion seeds and sprouting pods. Clean readable silhouettes first. Cute botanical critter energy, cozy-menacing flytraps, never scary or grim. Soft top-down key light with warm gold rim-light. Chunky arcade readability at small sizes. No photorealism, no 3D render, no text labels, no captions, no borders, no UI words. Keep detail bold and simple enough that each cropped asset compresses well. Palette base #0e140d, sage #7ab356, gold #c8a84b, cream #e8dcc8, rose #e58fa0.

---

## Sheet 1 — Biome Backgrounds (full-bleed)

- **File:** `sproing_bg_sheet.png`
- **Grid:** 2 cols x 3 rows (6 cells)
- **Cell size:** 1620 x 2880 px (portrait)
- **Master size:** 3240 x 8640 px
- **Knockout:** Full-bleed art, no magenta inside a cell. Magenta #FF00FF only in the gutters between cells.
- **Direction:** These replace the flat sky gradient (`skyPair()`), fixed to the screen and cross-faded by altitude as the player climbs. Keep them SOFT and low-contrast toward the center so the small foreground leaves, critters and the climber always read on top. Vertical composition should feel like "looking up" — lighter/higher toward the top of each frame. No foreground platforms baked in.

1. `bg_garden_bed` — Cozy soil-and-flowerbed dawn: felt earth at the bottom, rows of paper tulips and clover, warm sage-and-gold morning haze rising to a soft cream sky.
2. `bg_hedgerow` — Deep green cut-paper hedge walls climbing upward, dappled gold light gaps, drifting felt pollen motes, calm mid-morning sage tones.
3. `bg_canopy` — Inside a great tree canopy: overlapping translucent leaf layers, macrame vine cords, warm sun shafts through cream-green foliage.
4. `bg_clouds` — Soft cotton-wool cloud banks in cream and pale sage, floating dandelion seeds, gentle blue-green sky, airy and bright.
5. `bg_upper_air` — Thin high-altitude dusk: deep indigo-to-rose gradient, wispy felt cirrus, first faint bead-stars, cool with a rose-gold horizon glow.
6. `bg_starfield` — Near-black green night with a scattered galaxy of sequin and glitter stars, a faint gold nebula ribbon, one small cream crescent moon, calm and magical.

---

## Sheet 2 — Leaf Platforms & Terrain (cutout sprites)

- **File:** `sproing_platforms_sheet.png`
- **Grid:** 4 cols x 3 rows (11 cells + 1 blank)
- **Cell size:** 512 x 512 px
- **Master size:** 2048 x 1536 px
- **Knockout:** Flat magenta #FF00FF background in every cell for knockout. No magenta inside the artwork.
- **Direction:** These are the pads the climber lands on, drawn wide-and-short. Center each shape with generous transparent margin; the game scales them to platform width. Strong top-down read, chunky stitched edges. Keep the two "armed/danger" states clearly distinct from their safe states at a glance.

1. `platform_broad` — A broad flat sage felt leaf pad with a stitched central vein, cozy and solid — the default landing leaf.
2. `platform_drifting` — A sage leaf pad with a little curled tendril sprouting off one edge, hinting it slides side to side.
3. `platform_crumble` — A browning, dry paper leaf with a bite-hole and hairline cracks, one corner flaking — looks fragile, breaks after you land.
4. `platform_dewy` — A cool teal-green leaf glossed with three fat cream dew-droplets, shiny and slippery-looking.
5. `platform_dandelion` — A pale dandelion-puff seed-head disc, airy dashed cream fluff forming a soft ring pad — clearly temporary and delicate.
6. `platform_mushroom` — A plump rose-capped mushroom bounce pad with cream stem and white felt spots, springy and inviting.
7. `platform_fiddlehead` — A tight green coiled fern fiddlehead spring, wound like a macrame spiral, primed to fling you upward.
8. `platform_thornleaf` — A muted olive-brown leathery leaf pad, no thorns showing — looks safe for now.
9. `platform_thornleaf_armed` — The same brown leaf with sharp rose-red thorns jabbing straight up along its top edge — clearly dangerous.
10. `platform_flytrap` — A closed green venus-flytrap leaf disguised as an ordinary calm pad, faint seam down the middle.
11. `platform_flytrap_open` — A cozy-menacing open venus flytrap: purple maw, cream zipper teeth, rose gullet, wide open — a trap, not a landing.

---

## Sheet 3 — Critters & Pickups (cutout sprites)

- **File:** `sproing_critters_sheet.png`
- **Grid:** 3 cols x 3 rows (9 cells)
- **Cell size:** 512 x 512 px
- **Master size:** 1536 x 1536 px
- **Knockout:** Flat magenta #FF00FF background in every cell for knockout. No magenta inside the artwork.
- **Direction:** Small garden critters (obstacles you dodge or stomp) plus the collectible coins and two drifting hazards. Cute felt-bug energy, big readable eyes, side-profile poses. Coins face-forward and shiny.

1. `pest_aphid` — A cuddly cluster of round little green felt aphids huddled together, tiny dot eyes — the soft pest you stomp for coins.
2. `pest_wasp` — A plump yellow-and-black striped felt wasp, translucent paper wings and a little rose stinger, side profile in flight.
3. `pest_snail` — A cozy garden snail with a spiral macrame-cord shell in warm tan, cream body and two bead-tipped antennae, crawling.
4. `pest_beetle` — A rounded violet felt beetle with a split gold-edged wing-case and a small horn, glossy and chunky.
5. `pest_spider` — A small friendly charcoal felt spider dangling on a fine cream silk thread, two white bead eyes, legs tucked.
6. `coin_nectar` — A shiny antique-gold nectar coin, slight edge-on oval with a cream specular glint and a stitched rim — the standard pickup.
7. `coin_gold` — A brighter treasure coin: gold with a raised cream star emblem and a sparkle, richer than the nectar coin — the bonus pickup.
8. `hazard_seed` — A spinning brown maple samara whirligig seed, one papery wing and a bead core, mid-rotation as it drifts across.
9. `hazard_bramble` — A thorny bark-brown bramble sprig with sharp rose-tipped thorns, jagged and spiky, growing upward.

---

## Sheet 4 — Powerup Pods (cutout icons)

- **File:** `sproing_powerups_sheet.png`
- **Grid:** 5 cols x 2 rows (10 cells)
- **Cell size:** 512 x 512 px
- **Master size:** 2560 x 1024 px
- **Knockout:** Flat magenta #FF00FF background in every cell for knockout. No magenta inside the artwork.
- **Direction:** These replace bare emoji glyphs floating in a gold ring — the biggest charm-and-readability win in the game. Each is a single self-contained glowing pickup pod: a rounded dark-green pod with a warm gold glow rim and one clear botanical emblem at its center. Same pod silhouette across all ten so they read as a family; only the emblem changes. Instantly legible at ~40px.

1. `powerup_dandelion_parachute` — Pod emblem: a single dandelion seed opened like a tiny cream parachute — slows your fall.
2. `powerup_nectar_magnet` — Pod emblem: a gold horseshoe magnet with a dripping nectar bead — pulls coins in.
3. `powerup_bubble_shield` — Pod emblem: a shimmering pale-blue dew bubble — one-hit protection.
4. `powerup_propeller_seed` — Pod emblem: twin maple-samara wings crossed like a propeller — lifts you up.
5. `powerup_spring_roots` — Pod emblem: a coiled green root spring — a giant bounce.
6. `powerup_giant_leaf` — Pod emblem: one big bold sage leaf — grow huge.
7. `powerup_shrink_bud` — Pod emblem: a tiny closed rose bud — shrink small.
8. `powerup_pollen_jetpack` — Pod emblem: a burst of gold pollen flame jetting upward — rocket boost.
9. `powerup_slow_time_honey` — Pod emblem: a dripping honey hourglass in warm amber — slows time.
10. `powerup_ghost_spores` — Pod emblem: a wisp of translucent pale spores — phase through danger.

---

## WIRE NOTES

- **No ART hook exists yet.** The game draws everything with Canvas2D and loads zero asset files (the only `new Image()` calls read the player's own drawn doodles from localStorage). A drop-in ART hook must be added first — same pattern as Nectar Drop's "art replaces procedural draws when present, procedural fallback otherwise." Key each image by the name below; if the image is missing, fall through to the existing draw code.
- **Backgrounds** → `renderGame()` sky block (~L1439-1441) / `skyPair()` + `BIOME_SKY` (~L1431). Cross-fade `bg_*` by altitude/biome (`biomeIdx(m)`, 6 bands capping at 3000m) in place of the gradient. Folder: `assets/bg/`.
- **Platforms** → `drawPlatform()` (~L1482), keyed by `pl.type` (`broad`, `drifting`, `crumble`, `dewy`, `dandelion`, `mushroom`, `fiddlehead`, `thornleaf`, `flytrap`). `thornleaf` swaps to `platform_thornleaf_armed` when `pl.thornUp`; `flytrap` swaps to `platform_flytrap_open` when `pl.trapOpen`. Folder: `assets/platforms/`.
- **Critters** → `drawPest()` (~L1498), keyed by `pe.type` (`aphid`, `wasp`, `snail`, `beetle`, `spider`). Folder: `assets/critters/`.
- **Coins + hazards** → `drawCoin()` (~L1508; `coin_nectar` default, `coin_gold` when `gold` flag) and `drawHazard()` (~L1515; `hazard_seed`, `hazard_bramble`). Wind/haze hazards stay procedural full-screen overlays. Folder: `assets/pickups/`.
- **Powerups** → `drawPowerup()` (~L1509), keyed by the powerup `id` (matches `POW_IDS` / `POW_SYM`). Draw the pod sprite instead of the gold ring + emoji glyph. Folder: `assets/powerups/`.
- **Recommended root:** `satellites/sproing/assets/` with the subfolders above. Remember to path-version deploys (`?v=hash`) per the Hostinger image-resizer note. Every final cut asset must compress under 150KB.
- **Do NOT touch:** the climber (`drawPlayer()` / `curSprite`, procedural draw-your-own), the beanstalk vine, hats/skins/trails/sky-themes (procedural studio cosmetics). Skinning those would fight the game's identity.

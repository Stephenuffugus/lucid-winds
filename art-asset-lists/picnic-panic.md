# PICNIC PANIC — Sprite-Sheet Asset List
Garden Galaga · Lucid Winds / Sky Wolf edition. Fixed-swarm arcade shooter (Galaga clone): a potted flower fighter at the bottom shoots up at a diving swarm of garden bugs. 4 modes, a queen boss with a pollen capture-beam, a Classic "transform trio", floating power-up drops, and a nectar cosmetics shop (plants / pots / shots / scenes). Everything currently renders as platform-emoji + flat vector — 0 image assets on disk. These sheets skin the swarm, the hero plant, the pickups, and the scenes.

---

## STYLE (paste this block with every sheet)

Bright, colorful, fun handmade paper-craft game art. Cozy midnight-garden world with deep near-black green shadows, saturated sage greens, antique gold rewards, cream highlights, rose accent for targets/peaks. Tactile fiber-art materials: cut paper, wool felt, macrame cord, beads, sequins, glitter, scrapbook layers, stitched edges, soft handmade texture. Clean readable silhouettes first. Cute botanical critter energy — garden bugs and cozy-menacing bosses that are never scary or grim. Soft top-down key light with warm gold rim-light. Chunky arcade readability at small sizes. No photorealism, no 3D render, no text labels, no captions, no borders, no UI words unless a logo cell says exact logo text. Keep detail bold and simple enough that each cropped asset compresses well. Palette base #0e140d, sage #7ab356, gold #c8a84b, cream #e8dcc8, rose #e58fa0.

ORIENTATION NOTE for all critter cells (Sheets 1 & 2): draw each bug in top-down / slightly-above view with its **head pointing UP** toward the top of the cell. The engine rotates the sprite 180° so a resting bug faces down at the player, and rotates it to face its travel direction on a dive. Symmetrical left-right silhouettes read best.

---

## Sheet 1 — Swarm critters (the grunts)
- **File:** `picnic_enemies.png`
- **Grid:** 4 cols × 3 rows (12 cells, 11 used, last cell magenta-empty)
- **Cell:** 512 × 512
- **Master:** 2048 × 1536
- **Knockout:** Flat magenta #FF00FF background in every cell for knockout. No magenta inside the artwork.

1. enemy_fly — round steel-blue felt housefly, big translucent bead wings, two tiny cream highlight eyes, stitched body segments; the weakest grunt.
2. enemy_ant — deep-red wool worker ant, three bead body segments, thin thread legs, small cut-paper mandibles.
3. enemy_mosquito — slender pale-green mosquito, long thread legs dangling, gossamer sequin wings, one comic needle proboscis.
4. enemy_beetle — glossy emerald scarab beetle, domed felt shell split by a center seam, warm gold rim-light.
5. enemy_ladybug — armored rose-red ladybug with a hard lacquered domed shell, black felt spots, a thick stitched center seam that reads as crackable plating.
6. enemy_wasp — amber-and-black striped wasp, angular folded-paper wings, a sharp but cozy-menacing brow, faint gold rim.
7. enemy_butterfly — sage-and-rose felt butterfly, big symmetrical scrapbook-layered wings with sequin eyespots, dainty and bright.
8. enemy_cricket — spring-green cricket with big folded jumping legs coiled to lunge, glossy black bead eyes; a kamikaze diver.
9. enemy_spider — plush round garden spider hanging from a short macrame thread stub at the top of the cell, eight bead-tipped legs, gold cross-stitch on its back.
10. enemy_puffer — fat over-inflated pale-green grub-caterpillar, felt seams straining tight, about to burst; cozy-menacing splitter.
11. enemy_sporeling — tiny lime spore blob with one googly bead eye and a wispy felt tuft; the little splitling shed by the puffer.

---

## Sheet 2 — Boss + transform elites (the big-score set pieces)
- **File:** `picnic_bosses.png`
- **Grid:** 2 cols × 2 rows (4 cells)
- **Cell:** 768 × 768
- **Master:** 1536 × 1536
- **Knockout:** Flat magenta #FF00FF background in every cell for knockout. No magenta inside the artwork.

1. boss_queen_bee — plump regal queen bee, honey-amber felt body, a tiny gold crown tuft, translucent bead wings, and a soft glowing underbelly where the pollen capture-beam emits; cozy-menacing, head-up.
2. elite_scorpion — cute paper-craft garden scorpion, curled felt tail with a rose bead stinger, small pincers, faint gold shimmer marking a high-value target.
3. elite_serpent — coiled cozy grass-snake, sage-and-gold banded felt body, a flicking cut-paper tongue, gentle menace.
4. elite_gecko — plump garden gecko-lizard, mottled sage-green felt, curled tail, big friendly bead eyes, strong warm gold rim; the biggest prize.

---

## Sheet 3 — Hero plants + pots (cosmetics, doubles as shop thumbnails)
- **File:** `picnic_plants_pots.png`
- **Grid:** 5 cols × 4 rows (20 cells, 18 used, last 2 magenta-empty)
- **Cell:** 512 × 512
- **Master:** 2560 × 2048
- **Knockout:** Flat magenta #FF00FF background in every cell for knockout. No magenta inside the artwork.

Plants — draw the bloom + stem + two leaves ONLY, upright, no pot (the pot is a separate composited sprite below the stem):

1. plant_snapdragon — rose-pink snapdragon bloom on a sage stem, two felt leaves, gold center; the starter hero.
2. plant_sunflower — golden sunflower, brown felt seed-center, bright green leaves.
3. plant_wildrose — crimson wild-rose bloom, gold stamen dots, deep-green stem.
4. plant_lavender — violet lavender flower-spike, silvery sage leaves.
5. plant_cactus_bloom — chartreuse cactus flower atop a plump green paddle stem.
6. plant_firebush — orange-red firebush bloom, olive-gold foliage.
7. plant_frostpetal — icy pale-blue bloom, teal frosted leaves, cream center.
8. plant_golden_bloom — radiant antique-gold bloom, cream heart, brass-green leaves.

Pots — draw the vessel with a soil top, upright, symmetrical, no plant:

9. pot_terracotta — classic warm terracotta clay pot with a stitched rim; the starter.
10. pot_sage_clay — muted sage-green glazed clay pot.
11. pot_ocean_glaze — teal-blue glossy glazed ceramic pot.
12. pot_rose_quartz — dusty blush-rose ceramic pot.
13. pot_midnight_ceramic — deep indigo-violet ceramic pot with a faint sheen.
14. pot_mossy_stone — grey stone pot with soft felt moss patches.
15. pot_ember_kiln — burnt-orange kiln-fired pot.
16. pot_frost_porcelain — icy pale-blue porcelain pot.
17. pot_gilded — antique-gold gilded pot with an ornate rim.
18. pot_obsidian — near-black glassy obsidian pot with a cool sheen.

---

## Sheet 4 — Pickups + UI icons
- **File:** `picnic_icons.png`
- **Grid:** 4 cols × 4 rows (16 cells, 15 used, last cell magenta-empty)
- **Cell:** 256 × 256
- **Master:** 1024 × 1024
- **Knockout:** Flat magenta #FF00FF background in every cell for knockout. No magenta inside the artwork.

Power-up drops (float down in Power Bloom mode; also used as the on-screen power-timer HUD icons):

1. drop_nectar_honey — glossy antique-gold honey droplet / honeypot token (+500 score).
2. drop_spread_seed — a tight cluster of three acorn-seeds (spread shot).
3. drop_rapid_pepper — a little glossy red chili pepper (rapid fire).
4. drop_pierce_thorn — a sharp green cactus-thorn spine (pierce shot).
5. drop_shield_petal — a pale-blue blossom curled into a shield (shield).
6. drop_bloom_bomb — a red-cap cream-spotted toadstool (bloom bomb).
7. drop_blossom — a rose hibiscus blossom token (+300 score).
8. drop_homing_pollen — a gold target-ring with a pollen mote center (seeker pollen).
9. drop_time_slow — a small warm-wood sand hourglass (time slow).
10. drop_nullify_burst — a pale-blue faceted diamond starburst (nullify / clear bullets).

UI counters:

11. ui_life_sprout — a tiny potted tulip sprout, clean silhouette (life-counter pip).
12. ui_flag_grove — a small stylized tree (stage flag = 10).
13. ui_flag_sunflower — a small sunflower (stage flag = 5).
14. ui_flag_daisy — a small daisy (stage flag = 1).
15. ui_captured_bloom — a single tulip bloom shown lifted/floating, faintly glowing (the captured/rescued plant carried by the queen).

---

## Sheet 5 — Scenes / full-bleed backgrounds (cosmetic play-field skins)
- **File:** `picnic_scenes.png`
- **Grid:** 2 cols × 4 rows (8 cells)
- **Cell:** 1620 × 2880 (portrait; play-field is ~9:16)
- **Master:** 3240 × 11520 — NOTE: if the generator can't do a master this tall, produce each background as its own 1620 × 2880 file instead.
- **Knockout:** full-bleed art, no magenta inside a cell; magenta #FF00FF only in the gutters between cells.
- **Safe zones:** keep the top ~64px clear of busy detail (score HUD sits there) and keep the bottom ~90px readable behind a grass strip + the potted hero. Each cut background is downscaled to ≤1600px tall and must compress under 150KB (mostly dark scenes, so this is easy).

1. scene_meadow — midnight meadow: near-black-green sky melting down into sage, a checkered red-and-cream picnic-blanket ground strip, distant firefly bokeh; the starter.
2. scene_dusk_garden — twilight purple garden, dusky rose horizon glow, silhouetted felt flowers along the base.
3. scene_seaside — deep teal seaside night, soft moonlit water shimmer, reed and cattail silhouettes.
4. scene_sunset_picnic — warm sunset picnic, amber-to-rust sky, long gold light, a blanket foreground.
5. scene_sakura_night — plum-black night with drifting cut-paper sakura petals and a soft rose glow.
6. scene_emerald_grove — deep emerald grove, layered felt fern silhouettes, floating green firefly motes.
7. scene_starfield — deep near-black starfield night, cool pale-blue star bokeh, a faint low garden horizon.
8. scene_ashen_field — muted grey ashen field, soft cream fog, bare stitched grey stalks.

---

## WIRE NOTES

- **Enemies (Sheet 1) + boss (Sheet 2):** the render loop draws bugs with `cx.fillText(e.emojiOverride || TYPES[e.type].emoji, …)` (~line 1266), rotated by `e.ang`. Map each `TYPES` key → sprite: `fly→enemy_fly, ant→enemy_ant, mosq→enemy_mosquito, beetle→enemy_beetle, ladybug→enemy_ladybug, wasp→enemy_wasp, butterfly→enemy_butterfly, cricket→enemy_cricket, spider→enemy_spider, puffer→enemy_puffer, sporeling→enemy_sporeling, boss→boss_queen_bee`. The Classic transform trio sets `e.emojiOverride` (line 1032, `TRANSFORMS` = 🦂/🐍/🦎) → `elite_scorpion / elite_serpent / elite_gecko`. Sprites are head-up; keep the existing rotation so they face the player at rest and their travel on dives. Draw at each type's `r` diameter (boss uses the code's ×1.1 scale). The armored-ladybug / enraged-boss ring stroke (line 1268) can stay layered on top.
- **Hero plant (Sheet 3):** `drawPlant()` (line 1183) draws a pot rect (`potColors()` from `SAVE.cosmetics.pot`) then the flower vector per fighter head (`curPlant()` from `SAVE.cosmetics.plant`). Swap to: draw `pot_<pot.k>` once at the base, then `plant_<plant.k>` once per entry in the `heads` array (1/2/3 stacked fighters). Keep the shield-ring overlay (line 1201). The ghost/rescue plant `drawGhostPlant` 🌷 (line 1208) → `ui_captured_bloom`.
- **Pickups + UI (Sheet 4):** drop emoji map in render (line 1240) keyed by `d.k` → `drop_*`; the Power-Bloom HUD timers (lines 1330-1334) reuse the same `drop_*` icons. Lives 🌷 (line 1313) → `ui_life_sprout`; stage flags 🌳/🌻/🌼 (lines 1318-1320) → `ui_flag_grove / ui_flag_sunflower / ui_flag_daisy`.
- **Scenes (Sheet 5):** `applyCosmetics()` (line 1182) sets the stage background as a CSS `linear-gradient` from `SAVE.cosmetics.bg`. Point it at `scene_<bg.k>` instead (or draw it as the bottom canvas layer). The procedural fireflies + grass strip can stay layered on top, or be baked into the art and removed from `render()`.
- **SKIP — shots:** `curShot()` bullets (lines 1281-1287) are 2-3px tinted rects/trails; they read fine and are too small to benefit from sprites. Leave procedural, keep the cosmetic color tint. (Shot cosmetics still work as color-only in the shop.)
- **Recommended hook + folder:** add a drop-in `window.PP_ART` map (key → preloaded `Image`) mirroring Nectar Drop's "art replaces procedural draws when present" pattern — draw the sprite when its Image is loaded, fall back to the current emoji/vector when absent. Deploy PNGs to `satellites/picnic-panic/assets/` with subfolders `enemies/`, `plants/`, `icons/`, `scenes/`. Cache-bust with `?v=<version>` per the Hostinger image-resizer note (atlases/large art may need the `.bin` fetch→blob trick if any single file exceeds the host's 1600px resize threshold — the ≤1600px cut backgrounds stay under it).

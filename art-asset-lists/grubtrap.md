# Grubtrap — Sprite-Sheet Asset List

A cozy grid puzzle-action game (Rodent's Revenge remake). You are a field mouse shoving stone planters to pen garden grubs into corners until they curl into seedballs. The board is currently drawn entirely with Canvas2D primitives (arcs/rects) — no image assets exist. This list skins the whole board and menu with handmade paper-craft art.

---

## STYLE (shared — prepend to every sheet prompt)

Bright, colorful, fun handmade paper-craft game art. Cozy midnight-garden world with deep near-black green shadows, saturated sage greens, antique gold rewards, cream highlights, rose accent for the mouse and peril flashes. Tactile fiber-art materials: cut paper, wool felt, macrame cord, beads, sequins, glitter, scrapbook layers, stitched edges, soft handmade texture. Clean readable silhouettes first — this is a top-down tile board, so every tile and critter must read instantly at thumbnail size. Cute botanical critter energy: a plush felt field mouse, chubby cabbage-looper garden grubs, felt-and-cord stone planters, a leafy hedge border, gold seedball buttons. Cozy-menacing grubs, never scary or grim. Soft top-down key light with warm gold rim-light. Chunky arcade readability at small sizes. No photorealism, no 3D render, no text labels, no captions, no borders, no UI words unless a logo cell says exact logo text. Keep detail bold and simple enough that each cropped asset compresses well. Palette base #0e140d, sage #7ab356, gold #c8a84b, cream #e8dcc8, rose #e58fa0.

---

## Sheet 1 — Board tiles, critters, fx (cutout sprites)

- **File name:** `grubtrap_sprites.png`
- **Grid:** 4 cols x 4 rows (16 cells)
- **Cell size:** 512 x 512 px
- **Master size:** 2048 x 2048 px
- **Knockout rule:** Flat magenta #FF00FF background in every cell for knockout. No magenta inside the artwork.
- **Framing note:** Tiles (cells 1-8) are square top-down floor/block tiles that must butt-tile edge-to-edge with no gap — art fills the full cell. Critters and fx (cells 9-16) are centered objects sitting on transparent/magenta with a little breathing room, top-down view, subtle contact shadow baked soft (the engine also draws its own drop shadow, so keep the baked one faint).

1. `tile_soil` — top-down square of dark garden bed soil, near-black green #0e140d with faint hand-torn paper grain, a couple of tiny embedded seeds; seamless butt-tiling edges.
2. `tile_soil_pebbles` — soil tile variant with a scatter of small cream pebbles and one stitched twig, to break up repetition; same base tone, seamless edges.
3. `tile_planter` — the pushable block: a chunky top-down felt-and-cord stone planter, bark-brown rim, macrame weave sides, a single sage sprout poking from the center; fills the cell, reads as solid and shoveable.
4. `tile_planter_bloom` — planter variant with a tiny rose-and-gold felt flower in the pot instead of a sprout, for board variety; same footprint and rim so it tiles with cell 3.
5. `tile_hedge` — top-down leafy hedge border wall tile, layered sage and deep-green cut-paper foliage with stitched edge, dense and impassable feel; seamless butt-tiling.
6. `tile_hedge_corner` — hedge tile shaped as an outer corner of the bed, two leafy edges meeting, so the border frame reads as a woven garden bed rim; matches cell 5 foliage.
7. `tile_seedball` — the penned-grub tile: a plump antique-gold felt seedball nestled in soil, coiled seam like a curled-up grub, a cream sequin glint top-left; solid button look, fills cell.
8. `tile_seedball_pop` — seedball variant with a brighter gold rim-light and a small sparkle, for the freshly-trapped pop frame; same silhouette as cell 7.
9. `mouse_hero` — top-down plush felt field mouse hero: round warm-grey wool body, two round ears with rose-pink felt inners, tiny black bead eyes, rose stitched nose, faint cream whiskers; cute, alert, centered.
10. `mouse_caught` — the same mouse dazed/squished for the caught flash: eyes as little X stitches or squeezed shut, ears flattened, a couple of rose alarm sparks, still cozy not gory.
11. `grub_green` — top-down chubby garden grub: 3-4 segment sage-and-lime felt cabbage-looper body with stitched segment seams, two black bead eyes at the head end, harmless-cute menace.
12. `grub_fast` — a leaner, warmer-tinted speed grub (sage shading toward gold-green), slightly spiky felt tufts and motion-lean, to distinguish the quicker grubs on later grounds; same head/eye read as cell 11.
13. `life_pip` — small HUD life icon: a tidy cream felt whisker-tuft with a single bark-brown bead, or a tiny mouse-face pip, on transparent; must read at ~20px.
14. `fx_trap_burst` — a radial pop of antique-gold sequins, glitter flecks and one cream sparkle, for the moment a grub is penned; centered, transparent around it.
15. `fx_caught_alarm` — a radial burst of rose and warm-orange felt shards and sparks, for when a grub reaches the mouse; alarm energy, still handmade-soft.
16. `fx_clear_leaves` — a confetti spray of small sage and gold cut-paper leaves and petals, for the ground-cleared celebration; airy, scattered, transparent around it.

---

## Sheet 2 — Menu background (full-bleed)

- **File name:** `grubtrap_menu_bg.png`
- **Grid:** 1 col x 1 row (1 cell)
- **Cell size:** 1620 x 2880 px (portrait)
- **Master size:** 1620 x 2880 px
- **Knockout rule:** Full-bleed art, no magenta inside a cell; magenta #FF00FF only in gutters between cells (single cell here, so no magenta anywhere).
- **Ship note:** Export/downscale the final to <=1600px wide (e.g. 1600 x 2844) or serve as a fetch->blob asset — the lucidwinds.com host resizes images wider than 1600px. Keep the final under 150KB.

1. `menu_bg` — a cozy midnight-garden vignette used behind the title, how-to, settings and game-over screens: a top-down-ish raised garden bed at night, dark near-black green ground, a soft cluster of felt hedges, a stone planter or two, one plush field mouse peeking from a corner, a scatter of gold seedballs and a couple of sage grubs curled at the edges, warm gold rim-light and a soft radial glow toward the top-center where the wordmark sits. Leave the central vertical band calm and uncluttered so cream/sage title text stays readable. No text in the art.

---

## WIRE NOTES

No ART/Image hook exists today — the game draws everything procedurally in `render()`/`drawHero()`/`drawGrub()`/`drawWhisker()`/`burst()`. Wiring is a follow-up: add a small `ART` image map and swap draws when loaded.

- `tile_soil` / `tile_soil_pebbles` -> render() cell loop, `v===0` empty soil (currently nothing drawn over the `#171008` field fill, ~line 397).
- `tile_planter` / `tile_planter_bloom` -> `v===1` planter block draw (~lines 398-403).
- `tile_hedge` / `tile_hedge_corner` -> `v===2` wall/border draw (~lines 404-407); corner tile replaces the brown `strokeRect` frame (~line 416).
- `tile_seedball` / `tile_seedball_pop` -> `v===3` seedball draw (~lines 408-413); `_pop` for the just-trapped flash in `checkTraps()`.
- `mouse_hero` / `mouse_caught` -> `drawHero()` (~lines 440-453); `_caught` shown during `G.invuln>0` flash after `heroCaught()`.
- `grub_green` / `grub_fast` -> `drawGrub()` (~lines 454-467); pick `_fast` when `grubInterval()` is short (higher levels).
- `life_pip` -> `drawWhisker()` HUD life indicator (~lines 437-439, 388).
- `fx_trap_burst` -> gold `burst()` in `checkTraps()`; `fx_caught_alarm` -> orange `burst()` in `heroCaught()`; `fx_clear_leaves` -> green `burst()` in `levelClear()`.
- `menu_bg` -> CSS `.screen` background behind `#s-title` / `#s-how` / `#s-set` / `#s-over` (currently a flat gradient, ~line 33).

**Recommended folder:** `satellites/grubtrap/assets/` (create it). Load with a version query per the Hostinger cache/resizer caveat, e.g. `assets/grubtrap_sprites.png?v=<build>`, and cut the 4x4 sheet into 512px cells at load. The CSS wordmark "Grubtrap" can stay as-is (on-brand sage text) — no separate logo sheet needed.

# PETALVEX — Sprite-Sheet Asset List

Botanical **TetraVex**: slot square leaf-tiles into an N×N garden bed so every touching edge shares a number. Each tile = 4 triangular wedges, each a number 0–9 that is **colour-coded by value** and drawn on top. 5 beds (Sprout 3×3 · Bud 4×4 · Bloom 5×5 · Thicket 6×6 · Daily 4×4). Currently 100% canvas/emoji, **zero image assets**.

**HARD RULE — the number is the ground truth.** The game stamps the value number on top of every wedge for colour-blind safety. All wedge art is the **texture underneath**; leave the wedge face uncluttered so a bold cream number reads over it. Keep the 10 value hues distinct (matching, not fighting, the code palette).

Generate **one sheet at a time**. Order: Sheet 1 (bg) → Sheet 4 (logo/win) → Sheet 3 (badges/fx) → Sheet 2 (wedges). Hand me any batch and I wire it.

---

## STYLE (paste on top of every sheet)

Bright, colorful, fun handmade paper-craft game art. Cozy midnight-garden world of numbered leaf-tiles and planter beds, with deep near-black green shadows, saturated sage greens, antique gold rewards, cream highlights, rose accent for solved seams and bloom peaks. Tactile fiber-art materials: cut paper, wool felt, macrame cord, beads, sequins, glitter, scrapbook layers, stitched edges, soft handmade texture. Clean readable silhouettes first. Cute botanical critter energy, cozy-menacing bosses, never scary or grim. Soft top-down key light with warm gold rim-light. Chunky arcade readability at small sizes. No photorealism, no 3D render, no text labels, no captions, no borders, no UI words unless a logo cell says exact logo text. Keep detail bold and simple enough that each cropped asset compresses well. Palette base #0e140d, sage #7ab356, gold #c8a84b, cream #e8dcc8, rose #e58fa0.

---

## Sheet 1 — Backgrounds
- **File:** `petalvex_bg_sheet.png`
- **Grid:** 1 col × 2 rows
- **Cell size:** 1620 × 2880 px (portrait), final delivered ≤ 1600px tall
- **Master size:** 1620 × 5760 px
- **Knockout:** full-bleed art, no magenta inside a cell; magenta #FF00FF only in the gutter between the two cells.

1. `bg_bed` — Full-screen gameplay backdrop: a dark cut-paper **planter box / raised garden bed** viewed top-down, empty soil in warm near-black browns and deep greens, a soft bark-cord frame hint around the edges, faint felt-fiber and stitched texture. Very calm and low-contrast so bright number-tiles pop on top. Nothing in the dead-center where the grid sits.
2. `bg_menu` — Title / menu backdrop: same midnight-garden mood, a little more lush — a few paper-cut leaf sprigs and gold pollen motes drifting in from the corners, a soft radial glow up top for the wordmark. Center-left kept quiet for stacked buttons. Cozy storybook, no text.

---

## Sheet 2 — Tile value wedges
- **File:** `petalvex_wedge_sheet.png`
- **Grid:** 4 cols × 3 rows
- **Cell size:** 512 × 512 px
- **Master size:** 2048 × 1536 px
- **Knockout:** Flat magenta #FF00FF background in every cell for knockout. No magenta inside the artwork.
- **Shape note:** each wedge is a **triangle with its base along the TOP edge of the cell and its apex at the cell center** (a top-pointing-inward wedge). Code clips to this triangle and rotates the image 90°/180°/270° to skin all four sides of a tile. Leave the triangle face clean-centered for the stamped number; carry the color to the base edge.

1. `wedge_0` — value-0 wedge, cocoa/bark-brown felt petal panel (matches code hue #7c5a34), soft cream seam at the base edge.
2. `wedge_1` — value-1 wedge, sage-green leaf panel (#7ab356), gentle vein emboss.
3. `wedge_2` — value-2 wedge, antique-gold panel (#c8a84b), warm woven texture.
4. `wedge_3` — value-3 wedge, rose-pink petal panel (#e58fa0), soft felt.
5. `wedge_4` — value-4 wedge, teal/sky panel (#5fb0c6), cut-paper sheen.
6. `wedge_5` — value-5 wedge, lavender-violet panel (#a878cf), soft glitter fleck.
7. `wedge_6` — value-6 wedge, pumpkin-copper panel (#d4842a), autumn felt.
8. `wedge_7` — value-7 wedge, pale linen/stone panel (#d5c9b0), quiet cream weave.
9. `wedge_8` — value-8 wedge, deep berry-red panel (#d24b4b), rich wool.
10. `wedge_9` — value-9 wedge, fresh lime panel (#8fd06a), bright new-leaf felt.
11. `wedge_plain` — neutral dark mossy-green wedge (#26301c) for the "colour tint off" accessibility mode; plain textured felt, number reads in cream.
12. `tile_frame` — a full-square **stitched cream border overlay** (thin macrame-cord edge + tiny corner beads, transparent center) laid over an assembled tile; sells the cut-and-sewn tile look regardless of wedge colors. Center is knockout magenta / empty.

---

## Sheet 3 — Mode badges + win FX
- **File:** `petalvex_badge_fx_sheet.png`
- **Grid:** 4 cols × 2 rows
- **Cell size:** 256 × 256 px
- **Master size:** 1024 × 512 px
- **Knockout:** Flat magenta #FF00FF background in every cell for knockout. No magenta inside the artwork.

1. `mode_sprout` — Sprout badge (3×3 bed): a single tiny paper-cut seedling with two leaves poking from felt soil, sage + cream.
2. `mode_bud` — Bud badge (4×4 bed): a young leafy shoot / small stem with three cut-paper leaves.
3. `mode_bloom` — Bloom badge (5×5 bed): a closed rose-pink flower bud on a sage stem, gold-tipped.
4. `mode_thicket` — Thicket badge (6×6 expert bed): a dense little bramble of overlapping felt leaves, richer and darker, a hint of gold thorns.
5. `mode_daily` — Daily Bed badge: a small calendar-leaf — a paper leaf with a soft gold sun rising behind it, one bead marking "today."
6. `fx_petal_a` — a single soft falling rose petal (win-burst mote), felt with a cream edge.
7. `fx_petal_b` — a single sage leaf flake (win-burst mote), slightly larger, gold rim.
8. `fx_pollen` — a small round gold pollen/sequin mote with a soft glow (win-burst sparkle).

---

## Sheet 4 — Logo + win hero
- **File:** `petalvex_logo_win_sheet.png`
- **Grid:** 2 cols × 1 row
- **Cell size:** 768 × 768 px
- **Master size:** 1536 × 768 px
- **Knockout:** Flat magenta #FF00FF background in every cell for knockout. No magenta inside the artwork.

1. `logo_petalvex` — the wordmark **PETALVEX** (exact text, one line) in chunky sage-and-gold storybook cut-paper lettering, cream highlight, a small botanical **diamond/leaf mark** (matching the app's diamond favicon) tucked above or beside the word. Transparent/knockout around it.
2. `win_bloom` — the win-screen hero (replaces the 🌼 emoji): a single joyful **flower in full bloom** bursting open — layered rose-pink and gold felt petals, sage leaves, a few gold pollen sequins lifting off. Cozy triumphant, centered, knockout background.

---

**WIRE NOTES**
- `bg_bed` → draw as an `Image` at the top of `render()` (replaces the `#101610→#0a0d09` linear-gradient fill, ~line 385) scaled to VW×VH; `bg_menu` → CSS `background-image` on the `.screen` gradient (title/modes/how/settings, ~line 33).
- Value wedges → in `drawTile()` (~line 316), for each of the 4 quads `save→clip(triangle)→rotate→drawImage(WEDGE[tile.edges[q]])→restore`, then keep the existing number pass (`VINK`, ~line 340) drawing ON TOP. `wedge_plain` used when `SET.color===false`. `tile_frame` drawn last over the tile in place of / over the outer `strokeRect` (~line 346). Numbers must always render after art.
- `mode_*` badges → swap the emoji `m.ico` in `buildModeList()` (~line 623) for `<img>`; keys map to `MODES` entries s3=Sprout, s4=Bud, s5=Bloom, s6=Thicket, dly=Daily.
- `logo_petalvex` → replace the `.title-word` text node in `#s-title` (~line 92) with an `<img>`.
- `win_bloom` → replace the `🌼` node in `#s-win` (~line 142) with an `<img>`.
- `fx_petal_a/b`, `fx_pollen` → swap the `ctx.arc` circle draw in `render()` particle loop (~line 425) / `burst()` for rotated `drawImage` of these motes.
- Add a small `ART`/`IMG` preload map + `onerror` fallback to the current canvas/emoji draws (fleet pattern) so missing files degrade gracefully.
- **Recommended folders:** `satellites/petalvex/assets/bg/`, `assets/tiles/`, `assets/ui/`, `assets/fx/`. Cache-bust with `?v=` on deploy (Hostinger image-resizer + ignores no-cache).

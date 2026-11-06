# ASTRA ROUND 2, MAPPED ONTO THE BRIEF AND THE CODE (5 Nov 2026)

Pack: `/workspaces/keepsies-astra-round2/` (159 files, 9.97 MB, outside git). Brief: `docs/briefs/keepsies/round2/ASTRA-KEEPSIES-ROUND2-NOV05.txt`. Code: `satellites/keepsies/` on `add-sproing-jumper`. Nothing was imported or edited and no browser was started: every visual claim below is a number (PIL on the files, or a pure maths replay of the game's own modules). Scratch scripts: `/tmp/claude-1000/-workspaces-lucid-winds/c614e34d-7999-40c8-ad65-9b1cec65bb8b/scratchpad/kp/scripts/` (sizes.py, probe.py, optics.mjs, placesim.mjs).

## The short of it

1. **She never saw the game.** WebGL failed in her browser and the materials zip on Drive asked for a sign in, so she played nothing and had no 5 Nov captures (NOTES.md, "Source limitation"). Every A7 and C preview is a schematic overlay on 4 Nov captures. The anchors are real numbers in each file's pixels. The previews are not proof of fit.
2. **Nothing in the pack answers Stephen's verdict.** There is no new reticle or grab pad, no camera or view work and no flick work. The brief was written before his verdict and did not ask for any of it. Six things bear on the shot: B1 (aim dash and cap), C6 (calibration target), B8 (chalk stroke), B9 (horizon strip), A5 (tray) and A6 (reach circle). All are usable. None fixes the feel. That is code.
3. **One export defect.** `chalk_stroke.png` has none of the three wear breaks that its SVG master draws: alpha is a flat 212 in rows 12 to 51 of every column, though the grain specks did survive. Use the 19.8 KB SVG, or rasterise it in a browser. Separately, the dashes on the redrawn lag line and cross marker are closed up by their own round caps, so both come out as solid lines.
4. **Weight.** `horizon_strip.png` is 4096x512 and 1.59 MB. The three open pouches are 451 to 536 KB each as 640 px PNGs. As WebP the horizon is 122 KB at 2048x256 and the pouches are 18 to 24 KB at 320. Several deliverables are over the plan's 1600 px line (law 7) or are developer material only (section 4).
5. **Found on the way (code, not the pack): a likely cause of "it freaks out and skips around".** The shooter place drag maps the finger's absolute x onto the ring angle, offset by half a turn, against a camera that is chasing the shooter. A pure maths replay shows the shooter flipping across the ring every frame while the finger is held still (section 3.2). This phase covers the first shot of every turn, and in it one thumb cannot orbit the aim at all.

My reading of "the circle that you have to hold and flick on" is the brace pad around the shooter: the grab disc in `knuckle.js` and the reticle drawn on it. It is the only circle the thumb holds.

## 1. The files by section (bytes as on disk; svg+png pairs on one row)

### assets/a_statues (42 files, 3964.9 KB)

| file | formats | pixels | bytes |
|---|---|---|---|
| arch_meshy_reference | png | 1024x1024 | 966874 |
| column_meshy_reference | png | 1024x1024 | 807107 |
| footprint_arch_allowed | png+svg | 256x256 | 10028 / 299 |
| footprint_arch_blocked | png+svg | 256x256 | 9010 / 334 |
| footprint_column_allowed | png+svg | 256x256 | 10028 / 299 |
| footprint_column_blocked | png+svg | 256x256 | 9010 / 334 |
| footprint_loaf_allowed | png+svg | 256x256 | 10028 / 299 |
| footprint_loaf_blocked | png+svg | 256x256 | 9010 / 334 |
| footprint_orb_allowed | png+svg | 256x256 | 10028 / 299 |
| footprint_orb_blocked | png+svg | 256x256 | 9010 / 334 |
| loaf_meshy_reference | png | 1024x1024 | 1060543 |
| move_origin | png+svg | 128x128 | 774 / 328 |
| move_reach | png+svg | 1024x1024 | 40995 / 351 |
| not_here_chip | png+svg | 224x80 | 2720 / 290 |
| orb_meshy_reference | png | 1024x1024 | 825853 |
| owner_dusty | svg | svg 24x24 | 223 |
| owner_marks_board | jpg | 1200x700 | 87618 |
| owner_you | svg | svg 24x24 | 216 |
| statues_design_board | jpg | 1600x900 | 171717 |
| tile_arch | svg | svg 24x24 | 231 |
| tile_column | svg | svg 24x24 | 233 |
| tile_dragging | png+svg | 112x112 | 2723 / 292 |
| tile_idle | png+svg | 112x112 | 2626 / 292 |
| tile_loaf | svg | svg 24x24 | 245 |
| tile_orb | svg | svg 24x24 | 251 |
| tile_pressed | png+svg | 112x112 | 2596 / 292 |
| tray | png+svg | 750x380 | 5674 / 294 |

### assets/b_fixes (55 files, 3148.1 KB)

| file | formats | pixels | bytes |
|---|---|---|---|
| aim_cap | svg | svg 24x24 | 222 |
| aim_dash | svg | svg 24x24 | 216 |
| chalk_stroke | png+svg | 2048x64 | 2422 / 19827 |
| cross_marker | png+svg | 256x256 | 1386 / 250 |
| dark_plate_contact_lift | png+svg | 256x256 | 19318 / 379 |
| heirloom_cloth | png+svg | 900x1200 | 29592 / 880 |
| horizon_strip | png | 4096x512 | 1586804 |
| icon_common | svg | svg 24x24 | 227 |
| icon_epic | svg | svg 24x24 | 251 |
| icon_grail | svg | svg 24x24 | 251 |
| icon_rare | svg | svg 24x24 | 231 |
| icon_uncommon | svg | svg 24x24 | 292 |
| lag_line | png+svg | 1024x64 | 509 / 239 |
| level_up_strip | png+svg | 640x120 | 3229 / 294 |
| player_chip | png+svg | 352x112 | 2951 / 293 |
| pot_cloth | png+svg | 670x480 | 8332 / 593 |
| pouch_collector_open | png | 640x640 | 476637 |
| pouch_grail_open | png | 640x640 | 451197 |
| pouch_standard_open | png | 640x640 | 536055 |
| shadow_dark | png+svg | 256x256 | 7380 / 397 |
| shadow_dirt | png+svg | 256x256 | 9897 / 381 |
| share_marble | png+svg | 1080x1080 | 7337 / 399 |
| share_match | png+svg | 1080x1920 | 14512 / 387 |
| tier_common_pill | png+svg | 560x96 | 3370 / 290 |
| tier_common_tile | png+svg | 192x192 | 3427 / 294 |
| tier_epic_pill | png+svg | 560x96 | 3742 / 447 |
| tier_epic_tile | png+svg | 192x192 | 3795 / 453 |
| tier_grail_pill | png+svg | 560x96 | 3704 / 447 |
| tier_grail_tile | png+svg | 192x192 | 3753 / 453 |
| tier_rare_pill | png+svg | 560x96 | 3739 / 447 |
| tier_rare_tile | png+svg | 192x192 | 3793 / 453 |
| tier_uncommon_pill | png+svg | 560x96 | 3397 / 290 |
| tier_uncommon_tile | png+svg | 192x192 | 3465 / 294 |

### assets/c_screens (25 files, 372.8 KB)

| file | formats | pixels | bytes |
|---|---|---|---|
| button_primary | png+svg | 590x104 | 2854 / 292 |
| button_secondary | png+svg | 590x104 | 3043 / 292 |
| calibration_hint | png+svg | 640x108 | 3109 / 293 |
| calibration_target | png+svg | 512x512 | 25264 / 405 |
| case_12 | png+svg | 670x1040 | 42458 / 3118 |
| case_6 | png+svg | 670x760 | 24329 / 1704 |
| chores_board | png+svg | 670x920 | 11644 / 1371 |
| clay_bowl | png+svg | 670x540 | 27066 / 573 |
| clay_info_panel | png+svg | 670x366 | 4747 / 294 |
| level_up_panel | png+svg | 670x850 | 14335 / 505 |
| screen_scrim | png+svg | 750x1334 | 5945 / 418 |
| title_lot | webp | 750x1334 | 200286 |
| wordmark_keepsies | png+svg | 600x140 | 6542 / 883 |

### assets/d_icons (15 files, 4.1 KB)

| file | formats | pixels | bytes |
|---|---|---|---|
| arch | svg | svg 24x24 | 231 |
| column | svg | svg 24x24 | 233 |
| confirm | svg | svg 24x24 | 222 |
| lay_bunch | svg | svg 24x24 | 347 |
| lay_cross | svg | svg 24x24 | 359 |
| lay_ring | svg | svg 24x24 | 389 |
| lay_x | svg | svg 24x24 | 357 |
| level_up | svg | svg 24x24 | 244 |
| loaf | svg | svg 24x24 | 245 |
| move_statue | svg | svg 24x24 | 287 |
| orb | svg | svg 24x24 | 251 |
| provenance | svg | svg 24x24 | 251 |
| share | svg | svg 24x24 | 243 |
| statues | svg | svg 24x24 | 278 |
| undo | svg | svg 24x24 | 272 |

### assets/e_store (2 files, 13.5 KB)

| file | formats | pixels | bytes |
|---|---|---|---|
| statues_store_frame | png+svg | 1080x1920 | 13210 / 567 |

### previews (15 files, 2113.8 KB)

| file | formats | pixels | bytes |
|---|---|---|---|
| a_contact | jpg | 1600x1105 | 205466 |
| a_move | jpg | 1000x790 | 102669 |
| a_placement | jpg | 1000x790 | 102440 |
| a_playing_phone | jpg | 950x790 | 105453 |
| b_contact | jpg | 1600x1310 | 208144 |
| c1_title | jpg | 1200x820 | 134887 |
| c2_level_up | jpg | 1200x820 | 111272 |
| c3_chores | jpg | 1200x820 | 127213 |
| c4_clay_pool | jpg | 1200x820 | 111939 |
| c5_case_12 | jpg | 1200x820 | 132419 |
| c5_case_6 | jpg | 1200x820 | 123928 |
| c6_calibration | jpg | 1200x820 | 142875 |
| c_contact | jpg | 1600x1480 | 373396 |
| d_contact | jpg | 1200x730 | 74062 |
| e_contact | jpg | 1080x1260 | 108379 |

### . (5 files, 122.0 KB)

| file | formats | pixels | bytes |
|---|---|---|---|
| ASSESSMENT-R2 | md |  | 4787 |
| NOTES | md |  | 10154 |
| STYLE-GUIDE-R2 | md |  | 4927 |
| anchors | json |  | 62015 |
| manifest | json |  | 43038 |

Notes on the files:
- **A has fewer distinct drawings than file names.** The eight footprint pairs (svg and png) are two drawings, each copied four times (md5 identical). Allowed is a whole circle with a tick. Blocked is a dashed circle (30/15) with a cross. Both have r 108 in a 256 canvas with a 7 px stroke, and anchors.json gives each copy its own `world_radius_mm` (column 20, loaf 52, arch 38, orb 22). `tile_column/loaf/arch/orb.svg` are byte identical to `d_icons/column/loaf/arch/orb.svg`. The tile icons come as SVG only.
- **B's five tier marks** (`icon_common` and the rest) are byte identical to the v1 `f_icons` marks, which are already in the sprite as `i-common` and so on.
- **Every SVG icon meets the round 1 grammar**: 24 unit viewBox, stroke 1.8, currentColor, no fixed colour. That covers the 15 in D, the two owner marks, aim_dash and aim_cap. None of the new names clashes with the 49 ids already in `assets/ui/icons.svg`.
- **The plates and decals use fixed colours**: chalk `#eadfc9` (v1 was `#e8dcc8`), frame `#121710`, edge `#74684f`, brass `#c6a34b`, Not here `#2d211c` with `#d69877`.
- **Transparency is where the anchors say.** The share windows and the store capture window measure alpha 0, and their plates measure 255. The pouch interiors are opaque and dark (alpha 251 or more, median luminance 11 to 13), so the live render goes on top with no lip mask. `screen_scrim.png` and `title_lot.webp` are opaque RGB on purpose.
- **manifest.json's `size` is pixel [w, h], not bytes.** The brief asked for size. Bytes are in the tables above.

## 2. Each brief item: what came, and the code that would consume it

**The import script.** `tools/astra_in.mjs` only knows the v1 pack: COPY lists v1 paths, and the sprite is built from v1 `f_icons/icon_*.svg` plus the two v1 wordmarks. Round 2 needs a second pass that runs after v1, which is still on the box at `/workspaces/keepsies-astra-v1/pack`, because the sprite is rebuilt from v1 on every run. That pass would:
- add `d_icons/*.svg` (no `icon_` prefix) and `a_statues/owner_*.svg` to the one sprite as `i-<name>`;
- copy the runtime round 2 files into `assets/env` and `assets/ui`, converting the heavy PNGs (section 4);
- copy the store frame into `assets/store/`.

Every runtime URL still goes through `art()` (`src/render/art.js`).

### A. The statues

- **A1 design board: delivered.** `statues_design_board.jpg` (1600x900). This is developer reference and never ships. Her orthographic dimensions match `src/core/statues.js` SHAPES to the millimetre:
  - column: base r18 h8, shaft r12 from y8 to y60;
  - loaf: 90x34x52;
  - arch: legs 16x48x24 at plus and minus 28, lintel 72x12x24 at y48;
  - orb: plinth r16 h10, ball r22 at y32.
- **A2 expansion board: missing, on purpose.** She recommends the four code shapes and made A2 conditional on Decision 1. Her mapping, from ASSESSMENT-R2.md:
  - deflect: Boba Buddy, straw and appendages removed;
  - block: Void Loaf, flattened to the box;
  - pass under: Book Wyrm, rebuilt as two book piers and a spine (the existing sculpt is not a valid arch);
  - scatter: Moon Moo, no ears or horns.
- **A3 owner marks: delivered with a change.**
  - One vertical chalk bar means you. Two bars mean Dusty or any opponent. Bosses do not get their own tally marks; the HUD name chip says who it is.
  - The bars go on both the top face and the front face. `anchors._owner_decal_placements_mm` gives each centre and box in mm. I checked every centre against the colliders and each lies on its surface; for example, the orb's front point z of minus 21.63 equals the square root of 22² minus 4².
  - In the placement view a 12 CSS px screen badge sits above each statue (`#23291e` back, `#eadfc9` ink), because a surface bar is sub-pixel there.
  - Files: `owner_you.svg`, `owner_dusty.svg`, and `owner_marks_board.jpg` (1200x700, developer only).
  - Consumer: `src/render/statues.js` makeStatueMesh, which today tells owners apart by colour alone (`STONE` against `STONE_P1`, the brief's complaint). It needs two decal planes per statue. The badge is a new `#hud` element placed with `G.rig.project`, the same way `#stNot` is placed.
- **A4 Meshy references: delivered.** Four 1024 RGB PNGs on flat grey, 0.8 to 1.06 MB each. No GLB was made and no job was run: that is Stephen's paid lane. Developer only. Nothing consumes them until a sculpt exists; then `render/statues.js` would swap the primitive parts for a mesh and keep the colliders.
  - She keeps the 8 mm column base and the 10 mm orb plinth, which are under the brief's 12 mm minimum.
  - She notes the orb ball only touches its plinth at a tangent, so a watertight sculpt needs a new envelope first.
- **A5 the tray: delivered with a change.**
  - Tiles are 112x112, which is 56 CSS px, not 48: she made room for a word under the icon (`icon_box` [32,20,48,48], `label_band` [12,76,88,24], nine slice 20).
  - Tile states: idle, pressed, dragging.
  - Tray: 750x380, so 375x190 CSS, nine slice 32. Bands: `tile_centers` at y 190 and x 117, 289, 461, 633; title and hint bands; `undo_band` [32,278,210,96]; `confirm_band` [258,278,460,96].
  - Consumer: `#statueTray`, `.stTile` and `.stBtns` in index.html (lines 139 to 153; today a gradient band with word-only tiles) and `attachStatues` (main.js:1345), whose `b.textContent = SHAPES[shape].name` becomes the icon plus the word.
- **A6 on the dirt: delivered with a change.**
  - Footprints: one drawing per state, as above. Scale r 108 px to each shape's footprint radius.
  - Not here chip: 224x80 (112x40 CSS), nine slice 24, `text_band` [16,16,192,48].
  - `move_reach.png`: 1024, dashed, r 480 px equals 609.6 mm, the same as `MOVE_MAX` in core/statues.js.
  - `move_origin.png`: 128, corner brackets and a dot, covering 45x45 mm of ground.
  - Ghost note (STYLE-GUIDE-R2): the same stone at 60 percent opacity with a 1.5 CSS px cream screen outline; no squash, bounce or glow. The ghost stays on the true snapped point. The chip sits above the finger toward the free side, with a short leader line.
  - Consumers in `render/statues.js`: today's RingGeometry footprint and the red broken segments (`0xd86a5a`) become the two decals, toggled by `markGhost`.
  - Consumers in main.js: `ghostAt` and `placeNot` (lines 1220 and 1243; the chip is fixed at 64 px above the finger today); `startMove`, `endMove` and the move drag in `attachStatues`. Nothing marks the move origin today, so `move_origin` and `move_reach` go at the statue's old x, z until Confirm or Undo.
  - Placement view numbers: at about 0.119 px per mm the footprint strokes draw 0.15 to 0.40 px wide, which is invisible. There, only the reach circle (145 px across), the words and the badge carry state.
- **A7 placement and move previews: delivered with a change.**
  - `a_placement.jpg` and `a_move.jpg` are 1000x790; `a_playing_phone.jpg` is 950x790. All are schematic over 4 Nov captures, not the 5 Nov front-door statue captures.
  - `_screen_compositions.a_placement`: `tray_box` [0,954,750,380]; `world_viewport` [0,112,750,842], which is CSS y 56 to 477, 421 px tall; `status_band` [36,124,678,72].
  - Consumer: the statues camera (main.js:2157, d = 5.35(R + m), 80 degrees). It fits the ring's height into the top three quarters, about 500 px. Her viewport is 421 px, so either the ring shrinks by about 16 percent or the tray does.

### B. The fixes

- **B1 aim line: delivered.**
  - `aim_dash.svg` is a 24 unit tile with ink from x 4 to 14 on y 12 and a repeat of 24 (`anchors`: `repeat_length` 24, `ink_length` 10).
  - `aim_cap.svg` is an open chevron, tip and pivot at [18,12], pointing +x.
  - Consumer: `#aimline` (index.html:447; today a 3 px brass gradient) and `drawAimLine` (main.js:1624: it starts at px + 6, is `min(L - start, 420)` long and is rotated).
  - Two catches. First, a currentColor SVG used as `url()` inks black, so use it as a CSS mask over a brass background, or inline it. Second, it has no `preserveAspectRatio="none"`, so the repeat tile must be square: the dash period equals the strip height. A 16 px strip draws a 1.2 px line with 8 px dashes; a 3 px line needs a 40 px strip with 20 px dashes. The cap is its own element at the end point, rotated with the strip and never stretched.
- **B2 player chip: delivered.**
  - 352x112 (176x56 CSS, taller than v1's 48), nine slice 24, `name_band` [20,14,312,30].
  - Seven `pip_centers` at y 78, x = 32 + 48k, 32 px each: CSS 16 + 24k, y 39, 16 px.
  - Consumer: `#scores .side` border-image (index.html:89, today `24 20 18 20`) and `ART_VARS['--chip']` (main.js:89). The `.sock` pips should sit on her centres. No dots are baked in now, so a mismatch no longer shows.
- **B3 tier frames: delivered.**
  - Five tiles at 192 (96 CSS) and five pills at 560x96 (280x48 CSS), all nine slice 32.
  - `mark_center` is [96,20] on the tile and [280,20] on the pill, 32 px (16 CSS). `content_box` is [24,42,144,126] on the tile and [24,42,512,30] on the pill.
  - Consumer: `.tile::after` border-image `var(--tier-*) 64 32 32 32` (index.html:101), which becomes 32 with the mark as a separate `ic(tier)` element at top centre, and the inspect header `#iTier` (index.html:110 to 115).
  - Catch: the pill's content box is 15 CSS px tall, so a 14 px label fits and the style guide's 16 px body does not.
- **B4 level up strip: delivered.** 640x120 (320x60 CSS), nine slice 28, `mark_center` [54,60] at 48 px (24 CSS), level and reward bands. Consumer: `.levelup` (index.html:500; today a brass left rule) in the result card. Its mark is `d_icons/level_up.svg`.
- **B5 pot cloth: delivered.** Rectangular 670x480 (335x240 CSS), nine slice 40, two `stake_rows`, five `stake_centers` per row at 96 px (48 CSS), `text_band` [40,192,590,70]. Consumer: `#ante.cloth` (index.html:135 and 542, today `background-size: 100% 100%` on the skewed v1 SVG), which becomes a 40 px border-image. `#stakeStrip` scrolls, so five slots show at once.
- **B6 heirloom cloth: delivered.**
  - 900x1200 portrait. Resting places at (150,460), (450,460) and (750,460), r 120 (the brief asked for 90 or more).
  - `render_windows` are 240 px, which is 100 CSS px at 375. There are also title, name, story and button bands. Her drawn rest ellipses sit at y 530 (rx 124, ry 46), under the lower half of each render: the contact patches.
  - Consumer: `#heirlooms` `data-art="ui/heirloom_cloth.webp"` (index.html:676) and `openTin` (main.js:549). Its canvases are 168 px; for 100 CSS at 2x they need about 200.
- **B7 dark shadow: delivered with a change.**
  - `shadow_dark` (`#030503`, alpha up to 207) sits beside `shadow_dirt` (alpha up to 151). Both are ellipses 112x44 in 256.
  - Added: `dark_plate_contact_lift`, a faint light halo (alpha up to 61), UI only and never in the world, because a darker shadow cannot show on near black.
  - Layer order on the pouches: pouch, lift, dark shadow, render.
  - Consumer: the `.rest` span in `openTin` (today `env/ground_shadow.png`), the pouch reveal, the case wells and `render/share.js`.
- **B8 chalk stroke: delivered, with an export defect.**
  - 2048x64. The line is 40 px centred on y 32 (rows 12 to 51) and repeats along x. Her rule: an integer repeat count around the ring.
  - The PNG has no breaks: alpha is 212 in every column, so the three masked breaks the SVG draws (near x 386, 912 and 1506, 4 to 7 px wide) are missing. The grain specks did survive (RGB 223,211,190 at speck points against 233,223,201 on the line).
  - The lag line and cross were redrawn in the same ink, but their dash gaps (5/3 and 3/2 px) are closed by their round caps, so both are solid lines.
  - Consumer: `src/render/arenaEnv.js`, which today lays `decal('env/chalk_ring.png', …)` with `RING_PX 466/512` and a procedural 52 mm line at `ringR ± 0.026`. The stroke needs a ring strip mesh with u along the circumference and v across an 83 mm band for that 52 mm line. Repeats: 3, 4 and 5 for the 7, 10 and 13 foot rings, which gives 1.09, 1.17 and 1.22 mm per texel along the line and 1.30 across (today's disc decal is about 3 mm). With 4 repeats the 10 foot ring gets 12 breaks of 5 to 8 mm: visible on the near arc, invisible on the far.
  - Today `dress()` scales the whole ring by k when the ring size changes, which would stretch the texture. Rebuild the strip per ring size instead.
- **B9 horizon strip: delivered.**
  - 4096x512 RGBA, 1.59 MB.
  - Lamp measured at (1124,220), which is 0.274 of the width (anchor 1120,220).
  - Opaque from row 300 to 380. It fades out by row 440, not 512, so the bottom 72 px are empty: lay its foot by `fence_foot_y` 360, or crop it at 440.
  - It does not tile: the edge columns differ by 20 against a 7 baseline. Today's `lotBand` (main.js:1479) wraps the 360 degree panorama with repeat-x by camera bearing (`LOT_ROW0` 236, `LOT_ROWS` 210, 1600 px), so it needs a bearing window with clamped edges instead.
  - The true sky stays `env/lot_panorama.webp` (render/scene.js:46), as she says.
- **B10 open pouches: delivered.**
  - Three 640 PNGs. Mouth ellipses: standard [320,250,216,156], collector [320,256,220,152], grail [313,263,195,140].
  - The r 120 render circle fits inside each mouth and is 120 CSS px at a 320 CSS display (the brief asked for about 120).
  - Consumer: `POUCH_MOUTH` (main.js:786, which still holds the v1 mouths `[174,141,276,109]` and so on) and `showPouchOpen` (main.js:793; `#poMouth` is set in percent and its canvas is 168, which should become about 240). The runtime files are `ui/pouch_*_open.webp`.
- **B11 share cards: delivered.**
  - Marble card: `render_window` [96,180,888,570]; wordmark band; name band [96,794,888,76]; provenance band.
  - Match card, 1080x1920: ONE `render_window` [72,252,936,936]; score, techniques, `pot_cloth_box` [72,1510,936,318] holding three pot renders (r 66); provenance; footer.
  - Consumer: `src/render/share.js`, which hardcodes the v1 layout (marble window 90,90 at 900x630; match card with two 420x660 windows, yours and theirs). That layout has to be rewritten.

### C. The screens

None has a 5 Nov capture under it, so each composition is hers on paper. Words, counts, buttons and renders stay live, as the brief says.

- **C1 title: delivered.**
  - `title_lot.webp` is 750x1334, 200 KB and opaque. Hero window measured quiet: luminance 50, standard deviation 7.
  - `wordmark_keepsies` (600x140, plate dropped; it is the same lettering as the `i-wordmark_keepsies` already in the sprite).
  - `button_primary` and `button_secondary` (590x104, so 295x52 CSS, nine slice 28).
  - Bands: hero [215,400,320,320] (160 CSS), wordmark, play, collection, currency, arcade.
  - Consumer: `#title` (index.html:514: the typed `h1`, the rules line, Play, `#wallet`, Your marbles, the arcade exit). The hero render is new code. Her layout has no band for the rules line ("Thirteen marbles in a cross…"); my pick is to drop it.
- **C2 level up: delivered.** `level_up_panel` (670x850: level circle, title, reward, unlock, continue) and `screen_scrim` (750x1334, opaque). Consumer: nothing yet. The level up is one line on the result card, and `progression.unlocks` has one key, pouches.
- **C3 chores: delivered.** `chores_board` (670x920) with three slips, each with title, detail, progress track and reward bands. She puts the entry on a Chores button in the collection and a link from the clay pool. Consumer: none. Chores exist only as tuning numbers (`economy.chorePay` 60, `choresPerDay` 3) and an empty save key, `save.chores {}`; there is no chore logic.
- **C4 clay pool: delivered.** `clay_bowl` (670x540: mouth, count and caption) and `clay_info_panel` (670x366: title, refill, detail, chores). Consumer: `economy.clayPool()` (back to ten every day) and the `#wallet` line. Her entry is the clay counter on the title, which needs a 48 px target.
- **C5 the case: delivered.** `case_6` (670x760) and `case_12` (670x1040). Wells are r 64 (a 128 window, 64 CSS at a 335 display), each with a two-line, 14 px name band; she adds a protection band. Consumer: `buildCase` (main.js:819, `CASE_6` and `CASE_12` on the v1 showcase SVGs, shown as `#caseWrap` inside the collection). The brief wants its own screen.
- **C6 calibration: delivered with a change.**
  - `calibration_target` is 512 px, rings at r 178 and r 102, with ticks; r 178 equals 120 mm. `calibration_hint` is a 640x108 plate.
  - Her rule: put it on the existing aim ray, 1 m ahead if the code has no destination, as a decal only.
  - The numbers say 1 m does not work with today's calibration camera (`calibCam`: 0.42 m, 17 degrees, 28 degree lens). There it lands at y 49 of 667, under the heading, as a 233x21 px sliver. At 0.5 m it lands at y 116, 357x50 px; at 0.35 m, y 152, 425x71 px, wider than the screen.
  - Consumer: `startCalibration` (main.js:416), which hides `G.ground.chalk`. The target must not live in the chalk group.

### D. Icons and E. Store

- **D: all 15 delivered**: share, statues, column, loaf, arch, orb, move_statue, confirm, undo, lay_cross, lay_x, lay_ring, lay_bunch, provenance, level_up. Consumers: the sprite pass, then `ic()` and `label()` in main.js:
  - `RULE_ICON` gains statues and formation (`lay_<value>`); neither has an icon today;
  - the tray tiles;
  - `#stConfirm` and `#stUndo`;
  - `#moveStatue`;
  - inspect Share and Share the match;
  - `#iProv`;
  - B4 and C2.
- **E: delivered.** `statues_store_frame` (1080x1920, svg and png). Capture window [72,350,936,1480], measured transparent; headline band [72,82,936,172]. Consumer: astra_in's `COPY.store`, as `assets/store/frame_7_statues.png`, which is never loaded and stays out of the deploy.
- **Docs.** ASSESSMENT-R2.md is written from the brief, not from play. NOTES.md carries the sound paragraph (a dry glass tick over a granular stone knock scaled by impulse, a grit scrape only while a dragged statue moves, no files). The style guide covers the stone, ownership, chalk, the pending state and the new screens.

## 3. The shot: what in the pack bears on it, and how a rework should use it

### 3.1 Piece by piece

- **The circle (brace pad and reticle): nothing new in the pack.**
  - Today the pad and the ring are tied to the marble's drawn size with a 16 px floor. `tawOnScreen` (game/ringer.js:475) sets r = max(16, 1.35 × drawn radius) and grabR = 1.6r; the reticle is grabR × (0.70 + 0.16 × cone) (main.js:1589).
  - On a 375x667 phone the shooter draws 7.7 to 14 px wide at brace distances of 2.7 to 4.5 m, so the floor always wins: the grab disc is 51 CSS px and the settled reticle 48 px at every distance.
  - Stephen's "three times bigger" means a pad of about 150 CSS px, fixed in CSS px and not derived from the marble.
  - The v1 reticle SVGs (96 box; dashed ring r 36 at stroke 3, settled ring r 27 at stroke 4 with a tick) are vector. Drawn 3x, their strokes also triple to 9 to 12 px. Either draw the bigger ring in CSS, or ask Astra for a pad drawn at its real size (round 3).
- **The aim line (B1): use it as the always-on aim indicator.**
  - Show the dash strip whenever it is the player's aim phase, not only while braced. Run it from the pad's edge to where the shot is pointed: the scope mib's range, or the calibration target. Turning the aim then reads as one line sweeping steadily.
  - The cap's tip marks the end point.
  - Draw it as a mask 16 to 24 px tall (ink 1.2 to 1.8 px), or 40 px for a 3 px line.
  - Keep the 420 px clamp only if the end point stays on screen. A closer camera makes the line longer on screen; the cap must still land at the true point.
- **The calibration target (C6): the flick's first destination.**
  - It is the brief's "something to flick toward". It should sit exactly where the reworked aim line ends, so the first thing a player learns is that the line points at a place.
  - With today's camera it has to sit about 0.35 to 0.5 m ahead (y 152 to 116), or the decal's world radius has to drop. My replay of a 0.9 m, 35 degree camera puts it at y 189 at 0.5 m as a 302x148 px ring, which reads.
  - It changes neither power nor scoring, and it must stay visible while `G.ground.chalk` is hidden.
- **The closer view.**
  - B8's stroke ring is the art that makes coming closer survivable: the near arc goes from about 3 mm to about 1.2 mm a texel. At a brace distance of 1 m one screen pixel covers 0.75 mm, so the nearest chalk is still about 1.6x magnified, which is acceptable for chalk.
  - B9's band only shows while the frame reaches the skyline. A closer, steeper camera shows less of it, and `lotBand` already removes it in the lean and in top down.
  - B7's dirt shadow is unchanged.
  - Nothing in the pack sizes the marbles: a 16 mm mib at the cross is 5.3 CSS px from the sports camera (3.4 m). Making that bigger is camera and ring scale work, which is code.
- **The tray (A5) and the shot never share the screen.** `body.statuing` hides `#corners`, `#aimNudge` and `#scopeBtn` while statues are placed or moved (index.html:153). A bigger pad near the bottom does not collide with the 190 px tray, but it must stay clear of the house rules chip and `#corners`.
- **The ring fit (A7 and B8).** For placement she frames the whole ring in CSS y 56 to 477, above the tray. For play the brief only fixes the ring sizes (7, 10, 13 foot). "The area is too large" is Stephen's call on the ring or the camera. If the rework shrinks the play area, the chalk strip rebuilds at any radius with an integer repeat count, and the footprints, reach circle and lag line scale by their mm anchors.

### 3.2 Code facts the rework must know (read in the code, replayed in pure maths, not seen on a screen)

1. **The shooter place drag sends the shooter across the ring.**
   - main.js:1462 runs `G.R.setPlaceAngle(G.rig.state.azimuth + Math.PI + (frac - 0.5) * Math.PI * 1.4)`, where frac is the finger's absolute x across the screen. The rig azimuth already equals the shooter's edge angle: framing.js:156 sets `autoAz = atan2(-dx, -dz)`, and the camera stands behind the shooter. So mid screen means the far side of the ring, the screen edges mean 54 degrees either side, and every move re-reads a camera that is still chasing the last jump.
   - Replay (`scripts/placesim.mjs`: the real `core/framing.js`, a 13 mib cross and the rig's 0.18 damping, one move a frame):

     | finger | shooter angle, frame by frame |
     |---|---|
     | held still at mid screen | flips between 180 and minus 148 degrees every frame |
     | held 40 px right of centre | hops 150 to 180 degrees a frame |

   - This phase is the first shot of every turn, and every shot from outside the ring (rules-ringer.js:105, `mayPlace`). In it, any one-finger drag that does not start on the shooter is claimed by the place drag (`isClaimed`, main.js:198), so a thumb cannot orbit to aim at all.
   - No gate drags in this phase: frontdoor and the tests flick on the shooter, which commits the place. The likely fix is a relative drag with no half-turn offset, or no place drag at all. That is a design choice for the rework.
2. **The orbit is touchy.** cameraCtl.js:50 turns 0.007 rad per CSS px, about 0.4 degrees. A 4 px thumb wobble is 1.6 degrees, more than the settled cone's 1.5 (`snap.coneTightDeg`). There is no dead zone and no smoothing beyond the rig's damping.
3. **The grab radius is computed in two places.** knuckle.js:219 uses `taw.grabR || taw.r * 1.6` and main.js:1455 uses `t.r * 1.6`. A bigger pad must change both, or a touch between the two radii becomes a brace and a place drag at once.
4. **The reticle, aim line and scope live only while braced** (`onBrace`, main.js:1572), and with Zoom held (`holdScope`). Before the thumb goes down the player sees no aim, so aiming by orbit is blind until the brace.
5. **The flick's numbers are all in `tuning.snap`.** Power is speed over the last 90 ms, from 0.35 to 1.2 m/s of glass, replaced by the player's own calibration. The fine angle is capped at 25 degrees. With Bombing on, a flick reads as a bomb when it travels more than 40 px down. None of that is art; all of it is likely part of "the flick is terrible".

## 4. What cannot be wired as delivered, and the questions it leaves for Stephen

### 4.1 Cannot ship as delivered

- **Over 1600 px or too heavy for runtime** (law 7: nothing over 1600 px a side except assets/store/, textures 1024, under 1.5 MB on the first visit):
  - `horizon_strip.png` (4096x512, 1.59 MB, the brief's named exception). Ship it as WebP: 2048x256 is 122 KB, 1600x200 is 76 KB, cropped at row 440.
  - `chalk_stroke.png` (2048x64, also a named exception, and missing its breaks). Ship the 19.8 KB SVG, loaded through an image into the texture, or a browser rasterisation of it. Either way it breaks law 7's letter, so the law needs a line for it.
  - `share_match.png` (1080x1920). It replaces a v1 card of the same size that already ships (`assets/sharing/match_card.png`), so it needs the same exception.
  - `pouch_*_open.png` (640, 451 to 536 KB each). Ship WebP at 320 (18 to 24 KB) with the mouth numbers halved.
- **Developer or store only, never in the served set:**
  - `statues_design_board.jpg` (1600x900);
  - `owner_marks_board.jpg`;
  - the four Meshy references (1024, 3.66 MB together);
  - `previews/` (15 files, 2.1 MB);
  - `statues_store_frame` (goes to `assets/store/` only).
- **No code to sit on yet.** C2, the level up moment, does not exist. C3 needs a chore system. C4 needs a clay pool screen. C5 is a strip in the collection, not a screen. A6's origin mark is not drawn today, though the old spot is known: the statue's record keeps it until Confirm, and only its mesh is hidden during the drag.
- **Schematic only.** A7 and every C composition sit on 4 Nov captures. Before calling any section done, re-place each on the real build at 375x667.
- **Absent.** A2 (Decision 1), a snap trail (skipped, as the brief allowed), audio (paragraph only, as asked), and anything for the shot's feel (not asked).

### 4.2 Questions for Stephen

1. **Decision 1, still open.** The four code shapes in weathered limestone (her pick, colliders honest), or four expansion figures on the dirt: Boba Buddy, Void Loaf, Book Wyrm rebuilt as two book piers and a spine, Moon Moo?
2. **Ownership marks.** One chalk bar for you and two for every opponent, on the top and front of each statue, plus a 12 px badge above each statue in the placement view. Is that the rule?
3. **Envelopes.** The column's 8 mm base and the orb's 10 mm plinth are under the 12 mm minimum, and the orb only touches its plinth. Keep the colliders as they are, or approve new envelopes so Meshy can make solid sculpts?
4. **Meshy.** Run the four statue references in your paid lane? None was run.
5. **Calibration destination.** Her "1 m ahead" lands as a sliver at the top edge with today's close calibration camera. Should the destination sit about half a metre ahead, or should calibration get a higher camera?
6. **Title.** Her layout drops the "Thirteen marbles in a cross…" line. Drop it?
7. **The four new screens.** Level up, chores, clay pool and the case are drawn. Chores needs a chore system first. Build any of them now, or after the shot rework, given your verdict is about the shot?
8. **Match share card.** It becomes one big window with three small pot renders, instead of your marble and theirs side by side. OK?
9. **Round 3 for Astra.**
   - A brace pad and reticle drawn at about 150 px, your three times.
   - The shot and statue screens re-shot on the reworked build.
   - Send her the materials as a zip file rather than a Drive link that needs a sign in, since both her capture routes failed this round.

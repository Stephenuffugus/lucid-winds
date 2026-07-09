# Hedgerow — Sprite-Sheet Asset List

A cozy JezzBall remake: grow hedge walls across a garden bed to fence bouncing pests into a corner and reclaim the soil. Everything is currently drawn with Canvas2D primitives (zero assets). The art below drops onto the critters, the tiles that fill the screen as you win, the growing hedge, and the title face. Smallest set that fully skins it: **2 sheets, 17 cells.**

---

## STYLE (shared — applies to every cell)

Bright, colorful, fun handmade paper-craft game art. Cozy midnight-garden world with deep near-black green shadows, saturated sage greens, antique gold rewards, cream highlights, rose accent for targets/peaks. Subjects: chubby garden bugs (pests), leafy hedge walls, tilled soil beds, sprouts, single leaves, a little sun token. Tactile fiber-art materials: cut paper, wool felt, macrame cord, beads, sequins, glitter, scrapbook layers, stitched edges, soft handmade texture. Clean readable silhouettes first — each critter must read as a bouncing ball at ~26px. Cute botanical critter energy, cozy-menacing never scary or grim. Soft top-down key light with warm gold rim-light. Chunky arcade readability at small sizes. No photorealism, no 3D render, no text labels, no captions, no borders, no UI words. Keep detail bold and simple enough that each cropped asset compresses well. Palette base #0e140d, sage #7ab356, gold #c8a84b, cream #e8dcc8, rose #e58fa0.

---

## Sheet 1 — Sprites (critters, tiles, icons, fx)

- **File name:** `hedgerow_sprites.png`
- **Grid:** 5 cols x 3 rows (15 cells)
- **Cell size:** 512 x 512 px
- **Master size:** 2560 x 1536 px
- **Knockout:** Flat magenta #FF00FF background in every cell for knockout. No magenta inside the artwork.

Tiles (cells 7-11) must be **seamlessly tileable** on all four edges — they repeat across the grid. Critters and icons sit centered with a little padding.

1. `pest_ladybug` — plump rose-red felt ladybug, round body, black felt dots, cream shine highlight, tiny gold antennae, sleepy happy face; reads as a ball.
2. `pest_beetle` — burnished antique-gold felt beetle, iridescent sequin back-shell, stubby cream legs, big shiny bead eyes.
3. `pest_snail` — sage-green felt snail curled tight, swirled macrame-cord shell, dozy smile, small eye-stalks; round overall silhouette.
4. `pest_aphid` — pale mauve-pink round felt aphid, oversized glossy bead eyes, two translucent nub wings, rosy cheeks; cute-round.
5. `pest_caterpillar` — sage-and-gold wool caterpillar curled into a ball, stitched segment rings, tiny felt feet, friendly face.
6. `pest_grub` — chubby cream-tan felt roly-poly grub, soft stitched segment lines, rosy cheeks, little antennae; round and squishy.
7. `soil_tile` — seamless dark near-black-green tilled soil bed, torn-paper texture, faint pebbles and scattered seeds, subtle furrow rows; the empty bed.
8. `hedge_grow` — seamless bright young sage hedge segment, fresh sprouting felt leaves, soft cream-green glow, lively; the actively growing wall body.
9. `hedge_tile` — seamless mature deep-green hedge wall, layered cut-paper leaves, warm gold rim-light along top, dense and solid; the committed wall.
10. `ground_planted` — seamless reclaimed/planted ground tile, tilled sage soil with a single sprout or sequin flower poking up; the claimed cells.
11. `sprout_tip` — a single bright cream-green sprouting bud with a soft halo glow, felt curl; caps the advancing end of a growing hedge.
12. `leaf_life` — one tidy sage felt leaf with a gold stitched midrib and soft cream highlight; the life pip.
13. `sunbeam` — antique-gold felt sun with cut-paper cream rays and a sequin/glitter center; the Sunbeam reward token.
14. `fx_wilt` — a small soft puff of grey-sage wilted petals and dust motes; the hedge-wilt burst on a hit.
15. `fx_sparkle` — a bright gold-and-cream four-point sequin sparkle/twinkle; the reclaim + ground-cleared celebration mote.

---

## Sheet 2 — Backgrounds (full-bleed)

- **File name:** `hedgerow_bg.png`
- **Grid:** 2 cols x 1 row (2 cells)
- **Cell size:** 1620 x 2880 px (portrait 9:16). Deploy each final image resized to <=1600px on the long edge, under 150KB.
- **Master size:** 3240 x 2880 px
- **Knockout:** Full-bleed art, no magenta inside a cell; magenta #FF00FF only in the gutter between the two cells.

1. `bg_title` — cozy midnight-garden hero: a moonlit paper-craft hedgerow maze winding through a raised garden bed, fireflies and floating pollen, rose blossoms, deep near-black green with warm gold rim-light. Keep the vertical center and upper third calm/uncluttered so the logo word and buttons sit cleanly on top.
2. `bg_game` — the play-screen backdrop: a warm wooden raised-bed frame around a dark tilled-soil center, soft gold vignette, a few felt leaves in the corners. Center stays a plain dark soil field (the live grid renders on top); keep the top strip calm for the HUD.

---

**WIRE NOTES:** No ART hook exists yet — add a light image loader (fleet ART pattern) that draws sheet cells over the existing primitives. Map: `pest_*` → `drawPest` (L450), mapped by `balls[i]` index % roster (current code uses 5 `BALL_COL` slots at L228 — extend to index the sprite roster). `soil_tile` → field fill at L402. `hedge_tile` → committed-wall cell draw (grid `v===2`, L412). `ground_planted` → claimed-cell draw (grid `v===1`, L410). `hedge_grow` + `sprout_tip` → growing-wall block (L420-427). `leaf_life` → `drawLeaf` HUD lives (L388/449). `sunbeam` → clear-banner + `over-sun` reward (L445, L363). `fx_wilt` → `wiltWall` burst (L276). `fx_sparkle` → `levelClear`/claim bursts (L348, L311). `bg_title` → CSS `background-image` on `#s-title` (reuse on `#s-over`); `bg_game` → drawn first in `render()` replacing the L379 gradient. Folder: `satellites/hedgerow/assets/` (`assets/hedgerow_sprites.png`, `assets/hedgerow_bg.png`). Deploy the 2560px sprite sheet as a `.bin` loaded via fetch->blob (lucidwinds.com down-rezzes raw images over 1600px per the host resizer note); path-version or `?v=BUILD` cache-bust on load.

# Why Shutterbug rooms feel the same: the read only investigation of 31 Oct 2026 (night)

Workflow wf_5412f80f-a75, three investigators, read only, measured on a seeded painted room model (120 and 60 rooms) and Astra's sample photo; scratch and boards under /home/codespace/sb-drafts/sameness/. Asked after Stephen's playtest note (QUESTIONS Q96). The progression lens's full proposal is PROGRESSION-PROPOSAL-OCT31.md beside this file.

## Colour and biomes

### Diagnosis

The lead's reading is mostly right, with two corrections.

1. Green does not survive the quantizer. SB.palette.nearest uses weighted RGB, and that distance is mostly lightness. The palette has one green, Moss 3f9a3a (L 116). Only 6 of 20 real-world greens reach Moss in neutral light, 5 under a warm cast and 1 in a dim corner. Sage, mint, seafoam, pistachio and eucalyptus land on Ash or Pewter. Monstera leaves, hunter green and a green velvet sofa land on Slate. On a full HSV green grid, no green below saturation 0.3 reaches Moss (0%), and only 41% of greens at saturation 0.5 or more do. Other colours fail the same way: pink walls go to Ash, powder and sky blue to Ash or Pewter, navy to Soot, purple to Walnut or Slate. Teal 2a8a8a goes to Moss, not Teal.

2. The biome is Attic almost every time, not "Attic or Frost". Over 120 painted rooms at the default box: Attic 118, Frost 1, Overgrowth 1, Deep 0, Ember 0. At a brighter exposure: Attic 107, Frost 11, Overgrowth 2. Two things cause this:
   - Only 49 of 120 rooms reach the 10% saturated-cell gate, and in those the saturated cells are mostly the wood floor and furniture (Walnut 8.2% of all cells, against Moss 0.9%), so they vote Attic.
   - Rooms under the gate fall back to the bright-room rule, and their mean L (floor and furniture included) almost never clears 170, so they are Attic too.
   Every one of the 13 sage, 8 deep green and 10 mint walled rooms came out Attic.

3. The enemies feel the same mostly because of their kind, not the default spread. The default spread never fired in any built room (0 of 48), because it needs a room with no landmark and no platform. Built rooms got 1.23 photo-born enemies per room plus 0.46 pocket elites; 16 of 48 had no photo-born enemy at all. The enemy kind follows the biome, so 41 of the 43 rooms with an enemy got moths.

4. Specks are never photo-born. Sun is 0.1% of cells and is never isolated, so photo-born specks were 0.00 per room in every variant. The only speck in a room is the pocket's loot (0.46 per room). That fits his "not collecting anything".

5. Most rooms still do not build at the default box. Live sb-m1-3 built 5 of 120 rooms (96% refused, in line with the 91% already reported). The sb-levels work in progress (4cc3bf26d) builds 48 of 120. Astra's sample photo is 67% saturated cells and comes out Attic, which is right for a wooden attic. It is refused on both cores ("dark: no tab fits on the stair from the frontier").

No real photos: /home/codespace/sb-drafts/sameness/photos/ did not exist when I looked, so all results come from the model and Astra's sample. Nothing was edited in any worktree. All scratch files are in /home/codespace/sb-drafts/sameness/colour/.

### Measurements

- 6 of 20 real-world greens reach Moss in neutral light, 5 under a warm cast (x0.9), 1 in a dim corner (x0.7); sage, mint and pistachio land on Ash or Pewter, monstera and hunter green on Slate. Printed by: cd /home/codespace/sb-drafts/sameness/colour && nice -n 10 node sweep.js
- HSV green grid (hue 75 to 165): Moss on 1586 of 6137 colours (25.8%); 0.0% below S 0.3, 15.5% at S 0.3 to 0.5, 41.3% at S 0.5 or more. Printed by: node sweep.js
- Today's biome over 120 model rooms: Attic 118, Frost 1, Overgrowth 1, Deep 0, Ember 0; mean saturated share 10.3%; 49 of 120 rooms reach the 10% gate. Bright exposure: Attic 107, Frost 11, Overgrowth 2, saturated share 12.9%. Printed by: node analyze.js 120 && node summary.js; EXPO=bright OUT=rows-bright.json node analyze.js 120 && ROWS=./rows-bright.json node summary2.js
- Cell colours over the model (today's palette): Pewter 48.3%, Slate 17.6%, Ash 12.8%, Soot 10.7%, Walnut 8.2%, Moss 0.9%, Amber 0.7%, Sun 0.1%. Printed by a node -e stats one-liner over rows.json
- Buildable at the default box: live core 5 of 120, sb-levels 4cc3bf26d 48 of 120 (bright exposure: 5 and 49). Printed by: node summary.js
- Built rooms on sb-levels: photo-born enemies 1.23 per room, all enemies 1.69, pocket elites 0.46; photo-born enemies per room 0:16, 1:17, 2:7, 3:4, 4:4; default spread rooms 0 of 48; enemy kind moth in 41 of 43 rooms with enemies; specks 0.46 per room, photo-born specks 0.00. Printed by: node summary.js plus a node -e one-liner over rows.json
- A2 (hue keeping quantizer): biomes Attic 104, Deep 7, Overgrowth 2, Ember 6, Frost 1; saturated share 20.1%; sb-levels builds 41 of 120 (bright: 38, against 49 today); photo-born enemies 1.05 per room; levelHash differs on 38 of 38 rooms that build both ways. Printed by: node summary.js
- B1 (biome from the cells' own colour): biomes Attic 53, Deep 15, Overgrowth 38, Ember 14, Frost 0; with the Frost rule first: Attic 53/Frost 1/Deep 15/Overgrowth 38/Ember 13, and at bright exposure Attic 44/Frost 22/Deep 14/Overgrowth 30/Ember 10; 64 to 65 of 120 rooms change biome; sage 12 of 13, mint 10 of 10 and deep green 8 of 8 become Overgrowth; navy 7 of 7 become Deep; blush pink 5 of 11 become Ember; builds 47 of 120 (one fewer than today); enemy kind spread: moth 24, crawler 2, spark 9, Ember kind 7. Printed by: node summary.js; the Frost-first numbers by a node -e over rows.json and rows-bright.json
- B2 (biomeOf gate lowered from 0.10 to 0.03): Attic 115, Overgrowth 4, Ember 1 (bright: Attic 107, Frost 4, Deep 2, Overgrowth 7); 0 corpus fixtures change. Printed by: node summary.js && node corpus.js
- C (Glare fbfbff swapped for Leaf 8cc06a, in SAT, Overgrowth band): Attic 104, Overgrowth 16 (bright: Attic 83, Frost 10, Overgrowth 27); saturated share 13.6%; sb-levels builds 52 of 120 (bright 53); photo-born enemies 1.85 per room (bright 1.11); green cells per room 47.5 against 10.2 today. Printed by: node summary.js
- Corpus (25 synthetic fixtures plus sample-room, build(rec,{})): C changes levelHash on 3 of 26 on live (all-light, bright-door, sample-room) and 4 of 26 on sb-levels (also gradient-v); mode 1 changes 0; B2 changes 0; 4 of 26 fixtures hold index 6. The sample-room share code decodes under C to the same grid but a different level. 51 of 120 bright-exposure model records hold Glare. Printed by: node corpus.js
- Astra's sample_room_photo.png (384x768, default box = the whole image): 66.75% saturated cells, Attic under every variant, refused on live and sb-levels ('dark: no tab fits on the stair from the frontier'). Printed by: node analyze.js 120 and a node -e over rows.json
- Astra's art uses index 6 (Glare) in 67 of her 100 source grids (3,907 pixels). Printed by: python3 -I count over /home/codespace/sb-drafts/astra/oct31-x/source

### Options

- **A: hue keeping quantizer.** At capture, a cell with S >= 0.3 and chroma >= 36 picks among the saturated entries within 40 degrees of its own hue, scored as lightness difference plus twice the hue difference (A2: falls back to nearest when the lightness difference is over 60). Low-chroma cells pick among the greys. Prototype: hueKeep() in /home/codespace/sb-drafts/sameness/colour/analyze.js.
  - Effect: Saturated share 10.3% to 20.1%, but the biome barely moves (Attic 118 to 104). Light greens still go grey: sage and mint walls are under the gate, and Moss's L of 116 is too far from a light wall for the guard. Buildability falls: 48 to 41 rooms, and 49 to 38 at bright exposure. Wood floors become a solid Amber band, and Astra's wood ceiling goes Amber. Photo-born enemies 1.23 to 1.05. Every room that builds both ways builds a different level (38 of 38).
  - Cost: Record format, share codes, corpus (0 of 26 change) and Astra's art are untouched, because only the capture changes. But a cell that turns saturated also changes its L, so Otsu and solidity move. That costs buildable rooms, and a warm cast over beige pushes walls toward Sun or Amber. About 30 lines plus capture tests. Not recommended.
- **B1: biome from the cell's own colour, carried in the record.** At capture, vote the biome from the averaged RGB cells (before quantizing) by hue band: warm 15-70 Attic, 70-170 Overgrowth, 170-285 Deep, 285-15 Ember. The gate is S >= 0.09 and chroma >= 12, except the warm band, which needs S >= 0.3 and chroma >= 16 because wood and the light's cast live there. Under 10% voters, the bright-room and Attic rule applies as today. Better with the Frost rule first (mean L > 170 gives Frost). Prototype: rgbBiome() in /home/codespace/sb-drafts/sameness/colour/analyze.js, fed in as build's opts.biome.
  - Effect: Attic 118 to 53, Overgrowth 38, Deep 15, Ember 14. With the Frost rule first at bright exposure: Attic 44, Frost 22, Deep 14, Overgrowth 30, Ember 10. Over half the rooms (64 to 65 of 120) change biome. Sage, mint and deep green rooms become Overgrowth (30 of 31), navy rooms Deep (7 of 7), pink rooms often Ember. Enemy kinds spread out from moths to crawlers, jellies and sparks. Buildability is unchanged (47 against 48). Photo-born enemy count is unchanged, because clusters still come from the 16 colour grid. The grid itself stays grey; the colour shows as the biome's tint (the boards show the room turning green or blue).
  - Cost: Only the 16 colour grid is persisted, so the record must carry the biome: record v2 with one header byte (0 = derive by today's rule, 1 to 5 = biome). decode() already answers {why:'newer'} for a higher version, and seedOf hashes only pal, so the seed is unchanged. v1 codes and every fixture decode to the same levels: 0 of 26 change by construction, since v1 keeps biomeOf. New codes grow by one byte, and an old client refuses them as newer. Astra's palette and her verify script are untouched. About 60 lines (capture vote, record v2 pack, unpack and JSON, the shell passing opts.biome) plus H tests for v1 equality and the v2 round trip.
- **B2: lower the palette vote gate (BIOME_MIN_FRAC 0.10 to 0.03).** Keep biomeOf on palette indices and lower only the saturated fraction it needs.
  - Effect: Attic 118 to 115, Overgrowth 4, Ember 1 (bright: Attic 107, Frost 4, Deep 2, Overgrowth 7). Almost nothing changes, because the saturated cells it counts are still mostly Walnut and green walls are not saturated cells at all. 2 of 48 built model levels change hash.
  - Cost: One tuning number, 0 of 26 fixtures change, share codes unchanged. Cheap but useless for his complaint.
- **C: palette change (Glare to Leaf 8cc06a).** Swap the near-duplicate Glare (fbfbff, next to Paper f2efe6) for a light green, add it to SAT with the Overgrowth band. Scratch pages: /home/codespace/sb-drafts/sameness/colour/live-C.html and levels-C.html.
  - Effect: Overgrowth 1 to 16 rooms (bright 27), saturated share 10.3% to 13.6%, photo-born enemies 1.23 to 1.85 per room, buildability 48 to 52. But sage stays Ash, and monstera, hunter green and the velvet sofa stay Slate, because weighted RGB is still mostly lightness. The boards show Leaf grabbing the bright wash round a lamp on a sage wall, and half of a mint wall in a posterised band.
  - Cost: Glare is an art and HUD colour: the shell draws flashes, platform edges and pickup pulses in it (7 sites). Astra uses index 6 in 67 of 100 source grids, so her manifest palette, sprite hashes and verify_assets.py all change, and the art would need repainting. 3 of 26 fixtures on live (4 on sb-levels) change levelHash. Old share codes holding index 6 decode to the same grid but a different level (sample-room does), and 51 of 120 bright-exposure rooms hold Glare. Going past 16 colours means 5 bit cells: a new packed format (v2), every share code about 25% longer, Astra's 0 to f key and 16 colour verify broken, the H-pal gates and the JSON hex rows reworked. Not recommended.
- **A2 plus B1 combined.** Hue keeping quantizer plus the RGB biome vote.
  - Effect: Same biome spread as B1 (Attic 53, Overgrowth 38, Deep 15, Ember 14), but buildability falls to 41 (bright 38) and photo-born enemies to 1.07.
  - Cost: The costs of both, for no biome gain over B1 alone.

### Recommendation

Build B1 with the Frost rule first: vote the biome from the averaged photo colour at capture and carry it as one byte in a v2 record. Leave the 16 colours and the quantizer alone.

It is the only variant that answers "different biomes" and "I try to do something green". Attic falls from 118 of 120 rooms to 44 to 53. 30 of 31 green walled rooms become Overgrowth and all 7 navy rooms become Deep. Enemy kinds stop being moths everywhere. Buildability is unchanged (47 against 48 of 120). 0 of 26 fixtures and no v1 share code change, and Astra's art and her verify script are not touched.

A costs buildable rooms (49 to 38 at bright exposure) without moving the biome. C breaks Astra's palette and old codes and still misses sage.

B1 will not add enemies or specks, because those still come from the grid: 1.23 photo-born enemies per room, 0 photo-born specks. "Collecting or building towards anything" therefore needs its own change; the speck rule (isolated Sun cells) never fires on a room, and is the obvious next lever. It also needs the levels rule to land first: on live sb-m1-3 only 5 of 120 model rooms build at the default box.

Boards, opened and described:
- /home/codespace/sb-drafts/sameness/colour/board1.png
- /home/codespace/sb-drafts/sameness/colour/board2.png
Model run data: /home/codespace/sb-drafts/sameness/colour/rows.json and rows-bright.json.

### Stephen's calls

- Do we bump the record to v2 with a biome byte (B1)? v1 codes and all fixtures stay identical, new codes are one byte longer, and an old client refuses them as 'newer'.
- Which wins when both apply: a bright room as Frost, or the room's accent colour? Frost-first gives Frost 22 of 120 at bright exposure; accent-first gives Frost about 0.
- Should a white room with a red rug or a pink poster be Ember? B1 makes 7 of 21 white rooms Ember, 3 Deep and 2 Overgrowth, so the room's accent decides the biome.
- Keep Astra's exact 16 colours? A palette swap (C) touches 67 of her 100 grids and the HUD's Glare, and still misses sage. I advise keeping them.
- Specks never come from a photo (0.00 per room; the only speck is the pocket loot). Should the speck rule change (for example the brightest small warm or saturated cluster in reach) as part of 'collecting something'? That is a separate change from colour.

### Boards

- Board layout: each board has six columns: the photo at the default box | today's 16 colour grid | the A2 grid | the C grid | the level today (the biome's solid and open tint, film tabs in cream, a red bar and slash when refused, a coloured strip under it for the biome) | the level under B1. Biome strip colours: gold Attic, ice Frost, blue Deep, green Overgrowth, red Ember.
- /home/codespace/sb-drafts/sameness/colour/board1.png row 1 (model-33, sage wall, bookcase with coloured books, ceiling lamp, olive rug on a wood floor): today's grid is a flat Pewter wall, a Walnut and black bookcase with the books lost to grey, and a Walnut floor. A2 gives the books red, blue and green but turns the floor into a solid orange Amber band. C puts Leaf green only on the bright wash at the top by the lamp. Today's level is Attic with a cream column of film tabs up the left wall (the climb is the tabs). B1 is Overgrowth: the bookcase and solids turn green and the room reads green.
- /home/codespace/sb-drafts/sameness/colour/board1.png row 2 (model-21, deep green wall, beige sofa, a small blue and green print, dark wood floor): in every grid the wall is Slate or Soot, a black mass; only the print keeps its blue and green. The level is refused in both level columns. B1's tint is green, the base one brown.
- /home/codespace/sb-drafts/sameness/colour/board1.png row 3 (model-22, mint wall, window, pink poster, red and yellow frames, beige sofa, bookcase, teal rug): today the mint wall is Ash and Pewter grey; the art survives as Brick, Sun, Lapis and Amber. A2 makes the poster Magenta and the bookcase orange. C paints the upper left of the mint wall Leaf green with a hard staircase edge where the light falls off, the rest grey. Today's level is Attic with a cream staircase of tabs; B1's is Overgrowth, with green tinted solids.
- /home/codespace/sb-drafts/sameness/colour/board2.png row 1 (model-41, blush pink wall, purple sofa, teal rug): today's grid makes the pink wall Ash and Pewter, the purple sofa Walnut brown and the teal rug Moss green, all wrong hues. A2 gets the sofa Magenta and the rug Teal and Lapis. C is the same as today. Today's level is Attic with a tab ladder on the right; B1's is Ember (red strip, darker solids).
- /home/codespace/sb-drafts/sameness/colour/board2.png row 2 (model-30, powder blue wall, yellow poster, purple sofa, mustard rug): today the wall is grey, the yellow poster Amber orange and the sofa grey. A2 gives a Sun yellow poster, a Magenta sofa and an Amber rug. C is the same as today. Today's level is Attic; B1's is Deep, and the sofa and floor solids turn blue.
- /home/codespace/sb-drafts/sameness/colour/board2.png row 3 (Astra's sample_room_photo.png, a wooden attic bedroom with a lamp, plants and a bed): today's grid is Walnut and Amber throughout with grey bedding. A2 turns more of the wood orange. C is the same as today. Both level columns are refused (red bar) and Attic, which is right for this photo but does not build at the default box.
- Smoke board /home/codespace/sb-drafts/sameness/colour/smoke.png (an early run, before the hue-score fix): it showed the first A turning a wood floor Brick red and C painting a green ring round a lamp on a greige wall. Those problems led to the A2 scoring and the warm-band gate.

### Unknowns

- No real photos: /home/codespace/sb-drafts/sameness/photos/ did not exist. All numbers come from a flat painted model (no perspective, no cast shadows, an assumed residual warm cast after the camera's white balance) plus Astra's illustrated sample. B1's gates (S 0.09, warm band S 0.3) are tuned on the model and need his photos.
- Exposure matters for Frost and the share of saturated cells. The normal and bright runs bracket it: Attic 118 against 107 today, and B1 with Frost first at 53 against 44 Attic.
- sb-levels is a work in progress, snapshotted at 4cc3bf26d in /home/codespace/sb-drafts/sameness/colour/levels-base.html. Buildability and feature counts will move as that lane lands.
- The photo-born enemy count is approximate: enemies minus pocket elites minus the spread fodder slot (the spread never fired). Specks are counted as photo-born only when they sit on a Sun cell.
- Untested: whether a biome tint alone reads as 'enough colours' on his Pixel, since B1 leaves the grid's cells grey and colours only through the 35% solid and 20% open tint. No browser shot was taken.
- B1's vote reads the camera's colours, so the same scene can vote differently across phones. The record carrying the biome keeps shared levels deterministic, but the capture itself is not.

## How much of the photo becomes the level

### Diagnosis

Most of a built level is not the photo. At the default crop box a portrait 24x48 strip of a room is about 60% bare wall paint: furniture fills the bottom third and the top half is wall. Film tabs climb that blank wall in the same 3-across, 3-up zigzag in every room, so every level plays like the last one.

On the sb-levels fallbacks (the only page where enough rooms build to measure): 73.8% of the main ascent's standing cells sit on film tabs, and 88.8% of the rows climbed are climbed on film. 24 of the 26 built rooms are at least half tabs. Photo one-way platforms are 1.4% of the standing cells, about 2.6 cells per room.

The biggest single fact is the "photo desert". 60.4% of the climb rows lie in runs of more than 4 rows (JUMP_UP) with no photo standing cell anywhere on the row. Only film can cross them, whatever the solidity or platform rule. That is why the three pipeline A readings I was asked to try only moved the tab share 73.8% -> 72.2..74.4%.

Two further causes:

(1) Repair ignores the photo. The stair runs from the nearest frontier straight at the exit, so ledges the photo does have go unused. On model-7 the bookcase shelves sit unused beside a tab stair going up the empty wall.

(2) Colour and biome. Weighted-RGB nearest is mostly luminance, so pale and tinted colours collapse to greys:
- sage 9caf88, olive and teal-ish -> Pewter; mint, lime, sky, blush, rose, beige and warm wall -> Ash. Only fairly dark saturated greens (forest, leaf) reach Moss; a dark houseplant -> Slate.
- Green-wall rooms: Moss is 0.9% of their cells, and 0 of 10 come out Overgrowth (8 Attic, 2 Ember).
- 53 of the 61 grids are Attic. That is 37 by vote, 30 of those because Walnut (wood floors and furniture count as an Attic voter), and 16 by the under-10% fallback.
- Enemy kind follows biome, so it is moths almost every time. The lead said grey rooms get the default spread; that is wrong (0 of 26 built rooms used it). They just get few enemies: mean 1.62, and 14 of 26 rooms have 0 or 1.

Buildability is still the first wall. Live builds 3 of 60 model rooms and sb-levels 26 of 60. Astra's illustrated sample room fails on every page and every variant: the wood maps to Walnut, the warm wall to Pewter (L 139, under the Otsu cap of 140), so the whole room is solid.

What helped:
- A capture-side normalisation (half-strength grey-world white balance plus a luminance stretch, before nearest).
- Edge ledges (a).
- A stepping-stone repair (e) that aims each pass at the nearest unreached photo surface, so film bridges between the photo's surfaces instead of replacing them.
Together they bring film down to 50.6% of standing cells and the stair moves from 58.9% to 28.2% of ascent moves.

Even then 44.5% of climb rows are photo desert. No reading of the grid fixes a blank wall; a design answer (what to frame, or what a level is for) is needed too. All of this is on a painted model, not his photos.

### Measurements

- Real photos: /home/codespace/sb-drafts/sameness/photos/ exists but was empty at 21:46 UTC and again at the end. Nothing below comes from Stephen's photos; the inputs are 60 seeded painted rooms (room.js) plus Astra's sample_room_photo.png (grids.js: '61 grids in 57410 ms').
- Buildability at the default box: live 3/60 model rooms, sb-levels (528174ccd, snapshotted as levels.html) 26/60. Astra sample needsCrop on live ('no tab fits on the stair from the frontier') and on sb-levels ('dark: no tab fits ...'). Command: nice -n 10 node measure.js live.html levels.html
- Live refusals: 36/57 'no open cell on the standing row above the floor', 13 'repair ran N passes ... exit unreached', 7 'no tab fits', 2 route. sb-levels refusals: floor 11, dark 7, ceiling 6, uncaused 10 (same command).
- Main ascent standing cells, sb-levels (366 cells, 26 rooms): film tabs 73.8%, photo one-ways 1.4%, photo solid tops 21.0%, forced floor row 3.8%. Rows climbed on tabs 88.8% of 893. Median room 76%; 24/26 rooms at 50% or more; 0 rooms with 0 tabs. Live (3 rooms, 53 cells): tabs 73.6%, rows on tabs 86.0%. (measure.js)
- Photo against defaults, sb-levels: photo one-way cells per room 2.6 (0.7 runs); landmarks 1.96; default spread used 0/26; enemies mean 1.62, 14/26 rooms with 0-1; specks 0.65; ladder 0/26; pocket 17/26; door 3/26; trap 0; biomes attic 25, frost 1. (measure.js)
- Photo desert: 60.4% of the 891 climb rows on sb-levels sit in runs of more than 4 rows with no photo standing cell on the row; wall paint (entries holding 15% or more of the open cells) covers 61% of the room. Command: nice -n 10 node desert.js levels.html (live 57.4%, va 57.5%, vb 58.9%, vc 55.6%, vd 57.4%)
- Sameness distances, sb-levels 325 pairs. dStruct (1 - Jaccard over non-open cells with class matched) median 0.659. dAscent (symmetric mean nearest Chebyshev distance between the ascents' standing cells) median 6.31 cells; 3.4% of pairs under 2. dHop (total variation between histograms of (|dx|, up) moves) median 0.500. The stair's own moves (3,3)+(0,3) are 58.9% of all ascent moves. Distance to the blank-wall fixture is dStruct 1.000 for every room, which is uninformative because tabs never coincide. Levels are always different by levelHash (26/26 distinct); the sameness is in the move mix. (measure.js)
- Greens and tints through SB.palette.nearest (node -e in the report): sage 9caf88 -> Pewter, mint b0c8aa -> Ash, olive 788a60 -> Pewter, lime a0c850 -> Ash, forest 587654 -> Moss, leaf 5a8c46 -> Moss, houseplant 40703c -> Slate, sky 96b0cc / blush / rose / beige / tan / warm wall c8a882 -> Ash, oak 9e6c42 -> Pewter, cream -> Paper. Astra wall cells (160,127,98) and (142,114,89) -> Pewter; wood -> Walnut.
- Biome over all 61 grids (raw): attic 53, deep 3, ember 2, frost 2, overgrowth 1. Attic: 37 by vote (Walnut half or more of the saturated cells in 30 of them), 16 by the under-10% fallback. Green-wall rooms 10: attic 8, ember 2, overgrowth 0; Moss 0.9% of their cells. With normalisation: attic 45, frost 12, ember 4. (node -e over measure-*.json)
- Variants on sb-levels, raw capture (measure.js va vb vc vab vd): ascent on tabs va 72.5%, vb 74.4%, vc 72.2%, vab 73.5%, vd 71.1%. Photo one-way cells per room va 8.4, vc 9.1, vb 2.5. Builds va/vb/vc 26/60, vab 25/60, vd 28/60. Ladder va/vc 2.
- With capture normalisation (PRE=norm node measure.js ...): levels 32/60 built, tabs 73.3%, door 14, frost 6, rows on tabs 87.8%. norm+va 28/60, tabs 65.4%, photo one-ways 12.9%, 25.3 cells/room, ladder 6, rows on tabs 79.0%. norm+vc 26/60, tabs 64.2%, photo one-ways 14.9%, ladder 10. norm+ve (stepping stones only) 26/60, tabs 58.9%. norm+vae (ledges + stepping stones) 26/60: tabs 50.6%, photo one-ways 19.7%, photo solid tops 27.1%, rows on tabs 65.6%, median room 50%, 15/26 rooms at 50% or more, stair moves 28.2%, dHop median 0.586.
- Photo desert with norm (PRE=norm node desert.js ...): levels 55.3%, va 45.3%, vc 39.8%, vd 51.0%, ve 53.2%, vae 44.5%.
- vae with a fallback to va, then to today's repair, modelled from the JSON and not built: 32/60 built, tabs 55.6%, photo surfaces 41.8%, median room 58%.
- Lost builds under norm+vae against norm+levels: model-1, 4, 11, 25, 47, 53 (route max-range or wall-chain, one 'climb left 23 rows, under 24'). (node -e over measure-normve+vae.json)
- Corpus levelHash (full string, 25 synthetic + sample-room, modes 0 and 1), command nice -n 10 node fixhash.js: live->levels mode 0 2 changed (all-dark, gradient-v now builds), mode 1 22. levels->va mode 0 7 (biome-green bright-door ladder-stack saturated-blobs shelves-a shelves-b sample-room), mode 1 0. ->vb 5 / 0. ->vc 12 (all-light now refused) / 0. ->vd 12, 8 now refused / 11. ->ve 10 / 1. ->vae 15 / 1. Normalisation changes 0 (fixtures are grids; it acts before nearest).
- Build time, Node, min of 3, 61 rooms with norm, load average about 5 on 2 cores (node timing.js): levels median 17.7 / p95 49.7 / max 117.1 ms; va 21.5 / 57.4 / 124.8; ve 24.0 / 77.7 / 91.8; vae 18.8 / 75.4 / 109.6. Single-pass measure.js runs were noisier (levels p95 44-118 ms).

### Options

- **(a) edge ledges.** Pipeline A. The boundary between two open cells is a one-way when the lower cell is not wall paint (wall = the top two open entries) and the two differ by more than 30 in L in either direction, by more than 0.35 in saturation, or sit in different hue bands. Runs of 3 or more. va.html.
  - Effect: Raw capture: tabs 73.8% -> 72.5%, photo one-way cells 2.6 -> 8.4 per room, ladder 0 -> 2, builds 26/60 (unchanged), desert 60.4% -> 57.5%. With norm: tabs 65.4%, 25.3 one-way cells per room, ladder 6, builds 28/60 against 32.
  - Cost: Changes 7/26 fixture levelHash (mode 0). Since only the pal grid is persisted, every old share code whose grid has such an edge rebuilds a different level. The shipped sample-room changes. Keeps H-pipe-4 (runs of 3, open over open). About 20 lines in core-pipeline. Visually the ledges are the photo's own edges (window sills, frame and poster tops, shelf boards), so furniture and help stay distinct.
- **(b) local adaptive solidity.** Pipeline A. Also solid when L is more than 30 below the 7x7 local mean. vb.html.
  - Effect: No useful effect: tabs 74.4%, one-ways 2.5 per room, builds 26/60. The palette's L steps (75 / 139 / 199 / 239) are too coarse for a local threshold to find anything Otsu missed.
  - Cost: Changes 5/26 fixtures. Not worth building.
- **(c) colour region tops.** Pipeline A. The top edge of every non-wall same-entry region of 3 cells up to 15% of the room, runs of 2 or more. vc.html.
  - Effect: Raw: tabs 72.2%, 9.1 one-way cells per room. With norm: tabs 64.2%, photo one-ways 14.9%, ladder 10, desert 39.8% (the best), builds 26/60.
  - Cost: Changes 12/26 fixtures and all-light becomes needsCrop. Runs of 2 break H-pipe-4 and DESIGN 6.4's 3-cell minimum. Noisier ledges, since every colour patch gets a lid.
- **(d) figure and ground by wall paint.** Pipeline A. Any entry that is not wall paint is solid. vd.html.
  - Effect: Raw: builds 28/60, tabs 71.1%.
  - Cost: Refuses 8 corpus fixtures (biome-attic/deep/ember/frost/green, shelves-a, trap-pattern, sample-room). Rejected.
- **capture normalisation.** Capture side, before nearest: half-strength grey-world white balance, then the 3rd to 97th L percentile stretched to 24..240. norm.js.
  - Effect: sb-levels builds 26 -> 32/60. Biome mix among built rooms moves from attic 25 / frost 1 to attic 25 / frost 6 / ember 1. Doors 3 -> 14. Distinct entries per grid 8 -> 10. Tab share unchanged (73.3%). Astra sample still refused ('ceiling ... exit unreached'). Does not make green walls green (Moss 0.5%).
  - Cost: Changes only what new photos persist: old share codes keep their levels, 0 fixtures change. Lives in shell-capture, not the core, so the capture oracle and test/capture.mjs need the same step. About 20 lines.
- **(e) stepping-stone repair, on (a), with normalisation.** Pipeline B. While the exit is unreached, each repair pass aims at the nearest unreached photo standing cell above the highest reached row; up to 8 passes. Today's rule takes over when there is no such cell. vae.html, ve.html (e alone).
  - Effect: Tabs 73.8% -> 50.6% of standing cells; photo surfaces 46.8% (one-ways 19.7%, solid tops 27.1%); rows climbed on tabs 88.8% -> 65.6%; stair moves 58.9% -> 28.2%; dHop 0.500 -> 0.586; desert 44.5%. Builds 26/60, losing 6 of norm's 32 to route-score max-range or wall-chain. With a fallback to today's repair (modelled, not built): 32/60 and tabs 55.6%. Build p95 49.7 -> 75.4 ms (Node, loaded box).
  - Cost: Changes 15/26 fixtures in mode 0 and 1 in mode 1. Pipeline B is recomputed from the grid too, so old share codes rebuild different levels; to keep them, gate the new rules on record v:2 (rec.v is 1 today). It also reinterprets DESIGN 6.7's 'stair toward the unreached mass', a design redline. Still needs the fallback, the route-score failures understood, and the 50 ms budget checked on the phone. About 30 lines in repair().

### Recommendation

Build the capture normalisation first, on its own. It is the only change measured here that cannot cost anything: old share codes keep their levels, 0 of 26 fixtures change, buildability goes from 26 to 32 of 60 model rooms, and Frost and Ember start showing up.

Then build option (e) with (a): edge ledges plus the stepping-stone repair, with today's repair as the fallback when stepping stones fail. Gate it on a new record version (v:2) so v1 codes keep their levels. Measured on the model, film drops from 73.8% to 50.6% of the main ascent's standing cells (55.6% once the fallback restores 32 of 60 builds). Rows climbed on film drop from 88.8% to 65.6%, and the stair's own moves from 58.9% to 28.2% of all moves.

On model-7 and model-30 the climb now reaches the bookcase top and the shelf and poster ledges ("I climbed my bookshelf"). On a bare-wall room (model-0) it is still a film stair, honestly.

Do not build (b) or (d). (c) is (a) with run-2 ledges, and it breaks H-pipe-4.

Be honest with Stephen about the limit. Even the best reading leaves 44.5% of climb rows with no photo surface at all, because a full-height portrait of a room is about 60% wall. "Same every time" needs two more things that pipeline A cannot supply: colour (a palette with pale tints) and a reason to climb (progression).

### Stephen's calls

- Palette (Astra's palette, DESIGN 11): no green or pastel wall can survive nearest() while the 16 entries hold one green and no pale tints, and Film is reserved. Adding a light green, blue or pink means replacing an entry, which re-colours and re-levels every old code that uses that index. Is colour fidelity worth that?
- Old share codes: accept that a pipeline A or B change rebuilds different levels from old codes, or gate the new rules on record v:2 so v1 codes keep theirs.
- DESIGN 6.7: allow repair to bridge to the photo's surfaces (stepping stones, up to 8 passes) instead of only heading for the exit or the unreached mass.
- Framing: the default box is the full room height, so the upper half is wall. Should the crop screen ask for a tall object (bookcase, shelves) instead of 'the room'?
- The sameness complaint is also about progression ('nothing to build towards'). No pipeline change answers that.

### Boards

- /home/codespace/sb-drafts/sameness/claude/boards2/board-model-7.png: panels left to right are photo, raw grid, live, sb-levels, then three sb-levels pages with the capture normalised: plain, edge ledges, edge ledges + stepping stones. In the photo: beige wall, window, yellow/blue poster, ceiling lamp, a green bookcase on the left and a white bookcase on the right. Live is refused (red frame). On sb-levels the climb is all film tabs up the empty left wall to the lamp exit, and the white bookcase's shelves go unused. With edge ledges, green ledges appear on the white bookcase shelves and on the poster and lamp tops, but the ascent still takes the left tab stair. With stepping stones as well, the ascent stands on the green bookcase top (row 21), then works up through the poster ledges: 5 tabs instead of 8. A player could say 'I climbed my bookcase'.
- /home/codespace/sb-drafts/sameness/claude/boards2/board-model-30.png: white wall, ceiling strip, a brown bookcase in the centre, a teal poster, wood floor. Live is refused. On sb-levels the bookcase is one solid block and the climb is a tab stair up the open right side. With the capture normalised the ceiling becomes a solid band and the stair is unchanged. With stepping stones the ascent touches the bookcase top (row 16) before crossing to the poster, but most of the climb is still film on the right wall (13 tabs).
- /home/codespace/sb-drafts/sameness/claude/boards2/board-model-22.png: sky-blue wall that quantizes to grey, a teal/orange shelf and poster, a green plant column, a blue sofa, beige carpet. Live builds: a long tab stair up the right wall past the plant. Normalised, it becomes Frost and the stair moves left. With edge ledges, ledges appear on the shelf and poster top and on the plant top. With stepping stones the ascent stands on the plant top and climbs over the poster ledges, which reads as the room. The blue wall shows as grey in every panel: the palette has no pale blue.
- /home/codespace/sb-drafts/sameness/claude/boards2/board-model-0.png: white wall, a picture frame, pink poster, window, green bed, grey dresser, blue rug on wood. Live is refused (the floor). On sb-levels the spawn is on the bed and a long diagonal tab stair crosses blank wall to the top-left exit, with the frame a solid block beside it. Normalised, the bed top becomes a green ledge (spawn on the bed). Stepping stones put the stair up the right side over the window frame. It is still mostly film, because the upper wall is blank. This is the honest worst case.
- /home/codespace/sb-drafts/sameness/claude/boards2/board-model-48.png: white wall, pendant lamp, a beige dresser, a dark bed with a pink and green headboard art. Live is refused. Every built version spawns on the dresser/bed top and climbs a tab zigzag up the blank upper wall to the top-right. Stepping stones shift the stair left of the art and add nothing photo-made above it. The photo has nothing up there.
- /home/codespace/sb-drafts/sameness/claude/boards2/board-astra-sample.png: Astra's illustrated attic bedroom (sloped wooden ceiling, wall shelves, bookcase, bed, rug). Raw, the grid is almost all Walnut (wood) and Pewter (the warm wall), and every page refuses it as solid ('dark'). Normalised, the wall opens to light grey and edge ledges appear on the shelves and the bed, but the wooden roof is a solid band and every variant refuses it ('ceiling ... exit unreached'). The game's own sample photo does not build.
- Earlier set, superseded and not fully opened: /home/codespace/sb-drafts/sameness/claude/boards/ holds board-model-0, -7, -48 and -astra-sample (opened; same findings as above with vb, vc and raw columns) and board-model-9, -21, -3, -1, which I did NOT open.

### Unknowns

- No real photos: the photos folder was empty. The room model is flat painted rectangles with gradient, vignette and noise, with no perspective or clutter. Real rooms may have more ledges (shelves, outlets, curtains) or worse light.
- sb-levels is work in progress at 528174ccd (snapshotted as levels.html). Its numbers will move as that branch moves.
- Only the reach graph and the route score were run, not the sim. Whether the new photo ledges feel good to jump on is unplayed.
- Timing was on a loaded 2-core box in Node, not on a Pixel. The base page's own p95 was already about 50 ms.
- Why stepping stones lose 6 builds to max-range or wall-chain was not chased. The fallback recovering them is modelled from the JSON, not built.
- Biome effects of a palette change were not prototyped.

## The goal and the ramp

### Diagnosis

I've written the progression proposal to /home/codespace/sb-drafts/sameness/progression.md. Nothing in any worktree was edited, and nothing was played; every number below comes from painted room models.

**Why it feels like nothing:** the design already has a goal, a ramp and things to collect, but none of it is built. sb-m1-3 is single free play rooms that never end and never get harder.
- **No end goal.** House runs are not built: the save's `run` is always null. The shell never marks a room as room 5. The level builder will pick a boss body from the photo when asked, and the game state has a slot for a boss, but there is no boss code at all.
- **No ramp.** Every room uses the same limits (4 enemies, 1 elite). Only the first room ever is softer.
- **Nothing to spend on.** Dead pixels are added at each clear, but no screen spends them. The Darkroom and blueprints are not built.
- **"Anvil Boots and the Boomerang over and over"** has a one-line cause: the build only has those two weapons (`WEAPONS_BUILT: ['J1','D1']`, index.html:502). Kept gear fills both slots within two chests; after that every chest pays 15 dead pixels and nothing else. Tonight's weapons step 2 only fills the jump slot (J2 to J8), so the dive slot stays Anvil Boots until step 3. Half his complaint survives tonight.

**The models:** 60 painted rooms plus Astra's sample room, through the page's own crop box. The photos folder was empty, so none of Stephen's photos were run.
- Live sb-m1-3 builds 3 of 60. The sb-levels branch (as of 2eff8e42c) builds 26 of 60. Astra's sample room is refused on both.
- Of the 26 built rooms, 25 are Attic, so every enemy is a moth. That confirms the lead's reading for enemies and biome.
- Mean 1.62 enemies per room, 15% have none, and no room gets a trap field.

**What that means for a ramp:**
- **Raising the enemy limit does nothing.** With the limits removed entirely, the photo still offers a median of 2 enemy spots; only 7.7% of rooms have 5 or more.
- **There is room for more.** Every built room has at least 9 legal standing cells (median 24) and at least 238 legal flying cells (median 434). So a ramp must place enemies of its own, and lean on elites and toughness.
- **The boss mostly works.** 73% of rooms used as room 5 have a saturated patch of 12 or more cells, which becomes the boss body. The rest get the default clay boss.
- **Boss HP needs a cap.** Bodies run from 12 to 108 cells, and HP equals cell count.

**Economy at the design's placeholder prices:** a room pays a median of 29 dead pixels if everything is taken, so a cleared house is about 205. Developing all 24 weapons plus the four unlocks costs 5,580, about 27 house clears.

**The proposal: the design's own spine, in a new order.**
- **The goal:** a five room house run that ends with a boss (the guardian), using the ramp table below.
- **The long game:** blueprints you carry, then develop in the Darkroom into a collection shown as a contact sheet of 24 frames, dark until developed. The design's unlocks hang off it.
- **The lighter option, "Film rank":** one level bar that rises with clears and kills and unlocks things at milestones. It is about one lane and works in free play. But it gives progress, not an ending, so it does not fix "no real goal at the end". It also creates a second unlock path beside the Darkroom.
- **Different weapons per biome:** it fits the design as long as it only re-weights weapons the player has loaded (2 tickets to 1). It will be invisible until the colour fix, because almost every room is Attic today.

The full screens and wording for each step are in section 2.3 of the file.

### Measurements

- 3 of 60 painted rooms build on live sb-m1-3 and 26 of 60 on sb-levels (2eff8e42c); Astra's sample room is refused on both. Command: cd /home/codespace/sb-drafts/sameness/progression && nice -n 10 node measure.js
- Biomes of built rooms: live attic 3; sb-levels attic 25, frost 1 (measure.js)
- Enemies per built room at the current limit of 4 (sb-levels): {0:4, 1:10, 2:7, 3:2, 4:3}, mean 1.62 (measure.js)
- Enemy spots the photo offers with the limits removed (a scratch page copy, levels-cap99.html): {0:4, 1:7, 2:10, 3:1, 4:2, 5:1, 12:1}; 5 or more spots in 7.7% of rooms, 6 or more in 3.8% (measure.js)
- Rooms with an elite: 18 of 26 on sb-levels, 2 of 3 on live (measure.js)
- Trap field 0% (0 of 26), pocket 65.4%, Darkroom door 11.5%, default spread 0% (measure.js, sb-levels)
- Built as room 5: a saturated patch of 12+ cells (a real boss body) in 73.1% of rooms; sizes 12 to 108, median 24; the other 26.9% get the default clay boss (measure.js)
- Specks per room mean 0.65; dead pixels per room if everything is taken (chest 15, speck 4, fodder 3, elite 10): median 29, min 15, max 38 (PAGES=levels nice -n 10 node measure.js)
- Cells that could legally take an extra enemy: flying min 238, median 434; standing min 9, median 24; 0 of 26 rooms under 4 standing cells. Command: nice -n 10 node spots.js
- With enemy floors of 2, 3 and 4, the ramp adds enemies in 14, 21 and 23 of 26 rooms (worked out from the enemy counts above)
- The build has only two weapons: WEAPONS_BUILT ['J1','D1'] at index.html:502 (/usr/bin/grep -n WEAPONS_BUILT index.html)
- Economy at placeholder prices: a cleared house is about 5 x 29 + 60 = 205 dead pixels; all 24 weapons cost 6x30 + 9x100 + 9x300 = 3,780 and the four unlocks 1,800, so 5,580 is about 27 house clears (worked out by hand from TUNING at index.html:495-503)

### Options

- **Slice 1: the house (recommended first).** Lane A: a saved five room run (resume, Retry House, 'Room n of 5' in the top strip, a doorway card between rooms), the ramp table and a 'Use a recent room' button so a refused photo never blocks a run. The ramp: room 1 is today's rules; rooms 2, 3 and 4 get at least 2, 3 and 4 enemies (extra ones placed by the existing safety rules); from room 3 the farthest enemy is promoted to an elite if the photo gives none; room 4 enemies have 1.5x HP and move 1.25x faster; hearts carry through the house with +1 at each doorway. Lane B: the default clay boss in every room 5 (20 HP, sheds 3 moths every 4 s, 2 s intro, exit dark until it dies, 60 dead pixels), the arena safety checks for it, and a house clear card. Lands on top of sb-levels.
  - Effect: Adds enemies in 14, 21 and 23 of 26 built rooms in rooms 2, 3 and 4. Every built room has room for them (at least 9 standing cells). Gives each sitting an end and about 205 dead pixels per cleared house.
  - Cost: 2 build lanes, about 240 BUILD-PLAN minutes. Room 1 is unchanged, so existing goldens and share codes stay. Adds a room-index setting, writes the save's existing `run` field, and touches the title, clear and death cards (merge with sb-levels). The ramp is a DESIGN redline. Risks: a difficulty spike the test bot must still walk, the moths the boss sheds need enemy slots set aside in advance, and every room 5 looks the same until the real boss lands.
- **The long game: blueprints plus the Darkroom collector.** Blueprints (T2.6) dropped, carried, lost on death and banked at doorways. The Darkroom (T2.9) at doorways and on the title: develop blueprints into a 24 frame contact sheet (30, 100 or 300 dead pixels by tier), load 4 per slot into the drop pool, buy the design's unlocks.
  - Effect: Gives dead pixels a use and a visible collection. A full contact sheet is the long goal, about 27 house clears at the placeholder prices.
  - Cost: 2 lanes, about 150 minutes. The save already has the fields, so no migration. The loaded pool replaces BUILT in the chest draw. Prices are unproven until the T2.12 economy log. Heavy on new screens.
- **The real boss from the photo.** T2.10a (boss body from the photo's biggest saturated patch, cells eroding as it is hit), T2.10b (five biome movesets with warnings), T2.11 (arena safety checks for every body), with an HP cap.
  - Effect: 73% of rooms 5 get a boss shaped by the photo; the default clay boss covers the rest.
  - Cost: 2 lanes, about 180 minutes. Highest risk: arena fairness on odd shapes, and bodies of up to 108 cells would mean 108 HP without a cap (DESIGN redline). Adds a new armed golden for room 5.
- **Lighter alternative: Film rank (a bug level).** One saved counter: +10 per room cleared, +1 per kill, +3 per elite, +5 per house room. A bar on the title and clear card; milestones put new weapons in the drop pool, add base hearts and unlock modes. Works in free play.
  - Effect: Every room moves a number, for about 1 lane. But it gives no ending to a sitting, so it does not answer 'no real goal at the end'.
  - Cost: About 1 lane and low risk (a new save key is filled in by the existing save check). It creates a second unlock path beside DESIGN's blueprints and Darkroom that would later need retiring or merging. Extra hearts from rank work against any ramp. Nothing left once maxed.
- **Biome lean in weapon drops.** Each weapon has a home biome. In a matching room it gets 2 tickets to everyone else's 1, but only among the weapons in the pool (BUILT, or what the player loaded). With 4 loaded and one at home, the home weapon drops 40% of the time.
  - Effect: Different weapons per biome, as he asked. Fits DESIGN 9.3's 'never dilutes', and DESIGN 9.2 already does this for scrolls. Invisible today: 25 of 26 built rooms are Attic.
  - Cost: Small amount of code. The chest's single random draw becomes weighted, so armed goldens move. Build it after the colour fix, not before.

### Recommendation

Build DESIGN's own spine, starting with slice 1, the house. It goes on top of sb-levels, because live builds only 3 of 60 rooms and a five room run cannot be played without the levels rule. Slice 1 is a saved five room run, the ramp table, carried hearts and the default clay boss in room 5, in 2 lanes. Next comes weapons step 3: it is the only thing that stops the dive slot from being Anvil Boots forever, since step 2 only fills the jump slot. Then blueprints and the Darkroom contact sheet for the long game, then the real boss from the photo with an HP cap of about 40, then charms and stats (steps 4 and 5), then the economy log and the M2 deploy. Free play stays flat as the relaxed mode. Film rank is cheaper, but it gives progress without an ending, so it does not fix 'no real goal at the end'. If a bar is wanted, show lifetime dead pixels on the title as display only, and keep the Darkroom as the one way to unlock things. Add the biome lean (2 to 1, only among loaded weapons) after the colour and biome fix.

### Stephen's calls

- The house is the mode with the goal: 'Start a house' leads the title after the first clear, and free play stays flat with no ramp.
- The ramp table (a DESIGN redline): at least 2, 3 and 4 enemies in rooms 2 to 4, an elite guaranteed from room 3, room 4 enemies at 1.5x HP and 1.25x speed.
- Hearts carry through a house with +1 at each doorway, or every room refills them.
- Slice 1's boss is the default clay boss in every room 5 until the photo boss lands, or wait for the real boss.
- Cap boss HP at 40 (DESIGN says HP equals cell count; the models reach 108).
- The house clear cosmetic: DESIGN 8 promises one, but 9.4 says cosmetics are Sunbeams only. Proposed: one free frame style for the first house clear.
- Biome lean: 2 to 1, only among loaded weapons, after the colour fix; approve the home biome table in progression.md section 4.
- DESIGN's route or the Film rank alternative (recommended: DESIGN's route).

### Boards

- No board images were made for this question; every claim is a printed number from measure.js or spots.js under /home/codespace/sb-drafts/sameness/progression/. The full proposal is /home/codespace/sb-drafts/sameness/progression.md.

### Unknowns

- No real photos: the photos folder was empty. Every number comes from painted models: 26 built on sb-levels and 3 on live.
- The colour study's fix will change how much of a room counts as saturated, and with it enemy counts, boss bodies and biomes. The 73% real-boss share will move. The ramp's enemy floors are designed to hold either way.
- sb-levels was mid work (WIP autosave 2eff8e42c); its final rule may change which rooms build.
- Nothing was played. The ramp numbers, the boss HP cap and the per-lane effort are judgment, not playtest or measurement. Prices wait on the T2.12 economy log.
- The default clay boss's moths need enemy slots set aside in advance; the cost of that in the current game state was not measured.


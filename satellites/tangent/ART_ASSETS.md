# TANGENT art asset list

Written 2026-09-02 from the shipped code at `satellites/tangent/index.html` (2106 lines, 100,926 bytes), the shots in `docs/shots/`, and the design docs. Every size below was measured by running the game's own camera functions headless at 375x667 (DPR 2), not estimated. Director's brief: "tangent is getting fun but needs a lot more. Everything is very plain and boring."

## What the game is

A ferrofluid droplet rides a spinning machined dish: holding the throttle spins the dish up and walks the droplet outward into a wider orbit (`r = omega^2 / BOWL`), and letting go launches it on its current tangent into a small gravity system of named bodies where it must land on the one target and miss the rest (`doRelease` line 1056, `flyStep` line 821). Before each run a build phase bolts parts to the dish (rail, bumper, brake, booster, vane) to route the droplet through checkpoint gates under a mass balance rule, and black holes turn the whole system inside out by circle inversion so that some bodies only exist, or only become the target, on the far side (`beginInversion` line 636, `isTarget` line 606).

## Render architecture

- One fixed canvas `#cv` (HTML line 141) filling the viewport. `resize()` (line 1988) reads `visualViewport`, sets `DPR = min(2, devicePixelRatio)`, and sizes the backing store `W*DPR` by `H*DPR`. Everything is drawn in CSS pixels through `ctx.setTransform(DPR,0,0,DPR,0,0)`.
- Loop: `frame()` (line 1948) runs on `requestAnimationFrame`, steps the simulation at a fixed 1/120 s through an accumulator, then calls `draw()` (line 1277) once per frame. No sprite system, no image loader, no asset folder exists. Everything is procedural vector paths and gradients.
- World to screen: world units go through `camScale()` (line 1269) and `camOrigin()` (line 1270). The deck is 200 world units across (`DECK_R = 100`). The camera fits into the band between the two HUD strips (`viewBand` line 1224), `fit = min(W, H - hudTop - hudBot)`, and the scale is:
  - build phase: `fit * 0.80 / 200`
  - spin phase: `fit * 0.68 / 200`
  - flight and result: `fit / (systemExtent * 2) * 0.92`
  - inversion collapse (first 55 percent of the animation): `fit * 0.72 / (R * 2)` framed on the hole's horizon ring
- Measured at 375x667: `hudTop` 128 (the criteria chips wrap to two rows on every system, even system 1), `hudBot` 302 build, 140 spin, 100 flight. Scales: build 0.948, spin 1.275, flight 0.241 to 0.327 depending on the system, collapse 1.144 to 1.406. So the deck is 190 px across while building, 255 px while aiming, and 48 to 65 px in flight.
- Draw order in `draw()`: starfield blit (line 1280) → world transform with shake → bodies → deck → prediction (spin) → flight trail → ball → screen space inversion stack (difference white, multiply tint, screen bloom, lines 1314 to 1332) → starfield multiplied back (line 1342) → during any inversion the bodies, ball and horizon flash are painted again ON TOP of the composite (line 1345) → `drawOverlay()` chevrons and readout panel (line 1900). The HUD is DOM over the canvas.
- Two offscreen caches: the starfield (`makeStars` line 495, rebuilt per resize) and the deck face (`makeDeckFace` line 1446, a 572 px square at DPR 2, rebuilt per resize). Both are plain `drawImage` blits already, which is why they are the two cheapest art drops in the game.

## The palette the code actually uses (hex)

| Token | Hex | Where |
|---|---|---|
| ground | 0E141C | page background, HUD gradients |
| sky | 04050A | starfield base, nebula hues 200 to 310 at 14 percent |
| deck | 1B2431 | buttons, cards, panels |
| deck face | 0B0F16 → 141A24 → 1E2734 | `drawDeckFace` radial |
| lip | 46586C | rim wall stroke, bevel CEE0F6 at 22 percent |
| bolts / hub | 26303E / 27333F, stroke 4A5D71 | 12 bolts, hub |
| etch | 3A4A5C | rings, spokes, borders |
| ferro fill | 232733 → 12141C → 05060A | every droplet and body |
| ball rim | A06CFF (hue 268) → 40C4E8 (hue 196) → F7C24A (hue 44) | `drawDroplet` |
| target rim | hue 188 (5FD8E6) → hue 266 (9B7CFF) near side | `paintFerro` |
| hazard rim | hue 322 (F05AB4) → hue 32 (F7A24A) | `paintFerro` |
| Maw far side | tint 7A2E12 multiply, bloom 2A0A18, rims hue 22 / 340 | seared rust |
| Cess far side | tint 123A22 multiply, bloom 04160C, rims hue 96 / 160 | verdant green |
| Nix far side | tint 0E3A46 multiply, bloom 00131A, rims hue 168 / 210 | drowned teal |
| default far side | tint 3A1C5C | only if a hole has no `other` block (none do today) |
| hole | core 000000, halo 9B5CFF, ring BE96FF at 30 percent, crowns hue 272 to 304 | `drawHole` |
| entry bearing | B48CFF | `drawEntryBearing` |
| tele (cyan) | 79D0E6 | gates, vane, prediction, target chevron |
| ball / amber | F2A93B | index mark, booster, throttle fill, hold ghost, score |
| warn (pink) | E0517B | bumper, hazard chevron, bad balance |
| ok (green) | 6FCF97 | crossed gate, clears verdict, met chip |
| rail | 8FA3BF core, C3D2E2 highlight | `drawPart` |
| brake | 4E6E8E | `drawPart` |
| ink / ink dim | D8E2EC / 7C8B9B | all text |

**Tangent style line (used once in every prompt below):**
Tangent style: matte black ferrofluid liquid forms on deep space, near-black glossy droplets 12141C with thin oil-slick iridescent rims running violet A06CFF through cyan 40C4E8 to gold F7C24A, one hard white specular E8F0FF, cold machined gunmetal steel 1B2431 with fine etched lines 3A4A5C, cool cyan 79D0E6 and warm amber F2A93B as the two accent lights, magenta pink E0517B for danger, deep violet 9B5CFF for the void, clean vector-crisp game-asset edges, high contrast readable silhouettes, no text, no watermark, flat FF00FF magenta background for cutout.

## How art drops in, sheet by sheet

The design log D11 says the droplet, bodies and hole are procedural and field-reactive and must not be replaced by static art, because the spikes are a readout of gravity. Two ways to honour that and still get art on screen, the Director picks:

- **Texture inside the procedural outline (keeps D11).** After `tracePts(ferroBlob(...))` builds the path, `ctx.save(); ctx.clip(); ctx.drawImage(cell, ...); ctx.restore();` then keep the existing rim stroke and specular. The spikes still move with the field; the surface gets the art.
- **Straight swap (breaks D11, simplest).** Replace the path and gradient with one `drawImage` centred on the body, rotated to the field angle `fa`.

Both are `PATCH-REQUIRED`. Sheets 04, 07 and 08 are drop-in or nearly so.

| Sheet | Function and line | What the drawImage replaces | In-game px at 375x667 |
|---|---|---|---|
| 01 Droplet | `drawDroplet` line 1694; fill at lines 1719 to 1728 | `tracePts(ferroBlob(x,y,R,fa,s,3.1,64))` plus the radial fill; the squash transform at lines 1716 to 1718 already stretches along velocity, so a drawImage inside it inherits the stretch | 18 px across in spin, 14 px in flight (screen floor `7/camScale`), pinches to about 3 px at the collapse midpoint (`drawBall` line 1673, lines 1676 to 1685) |
| 02 Bodies | `drawBodies` line 1395; halo at line 1419 to 1424, body at lines 1428 to 1430, off-side outline at lines 1399 to 1409 | halo radial gradient (size `reach*2`), then `tracePts(ferroBlob)` + `paintFerro` | body 12 to 25 px across in flight (r 22 to 44 world at 0.24 to 0.33 scale); halo 60 to 330 px across; off-side outline same size, dashed |
| 03 Hole | `drawHole` line 1363: horizon ring 1366 to 1368, concentric rings 1369 to 1374, core gradient 1375 to 1378, three spike crowns 1380 to 1385, core 1386 to 1388; `drawHorizonFlash` line 1739 | all of it, one drawImage for the core plus crowns rotated by `ferroT`, one for the ring, one for the flash | core 19 px, halo 40 px, horizon ring 66 px in flight; core 78 px and ring 270 px in the collapse framing |
| 04 Deck | `makeDeckFace` line 1446: replace the call `drawDeckFace()` at line 1452 with `c.drawImage(face,0,0,px,px)`; the blit at line 1513 already exists | the whole turned face: gradient, 46 cut rings, sheen, lip, 12 bolts, 4 rings, 12 spokes, hub | 190 px build, 255 px spin, 48 to 65 px flight; the cache is 572 px square at DPR 2 so author at 1024 |
| 05 Parts and gates | `drawPart` line 1585 (rail 1587, bumper 1591, brake 1594, vane 1598, booster 1610); gate rings at lines 1559 to 1567; centre of mass mark 1577 to 1580; ghost start dot line 1555 | each branch's path | build / spin: bumper 16 / 22, brake 28 / 38, booster 23 / 31, vane 25 / 33, gate 25 to 28 / 33 to 38, rail 4.7 px wide by 21 px (default) to 180 px long, CoM mark 8 px, ghost dot 8 px |
| 06 Marks | `drawPrediction` end cap line 1635; `drawEntryBearing` line 1654; `drawChevrons` triangle at line 1871 | 8 to 12 px end cap, 10 px ring plus tick, 12 by 11 px triangle | screen space, fixed |
| 07 Backgrounds | `draw()` line 1280 `ctx.drawImage(starCv,0,0,W,H)` and the far-side multiply pass at line 1342; `makeStars` line 495 | the baked starfield; on the far side draw the far-side plate at line 1342 with source-over at alpha `(invAmt-0.5)*2` instead of multiplying the near-side stars back | full bleed, drawn stretched to W by H so author portrait 1080x2340 and patch the call to cover-fit |
| 08 UI chrome | CSS: `.chip` line 33, `.tool` line 53, `.gauge` line 63, `button.act` line 72, `#throttle` line 81, `#release` line 88, `.card` line 95, `.lvrow` line 112, `.lvrow .m` line 121, `.tog` line 130, `.lvcaret` line 28; readout panel `drawOverlay` line 1907 | CSS `background-image` on each, art fills the plate and text stays HTML | chip 87x24, tool 113x52, gauge 351x34, act button 48 tall (Clear deck 124, Spin up 217, full width 351), throttle 224x88, release 118x88, caret 68x24, card 347 wide, level row 309x48, medal dot 7x7, toggle 52x26, panel 162x74 (132x66 under 360 wide) |
| 09 Screens | DOM cards `#settings` line 183, `#levels` line 196, `#card` line 207; `openLevels` line 1026, `showCard` line 1190, `failRun` line 1065 | there is no title screen, no how-to screen and no pause screen in the code; art for those is for screens that would have to be built | card 347 wide, level list 309x320, results score 46 px tall |
| 10 Moments | `step()` line 1068 (land, crash, lost, gate at `checkGates` line 1135), `rimWall` line 768, `collideOn` line 789, `failRun` line 1065, `drawFlight` line 1667 | nothing: none of these moments has a visual today, only a sound and a screen shake | stamp at the droplet, 24 to 64 px |

If the game scales with viewport (it does), the formula for any world size is `px = world * fit * FILL / 200` on the deck, and `px = world * fit * 0.92 / (2 * systemExtent)` in flight, with `fit = min(W, H - hudTop - hudBot)`.

## Asset table

| id | what it is | where it draws | in-game px (375x667) | cells | pri |
|---|---|---|---|---|---|
| 01 | The droplet (the player's ball) | `drawDroplet` 1694, `drawBall` 1673 | 18 spin / 14 flight / 3 pinch | 12 (6 states, trail 3, pinch 3) | 2 |
| 02 | Gravity bodies: target, hazard, heavy, flip body, off-side outline, far-side variants | `drawBodies` 1395 | 12 to 25, halos 60 to 330 | 12 | 1 |
| 03 | The hole: core with spike crowns, horizon ring, collapse flash | `drawHole` 1363, `drawHorizonFlash` 1739 | core 19 / 78, ring 66 / 270 | 6 | 2 |
| 04 | The deck face, index mark, orbit ring, tear-apart | `makeDeckFace` 1446, `drawDeck` 1505 | 190 / 255 / 48 to 65 | 6 (one at 1024) | 1 |
| 05 | Deck parts and gates: rail 3-slice, bumper, brake, booster, vane, erase, gate open, gate crossed, CoM mark ok/bad, ghost dot, drag ghost | `drawPart` 1585, `drawDeck` 1555 to 1580 | 16 to 38, rail 4.7 wide | 15 | 2 |
| 06 | Prediction end caps, entry bearing mark, edge chevrons | `drawPrediction` 1635, `drawEntryBearing` 1654, `drawChevrons` 1871 | 8 to 12 | 12 | 3 |
| 07 | Backgrounds: near-side starfield, Maw, Cess, Nix far-side plates | `draw` 1280 and 1342, `makeStars` 495 | full bleed | 4 plates at 1080x2340 | 1 |
| 08 | UI chrome: chips, tool buttons, gauge, act buttons, throttle, release, caret, card frame, level row, medal dots, toggles, readout panel, scrim | CSS lines 28 to 136, `drawOverlay` 1907 | 7 to 351 | 26 | 3 |
| 09 | Screens: title emblem (no title screen exists), 8 system icons, 6 outcome emblems, lock, portal thumb | `#levels`, `#card`, `showCard`, portal card | 347 card, 512 thumb | 17 | 2 |
| 10 | Moments FX: release, gate cross, wall rub, rail tick, landing, crash, tear-apart, lost, trail droplets | `step` 1068, `rimWall` 768, `collideOn` 789, `failRun` 1065, `drawFlight` 1667 | 24 to 64 | 24 (8 moments x 3 frames) | 2 |

Ten sheets. Priority 1: 04 Deck, 02 Bodies, 07 Backgrounds. Those three are what the player looks at for the whole run and they are the three the Director called plain: a grey wireframe disc, small dark blobs, and a flat starfield.

---

## Sheet 01: The droplet

**PATCH-REQUIRED wiring:** `drawDroplet(x,y)` (line 1694) builds the outline with `tracePts(ferroBlob(x,y,R,fa,s,3.1,64))` at line 1719 and fills it with a radial gradient under a violet shadow (lines 1724 to 1728), then strokes the iridescent rim (lines 1729 to 1734) and paints the specular (lines 1734 to 1735). The render radius is `R = max(BALL_R*2.05, 7/camScale())` (line 1707): 6.97 world units on the deck (18 px at spin scale), and a 7 px screen floor in flight (14 px across). To use a cell: keep the transform at lines 1716 to 1718 (it squashes along velocity, harder against the rim wall), then `ctx.translate(x,y); ctx.rotate(fa); ctx.drawImage(cell, -R*1.6, -R*1.6, R*3.2, R*3.2)` where `fa` is the field angle the spikes point along. Pick the cell by state: `s` (field strength 0 to 1) picks calm / reaching / spiked, `phase==="spin" && len(x,y)>DECK_R-CONTACT` picks rim-squashed, and `inverting` (in `drawBall`, lines 1676 to 1685) picks the pinch frames by `pull = 1-|t-0.5|*2`. The 64 point blob and the `ferroBlob` maths stay for the collision-free rim stroke if the Director wants the texture-inside option. The spin trail at line 1688 and the flight trail in `drawFlight` (line 1669) are plain strokes; the three trail droplet cells stamp along them every 8th point.

**Shape law:** at 14 px the droplet must read as a teardrop with a bright edge, not a dot. States differ by silhouette: calm is a round bead, reaching grows two opposite cones, spiked grows a comb of 5 to 7 cones on the pole facing the pull, rim-squashed is a wide lens flattened on one side, the pinch is a thin spindle. Never encode state by hue alone: the rim colours stay the same in every cell.

**PROMPT (copy-paste):**

Tangent style: matte black ferrofluid liquid forms on deep space, near-black glossy droplets 12141C with thin oil-slick iridescent rims running violet A06CFF through cyan 40C4E8 to gold F7C24A, one hard white specular E8F0FF, cold machined gunmetal steel 1B2431 with fine etched lines 3A4A5C, cool cyan 79D0E6 and warm amber F2A93B as the two accent lights, magenta pink E0517B for danger, deep violet 9B5CFF for the void, clean vector-crisp game-asset edges, high contrast readable silhouettes, no text, no watermark, flat FF00FF magenta background for cutout.
A sprite sheet, 3 rows x 4 columns, each cell 256x256 pixels on flat magenta FF00FF, one object centred per cell. The subject is a single bead of black ferrofluid, body 12141C shading to 05060A, with a thin rim gradient violet A06CFF on the left edge through cyan 40C4E8 to gold F7C24A on the right edge, and one small white E8F0FF highlight upper left.
Row 1, four states of the bead pointing RIGHT: (1) CALM, a perfectly round bead, faint ripple on the surface. (2) REACHING, the bead pulled into a smooth lens with one soft cone on the right pole and one on the left. (3) SPIKED, the bead bristling with a comb of seven sharp cones fanning off the right pole, the left pole smooth, rim gold brightest on the spike tips. (4) RIM SQUASHED, the bead flattened into a wide half-lens pressed against a straight steel edge 46586C along its right side, fluid bulging up and down along that edge.
Row 2, the inversion pinch: (5) the bead stretched into a long thin spindle, violet halo B48CFF around it. (6) the spindle pinched to a needle, almost nothing but a violet ring of light. (7) the bead re-forming from the needle, spikes pointing OUTWARD in every direction. (8) the bead fully re-formed but with its rim gradient reversed, gold left and violet right.
Row 3, trail and glow: (9) three tiny droplets of black fluid in a line, decreasing in size, each with a thin iridescent rim. (10) one tiny droplet with a violet 9B5CFF soft glow. (11) a smear of black fluid with an iridescent edge, the kind a fast bead leaves behind. (12) a small cyan 79D0E6 glowing point, the start mark of a track.
Even spacing, one object per cell, nothing touching cell edges, no text anywhere.

---

## Sheet 02: Gravity bodies

**PATCH-REQUIRED wiring:** `drawBodies()` (line 1395) loops `bodies()`. For an active non-hole body it paints an influence halo (radial gradient from `br` to `reach = sqrt(b.m/40)`, lines 1418 to 1424; that is 60 px across for Cair and 330 px for Lior), then the ferro body with `tracePts(ferroBlob(bx,by,br,fa,s,seed))` and `paintFerro(bx,by,br,fa,s,hA,hB)` (lines 1428 to 1430) where hues are `sideStyle.hueA/hueB` for the target and 322/32 for a hazard. Off-side bodies (`!active(b)`, lines 1399 to 1409) draw only a dashed 30 percent outline and the label "other side". To use cells: halo cell drawn at `(bx-reach, by-reach, reach*2, reach*2)`; body cell drawn at `(bx-br*1.7, by-br*1.7, br*3.4, br*3.4)` rotated by `fa`, picked by role: `isTarget(b)` target, `b.r>=34 && !isTarget(b)` heavy (Bell), `b.targetSide!==undefined` flip (Vex), else hazard. Far-side variants are picked by `sideStyle` (`hueA` 22 Maw, 96 Cess, 168 Nix). During any inversion the bodies are painted ON TOP of the colour inversion (line 1345), so their cells show true colours on the far side; only the sky and deck get inverted. Body radii in the code: 22, 26, 27, 28, 30, 32, 34, 44 world units; in flight that is 12 to 25 px across. Cells are authored at 256 and downscaled about 10x, so the rim band must be fat (at least 12 px in the cell) or it vanishes.

**Shape law:** each role by silhouette at 14 px. Target is a calm round bead with a symmetric soft crown. Hazard is a burr, spikes in every direction. Heavy is a fat oblate lens with a banded equator, wider than tall. Flip body is two-faced: left half calm and rounded, right half burred. Off-side is an empty dashed ring. Far-side variants change rim hue only and keep their role shape, because role is the information and the composite already recolours the world.

**PROMPT (copy-paste):**

Tangent style: matte black ferrofluid liquid forms on deep space, near-black glossy droplets 12141C with thin oil-slick iridescent rims running violet A06CFF through cyan 40C4E8 to gold F7C24A, one hard white specular E8F0FF, cold machined gunmetal steel 1B2431 with fine etched lines 3A4A5C, cool cyan 79D0E6 and warm amber F2A93B as the two accent lights, magenta pink E0517B for danger, deep violet 9B5CFF for the void, clean vector-crisp game-asset edges, high contrast readable silhouettes, no text, no watermark, flat FF00FF magenta background for cutout.
A sprite sheet, 3 rows x 4 columns, each cell 256x256 pixels on flat magenta FF00FF, one object centred per cell, every rim band at least 12 pixels thick.
Row 1, the four body roles, near side: (1) TARGET, a calm round bead of black ferrofluid 12141C with a symmetric soft crown of five short cones on top, rim cyan 5FD8E6 fading to violet 9B7CFF, one white highlight. (2) HAZARD, a burr of black ferrofluid with sharp cones radiating in every direction, rim hot pink F05AB4 fading to orange F7A24A. (3) HEAVY, a fat oblate lens of black fluid wider than tall with three banded rings around its equator, rim dull pink C04A8A to dark orange B87030, heavier and denser than the others. (4) FLIP BODY, a bead whose left half is calm and rounded with a cyan 5FD8E6 rim and whose right half is a bristling burr with a pink F05AB4 rim, split down the middle.
Row 2, off side and halos: (5) OFF SIDE, an empty dashed ring outline in pale grey 96A2B2 at half opacity with nothing inside, the ghost of a body. (6) TARGET HALO, a soft round cyan 79D0E6 glow fading to transparent at the cell edge, no hard edge, very dim centre. (7) HAZARD HALO, the same soft glow in pink E0517B. (8) HEAVY HALO, a soft glow in dull magenta A03A6A with two faint concentric rings inside it.
Row 3, far side rims, same shapes as row 1 cells 1 and 2: (9) target bead with a seared rust rim orange E86A2A to pink E04080, for the Maw's far side. (10) hazard burr with the seared rust rim. (11) target bead with a verdant rim green 7AE05A to teal 4AD0B0, for Cess. (12) target bead with a drowned rim teal 3AD0C0 to blue 4A90E0, for Nix.
Even spacing, one object per cell, nothing touching cell edges, no text anywhere.

---

## Sheet 03: The hole

**PATCH-REQUIRED wiring:** `drawHole(b,x,y,s)` (line 1363) draws, in order, the dashed horizon ring at radius `R` (lines 1366 to 1368, 66 px across in flight, 270 px in the collapse framing), four concentric violet rings out to `r*3.2` (lines 1369 to 1374), a black core gradient to `r*2.1` (lines 1375 to 1378, 40 px), three counter-sheared spike crowns at `r*1.42`, `r*1.26`, `r*1.10` rotating at different rates (lines 1380 to 1385), and the black core with a 9B5CFF stroke (lines 1386 to 1388, 19 px in flight, 78 px during collapse). To use cells: one core-plus-crowns cell drawn at `(x-r*s*1.6, y-r*s*1.6, r*s*3.2, r*s*3.2)` rotated by `ferroT*0.7`; a second crown cell rotated the other way by `ferroT*0.5` for the counter-shear; the horizon ring cell at `(x-R, y-R, R*2, R*2)`. `drawHorizonFlash()` (line 1739) lights the ring at the collapse midpoint with `peak = 1-|t-0.5|*2`: white stroke up to 17 px wide plus a violet stroke up to 46 px wide plus three thin echo rings; replace with the flash cell scaled `1+0.3*peak` at alpha `peak*peak`. The hole is painted in the actor pass during inversion so its cell keeps its own colours. Holes in the code: Maw r 34 R 118, Cess r 32 R 110, Nix r 22 R 96.

**Shape law:** the hole must never read as a body. Bodies are convex beads; the hole is a black disc with a torn, sheared crown that looks like it is turning. The horizon ring is a separate thin dashed circle much larger than the core; at 66 px it must stay a ring, not a disc. The flash is a ring too, brighter and thicker, never a filled burst.

**PROMPT (copy-paste):**

Tangent style: matte black ferrofluid liquid forms on deep space, near-black glossy droplets 12141C with thin oil-slick iridescent rims running violet A06CFF through cyan 40C4E8 to gold F7C24A, one hard white specular E8F0FF, cold machined gunmetal steel 1B2431 with fine etched lines 3A4A5C, cool cyan 79D0E6 and warm amber F2A93B as the two accent lights, magenta pink E0517B for danger, deep violet 9B5CFF for the void, clean vector-crisp game-asset edges, high contrast readable silhouettes, no text, no watermark, flat FF00FF magenta background for cutout.
A sprite sheet, 2 rows x 3 columns, each cell 512x512 pixels on flat magenta FF00FF, one object centred per cell.
Row 1: (1) VORTEX CORE, a true black 000000 disc with a thin violet 9B5CFF edge, surrounded by a crown of black ferrofluid spikes sheared sideways as if the whole crown is spinning clockwise, spike edges lit violet 9B5CFF to lavender BE96FF, a soft violet glow 9B5CFF fading out around it, the glow reaching no more than two thirds of the way to the cell edge. (2) OUTER CROWN, a second ring of longer, thinner black spikes sheared anticlockwise, hollow in the middle so it layers over cell 1, edges lit deep violet 7A40D0, no glow. (3) HORIZON RING, a thin dashed circle in lavender BE96FF at 30 percent opacity filling most of the cell, nothing inside it, the dashes short and even.
Row 2: (4) HORIZON FLASH, the same circle as a thick blazing ring, white FFFFFF core with a wide violet BE96FF bloom on both sides, three thin white echo rings just outside it. (5) FAR SIDE CORE, the vortex core from cell 1 with its crown edges lit seared orange E86A2A instead of violet, for the far side of the Maw. (6) FAR SIDE CORE GREEN, the vortex core with crown edges lit green 7AE05A, for the far side of Cess.
Even spacing, one object per cell, nothing touching cell edges, no text anywhere.

---

## Sheet 04: The deck

**Wiring, nearly drop-in:** the whole face is already cached and blitted. `makeDeckFace()` (line 1446) makes a square offscreen canvas of `DECK_PAD*2*DPR*1.35` px (572 at DPR 2), sets the transform so that `DECK_PAD = 106` world units maps to the half-width, and calls `drawDeckFace()` at line 1452, which paints the radial base, 46 fine turned cuts, a diagonal sheen, the 5 unit rolled lip in 46586C with a bevel, an outer 3A4A5C ring at `R+2.6`, 12 bolts at `R-8.5` (4 px), rings every 20 units, 12 spokes from 16 to 100, and a 7 unit hub. Replace that one call with `c.drawImage(faceImg, 0, 0, px, px)` where the image is a 1024 square whose centre 200/212 of the width is the dish (the outer 6 units of padding are the lip's outer ring). `drawDeck()` (line 1505) then rotates it by `deck.theta` and blits at line 1513. The face must be authored WITHOUT the index mark: the mark (amber bar from 0.30R to 0.96R plus a 3.4 unit dot, lines 1516 to 1520) is drawn live only outside the build phase, so it is its own cell drawn at `(DECK_R*0.30, -h/2, DECK_R*0.66, h)`. The orbit ring (line 1528, dashed cyan at `eqRadius(omega)`, 93 px across at idle) is its own cell scaled to `re*2`. The tear-apart (deck shaken to bits when `imb > lv.tol` at `omega > 0.72*OMEGA_MAX`, `failRun` line 1065) has NO visual today, only `shakeT=0.5`, a groan and the card; its two cells are new art for a new moment.

**Shape law:** the deck is machined metal and must read as a solid turned disc at 48 px in flight: a bright lip, a dark face, twelve countable spokes. It must not read as a body or a ring. The index mark is the only warm thing on the deck, a single amber spoke. The tear-apart cells must keep the same disc silhouette so they read as the deck breaking, not a new object.

**PROMPT (copy-paste):**

Tangent style: matte black ferrofluid liquid forms on deep space, near-black glossy droplets 12141C with thin oil-slick iridescent rims running violet A06CFF through cyan 40C4E8 to gold F7C24A, one hard white specular E8F0FF, cold machined gunmetal steel 1B2431 with fine etched lines 3A4A5C, cool cyan 79D0E6 and warm amber F2A93B as the two accent lights, magenta pink E0517B for danger, deep violet 9B5CFF for the void, clean vector-crisp game-asset edges, high contrast readable silhouettes, no text, no watermark, flat FF00FF magenta background for cutout.
A sprite sheet, 2 rows x 3 columns, each cell 1024x1024 pixels on flat magenta FF00FF, one object centred per cell, seen exactly from above with no perspective.
Row 1: (1) THE DECK, a circular machined steel dish filling 94 percent of the cell, face a dark radial gradient from 0B0F16 at the hub to 1E2734 at the edge, covered in hundreds of fine concentric lathe cuts in pale steel with one soft diagonal sheen from upper left, a rolled outer lip 46586C about 3 percent of the diameter wide with a bright bevel CEE0F6 on its inner edge and a thin darker ring 3A4A5C just outside it, twelve small flat-head bolts 26303E with pale rims set just inside the lip at the twelve clock positions, four faint etched concentric rings 3A4A5C at even spacing, twelve faint etched straight spokes 3A4A5C from a small central hub 27333F with a 4A5D71 edge out to the lip, NO index mark, NO coloured element. (2) INDEX MARK, a single horizontal amber F2A93B bar with soft glow and a round amber knob on its right end, on its own, sized so the bar is 66 percent of the cell width. (3) ORBIT RING, a thin dotted cyan 79D0E6 circle at 20 percent opacity filling 90 percent of the cell, nothing inside it.
Row 2: (4) THE DECK WOBBLING, the same dish with the lip visibly warped into a slight oval and a hairline pink E0517B stress crack running from one bolt toward the hub. (5) THE DECK TEARING APART, the dish split into five wedge shards flying outward from the hub with a gap of dark space between them, bolts scattered, the lip broken into arcs, faint pink E0517B heat at every break. (6) DECK WITH SHADOW, the dish from cell 1 seen with a soft dark drop shadow 000000 at 40 percent below and to the right, for the results card and the systems list.
Even spacing, one object per cell, nothing touching cell edges, no text anywhere.

---

## Sheet 05: Deck parts and gates

**PATCH-REQUIRED wiring:** `drawPart(p,alpha)` (line 1585) draws each placed part in deck-local units inside the deck rotation. Rail (line 1587): a 5 unit wide segment from `(p.x,p.y)` to `(p.x2,p.y2)`, default length 22 units when tapped, up to about 190 when dragged; use a 3-slice (end cap, tiling middle, end cap) drawn with `translate` to the midpoint, `rotate(atan2)`, and `drawImage` widths of `len` by 5 units. Bumper (line 1591): circle r 8.5 (16 px build, 22 spin). Brake (line 1594): dashed zone circle r 15 (28 / 38 px). Vane (line 1598): zone circle r 13 (25 / 33) with a chevron pointing the way the deck turns, `t = atan2(p.y,p.x) + PI/2`. Booster (line 1610): zone circle r 12 (23 / 31) with a radial arrow along `atan2(p.y,p.x)`. Each is `drawImage` centred at `(p.x,p.y)` with the zone cells rotated to their arrow angle; the drag ghost is the same cell at `alpha 0.55` (line 1572). Gates (lines 1559 to 1567): dashed rings of diameter `g.w` (26 to 30 units, 25 to 28 px build, 33 to 38 spin) with a 2.2 pip, cyan when open and green 6FCF97 once `gatesHit[i]`; two cells. Centre of mass mark (lines 1577 to 1580): an 8 px ring plus cross, cyan when balanced and pink when `imbalance() > lv.tol`; two cells. Ghost start dot (line 1555): an 8 px amber dot at the head of the hold track. Erase has no on-deck art (it is a tool button only) and gets an icon cell for the palette.

**Shape law:** five parts must be five silhouettes at 16 to 25 px on a busy grey disc. Rail is a bar. Bumper is a solid ringed puck. Brake is a soft dashed pad with a horizontal bar. Booster is a hard ring with an outward arrow. Vane is a ring with a curved chevron. Gate open is a broken dashed ring with a hollow pip; gate crossed is a closed ring with a solid pip and a check notch: the state changes shape, not only colour.

**PROMPT (copy-paste):**

Tangent style: matte black ferrofluid liquid forms on deep space, near-black glossy droplets 12141C with thin oil-slick iridescent rims running violet A06CFF through cyan 40C4E8 to gold F7C24A, one hard white specular E8F0FF, cold machined gunmetal steel 1B2431 with fine etched lines 3A4A5C, cool cyan 79D0E6 and warm amber F2A93B as the two accent lights, magenta pink E0517B for danger, deep violet 9B5CFF for the void, clean vector-crisp game-asset edges, high contrast readable silhouettes, no text, no watermark, flat FF00FF magenta background for cutout.
A sprite sheet, 3 rows x 5 columns, each cell 256x256 pixels on flat magenta FF00FF, one object centred per cell, all seen from directly above as fittings bolted to a steel deck.
Row 1, the rail as three slices and two pucks: (1) RAIL LEFT END, a rounded steel bar end 8FA3BF with a bright top ridge C3D2E2 and one bolt head at the tip, the bar running off the right edge of its own drawn area but not touching the cell edge. (2) RAIL MIDDLE, a straight tiling section of the same bar, seamless left to right. (3) RAIL RIGHT END, mirror of cell 1. (4) BUMPER, a solid round puck, dark plum 3A2430 face with a raised pink E0517B rubber ring around its edge and a small centre rivet. (5) ERASE ICON, a small steel scraper blade 8FA3BF with a pink E0517B cross over a faint puck, for a tool button.
Row 2, the three zones: (6) BRAKE, a soft round pad of dull steel blue 4E6E8E with a dashed edge and a wide horizontal friction bar across it, mesh texture inside. (7) BOOSTER, a hard amber F2A93B ring on a dark disc with a bold arrow inside pointing straight UP and out, amber glow on the arrow. (8) VANE, a hard cyan 79D0E6 ring on a dark disc with a curved chevron inside pointing RIGHT as if pushing along a circle, cyan glow on the chevron. (9) DRAG GHOST RAIL, a short rail bar from row 1 at 55 percent opacity with a faint cyan 79D0E6 outline. (10) DRAG GHOST PUCK, the bumper from cell 4 at 55 percent opacity.
Row 3, gates and marks: (11) GATE OPEN, a broken dashed cyan 79D0E6 ring with a small HOLLOW pip in the centre, two short arrow ticks on the ring pointing inward. (12) GATE CROSSED, a closed solid green 6FCF97 ring with a SOLID pip in the centre and a small check notch cut into the ring at the top. (13) BALANCE MARK OK, a small cyan 79D0E6 crosshair, thin ring with four short ticks. (14) BALANCE MARK BAD, the same crosshair in pink E0517B with the ring broken into two arcs. (15) START DOT, a small solid amber F2A93B bead with a soft glow.
Even spacing, one object per cell, nothing touching cell edges, no text anywhere.

---

## Sheet 06: Prediction and edge marks

**PATCH-REQUIRED wiring:** all screen space, all small. `drawPrediction()` (line 1620) strokes the dashed shot line and ends it with a circle at `pr.path` end, radius 6 when the verdict is `clears` and 4 otherwise (line 1635), coloured by `verdict(pr)` (line 1887): clears 6FCF97, short F2A93B, crash E0517B, invert B48CFF, miss 79D0E6 dim; replace with a 12 px cell per verdict key, drawn at `1/camScale()` so it stays screen sized. `drawEntryBearing(e)` (line 1654): a ring of screen radius 5 with a 14 px outward tick at the point where the ball will re-emerge on the horizon, B48CFF; one cell. `drawChevrons()` (line 1771) draws, for every off-screen body and for the predicted shot, a 12 by 11 px triangle at line 1871 rotated toward the body, coloured by `chevronColour(b)` (line 1760): target 79D0E6, hazard E0517B, hole 9B5CFF, off-side faint grey at 55 percent, the shot marker in the verdict colour; the label box (dark plate at 72 percent) and the text stay drawn by code. Five chevron cells picked by the same branches.

**Shape law:** five chevrons, five shapes at 12 px: target a clean arrowhead, hazard an arrowhead with two barbs, hole an arrowhead with a ring in it, off-side a hollow arrowhead, shot a doubled arrowhead. End caps: clears is a solid ring with a dot, short a ring with a gap, crash an X in a ring, invert a spiral, miss a hollow dim ring.

**PROMPT (copy-paste):**

Tangent style: matte black ferrofluid liquid forms on deep space, near-black glossy droplets 12141C with thin oil-slick iridescent rims running violet A06CFF through cyan 40C4E8 to gold F7C24A, one hard white specular E8F0FF, cold machined gunmetal steel 1B2431 with fine etched lines 3A4A5C, cool cyan 79D0E6 and warm amber F2A93B as the two accent lights, magenta pink E0517B for danger, deep violet 9B5CFF for the void, clean vector-crisp game-asset edges, high contrast readable silhouettes, no text, no watermark, flat FF00FF magenta background for cutout.
A sprite sheet, 2 rows x 6 columns, each cell 256x256 pixels on flat magenta FF00FF, one bold flat icon centred per cell with thick strokes, designed to be shrunk to 12 pixels.
Row 1, six shot end caps: (1) CLEARS, a solid green 6FCF97 ring with a solid dot in the centre and a soft green glow. (2) LANDS SHORT, an amber F2A93B ring with a gap cut out of its top. (3) CRASHES, a pink E0517B ring with a bold X inside. (4) FALLS IN, a lavender B48CFF spiral curling inward. (5) MISSES, a thin dim cyan 79D0E6 hollow ring at 50 percent opacity. (6) ENTRY BEARING, a lavender B48CFF ring with one long tick pointing straight UP away from it.
Row 2, five edge chevrons pointing RIGHT plus a label plate: (7) TARGET CHEVRON, a clean solid cyan 79D0E6 arrowhead. (8) HAZARD CHEVRON, a solid pink E0517B arrowhead with two small barbs off its back corners. (9) HOLE CHEVRON, a solid violet 9B5CFF arrowhead with a small hollow ring punched in its middle. (10) OFF SIDE CHEVRON, a hollow grey 96A2B2 arrowhead outline. (11) SHOT CHEVRON, two cyan 79D0E6 arrowheads nested one behind the other. (12) LABEL PLATE, a small dark rounded rectangle 0A0F16 at 72 percent opacity with a thin 3A4A5C edge, wide and short, empty.
Even spacing, one object per cell, nothing touching cell edges, no text anywhere.

---

## Sheet 07: Backgrounds

**Wiring, one line each:** `draw()` blits the baked starfield at line 1280, `ctx.drawImage(starCv,0,0,W,H)`. Swap `starCv` for a loaded plate, and change the destination to a cover fit (`scale = max(W/img.width, H/img.height)`, centred) so the plate is not stretched. `makeStars()` (line 495) then becomes the fallback for a missing image. The far side today is the near-side sky passed through the composite stack (difference white at `S.inv`, multiply `S.tint` at `S.tintAmt`, screen `S.bloomColor` at `S.bloom`, lines 1314 to 1332) with the stars multiplied back at 72 percent (line 1342). That stack turns the sky into the flat beige field seen in `t3-390-inversion-farside.png`. With plates, draw the far-side plate at line 1342 instead: `globalCompositeOperation="source-over"`, `globalAlpha=min(1,(invAmt-0.5)*2)`, picked by `sideStyle` (Maw `hueA 22`, Cess `hueA 96`, Nix `hueA 168`). The composite stack can then stay on for the deck and the transition, or be dropped; the plate is authored as the finished look and must not be pre-inverted. There is no parallax in the code; the camera pans and zooms the world but the sky is fixed to the screen. One layer per side. The default far side (tint 3A1C5C) is only used when a hole has no `other` block, and all four holes have one, so it needs no plate.

**Shape law:** the sky must stay DARK and EMPTY in the middle third of the frame, where the deck (255 px) and the shot line live; put nebula mass toward the corners and the edges. Stars are pinpoints, never bigger than 2 px at 375 wide. The three far sides must be tellable apart in silhouette, not only hue: Maw has a great glowing crack, Cess has hanging strands, Nix has slow sheets like water.

**PROMPT (copy-paste):**

Tangent style: matte black ferrofluid liquid forms on deep space, near-black glossy droplets 12141C with thin oil-slick iridescent rims running violet A06CFF through cyan 40C4E8 to gold F7C24A, one hard white specular E8F0FF, cold machined gunmetal steel 1B2431 with fine etched lines 3A4A5C, cool cyan 79D0E6 and warm amber F2A93B as the two accent lights, magenta pink E0517B for danger, deep violet 9B5CFF for the void, clean vector-crisp game-asset edges, high contrast readable silhouettes, no text, no watermark, flat FF00FF magenta background for cutout.
A background sheet, 1 row x 4 columns, each cell a full portrait plate 1080x2340 pixels, separated by wide flat magenta FF00FF gutters, no object in the centre third of any plate, the centre kept dark and quiet for gameplay.
(1) NEAR SIDE SKY, deep space base 04050A with thirty soft nebula clouds in hues from blue 3050A0 through violet 6040A0 to magenta 903070 at 14 percent opacity gathered in the corners and along the edges, four hundred pinpoint stars in pale cyan and white of one to two pixels, a faint diagonal drift of dust upper left to lower right.
(2) MAW FAR SIDE, the same composition inverted to a seared world: base a dark rust 2A0A08, nebulae in orange 7A2E12 and dark red 3A0A10, one great glowing crack of orange E86A2A light running down the left edge with cinders, stars as dark pinpoints on the brighter patches, hot and scorched.
(3) CESS FAR SIDE, a verdant drowned forest world: base a deep green black 04160C, nebulae in green 123A22 and teal 0A3A30, long hanging strands of pale green 7AE05A light falling from the top edge like vines, stars as tiny green sparks.
(4) NIX FAR SIDE, a cold flooded world: base a deep teal black 00131A, nebulae in teal 0E3A46 and blue 0A2A50, slow overlapping sheets of pale teal 3AD0C0 light like water seen from below along the right edge, stars as soft blurred points.
Nothing touching the gutters, no text anywhere.

---

## Sheet 08: UI chrome

**Wiring, CSS only:** every element below is DOM with a flat CSS fill; art goes in as `background-image` with `background-size:100% 100%` and the text stays HTML. Sizes measured at 375x667: criteria chips `.chip` (line 33) 87x24 in three states (neutral 7C8B9B, met 6FCF97, bad E0517B); tool buttons `.tool` (line 53) 113x52 off and `.tool.on` (line 59, cyan border on 22323E); balance gauge `.gauge` (line 63) 351x34 with the tolerance band `.tol` (line 69), centre tick and the 3 px `.bubble` (line 67); action buttons `button.act` (line 72) 48 tall: `.go` amber (Spin up 217 wide, Next system, Done), `.ghost` (Clear deck 124, Rebuild deck 351, Rebuild, Settings, Close, Start over, Sky Wolf Studio Arcade 309), `.danger` (Tap again to erase); throttle `#throttle` (line 81) 224x88 with the amber fill rising from the bottom (`#thfill`, height = throttle percent) and `.hot` border; release `#release` (line 88) 118x88, default cyan on 22323E and `.lands` green on 1E3A2C; the Systems caret `.lvcaret` (line 28) 68x24; card frame `.card` (line 95) 347 wide; level rows `.lvrow` (line 112) 309x48 in `.now`, normal and `:disabled` states; medal dots `.lvrow .m` (line 121) 7x7 off 2C3849 and on 6FCF97, three per row meaning landed, every gate crossed, built under half the budget; toggles `.tog` (line 130) 52x26 off and on; the scrim `.scrim` (line 107). The one canvas element is the spin readout panel in `drawOverlay()` (line 1907), a 162x74 plate at 66 percent black with a 3A4A5C edge, drawn with `fillRect`; swap for a `drawImage` of the plate cell at `panelRect()` (line 1765).

**Shape law:** every plate is a quiet rectangle with the centre left calm for text. State changes must alter the plate's edge or corner, not only its colour: met chips gain a solid corner tab, bad chips gain a broken corner, the hot throttle gains a lit top edge, the green release gains a solid ring in the corner.

**PROMPT (copy-paste):**

Tangent style: matte black ferrofluid liquid forms on deep space, near-black glossy droplets 12141C with thin oil-slick iridescent rims running violet A06CFF through cyan 40C4E8 to gold F7C24A, one hard white specular E8F0FF, cold machined gunmetal steel 1B2431 with fine etched lines 3A4A5C, cool cyan 79D0E6 and warm amber F2A93B as the two accent lights, magenta pink E0517B for danger, deep violet 9B5CFF for the void, clean vector-crisp game-asset edges, high contrast readable silhouettes, no text, no watermark, flat FF00FF magenta background for cutout.
A UI sheet on flat magenta FF00FF with generous magenta gutters between elements, every plate a flat dark machined steel panel 1B2431 with a thin etched edge 3A4A5C and a calm empty centre for overlaid text, sharp corners with a 3 pixel radius.
Row 1, three small chips each 348x96 pixels: (1) neutral chip, plain panel with a tiny grey 7C8B9B dot at the left end. (2) met chip, the same with a green 6FCF97 dot, a green edge, and a small solid green tab on the top left corner. (3) bad chip, pink E0517B dot, pink edge, and the top left corner broken off.
Row 2, two tool buttons each 452x208 pixels: (4) tool off, plain panel with a faint etched bolt in each corner. (5) tool on, the same panel lifted to 22323E with a cyan 79D0E6 edge and a cyan lit strip along the top edge.
Row 3, the gauge and two large controls: (6) balance gauge 1404x136 pixels, a long panel with a faint centre tick, a slightly lighter band across the middle half, and a machined groove along its length. (7) throttle plate 896x352 pixels, a big panel with an amber F2A93B lit strip along the top edge and a faint amber gradient rising from the bottom third. (8) release plate 472x352 pixels, a panel in 22323E with a cyan 79D0E6 edge and a small solid cyan ring in the top right corner.
Row 4, four buttons each 868x192 pixels: (9) amber go button, solid amber F2A93B with a slightly darker E29A32 bottom edge and a faint brushed metal texture. (10) ghost button, dark panel 1B2431 with etched edge. (11) danger button, dark panel with a pink E0517B edge and pink corner tabs. (12) green release plate, panel in 1E3A2C with a green 6FCF97 edge and a solid green ring in the top right corner.
Row 5, list and small parts: (13) level row 1236x192 pixels, a dark panel 161E29 with a faint left groove for a number. (14) level row current, the same in 1A2634 with a cyan 79D0E6 edge. (15) level row locked, the same at 40 percent opacity with a small steel padlock at the left. (16) three medal dots each 112x112 pixels: dark 2C3849 dot, green 6FCF97 dot with a soft glow, and a cyan 79D0E6 dot. (17) toggle 208x104 pixels off, dark panel; and toggle on, the same with a green 6FCF97 edge and a filled green pip. (18) readout panel 648x296 pixels, a dark 0A0F16 plate at 66 percent opacity with a thin 3A4A5C edge and a faint cyan tick in the top right corner.
Row 6: (19) card frame 1388x1200 pixels, a large steel panel 1B2431 with an etched edge, four corner bolts, and a faint horizontal groove one third down, centre empty. (20) systems caret 272x96 pixels, a small hollow rounded rectangle with a cyan 79D0E6 edge at 35 percent opacity.
Even spacing, nothing touching element edges, no text anywhere.

---

## Sheet 09: Screens and emblems

**Wiring:** the game has NO title screen, NO how-to screen and NO pause screen. `init()` (line 2012) calls `loadLevel(0)` and the player is on the build phase of system 1 the moment the page loads. Teaching is five coach chips in the hint line (`COACH`, line 919). Pausing happens only on `document.hidden` (line 2027) with no visual. The three screens that exist are DOM cards: Systems (`#levels` line 196, filled by `openLevels` line 1026: eight rows, locked rows say "Locked", three medal dots and a best score per row), the results card (`#card` line 207, filled by `showCard` line 1190 with one of six titles: "Landed on X", "Landed, but short", "Crashed into X", "Grazed X", "Lost to open space", "Run failed"), and Settings (`#settings` line 183, three toggles, Start over, Done, Sky Wolf Studio Arcade). The portal thumb is 512x512, procedural, and the session 2 notes admit it contains no gravity body. The emblems below give the card a picture per outcome (insert an `<img>` above `#cardtitle`), give each system row an icon (insert before `.n`), and give the arcade a real thumb. The title emblem is for a title screen that does not exist yet and for the portal card; it needs a screen built before it can show in the game.

**Shape law:** system icons are eight distinct compositions of the same three marks (a disc, a bead, a ring) so the list reads as a map, not a row of logos. Outcome emblems must be tellable apart with the title covered: landed is a bead merged into a body, short is a bead beside a broken gate, crashed is a splatter, grazed is a bead skimming a body, lost is a bead alone with a long fading trail, failed is the deck in pieces.

**PROMPT (copy-paste):**

Tangent style: matte black ferrofluid liquid forms on deep space, near-black glossy droplets 12141C with thin oil-slick iridescent rims running violet A06CFF through cyan 40C4E8 to gold F7C24A, one hard white specular E8F0FF, cold machined gunmetal steel 1B2431 with fine etched lines 3A4A5C, cool cyan 79D0E6 and warm amber F2A93B as the two accent lights, magenta pink E0517B for danger, deep violet 9B5CFF for the void, clean vector-crisp game-asset edges, high contrast readable silhouettes, no text, no watermark, flat FF00FF magenta background for cutout.
A sheet on flat magenta FF00FF with wide magenta gutters, in three rows.
Row 1, one wide title emblem 1024x512 pixels and one square thumb 512x512 pixels: (1) TITLE EMBLEM, a machined steel dish 1B2431 seen from above, tilted slightly, with a black ferrofluid bead leaving its rim on a straight tangent line of amber F2A93B light toward a larger calm bead with a cyan 79D0E6 rim in the upper right, a thin dashed violet 9B5CFF horizon ring behind, room left below for a wordmark, no letters. (2) PORTAL THUMB, the same scene composed square: the dish in the lower left, the bead mid flight on its amber line, the target body with its cyan rim in the upper right, a violet vortex small in the corner, dark space 04050A behind.
Row 2, eight system icons each 256x256 pixels, every icon a small steel dish disc 1B2431 plus black beads with coloured rims on dark space: (3) FIRST TANGENT, the dish at the bottom and one cyan rimmed bead straight above it. (4) BEHIND YOU, the dish with a cyan bead below and to its left, behind it. (5) NOT THE NEAREST, the dish with a small pink rimmed bead close above and a cyan bead far above. (6) AROUND THE HEAVY, the dish with a fat pink banded lens to the upper left and a cyan bead far left, an amber curve bending around the lens. (7) THREADING, the dish with two small pink beads flanking a corridor and a cyan bead beyond. (8) INSIDE OUT, the dish below a black vortex with a violet 9B5CFF crown, a dashed outline bead inside its ring. (9) TWO MINDS, a bead split half cyan half pink in front of a green rimmed vortex. (10) OPEN DECK, the dish surrounded by four beads of mixed rims and a small teal vortex.
Row 3, six outcome emblems each 256x256 pixels and one lock: (11) LANDED, a black bead merging into a larger cyan rimmed body, gold F7C24A sparkle at the join. (12) LANDED SHORT, a bead resting on a body with a broken dashed cyan gate ring behind it, dim. (13) CRASHED, a black ferrofluid splatter across a pink rimmed body, droplets flying. (14) GRAZED, a bead skimming past the edge of a cyan rimmed body with a curved amber trail. (15) LOST, a single tiny bead alone with a long fading amber trail behind it and nothing else. (16) RUN FAILED, the steel dish in five wedge shards with pink E0517B heat at the breaks. (17) LOCK, a small steel padlock 46586C with an etched keyhole.
Even spacing, nothing touching element edges, no text anywhere.

---

## Sheet 10: Moments

**PATCH-REQUIRED wiring:** none of these moments draws anything today. Release (`doRelease` line 1056): a sound sweep and an 18 ms buzz. Gate crossed (`checkGates` line 1135): a chime and the ring turns green. Wall rub (`rimWall` line 768): `shakeT=0.05` and a thud. Rail or bumper tick (`collideOn` line 789): `shakeT=0.09` and a tick. Landing (`step` line 1110): an arpeggio and a buzz, then the card. Crash (line 1109): a double thud and a buzz, no shake, then the card. Lost (line 1111): silence, then the card. Tear-apart (`failRun` line 1065): `shakeT=0.5`, a groan, the card. The wiring is a tiny stamp list: push `{x,y,cell,t0,angle}` to an array at each of those sites and draw them in `draw()` after `drawBall()` at `alpha 1-(t-t0)/0.4`, three frames each over 0.4 s, sized 24 to 64 px screen space (`/camScale()`). Trail droplets replace the two plain strokes: the spin trail (`drawBall` line 1688) and the flight trail (`drawFlight` line 1669); stamp cell 22 to 24 from sheet 01 row 3 every eighth trail point, shrinking with age.

**Shape law:** every moment is ferrofluid, droplets and splashes, never sparks or stars. Release is a comet tear-off. Gate cross is a ring that snaps shut. Wall rub is a flattened smear along a straight edge. Rail tick is two droplets thrown off a bar. Landing is a merge, the bead swallowed by the body with a gold flash at the join. Crash is a splatter. Tear-apart is the deck's wedges and bolts. Lost is a bead thinning to a wisp. Each of the three frames must differ in silhouette: frame 1 compact, frame 2 widest, frame 3 fading and broken up.

**PROMPT (copy-paste):**

Tangent style: matte black ferrofluid liquid forms on deep space, near-black glossy droplets 12141C with thin oil-slick iridescent rims running violet A06CFF through cyan 40C4E8 to gold F7C24A, one hard white specular E8F0FF, cold machined gunmetal steel 1B2431 with fine etched lines 3A4A5C, cool cyan 79D0E6 and warm amber F2A93B as the two accent lights, magenta pink E0517B for danger, deep violet 9B5CFF for the void, clean vector-crisp game-asset edges, high contrast readable silhouettes, no text, no watermark, flat FF00FF magenta background for cutout.
A sprite sheet, 8 rows x 3 columns, each cell 256x256 pixels on flat magenta FF00FF, one effect centred per cell, each row one effect in three frames left to right: compact, widest, fading and breaking up. All effects are black ferrofluid droplets and splashes with iridescent rims, never sparks and never stars.
Row 1, RELEASE: a black bead tearing away toward the upper right leaving a comet of amber F2A93B light and three trailing droplets.
Row 2, GATE CROSSED: a dashed cyan 79D0E6 ring snapping shut into a solid green 6FCF97 ring with a burst of six tiny droplets leaving it.
Row 3, WALL RUB: a black bead flattened along a straight steel edge 46586C on its right, fluid smearing up and down the edge with a faint pale CEE0F6 scuff on the steel.
Row 4, RAIL TICK: two black droplets thrown off a short steel bar 8FA3BF with a tiny cyan flash at the contact point.
Row 5, LANDING: a black bead sinking into a larger cyan rimmed body, the two surfaces merging, a gold F7C24A flash at the seam then ripples across the body.
Row 6, CRASH: a black bead bursting against a pink rimmed body into a wide splatter of droplets, pink E0517B flash at the impact.
Row 7, TEAR APART: a steel dish 1B2431 splitting into wedges with bolts flying outward and pink E0517B heat at the breaks.
Row 8, LOST: a lone black bead thinning into a long faint wisp of violet 9B5CFF that fades to nothing.
Even spacing, one effect per cell, nothing touching cell edges, no text anywhere.

---

## Full animation sets

Every character below needs at least idle, move, hit, die and win. Frame counts are what the code can drive today (`ferroT` advances 1/60 per frame; state flags are listed by name).

- **The droplet (sheet 01 plus sheet 10).** Idle: calm bead, 4 frames of surface ripple. Move: reaching, 4 frames of cone growth keyed to `s`; spiked, 4 frames of comb growth. Hit: rim squashed 3 frames (`len(x,y) > DECK_R-CONTACT`), rail tick 3 frames (`collideOn` hit), wall rub 3 frames (`rimWall` dot > 0). Die: crash splatter 3 frames (`settle("crash")`), lost wisp 3 frames (`settle("lost")`). Win: landing merge 3 frames (`settle("land")`). Special: inversion pinch 4 frames keyed to `pull` in `drawBall`, release comet 3 frames (`doRelease`). Trail: 3 droplet sizes.
- **Bodies (sheet 02 plus sheet 10).** Per role (target, hazard, heavy, flip): idle 4 frames of rim shimmer; move (the field reaching toward the droplet as it closes, `fieldAt(b.x,b.y,b)`) 4 frames of crown lean; hit (the droplet arrives) 3 frames: landing ripple for the target, crash flash for a hazard or heavy; die: none, bodies never die; win: target pulse 3 frames after `settle("land")`. Inversion: 4 frames of squeeze keyed to `shown(b)[2]` between 0.35 and 2.6, since bodies are scaled through the collapse. Far side: one rim recolour per hole (Maw, Cess, Nix).
- **The hole (sheet 03).** Idle: crown rotation, 8 frames each for the inner and outer crown turning opposite ways (`ferroT*0.7` and `ferroT*0.5`). Move: none, holes do not move. Hit (the droplet enters, `beginInversion`): horizon flash 6 frames keyed to `peak`, ring echo 3 frames. Die: none. Win: none. Far side: two recolours.
- **The deck (sheet 04).** Idle: the face is cached and rotated, 1 frame; the index mark is separate. Move: orbit ring at `eqRadius(omega)`, 1 frame scaled. Hit: wobble 3 frames keyed to `deck.wobble` (today it is only a screen shake). Die: tear-apart 3 frames (`failRun`). Win: none today; a gold lip pulse on `settle("land")` would be the place.
- **Parts (sheet 05).** Idle 1 frame each; hit 3 frames for rail and bumper (`collideOn`), 3 frames of zone flash for brake, booster and vane (the `mu*=3.4`, `boost`, `vane` branches in `advanceDeck` lines 746 to 748 know when the ball is inside); drag ghost 1 frame at 55 percent.
- **Gates (sheet 05).** Open 1 frame; crossed 1 frame; the snap between them 3 frames (sheet 10 row 2).

## What the code does that art cannot fix (for the Director, from the code)

- No title screen, no how-to screen, no pause screen: `init()` (line 2012) drops the player straight onto system 1's build phase. Sheet 09 art needs a screen to live on.
- The "land on X" criteria chip (`refreshHUD` line 1941) is created with `ok:false` on every refresh and never turns green, even on the result card of a landed run.
- The deck failure ("shook itself apart", `failRun` line 1065) has no picture: a half second shake and the card. Crash, landing, gate and lost are the same: sound only.
- The Balance gauge renders a full 34 px row saying "centred" before any part is placed, already noted in the session 2 review.
- Every criteria chip row wraps to two lines at 375 wide on every system, which is why `hudTop` is 128 and the build-phase deck is only 190 px.

## Coverage: every draw function and which sheet covers it

| Function (line) | What it draws | Sheet |
|---|---|---|
| `fieldAt` (435) | nothing, the gravity vector both physics and art read | none, drives 01 02 |
| `ferroBlob` (447) | the spiked outline points | 01 02 03 (the outline stays if the texture-inside option is chosen) |
| `tracePts` (463) | turns points into a canvas path | 01 02 03 |
| `paintFerro` (474) | near-black fill, rim gradient, specular for bodies | 02 |
| `makeStars` (495) | the baked starfield | 07 |
| `draw` (1277) | frame order, shake, inversion composite stack, far-side star multiply | 07 (plates at 1280 and 1342) |
| `shown` (1357) | body position and scale during collapse | none, positions 02 03 |
| `drawHole` (1363) | horizon ring, concentric rings, core, crowns | 03 |
| `worldFont` (1394) | text sizing | none, text stays text |
| `drawBodies` (1395) | off-side outlines, holes, halos, ferro bodies, labels | 02 03 |
| `makeDeckFace` (1446) | the cached face canvas | 04 |
| `drawDeckFace` (1455) | the turned face, lip, bolts, rings, spokes, hub | 04 |
| `drawDeck` (1505) | face blit, index mark, orbit ring, ghost tracks and tags, gates, parts, drag ghost, centre of mass mark | 04 (face, index, ring, tear) 05 (gates, parts, CoM, start dot) |
| `drawPart` (1585) | rail, bumper, brake, vane, booster | 05 |
| `drawPrediction` (1620) | dashed shot line, end cap, entry bearing call | 06 (end caps; the line stays a stroke) |
| `entryBearing` (1645) | geometry only | none |
| `drawEntryBearing` (1654) | ring plus tick on the horizon | 06 |
| `drawFlight` (1667) | flight trail stroke | 10 (droplet stamps) and 01 row 3 |
| `drawBall` (1673) | pinch during inversion, spin trail, droplet call | 01 (pinch, trail) |
| `drawDroplet` (1694) | the player's ball | 01 |
| `drawHorizonFlash` (1739) | the collapse flash rings | 03 |
| `chevronColour` (1760) | chevron colour by role | 06 |
| `panelRect` (1765) | readout panel rectangle | 08 |
| `drawChevrons` (1771) | edge triangles, label plates, text | 06 (chevrons, plate); text stays |
| `verdict` (1887) | text and colour of the shot verdict | 06 (end caps keyed to it), 08 (release plate state) |
| `drawOverlay` (1900) | readout panel plate and text | 08 |
| `refreshHUD` (1930) | DOM chips, gauge, bubble, Spin up label | 08 |
| `buildPalette` (2003), `syncTools` (2010) | DOM tool buttons | 08 (plates), 05 cell 5 (erase icon) |
| `openLevels` (1026), `openSettings` (1016), `showCard` (1190), `modal` (1007) | the three DOM cards | 08 (frame, rows, dots, toggles), 09 (icons, emblems, lock) |
| `failRun` (1065) | the Run failed card, shake | 09 (emblem), 10 (tear-apart), 04 (torn deck) |
| `flashHint` (730) | the "Deck is full" hint text | none, text |
| `frame` (1948) | the loop, DOM throttle fill and rpm, coach text | 08 (throttle fill) |
| `resize` (1988) | canvas sizing, cache invalidation | none |

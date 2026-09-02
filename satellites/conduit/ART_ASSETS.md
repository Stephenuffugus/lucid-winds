# CONDUIT, art asset list

> Drive copy (the prompts, for the phone): https://docs.google.com/document/d/1AMQ94G4TGKN1QUdwmTdAwP2FpIT35RRlHJw0t9U2FJY/edit  in 012Assets. This file is the source of truth; the Doc is regenerated from it.

Game: `satellites/conduit/index.html` (one file, canvas 2D, no build step, no art folder today).
Written 2026-09-02 from the code at 3131 lines, every draw function read, every screen shot opened.
Sizes below are measured from `CFG.ui`, `CFG.ferro` and the camera maths, given at 375x667 portrait.

---

## The ferro law

`docs/DESIGN.md` Appendix A, verbatim: "Ferrofluid reads as ferrofluid because of the Rosensweig
instability" and "it spikes along field lines. Behaviour, not texture; procedural, and no
generated asset can replace it." Appendix B, verbatim: "The creature and the conduit stay
procedural. Never generate them. A static asset would be a downgrade of the field-reactive
behaviour."

That law is live in the code. `ferroBlob()` (line 2512) points the creature's longest spike at the
nearest live wire, then the nearest powered source, then your own motion, so the shape is
information: a player can read where power flows from the creature's hair. A sprite loop cannot
do that without the code rotating and selecting frames for it.

The Director has since asked for "really good looking ferrofluid assets that look like it's
bubbling and moving" and has not yet amended the law. So:

- Sheets 01 and 02 below are marked ⚖️. They are written for the GENERATED route and run only if
  the Director amends Appendix A and B in one line. Two amendment shapes, his pick:
  - A. "The creature and the conduit may be generated sprite sheets; the code rotates the spike
    cell by `FX.fa` and picks the state cell." Sheets 01 and 02 as written.
  - B. "The outline stays procedural; a generated ferro texture may fill it." Then only the
    TEXTURE cells of sheet 01 (row 1) are used, as a `createPattern` fill inside `paintFerro`,
    and nothing else in sheet 01 or 02 is generated.
- Everything else here (floors, machines, sources, patrols, fixtures, FX, HUD, icons, screens,
  backdrops) is unaffected by the law and can proceed today.

---

## What the game is

You are a black ferrofluid that infiltrates an off world facility and takes it apart by wiring
its own machinery together with your own body: every tile of conduit is a tile of you, mass is
health, reach, size and stealth profile in one number, and pulling a wire home refunds 75%.
Six sites, one patrol type on the map so far (sentry and drone, the brute exists in the tables
and is placed on no level), ten machines, five power sources, a five state alert ladder that
ends in a site wide blackout you undo by wiring the breaker.

## Render architecture

- One `<canvas id="c">`, sized to `visualViewport` (never `innerHeight`), DPR capped at 2:
  `CAN.width = VW*dpr`, `ctx.setTransform(dpr,0,0,dpr,0,0)` in `resize()` line 1813. All draw
  code works in CSS pixels; a sprite drawn at N px covers N CSS px and N*dpr device px.
- Loop: `frame()` line 3043 runs `step` (sim), `updateCamera`, `updateFX`, `updateAudio`, then
  `draw()` line 1947. Everything visual is in `draw()` and the functions it calls. The sim never
  reads any render state (`FX`, `CFG.ferro`, `CFG.ui`); the smoke suite asserts that, so a sprite
  swap can never change play.
- World to screen: `w2s(x,y) = ((x-cam.x)*cam.s + VW/2, (y-cam.y)*cam.s + VH/2)`. `cam.s` is the
  tile size in px:
  - PROWL: `cam.s = min(VW,VH) / CFG.ui.prowlTilesOnScreen(16)`. At 375x667 that is **23.44 px
    per tile**; at 844x390 it is 24.4; at 320x568 it is 20.0.
  - FLOW: `flowFit()` line 1862 fits the site's bounding box into the largest rectangle the HUD
    band and the thumb block leave free. At 375x667: site-01 10.7 px, site-03 and site-04 12.5,
    site-05 9.4, site-02 and site-06 8.5 px per tile. Call it **8.5 to 12.5 px per tile**.
- Draw order inside `draw()`: void fill, tiles (with wet, flow tier dim, concealed hatch, vent
  bars, door outline), exfil, vision cones, site wiring, conduits, draft, sources, devices,
  lights, bodies, enemies (with facing tick and spot ring), peek tendril, drag tether, the
  creature (`drawBlob`), cling ring, pulse reveal, `drawSiteEdge`, `drawFrame` (grain, vignette,
  alarm edge, flow ring, douse collapse), `drawHUD` (scrims, ribbon, pips, buttons, cards,
  toasts, dev overlay, result).
- Two sprites already exist and are blitted, not rebuilt: `makeGlow()` line 1774 bakes a 96 px
  radial glow (warm 224,200,150 for lights, gold 224,167,60 for live machines) and `blitGlow()`
  line 1784 is the only `drawImage` in the file. That is the pattern every sheet here follows.
- Three screens are DOM, not canvas: `#overlay` (title, line 161), `#sites` (site select and
  the residue shop, line 175), `#settings` (line 183). The result card is canvas
  (`drawResult` line 2478). There is no pause screen: the gear opens `#settings` over a game that
  keeps running underneath, near opaque at `rgba(5,6,10,.985)`.

## The palette the code actually uses (hex)

CSS variables: void `#05060A`, iron `#12141C`, steel `#232733`, lit `#2E3444`, violet `#8A5CF6`,
gold `#E0A73C`, alarm `#E0483C`, ink `#C9D2E4`, muted `#8C97AE`, brand grey `#5C6580`.
Wordmark gradient `#B79BFF` to `#8A5CF6` to `#C58F4A` to `#E9C173`.
Tiles: wall `#0A0C12`, floor `#1E2331`, shadow `#151823`, vent `#191D2A`, door `#3A2E22`,
door outline `#E0A73C` at 60%, concealed hatch `#8C96B4` at 20%, vent bars `#BEC8E1` at 35%.
Wet floor `#3A78BE` at 7 to 18% with a moving sheen `#96CDFF` at 5 to 12%.
Machines: off body `#2B3040` rim `#BECDEB` at 20%; on body `#241B0C` rim `#E8B457`, label
`#AFC2DA` off and `#E8B457` on, chip plate `#080A10` at 88%. Sources: socket `#132435` rim
`#6EAAE1`, generator `#152D26` rim `#5AC8A0`, cart `#231B12` rim `#D6A860`, frozen guard
`#12232B` rim `#8CD7EB`. Light fixture `#E0C896`. Bodies `#C8785A` at 35 to 85% by decay.
Patrols: calm `#8894AE`, site at Search or above `#D08050`, hunting `#E0483C`, facing tick
`#05060A`, spot ring `#E0A73C`. Vision cone tan `#E0A73C` at 9%, hot `#E0483C` at 13%.
Site wiring `#464E5F` at 35%, spliced `#5AC8A0` at 55%.
Conduit body `#0D0F17`, dead rim `#96A3C4` at 72%, live rim gold, live spikes gold at 68%,
draft body `#3C3456` at 75% with violet rim, discovered rim `#FF8C5A` with beads `#FFE2AA`.
Ferro body gradient `#232733` to `#12141C` to `#05060A`; rim hsl(268,90%,64%) = `#9E51F6`,
middle hsl(336,70%,44%) = `#BF2260`, gold hsl(44,92%,60%) = `#F7C53B`, hot edge hsl(70,95%,72%)
= `#E5FB74`; specular `#E2ECFF` at 30%; hit ring `#E0483C`.
HUD: ribbon channel `#07080D`, body fill `#4A3B70` over `#2E2447` over `#221A38`, meniscus gold,
committed hatch `#222A3C` with `#96A4C4` strokes, squeeze notch `#6FB0EE`, force notch `#E8B457`,
pips off `#161A26` on `#E0A73C` red `#E0483C`; buttons on `#202638` to `#11141F` with violet
border, off `#0E1119` to `#0A0C13` with `#262C3C` border, label on `#D6DEEE` off `#4E566A`,
hint `#5F687C`; cards `#080A10` at 92 to 94%.

## How art drops in

Every sheet names the function and the line where a `ctx.drawImage` replaces the vector path,
with the size the code draws at. The pattern is the one `blitGlow` already uses: load the PNG
once at boot next to `makeGlow`, then `ctx.drawImage(sheet, sx,sy,256,256, px,py,w,h)` at the
same `[px,py]` the vector code computes. Cells are 256 px; the game draws most of them at 14 to
24 px, so render at 256 and let the browser downscale (enable `ctx.imageSmoothingEnabled`,
already the default). Anything that rotates (patrols by `e.face`, the creature spike by `FX.fa`)
draws through `ctx.save(); translate; rotate; drawImage(-w/2,-h/2); restore()`.

The one thing a sheet cannot replace is the vision cone: it is ray cast against walls every frame
(line 1989) and clipped by geometry. Keep it procedural; sheet 07 gives it a texture only.

---

## Asset table

| id | sheet | what it is | where it draws | in-game px at 375x667 | cells | pri |
|---|---|---|---|---|---|---|
| 01 ⚖️ | conduit-creature | the ferrofluid player, all states, bubbling loop | `drawBlob` 2635, `drawCapsule` 2620 | body 14 to 20 px across, spikes reach 36 px; 18 px floor in Flow | 32 (4x8) | 1 if amended |
| 02 ⚖️ | conduit-wire | the conduit ribbon as tiles, dead, live, draft, discovered, reclaiming, site wiring | `drawConduit` 2152; site wires 2003 | ribbon 5.4 px wide on a 23.4 px tile, 2.6 px floor | 24 (3x8) | 1 if amended |
| 03 | conduit-floors | the tile set: wall, floor, shadow, concealed, vent, door, wet, lit, exfil, void grain, corner tick | `draw()` tiles 1954 to 1982, exfil 1983, `buildGrain` 1789, `drawSiteEdge` 1905 | 24.4 px tile (`s+1`) prowl; 8.5 to 12.5 flow | 16 (2x8) | 1 |
| 04 | conduit-machines | ten devices, off and on, plus action frames | `draw()` devices 2025 to 2050 | 17.4 px box inset 3 px in the tile, 75 px glow disc | 32 (4x8) | 1 |
| 05 | conduit-sources | socket, generator, battery cart, vehicle battery, frozen guard | `draw()` sources 2014 to 2024 | 17.4 px box | 12 (2x6) | 2 |
| 06 | conduit-patrols | drone, sentry, brute, eight states each; bodies; spot ring | `draw()` enemies 2063 to 2073, bodies 2058 | 14 px across, facing tick 9.8 px, spot ring r 10.3 px, body 14 px | 32 (4x8) | 1 |
| 07 | conduit-fixtures | lights on and out, glow discs, lit pool, plate arc, frost, crane shadow, speaker rings, fan streaks, camera wedge, cone grain, spray | `draw()` lights 2051, `makeGlow` 1774, sprinkler area 2048, cones 1989 | fixture 6.6 px, glow 112 px disc, machine glow 75 px | 16 (2x8) | 2 |
| 08 | conduit-fx | pulse, tap, douse, flow ring, hit ring, harvest, zap, reclaim flare, alarm and lockdown edges, peek tip, tether, cling ring | pulse 2105, `drawFrame` 1918, peek 2074, tether 2088, cling 2096, ripple 2661, reclaim 2225 | pulse to r 188 px, cling r 12.9 px, tendril 1.8 px | 24 (3x8) | 2 |
| 09 | conduit-hud | mass ribbon, pips, button frames, gear, scrims, toast and cost plates, envelop card, inspect card, lockdown plate | `drawMassRibbon` 2258, `drawAlertReadout` 2307, `drawButton` 2322, `drawScrim` 2336, `drawHUD` 2342 | ribbon 196x14, pips 13x7, buttons 101x54, gear 48x48, cards 300x54 and 320x76 | 24 (3x8) | 2 |
| 10 | conduit-icons | eleven ACT verb glyphs, PULSE FLOW RECLAIM PEEK gear, the lightning needs glyph, ten device and five source glyphs | `drawButton` 2322 (label), `deviceChip` 2129, device labels 2038 | glyph 20 to 24 px in a 54 px button, 11 px in a chip | 32 (4x8) | 2 |
| 11 | conduit-title | title backdrop plate, wordmark crest, rule, enter button plaque, brand plate | `#overlay` 161, `#mark` 162, `#rule`, `#go` 172, `#brand` 173 | plate 375x667, crest 300x120, button 176x48 min | 8 (2x4 at 512) | 2 |
| 12 | conduit-sites | site card frame, six site emblems, four medal glyphs, eight trait icons, residue glyph, resume glyph, locked glyph, two button plaques | `#sites` 175, `renderSites` 2972, `medalLine` 2965 | card 335 wide, emblem 48 px, glyphs 16 to 20 px, buttons 335x48 | 24 (3x8) | 2 |
| 13 | conduit-settings-result | settings card, four row icons with on and off states, back plaque, result plate, Extracted and Lost glyphs, medal rule, tap hint | `#settings` 183, `drawResult` 2478 | card 384 max wide, icons 24 px, result 327 wide | 16 (2x8) | 3 |
| 14 | conduit-backdrops | one colour key plate per site, drawn under the tiles in the void outside the site | `draw()` line 1949 (the `#05060A` fill), `drawFrame` grain 1919 | full frame, 512 seamless | 6 (1x6 at 512) | 3 |

14 sheets. Two carry ⚖️. Priority 1 that can start today: 03 floors, 04 machines, 06 patrols.

---

## Sheet 01 ⚖️ conduit-creature

**PATCH-REQUIRED wiring (only after the law is amended):** the creature draws in `drawBlob()`
line 2635. `r` is the render radius in px: `CFG.radius(mass) = 0.16 + 0.26*sqrt(mass/100)`
tiles, times `cam.s`, times the swell and ripple springs, with a 9 px floor (`CFG.ferro.minBlobPx`).
At 23.44 px tiles that is r 9.8 px at mass 100 (20 px across), r 7.1 at mass 30 (14 px), and the
9 px floor in Flow. Spikes reach `1.85*r` along the field axis, so the full silhouette is 36 px
across at mass 100. Replace the `tracePts/paintFerro` pair with: pick the state cell, then
`ctx.save(); ctx.translate(px,py); ctx.rotate(FX.fa); ctx.drawImage(sheet, cell, -r*1.85,
-r*1.85, r*3.7, r*3.7); ctx.restore()`. Scale the cell by `FX.fs` (field strength 0.46 to 1.0)
between the CALM and FULL FIELD cells. The idle loop runs at 8 frames per 1.6 s (the code's
wobble is `sin(T*1.1)`), so `cell = floor(T/0.2)%8`. `drawCapsule()` line 2620 draws the vent
squeeze when `mass < 30` and the tile is a VENT: use the two capsule cells, scaled by input
speed. Hit: `FX.ripple > 0.02` overlays the HIT cell. Harvest: `FX.swell > 0` overlays SWELL.
Death: `S.result.ok === false` shows DISSIPATE over three frames before `drawResult`. Win:
`S.result.ok` shows EXTRACT. Pooled (`isPooled()`) and clinging (`S.player.clinging`) have no
creature drawing today at all: the pool state is invisible, and cling is a dashed ring around
the same blob. Both get their own cells here.

**Shape law:** the creature is a matte black drop with a thin iridescent rim and ONE specular,
never shiny all over, never a soap bubble. States differ by silhouette: calm is a soft ring of
small teeth, full field is one long spike with a row of teeth on ONE side only (the code's odd
`nS=7` puts teeth at one pole, and that asymmetry is what makes the shape point at the power),
thin is a small tight drop, full is a wide heavy drop, pooled is a flat wide puddle, cling is a
drop pressed against a vertical edge with a drip, capsule is a pill twice as long as wide,
split is two drops sharing a thinning bridge, merge is the same bridge thickening, dissipate is
the drop losing rim and going to specks, extract is the drop lifting into a tall spike. The
bubbling loop must read at 20 px: big slow bulges, not fine noise.

**PROMPT (copy-paste):**

Conduit style: top down stealth game art in a near black off world facility, matte void 05060A and iron 12141C surfaces with the faintest film grain, hard flat industrial geometry in desaturated steel blues 232733 and 2E3444 with hairline edge highlights, the world owns almost no colour, the only living colour is an oil slick iridescence running violet 9E51F6 through magenta BF2260 to gold F7C53B with a lime gold E5FB74 hot edge, plus dull lamp cream E0C896 and one alarm red E0483C, organic black fluid against insectoid crustacean machinery, clean crisp game asset edges, no soft haze, no text, no watermark, flat FF00FF magenta background for cutout.
A sprite sheet, 4 rows x 8 columns, each cell 256x256 pixels on flat magenta FF00FF, seen from directly above. The subject in every cell is one blob of ferrofluid: a matte near black body 12141C shading to 05060A at its edge, a thin oil slick rim that runs violet 9E51F6 on the left side through magenta BF2260 to gold F7C53B on the right with a lime gold E5FB74 hot point, and one small soft specular E2ECFF upper left. Never glossy all over. The rim is thin, about one twentieth of the body width.
Row 1, the BUBBLING IDLE LOOP, eight consecutive frames of one drop about 160 pixels across, its edge ringed with seven short rounded teeth that slowly rise and sink: (1) round with teeth barely showing, (2) a bulge swelling on the upper right, (3) that bulge peaking as a short dome, (4) the dome sinking while a second bulge rises lower left, (5) two low bulges, (6) the lower left bulge peaking, (7) it sinking, teeth rising evenly, (8) nearly round again, ready to loop to frame 1. The liquid must look thick and slow, like black oil under a magnet, with bulges that move across the surface between frames.
Row 2, FIELD STATES, spike always pointing to the RIGHT: (1) CALM FIELD, the drop with a modest row of seven small teeth along its right edge and a rounded left edge, (2) FULL FIELD, one long narrow spike reaching to the right edge of the cell with a comb of six shorter teeth along the upper right side only, the left side smooth and heavy, (3) MOVING, the drop stretched into a teardrop trailing to the left with its spike leading right, (4) FAST, a longer teardrop with two ripples down its flanks, (5) CAPSULE SLOW, a rounded pill twice as long as tall, horizontal, rim running end to end, (6) CAPSULE FAST, the same pill three times as long as tall with a bright pinched waist, (7) THIN, a small tight drop 90 pixels across with a fine rim and tiny teeth, (8) FULL, a wide heavy drop 200 pixels across with a fat rim and deep teeth.
Row 3, SPLIT AND MERGE AND FEEL: (1) SPLIT A, one drop with a deep waist beginning to pinch, (2) SPLIT B, two lobes joined by a thin black thread, (3) SPLIT C, two separate drops with a snapped thread between them and a gold spark at each end, (4) MERGE A, two drops touching at one point, (5) MERGE B, the join thickening into a bridge, (6) MERGE C, one drop with a healing seam across it, (7) SWELL, the drop bloated and rounder with its rim flaring bright gold all round as mass arrives, (8) HIT, the drop dented on the left with an alarm red E0483C ring flashing round its rim.
Row 4, VERBS AND ENDINGS: (1) POOLED, the drop flattened into a wide low puddle 220 pixels across, rim very thin, one specular, (2) CLING, the drop pressed against a vertical steel 232733 wall edge on the left side of the cell with a single black drip running down, (3) PEEK, the drop with one long thin tendril reaching right to the cell edge ending in a gold F7C53B bead, (4) DRAGGING, the drop with a short thick tether of black fluid trailing to the lower left, (5) SMOTHER, the drop spread wide and flat over a dim grey shape beneath it, rim pulsing violet, (6) DISSIPATE A, the drop losing its rim, edge breaking into specks, (7) DISSIPATE B, only a scatter of small black specks and one fading gold spark, (8) EXTRACT, the drop lifting into one tall bright spike with a full violet to gold rim, triumphant.
Even spacing, one object per cell, nothing touching cell edges, no text anywhere.

---

## Sheet 02 ⚖️ conduit-wire

**PATCH-REQUIRED wiring (only after the law is amended):** `drawConduit(cd, isDraft)` line 2152
strokes a polyline through tile centres with width `w = max(2.6, s*0.23)` = 5.4 px at prowl,
spikes `h = max(3.2, s*0.26)` = 6.1 px when live, a rim at `0.34*w`, a travelling pulse head
(`T*4.5` tiles per second, line 2213), discovered beads (2205), a reclaim flare at the far end
(2225), and an extruding ferro tip on a draft (2233). A tile route is the natural sprite form:
for each `cd.path[i]`, choose STRAIGHT or CORNER or END by the neighbours' directions and draw
one 256 cell over that tile (`s+1` px), rotated into place. Live frames cycle at 4 frames per
`2.4` s (the code's `spikeWave`). The pulse head and reclaim flare cells overlay at the tile the
code computes. The facility's own wiring (line 2003, `S.siteWires`) is a plain polyline at
`s*0.10` px wide, grey, or green once `S.player.traits.splice` is true: rows 3 gives it a
tileable inert and spliced pair.

**Shape law:** dead wire lies flat with a smooth edge; live wire stands a fringe of short teeth
on BOTH sides that vary in length so it never reads as a comb or a centipede; the ribbon body is
always wider than its fringe. Discovered wire is caught in bright beads, not a red line, so it
differs from the alarm edge by shape. A draft is translucent violet with a fat extruding tip. A
scorched end is a real state (`burnConduitFrom` line 1052) and must read as burnt, not cut.

**PROMPT (copy-paste):**

Conduit style: top down stealth game art in a near black off world facility, matte void 05060A and iron 12141C surfaces with the faintest film grain, hard flat industrial geometry in desaturated steel blues 232733 and 2E3444 with hairline edge highlights, the world owns almost no colour, the only living colour is an oil slick iridescence running violet 9E51F6 through magenta BF2260 to gold F7C53B with a lime gold E5FB74 hot edge, plus dull lamp cream E0C896 and one alarm red E0483C, organic black fluid against insectoid crustacean machinery, clean crisp game asset edges, no soft haze, no text, no watermark, flat FF00FF magenta background for cutout.
A tile sheet, 3 rows x 8 columns, each cell 256x256 pixels on flat magenta FF00FF, seen from directly above. Every cell is one tile of a thin ribbon of black ferrofluid 0D0F17 about 60 pixels wide, running through the exact centre of the cell so tiles join edge to edge; straight ribbons run left to right, corner ribbons enter from the left and leave through the top, ends enter from the left and stop at the centre.
Row 1, DEAD WIRE AND LIVE WIRE: (1) DEAD STRAIGHT, flat matte black ribbon with a dim pale blue grey 96A3C4 rim and no teeth, (2) DEAD CORNER, (3) DEAD END, the ribbon ending in a soft rounded cap, (4) LIVE STRAIGHT frame 1, the ribbon with a gold F7C53B rim and a fringe of short uneven teeth standing up on both sides, some long, some short, clustered, (5) LIVE STRAIGHT frame 2, the same teeth leaning slightly right as if a wave passes, (6) LIVE STRAIGHT frame 3, the wave at the far end, teeth near the start lying lower, (7) LIVE STRAIGHT frame 4, teeth relaxing back to frame 1, (8) LIVE CORNER, gold rim, teeth on the outside of the bend.
Row 2, LIVE ENDS AND STATES: (1) LIVE END AT A MACHINE, the ribbon ending in a small bright gold E5FB74 socket bead, (2) PULSE HEAD, a soft warm gold bead of light 90 pixels across sitting on a live straight ribbon, to be laid over a live tile, (3) DISCOVERED STRAIGHT, the dead ribbon with a hot orange FF8C5A rim and three bright cream FFE2AA beads catching torchlight along it, (4) DISCOVERED CORNER, (5) RECLAIM FLARE, a ribbon end swelling into a violet 9E51F6 lit bulb as it is pulled home, (6) SCORCHED END, the ribbon ending in a ragged burnt stub with grey ash flecks and one dying red E0483C ember, (7) DRAFT STRAIGHT, a translucent dark violet 3C3456 ribbon with a thin violet rim, ghostly, (8) DRAFT TIP, the draft ribbon ending in a fat black extruding drop with a violet to gold rim and one specular.
Row 3, THE FACILITY'S OWN WIRING: (1) INERT CABLE STRAIGHT, a thin flat grey 464E5F cable 24 pixels wide in a shallow channel, dull, (2) INERT CABLE CORNER, (3) INERT CABLE END, a small dead grey junction box, (4) SPLICED CABLE STRAIGHT, the same cable lit sage green 5AC8A0 with a faint glow, (5) SPLICED CABLE CORNER, (6) SPLICED JUNCTION, the junction box lit green, (7) WIRE THROUGH A VENT GRATE, the black ribbon passing under three pale steel bars BEC8E1, (8) WIRE ON CONCEALED GROUND, the black ribbon lying in a diagonal hatched channel 8C96B4.
Even spacing, one tile per cell, ribbons reaching cleanly to the cell edges where they must join and nothing else touching the edges, no text anywhere.

---

## Sheet 03 conduit-floors

**PATCH-REQUIRED wiring:** the tile loop at line 1954 fills every visible tile with one flat
colour by type (`TT[i]`: WALL 0, FLOOR 1, SHADOW 2, VENT 3, DOOR 4) at `ctx.fillRect(px,py,
s+1,s+1)`. Replace that one `fillRect` with `drawImage(cell, px,py, s+1,s+1)` chosen by type;
keep the wet overlay (line 1962), the Flow tier dim (1970), and draw the concealed hatch cell
where `CONC[i]` (1974) instead of the diagonal stroke. Walls have no face today; a wall cell
that touches a passable tile (the code's `wallSurface()` line 1444 already tells you) gets the
WALL FACE cell. The exfil marker (line 1983) is a 19.4 px gold outline, dim until every target is
dead. Void grain (`buildGrain` line 1789) is a 128 px seamless pattern at alpha 9: cell 13 is a
seamless 256 replacement for it, used with `createPattern`. Corner ticks (`drawSiteEdge` 1905)
are 94 px L shapes at each site corner. Tiles draw at 24.4 px in prowl and 8.5 to 12.5 in Flow,
so every cell must survive a 25x downscale: big flat value shapes, one or two edge details, no
fine texture.

**Shape law:** floor is the lightest value, shadow noticeably darker with a soft inner edge,
wall darkest with a hairline top face. Vent is three horizontal bars (already the code's
colourblind cue), door is a warm brown slab with a gold frame, concealed is a diagonal hatch,
wet is a sheen not a tint, lit is a pale wash with a hard edge. Exfil ready differs from exfil
locked by a full bright frame versus a broken dim one.

**PROMPT (copy-paste):**

Conduit style: top down stealth game art in a near black off world facility, matte void 05060A and iron 12141C surfaces with the faintest film grain, hard flat industrial geometry in desaturated steel blues 232733 and 2E3444 with hairline edge highlights, the world owns almost no colour, the only living colour is an oil slick iridescence running violet 9E51F6 through magenta BF2260 to gold F7C53B with a lime gold E5FB74 hot edge, plus dull lamp cream E0C896 and one alarm red E0483C, organic black fluid against insectoid crustacean machinery, clean crisp game asset edges, no soft haze, no text, no watermark, flat FF00FF magenta background for cutout.
A seamless tile sheet, 2 rows x 8 columns, each cell 256x256 pixels, every cell filling its whole square edge to edge so it tiles seamlessly with itself, separated by 16 pixel magenta FF00FF gutters. Seen from directly above, desaturated, so a black creature can own all the colour.
Row 1, GROUND: (1) EXPOSED FLOOR, flat steel plating 1E2331 with a faint plate seam and four tiny rivets, slightly lighter than everything else, (2) EXPOSED FLOOR variant, the same plating with one hairline scratch, (3) SHADOWED FLOOR, the same plating in darker 151823 with a soft darker band along one edge, (4) SHADOWED FLOOR variant, (5) CONCEALED CHANNEL overlay, a shallow cable trench with a diagonal hatch of pale lines 8C96B4 at low contrast on the shadow floor 151823, (6) VENT GRATE, a dark 191D2A recess with three pale steel bars BEC8E1 running horizontally, the colourblind cue, (7) WET FLOOR overlay, a translucent blue 3A78BE film with two soft pale 96CDFF reflection streaks, meant to be laid over a floor tile, (8) FLOODLIT FLOOR overlay, a pale cream E0C896 wash at low opacity with a hard straight edge, meant to be laid over a floor tile.
Row 2, WALLS AND MARKS: (1) WALL INTERIOR, near black 0A0C12 with the faintest grain, (2) WALL FACE, the same black with a single hairline steel highlight 2E3444 along its top edge, the lip where a wall meets floor, (3) DOOR CLOSED, a warm dark brown 3A2E22 slab with a thin gold E0A73C frame and one recessed bolt, (4) DOOR FORCED, the same frame with the slab gone and the floor 1E2331 showing through, frame bent, (5) EXFIL LOCKED, a floor tile with a thin dim gold E0A73C at forty percent square frame inset 2 pixels and a small exit arrow, frame broken at two corners, (6) EXFIL READY, the same with a full bright gold E0A73C frame and the arrow lit, (7) VOID GRAIN, the darkness outside the site, 05060A with very fine faint blue tinted noise, seamless, (8) SITE CORNER TICK, a magenta cell containing one thin pale steel BCCBE9 L shaped corner mark 200 pixels on each arm in its upper left, the only cell here that is a cutout rather than a tile.
Every tile seamless with itself, nothing but the corner tick touching cell edges on purpose, no text anywhere.

---

## Sheet 04 conduit-machines

**PATCH-REQUIRED wiring:** devices draw at line 2025: a box `fillRect(px+3,py+3,s-6,s-6)` (17.4 px)
with a rim, a gold glow blit when `dv.on` (line 2030, 75 px disc), a three letter code label
under it in prowl (line 2038, 11 px) or a chip in Flow (`deviceChip` 2129). Replace the box and
rim with `drawImage(cell, px+1,py+1, s-2,s-2)` picking OFF or ON by `dv.on`, and the action
frame by kind while on: sprinkler while `WET` is being refreshed, plate when `dv.on`, speaker
when `dv.on`, coolant when `dv.on`, fan by `dv.t` (line 1616), crane by whether an enemy died on
`dv.drop` this frame. Keep the labels: the Director rule from addendum 1 is that every machine
explains itself when tapped, and the code label is the fallback at any zoom. The sprinkler's
area rectangle in Flow (line 2048) stays a stroke. Ten kinds, one tile each, in the code:
sprinkler, plate, speaker, breaker, coolant, floodlight, fan, crane, doorlock, camera.

**Shape law:** each machine must be told apart by silhouette in a 17 px box with no label: the
sprinkler is a round head with radial nozzles, the plate is a flat square with a raised grid,
the speaker is a horn, the breaker is a tall lever cabinet, the coolant vent is a slotted dome,
the floodlight is a lamp head on a stalk, the fan is a ring with blades, the crane is a hook on
an arm, the door lock is a bolt housing, the camera is a lens on a bracket. OFF is dark steel
with a pale grey rim; ON is the same shape with a lit gold rim and one warm glowing element,
never a gold slab: the world owns no colour.

**PROMPT (copy-paste):**

Conduit style: top down stealth game art in a near black off world facility, matte void 05060A and iron 12141C surfaces with the faintest film grain, hard flat industrial geometry in desaturated steel blues 232733 and 2E3444 with hairline edge highlights, the world owns almost no colour, the only living colour is an oil slick iridescence running violet 9E51F6 through magenta BF2260 to gold F7C53B with a lime gold E5FB74 hot edge, plus dull lamp cream E0C896 and one alarm red E0483C, organic black fluid against insectoid crustacean machinery, clean crisp game asset edges, no soft haze, no text, no watermark, flat FF00FF magenta background for cutout.
A sprite sheet, 4 rows x 8 columns, each cell 256x256 pixels on flat magenta FF00FF, seen from directly above. Every machine sits on a square dark housing about 200 pixels across with slightly rounded corners, built with a faintly insectoid chitin look, ribbed and plated, in dark steel 2B3040 with a thin pale grey BECDEB rim when OFF, and in dark warm 241B0C with a thin lit gold E8B457 rim and one small glowing element when ON.
Row 1, OFF: (1) SPRINKLER, a round nozzle head with six radial spouts, (2) FLOOR PLATE, a flat square plate with a raised diamond grid and two contact studs, (3) SPEAKER, a wide flared horn seen from above with a ribbed throat, (4) BREAKER, a tall cabinet with one big lever and a row of four fuses, (5) COOLANT VENT, a slotted dome with frost etched on its slots, (6) FLOODLIGHT, a broad lamp head on a short stalk, lens dark, (7) FAN, a ring housing with four curved blades, (8) CRANE, a squat winch drum with a hooked arm folded across it.
Row 2, ON, the same eight in the same order with the gold rim: (1) sprinkler with its spouts lit, (2) floor plate with its grid studs glowing gold, (3) speaker with its throat lit, (4) breaker with the lever thrown and the fuses lit, (5) coolant vent with a pale blue 8CD7EB glow in its slots, (6) floodlight with its lens burning cream E0C896, (7) fan blades blurred into a ring, (8) crane with its arm extended and the hook glowing.
Row 3, ACTION FRAMES: (1) SPRINKLER SPRAYING frame 1, the lit sprinkler with a ring of pale blue 96CDFF droplets around it, (2) SPRINKLER SPRAYING frame 2, the droplets further out and fainter, (3) FLOOR PLATE ARCING frame 1, the lit plate with two thin white gold E5FB74 arcs jumping between its studs, (4) FLOOR PLATE ARCING frame 2, the arcs in a different place, (5) SPEAKER RINGING frame 1, the lit speaker with one thin gold sound ring around it, (6) SPEAKER RINGING frame 2, two rings, the outer fainter, (7) COOLANT VENTING frame 1, the lit vent with a puff of pale blue frost rising from its slots, (8) COOLANT VENTING frame 2, the frost spread wider and thinner.
Row 4, MORE ACTION AND THE LAST TWO MACHINES: (1) FAN SPINNING frame 1, the lit fan with three pale motion streaks leaving its left side, (2) FAN SPINNING frame 2, the streaks further left, (3) CRANE DROPPED frame 1, the lit crane with its hook slammed down and a dust ring, (4) CRANE DROPPED frame 2, the dust ring wider, the hook resting, (5) DOOR LOCK OFF, a bolt housing with a heavy bar across it, dark steel, pale rim, (6) DOOR LOCK ON, the same housing with the bar drawn back and a gold rim, (7) CAMERA OFF, a lens on a small bracket, dark, pale rim, (8) CAMERA ON, the lens lit with a faint gold iris and a gold rim.
Even spacing, one machine per cell, nothing touching cell edges, no text anywhere, no letters on any housing.

---

## Sheet 05 conduit-sources

**PATCH-REQUIRED wiring:** sources draw at line 2014, the same 17.4 px box as a machine, coloured
by kind: socket, generator, cart, vehicle, and the temporary `frozen` source that `freezeEnemy()`
line 1184 pushes when a guard walks through a live coolant vent (it thaws after 12 s). The cart
moves (`tickCart` 1363) and the vehicle battery goes flat (`src.capacity = 0`, line 1676), so
those need state cells. Swap the box for `drawImage` by kind and state; the label under it and
the Flow chip stay. A live generator is `noisy` and doubles enemy hearing (line 1076), so its
running frame should read as loud.

**Shape law:** socket is a small flat wall plate with two slots, generator is a big finned block,
cart is a box on four wheels with a handle, vehicle battery is a low wide cell with two terminals,
frozen guard is a hunched figure encased in a block of ice. Running versus idle differs by a
moving element, never by colour alone.

**PROMPT (copy-paste):**

Conduit style: top down stealth game art in a near black off world facility, matte void 05060A and iron 12141C surfaces with the faintest film grain, hard flat industrial geometry in desaturated steel blues 232733 and 2E3444 with hairline edge highlights, the world owns almost no colour, the only living colour is an oil slick iridescence running violet 9E51F6 through magenta BF2260 to gold F7C53B with a lime gold E5FB74 hot edge, plus dull lamp cream E0C896 and one alarm red E0483C, organic black fluid against insectoid crustacean machinery, clean crisp game asset edges, no soft haze, no text, no watermark, flat FF00FF magenta background for cutout.
A sprite sheet, 2 rows x 6 columns, each cell 256x256 pixels on flat magenta FF00FF, seen from directly above, every object about 200 pixels across on a square dark housing.
Row 1: (1) WALL SOCKET IDLE, a small flat plate 132435 with two dark slots and a thin blue 6EAAE1 rim, (2) WALL SOCKET TRICKLING, the same plate with a faint blue glow leaking from the slots, (3) GENERATOR OFF, a heavy finned block 152D26 with a dark exhaust stack and a thin sage green 5AC8A0 rim, (4) GENERATOR RUNNING frame 1, the block with its fins lit green and a short puff from the stack, (5) GENERATOR RUNNING frame 2, the puff larger and the fins brighter, (6) BATTERY CART PARKED, a boxy cart 231B12 on four small wheels with a push handle at its left end and a thin warm gold D6A860 rim.
Row 2: (1) BATTERY CART PUSHED, the same cart tilted a little with motion streaks behind its wheels, (2) VEHICLE BATTERY CHARGED, a low wide cell 132435 with two bright terminals and a full row of four lit cells inside, (3) VEHICLE BATTERY DRAINING, the same with two of the four cells dark and a faint spark at one terminal, (4) VEHICLE BATTERY FLAT, all cells dark, terminals corroded grey, rim dull, (5) FROZEN GUARD BATTERY frame 1, a hunched insectoid guard shape 8894AE encased in a translucent block of pale blue ice 8CD7EB with frost at its corners, (6) FROZEN GUARD BATTERY frame 2, the same block with a faint current shimmer running along one face.
Even spacing, one object per cell, nothing touching cell edges, no text anywhere.

---

## Sheet 06 conduit-patrols

**PATCH-REQUIRED wiring:** enemies draw at line 2063 as a 7 px radius disc coloured by state, a
facing tick of `0.42*s` px, and a gold spot arc at `0.44*s` px radius that fills with `e.spot`.
Bodies (line 2058) are a 7 px disc of `#C8785A` fading with `bd.decay/30`. Replace the disc with
`ctx.save(); translate(px,py); rotate(e.face); drawImage(cell, -s*0.5,-s*0.5, s,s); restore()`
picking the row by `e.kind` and the cell by `e.state` (`patrol`, `investigate`, `wire`, `hunt`,
`grabbed`, `frozen`) with the SEARCH cell used for `patrol` while `S.site.alert >= 2`, and the
SHOCKED cell for the second after `e.zapCd` is set (line 1108). Keep the spot arc procedural
but draw it with the ring cells if wanted. Bodies carry no kind (`S.bodies.push({x,y,mass,
decay,grace})`, line 1205), so one body shape serves all three, picked by decay third, plus a
CARRIED cell while `S.act.verb === "drag"`. The brute is in every table (`CFG.harvest`,
`enemyHp`, `enemyDamage`, speed, cone, range, hearing, smother immunity) but placed on no level
yet; it is drawn here so the first level that uses it needs no new art.

**Shape law:** insectoid crustacean defenders, no faces, no humans. Drone = a small three
segment flier with two paddle wings, sentry = a beetle shelled walker with a wide carapace and a
single eye lamp, brute = a heavy crab with two raised claws. Each is drawn FACING RIGHT (the code
rotates). States must differ by pose: calm is closed and level, search has the eye lamp raised
and antennae up, hunt is lunging with limbs splayed, investigate is leaning down with antennae
forward, walking the wire is one limb dragging along a line, grabbed is crushed under black
fluid, frozen is glazed in ice, shocked is arched with two arcs. At 14 px across only the outer
silhouette survives, so poses must change the outline, not the detail.

**PROMPT (copy-paste):**

Conduit style: top down stealth game art in a near black off world facility, matte void 05060A and iron 12141C surfaces with the faintest film grain, hard flat industrial geometry in desaturated steel blues 232733 and 2E3444 with hairline edge highlights, the world owns almost no colour, the only living colour is an oil slick iridescence running violet 9E51F6 through magenta BF2260 to gold F7C53B with a lime gold E5FB74 hot edge, plus dull lamp cream E0C896 and one alarm red E0483C, organic black fluid against insectoid crustacean machinery, clean crisp game asset edges, no soft haze, no text, no watermark, flat FF00FF magenta background for cutout.
A sprite sheet, 4 rows x 8 columns, each cell 256x256 pixels on flat magenta FF00FF, seen from directly above, every creature FACING RIGHT and about 190 pixels long. The defenders are insectoid crustacean machines in cool grey blue chitin 8894AE with darker 4E566A joints and one small lamp eye at the front. Calm eye lamp is dim cream E0C896, searching eye lamp is orange D08050, hunting eye lamp is alarm red E0483C.
Row 1, the DRONE, a small three segment flier with two paddle shaped wings and a thin tail: (1) CALM, wings level, tail straight, eye dim, (2) SEARCHING, wings raised, two antennae up, eye orange, (3) HUNTING, body lunging forward, wings swept back, eye red and flaring, (4) INVESTIGATING, nose dipped down, antennae forward, wings half folded, (5) WALKING THE WIRE, flying low with one leg dragging along a thin black line beneath it, (6) GRABBED, the drone crushed flat under a spread of black ferrofluid with a violet 9E51F6 rim, only its wing tips showing, (7) FROZEN, the drone glazed inside a translucent block of pale blue ice 8CD7EB, (8) SHOCKED, the drone arched with two thin white gold E5FB74 arcs jumping across its body.
Row 2, the SENTRY, a beetle shelled walker with a wide domed carapace, six short legs and a single eye lamp: (1) CALM, carapace closed, legs even, (2) SEARCHING, carapace lifted at the back, antennae up, eye orange, (3) HUNTING, legs splayed wide mid charge, eye red flaring, (4) INVESTIGATING, head down, front legs reaching forward, (5) WALKING THE WIRE, one foreleg tracing a thin black line under it, (6) GRABBED, crushed under black ferrofluid with a violet rim, carapace edge showing, (7) FROZEN, glazed in pale blue ice, (8) SHOCKED, arched with two white gold arcs.
Row 3, the BRUTE, a heavy armoured crab twice the sentry's bulk with two raised claws and a thick plated back: (1) CALM, claws folded, (2) SEARCHING, claws half open, eye orange, (3) HUNTING, claws wide and raised, body low, eye red, (4) INVESTIGATING, one claw down probing the floor, (5) WALKING THE WIRE, one claw pinching a thin black line, (6) SHOCKED, arched with three white gold arcs, (7) FROZEN, glazed in pale blue ice, (8) WAITING, sitting square with claws resting, eye dim, the pause at the end of a search.
Row 4, BODIES AND THE SPOT RING: (1) BODY FRESH, a downed defender on its back, legs curled, in dull rust C8785A with a faint warm sheen, (2) BODY HALF GONE, the same body flatter and duller, edges dissolving to specks, (3) BODY NEARLY GONE, only a faint rust smear and a few specks, (4) BODY CARRIED, the fresh body with a short black ferrofluid tether trailing left, (5) SPOT RING QUARTER, a thin gold E0A73C arc covering the top right quarter of a 220 pixel circle on magenta, (6) SPOT RING HALF, the arc covering the right half, (7) SPOT RING THREE QUARTERS, (8) SPOT RING FULL, a complete gold ring with a small red E0483C flare at its top.
Even spacing, one subject per cell, nothing touching cell edges, no text anywhere.

---

## Sheet 07 conduit-fixtures

**PATCH-REQUIRED wiring:** lights draw at line 2051: a warm glow blit at `s*2.4` radius (112 px
disc) then a 6.6 px cream square; a drunk light (`L.out`) is a 9.4 px grey outline square. The
glow discs themselves are `makeGlow()` sprites at line 1774: cells 3 and 4 replace those two
canvases directly and need no code beyond loading. The floodlit pool is `LIT[i]` (line 1600),
drawn nowhere today: overlay cell 5 on lit tiles. Plate arcs, frost, speaker rings and fan
streaks are extra layers over sheet 04's action cells for the tiles AROUND the machine (the
sprinkler area rectangle at line 2048 gets the spray cell tiled inside it in Flow). The crane
drop tile (`dv.drop`) has no marking today, so cell 10 is new information for the player. The
camera's covered ground (`S.seen`, line 1660) is also never drawn: cell 15 fixes that. Vision
cones stay procedural (ray cast, line 1989); cell 16 is a soft grain to `createPattern` into the
cone fill instead of the flat 9% tan.

**Shape law:** a light on is a bright square lamp with a soft round pool; a light out is a
dark cracked lamp with no pool. Hazard overlays must each have a distinct mark: arcs are
jagged lines, frost is soft crystals, wet is a sheen, lit is a flat wash, the crane drop is a
hard crosshair shadow, the camera wedge is a fan of thin lines.

**PROMPT (copy-paste):**

Conduit style: top down stealth game art in a near black off world facility, matte void 05060A and iron 12141C surfaces with the faintest film grain, hard flat industrial geometry in desaturated steel blues 232733 and 2E3444 with hairline edge highlights, the world owns almost no colour, the only living colour is an oil slick iridescence running violet 9E51F6 through magenta BF2260 to gold F7C53B with a lime gold E5FB74 hot edge, plus dull lamp cream E0C896 and one alarm red E0483C, organic black fluid against insectoid crustacean machinery, clean crisp game asset edges, no soft haze, no text, no watermark, flat FF00FF magenta background for cutout.
A sprite sheet, 2 rows x 8 columns, each cell 256x256 pixels on flat magenta FF00FF, seen from directly above.
Row 1, LIGHTS AND GLOWS: (1) CEILING LAMP ON, a small square lamp housing 80 pixels across in cream E0C896 with a bright centre and a thin dark frame, (2) CEILING LAMP OUT, the same housing dark grey 5A6478 with a cracked lens and no light, (3) WARM GLOW DISC, a soft round radial glow 240 pixels across from cream E0C896 at the centre fading to fully transparent at the edge, no hard rim, (4) GOLD GLOW DISC, the same soft disc in gold E0A73C, (5) FLOODLIT POOL overlay, a translucent flat wash of pale cream E0C896 filling the cell edge to edge with a faint straight edged beam pattern, seamless, (6) SPRINKLER SPRAY overlay, a scatter of small pale blue 96CDFF droplets and thin drop rings on transparent, seamless, (7) FLOOR PLATE ARC overlay frame 1, two jagged thin white gold E5FB74 lightning arcs crossing the cell on transparent, (8) FLOOR PLATE ARC overlay frame 2, the arcs in a different place.
Row 2, MORE HAZARD OVERLAYS: (1) COOLANT FROST overlay frame 1, soft pale blue 8CD7EB ice crystals feathering in from the cell edges on transparent, (2) COOLANT FROST overlay frame 2, the crystals grown further in, (3) CRANE DROP MARK, a hard dark 05060A crosshair shadow with a thin gold E0A73C ring, the tile where the hook falls, (4) SPEAKER SOUND RING frame 1, one thin gold E0A73C ring 200 pixels across on transparent, (5) SPEAKER SOUND RING frame 2, two rings, the outer one fainter, (6) FAN WIND STREAKS, four thin pale grey BECDEB horizontal motion streaks fading to the left, on transparent, (7) CAMERA VIEW WEDGE, a fan of five thin pale blue 6EAAE1 lines spreading from the left edge to the right edge, translucent, (8) VISION CONE GRAIN, a seamless very soft tan E0A73C at low opacity mottle on transparent, to fill a searchlight cone.
Even spacing, one element per cell, the overlays reaching the cell edges on purpose and the lamps and discs not, no text anywhere.

---

## Sheet 08 conduit-fx

**PATCH-REQUIRED wiring:** pulse (line 2105) is a violet ring growing to `pulseRange*s` = 188 px
radius over 3 s plus 4 px squares on every revealed object: cells 1 to 4. Tap (`tapNoise` 1325)
sets `S.player.tapT = 1.0` and nothing draws it; cells 5 and 6 are new, drawn at the creature for
one second. Douse (`drawFrame` line 1935) is a ring collapsing from the lamp into the creature
over 1.1 s: cells 7 to 9. Entering Flow (line 1927) spreads a violet ring across the screen:
cells 10 and 11. The hit ring (line 2661) and reclaim flare (2225) sit on the creature and wire,
so they carry ⚖️ only if sheets 01 and 02 are used, otherwise they overlay the procedural
drawing unchanged. Harvest has no drawing today beyond the swell: cells 14 and 15 are new. Zap
burn (`burnConduitFrom` 1052) has no drawing beyond the wire ending: cells 16 and 17 are new.
Alarm and lockdown (line 1921) are a cached radial gradient at 34% or 52% pressing in from the
edges: cells 18 and 19 are 512 px corner plates to draw in four mirrored corners. Peek tip
(2074), drag tether (2088) and cling ring (2096) are lines and a dashed ring: cells 20 to 22.

**Shape law:** the pulse is a clean ring, the tap is a knock (short concentric wedges, not a
ring), the douse is a shrinking lamp pool, the flow ring is a wide thin awareness circle, the
hit is a red rim, the harvest is a pull of specks INTO the creature, the zap is a burst OUT of
the wire with ash. Alarm is red at the edges only, lockdown is the same with the centre going
darker.

**PROMPT (copy-paste):**

Conduit style: top down stealth game art in a near black off world facility, matte void 05060A and iron 12141C surfaces with the faintest film grain, hard flat industrial geometry in desaturated steel blues 232733 and 2E3444 with hairline edge highlights, the world owns almost no colour, the only living colour is an oil slick iridescence running violet 9E51F6 through magenta BF2260 to gold F7C53B with a lime gold E5FB74 hot edge, plus dull lamp cream E0C896 and one alarm red E0483C, organic black fluid against insectoid crustacean machinery, clean crisp game asset edges, no soft haze, no text, no watermark, flat FF00FF magenta background for cutout.
An effects sheet, 3 rows x 8 columns, each cell 256x256 pixels on flat magenta FF00FF, every effect drawn on transparent so it can be laid over the game.
Row 1, PULSE AND TAP AND DOUSE: (1) PULSE RING frame 1, a thin violet 8A5CF6 ring 80 pixels across, bright, (2) PULSE RING frame 2, the ring 160 pixels across, fainter, (3) PULSE RING frame 3, the ring 240 pixels across, very faint, (4) PULSE MARKER, a small solid violet 8A5CF6 square 24 pixels across with a soft glow, (5) TAP KNOCK frame 1, three short concentric arcs of pale grey BECDEB fanning up and right from the centre like a knock, (6) TAP KNOCK frame 2, the arcs further out and fainter, (7) DOUSE frame 1, a soft cream E0C896 pool 220 pixels across with its rim starting to pull inward, (8) DOUSE frame 2, the pool shrunk to 120 pixels, rim bright, a few cream specks streaming toward the centre.
Row 2, FLOW AND HIT AND HARVEST AND ZAP: (1) DOUSE frame 3, only a 40 pixel cream spark and trailing specks, (2) FLOW RING frame 1, a wide thin violet 9E51F6 ring 160 pixels across, (3) FLOW RING frame 2, the ring 250 pixels across and faint, (4) HIT RING, a thin alarm red E0483C ring 200 pixels across with a dent on its left side and a small red spark, (5) HARVEST frame 1, a scatter of rust C8785A specks and thin streaks all pointing inward toward the centre, (6) HARVEST frame 2, the specks closer in and a faint gold F7C53B flare at the centre, (7) ZAP frame 1, a burst of thin white gold E5FB74 arcs and sparks radiating outward from the centre, (8) ZAP frame 2, the sparks fading to grey ash flecks with one red E0483C ember.
Row 3, EDGES AND TETHERS: (1) RECLAIM FLARE frame 1, a violet 9E51F6 lit bulb 100 pixels across with a soft glow, (2) RECLAIM FLARE frame 2, the bulb larger and brighter with a gold rim, (3) ALARM CORNER PLATE, a corner of a screen edged in translucent alarm red E0483C fading to transparent 120 pixels in, the top left corner in this cell, to be mirrored, (4) LOCKDOWN CORNER PLATE, the same corner in deeper red 8A2A22 with a black 05060A outer edge, (5) PEEK TIP, a small gold F7C53B bead 30 pixels across with a thin violet stem trailing left, (6) DRAG TETHER, a short thick strand of black 0D0F17 ferrofluid 220 pixels long running left to right with a rust C8785A tint at its right end, seamless end to end, (7) CLING RING, a thin dashed pale blue A0C8FF ring 220 pixels across, dashes 20 pixels long, (8) TOAST SPARK, a tiny gold E0A73C four point glint 40 pixels across for a notice.
Even spacing, one effect per cell, only the two corner plates and the tether touching cell edges on purpose, no text anywhere.

---

## Sheet 09 conduit-hud

**PATCH-REQUIRED wiring:** the HUD is `drawHUD` line 2342. The mass ribbon (`drawMassRibbon`
2258) is a rounded channel `barW x 14` px (barW is 196 at 375 wide, 340 at 844) with a body
fill of `mass/capacity`, a 1.5 px gold meniscus at the fluid's edge, a hatched committed
segment, and two notches at 30 and 70. The nine slice cells here replace the channel, the fill
(stretched by `bodyW`), the cap, the hatch tile (`createPattern`) and the two notches. Alert
pips (`drawAlertReadout` 2307) are five 13x7 px pills; cells 7 to 10. Buttons (`drawButton`
2322) are `bw x bh` (101x54 at 375x667, 96x48 at 320x568, 132x48 at 844x390) with radius 7 and
an inner rule when on; three plaque cells stretched with nine slice, text laid over by the
code. The gear is 48x48 at line 1847. Scrims (`drawScrim` 2336) are 72 px top and 141 px bottom
gradients; two tall cells stretched to width. Toast and route cost text (2435, 2440) sit on
nothing today: the plate cells give them a surface. Envelop card (2381) is 300x54 with a
280x8 bar; inspect card (2392) is 320x76; the lockdown warning (2358) is bare red text.

**Shape law:** buttons follow the plaque rule: art fills the plaque, centre stays calm for the
label, on and off differ by rim weight and an inner rule, not by a colour swap alone. The mass
ribbon reads by luminance: fill lighter than channel, meniscus brightest. Pips: off is hollow,
on is filled, red has a halo. Cards are dark slabs with one hairline rim and slightly rounded
corners, nothing ornate.

**PROMPT (copy-paste):**

Conduit style: top down stealth game art in a near black off world facility, matte void 05060A and iron 12141C surfaces with the faintest film grain, hard flat industrial geometry in desaturated steel blues 232733 and 2E3444 with hairline edge highlights, the world owns almost no colour, the only living colour is an oil slick iridescence running violet 9E51F6 through magenta BF2260 to gold F7C53B with a lime gold E5FB74 hot edge, plus dull lamp cream E0C896 and one alarm red E0483C, organic black fluid against insectoid crustacean machinery, clean crisp game asset edges, no soft haze, no text, no watermark, flat FF00FF magenta background for cutout.
A UI sheet, 3 rows x 8 columns, each cell 256x256 pixels on flat magenta FF00FF, every element built to be stretched or nine sliced so its corners are crisp and its middles are plain.
Row 1, THE MASS RIBBON AND PIPS: (1) RIBBON CHANNEL, a horizontal rounded trough 240x64 pixels, near black 07080D inside with a thin pale 76849F at twenty percent rim and a faint inner shadow, (2) RIBBON FILL, a horizontal band 240x64 of dark violet fluid, 4A3B70 at the top through 2E2447 to 221A38 at the bottom, with a thin iridescent top edge running violet 9E51F6 to gold F7C53B, plain in the middle for stretching, (3) MENISCUS CAP, the right hand end of that fluid, a bright gold F7C53B vertical lip 12 pixels wide with a tiny highlight, (4) COMMITTED HATCH tile, a 64x64 seamless tile of dark 222A3C with thin diagonal pale 96A4C4 lines, the wire you have spent, (5) SQUEEZE NOTCH, a thin vertical pale blue 6FB0EE tick 8x90 pixels with small caps top and bottom, (6) FORCE NOTCH, the same tick in gold E8B457, (7) PIP OFF, a small hollow rounded pill 130x70 pixels, dark 161A26 with a thin grey 8C9BB9 rim, (8) PIP ON GOLD, the same pill filled gold E0A73C.
Row 2, PIPS AND BUTTONS: (1) PIP ON RED, the pill filled alarm red E0483C with a thin red halo ring around it, (2) PIP RED HALO, only the thin red halo ring, to lay under a pip, (3) BUTTON PLAQUE OFF, a rounded rectangle 240x128 pixels, dark 0E1119 to 0A0C13 top to bottom with a thin 262C3C rim, centre plain and empty, (4) BUTTON PLAQUE ON, the same plaque in 202638 to 11141F with a thin violet 8A5CF6 rim and a fainter gold E0A73C inner rule 4 pixels inside it, (5) BUTTON PLAQUE HELD, the on plaque with the violet rim thicker and a faint violet inner glow, for a button being held down, (6) GEAR BUTTON, a rounded square 200x200 with the off plaque finish and a simple eight tooth gear glyph 8C97AE in its centre, (7) TOP SCRIM, a vertical gradient 64x256 from 05060A at eighty percent at the top to transparent at the bottom, to be stretched across the screen, (8) BOTTOM SCRIM, the same gradient reversed.
Row 3, PLATES AND CARDS: (1) TOAST PLATE, a rounded dark 080A10 at ninety percent slab 240x56 with a thin 78869F rim, plain, (2) ROUTE COST PLATE, the same slab with a tiny violet 9E51F6 wire glyph at its left end, (3) ENVELOP CARD, a rounded dark slab 240x100 with a thin violet 8A5CF6 rim and an empty rounded track 200x14 near its bottom, (4) ENVELOP PROGRESS FILL, a rounded violet 8A5CF6 bar 200x14 with a bright right cap, (5) INSPECT CARD, a rounded dark 080A10 at ninety four percent slab 240x140 with a thin 78869F rim and a faint hairline rule a third of the way down, (6) LOCKDOWN PLATE, the toast slab with an alarm red E0483C rim and a small red lightning bolt glyph at its left end, (7) HINT PLATE, a very faint dark slab with no rim for the grey hint text, (8) RESULT RULE, a thin horizontal line 240x6 fading from violet 8A5CF6 at the left to transparent at the right.
Even spacing, one element per cell, only the two scrims touching cell edges on purpose, no text anywhere, no letters on any plaque.

---

## Sheet 10 conduit-icons

**PATCH-REQUIRED wiring:** the ACT button label comes from `contextVerb()` line 1472, one of
eleven strings: TAP, SMOTHER, DRAG BODY, PUSH CART, DRINK LIGHT, CLING, DROP DOWN, DROP ON IT,
RELEASE, DROP BODY, LET GO. The other buttons are PULSE, FLOW, RECLAIM (Flow) or PEEK (prowl),
and the gear. `drawButton` line 2322 draws the label with `txt()` at 13 px: draw the glyph at
20 to 24 px to the left of the label (or above it on a 54 px button), keyed by `cv.id`. The
lightning glyph `⚡` is drawn at line 2040 and in `deviceChip` 2129 as text before the
needs number; cell 17 replaces it at 11 px. The ten device codes (SPR PLT SPK BRK COL FLD FAN
CRN LCK CAM) and five source codes (SKT GEN CRT ICE VEH) are text at 11 px under each box;
cells 18 to 32 are glyphs to draw beside or instead of them at the same size.

**Shape law:** every glyph is a single flat pale shape readable at 20 px, no interior detail,
no outlines thinner than 3 px at 256. Verbs that are opposites share a base shape flipped:
CLING is an arrow up a wall, DROP DOWN the same arrow down; DRAG BODY and DROP BODY are the
same body with and without a hand; PUSH CART and LET GO likewise.

**PROMPT (copy-paste):**

Conduit style: top down stealth game art in a near black off world facility, matte void 05060A and iron 12141C surfaces with the faintest film grain, hard flat industrial geometry in desaturated steel blues 232733 and 2E3444 with hairline edge highlights, the world owns almost no colour, the only living colour is an oil slick iridescence running violet 9E51F6 through magenta BF2260 to gold F7C53B with a lime gold E5FB74 hot edge, plus dull lamp cream E0C896 and one alarm red E0483C, organic black fluid against insectoid crustacean machinery, clean crisp game asset edges, no soft haze, no text, no watermark, flat FF00FF magenta background for cutout.
An icon sheet, 4 rows x 8 columns, each cell 256x256 pixels on flat magenta FF00FF. Every icon is one flat solid glyph about 180 pixels across in pale ink D6DEEE with no outline, no gradient and no interior detail, bold enough to read at 20 pixels.
Row 1, ACTION VERBS: (1) TAP, a small drop with three short knock arcs above it, (2) SMOTHER, a wide flat drop spread over a small beetle shape, (3) DRAG BODY, a curled beetle body with a short tether hooked to a small drop, (4) PUSH CART, a boxy cart with a handle and a small drop behind it, (5) DRINK LIGHT, a small square lamp with a drop reaching up to it, (6) CLING, a drop pressed against a vertical bar with an arrow pointing up, (7) DROP DOWN, the same drop and bar with the arrow pointing down, (8) DROP ON IT, a drop above a small beetle with a down arrow between them.
Row 2, MORE VERBS AND THE MODE BUTTONS: (1) RELEASE, a wide flat drop lifting off a small beetle with a gap between them, (2) DROP BODY, the curled beetle body with the tether cut, (3) LET GO, the cart with the drop moved away from its handle, (4) PULSE, a drop with two concentric rings around it, (5) FLOW, an eye shape over a small grid of four squares, (6) RECLAIM, a wavy wire with an arrow curling back on itself, (7) PEEK, a drop with one long thin tendril bending round a corner, (8) MENU, a simple eight tooth gear.
Row 3, THE POWER GLYPH AND MACHINES: (1) NEEDS POWER, a bold lightning bolt in gold E8B457, (2) SPRINKLER, a round head with six radial dots, (3) FLOOR PLATE, a square with a grid of nine dots, (4) SPEAKER, a flared horn, (5) BREAKER, a tall cabinet with a lever, (6) COOLANT VENT, a dome with three slots and a snowflake, (7) FLOODLIGHT, a lamp head on a stalk with three rays, (8) FAN, a ring with four blades.
Row 4, MORE MACHINES AND THE SOURCES: (1) CRANE, a hook on an arm, (2) DOOR LOCK, a bolt housing with a bar, (3) CAMERA, a lens on a bracket, (4) WALL SOCKET, a plate with two slots in pale blue 6EAAE1, (5) GENERATOR, a finned block with a stack in sage green 5AC8A0, (6) BATTERY CART, a box on wheels in warm gold D6A860, (7) FROZEN GUARD, a beetle inside an ice block in pale blue 8CD7EB, (8) VEHICLE BATTERY, a low cell with two terminals in pale blue 6EAAE1.
Even spacing, one glyph per cell, nothing touching cell edges, no text anywhere, no letters in any glyph.

---

## Sheet 11 conduit-title

**PATCH-REQUIRED wiring:** the title is DOM: `#overlay` line 161 paints two radial gradients over
the void as CSS `background`; swap in cell 1 as a `background-image` behind the panel (full
frame, `background-size: cover`). `#mark` line 162 is the word CONDUIT as gradient text at
`clamp(2.1rem, 11vw, 3.4rem)` (41 px at 375 wide, letter spaced 0.16em); the crest in cell 2
sits ABOVE it as an `<img>`, the wordmark stays live text so it scales and stays accessible.
`#rule` is a 1 px gradient line; cell 3 replaces it at 335x8. `#go` is a plaque at least 176x48
(`min-width: 11rem; min-height: 48px`); cell 4 is its `background-image`, text laid over. The
brand line `#brand` is 0.68rem letter spaced grey text; cell 5 is a small emblem beside it.
Cells 6 to 8 are the three site screens' backdrop plates so the sites and settings screens
stop sharing the title's gradient.

**Shape law:** the crest is the creature, not a logo: one black drop with a single spike, rim
lit, on nothing. The button plaque must be calm in the centre. Backdrops are near black with
one soft colour pool each, never a picture that competes with the panel text.

**PROMPT (copy-paste):**

Conduit style: top down stealth game art in a near black off world facility, matte void 05060A and iron 12141C surfaces with the faintest film grain, hard flat industrial geometry in desaturated steel blues 232733 and 2E3444 with hairline edge highlights, the world owns almost no colour, the only living colour is an oil slick iridescence running violet 9E51F6 through magenta BF2260 to gold F7C53B with a lime gold E5FB74 hot edge, plus dull lamp cream E0C896 and one alarm red E0483C, organic black fluid against insectoid crustacean machinery, clean crisp game asset edges, no soft haze, no text, no watermark, flat FF00FF magenta background for cutout.
A layout sheet, 2 rows x 4 columns, each cell 512x512 pixels, on flat magenta FF00FF with generous magenta gutters.
Row 1: (1) TITLE BACKDROP, a full cell 512x512 plate filling its square edge to edge, near black 05060A with a soft violet 8A5CF6 pool at low opacity in the upper centre and a fainter gold E0A73C pool at the bottom, the faintest film grain, one very faint dark steel corridor grid receding in perspective behind it all, built to sit behind white text, (2) TITLE CREST, a single drop of black ferrofluid 12141C 300 pixels across with one long spike rising to the upper right, its rim running violet 9E51F6 through magenta BF2260 to gold F7C53B with a lime gold E5FB74 tip, one small specular, on nothing, a wide shallow reflection of iridescence beneath it, room below for a wordmark, no letters, (3) TITLE RULE, a thin horizontal line 480x12 pixels running violet 8A5CF6 on the left through gold E0A73C to transparent on the right, with a tiny black drop bead at its left end, (4) ENTER BUTTON PLAQUE, a rounded rectangle 480x140 pixels, dark 1E1930 to 100E1A top to bottom with a thin violet 8A5CF6 rim, a faint iridescent violet to gold thread along its bottom edge, centre plain and empty for overlay text.
Row 2: (1) BRAND EMBLEM, a small simple wolf head in profile facing right, cut from a single flat shape in grey 5C6580 with a thin sky blue 6EAAE1 star above it, 200 pixels across, (2) SITES BACKDROP, a 512x512 plate edge to edge, near black with a faint top down blueprint of a facility floor plan in steel 2E3444 hairlines and one soft violet pool at the top, (3) SETTINGS BACKDROP, a 512x512 plate edge to edge, near black 05060A with a single soft steel blue 232733 pool at the centre and nothing else, (4) RESULT BACKDROP, a 512x512 plate edge to edge, near black with a faint gold E0A73C pool at the centre and a thin violet rule across its upper third.
Even spacing, the four backdrop plates filling their cells edge to edge on purpose, every other element clear of the edges, no text anywhere.

---

## Sheet 12 conduit-sites

**PATCH-REQUIRED wiring:** `renderSites()` line 2972 builds `#sites` from `LEVEL_ORDER`: a `.site`
card per level (335 px wide at 375, padding 0.8rem 0.9rem, 1 px rim, radius 4) with `h3` name,
`.teach` line, `.medals` line from `medalLine()` 2965 (Ghost, Efficiency, Economy, Speed), a
`.locked` line in `#C58F4A` from `LOCKED_HINT` 2957, and a full width 48 px button reading
Enter or Run it again; an Unfinished run card with Pick it back up when `sv.run` is set; the
residue line; and eight `.trait` rows from `TRAITS` line 395 (Splice, Insulation, Capacity,
Reclaim speed, Pulse reach, Fine tendril, Strong grip, Wall grip) each with a price button at
least 86x48. Cell 1 is the card `background-image` (nine slice via `border-image`). Cells 2 to
7 are a 48 px emblem floated left of each `h3`, keyed by level id. Cells 8 to 11 go inline
before each medal word at 16 px. Cells 12 to 19 sit left of each trait name at 20 px. Cells 20
to 22 are the residue, resume and locked glyphs. Cells 23 and 24 are the two button plaques.

**Shape law:** site emblems are the site's own lesson as one shape: Intake Bay a hook over a
crossing, Coolant Floor a drop over a grid, Vent Stack a grate with a wire through it,
Generator Hall a finned block over a diagonal hatch, Substation a lever with a dark ring,
Hive Spine two chambers on one bar. Medals: Ghost an eye closed, Efficiency a short wire,
Economy a full drop, Speed a chevron. Trait icons are flat and single shape like sheet 10.

**PROMPT (copy-paste):**

Conduit style: top down stealth game art in a near black off world facility, matte void 05060A and iron 12141C surfaces with the faintest film grain, hard flat industrial geometry in desaturated steel blues 232733 and 2E3444 with hairline edge highlights, the world owns almost no colour, the only living colour is an oil slick iridescence running violet 9E51F6 through magenta BF2260 to gold F7C53B with a lime gold E5FB74 hot edge, plus dull lamp cream E0C896 and one alarm red E0483C, organic black fluid against insectoid crustacean machinery, clean crisp game asset edges, no soft haze, no text, no watermark, flat FF00FF magenta background for cutout.
A UI sheet, 3 rows x 8 columns, each cell 256x256 pixels on flat magenta FF00FF.
Row 1, THE SITE CARD AND SIX SITE EMBLEMS: (1) SITE CARD FRAME, a rounded rectangle 240x200 pixels, dark 141722 to 0C0E16 top to bottom with a thin 78869F at twenty percent rim and a faint steel hairline inset, centre plain, built for nine slicing, (2) INTAKE BAY emblem, a crane hook hanging over a small crossing of two corridors, one flat pale ink D6DEEE shape 180 pixels across with a single gold E0A73C dot where they cross, (3) COOLANT FLOOR emblem, a water drop over a square grid of nine dots with one pale blue 6FB0EE dot, (4) VENT STACK emblem, a three bar grate with a thin wavy wire threading through it, (5) GENERATOR HALL emblem, a finned block above a short diagonal hatch, (6) SUBSTATION emblem, a breaker lever inside a dark ring with a small red E0483C dot at the top, (7) HIVE SPINE emblem, two hexagonal chambers joined by one long bar, (8) UNFINISHED RUN glyph, a drop with a small pause bar beside it, pale ink.
Row 2, MEDALS AND THE FIRST TRAITS: (1) GHOST medal, a closed eye in one flat shape, pale ink D6DEEE, (2) EFFICIENCY medal, a short wire of three tiles, (3) ECONOMY medal, a full round drop with a thin gold E0A73C rim, (4) SPEED medal, a bold chevron pointing right, (5) SPLICE trait, a dim cable with a green 5AC8A0 spark where a black wire joins it, (6) INSULATION trait, a wire wrapped in a soft sleeve, (7) CAPACITY trait, a large drop with a small plus beside it, (8) RECLAIM SPEED trait, a wire curling back with two motion streaks.
Row 3, MORE TRAITS AND GLYPHS AND BUTTONS: (1) PULSE REACH trait, a drop with three rings, the outer one dashed, (2) FINE TENDRIL trait, a drop with one very thin long tendril, (3) STRONG GRIP trait, a drop holding a curled beetle body with a thick tether, (4) WALL GRIP trait, a drop on a vertical bar with two small grip marks, (5) RESIDUE glyph, a small pile of three gold E0A73C crystals, (6) STILL ON IT glyph, a small warm gold C58F4A padlock with an open shackle, (7) ENTER BUTTON PLAQUE, a rounded rectangle 240x110 dark 1E1930 to 100E1A with a thin violet 8A5CF6 rim, centre plain, (8) RUN IT AGAIN PLAQUE, the same plaque with a thin gold E0A73C rim instead of violet.
Even spacing, one element per cell, nothing touching cell edges, no text anywhere, no letters in any glyph.

---

## Sheet 13 conduit-settings-result

**PATCH-REQUIRED wiring:** `#settings` line 183 is a card (`#setpanel`, max 24rem wide, radius 14,
`rgba(16,18,28,.92)` with an 18% rim) holding four `.setrow` lines (Sound, Haptics, Controls,
Motion) each with a toggle button at least 112x48 whose label `settingsLabel()` line 2916
reads On or Off, Right handed or Left handed, Full or Reduced; and a full width back plaque
`#setclose`. Cell 1 is the card `border-image`; cells 2 to 9 are 24 px icons placed before each
row's `<span>`, swapped by state in `paintSettings()` 2921; cell 10 is the toggle plaque; cell
11 the back plaque. The result is canvas, `drawResult` 2478: a 90% black overlay, the word
Extracted or Lost at 22 px, a 1 px violet rule, four medal lines at 13 px, and the tap hint.
Cell 12 is a plate behind that block (327 px wide at 375), cells 13 and 14 are the two title
glyphs drawn left of the word, cell 15 the rule, cell 16 the tap chevron. The only way to Lose
is `ledgerDamage` line 833 reaching zero mass: "Dissipated."

**Shape law:** on and off states of each setting differ by shape, never by a colour swap:
sound on is a horn with waves, off is the horn with a bar through it; haptics on is a phone
with motion lines, off is the phone still; right hand is a hand with the thumb on the right,
left hand mirrored; motion full is a drop with a spike, reduced is a plain round drop.
Extracted is a drop rising through an open door frame; Lost is a scatter of specks.

**PROMPT (copy-paste):**

Conduit style: top down stealth game art in a near black off world facility, matte void 05060A and iron 12141C surfaces with the faintest film grain, hard flat industrial geometry in desaturated steel blues 232733 and 2E3444 with hairline edge highlights, the world owns almost no colour, the only living colour is an oil slick iridescence running violet 9E51F6 through magenta BF2260 to gold F7C53B with a lime gold E5FB74 hot edge, plus dull lamp cream E0C896 and one alarm red E0483C, organic black fluid against insectoid crustacean machinery, clean crisp game asset edges, no soft haze, no text, no watermark, flat FF00FF magenta background for cutout.
A UI sheet, 2 rows x 8 columns, each cell 256x256 pixels on flat magenta FF00FF. Icons are single flat pale ink D6DEEE shapes about 180 pixels across with no outline and no interior detail.
Row 1, THE SETTINGS CARD AND ITS ICONS: (1) SETTINGS CARD FRAME, a rounded rectangle 240x220 with 28 pixel corner radius, dark 10121C at ninety two percent with a thin 78869F at eighteen percent rim, centre plain, for nine slicing, (2) SOUND ON, a small horn with three curved waves leaving it, (3) SOUND OFF, the same horn with one diagonal bar through it and no waves, (4) HAPTICS ON, a tall rounded phone shape with two short motion arcs each side, (5) HAPTICS OFF, the phone shape alone, (6) RIGHT HANDED, an open hand with the thumb on the right side, (7) LEFT HANDED, the same hand mirrored with the thumb on the left, (8) MOTION FULL, a drop with one long spike and a fringe of small teeth.
Row 2, MOTION REDUCED AND PLAQUES AND THE RESULT: (1) MOTION REDUCED, a plain round drop with a thin rim and no teeth, (2) TOGGLE PLAQUE, a rounded rectangle 240x110 dark 0E1119 to 0A0C13 with a thin 262C3C rim, centre plain, (3) BACK PLAQUE, a rounded rectangle 240x110 dark 1E1930 to 100E1A with a thin violet 8A5CF6 rim, centre plain, (4) RESULT PLATE, a rounded rectangle 240x220 near black 080A10 at ninety four percent with a thin 78869F rim and a faint gold E0A73C pool in its upper left, centre plain, (5) EXTRACTED glyph, a black 12141C drop with a violet to gold rim rising up through an open rectangular door frame in gold E0A73C, (6) LOST glyph, a scatter of small black 12141C specks and one fading red E0483C spark where a drop used to be, (7) MEDAL RULE, a thin horizontal line 240x6 in violet 8A5CF6 at fifty percent, (8) TAP HINT CHEVRON, a small down pointing chevron in grey 5F687C.
Even spacing, one element per cell, nothing touching cell edges, no text anywhere.

---

## Sheet 14 conduit-backdrops

**PATCH-REQUIRED wiring:** every site draws the same tile set and the same `#05060A` void; the six
levels differ only by layout and name. `draw()` line 1949 fills the frame black, then
`drawFrame()` line 1919 lays the grain pattern over everything. One plate per site, drawn
right after the black fill and before the tiles, tiled with `createPattern(plate, "repeat")`
scaled to `cam.s*8` px per repeat and offset by `cam.x, cam.y` so it scrolls with the world,
keyed by `S.level`. Kept desaturated and dark so the tiles above stay the lightest thing and
the creature owns the colour. Also usable as the card image behind each site on the site
select (`#sites`) at 335x120 cropped.

**Shape law:** each plate is a seamless 512 texture of the ground OUTSIDE the site: not a
picture, a material. Intake Bay is bare cast plate, Coolant Floor is frost pitted plate,
Vent Stack is ducting seen from above, Generator Hall is heavy ribbed decking, Substation is
cable trays, Hive Spine is honeycomb chitin. All within two values of `#05060A`.

**PROMPT (copy-paste):**

Conduit style: top down stealth game art in a near black off world facility, matte void 05060A and iron 12141C surfaces with the faintest film grain, hard flat industrial geometry in desaturated steel blues 232733 and 2E3444 with hairline edge highlights, the world owns almost no colour, the only living colour is an oil slick iridescence running violet 9E51F6 through magenta BF2260 to gold F7C53B with a lime gold E5FB74 hot edge, plus dull lamp cream E0C896 and one alarm red E0483C, organic black fluid against insectoid crustacean machinery, clean crisp game asset edges, no soft haze, no text, no watermark, flat FF00FF magenta background for cutout.
A seamless texture sheet, 1 row x 6 columns, each cell 512x512 pixels filling its square edge to edge and tiling seamlessly with itself, separated by 24 pixel magenta FF00FF gutters. Every texture is seen from directly above, very dark, between 05060A and 12141C with hairline 1C2030 highlights only, desaturated, low contrast, a material and never a picture.
(1) INTAKE BAY, bare cast metal plate with faint large panel seams and sparse rivets, (2) COOLANT FLOOR, the same plate pitted with faint frost bloom and thin frozen drip lines, (3) VENT STACK, a field of square ducting seen from above with faint slotted grates at intervals, (4) GENERATOR HALL, heavy ribbed steel decking with wide parallel ribs and small drain holes, (5) SUBSTATION, cable trays running parallel with faint bundled cables lying in them and small clamps, (6) HIVE SPINE, a honeycomb of hexagonal chitin cells with soft organic ridges, still near black, the one texture here that is grown rather than built.
Every texture seamless with itself, filling its cell edge to edge on purpose, no text anywhere.

---

## Full animation sets

Frames the code can drive today, per character. Rates are the code's own clocks.

- **The creature ⚖️** (sheet 01): IDLE 8 frame bubbling loop at 5 fps (`sin(T*1.1)` period);
  MOVE 2 (teardrop, fast teardrop) blended by input magnitude; FIELD 2 (calm, full) blended by
  `FX.fs`, rotated by `FX.fa`; CAPSULE 2 by speed while `mass < 30` in a vent; THIN and FULL
  by mass thresholds 30 and 70; SPLIT 3 and MERGE 3 (M5, `player.blobs` is already a list);
  SWELL 1 on `FX.swell`; HIT 1 on `FX.ripple`; POOLED 1 on `isPooled()`; CLING 1; PEEK 1;
  DRAGGING 1; SMOTHER 1 during `S.act.verb === "envelop"`; DIE 2 (dissipate) on
  `S.result.ok === false`; WIN 1 (extract) on `S.result.ok`. Total 32 cells.
- **Drone, sentry, brute** (sheet 06): IDLE/patrol 1, SEARCH 1, HUNT 1, INVESTIGATE 1, WIRE 1,
  GRABBED 1 (drone and sentry; the brute is immune), FROZEN 1, HIT/shocked 1 (or WAIT for the
  brute), DIE via the shared body: BODY fresh, half, nearly gone, carried (4). The code has no
  walk cycle for patrols; movement is position only. If a walk is wanted later it needs a
  second sheet of 4 leg frames per kind, and a `e.leg` counter already exists in state.
  WIN for a patrol does not exist: the site never wins.
- **Machines** (sheet 04): OFF 1, ON 1, ACTION 2 for sprinkler, plate, speaker, coolant, fan,
  crane; door lock and camera and breaker and floodlight are ON/OFF only.
- **Sources** (sheet 05): socket 2, generator 3, cart 2, vehicle 3, frozen guard 2.
- **Wire ⚖️** (sheet 02): live straight 4 frame wave at `2.4` rad/s, everything else static
  with pulse head, flare, beads and draft tip as overlays.

---

## Coverage: every draw function and which sheet covers it

| function or inline block | line | covered by |
|---|---|---|
| `draw()` void fill | 1949 | 14 backdrops |
| `draw()` tiles loop, type fill | 1954 | 03 floors |
| `draw()` wet overlay and sheen | 1962 | 03 wet cell, 07 spray |
| `draw()` Flow tier dim | 1970 | stays code (alpha only) |
| `draw()` concealed hatch | 1974 | 03 concealed |
| `draw()` vent bars, door outline | 1976 | 03 vent, door |
| `draw()` exfil | 1983 | 03 exfil locked and ready |
| `draw()` vision cones | 1989 | stays procedural, 07 cone grain fills it |
| `draw()` site wiring | 2003 | 02 ⚖️ row 3 |
| `drawConduit` | 2152 | 02 ⚖️ |
| `drawConduit` spikes | 2170 | 02 ⚖️ live frames |
| `drawConduit` body and rim | 2194 | 02 ⚖️ dead and live |
| `drawConduit` discovered beads | 2205 | 02 ⚖️ discovered |
| `drawConduit` pulse head | 2212 | 02 ⚖️ pulse head |
| `drawConduit` reclaim flare | 2225 | 02 ⚖️ and 08 |
| `drawConduit` draft tip | 2233 | 02 ⚖️ draft tip |
| `draw()` sources | 2014 | 05 sources |
| `draw()` devices, glow, label, badge | 2025 | 04 machines, 07 gold glow, 10 icons |
| `deviceChip` | 2129 | 09 toast plate shape, 10 icons |
| `draw()` sprinkler area rect | 2048 | 07 spray |
| `draw()` lights and out lights | 2051 | 07 lamps, warm glow |
| `draw()` bodies | 2058 | 06 row 4 |
| `draw()` enemies, facing tick, spot ring | 2063 | 06 |
| `draw()` peek tendril | 2074 | 08 peek tip (01 ⚖️ PEEK cell) |
| `draw()` drag tether | 2088 | 08 tether |
| `drawBlob` | 2635 | 01 ⚖️ |
| `drawCapsule` | 2620 | 01 ⚖️ capsule cells |
| `ferroBlob`, `tracePts`, `paintFerro`, `fieldTarget`, `updateFX` | 2512 to 2595 | 01 ⚖️ (geometry replaced only under amendment A; kept under B) |
| `draw()` cling ring | 2096 | 08 cling ring |
| `draw()` pulse reveal | 2105 | 08 pulse |
| `drawSiteEdge` | 1905 | 03 corner tick |
| `drawFrame` grain, vignette | 1918 | 03 void grain, 14 |
| `drawFrame` alarm and lockdown edge | 1921 | 08 corner plates |
| `drawFrame` flow ring | 1927 | 08 flow ring |
| `drawFrame` douse collapse | 1935 | 08 douse |
| `makeGlow`, `blitGlow` | 1774, 1784 | 07 glow discs |
| `buildGrain`, `buildAlarmGradient`, `buildVignette` | 1789 to 1805 | 03, 08, stays code |
| `rr`, `txt` | 2242, 2249 | helpers, no art |
| `drawMassRibbon` | 2258 | 09 row 1 |
| `drawAlertReadout` | 2307 | 09 pips |
| `drawButton` | 2322 | 09 plaques, 10 glyphs |
| `drawScrim` | 2336 | 09 scrims |
| `drawHUD` lockdown line | 2358 | 09 lockdown plate |
| `drawHUD` FLOW hint | 2377 | 09 hint plate |
| `drawHUD` envelop card | 2381 | 09 envelop card |
| `drawHUD` inspect card | 2392 | 09 inspect card |
| `drawHUD` route cost, toast | 2435, 2440 | 09 plates, 08 toast spark |
| `drawHUD` mass leak bar | 2447 | dev only, no art |
| `drawDev` | 2456 | dev only, no art |
| `drawResult` | 2478 | 13 result cells, 11 result backdrop |
| `#overlay`, `#mark`, `#rule`, `#go`, `#brand` | 161 to 173 | 11 title |
| `#sites`, `renderSites`, `medalLine` | 175, 2972, 2965 | 12 sites, 11 sites backdrop |
| `#settings`, `paintSettings` | 183, 2921 | 13 settings, 11 settings backdrop |
| `resize`, `layout`, `flowFit`, `updateCamera`, `clampCam` | 1813 to 1892 | geometry, no art |
| `music-unlocks.js` chip and card | fleet include, not this file | fleet art, out of scope here |

Things the code has that no sheet could invent and every sheet respects: there is no fog of
war (every patrol is always drawn, so "reveal" verbs are sim only); the pooled state and the
tap knock have no drawing at all today; a body has no kind; the brute is placed on no level;
the only death is "Dissipated."; and there is no pause.

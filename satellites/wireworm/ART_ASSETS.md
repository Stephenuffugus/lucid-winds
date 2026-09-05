# WIREWORM, art asset list

> Drive copy (the prompts, for the phone): https://docs.google.com/document/d/17Lbc2ZxoxsHZ03sjvCSUvRU0toSCcmPR4eGU5CQzK5s/edit  in 012Assets. This file is the source of truth; the Doc is regenerated from it.

Written from the code in `satellites/wireworm/index.html` (3080 lines, 2026-09-02), not from the build notes. Every size below was computed by running the live `layoutModel` at 375x667 with the measured 64px header and 64px footer. Nothing in this file has been applied to the game; the game still draws every pixel procedurally.

## What the game is

Snake on a 20x20 grid where the trail you leave is copper wire: touch a coloured terminal to charge, touch its twin and the slice of trail between them becomes a lit circuit, and lit wire is lethal to cross. Lit wire piles up until the board passes 55 percent load and the breaker trips (overload, everything clears, bonus paid), a cream relief valve pickup discharges the oldest circuit, and every 45 ticks without a completion the current creeps one cell outward on its own. Two modes: endless (die to wall, live wire, or nothing) and daily (600 ticks, the clock ends it).

## Render architecture

- One `<canvas id="board">` sized square by `layoutModel(availW, availH)` at index.html:815. At 375x667 the header is 64px, the footer 64px, the turn pads 120px, so the board is **373x373 CSS px** and one cell is **18.65 px**. At 390x844 it is 388px, cell 19.40. At 320x568 it is 318px, cell 15.90. Desktop is height bound: 1280x800 gives 550px, cell 27.50. Formula: `side = max(160, min(availW, availH - padH) - 2)`, `cell = side / 20`, `padH = clamp(120, availH * 0.17, 160)`.
- DPR: `dpr = min(2.5, devicePixelRatio)`; the backing store is `round(side * dpr)` and `bx.setTransform(dpr,0,0,dpr,0,0)` (index.html:2381), so all drawing code works in CSS px. On a 3x phone one cell is 46.6 device px. Cells at 256 px in the sheets are more than enough; drawImage with default smoothing.
- Loop: `frame(t)` (index.html:2738) runs every rAF, advances `phase` at 0.012 per ms (used by every pulse and the marching glyphs), steps the SIM at `tickMs()` = 220ms minus 4ms per circuit down to a 90ms floor, then calls `draw()` (board) and `hud()` (DOM score and `drawRing()` on a second 104x104 canvas shown at 52x52).
- Draw order inside `draw()` (index.html:2441): substrate fill, 1px grid etch, amber overload frame, dead wire, pending circuit tint, live wire with lime shadow glow, dark marching glyph stamps, white spark front, terminals, pickup, creep rings, head, white flash.
- Two DOM overlays: `#sheetOver` (death screen) and `#sheetOpt` (options, which is also the only how-to text in the game). One `#toast`. No title screen: `startRun` fires at boot (index.html:3068) and the worm is moving before the player has read anything. No pause screen: a hidden tab sets `running=false` and nothing sets it true again except a new run.
- Reduced motion (`reduced()`, index.html:2357) kills the glow, pulse, blink, shake, flash and creep rings and makes the spark instant. Sprite art must read without any of those.

### The palette the CSS and canvas actually use

| Role | Hex | Where |
|---|---|---|
| page background | `#0a0b0f` | body, `.sheet`, death card |
| panel | `#12141b` | buttons, stat tiles, toggles |
| line | `#1c2029` | every border, combo ring track, card frame |
| board substrate | `#0c1209` | `draw()` fill, terminal hole edge, eye dots |
| board CSS background | `#0c0f0b` | `#board` (visible only during the 1 frame before first draw) |
| grid etch | `#10160b` | 1px lines every cell |
| live wire | `#a3e635` | trace, combo ring, START button, theme colour |
| live wire bead | `#c6f04f` | the solder joint on a live node |
| live glow | `rgba(163,230,53,0.55)` | shadowBlur 6.5px |
| dead wire | `#55693e` | trace |
| dead wire bead | `#6b8450` | node |
| glyph stamp | `#0d1408` | dark shapes marching along live runs |
| lime dim | `#6b8f22` | toast border |
| pad button fill | `#10140c`, glyph `#6d7a5f`, pressed `#1d2612` | turn pads |
| warm amber | `#ffcf70` | load readout, creep ring, combo blink |
| combo gold | `#ffd166` | combo ring at x3 and x4 |
| overload frame | `rgba(255,180,70,0.20..0.75)` | board edge past 35 percent load |
| relief valve | `#e8dcc8` | pickup disc |
| head alive | `#eaffd0` | worm |
| head dead | `#8c2b2b` | worm after death |
| spark and flash | `#ffffff` | completion front, overload flash |
| text | `#e7ecdd` | score, buttons |
| muted text | `#8e9a86` | sub line, labels |
| studio line | `#4d5647` | death card footer |
| green terminal | `#4ade80` | glyph 0, triangle, x1.0 |
| blue terminal | `#60a5fa` | glyph 1, square, x1.5 |
| amber terminal | `#fbbf24` | glyph 2, diamond, x2.5 |
| red terminal | `#f87171` | glyph 3, cross, x4.0 |
| card dead wire | `#33401f` | death card only |

### How art drops in, sheet by sheet

| Sheet | Function and line | What the drawImage replaces | In-game px at 375x667 |
|---|---|---|---|
| 01 substrate and frame | `draw()` index.html:2446 to 2456 (fill + grid loop) and 2459 to 2466 (overload strokeRect) | the `#0c1209` fillRect and the 19+19 etch lines; the amber frame | 373x373 board; frame stroke 2 to 7px |
| 02 wire autotile | `drawWireCell(i, live)` index.html:2419 | the rounded strokes toward same-state neighbours plus the bead | one cell 18.65x18.65; live stroke 7.8px, dead 5.2px, link reaches 10.3px from centre |
| 03 terminals, glyphs, tint | terminal loop index.html:2526 to 2547; `fillGlyph` index.html:2400 (called at 2515 for the marching stamps and 2539 inside terminals); pending tint index.html:2471 to 2484; charge dot index.html:2585 to 2589 | terminal disc + ring + glyph; the dark stamp; the 0.16 alpha square; the coloured dot above the head | terminal 15.7px disc, open ring 23.1px; stamp 6.3px; tint 16.7px square; charge dot 7.5px |
| 04 the worm head | head block index.html:2577 to 2584 | the `#eaffd0` disc with two eye dots | 14.9px disc, eyes 2.6px at 2.8px forward and 2.4px to each side |
| 05 pickup and FX | pickup index.html:2549 to 2557; spark front index.html:2518 to 2523; creep ring index.html:2564 to 2576; flash index.html:2591 to 2594; `doTick` event switch index.html:2766 to 2790 for discharge and death hooks | the cream disc with a dark bolt; the white 15.7px spark; the amber expanding ring 11 to 45px; the white full-board wash | pickup 11.2 to 13.1px (bobs); spark 15.7px; creep ring 11.2 to 44.8px; flash full board |
| 06 HUD chrome | `drawRing()` index.html:2598 (canvas 104 shown at 52); `#hud` markup index.html:116 to 121 and CSS index.html:33 to 50 | the `#1c2029` track under the procedural arc; the ⚙ HTML entity; the score and load text stays text | combo badge 52x52; gear button 48x48 with a 19px glyph; load lamp 64px wide box |
| 07 controls | `#pad` and `#foot` markup index.html:128 to 136, CSS index.html:68 to 78; `#zoneHint` index.html:61 to 64 and 126 | CSS backgrounds on `.padbtn`, `.fbtn`, `.tgl`; the ↺ ↻ entities | pad button 170.5x108 (x2); footer button 111.7x48 (x3); toggle 88x48; zone hint arrows 34px |
| 08 screens | `#sheetOver` index.html:138 to 152 filled by `onDeath` index.html:2845; `#sheetOpt` index.html:154 to 168 filled by `openOpts` index.html:3001; `.stat` CSS index.html:97 to 99; `#toast` index.html:100 to 104 | the flat `rgba(6,7,10,0.93)` sheet, the `.stat` panels, the row dividers, the toast box | sheet 375x667; stat tile 167x52 (six of them, two columns); toast up to 322px wide |
| 09 death card and wordmark | `buildCard()` index.html:2877 to 2909 | the `#0a0b0f` fill, the 560x560 board plate, the 28px live and dead squares at 2893, the `fillText` title at 2897 | 640x960 card shown at 250x375 in the over sheet |

The board canvas is square and centred inside `#stage`; on a wide viewport there is dead `#0a0b0f` page background on both sides of it. A page backdrop (sheet 01, cell 2) can go on `body` as a CSS background with zero engine change.

## Asset table

| id | what | where it draws | in-game px (375x667) | cells | priority |
|---|---|---|---|---|---|
| 01a | board substrate plate | `draw()` 2446 | 373x373 | 1 | 1 |
| 01b | page backdrop | body CSS | 375x667 | 1 | 2 |
| 01c | overload warning frame | `draw()` 2459 | 373x373 ring, 2 to 7px stroke | 3 (35, 45, 55 percent) | 2 |
| 02a | dead wire autotile | `drawWireCell(i,false)` 2419 | 18.65 cell | 16 (4-bit N E S W mask) | 1 |
| 02b | live wire autotile | `drawWireCell(i,true)` 2419 | 18.65 cell | 16 | 1 |
| 03a | terminal closed | terminal loop 2526 | 15.7 disc | 4 colours | 1 |
| 03b | terminal open (charged twin) | terminal loop 2541 | 23.1 ring | 4 colours | 1 |
| 03c | marching glyph stamp | `fillGlyph` 2515 | 6.3 | 4 shapes | 2 |
| 03d | pending circuit tint tile | 2471 | 16.7 square | 4 colours | 3 |
| 03e | head charge dot | 2585 | 7.5 | 4 colours | 2 |
| 04a | worm head alive | head 2577 | 14.9 | 2 (idle, crawl) | 1 |
| 04b | worm head charged | head 2577 plus 2585 | 14.9 | 1 | 2 |
| 04c | worm head hit and dead | head 2577 (`st.alive` false) | 14.9 | 2 (flinch, dead) | 1 |
| 04d | worm head win and overload | head 2577 on `completed` and `overload` events | 14.9 | 3 (2 win, 1 overload) | 2 |
| 05a | relief valve pickup | 2549 | 11.2 to 13.1 | 2 (bob) | 2 |
| 05b | spark front | 2518 | 15.7 | 3 | 2 |
| 05c | creep ring | 2564 | 11.2 to 44.8 | 4 | 2 |
| 05d | overload burst | 2591 | full board wash | 3 | 2 |
| 05e | discharge puff | none yet, hook at 2778 | one cell 18.65 | 2 | 3 |
| 05f | death impact | none yet, hook at 2789 | 2 cells 37 | 2 | 3 |
| 06a | combo ring badge plate | `drawRing()` 2598 | 52x52 | 3 (x1 to x2, x3 to x4 gold, blink) | 2 |
| 06b | gear icon | `#btnOpt` 120 | 19 glyph in 48x48 | 1 | 2 |
| 06c | load lamp | `#loadBox` 119 | 24 icon beside 17px text | 3 (35, 45, 55 percent) | 2 |
| 06d | HUD panel strip | `#hud` 116 | 375x64 | 1 | 3 |
| 07a | turn pad plaques | `.padbtn` 69 | 170.5x108 | 4 (left rest, left pressed, right rest, right pressed) | 1 |
| 07b | footer button plaques | `.fbtn` 74 | 111.7x48 | 3 (panel, panel pressed, lime go) | 1 |
| 07c | toggle plaques | `.tgl` 90 | 88x48 | 2 (off, on) | 3 |
| 07d | zone hint arrows | `#zoneHint` 126 | 34 | 2 | 3 |
| 08a | sheet backdrop | `.sheet` 80 | 375x667 | 1 | 2 |
| 08b | stat tile plate | `.stat` 97 | 167x52 | 1 | 2 |
| 08c | result header ornament | `#overTitle` 139 | 343x40 | 1 | 2 |
| 08d | options row divider | `.row` 86 | 343x2 | 1 | 3 |
| 08e | toast box | `#toast` 100 | up to 322x40 | 1 | 3 |
| 08f | title plate | no screen exists, see note | 375x667 | 1 | 3 |
| 09a | death card plate | `buildCard()` 2880 | 640x960 | 1 | 3 |
| 09b | card wire chips | 2893 | 28x28 | 2 (live, dead) | 3 |
| 09c | WIREWORM wordmark | 2897 and the card header | 560x60 on card | 1 | 2 |

Priority 1 sheets: **02 wire autotile**, **04 worm head**, **07 controls** (the two turn pads and three footer buttons are 341x108 plus 375x48 of the screen and are on screen for the whole run). Sheet 03 terminals is priority 1 as well because two pairs are always on the board.

---

## Style line (use in every prompt, verbatim)

> Wireworm style: clean flat vector game art of a glowing printed circuit board at night, matte near black substrate 0C1209 with faint 10160B grid etching, rounded PCB traces with round solder bead joints, electric lime A3E635 live current with a soft C6F04F core glow, dead trace olive 55693E, warm amber FFCF70 heat accents, cream E8DCC8 relief, bold silhouettes that read at 16 pixels, no gradients beyond a soft glow, no text, no watermark, crisp game asset edges, flat FF00FF magenta background for cutout.

Derived from the shipped icon (a lime dashed square trace with four bead joints on a near black panel), the `#0c1209` board, the `#a3e635` accent and the amber warning ramp. Nothing botanical, nothing organic except the worm itself.

---

## Sheet 01, board substrate, page backdrop and overload frame

**PATCH-REQUIRED wiring:** replace the fill and etch loop at `draw()` index.html:2446 to 2456 with `bx.drawImage(substrate, 0, 0, boardPx, boardPx)`. Keep the 14px CSS border radius on `#board`; the plate can be square, the canvas element clips it. The overload frame at 2459 to 2466 becomes `bx.globalAlpha = 0.20 + 0.55 * k; bx.drawImage(frame[stage], 0, 0, boardPx, boardPx)` where `k` is the same 0 to 1 ramp already computed; three stages at k = 0, 0.5, 1 pick the cell. The page backdrop is a zero-patch CSS change on `body`. Render the plate at 1024x1024 and the backdrop at 750x1334; the plate must not carry any element that competes with an 18px wire, so the etch stays at 1px equivalent contrast, the same `#10160b` on `#0c1209` the code uses today.

**Shape law:** the plate is a texture, not a picture. No lit traces baked into it (the player must never mistake substrate for wire). The overload frame is a hot border only; the three stages differ by width and by the number of scorch ticks along the edge, not by hue alone: 35 percent is a thin 2px line, 45 percent is 4px with heat blooms at the corners, 55 percent is 7px with visible arcing sparks along all four edges.

**PROMPT (copy-paste):**

Wireworm style: clean flat vector game art of a glowing printed circuit board at night, matte near black substrate 0C1209 with faint 10160B grid etching, rounded PCB traces with round solder bead joints, electric lime A3E635 live current with a soft C6F04F core glow, dead trace olive 55693E, warm amber FFCF70 heat accents, cream E8DCC8 relief, bold silhouettes that read at 16 pixels, no gradients beyond a soft glow, no text, no watermark, crisp game asset edges, flat FF00FF magenta background for cutout.
A layout sheet on flat magenta FF00FF with generous magenta gutters between panels.
Row 1, two panels:
(1) BOARD SUBSTRATE, a square panel 1024x1024 pixels, matte near black 0C1209 circuit board with a faint 20 by 20 grid etched in 10160B, tiny unlit solder pads 111a0d at a scattering of grid intersections, very subtle fibre texture, no lit traces, no components, empty and calm, built to sit under game pieces.
(2) PAGE BACKDROP, a tall panel 750x1334 pixels, deep 0A0B0F night with a barely visible larger circuit board pattern in 0F1116, a faint lime A3E635 glow leaking in from the very bottom edge at five percent strength, no focal point, built to sit behind a centred square game board.
Row 2, three square panels each 1024x1024 pixels, an OVERLOAD WARNING FRAME on transparent magenta centre, only the border painted:
(3) STAGE ONE, a thin 8 pixel warm amber FFB446 border line at forty percent glow, corners slightly brighter.
(4) STAGE TWO, a 16 pixel amber FFB446 border with soft heat blooms FFCF70 at all four corners.
(5) STAGE THREE, a 28 pixel hot amber to white border with small forked lightning arcs FFFFFF crawling along all four edges and scorch marks 3A1C08 inside the corners.
Even spacing, one object per panel, nothing touching panel edges, no text anywhere.

---

## Sheet 02, wire autotile (dead and live)

**PATCH-REQUIRED wiring:** `drawWireCell(i, live)` index.html:2419 computes `links = neighbourWire(i, live)`, the list of directions 0 up, 1 right, 2 down, 3 left whose neighbour is wire in the SAME state. Build `mask = links.reduce((m,d)=>m|(1<<d),0)`, then `bx.drawImage(sheet, (mask % 8) * 256, (Math.floor(mask / 8) + (live ? 2 : 0)) * 256, 256, 256, x, y, cell, cell)`. Keep the `alphaOverride` param (it is passed through `globalAlpha`). The lime `shadowBlur` set at 2508 applies to drawImage too, so the live glow keeps working with no extra art; the reduced motion path turns it off, so the live tiles must carry a thin baked halo of their own. Sheet is 4 rows x 8 columns: rows 1 and 2 are the 16 dead masks, rows 3 and 4 the 16 live masks, in mask order 0 to 15 left to right, top to bottom. Mask bit 1 = up, 2 = right, 4 = down, 8 = left. Mask 0 is an isolated node (the worm's start cell looks like this for one tick).

Cell geometry to match: the trace is 42 percent of the cell wide when live (7.8px) and 28 percent when dead (5.2px), round caps, running from centre to 55 percent of the cell toward each linked neighbour (so tiles meet at cell edges with a visible round joint, not a seamless pipe). Every node carries a bead: live bead radius half the trace width in `#c6f04f`, dead bead 72 percent of the trace width in `#6b8450`.

**Shape law:** live and dead must differ by mass, not just hue: live is fat and has a small bright bead, dead is thin and has a proportionally larger dull bead. In greyscale a live run is a thick bright line with tiny dots, a dead run is a thin grey line with knots. The trace never reaches a cell edge in an unlinked direction (that is the whole autotile logic).

**PROMPT (copy-paste):**

Wireworm style: clean flat vector game art of a glowing printed circuit board at night, matte near black substrate 0C1209 with faint 10160B grid etching, rounded PCB traces with round solder bead joints, electric lime A3E635 live current with a soft C6F04F core glow, dead trace olive 55693E, warm amber FFCF70 heat accents, cream E8DCC8 relief, bold silhouettes that read at 16 pixels, no gradients beyond a soft glow, no text, no watermark, crisp game asset edges, flat FF00FF magenta background for cutout.
A sprite sheet, 4 rows x 8 columns, each cell 256x256 pixels on flat magenta FF00FF, a PCB trace autotile set. Every trace is a straight rounded bar 72 pixels wide running from the exact centre of the cell to 140 pixels from the centre, ending in a round cap that stops 12 pixels short of the cell edge. Every cell has a round solder bead at the exact centre.
Rows 1 and 2, sixteen DEAD TRACE cells in olive 55693E with a duller bead 6B8450 of 52 pixel diameter and a thin darker 3E4D2C outline, no glow. Row 1 left to right: (1) bead only, no arms. (2) one arm up. (3) one arm right. (4) arms up and right. (5) one arm down. (6) arms up and down, a vertical bar. (7) arms right and down. (8) arms up, right and down. Row 2 left to right: (9) one arm left. (10) arms up and left. (11) arms left and right, a horizontal bar. (12) arms up, right and left. (13) arms down and left. (14) arms up, down and left. (15) arms right, down and left. (16) all four arms, a cross.
Rows 3 and 4, the same sixteen arm layouts in the same order as LIVE TRACE: bars 108 pixels wide in electric lime A3E635 with a bright C6F04F core line, a small bright C6F04F bead of 54 pixel diameter at the centre, and a thin 24 pixel soft lime halo around the whole shape. Row 3 is layouts 1 to 8, row 4 is layouts 9 to 16.
Even spacing, one object per cell, nothing touching cell edges, no text anywhere.

---

## Sheet 03, terminals, colour glyphs, pending tint, charge dot

**PATCH-REQUIRED wiring:** the terminal loop at index.html:2526 to 2547 draws a dark disc of radius 0.42 cell (15.7px across) with a coloured ring and the colour's glyph, and when that terminal belongs to the pair you are charged on (`open`), a pulsing ring of radius 0.62 cell (23.1px) at alpha 0.35 to 0.70. Replace the disc plus ring plus glyph with `drawImage(sheet, tci * 256, 0, 256, 256, x - cell*0.5, y - cell*0.5, cell, cell)` and the open ring with row 2 drawn at 1.3 cell square under the same `globalAlpha = pulse`. The marching stamp at 2515 (`fillGlyph(..., '#0d1408')`, radius 0.17 cell) becomes row 3 drawn at 0.4 cell square; it is stamped on every third live cell along a diagonal and marches because `phase` is in the modulo. The pending tint at 2478 to 2483 (a coloured square at alpha 0.16) becomes row 4 drawn at `cell - 2` under `globalAlpha = 0.16`. The charge dot at 2585 to 2589 (a coloured disc of radius 0.2 cell drawn 0.55 cell ABOVE the head regardless of heading) becomes row 5 at 0.5 cell square. Colour index order everywhere is 0 green, 1 blue, 2 amber, 3 red.

**Shape law (this is the colourblind law the code already enforces):** green is a TRIANGLE, blue is a SQUARE, amber is a DIAMOND, red is a CROSS. The glyph is inside every terminal and stamped along every lit run so the board reads in greyscale. Art must keep the four shapes crisp at 6px for the stamp and 7px for the terminal glyph; do not round them into similar blobs. Closed and open terminals differ by the presence of the outer halo ring, not by brightness.

**PROMPT (copy-paste):**

Wireworm style: clean flat vector game art of a glowing printed circuit board at night, matte near black substrate 0C1209 with faint 10160B grid etching, rounded PCB traces with round solder bead joints, electric lime A3E635 live current with a soft C6F04F core glow, dead trace olive 55693E, warm amber FFCF70 heat accents, cream E8DCC8 relief, bold silhouettes that read at 16 pixels, no gradients beyond a soft glow, no text, no watermark, crisp game asset edges, flat FF00FF magenta background for cutout.
A sprite sheet, 5 rows x 4 columns, each cell 256x256 pixels on flat magenta FF00FF. Columns are always the same four colours in order: column 1 green 4ADE80 with a TRIANGLE glyph, column 2 blue 60A5FA with a SQUARE glyph, column 3 amber FBBF24 with a DIAMOND glyph, column 4 red F87171 with a CROSS glyph made of two thick rounded bars.
Row 1, four CLOSED TERMINALS: a round dark socket 0A0E08 of 210 pixel diameter with a thick 34 pixel ring in the column colour and the column glyph 100 pixels tall in the same colour filled solid at the centre, a faint dark inner shadow so it reads as a hole in the board.
Row 2, four OPEN TERMINAL HALOS: the same socket and glyph, now with an extra thin 14 pixel ring in the column colour at 240 pixel diameter outside it, and four tiny spark ticks of the colour at the compass points.
Row 3, four DARK GLYPH STAMPS: only the column glyph, 120 pixels tall, filled solid in very dark green 0D1408 with no outline, meant to be stamped over a lime trace.
Row 4, four PENDING TINT TILES: a full 230 pixel rounded square in the column colour filled with a fine diagonal hatch of the same colour, flat, no glyph.
Row 5, four CHARGE BEADS: a solid round bead 130 pixels across in the column colour with a bright white highlight dot and a faint halo of the same colour.
Even spacing, one object per cell, nothing touching cell edges, no text anywhere.

---

## Sheet 04, the worm head (the only character)

**PATCH-REQUIRED wiring:** the head at index.html:2577 to 2584 is a disc of radius 0.40 cell (14.9px) in `#eaffd0`, with two `#0c1209` eye dots at 0.15 cell forward and 0.13 cell to each side of the heading vector `DX[st.heading], DY[st.heading]`. Replace with `bx.save(); bx.translate(x, y); bx.rotate((st.heading - 1) * Math.PI / 2); bx.drawImage(sheet, col*256, row*256, 256, 256, -cell*0.6, -cell*0.6, cell*1.2, cell*1.2); bx.restore()`. Sprites are drawn FACING RIGHT (heading 1); heading 0 up is a minus 90 degree rotation. When `st.alive` is false the code swaps the fill to `#8c2b2b`; use the dead cell instead. The frame index comes from `phase`: `Math.floor(phase * 0.25) % 2` gives a 2 frame crawl at roughly 3 frames per second. The win cells fire on the `completed` event in `doTick` (index.html:2770) for the 150ms of `spark`; the overload cell fires while `flash > 0`. The charge bead from sheet 03 row 5 is drawn on top, above the head, by the existing code at 2585.

Note the head is drawn at 1.2 cell square so the sprite may overhang its cell a little; the body is the wire autotile from sheet 02, the head does not need a body.

**Shape law:** the head must read as a worm at 15px: a rounded capsule slightly longer along the heading than across it, two dark eye dots on the leading edge, nothing else. Alive and dead differ by silhouette (dead is flattened with a crack and the eyes become crosses), not by colour alone, because reduced motion players get no shake or flash.

**PROMPT (copy-paste):**

Wireworm style: clean flat vector game art of a glowing printed circuit board at night, matte near black substrate 0C1209 with faint 10160B grid etching, rounded PCB traces with round solder bead joints, electric lime A3E635 live current with a soft C6F04F core glow, dead trace olive 55693E, warm amber FFCF70 heat accents, cream E8DCC8 relief, bold silhouettes that read at 16 pixels, no gradients beyond a soft glow, no text, no watermark, crisp game asset edges, flat FF00FF magenta background for cutout.
A sprite sheet, 2 rows x 4 columns, each cell 256x256 pixels on flat magenta FF00FF, one small game character, a WIRE WORM HEAD, always facing RIGHT, a chunky rounded capsule 200 pixels long and 170 pixels tall in pale lime cream EAFFD0 with a thin lime A3E635 rim and two round dark eyes 0C1209 of 30 pixel diameter set near the right end, a tiny darker C8E6A0 band across the neck at the left end where the body trace would attach.
Row 1: (1) IDLE, the head as described, calm, eyes level. (2) CRAWL, the same head squashed a little shorter and taller as it pushes forward, eyes slightly wider apart. (3) CHARGED, the head with a faint amber FFCF70 static crackle, three tiny arcs, around its rim, eyes narrowed and keen. (4) FLINCH, the head recoiling left with the eyes squeezed shut into flat lines and two small white impact ticks at the right end.
Row 2: (5) DEAD, the head flattened wider and lower in dull dead red 8C2B2B with a jagged dark crack across it and both eyes drawn as small dark X marks. (6) WIN ONE, the head glowing bright white F5FFE0 with a lime halo and eyes as happy upward arcs. (7) WIN TWO, the same head with the halo bigger and four small lime sparks flying off it. (8) OVERLOAD, the head bleached to white with an amber FFB446 rim, eyes wide round and a tiny bolt of lightning above it.
Even spacing, one object per cell, nothing touching cell edges, no text anywhere.

---

## Sheet 05, relief valve pickup and FX

**PATCH-REQUIRED wiring:** the pickup at index.html:2549 to 2557 is a cream disc whose radius bobs between 0.30 and 0.35 cell with a dark zigzag bolt; replace with row 1 cells 1 and 2 alternated on `Math.floor(phase * 0.3) % 2`, drawn at 0.8 cell square. The spark front at 2518 to 2523 (a white disc of radius 0.42 cell racing along the completed circuit for 150ms, cells locking to live behind it) becomes row 1 cells 3 and 4 plus row 2 cell 1, indexed by `Math.floor(el * 3)` where `el` is the existing 0 to 1 progress, drawn at 1.2 cell square. The creep ring at 2564 to 2576 (an amber circle expanding from 0.3 to 1.2 cell radius over 26 phase units, alpha fading) becomes row 2 cells 2 to 4 plus row 3 cell 1, indexed by `Math.floor(age * 4)`, drawn at 2.4 cell square under the existing `globalAlpha`. The overload flash at 2591 to 2594 (a full board white wash at alpha `flash * 0.5`) becomes row 3 cells 2 to 4 drawn to the full board at the same alpha, indexed by `Math.floor((1 - flash) * 3)`. Discharge (event `discharged` at 2778, wire cells in `e.removed` vanish with only a sound) and death (event `died` at 2789, only the head recolours and the board shakes) have NO visual today; row 4 gives them one, drawn per removed cell and at the head respectively, PATCH-REQUIRED with a small fx list like `creepFx`.

**Shape law:** the pickup is the only cream object on the board, a coin with a bolt cut out of it; keep it round so it never reads as a terminal (which are dark sockets with a coloured ring). The creep ring must be a ring, never a filled disc, because a filled amber disc reads as an amber terminal. The spark is the only pure white on the board.

**PROMPT (copy-paste):**

Wireworm style: clean flat vector game art of a glowing printed circuit board at night, matte near black substrate 0C1209 with faint 10160B grid etching, rounded PCB traces with round solder bead joints, electric lime A3E635 live current with a soft C6F04F core glow, dead trace olive 55693E, warm amber FFCF70 heat accents, cream E8DCC8 relief, bold silhouettes that read at 16 pixels, no gradients beyond a soft glow, no text, no watermark, crisp game asset edges, flat FF00FF magenta background for cutout.
A sprite sheet, 4 rows x 4 columns, each cell 256x256 pixels on flat magenta FF00FF, small game effects.
Row 1: (1) RELIEF VALVE, a round cream E8DCC8 coin 170 pixels across with a jagged lightning bolt cut out of its face in dark 0C1209 and a thin darker D2C4AA rim. (2) RELIEF VALVE RAISED, the same coin 190 pixels across with a soft cream halo, as if lifted. (3) SPARK ONE, a small hard white FFFFFF disc 100 pixels across with a lime A3E635 halo. (4) SPARK TWO, the white disc 130 pixels across with four short lime rays.
Row 2: (5) SPARK THREE, the white disc 160 pixels across with eight lime rays and a faint amber tint at the tips. (6) CREEP RING ONE, a thin amber FFCF70 ring 90 pixels across, 12 pixel stroke, hollow centre. (7) CREEP RING TWO, the ring at 150 pixels across, 10 pixel stroke, with three small amber ticks on its rim. (8) CREEP RING THREE, the ring at 200 pixels across, 8 pixel stroke, slightly paler FFE0A0.
Row 3: (9) CREEP RING FOUR, the ring at 240 pixels across, 5 pixel stroke, very pale and thin, nearly gone. (10) OVERLOAD WASH ONE, a full 230 pixel square of near white F8FFE8 with a bright lime centre bloom. (11) OVERLOAD WASH TWO, the square in soft lime white with dozens of tiny amber FFB446 lightning forks scattered across it. (12) OVERLOAD WASH THREE, the square mostly transparent pale lime with only a few faded forks left.
Row 4: (13) DISCHARGE PUFF ONE, a small cluster of five olive 55693E and grey 8E9A86 trace fragments breaking apart from a centre point. (14) DISCHARGE PUFF TWO, the same fragments further apart, smaller and fading. (15) DEATH IMPACT ONE, a burst of dull red 8C2B2B and dark red 5A1A1A shards with a white flash core. (16) DEATH IMPACT TWO, the shards scattered wide and fading, a thin red ring around them.
Even spacing, one object per cell, nothing touching cell edges, no text anywhere.

---

## Sheet 06, HUD chrome

**DROP-IN wiring for the icons, PATCH-REQUIRED for the badge:** `drawRing()` index.html:2598 draws an 8px `#1c2029` track circle of radius 44 on a 104x104 canvas shown at 52x52, then the lime progress arc on top (gold `#ffd166` at x3 and x4, blinking `#ffcf70` in the last quarter). The badge plate goes UNDER the arc: `rx.drawImage(badge, 0, 0, 104, 104)` in place of the track stroke; the arc stays procedural because it is the combo timer. The `x1` to `x4` text is DOM (`#comboTxt`, 15px 800 lime) and stays. The gear at `#btnOpt` (index.html:120) is an HTML entity at 19px inside a 48x48 `#12141b` button; swap for an `<img>` or a CSS background, no engine change. The load lamp sits beside `#loadPct` (17px `#ffcf70`) which fades in past 35 percent load; a small `<img>` before the number is a markup change only. The HUD strip is 375x64 with the combo badge at left, score at centre left, load box at right, gear at far right.

**Shape law:** the badge plate is a ring, the arc must remain fully visible over it, so the plate's own ring band is dark and matte. Three plates differ by the number of notches and by rim material (plain, gold rivets, hot), not by hue alone. The gear must read as a gear at 19px: six teeth, no more.

**PROMPT (copy-paste):**

Wireworm style: clean flat vector game art of a glowing printed circuit board at night, matte near black substrate 0C1209 with faint 10160B grid etching, rounded PCB traces with round solder bead joints, electric lime A3E635 live current with a soft C6F04F core glow, dead trace olive 55693E, warm amber FFCF70 heat accents, cream E8DCC8 relief, bold silhouettes that read at 16 pixels, no gradients beyond a soft glow, no text, no watermark, crisp game asset edges, flat FF00FF magenta background for cutout.
A sprite sheet, 2 rows x 4 columns, each cell 256x256 pixels on flat magenta FF00FF, heads up display parts.
Row 1, three round COMBO BADGE PLATES each 240 pixels across, a dark 12141B disc with a matte 1C2029 ring band 40 pixels wide at the rim where a progress arc will be drawn over it, and an empty dark centre: (1) PLAIN, the band with four tiny olive 55693E tick marks at the compass points. (2) GOLD, the band with eight small gold FFD166 rivets around it and a thin gold inner rim. (3) HOT, the band with a faint amber FFCF70 heat glow bleeding out of its outer edge and small scorch flecks. (4) GEAR ICON, a bold six tooth cog 190 pixels across in pale text colour E7ECDD with a round dark hole, flat, thick teeth.
Row 2: (5) LOAD LAMP LOW, a small rounded indicator lamp 160 pixels tall in dark panel 12141B with a thin olive 55693E filament inside. (6) LOAD LAMP MID, the same lamp with the filament glowing amber FFCF70. (7) LOAD LAMP HIGH, the lamp with the filament white hot and amber light spilling out of the glass. (8) HUD STRIP, a wide bar 250 pixels by 44 pixels of dark panel 12141B with a thin 1C2029 top and bottom line and a single faint lime trace running along the bottom edge, seamless when stretched wide.
Even spacing, one object per cell, nothing touching cell edges, no text anywhere.

---

## Sheet 07, controls (turn pads, footer buttons, toggles, zone hints)

**DROP-IN wiring:** all of this is CSS. `.padbtn` (index.html:69) is 170.5x108 at 375 wide, `#10140c` fill, `#1c2029` border, 14px radius, a 30px ↺ or ↻ entity in `#6d7a5f`, and on `:active` the fill goes `#1d2612` and the glyph goes lime. `.fbtn` (index.html:74) is 111.7x48, `#12141b` fill, 12px radius, 14px bold text; `.fbtn.go` (START, PLAY AGAIN, DONE) is solid lime with `#0c1206` text. `.tgl` (index.html:90) is 88x48 and turns solid lime when on. Set each as `background-image` sized to the button with `background-size: 100% 100%`; the text stays HTML on top, so every plaque must keep a calm centre band. The zone hints (index.html:126) are 34px ↺ ↻ at 13 percent white shown over each half of the board for 2.2 seconds after a run starts when the Show turn zones option is on; swap for two small images. Turn pad art at 4x: 682x432. Footer plaques at 4x: 448x192. Toggles at 4x: 352x192.

**Shape law:** the two pads must be mirror images with a large single arrow each, because a thumb reads them at the edge of vision. Pressed differs from rest by the arrow lighting AND a visible inset (the whole plaque sinks), never by colour alone. The go plaque is the only solid lime slab on the screen; keep it that way so START is always findable.

**PROMPT (copy-paste):**

Wireworm style: clean flat vector game art of a glowing printed circuit board at night, matte near black substrate 0C1209 with faint 10160B grid etching, rounded PCB traces with round solder bead joints, electric lime A3E635 live current with a soft C6F04F core glow, dead trace olive 55693E, warm amber FFCF70 heat accents, cream E8DCC8 relief, bold silhouettes that read at 16 pixels, no gradients beyond a soft glow, no text, no watermark, crisp game asset edges, flat FF00FF magenta background for cutout.
A UI sheet on flat magenta FF00FF with generous magenta gutters between elements.
Row 1, four wide rounded TURN PAD plaques each 682x432 pixels with 56 pixel corner radius: (1) LEFT REST, dark moss 10140C plaque with a thin 1C2029 rim, a faint dead trace olive 55693E circuit pattern along its edges, and one big counter clockwise curved arrow 240 pixels across centred, in dull olive 6D7A5F. (2) LEFT PRESSED, the same plaque sunk with a darker 0B0E08 inner shadow at the top, fill 1D2612, and the arrow glowing lime A3E635 with a soft halo. (3) RIGHT REST, the mirror of cell 1 with a clockwise arrow. (4) RIGHT PRESSED, the mirror of cell 2.
Row 2, three FOOTER BUTTON plaques each 448x192 pixels with 48 pixel corner radius and a calm empty centre band for overlay text: (5) PANEL, dark 12141B with a thin 1C2029 rim and a tiny dead trace olive pattern in the two far ends only. (6) PANEL PRESSED, the same in 1B1F28 with an inner shadow. (7) GO, solid electric lime A3E635 with a slightly brighter C6F04F top edge and two tiny dark 0C1206 solder pads in the far corners.
Row 3, two TOGGLE plaques each 352x192 pixels with 48 pixel corner radius and a calm centre: (8) OFF, dark 12141B with a 1C2029 rim and a small unlit round socket at the left end. (9) ON, solid lime A3E635 with the socket at the right end lit white.
Row 3 continued, two ZONE HINT arrows each 256x256 pixels: (10) a big counter clockwise curved arrow in translucent pale white E7ECDD at low opacity, flat, no plaque. (11) the same arrow clockwise.
Even spacing, nothing touching element edges, no text anywhere.

---

## Sheet 08, screens (death sheet, options and how-to sheet, toast, title plate)

**DROP-IN wiring:** `.sheet` (index.html:80) is a full screen `rgba(6,7,10,0.93)` layer with a 6px blur; give it a `background-image` at 750x1334 with the same darkness so the frozen board still ghosts through. `#sheetOver` is filled by `onDeath` (index.html:2845): a 23px h2 "Look what you built", a 15px cause line, the 250x375 card image, six `.stat` tiles (index.html:97, 167x52 each, `#12141b`, 12px radius, 21px number over 13px label) and four buttons from sheet 07. `#sheetOpt` (index.html:154) is the options panel opened by the gear: a volume slider, four toggles, four stat rows, the seed line, COPY SEED LINK and DONE, then the how-to paragraph (`COPY.howto`) at the bottom; this paragraph is the ONLY tutorial text in the game. Rows (`.row`, index.html:86) are 48px with a `#1c2029` bottom border. `#toast` (index.html:100) is a `#1b2113` box with a `#6b8f22` border that parks itself above the highest control.

**The screens that do not exist (do not wire until the code has them):** there is no title screen; `startRun` fires at boot and `COPY.tagline` (index.html:293) is never rendered anywhere. There is no pause screen; a hidden tab freezes the run for good and the START button (relabelled PLAY AGAIN) begins a new seed. Cell 6 below is a title plate so a future boot screen has art waiting, flagged PATCH-REQUIRED and unreachable today.

**Shape law:** every plate keeps its centre empty for HTML text. The result header ornament must not look like a button. Stat tiles are all identical (the code builds six from one class).

**PROMPT (copy-paste):**

Wireworm style: clean flat vector game art of a glowing printed circuit board at night, matte near black substrate 0C1209 with faint 10160B grid etching, rounded PCB traces with round solder bead joints, electric lime A3E635 live current with a soft C6F04F core glow, dead trace olive 55693E, warm amber FFCF70 heat accents, cream E8DCC8 relief, bold silhouettes that read at 16 pixels, no gradients beyond a soft glow, no text, no watermark, crisp game asset edges, flat FF00FF magenta background for cutout.
A layout sheet on flat magenta FF00FF with generous magenta gutters between panels.
Row 1, two tall panels each 750x1334 pixels: (1) SHEET BACKDROP, near black 06070A at ninety percent, a faint large circuit pattern 0E1016 fading toward the centre, a thin lime A3E635 trace running down the left edge with three bead joints, calm, built to sit behind text and buttons. (2) TITLE PLATE, the same dark 0A0B0F night, a large lime A3E635 wire worm head with two dark eyes coiled once around the upper centre of the plate leaving a live lime trace loop behind it with bright C6F04F bead joints, a small cream E8DCC8 relief coin below it, an amber FFCF70 glow along the bottom edge, empty band across the middle third for a wordmark, no letters.
Row 2, four elements: (3) STAT TILE, a rounded 668x208 pixel plaque with 48 pixel corner radius, dark 12141B with a 1C2029 rim and a tiny olive trace corner mark at top left, centre empty. (4) RESULT HEADER ORNAMENT, a wide thin 1372x160 pixel decoration, a lime A3E635 trace running across with five bead joints and a small burst of white sparks at the right end, no plaque behind it, centre band clear. (5) ROW DIVIDER, a 1372x8 pixel thin line in 1C2029 with a single small olive bead at its centre. (6) TOAST BOX, a rounded 1288x160 pixel plaque with 48 pixel corner radius in dark moss 1B2113 with a lime dim 6B8F22 rim and a faint lime glow, centre empty.
Even spacing, one object per panel, nothing touching panel edges, no text anywhere.

---

## Sheet 09, death card and wordmark

**PATCH-REQUIRED wiring:** `buildCard()` index.html:2877 renders a 640x960 canvas: `#0a0b0f` fill, the WIREWORM title at 46px, the score at 74px lime, a 560x560 `#0c1209` board at y 190 with a `#1c2029` frame, each wire cell a 28px square (live `#a3e635` inset 2.8px, dead `#33401f` inset 7.8px), two 26px stat lines, and the studio line at the bottom in `#4d5647`. Replace the fill with `g2.drawImage(plate, 0, 0, 640, 960)`, the two `fillRect` at 2893 with the two 28px chips from row 2, and the `fillText(COPY.title, ...)` at 2897 with `g2.drawImage(wordmark, 40, 40, 560, 60)`. The wordmark is also the art for the future title plate. Note the card draws chips, not the autotile, because it has no neighbour logic; the chips are deliberately simpler than sheet 02. Note also that `COPY.studio` at index.html:320 prints "SKY WOLF STUDIOS" (plural) on every card; the brand is Sky Wolf Studio, singular, and that string is on the open brand sweep, not in this file's scope.

**Shape law:** the card is shared as a PNG at 250px wide inside the app and full size outside it; the plate must not carry anything that fights the board, which is the point of the card. The wordmark is the one place letters are allowed and it must be generated as a logotype, not typeset: the letters are wire.

**PROMPT (copy-paste):**

Wireworm style: clean flat vector game art of a glowing printed circuit board at night, matte near black substrate 0C1209 with faint 10160B grid etching, rounded PCB traces with round solder bead joints, electric lime A3E635 live current with a soft C6F04F core glow, dead trace olive 55693E, warm amber FFCF70 heat accents, cream E8DCC8 relief, bold silhouettes that read at 16 pixels, no gradients beyond a soft glow, no text, no watermark, crisp game asset edges, flat FF00FF magenta background for cutout.
A layout sheet on flat magenta FF00FF with generous magenta gutters between panels.
Row 1, one tall panel 1280x1920 pixels, a SHARE CARD PLATE: deep 0A0B0F night, a faint 0F1116 circuit pattern, an empty square well 1120x1120 pixels of matte 0C1209 board with a 1C2029 rim centred with its top edge 380 pixels from the top of the panel, a thin lime A3E635 trace with bead joints running along the top left margin above the well, an amber FFCF70 glow along the very bottom edge, everything else empty for text.
Row 2, three elements: (1) LIVE CHIP, a 256x256 cell holding a rounded square 220 pixels across in electric lime A3E635 with a bright C6F04F centre bead and a soft lime halo. (2) DEAD CHIP, a 256x256 cell holding a rounded square 120 pixels across in dark olive 33401F with a slightly lighter 55693E centre bead, no glow. (3) WORDMARK, a 1120x120 pixel logotype reading WIREWORM where every letter is built from thick rounded lime A3E635 PCB traces with round C6F04F solder beads at every corner and junction, the final M trailing into a small pale worm head with two dark eyes, letters only, bold, flat, readable at 60 pixels wide, no other text.
Even spacing, one object per panel, nothing touching panel edges, no text anywhere except the single wordmark in element 3.

---

## Full animation sets

A character is not done when it can hop. The worm is the only character; the terminals and the relief valve are the only other things with states. Minimum frames per thing, all of which are in sheets 03, 04 and 05 above:

- **Worm head (sheet 04):** idle 1, move 1 (2 frame crawl with idle), charged 1, hit 1 (flinch), die 1, win 2, overload 1. Eight cells, one facing, rotated in code for the four headings. If the Director wants the crawl to feel alive, a second crawl frame (a 2 frame cycle becomes 3) is the next add.
- **Terminal (sheet 03):** closed 1 and open 1 per colour, eight cells. There is no consumed frame because a touched terminal is removed from the board on the same tick (`removePairCells`).
- **Relief valve (sheet 05):** idle bob 2. There is no taken frame; the code clears `st.pickup` and the discharge puff (row 4) is the visible result.
- **Board itself:** the spark 3, the creep ring 4, the overload wash 3, the death impact 2, the discharge puff 2.

## Coverage: every draw function and which sheet covers it

| Function or block | Line | Sheet |
|---|---|---|
| `glyph(g, px, py, r)` | 2393 | 03 (the four shapes; called only through `fillGlyph`) |
| `fillGlyph(g, px, py, r, col)` | 2400 | 03 rows 1 to 3 |
| `neighbourWire(i, live)` | 2406 | 02 (supplies the autotile mask; no art of its own) |
| `drawWireCell(i, live, alphaOverride)` | 2419 | 02 |
| `draw()` substrate fill and etch | 2446 to 2456 | 01a |
| `draw()` overload warning frame | 2459 to 2466 | 01c |
| `draw()` dead wire pass | 2469 | 02a |
| `draw()` pending circuit tint | 2471 to 2484 | 03d |
| `draw()` spark set and live wire pass with shadow glow | 2487 to 2505 | 02b (glow is engine, baked halo for reduced motion) |
| `draw()` marching glyph stamps | 2507 to 2516 | 03c |
| `draw()` spark front | 2518 to 2523 | 05b |
| `draw()` terminals and open ring | 2526 to 2547 | 03a, 03b |
| `draw()` discharge pickup | 2549 to 2557 | 05a |
| `draw()` creep rings | 2560 to 2576 | 05c |
| `draw()` head, eyes, dead recolour | 2577 to 2584 | 04 |
| `draw()` charge dot above head | 2585 to 2589 | 03e |
| `draw()` overload flash wash | 2591 to 2594 | 05d |
| `drawRing()` | 2598 | 06a (plate under the arc; arc stays procedural) |
| `hud()` | 2617 | text only, 06c lamp and 06d strip are additive |
| `frame()` shake transform | 2751 to 2754 | none, CSS transform, stays engine |
| `doTick()` event hooks | 2766 to 2790 | 05e discharge and 05f death are new hooks; `charged`, `abandoned`, `combodrop` and `rescue` have no visual (see below) |
| `buildCard()` | 2877 | 09 |
| `onDeath()` over sheet fill | 2845 | 08 (backdrop, stat tile, header ornament) plus 07 buttons |
| `openOpts()` and `syncOpts()` | 3001, 2982 | 08 (backdrop, divider), 07 toggles |
| `toast()` and `placeToast()` | 2939, 2922 | 08e |
| `#zoneHint` CSS and markup | 61 to 64, 126 | 07d |
| `.padbtn`, `.fbtn`, `.tgl`, `.iconbtn` CSS | 69, 74, 90, 47 | 07, 06b |
| `#board` CSS background `#0c0f0b` | 58 | 01a (covered on first draw) |
| icons 192, 512, maskable | files in the folder | existing art, not on this list |

Events in the SIM with no visual today: `abandoned` (the hum stops), `combodrop` (the ring goes dark, silent on purpose per the code comment at 2786), `rescue` (both terminal pairs teleport with no tell of any kind, index.html:656), `discharged` (cells vanish, one pluck), `charged` (a dot appears above the head). `rescue` is the one to watch: it moves the objectives to the player and the player is never told.

## Fleet audit rows (Sep 04)

Added Sep 05 from the fleet art audit. Same rules as above.

| file | spec | replaces |
|---|---|---|
| `assets/ww-substrate-1024.png` | 1024x1024 PNG, tileable, dark solder-mask green with ghost copper traces, dust, subtle vignette; drawn into the 373x373 board. | Replaces the flat #0c1209 fillRect and the 19+19 invisible etch lines at index.html:2446-2456 (sheet 01 in the game's own ART_ASSETS.md). |
| `assets/ww-bezel-frame-512.png` | 512x512 PNG, transparent centre, 9-slice-safe brass bezel with screw heads at the corners and a warm inner rim light. | Gives the board an edge. Today it meets the page through a hard 14px radius and a 3-value colour step; it also replaces the amber strokeRect overload frame at index.html:2459-2466. |
| `assets/ww-wire-autotile-32x256.png` | One sheet, 32 cells at 256x256, transparent: 16 neighbour combinations x 2 states (live copper, dead oxidised). Live cells carry the bead/solder joint painted in. | Replaces drawWireCell at index.html:2419, which draws rounded strokes to neighbours plus a dot. In game one cell is 18.65px, so 256 is generous headroom (sheet 02). |
| `assets/ww-terminals-4x256.png` | One sheet, 4 cells at 256x256, transparent: green, blue, amber and red brass sockets, each a genuinely different silhouette (triangle plate, square plate, diamond plate, cross plate) not just a different hue. | Replaces the disc + ring + glyph terminal loop at index.html:2526-2547. Fixes the 'five identical blue rings' problem I photographed (sheet 03). |
| `assets/ww-head-8x256.png` | One sheet, 8 cells at 256x256, transparent: the worm head at eight headings, painted as a cream ceramic bead with two dark eyes, plus a dead variant tint. | Replaces the #eaffd0 disc with two eye dots at index.html:2577-2584 (sheet 04). |
| `assets/ww-pad-glyphs-2x256.png` | Two 256x256 transparent cells: painted brass rotary arrows, left and right, with a warm rim light. | Replaces the faint HTML arrow entities in the two 170x108 turn pads, which are currently the emptiest part of the screen (sheet 07). |

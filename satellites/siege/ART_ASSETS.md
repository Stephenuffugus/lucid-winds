# SIEGE OF ONE, ART_ASSETS.md

> Drive copy (the prompts, for the phone): https://docs.google.com/document/d/1N3vnhf9XX8WL8vJn1O_TFq7u7Ix-IKgXr81oJSwWVco/edit  in 012Assets. This file is the source of truth; the Doc is regenerated from it.

Art list for `satellites/siege/index.html`, written from the code as it stands (4023 lines,
read in full on 2026-09-02). Every size below is measured from `laneMetrics()` and the CSS,
not from the build notes. Nothing here is invented: every sheet maps back to a draw function
or a CSS rule, and the Coverage section at the end lists every one of them.

## What the game is (from the code, not the docs)

One thirty cell lane runs left to right, gate at cell 0 and mouth at cell 29. For twenty seconds
you spend scrap on six trap types (spike, pit, ballista, brazier, wall, snare) plus DEEPEN in
cells 1 to 28, then a wave marches from the mouth toward the gate while you walk one hero along
the same lane and swing a sword (later a longbow, later a gold evolved blade) at whatever is in
reach. Eight enemy types (runner, brute, shielded, flyer, sapper, healer, swarm, warden) plus a
second endless boss (marshal), twenty authored waves then endless with six named modifiers, and
one body touching cell 0 ends the run.

## Render architecture (read before generating anything)

- **There is no canvas.** `grep -c canvas index.html` returns 0. Every visual is DOM: CSS
  gradients for the lane (lines 135 to 238), inline SVG strings for the ten body silhouettes
  (`SIL` line 1881 through `sil()` line 1995) and the six trap icons (`TRAP_ICON` line 2009
  through `trapIcon()` line 2031), and plain HTML for every panel, button and screen. So "where a
  drawImage would go" below means "where the SVG string is built" or "which CSS background".
- **Loop.** `loop()` line 2887 runs on requestAnimationFrame. The SIM ticks at 100ms
  (`CONFIG.TICK_MS`). `render()` line 2390 runs every frame: `drawTraps()` line 2066 only when
  `UI.dirtyTraps`, `drawEntities()` line 2101 every frame, `drawHUD()` line 2367 every frame,
  `drawBoard()` line 2161 plus `fitBoard()` line 2299 once per SIM tick. Bodies are absolutely
  positioned divs moved with `transform` under a 110ms linear transition (`.ent` line 232). Nothing
  is repainted per frame; nodes are created once and moved. That is why sprite art is cheap here.
- **DPR.** No pixel buffer, so the browser handles DPR. SVG stays crisp; PNG sprites must be
  exported at 3x the in-game px listed below (a Pixel 9 is DPR 2.6) or they blur. A 256 cell is
  about 4x for a 60px body, which is right.
- **Viewport formula (375x667 portrait, safe areas 0).** HUD 65px. Lane strip `--laneh` is
  `clamp(140px, 22vh, 260px)` = **147px in build**; `body.combat` swaps it to
  `clamp(190px, 30vh, 340px)` = **200px in combat** (line 134). Build bar 150px, combat pad 81px,
  the watch board takes the rest (305px build, 321px combat, one column because the panel grid is
  `minmax(260px, 1fr)`). Cell width `cw = 375 / 30 = 12.5px`. Body height
  `uh = max(40, min(110, min(laneH x 0.42, cw x 6.5)))` (line 2050) = **62px in build, 81px in
  combat**; body width `uh / 1.35` = **46px build, 60px combat**; the hero is `uh x 1.04` =
  **84px tall**. The wall prop is `max(18, round(cw x 1.35))` = **18px wide** and
  `round(uh x 1.18)` = **73px / 96px tall**. The sky band is the top 34% of the strip (50px build,
  68px combat), the flagstone floor is the remaining 66%. At 390x844 the same maths gives 57x78
  combat bodies; at desktop widths `cw x 6.5` wins and bodies cap at 110px tall.
- **Palette actually in use (hex, from the CSS and the JS):**
  - CSS vars: bg `0A0B0F`, panel `14161D`, panel2 `1C1F28`, line `2A2F3B`, accent `E8703A`,
    warm `F5C77E`, cream `E8DCC8`, muted `8B93A5`, gate `C8563A`, safe `7AB356`.
  - Bodies (`sil()` colour args): enemy steel `9AA6BD`, boss rose `D2A0A0`, hero orange `E8703A`,
    hero gold at level 5 `FFD76A`, blade `F5C77E`, dark inset "C2" `20242E`, healer cross `7AB356`,
    warden visor `0A0B0F`, rim `rgba(255,255,255,.26)`, shade `rgba(0,0,0,.34)`.
  - Lane: sky `0C111C` to `141B2A` to `1C2536` to `0F131C`, moon `D6E0EE`, curtain wall `2B3547`
    to `1B2231`, merlon light `BACCE8`, floor `232A37` to `171D28` to `0D111A`, torchlight `F8AC5C`,
    gate timbers `43241B 301810 3B1F16 26120C` over `3A2019 2A1510`, ground line `39414F`, wall
    prop courses `57607A / 454C61` (cracked `4A5163 / 3B4152`, mortar `2C3242`), hp bar track
    `33202A` with fill `C8563A`, shield fill `7FB3D5`, burn fill `E8703A`.
  - Damage share (`SRC_COLOUR` line 2400): player `E8703A`, spike `8B93A5`, pit `7FB3D5`,
    ballista `F5C77E`, brazier `D2704A`, wall `6B7385`, snare `9A86C4`.
  - Chrome: shop selected `2A1A13`, pad held `2C323F`, deepen border `4A3A2A`, modifier chip
    `4A3A2A` on `rgba(40,26,18,.7)`, boss meter `D2A0A0` to `C8563A`, text on accent `150A04`,
    panel gradient `181C26 / 141821 / 111420`, card gradient `191D27 / 141821 / 111520`.

## How art drops in, sheet by sheet

- **S01, S02, S03, S04, S05 (bodies):** one function. `sil(type, w, h, colour)` line 1995 returns
  an `<svg>` string and is the ONLY place a body is drawn; it is called from `drawEntities()` at
  lines 2110 (enemies, 46x62 / 60x81) and 2131 (hero, 60x84), from `drawBoard()` line 2219 (roster
  pips, 22x30 or 32x44 by attribute) and from `drawNotes()` line 2280 (briefing, 18x25). PATCH:
  make `sil()` return `<i class="spr spr-TYPE" style="width:Wpx;height:Hpx"></i>` with the PNG as
  a CSS background, and widen six selectors from `svg` to `svg, .spr`: `.ent svg` 233,
  `.ent.lunge>svg` 267, `.ent.vault>svg` 269, `.pip svg` 107 and 327, `#pips.roomy .pip svg` 109,
  `#pnotes .note svg` 129. The `colour` argument is baked into the cells instead (boss rose cells,
  hero orange and gold cells). The hero node is already torn down and rebuilt at level 5 (line
  2619, `UI.nodes.P.remove()`), so the gold swap is free; add the same one line for level 3 so the
  bow appears. Walk cycles: a horizontal strip as `background-image` with
  `animation: walk 600ms steps(4) infinite` on `.spr`; nothing else in the engine changes because
  the engine only translates the node. Hit and death need two small patches: on the `'hit'` event
  (line 2607, `ev.a` is the enemy id) `retrig(UI.nodes[ev.a], 'hurt')`; and in `drawEntities()`
  line 2124, instead of `remove()` on a vanished id, add class `die` and remove after 360ms.
- **S06 (status overlays):** today a status is only an hp bar colour (lines 2119 to 2122: shield
  blue, burning orange, else red). PATCH: append one `<i class="st st-burn">` per active status
  inside the `.ent` node in `drawEntities()`, toggled from `e.burns.length`, `e.shield`, `e.holdT`
  and `G.traps[e.cell].type === 'pit'`; positioned over the body with CSS.
- **S07 (lane traps):** `drawTraps()` line 2066, the `node.innerHTML` at lines 2095 to 2097 builds
  `trapIcon(t.type, 18, 'currentColor')` at 18x18 inside `.trap .g` (line 242). PATCH: swap the
  18px icon for a `.prop` background at `round(cw x 3.5)` = **44px** square (bodies already
  overlap cells, props may too), keep the `.lv` dots or bake level into the cell. The wall is the
  exception: `.wall-body` (line 2092, CSS 259) is already an 18x73/96 box, so its two states (full,
  `.cracked` at 67% hits) become two `background-image` rules and the `.wbar` stays. The action
  classes `.bite .snap .recoil .flare .chew` (lines 250 to 281) keep working on the new element.
- **S08 (lane backdrop):** all CSS, zero JS. `#lanebox` background stack lines 146 to 163 (sky,
  moon, curtain wall) becomes one image at `0 0 / 100% 34% no-repeat` over `0C111C`.
  `#lane:before` line 174 (flagstones) becomes a seamless tile `repeat-x` sized `auto 100%`.
  `#gate` line 205 (12.5px x full strip height) becomes one tall image at `100% 100%`.
  `#lanebox:before` line 166 (crenellated lip, 9px) becomes a seamless strip. `#lane:after` line
  190 (torch glow and cold far end) and `.ent:after` line 236 (contact shadow) are soft alpha
  gradients and STAY CSS, magenta cutout cannot carry them. `#gateglow` line 229 warms with
  `drawHUD()` line 2387 as the front rank crosses cell 8; also stays CSS.
- **S09 (HUD and controls):** `drawShop()` line 2353 builds seven `.shopbtn` (64x64, line 296)
  with `trapIcon(k, 26)` at 26x26 and the DEEPEN text glyph `⇑` at 20px (line 2361, the only text
  glyph on the shelf). `#pad` buttons lines 462 to 464 are text arrows and `⚔` at 24 to 26px on
  98x64 / 147x64 plates. HUD stats lines 389 to 391 are text only (no icons exist). Timer ring is
  an inline SVG at line 456 driven by `drawHUD()` line 2381. All drop in as `background-image`
  on the existing selectors; icons replace the `trapIcon()` call with an `<i>`.
- **S10 (watch board chips):** `#board .panel` line 78, `#pnotes` warm edge lines 83 to 86,
  `.meter` 91 and `.meter i` 96, `.meter.boss` 99, `.pip` 105 (see the CSS clobber note below),
  `.kitchip` 117, `.mut` 359, `#toast` 374, `#boardfade` 65. All CSS backgrounds; the modifier
  badges would be prepended by `drawPips()` line 2316 where the `.mut` span is built.
- **S11 (screens):** `.sheet` 330, `.card` 336, `.bigbtn` 362, `.ghostbtn` 364, `.split .half` 353,
  `.opt .sw` 369, `.dispatch` 372. Five sheets exist: `#titlesheet` 467, `#scoresheet` 483,
  `#oversheet` 499 (one sheet for both endings, title text set at line 2868: THE GATE HELD or THE
  GATE FELL), `#optsheet` 517, `#logsheet` 531. Art drops in as `background-image` on `.card`, on
  the two button classes and on `#ovtitle` via a class toggled in `endRun()` line 2862.
- **S12 (fx):** `playEvents()` line 2603 is the switchboard. `spawnFloat()` 2567 (rising text),
  `arrowFX()` 2584 (a 2px line), `chewFX()` 2594, `flareFX()` 2583, `snareSnapFX()` 2582,
  `shake()` 2634. New fx nodes append to `EL.lane` exactly the way `spawnFloat` does.

## Asset table

| id | what it is | where it draws | in-game px at 375x667 | cells | pri |
|---|---|---|---|---|---|
| S01 | Bodies, static: 8 enemies, marshal, hero x3 | `sil()` 1995 via drawEntities 2110/2131, drawBoard 2219, drawNotes 2280 | lane 46x62 build / 60x81 combat, hero 60x84; roster 32x44 or 14x14; notes 18x25 | 12 (3x4) | 1 |
| S02 | Hero animation set | drawEntities 2126 to 2136, playEvents 2614 to 2621 | 60x84 | 20 (4x5) | 2 |
| S03 | Runner, brute, shielded: walk, hit, die, special | drawEntities 2101 | 60x81 | 24 (3x8) | 2 |
| S04 | Sapper, healer, swarm: walk, hit, die, special | drawEntities 2101 | 60x81 | 24 (3x8) | 3 |
| S05 | Flyer, warden, marshal: walk, hit, die, special | drawEntities 2101 | 60x81 | 24 (3x8) | 3 |
| S06 | Status overlays: burn, shield, snare, pit, heal, rally, ironhide, death puff, hp bar | drawEntities 2117 to 2122 (hp bar colours only today) | overlay on 60x81; hp bar 30x4 | 15 (3x5) | 3 |
| S07 | Lane trap props, 6 traps x 4 states | drawTraps 2066 to 2099 | 44x44 bottom anchored; wall 18x73/96 | 24 (6x4) | 1 |
| S08 | Lane backdrop: sky and curtain wall, flagstone tile, gate column, lip strip, breach stone | CSS 135 to 231 | sky 375x50/68, floor 375x97/132, gate 12.5x147/200, lip 375x9 | 5 panels | 1 |
| S09 | HUD icons, shop plaques and icons, pad buttons, timer, build buttons, cooldown | drawShop 2353, drawHUD 2367, HTML 388 to 465 | 64x64, 98x64, 147x64, 48x48, 150x48, 26x26 icons | 25 (5x5) | 2 |
| S10 | Watch board: panel frames, meters, pip and kit chips, 6 modifier badges, toast, fade | drawBoard 2161, drawPips 2310, CSS 65 to 129, 359, 374 | panels 359 wide; chips 38/52 tall; badges 9px chips | 16 (4x4) | 2 |
| S11 | Screens: title crest, card plate, buttons, split tiles, GATE FELL and GATE HELD plates, switches, log strip, laurel | HTML 467 to 538, showScorecard 2405, endRun 2862, showLog 2818 | card 339 wide; buttons 307x52 / 307x48; halves 150 wide | 12 (3x4) | 2 |
| S12 | Combat fx: slash, cleave, bolt, arrow, sparks, dust, bursts, breach flash | playEvents 2603, spawnFloat 2567, arrowFX 2584, chewFX 2594 | 40 to 80px in lane | 15 (3x5) | 3 |
| S13 | App icon (exists: icon-192.png, icon-512.png, icon-maskable-512.png) | manifest.webmanifest | 192 / 512 | 1 | 3 |

Three priority 1 sheets: **S01 bodies, S07 lane traps, S08 lane backdrop.** Those three are on
screen every second of both phases.

## Things the code does that the art has to know about

1. **Roster silhouettes are 14px, not 22x30.** `.pip svg` is declared twice: line 107 (22x30)
   and line 327 (14x14, a leftover from the old lane edge spawn pips, section header at line 324).
   Same specificity, later wins, so on any wave with four or more enemy types (wave 6 on) the
   roster chips are 10px muted pills with a 14x14 squashed silhouette. Only the `roomy` path
   (three types or fewer, `#pips.roomy .pip svg` line 109) shows 32x44. The build notes' "22x30"
   came from reading the width attribute, not the computed size. S01 must read at 14px.
2. **The cooldown bar is drawn at the bottom of the screen, not in the button.** `#cdbar` line
   322 is `position:absolute` but `#atk`, `.padbtn` and `#pad` have no `position`, so it anchors
   to `#app` (fixed, line 26): a 3px amber bar along the very bottom edge of the viewport. S09
   gives it a plate; the fix is one `position:relative` on `#atk`.
3. **The sword swing has no visual.** `'swinghit'` (line 2625) is haptic only; `'swingmiss'`,
   `'step'`, `'blocked'`, `'heal'`, `'shield'`, non boss `'spawn'` and non boss `'kill'` are not
   handled by `playEvents()` at all. The only swing feedback is `scale(1.14)` on the hero node
   for two ticks (`hitFlash`, line 2136). S02 and S12 exist to fix that.
4. **The ballista fires nothing.** `'bolt'` (line 2612) only retrigs `.recoil` on the trap; no
   projectile is drawn. The longbow at least gets a 2px line (`arrowFX`). S12 has both.
5. **Hero levels 2, 3 and 4 have no visual.** Only the float text (LEVEL 2 CLEAVE and so on,
   line 2615) and, at level 5, a recolour from `E8703A` to `FFD76A`. Colour only, so it breaks
   the file's own shape law. S01 gives the level 3 hero a slung bow and the level 5 hero a longer
   blade so the states differ by silhouette.
6. **The snare snap animation can never be seen.** `enterCell()` line 1327 sets
   `s.traps[cell] = null` on the same tick it emits `'snare'`, so `snareSnapFX()` retrigs a node
   that `drawTraps()` removes before the next paint. Same for the data model: a snare with
   `used: true` is unreachable (`trapNeedsRepair` line 1132 checks it, nothing can set it and
   survive). S07 draws the snap frame anyway; wiring it needs the node kept for 260ms.
7. **Pits have no visual event.** `'pit'` (line 2610) is sound only; a body in a pit looks exactly
   like a body on flagstones. S06 has the pit lip overlay, S12 the fall dust.
8. **No pause screen exists.** `visibilitychange` (line 2814) sets `UI.paused` and `loop()` just
   keeps calling `render()`; nothing is drawn. **No how to play screen exists** either; the
   tutorial is the briefing panel (`drawNotes()` line 2271) on waves 1 to 3. Neither is given a
   sheet here because neither is in the code; if a pause overlay is added it should reuse the S11
   card plate.
9. **Both endings share one sheet** (`#oversheet`, `endRun()` line 2862). S11 gives each its own
   header plate.
10. **The `TRAPS.glyph` characters (▲ ▽ ➤ ✹ █ ∩) are dead**: every call site falls back to them
    only if `trapIcon()` returns empty, and it never does. Only `ENEMIES.glyph` is used, and only
    by `sim.js` for ASCII frames. DEEPEN's `⇑` (line 2344) is the one live text glyph.
11. `--motion` (line 2800) is set and never read; `#tests` (line 378) is the `?test=1` debug
    panel, not a screen.
12. The existing app icon (icon-192.png) is a timber gate arch at left, an orange figure holding
    a pale blade in the middle and two grey chevrons at right on `0A0B0F`. S11's title crest should
    rhyme with it.

## Facing law (applies to every body sheet)

Enemies walk from cell 29 on the RIGHT to the gate at cell 0 on the LEFT, so **every enemy faces
LEFT**. The hero silhouette (line 1984) faces RIGHT toward the mouth with the cloak trailing LEFT
toward the gate; it is the only figure in the lane leaning back toward the gate, which is how you
find yourself in a crowd. Keep that. Every body cell shares one floor line 20px above the bottom
edge of the cell (the engine bottom anchors with `translate(-50%,-100%)`), so feet must sit on the
same y in every cell of a row or the walk cycle will bob.

---

## STYLE BLOCK (bake into every prompt, named once, reused verbatim)

> Siege style: flat cut paper night siege art, matte layered shapes with a faint stone grain,
> near black 0A0B0F ground and slate blue 2B3547 keep stone, cold steel grey 9AA6BD bodies against
> one warm torchlight accent E8703A with amber F5C77E highlights, hard clean silhouettes that read
> at thumbnail size, grim and martial but not gory, no text, no watermark, crisp game asset edges,
> flat FF00FF magenta background for cutout.

Every sheet: flat FF00FF magenta ground, cut by magenta key distance, nothing touching cell
edges, no text anywhere in the image. Suggested folder: `satellites/siege/art/` with the file
names given per sheet (all lowercase, exact).

---

## S01, Bodies, static (the roster, the briefing, and the lane at rest)

**PATCH-REQUIRED wiring:** `sil()` line 1995 returns these instead of the SVG string; four call
sites, six CSS selectors, listed above. Files: `art/bodies/runner.png`, `brute.png`,
`shielded.png`, `flyer.png`, `sapper.png`, `healer.png`, `swarm.png`, `warden.png`, `marshal.png`,
`hero-l1.png`, `hero-l3.png`, `hero-l5.png`. In game the lane draws them at 46x62 (build) and
60x81 (combat), the roster at 32x44 or 14x14, the briefing at 18x25. Until patched this sheet is
also the reference for every other body sheet.

**Shape law:** each of the ten must be told apart as a flat black shape at 14px. Runner = a lean,
brute = a slab with hanging arms, shielded = a wall with a head peeking, flyer = wings above the
body line, sapper = a stoop with a box on the hip, healer = a stick with a cross on top, swarm =
three uneven lumps, warden = horns and a skirt, marshal = tallest with a pennant, hero = the only
one leaning the other way. The three hero levels must differ by silhouette (bow on the back at
level 3, a longer blade at level 5), not only by colour.

**PROMPT (copy-paste):**

Siege style: flat cut paper night siege art, matte layered shapes with a faint stone grain,
near black 0A0B0F ground and slate blue 2B3547 keep stone, cold steel grey 9AA6BD bodies against
one warm torchlight accent E8703A with amber F5C77E highlights, hard clean silhouettes that read
at thumbnail size, grim and martial but not gory, no text, no watermark, crisp game asset edges,
flat FF00FF magenta background for cutout.
A sprite sheet, 3 rows x 4 columns, each cell 256x256 pixels on flat magenta FF00FF, every
figure standing on the same floor line 20 pixels above the bottom of its cell, every enemy
facing LEFT.
Row 1:
(1) RUNNER, a thin armoured raider leaning hard into a sprint, one leg trailing far behind,
steel grey 9AA6BD with a pale rim light and a darker 20242E shadow side, reads as speed.
(2) BRUTE, twice the shoulder width of the runner, wide arms hanging past the knees, short
legs planted, a small head sunk into the shoulders, steel grey 9AA6BD, reads as mass.
(3) SHIELDED, a soldier almost entirely hidden behind a tall dark 20242E tower shield with a
single vertical steel rib, only a helmeted head peeking out above the shield's right edge,
steel grey 9AA6BD, reads as a wall.
(4) FLYER, a winged thing with wide swept wings held ABOVE its body line, scalloped trailing
edges, a small body in the middle and two thin legs hanging, steel grey 9AA6BD.
Row 2:
(5) SAPPER, a stooped figure hauling a strapped satchel charge low on its hip, the satchel a
dark 20242E box with a steel buckle and a short fuse, steel grey 9AA6BD.
(6) HEALER, a thin upright figure holding a tall staff with a bright green 7AB356 cross at the
top, the only cross in the set, steel grey 9AA6BD.
(7) SWARM, three ragged low vermin at three different heights and sizes, jagged backs, tails
and legs sticking out, never one tidy shape, steel grey 9AA6BD.
(8) WARDEN, a hulking armoured boss with a horned helm, a heavy plated skirt and a black 0A0B0F
visor slot, tinted dusty rose D2A0A0 instead of grey.
Row 3:
(9) MARSHAL, the tallest figure in the set, one arm flung out pointing left, a standard pole
behind it with a torn pennant snapping, tinted dusty rose D2A0A0.
(10) HERO level 1, a lone defender in a braced stance leaning back to the LEFT with a cloak
trailing left, sword raised to the right, body warm orange E8703A, blade amber F5C77E with a
white edge, the only warm figure in the set.
(11) HERO level 3, the same defender with a longbow slung across the back and a quiver at the
hip, sword still raised, orange E8703A.
(12) HERO level 5, the same defender in gold FFD76A with a longer, broader blade that glows
white at the edge and a fuller cloak.
Even spacing, one figure per cell, nothing touching cell edges, no text anywhere.

---

## S02, Hero animation set

**PATCH-REQUIRED wiring:** `drawEntities()` lines 2126 to 2136 builds the hero once and only moves
it. Strips: `art/hero/walk.png` (4 frames) as `steps(4)` while `G.player.moveT` was reset this
tick; `swing.png` (3 frames) retrigged on `'swinghit'` and `'swingmiss'` in `playEvents()`;
`cleave.png` on `'swinghit'` when `G.player.lvl >= 2`; `bow.png` (2 frames) on `'arrow'` (line
2613); `vault.png` replaces the CSS `vaulthop` keyframe (line 270); `levelup.png` on `'herolvl'`
(line 2614); `win.png` for the THE GATE HELD sheet. The gold row is the level 5 skin, swapped
where the node is already rebuilt (line 2619). Hero draws at 60x84 in combat.

**Shape law:** the hero is never hurt (enemies walk past him, line 1413 onward) so there is no
hurt or death frame; do not draw one. Every frame keeps the backward lean and the trailing cloak
so he stays findable in a crowd. The swing must be a visible arc, the game currently shows
nothing for it.

**PROMPT (copy-paste):**

Siege style: flat cut paper night siege art, matte layered shapes with a faint stone grain,
near black 0A0B0F ground and slate blue 2B3547 keep stone, cold steel grey 9AA6BD bodies against
one warm torchlight accent E8703A with amber F5C77E highlights, hard clean silhouettes that read
at thumbnail size, grim and martial but not gory, no text, no watermark, crisp game asset edges,
flat FF00FF magenta background for cutout.
A sprite sheet, 4 rows x 5 columns, each cell 256x256 pixels on flat magenta FF00FF, one lone
defender in every cell, body warm orange E8703A, cloak a darker C2492A trailing to the LEFT,
sword amber F5C77E with a white edge, facing RIGHT, feet on the same floor line 20 pixels above
the bottom of every cell.
Row 1, idle and walk: (1) idle, braced stance, sword raised, chest lifted; (2) idle, the same
stance with the chest settled and the blade a touch lower; (3) walk frame 1, right foot forward;
(4) walk frame 2, feet passing, cloak swinging; (5) walk frame 3, left foot forward.
Row 2: (6) walk frame 4, feet passing the other way; (7) swing wind up, blade drawn back over
the shoulder; (8) swing strike, blade slashing down and right with a thin amber arc; (9) swing
follow through, blade low, cloak flared; (10) cleave, a wide horizontal sweep with a broad
amber arc reaching both sides of the body.
Row 3: (11) longbow drawn, bow held out right, string pulled to the cheek; (12) longbow loosed,
string snapped forward, a short amber arrow leaving the frame; (13) vault crouch, knees bent,
one hand on the top of a low grey 57607A stone wall; (14) vault airborne, body tucked over the
wall, cloak streaming; (15) level up, both arms up, blade high, a burst of amber F5C77E light
behind the shoulders.
Row 4, the gold evolved skin, body gold FFD76A with a longer white edged blade: (16) gold idle;
(17) gold walk frame 1; (18) gold swing strike with a wider white arc; (19) gold longbow loosed;
(20) victory, standing square on the wall top with the blade planted point down and the cloak
settled, the only frame that faces the viewer.
Even spacing, one figure per cell, nothing touching cell edges, no text anywhere.

---

## S03, Foot soldiers A: runner, brute, shielded

**PATCH-REQUIRED wiring:** `drawEntities()` line 2101 plus the two small event patches described
under "How art drops in". Per body: `art/enemies/<type>-walk.png` (4 frames), `<type>-hit.png`,
`<type>-die.png` (2 frames), `<type>-special.png`. In game 46x62 build, 60x81 combat. The
`'wallhit'` lunge (`chewFX()` line 2594, `.ent.lunge` line 267) is the brute special. The
`'shield'` event (line 1235, currently silent) is the shielded special. The CROWBARS modifier
(line 1277) turns runners into sappers, which is the runner special.

**Shape law:** walk cycles keep each silhouette's identity in every frame (the runner never
stands upright, the brute never lifts its arms above the shoulder, the shielded never lowers the
shield except in its break frame). Hit frames are a recoil, not a colour change. Death is two
frames: the fall and the ground.

**PROMPT (copy-paste):**

Siege style: flat cut paper night siege art, matte layered shapes with a faint stone grain,
near black 0A0B0F ground and slate blue 2B3547 keep stone, cold steel grey 9AA6BD bodies against
one warm torchlight accent E8703A with amber F5C77E highlights, hard clean silhouettes that read
at thumbnail size, grim and martial but not gory, no text, no watermark, crisp game asset edges,
flat FF00FF magenta background for cutout.
A sprite sheet, 3 rows x 8 columns, each cell 256x256 pixels on flat magenta FF00FF, every
figure steel grey 9AA6BD with a 20242E shadow side and a pale rim, all facing LEFT, feet on the
same floor line 20 pixels above the bottom of every cell. Each row is one creature, columns are
in order: run frame 1, run frame 2, run frame 3, run frame 4, hit recoil, death fall, death on
the ground, special.
Row 1, RUNNER, a thin raider leaning into a sprint: (1) to (4) a four frame sprint cycle with
the trailing leg swinging through; (5) hit, head snapped back and arms flung; (6) tumbling
forward; (7) lying face down, a small pale spark of dropped gear beside it; (8) special, the
same runner sprinting with a heavy iron crowbar held low in one hand.
Row 2, BRUTE, twice the shoulder, arms hanging past the knees: (1) to (4) a heavy four frame
stomp cycle, arms swaying; (5) hit, staggering back a half step; (6) toppling like a felled tree;
(7) lying on its back, arms spread; (8) special, lunging left with both arms up to chew a low
grey 57607A stone wall, mouth open.
Row 3, SHIELDED, a soldier hidden behind a tall dark 20242E tower shield: (1) to (4) a four
frame march with the shield held steady and the legs working beneath it; (5) hit, the shield
knocked askew; (6) crumpling behind the shield; (7) the shield lying flat with the body beneath
it; (8) special, the shield shattering into four dark shards with a pale blue 7FB3D5 flash and
the soldier exposed.
Even spacing, one figure per cell, nothing touching cell edges, no text anywhere.

---

## S04, Foot soldiers B: sapper, healer, swarm

**PATCH-REQUIRED wiring:** as S03. The sapper special is the `'sap'` removal (`removeTrap()` line
1219, `e.sapped`); the healer special is the `'heal'` event (line 1532, currently silent); the
swarm special is the `'kill'` of one of its five bodies (each swarm body is its own entity, line
1266, so the swarm sprite is really one vermin drawn five times, staggered by `moveT`). Files as
S03. In game 46x62 build, 60x81 combat.

**Shape law:** the sapper stays stooped with the satchel always on the left hip. The healer's
cross must stay green 7AB356 in every frame, it is the one colour rule the code already relies on.
Because each swarm entity is one body, draw ONE vermin per swarm cell, not three; the crowd comes
from five nodes overlapping in the lane.

**PROMPT (copy-paste):**

Siege style: flat cut paper night siege art, matte layered shapes with a faint stone grain,
near black 0A0B0F ground and slate blue 2B3547 keep stone, cold steel grey 9AA6BD bodies against
one warm torchlight accent E8703A with amber F5C77E highlights, hard clean silhouettes that read
at thumbnail size, grim and martial but not gory, no text, no watermark, crisp game asset edges,
flat FF00FF magenta background for cutout.
A sprite sheet, 3 rows x 8 columns, each cell 256x256 pixels on flat magenta FF00FF, every
figure steel grey 9AA6BD with a 20242E shadow side and a pale rim, all facing LEFT, feet on the
same floor line 20 pixels above the bottom of every cell. Each row is one creature, columns are
in order: walk frame 1, walk frame 2, walk frame 3, walk frame 4, hit recoil, death fall, death
on the ground, special.
Row 1, SAPPER, a stooped figure hauling a dark 20242E satchel charge on its left hip: (1) to
(4) a four frame hunched trudge, the satchel swinging; (5) hit, jolted upright for once; (6)
pitching forward over the satchel; (7) sprawled with the satchel burst open and a few dark
fragments; (8) special, crouched over a small grey iron trap on the ground and prying it apart
with both hands, the satchel open beside it.
Row 2, HEALER, a thin upright figure with a tall staff topped by a green 7AB356 cross: (1) to
(4) a four frame gliding walk, staff planted every other frame; (5) hit, staff clutched to the
chest; (6) folding at the knees, staff falling; (7) lying still with the staff across the body,
the cross still green; (8) special, the staff raised high with a soft green 7AB356 glow ring
pulsing from the cross.
Row 3, SWARM, one ragged rat sized vermin with a jagged back, a long tail and legs sticking out:
(1) to (4) a four frame scurry, low and fast; (5) hit, flipped onto its side; (6) curled up mid
fall; (7) lying belly up, tail limp; (8) special, the same vermin drawn a size larger and rearing
up on its hind legs with teeth bared.
Even spacing, one figure per cell, nothing touching cell edges, no text anywhere.

---

## S05, Elites: flyer, warden, marshal

**PATCH-REQUIRED wiring:** as S03. Flyers are `flying: true` (line 682) and skip every ground
trap, so the flyer's "walk" is a wing beat and it must hover above the floor line (the engine
still bottom anchors it, so leave the hover height inside the cell). The warden special is
`'wallhit'` with `'smash'` (line 1435, `spawnFloat` SMASH at line 2601). The marshal special is
the rally (`rallied()` line 1333, currently no visual). Boss cells are tinted rose D2A0A0. Files
as S03. In game 46x62 build, 60x81 combat.

**Shape law:** the flyer's wings stay above its body line in every frame. The warden's horns are
the tell and must never be cropped by the cell. The marshal is the tallest thing in the lane; its
pennant is the tell.

**PROMPT (copy-paste):**

Siege style: flat cut paper night siege art, matte layered shapes with a faint stone grain,
near black 0A0B0F ground and slate blue 2B3547 keep stone, cold steel grey 9AA6BD bodies against
one warm torchlight accent E8703A with amber F5C77E highlights, hard clean silhouettes that read
at thumbnail size, grim and martial but not gory, no text, no watermark, crisp game asset edges,
flat FF00FF magenta background for cutout.
A sprite sheet, 3 rows x 8 columns, each cell 256x256 pixels on flat magenta FF00FF, all
facing LEFT, feet or floor shadow on the same floor line 20 pixels above the bottom of every
cell. Each row is one creature, columns are in order: move frame 1, move frame 2, move frame 3,
move frame 4, hit recoil, death fall, death on the ground, special.
Row 1, FLYER, steel grey 9AA6BD, a winged thing with wide scalloped wings held above a small
body and two thin hanging legs, hovering a third of the way up the cell: (1) wings raised high;
(2) wings level; (3) wings swept down; (4) wings level on the way back up; (5) hit, tumbling
with one wing folded; (6) falling with both wings crumpled; (7) on the ground on its back, wings
splayed; (8) special, hovering in place with wings beating against the face of a low grey 57607A
stone wall.
Row 2, WARDEN, dusty rose D2A0A0 with a 20242E shadow side, a hulking armoured boss with a
horned helm, a plated skirt and a black 0A0B0F visor slot: (1) to (4) a four frame slow heavy
stomp, one foot at a time, the skirt swinging; (5) hit, helm knocked back, a chip of plate flying;
(6) dropping to one knee; (7) collapsed forward, horns down, a pile of plate; (8) special, both
arms raised over the head bringing a great iron fist down onto a grey 57607A wall that is
bursting into rubble.
Row 3, MARSHAL, dusty rose D2A0A0 with a 20242E shadow side, the tallest figure, a standard pole
behind it with a torn pennant: (1) to (4) a four frame quick march with the pennant snapping
behind; (5) hit, staggering, pennant dipping; (6) the pole falling; (7) lying with the pennant
draped over the body; (8) special, rally, one arm flung out pointing left with the pennant
straight out and a dark red C8563A ring pulsing out from the feet.
Even spacing, one figure per cell, nothing touching cell edges, no text anywhere.

---

## S06, Status overlays (what a body is going through)

**PATCH-REQUIRED wiring:** see "How art drops in" above; one `<i class="st st-X">` per status
appended inside the `.ent`, positioned over the body. Sources: `e.burns.length` 1 to 3 (line
1316), `e.shield` (line 1233), `e.holdT` (snared, line 1326), pit when
`G.traps[e.cell].type === 'pit'` and not flying, `'heal'` event, the marshal's rally
(`rallied()` line 1333), IRONHIDE (`hasMut(s,'iron')` line 1276), the death puff on the new
`.die` class, and the hp bar (`.hpbar` line 239, 30x4, fill `C8563A`, shield `7FB3D5`, burning
`E8703A`). Files: `art/status/burn1.png` to `burn3.png`, `shield.png`, `shield-break.png`,
`snare.png`, `pit.png`, `heal1.png`, `heal2.png`, `rally.png`, `ironhide.png`, `puff1.png` to
`puff3.png`, `hpbar.png`. Overlays scale to the body (60x81 combat).

**Shape law:** every status must read without its colour: burn is a flame shape, shield is an arc,
snare is a rope, pit is a jagged lip, heal is a cross, rally is a chevron ring, ironhide is a
plate. Do not encode a status as a tint on the body; the body is one colour by law.

**PROMPT (copy-paste):**

Siege style: flat cut paper night siege art, matte layered shapes with a faint stone grain,
near black 0A0B0F ground and slate blue 2B3547 keep stone, cold steel grey 9AA6BD bodies against
one warm torchlight accent E8703A with amber F5C77E highlights, hard clean silhouettes that read
at thumbnail size, grim and martial but not gory, no text, no watermark, crisp game asset edges,
flat FF00FF magenta background for cutout.
A sprite sheet, 3 rows x 5 columns, each cell 256x256 pixels on flat magenta FF00FF, each cell
one status overlay drawn on its own with no body in it, sized to sit over a 170 by 220 pixel
figure.
Row 1: (1) BURN ONE, a single small flame E8703A with an F5C77E core licking up from the floor
line; (2) BURN TWO, two flames side by side climbing to mid height; (3) BURN THREE, three flames
merging into one tall blaze with a dark C2492A base; (4) SHIELD, a pale blue 7FB3D5 crescent arc
of light hanging in front of a body's left side; (5) SHIELD BREAK, the same arc split into four
falling 7FB3D5 shards with a white flash at the centre.
Row 2: (6) SNARE, a coil of dark brown 3B1F16 rope wrapped twice around the ankles with a
staked loop pulled taut to the floor; (7) PIT, a jagged dark 0D111A pit lip cutting across the
lower third, rubble 232A37 along the edge; (8) HEAL ONE, a soft green 7AB356 cross of light
hanging at chest height; (9) HEAL TWO, the same cross larger and fainter, pulsing outward; (10)
RALLY, a dark red C8563A double chevron ring on the floor pointing left.
Row 3: (11) IRONHIDE, a grey 6B7385 riveted iron breastplate with a pale rim, sized for the
chest; (12) DEATH PUFF ONE, a tight burst of grey 8B93A5 dust and three dark chips; (13) DEATH
PUFF TWO, the dust spreading wider and thinner; (14) DEATH PUFF THREE, only a few drifting
flecks left; (15) HP BAR, a long thin 30 by 4 ratio plate with a dark 33202A track and a red
C8563A fill about two thirds full, drawn at 240 by 32 pixels in the cell.
Even spacing, one object per cell, nothing touching cell edges, no text anywhere.

---

## S07, Lane trap props (six traps, four states each)

**PATCH-REQUIRED wiring:** `drawTraps()` lines 2095 to 2097, the 18x18 `trapIcon()` becomes a
44x44 `.prop` background, bottom anchored at `bottom:2px` like today. The wall keeps its own
`.wall-body` box (18x73 build, 18x96 combat, line 2092) and its `.wbar` hp bar; the `.cracked`
class (line 262) becomes the second wall image. Level: `t.lvl` 1 to 3 (line 2094 draws `••`
dots); the level 3 cell is baked art so depth reads by shape. Action classes retrigged by
`playEvents()`: `.bite` on `'spike'` 2623, `.recoil` on `'bolt'` 2612, `.flare` on `'brazier'`
2610 (plus the constant `.brz` flicker line 282), `.chew` on `'wallhit'` 2608, `.snap` on
`'snare'` 2609 (never visible today, note 6). Spike charges (`t.charges`, 60 max) print as a 9px
number under the prop. Files: `art/traps/<type>-1.png`, `<type>-act.png`, `<type>-3.png`,
`<type>-spent.png`; wall as `wall-full.png`, `wall-cracked.png`, `wall-3.png`, `wall-chew.png`.

**Shape law:** the six must be told apart at 18px on a dark floor: spike = teeth, pit = a hole,
ballista = a bow on a stand, brazier = a basket with fire, wall = a tall column, snare = a loop.
Level 3 must be a bigger, heavier silhouette (more teeth, a taller basket, iron banding), never
just a glow. The action frame must change the outline (teeth up, arms sprung, rope closed).

**PROMPT (copy-paste):**

Siege style: flat cut paper night siege art, matte layered shapes with a faint stone grain,
near black 0A0B0F ground and slate blue 2B3547 keep stone, cold steel grey 9AA6BD bodies against
one warm torchlight accent E8703A with amber F5C77E highlights, hard clean silhouettes that read
at thumbnail size, grim and martial but not gory, no text, no watermark, crisp game asset edges,
flat FF00FF magenta background for cutout.
A sprite sheet, 6 rows x 4 columns, each cell 256x256 pixels on flat magenta FF00FF, every prop
sitting on the same floor line 20 pixels above the bottom of its cell, iron 8B93A5 with dark
2C3242 seams and warm F5C77E rivet highlights unless stated. Each row is one trap, columns are
in order: level one at rest, action frame, level three built deeper, spent or damaged.
Row 1, SPIKE STRIP: (1) a low iron strip with six upward teeth; (2) bite, the teeth sprung
taller with a small white spark at the tips; (3) level three, a heavier strip with ten teeth and
amber F5C77E rivets; (4) spent, the strip flattened and rusted 5A4A3A with the teeth blunted.
Row 2, PIT: (5) an open pit, a dark 0D111A hole with a rubble 232A37 lip; (6) fall, a puff of
grey 8B93A5 dust rising from the hole; (7) level three, a wider deeper pit with three dark
stakes visible inside and a stone kerb; (8) the same pit half filled with rubble.
Row 3, BALLISTA: (9) a squat crossbow engine on a timber 3B1F16 stand, bolt loaded, aimed
RIGHT; (10) recoil, the arms sprung forward and the bolt gone, a short amber F5C77E streak
leaving to the right; (11) level three, a larger engine with iron banded arms and two bolts in a
rack; (12) the engine with its string snapped and one arm cracked.
Row 4, BRAZIER: (13) an iron basket on three legs with a small E8703A flame; (14) flare, the
flame tripled in size with an F5C77E core and sparks; (15) level three, a tall tripod brazier
with a wider basket and a bigger steady flame; (16) the basket tipped and smouldering with a
thin grey smoke wisp.
Row 5, WALL, a tall narrow stone column three times taller than it is wide: (17) full, grey
57607A courses with 2C3242 mortar and a lit top edge; (18) chewed, the same column jolted with
dust puffing from its right face; (19) level three, a taller column with iron 6B7385 studs and a
crenellated top; (20) cracked, the column with a dark diagonal fissure and one course sagging.
Row 6, SNARE: (21) a rope loop staked open on the floor in dark brown 3B1F16 with a pale 9A86C4
trigger peg; (22) snap, the loop closed tight and lifted with the rope taut to the stake; (23)
level three, a double loop with two stakes and a heavier rope; (24) spent, the rope lying slack
in a heap beside a pulled stake.
Even spacing, one object per cell, nothing touching cell edges, no text anywhere.

---

## S08, Lane backdrop (the keep, the floor, the gate)

**DROP-IN wiring (CSS only):** `#lanebox` background stack lines 146 to 163 becomes the sky and
wall panel at `0 0 / 100% 34% no-repeat` over `0C111C`. `#lane:before` line 174 becomes the
flagstone tile with `repeat-x` and `background-size: auto 100%`. `#gate` line 205 becomes the
door column at `100% 100%` (it is `cw` = 12.5px wide by the full strip height, 147 or 200px; the
right edge keeps the 2px `C8563A` border and the amber inset). `#lanebox:before` line 166 becomes
the lip strip at `repeat-x`, 9px tall. `.cell.mark` line 196 (cells 8, 5 and 3, the alarm marks)
gets the pale breach stone. `#lane:after` torch glow, `.ent:after` contact shadow and `#gateglow`
stay CSS because they are soft alpha. Files: `art/lane/sky-wall.png`, `floor.png`, `gate.png`,
`lip.png`, `mark.png`. In game at 375: sky 375x50 (build) / 375x68 (combat), floor 375x97 / 375x132,
gate 12.5x147 / 12.5x200.

**Shape law:** the wall must be LIGHTER than the sky (the file's own v2 lesson at line 148: a stone
wall under a moon is the lightest thing on a night horizon). The moon sits BEHIND the wall at 74%
across and 30% down of the sky band. The floor tile must be seamless left to right and read as
courses with a lit top edge and a dark seam, never as a grid. The gate is a narrow timber column;
its whole job at 12px is the hot rim down its inner edge.

**PROMPT (copy-paste):**

Siege style: flat cut paper night siege art, matte layered shapes with a faint stone grain,
near black 0A0B0F ground and slate blue 2B3547 keep stone, cold steel grey 9AA6BD bodies against
one warm torchlight accent E8703A with amber F5C77E highlights, hard clean silhouettes that read
at thumbnail size, grim and martial but not gory, no text, no watermark, crisp game asset edges,
flat FF00FF magenta background for cutout.
A layout sheet on flat magenta FF00FF with generous magenta gutters between panels.
Top, one wide panel 1500x272 pixels: the inside of a keep at night seen from the lane. Night sky
0C111C at the top warming to a 1C2536 haze low down, a soft round moon D6E0EE about three
quarters of the way across and a third of the way down, and in front of it a long crenellated
curtain wall in slate 2B3547 whose merlons run along a line a quarter of the way down the panel,
the top edge of every merlon catching pale BACCE8 moonlight, the wall foot falling into 1B2231
shadow at the bottom edge, no figures, no torches.
Second row, one tile 1024x512 pixels: a FLAGSTONE FLOOR seamless left to right, big stone slabs
232A37 in staggered courses with a thin lit top edge on every slab and a dark 0D111A seam
beneath it, cooling to 171D28 toward the bottom, no grid lines.
Third row, left, one tall narrow panel 128x1024 pixels: a GATE DOOR column, vertical timber
planks 3B1F16 and 43241B with three dark iron bands, a hot amber F5C77E rim of torchlight down
its right edge and deep black shadow down its left.
Third row, middle, one strip 1024x96 pixels: a CRENELLATED LIP seamless left to right, dark
1B1F28 merlons with black gaps, seen from below, the underside of the wall over the lane.
Third row, right, one tile 256x256 pixels: a BREACH MARK flagstone, one slab paler 3A4354 than
its neighbours with a worn C8563A red chalk cross scratched into it.
Even spacing, nothing touching panel edges, no text anywhere.

---

## S09, HUD and controls (the shop shelf, the pad, the timer)

**DROP-IN wiring:** `#hud` line 31 stats (`#wavev`, `#scrapv`, `#bladev`, lines 389 to 391, text
only today, 19px numerals with 11px labels), `.iconbtn` 48x48 line 36 (`#optbtn` gear,
`#exitbtn` cross, lines 393 and 394), `.shopbtn` 64x64 line 296 with `.on` line 301 (selected)
and `.broke` line 302 (dimmed), the seven shop icons at 26x26 from `drawShop()` line 2358 and
the DEEPEN glyph line 2361, `#timer` 48x48 ring line 456 (arc driven at line 2381), `.tbtn`
150x48 line 306 with `.go` line 308, `.padbtn` 98x64 line 317 and `#atk` 147x64 line 320 with
`.held` line 321 and `.urge` pulse line 271, `#cdbar` 3px line 322 (see note 2), `#hint` line 313.
Files: `art/ui/stat-wave.png`, `stat-scrap.png`, `stat-blade.png`, `btn-gear.png`, `btn-exit.png`,
`shop-plate.png`, `shop-plate-on.png`, `shop-plate-broke.png`, `timer-ring.png`, `hint-plate.png`,
`icon-spike.png`, `icon-pit.png`, `icon-ballista.png`, `icon-brazier.png`, `icon-wall.png`,
`icon-snare.png`, `icon-deepen.png`, `pad-left.png`, `pad-attack.png`, `pad-right.png`,
`btn-lastbuild.png`, `btn-send.png`, `cooldown.png`, `urge-ring.png`, `fade-more.png`.

**Shape law:** shop icons are diagrams, not the lane props: told apart at 26px on a dark chip
while a wave is running. Selected and broke states must differ by the plate (a lit edge, a cracked
face), not only by opacity. Buttons follow the painted plaque rule: art fills the plate and the
label is HTML laid over it, so keep the centre band calm.

**PROMPT (copy-paste):**

Siege style: flat cut paper night siege art, matte layered shapes with a faint stone grain,
near black 0A0B0F ground and slate blue 2B3547 keep stone, cold steel grey 9AA6BD bodies against
one warm torchlight accent E8703A with amber F5C77E highlights, hard clean silhouettes that read
at thumbnail size, grim and martial but not gory, no text, no watermark, crisp game asset edges,
flat FF00FF magenta background for cutout.
A UI sprite sheet, 5 rows x 5 columns, each cell 256x256 pixels on flat magenta FF00FF.
Row 1, HUD icons and top bar buttons, each a small flat icon in cream E8DCC8: (1) a wave crest of
three stacked arrowheads pointing left; (2) a scrap pile of bent iron and rivets in amber F5C77E;
(3) a short upright sword in E8703A; (4) a square 48 by 48 ratio dark 1C1F28 button plate with a
2A2F3B edge and a cream gear cog; (5) the same plate with a cream diagonal cross.
Row 2, shop plates, each a rounded square: (6) SHOP PLATE at rest, dark 1C1F28 stone tile with
a 2A2F3B carved edge and a faint lit top; (7) SHOP PLATE SELECTED, a warm 2A1A13 tile with an
E8703A glowing rim; (8) SHOP PLATE BROKE, the rest tile cracked across with a dark 0A0B0F
fissure; (9) TIMER RING, a thin 2A2F3B circle with a bright E8703A arc covering the top right
quarter, empty centre; (10) HINT PLATE, a long thin dark 14161D strip with a faint 2A2F3B top
line, drawn at 240 by 40 pixels.
Row 3, pad and build buttons, each a wide rounded plate 240 by 120 pixels: (11) PAD LEFT, dark
1C1F28 stone plate with a large cream E8DCC8 triangle pointing left; (12) PAD ATTACK, a warm
2A1A13 plate with an E8703A rim and two crossed swords in E8703A; (13) PAD RIGHT, the left plate
mirrored; (14) LAST BUILD, a dark 1C1F28 plate with a small ghosted trap outline at each end and a
calm centre; (15) SEND THEM IN, a solid E8703A plate with a dark 150A04 war horn at the left end
and a calm centre.
Row 4, trap shop icons, each a bold flat diagram in cream E8DCC8 with a 20242E inset: (16) two
upward spikes on a base line; (17) a trapezoid pit mouth seen from the front, dark inside; (18)
a bow arm with a bolt pointing right; (19) a basket with a single flame; (20) a bricked rectangle
with two mortar lines.
Row 5: (21) a rope loop open at the bottom; (22) DEEPEN, a double chevron arrow pointing up in
E8703A; (23) COOLDOWN, a thin amber F5C77E bar with a rounded end drawn at 240 by 24 pixels;
(24) URGE RING, a soft E8703A ring glow with an empty centre, for pulsing around a button; (25)
MORE BELOW, a small cream chevron pointing down on a dark 0A0B0F fade strip drawn at 240 by 60
pixels.
Even spacing, one object per cell, nothing touching cell edges, no text anywhere.

---

## S10, Watch board chrome (panels, meters, chips, modifier badges)

**DROP-IN wiring:** `#board .panel` line 78 (359px wide at 375, 7 to 9px padding, one column),
`#pnotes` warm left edge lines 83 to 86, `.meter` 8px track line 91 and `.meter i` fill line 96,
`.meter.boss` 9px line 99 with fill line 100, `.pip` chip line 105 (38px, or 52px `roomy` at line
108; see note 1 about the line 325 clobber), `.pip.boss` line 114, `.kitchip` 30px line 117 (44px
roomy line 111), `.mut` 9px chip line 359 built in `drawPips()` line 2316 for the six `MUTATORS`
(line 702: THE TIDE, IRONHIDE, CROWBARS, NIGHT MARCH, THE CHOIR, STONEBREAKERS), `#toast` line
374, `#boardfade` 34px line 65. Files: `art/board/panel.png`, `panel-brief.png`, `meter-track.png`,
`meter-fill.png`, `meter-boss.png`, `pip.png`, `pip-boss.png`, `kitchip.png`, `toast.png`,
`mut-tide.png`, `mut-iron.png`, `mut-crow.png`, `mut-march.png`, `mut-choir.png`, `mut-stone.png`,
`fade.png`. Panels and chips use `border-image` or a 9 slice; badges sit at 16x16 inside the chip.

**Shape law:** the six modifier badges must be six different silhouettes at 16px. The briefing
frame must be the one panel with a warm edge; every other panel is cold stone. Meters need an
end cap so a 2% sliver still reads.

**PROMPT (copy-paste):**

Siege style: flat cut paper night siege art, matte layered shapes with a faint stone grain,
near black 0A0B0F ground and slate blue 2B3547 keep stone, cold steel grey 9AA6BD bodies against
one warm torchlight accent E8703A with amber F5C77E highlights, hard clean silhouettes that read
at thumbnail size, grim and martial but not gory, no text, no watermark, crisp game asset edges,
flat FF00FF magenta background for cutout.
A UI sprite sheet, 4 rows x 4 columns, each cell 256x256 pixels on flat magenta FF00FF.
Row 1, plates: (1) PANEL, a wide rounded stone tablet 181C26 with a 2A2F3B carved edge, a faint
lit top line and a soft shadow, drawn at 240 by 150 pixels, calm empty centre; (2) BRIEFING
PANEL, the same tablet with a warm vertical bar down its left edge fading from F5C77E at the top
to E8703A at the bottom; (3) METER TRACK, a long recessed 0D1017 groove with a rounded end drawn
at 240 by 32 pixels; (4) METER FILL, a glowing amber bar F0A05E at the top to C2492A at the
bottom with a rounded lit end cap, drawn at 240 by 32 pixels.
Row 2: (5) BOSS METER FILL, a dusty rose D2A0A0 to C8563A bar with a tiny horned helm at the end
cap, drawn at 240 by 32 pixels; (6) PIP CHIP, a small rounded 1C1F28 chip with a 2A2F3B edge for
one enemy silhouette and a count, drawn at 200 by 96 pixels; (7) BOSS PIP CHIP, the same chip in
241A1C with a 5A3A3A edge; (8) KIT CHIP, a shorter rounded 1C1F28 chip drawn at 200 by 72 pixels.
Row 3, six modifier badges, each a bold flat icon in amber F5C77E on a small round 281A12 coin
with a 4A3A2A rim: (9) THE TIDE, three tight parallel arrowheads packed together; (10) IRONHIDE,
a riveted iron breastplate; (11) CROWBARS, a single crowbar diagonal; (12) NIGHT MARCH, a
crescent moon over two boot prints.
Row 4: (13) THE CHOIR, an open singing mouth with three sound rings; (14) STONEBREAKERS, a
cracked stone block with a hammer; (15) TOAST, a rounded dark 1C1F28 plate with a 2A2F3B edge
and a calm centre drawn at 240 by 80 pixels; (16) FADE, a strip that is solid 0A0B0F at the
bottom and thins to nothing at the top, drawn at 240 by 80 pixels.
Even spacing, one object per cell, nothing touching cell edges, no text anywhere.

---

## S11, Screens (title, scorecard, the two endings, options, war log)

**DROP-IN wiring:** all DOM. `#titlesheet` line 467 (h2 SIEGE OF ONE, h3, two `.kv` rows, one
`.bigbtn` HOLD THE GATE 307x52, three `.ghostbtn` 307x48). `#scoresheet` line 483
(`showScorecard()` line 2405: WAVE N HELD, two `.split .half` tiles 150px wide line 353, the
`.barrow` bars line 346 coloured by `SRC_COLOUR`, `.kv` rows, BUILD button). `#oversheet` line 499
(`endRun()` line 2862: THE GATE HELD or THE GATE FELL, a `.dispatch` line, four `.kv`, AGAIN,
SHARE, ENDLESS, TITLE). `#optsheet` line 517 (`.opt .sw` 72x48 toggles line 369, `.on` line
370, a range input). `#logsheet` line 531 (`showLog()` line 2818, up to ten `.dispatch` strips
line 372). `.card` line 336 is 339px wide at 375 and up to 420 on desktop. Files: `art/screens/`
`crest.png`, `card.png`, `bigbtn.png`, `ghostbtn.png`, `half-you.png`, `half-lane.png`,
`over-fell.png`, `over-held.png`, `switch-on.png`, `switch-off.png`, `dispatch.png`,
`laurel.png`. The crest sits above the h2 on the title card; the two over plates sit behind
`#ovtitle` and are toggled by a class in `endRun()`.

**Shape law:** the two endings must be told apart with the text covered: FELL is a broken gate and
cold light, HELD is an intact gate and dawn. The crest rhymes with the existing app icon (gate
arch, lone orange figure, chevrons). Plaques keep a calm centre band for the HTML label.

**PROMPT (copy-paste):**

Siege style: flat cut paper night siege art, matte layered shapes with a faint stone grain,
near black 0A0B0F ground and slate blue 2B3547 keep stone, cold steel grey 9AA6BD bodies against
one warm torchlight accent E8703A with amber F5C77E highlights, hard clean silhouettes that read
at thumbnail size, grim and martial but not gory, no text, no watermark, crisp game asset edges,
flat FF00FF magenta background for cutout.
A UI layout sheet on flat magenta FF00FF, 3 rows x 4 panels with generous magenta gutters.
Row 1: (1) TITLE CREST 900x300 pixels, a heraldic emblem: a timber gate arch 43241B with iron
bands at the left, one small orange E8703A defender with a raised amber F5C77E blade standing
before it, and three grey 8B93A5 chevron arrowheads pressing in from the right, all on a slate
2B3547 shield shape with a thin F5C77E rim, room left below for a wordmark, no letters; (2) CARD
PLATE 840x1000 pixels, a tall rounded stone tablet 191D27 with a 2A2F3B carved edge, a lit top
line and a soft shadow, calm empty face; (3) BIG BUTTON 720x120 pixels, a solid E8703A plaque
with a dark 150A04 rivet at each end and a calm centre; (4) GHOST BUTTON 720x112 pixels, a dark
1C1F28 plaque with a 2A2F3B edge and a calm centre.
Row 2: (5) YOU TILE 360x200 pixels, a dark 1C1F28 tile with an E8703A rim and a tiny sword in
the top corner; (6) YOUR LANE TILE 360x200 pixels, the same tile with a 2A2F3B rim and a tiny
row of three spikes in the top corner; (7) THE GATE FELL plate 840x260 pixels, a timber gate
smashed open with splintered 3B1F16 planks and a cold 7FB3D5 light pouring through, ash in the
air, calm centre band; (8) THE GATE HELD plate 840x260 pixels, the same gate intact and barred
with warm F5C77E dawn light along its top edge and the crenellated wall behind, calm centre band.
Row 3: (9) SWITCH ON 216x144 pixels, a rounded pill in E8703A with a pale knob at the right;
(10) SWITCH OFF 216x144 pixels, the same pill in 1C1F28 with a 2A2F3B edge and a grey knob at the
left; (11) DISPATCH STRIP 720x80 pixels, a thin dark 14161D strip with a 2A2F3B top rule and a
small wax seal C8563A at the left end; (12) BEST WAVE LAUREL 192x192 pixels, a round dark 14161D
medallion with an amber F5C77E laurel ring and an empty centre for a number.
Even spacing, nothing touching panel edges, no text anywhere.

---

## S12, Combat fx (the things the code fires and does not draw)

**PATCH-REQUIRED wiring:** all through `playEvents()` line 2603, appending a short lived node to
`EL.lane` exactly the way `spawnFloat()` line 2567 does (750ms self removal). Slash and cleave on
`'swinghit'` 2625 at the hero cell; bolt on `'bolt'` 2612 travelling from `ev.a` to `ev.b` (the
engine has no projectile today); arrow on `'arrow'` 2613 replacing the 2px `arrowFX()`; hit spark
on `'hit'` 2607; spike bite on `'spike'` 2623; pit dust on `'pit'` 2610; fire burst on
`'brazier'` 2611; wall dust and SMASH on `'wallhit'` 2608 (`chewFX()` 2594, `smash` flag);
rubble on `'traplost'` wall 2621 (WALL DOWN float and `shake()`); level up burst on `'herolvl'`
2614; breach flash on `'breach'` 2630; alarm flare on `'alarm'` 2624 alongside `#gateglow`; snare
snap on `'snare'` 2609. Files: `art/fx/slash1.png`, `slash2.png`, `cleave.png`, `bolt.png`,
`arrow.png`, `spark.png`, `bite.png`, `pitdust.png`, `fire.png`, `walldust.png`, `smash.png`,
`rubble.png`, `levelup.png`, `breach.png`, `snap.png`. Drawn at 40 to 80px in the lane; the bolt
and arrow are horizontal and point RIGHT (the hero and ballistas shoot up the lane).

**Shape law:** fx are shapes first: an arc, a bolt, a star, a puff. Sword fx are amber F5C77E,
ballista bolts are steel 8B93A5 with an amber fletch, fire is E8703A, dust is 8B93A5, the breach
flash is the only red C8563A shape in the set.

**PROMPT (copy-paste):**

Siege style: flat cut paper night siege art, matte layered shapes with a faint stone grain,
near black 0A0B0F ground and slate blue 2B3547 keep stone, cold steel grey 9AA6BD bodies against
one warm torchlight accent E8703A with amber F5C77E highlights, hard clean silhouettes that read
at thumbnail size, grim and martial but not gory, no text, no watermark, crisp game asset edges,
flat FF00FF magenta background for cutout.
A sprite sheet, 3 rows x 5 columns, each cell 256x256 pixels on flat magenta FF00FF, each cell
one effect on its own with no figure in it.
Row 1: (1) SLASH ONE, a thin amber F5C77E crescent arc sweeping from upper left to lower right
with a white leading edge; (2) SLASH TWO, the same arc thicker and fading at the tail; (3)
CLEAVE, a wide flat horizontal amber arc spanning the whole cell with two white edge lines; (4)
BOLT, a heavy steel 8B93A5 ballista bolt pointing right with an amber F5C77E fletch and a short
motion streak behind it; (5) ARROW, a slimmer longbow arrow pointing right with a pale 9AA6BD
shaft and an amber fletch.
Row 2: (6) HIT SPARK, a four point white star with amber F5C77E rays; (7) SPIKE BITE, three
short upward white sparks over a hint of iron teeth; (8) PIT DUST, a low round puff of grey
8B93A5 dust with dark 232A37 chips; (9) FIRE BURST, a sudden bloom of E8703A flame with an
F5C77E core and three rising embers; (10) WALL DUST, a spray of grey 8B93A5 dust and stone chips
flying left from an unseen wall face.
Row 3: (11) SMASH IMPACT, a jagged dusty rose D2A0A0 impact star with a dark centre; (12)
RUBBLE, a heap of grey 57607A broken stone blocks settling with a dust haze; (13) LEVEL UP, a
tall column of amber F5C77E light with small rising motes and a white flare at the base; (14)
BREACH FLASH, a hard red C8563A burst with black cracks radiating from its centre; (15) SNARE
SNAP, a dark brown 3B1F16 rope loop closing with two short motion lines and a small white tug
spark.
Even spacing, one object per cell, nothing touching cell edges, no text anywhere.

---

## S13, App icon (exists, restyle only)

`icon-192.png`, `icon-512.png` and `icon-maskable-512.png` are live and referenced by
`manifest.webmanifest` and the apple touch icon at line 13. The current icon is a timber gate arch
at left, an orange E8703A figure with a pale blade in the middle and two grey chevrons at right on
0A0B0F. If it is regenerated it should be the S11 crest at 512x512 on a solid 0A0B0F square (no
magenta; icons are not cut out) with a 20% safe margin for the maskable version. Priority 3.

---

## Full animation sets (a character is not done when it can hop)

The engine moves a body every 2 to 6 ticks and never redraws it, so every set is a strip the CSS
steps through. Minimum per character, all bottom anchored on one floor line, facing as in the
facing law:

| character | idle | move | hit | die | special | win | total cells |
|---|---|---|---|---|---|---|---|
| hero (S02) | 2 | 4 | none (never damaged) | none (the gate dies, not him) | swing 3, cleave 1, bow 2, vault 2, level up 1 | 1 | 16, plus 4 gold skin cells |
| runner (S03) | uses walk 1 | 4 | 1 | 2 | crowbar 1 | none | 8 |
| brute (S03) | uses walk 1 | 4 | 1 | 2 | wall chew 1 | none | 8 |
| shielded (S03) | uses walk 1 | 4 | 1 | 2 | shield break 1 | none | 8 |
| sapper (S04) | uses walk 1 | 4 | 1 | 2 | eating a trap 1 | none | 8 |
| healer (S04) | uses walk 1 | 4 | 1 | 2 | cast 1 | none | 8 |
| swarm (S04) | uses walk 1 | 4 | 1 | 2 | rear 1 | none | 8 |
| flyer (S05) | wing beat = move | 4 | 1 | 2 | hover at wall 1 | none | 8 |
| warden (S05) | uses walk 1 | 4 | 1 | 2 | wall smash 1 | none | 8 |
| marshal (S05) | uses walk 1 | 4 | 1 | 2 | rally 1 | none | 8 |

Enemies have no win state because a breach ends the run on the same tick (`breachCheck()` line
1550); the S11 GATE FELL plate is their win. Statuses (S06) layer over any frame. If only one row
per enemy can be afforded, the order of value is: walk 4, die 2, hit 1, special 1.

---

## Coverage: every draw function and which sheet covers it

| function or rule (line) | what it draws today | sheet |
|---|---|---|
| `SIL` 1881, `sil()` 1995 | ten body silhouettes as SVG | S01 (S02 to S05 for motion) |
| `TRAP_ICON` 2009, `trapIcon()` 2031 | six trap icons as SVG at 18 / 26 / 14px | S07 (lane), S09 (shop and kit) |
| `laneMetrics()` 2040 | sizes only, draws nothing | sizing source for every lane sheet |
| `buildLane()` 2054 | 30 `.cell` dividers, `.mark` at 8, 5, 3, gate width | S08 (mark stone) |
| `drawTraps()` 2066 | trap nodes, level dots, spike charge count, wall body and hp bar | S07 |
| `drawEntities()` 2101 | enemy and hero nodes, hp bars and their colours | S01 to S06 |
| `sigSet()` 2148, `waveHPNow()` 2155 | helpers, draw nothing | none needed |
| `drawBoard()` 2161 | wave meter, boss meter, roster pips, live share bars, kit chips | S10 (chrome), S01 (pip silhouettes) |
| `drawNotes()` 2271 | briefing panel with 18x25 silhouettes | S10 (frame), S01 (silhouettes) |
| `fitBoard()` 2299 | toggles `.tight` and `#boardfade` | S10 (fade) |
| `drawPips()` 2310 | modifier chips, hint text | S10 (badges), S09 (hint plate) |
| `mutByKey()` 2325 | lookup, draws nothing | none needed |
| `drawSight()` 2331 | 2px ballista sight line `#sight` (line 245) | stays CSS (a line) |
| `drawShop()` 2353 | seven shop buttons | S09 |
| `drawHUD()` 2367 | HUD numbers, timer arc, cooldown bar, gate glow | S09 (icons, ring, cooldown), `#gateglow` stays CSS |
| `render()` 2390 | orchestration | none needed |
| `showScorecard()` 2405 | scorecard sheet contents | S11 |
| `dispatch()` 2444 | war log sentence | S11 (dispatch strip) |
| `spawnFloat()` 2567 | rising 12px text (SMASH, WALL DOWN, LEVEL n) | stays text; S12 adds the shape beside it |
| `retrig()` 2578 | class helper | none needed |
| `snareSnapFX()` 2582 | `.snap` on a node that is already gone | S07 snap frame, S12 snap fx |
| `flareFX()` 2583 | `.flare` scale on the brazier | S07 flare frame, S12 fire burst |
| `arrowFX()` 2584 | 2px amber line | S12 arrow |
| `chewFX()` 2594 | `.chew` jolt, `.lunge` on the chewer, SMASH float | S03 brute special, S05 warden special, S12 wall dust and smash |
| `playEvents()` 2603 | the event switchboard | S06, S12 |
| `shake()` 2634 | `#shakewrap` 3px shake | stays CSS |
| `urgeTick()` 2673 | `.urge` pulse on the attack button | S09 urge ring |
| `toast()` 2689 | toast text plate | S10 toast |
| `showLog()` 2818 | war log sheet | S11 |
| `newRun()` 2843, `endRun()` 2862 | resets, over sheet contents | S11 (over plates) |
| `loop()` 2887 | frame loop | none needed |
| CSS `#hud` 31, `.iconbtn` 36 | top bar | S09 |
| CSS `#board .panel` 78, `#pnotes` 83 to 86 | panel plates | S10 |
| CSS `.meter` 91 to 100 | meters | S10 |
| CSS `.pip` 105 and 325 (clobber), `.kitchip` 117 | chips | S10 |
| CSS `#lanebox` 135 to 169 | sky, moon, curtain wall, lip, shadow | S08 |
| CSS `#lane:before` 174, `#lane:after` 190 | flagstones, torch glow | S08 floor; torch stays CSS |
| CSS `#gate` 205, `#gateglow` 229, `#ground` 231 | gate column, alarm glow, ground line | S08 gate; glow and line stay CSS |
| CSS `.ent` 232 to 238, `.hpbar` 239 | entity box, contact shadow, hp bar | S06 hp bar; shadow stays CSS |
| CSS `.trap` 241 to 284 | trap node, wall body, action keyframes | S07 |
| CSS `.arrowfx` 285, `#shakewrap` 288 | arrow line, shake | S12 arrow; shake stays CSS |
| CSS `.shopbtn` 296 to 304, `.tbtn` 306, `#timer` 310 | build bar | S09 |
| CSS `.padbtn` 317, `#atk` 320, `#cdbar` 322 | combat pad | S09 |
| CSS `.sheet` 330, `.card` 336 to 373 | every overlay sheet and its parts | S11 |
| CSS `#toast` 374 | toast | S10 |
| CSS `#tests` 378 | debug panel (`?test=1`) | none, not player facing |
| HTML `#timer` svg 456 | timer ring | S09 |
| HTML 462 to 464 | pad glyphs ◀ ⚔ ▶ | S09 |
| HTML 467 to 538 | title, score, over, options, log sheets | S11 |
| `manifest.webmanifest`, `icon-*.png` | app icon | S13 |

## Fleet audit rows (Sep 04)

Added Sep 05 from the fleet art audit. Same rules as above.

| file | spec | replaces |
|---|---|---|
| `art/lane/sky-wall.png` | 375x68 at 1x, export 1125x204 at 3x, full-bleed, no transparency. Painted night keep wall from the inside: solid lit stone with merlon notches cut in the top edge, moon low and behind, warm horizon haze under it. | Replaces the six-layer #lanebox CSS stack (index.html:146-163) whose dashed teeth read as a scanline ruler and whose radial moon reads as a grey status dot. |
| `art/lane/floor.png` | 375x132 at 1x, export 1125x396 at 3x, full-bleed, tiles horizontally. Flagstone courses in perspective, lit warm amber at the left (gate) end fading cold blue at the right, top 12px a soft transition band into the wall foot. | Replaces #lane:before (index.html:175), whose 1px slab lines photograph as graph paper and meet the sky on a hard 34% seam. |
| `art/hero/walk.png` | 4-frame horizontal strip, each cell 180x243 (3x of the 60x81 combat body), transparent PNG. Orange-cloaked defender, big readable silhouette, warm gold rim light from the gate side, sword held low. | Replaces the shared sil() SVG so the hero stops being the same stamp as the enemies; ART_ASSETS.md S02 already specs the full set. |
| `art/enemies/runner-walk.png` | 4-frame horizontal strip, each cell 180x243, transparent PNG. Thin hunched runner, cold blue-grey, cool rim light from the far end, distinctly narrower shoulders and forward lean than the hero. | Gives the commonest enemy a silhouette the player can tell from their own body at a glance; ART_ASSETS.md S03 specs the hit/die/special companions. |
| `art/lane/gate.png` | 13x132 at 1x, export 39x396 at 3x, transparent PNG. Iron-banded timber gate leaf with a lit warm edge on its inner face. | The gate is the whole premise and currently renders as a 13px orange accent line (#gate, index.html:205); a painted strip at the same 13px makes it read as a door without changing the truthful cell width. |

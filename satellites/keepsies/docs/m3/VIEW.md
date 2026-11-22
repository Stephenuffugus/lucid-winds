# VIEW: what the Keepsies player sees, and why

View investigator, 5 Nov 2026, finished about 23:35 UTC. Everything here is numbers. I started no browser (tmperf ran the whole time) and opened no image, so none of this is a look at the game. It is the live camera maths, reproduced exactly.

**How I measured it.** I imported `core/framing.js` `frameFor` (not a copy) and fed it to a THREE PerspectiveCamera placed exactly the way `render/scene.js` `createOrbitRig.update` places it. That ran in Node with lib/three.module.min.js and no WebGL.
- **Marble sizes** are true silhouette projections.
- **The grab circle** uses ringer.js `tawOnScreen`'s own formula.
- **Screen shares** come from casting a ray from every 2 px of screen onto the dirt.
- **HUD bands** come from index.html's CSS: the names and pocket dots take 59 px at the top; the corner buttons and the house rules chip take 94 px at the bottom.
- **Camera motion** comes from real Rapier matches in Node: `createRinger`, AI against AI Rookies, 3 games at ten foot (129 shots) and 3 at seven foot (95 shots). They ran with the real `frameShot` and scene.js's damping, frame by frame at 60 Hz, in the same order main.js uses.

The scripts are in /tmp/claude-1000/-workspaces-lucid-winds/c614e34d-7999-40c8-ad65-9b1cec65bb8b/scratchpad/kp/: viewnum.mjs (helpers), scen.mjs (today's frames), motion2.mjs (camera during real shots, `node motion2.mjs 10 3`), placedrag.mjs, orbit.mjs, solve.mjs (best possible camera), props.mjs (the proposals) and tray.mjs (Astra's refit).

## The answer first

1. **The camera stands like an adult two paces behind the chalk.** At the opening break on the default ten foot ring it is 1.72 m up and 2.2 m behind the shooter: 2.79 m from the shooter and 4.10 m from the centre mib.
   - A 16 mm mib is 7.2 px and the shooter is 14.6 px.
   - The thirteen mibs plus the shooter cover 0.18% of the screen.
   - 69% of the screen is the inside of the ring. Most of that is the 1.5 m of empty dirt between the shooter and the cross.
2. **"The area is too large" is true both ways, but mostly it is the ring.**
   - Ten foot is 190 mibs across, and the opening shot is 95 mib widths long.
   - The best possible camera that holds the shooter and the whole cross in one portrait frame gets a ten foot mib to only 12 px (1.6x today).
   - While the whole 0.47 m cross has to fit across a 412 px screen, no camera gets past about 14 px.
   - The rest has to come from a smaller ring, or from an aim frame that lets the cross run off the sides.
3. **The camera moves far too much, and four of the moves are bugs, not choices.**
   - It follows the rolling shooter through every shot: a median 234 degrees of turning per shot, up to 3880 degrees a second.
   - It goes the long way round the +-180 degree seam in 57% of shots.
   - The placement drag is a feedback loop with the follow camera. It throws the shooter to the far side of the ring and shakes it there.
   - Aiming turns the camera about a point 0.76 m in front of the shooter. The shooter slides 9 px across the screen for every degree of aim, and 18 px per 2 degree nudge, even under a braced thumb.
   - The last two are the closest numbers I have to "when I go to move the aim with just my thumb it freaks out and skips around".
4. **My recommendation is Framings 2 and 3 together.** A five foot default ring, with an aim camera that turns about the shooter and holds still while the shot plays.
   - At 412x915: the shooter is 45 to 76 px and the mibs 19 to 26 px, which is 2.6x to 3.6x today.
   - The whole ring is one gesture away as a map. That same frame is Astra's statue frame, refit by width above her tray.

## 1. What the player sees today

### 1a. The opening break on the ten foot ring (the default after the onboarding)

| | 412x915 | 360x780 |
|---|---|---|
| camera | 3.42 m from the look point (half way to the cross), 1.72 m up, 2.79 m to the shooter, 4.10 m to the centre mib, 30 degrees down, 28 degree lens | the same. The lens angle is vertical and the two screens have almost the same shape |
| shooter (22 mm) | 14.6 px, at y 711 (78% down), centred | 12.4 px at y 606 (78%) |
| grab circle | 51 px across: the 16 px minimum x 1.6. The radius the code measures for the shooter is only 5.8 px | 51 px |
| mibs (16 mm) | 7.5 near arm, 7.2 centre, 6.9 far arm; the centre is at y 288 (31%) | 6.4 / 6.1 / 5.8, centre at y 245 |
| the cross | 202 x 85 px | 172 x 72 px |
| the ring | an ellipse 1445 x 644 px, 3.5 screens wide. Only the near and far arcs show (19% of the chalk). The far arc is at y 73; the near arc is at y 717, 6 px under the shooter | 1232 x 549 px, 20% of the chalk |
| screen | 69% inside the ring, 31% dirt outside, 0% sky | the same |
| empty dirt between the cross and the shooter | 368 px, 40% of the height | 313 px, 40% |

**How the height is split (412x915 / 360x780):**
- **The HUD takes 16.7% / 19.6%.** The names and pocket dots take 59 px (6.4% / 7.6%). The house rules chip and corner buttons take 94 px (10.3% / 12.1%), or 104 px while the power bar shows.
- **While aiming,** two 56 px nudge buttons sit at half height on both edges, and the Zoom button sits under the right name chip. The guidance bubble is at 62% and hides while braced.
- **There is no real sky.** The camera looks 30 degrees down through a 28 degree lens, so the top of the frame is still 16 degrees below the horizon.
- **The "sky" is Astra's skyline,** painted as a page element over the top of the dirt (main.js lotBand, line 1479). It is 71 px (8%) at ten foot and 123 px (13%) at seven, and shows only while 5 or more mibs are live.
- **No fog ever reaches this frame** (it starts 5 m out).
- **The statue tray,** when it shows, is 154 px today (17% / 20%). Astra's plate is 190 px (21% / 24%).

### 1b. The other frames (412x915; 360x780 is the same picture at 0.85 of the pixels)

| frame | shooter | mibs | ring | note |
|---|---|---|---|---|
| seven foot opening (onboarding beats) | 16.1 px at 71% | 8.6 centre | 1183 x 535, 23% of the chalk | The camera is still 2.97 m back. The sports framing barely shrinks with the ring, because spanAdd adds a fixed 1.9 m |
| thirteen foot opening | 13.4 at 83% | 6.2 | 1643 x 725 | |
| ten foot, one mib left (the lean) | 28.4 | 10.7, at y 82 (9%) | 3% of the chalk | The lone mib sits just under the name chips |
| seven foot, one mib left | 40.6 | 15.3 | | The biggest target today's code ever draws |
| ten foot, six mibs scattered | 14.8 | 6.5 to 8.8 | 1458 wide | |
| TOP DOWN, ten foot | 10.8, at y 830: under the house rules chip (y 821 to 845) | 7.5 | 1435 x 1399, 9% of the chalk | The overhead toggle shows a 0.9 m strip of a 3 m ring, not the whole ring |
| statue placing, ten foot | 4.9 | 3.4 | 678 x 661, x from -133 to 545 | The ring is 1.6 screens wide, so a third of it is off the sides |

## 2. How the camera moves

`frameShot` runs every frame of a match, in every phase (main.js 2141 to 2148), and scene.js moves 18% of the way toward whatever it asks for each frame. That is the whole camera. In play it does five things.

1. **The turn change is a hard cut** behind the other shooter (by design, main.js 2135).
   - At the opening that is a 180 degree cut every turn.
   - Later it cuts to wherever that shooter's marble rolled out, so the player's own view is never the same two turns running.
2. **During a shot it follows the shooter.** The look point and the facing are rebuilt every frame from the rolling shooter and the live mibs. Over 129 real shots at ten foot:
   - The camera turns a median 234 degrees per shot (90th percentile 394, worst 691). All 129 shots turned it more than 90 degrees.
   - The fastest single frame turned 64.7 degrees (3880 degrees a second).
   - The camera distance swings from 1.04 to 5.50 m.
   - The shooter is inside the HUD-free part of the screen on only 28% of the frames while it rolls. It rolls off the bottom (in the example below its screen y goes from 711 to 1114), and a third of the live mibs leave that area too.
   - At seven foot: median 250 degrees, worst 652, fastest 3697 degrees a second.
   - DESIGN 8.5 asks for a "brief low follow on hard snaps, skippable". What exists instead is the aim frame chasing the marble. Once the marble passes the cross, "behind the shooter" is the other side of the ring, so the camera swings round to look back at you.
3. **The +-180 degree seam.** The wanted facing comes from atan2, between -180 and +180 degrees, and the damping subtracts raw angles. Nothing in the camera code ever wraps an angle. So when the shooter crosses the line behind the cross, the camera spins the long way round.
   - That happened in 74 of 129 shots at ten foot (57%) and 53 of 95 at seven.
   - It adds 54 degrees of pointless spin to the average shot: the direction the camera chases moves 203 degrees, but the camera turns 257.
   - Player 2 (the AI) starts at 180 degrees, so its whole starting side sits on the seam.
   - One ten foot shot, sampled every 0.1 s (shooter x and z, wanted facing, camera facing, distance, shooter screen y):
     - (-0.30, -0.19) -123 -109 2.84 518
     - (-0.01, -0.24) -177 -145 2.81 493
     - (0.26, -0.34) 145 64 2.80 469
     - (0.53, -0.43) 132 113 2.80 574
   - The short way from -145 to 145 is 70 degrees. The camera went 209 degrees the other way in 0.1 s, then followed the marble off the bottom of the screen.
4. **The placement drag fights the follow camera** (main.js attachPlacement, lines 1458 to 1462). Any drag that starts off the shooter in the place phase sets the shooter's position on the ring to the camera's current facing + 180 degrees + (finger x - 1/2) x 252 degrees. The camera then turns toward the new spot, which changes the facing the next move reads. With the real setPlaceAngle and frameShot:
   - A thumb landing at x 150 throws the shooter from 0 degrees (in front of the camera) to 146 degrees (the far side of the ring) on the first move.
   - It then swings between 146 and -160 degrees while the camera shakes between -13 and 49.
   - A thumb resting at the centre with a 1 px wobble makes the shooter jump 30 degrees along the ring every three frames. The camera swings 32 degrees back and forth ten times a second.
   - No test or tool exercises this path (none touches placeDrag or setPlaceAngle).
5. **Aiming turns the camera about the look point, not the shooter.** The look point stands well in front of the shooter: 0.76 m at the ten foot opening, 0.40 m in the lean. So turning the aim slides the shooter across the screen.
   - At 412x915: 0.5 degrees moves it 4 px, 2 degrees (one coarse nudge) 18 px, 5 degrees 44 px and 15 degrees 130 px. At seven foot: 3, 14, 34 and 101 px.
   - The one-finger orbit turns 0.40 degrees per px of thumb, which is 10.7 mm sideways at the cross. A mib is 16 mm, and a hit needs the aim within about 19 mm.
   - So a 12 px thumb slide moves the shooter 44 px: three of its own widths, nearly the whole 51 px grab circle.
   - The nudge buttons are meant to be used while braced, and the Knuckle reads the thumb's contact point on release against the shooter's current screen position (knuckle.js lines 289 and 323).
   - One 2 degree nudge moves the shooter 18 px, against a 16 px contact radius. A thumb braced dead centre then reads as touching the rim, and the shot gets spin the player never put on.

## 3. What "the area is too large" means in this code

Both readings hold. The ring is the bigger half.

- **The ring is too big in world units.**
  - Ten foot is 3.05 m across: 190 mib widths. The opening shot is 1.525 m: 95 mib widths, 69 shooter widths.
  - On screen today the chalk ellipse is 1445 px wide on a 412 px screen, and the cross is 202 x 85 px inside a frame that is 69% ring.
- **The camera is too far.**
  - It is 2.79 m from the shooter, 4.10 m from the cross, and 1.72 m up.
  - This is why seven foot barely helps today: the sports framing stands the shot distance + 1.9 m back whatever the ring, so the seven foot opening still draws 8.6 px mibs from 3.4 m away.
- **The camera alone cannot fix it.**
  - I searched elevations from 12 to 70 degrees and lenses from 18 to 60 degrees for the biggest centre mib.
  - The constraints: the shooter sits high enough for a 154 px hold circle, the whole cross sits under the names, and the camera looks down on the cross at 18 degrees or more so it stays readable.
  - Ten foot tops out at a 12.0 px mib (26 degrees down, an 18 to 20 degree lens, 2.6 to 3.0 m back), with a 26 px shooter. Seven foot reaches 14 px.
  - Everything then stalls at about 14 px. That is the 0.47 m cross (29 mib widths) spread across a 412 px screen, the same limit a pool table hits.
  - So at ten foot a camera change buys 1.6x. Past that, the ring has to shrink or the aim frame has to stop insisting on the whole cross.
- **The shot gets easier as the ring shrinks.** The settled aim cone is 1.5 degrees either side; the table compares it with the angle a single mib allows.

| ring | opening shot | the mib allows | cone vs mib |
|---|---|---|---|
| ten foot | 1.52 m | 0.71 degrees | cone 2.1x wider |
| seven foot | 1.07 m | 1.02 degrees | cone 1.5x wider |
| five foot | 0.76 m | 1.43 degrees | about equal |
| four foot | 0.61 m | 1.79 degrees | mib wider than the cone |

## 4. Three framings

All numbers are for the opening break at 412x915 / 360x780 (from props.mjs), with the shooter held at y 738 / 603 so a 154 px hold circle clears the house rules chip. Today, for comparison: shooter 14.6 / 12.4 px, centre mib 7.2 / 6.1 px.

### Framing 1: lean in, keep ten foot (camera only)

**The setup:**
- 26 degrees down, a 20 degree lens.
- The lean's balanced fit used at every count of mibs, not only under five.
- The aim turns about the shooter.
- The camera is 2.61 m from the look point, 1.16 m up, 1.8 m behind the shooter.

**What it draws:**
- Shooter 26.7 / 20.9 px (1.8x).
- Mibs: near arm 12.5, centre 11.8, far arm 11.2 px (10.1 / 9.6 / 9.1 at 360), which is 1.6x. The whole cross is on screen.
- The far chalk goes off the top (y -124).
- The ring is 2252 px across; 4% of the chalk is on screen; 82% of the screen is inside the ring.

**What changes in play:** the rules and physics stay the same. The view drops lower with a longer lens, and the empty middle shrinks. Knocked-out mibs leave the frame before they reach the chalk, so a watch frame has to show the exit.

**What changes in the tests:**
- camera.mjs blocks 1 and 1b, which say the sports framing is "unchanged", retire on purpose, and block 2b's edges move to the hold circle.
- The skyline band has to go. With the far arc off the top, lotBand paints a 19% skyline over the far arm of the cross.
- The render and shots anchors get re-shot.
- DECISIONS records that the K1 framing call is reversed.

**Verdict:** honest, but not enough. Ten foot stays speck sized.

### Framing 2: a smaller ring, the same eye (the world changes; the camera scales with the ring)

**The setup:**
- The default ring becomes five foot (radius 0.762 m), or four foot. Seven, ten and thirteen stay as house rules.
- The camera keeps today's 30 degrees and 28 degree lens, placed by the fit. Without the fixed 1.9 m, its distance scales with the ring.

**What it draws:**
- **Five foot:** the camera is 1.13 m from the look point, 0.58 m up, 0.7 m behind the shooter, like kneeling at the chalk.
  - Shooter 45.0 / 35.1 px (3.1x / 2.8x).
  - Mibs: near arm 21.5, centre 18.8, far arm 16.8 px (17.3 / 15.2 / 13.6 at 360), which is 2.6x / 2.5x.
  - At the opening, the outermost mib of each side arm sits just past the screen edge.
- **Four foot** (34 degrees down, 30 degree lens): shooter 45.5 / 35.5 px, centre mib 20.5 / 16.5 px (2.8x / 2.7x).
- **Seven foot as the default, with the fit** (the smallest change; it is already the onboarding ring): shooter 34.5 / 26.9 px, centre mib 14.0 / 11.3 px (1.9x).

**What changes in play:**
- **Shots are half as long.** At five foot the 1.5 degree settled cone about equals one mib's hit angle (at ten foot the mib allows only half the cone). Hitting what you aim at gets about twice as likely.
- **Games get shorter.** A struck mib needs only half the roll to leave the ring (0.76 m). The 4.5 m/s break, the launch range and the pocketing balance need retuning.
- **The Ringer AI gets twice as accurate at half the range** with its fixed aim error (5 / 1.5 / 0.8 degrees), so it needs re-deriving. The Arena AI already starts from a hit rate and derives the angle; the Ringer could do the same.
- **Statues break.** The rule says one foot from the cross and from the chalk. That leaves 164 legal half-foot grid spots at ten foot, 36 at seven, 4 at five and none at four (counted before each statue's own footprint). The clearances in statues.js FOOT have to scale with the ring.
- **The ring sizes in DESIGN 8.3** (2.1 / 3.05 / 4.0 m) and the ten foot quickplay default are Stephen's call.
- **Real scale (DESIGN 21.1) holds.** The marbles keep their real 16 and 22 mm; only the chalk circle gets smaller, the way kids draw it.

**What changes in the tests:**
- ringer_ai.mjs plays ten foot; its 65% ladder floor and shot-count bands need re-running.
- The ringer_break and ringer_statues sim scenarios are ten foot.
- camera.mjs: the ring position tawZ -1.525 becomes R, and blocks 1 and 1b change.
- spyglass.mjs has TAW at -1.525. Its openBelowPx of 14 would almost never open with 19 px mibs, so re-pick it or retire it.
- arena.mjs: The Ring arena reuses the ten foot radius, so decouple it or it shrinks too.
- playthrough.mjs plays the seven foot beats and is still fine. The onboarding beats are set to seven foot; pick a size.

### Framing 3: aim close, watch still (camera behaviour; pairs with 1 or 2)

**The setup:**
- **Aim:** the camera turns about the shooter and stands close and low. The shooter is big where the thumb is, the near half of the cross sits in the top band, and the whole cross is no longer required.
- **Watch:** on the flick the camera stops following. It holds the aim frame and eases up and back over about half a second, to a frame that shows the struck mibs and the chalk on that side. The turn change then cuts.
- **The whole ring is one gesture away:** a held Look (today's TOP DOWN, refit to the whole ring as in section 5) or a pinch out.

**What it draws:**
- **Five foot** (28 degrees down, 34 degree lens): the camera is 0.59 m from the look point, 0.29 m up, 0.35 m behind the shooter.
  - Shooter 75.8 / 58.3 px (5.2x / 4.7x).
  - Mibs: near arm 26.3, centre 21.6, far arm 18.3 px (21.3 / 17.7 / 15.1 at 360), which is 3.0x / 2.9x.
  - The far arm is at y 24 / 33, under the name chips, so lower the fit by 20 px. The outer side mibs are off the edges.
- **Four foot** (30 degrees down, 36 degree lens): shooter 87.1 / 67.1 px; mibs near 32.6, centre 25.5, far 20.9 px (26.4 / 20.8 / 17.2 at 360), which is 3.5x / 3.4x.
- **Ten foot with the same idea** (24 degrees down, 24 degree lens): shooter 38.2 px, centre mib 13.1 px. The cross is too far away to get big, so at ten foot this is just Framing 1 with a bigger shooter.

**What changes in play:**
- The camera's turn per shot drops from a median 234 degrees to about 0. The 3880 degree a second whip and the long-way spins go away.
- The shooter stays put under the thumb while aiming (0 px per degree instead of 9), so the brace, the nudge and the contact point mean what they say.
- The cost: the far side of the ring is off screen while aiming. The Look gesture and the watch frame cover that.

**What changes in the tests:**
- camera.mjs gains "the shooter moves less than 1 px under any orbit or nudge" and loses the asserts that assume the look-point pivot. Block 4 stays: the player's offset still survives.
- A new node gate shaped like motion2.mjs (real matches, real frameShot) asserts the camera turns only a few degrees while a shot plays, and never goes the long way round the seam.
- aimnudge.mjs watches the aim line's end move right, which is still true. Add a check that the shooter does not move.
- knuckle.mjs: after a nudge, the contact point reads the brace, not the rim.
- The playthrough's "hard straight flicks up the screen" still hit the cross, because the aim is still the camera's facing.

## 5. Astra's "refit the whole ring above the tray"

**Today's statue frame fits the ring's height above the tray, not its width** (main.js 2155 to 2165).
- At 80 degrees down and a distance of 5.35 x (R + 0.05), the chalk (+5 cm) comes out 678 x 661 px, spanning x -133 to 545 on a 412 px screen (578 x 563, x -109 to 469, at 360).
- A third of the ring's width is off the edges, at every ring size, because the distance scales with R.
- The near chalk is at y 688, inside her area: her 190 px plate starts at y 725, today's tray at 761.

**Refit by width:** the chalk + 5 cm spans the screen width minus 16 px, centred between the names (y 59) and the top of the tray.

| ring | camera | scale | mib | Column | Orb | Arch | Loaf |
|---|---|---|---|---|---|---|---|
| ten foot, 412 | 14.5 m out; ring 396 x 387 px at y 198 to 586 | 126 px/m | 2.0 px | 5 px | 6 px | 11 px | 11 x 7 px |
| ten foot, 360 | | 109 px/m | 1.7 px | 4 px | 5 px | 10 px | 10 x 6 px |
| five foot, 412 | | 244 px/m | | 10 px | 11 px | 21 px | 22 x 13 px |
| four foot, 412 | | 300 px/m | | 12 px | 13 px | 26 px | 27 x 16 px |

That ten foot scale is why Astra asks for an ownership badge.

Looking straight down (90 degrees) changes no sizes, and makes the chalk a true circle (396 x 396), which suits the footprints and the reach circle. This same width-fit frame is the honest "whole ring" view for Framing 3's Look gesture and for TOP DOWN, which today shows a 0.9 m strip.

## 6. Fix these whatever framing is chosen

1. **Wrap the wanted facing** to the nearest equivalent of the current one before damping (in frameShot or rig.update). Normalise the aim direction to between -180 and +180 degrees where onAim hands it to the shot, so replays and the AI see one number. Gate: the motion recorder counts zero long-way seam crossings.
2. **Stop re-framing while a shot plays** (main.js 2141: skip frameShot while state.simulating), and build the watch frame on purpose. Gate: how far the camera turns during a shot.
3. **Placement:** freeze the camera facing when the finger goes down and slide the shooter along the near edge (drop the + 180 degrees), or hold the frame while a placement drag is live. Gate: a still finger moves the shooter less than 1 degree.
4. **Turn the aim orbit and the nudge about the shooter,** not the look point. Gate: the shooter's screen position stays put under an orbit or a nudge, and a nudge does not change the contact point.

## 7. Calls I made where the brief was open

- **"The area is too large"** I read as the ring's size in world units, because the camera alone buys only 1.6x at ten foot. Both readings are measured above.
- **Default ring:** I measured seven, five and four foot. I lean toward five foot as the default: it keeps a ring with room around the cross and gives 19 to 22 px mibs. Four foot is the option for bigger marbles on screen. The statue clearances have to scale for either.
- **The hold circle:** I read Stephen's "three times bigger" as a fixed circle about 154 px across (today's 51 px x 3), and placed every proposed shooter high enough to fit it. The circle itself belongs to another investigator.
- **Screen sizes:** 412x915 and 360x780 as asked. Both are full-height screens; with Chrome's address bar showing the canvas is shorter, and every px number shrinks with the height.
- **Not looked at:** I rendered and opened no frame (the browser lock, plus Stephen's no-image rule). Every claim is the live code's camera maths.

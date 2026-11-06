# KEEPSIES INPUT: why the aim skips, why the circle is small, why the flick is terrible
AIM AND FLICK INVESTIGATOR, 5 Nov 2026, 23:30 UTC. Everything below was measured in node with no browser. The harness runs the real input modules: `knuckle.js`, `pullback.js`, `cameraCtl.js`, `framing.js` and the real `scene.js` OrbitRig. The handlers in `main.js` and `ringer.js` are not exported, so the harness evals their exact source text out of the files: `main.js:1448-1467` attachPlacement, `ringer.js:430-450` frameShot, `ringer.js:467-480` tawOnScreen and `ringer.js:216-220` setPlaceAngle. They are registered in main.js's order. Touch is delivered the way Chrome on Android delivers it. Each display frame gets one pointermove, with that frame's digitizer samples in getCoalescedEvents and their own timeStamps. Down and up go out at once, and the up flushes the moves still pending. The screen is 412x839 CSS px (a Pixel 9 in Chrome) with 13 mibs in a cross and the shooter on the ring edge, unless a line says otherwise. No browser was started.

## The answer in one screen
1. **The skipping comes from the PLACE phase, which is how every turn starts.** One thumb drag there is owned twice. It drives the placement, which re-seats the shooter relative to the moving camera. It also drives the orbit. The camera then re-points itself at the new shooter, and that closes a feedback loop. A slow 60 px drag turned the aim line by up to **42-45 degrees in a single frame**, with **37-96 jumps of more than 10 degrees per gesture**. The shooter was off the screen for **25-75 frames**, and the aim ended **65-178 degrees** away from where it started. The same drag in the AIM phase gave **zero** jumps.
2. **Two more skip sources.** First, the camera's azimuth wraps at +-180 degrees. Walking the shooter smoothly through 180 degrees at 0.5 degrees a frame made the camera take a **64 degree step** and spin the long way round. Second, the orbit pivots **0.76 m in front of the shooter**. The shooter slides **3.3-3.6 px for every px the thumb moves**, and it **leaves the screen after 67-75 px of drag (27-30 degrees)**.
3. **The circle is 25.6 px in radius, in every match frame on a 412 px phone.** That is 51 px or 13.5 mm across, around a marble drawn **5.3-5.8 px** in radius. It comes from the marble: a 16 px floor times 1.6. In calibration the same formula gives **92-100 px**, so the gesture is taught on a circle 3.6-3.9x bigger than the one the match uses. Three times bigger means about **77 px radius, set as a fixed size on the glass**.
4. **The flick's power changes with the display clock, not only with the thumb.** Every coalesced sample is stamped with the handler's time instead of its own (`knuckle.js:248`). So the **same** short snap launches anywhere from **1.33 to 4.11 m/s at 60 fps and 1.33 to 6.00 m/s at 40 fps**. With `ev.timeStamp` the spread is **0.00**. On top of that, power is read only from the **last 90 ms before the lift**. A hard flick loses half its power if the thumb rests 30 ms before lifting, and it is **cancelled as "too soft" 19-24 times out of 24 if the thumb rests 60-100 ms**.
5. **The flick's direction overrides the aim line.** The shot follows the flick's own direction, up to +-25 degrees, at **0.62 ground degrees per degree of thumb error**. A flick just 5 degrees off vertical misses by **8 cm at 1.5 m**, which is five mib widths. The cone settles only if the thumb's jitter stays under 2 px RMS. At 2 px per axis of touch noise it **never settles**, so the shot keeps a random +-6 degrees, or +-16 cm at 1.5 m.

---

## 1. "When I move the aim with just my thumb it freaks out and skips around"

The aim is the camera (DESIGN 7.7, `main.js:170` `aimAzimuth: rig.state.azimuth + PI`). A one finger drag that does not land on the shooter orbits it at 0.007 rad/px, which is 0.40 degrees per px (`cameraCtl.js:50`). I drove that drag in every combination below and recorded the aim line every frame, plus the shot a release would fire. The scripts are `s_place.mjs` and `s_matrix.mjs`, and the matrix is in `matrix.jsonl`.
- Phase: place, aim.
- Starting point: on the centre, just outside grabR, mid screen.
- Motion: an arc around the marble, across the marble, a slow drift, a fast swipe.
- Touch noise: 1 px and 3 px.
- Sample rate: 60 Hz and 120 Hz.

### 1a. THE PLACE PHASE FEEDBACK LOOP. This is the skipping.
- **When it happens:** at the first shot of EVERY turn, and on any shot after the shooter has left the ring. That comes from `rules-ringer.js:105-108` mayPlace and `ringer.js:187,333,412`. The HUD's own instruction at that moment is "Drag to place your shooter, then hold it and flick" (`index.html:570`).
- **One pointer, two owners.** `attachCameraControls` is registered before `attachPlacement` (`main.js:197` vs `main.js:200`). The camera's pointerdown runs first and sees `G.placeDrag` still unset, so it takes the pointer (`cameraCtl.js:27`). Then the placement's pointerdown sets `G.placeDrag`. `cameraCtl.onMove` never checks the claim again (`cameraCtl.js:39-51`), so every move both orbits the camera and moves the shooter.
- **The placement reads the live, moving camera, with the wrong sign.** `main.js:1462` is `setPlaceAngle(G.rig.state.azimuth + Math.PI + (frac - 0.5) * Math.PI * 1.4)`.
  - The camera's azimuth is the side it stands on (`scene.js:239-243`). The auto frame puts it on the shooter's own angle: `framing.js:156` `autoAz = atan2(-dx,-dz)` equals the shooter's angle about the centroid. So the `+ Math.PI` puts the shooter on the far side of the ring.
  - Within 50 ms of the first move it was teleported from 0 to -170.5 degrees.
- **The loop.** `frameShot` (`ringer.js:441-442`) then re-points the camera at the new shooter. The next move re-seats the shooter relative to where the camera has got to. The camera chases a shooter that keeps running 180 degrees ahead of it. Every move re-applies the jump, so a slow drift is the worst case.
- **Measured** (rows from `s_place.mjs` and `matrix.jsonl`):

| drag in the place phase | aim jumps >10 deg | biggest in one frame | frames with the shooter OFF screen | where the aim ended |
|---|---|---|---|---|
| slow 60 px left over 500 ms, mid screen | 37 | 42.4 deg | 25 | 200 deg of camera turn |
| slow drift (45 px over 1.5 s) from mid screen | 93-96 | 42-43 deg | 63-71 | 143-166 deg |
| across, from 34 px beside the shooter | 34-36 | 35-36 deg | 43-47 | 115-161 deg |
| arc around the marble from 34 px | 58-60 | 36-37 deg | 23-28 | 150-178 deg |
| fast swipe from mid screen | 12 | 39 deg | 42 | 89-98 deg |
| **same 60 px drag in the AIM phase** | **0** | **0.8 deg** | **0** | 24 deg, as asked |

This is why it is "a lot of times" and not always. It hits exactly when a turn has not been braced yet, and every turn begins that way. No gate drives the place drag. Grepping test/, sim/ and tools/ for `setPlaceAngle` or `placeDrag` finds nothing.

### 1b. atan2 wrap at +-180 degrees
- `framing.js:156` returns autoAz in (-pi, pi]. `ringer.js:442` writes it straight into `wantAzimuth`. `scene.js:221` damps `azimuth += (want - azimuth)*k` with no unwrapping.
- The shooter was walked smoothly from 170 to 190 degrees at 0.5 degrees a frame, with no feedback loop involved (`s_wrap.mjs`). The camera took a **64.3 degree step in one frame** as the shooter crossed 180.5 degrees, spun 360 degrees the long way, and lost the shooter for **10 frames**.
- This happens whenever the shooter's bearing about the centroid crosses the +-180 line inside a turn. That can be a placement that crosses it, or the centroid moving after a pocket while the same player shoots again. A turn change is a snap cut, so only within-turn moves show it.

### 1c. The orbit pivots on the dirt in front of the shooter, not on the shooter
- The camera looks at `tx = taw + (centroid - taw) * biasUser` (`framing.js:160`). At a full cross with bias 0.5 that point is 0.76 m ahead of the shooter. The player's orbit only adds to the azimuth (`framing.js:161`), so the camera swings around that point and the shooter swings across the screen (`s_orbit.mjs`):

| screen | lay | camera | shooter moves per px of thumb | shooter leaves the screen at |
|---|---|---|---|---|
| 412x839 | 13 cross | 3.42 m | 3.25 px | 30 deg = 75 px of drag |
| 412x839 | one mib 1.2 m | 1.42 m | 3.29 px | 30 deg = 75 px |
| 412x915 | 13 cross | 3.42 m | 3.54 px | 27 deg = 67 px |

- Once the shooter is off the screen, `tawOnScreen` returns null (`ringer.js:478`). The brace cannot start, the reticle cannot draw, and the next touch on the place where the shooter was orbits again. The aim line runs from the shooter toward the vanishing point, so it tilts across the screen as well.
- `test/camera.mjs` checks that the shooter is on screen only at userAz = 0. Its orbit checks (lines 155-161) look at the azimuth and the distance, never at the shooter. The earlier k2-endgame-pinch "dirt" shot was this same problem.

### 1d. A thumb that starts ON the shooter is a brace, not an aim drag
- Within grabR (25.6 px) the Knuckle takes the pointer (`knuckle.js:219`), so the orbit never sees it. From the matrix:
  - A slow arc, drift or crossing ends as a cancel, and the game says "That was too soft to count, so it does not. Take it again." (`main.js:179`).
  - A sideways swipe (300 px in 120 ms) **fires a shot at the 25 degree clamp**, with power 0.36-0.44, on all 8 runs.
- With a 3x circle this case gets 9x more area, so it has to be handled (fix 11).

### 1e. A second finger orbits under a braced thumb
- `knuckle.js:216` marks the second finger as knuckling down but does not claim it, and the camera only skips pointers the Knuckle owns. So the second finger becomes the camera's one-finger orbit.
- With the thumb braced, a second finger drifting 30 px turned the aim **12.0 degrees** (`s_two.mjs`).

### 1f. The fine aim buttons sit where a one hand thumb rests, and every step jumps the shooter
- `#aimNudge` puts two 56 px buttons at mid height, 8 px from each side (`index.html:462-466`). At 412x839 they cover x 348-404 and y 391-447 on the right.
- Held for more than 350 ms they repeat every 140 ms (`main.js:290-301`). Because of 1c, each 2 degree step swings the shooter **16 px** sideways (8.1 px per degree).

### Ruled out, with numbers
- **Coordinate spaces and pixel ratios.** All CSS px. The knuckle uses `clientX - rect.left`, the rig projects into stage.width, which is CSS px (`scene.js:142,261`), and groundPoint uses the same viewport. devicePixelRatio is never used.
- **The orbit itself in the aim phase.** At most 1.3-5 degrees per frame for arcs, crossings and drifts. A fast swipe reaches 12-12.6 degrees per frame, which is just 0.4 degrees per px times 30 px a frame. That is a gain problem, not a jump.
- **A brace that hands off to the aim phase.** `onBrace` commits the placement (`main.js:1574`) and nothing moves.
- **A nudge button stealing a canvas drag.** It cannot: a touch stays with the element it went down on.

## 2. "The circle you hold and flick on is far too small"
- **Where the number comes from.** `ringer.js:475` is `r = max(16, projectedRadius * 1.35)` and `ringer.js:479` is `grabR = r * 1.6`. The Knuckle accepts a touch within grabR (`knuckle.js:219`). The placement test uses `t.r * 1.6` (`main.js:1455`), and the pull back uses grabR x 1.15 (`pullback.js:44`). It is tied to the marble. In a match the marble is so small that the 16 px floor always wins, so the circle is the floor x 1.6. The comment above it promises "still a 48 px target". (`s_circle.mjs`)

| 412 wide | marble drawn | r | grabR | across on glass |
|---|---|---|---|---|
| match start, 13 cross (412x839) | 5.3 px | 16 (floor) | **25.6 px** | 13.5 mm |
| endgame, one mib 1.2 m (412x839) | 13.0 px | 17.5 | 28.0 px | 14.8 mm |
| endgame, far mib 2.4 m | 6.7 px | 16 | 25.6 px | 13.5 mm |
| **calibration** (0.42 m, 17 deg) | 42.4 px | 57.2 | **91.6 px** | 48.4 mm |
| 412x915: match / calibration | 5.8 / 46.2 px | 16 / 62.4 | 25.6 / 99.9 px | |

- The thumb's pad covers about 40 px, so the 11 px marble disappears under it. The reticle that shows the circle appears only after the brace has started (`main.js:1574-1590`). Before the touch, nothing shows where the circle is.
- When braced, the reticle ring is drawn at `grabR*(0.70 + cone*0.16)` (`main.js:1589`). That is 42 px at the wide cone and shrinks to 24 px, inside the grab radius, once settled.
- **Spin is measured against r, not the circle.** `knuckle.js:182-185` divides by `taw.r`, which is 16 px. A touch 16 px off centre already counts as the rim: full backspin is 3x the natural rolling rate, full topspin 2x, side 0.8x (tuning `kBack` / `kTop` / `kSide`). So 61% of today's grab disc reads as full spin. The snap card says "Flick from below it for backspin" (`index.html:558`). That puts the thumb right on the edge where a few px decides between full spin and no brace at all. On a 3x circle, 96% of the area would read as full spin unless this is rescaled.
- **What three times bigger means in code:** `grabR = max(tuning.snap.grabRadiusPx = 77, 1.6 * r)`. That is 154 px across, 41 mm on glass, close to calibration's 92-100 px. Spin would be measured against about 0.6 x grabR, with a dead zone in the middle. The drawn r stays as it is, for the reticle and art only.

## 3. "The flick is terrible"
**How a release becomes a shot today.**
1. `end()` pushes the up sample (`knuckle.js:288`).
2. `thumbSpeed(t)` takes the samples inside the last `sampleWindowMs` = 90 ms (`knuckle.js:290-291`). `motion()` drops the still head of that window, everything within 2 px of its first sample. Speed is the chord from the first moving sample to the last, divided by their time span, converted at `METRES_PER_CSS_PX` 0.000264.
3. `thumb01 = clamp((v - 0.35) / (calib.max - 0.35))` (`knuckle.js:305-307`). The default calib.max is 1.2. Calibration replaces it with the p90 of three "hardest snaps" (`onboarding.js:64`).
4. Under `cancelBelow` 0.35 m/s, which is **1.33 CSS px per ms**, there is no shot and the "too soft" message shows.
5. The launch speed is `0.5 + 5.5*(1-(1-p)^1.3125)` (`snap.js:35-40`). Its slope at the bottom is 7.2 m/s per unit of power. Across the whole band, 1 px/ms of thumb speed is worth about 2 m/s of launch.
6. The direction is camera forward plus `fineAngle`. That is the flick chord's ground yaw, capped at +-25 degrees (`knuckle.js:327-328,381-403`). On top of that comes a uniform random spread of +-(1.5..6) x (1 + wildness) degrees (`snap.js:46-56,73-77`).
7. Leaving the circle does nothing. Leaving the canvas is meant to declare a slip, but it never does (3e).

**3a. Handler time instead of sample time.** At `knuckle.js:248`, every coalesced sample of a pointermove is pushed with `t = now()` at dispatch, not with its own `ev.timeStamp`. The up at `knuckle.js:288` is stamped the same way. The chord is real, but the time it is divided by is quantised to frame boundaries. Here is the same physical flick at 24 phases of the display clock (`s_flick2.mjs`):

| flick | delivery | LIVE: launch speed range | with ev.timeStamp |
|---|---|---|---|
| short snap 60 px / 35 ms | 60 fps, 120 Hz | **1.33 - 4.11 m/s** (power 0.12-0.56) | 1.35 m/s, spread 0.00 |
| short snap | 40 fps (a heavy frame) | **1.33 - 6.00 m/s** (power 0.12-1.00) | 1.35, spread 0.00 |
| short snap | 120 fps, 240 Hz | 1.81 - 3.17 m/s | 1.79, spread 0.00 |
| brisk 120 px / 70 ms | 60 fps | 1.78 - 3.12 | 1.79, spread 0.00 |
| hard 220 px / 70 ms | 60 fps | 4.14 - 5.54 | 4.15, spread 0.00 |
| hard | 40 fps | 4.14 - 6.00 | 4.15, spread 0.00 |

- Calibration takes the p90 of three of these noisy readings, so the noise's upper tail becomes the player's "full strength".
- The gate cannot see any of this. `test/knuckle.mjs` drives `KEEPSIES_DEV.flick` into `knuckle._feed` (`main.js:2329`, `knuckle.js:456-463`). That pushes perfectly timestamped samples at about 345 Hz, 19 points in 55 ms. No real pointermove or coalesced list ever reaches the module.

**3b. Power is read from the 90 ms before the lift, not from the flick.** Same hard flick, 220 px in 70 ms, with the thumb resting before it lifts (`s_dwell.mjs`):

| thumb rests before lifting | LIVE | timestamps fixed | peak-speed estimator (scratch `knuckle_peak.js`) |
|---|---|---|---|
| 0 ms | power 0.63-0.77 | 0.62 | 1.00 |
| 30 ms | **0.35-0.39** | 0.34 | 1.00 |
| 60 ms | **19/24 cancelled** | 24/24 cancelled | 1.00 |
| 100 ms / 200 ms | **24/24 cancelled** | 24/24 cancelled | 1.00 |

- A real "snap through it" that stops on the glass gets "That was too soft to count". A deliberate push (160 px over 220 ms, 0.73 px/ms) is **always** cancelled, 24 out of 24. The minimum gesture is 1.33 px/ms sustained to the lift.

**3c. The flick's direction is the shot's direction** (`s_dir.mjs`, timestamps fixed, so only direction is measured). Ground yaw comes out at 0.62x the screen error:

| flick off vertical | 2 deg | 5 deg | 8 deg | 10 deg | 15 deg | 20 deg | 30 deg |
|---|---|---|---|---|---|---|---|
| shot off the aim line | 1.24 deg | 3.10 deg | 4.98 deg | 6.24 deg | 9.43 deg | 12.71 deg | 19.69 deg |
| lateral miss at 1.5 m | 3.2 cm | 8.1 cm | 13.1 cm | 16.4 cm | 24.9 cm | 33.8 cm | 53.7 cm |

A mib is 1.6 cm and the settled cone is +-3.9 cm at 1.5 m. Lining up to 0.5 degrees with the orbit and the nudge buttons is thrown away by an ordinary thumb wobble. (My assumption: a natural thumb flick wanders 5-10 degrees. The mapping is exact; the human spread is not measured here.) A natural arc that bows 20 px adds wildness 0.31, which widens the cone x1.31.

**3d. The cone falls off a cliff at 2 px of jitter** (`knuckle.js:273-276`, `s_settle.mjs`). It settles only while the 2D RMS jitter over 600 ms stays under 2 px. A spike over 8 px costs half the settle.

| touch noise per axis | 0.3-1.0 px | 1.4 px + 8 Hz tremor | 2 px | 3 px |
|---|---|---|---|---|
| cone after 2 s | 1.50 deg (settled at 1.2 s) | **5.87 deg, never settles** | **6.00, never** | **6.00, never** |

An unsettled shot carries a uniform random +-6 degrees, which is +-16 cm at 1.5 m, and the reticle stays the broken ring.

**3e. Latent bugs on the same path.**
- `finish()` calls `reset()` at `knuckle.js:313` before it reads `S.secondFinger` (`knuckle.js:334,359`) and `S.outsideCanvas` (`knuckle.js:362`).
  - The knuckled-down power cap of 0.9 never applies. `s_two.mjs` measured power 0.595 with knuckledDown false, while the cone still got its x0.6.
  - `aim.knuckledDown` is always false.
  - A thumb that slides off the screen mid snap is never a slip; only pointercancel counts.
- The "brace anchor" for spin is `S.samples[0]` (`knuckle.js:312`). Samples are trimmed to 800 ms (`knuckle.js:69-70`), so on any hold longer than 0.8 s the contact point is wherever the thumb was 0.8 s before the release, not where it landed.
- **Units.** `METRES_PER_CSS_PX` 0.000264 (`knuckle.js:32`) is the 96 dpi reference pixel. On a Pixel 9 (422 ppi, DPR 2.625) a CSS px is 0.158 mm. Calibration normalises the top of the range, but `cancelBelow` and `thumbSpeedMin` are absolute. On his phone the cancel line is really 0.21 m/s of glass.

## 4. Fixes, in the order I would ship them, each with the test it needs
The tests are node scripts in the shape of this harness, with no browser. Extract the pieces that are not exported (attachPlacement; the angle unwrap) into importable modules first, so the tests run the shipped code and not a copy.

1. **One owner per finger in the place phase.**
   - Change: register `attachPlacement` before `attachCameraControls` (`main.js:197-200`). Also make `cameraCtl.onMove` drop any pointer that `isClaimed` says is taken.
   - Change: make the drag relative and anchored at the pointerdown. Something like `angle = angleAtDown + (x - xAtDown) * 0.006` (dragging right moves the shooter right, and the camera follows it). It must never read `rig.state.azimuth`, and the `+ Math.PI` goes.
   - Move `attachPlacement` into `src/input/placement.js`.
   - **Test** `test/placement.mjs`: a 60 px drag over 500 ms in the place phase.
     - No aim change over 3 degrees in any frame.
     - The shooter is never off screen and its ring angle moves in one direction only.
     - userAz stays 0.
     - The first move does not jump the shooter.
     - Once the finger stops, nothing moves.
     - Today this test fails with 37 jumps, 42.4 degrees and 25 frames off screen.
2. **Unwrap the azimuth.**
   - Change: in frameShot, `want = f.azimuth + 2*PI*round((rig.state.azimuth - f.azimuth)/(2*PI))` (`ringer.js:442`). Better, `frameFor` takes the current azimuth and returns the nearest equivalent, so `test/camera.mjs` can test it.
   - **Test:** walk the shooter from 170 to 190 degrees at 0.5 degrees a frame, then check the camera never steps more than 2 degrees in a frame (today 64.3).
3. **Orbit about the shooter.**
   - Change: in `framing.js:160` turn the look offset by the player's orbit: `tx = tawX - L*sin(autoAz+ua)*biasUser` and `tz = tawZ - L*cos(autoAz+ua)*biasUser`, with L the distance from the shooter to the centroid. The shooter then stays bottom centre, and the aim is "straight up the screen from your marble".
   - Change: halve the gain in `cameraCtl.js:50-51` to 0.0035 rad/px, which is 0.2 degrees per px. The nudge buttons stay for the last half degree.
   - **Test** in `camera.mjs`: for userAz from -60 to 60 degrees in 5 degree steps, the shooter projects within 0.02 of a half width of centre, at the userAz = 0 height (today it is off screen by 27-30 degrees).
   - **Test:** a 100 px drag turns the aim 20 +- 0.5 degrees, and a 2 degree nudge moves the shooter less than 1 px (today 16 px).
4. **The circle, 3x and not the marble's.**
   - Change: `ringer.js:475-479` becomes `grabR = max(T.snap.grabRadiusPx /*77*/, 1.6*r)` plus a `spinR` of about 0.6 x grabR.
   - Change: use `t.grabR` at `main.js:1455`.
   - Change: `knuckle.js:182-183` divides by spinR, with a dead zone under 0.2.
   - Change: draw a faint chalk ring at grabR around the shooter whenever the player may brace, so the circle can be seen before the thumb lands.
   - **Test:** grabR is at least 77 at 412x839 in every framing (full cross, 3 mibs, 1 mib, calibration).
   - **Test:** a pointerdown 70 px from the centre braces and the camera never gets it.
   - **Test:** a touch 30 px below reads contactOffset.y between -0.3 and -0.7, not -1, and a touch 8 px off reads 0.
   - Raise `test/knuckle.mjs:90` from "48 across" to "154 across".
5. **Stamp samples with their own time.**
   - Change: in `knuckle.js:248` and `knuckle.js:288` (and the down at `knuckle.js:226/229`) use `ev.timeStamp`. Fall back to `now()` when it is 0 or more than 1 s away from now; synthetic and gate events can carry 0.
   - **Test:** the same flick at 24 frame phases, at 40, 60 and 120 fps, gives power01 within +-0.02. Today it ranges 0.12-0.56 at 60 fps and 0.12-1.00 at 40.
   - Make `test/knuckle.mjs` dispatch real pointer events with coalesced lists through the module, not `_feed`.
6. **Power from the flick, not from the lift.**
   - Change: speed is the fastest 30-50 ms stretch between motion onset and the lift (`knuckle.js:98-105,290-291`), and the direction and curvature come from the same stretch. Re-derive `cancelBelow` and `thumbSpeedMin` in peak terms.
   - Change: version the saved calibration so maxes measured by the old estimator get measured again (`onboarding.js:80-83`).
   - **Test:** a hard flick that rests 0, 30, 60, 100 or 200 ms before lifting gives the same power within 0.05. Today: 0.63-0.77, then 0.35, then 19/24 cancelled, then 24/24.
   - **Test:** a 160 px push over 220 ms is a soft legal shot, not a cancel.
7. **The aim line is the aim.**
   - Change: set `fineAngleMaxDeg` from 25 to 0, or to about 3 with the flick's angle scaled by 0.25. The flick's wobble then feeds wildness only, through `knuckle.js:327-328`.
   - This changes DESIGN 7.7's "+- the snap's fine angle", so it is Stephen's call. His verdict that "the aiming is horrible" plus table 3c is the case for it.
   - **Test:** a flick 10 degrees off vertical fires within 0.5 degrees of the aim line (today 6.24).
8. **A cone a thumb can settle.**
   - Change: make the settle rate graded in jitter, for example `rate = clamp((4 - j)/2, 0, 1) / settleSeconds`, and raise the spike from 8 px to 12 px (`knuckle.js:273-276`).
   - **Test:** 2 px per axis of noise is settled within 2.0 s, 3 px within 3.0 s, and a 15 px jump still costs half.
9. **The brace owns the camera.**
   - Change: while bracing, `isClaimed` returns true for every pointer (`main.js:198`).
   - **Test:** brace, then a second finger drifts 30 px, and the aim changes by less than 0.1 degrees (today 12.0).
10. **Read before reset.**
    - Change: in `finish()` copy `secondFinger` and `outsideCanvas` into locals before `reset()` (`knuckle.js:309-313`), and keep the true down point as the anchor.
    - **Test:** a flick whose last move is off the canvas gives `slipped` true; a second finger gives power at most 0.9 and knuckledDown true; a 2 s hold reads its spin from where the thumb landed.
11. **A sideways swipe from the circle is not a shot.**
    - Change: inside the bigger circle, motion more than 45 degrees off the aim line turns the aim, like a dial. A forward flick still shoots.
    - **Test:** thumb on the marble, 300 px sideways in 120 ms. There is no shot (today one fires at the 25 degree clamp), and the aim has turned by the orbit gain.
12. **Nudge buttons out of the resting thumb's zone.**
    - Change: move them beside the bottom corners or above the shooter. With fix 3 a step no longer jumps the shooter.
    - **Test:** `aimnudge.mjs` gets a check that the shooter moves less than 1 px per step, and that the button rects do not overlap the band from 45% to 55% of the height on the dominant side.

## Readings I chose (ambiguities)
- **"Move the aim with just my thumb"** I read as the one finger orbit, which is the only one finger aim gesture. The other reading, a drag from on the marble, is covered in 1d.
- **The phone viewport** I took as 412x839, a Pixel 9 in Chrome. I also ran 412x915 and 375x667, and the conclusions did not change.
- **The human flick spread** of 5-10 degrees and touch noise of 1-3 px are assumptions. Every mapping from them to the game's numbers is computed from the shipped code.

## Reproduce (node only, no browser, about 30 s in all)
`cd /tmp/claude-1000/-workspaces-lucid-winds/c614e34d-7999-40c8-ad65-9b1cec65bb8b/scratchpad/kp && node --import ./reg.mjs <script>`. The harness is `/tmp/claude-1000/-workspaces-lucid-winds/c614e34d-7999-40c8-ad65-9b1cec65bb8b/scratchpad/kp/harness.mjs`.

| script | what it shows |
|---|---|
| `s_place.mjs` | the place loop |
| `s_matrix.mjs` | the 96 case thumb matrix, written to `matrix.jsonl` |
| `s_wrap.mjs` | the +-180 wrap |
| `s_orbit.mjs` | the orbit pivot |
| `s_circle.mjs` | the circle sizes |
| `s_flick.mjs` and `s_flick2.mjs` | the power spread; `FPS=40` for the heavy frame case |
| `s_dwell.mjs` | resting before the lift |
| `s_dir.mjs` | direction |
| `s_settle.mjs` | the cone |
| `s_two.mjs` | the second finger and the reset bug |

`knuckle_ts.js` and `knuckle_peak.js` are scratch copies of `knuckle.js` with fixes 5 and 6 applied, for comparison only. Nothing in the repo was changed.

# KEEPSIES M3 BUILD PLAN (5 Nov 2026): THE VIEW, THE CIRCLE, THE AIM AND THE FLICK, from Stephen's verdict on round 2

The game is `satellites/keepsies/` (m1 and m2 LIVE 5 Nov, stamp 20261105b; KEEPSIES_BUILD_PLAN.md is how they were
built and its LAWS still hold, below). Run this plan in a FRESH session (CLAUDE.md: fresh chat sessions for major build
phases), alone, top to bottom. On this box: the node_modules symlink and KP_QUALITY=high. Three investigations measured
everything below in node with the shipped modules, no browser, nothing in the repo changed: INPUT.md (aim and flick),
VIEW.md (the camera) and ASTRA.md (round 2 against the code), with their scripts, in
/tmp/claude-1000/-workspaces-lucid-winds/c614e34d-7999-40c8-ad65-9b1cec65bb8b/scratchpad/kp/ (rerun any with
`node --import ./reg.mjs <script>` from that folder; harness.mjs runs the real knuckle.js, pullback.js, cameraCtl.js,
framing.js and the scene.js rig, and the unexported main.js and ringer.js handlers from their exact source). /tmp dies
with the box: step 0 copies them into the repo first.

## WHY: HIS WORDS, 5 NOV (verbatim)

"Second round I tried testing it. It's pretty bad. The view is terrible. I think the area is too large. The circle that
you have to hold and flick on is far too small. We need to make it like three times bigger. Doesn't have to be the size
of the marble. That's so stupid. The aiming is horrible. A lot of times when I go to move the aim with just my thumb it
freaks out and skips around the flick is terrible. All of it needs reworked"

He played the live build on his Pixel. What the code shows (412x839 and 412x915 CSS px; every number is the game's own):

- **The view.** At the ten foot opening the camera stands 1.72 m up and 2.2 m behind the shooter: a mib draws 7.2 px,
  the shooter 14.6 px; the 13 mibs and the shooter cover 0.18% of the screen, 69% of it is the inside of the ring and
  40% of its height is empty dirt. Seven foot barely helps because the sports framing always stands a fixed 1.9 m
  further back (`render.ringerCam.spanAdd`). At ten foot no camera gets past a 12 px mib while the whole 0.47 m cross must
  fit 412 px, so "the area is too large" is the ring (3.05 m, 190 mib widths) as much as the camera. During every shot
  the camera follows the rolling shooter: a median 234 degrees of turn a shot, up to 3880 degrees a second, the long way
  round whenever the shooter crosses the seam behind the cross (57% of shots).
- **The circle.** `tawOnScreen` (game/ringer.js:475 to 479) sets r = max(16, 1.35 x the drawn radius), grabR = 1.6 r. In
  a match the marble draws at 5.3 to 5.8 px radius, so the 16 px floor always wins: a 51 px circle, 13.5 mm on his
  screen. In calibration the close camera makes the same formula 92 to 100 px, so the gesture is taught on a circle
  nearly four times the size the match gives. Spin is read against the 16 px r (input/knuckle.js:182), so 61% of today's
  circle already counts as full spin. The grab test is written in four places (ringer.js:479, knuckle.js:219,
  pullback.js:44, main.js:1455).
- **The skipping.** Every turn starts in the place phase ("Drag to place your shooter"). The camera's listener registers
  before the placement's (main.js:197 and 200) and never rechecks the claim on later moves (input/cameraCtl.js:39 to 51),
  so one drag both orbits the camera and moves the shooter; and the placement reads that moving camera with a half turn
  added (main.js:1462, `setPlaceAngle(G.rig.state.azimuth + Math.PI + (frac - 0.5) * Math.PI * 1.4)`), so the shooter
  jumps to the far side of the ring and the camera chases it. A slow 60 px drag: 37 aim jumps over 10 degrees, the
  largest 42 degrees in one frame, the shooter off screen for 25 frames; a finger held still flips the shooter between
  180 and minus 148 degrees every frame. The same drag in the aim phase gives no jumps: that is why it is "a lot of times"
  and not always. Also: the camera angle wraps at plus or minus 180 degrees with nothing unwrapping it (core/framing.js:156
  to ringer.js:442 to render/scene.js:221; a 64 degree jump in one frame); the orbit turns about a point 0.76 m in front
  of the shooter (framing.js:160), so the shooter slides 3.3 to 3.6 px per px of thumb and leaves the screen after 67 to
  75 px; the orbit gain is 0.4 degrees a px (cameraCtl.js:50), so a 4 px wobble is more than the settled cone; a second
  finger turns the aim under a braced thumb (30 px of drift, 12 degrees). No test drives the place drag.
- **The flick.** Samples are stamped when handled, not with `ev.timeStamp` (knuckle.js:226, 248, 288): the same flick
  launches at 1.33 to 4.11 m/s at 60 fps and 1.33 to 6.00 at 40 (with `ev.timeStamp` the spread is zero), and
  calibration takes full strength from three of those readings. Power is the speed of the last 90 ms before the lift
  (knuckle.js:290): a hard flick that rests 30 ms loses half its power, resting 60 ms is cancelled 19 times in 24, a
  deliberate 160 px push over 220 ms is always cancelled. The flick's own direction steers the shot up to 25 degrees
  (`snap.fineAngleMaxDeg`): 5 degrees of thumb wander misses by 8 cm at 1.5 m, five mib widths. The cone settles only
  under 2 px of jitter (knuckle.js:273 to 276), so a real thumb stays at 6 degrees. `finish()` resets the gesture
  (knuckle.js:313) before it reads `secondFinger` and `outsideCanvas`, so the knuckle down cap and the slip never fire.
  `test/knuckle.mjs` feeds perfectly timed samples through `_feed`, so none of this can show in a gate.
- **Astra's round 2** (`/workspaces/keepsies-astra-round2/`, 159 files, outside git, vault release
  `astra-keepsies-round2-back-nov05`) answers a brief written before his verdict: nothing in it fixes the feel (no pad,
  no camera, no flick), and she never saw the game (WebGL failed in her browser), so her placement previews are
  schematic. Usable for the shot: B1 aim dash and cap, C6 calibration target, B8 chalk stroke, B9 horizon strip, A5
  tray, A6 reach circle. One export defect: `chalk_stroke.png` lost the SVG's three wear breaks.

## THE DESIGN (m3)

**The view: a smaller ring, a closer eye, a camera that holds still.**
- The default ring becomes FIVE FOOT (radius 0.762 m; DECISION 1) for quick play and the first games; seven, ten and
  thirteen foot stay on the Ring chip. The marbles keep their real 16 and 22 mm (DESIGN 21.1): only the chalk shrinks,
  the way kids draw it. At five foot the settled 1.5 degree cone about equals one mib's hit angle (at ten foot the mib
  allows half the cone): hitting what you aim at gets about twice as likely.
- The aim frame stands close and low behind the shooter and turns about the SHOOTER (VIEW.md Framing 3): at five foot
  28 degrees down through a 34 degree lens, 0.59 m from its look point: the shooter 76 px and the mibs 18 to 26 px on
  412x915 (58 px and 15 to 21 at 360x780), against 14.6 and 7.2 today. The near half of the cross fills the top band;
  the whole cross is no longer required in the aim frame. Ten foot under the same rule: shooter 38 px, mib 13 px.
- The camera never follows a shot: on the flick it holds the aim frame, then eases up and back over about half a second
  to a watch frame that shows the struck mibs and their side of the chalk. The turn change stays a cut.
- The whole ring is one held button away: LOOK (today's TOP DOWN refit) looks straight down on the whole ring, fitted to
  the screen's WIDTH between the names and the bottom chips. The same frame is the statues' placement and move view
  (Astra's A7 asks for it; today a third of the ring is off the sides at every size).

**The circle: three times bigger, and not the marble's.**
- A fixed hold circle 154 CSS px across (`snap.grabRadiusPx` 77 in tuning; today 51 x 3): grabR = max(77, the drawn
  radius + 12), which is 77 in every frame measured, calibration included (the marble draws 43 to 46 px there), so the
  gesture is taught on the circle the match uses. One function says it (`tawOnScreen`); every grab test reads `t.grabR`.
- It is drawn: a faint chalk ring at grabR round the shooter whenever the player may brace, so the circle is seen
  before the thumb lands; the reticle settles inside it.
- Spin is read against 0.6 of the circle (`snap.spinRadiusFrac`) with a dead zone under 0.2: near the middle is a centre
  ball, the edge of the spin ring is full spin.
- Nothing else sits in it: no button rect meets the circle at 412x915, 412x839 or 360x780.

**The aim: one owner per finger, and it never skips.**
- The place drag registers before the camera and is relative to where the finger went down (angle at down plus 0.006
  rad per px, along the NEAR edge: drag right and the shooter goes right), never reads the camera's azimuth, no half
  turn; the camera's facing is frozen while it is live and eases behind the shooter after the lift (DECISION 4).
- The camera's wanted angle is unwrapped to the nearest equivalent of its current one; the aim azimuth is normalised to
  plus or minus 180 degrees where it is handed to the shot.
- The orbit turns about the shooter at half today's gain (0.0035 rad, 0.2 degrees, per px): the shooter stays where it
  is on the screen and the aim is straight up the screen from your marble. The fine aim buttons turn about it too.
- While braced, the brace owns every finger: a second finger is the knuckle down, never an orbit.
- Inside the circle, a motion more than 45 degrees off the aim line turns the aim like a dial; only a forward flick
  shoots. The aim line shows for the whole aim phase, from the circle's edge to where the shot points, not only braced.
- The fine aim buttons leave the resting thumb's band.

**The flick: what the thumb did is what the marble does.**
- Every sample carries its own `ev.timeStamp` (now() only when it is 0 or a second away); the same flick gives the same
  power at any frame rate and frame phase.
- Power is the fastest 30 to 50 ms of the flick between motion onset and the lift; direction and curve come from the
  same stretch; `cancelBelow` and `thumbSpeedMin` re-derived in those terms, so a rest before the lift and a slow push
  are legal soft shots.
- The aim line is the aim: the flick's own angle no longer steers (`fineAngleMaxDeg` 25 to 0, DECISION 2); its wobble
  feeds the wildness only (knuckle.js:327).
- The cone settles for a real thumb: graded by jitter, 2 px of noise settled inside 2 s; the spike moves from 8 to 12 px.
- `finish()` reads `secondFinger` and `outsideCanvas` before the reset: the knuckle down cap and the slip work as
  designed.
- The saved calibration gets a version: maxes taken with the old estimator are measured again once (law 5).

**Astra's round 2, wired where it fits.** The shot first: B1 (the aim dash as a CSS mask over brass, the cap at the
true end point, never stretched), C6 (the calibration target at the aim line's end, 0.5 m ahead with the calibration
camera, never in the chalk group, which calibration hides). Then the ring: B8 (the chalk as a strip mesh from her SVG,
an integer repeat count per ring size, rebuilt per size), B9 (the horizon as WebP 2048x256 cropped at row 440, in a
bearing window, only where a frame shows the far chalk). Then the statues in the whole ring view: A5 tray and tiles,
A6 footprints, Not here chip, reach circle and origin mark, A3 owner bars and the 12 px badge. Then the plates: B2
chip, B3 tier frames, B4 level up strip, B5 pot cloth, B6 heirloom cloth, B7 dark shadow and lift, B10 open pouches,
B11 share cards; the 15 D icons and the two owner marks into the one sprite; E to assets/store/. The C screens (title,
level up, chores, clay pool, case) wait (DECISION 7).

## THE LAWS

KEEPSIES_BUILD_PLAN.md's LAWS 1 and 3 to 10 hold word for word (code directly and alone; never push main or deploy,
push add-sproing-jumper after every step, the deploy is one script for his line; nothing in src/core/ calls a
transcendental (core/dmath.js) and the sim reads no art, camera or clock; a saved shape changes only with a version,
stamp before a deploy; the copy law, 48 px targets with labels, never by colour alone; the art budget; one line notes
in STATE and START-HERE, HANDOFF.md's "Where we are" at the end; scope is this plan; the box's 12 hour life, stop 40
minutes before with START-HERE written). Their law 2 is replaced by law 11. Added for m3:

11. THE TESTING LAW. ONE NODE CHECK PER STEP: the step's own test, written FIRST in the shape of the investigation's
    harness (the shipped modules; touch delivered as Chrome on Android delivers it, pointer events with `timeStamp` and
    coalesced lists; 412x839, 412x915 and 360x780), watched FAIL on today's code with the number the investigation
    measured, then PASS; a new test joins GATES in tools/check.js as a pure node gate (CI runs `tools/check.js` with no
    browser on every push of this branch, and a red push emails Stephen). `node tools/check.js --fast` green BEFORE EVERY
    PUSH. ONE BROWSER LOOK PER VISUAL STEP, PROVED NUMERICALLY: one puppeteer probe through `window.KEEPSIES_DEV` that
    prints and asserts sizes and positions (the circle's rect, the shooter's screen point, the camera's turn per frame,
    element rects against the HUD bands); no image is opened. The full check ONCE at the end (step 12), detached
    (`setsid nohup`, never beside a browser). Never rerun a green.
12. One browser at a time, and none while another workflow's browser runs: `pgrep -f tmperf` (and any chrome) empty
    before a browser step, else sleep 30 and retry.
13. Bash for everything: read with cat, sed -n and grep; edit with python3 or node scripts and heredocs; never the Read,
    Edit or Write tools and never open an image (each one raises a permission prompt on his screen; he has asked five
    times tonight for none). The contact sheet law from m1 stands if a step touches the marbles' material or light
    (m3 should not): its marbles are measured by a script, a plain sphere has near zero texture spread.
14. One owner per finger. Every pointer belongs to exactly one of statue move, placement, knuckle, pullback and camera,
    registered in that order, and every handler rechecks the claim on every move, not only on the down. Gesture times
    are `ev.timeStamp`. Nothing places the shooter from the camera's current azimuth.
15. The circle is a CSS px constant from tuning, the same in calibration and the match; nothing derives a grab radius
    from the marble's drawn size alone again.
16. Steps 1 to 8 change input and camera only: every sim scenario and replay hash stays byte identical (core/snap.js
    reads `coneWideDeg`, `coneTightDeg`, `launchMin`, `launchMax` and `powerEaseSixteenths`; those stay as they are).
    Step 9 (the five foot ring) is the one step allowed to add scenarios and retune; it writes the old and new hashes in
    its STATE line.

## STATE (the builder updates this block; one line per step)

| Step | State | Commit | Note |
|---|---|---|---|
| 0 | done 6 Nov | (this commit) | docs/m3 holds INPUT, VIEW, ASTRA, the harness (reg.mjs now finds hooks.mjs beside it; knuckle_ts.js and knuckle_peak.js added, harness.mjs imports them) and the scripts; fast check green on the baseline; main 8187f3a32, its keepsies tree c0b040670951, stamp 20261105b |
| 1 |  |  |  |
| 2 |  |  |  |
| 3 |  |  |  |
| 4 |  |  |  |
| 5 |  |  |  |
| 6 |  |  |  |
| 7 |  |  |  |
| 8 |  |  |  |
| 9 |  |  |  |
| 10 |  |  |  |
| 11 |  |  |  |
| 12 |  |  |  |

## THE STEPS (in order; each ends green on its own test and the fast check, committed and pushed)

TONIGHT marks the steps the builder may take tonight: the investigation proved the cause, the fix holds no design call,
and each has its test. Steps 5 on wait for a fresh session and build at the DECISIONS' defaults unless he has answered.

**Step 0. Baseline (TONIGHT; 15 min).** Copy INPUT.md, VIEW.md, ASTRA.md, harness.mjs, reg.mjs, hooks.mjs and the
s_*.mjs, motion*.mjs, props.mjs, viewnum.mjs, solve.mjs, cst2.mjs (DECISION 1's ten foot camera numbers) and
scripts/ from the scratch folder above into
`satellites/keepsies/docs/m3/` (docs never ship; reg.mjs names hooks.mjs by its /tmp path, point it at the copy). Fast check green; note main's keepsies tree and the stamp in STATE.
Test: none. Check: `node tools/check.js --fast`.

**Step 1. The place drag, one owner per finger (TONIGHT; S).** `attachPlacement` moves to `src/input/placement.js` and
registers before `attachCameraControls` (main.js:196 to 200); `cameraCtl.onMove` drops any pointer `isClaimed` says is
taken; the drag is relative (angle at down plus (x minus x at down) x 0.006 along the near edge), never reads
`rig.state.azimuth`, no `+ Math.PI`; the camera's facing frozen while the drag is live, easing behind the shooter
after the lift; the brace exclusion
(main.js:1455) reads `t.grabR`. While braced `isClaimed` is true for every pointer (main.js:198). Test:
`test/placement.mjs` (new node gate, PLACEMENT OK): a 60 px drag over 500 ms in the place phase at 412x839: no aim change
over 3 degrees in any frame, the shooter never off screen, its ring angle moves one way only and its screen x the
finger's way, userAz stays 0, the first move does not jump, a still finger moves nothing (today 37 jumps, 42.4 degrees,
25 frames off screen); brace, then a second finger drifts 30 px: the aim moves under 0.1 degrees (today 12.0). Check:
fast. Browser look: none (nothing drawn changes).

**Step 2. The seam and the pivot (TONIGHT; S; the camera constant).** `frameFor` takes the current azimuth and returns
the nearest equivalent of the wanted one (dmath, law 4), handed on by ringer.js:442; the aim azimuth normalised where
the shot takes it. The orbit turns about the shooter: framing.js:160 turns the look offset with the player's orbit
(tx = tawX - L sin(autoAz + ua) biasUser, tz = tawZ - L cos(autoAz + ua) biasUser, L the shooter to centroid distance),
and the gain halves from 0.007 to 0.0035 rad per px (cameraCtl.js:50 and 51, named in tuning as
`render.orbitRadPerPx`). Test: `test/camera.mjs` gains: the shooter walked from 170 to 190 degrees at 0.5 degrees a
frame never steps the camera over 2 degrees in a frame (today 64.3); for userAz minus 60 to 60 degrees in 5 degree
steps the shooter projects within 0.02 of a half width of centre at the userAz 0 height (today off screen past 27 to
30 degrees); a 100 px drag turns the aim 20 plus or minus 0.5 degrees; a 2 degree nudge moves the shooter under 1 px
(today 16). Check: fast. Browser look: the probe at 412x839 orbits 60 px each way from the ten foot opening and prints
the shooter's screen point each frame (moves under 2 px).

**Step 3. The circle, three times, not the marble's (TONIGHT; S).** Tuning `snap.grabRadiusPx` 77,
`snap.spinRadiusFrac` 0.6, `snap.spinDeadZone` 0.2; `tawOnScreen` returns grabR = max(grabRadiusPx, drawn radius + 12)
and spinR = 0.6 grabR; knuckle.js:182 divides by spinR with the dead zone; knuckle.js:219, pullback.js:44 and
main.js:1455 read `t.grabR` (the `r * 1.6` fallbacks go); the reticle (main.js:1589) and the aim line's start (1678)
scale from grabR; a faint chalk ring (DOM, like the reticle, pointer-events none) at grabR round the shooter whenever
the player may brace; a release more than 45 degrees off the aim line's forward is a cancel, never a shot (the dial is
step 7; with Bombing on, the flick down past 40 px keeps its meaning), because the bigger circle would otherwise turn sideways aim drags into 25 degree shots. Test: `test/circle.mjs`
(new node gate, CIRCLE OK): grabR is 77 at 412x839 and 360x780 in every frame (full cross, 3 mibs, 1 mib,
calibration, top down); a pointerdown 70 px from the shooter's centre braces and the camera never gets it; a touch 30 px
below reads contactOffset.y between minus 0.3 and minus 0.7 (not minus 1) and 8 px off reads 0; thumb on the marble,
300 px sideways in 120 ms fires no shot. `test/knuckle.mjs` (browser gate): "48 across" becomes "154 across". Check:
fast. Browser look: at 412x915, 412x839 and 360x780, in calibration, the ten foot opening and one mib left, the probe
prints the chalk ring's rect (154 plus or minus 2 px), its centre on the shooter's projection (within 2 px) and its
clearance from #corners, #houseRules, #aimNudge, #scopeBtn and the names band. A nudge button inside the circle moves
to the nearest side edge clear of it (its home is settled in step 7).

**Step 4. The camera holds while a shot plays (TONIGHT; S).** `frameShot` (ringer.js) returns without re-framing while
the shot simulates, unless it is the turn's cut, so the node gate runs the shipped code (main.js:2141 to 2148 calls it
every frame; TOP DOWN and the statues' view set absolute values after it, so nothing accumulates). The watch frame
is step 8; this step only stops the follow. Test: `test/camwatch.mjs` (new node gate, CAMWATCH
OK) from the investigation's motion2.mjs: Rookie against Rookie, real Rapier, the real frameShot and smoothing at 60
fps, one match at ten foot and one at seven: while any shot plays the camera turns under 2 degrees, and no frame in the
match goes the long way round the seam (today a median 234 degrees a shot, 3880 degrees a second, 57% the long way).
Check: fast. Browser look: one break at 412x915 through KEEPSIES_DEV, the rig's azimuth printed every frame from the
flick to rest (largest step under 0.5 degrees, total under 2).

**Step 5. Astra's round 2 in (S).** `tools/astra_in.mjs` gains a round 2 pass that runs after v1 (the sprite is rebuilt
from v1 at /workspaces/keepsies-astra-v1/pack on every run): the 15 D icons and owner_you and owner_dusty into the
sprite as `i-<name>`; runtime files into assets/env and assets/ui under law 7 (horizon_strip as WebP 2048x256 cropped
at row 440, about 122 KB; the chalk stroke from its 19.8 KB SVG, since the PNG lost the wear breaks; pouch_*_open as
WebP 320 with the mouths halved; share_match beside the v1 card it replaces, the same exception; one allowed and one
blocked footprint, since her eight files are two drawings; the tray, tiles, Not here chip, move_reach, move_origin,
aim_dash, aim_cap, calibration_target and hint, player chip, tier pills and tiles, level up strip, pot cloth, heirloom
cloth, shadow_dark, the contact lift, the cross and lag line); her anchors for those files into
`src/data/astra_r2.json`; statues_store_frame to assets/store/; never the previews, boards or Meshy references. Nothing
wired yet. Test: `node tools/astra_in.mjs --check` (new node gate, ASTRA IN OK): every output in assets/ exists, under
1600 px a side (store excepted) and its byte cap, the sprite holds all 49 old ids plus the 17 new; it never reads the
pack, so CI can run it. Check: fast. Browser look: none.

**Step 6. The flick (M).** Samples stamped with `ev.timeStamp` at knuckle.js:226, 248 and 288 (now() when it is 0 or a
second away); power from the fastest 30 to 50 ms between onset and the lift (knuckle.js:98 to 105 and 290), direction
and curvature from the same stretch, `cancelBelow` and `thumbSpeedMin` re-derived (calibration reads `cancelBelow` too,
meta/onboarding.js:51 and 64); the cone graded by jitter
(rate = clamp((4 - j) / 2, 0, 1) / settleSeconds), the spike at 12 px (knuckle.js:273 to 276); `finish()` copies
`secondFinger` and `outsideCanvas` before `reset()`; the calibration record gains `v: 2` (meta/onboarding.js:80 to 83,
meta/save.js): a v1 max is measured again once, the next time calibration would run. Test: `test/flick.mjs` (new node
gate, FLICK OK; the shipped knuckle.js through real pointer events with coalesced lists, no `_feed`): the same flick at
24 frame phases at 40, 60 and 120 fps gives power01 within 0.02 (today 0.12 to 0.56 at 60 and 0.12 to 1.00 at 40); a
hard flick resting 0, 30, 60, 100 or 200 ms before the lift gives the same power within 0.05 (today 0.63 to 0.77, 0.35,
19 of 24 cancelled, 24 of 24); a 160 px push over 220 ms is a soft legal shot; 2 px a axis of noise settles inside 2.0 s
and 3 px inside 3.0, a 15 px jump still costs half; a last move off the canvas is a slip; a second finger caps power at
0.9 and sets knuckledDown; a 2 s hold reads its spin from where the thumb landed. `test/onboarding.mjs`: a v1
calibration is measured again, a v2 kept, no key lost. `test/knuckle.mjs` dispatches real pointer events through the
module. Check: fast. Browser look: calibration at 412x839 by real touches (puppeteer's touchscreen): three flicks of
one speed at three frame phases record maxes within 5% (printed).

**Step 7. The aim line is the aim (M; DECISION 2).** `snap.fineAngleMaxDeg` 0 (the wobble feeds the wildness at
knuckle.js:327; pullback.js:96 reads the same cap and follows); inside the circle a motion more than 45 degrees off the aim line turns the aim like a dial at the
orbit gain (step 3's cancel becomes the dial; Bombing's flick down stays a bomb); the aim line for the whole aim phase from the circle's edge to the scope
mib, drawn with Astra's B1 dash (a CSS mask over brass: her tile is square, so the strip's height is the dash period; a
24 px strip inks 1.8 px) and her cap at the true end point; C6 calibration target on the aim ray 0.5 m ahead (her 1 m
lands as a sliver under the heading with the calibration camera), outside the chalk group; the nudge buttons out of the
resting thumb's band (beside the bottom corners) and a line in docs/DECISIONS.md that DESIGN 7.7's "plus or minus the
snap's fine angle" is set to zero pending his call. Test: `test/flick.mjs` gains: a flick 10 degrees off vertical fires
within 0.5 degrees of the aim line (today 6.24); thumb on the marble, 300 px sideways in 120 ms fires no shot and turns
the aim by the orbit gain. `test/aimnudge.mjs` (browser gate): the shooter moves under 1 px a step, no nudge rect meets
the band from 45 to 55% of the height on the dominant side. Check: fast. Browser look: the cap's rect centre within
3 px of the projected scope target at three aims, the line present before the brace, the calibration target's rect on
screen under the heading.

**Step 8. Aim close, the watch frame, LOOK (M).** framing.js gains the aim close frame (VIEW.md Framing 3; one table in
`render.ringerCam` keyed by ring: five foot 28 degrees and a 34 degree lens, four foot 30 and 36, ten foot 24 and 24;
the fit holds the shooter where its circle clears the bottom chips and the near half of the cross under the names);
the watch frame (after step 4's hold: ease up and back over 0.5 s to show the struck mibs and their chalk; a tap skips
it); LOOK, a held button replacing TOP DOWN: straight down, the chalk plus 5 cm fitted to the width minus 16 px between
the names and the bottom chips; the statues' placement and move view uses the same fit (main.js:2155 to 2165). The
skyline band (main.js:1479) only where a frame shows the far chalk, never over a live mib; spyglass re-picked for the
bigger mibs (openBelowPx 14 would almost never open). camera.mjs blocks 1 and 1b (the sports framing "unchanged")
retire on purpose, with a line in docs/DECISIONS.md. Test: camera.mjs: at 412x915 and 360x780 the aim frame draws the
shooter at least 38 px and the centre mib at least 13 px at ten foot (at least 70 and 20 at five foot), the circle
clears the bottom chips, the far arm stays under the names, the shooter moves under 1 px under any orbit or nudge, LOOK
fits the chalk inside the width minus 16 px; camwatch.mjs: the watch frame turns under 5 degrees a shot. Check: fast.
Browser look: the probe prints the shooter and centre mib px, the circle rect and the HUD clearances at both sizes for
five and ten foot, and the frame time at KP_QUALITY=high within 10% of before.

**Step 9. The five foot ring (M; DECISION 1).** `ringSizeRadius['5ft']` 0.762 and RING_FT (ringer.js:35); the default
`ringSizeFt` 5 (core/rules-ringer.js:23, main.js:63) and the onboarding beats (main.js:1070); the Ring chip cycles
five, seven, ten and thirteen (main.js:77) with the word Five foot; the Arena keeps its own ten foot radius
(game/arena.js:44 names '10ft'); break speed, launch range and pocketing balance retuned at five foot by the harness;
the Ringer AI's fixed aim error (5, 1.5, 0.8 degrees) re-derived from a hit rate, as the Arena AI does; the statues'
clearances, grid and reach scale with the ring (core/statues.js FOOT, GRID, MOVE_MAX by R / 1.525) so five foot keeps at
least 36 legal spots (seven foot's count today; the unscaled rule leaves 4). Test: a new sim scenario `ringer_five` (a
five foot match completes; the break knocks out at least one mib in most seeds), `ringer_statues` at five foot (36 or
more legal spots, the Loaf still blocks, the Arch still passes), `test/arena.mjs` unchanged and green, `test/ringer_ai.mjs`
(slow) once, detached, at five foot with its ladder floor; old ten foot scenario hashes unchanged, new ones written in
STATE (law 16). Check: fast. Browser look: the five foot opening at 412x915 and 360x780: the probe prints the shooter,
mib and circle sizes against step 8's floors.

**Step 10. The statues on the new view, with Astra's A pieces (M).** A5: the tray on her plate (375x190 CSS, nine slice
32), tiles of 56 CSS px with icon and word (attachStatues, main.js:1345), Undo and Confirm in her bands; A6: her
footprint decals toggled by markGhost in place of the RingGeometry footprint and the red segments, the Not here chip
above the finger toward the free side with a short leader, move_reach and move_origin at the old spot until Confirm or
Undo; A3: one chalk bar for you and two for an opponent on the top and front faces (anchors' owner decal placements),
and the 12 px badge above each statue in the whole ring view, placed with `G.rig.project` like #stNot. Test:
`ringer_statues` unchanged and green; `tools/frontdoor.mjs ... more` (browser, real touches: two placements and a move
land where the finger lifts). Check: fast. Browser look: the probe prints the ring rect inside the width minus 16 px and
above the tray's top, every badge within 20 px above its statue's projection, the tray 190 px tall, the chip clear of
the finger.

**Step 11. The plates (M).** B2 chip (pips on her centres, `.sock`), B3 tier frames (border 32, the mark its own
`ic(tier)` at top centre, pill labels 14 px), B4 level up strip on the result card, B5 pot cloth (40 px border image,
five stake slots), B6 heirloom cloth (her resting places, canvases 200), B7 dark shadow and lift (pouch, lift, shadow,
render), B8 chalk strip mesh per ring size (repeats 2, 3, 4 and 5 for five, seven, ten and thirteen foot; arenaEnv.js
stops scaling the ring decal by k), B9 horizon in a bearing window, B10 open pouches (POUCH_MOUTH from her anchors,
main.js:786; #poMouth canvas 240), B11 share cards (render/share.js on her windows: the marble card's render window, the
match card's one window and three pot renders). Test: `test/plates.mjs` (new node gate, PLATES OK): every number the
code uses for a plate (POUCH_MOUTH, pip centres, tier mark centre, share windows, chalk repeats) equals her anchors in
`src/data/astra_r2.json`. Check: fast. Browser look: the pouch reveal, the result card and both share cards: the probe
prints each live render's rect inside her window (within 2 px).

**Step 12. The feel gate, the walk, the stamp, the deploy script (M).** `tools/frontdoor.mjs` extended with real touches
through the new input: a place drag, an orbit, a brace on the circle's edge, a forward flick, a dial turn, the hold and
watch, LOOK; it asserts the shooter never jumps over 3 degrees and the shot leaves within 0.5 degrees of the aim line.
The walk at 412x915, 412x839, 360x780 and 360x640 (Chrome's bar showing) with the worst angles on purpose (a thumb
resting still for 3 s in the place phase, the shooter across the seam behind the cross, one mib left at five foot on
the 360 phone, calibration on the short screen, a second finger during the brace), every screen proved by the probe's
numbers. The full check once, detached. Stamp (`node tools/stamp.mjs --bump <date>a`). The deploy script
`/home/codespace/kp-drafts/deploy-keepsies-m3.sh` on the m2 template (it carries m1 to m3), DRY=1 once; his line in
START-HERE; HANDOFF.md's "Where we are". Then the Astra round 3 brief in docs/briefs/keepsies/round3/ with its own
KICKOFF-PROMPT.txt (a hold circle and reticle drawn at 154 px, the shot and statue screens captured on this build, the
materials as a zip, not a Drive link that asks for a sign in).

## DECISIONS for Stephen (built as written until he says otherwise)

1. **The ring.** Default: five foot for quick play and the first games; seven, ten and thirteen stay on the Ring chip,
   the statue clearances scale with the ring. The other readings, measured: four foot (aim close: shooter 87 px, centre
   mib 25.5 px); seven foot as the default (shooter 34.5 px, mib 14.0); ten foot kept with only a camera change (26
   degrees down, a 20 degree lens, the fit at every count: shooter 23.5 px, mib 10.9 px at 412x915, 1.5x to 1.6x today,
   the skyline band lost in play). DESIGN 8.3's ring sizes and the ten foot default are his.
2. **The flick's own direction.** Default 0: the aim line is the aim and the flick's wobble only feeds the wildness.
   The other choice: about 3 degrees, the flick's angle scaled by 0.25. DESIGN 7.7 says plus or minus the snap's fine
   angle (today 25).
3. **The circle.** 154 px across, fixed, built tonight (his "like three times bigger"; today 51). A different size is
   one tuning line, `snap.grabRadiusPx`.
4. **The place phase.** Default: a relative drag along the near edge with the camera still. The other choice: no place
   drag, the shooter starts on the chalk on the lag line's side and the dial alone aims.
5. **The camera during a shot.** Default: hold, then the watch frame; DESIGN 8.5's "brief low follow on hard snaps,
   skippable" retired. He may want the low follow back for hard snaps once the hold ships.
6. **The skyline.** Default: Astra's lot band shows only in frames that reach the far chalk (the watch frame, the
   statues' view); the aim close frame is dirt and the cross. The other choice: a sky band in every frame, paid for in
   marble size.
7. **Astra's round 2 open calls** (ASTRA.md 4.2). The statues' look: her four code shapes in weathered limestone
   (default) or four expansion figures (Boba Buddy, Void Loaf, Book Wyrm as two book piers and a spine, Moon Moo);
   ownership: one chalk bar for you, two for any opponent, a 12 px badge in the whole ring view (default yes);
   envelopes: keep the colliders (default) or approve new ones so Meshy can make solid sculpts (the column's 8 mm base
   and the orb's 10 mm plinth are under the 12 mm minimum); Meshy: his paid lane, none run; the title: her layout drops
   "Thirteen marbles in a cross..." (default drop); the four new screens (level up, chores, clay pool, the case): after
   this plan (default; chores needs a chore system first); the match share card: her one window and three pot renders
   (default yes); round 3 for Astra: yes, after step 12.

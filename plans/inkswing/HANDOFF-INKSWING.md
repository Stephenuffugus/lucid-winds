# HANDOFF INKSWING, the build plan for one Opus night

**Written:** 2026-09-05 evening, by Fable, from
`docs/handoffs-uploaded/six-more-20260905/6morehandoffs/HANDOFF-INKSWING.md` (Stephen's design, read in full) plus the fleet
on branch `add-sproing-jumper` tonight.
**Reads before this one:** `HANDOFF-OPUS-NIGHT-SEP05.md` (the spine), then `plans/fathom/HANDOFF-FATHOM.md` sections 0, 2, 9,
14 and 15, then this file, then the design. Where they differ, this file wins; every difference is in section 3.
**Game folder:** `satellites/inkswing/` (slug free, checked 2026-09-05). **Live URL when Fable lists it:**
`lucidwinds.com/satellites/inkswing/`.

---

## SESSION STATE (the builder updates this at the end of every session; the morning reader starts here)

- 2026-09-05 Fable: plan written. Nothing built.
- 2026-09-06 builder (14:20 to 14:35 UTC, after Whistlestop, shared tree): **The Double Link was NOT built.** Read section 5 P3 step 4, 3.6, section 15 and the model (`posAt`, `flingToThrow`, `traceOf`, `RIGS.double` with `numeric: 1`, unlockAt 12 already listed and locked on the rig screen). Sized it at about an hour of careful work and the window had a quarter of that, so nothing half built was committed: no stamp bump, no gate touched, the seven gates stand as Opus left them. What the next session builds, in order: (1) in the SIM block a fixed step 240 Hz semi implicit Euler for two coupled damped links (link 2 hangs from link 1, pen = link 1 plus link 2 on both axes, link 1 restoring w1 from `lengths[0]`, link 2 restoring w2 from `lengths[1]` about link 1, damping from the bob) with the trajectory cached per throw list so `posAt` stays a lookup with linear interpolation and `traceOf` needs no change; (2) `suiteDouble` in `sim.js --test`: energy never rises with no throw, the same sheet twice gives the same trace (determinism), a single link limit (link 2 length 0) matches the closed form single inside 0.05 U over 20 s, the pen never leaves the sheet; each watched to fail; (3) `flingToThrow` for the numeric rig stores the release position and velocity rather than amplitude and phase; (4) `docs/shots/p3-double.png` at 412x915, opened; (5) stamp to the day's letter in all three places. Nothing depends on it.
- 2026-09-06 Opus: **P0, P1 AND P2 ARE DONE.** Five gates green: `sim` (84
  assertions), `lint`, `fling`, `sound`, `layout`. Every assertion watched to
  fail, and two of the sound ones were rewritten because they passed with the
  code under them deleted. The four rigs, the note labels and the interval line,
  the bob choice, the hum, the paper whisper and the rip.
  ⛔ One finding is a Director call and it is in the morning report: the sliders
  are equal tempered, so nothing ever closes exactly.
- 2026-09-06 Opus (after the codespace closed mid phase): **P3 IS DONE, and the
  whole plan with it.** The codespace was closed during P3 step 1 and the work
  in the tree was uncommitted; nothing was lost, it was green, and it is
  committed as `cc432ee8`. Seven gates now: `sim` (87), `lint`, `fling` (31),
  `sound` (17), `share` (19), `poster` (16), `layout` (69).
  Sand, the poster at print size, the share link and the daily ratio, the tile,
  `docs/ART_ASSETS.md` and `docs/BUILD-NOTES.md`.
  ⛔⛔ The layout gate's most important assertion had never been able to fail.
  Found by opening a screenshot. It is in the morning report in section 15 and
  it is the single most useful thing this phase produced.
  P3 step 4, the Double Link, is NOT built: it was conditional in the plan on
  steps 1 to 3 landing early and they did not.
  **Next action: none. The plan is finished.** Fable reviews it per the spine
  section 6.
- 2026-09-06 builder (14:28 to 15:20 UTC, shared tree, Fable deploys): **P3 STEP
  4, THE DOUBLE LINK, IS BUILT.** Stamp `20260906d` in three places. `sim`
  99 assertions (was 87), `fling` 38 (was 31), `tools/check.js` ALL GATES
  PASSED at 14:49 UTC. Commits `eb58664e` (the model and suiteDouble),
  `ae1d3a6e` (the rig opens, a real fling on it draws ink), `5a3661b9` (drawn
  as a chain, thrown from the chain's rest shape, stamp, docs), and the shots
  and this entry after. In the SIM block: two coupled damped links, linearised,
  fixed 240 Hz step, one Float64 trajectory per throw cached by the throw's
  numbers, `posAt` a lookup with linear interpolation, `traceOf` unchanged.
  ⛔ **Runge Kutta, not the semi implicit Euler this entry's predecessor named**:
  measured with the plan's own limit assertion, symplectic Euler at 240 Hz
  misses the closed form single by 3.0 units at C4 and 6.8 at C5 (its w h / 2
  amplitude wobble); the assertion allows 0.05. Fourth order lands inside
  0.002. The four assertions of the plan each watched to fail (damping sign
  flipped, an unseeded die in the step, the detune dropped, the reach scale
  dropped), plus the symplectic Euler run above as a fifth. `flingToThrow` on
  the numeric rig keeps `rel` (release position and velocity); its `pend` terms
  are both link 1 so the link and the hum still work, link 2 takes its note
  from `lengths[1]`, and `releaseOf` derives the release for a throw that came
  in over a link (inside 1.5 units). ⛔ Two things found by OPENING the shot,
  both fixed: started with both links straight along the pull the rig drew the
  Single's ellipses with a wobble nobody could see, so the release now puts the
  chain in its rest shape under a sideways pull (first bob at
  w2^2 / (w2^2 + 2 w1^2) of the pull); and the rig was drawn as one rod, so it
  is a chain now with the knuckle at the first bob. The rig list re counts the
  folio when the rig screen is opened (it was stale for a folio filled any way
  but the keep button). **Thin:** the shot's throw is moderate and the drawing
  sits small around the bob; a harder thumb throw fills the sheet (the reach
  scale only scales down). The chain's side view is a picture, not a
  projection: the knuckle's x is the model's, its height is the links' share
  of the rod. Every new assertion watched to fail, the fling gate's last two
  by mutating the page and running the gate (ledger, section 13).
  **Next action:** Fable reviews per the spine section 6 and deploys; Stephen's
  thumb on the Double Link (keep 12 first, or push 12 into the folio from the
  dev console), and his call on whether the second link should be visibly
  wilder (a lighter second bob, k below 1, is one number in CONFIG).

---

## 0. RULES OF ENGAGEMENT

As `plans/fathom/HANDOFF-FATHOM.md` section 0 with `inkswing` for `fathom`. One law particular to Inkswing: **the drawing
is its throw list.** A sheet is never stored as pixels except as a cache; the throws (rig, lengths, inks, release states)
regenerate it exactly, on any phone, which is what the share link and the folio rely on.

---

## 1. WHAT INKSWING IS, AND WHY IT IS WORTH A NIGHT

From the design: *"A brass pendulum hangs over a sheet of cream paper. Grab the bob and throw it, the arc of your fling
becomes the swing, and a pen beneath it begins to draw: loops tightening into rosettes, figure eights collapsing inward as
the pendulum slowly loses its breath. Release again in a second ink and the curves interleave. And because pendulum
frequency ratios are musical intervals, your drawing has a chord."* Positioning line: **"Throw the pendulum. Keep the
drawing."**

Why it is worth a night: the maths is closed form and fits on a page, which makes it the safest build in the second six;
every digital harmonograph is a slider panel, and the gesture, the layering, the sound and the keepsake are all unclaimed.
The feel gate (one thrown ellipse decaying into a spiral) is reachable in the first two hours.

---

## 2. STATE OF THE INHERITANCE (verified by Fable 2026-09-05; trust this over any doc)

| Need | Copy from | What to take |
|---|---|---|
| Poster export at print size, three layouts, credit line | `plans/asterism/HANDOFF-ASTERISM.md` section 4, POSTER, and `satellites/attic/index.html` lines 1446 to 1466 | 2048x2560 canvas, `toBlob`, `File`, `canShare({files})`, the download fallback |
| Share by link | `satellites/blockspace/index.html` lines 1060 to 1080 | `b64u`, `copyLink`, `importFromHash`. Inkswing uses `#s=` |
| Sonification voices, master chain, the plate | `satellites/blockspace/index.html` lines 833 to 838; `plans/swell/HANDOFF-SWELL.md` section 4 SYNTH (the master) | One sine per axis through the master; the plate at wet 0.1 for the paper whisper |
| Tilt permission and handling | `plans/swell/HANDOFF-SWELL.md` sections 2 and 3.8 (`index.html` at the repo root uses `DeviceOrientationEvent`, `requestPermission` on iOS from a tap) | Only for sand mode's tilt to erase; behind a toggle; never on boot |
| Multi pointer, grab and drag | `satellites/abduct-a-chameleon/index.html` `pointers` Map, `blur` at 1264 | One pointer grabs the bob; a second is ignored while the first is live |
| Scaffold, RNG, page tests, `sim.js`, `sw.js`, manifest, icons, portal protocol, music hook, gate runner, browser gate shape, thumb and icon tools | `plans/fathom/HANDOFF-FATHOM.md` section 2 | Same files, `inkswing` in place of `fathom` |
| Headless audio gate | `satellites/keepsies/test/audio_budget.mjs` | `OfflineAudioContext` render under the autoplay flag |

Not inherited: any physics library (closed form), three.js.

---

## 3. CORRECTIONS TO THE DESIGN (binding; each forced by a measurement or a fleet law)

3.1 **Studio and deploy.** Sky Wolf Studio. Hostinger from `main`, pushed by Fable.

3.2 **Sonification on by default at low volume.** The design recommends it; taken. Gain 0.04 per axis, a toggle in
Settings, and it mutes under the fleet's music preference if the portal is playing (Inkswing does not post `game-music`;
its hum is not music).

3.3 **Tilt to erase is sand only.** The design recommends it; taken. Ink is permanent; the material contrast is the point.

3.4 **The fling is mapped exactly, not by taste.** A pendulum axis with angular frequency `w` released at displacement
`x0` with velocity `v0` has `A = sqrt(x0^2 + (v0 / w)^2)` and `phi = atan2(x0 * w, v0)`. The grab point and the release
velocity (the last 60 ms of the drag, in sheet units) give `x0` and `v0` per axis. Wilder throws are wilder art because the
maths says so; nothing is scaled by feel except the sheet units per pixel.

3.5 **Amplitude detune is the real pendulum formula.** `w_eff = w * (1 - A^2 / (16 L^2))` with `A` in sheet units and `L`
the rig's length in the same units; hard throws precess more, as the design wants, from physics rather than a fudge.

3.6 **The double link rig is a stretch, integrated numerically, and deterministic.** Rigs 1 to 3 are closed form. Rig 4
integrates at 240 Hz with a fixed step and the seeded stream, only if P3 lands before 03:00. Logged in DECISIONS.

3.7 **Rendering accumulates on an offscreen sheet at 2x DPR, never re rendered from history per frame.** Layers are
separate offscreen canvases so undo is a discard. "Let it finish" draws the rest of the closed form curve over 2 s of
animation with the whoosh; it never skips segments.

3.8 **Lengths are notes.** The length slider snaps to the equal tempered semitones of two octaves from C3; the label shows
the note; the ratio between two pendulums is shown as an interval name when it is within 1 percent of a just ratio
(octave 2:1, fifth 3:2, fourth 4:3, major third 5:4, minor third 6:5) and as "near a fifth" when within 4 percent.

3.9 **Copy.** No dashes, no exclamation points. Rig names: The Single, The Crossed Pair, The Gimbal, The Double Link.

---

## 4. ARCHITECTURE LAW

Files (all inside `satellites/inkswing/`):

```
index.html            the app
sim.js                --test, --trace=<throwlist> (prints x, y every 0.1 s)
sw.js  manifest.webmanifest  icon-192.png  icon-512.png  icon-maskable-512.png
tools/check.js  tools/icons.mjs  tools/thumb.mjs  tools/shots.mjs
test/fling.mjs  test/sound.mjs  test/poster.mjs  test/layout.mjs
docs/DECISIONS.md  docs/shots/  BUILD-NOTES.md  ART_ASSETS.md
```

Layers: `CONFIG, RNG, RIGS, MOTION, FLING, INK, SHEET, SOUND, SAND, FOLIO, POSTER, SHARE, INPUT, SAVE, TEST, BOOT`.
`SIM_EXPORT` markers wrap CONFIG through FLING.

**CONFIG (frozen):**

```
GAME_ID 'inkswing'  SAVE_KEY 'lw_inkswing_v1'  SAVE_V 1
SHEET_W 1000  SHEET_H 1250 (sheet units; the poster is 2048x2560)   PX_PER_UNIT at 375 wide: 0.34
BASE_NOTE_HZ 130.81 (C3)  LENGTH_SEMITONES [0, 24]  W_AT_C3 2.4 (rad/s of the rig at C3)
DAMP {brass: 0.012, felt: 0.05, sand: 0.035} (per second)   DRAW_MAX_S 90   FINISH_ANIM_S 2
GRAB_R 44 (px)  RELEASE_WINDOW_MS 60  V_MAX 1400 (units/s)
INK_W_MIN 0.6  INK_W_MAX 2.4 (units)  WET_EDGE 0.18  SEG_MAX_LEN 1.5 (units)
LAYERS_MAX 4  FOLIO_MAX 48
SOUND_GAIN 0.04  SOUND_HZ_PER_W 60 (audio Hz per rad/s, so C3 length hums at about 144 Hz)
SAND_GRAINS_MAX 60000  TILT_DEG 12  SAND_SLIDE_UNITS_PER_S 300
```

**RIGS** (data): each `{ id, name, axes: [{ of: 'pen'|'paper', dir: 'x'|'y'|'rot' }], lengthsDefault, damping }`:
- The Single: one pendulum, pen, x and y share one `w` (an ellipse spiralling in).
- The Crossed Pair: pen pendulum A (`wA`) drives x, paper pendulum B (`wB`) drives y; the classic lateral harmonograph
  knots.
- The Gimbal: A drives x and y as a circle (a rotary term at `wA`) plus B lateral in x; rosettes.
- The Double Link (stretch): a two link arm integrated numerically.

**MOTION.** `pos(t, throws)`: for each throw `k` with axis terms `{A, w, phi, d}`, `x(t) = sum A sin(w_eff (t - t_k) + phi)
exp(-d (t - t_k))`, the same for y; the paper pendulum terms subtract. Closed form; a trace is `pos` sampled at adaptive
steps so no segment exceeds `SEG_MAX_LEN` units.

**FLING.** Section 3.4. The grab: pointer within `GRAB_R` of the bob's screen position; the drag moves the bob (the pen
lifts, nothing draws); release: `v0` from the last `RELEASE_WINDOW_MS` of samples, clamped to `V_MAX`; `x0` from the
release position relative to rest; per axis `A` and `phi`; `w_eff` from 3.5; `d` from the rig's bob choice. A throw is
appended to the sheet's throw list with its ink and its start time relative to the sheet.

**INK.** Width `INK_W_MIN + (INK_W_MAX - INK_W_MIN) * (1 - speed / V_MAX)`, alpha 0.9, the wet edge as a second stroke at
`WET_EDGE` alpha and width plus 0.6 where speed is under 15 percent of `V_MAX`; paper grain as a multiply of a seeded noise
tile. Five inks: iron gall (near black blue), sepia, oxblood, verdigris, indigo.

**SHEET.** Offscreen canvas per layer at 2x DPR; the live layer draws the growing curve as time advances; `finish()`
animates the rest in `FINISH_ANIM_S`; tear off clears all layers with the rip and starts a new sheet; undo discards the last
layer.

**SOUND.** One sine per pendulum axis at `w_eff * SOUND_HZ_PER_W`, gain `SOUND_GAIN` while the rig is set, silent when the
toggle is off; the paper whisper (filtered noise at gain by pen speed) while drawing; the sand hiss in sand mode; the rip.

**SAND.** The pen pours grains: a grain stamped per 0.4 units of path with a seeded jitter, bright on dark felt, count
capped at `SAND_GRAINS_MAX` (older grains merge into a baked layer); tilt past `TILT_DEG` slides grains in the gravity
direction at `SAND_SLIDE_UNITS_PER_S` and drops them off the edge; a brush off button does the same under reduced motion or
without tilt.

**FOLIO.** Saved sheets as throw lists with rig, lengths, inks, date and name; `FOLIO_MAX`.

**POSTER.** Plate (ink on cream, the brass caption "Fig. N, thrown by <name>, 3:2, two inks"), Dark (sand on felt), Bare
(art only); 2048x2560; the credit line.

**SHARE.** `#s=` = the throw list; opening a link redraws it live and offers "Keep in my folio".

**INPUT.** Pointer events, `touch-action: none`. The grab and fling; the length sliders; the ink chips.

**SAVE.** `lw_inkswing_v1`: `{v, name, folio, rigsUnlocked, settings:{sound, motion, tilt}, seen:{how}}`. Read, modify,
write.

**TEST.** Deepwell's harness; floor 60.

---

## 5. THE PHASES, WITH GATES

Every gate is watched to fail once before it counts.

### P0. The motion (about 1 hour)

1. Scaffold. RIGS, MOTION, FLING pure.
2. `sim.js --test`: the closed form single pendulum matches a 1000 Hz numerical integration of `x'' = -w^2 x - 2 d x'`
   within 1e-3 over 60 s; a 2:1 crossed pair at zero damping returns within 0.5 units of its start after one period of the
   slower pendulum, 3:2 likewise after two periods of the slower; a 1.51 ratio does not return within 5 units at that time
   (it precesses); the fling mapping round trips (`A, phi` from `x0, v0` reproduces `x0` at `t = 0` and `v0` within 1e-6);
   a harder throw has a larger `A` and a lower `w_eff`; the trace's segments never exceed `SEG_MAX_LEN`; the same throw list
   gives the same trace; serialisation round trips 200 random throw lists.
3. Watch it fail: flip the sign in `phi` and the round trip goes red; set `w_eff = w` and the precession assertion still
   passes (that one is about ratios), so instead set the 3:2 lengths to 3:2.2 and the closing assertion goes red.

### P1. The throw you can watch (about 2.5 hours)

1. SHEET, INK, the rig view (the brass arm, the bob, the pen), the grab and fling, the live draw, the sound.
2. **Stop and feel test.** Fling The Single once and let it run. Shoot `docs/shots/p1-spiral.png` at 375x667 after 20 s
   and `p1-done.png` at the end. Open them. The design says one thrown ellipse decaying into a spiral must be hypnotic; if
   the line reads as a uniform vector stroke, the width by speed and the wet edge are wrong, and you fix them before
   layering.
3. Layering with the ink chips, undo, tear off, let it finish, the folio.
4. `test/fling.mjs` (browser, real pointers at 375x667): a real drag from the bob's screen position by 90 px and release
   (with velocity, the last samples 12 px apart) appends one throw whose `A` is over 80 units and starts the pen; the sheet
   layer's non paper pixel count grows over the next 3 s; a second fling in another ink adds a second layer; UNDO removes
   it; TEAR OFF leaves a blank sheet and a new sheet id.
5. `test/layout.mjs`: 48 px at 375x667; the bottom left 120x120 empty; the length sliders 48 px tall.

### P2. Rigs and sound (about 2 hours)

1. The Crossed Pair and The Gimbal, the length sliders with note labels and the interval name, the bob choice (brass,
   felt).
2. SOUND: the hum, the whisper, the rip; `test/sound.mjs` (browser, offline): with the pair set to 3:2 the engine reports
   two hum frequencies at ratio 1.5 within 1 percent and the render has energy; with the toggle off the render is silent.
3. Shots: `p2-knot.png` (a 3:2 knot mid draw), `p2-rig.png` (the sliders with C3 and G3 showing "a fifth").

### P3. Sand, posters, links (about 2.5 hours; where a night may stop)

1. SAND mode with the grains, the baked layer, the hiss, tilt to erase behind the toggle, the brush off button.
2. POSTER three layouts; `test/poster.mjs`: a 2048x2560 PNG Blob whose bottom rows carry the caption.
3. SHARE `#s=` and the Daily Ratio (a seeded rig setting from `dailySeedFor`, one card a day); `test/share.mjs`: a link
   opened in a fresh context redraws the same throw list (trace equality) and offers the keep button.
4. The Double Link only if 1 to 3 are green before 03:00.
5. `tools/shots.mjs` at 412x915, 375x667, 320x568; `tools/thumb.mjs` (a knot mid draw); `ART_ASSETS.md`, `BUILD-NOTES.md`,
   the morning report.

---

## 6. THE SCREENS (portrait, one hand, 48 px rendered at 375 wide)

- **The rig (home).** The sheet fills the middle; the brass arm and bob hang over it from the top; a thin rail of ink chips
  (48 px each) along the right edge; bottom right: FINISH (56 px, appears while drawing) then TEAR OFF (48) and KEEP (56);
  top left: the rig chip (48, opens the rig sheet); top right: menu (48): Folio, Daily Ratio, Settings, About. Bottom left
  empty. First boot: "Grab the brass bob. Throw it." and nothing else.
- **Rig sheet.** The four rig cards (72 px, locked ones say what unlocks them: finish three drawings, then six, then
  twelve), the length sliders with note labels and the interval line, the bob choice, SAND / INK toggle.
- **Folio.** Cards 88 px: a thumbnail, name, rig and ratio, date; tap for the sheet: REDRAW, POSTER, SHARE, DELETE.
- **Poster.** Plate, Dark, Bare cards; EXPORT (56 px).
- **Settings.** Sound (the hum), Motion, Tilt (asks on tap), Name (for the caption), About: the positioning line, "Sky Wolf
  Studio".

One page; `ready` once.

---

## 7. ART (what Stephen can make this month; the app never waits on it)

Three sheets in `plans/inkswing/ART-PACK-INKSWING.md` (a copy in 012Assets as `Inkswing — Art Pack`).

| File | Used for | Delivered | In game |
|---|---|---|---|
| `rig-hero.png` | the brass rig as the icon and the card | 1:1 | icon set and `docs/thumb.png` source |
| `paper.png` | the cream sheet, tiled under the ink | 1:1 tile | `art/paper.jpg` 1024x1024 q75 |
| `felt.png` | the dark felt under the sand | 1:1 tile | `art/felt.jpg` 1024x1024 q75 |

---

## 8. LISTING ON THE ARCADE (Fable does the portal edit)

```
{nm:"Inkswing", ds:"Grab a brass pendulum and throw it. A pen underneath draws the swing as it slowly dies, and the lengths you set hum the chord your drawing is made of. Keep the ones you love.", cat:"creative", url:"/satellites/inkswing/?v=<stamp>", ic:"🖋️", thumb:"/portal-assets/thumbs/inkswing.png", beta:true, fresh:true}
```

Must be true first: thumb under 150 KB; the live URL answers with the stamp; ALL GATES PASSED; `test/fling.mjs` passed
with real pointers; the spiral shot was opened and judged.

---

## 9. PITFALLS (studio scars that apply here, learn them free)

- Everything in `plans/fathom/HANDOFF-FATHOM.md` section 9 and the audio scars in `plans/swell/HANDOFF-SWELL.md` section 9.
- A release velocity from the last two samples is noise; use the last 60 ms and a least squares slope.
- `exp(-d t)` at `t = 90` with `d = 0.012` is still 0.34: brass drawings do not finish on their own in 90 s. `DRAW_MAX_S`
  ends the live draw and the finish button completes the maths; the folio stores the throw list, not the cut.
- Drawing the whole history every frame is the classic harmonograph demo's mistake and it dies at layer two on a phone;
  the live layer appends segments only.
- The paper pendulum subtracts; a sign error makes every rig The Single with extra steps and nothing looks wrong until the
  3:2 knot never closes. The P0 closing assertion exists for this.
- Tilt on iOS needs a tap for permission; a sand sheet that never slides because nobody asked is a silent failure. The
  toggle asks, and the brush off button always works.
- A 60,000 grain array drawn as arcs is a slideshow; grains are 1 px rects, batched by colour, baked past the cap.

---

## 10. DECISION RIGHTS AND OPEN QUESTIONS

The design's three open questions take these answers tonight:

1. **Name: INKSWING.** Stephen's folder and title; Lull and Fig. 12 stay in the morning report.
2. **Sonification on by default at low volume.** Section 3.2.
3. **Tilt to erase is sand only.** Section 3.3.

Yours without asking: the inks' exact colours, the grain, the rig drawing, the interval tolerance, the Daily Ratio table.

Stephen's, never guessed: price, store, the name, the classroom page, anything with money.

---

## 11. STEPHEN ONLY

The phone: throw The Single, watch it die, throw a second ink, tear it off; set the pair to a fifth and listen. The three
art sheets when the Midjourney month allows.

---

## 12. HONEST SIZING

One Opus on two cores. P0 about 1 h, P1 about 2.5 h, P2 about 2 h, P3 about 2.5 h: about 8 hours. Expect 3,200 to 4,000
lines. **Where a single night stops well:** the end of P2 (three rigs, inks, layering, the hum, the folio) is the product;
sand, posters and links are the next session. If the clock says P1 cannot finish, land the fling and the live draw and skip
the folio; one hypnotic spiral is the whole promise.

---

## 13. EVIDENCE LEDGER (fill in place, with commands and their real output, most recent last)

```
(empty; the first entry is P0 step 3, the mutations watched to fail)
```

---

### P0, the motion (2026-09-06)

`node sim.js --test`

```
PASSED 84 / FAILED 0   (total 84)
INKSWING TEST OK
```

`node tools/lint.mjs`

```
ok    the script block parses (808 lines)
  ok    nothing the page loads is a .mjs
  ok    every local asset carries a ?v= stamp (3 of them)
  ok    the page names its stamp: 20260906a
  ok    and the service worker registration uses it
  ok    and sw.js carries the same one: inkswing-shell-20260906a
  ok    the worker only ever deletes its own caches
  ok    no dash in anything a player reads (53 strings)
  ok    no exclamation point either
  ok    the brand is Sky Wolf Studio, singular
  ok    and a screen the player reaches says so
  ok    the comment stripper leaves the code and takes the prose
  ok    no shadowBlur anywhere (0)
  ok    no text under 0.7 rem (smallest 0.72)
  ok    the motion is in the shipped file (9619 characters)
  ok    the motion never rolls an unseeded die
  ok    and it has no document and no window
  ok    and no clock
  ok    and it has never seen a canvas
  ok    and there is exactly one answer to where the pen is (1)
  ok    and it still has the trigonometry it is made of
  ok    no drawing is ever stored as pixels
  ok    and a sheet has one way of being written down (1)

LINT OK
```

**Watched red, every one.**

```
$ (the sign flipped in phi, the plan's own suggested mutation)
  FAIL  the pen starts exactly where it was let go (worst 6.0e+2 units)
  FAIL  and exactly as fast as it was thrown (worst 7.2e+0 units a second)
$ (the closed form written with the natural frequency, not the damped one)
  FAIL  the closed form is the solution of the equation it claims to solve (worst gap 0.112174 units)
$ (the amplitude detune removed, so a hard throw is not slower)
  FAIL  and a slower one, which is why it precesses (4.8000 against 4.8000)
  FAIL  and the detune grows with the square of the swing
$ (the paper pendulum adding instead of subtracting)
  FAIL  and the paper pulls the other way
$ (the trace on a fixed step, so a fast pen draws a polygon)
  FAIL  and no straight bit of it is longer than the cap (25.260 against 1.5)
```

**⛔ THE FINDING THAT IS A DIRECTOR CALL: equal temperament does not close.** The
plan asks for lengths that snap to semitones (3.8) and for a 3:2 to close within
half a unit (P0 step 2), and those two cannot both be had. An equal tempered
fifth is 1.4983, not 1.5. A drawing made at the C4 and G4 the sliders offer
nearly closes and then drifts, about a unit after two swings and eleven after
eight on a sheet a thousand units wide. It is not a bug and it is arguably the
better art: a figure that closes exactly retraces one line for ever, and a
drifting one fills in. Both facts are now assertions. Whether the sliders should
snap to JUST ratios instead is Stephen's, and it is in the morning report.

**Three more things the plan was wrong about, all in `docs/DECISIONS.md` with
their numbers:** the fling mapping drops the damping term in the release
velocity (the plan's own assertion asks for 1e-6 and it was out by two units a
second); the closed form has to use the damped frequency or it does not solve
the equation the gate integrates; and the link's frequency field overflowed
sixteen bits at the top of the slider, so every high pendulum came back at 8.19
and the drawing on the other phone was a different drawing.

---

### P1, the throw you can watch (2026-09-06)

`node test/fling.mjs`

```
ok    the bob is on the sheet and nothing is on top of it (stage)
  ok    and it is on the screen where a thumb can reach it (188,313)
  ok    the sheet starts empty
  ok    a drag on the bob and a release is one throw (1)
  ok    and it is a real swing (350 units)
  ok    and the pen is down
  ok    three seconds of swinging puts ink on the paper (238 to 1003 inked pixels)
  ok    and it is a drawing, not a dot (about 1003 inked pixels)
  ok    and it keeps growing while the pendulum keeps swinging (1003 to 1037)
  ok    the bob is exactly where the closed form puts it (0.0e+0)
  ok    one ink is one layer
  ok    the ink rail changes the ink
  ok    a second fling is a second throw (2)
  ok    in a second ink, on its own layer (2)
  ok    UNDO is a 48 px target (48)
  ok    UNDO takes the last ink off (1 layers)
  ok    and its throw with it (1)
  ok    and leaves the first drawing alone (about 1054 inked pixels)
  ok    TEAR OFF leaves a blank sheet
  ok    with no ink on it (0)
  ok    and the clock back at nought
  ok    and it is a new sheet (1 to 2)
  ok    one press on TEAR OFF only asks the question
  ok    no page errors

FLING OK
```

`node tools/check.js`

```
sim             pass  0s
lint            pass  0s
fling           pass  3s
layout          pass  5s

ALL GATES PASSED
```

**Watched red.**

```
$ (the release velocity taken from the last two samples only)
  FAIL  and it is a drawing, not a dot (about 578 inked pixels)
  FAIL  and it keeps growing while the pendulum keeps swinging (578 to 578)
$ (undo throwing the whole sheet away)
  FAIL  UNDO takes the last ink off (0 layers)
  FAIL  and its throw with it (0)
$ (a tear off that needs only one press)
  FAIL  one press on TEAR OFF only asks the question
$ (the sheet drawn bigger than the screen)
  FAIL  412: the whole sheet is on the screen (-63 to 475 across, 96 to 768 down)
```

**P1 step 2 is the feel test and the first line failed it.** The plan says that
if the line reads as a uniform vector stroke then the width by speed and the wet
edge are wrong and you fix them before layering. Linear in speed and at a flat
alpha of nine tenths, every loop came out the same weight and the middle of the
drawing, where the pen is slowest and the loops crowd, went solid black. At two
thirds of a pixel to the sheet unit the difference between a whipped stroke and
a dawdling one has to be carried by width AND alpha, both on a curve, with the
dark end capped so that crossings build tone instead of saturating. Shots:
`docs/shots/p1-spiral.png` at twenty seconds and `p1-done.png` at the end.

---

### P2, the rigs and the sound (2026-09-06)

`node test/sound.mjs`

```
ok    the hum can be built on a context this file hands it
  ok    a rig set to a fifth hums two notes a fifth apart (284.5 and 428.3 hertz, a ratio of 1.5055)
  ok    and there is a sound there (peak 0.0826)
  ok    and it is not a click (rms 0.0401)
  ok    and it does not clip (0.083)
  ok    and the note that comes out is the one the rig was set to (142.3 hertz against 284.5)
  ok    and an octave hums an octave (2.0104)
  ok    with the hum turned off the render is silent (peak 0.0e+0)
  ok    nothing opens an audio engine before a gesture
  ok    a throw starts two hums (2)
  ok    and they are the interval the rig is set to (1.5055)
  ok    and by the end of the drawing the hum has faded with the swing (0.766 to 0.357)
  ok    without ever quite stopping while the pendulum still moves (3.6e-1)
  ok    and stopping stops them
  ok    the menu turns the hum off
  ok    and then a throw makes no sound at all, and no engine to make one with
  ok    no page errors

SOUND OK
```

`node tools/check.js`

```
sim             pass  0s
lint            pass  0s
fling           pass  3s
sound           pass  4s
layout          pass  5s

ALL GATES PASSED
```

**Watched red.**

```
$ (both hums put on the same note)
  FAIL  a rig set to a fifth hums two notes a fifth apart (284.5 and 284.5 hertz, a ratio of 1.0000)
  FAIL  and an octave hums an octave (1.0000)
$ (the page's fade deleted, so the hum never follows the swing)
  FAIL  and by the end of the drawing the hum has faded with the swing (0.704 to 1.000)
$ (the sound toggle ignored)
  FAIL  and then a throw makes no sound at all, and no engine to make one with
$ (the engine opened at boot, before anybody has touched the screen)
  FAIL  nothing opens an audio engine before a gesture
```

**⛔ TWO OF THESE WERE TESTS OF THE TEST BEFORE THEY WERE TESTS OF THE GAME.**
Written as offline renders that scheduled their own decay and set their own
master gain to zero, the "it fades with the swing" and "the toggle is silence"
assertions both passed with the page's fade and the page's toggle deleted. They
go through the game now, in the live page, and both go red when the code under
them does.

**And a detail that is physics rather than a bug:** a rig set to a fifth hums
1.5055, not 1.5, because the two pendulums are detuned by their own swing. It is
inside the one percent the plan asks for and it is the same effect that makes
the drawing precess.

**Shots, opened and read.** `p2-knot.png` (a 3:2 knot mid draw), `p2-layers.png`
(indigo under oxblood), `p2-rig.png` (the pair, C4 and G4, "That is a fifth").

- The UNDO button was sitting on the paper. Three buttons stack in the bottom
  right and at ninety six pixels of clearance the sheet ran under them. The sheet
  stops above them now and the layout gate has an assertion about it.
- Every shot had "Grab the brass bob" written across the drawing, because the
  first boot hint is a three second toast and every shot was taken inside it.

### P3 step 4, the Double Link (2026-09-06 afternoon)

```
$ date -u
Sun Sep  6 14:49:07 UTC 2026
$ flock -w 1800 /tmp/sws-gate.lock node tools/check.js
sim             pass  2s
lint            pass  0s
fling           pass  9s
sound           pass  3s
share           pass  3s
poster          pass  4s
layout          pass  4s

ALL GATES PASSED

$ node sim.js --test | tail -2
PASSED 99 / FAILED 0   (total 99)
INKSWING TEST OK
$ node test/fling.mjs | tail -9
  ok    with twelve drawings kept the Double Link is a 48 px card on the rig screen (72)
  ok    and it is open
  ok    tapping it puts the Double Link on the sheet
  ok    a real fling on the Double Link is one throw that keeps its release (1785 units a second)
  ok    and it draws ink (0.256 percent of the sheet)
  ok    with the bob exactly where the integrator puts it (0.0e+0)
  ok    no page errors
FLING OK
```

The four assertions of the plan, each watched to fail on a scratch copy
(`INKSWING_HTML=<copy> node sim.js --test`):

```
== damping sign flipped in the integrator
FAIL  the energy never rises with no throw (21601 samples, worst rise 3.4e+2)   [expected 0, got 10543]
== an unseeded die added to the step
FAIL  the same sheet twice gives the same trace, with the cache emptied between (first differs at point 0 ...)
== the detune dropped from the integrator (w in place of wEff)
FAIL  with link 2 at nought the integrator matches the closed form single inside 0.05 over twenty seconds (worst 234.7995)
== the reach scale dropped
FAIL  the pen never leaves the sheet, even thrown as hard as a hand can on a unison (632 by 648 of a sheet 1000 by 1250)
== symplectic Euler at 240 Hz in place of Runge Kutta (the plan's integrator)
FAIL  the energy never rises with no throw (21601 samples, worst rise 7.8e+2)   [expected 0, got 8933]
FAIL  with link 2 at nought the integrator matches the closed form single inside 0.05 over twenty seconds (worst 3.0014)
FAIL  and at the top of the slider too, where a first order step would wobble by units (worst 6.8078)
```

The fling gate's three new assertions about the rig screen were watched to
fail on the real bug (the rig list counted a stale folio) before `showScreen`
re rendered it; "keeps its release" failed at 0 units a second on the same run.
The last two, by mutating the page and running the gate, then restoring it
(`git diff` empty after):

```
== doublePosAt pinned to the middle of the sheet
FAIL  and it draws ink (0.012 percent of the sheet)
== the pen nudged one unit off the model on the numeric rig
FAIL  with the bob exactly where the integrator puts it (1.0e+0)
```

Shots opened: `docs/shots/p3-double.png` (412x915) and `p3-double-375.png`.
First cut: the Single's ellipses under a different name, one rod. Second cut:
the chain, the knot folded into a band with two dense crossings, the knuckle
fifty five pixels above the bob whatever the lengths. Third cut: the knuckle
at the links' share of the rod. Still thin: the drawing is small around the
bob at the shot's moderate throw, and the sheet floats in empty ground on the
412 (known, section 15).

---

## 14. THE OVERNIGHT PROTOCOL

As `plans/fathom/HANDOFF-FATHOM.md` section 14, with `P0, P1, P2, P3` of this file and the browser gates `fling, sound,
poster, share, layout`.

---

## 15. THE MORNING REPORT

*Written 2026-09-06 by Opus at the end of P3. The template is
`plans/fathom/HANDOFF-FATHOM.md` section 15.*

### What Inkswing is now

A brass pendulum on a sheet of paper. You grab the bob and throw it, and the pen
under it draws what the throw actually does: an ellipse that precesses and decays
into a spiral, or on the crossed and gimbal rigs a knot whose shape is the ratio
between two pendulum lengths. The lengths are set as notes, so a 3:2 knot is a
fifth. You layer inks, you tear the sheet off, you make a poster of it at print
size, and you send the drawing to someone as a link.

The whole plan is built, P0 through P3, except P3 step 4.

### The gates

`node satellites/inkswing/tools/check.js` prints ALL GATES PASSED across seven:

```
sim             pass  0s     87 assertions
lint            pass  0s
fling           pass  9s     31 assertions
sound           pass  3s     17 assertions
share           pass  3s     19 assertions
poster          pass  3s     16 assertions
layout          pass  3s     69 assertions
ALL GATES PASSED
```

Every assertion in every gate has been watched to fail at least once.

### ⛔⛔ The finding worth the whole phase: a gate that could not fail

The layout gate's most important assertion is "no button is sitting on the
paper", and the drawing is the product, so that is the one rule the layout has.
It checked the buttons `btnKeep, btnTear, btnUndo, btnFinish`. Every one of those
is `hidden` until a sheet has a throw on it, and the gate never put a throw on
one, so for its whole life the assertion filtered an **empty list** and reported
clean. The music chip corner check had the same hole. `btnShare` was in neither
list.

It was found by opening `docs/shots/p3-sand.png` and seeing UNDO sitting on the
paper while the gate was green. The gate now loads a drawing, lets the frame run
so `syncActions` un hides the buttons, asserts that four of them are actually
showing before it measures anything, and then measures. It was watched to fail on
the real bug at 375 and at 320 before a line of the layout was touched.

Three real faults were hiding under it, all found by looking at the shots and all
fixed:

1. **The sheet ran under the ink rail.** It was centred in the full viewport
   width while a column of 48 px colour chips sits on the right edge, so the
   right third of every drawing was behind the colours. It is centred in what is
   left after the rail now.
2. **The sheet hung from the top of its band**, so on a 412 by 915 phone, where
   the sheet's 1000 by 1250 aspect makes the width bind, three hundred pixels of
   empty floor opened between the paper and the buttons and the composition fell
   apart on exactly the phone Stephen carries. It is centred in the band.
3. **The actions were a staircase that stood on the drawing.** A column of four
   up the right side is 224 px tall, which reached into the paper, and the four
   were four different widths right aligned, so nothing shared an edge with
   anything. They are a two by two block in the bottom right now, one width, every
   edge shared, clear of the fleet's music chip corner, and the band they reserve
   fell from 186 px to 152 px, so the drawing got bigger on every phone.

### What I looked at, and the faults I can still name

`docs/shots/p3-412.png`, `p3-375.png`, `p3-320.png`, `p3-sand.png`,
`p3-poster.png` and `docs/thumb.png`, all opened.

- **412 still reads as three separated bands.** The sheet is 1000 by 1250 and the
  rail takes 58 px off the width, so on a 412 by 915 phone the sheet physically
  cannot fill the height; there is about 150 px of empty ground above it and 150
  below. Centring is the best answer available without cropping the sheet, and
  the sheet's aspect is a design fact rather than a bug, so this is written down
  rather than chased.
- **The tile has the brass arm running dead centre** from the top edge through
  the middle, splitting the knot in two and pulling the eye out of the frame.
- **The poster's drawing is not centred in its rule box** and there is a visible
  seam across the paper gradient from the posterization that keeps the files
  under the size limit.

### Director calls waiting

1. **The sliders are equal tempered, so nothing ever closes exactly.** Carried
   from P2 and still open. The lengths are set as notes and the intervals are
   named as notes, but equal temperament means a "fifth" is 2^(7/12), not 3/2, so
   a knot set to a fifth never quite closes and drifts forever. Just intonation
   would make the named intervals close exactly and make the drawings finite and
   symmetric, at the cost of the note names being slightly off a piano. My read
   is that this game is about the drawing and not about the piano, so just
   intonation is the better default with equal temperament behind the Settings
   toggle, but it changes every drawing the game makes and that is his call, not
   mine.
2. **P3 step 4, the Double Link, is not built.** The plan made it conditional on
   steps 1 to 3 landing early. They did not. It is a clean addition later and
   nothing depends on it.

### Where the work is

Branch `add-sproing-jumper`, commits `8f51e7c4` through `e95ac564`. Not on main.
`satellites/inkswing/docs/BUILD-NOTES.md` has the scars, `docs/ART_ASSETS.md`
has what is drawn and what ships.

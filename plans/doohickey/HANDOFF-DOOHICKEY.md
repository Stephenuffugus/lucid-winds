# HANDOFF DOOHICKEY, the build plan for one Opus night (and a morning)

**Written:** 2026-09-05 evening, by Fable, from `docs/handoffs-uploaded/six-20260905/6handoffs/HANDOFF-DOOHICKEY.md`
(Stephen's design, read in full) plus the fleet on branch `add-sproing-jumper` tonight.
**Reads before this one:** `HANDOFF-OPUS-NIGHT-SEP05.md` (the spine), then this file, then the design. Where they differ,
this file wins; every difference is in section 3 with its reason.
**Game folder:** `satellites/doohickey/` (slug free, checked 2026-09-05). **Live URL when Fable lists it:**
`lucidwinds.com/satellites/doohickey/`.
**The physics engine already exists in the fleet.** Section 2. You extend it; you do not write one from a blank page.

---

## SESSION STATE (the builder updates this at the end of every session; the morning reader starts here)

- 2026-09-06 Opus: **P0 is DONE and pushed.** `node satellites/doohickey/tools/check.js`
  prints ALL GATES PASSED across five gates: `sim` (109 assertions), `solve`,
  `replay`, `dominoes`, `mutants`. Section 13 carries the replay hash, the
  domino table, the level table and the mutant table. Next action: P1 step 1,
  the VIEW. Draw the scene into `#board` in `satellites/doohickey/index.html`:
  the cream paper and its grid, the static segments, then a `drawPart` per type
  reading the same geometry PARTS builds, then the camera. The shot to make
  first is `docs/shots/p1-cascade.png` at 667x375.

---

## 0. RULES OF ENGAGEMENT

Identical to `plans/fathom/HANDOFF-FATHOM.md` section 0 with `doohickey` for `fathom`: the fence is
`satellites/doohickey/**` plus this file's ledger; fenced `git add`, never `-A`; rebase before every push; never push
main; no dashes or exclamation points in player copy; 48 px rendered buttons proved by `elementFromPoint`; Sky Wolf Studio
singular; `.js` at runtime; `?v=` on every URL with `sw.js` bumped in lockstep; text 0.7 rem or larger; LOOKING IS PART OF
THE JOB; never wait on a human.

Two laws particular to Doohickey:

- **DETERMINISM IS LAW** (the design's words, and the fleet's). Fixed 120 Hz step, fixed iteration order, no `Math.random`
  in the sim, no time dependent branching, **and no transcendental `Math` call in the sim** (section 3.4). A shared machine
  must run the same on the recipient's phone or the share link is a lie.
- **The domino cascade is the heartbeat.** It has its own gate (section 5, P0 step 5) and its own tuning pass, and nothing
  in P1 begins until it is green.

---

## 1. WHAT DOOHICKEY IS, AND WHY IT IS WORTH A NIGHT

From the design: *"Drag ridiculous parts onto a canvas, ramps, dominoes, fans, balloons, seesaws, a sleeping cat, press GO,
and watch a marble trigger beautiful chaos until the goal happens. Puzzle mode gives you a scene and a limited parts tray;
sandbox mode gives you everything."* Positioning line: **"Build something needlessly complicated. Watch it (almost) work."**
Tone: Saturday morning cartoon contraptions; failure is funny.

Why it is worth a night: the genre's template is thirty years old and unbeaten, its mobile entries are known for touch
editors that fail, and the studio already owns a working sequential impulse engine with sleeping bodies (Burr Blast), a
share by link pattern (Blockspace), a video export (Blockspace), an undo stack (Blockspace) and a pinch zoom (Abduct). What
is new is constraints, wind, buoyancy, the editor, and the levels. It is fifth in the order because it is the largest build
of the six; a night that lands P0 to P2 leaves a real puzzle game with six levels, and the sharing and the cat are a second
session.

---

## 2. STATE OF THE INHERITANCE (verified by Fable 2026-09-05; trust this over any doc)

| Need | Copy from | What to take |
|---|---|---|
| **The rigid body engine** | `satellites/burr-blast/index.html` lines 527 to about 1200, `var PHYS = (function(){ ... })()` | Circles and convex polygons, sequential impulse solver with Coulomb friction, restitution, Baumgarte positional bias, and sleeping (`awake`, `sleepTime`, `canSleep`, `wake()`); `World({gravity, iterations})`, `add`, `remove`, `step(dt)`; exposed as `window.BB_PHYS` for its headless verifier. It contains no `Math.random` (the one at line 1142 is the audio impulse, outside PHYS). Copy the whole IIFE into Doohickey as `PHYS`, then apply section 3.4 and add section 4's constraints and forces |
| A headless verifier that re-breaks what it guards | `satellites/burr-blast/check.mjs` (`--selftest`) and `satellites/conduit/test/mutants.js` | The self test that mutates a scratch copy and asserts the gate goes red. Doohickey's `test/mutants.mjs` (section 5) is this |
| Deterministic sin, cos, atan2 | `satellites/keepsies/src/core/dmath.js` (its header says why) | Copy the functions inline into the PHYS section (`dsin`, `dcos`, `datan2`, `len2`); the sim calls these and `Math.sqrt` only |
| Share by link | `satellites/blockspace/index.html` lines 1060 to 1080 | `b64u`, `copyLink`, `importFromHash`, `history.replaceState`, share sheet then clipboard then a text box. Doohickey uses `#m=` and its own binary pack (section 4) |
| Video export | `satellites/blockspace/index.html` lines 1090 to 1095 and 838 | `canvas.captureStream(30)` plus the audio track from `createMediaStreamDestination`, `MediaRecorder` with the mime fallback list, the Blob in `onstop` |
| Save or share a Blob on a phone | `satellites/attic/index.html` lines 1446 to 1466 | `File`, `canShare({files})`, `share`, else download |
| Undo and redo | `satellites/blockspace/index.html` line 310 (`UNDO_MAX`), 333 (`undo:[], redo:[]`) | Snapshot the parts array per edit op; 20 deep here |
| Pinch zoom and two finger pan | `satellites/abduct-a-chameleon/index.html` `tryStartPinch` at 1298, `pointers` Map, `blur` at 1264 | A second finger while a pan finger is live becomes a pinch; a third never fights it |
| Scaffold, RNG, page tests, `sim.js`, `sw.js`, manifest, icons, portal protocol, music hook, gate runner, browser gate shape, thumb and icon tools | as listed in `plans/fathom/HANDOFF-FATHOM.md` section 2 | Same files, `doohickey` in place of `fathom` |
| A level with an authored solution as the gate | `plans/fathom/HANDOFF-FATHOM.md` section 4, DATA | Each level carries `solution` (placed parts) and `sim.js --solve` runs it |

Not inherited, on purpose: Rapier (Keepsies vendors it for 3D; Doohickey is 2D and the design says custom), three.js, any
audio library.

---

## 3. CORRECTIONS TO THE DESIGN (binding; each forced by a measurement or a fleet law)

3.1 **Studio and deploy.** Sky Wolf Studio. Hostinger from `main`, pushed by Fable.

3.2 **Both orientations, levels designed landscape.** The design recommends it; taken. In portrait the scene letterboxes
to the width and the tray stacks below it; in landscape the tray is a dock along the bottom. Every level is authored for a
16:9 scene of 32 by 18 grid cells.

3.3 **Daily Doohickey is v1.1.** The design recommends it; taken. The date seed helper (`dailySeedFor`) ships unused.

3.4 **No transcendental `Math` in the sim.** The design's determinism law says "same run on every device". ECMAScript lets an
engine return a different last bit from `Math.sin`, `Math.cos`, `Math.atan2`, `Math.pow`, `Math.exp` and `Math.hypot`, and a
domino run is chaotic: one bit becomes a different fall. Burr Blast's PHYS uses `Math.cos` and `Math.sin` in `vrot` and in
polygon transforms; replace them with the Keepsies `dmath` functions when you copy it. `Math.sqrt`, `floor`, `abs`, `min`,
`max` are exact and allowed. TEST greps the SIM export for the forbidden names.

3.5 **The slice's eight parts are the first eight of the roster, and the pulley moves to v1.1.** Marble, plank, domino,
seesaw, fan, balloon, bell, bucket in the slice (P1 and P2); spring pad, switch and the cat in P3; rope and pulley are the
hardest constraint and no slice level needs them. Logged in DECISIONS.

3.6 **Snap grid is 24 world units and the scene is 768 by 432 world units.** 32 by 18 cells. A world unit is a CSS px at a
768 wide scene; the view scales. Parts snap their centre to cells and their rotation to 15 degree detents; free place is a
toggle in the editor, off by default.

3.7 **Overlap is a real test, not a bounding box.** The red ghost fires on a separating axis test between the ghost polygon
and every placed part and static segment; a marble ghost uses circle tests. Silent failure is the genre's scar and this is the
cure.

3.8 **Handles sit above the finger and are 48 px.** The selected part's rotate dial, flip, duplicate and delete are a row of
48 px buttons centred 72 px above the part's screen position (clamped inside the viewport), never under the thumb.

3.9 **GO to editing is one tap and under two seconds.** Tapping anywhere during RUN stops the run and restores the pre run
machine (the run never mutates the edit state; it copies it). No confirm.

3.10 **Stars are defined.** One: the goal fired. Two: the goal fired using at most par parts. Three: two, plus every bonus
star in the scene was touched by a moving body.

3.11 **Sleep and wake are asserted.** A body at rest sleeps after 0.5 s under 2 wu/s; a contact from an awake body wakes it;
the gate drops a marble on a sleeping domino row and asserts the cascade.

3.12 **Copy.** No dashes, no exclamation points. Level names are things ("The Bell on the Shelf"), never commands.

---

## 4. ARCHITECTURE LAW

Files (all inside `satellites/doohickey/`):

```
index.html            the game
sim.js                --test, --solve (every level's solution wins, the empty tray does not), --replay=N (N runs, one hash)
sw.js  manifest.webmanifest  icon-192.png  icon-512.png  icon-maskable-512.png
tools/check.js  tools/icons.mjs  tools/thumb.mjs  tools/shots.mjs
test/mutants.mjs  test/edit.mjs  test/run.mjs  test/share.mjs  test/film.mjs  test/layout.mjs
docs/DECISIONS.md  docs/shots/  BUILD-NOTES.md  ART_ASSETS.md
```

Layers: `CONFIG, RNG, DMATH, PHYS, PARTS, LEVELS, MACHINE, SIM, VIEW, EDITOR, AUDIO, SHARE, FILM, SAVE, TEST, BOOT`.
`SIM_EXPORT` markers wrap CONFIG through SIM.

**CONFIG (frozen):**

```
GAME_ID 'doohickey'  SAVE_KEY 'lw_doohickey_v1'  SAVE_V 1
SCENE_W 768  SCENE_H 432  CELL 24  ROT_DETENT_DEG 15
PHYS_HZ 120  ITERATIONS 10  GRAVITY 900 (wu/s^2)  SLEEP_V 2  SLEEP_S 0.5
BODY_MAX 120  CONSTRAINT_MAX 40  UNDO_MAX 20  RUN_MAX_S 45
MARBLE_R 9  MARBLE_MASS 1  MARBLE_REST 0.35  MARBLE_FRICTION 0.25
DOMINO_W 10  DOMINO_H 32  DOMINO_MASS 0.6  DOMINO_REST 0.05  DOMINO_FRICTION 0.45
PLANK_L 96  PLANK_T 8    SEESAW_L 144
FAN_RANGE 220  FAN_HALF_ANGLE_DEG 18  FAN_FORCE 2600 (wu/s^2 per unit mass at 1 wu, falls as 1/dist, floor at 20 wu)
BALLOON_R 14  BALLOON_LIFT 1.6 (times its weight, upward)  STRING_L 60
BUCKET_W 44  BUCKET_H 36  BELL_R 16  SPRING_REST 1.4
TAP_SLOP 10  PINCH_MIN_D 30  ZOOM [0.6, 2.2]
```

**DMATH.** The Keepsies functions, inline: `dsin`, `dcos`, `datan2`, `len2`, `clamp`. PHYS and every part's force code use
these only.

**PHYS.** Burr Blast's engine with 3.4 applied, plus:
- `PinJoint(bodyA, bodyB, anchorWorld)`: a point to point constraint solved by impulse each iteration with Baumgarte bias
  0.2; the seesaw is a plank pinned to a static anchor.
- `Rope(bodyA, bodyB, maxLen)`: an inequality distance constraint (only pulls when longer than `maxLen`); the balloon's
  string and the bucket's hanger.
- Forces applied before the step: gravity; `fanForce` for every awake body inside a fan's cone (direction along the fan's
  facing, magnitude `FAN_FORCE * mass / max(20, dist)`); balloon buoyancy (`-GRAVITY * BALLOON_LIFT * mass` while inflated).
- Iteration order: bodies sorted by `id`, contact pairs sorted by `(idA, idB)`, constraints by creation order. No `Map`
  iteration in the solver.
- `stateHash(world)`: FNV-1a 32 bit over every body's `pos`, `vel`, `angle`, `angVel` rounded to 1e-6, in id order.

**PARTS.** Each `{type, w, h or r, mass, rest, friction, static, draw, sound, make(world, x, y, rot)}`: marble, plank
(static), domino, seesaw (plank plus pin), fan (static, has a cone and an on flag), balloon (circle, buoyant, a rope to its
cargo, pops on contact with a `spike` flag), bell (static circle; the goal fires on any contact with speed over 40 wu/s;
rings), bucket (three static thin planks in a U on a rope; contents counted by containment). P3: spring pad (static plank
with `SPRING_REST`), switch (static plate that toggles fans when a body rests on it), cat (a box that sleeps until touched or
until a bell rings within 200 wu, then applies an impulse to the nearest marble and walks off screen over 2 s; render only
walk, the body is removed at the end).

**LEVELS.** Six in the slice, each `{name, scene:[static segments], fixed:[placed parts], tray:{type:count}, goal, par,
bonus:[{x,y}], solution:[placed parts]}`: (1) The Bell on the Shelf: marble, two planks, the bell; teaches drag, rotate, GO.
(2) A Row of Dominoes: planks and eight dominoes into the bell; the cascade. (3) The Seesaw: launch a marble over a wall.
(4) The Fan: blow a balloon's cargo onto the bell; the switch is fixed in the scene. (5) The Bucket: fill it so it pulls the
bell's string. (6) All Together: everything, par 9, two decoy parts in the tray.

**MACHINE.** The edit state: `parts: [{type, x, y, rot, flip}]`, the undo and redo stacks, selection. Serialisation for the
link: per part `type u8, x u16, y u16, rot u8 (detent index), flags u8`, 7 bytes, base64url; 120 parts fit in 1.2 KB.

**SIM.** `buildWorld(level, machine)` then `step` at `PHYS_HZ` with an accumulator, `RUN_MAX_S` cap, the goal test, the
bonus test, events (`contact`, `bell`, `pop`, `goal`) for VIEW and AUDIO. Pure over `(level, machine)`; two calls give the
same `stateHash` after `RUN_MAX_S`.

**VIEW.** Canvas 2D, DPR aware, the scene scaled into the viewport (letterbox in portrait). Cream paper `#F4EBD3` with a
faint grid, parts in saturated primaries with 3 px outlines, squash and stretch on bounces (render only), dust puffs,
motion lines over 300 wu/s. The camera on GO eases toward the kinetic energy weighted centre of moving bodies with a soft zoom
in `ZOOM`; in EDIT it is the whole scene. Reduced motion: no squash, no puffs, no camera zoom.

**EDITOR.** Section 3's rules: the tray dock, drag out with the ghost, snap, handles, undo and redo, bounds, two finger pan
and zoom, free place toggle, tap a part to select, drag a selected part to move, drag back to the tray to return it.

**AUDIO.** Web Audio, synthesised, behind the first pointerdown: marble tick on contact (pitch by speed), domino clack (each
domino in a cascade a step higher on a pentatonic ladder, reset after 1 s of silence), fan whirr while on, balloon squeak on
stretch and pop, bell ding, bucket thunk, spring boing, switch click, the cat's mrrp. A master limiter; `createMediaStreamDestination`
for FILM.

**SHARE.** `#m=` from MACHINE plus the level id; opening a link loads the level with the machine placed and offers RUN.

**FILM.** The Blockspace recorder, 30 s cap, the share sheet.

**SAVE.** `lw_doohickey_v1`: `{v, stars:[...6], sandbox:[3 machines], settings:{sound, motion, freePlace}, seen:{how}}`.
Read, modify, write.

**TEST.** Deepwell's harness; floor 60.

---

## 5. THE PHASES, WITH GATES

Every gate is watched to fail once before it counts; `test/mutants.mjs` makes that re-runnable.

### P0. The engine, deterministic, with a heartbeat (about 2.5 hours)

1. Scaffold. PHYS copied with DMATH applied; PinJoint, Rope, fan and buoyancy forces; PARTS for the eight; `stateHash`.
2. `sim.js --test`: a marble dropped on a static plank comes to rest and sleeps within 3 s; a marble rolling down a 20 degree
   plank reaches the bottom with speed within 5 percent of the frictionless value times a friction factor (record the value,
   assert it stays); a pinned plank with a marble on one end tips; a balloon with cargo rises until its rope is taut then lifts
   the cargo; a fan cone moves a balloon and not a plank; a sleeping domino woken by contact falls; **100 runs of a fixed 20
   part machine give one identical `stateHash`** (`--replay=100`); the SIM export contains no `Math.random`, `Math.sin`,
   `Math.cos`, `Math.atan2`, `Math.pow`, `Math.exp`, `Math.hypot`; serialisation round trips 50 random machines.
3. `test/mutants.mjs`: six mutants in a scratch copy (gravity zero, restitution 2, sleeping disabled, the rope inequality
   flipped, the fan cone widened to 180 degrees, a `Math.sin` reintroduced) each kill at least one assertion. A surviving
   mutant is a decorative test and is fixed before P1.
4. **The heartbeat.** `sim.js --test` also runs the domino gate: a row of 12 dominoes at spacings 0.55, 0.65 and 0.75 of
   `DOMINO_H`, each trial with a seeded plus or minus 2 percent jitter on spacing and 1 degree on lean, 100 trials per
   spacing, a marble rolled into the first: **every domino falls in every trial, and the last falls within 4 s.** If it is
   not 100 percent, tune `DOMINO_*` (the design says they may tip a little too easily) until it is, and record the numbers.
5. Watch the heartbeat fail: set `DOMINO_FRICTION` to 0.9 and spacing 0.75 goes red.

Ends with: the replay hash and the domino table in the ledger.

### P1. The scene you can watch and the editor you can trust (about 2.5 hours)

1. VIEW with a hardcoded scene: a marble down two planks into eight dominoes into the bell. **Stop and feel test.** Shoot
   `docs/shots/p1-cascade.png` mid fall at 667x375 and 375x667. Open them. The design says the cascade must be reliable and
   delightful; reliable is P0's job, delightful is the clack ladder and the squash, so if the strip reads as rectangles
   falling over, fix the outline weight and the squash before the editor.
2. EDITOR: the tray, drag out with the ghost, snap, select, handles, rotate detents, flip, duplicate, delete, undo and redo,
   bounds, pan and zoom, GO and STOP with the copy rule (3.9).
3. `test/edit.mjs` (browser, real pointers at 667x375 and 375x667): a real drag from the tray's plank tile to the scene places
   a plank whose centre is on a cell; a real tap on the rotate handle turns it one detent; a real drag onto an occupied cell
   shows the red ghost and places nothing; undo removes it and redo restores it; a drag off the scene edge returns the part
   to the tray (the tray count goes back up); two real fingers spreading zoom the view.
4. `test/layout.mjs`: every button 48 px in both orientations, `elementFromPoint` at centre; handles 48 px and above the
   part; the bottom left 120x120 empty in EDIT.

### P2. Parts, levels, winning (about 2.5 hours)

1. The remaining slice parts (seesaw, fan, balloon, bucket) in the editor with their handles; the goal system; the win flow
   (confetti, the slow replay of the last 3 s, stars, NEXT).
2. The six levels with their solutions; the level select; the sandbox with three slots.
3. `sim.js --solve`: every level's `solution` fires the goal within `RUN_MAX_S` and uses at most `par` parts; every level
   with an empty machine does NOT fire the goal (a level that wins by itself is broken); the bonus stars in every solution's
   run are all touched (so three stars are reachable). Watch it fail by moving level 3's wall one cell.
4. `test/run.mjs` (browser): load level 1, place its solution through the TEST hook, press the real GO button, and the bell
   event arrives within 10 s of wall time; press the real STOP mid run and the machine is unchanged (parts equal before and
   after).

Ends with `p2-win.png`, `p2-select.png`, `p2-sandbox.png`, `p2-portrait.png`.

### P3. Sound, links, film, the cat (about 2.5 hours; where a night stops, and the morning continues)

1. AUDIO with the clack ladder; the camera director; squash, puffs, motion lines.
2. SHARE links; `test/share.mjs`: a link from level 2 with its solution opens in a fresh context, places the same parts, and
   its RUN fires the bell.
3. FILM; `test/film.mjs`: a 5 s run while filming yields a Blob over 50 KB with a type from the mime list.
4. Spring pad, switch, then the cat, last, as the design orders. The cat's gate: a marble within 40 wu of a sleeping cat
   wakes it and the marble's speed after the bat exceeds 200 wu/s; a bell within 200 wu wakes it too.
5. `tools/shots.mjs` at 915x412, 667x375, 412x915, 375x667; `tools/thumb.mjs` (mid cascade, chrome hidden);
   `ART_ASSETS.md`, `BUILD-NOTES.md`, the morning report.

---

## 6. THE SCREENS (both orientations; 48 px rendered at 375 wide and at 667 wide)

- **Title.** PLAY (56 px), SANDBOX (48), HOW (48). The positioning line. Bottom left empty.
- **Level select.** Six cards 64 px tall, name and stars, locked past the last cleared plus one.
- **Build.** The scene; the tray dock (landscape: bottom, 72 px tall, part tiles 56 px with counts; portrait: below the
  letterboxed scene, two rows); GO (56 px) bottom right; undo and redo (48 px each) top left; menu (48 px) top right;
  the handle row above a selected part; a free place toggle inside the menu.
- **Run.** The scene under the camera; STOP (56 px) bottom right; a tap anywhere stops.
- **Win.** The slow replay behind a card: stars, "N parts, par M", NEXT (56), SHARE (48), FILM IT (48), MENU (48).
- **Sandbox.** Three slots, each a thumbnail and a name; the build screen with the full tray.
- **How.** Three lines: "Drag parts from the tray. Turn them with the dial." "Press GO and watch." "Tap to stop and fix it."
- **Settings (in the menu).** Sound, Motion, Free place, About: "Sky Wolf Studio".

One page; `ready` once.

---

## 7. ART (what Stephen can make this month; the game never waits on it)

The parts are drawn by code in the cartoon outline style and stay that way (a painted part would not squash). Three sheets
in `plans/doohickey/ART-PACK-DOOHICKEY.md` (a copy in 012Assets as `Doohickey — Art Pack`): a paper texture tile, a title
plate, and an icon mark.

| File | Used for | Delivered | In game |
|---|---|---|---|
| `paper.png` | the scene background, tiled at 25 percent under the drawn grid | 1:1 tile | `art/paper.jpg` 1024x1024 q75 |
| `title-plate.png` | behind the title | 16:9 | `art/title.jpg` 1600x900 q80 |
| `icon-mark.png` | PWA icon, if better than the drawn one | 1:1 | 512, 192, maskable 512 |

---

## 8. LISTING ON THE ARCADE (Fable does the portal edit)

```
{nm:"Doohickey", ds:"Drag ramps, dominoes, fans and balloons onto the page, press GO, and watch a marble set off beautiful chaos until the bell rings. Build something needlessly complicated. Watch it almost work.", cat:"puzzle", url:"/satellites/doohickey/?v=<stamp>", ic:"⚙️", thumb:"/portal-assets/thumbs/doohickey.png", beta:true, fresh:true}
```

Must be true first: thumb under 150 KB; the live URL answers with the stamp; ALL GATES PASSED including `mutants`; the
domino table in the ledger reads 100 percent at all three spacings; `test/edit.mjs` passed with real pointers; the shots
were opened.

---

## 9. PITFALLS (studio scars that apply here, learn them free)

- Everything in `plans/fathom/HANDOFF-FATHOM.md` section 9.
- A `Map` or an object iterated in the solver is insertion ordered in practice and unordered in law; sort by id.
- A body removed mid step (the balloon pop, the cat walking off) leaves a contact pointing at it; mark dead, remove after the
  step, and assert no contact references a dead body.
- Baumgarte bias with a large `dt` jitters stacks; 120 Hz with an accumulator, and never a variable step, even when the tab
  was hidden (drop the accumulated time past 0.25 s instead of simulating it).
- A domino row that works at one spacing and not another is not tuned; the heartbeat gate has three spacings for this.
- The editor's ghost must be the part's real polygon at its real rotation; a bounding box ghost says red where the part
  fits and green where it overlaps.
- `pointercancel` fires when the browser decides a drag is a scroll; `touch-action: none` on the whole build screen.
- A captured pointer that ends off the canvas still ends; handle `pointerup` on `window`.
- The camera director must never follow a sleeping body; use kinetic energy weights, and when everything sleeps for 2 s
  without a goal, the run ends as a fail with "It stopped. Try a nudge." (no exclamation point).
- A share link is data from a stranger; validate every part type and clamp every coordinate before building the world.
- The cat is last for a reason: it is the part most likely to eat an hour, and the game is complete without it.

---

## 10. DECISION RIGHTS AND OPEN QUESTIONS

The design's three open questions take these answers tonight:

1. **Name: DOOHICKEY.** Stephen's folder and title; Kerplunkt, Whirligig and Thingamajig stay in the morning report.
2. **Both orientations, levels designed landscape.** Section 3.2.
3. **Daily mode: v1.1.** Section 3.3.

Yours without asking: every physics number inside the ranges once the heartbeat is green, the level layouts inside the
teaching order, the look inside the palette, the sounds.

Stephen's, never guessed: price, store, the name, the classroom pack, anything with money.

---

## 11. STEPHEN ONLY

The phone, both ways round: build level 2 from scratch, break it, fix it, film it, send the link to Jessie. The three art
sheets when the Midjourney month allows.

---

## 12. HONEST SIZING

One Opus on two cores. P0 about 2.5 h (the engine is copied, the constraints and the heartbeat tuning are the time), P1 about
2.5 h, P2 about 2.5 h, P3 about 2.5 h: **about 10 hours, the largest of the six.** Expect 5,000 to 6,500 lines. **Where a
single night stops well:** the end of P2 (six levels, stars, sandbox) is a real puzzle game; sound, links, film and the cat
are the morning's session. If the clock says P2 cannot finish, land levels 1 to 3 and `--solve` and leave the fan, balloon
and bucket for the next session; three honest levels beat six untested ones.

---

## 13. EVIDENCE LEDGER (fill in place, with commands and their real output, most recent last)

### P0 step 1, the gate that fails first (2026-09-06)

```
$ node tools/check.js
sim             FAIL  0s

--- sim (wanted: DOOHICKEY TEST OK) ---
Error: Cannot find module '/workspaces/lucid-winds/satellites/doohickey/sim.js'

1 GATE FAILED
```

### P0 steps 2 to 5, the engine with a heartbeat (2026-09-06)

```
$ node tools/check.js
sim             pass  10s
solve           pass  2s
replay          pass  3s
dominoes        pass  30s
mutants         pass  66s

ALL GATES PASSED
```

109 assertions. The replay hash, which is the determinism law as one line:

```
$ node sim.js --replay=100
100 runs of a 12 part machine
  b0550c3b  x100

DOOHICKEY REPLAY OK
```

The heartbeat, a hundred trials at each spacing, each trial with a seeded
jitter of two percent on the gap and a degree on the lean:

```
spacing   trials   all fell   worst last fall
  0.55        100        100            2.52s
  0.65        100        100            2.71s
  0.75        100        100            2.96s

DOOHICKEY DOMINO OK
```

Every level, won by its own solution, inside par, three stars, and none of them
winning with an empty tray:

```
level                    parts  par   goal at   stars  bonus
  The Bell on the Shelf       4    4     2.85s      3  1
  A Row of Dominoes          11   11     3.63s      3  1
  The Gap in the Floor        4    4     3.56s      3  1
  The Fan and the Balloon     1    3     4.04s      3  1
  The Bucket on the Post      6    6     3.77s      3  1
  All Together               12   12     4.24s      3  1,1

DOOHICKEY SOLVE OK
```

The seven mutants, each a single change to a scratch copy, each of which has to
turn the sim gate red:

```
$ node test/mutants.mjs
  ok    the unmutated game passes, so the mutants below mean something
  ok    the gate dies when gravity turned off: a marble dropped on the floor comes to rest on it   [expected about 409, got 120]
  ok    the gate dies when every contact made superelastic: a marble dropped on the floor comes to rest on it   [expected about 409, got 3759.4]
  ok    the gate dies when sleeping disabled: and it is asleep within three seconds
  ok    the gate dies when the rope made into a rod: a slack rope does nothing at all: it does not shove the cargo out to its full length (57.0 apart sideways, the rope is 60)
  ok    the gate dies when the fan cone opened to the whole room: and a balloon behind the fan is not pushed (281 from 250)
  ok    the gate dies when an unspecified sine put back in: the SIM calls no unspecified maths: Math.sin, Math.cos
  ok    the gate dies when the domino cascade broken by friction: and the last of them is down inside four seconds at 0.75 (4.16s)

MUTANTS OK
```

**Three of those mutants survived their first run, and each survival was a real
fault.**

- **The bouncy mutant.** `MARBLE_REST: 2` changed nothing, because the solver
  takes the MINIMUM restitution of the pair and the floor is 0.05. The mutant
  now targets the pair's own number, and a new assertion watches for energy
  being created: a dropped marble may not bounce back higher than it fell from.
  Nothing in the file had been watching for that at all.
- **The rope mutant, twice.** The inequality was written in TWO places, an early
  return and a clamp, so a mutation of either one left the other doing the job
  and no gate could see it. The clamp alone is a complete rope, so the early
  return is gone and the inequality now exists once. And the assertion that was
  meant to catch it ("never longer than its length") is true of a rod as well;
  it now tests the pair SIDEWAYS, where gravity does not act along the rope, so
  any separation that appears came from the constraint.

**Two numbers moved from the plan, both recorded here.**

- `DOMINO_W` 10 to 8. At the 0.55 spacing the plan's ten wide domino left a gap
  of 7.6 units and a leaning domino could not reach the next one: 67 of 100
  trials. At 8 it is 100 of 100 at all three spacings with the plan's friction
  untouched, and it is what a domino looks like.
- The balloon's cargo, 0.5 to 0.16. The cargo has to be lighter than the
  balloon's spare lift or the pair sinks, and close to it or the pair rises so
  fast the fan cannot steer it and the level is a formality.

**One bug the sim found that no gate would have.** The world takes gravity as a
NUMBER and makes the vector itself. Passed a vector it read `{x,y}` as a scalar
and every body integrated to NaN on the first step, silently: no error, no
warning, just a marble at NaN.

**Every level was laid out against the simulator, not by eye.** The first six
were placed by hand and five of them missed: a marble dropped at x=96 sails past
a plank that spans 134 to 226, and the whole board reads as "physics broken"
when it is only arithmetic. The heartbeat had the same fault, and read zero
dominoes for the same reason.

---

## 14. THE OVERNIGHT PROTOCOL

As `plans/fathom/HANDOFF-FATHOM.md` section 14, with `P0, P1, P2, P3` of this file and the browser gates `edit, run,
share, film, layout`.

---

## 15. THE MORNING REPORT

The template in `plans/fathom/HANDOFF-FATHOM.md` section 15, with this file's phases. Add one line: **the domino table**,
pasted.

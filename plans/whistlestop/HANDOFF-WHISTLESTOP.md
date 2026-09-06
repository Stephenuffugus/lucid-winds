# HANDOFF WHISTLESTOP, the build plan for one Opus night

**Written:** 2026-09-05 evening, by Fable, from
`docs/handoffs-uploaded/six-more-20260905/6morehandoffs/HANDOFF-WHISTLESTOP.md` (Stephen's design, read in full) plus the
fleet on branch `add-sproing-jumper` tonight.
**Reads before this one:** `HANDOFF-OPUS-NIGHT-SEP05.md` (the spine), then `plans/fathom/HANDOFF-FATHOM.md` sections 0, 2, 9,
14 and 15, then `plans/doohickey/HANDOFF-DOOHICKEY.md` sections 3.6 to 3.9 and 4 EDITOR (the touch editor rules this game
inherits), then this file, then the design. Where they differ, this file wins; every difference is in section 3.
**Game folder:** `satellites/whistlestop/` (slug free, checked 2026-09-05). **Live URL when Fable lists it:**
`lucidwinds.com/satellites/whistlestop/`.

---

## SESSION STATE (the builder updates this at the end of every session; the morning reader starts here)

- 2026-09-05 Fable: plan written. Nothing built. Next action: section 5, P0, step 1.
- 2026-09-06 builder (Fable review pass, 14:03 to 14:35 UTC, shared tree, four builders on one gate lock): **puzzles 3, 4 and 5 built as data** (The Passing Loop par 1, Three Trains par 3, Round and Round par 1), each proved by `sim.js --solve` (five rows, `WHISTLESTOP SOLVE OK`; the gate watched to fail on a copy with Round and Round's train sent the trailing way: `never  0  NO WIN  NOT THREE STARS`, exit 1). `sim.js --test` 164 assertions. Swap (puzzle 6) NOT built: a dead end siding cannot swap two trains (docs/DECISIONS.md), it needs its own shape. Visual fixes: the bump names the train at fault (flag says 'bumped', pink tint); the whistle shares the tray's bottom edge in portrait; the fit leans the railway toward the tray and the rug spans the play band; The Crossing's blue line runs up the rug so the stations are top right and bottom right. Stamp 20260906d in all three places, lint green. **Browser gates:** the first full `tools/check.js` was red on `build` (portrait tap on a piece picked nothing after the whistle and tray moved) and `layout` (the gate counted two puzzle cards). The whistle, tray and rug band changes were REVERTED unshot, the layout count rebased to five, and the third full run at 14:25 UTC is `ALL GATES PASSED`, twelve of twelve (`sim lint solve lap mutants boot build run share sound layout thumb`), commit `d00607d9` plus this one. **Still open from the report, untouched or reverted:** the whistle alone on the floor strip, the hundred pixel dead band above the tray, the crossing spurs' shapes. **Shot and opened:** none in this window; the gate lock was shared by four builders and a shot run queued behind them. Next action: `flock -w 1800 /tmp/sws-gate.lock node tools/shots.mjs p2` then OPEN `docs/shots/p2-crossing-wide.png` and `p2-bump-wide.png` (the blue line now runs up the rug, the flag should say 'Red bumped' in pink at the bump) and name three faults; then the whistle and tray in portrait again, this time shot at 375x667 BEFORE the gate, with the tray kept two rows deep; then Swap as its own shape.
- 2026-09-06 Opus B: **DONE P3.** All four phases built and green. Twelve gates in `tools/check.js`, every one watched to fail, both columns in section 13. Twenty six screenshots opened with the Read tool; eleven real faults came out of them and are listed in section 13. Morning report in section 15, with puzzles 3 to 6 designed as data. Nothing is half finished.
- 2026-09-06 Opus B: P0 DONE. Six gates green (`sim` 131 assertions, `lint`, `solve`, `lap`, `mutants` 13, `boot`), every one watched to fail, output pasted in section 13. Four of the thirteen mutations survived the first run and all four were holes in my own assertions; all four assertions rewritten. Next action: section 5, P1, step 1, VIEW and EDITOR in `index.html` (the rug, the tray, snapping with the klk, the chime, undo and redo, pan and zoom, the handles).

---

## 0. RULES OF ENGAGEMENT

As `plans/fathom/HANDOFF-FATHOM.md` section 0 with `whistlestop` for `fathom`. One law particular to Whistlestop: **the
track is a graph and the train is an arc length.** Nothing moves by pixels; a train's position is an edge id and a distance
along it, and every car behind the engine is a distance behind on the path the engine took. That is why the cars never
jackknife on a curve and why a puzzle solution replays the same on every phone.

---

## 1. WHAT WHISTLESTOP IS, AND WHY IT IS WORTH A NIGHT

From the design: *"A wooden train set on a sunlit rug, in your browser, instantly. Snap curves, straights, bridges, and
junctions together; drop a little train on; it chugs. Then the twist the toy always begged for: you work the switches. Add
a second train, then a third, tap junctions to route them, keep them from meeting nose to nose, get every train home."*
Positioning line: **"You've built the track. Now run the railroad."**

Why it is worth a night: BRIO's own app owns decoration, and nobody has the instant, shareable, systemic version. The graph
and the arc length follower are a hundred lines with exact gates (a loop closes, a lap returns, spacing holds through a
curve); the editor inherits Doohickey's rules; the puzzles carry their solutions. It is fourth in the second six because it
is a full builder plus a puzzle game, and the puzzles are the part worth protecting.

---

## 2. STATE OF THE INHERITANCE (verified by Fable 2026-09-05; trust this over any doc)

| Need | Copy from | What to take |
|---|---|---|
| The touch editor rules | `plans/doohickey/HANDOFF-DOOHICKEY.md` sections 3.6 to 3.9 and 4 EDITOR | Tray dock, drag out with a ghost, big handles above the finger, undo and redo 20 deep, no lost pieces (drag off the scene returns to the tray), two finger pan and zoom, a tap during RUN stops and restores |
| Undo and redo, share by link, pinch | `satellites/blockspace/index.html` 310 and 333 (undo), 1060 to 1080 (link); `satellites/abduct-a-chameleon/index.html` 1298 (pinch) | As in the Doohickey plan. Whistlestop uses `#l=` |
| A level with an authored solution as the gate | `plans/doohickey/HANDOFF-DOOHICKEY.md` section 4 LEVELS and 5 P2 step 3 | Each puzzle carries `solution` (lever flips with times) and `--solve` runs it; the empty solution must fail |
| Scaffold, RNG, page tests, `sim.js`, `sw.js`, manifest, icons, portal protocol, music hook, gate runner, browser gate shape, thumb and icon tools | `plans/fathom/HANDOFF-FATHOM.md` section 2 | Same files, `whistlestop` in place of `fathom` |
| Manifest with orientation `any` | `satellites/blackout/manifest.webmanifest` | Both orientations |

Not inherited: any physics engine (trains follow arcs; there is no collision physics, only a stop rule), three.js.

---

## 3. CORRECTIONS TO THE DESIGN (binding; each forced by a measurement or a fleet law)

3.1 **Studio and deploy.** Sky Wolf Studio. Hostinger from `main`, pushed by Fable.

3.2 **Puzzle mode is in the slice, two puzzles.** The design recommends it; taken.

3.3 **Collision is bump stop in the sandbox; a pass through option is not built.** The design recommends bump stop; the
ghost option is a morning question, not a night's work.

3.4 **The piece vocabulary and its geometry are frozen.** One unit `U` = 64 world units. Straight `1 U`; half straight
`0.5 U`; curve: a 45 degree arc of radius `2.85 U` (the wooden toy's eight curves make a circle of about 5.7 U across);
Y junction: a straight `1 U` plus a 45 degree branch curve leaving the same start node; crossing: two `1 U` straights at
90 degrees sharing a centre with no connection. Bridges and risers are v1.1.

3.5 **Snap is a rule with numbers.** An open end within `0.35 U` and 20 degrees of another open end snaps: the piece
translates and rotates to match exactly and the two nodes merge. Closing a loop (a snap whose two ends belong to the same
connected component) plays the chime.

3.6 **Junction routing is real railroading.** A train entering a Y at its base takes the branch the lever points to; a
train entering from either branch runs through to the base regardless of the lever (a trailing switch). Levers flip while
trains run; a flip under a train that is currently on the junction edge does nothing until it leaves.

3.7 **Trains have three speeds and a stop, and cars follow at a fixed spacing along the engine's path history.** Spacing
`0.55 U`; the history is a ring of `(edge, s)` samples long enough for six cars.

3.8 **Both orientations, puzzles authored for landscape 16:9, letterboxed in portrait.** As Doohickey 3.2.

3.9 **Stars are defined.** One: every train home. Two: at most par lever flips. Three: two, plus no train ever stopped
(the collision stop or the player's stop).

3.10 **Copy.** No dashes, no exclamation points. Trains are named by the player; the default names are colours (Red,
Blue, Green).

---

## 4. ARCHITECTURE LAW

Files (all inside `satellites/whistlestop/`):

```
index.html            the game
sim.js                --test, --solve (every puzzle's solution wins and the empty one does not), --lap=<layout>
sw.js  manifest.webmanifest  icon-192.png  icon-512.png  icon-maskable-512.png
tools/check.js  tools/icons.mjs  tools/thumb.mjs  tools/shots.mjs
test/build.mjs  test/run.mjs  test/share.mjs  test/layout.mjs
docs/DECISIONS.md  docs/shots/  BUILD-NOTES.md  ART_ASSETS.md
```

Layers: `CONFIG, RNG, PIECES, GRAPH, TRAINS, SIM, PUZZLES, VIEW, EDITOR, AUDIO, SHARE, SAVE, TEST, BOOT`. `SIM_EXPORT`
markers wrap CONFIG through PUZZLES.

**CONFIG (frozen):**

```
GAME_ID 'whistlestop'  SAVE_KEY 'lw_whistlestop_v1'  SAVE_V 1
U 64  SCENE_W 1024  SCENE_H 576 (16 by 9 U)
CURVE_R 2.85 (U)  CURVE_DEG 45  SNAP_DIST 0.35 (U)  SNAP_DEG 20
SIM_HZ 60  SPEEDS [0, 1.2, 2.4, 3.6] (U per second)  CAR_SPACING 0.55 (U)  CARS_MAX 6  TRAINS_MAX 4
PIECES_MAX 200  UNDO_MAX 20  RUN_MAX_S 120
TAP_SLOP 10  PINCH_MIN_D 30  ZOOM [0.5, 2.0]
```

**PIECES** (data): `{type, length or arc, ends: [{x, y, heading}] in local units}` for straight, half, curveL, curveR, yL,
yR, cross.

**GRAPH.** `nodes: [{x, y, heading, ends: [edgeIds]}]`, `edges: [{piece, from, to, kind: 'line'|'arc', len, geometry}]`,
`junctions: {nodeId: {base, left, right, lever}}`. `snap(piece, x, y, rot)` finds the nearest open end pair inside the
tolerance, transforms the piece, merges the nodes; `remove(piece)` splits them back. `pointAt(edge, s)` and
`headingAt(edge, s)` from the geometry. `components()` for the loop chime.

**TRAINS.** `{name, colour, edge, s, dir, speed, cars, history}`; `advance(train, dt)` moves `s` by `speed * dt`, crosses
nodes by the junction rule (3.6), reverses at a dead end with a bump, and pushes `(edge, s)` into the history every
`0.05 U`; each car's position is the history point `CAR_SPACING * i` behind.

**SIM.** `step(state, dt)`: advance every train, then the collision rule: two trains whose engine or any car overlap on the
same edge within `0.5 U` (or on adjacent edges at a shared node) both stop, `collided` set; the puzzle goal test (every
train at its station node with speed 0 or passing through it if the puzzle says "arrive"); events (`snap`, `loop`,
`whistle`, `bell`, `clonk`, `flip`).

**PUZZLES.** Two in the slice, each `{name, layout, trains: [{start edge, s, dir, home node}], levers: initial states, goal,
par, solution: [{atS, junction, to}]}`: (1) The First Switch: one train, one Y, route it to the red station. (2) The
Crossing: two trains, one crossing, one Y each; time the flips so neither meets. The design's teach ramp continues in the
morning report as a list for the next session (the passing siding is puzzle 3).

**VIEW.** Canvas 2D. The rug (drawn weave; a painted tile later), the wooden track (light wood with a darker groove, the
rails as two lines), the levers as small wooden handles at the junction with a painted arrow, chunky engines and cars with
name flags, props as decor only (tree, station, tunnel mountain, cow that looks up, water tower), the tray dock. Camera
fits the scene; two finger pan and zoom. Reduced motion: no steam puffs, no cow.

**EDITOR.** The Doohickey rules; pieces snap on drop; rotation is decided by the snap, a free piece rotates by the dial in
45 degree detents; a piece with both ends open can be flipped (curveL to curveR).

**AUDIO.** Synthesised: clickety clack (two short noise taps per `0.5 U` per bogie, rate by speed), the whistle (two sines
a fourth apart with a soft attack, 500 ms), the snap klk, the loop chime (a rising triad), coupling clack, station bell, the
collision clonk and a steam huff (filtered noise), the cow (a low sawtooth moo, once a minute at most).

**SHARE.** `#l=` = the piece list `(type, x, y, rot)` in `0.05 U` steps plus trains and lever states; opening a link
assembles the layout piece by piece over 3 s with the klk per piece.

**SAVE.** `lw_whistlestop_v1`: `{v, stars, sandbox: [3 layouts], names, settings:{sound, motion}, seen:{how}}`.

**TEST.** Deepwell's harness; floor 60.

---

## 5. THE PHASES, WITH GATES

Every gate is watched to fail once before it counts.

### P0. The graph and the follower (about 1.5 hours)

1. Scaffold. PIECES, GRAPH, TRAINS, SIM.
2. `sim.js --test`: eight right curves snapped in sequence close into a loop (the last snap merges with the first node
   within 0.01 U, `components()` is 1, the `loop` event fires); a straight fails to snap at 0.4 U and snaps at 0.3 U; a
   train on that loop returns to its start `s` after `8 * arc length` of travel within 0.01 U; six cars behind an engine
   through a full curve keep `CAR_SPACING` within 0.02 U between every pair; a Y with the lever left sends a train left and
   with it right sends it right; a train entering from a branch reaches the base whatever the lever; two trains
   approaching on one straight stop with `collided` and neither passes the other; a dead end reverses; the same layout and
   flips give the same state after 60 s; serialisation round trips 200 random layouts; `--solve`: both puzzles' solutions
   bring every train home, and each puzzle with no flips does not.
3. Watch it fail: set `SNAP_DEG` to 0 and the loop goes red; set `CAR_SPACING` handling to move cars by the engine's
   delta and the curve spacing goes red.

### P1. Building, running, switching (about 2.5 hours)

1. VIEW and EDITOR: the rug, the tray, snapping with the klk, the chime, undo and redo, pan and zoom, the handles.
2. **Stop and feel test.** Snap ten pieces into a loop with no train. Shoot `docs/shots/p1-loop.png` at 667x375 and
   375x667. Open them. The design says this must be satisfying with zero trains; if the pieces read as flat grey shapes,
   the wood grain, the groove and the shadow under each piece are wrong, and you fix them before trains.
3. Trains: place, whistle, three speeds, stop, cars, the levers, the collision stop and huff.
4. `test/build.mjs` (browser, real pointers at 667x375): eight real drags from the tray's curve tile, each dropped near
   the previous open end, produce one loop and the chime event; UNDO removes the last piece and reopens the end; a drag of
   a piece off the scene edge returns it to the tray; two real fingers spreading zoom the view.
5. `test/run.mjs` (browser): a real tap on the whistle starts a placed train; a real tap on a lever flips it and the
   train takes the other branch (the sim's edge sequence differs); a real tap on the train cycles its speed; two trains
   on a collision course stop with the clonk event.
6. `test/layout.mjs`: 48 px in both orientations; the bottom left 120x120 empty in EDIT.

### P2. Puzzles, stars, share (about 2.5 hours)

1. PUZZLES 1 and 2, the puzzle shell (goal card, stars, NEXT), the sandbox with three slots, names and flags.
2. SHARE and the self assembling montage; `test/share.mjs`: a sandbox layout's link opens in a fresh context, assembles
   the same piece count, and its trains run.
3. Props, the cow, the sounds pass.

### P3. Polish (about 1.5 hours; where a night may stop)

1. Reduced motion, the how card, the whole first minute copy.
2. `tools/shots.mjs` at 915x412, 667x375, 412x915, 375x667; `tools/thumb.mjs` (a loop with two trains and a station);
   `ART_ASSETS.md`, `BUILD-NOTES.md`, the morning report with puzzles 3 to 6 designed as data for the next session.

---

## 6. THE SCREENS (both orientations; 48 px rendered at 375 wide and at 667 wide)

- **Title.** BUILD (56 px, the sandbox), PUZZLES (48), HOW (48). Bottom left empty.
- **Build.** The rug; the tray dock (landscape bottom, portrait below the letterboxed scene) with 56 px piece tiles;
  TRAINS (48, opens the train tray: engine colours, cars); undo and redo top left (48 each); menu top right (48): Save
  slot, Share, Clear, Settings. Levers and trains are tapped in place. First boot: "Drag a piece. It snaps." then "Tap the
  whistle." and never again.
- **Puzzle.** The layout fixed; the goal line ("Get Red to the red station. One flip is par."); the whistle (56 px)
  starts the run; levers tapped in place; RESET (48); the star card at the end with NEXT (56) and MENU (48).
- **Puzzles list.** Cards 64 px with stars; locked past the last cleared plus one.
- **How.** Three lines: "Drag pieces from the tray. Ends snap together." "Tap the whistle. Tap a train to change its
  speed." "Tap a switch to send the next train the other way."
- **Settings.** Sound, Motion, About: "Sky Wolf Studio".

One page; `ready` once.

---

## 7. ART (what Stephen can make this month; the game never waits on it)

Three sheets in `plans/whistlestop/ART-PACK-WHISTLESTOP.md` (a copy in 012Assets as `Whistlestop — Art Pack`). The
track and the trains are drawn by code and stay drawn (they must rotate and snap).

| File | Used for | Delivered | In game |
|---|---|---|---|
| `rug.png` | the ground, tiled | 1:1 tile | `art/rug.jpg` 1024x1024 q75 |
| `props.png` | tree, station, tunnel mountain, cow, water tower on white, one sheet | 1:1 | `art/prop-<name>.png` cut and keyed by Fable |
| `icon-mark.png` | PWA icon, if better than the drawn one | 1:1 | 512, 192, maskable 512 |

---

## 8. LISTING ON THE ARCADE (Fable does the portal edit)

```
{nm:"Whistlestop", ds:"Snap a wooden train set together on the rug, pull the whistle, and then work the switches so three little trains all get home without meeting nose to nose.", cat:"puzzle", url:"/satellites/whistlestop/?v=<stamp>", ic:"🚂", thumb:"/portal-assets/thumbs/whistlestop.png", beta:true, fresh:true}
```

Must be true first: thumb under 150 KB; the live URL answers with the stamp; ALL GATES PASSED with `--solve` in it;
`test/build.mjs` and `test/run.mjs` passed with real pointers; the loop shot was opened and judged.

---

## 9. PITFALLS (studio scars that apply here, learn them free)

- Everything in `plans/fathom/HANDOFF-FATHOM.md` section 9 and `plans/doohickey/HANDOFF-DOOHICKEY.md` section 9 (the
  editor scars: the ghost is the real shape, `pointercancel`, a captured pointer ending off canvas, links are stranger
  data).
- Merging two nodes must reconcile headings: one end's heading is the other's plus 180 degrees; a piece snapped with
  matching headings instead of opposite ones is a track that doubles back on itself and the follower spins.
- Arc length on a curve is `R * angle`; a follower that steps by the chord drifts a little every lap and the loop gate
  catches it.
- A car computed from the engine's current edge rather than its history clips corners; the spacing gate catches it.
- A lever flipped while a train is on the junction edge must wait; otherwise a train teleports between branches.
- Removing a piece under a train: the train stops at the gap with a bump and the piece returns to the tray; never delete
  a train's edge from under it silently.
- Three trains on one loop at three speeds is the ambience goal and also the perf test; the clickety clack rate must cap
  its noise taps per second.

---

## 10. DECISION RIGHTS AND OPEN QUESTIONS

The design's three open questions take these answers tonight:

1. **Name: WHISTLESTOP.** Stephen's folder and title; Clickety and Sidings stay in the morning report.
2. **Puzzle mode in the slice, two puzzles.** Section 3.2.
3. **Bump stop; no ghost option.** Section 3.3.

Yours without asking: the wood look, the engine shapes, the prop set, the puzzle solutions' timings, the sounds.

Stephen's, never guessed: price, store, the name, the brother's consult, Penny's livery, anything with money.

---

## 11. STEPHEN ONLY

The phone, both ways round: build a loop with a Y, run two trains, flip the switch under pressure, send the layout to
Jessie. The three art sheets when the Midjourney month allows.

---

## 12. HONEST SIZING

One Opus on two cores. P0 about 1.5 h, P1 about 2.5 h, P2 about 2.5 h, P3 about 1.5 h: about 8 hours. Expect 3,800 to 4,800
lines. **Where a single night stops well:** the end of P1 (build, run, switch, collide) is the toy; the two puzzles make
it the game and are the first thing the next session finishes if the night stops early. If the clock says P1 cannot
finish, land snapping and one running train and skip the levers; a loop with a train is already a rug on a Sunday.

---

## 13. EVIDENCE LEDGER (fill in place, with commands and their real output, most recent last)

### P0 step 1, 2026-09-06. The gate, before there is anything to gate.

`tools/check.js` written with one gate, `sim` (`node sim.js --test`, wants `WHISTLESTOP TEST OK`).
There is no `sim.js` yet, so it is red, which is the point.

```
$ flock -w 2400 /tmp/sws-gate.lock node tools/check.js
sim             FAIL  0s

================================================================

--- sim (wanted: WHISTLESTOP TEST OK) ---

Error: Cannot find module '/workspaces/lucid-winds/satellites/whistlestop/sim.js'
    at Module._resolveFilename (node:internal/modules/cjs/loader:1456:15)

(tail)
  code: 'MODULE_NOT_FOUND',
  requireStack: []
}

Node.js v24.14.0


1 GATE FAILED
```

### P0 steps 1 to 3, 2026-09-06. The scaffold, and the gates watched to fail.

Built: `index.html` with CONFIG, RNG, DMATH, PIECES, GRAPH, TRAINS, SIM, LAYOUTS, LINKS and PUZZLES between the
SIM_EXPORT markers, the TEST harness between the TEST_EXPORT markers, a minimal VIEW that paints the rug and the
track, `sim.js`, `sw.js`, the manifest, three icons, `tools/lint.mjs`, `test/harness.mjs`, `test/boot.mjs` and
`test/mutants.mjs`.

```
$ flock -w 2400 /tmp/sws-gate.lock node tools/check.js
sim             pass  0s
lint            pass  0s
solve           pass  0s
lap             pass  0s
mutants         pass  5s
boot            pass  3s

ALL GATES PASSED
```

```
$ node sim.js --test
PASSED 131 / FAILED 0   (total 131)
WHISTLESTOP TEST OK

$ node sim.js --solve
  puzzle                  trains  par  flips   home at   stars   nothing at all
  The First Switch           1     1     1     3.10 s      3   never gets home
  The Crossing               2     3     3     6.73 s      3   never gets home

WHISTLESTOP SOLVE OK

$ node sim.js --lap=40      (a follower that steps by the chord loses ground every lap)
  lap   drift from the start
    1   0.000000 U
   40   0.000000 U
WHISTLESTOP LAP OK

$ node sim.js --race        (the tuning instrument for the second puzzle)
  nothing at all                  red at the crossing never,  blue 2.28 s,  still out there
  Red sent the right way only     red at the crossing never,  blue 2.28 s,  BUMP
  the whole solution              red at the crossing 2.33 s,  blue 6.12 s,  home in 6.73 s
```

**Watched to fail.** The plan's step 3 named two; `test/mutants.mjs` now carries thirteen, and every one of them has
to turn a NAMED assertion red, not merely turn something red.

```
$ node test/mutants.mjs
  ok    the shipped rules pass before anything is broken
  ok    when joints only merge when they are exactly on top of each other, "the eighth curve closes the ring" goes red (12 red)
  ok    when a car is worked out from the edge the ENGINE is on, not the route it took, "and every coupling holds its spacing through a curve" goes red (6 red)
  ok    when every switch is a facing switch, so coming back up an arm obeys the lever, "a train coming back down the straight arm reaches the base with the lever one way" goes red (4 red)
  ok    when a collision stops the trains but leaves them inside each other, "and neither ever got inside the other" goes red (1 red)
  ok    when a route once recorded is never re-derived, so a thrown lever is ignored, "The Crossing: its own solution gets every train home" goes red (5 red)
  ok    when nothing ever snaps, so every piece lands where the finger dropped it, "an end three tenths of a unit away does snap" goes red (5 red)
  ok    when a curve is as long as the straight line across it, not the way round, "a curve is a forty five degree arc of the wooden radius" goes red (6 red)
  ok    when a shared rug forgets which way round each piece was, "and with every piece back where it was" goes red (2 red)
  ok    when a shared rug is rebuilt from the rounded numbers without re-snapping, "and every joint on every rebuilt rug is properly closed" goes red (1 red)
  ok    when a train runs straight past its own station, "The First Switch: its own solution gets every train home" goes red (6 red)
  ok    when the trains on two separate rings can stop each other through thin air, "and neither ring stops the other" goes red (1 red)
  ok    when a train that hits the buffer keeps going, "and its arc length never once leaves the rails" goes red (9 red)
  ok    when the rules reach for the built in sine nobody has pinned down, "the rules call no maths nobody has pinned down" goes red (1 red)

MUTANTS OK
```

**⛔ FOUR OF THOSE THIRTEEN SURVIVED THE FIRST RUN, AND ALL FOUR WERE HOLES IN MY OWN ASSERTIONS, NOT IN THE GAME.**
This is the Inkswing scar in a different costume: an assertion that cannot fail reports pass.

1. *A collision leaves the trains inside each other.* The assertion asked how far apart they FINISHED, which a sim that
   lets them overlap and then stops them satisfies perfectly. It now measures the CLOSEST they ever came, over the
   whole run, against the bump distance.
2. *A train that hits the buffer keeps going.* `bodyPose` clamps a body to the recorded route, so a train whose arc
   length had run clean off the end still DREW on the last sleeper. The assertion now reads the arc length itself.
3. *A shared rug rebuilt without re-snapping.* Every count came back right, because the merge tolerance is wider than
   the link's grid, so the graph was identical and the geometry was open at every joint. There is now a `worstJoint`
   measurement and an assertion on it.
4. *Two rings side by side stopping each other through thin air.* The rig HOPED the two trains would arrive at the
   near point together. The three speeds are whole ratios of one another, so two trains on two identical rings repeat
   their whole dance every fifteen seconds, and a forty second run never brought them within two thirds of a unit.
   The rig now searches for the nearest pair of points on the two rings and puts a train on each of them.

**Looked at.** `docs/shots/p0-rug-wide.png` (the title) and `docs/shots/p0-track-wide.png` and `p0-track-tall.png`
(the scaffold's rug and track). Opening the second one found a real bug no gate could see: **every button marked
`hidden` in the markup was on the screen**, because each one sets `display:flex` in its own id or class rule and an id
rule beats the user agent's `[hidden]{display:none}` on specificity. The whistle, the trains button, undo and redo
were all sitting on the title screen. Fixed with one `[hidden]{display:none!important}` line, which is now commented
as load bearing.

Three faults named in `p0-track-tall.png` after the fix: the track is one flat ribbon a single value step from the rug
with no rails, no sleepers and no shadow, so it reads as a road marking rather than as wood (that is P1 step 2's whole
job); the two arms stop dead with a butt cap, no buffer and no station, so the railway looks unfinished; and the
railway sits high, leaving the bottom of the rug empty, which the tray will fill in P1.

Two things changed because of the shots: the rug now grows to cover the room instead of sitting in a letterbox band
with the floor filling half the picture, and the first puzzle was re-laid out from ten units by two (a thread on a
phone held upright) to nine by four with its two arms going up and down.



### P1 to P3, 2026-09-06. The whole plan, and the eleven things the screenshots found.

```
$ flock -w 2400 /tmp/sws-gate.lock node tools/check.js
sim             pass  0s
lint            pass  0s
solve           pass  0s
lap             pass  0s
mutants         pass  5s
boot            pass  3s
build           pass  5s
run             pass  3s
share           pass  7s
sound           pass  2s
layout          pass  10s
thumb           pass  2s

ALL GATES PASSED
```

**Watched to fail.** The five browser gates were each broken on purpose against a backed up copy of
`index.html` and watched go red on the assertion that guards the rule:

```
=== BUILD: the editor is not allowed to turn the piece to fit ===
  FAIL  landscape: and they close into one ring (0 loops)
  FAIL  landscape: every snap made the klk (0)
=== RUN: the thumb radius on a painted control drops to 8 px ===
  FAIL  the switch answers a thumb landing anywhere inside 46 px of its middle (1 of 5 presses took)
=== LAYOUT: the handles row is 40 px instead of 48 ===
  FAIL  667x375 the handles: and every one is a 48 px target (40x40 40x40 40x40)
=== SHARE: the link forgets which way round each piece was ===
  FAIL  and it is the same shape of railway (0 loops, 10 railways, 21 open ends)
=== SHARE: the rug is rebuilt without re-snapping ===
  FAIL  and every joint on it is properly closed (0.021573 U at the worst)
=== SOUND: the chime falls instead of rising ===
  FAIL  the loop chime RISES: its top note arrives after its bottom one (early 0.03501, late 0.00009)
=== SOUND: the whistle is one note, not two ===
  FAIL  and both of its notes are really in there (660 Hz 0.0601, 880 Hz 0.0002)
=== SOUND: the clack budget is removed ===
  FAIL  and the clack is budgeted, not one tap per bogie per sleeper (302 in a second)
```

**The build gate found the editor's real flaw, which no amount of headless testing would have.**
The plan's snap rule (3.5) is an end within a third of a unit AND twenty degrees. That is exactly
right for a piece already lying at the correct angle, and useless for one just out of the tray:
eight real drags of the curve tile put eight loose curves on the rug and nothing snapped to
anything, because a curve offered to an end that faces up and to the right is forty five degrees
out of true. The editor now offers the piece at each of its eight detents and keeps the nearest
snap, which is what a hand does with a real wooden piece. **The rule in section 3.5 is unchanged
and the sim gate still holds it exactly as written.**

**Eleven things the screenshots found that no gate could see.** This is the whole argument for
LOOKING IS PART OF THE JOB and it is worth reading as a list:

1. **Every button marked `hidden` was on the screen.** Each one sets `display:flex` in its own id
   or class rule, and an id rule beats the user agent's `[hidden]{display:none}` on specificity.
   The whistle, the trains button, undo and redo were all sitting on the title screen.
2. **The camera did not know where the chrome was**, so the bottom of every layout sat under the
   tray and the top under the undo row. Found three times over: the tray, then the goal line, then
   the win card, each of which takes a band of the screen the camera was fitting the game behind.
3. **The joints read as beads on a string.** They were drawn after the grooves in the light tone,
   so a closed loop was a necklace rather than a length of wooden track.
4. **The whole picture was one tone of tan.** Pale wood on a pale rug in the same hue: nothing read
   at a glance except the two grooves. The rug is a clay wool now and the wood is the lightest
   thing in the room, which the boot gate holds at forty points of luminance.
5. **Every tray tile fitted its own piece to its own box**, so a half straight was drawn exactly as
   long as a full one and the two tiles a child has to choose between were identical.
6. **A sprite rotated past a quarter turn is upside down.** A train running west had its chimney
   pointing at the floor and its cab roof underneath it.
7. **The bodies were 0.6 U long on a 0.55 U coupling**, so every train drew as one continuous
   caterpillar and you could not see where the engine ended.
8. **A still picture of a running railway was identical to a parked one.** There is steam now, and
   it leaves the funnel rather than a hand's width above the roof.
9. **Nine props at nine random points read exactly as random as it was**, and three drafts of the
   fix placed the groups against whatever the camera happened to be showing at that instant, and
   three times the camera moved afterwards. Scenery cannot chase a camera.
10. **Which station is which IS the second puzzle**, and the stations were tan boxes with a colour
    band four pixels tall. The canopy is the colour now, with a flag, and a station stands beside
    its line rather than on top of it.
11. **The bump drew nothing at all.** Two trains met and simply stopped, in a picture identical to
    two trains parked, which is the one moment the second puzzle is entirely about.

And the title screen was a flat clay rectangle: the one screen whose whole job is to say wooden
train set said nothing at all. It runs a little railway behind a scrim now.

**Four holes in my own gates, all of which reported PASS on broken code.** Three were caught by
`test/mutants.mjs` on its first run and one by a flake:

1. *A collision leaves the trains inside each other.* The assertion asked how far apart they
   FINISHED, which a sim that lets them overlap and then stops them satisfies perfectly. It
   measures the closest they ever came now.
2. *A train that hits the buffer keeps going.* `bodyPose` clamps a body to the recorded route, so a
   train whose arc length had run clean off the end still DREW on the last sleeper.
3. *A shared rug rebuilt without re-snapping.* Every count came back right, because the merge
   tolerance is wider than the link's grid.
4. *Two rings side by side stopping each other through thin air.* The rig HOPED the two trains
   would arrive at the near point together. The three speeds are whole ratios of one another, so
   two identical rings repeat their whole dance every fifteen seconds and a forty second run never
   brought them within two thirds of a unit.

Plus two assertions that could not fail: one about the turn handle that ended in `|| <the previous
assertion>`, and a lever measured five times against where it was before the first press, when
throwing a lever moves it.

**And one flake that was a real ambiguity.** `test/run.mjs` went red once in every two or three
runs on identical code. It was not contention: a train reaches the switch in the first puzzle in
under a second, and levers were checked before trains unconditionally, so a press meant for the
engine landed on the lever beside it. Nearest wins now, and the gate stands a train exactly on a
switch and presses it rather than avoiding the case.

```
$ node sim.js --test
PASSED 131 / FAILED 0   (total 131)

$ node sim.js --solve
  puzzle                  trains  par  flips   home at   stars   nothing at all
  The First Switch           1     1     1     3.10 s      3   never gets home
  The Crossing               2     3     3     6.73 s      3   never gets home

$ node tools/thumb.mjs
  docs/thumb.png  84 KB   512x512   lit 67%  wood 6.0%  red 14.41%  blue 0.47%
THUMB OK
```

---

### 2026-09-06 afternoon, puzzles 3 to 5 (builder on the shared tree)

`node sim.js --solve` after the three puzzles went in as data:
```
  puzzle                  trains  par  flips   home at   stars   nothing at all
  The First Switch           1     1     1     3.10 s      3   never gets home
  The Crossing               2     3     3     6.73 s      3   never gets home
  The Passing Loop           2     1     1     4.55 s      3   bumps
  Three Trains               3     3     3     4.58 s      3   bumps
  Round and Round            1     1     1    12.28 s      3   never gets home

WHISTLESTOP SOLVE OK
```
Watched to fail: a scratch copy with Round and Round's train sent the trailing way round the ring (`dir: -1`), run through `WHISTLESTOP_HTML=<copy> node sim.js --solve`:
```
  Round and Round            1     1     1      never      0   never gets home   NO WIN   NOT THREE STARS

2 PUZZLE PROBLEM(S)
exit=1
```
`node sim.js --test`: `PASSED 164 / FAILED 0 (total 164)` (was 131; the puzzle suite loops every puzzle). `node sim.js --race` after the blue line was turned to run up the rug: red at the crossing 2.33 s, blue 6.12 s, home in 6.73 s, the same numbers as before the turn, because the blue line is the same length. `tools/lint.mjs`: `LINT OK` at stamp 20260906d.

First full `tools/check.js` on the change (14:15 UTC): ten green, `build` and `layout` red. `layout` was the gate's own count of puzzle cards (2, now 5) and was rebased to `PUZZLE_COUNT = 5`. `build` failed in portrait only, on the tap in the middle of piece 3 picking nothing (-1); the one change that moves the railway on screen was the fit bias toward the tray, and it was REVERTED rather than tuned, because there was no time to shoot it. The dead band fault in the report stays open. Second run of `build` alone and the full suite: see SESSION STATE.

## 14. THE OVERNIGHT PROTOCOL

As `plans/fathom/HANDOFF-FATHOM.md` section 14, with `P0, P1, P2, P3` of this file and the browser gates `build, run,
share, layout`.

---

### The last run of the night, 2026-09-06. A gate that was recording the room.

The suite had been green for hours. Run it once more before stopping and the
sound gate went red on one line:

```
--- sound (wanted: SOUND OK) ---
  ok    and a station bell is nothing like a buffer (1227 Hz against 288 Hz)
  FAIL  and a cow is the lowest thing on the rug (501 Hz)
  ok    three trains at full speed do clack (180 in a second)

1 SOUND FAILURE(S)
```

The protocol says rerun it alone twice and two passes is a pass. It passed twice:

```
=== run 1 ===
  ok    and a cow is the lowest thing on the rug (375 Hz)
SOUND OK
=== run 2 ===
  ok    and a cow is the lowest thing on the rug (375 Hz)
SOUND OK
```

**That is not a flake and banking it would have been the wrong call.** 375 and 501
out of three fixed oscillators with no noise in them is not core contention, it is
two different sounds. The cause: this gate swaps the game's audio context for an
OfflineAudioContext and then AWAITS the render, and the game does not stop for
that. The title screen runs a demo layout, its trains clack over every joint, and
every one of those clacks was being scheduled onto the offline context, because
that is the context the game's own AUDIO object was pointing at. **The gate was
recording the cue plus the room.**

Proved by rendering the same cue twice in one page, once with a door on play and
once with six of the game's own clacks let in:

```
  door SHUT (only the cow) : 375 Hz   -> PASSES
  door OPEN (cow + 6 clacks): 879 Hz   -> FAILS
```

Fixed in the gate, not in the game and not in the threshold: every capture now
wraps `A.play` so only the cue being recorded reaches the offline context. Full
suite twice after:

```
sim pass, lint pass, solve pass, lap pass, mutants pass, boot pass, build pass,
run pass, share pass, sound pass, layout pass, thumb pass
ALL GATES PASSED          (twice)
```

**The lesson, which is the sixth of its kind tonight: a green rerun is an answer
to the question "does it pass", and the question was "why did it not".**


## 15. THE MORNING REPORT

### Morning report, 2026-09-06, Whistlestop

**Phases:** P0 done (`25f6185c`, `d9a8871f`), P1 done (`532a0492`, `fcc16293`), P2 done
(`e6ab75b0`, `26d62941`, `3b63fa82`), P3 done (`83404bee` and the commit this report is in).
Whistlestop is **DONE P3**.

**Gates:** `ALL GATES PASSED`, twelve of them, none skipped:
`sim lint solve lap mutants boot build run share sound layout thumb`.
131 assertions in `sim.js --test`, thirteen mutations in `test/mutants.mjs`, and every browser gate
watched to fail on the assertion that guards its rule. Both columns are in section 13.

**The last gate of the night went red and it was right to.** The sound gate failed on the cow, then
passed twice when rerun alone, which the protocol calls a pass. It was not one. The gate swaps the
game's audio context for an offline one and then awaits the render, and the game keeps playing into
it the whole time, so it was recording the cue plus the demo layout's trains. Same cue, one page:
375 Hz behind a door, 879 Hz with six of the game's own clacks let in. Fixed in the gate, not in the
threshold, and the suite is green twice since. The whole of it is at the end of section 13.

**Play it:** `satellites/whistlestop/index.html`. The title runs a little railway behind it. BUILD
opens one of three rugs; drag pieces out of the tray and the ends snap, the klk on every joint and
a chime when a loop closes. The engine button at the top left of the build screen puts a train on
the track in two taps. TOOT starts them. Tap a train to change its speed, tap a switch to throw it,
tap a stopped train to send it back the way it came. PUZZLES has two, and the second one is the
game rather than the toy. The menu shares the rug as a link; opening the link on another phone
builds it piece by piece.

**Look at:** these five first.

1. `docs/shots/p1-loop-wide.png` — the plan's own hard stop, ten pieces snapped into a loop with no
   train on it at all. **Wrong with it:** the rug's weave is a regular grid rather than wool and
   reads as graph paper up close; the tray card's bottom edge cuts the rug's fringe off; and the
   loop sits slightly high in the play band because the props are pulling the fit.
2. `docs/shots/p2-crossing-wide.png` — the second puzzle, which is where the game is. **Wrong with
   it:** the two spurs are the same length and the same angle so the layout is more symmetrical
   than it needs to be; the lever glyphs are small next to the stations they decide between; and
   the red station and the blue station end up near each other in the bottom right, which is the
   opposite of what a puzzle about two destinations wants.
3. `docs/shots/p2-bump-wide.png` — two trains meeting nose to nose at the crossing. **Wrong with
   it:** at the moment of the bump the two trains and their two name flags pile into an unreadable
   knot; the huff of steam is a fraction too small to read as a cartoon; and nothing marks WHICH
   train was at fault, which a child will want to know.
4. `docs/shots/p3-title-tall.png` — the title. **Wrong with it:** the fade from rug to dark is
   still slightly banded on a tall screen; the train passes behind the word WHISTLESTOP every few
   seconds and fights it; and the four scenery groups sit at the four corners of the rug with the
   middle empty apart from the cow.
5. `docs/shots/p3-412x915.png` — a built rug on a tall phone. **Wrong with it:** there is a hundred
   pixel dead band between the bottom of the loop and the top of the tray; the rug's left and right
   edges run off the screen while its top and bottom show, so it reads as a horizontal band; and
   the whistle sits alone on the floor strip below the tray, unattached to anything.

**Decided without you** (all of `satellites/whistlestop/docs/DECISIONS.md`, these three matter most):

- *"The consist is rigid, and it is rigid because nothing about it is recomputed."* Every body sits
  at `p - i * CAR_SPACING` along the route the engine recorded, and reversing flips the sign of
  travel rather than moving anything. A history that pushes samples and reads them back folds the
  train up like a concertina at every buffer.
- *"A facing switch ahead of the train is re-derived from the lever; a trailing one is never."*
  That is what a real switch does and it is also the whole of the second puzzle. Both rules fall
  out of one route model rather than being bolted on.
- *"Opening a shared rug REPLAYS the build, snapping each piece as it lands."* The link stores each
  piece on a twentieth of a unit grid, which is wider than a closed joint, so a rug rebuilt from
  the numbers alone keeps every count and every loop and yet stands open at every single joint.

One more that is not in DECISIONS because it is a change to the plan rather than a gap in it: **the
editor offers a piece at all eight of its detents when looking for a snap.** Section 3.5's rule is
untouched and the sim gate still holds it exactly as written; what changed is that the hand is
allowed to turn the piece, because without that eight real drags of the curve tile put eight loose
curves on the rug.

**Blocked:** none.

**For Fable:** nothing outside the fence was touched. To list it: `docs/thumb.png` (84 KB) goes to
`portal-assets/thumbs/whistlestop.png`, and the card is written out in section 8 of this plan.
Every line of it is true now: the thumb is under 150 KB, the live URL will carry `20260906a`, and
the description has no dashes.

**For Stephen:**

- **The name.** WHISTLESTOP is what the folder and the title say and section 10 makes it yours.
  CLICKETY and SIDINGS are still on the table and nothing in the build depends on the word.
- **The one thing I would change and did not.** A puzzle is authored no wider than about two and a
  half to one so that it reads on a phone held upright, and the camera fits the whole layout
  because a puzzle you cannot see is not a puzzle. The cost is that on a tall phone the railway is
  small with a lot of wool round it. The alternative is to let the player pinch in and pan, which
  they can, and to stop fitting the whole thing. That is a design call and it is yours.
- **Pass through instead of bump stop**, for younger children, is the design's own open question
  and section 3.3 took bump stop. Nothing in the sim would fight a ghost option: it is one branch
  in the collision rule.
- **The phone checklist** for the Pixel 9 once Fable lists it, both ways round: drag eight curves
  into a loop and listen for the chime; put two trains on and pull the whistle; tap a train that is
  standing on a switch and check you get the train; make them crash on purpose; send the rug to
  Jessie and watch it build itself on her phone; then the two puzzles.

**Puzzles 3 to 6, designed as data for the next session.** These follow the design's own teach ramp
and are written in the same cursor language `PUZZLES` uses, so they can be pasted in and run
against `sim.js --solve` immediately. **None of them has been built or verified**; the shapes are
right and the exact `par`, the station indices and the solution times all have to come out of
`--race` and `--solve` the way the first two did.

- **3. The Passing Loop.** Real railroading's oldest puzzle and the design's own third step. A
  single track between two Y junctions with a loop between them, a train at each end heading
  towards the other. One has to be put in the loop and held while the other runs through.
  `[['at',2,4.5,0],['rep',3,'straight'],['p','yR'],['p','curveL'],['rep',3,'straight'],['p','curveR'],
  ['p','yL'],['rep',3,'straight'],['from',3,1],['rep',5,'straight']]` with the two Ys facing each
  other. Par 2. The star three condition (no train ever stopped) is what makes it hard: the loop
  has to be entered rather than waited in.
- **4. Three Trains, One Junction.** Three trains, three stations of three colours, one Y that each
  of them passes. The lever has to be right at three different moments. Par 3. The layout is a
  three armed star with a junction in each arm and a shared middle.
- **5. Round and Round.** One train, one loop, one Y that it passes twice: on the first lap it must
  stay on the loop and on the second it must leave for the station. That is the first puzzle where
  the flip has to happen at a MOMENT rather than before the whistle, and it is the single most
  important addition to the set, because the first two are both solvable before the run starts.
  Par 1, and the deadline is the lap time.
- **6. Swap.** Two trains starting at each other's stations, which forces both to use the same
  middle section in opposite directions. Par 4. This is the design's "all trains swap stations"
  and it wants the passing loop from puzzle 3 to have been taught first.

**Next action:** nothing in Whistlestop is half finished. The next session takes the next row.

---


The template in `plans/fathom/HANDOFF-FATHOM.md` section 15, with this file's phases. Add one line: **puzzles 3 to 6**,
designed as data, for the next session.

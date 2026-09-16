# HANDOFF NOTCH, the build plan for the math catalog's eighth game

**Written:** 2026-09-16, by Opus (the builder), as step 1 of NOTCH (`plans/math/CATALOG-PLAN.md` section 8), from three inputs
read whole: `assets/math-catalog/05-NOTCH-handoff.md` (Stephen's delivery, read only), `plans/math/CATALOG-PLAN.md` (which binds
this file and wins over the handoff), and CORE as built (`satellites/math/core/`), with SPAN, YONDER, CREASE, BRIM, GLIMPSE and
HUSH as the finished examples. Where this file and the handoff differ, every difference is in section 3.
**Game folder:** `satellites/notch/` (free, checked 2026-09-16). **Live URL when listed:** `lucidwinds.com/satellites/notch/`.
**Working title:** Notch. The display name is Stephen's (the handoff: avoid UMBRA, which is in no repo here).

---

## SESSION STATE (the builder updates this at the end of every session; the morning reader starts here)

- 2026-09-16, Opus: plan written before any code, then **P0 done** (section 13): shapes, project and engine laws and lint
  green, 26 plants red, and a gate fault found by a plant (the shapes raster let a symmetric piece into the bank; the law and
  the search fixed, the bank corrected). **Next action:** P1 (section 5): the SVG piece with grain turning with it, the drag
  controller and keys, the seat, the slow reveal and the mirror's full turn; `test/turn.mjs`, `test/reveal.mjs`,
  `test/numerals.mjs`, `test/pace.mjs`.

---

## 0. RULES OF ENGAGEMENT

1. **The fence.** `satellites/notch/**`, this file, and `satellites/math/config/schemas.js` (NOTCH's entry only, under the
   builder's own stamp, which moves alone). Read only: `assets/math-catalog/**`, `plans/math/CATALOG-PLAN.md`,
   `satellites/math/core/**`, every other satellite, `scripts/`, `music-unlocks.js`. **No portal row**: Fable's.
2. **Git.** Stage by path, never `-A` (`package.json` force added). Commit and push the moment something is green. Deploy is
   `git push origin add-sproing-jumper:main` after `git log HEAD..origin/main` is empty, then one request per served file with a
   random probe, a few seconds apart.
3. **The laws.** The fleet's, CORE's G1 to G13, and NOTCH's N1 to N8 (section 4). No dash and no exclamation point in player
   copy; "Sky Wolf Studio", singular; 48 px targets (56 for the young); text 0.7 rem or larger; the engine pure; a count is a law
   proved on 20 seeds; a gate never sets the state it asserts. **No numeral anywhere a child can see** (N7).
4. **Browser gates run one at a time under the lock**, and a gate queued while the tree is being edited runs on a frozen copy.
   Every gate has a timeout, INSIDE the lock (a `timeout` outside `flock` counts the wait: BRIM's and GLIMPSE's icon jobs).
5. **Never wait on a human.** Section 10.
6. **Scars carried here** (the six ledgers before this one): a sound inside a frame is guarded; a frame's time is clamped at
   zero; a plant that plants nothing is rewritten; a law that reads a state before the page makes it is no law; a stamp is
   never one another game's import was served under; a module imported at two addresses is precached at both; a gate loop
   longer than a run meets the run's end; the round is `inert` under an overlay; a collectible reports what the store holds; a
   fault the page only records is the engine law's; a count built from a float is rounded where the arithmetic says (HUSH's
   13.4999); a static loop law reads where a sound is written; a muted page logs no sound, so a sound law turns Sound on first.

---

## 1. WHAT NOTCH IS, AND WHY IT GOES HERE

A dim workshop. A carved piece lies turned away from the notch it belongs in; the child turns it with a finger until it
seats, with a thunk. Some pieces are mirrors of the notch's shape and can never seat, and the slow reveal shows why by turning
one all the way round. No numerals anywhere, so a child who has decided they are bad at math plays it, and it trains the
spatial ground under the next games.

It goes here because it is self contained (no CORE module is hardened by it) and it is the catalog's door in.

---

## 2. INHERITANCE (real paths, checked 2026-09-16)

| What | From | How NOTCH uses it |
|---|---|---|
| Seeded randomness | `satellites/math/core/pure.js` `rng` | every task and session |
| Tier ladder | `pure.js` `adaptTier` | TURN's stage and seat tolerance |
| The reveal contract | `core.js` `reveal` | the slow rotation, the mirror's full turn and flip |
| Audio | `core.js` `audio` | the seat thunk, a soft turn tick at most once per 15 degrees, the mirror's flip |
| Store, settings, collectible | `core.js` `store`, `settings`; `pure.js` `collectOnce` | the stage, the village |
| Teacher's link | `pure.js` `buildQuery`, `parseConfig`; `satellites/math/config/schemas.js` | `config.js` |
| Sprites | `core.js` `sprite.draw` | the workshop backdrop and the village only (CATALOG-PLAN section 5: the pieces are SVG) |
| Harness and shared assertions | `core/test/harness.mjs`, `core/test/shared.mjs` | every browser gate |
| Lint, runner, layout, offline, pace, art, specimens, audio, config, icons, shots, worker | HUSH's and GLIMPSE's `tools/*`, `test/*.mjs`, `sw.js` | copied and pointed at NOTCH, every law watched red again |

**Not there:** CORE has no matrix, projection or rotation helper (grep of `core.js` and `pure.js`). NOTCH's `project.js` is its
own, pure, and tested against a second implementation (3.4).

---

## 3. CORRECTIONS AND DIFFERENCES (section 2 of the catalog plan, plus what arithmetic found)

Every numeric claim here was checked by a script on 2026-09-16 (session scratch `notch-arith.mjs`, polyomino pieces rasterised at
8 px a cell, overlap as intersection over union, every integer angle).

3.1 **The design spec (`NOTCH-design-spec.md`) was not delivered** (CATALOG-PLAN correction 4); its typology and anti-patterns
are built from the handoff's sections 2 and 7.

3.2 **v1 is TURN stages 1 and 2 (in plane, then with mirror foils), FIND, and the reveal** (the handoff's v1 scope). 3D stages 3
and 4, FOLD, SCALE and AROUND are v1.1 and have no door. SCALE's promotion is Stephen's (section 10).

3.3 **"Mirror pieces provably unseatable at all 360 integer angles" is empty as written, and the real property does not hold for
every shape.** A `seatCheck` that returns false for a mirror passes that gate by construction. What matters to a child is that
the mirror LOOKS unlike the notch at every angle, and for some shapes it does not:
```
piece  mirror's best overlap (any angle)   itself turned 12 degrees   itself turned 6   itself, best away from 0
L4     0.629 at 333                        0.724                      0.855             0.484
S4     0.637 at 125                        0.747                      0.855             1.000   (a half turn is itself)
T4     1.000 at 0     (it is its own mirror)
F5     0.667 at 235                        0.702                      0.842             0.538
P5     0.751 at 36                         0.783                      0.877             0.623
N5     0.629 at 222                        0.677                      0.818             0.552
Y5     0.667 at 180                        0.668                      0.796             0.443
L6     0.581 at 110                        0.652                      0.803             0.365
J7     0.691 at 179                        0.680                      0.817             0.448
```
T4's mirror is itself: it can never be a foil. S4 is the same shape after a half turn, so a task at 180 degrees is a task at 0
and the disparity profile N3 needs is broken. J7's mirror, at its best angle, overlaps the notch MORE than J7 itself does at the
easiest tolerance's edge (0.691 against 0.680), and Y5's and P5's come within a hair: a child turning one sees it "nearly fit"
exactly as a right piece nearly fits. So **every piece in the bank is held to two shape laws in P0**, measured this way:
- **no symmetry:** its own best overlap at any angle from 30 to 330 is under 0.9 (no rotational symmetry), and its mirror's best
  overlap at any angle is under 0.9 (no reflection symmetry);
- **a foil looks like a foil:** its mirror's best overlap is at least 0.05 below its own overlap at the easiest tolerance
  (12 degrees). On today's candidates that keeps L4, F5, N5 and L6 and rejects T4, S4, P5, Y5 and J7.
The seat check itself is then honest and simple: seated when the piece is not a mirror and its angle is within the tolerance of
the notch; the gate that matters is the shape law, plus the reveal's full turn (3.6).

3.4 **`project()` matches a reference within 0.5 px across 100 random matrices.** The reference is a second implementation in
the test (quaternion rotation, then the same perspective divide), not the same code run twice.

3.5 **Keyboard: 15 degree steps.** Disparities are multiples of 30, so a keyboard from any task lands exactly on the notch in
whole steps; at the hardest tolerance (6 degrees) a 15 degree step can never seat a piece 15 degrees off. The law: from every
disparity the keys reach a seated angle, and no key press seats a piece that is not within the tolerance.

3.6 **The mirror reveal takes six seconds.** At the handoff's 60 degrees a second, a full turn is 6 s, then the flip. The reveal
contract's "same animation on every path" holds: a right piece that was not seated also turns slowly to the notch at 60 degrees
a second; with less motion both are instant (the mirror shown beside its flip).

3.7 **N7, no numerals, is a lint law and a DOM law.** The lint scans every string a child reads (COPY, HTML text, aria labels,
titles) for a digit; the page gate reads `document.body.innerText` and every attribute a screen reader speaks after a whole
run of each mode, and the settings panel's text too (CORE's panel has no digits; asserted, not assumed). The link builder's
teacher page is not the child's and may show numbers.

3.8 **N4, ungendered content, is a content law:** the piece bank's names come from carved animals, buildings, tools, plants and
abstract solids, and the palette's wood and ink are one set for every piece; the art gate reads that no piece carries a colour
of its own.

3.9 **The pieces are SVG with grain that turns with them** (CATALOG-PLAN section 5; the handoff section 4). Grain is a set of
lines in the piece's own coordinates, projected with it; the art law measures that the grain's angle on the screen changes by
the piece's turn and not by zero.

3.10 **FIND** (disembedding): a carved panel with the piece's outline hidden among others; the child taps the region that is
the piece. Its bank is the same pieces; a law holds that the hidden piece appears exactly once in the panel, unrotated and
unmirrored, and that no decoy is the piece.

3.11 **Seat tolerance** 12 degrees at stage 1, 9 at stage 2's first tier, 6 at its last (N8); the stage and tier through
`adaptTier`; the tolerance never tighter than 6.

3.12 **NOTCH's stamp starts at `20260916e`**, a stamp no game has carried (grep of `satellites/` empty).

3.13 **The village** (24 buildings, one a clean run through `collectOnce`, never a count) is P3.

---

## 4. ARCHITECTURE LAW

```
satellites/notch/
├── index.html  main.js   the page: doors, the workshop, TURN, FIND, the reveal, the village
├── project.js            PURE: the 4 by 4 matrix, rotation, the perspective divide, outline and grain projection
├── pieces.js             PURE: the bank, each piece a set of cells and its grain lines
├── engine.js             PURE: generateRotationTask, seatCheck, dealSession, dealFind, the stage and tolerance
├── render.js             the SVG piece and notch, the grain, the backdrop canvas
├── content.js  config.js  sprites.js  village.js  sw.js  manifest.webmanifest  icons  STAMP.js
├── test/   engine.mjs project.mjs shapes.mjs (node); turn.mjs find.mjs reveal.mjs numerals.mjs audio.mjs config.mjs
│           layout.mjs offline.mjs pace.mjs art.mjs specimens.mjs (browser)
├── tools/  check.js lint.mjs shots.mjs icons.mjs
└── docs/   DECISIONS.md shots/
```

**N1 to N8, the law each becomes.** N1 the TURN page has no choice buttons (layout reads the controls a TURN round shows: the
piece, its handle, next) and a round is completed only by a drag or keys that change the angle; N2 every stage 2 session holds
at least one foil, on 20 seeds; N3 disparity uniform over 0 to 180 by 30 over 500 tasks on 20 seeds (each value 12 to 17
percent); N4 3.8's content law; N5 no fixed ability words in any string (lint: talent, gifted, spatial type, natural); N6 FOLD is
v1.1; N7 3.7's two laws; N8 3.11's ladder in the engine law.

---

## 5. THE PHASES, WITH GATES (the handoff's section 5 mapped one to one)

### P0. Projection, pieces, tasks, laws (about 4 hours)
`test/project.mjs` (3.4) and `test/shapes.mjs` (3.3 on every piece in the bank) and `test/engine.mjs` (N2, N3, N8, 3.5, 3.10's
deal) red with no modules, then `project.js`, `pieces.js`, `engine.js`. `tools/lint.mjs` with N5 and N7.

### P1. The workshop, TURN stages 1 and 2, the drag, the reveal (about 5 hours)
The SVG piece with grain, the drag controller (pointer and keys), the seat and its thunk, the slow reveal and the mirror's
full turn. `test/turn.mjs` (the seam, N1, 3.5, keyboard), `test/reveal.mjs` (3.6), `test/numerals.mjs` (N7 after a run),
`test/pace.mjs` (60 fps during a continuous drag under 4x throttle).

### P2. FIND, audio (about 2 hours)
`test/find.mjs`, `test/audio.mjs` (one thunk a seat, the tick at most once per 15 degrees, not an alarm).

### P3. The village, links, layout, offline, art (about 3 hours)
As HUSH's and GLIMPSE's P3.

**NOTCH v1 is done** when `tools/check.js` prints ALL GATES PASSED under the lock, every gate has a red line in section 13,
every shot is opened with its faults named, it is deployed and the served files probed, and the listing line is in section 8.

---

## 6. THE SCREENS

- **First run:** a wordless loop: a finger turns a carved piece until it drops into its notch. Then two doors, a picture each:
  TURN and FIND.
- **TURN:** the workshop bench; the notch cut in a board; the piece beside it, turned; a handle on the piece for a thumb.
- **The reveal:** the piece turns slowly to the notch and seats; a mirror turns all the way round without seating, then flips
  and seats.
- **FIND:** a carved panel of shapes; the piece above it.
- **The village:** the buildings earned so far, no count.

---

## 7. ART

SVG pieces with baked grain in two woods and one ink; a pixel workshop backdrop and a pixel village (CATALOG-PLAN section 5).
`tools/sheet` renders the backdrop and village sprites; a pieces sheet renders every piece and its mirror at 0, 90 and 180
degrees; both are opened with three faults named. Painted sheets are Stephen's, later.

---

## 8. LISTING (the line for Fable's portal row)

"Turn a carved wooden piece until it drops into its notch, and learn which ones never will, a free game with no numbers and no
login." (One sentence, no dash. `cat:"math"`, In Development.)

---

## 9. PITFALLS

A four option picker (N1); no foils (N2); only 90 and 180 (N3); three.js (the handoff section 4); grain in screen space (3.9); a
level counter (N7); a seat tolerance under 6 (N8); a symmetric piece in the bank, or a mirror that nearly fits (3.3); a seat
check that is a tautology called a proof (3.3); from the ledgers: a timeout outside the lock, a muted page's empty sound log.

---

## 10. DECISION RIGHTS AND OPEN QUESTIONS

| Question | Default the build takes |
|---|---|
| Final name (avoid UMBRA) | Notch, the working title |
| SCALE into v1 | v1.1 (the handoff's v1 scope) |
| Is the no numerals rule worth its cost | yes, as the handoff recommends |
| Two axis rotation on phones: dual handle as default | v1.1 with the 3D stages |
| The village as hub content | NOTCH's own for v1 |
| Which pieces are in the bank | only those that pass 3.3's shape laws |

---

## 11. STEPHEN ONLY

The questions above and the display name; a child of six to nine turning pieces on a phone and a Chromebook trackpad.

---

## 12. HONEST SIZING

About 14 hours (P0 4, P1 5, P2 2, P3 3) against the catalog plan's one and a half days. Where a session stops well: after P1,
when TURN is honest with foils and the mirror reveal.

---

## 13. EVIDENCE LEDGER (fill in place, with commands and their real output, most recent last)

### P0, projection, pieces, tasks and their laws (2026-09-16)

Section 3's arithmetic checked by a script before the plan (`notch-arith.mjs`). `test/shapes.mjs`, `test/project.mjs` and
`test/engine.mjs` written first; with no modules all three went red on the line that matters:
```
  FAIL  pieces.js loads as an ES module (Cannot find module '/workspaces/lucid-winds/satellites/notch/pieces.js' ...)
  FAIL  project.js loads as an ES module (Cannot find module '/workspaces/lucid-winds/satellites/notch/project.js' ...)
  FAIL  engine.js and pieces.js load as ES modules (Cannot find module '/workspaces/lucid-winds/satellites/notch/engine.js' ...)
```
The bank was found, not chosen: every free pentomino and hexomino (12 and 35) enumerated and kept only when it passes 3.3's
laws (`notch-bank.mjs`); eleven kept. `project.js` within 0.000001 px of the quaternion reference over 1200 points. All three
green on their first run, and `tools/lint.mjs` (from HUSH's, with N7 and N5) green:
```
lint            pass  0s
shapes          pass  2s
project         pass  0s
engine          pass  0s
THE GATES THAT NEED NO BROWSER PASSED
```
**Watched red** (`notch-p0-plants.cjs`, a folder copy per plant):
```
s1 a piece that is its own mirror     FAIL  no piece is its own mirror at any angle (best overlap under 0.9): tee 1.000 | ...
s2 a piece a half turn makes itself   FAIL  no piece is itself after a turn from 30 to 330 degrees (best overlap under 0.9): zed 1.000
s3 a mirror that nearly fits          FAIL  every mirror looks like a foil: its best overlap is 0.05 or more below the piece turned 12 degrees ...
s4 a piece twice (its mirror)         FAIL  no two pieces are the same shape under any turn or mirror: hookback is hook
s5 a piece in two parts               FAIL  the bank holds at least eight pieces, each connected, named, with a grain angle (12): split is not connected
s6 a bank of seven                    FAIL  the bank holds at least eight pieces ... (7)
p1 rotationZ clockwise                FAIL  rotationZ turns (1, 0, 0) to (cos, sin, 0) counterclockwise ...: 7 gave 0.9925,-0.1219,0.0000 ...
p2 a sign wrong in Rodrigues          FAIL  rotations from 100 random axes and angles ... (1200 points, worst 338.931710 px) ...
p3 no perspective                     FAIL  rotations ... (1200 points, worst 41.845823 px) ...
p4 y not flipped                      FAIL  rotations ... (1200 points, worst 335.613677 px) ...
p5 multiply transposed                FAIL  rotations ... (1200 points, worst 323.291781 px) ...
p6 a division by zero                 FAIL  a point at the camera's depth projects to null, never a division by zero
e1 only 90 and 180                    FAIL  N3: ...: 6000 0 at 0.0%; 6000 30 at 0.0%; 6000 60 at 0.0%; 6000 90 at 49.8%
e2 a stage 2 session with no foil     FAIL  N2: ...: 6000 stage 2 session 0: 0 foils in 12 ...
e3 foils at stage 1                   FAIL  N2: ...: 6000 stage 1 session 0 holds a foil ...
e4 a tolerance of 4                   FAIL  N8: tolerance 12 at stage 1, then 9, 7 and 6 up stage 2, never under 6 ... ([12,9,7,4], ...)
e5 a mirror that seats                FAIL  seatCheck: a mirror seats at none of 360 integer angles ...: a mirror seats at -12 ...
e6 keys of 20 degrees                 FAIL  3.5: ...: 30 never reached the notch (-10) ...
e7 no wrap                            FAIL  3.5: ...: keyStep does not wrap (185, -195)
e8 always turned one way              FAIL  a task starts turned by its disparity, both ways come ... (205 one way, 0 the other)
e9 FIND with the piece twice          FAIL  3.10 FIND: ...: 6000 the piece's shape 2 times under a turn ...
e10 an unseeded shuffle               FAIL  a seed replays its session and another seed gives another | FAIL engine.js ...: it names Math.random
e11 a clock in the engine             FAIL  engine.js touches no screen, clock or unseeded die: it names Date
l1 a digit a child reads              FAIL  N7: no digit in any string a child reads: "Again 2"
l2 ability made fixed                 FAIL  N5: no string makes spatial ability fixed: "You are a natural"
l3 an unstamped import                FAIL  every relative import and local asset carries ?v=20260916e: engine.js loads ./pieces.js
```
⛔ `p2` first planted nothing (its match was a row the matrix does not have) and was rewritten to the row as written; red above.

⛔⛔ **Plant s2 found a fault in the gate and in the bank.** The half turn piece it added was flagged only as the twin of a piece
already in the bank, `sprout`, which is the Z pentomino and IS a half turn of itself. The shapes law had measured sprout at
0.845 and passed it. The cause: 7 px a cell on a 64 px canvas puts every seventh pixel centre exactly on a cell edge whenever a
piece's centroid is a cell's centre, `Math.floor` sends the edge one way and its reflection the other, and about 13 pixels in
49 move: a perfectly symmetric piece measured 0.770 at 180 degrees. The same raster built the bank search, so the search let the
Z pentomino in. Fixed in both: 14 px a cell with pixel centres offset off every edge. The corrected law measures sprout at
1.000 and went red on the committed bank; the corrected search keeps a different pentomino in sprout's place (self 0.522,
mirror 0.649 against 0.715 at 12 degrees); the bank now passes, and s1 to s6 are red again against the corrected law (s2 now on
the symmetry law itself: `zed 1.000`).

### P1 to P3 built, gates queued (2026-09-16)

Engine additions for P1 (`scoreTurn`, `tierFor`, `stageAfter`, `revealPlan`, `revealAt`) each with a law, green. The page: the
bench as SVG, the outline traced from cells (checked closed with area and perimeter equal to the cells on all 22 loops, every
piece and its mirror), grain projected with the piece, a continuous drag with no turn buttons (N1), 15 degree keys, set aside,
the reveal from the engine's plan; FIND; the P3 shell (config and the builder's entry, worker, manifest, icons tool); the
village. Gates written and queued under the lock on frozen copies of their commits: turn, reveal, numerals, pace, find, audio,
config, offline, layout, specimens.

**The village sprites, looked at before any gate** (browserless preview of `sprites.js`, eight buildings on both grounds).
Faults named and accepted for v1: ⛔ the bridge reads as a dark tunnel (its empty underside lets the ground fill the arch like
a doorway); ⛔ the tower is a narrow column of windows, closer to a ladder or a film strip than a tower; ⛔ the well's frame
looks more like a gallows, and the shop's flat roof shows almost none of its ink.

---

### TURN gate, first browser run (2026-09-16)

- `node test/turn.mjs` on `c741b994`, frozen copy, under the lock: laws 1 to 5 green; **law 6 red**:
  `FAIL 1366x768 by keys: ... [{"start":0,"presses":2,"want":0,"seated":true,...}]`. The page's fault: a task at 0 degrees
  starts inside its tolerance, a pointer tap seats it, the keys had no let go. Fixed: Enter or Space on the bench runs the let
  go's seat check (`docs/DECISIONS.md`). Law 6 now also asserts Enter seats exactly the rounds dealt inside their tolerance, and
  that the three keyed rounds hold both kinds. Rerun and plants k1 (no Enter let go) and k2 (Enter seats at any angle) queued.

`test/reveal.mjs` on `832a946b`, frozen copy, under the lock: **REVEAL OK** on its first run; not counted until its plants go red.

### P2 and P3, first runs (2026-09-15 night, frozen copies under the lock)

- `numerals`, `pace`, `find`, `audio` on `e76df4df`: **NUMERALS OK**, **PACE OK**, **FIND OK**, **AUDIO OK** (twenty loud seconds peak
  0.175, rms 0.0117, 0.0 percent above 3 kHz).
- icons drawn in `d7cf3239`'s copy; **OFFLINE OK**, **LAYOUT OK**.
- `test/config.mjs` **red, the gate at fault**: `FAIL the builder's defaults: one door ... ({"doors":["start","start-find"],"mode":"turn","stage":1,"firstOk":true})`.
  A link of the builder's defaults names no mode, so both doors are right; the gate now owes one door only to a link that names
  its mode (the same fault as TINT's config gate). Rerun queued.
- The turn gate rerun on `db60ac9a` with plants k1 and k2 printed no result line: rerun it and read the whole output.
- **Specimens and art** on `3e237753`: the only failures were "nothing landed on the console" on `http 404 .../notch/icon-192.png`:
  the icons had only been drawn into frozen copies, never committed, so every served NOTCH page asks for a missing icon. A real
  fault: the icons are now drawn into the tree and committed.
- **The reruns on `8f07b6d8`:** config green apart from that same 404; **plant c1** (the named mode's door hiding removed) **red**
  (`other values: one door ... {"doors":["start","start-find"],"wantDoors":["start-find"]}`). The turn gate, run whole, threw a
  30 s timeout waiting for a reveal after a drag in its stage 2 loop (`turn.mjs:103`), where its first run had been green. It
  threw again on `fbb7d2b5`, so it was read, not rerun: the first run was on `c741b994`, before P3; since P3 a clean session earns a
  village building and the village opens over the next round with the round inert, so the gate's stage 2 drags landed on an
  inert page. **The gate's fault** (the scar CREASE and GLIMPSE carry: a loop must stop at an early overlay). The gate now closes
  the village with go on after stage 1 and asserts the round under it is live again.
- **The rerun on `21b722c5`: TURN OK.** Plants on the same copy, **both red** on law 6:
```
k1 (no Enter let go)            FAIL  1366x768 by keys: Enter lets go and seats only a piece already in the notch ... [{"start":0,"enterSeated":false,"inside":true,"presses":2,"want":0,...
k2 (Enter seats at any angle)   FAIL  1366x768 by keys: Enter lets go and seats only a piece already in the notch ... (a round dealt outside its tolerance seated on Enter)
```
  **The turn gate counts.**
- **The icons, opened:** a planked L piece turned over a dark notch in a rounded frame. Faults: the plank over the hole reads as a
  board over a pit more than a piece seating; dark brown on dark brown loses the shape at launcher size; the notch's cut does not
  show the piece's own outline, so the thesis (turn it until it fits) is not in the picture. Accepted for v1 (painted art is
  Stephen's).

### The shots, taken and opened (2026-09-15 night, `tools/shots.mjs`, written this session: NOTCH had none)

Five states at four sizes, twenty shots, every one well under the 200 KB limit (76 KB the largest). Three opened and read:

- **`p3-turn-reveal-375x667`** (a piece seated at the reveal's end): ⛔ the notch behind the piece is invisible, the two are nearly
  one tone, so the thing the child just did does not read from the picture; ⛔ the grain runs across the bench and the piece at one
  angle and spacing, so it reads as a hole cut in a single board rather than a piece resting in one, and gives no sign the piece was
  turned; ⛔ the bench fills the top two thirds and the bottom third is empty dark space with go on alone in it (and go on wears the
  browser's blue focus ring after a keyboard round, which a keyboard child does see).
- **`p3-village-375x667`**: ⛔ one small house in a large empty board (CREASE's and BRIM's accepted fault, the same here); ⛔ the
  house sits hard in the top left corner with no ground line across the board, so it reads as a sticker on a plank, not a village;
  ⛔ the board's brown is nearly the page's brown so the frame barely reads, and the screen's top half is empty.
  **`p3-village-320x568`** opened too: the same three faults at the smaller size, and go on carries the browser's blue focus ring
  after a keyboard session, which a keyboard child does see.
- **`p3-find-reveal-320x568`**: ⛔ the child's wrong choice is ringed white and the piece's own region gold, two different marks, and
  at a glance the white ring reads as the right answer; ⛔ the target above sits in a dark card that looks like an eighth region, so
  there appear to be eight tappable things; ⛔ the seventh region stands alone on its row with an empty block beside it, and go on
  sits at the far bottom left, away from the thumb's side.

Accepted for v1 (painted art is Stephen's; the reveal's two marks are the contract CREASE and BRIM share: the choice stays marked,
the truth is lit).

Two more opened. **`p3-doors-375x667`**: ⛔ the two doors do not read as the same kind of thing, one a piece over a dark notch
inside a doubled card frame, the other a grained piece with no notch at all; ⛔ the wordless loop above reads as a tan shape beside
a black rectangle, not as a piece turning into its notch; ⛔ deep dark bands above and below. **`p3-turn-320x568`**: ⛔ the piece
and the bench share one grain angle and spacing, so the piece reads as a hole cut in the board rather than a piece lying on it;
⛔ the notch is invisible at this size, so a child sees no target to turn toward; ⛔ set aside is a small card whose picture is
barely legible at 320. The grain's sameness is the one worth a line of art later (the bench's grain wants another angle). **`p3-turn-reveal-1366x768`**
opened: ⛔ the bench floats in the middle of a very wide dark screen with two thirds of the width empty; ⛔ the seated piece and its
notch still read as one board, sharing the grain; ⛔ go on wears the browser's blue focus ring after a keyboard round.
**`p3-turn-412x915`** opened: ⛔ the piece and the bench share one grain again at this size; ⛔ set aside is a small card in the
bottom left, the far corner from a right thumb; ⛔ the lower half of the screen is empty dark.

One more opened. **`p3-find-reveal-375x667`** (the same state at 375 as the 320 shot): ⛔ the child's choice is ringed white and
the piece's own region gold, two marks a child must learn apart, and the white ring is the louder of the two; ⛔ the target above
sits in a card of the same make as the regions, so it reads as an eighth region rather than the thing to find; ⛔ the seventh
region stands alone on its row with an empty block beside it. The two marks are the reveal contract (the choice stays, the truth
is lit); the target's card and the row's gap are art, Stephen's call.

## 14. THE OVERNIGHT PROTOCOL

Never wait on a human; an ambiguity is the smallest reasonable choice logged in `satellites/notch/docs/DECISIONS.md`; a gate red
after three honest attempts goes into SESSION STATE as BLOCKED with its last thirty lines; never weaken, skip or delete a gate;
commit and push the moment something is green.

---

## 15. THE MORNING REPORT (most recent on top)

(none yet)
- PLANT pace p1 (a 40 ms busy frame in every draw): green run PACE OK, planted red twice — the drag draws a median of 50.0 ms a frame against a ceiling of 18.2, and the reveal the same. COUNTS.
- PLANT reveal r1 and numerals n1: DO NOT COUNT. Both green runs timed out at 30 s waiting for the page, because six plant jobs were driving browsers at once on a two core box. The plant lines that followed are meaningless (one even failed with "process.cwd failed", the folder collision). Requeued to run alone. ⛔ the two core law again: a plant is only evidence when its own green run was green.
- SHOT p3-turn-375x667.png OPENED. Faults: (1) the diagonal stripes run unbroken across the board and the piece, so the piece’s edges dissolve into the floor; (2) the board and the piece are two shades of the same brown, the only contrast in the screen; (3) the tray thumbnail at the bottom left is far too small to read as the shape it holds; (4) the bottom third is empty dark space with nothing in it.
- SHOT p3-village-320x568.png OPENED. Faults: (1) one small house sits in the top left corner of a wide empty board — the same disease as GAUGE’s case, NOTCH’s village, GLIMPSE’s journal and HUSH’s clearing: the first earned thing is dropped in the top left corner of a large empty board, so the first reward reads as a stain instead of a beginning. The collection views need a composition (the early places worked inward or centred) rather than a seeded scatter that starts in a corner.; (2) the play button wears a bright blue focus ring, the browser’s own colour, which belongs to nothing else in this brown village; (3) the board and the page are two nearly identical dark browns, so the board’s edge barely exists; (4) the bottom third is empty.
- SHOT p3-find-reveal-375x667.png OPENED. This one composes better than the rest: a target above, a grid of seven, and two different marks (a white ring on the child’s choice, a gold ring on the true one), which is the thing GAUGE and TINT are missing. Faults: (1) nothing says in words which ring means which, so the two rings are a code a child must guess; (2) the seventh tile sits alone on a row of its own under six, so the grid reads as broken rather than as seven; (3) the target card at the top is the same brown as the page and has no edge, so the piece to find looks like it is floating loose; (4) go on is a bare arrow in the bottom left corner, the furthest point from the grid the eye just left.
- SHOT p3-turn-reveal-375x667.png OPENED. Faults: (1) go on wears the browser’s blue focus ring again, the second NOTCH screen to show it, and blue appears nowhere else in this brown game; (2) the reveal is identical to the playing screen except the piece has moved, so nothing on the page says the round is over or that the placement was right; (3) the diagonal stripes still run unbroken across the board and the piece, so the fitted piece does not read as fitted, only as differently coloured; (4) go on sits in the bottom right while the piece it follows sits in the middle left, and the bottom third is empty.
- SHOT p3-doors-375x667.png OPENED. Faults: (1) the two doors are pictures only with no words, so a child choosing between two ways to play is choosing between two brown shapes; (2) the left door’s piece is drawn at an angle and clipped by its own inner frame while the right one stands upright and unclipped, two different treatments side by side; (3) the board above holds a piece half lit and half in black shadow with nothing to say which half is the piece; (4) the doors sit in a band across the middle with large empty stretches above and below.
- SHOT p3-turn-320x568.png OPENED. Faults: (1) at 320 the piece runs within about 15 px of the board’s right edge while a wide empty margin sits on its left, so the piece is pushed off centre by the narrow screen; (2) the tray thumbnail below is about 50 px square holding a shape drawn at maybe 30 px, unreadable; (3) board brown and page brown are within a shade of each other at this size too, so the play area has no boundary; (4) the diagonal stripes cross board and piece unbroken, the fault this game repeats in every state.
- PLANT art w1 (FIND’s regions in another wood): green run ART OK, planted red — "N4: every piece drawn, on the bench, the target and 7 regions, is one wood and one grain (#c89a63, #8c6239): [{fill:#b07d4a ...}]". The art law reads the fill and grain of every drawn piece, so a second wood anywhere is caught. COUNTS. NOTCH plants counted: turn k1 and k2, config c1, pace p1, art w1; reveal r1 and numerals n1 still owed (their green runs timed out under contention and are requeued to run alone).

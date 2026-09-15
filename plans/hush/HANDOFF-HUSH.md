# HANDOFF HUSH, the build plan for the math catalog's seventh game

**Written:** 2026-09-16, by Opus (the builder), as step 1 of HUSH (`plans/math/CATALOG-PLAN.md` section 8), from three inputs
read whole: `assets/math-catalog/07-HUSH-handoff.md` (Stephen's delivery, read only), `plans/math/CATALOG-PLAN.md` (which binds
this file and wins over the handoff), and CORE as built (`plans/math/HANDOFF-CORE.md`, `satellites/math/core/`), with SPAN,
YONDER, CREASE, BRIM and GLIMPSE as the finished examples. Where this file and the handoff differ, every difference is in
section 3.
**Game folder:** `satellites/hush/` (free, checked 2026-09-16). **Simon Says:** `satellites/hush/simon/` (CATALOG-PLAN section 1,
its own URL). **Live URL when listed:** `lucidwinds.com/satellites/hush/`.
**Working title:** Hush. The display name and its relation to "Blink (Don't.)" are Stephen's (CATALOG-PLAN call 5; that
project is in no repo or memory here).

---

## SESSION STATE (the builder updates this at the end of every session; the morning reader starts here)

- 2026-09-16, Opus: plan written, before any code, while CREASE's, BRIM's and GLIMPSE's gates run under the lock.
  **Next action:** P0 (section 5): `satellites/hush/test/engine.mjs` red with no modules, then `engine.js`
  (`dealRun`, `hazard`, `scoreTrial`, `adaptAxes`, `approach`, `dealSimon`), `tools/lint.mjs`, `tools/check.js`, commit.

---

## 0. RULES OF ENGAGEMENT

1. **The fence.** `satellites/hush/**`, this file, and `satellites/math/config/schemas.js` (HUSH's entry only, under the
   builder's own stamp, which moves alone). Read only: `assets/math-catalog/**`, `plans/math/CATALOG-PLAN.md`,
   `satellites/math/core/**` (a CORE change goes under CORE's plan with a law watched red, CORE's stamp moved and every
   shipped game's worker following), every other satellite, `scripts/`, `music-unlocks.js`. **No portal row**: Fable's.
2. **Git.** Stage by path, never `-A` (`package.json` force added past the repo's ignore rule). Commit and push the moment
   something is green. Deploy is `git push origin add-sproing-jumper:main` after `git log HEAD..origin/main` is empty, then
   one request per served file with a random probe, a few seconds apart.
3. **The laws.** The fleet's (HANDOFF-OPUS-SEP15 section 6), CORE's G1 to G13 and S1 to S3, and HUSH's H1 to H9 (section 4).
   No dash and no exclamation point in player copy; "Sky Wolf Studio", singular; 56 px targets for every control a child uses
   (CATALOG-PLAN D4 names HUSH); text 0.7 rem or larger, measured; the engine pure; a count is a law proved on 20 seeds; a
   gate never sets the state it asserts.
4. **Browser gates run one at a time under the lock**, and a gate queued while the tree is being edited runs on a frozen
   copy. Every gate has a timeout.
5. **Never wait on a human.** Section 10.
6. **Scars carried here** (the five ledgers before this one): a sound inside an animation frame is guarded; a frame's time is
   clamped at zero; a plant that plants nothing is rewritten; a law that reads a state before the page makes it is no law; a
   stamp is never one another game's import was served under; a module imported at two addresses is precached at both; a
   gate loop longer than a run meets the run's end; a zero height box's border draws above its place; the round is `inert`
   under an overlay; a collectible reports what the store holds, not what is drawn; a fault the page only records (a wrong
   truth function) is caught by the engine law, not the seam.

---

## 1. WHAT HUSH IS, AND WHY IT GOES HERE

A deer grazes in a dawn clearing. While its head is down, step closer; when its head comes up, freeze. Red Light, Green
Light, which every four year old already knows, built as a go/no-go task: go trials frequent enough to make stepping a
reflex, so that freezing is a stop the child has to make. Every right step brings the deer nearer and shows more of it, and
at the end it looks out, holds, and settles in the clearing to stay.

It goes here because it consumes the `schedule` GLIMPSE hardened (a pose shown for a frame accurate length, reaction time
from paint), and because Mode 5, Simon Says with no camera and no microphone, is one of the catalog's two micro tools.

**Claims** (the handoff's section 0, kept): gains are in the game. Nothing in HUSH's copy, listing or landing line claims
transfer to self control in general.

---

## 2. INHERITANCE (real paths and lines, checked 2026-09-16)

| What | From | How HUSH uses it |
|---|---|---|
| Seeded randomness | `satellites/math/core/pure.js` line 15 `rng(seed)` | every run's order, the gaps between trials, Simon's commands |
| The pose | `satellites/math/core/core.js` line 444 `schedule.flash({ durationMs, onShow, onHide, onMasked, onPainted })`; `pure.js` line 143 `hideNow` | each trial's pose shown frame accurate (S1), reaction time from `onPainted` (S2), the grass settling over the deer on the hide frame (S3) |
| Staircase | `pure.js` line 78 `adaptStaircase` (two down one up, reversals) | each of the three axes, on its own history (3.3) |
| Session | `pure.js` line 159 `sessionStep` | the run's trial count and hard cap |
| Audio | `core.js` line 383 `audio` | a soft step, a dry leaf snap on a false alarm (H4), the settle's breath |
| Store, settings, collectible | `core.js` lines 63, 110; `pure.js` line 148 `collectOnce` | the three staircases, the fork, the living clearing |
| Teacher's link | `pure.js` lines 181, 203; `satellites/math/config/schemas.js` | `config.js`, held equal by `test/config.mjs` |
| Sprites | `core.js` line 487 `sprite.draw`; `core/tools/sheet.mjs`; BRIM's and GLIMPSE's `draw.js` | the deer, hare and fox at six tiers, the clearing, the doors, the fork's two pictures |
| Test harness and shared assertions | `core/test/harness.mjs` `serve`, `SIZES`, `open`, `tap`; `core/test/shared.mjs` line 41 (no `getUserMedia`), line 76 (forbidden words), the injected render delay | every browser gate |
| Lint, runner, layout, offline, pace, art, specimens, audio, config, icons, shots, worker, doors | `satellites/glimpse/tools/*`, `test/*.mjs`, `sw.js` | copied and pointed at HUSH, every law watched red again here |

---

## 3. CORRECTIONS AND DIFFERENCES (section 2 of the catalog plan, plus what arithmetic found)

Every numeric claim here was checked by a script on 2026-09-16 (session scratch `hush-arith.mjs`) before this file was
written.

3.1 **The design spec (`HUSH-design-spec.md`) was not delivered** (CATALOG-PLAN correction 4). Its section 2 claims, section 5
speed and accuracy and section 6 anti-patterns are built from the handoff's sections 0, 3 and 9.

3.2 **H1 and the ratio axis disagree, and 75 percent with the three go minimum is a clock, not a task.** A run of n trials
with k no-go trials, each after at least three go trials, has `n - 4k` spare go trials to place over `k + 1` gaps:
```
n 40  go 75.0%  no-go 10  spare  0  arrangements 1        P(no-go right after three go) 1.00  mean go run 3.00
n 40  go 77.5%  no-go  9  spare  4  arrangements 715      P(no-go right after three go) 0.69  mean go run 3.40
n 40  go 80.0%  no-go  8  spare  8  arrangements 12870    P(no-go right after three go) 0.50  mean go run 3.89
n 40  go 85.0%  no-go  6  spare 16  arrangements 74613    P(no-go right after three go) 0.27  mean go run 5.29
n 30  go 75%    impossible (8 no-go need 32 go)
```
At exactly 75 percent every run is GGGN GGGN ...: a child who counts to three never needs to stop anything, which is
precisely the discrimination task H1 exists to prevent. And the handoff's harder end, 85:15, breaks H1's own ceiling of 80.
H1 is "the single most important number in the spec", so it wins: **the ratio axis runs from 77.5 percent go (easy, more
no-go) to 80 percent (hard)**, a no-go count of `floor(n * 9 / 40)` or `n / 5`, which stays inside 75 to 80 at every
run length the link offers (40, 60, 80). ⛔ Not `round(n * 0.225)`: at 60 that is 14 (13.5 rounds up), four spare go over
fifteen gaps, and a no-go straight after three go 0.78 of the time; the script above printed 13 only because 60 times
0.225 is 13.4999 in floating point. The order is drawn uniformly over the legal arrangements (stars and bars, seeded),
and a law bounds the chance of a no-go straight after three go at 0.75 or under, measured over 500 runs at each level.

3.3 **"All three adapt independently" needs three histories, not one.** Three staircases fed the same right and wrong
answers move in step. So each axis reads its own evidence:
- **signal duration** (1200 ms easy to 400 ms hard, steps of 80 ms, eleven levels) reads the **go** trials: a step inside
  the pose is right, a pose that passes with no step is wrong. A miss teaches the staircase and nothing else: it is not
  scored, not shown, not sounded (H9).
- **cue similarity** (0 head fully up, 0.5 head half raised, 1 an ear twitch; continuous in the engine, the pose drawn is the
  nearest of three) reads the **no-go** trials: a freeze is right, a step is wrong.
- **go ratio** (3.2's two levels) reads **whole runs**: a run with a false alarm rate under a quarter is right. It changes
  between runs only, because a ratio is a property of an order, not of a trial.
The law: over a simulated 20 session history with a child model whose hit and freeze rates differ, the three levels' paths
are pairwise different on 20 seeds, and a child who only ever freezes wrongly moves cue similarity and not duration.

3.4 **The speed and accuracy fork is in v1**, though the handoff's v1 scope line leaves it out: without it every child gets
one default, and the handoff's own evidence says either default hands one age the version that suits it least. At first run,
two pictures and no words: a hare mid bound (Quick) and a heron standing still (Careful). Switchable in settings.
- **Quick:** duration starts at 800 ms, the ratio at 80 percent, a step is earned by a step on a go trial.
- **Careful:** duration starts at 1200 ms, the ratio at 77.5 percent, a step is earned by a step on a go trial AND by a
  freeze on a no-go trial (clean runs move the child closer).
- **In both a false alarm is one step back** (H4). The handoff's "steps lost to false alarms" weighting would make Careful's
  false alarm dearer, which H4 forbids; Careful rewards clean freezing instead, which weights the same thing from the other
  side.

3.5 **The approach.** Steps never go below zero. Tiers change every three steps (0, 3, 6, 9, 12, 15) and the settle comes at
18. A run that ends before the settle leaves the creature where it stands, and the next run starts from there: nothing is
lost, nothing is said. The law, on 20 seeds: a model child at 80 percent hits and 20 percent false alarms reaches the settle
inside two runs of 40 in either fork, and one who never steps never moves the creature and never hears anything.

3.6 **A trial.** The creature is half hidden in grass between trials (the neutral pose); a trial shows the pose (grazing for
go, head raised for no-go) for the duration, and the grass settles back over it on the hide frame (S3). The gap before the
next pose is drawn from 700 to 1500 ms, seeded, so its onset cannot be timed. A step during the gap is ignored: no step, no
snap, not a false alarm (a child anticipating has not failed to stop). A step counts from the pose's paint to its hide plus
150 ms, the pose gone but the hand already moving. Reaction time is `pointerdown` or `keydown` time minus `onPainted`'s time.

3.7 **Mode 5 SIMON v1 has no DeviceMotion.** The handoff calls it optional and entirely skippable; its permission prompt
cannot be tested headless and asks a school device a question no teacher wants. SIMON shows a large command with a picture
and, with Sound on and a voice on the device, speaks it (CATALOG-PLAN D6). "Hush says" commands are H1's go share with the
same three minimum; a command holds 3 s; a session is 90 s, thirty commands. **It scores nothing**: a law asserts SIMON never
writes the store and has no step, result or outcome in its code. It lives at `simon/index.html` and as HUSH's fifth door.

3.8 **Six tiers are six drawings, not one scaled.** Per species: tier grids of 12, 16, 20, 24, 32 and 40 pixels drawn at the
whole scale that fills the tier's place. The art law measures information, not size: each tier uses more distinct palette
colours than the tier before, and tier six carries the eye's highlight and the breath in the cold air. Every tier and pose
is drawn to its own canvas at boot, and the doors wake only after every canvas exists (the handoff's decode stall gate).

3.9 **H3 as pixels.** Every no-go pose of a tier is the same grid as its go pose with only the head and ear rows changed: a law
counts the pixels that differ (under a fifth of the grid) and asserts there is no no-go asset that is not derived from a go
grid. The alert pose is brighter (the head catches the low sun), never red: the art law measures every pixel that changes
between the two poses for hue outside 345 to 15 degrees and lightness no lower than the grazing pose's.

3.10 **Species.** v1 has three, a deer, a hare and a fox, one per run in turn; the handoff's six sprite tiers each. The living
clearing (24 places, one creature earned per settle through `collectOnce`, each at its far tier in a seeded spot, with a slow
idle of two frames) is the collectible. A shared hub clearing with NOTCH's village is Stephen's (section 10).

3.11 **Modes.** v1 is STEP and SIMON (CATALOG-PLAN call 7): MIRROR and WAIT are v1.1 and have no door; SWITCH is cut.

3.12 **Timing tolerance.** The handoff asks ±20 ms under 4x throttle. `schedule.flash` hides on the frame nearest the
deadline, within half a frame; GLIMPSE's timing gate held 30 ms on this box. HUSH's gate asserts the handoff's 20, and if the
throttled frame on this box is longer than 40 ms that bound is out of reach by arithmetic and the gate goes BLOCKED with its
numbers, never widened.

3.13 **HUSH's stamp starts at `20260916d`**, a stamp no game has carried (grep of `satellites/` empty).

3.14 **Keyboard and touch.** Space steps; a keyboard only run is complete at 1366x768. On touch the whole lower third of the
clearing is the step target, well over 56 px, with a stone drawn in it so the child sees where to press.

---

## 4. ARCHITECTURE LAW

```
satellites/hush/
├── index.html  main.js   the page: the fork, doors, the clearing, the trial loop, the approach, the settle, the clearing
├── engine.js             PURE: dealRun, hazard, scoreTrial, adaptAxes, approach, dealSimon
├── render.js             the clearing canvas, the creature's tiers and poses from prebuilt canvases, the grass
├── content.js  config.js  sprites.js  draw.js  clearing.js  sw.js  manifest.webmanifest  icons  STAMP.js
├── simon/index.html  simon/main.js   Mode 5, its own URL
├── test/   engine.mjs (node); step.mjs timing.mjs settle.mjs simon.mjs audio.mjs config.mjs layout.mjs offline.mjs
│           pace.mjs art.mjs specimens.mjs (browser)
├── tools/  check.js lint.mjs shots.mjs icons.mjs
└── docs/   DECISIONS.md shots/
```

**H1 to H9, the law each becomes.** H1 3.2's ratio and minimum on 500 runs a level, 20 seeds, and the hazard bound; H2 3.3's
independence law; H3 3.9's pixel law; H4 a false alarm plays one dry snap, moves one step back, changes no colour and ends
nothing (the step gate reads the canvas before and after); H5 no `getUserMedia` or `devicemotion` in any file (lint and CORE's
shared assertion); H6 the forbidden words list extended with hit, smash, shoot, kill, catch; H7 a run's trials are all one
mode (engine law); H8 no patience, self control, good, well done, calm in any string (lint); H9 a miss changes nothing on the
screen or in the sound (the step gate records the screen through a miss).

---

## 5. THE PHASES, WITH GATES (the handoff's section 7 mapped one to one)

### P0. The order, the axes, the approach, the laws (about 3 hours)
`test/engine.mjs` red with no modules, then on 20 seeds: `dealRun` (H1, 3.2's hazard), `scoreTrial` (hit, miss, false alarm,
correct rejection, the gap ignored, the 150 ms grace), `adaptAxes` (3.3), `approach` (3.4 and 3.5 for both forks), `dealSimon`
(3.7's share and minimum). `tools/lint.mjs` from GLIMPSE's with H5, H6 and H8's words.

### P1. The clearing, STEP, the pose, the settle (about 4 hours)
The deer's six tiers first, then the trial loop through `schedule.flash`, the approach, and the settle (the handoff: build
it early). `test/step.mjs` (the seam against the engine, H4, H9, keyboard and taps), `test/timing.mjs` (every duration level
within 20 ms under 4x throttle; reaction time unchanged by an injected 100 ms render delay), `test/settle.mjs`.

### P2. The fork, the axes in the page, SIMON, audio (about 3 hours)
The picture fork and its setting, the three staircases stored, SIMON's page and door, the voices and the ear gate.

### P3. The living clearing, links, layout, pace, offline, art (about 4 hours)
The hare and the fox, the clearing collectible, as GLIMPSE's P3, with the pace gate through a full approach and the art
gate's H3 and brightness laws.

**HUSH v1 is done** when `tools/check.js` prints ALL GATES PASSED under the lock, every gate has a red line in section 13,
every shot is opened with its faults named, it is deployed and the served files probed, and the listing line is in section
8 for Fable.

---

## 6. THE SCREENS

- **First run:** the fork, two pictures. Then a wordless loop: the deer grazes, a finger presses the stone, the deer comes
  nearer; its head comes up, the finger lifts and waits. Then the doors: STEP and SIMON.
- **A trial:** the clearing at dawn; the creature half in grass; a pose; the stone.
- **The settle:** the creature lifts its head, looks out, holds two seconds, and settles. Then the clearing with it in its
  place.
- **SIMON:** one big command and its picture, three seconds each, nothing scored.

---

## 7. ART

Code drawn pixel sprites: three species at six tiers in five poses (neutral, grazing, head up, head half raised, ear
twitch) plus the settle's look, derived from one grid per tier; grass tufts; the stone; the dawn clearing's bands; the two
fork pictures; the doors; the clearing's 24 places. `tools/sheet` renders the table and the sheet is opened with three faults
named. Painted sheets are Stephen's, later.

---

## 8. LISTING (the line for Fable's portal row)

"A deer grazes in a dawn clearing: step closer while its head is down and freeze when it looks up, a free game with no
login." (One sentence, no dash. `cat:"math"`, In Development.)

---

## 9. PITFALLS

A 50/50 order "for fairness" (H1); exactly 75 percent go, which is a count to three (3.2); a no-go creature or colour of its
own (H3); a red flash or a buzzer on a false alarm (H4, G7); a microphone for "freeze" (H5); one sprite scaled (3.8); reaction
time from the schedule (S2); three staircases on one history (3.3); a step during the gap counted wrong (3.6); from the
ledgers: a run's end meeting a long gate loop, a round playable under an overlay, a plant that plants nothing.

---

## 10. DECISION RIGHTS AND OPEN QUESTIONS

| Question | Default the build takes |
|---|---|
| Final name, and "Blink (Don't.)" | Hush, the working title; the other project is in no repo here |
| Whether SIMON gets its own title and URL | its own URL `satellites/hush/simon/`, titled "Hush says" |
| Cut Mode 3 entirely | cut (CATALOG-PLAN call 7) |
| The clearing as hub content beside NOTCH's village | HUSH's own for v1 |
| The ratio ladder (3.2) | 77.5 to 80 percent go, H1 over the axis table |
| DeviceMotion in SIMON (3.7) | not in v1 |

---

## 11. STEPHEN ONLY

The questions above and the display name; a child of four to seven on STEP in both forks; a teacher running SIMON with a
class; pose timing on a real school Chromebook.

---

## 12. HONEST SIZING

About 14 hours (P0 3, P1 4, P2 3, P3 4) against the catalog plan's one day; the art is the difference (three species at six
tiers). Where a session stops well: after P1, when STEP is honest with one deer and the settle; SIMON is next and cheap.

---

## 13. EVIDENCE LEDGER (fill in place, with commands and their real output, most recent last)

(none yet)

---

## 14. THE OVERNIGHT PROTOCOL

Never wait on a human; an ambiguity is the smallest reasonable choice logged in `satellites/hush/docs/DECISIONS.md`; a gate
red after three honest attempts goes into SESSION STATE as BLOCKED with its last thirty lines; never weaken, skip or delete a
gate; commit and push the moment something is green.

---

## 15. THE MORNING REPORT (most recent on top)

(none yet)

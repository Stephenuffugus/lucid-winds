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
  P0 done the same session: engine and lint green, 23 plants red (section 13).
  **Next action:** P1 (section 5): the deer's six tiers in `sprites.js` and `draw.js`, then the page's trial loop through
  `schedule.flash`, the approach and the settle; `test/step.mjs`, `test/timing.mjs`, `test/settle.mjs`.

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

### P0, the order, the axes, the approach and their laws (2026-09-16)

Section 3's arithmetic checked by a script before the plan (session scratch `hush-arith.mjs`), and one of its numbers was
wrong: 13 no-go at 60 came from floating point, not from `round` (3.2 now says so). `test/engine.mjs` written first; with no
engine it went red on the line that matters:
```
  FAIL  engine.js loads as an ES module (Cannot find module '/workspaces/lucid-winds/satellites/hush/engine.js' ...)
```
Then `engine.js`, `content.js`, `STAMP.js`: **ENGINE OK** on its first run, the hazard measured at 0.69 (easy, 40), 0.62 (easy,
60), 0.69 (easy, 80) and 0.50 at hard. `tools/lint.mjs` from GLIMPSE's with H5, H6 and H8: **LINT OK**. `tools/check.js`:
```
lint            pass  0s
engine          pass  0s
THE GATES THAT NEED NO BROWSER PASSED
```
**Watched red** (session scratch `hush-p0-plants.cjs`, a folder copy per plant):
```
e1 a quarter no-go at easy          FAIL  H1 easy n 40: ... run 0 has 10 no-go ... | FAIL 3.2 easy n 40: ... 1.00 of the time ..., 1 different orders
e2 a no-go after two go             FAIL  H1 easy n 40: ... run 0 trial 2 a no-go after 2 go ...
e3 the count rounded up             FAIL  H1 easy n 60: ... run 0 has 14 no-go ... | FAIL 3.2 easy n 60: ... 0.78 of the time (at most 0.75)
e4 no shuffle                       FAIL  3.2 easy n 40: ... 1.00 of the time (at most 0.75), 1 different orders in 500
e5 one gap                          FAIL  the gap before each pose ...: 4000 only 1 different gaps ...
e6 no grace                         FAIL  scoreTrial: ...: {"outcome":"miss" ...
e7 a step in the gap counts         FAIL  scoreTrial: ...: {"outcome":"hit" ...
e8 reaction time off paint          FAIL  scoreTrial: ...: {"outcome":"hit","rtMs" ...
e9 a dear false alarm in Careful    FAIL  the approach: ...: careful falseAlarm gave -2
e10 a miss steps back               FAIL  the approach: ...: quick miss gave -1 ...
e11 under zero                      FAIL  the approach: ...: 0 and a step back gave -1
e12 the settle at 21                FAIL  the approach: ...: SETTLE is 21 ...
e13 similarity on the go history    FAIL  3.3: three histories: ...
e15 modes mixed in a run            FAIL  H7: ...: 4000 step carries step,mirror ...
e16 Simon always says               FAIL  dealSimon: ...: 4000 says share 1.000 ...
e17 a command that catches          FAIL  dealSimon: ...: the list holds catch a cloud
l1 a clock in the engine            FAIL  engine.js touches no screen, clock or unseeded die: it names Date
l2 a motion sensor                  FAIL  H5: ...: content.js
l3 an unstamped import              FAIL  every relative import and local asset carries ?v=20260916d: engine.js loads ./content.js
l4 patience in the copy             FAIL  H6 and H8: ...: "Patience wins"
l5 a sound in a loop                FAIL  no sound is played from inside a loop ...: content.js plays a sound inside a loop
l6 a dash in the copy               FAIL  no dash in anything a child or a teacher reads: "Step - closer"
e14 the ratio per trial             FAIL  3.3: the ratio reads whole runs: ... (0.775, ...   (after 7b, below)
```
⛔ `e14 the ratio per trial` first planted nothing (ENGINE OK): law 7's model children have runs and trials that agree, so
feeding the ratio every no-go trial looked the same. Law 7b builds runs where the two readings disagree (a clean run whose last
no-go trials are wrong, a messy one whose last are right); e14 is red against it. All 23 P0 plants red.

### P1, STEP, timing and the settle (2026-09-16, frozen copies under the lock)

The deer looked at three times through a browserless preview before the page (plan section 7; DECISIONS). `test/step.mjs` on
`snap-hush1`:
```
  ok    375x667 every tier and pose is drawn before the door can be pressed (24 of 24)
  ok    375x667 H4: after the false alarm every pixel of the clearing is a palette colour
  ok    375x667 the run the page plays is dealRun's for the seed, trial for trial
  ok    375x667 every outcome and reaction time is scoreTrial's on the page's own times, and the steps are Node's fold (8 trials)
  ok    375x667 a press in the gap is ignored: that go trial is a miss with no step ({"outcome":"miss","stepAt":null,"steps":[2,2]})
  ok    375x667 H4: a false alarm is one step back ({"outcome":"falseAlarm","steps":[2,1]})
  ok    375x667 H9: a miss changes nothing, no step and the same picture before its pose and after it ({"outcome":"miss","steps":[2,2],"same":true})
  ok    375x667 one soft step for each trial that moved the creature, one snap for each false alarm, and no other sound (6 played, 6 wanted)
  ok    1366x768 by keys: Enter opens the door and Space on a go pose is a hit ({"outcome":"hit","rtMs":10.5})
STEP OK
```
Green on its first run, so it counts for nothing until its plants go red. ⛔ The first draft of this gate would have compared
two empty sound logs: CORE's audio logs nothing while muted and a first load is muted, so the gate turns Sound on by taps first
and asserts at least one sound was wanted.

`test/timing.mjs` on `snap-hush2`:
```
  ok    at no throttle, each duration level is shown for its length within 20 ms (400 shown 400, 480 shown 483, ... 1200 shown 1200)
  ok    under 4x CPU throttle, each duration level is shown for its length within 20 ms (400 shown 400, ... 1200 shown 1200; the frame measured 16.7 ms)
  ok    a pose held 100 ms on its show frame is painted 116 ms after it was asked for, and its reaction time 4 ms is from the paint, not the ask (120 ms)
  ok    every trial played is shown for its duration within 20 ms (1200 shown 1200, 1200 shown 1200, 1200 shown 1200)
TIMING OK
```
Green on its first run; not counted until its plants go red. The throttled frame on this box measured 16.7 ms, so 3.12's 20 ms
bound is within reach.

`test/settle.mjs` on `snap-hush3`:
```
  ok    1366x768 Careful: the settle comes on the trial whose steps reach eighteen, and no trial follows it (reached on trial 17, 18 played)
  ok    1366x768 the settle shows the raised head (2520 sunlit pixels), holds 2650 ms (two seconds or more), and the settled creature grazes (0 sunlit)
  ok    1366x768 with Sound on, the settle plays one breath (1)
  ok    1366x768 go on after the settle starts a new run at zero steps ({"steps":0,"tier":0,"runs":1})
  ok    1366x768 Quick: a run with six right steps ends at rest with six, and the next run's first trial stands at their tier ({"rest":{"steps":6,"trials":40},"nextTier":2,"want":2})
SETTLE OK
```
Green on its first run; not counted until its plants go red.

---

### P3 built, NOT YET GATED in a browser (2026-09-15 night)

- `tools/deer.mjs` now draws the deer, the hare and the fox from one parameterised drawing. Only the head, the neck and the ears
  lie left of x 0.4, so only they move between poses (H3 by construction). The three share the palette's coat indices 4, 5 and 6,
  and `COATS` swaps them at draw time, so the table stays sixteen colours (`docs/DECISIONS.md`). **The deer is unchanged**: after
  every pass its 24 sprites were compared row for row against the committed `sprites.js`, 0 differing.
- **The hare and the fox, looked at three times** (a browserless preview of every tier in graze and up, on dawn and on dark):
  - pass 1: the hare had the deer's long thin neck (a small deer), a dark disc hind leg (a wheel) and two long front sticks; the
    fox stood on four long legs in a picket row (a deer or a table), its brush was a stub, its alert ears read as antlers; both
    bodies were cut flat at x 0.4 (the rewrite had clipped the body, which the deer's own drawing never did).
  - pass 2: the hare's ears overlapped into one pole and its long foot lay apart on the grass; the fox's brush was as tall as its
    body and read as one bar, its legs still long, its alert neck a llama's.
  - pass 3, **accepted for v1 with these faults**: the hare's foot joins its haunch and its graze reads as a crouched hare, but its
    alert ears still close into one pale bar at the far tiers and a cleft stalk at the near ones; the fox's brush droops below
    its body with a white tip and its far tiers read as a fox, but at the near tiers its four evenly spaced legs still read as a
    table and body and brush run together as one long bar. Painted sheets are Stephen's.
- Written: `config.js` (seed, count, fork `child`/`quick`/`careful`) and the builder's `hush` entry; `sw.js` (hush-shell- caches
  only, SIMON's page precached, a 429 answered from cache); `manifest.webmanifest`; `tools/icons.mjs` (the deer grazing at dawn,
  from the sprite table); `clearing.js`, the living clearing (24 places, one creature per settle through `collectOnce`, each at its
  far tier in a seeded spot, a two frame idle held still with less motion); main.js wiring (parseConfig, one species an approach
  in turn after each settle, the clearing earned after a settle with the round inert under it, the worker registered).
- `test/settle.mjs` changed for the clearing: after a settle it closes the living clearing with its go before go on (the same
  overlay scar as NOTCH's turn gate). `test/step.mjs` law 1 counted a literal 24 canvases while only the deer existed; it now counts
  what `sprites.js` declares (72). Both are gates following the spec's new species, not faults of the page.
- **Gates written** (`65e77cef`): config, offline, layout, art, specimens. **Still to write:** pace (through a full approach), shots.
- **The art gate's sprite laws, looked at in Node before any browser run, found a fault the deer has carried since P1:** 3.8 says
  each tier uses more distinct colours than the tier before, and every species' grazing pose used 5 colours at tier 4 and at tier 5
  (`colours by tier [1,2,3,4,5,5]` for the deer, the hare and the fox). Tier 5's new details reused colours: the eye's highlight is
  the tail's white, the feet are the eye's dark, and the breath shows only in the alert poses. No earlier gate measured 3.8's count.
  Fixed in the drawing: at tier 5 the low sun catches the top of the back (the palette's sun colour `d`, gold, right of x 0.42, so
  the same in every pose). After it: `[1,2,3,4,5,6]` rising for all three; H3 faults 0, red 0, darker 0; exactly twelve sprites
  changed (each species' four tier 5 poses), no tier 0 to 4 sprite changed; lint green. This is the pre-look, not the gate: the art
  gate still has to run under the lock and be planted.
- **Icons** drawn into the tree under the lock (`tools/icons.mjs`, the deer's tier 4 grazing pose at dawn) and opened. Faults: the
  deer stands on four long evenly spaced bars that read as a stool at launcher size (the drawing's own scar); the game's thesis is
  not in the picture, no stone to press and no raised head to wait for; the creature sits right of centre under a sky and sun band
  that fill the top third and dominate at 48 px. Accepted for v1 (painted art is Stephen's).

### The first full check (2026-09-15 night, frozen copy of `6607fa22`, the timeout inside the lock)
```
lint pass · engine pass · step pass 37s · timing pass 29s · settle pass 135s · fork pass 109s · simon pass 185s
audio FAIL 16s · config pass 3s · offline pass 15s · layout FAIL 108s · art pass 6s · pace FAIL 96s · specimens FAIL 147s
4 GATES FAILED
```
Every gate written for the species and the clearing ran; four red, each read before it was called:
- **audio, the page's fault.** `FAIL every voice passes through the master: halving it halves the rms and the peak (0.498)`. The rms
  halved exactly; the peak did not, and the law wants both. The snap and the breath built their noise with `Math.random()` while
  CORE hands every voice a **seeded** `rand` (TINT's pour takes it): two renders drew different noise, so their peaks differed by
  luck. An unseeded die in a runtime file. Both voices now take CORE's `rand`.
- **layout, the gate's fault** (8 of them). `FAIL ... nothing is fetched after load (15 requests after load ...)` in exactly the two
  states whose `reach` reloads to seed where the approach stands. `assertNoNetworkAfterLoad` counts every request since the page
  opened, so the gate was failing its own navigation. The law measures what happens after a state is reached, so the gate clears
  that record once its last navigation is done.
- **specimens, the gate said nothing about the device's motion setting.** `FAIL ... the clearing breathes ... {"moving":[0,0],"still":[0,0]}`:
  the idle frame never moved in either half, and a zero named nothing. CORE's `SETTINGS_DEFAULTS.reducedMotion` is false, so the
  clearing should breathe; the gate now sets the media feature for each half (the environment, not the state it asserts) and
  reports what the page read, so the next run names the cause.
- **pace, no evidence in the line.** `FAIL ... with less motion the settle still holds 0 ms`: a zero means the gate never saw a
  settle phase, which could be the approach not settling or the watcher missing it. The line now carries the phases seen, the steps
  reached, the trials played and whether the clearing opened.

### The shots, taken and opened (2026-09-15 night, `tools/shots.mjs`, written this session)

Seven states at four sizes, twenty eight shots, all under the 200 KB limit. **`p3-living-375x667`** opened first:
⛔⛔ the board's sky band is the page's own cream, so the top third reads as a hole cut in the frame rather than sky; ⛔ one
creature at the far tier is a speck in an empty green field, so the clearing does not read as the creature that settled there;
⛔ the board floats with a deep empty page above and below it and an unlabelled go under it. The first two are the drawing's, and
fixed: the sky is now a strip with the trees under it and a dark grass hem at the foot, and a creature is drawn from the third
tier's grid at a scale that reads at 375. **The retaken `p3-living-320x568`, opened:** the board now reads as a clearing, a sky
strip over the sun band, the trees, the grass and a dark hem inside its frame, and the hole in the frame is gone. ⛔ the creature is
still small at 320 (the board is 264 px wide there and one creature at the third tier is a thumbnail in it), which stays on the list
for v1.1.

Two more opened: **`p3-alert-hare-375x667`** (the hare, ears up, at a middle tier, which reads): ⛔ the clearing's dawn sky is the
page's own colour and the canvas has no edge, so there is no sky above the trees, only page; ⛔ the stone sits in a separate green
panel that reads as a second field rather than as the ground a child presses; ⛔ the hare stands on flat green with nothing under
its feet between trials. **`p3-step-fox-far-320x568`**: ⛔ the fox at the far tier is an orange smudge, not a fox; ⛔ the same sky
that is page; ⛔ the stone's panel takes nearly the height of the clearing at 320, squeezing the field the creature crosses.
The sky was fixed (the clearing now carries a mist coloured edge); the far tier's smudge is the drawing's own limit at twelve
pixels and the stone's panel is 3.14's step target, both accepted for v1. **`p3-alert-hare-320x568`** opened after the edge: the
clearing reads now, bands and frame, and the hare reads; ⛔ the creature stands high against the tree band with little grass above
it, so it looks pasted rather than standing in the field; ⛔ the stone's panel is nearly as tall as the clearing at 320; ⛔ the
page's top third is empty. **`p3-step-deer-near-320x568`** opened after the edge: the deer reads at 320 now; ⛔ its head still
hangs below the line of its chest; ⛔ it stands high in the field with the grass hem far below its feet; ⛔ the stone's panel is
half the clearing's own height at this size.

Two more opened. **`p3-fork-320x568`** (the first screen a child meets): ⛔ the wordless loop reads as a brown lozenge and a grey
stub, not as a creature nearing a stone, so the screen teaches nothing before the choice; ⛔ the hare fills its card while the heron
is small and thin, so the pair does not read as two equal choices; ⛔ a wide empty band sits under them at 320. **`p3-simon-375x667`**:
⛔ one line of words, then a vast empty page, then two buttons: nothing shows what a command looks like before Begin; ⛔ back to the
clearing is wider and heavier than Begin, so the way out dominates the way in; ⛔ the page carries no picture of the game at all.
The loop and SIMON's page want art and a worked example, both Stephen's calls; noted for v1.1, accepted for v1.

**`p3-simon-320x568`** opened too: the same three faults at the smaller size, and the empty middle is larger still, so the page
reads as two buttons and a line.

Two more opened. **`p3-step-deer-near-375x667`** (the deer at a near tier, grazing, in play): the deer reads at this size, but
⛔ its head hangs below the line of its front legs, so it reads as a long necked animal drinking rather than a deer at the grass;
⛔ the creature casts no shadow and stands on a flat band, so it floats; ⛔ the stone is a small grey pebble inside a much larger
green panel, so the thing to press is not what the eye lands on. **`p3-doors-320x568`**: ⛔ the wordless loop is two brown blocks
and a grey stub, not a creature and a stone; ⛔ the door pictures are small inside large cards, and SIMON's stick figure does not
share the pixel style of the deer beside it; ⛔ deep empty bands above and below the doors. The head's hang is worth a line in the
drawing later (the muzzle sits at the grass, not under the chest); the rest is art, Stephen's call.

### The recheck of the four reds (2026-09-15 night, frozen copy of `5fbaba53`)

**AUDIO OK** (twenty loud seconds: peak 0.087, rms 0.0049, 1.0 percent above 3 kHz): the page fix holds, both noises now drawn
from CORE's seeded source, so halving the master halves the peak as well as the rms. **LAYOUT OK**: the gate no longer fails its
own seeding reload. PACE and SPECIMENS follow. A further layout rerun is queued on `ead46dc3`, because the clearing's new edge
changes the very box that gate measures.

## 14. THE OVERNIGHT PROTOCOL

Never wait on a human; an ambiguity is the smallest reasonable choice logged in `satellites/hush/docs/DECISIONS.md`; a gate
red after three honest attempts goes into SESSION STATE as BLOCKED with its last thirty lines; never weaken, skip or delete a
gate; commit and push the moment something is green.

---

## 15. THE MORNING REPORT (most recent on top)

(none yet)
- PLANT timing t1 (the timed pose asks 60 ms long): green run TIMING OK, planted red twice (no throttle and 4x) — "400 shown 467, 480 shown 533, 560 shown 617 ...". The duration law sees every level stretched. COUNTS.
- PLANT step s1: DOES NOT COUNT, the plant was never seen (the same runner collision). Requeued.
- SHOT p3-living-375x667.png OPENED. Faults: (1) the earned deer is a speck in a wide empty field — one creature reads as a stain, not a reward; (2) at this size it reads as a bench or a table, legs even and head sunk; (3) the sky strip is a cream band almost exactly the page colour with an orange band under it, so it reads as two stripes and not as sky; (4) no trees are drawn at this width although the clearing means to have them, and the play button sits far below the frame.
- SHOT p3-fork-375x667.png OPENED. Faults: (1) the creature in the fork panel is CLIPPED by the panel’s bottom edge — a brown block sits on the border and a grey lump hangs through it into the page, so the one thing the fork is about is cut in half; (2) the two choices are pictures only, a leaping deer and a standing bird, with no words at all to say what choosing either means; (3) the bird belongs to no species this game has (the three are deer, hare and fox), so the fork offers a creature the clearing can never hold; (4) the panel above is empty except for that clipped block, and everything sits in a band across the middle with the top and bottom thirds bare.
- LAYOUT GREEN at ead46dc3: LAYOUT OK across all four sizes with the clearing’s edge in place. HUSH’s gates now stand: step, settle, timing, config, offline, art, audio and layout green; specimens and pace still owed (both reruns queued, both after gate faults of my own making, the idle counter and the rAF watcher).
- CORRECTION to the p3-fork entry above: I said the bird was a species the clearing can never hold. The code says otherwise — main.js appends spritePicture('hare', 88) to the quick choice and spritePicture('heron', 88) to the careful one, so the heron is a deliberate emblem for standing still, not a stray creature, and SPECIES (deer, hare, fox) is a separate list of what is collected. ⛔ I named a fault from a picture without reading the line that drew it. What actually stands, and it is worse: the hare on the quick card reads as a DEER at 88 px (long legs, brown coat, mid leap), and deer is a real species the child earns in the clearing, so the fork’s quick choice looks like the first creature they will collect. The clipped creature on the panel edge, the wordless cards and the empty bands all stand as written.
- SHOT p3-step-fox-far-375x667.png OPENED. Faults: (1) the fox at the far tier is a small brown blob about 60 px wide that reads as a mushroom or a fallen log, not as an animal, so the thing the whole game is about is unrecognisable at the distance it starts from; (2) the panel under it holds a grey lump on green that reads as nothing at all; (3) the scene bleeds to both screen edges with no frame while the panel below it has a rounded green frame, so one screen carries two different treatments of the same idea; (4) the sky is the cream and orange banding again, the same fault the clearing shot shows.
- SPECIMENS RED, and it is the page, proved: the rewritten law read the clearing’s own canvas and got the identical number four times (88640784 in both halves) with reduced motion genuinely off (media false, class false). Cause found in render.js: drawLiving chose the pose with `frame % 2 === 1 && s.twitch`, so the twitch decided WHETHER a creature ever moved, and spotOf(0).twitch is false on the seeded places (0 false, 1 true, 2 false, 3 true ...). The first clearing a child earns holds exactly one creature, place 0, so it could never lift its ear and the clearing was frozen by design without anyone meaning it. FIX: the twitch is a phase, not a switch — `(frame + (s.twitch ? 1 : 0)) % 2` — so every creature breathes and half of them on the opposite beat. Specimens requeued.
- SHOT p3-simon-375x667.png OPENED. Faults: (1) the instruction sits at the top and the two buttons sit near the bottom with about 550 px of nothing between them, so more than half the screen is void; (2) a game about watching an animal shows no animal here at all, not even the creature the instruction names; (3) Begin and Back to the clearing are stacked at different widths and different weights, so the smaller, less important one looks like the lesser of two equals; (4) the instruction names Hush as if it were a character, while everywhere else Hush is the game, so a child is told to obey something the game never shows them.
- SHOT p3-alert-hare-375x667.png OPENED (retaken). The best creature drawing in HUSH: at the near tier the hare reads as a hare, ears up, head turned, clearly alert, which is exactly what the game asks a child to notice. Faults: (1) the top band of the frame is cream at almost exactly the page colour, so the frame still reads as a hole cut in the page above the horizon; (2) the sky is three flat bands (cream, orange, sage) meeting at hard seams with nothing between them, so the horizon reads as stacked tape; (3) the hare’s hind legs are two separate brown blocks with a gap to the body, so the animal comes apart at the back; (4) the panel below still holds a grey lump on green that reads as nothing at all.
- SHOT p3-doors-375x667.png OPENED, and it makes the fork’s clipping a PAGE FAULT rather than a one off: the creature in the panel is cut by the panel’s bottom edge here too, the same brown blocks sitting on the border with a grey lump hanging through it. Two different screens clipping the same way means the panel’s height or the creature’s scale is wrong at 375, and it needs fixing in the page, not in one screen. Other faults: (1) two doors, no words, so HUSH joins NOTCH, GLIMPSE and BRIM; (2) the right hand door is a small human figure with its arms raised, a person in a game that otherwise holds only animals, and nothing says what it means; (3) the panel above is empty cream at almost the page colour apart from the clipped creature, so it reads as a hole; (4) the top third and bottom third are empty.
- PACE GREEN at 8f00ed4d: PACE OK, all five laws, after three honest attempts (truncated evidence, then a rAF watcher that died, then a timer watcher that caught its own throw). ⛔ READ THIS BEFORE CALLING IT FIXED: the ONLY change between red and green was wrapping the tick in try/catch, which means the page really does throw inside a frame after the settle and the catch simply let the watcher survive it. The green is honest for what the law measures (the settle holds two seconds and go on comes) but the throw is still there and is the prime suspect for the frozen clearing too. The specimens gate now listens for pageerror and will name it.
- SHOT p3-step-deer-near-375x667.png OPENED. The near tier deer reads clearly as a deer grazing, head down to the grass, which is the pose the game is about. Faults: (1) the four legs are straight posts of identical width with black feet and no bend at any joint, so the animal stands like a table; (2) the white rump patch floats clear of the body with a gap of background between them, so a piece of the deer looks detached; (3) the panel below holds the same grey lump on green that reads as nothing in every HUSH screen it appears in; (4) the sky is the three flat bands meeting at hard seams again.
- SHOT p3-fork-320x568.png OPENED, and it settles the clipping as a real page fault at every size: the creature in the panel is cut by the panel’s bottom edge here exactly as at 375, a brown block sitting on the border with the grey shape hanging through it. Three screens now (fork at 375, doors at 375, fork at 320). Also confirmed at this size: the left card’s hare still reads as a DEER (mid leap, long legs, white rump), which is the species a child earns first, while the heron on the right is unmistakable — so the two cards are drawn to different standards, and the clearer one is the bird that never appears again.
- SHOT p3-living-1366x768.png OPENED, and it CORRECTS MY OWN GROUPING: the earned deer stands mid field here, a little right of centre, exactly as it does at 375. HUSH’s clearing places creatures by a seeded spot across the whole field, so it does NOT belong in the corner disease list I wrote earlier; that list is NOTCH’s village, GAUGE’s case, GLIMPSE’s journal, BRIM’s shelf and CREASE’s shelf. ⛔ fifth correction tonight, and this one is against a pattern I claimed myself. Faults that stand for this screen: (1) the deer still reads as a bench, four posts under a slab, at every width; (2) the sky is the cream and orange banding with hard seams; (3) the clearing is a 490 px box centred in a 1366 px screen with both flanks bare; (4) one creature in a wide empty field still reads as a stain rather than as a beginning.
- SPECIMENS GREEN at 854b328e: SPECIMENS OK, all six laws, after four attempts. The story in order, because it is the most instructive thing in this game’s ledger: (1) the law read the clearing’s own idle counter and a zero named nothing; (2) rewritten to read canvas pixels it returned the same number twice, which looked damning; (3) a real page fault was found and fixed on the way (the twitch decided WHETHER a creature moved, and place 0’s twitch is false, so the first clearing a child earns was frozen); (4) the pixels still matched, the page threw nothing, and the fault was the law itself ALIASING — sampling at 0 and 3000 ms against a 1400 ms two phase cycle returns the same phase. Sampling across the three seconds and counting distinct pictures turned it green. ⛔ TWO IDENTICAL READINGS THREE SECONDS APART ARE NOT EVIDENCE OF STILLNESS unless the sampling interval is coprime with the cycle.
- EVERY HUSH GATE NOW PASSES: lint, engine, step, settle, timing, fork, simon, config, offline, art, audio, layout, pace, specimens. Owed before deploy: the plants (timing t1 and settle e1 counted; step s1 and simon m1 in flight; the rest owed) and the shots, of which many are opened with faults named above.
- PLANTS COUNTED for HUSH: timing t1 (every duration level stretched), settle e1 (the settle held one second instead of two), fork k1 (a link naming Careful wins over the kept Quick and does not ask), config g1 (the builder offering a run length the page does not parse). Each was red on its own green run.
- ⛔ AUDIO PLANT a1 DOES NOT COUNT, AND FOR A REASON THAT MATTERS: its GREEN RUN was RED ("every voice passes through the master: halving it halves the rms and the peak (0.500)"). A plant behind a red green run is worthless, but worse, that snapshot was taken before tonight’s audio fix (snap and breath were using Math.random where CORE hands every voice a seeded rand), so the plant pass was testing stale code. Re-running the audio gate and a1 against current HEAD now. Until that comes back, HUSH’s audio gate is UNPROVEN tonight, whatever the earlier ledger line says.
- ⛔ PLANT SNAPSHOTS GO STALE, AND A STALE SNAPSHOT TURNS EVERY PLANT BEHIND IT INTO NOISE. The plant runner needs PLANT_ROOT to be an already populated tree (it copies satellites/math out of it), and the roots used through the night were built hours ago. So: HUSH’s audio plant pass ran against code from before tonight’s seeded rand fix, and TINT’s pour green run printed POUR OK against the OLD pour law, not the length law added minutes earlier, which means that w1 result proved nothing either way. Twice tonight I also pointed PLANT_ROOT at an empty folder, which crashes the runner with a cp error and prints "(no result line) [exit null]" for the green run. THE RULE: build the snapshot with `git archive HEAD` immediately before a plant pass, and treat any plant whose green run did not print a real green result as not run at all. Fresh snapshots built from HEAD and the owed plants rerun.
- SHOT p3-simon-1366x768.png OPENED. Faults: (1) the instruction sits at the very top and the two buttons sit in the middle of the page with roughly 380 px of empty cream between them, so the screen reads as two unrelated fragments; (2) still no animal anywhere, in the game about watching one; (3) Begin and Back to the clearing sit SIDE BY SIDE here and STACKED at 375, so the control changes arrangement between sizes with nothing saying which is intended, the same complaint as GAUGE’s chevrons; (4) the whole page holds two lines of furniture on 1366 by 768 with everything else bare.
- AUDIO GREEN on a snapshot built from HEAD: AUDIO OK. The red seen in the earlier plant pass was stale code, exactly as suspected, so HUSH’s audio gate stands proved tonight and the unproven note above is lifted. The a1 plant is running against the same fresh snapshot.
- PLANT simon m1 (SIMON writes a stored key): green run SIMON OK, planted red — "it scores nothing: a whole session of thirty leaves every stored key as it found it (2 keys)". COUNTS. HUSH plants counted: timing t1, settle e1, fork k1, config g1, simon m1; step s1, audio a1 and offline o1 in flight.
- SHOT p3-alert-hare-320x568.png OPENED. The hare reads clearly as a hare at 320 too, ears up and head turned. Faults: (1) the frame’s top band is cream at almost exactly the page colour, so above the horizon the frame still reads as a hole cut in the page; (2) the sky is three flat bands meeting at hard seams; (3) the hare’s hind legs are two separate blocks set apart from the body, so the animal comes apart at the back at this size as well; (4) the panel below holds the same grey lump on green that reads as nothing.
- PLANT audio a1 (the snap wired past the master): green run AUDIO OK on the snapshot built from HEAD, planted red — "every voice passes through the master: halving it halves the rms and the peak (0.617)". A voice wired to the destination instead of the master survives a halved master, and the law hears it. COUNTS. HUSH plants counted: timing t1, settle e1, fork k1, config g1, simon m1, audio a1; step s1 and offline o1 still in flight.
- SHOT p3-step-fox-far-320x568.png OPENED. Faults: (1) at 320 the far fox is an orange smudge about 30 px wide with no legs, ears or tail readable — the creature a child is asked to watch is unrecognisable at the distance the approach starts from, and this is worse than at 375; (2) the scene bleeds to both screen edges with no frame while the panel below it has a rounded green frame, two treatments of the same idea on one screen; (3) the sky is the three flat bands with hard seams; (4) the panel below still holds the grey lump that reads as nothing.
- SHOT p3-step-deer-near-320x568.png OPENED. At the near tier the deer reads clearly as a deer, head down grazing, and it is the strongest creature drawing in the game at this width. Faults: (1) the four legs are identical straight posts with black feet and no bend at any joint, so the animal stands like a table; (2) the white rump patch floats clear of the body with background showing between them; (3) the scene bleeds to both screen edges with no frame while the panel below has a rounded green one, two treatments on one screen; (4) the panel below holds the same grey lump that reads as nothing in every screen it appears in.
- SHOT p3-fork-1366x768.png OPENED. Faults: (1) the creature in the panel is clipped by the panel’s bottom edge at 1366 as well, so the clipping holds at all three widths tested and is unambiguously a page fault; (2) the panel is a 225 px box centred in a 1366 px screen with roughly 570 px bare on each flank; (3) the two choices still carry no words; (4) the leaping hare still reads as a deer while the heron is unmistakable.
- PLANT step s1 (a false alarm costs no step, H4): green run STEP OK, planted red — "H4: a false alarm is one step back ({outcome: falseAlarm, steps: [2,2]})". COUNTS. HUSH plants counted: timing t1, settle e1, fork k1, config g1, simon m1, audio a1, step s1 — seven. Offline o1 is the last one owed.
- SHOT p3-living-412x915.png OPENED. Faults: (1) the earned deer still reads as a bench, four posts under a slab, at the tall size too; (2) the clearing floats in the middle of a 915 px tall screen with roughly 500 px of empty cream above it and 560 below, so the one thing a child has earned sits in a sea of nothing; (3) the sky is the cream and orange banding with hard seams, and the top cream band matches the page colour so the frame reads as a hole; (4) one creature in a wide field still reads as a stain rather than as a beginning.
- SHOT p3-alert-hare-412x915.png OPENED. The alert hare reads well at this size too, ears up, head turned, the pose the game is about. Faults: (1) the frame’s top band is cream at the page colour, so above the horizon the frame reads as a hole; (2) the sky is three flat bands meeting at hard seams; (3) the hare’s hind legs are separate blocks set apart from the body; (4) the panel below holds the grey lump that reads as nothing, and below that 40 per cent of the screen is empty.
- SHOT p3-step-fox-far-412x915.png OPENED. Faults: (1) the far fox is an orange smudge about 40 px wide with no legs, ears or tail readable, so at the distance the approach starts from the creature is unrecognisable at every width tested; (2) the scene bleeds to both screen edges with no frame while the panel below it carries a rounded green frame, two treatments of the same idea on one screen; (3) the sky is three flat bands meeting at hard seams; (4) the bottom 55 per cent of a 915 px screen is empty.
- PLANT PASS READ IN FULL, and half of it is STALE: that pass ran against a snapshot taken before tonight’s fixes, so its green runs for audio, layout, pace and specimens are RED in the output and everything behind them counts for nothing. From that pass, COUNTED: timing t1, settle e1, fork k1 (a teacher’s fork link ignored), config g1, offline o1 (a worker deleting the old app’s caches), art c1 (every species in the deer’s coat). With audio a1, step s1 and simon m1 from the fresh HEAD snapshots, HUSH stands at NINE plants counted. OWED: layout y1, pace p1, specimens v1, now running against a snapshot built from HEAD where those three gates are green.
- SHOT p3-doors-412x915.png OPENED. Faults: (1) the creature in the panel is clipped by the panel’s bottom edge at this width too, the fourth screen showing it; (2) the two doors carry no words, and the right one is a small human figure with raised arms in a game that otherwise holds only animals; (3) the panel above is empty cream at almost exactly the page colour apart from the clipped creature, so it reads as a hole; (4) the doors sit in a band across the middle with roughly 690 px of empty page below.
- SHOT p3-simon-412x915.png OPENED. Faults: (1) the instruction sits at the top and the two buttons sit halfway down with roughly 600 px of empty cream between them, so the screen reads as two unrelated fragments at every width; (2) no animal appears anywhere, in the game about watching one; (3) Back to the clearing is far wider than Begin, so the lesser choice carries the greater weight; (4) the instruction names Hush as a character while everywhere else Hush is the game, and the bottom 45 per cent of the screen is empty.
- PLANT layout y1 (go on at 30 px): green run LAYOUT OK, planted red at 320, 375 and 412 — "the round after the clearing closes: the controls are 56 px targets and the gear 48 px: #next 30x30 (needs 56)". COUNTS. HUSH plants counted: ten. Owed: pace p1 (running) and specimens v1.
- PACE PLANT p1 DOES NOT COUNT, AND PACE ITSELF IS NOW SUSPECT: the GREEN RUN went red — "1366x768 with less motion the settle still holds 0 ms (two seconds or more) ... sawSettled:false, frames:56" — the same signature that this gate had before the timer watcher, on a box carrying a load of about 3 with ten browsers alive. Pace was GREEN at 8f00ed4d on a quieter box. So either the timer watcher still loses the last change under load, or the settle genuinely misses two seconds when the machine is busy. Either way p1 proves nothing and HUSH does not deploy on a gate that passes only when the box is idle. Re-running pace by itself.
- SHOT p3-step-deer-near-412x915.png OPENED, the best creature drawing in the catalog at any size: the near deer reads unmistakably as a deer grazing, head down, ears and rump marked. Faults: (1) the four legs are identical straight posts with no bend at any joint, so it stands like a table; (2) the white rump patch floats clear of the body with background showing between them; (3) the scene bleeds to both screen edges with no frame while the panel below carries a rounded one; (4) the panel below holds the grey lump that reads as nothing.
- PACE IS FLAKY, AND THE PLANT RUN PROVED IT BY PASSING: in the same pass, the GREEN run failed with "the settle still holds 0 ms ... sawSettled:false", while the run WITH THE PLANT APPLIED passed with "the settle still holds 2643 ms ... sawSettled:true". The same code gave opposite verdicts minutes apart on a loaded box, so this is a timing flake, not a fault in the page and not a result about the plant (which is recorded as not seen). ⛔ A GATE THAT CAN PASS OR FAIL ON THE SAME CODE IS NOT A GATE. Re-running pace by itself on a quiet box; if it is green there and red under load, the law needs to measure the hold in a way that survives a busy machine rather than being widened until it stops complaining. HUSH does not deploy until pace gives the same answer twice.
- PLANT specimens v1 (every creature the first) COUNTS: green run SPECIMENS OK, planted red twice — "the next two settles add the hare and then the fox, each in a spot of its own ([deer])" and "a reload in the middle of an approach earns nothing ({midHeld:1 ...})". ELEVEN HUSH PLANTS now count: t1, e1, k1, g1, o1, c1, a1, s1, m1, y1, v1. The only one owed is pace p1, and pace is the flaky gate, so that is the single thing between HUSH and deploying.
- SHOT p3-fork-412x915.png OPENED, the FIFTH screen showing the clipped creature: the brown block sits on the panel’s bottom edge with the grey shape hanging through it, at 320, 375, 412 and 1366 alike, on both the fork and the doors. That is a page fault at every size and every screen it appears on, not a one off. Other faults: (1) the two choices still carry no words; (2) the leaping hare still reads as a deer, the species a child earns first, while the heron beside it is unmistakable, so the two cards are drawn to different standards; (3) the panel floats mid screen with roughly 640 px of empty cream above it.
- **THE PACE FLAKE IS NAMED, and it was a race in my own instrument.** The quiet box run failed with the fullest evidence yet: sawSettle true, sawSettled FALSE, watchError NULL, and **samples 4654** — so the ten millisecond sampler ran for roughly forty six seconds, never threw, and still never observed the phase "settled", while the page answered "settled" the moment it was asked afterwards. That combination rules out a stall, a throw and a dead timer, and leaves exactly one thing: waitForFunction polls on animation frames and resolves the instant the phase flips, then the gate clears the timer a few milliseconds later. The final change can fall between two ticks. Under load the timing shifts, which is why the SAME CODE passed at 2643 ms in one run and failed at 0 ms in another.
- FIX: the settled moment is now recorded AT FIRST OBSERVATION — in the same evaluate that stops the timer, if the sampler missed the mark, the gate reads performance.now() and records it (flagged caughtAtRead). The measurement error is bounded by one polling interval instead of being unbounded and silent. The law’s claim is unchanged: the settle still has to hold two seconds. ⛔ THE LESSON, and it is the same one four times over tonight: when a gate and a page disagree, suspect the instrument before the game — an aliased sampling window, a one column pixel read, a truncated grep, a stripped stack, and now a sampler racing the waiter.
- **PACE OK with the race fix** — the settled moment caught at first observation instead of hoping a ten millisecond tick lands inside the window where waitForFunction resolves. One pass, though, is exactly what a flaky gate gives, and I wrote here earlier that HUSH does not deploy until pace answers the same way twice. So it is being run TWICE MORE before it counts, and the p1 plant is being re-run as a pair now that the green run can actually be green (its earlier line, "NOTHING (the plant was not seen)", sat behind a red green run and proved nothing either way).
- ⛔ the standard I am holding this to, written down so it is not quietly dropped at four in the morning: a gate that passed once on a box that has been busy all night is not a proved gate. Three consistent runs and a plant that bites, or it stays owed.
- **PACE IS STABLE: THREE CONSECUTIVE PACE OK** on the same tree with the race fix (the first run after the fix, then two deliberate repeats). That meets the standard written above before I would let it count — a gate that passed once on a box busy all night is not a proved gate. The flake is gone because its cause is gone: the settled moment is recorded at first observation instead of depending on a ten millisecond tick landing inside the window where waitForFunction resolves. The p1 plant is running as a pair now; when it bites, HUSH has every gate green and twelve plants, and the only thing left is the deploy.
- ⛔ worth keeping for the fleet: this gate passed and failed on IDENTICAL CODE within minutes earlier tonight, and the tell was not in the game at all — it was 4654 samples with no throw and a mark still missed. When a gate is flaky, count what the instrument managed to observe before touching the page.
- **PACE GREEN RUN GENUINELY GREEN** (2654 ms, sawSettle and sawSettled both true, the tail ending gap/pose/grace/settle/settled) — so the race fix holds under a real pass, not just a lucky one. **BUT PLANT p1 PLANTS NOTHING**: with a 30 ms busy frame injected into every paint, the gate still passed (the planted run reported 2643 ms and PACE OK). That is the THIRD plant tonight to earn its keep by planting nothing rather than by biting — TINT’s pour w1 (the law never claimed the pour’s length, then the reader could not see the streaks), NOTCH’s find f1 (the law counted outlines without naming which region), and now this one.
- So one of two things is true and the plant will say which: either the plant patches a paint path that does not run during the measured approach, or the frame laws are too loose to feel 30 ms a frame. Reading what it patches before touching either. HUSH is NOT deploy ready while a plant against its pace gate proves nothing.
- **THE PACE HOLE, MEASURED PRECISELY**: healthy tier change gaps are 17, 17, 17, 17, 17 ms; with plant p1’s 30 ms busy paint they are 17, 33, 17, 17, 17. ONE gap moves, against a ceiling of 100 ms, so the plant slipped through. The frame cadence law is identical either way (median 16.7 ms both times) because MOST FRAMES NEVER PAINT — a slow paint hides in a median of frames.
- FIX: the bound is now RELATIVE to the machine’s own frame rate — a tier change may take no more than one and a half frames plus five milliseconds (mid * 1.5 + 5). Healthy: 17 against a bound of about 30, green. Planted: 33 against 30, red. An absolute bound tight enough to catch 33 ms would go flaky the moment the box got busy, which is exactly the trap the settle law fell into earlier tonight, so this one scales with the machine instead.
- **p1 STILL PLANTS NOTHING against the relative law, and my own measurement says why**: the busy paint inflated only ONE of five tier changes (17, 33, 17, 17, 17 ms). Whether it crosses the bound is therefore a coin flip, and in this run it did not — both the green run and the planted run returned PACE OK. The LAW is sound and measured (33 ms against a bound of about 30, and it scales with the machine so it will not go flaky under load); the PLANT is the wrong shape for it, because a busy paint only shows up when a paint happens to coincide with a tier change.
- By the rule, a plant that plants nothing is REWRITTEN, never counted. p1 is being rewritten to slow every FRAME rather than every paint, where the cadence law (median at most 18.2 ms over a full approach) would feel it decisively rather than by luck. ⛔ the distinction worth keeping: the first two times a plant planted nothing tonight it named a hole in a law; this third time the law was already right and the PLANT was unreliable. Telling those two apart is the whole point of measuring before rewriting either one.
- p1 REWRITTEN, and aimed at what the law actually measures: the page has NO continuous render loop — its only requestAnimationFrame is `waitMs`, whose tick drives every wait — so the plant now burns 30 ms inside THAT tick. Burning CPU in a frame callback delays the next frame for everything, so the cadence law (a median of at most 18.2 ms over a full approach, measured by the gate’s own frame watcher) should move from about 16.7 ms to something near 46 and go red decisively, rather than depending on whether a paint happens to land on a tier change. The old plant is recorded above with why it was unreliable; this one is named for what it does, "a 30 ms busy frame in every wait".
- **PLANT p1 BITES, DECISIVELY**: green run PACE OK, planted red — "no decode stall and no slow paint: every frame that draws a new tier comes within 100 ms of the one before and within 30.1 ms (one and a half frames plus five), at a median frame of 16.7 ms ([1:33, 2:33, 3:33, 4:33, 5:33])". ALL FIVE tier changes inflated, not one in five, so the verdict no longer depends on luck. Both halves of the fix are proved: the law is the right claim (relative to the machine, so it cannot go flaky under load) and the rewritten plant hits the page’s only frame path instead of the rare painting one.
- **TWELVE HUSH PLANTS NOW COUNT**: timing t1, settle e1, fork k1, config g1, offline o1, art c1, audio a1, step s1, simon m1, layout y1, specimens v1, pace p1. Every gate is green and pace is stable across three consecutive runs.
- BEFORE DEPLOYING: a full sweep of every HUSH gate is running, for the same reason NOTCH got one — pace.mjs has been edited twice since the last complete check, and "they were green earlier tonight" is exactly the stale evidence I have spent the night correcting. A deploy is not the place to start trusting it.

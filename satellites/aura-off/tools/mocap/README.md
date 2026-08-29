# tools/mocap — the mocap bridge

Turn free, licence-clean motion capture into `moves.js` keyframes on the frozen
twelve-joint rig, and — more importantly — **show a human what the projection
cost**, so a move gets approved or rejected on evidence instead of vibes.

```
  CMU ASF/AMC ─┐
  BVH (Mixamo) ─┼──►  TAKE  ──►  retarget  ──►  our 12 joints  ──►  proposed move
  MediaPipe    ─┘   (3D points)               (screen-space deg)     (a human reads it)
```

| file | what it is |
|---|---|
| `asfamc.js` | CMU ASF/AMC → TAKE (parser + forward kinematics) |
| `bvh.js` | BVH → TAKE (Mixamo and most exports) |
| `retarget.js` | TAKE → twelve joints, phrase picking, clamp stats, keyframe reduction |
| `cli.js` | fetch/cache, list, convert, and **the contact sheet** |
| `cache/` | downloaded source motion — **gitignored, never committed** |

Zero runtime dependencies. This is tooling; none of it ships inside the game.
`puppeteer` is used only to turn the contact sheet SVG into a PNG, and the sheet
works without it.

**Nothing here writes into `src/`.** `convert` prints a move, or writes it to a
file you name. Appending it to `moves.js` is a human decision, made after
looking at a sheet.

---

## Licence — read this before shipping anything

| Source | Terms | Use |
|---|---|---|
| **CMU Graphics Lab Mocap DB** | free; may be copied, modified, and included in commercially-sold products; may **not** be resold as data | ✅ ship |
| **Mixamo** (Adobe) | free account; no royalties, unlimited commercial use in a finished game; may **not** redistribute the raw animation files | ✅ ship |
| **MediaPipe Pose** | Apache 2.0 | ✅ tool |
| Traced / rotoscoped video | a derivative of the *recording*, which is a separate copyright from the choreography | ⛔ never |

> **Credit `mocap.cs.cmu.edu` wherever CMU-derived motion ships.** In the game's
> credits, when the **first** CMU-derived move lands — not later. The CLI prints
> this reminder on every fetch and stamps it into every proposed move, because
> the failure mode is forgetting, not disagreeing.

Two facts that are commonly got wrong, both from CONTRACT §1:

- The Copyright Act excludes **"social dance steps and simple routines"** — a
  shrug, a wave, six-seven. Free to rebuild.
- But *Hanagami v. Epic*: **"short does not always equate to simple."** A complex
  choreographed sequence can be protected at ~2 seconds. Meme gestures yes, a
  professional's routine no. And the video is always a separate copyright from
  the movement, which is why we extract from licensed mocap rather than tracing
  clips.

---

## Commands

```sh
node tools/mocap/cli.js fetch 60 1        # CMU subject 60, trial 01 → cache/
node tools/mocap/cli.js list              # what is cached, with labels
node tools/mocap/cli.js convert 60_01     # proposed move + the three numbers
node tools/mocap/cli.js sheet 60_01       # CONTACT SHEET (svg + png)
```

`<take>` is a cached name (`60_01`), or a path to any `.amc` / `.bvh`.

Exit codes: **0** usable · **1** FLAGGED (it converted, go look at why) ·
**2** REJECTED (no move was emitted).

### fetch

Pulls `http://mocap.cs.cmu.edu/subjects/<NN>/<NN>.asf` and `<NN>_<TT>.amc` into
`cache/`. Cached by name and never re-downloaded; one file at a time with a beat
between them. **Never fetch the 1GB all-subjects archive.**

Known-good starting points:

| subject | motion |
|---|---|
| 60, 61 | salsa |
| 5, 49 | modern dance |
| 15 | dance moves |
| 85 | breakdance |
| 90 | dances / acrobatics |
| 94 | indian dance |
| 82 | emotional walks |

An `.amc` is meaningless without its subject's `.asf`; `fetch` always takes the
skeleton first and `list` flags a subject that is missing one.

### convert

Prints the retarget report and the proposed move. `--out f.js` writes it. Useful
flags (they pass through to `retarget.js`):

```
--phrase a,b       cut an explicit window, in SECONDS (otherwise auto)
--pick loop|motion phrase objective — loop looks for something that repeats
--elbow hinge      treat elbows as one-way hinges (see "what to reach for")
--upper-only       emit a 100/0 move, lower joints dropped
--tol --max --smooth --sides --rot --bob --id --name --label
--engine builtin   ignore retarget.js and use cli.js's own fallback arithmetic
```

### sheet — the point of the whole tool

Writes `cache/sheet-<source>.svg` and a PNG beside it.

Each column is one instant. **Top row is the SOURCE** — the TAKE's fifteen
canonical points with Z dropped, i.e. literally what the front projection sees.
**Bottom row is the REAL RIG** — `figureMarkup()` out of `src/engine/rig.js`
posed by `anim.sample()` on the reduced move, so what you are looking at is what
will play, easing and all — with the dense pre-reduction pose behind it as a
**ghost**, so the cost of dropping 120fps to five keyframes is visible instead
of argued about.

Three things on the sheet do most of the work:

- **The wrist dots.** The subject's LEFT hand is blue in *both* rows. If the blue
  dots sit on opposite screen sides, the retarget is mirrored — and a mirrored
  dance still looks like dancing, which is exactly why it needs a dot and not an
  opinion. (`+X` in a TAKE is the subject's left = *screen right*, and the rig's
  `sL/hL` groups are drawn at *negative* x = screen left. So the subject's left
  side correctly drives the rig's `R` joints. Both names are screen-side names.)
- **The red panel border and the `±°off` readout**, per frame, when the subject
  is past ±40° of camera.
- **The footer**: per-joint clamp percentages, the residual after reduction
  measured through `anim.sample()`, and a facing trace of the whole take with
  the cut phrase lit. Those are the three numbers that turn "it looks sort of
  ok" into a decision.

---

## What converts, and what does not

Measured on **2026-08-29**, from sheets that were rendered and looked at, not
from a green test. `retarget.js` is under active development and these numbers
move when it changes — re-run `convert` before quoting them. The *shapes* below
have held across every revision so far.

### The upper body survives. The legs do not.

All with `--elbow hinge` (see below). "motion" is the phrase's own mean p5..p95
joint excursion — how much the chosen window actually moves.

| take | motion | upper worst clamp | lower worst clamp | worst residual |
|---|---|---|---|---|
| `15_01` dance moves | 15.2° | **0%** | **6.5%** (kL) | **6.8°** (eR) |
| `85_02` breakdance | 34.1° | **0%** | 62.1% (kR) | 20.6° (eR) |
| `05_02` modern dance | 37.3° | 13.3% | **100%** (kR) | 182.7° (sL) |
| `60_01` salsa | 53.5° | 8% | 92.5% (kR) | 34.9° (eR) |
| `94_01` indian dance | 85.7° | 39.3% | 36.3% (kL) | 82.1° (eL) |

That is the CONTRACT §0 prior, confirmed: **front-facing upper-body motion
converts; leg range does not.** Half a pipeline that reliably delivers arm
choreography is the honest deliverable, and `--upper-only` exists to take it.

### The takes that convert cleanest are the ones that move least

Read the table top to bottom: as phrase motion rises, so does the damage. The
one take that came through nearly perfect — `15_01`, 0% upper clamp, 6.8°
residual, a ghost invisible behind the rig in all seven columns — converted that
well because it is a person shifting weight with their arms down. It is a
**clean, faithful, and fairly dull** 1.4 seconds.

The phrase picker's default `loop` objective makes this worse, on purpose: it
rewards a window that ends where it began, and calm windows loop best. `--pick
motion` drops the loop term (on `15_01` it bought motion 15.2° → 19.3° at the
cost of loop error 1.6° → 17°). Use it, then look at whether the extra motion
survived or just added clamping.

### Why the knees always clamp — structural, not tuning

In `figureMarkup` a leg's static `stance` splay wraps the **whole** leg, so at
all-zeros the rig's thigh and shin are **collinear** — a straight splayed V from
the hips. A real standing human is an **A**: thighs angled out, shins near
vertical. Front-projected, that A-shape reads as *positive* knee, and
`JOINT_RANGE` allows only `+10` of it.

So every upright take spends its whole positive knee budget just standing, and
whatever real flexion the dance had lands on the range wall. The projection
block in the report shows the cost directly: on `15_01` the true 3D bend at `kL`
has a median of 32.7° and a p95 of 72.3°, and what reaches the screen is
`−41.1…−2.9°`. Deep-knee material clamps from the other side instead. Both
flatten. **This is a rig or range decision, not a retarget one** — it is written
down here so the next person does not rediscover it from a sheet.

### Turns fail, and fail loudly — which is correct

`retarget.js` picks its phrase from inside the front-facing spans, so it usually
routes *around* a turn on its own. Force one with `--phrase` and the sheet is
unambiguous: on a pirouette forced across its turn, 108 of 181 phrase frames past
±40°, `kL` clamped 75.7% with a 108° overshoot, `eL` 45.3% with a **385°**
overshoot, a 106° residual, and a rig row that scissors sideways into poses the
source never made.

The tell to remember: at 177° off camera the source stick figure looks
**normal** — a front projection cannot distinguish a back from a front — and the
blue wrist dot silently swaps sides. That is why a turn must be flagged rather
than fitted.

### The angle singularities are worth knowing about

- **Elbows.** The signed projected included angle flips a full turn every time a
  forearm swings past its upper arm. On salsa that cost 98.8° of residual and
  26.6% of frames "clamped" on a joint that never travelled that far.
  `--elbow hinge` cuts it to 34.9° and the upper-body clamp to 8%. The rig only
  hinges one way, so the magnitude is the part that can be represented; the
  fallback in `cli.js` hard-wires the hinge for the same reason.
- **Shoulders.** `sL` has the same problem when an arm passes overhead. On
  `05_02` it still leaves 159–183° of residual whichever elbow mode is used —
  more than the joint's whole legal excursion — so modern dance does not convert
  today. If it needs to, that is the next thing to look at.
- **Unwrapping is not free.** `retarget.js` gained temporal unwrapping mid-build,
  which fixed some tracks and pushed knee medians onto a different branch
  (`85_02` kL p50 went +23.9° → +69.6°). Whenever the numbers here disagree with
  a fresh run, trust the fresh run and check `MODES` in the report for what
  changed.

### What to reach for

1. Front-facing, upper-body, arms-below-shoulder material.
2. `--elbow hinge` on anything with arm movement.
3. `--upper-only` the moment the footer says the lower body clamped past 25%.
4. `--pick motion` if the auto phrase is dull, then look again.
5. If a take is mostly turned, take another trial. Do not fit it.

## The two engines

`cli.js` drives `retarget.js`. If `retarget.js` is missing or exports nothing
recognisable, `cli.js` falls back to its own much cruder arithmetic so that the
sheet can never be blocked — and it says so, in the report and across the top of
the sheet. **If the engine line does not say `retarget.js`, you are looking at
the fallback**, and its numbers are not the real ones. `--engine builtin` forces
it; `--engine retarget` refuses to fall back.

## cache/

Downloaded motion lives in `cache/` and is gitignored (`../../.gitignore`).
Re-fetch it, never commit it. Contact sheets are written there too, for the same
reason — they are output to look at, not source to keep.

# PARALLEL — build notes

**Status: SHIPPED, then deepened.** 100 of 100 levels generated, embedded and
solver verified. Game ID `parallel`, accent violet `#8b7cf6`, portal category
`puzzle`, icon 🪞.

| Gate | Result |
|---|---|
| `node sim.js --test` | **PASSED 205 / FAILED 0** (205 assertions), exit 0 |
| `node sim.js --verify` | **VERIFY PASSED**, all §5.5 gates over **100** levels, exit 0 |
| `node sim.js --grep` | PASSED (no `Math.random` or page objects in SIM, tags balanced, no dashes in copy, **all 88 element lookups resolve**) |
| `node pagecheck.js` | **PASSED 37 / FAILED 0** at 390x844, 375x667, 412x915, 360x640 and 1280x800 |
| `node gen.js --check` | **REPRODUCIBLE** byte for byte from seed `0x50415241` |
| Script block syntax | parses clean under `vm.createScript` |
| Service worker | `parallel-` prefixed, `node --check` clean, shell bumped to `parallel-shell-v2` with `?v=2` in lockstep |

---

# DEEPENING PASS (second session)

Levels 60 → **100**. Assertions 140 → **205**, plus a new 37 check page harness.
Nothing in `stepWorld` was touched, so the first sixty levels regenerate byte
for byte and every save from the shipped build still points at the same boards.

## The two known defects, fixed

1. **Level select stars overlapped.** 54px hit circles standing 33 to 40px
   apart meant the higher level number won a tap in the overlap. The geometry
   now comes from `skyLayout(count, widthPx, seed)` in the SIM: pure, in CSS
   pixels, laid out in rows whose pitch and gap are both at least 48px, with
   jitter bounded to half the slack so it still reads as a sky and cannot
   overlap. The SVG is sized in px to match its own viewBox, so one unit is one
   rendered pixel on the device. `suiteLayout` measures the true minimum
   pairwise distance at nine widths from 300 to 560 and at 10, 100 and 200
   levels. Worst case measured: **52.0px at 300px wide** against a 48px law.
2. **Phone dead space.** Was ~214px of slack under the board at 390x844. Now
   **71px**, and 18px at 375x667. The column is budgeted rather than measured
   (measuring the pad we are about to resize is what makes a layout walk), and
   the slack is spent in order: thumb pad, then the level ribbon, then the
   level card, and the pad cap itself scales with viewport height because a
   thumb on a 915px screen reaches further than one on a 667px screen.
   Measured by `pagecheck.js` at five viewports.

| Viewport | board | pad | ribbon | card | leftover |
|---|---|---|---|---|---|
| 390x844 | 360 | 157 | on | on | 71px |
| 375x667 | 344 | 105 | on | off | 18px |
| 412x915 | 384 | 170 | on | on | 105px |
| 360x640 | 328 | 98 | on | off | 14px |
| 1280x800 | 600 | 62 | off | off | 0px |

The tall phone leftover is centring space around the board, not an empty
trough: the alternative is a 250px tall button row, which is worse.

## 40 more levels, two new tiers

Tiers 6 and 7 start at level **61**, so the generator's single RNG chain hands
levels 1 to 60 exactly the draws it always did. Verified: the regenerated
array's first sixty entries are byte identical to the shipped ones.

| Tier | Levels | Grid | Band | Attempts | Per accept | Seconds | Par min | Par max | Par mean |
|---|---|---|---|---|---|---|---|---|---|
| 6 | 61 to 80 | 12x12 | [34,58] | 1838 | **91.9** | 32.9 | 34 | 50 | 40.7 |
| 7 | 81 to 100 | 12x12 | [40,61] | 6744 | **337.2** | 191.2 | 40 | 54 | 43.8 |

Every acceptance gate held: solvable by BFS, inside the tier band, a desync
moment on the solution path, greedy agent fails, then the wall minimize pass.
No gate was loosened and no density range was touched. Total generation for all
100 levels: 245s. Tier 7 is where the cost lives (BFS to depth 40 plus on a
12x12 board with 3 keys, 4 crumble tiles and 6 ice tiles), still far under the
2000 attempt budget the plan set as the alarm line.

**Par is one base62 character**, so no tier band may ever ask for more than 61
moves. A band of 72 would have encoded as an empty character and corrupted the
level string in silence. That is now `PAR_MAX` with an assertion on the bands
AND on every embedded par, and the deliberate break confirms it goes red.

## Mirror drift: the audio now reads the real state

The desync flag says a split *happened*. `mirrorDrift(lv, state)` says how far
out of mirror the pair currently *is*, and it falls out of the geometry for
free: a mirrored horizontal move leaves `ax + bx` untouched, and a shared jump
or fall leaves `ay - by` untouched, so each quantity is invariant while the
twins move as one and each lone step knocks it off by exactly one.

- The amber voice now bends by the drift, a half step per cell, up to a tritone,
  and lands back on the clean fifth the moment the pair is back in mirror. The
  violet voice tightens a hair while split so the beating is audible on a phone
  speaker. Win lands both voices on unison.
- `#seam` was drawn down the middle of the board. That is only the mirror axis
  if the pair happens to start symmetric about the centre. It now sits on the
  pair's true invariant axis, and a second dashed amber line marks where their
  midpoint has drifted to, so **the gap between the two lines is the drift,
  drawn**. It hides itself at zero.
- The hud carries `off mirror N`, so the signal survives sound off and
  colourblindness both.

Nine assertions cover it, including that drift is invariant under mirrored
moves, rises by one on a blocked twin, closes when you walk the split back, and
stays bounded under 400 random inputs.

## Run history and the progress screen (was missing)

`RUN LOG` sheet off the sky: cleared, par matched, deaths, moves, attempts and
day streak; a bar per tier; and the last 12 runs newest first, each tappable
back into its level. History lives in the save codec as a pure `pushRun` and
`mergeHistory`, capped at 12, deduped by run key, merged newest first so two
tabs keep both. That dedupe matters more than it looks: every save flush merges
disk into memory, so without it one session's single run would multiply.

## The daily, and seed links

- The daily was already BFS verified before display. What was broken was the
  *share*: it linked `?level=daily`, which opens a **different** level tomorrow.
  It now links `?day=2026-08-16`, so the board survives being passed around.
- `?seed=<n>` used to modulo into a campaign level. It now generates a tier 5
  level from that seed and verifies it with the same BFS, desync check and
  greedy check before anything is drawn. A stranger's link can never hand you
  an unsolvable board.
- `dayNumber(iso)` does the calendar arithmetic itself rather than reading a
  clock, so time stays a parameter in the SIM. Asserted against the platform's
  own `Date.parse` maths.

## Other craft picked up

- **Level card** under the board: tier name, what this board is made of (ice,
  keys, thin floor, one way), your best, and a WATCH button that replays your
  best run through the same `stepWorld`.
- **Level ribbon**: the ten levels around this one, with their stars, tappable,
  locked ones dim.
- **Install nudge** (CRAFT E, was missing): captured `beforeinstallprompt`,
  offered as one quiet line on the win card, only after a first clear.
- Tier names in the sky and in the subtitle: FIRST LIGHT, THE SPIKES, LOCK AND
  KEY, THIN FLOOR, BLACK ICE, THE DEEP END, THE LONG WAY.

## pagecheck.js — the harness for a box with no browser

I was told not to run puppeteer (eight agents, two cores). So `pagecheck.js`
boots the real script out of `index.html` against a small DOM stub and drives
the view: it plays level 1 with its own embedded answer and asserts the win
card, taps every control, builds the sky and counts the hit targets and their
radii, opens the run log, fills the ribbon, builds a daily and a seed level,
shares, and fits the board at five viewports.

**This is not a LOOKING pass and does not pretend to be.** It cannot see
colour, contrast, overlap or a seam that reads wrong. What it can prove is that
no button is wired to a dead id, nothing throws on the paths a player walks,
and the layout maths lands where the table above says. The first thing it found
was the 146px of slack still left under the board after my first fix, which is
exactly the class of bug that green unit tests miss.

`sim.js --grep` also grew an element wiring gate: every `$('id')`,
`getElementById('id')` and `wire('id')` in the file must resolve to an id that
exists somewhere in the file, and no static id may be declared twice.

## Gates I watched FAIL first (this pass)

23 deliberate breaks, all confirmed red, harnesses in the scratchpad:

sky stars closer than the law · a shrunken hit radius · drift invariant swapped
to a difference · history cap removed · history dedupe removed · day number off
by one · a tier band past the par field · a seeded level handed over unverified
· campaign counting swallowing dailies · **a level dropped from the array** ·
**a corrupted level string** · a typo in an element id · a duplicate static id ·
a wired button with no element · a dash in new copy · an unwired button · a pad
squashed under 48px · the win card never opening · the ribbon left empty · the
history never recorded · a share that says today instead of the day · a layout
that walks on every fit.

**Three breaks initially stayed GREEN and were fixed rather than accepted:**

- The history dedupe break passed because the merge suite only ever merged two
  saves with disjoint runs. Added: merging a save with itself, and three flushes
  in a row, must not duplicate a run. That is the case the real flush path hits
  every single save.
- The dropped level break passed because I had broken the *assertion* rather
  than the *data*. Rewritten to actually delete a level string and to corrupt
  one, and both now go red in `--test` and `--verify`.
- The layout walk break passed because the pad cap masked the jitter and because
  the board is width bound, so nothing moved. Strengthened to watch the pad
  height, not just the board, and to jitter the slack past the cap.

## The one rule

`stepWorld(state, input, level)` exists **once**, inside the `SIM_EXPORT` markers.
The playable game, the BFS solver, the greedy agent, the fuzzer, the replay
player and `gen.js` all call that same function. `sim.js` and `gen.js` pull the
block out of `index.html` by marker comment and run it in node, so there is no
second copy to drift. `gen.js --check` is the drift alarm: change any movement
rule and the regenerated level array stops matching the embedded one.

## Movement semantics as built

Implemented exactly per PLAN-3, with two places where the plan's own stated
consequences forced a specific reading. Both are recorded here, not litigated.

1. **Airborne spans two ticks.** `skipGravity = wasAirborne || roseThisTick`.
   UP hovers on the jump tick and on the one input after it. This is the only
   reading under which the plan's "UP then LEFT clears a 1 gap" is true at all
   (under a one tick jump you fall into the gap on the very next input).
   Asserted by the `gap` fixture: `URR` crosses, `URW` drops in.
2. **Mantle requires being supported**, not merely non airborne. The plan states
   both the mantle rule and "2 high walls are unclimbable"; without the support
   requirement a jump plus two moves climbs a 2 high wall. Asserted by the
   `twohigh` fixture: `U`, `UR`, `URR` all leave A at x=1.

Other resolutions, all asserted:
- Keys read the **pre tick** mask for the whole tick, so a door opened this tick
  is walkable from the next tick. Deterministic and identical for the solver.
- Crumbling breaks at end of tick only if the avatar **left** the tile it was
  standing on. Waiting on it does not break it.
- Ice is a **solid floor tile** you slide across the top of, not a cell you enter.
- One way plates are solid for support and enterable only along their arrow.
  A plate with headroom **can** be mantled onto; that is correct and is asserted
  rather than hidden (the `oneway` fixture roofs its plate to test pass through).
- Gravity is independent per avatar (they may overlap; VIEW offsets them).
  The plan's "both enter the same cell means neither moves" rule applies to the
  move phase, as written.

## Fixtures are the contract

Ten hand authored fixture levels with scripted inputs and exact expected
outcomes, written **before** the solver: `mantle`, `twohigh`, `gap`, `desync`,
`keydoor`, `crumble`, `ice`, `spike`, `win`, `oneway`, plus inline collision and
bounds boards. 62 of the 140 assertions are fixture assertions.

## Generation: attempts per accept

Master seed `0x50415241`, one RNG chain across all 60 levels. Acceptance requires
**all four**: solvable by BFS, solution length inside the tier band, at least one
desync moment on the solution path, and the greedy agent fails. Then a wall
minimize pass removes walls that keep the solution at the same length.

| Tier | Levels | Attempts | Per accept | Seconds | Par min | Par max | Par mean |
|---|---|---|---|---|---|---|---|
| 1 | 10 | 86 | 8.6 | 0.1 | 6 | 10 | 8.1 |
| 2 | 12 | 117 | 9.8 | 0.4 | 8 | 17 | 13.3 |
| 3 | 13 | 163 | 12.5 | 1.4 | 14 | 25 | 18.7 |
| 4 | 13 | 137 | 10.5 | 6.7 | 20 | 34 | 24.9 |
| 5 | 12 | 767 | **63.9** | 10.4 | 30 | 49 | 34.8 |
| 6 | 20 | 1838 | **91.9** | 32.9 | 34 | 50 | 40.7 |
| 7 | 20 | 6744 | **337.2** | 191.2 | 40 | 54 | 43.8 |

Total 245s for all 100. **Yield was the named schedule risk and it did not
materialise**: the worst tier needed 337 attempts per accept against a 2000
budget, so the wall density ranges were never loosened and no acceptance gate
was touched.

Tier vs solution length line fit slope **+6.35** (must be > 0).

## Verification table (all 100, from `--verify`)

Every level: BFS solves it, fresh BFS length equals the embedded par, greedy
agent fails, a desync moment exists, codec round trips, band respected.

| Tier | Levels | Band | Min | Max | Mean |
|---|---|---|---|---|---|
| 1 | 10 | [4,10] | 6 | 10 | 8.1 |
| 2 | 12 | [8,18] | 8 | 17 | 13.3 |
| 3 | 13 | [14,26] | 14 | 25 | 18.7 |
| 4 | 13 | [20,36] | 20 | 34 | 24.9 |
| 5 | 12 | [30,55] | 30 | 49 | 34.8 |
| 6 | 20 | [34,58] | 34 | 50 | 40.7 |
| 7 | 20 | [40,61] | 40 | 54 | 43.8 |

BFS states explored per level range from ~200 (tier 1) to ~250k (tier 7).
`node sim.js --watch=N` dumps ASCII frames of any level solving itself.

## Gates I watched FAIL first

17 deliberate breaks, every one confirmed red, harness in the scratchpad
(`watchfail.sh`, exits 2 if any gate refuses to fail):

corrupt an embedded level string → `--verify` red · same → `--test` red · drop a
level → `--verify` red · bump one embedded par → `--verify` red (par vs fresh
BFS) · `Math.random` in SIM → `--grep` red · `document` in SIM → `--grep` red ·
a dash in copy → `--grep` red · literal close script tag in a string → `--grep`
red · let a hovering avatar mantle → fixtures red · spend the airborne flag a
tick early → fixtures red · drop the collision rule → fixtures red · break
crumbling instantly → fixtures red · slide ice one cell too far → fixtures red ·
make `stepWorld` throw → fuzz red · merge a save the wrong way → save red ·
accept a corrupt save → save red · change a movement rule → `gen --check` DRIFT.

**Three of these initially stayed GREEN and were fixed rather than accepted:**
- The crumble fixture could not tell "breaks when you leave" from "breaks
  instantly" (both look identical two ticks in). Added `RW`: waiting on a
  crumble tile must not break it. That is a real assertion that was missing.
- The fuzz break and the corrupt save break were too weak to fire (the injected
  throw needed a state the samples never reached; the save had a second defence
  behind the one I removed). Strengthened the breaks; both gates then went red.

## Exit code note

The main loop saw `--test` print a red suite and exit 0. That was the `| tail`
in the invocation, not the runner: raw exit was already 1. `sim.js` now sets
`process.exitCode` rather than calling `process.exit()`, so stdout always
flushes and a red suite always leaves a nonzero status.

## LOOKING pass defects fixed

Reported by the main loop after reading screenshots at 390x844 and 1280x800:
1. **Dead space.** `fitBoard` now measures real slack (`visualViewport`, minus
   the measured bar/hud/pad heights) instead of letting the stage swallow it;
   cell cap raised 46 → 76; side padding 10 → 6; pad buttons `clamp(62px,13vh,118px)`;
   desktop column widened 560 → 700 with a framed background. Desktop vertical
   slack now **0 to 8px** (was an ocean). Phone is **width bound**: a square
   board at 390px wide can only be 360px, so ~214px of vertical slack remains
   below it (down from ~280) and now goes to bigger thumb targets. Honest gap.
2. **Floor slab wider than the walls.** Per tile `border-radius:3px` plus a top
   only inset highlight made the bottom row read as a different material.
   Walls are now radius 0 with a uniform 1px inset hairline on all four edges.
3. **Weak mirror seam.** This was a real bug, not styling: `#seam` sat *under*
   the opaque tile layer, so it only showed through gaps. It now paints at
   `z-index:2`, above tiles and below avatars, at 3px with a violet to amber
   gradient and a soft glow, full board height.

## Craft shipped

- **E minor two voice audio.** Two detuned triangle voices a fifth apart, one
  per avatar. On every desync moment the amber voice bends a half step until the
  pair re syncs. Driven by the `desync` flag the SIM already emits for the
  solver's acceptance check, so the audio and the gate read the same signal.
- **Par from the solver.** BFS optimum embedded per level, shown on completion
  as "you 27, best possible 23", star on the level select for matching it.
  `--verify` re runs BFS and asserts every embedded par is still correct.
- **Mirror seam** down the axis; avatars shape distinct (violet circle A vs amber
  diamond B) with A/B glyphs, exits carry the matching shape and letter.
- **Rewind death**: 150ms, deaths counter ticks quietly, input stays live via a
  one slot queue (an input during the rewind replays into the fresh state).
- **Constellation level select**: five tier clusters, lines join cleared levels,
  par stars brighter. Locked levels are dim and gated on the previous clear.
- **Ghost paths** of the previous attempt (settings toggle, default on).
- **Best run replays** fed back through the same `stepWorld`.
- **Daily** tier 4 level from the daily seed, BFS verified inside `genDaily`
  before it is ever shown; `--watch=daily` prints it. Share strings carry no
  dashes. `?seed=` and `?level=` links boot straight into a level.
- Options panel: sound, volume, haptics, reduced motion, ghost path, share,
  erase, exit. `prefers-reduced-motion` respected.
- Embed protocol shipped verbatim; `SWS_EXIT()` on a findable BACK TO ARCADE
  button in options, referrer based fallback for the top level navigation case.

## Touch targets (rendered px at 375x667)

Grid cells are never touch targets. Controls: the four pad buttons are
`var(--padh)` tall, budgeted at run time between 62 and 190px and measured by
`pagecheck.js` at 98 to 170px across five viewports, one quarter of the app
width each (~86px at 375), so **86 x 98 minimum**. Header, restart, sheet close
and toggle buttons are all `min-width:48px; min-height:48px`. Win card buttons,
ribbon chips, run log rows, the level card WATCH button and the install nudge
are all `min-height:48px`.

**Level select stars: fixed.** Each star carries a transparent hit circle of
r=24 in a viewBox sized in CSS pixels, so it is **48px across on every device**,
and the layout guarantees at least 48px between any two star centres. The
harness measures the true minimum pairwise distance at nine widths and three
campaign sizes; worst case is **52.0px at 300px wide**. Adjacent hit circles can
touch but can no longer overlap, so the mis tap is gone.

## Known gaps

1. **No browser has run this.** I was instructed not to run puppeteer (eight
   agents on a 2 core box). `pagecheck.js` boots the real script against a DOM
   stub and drives the whole view, which catches dead wiring, exceptions and
   layout maths, but it cannot see colour, contrast, overlap or a seam that
   reads wrong. **The LOOKING pass at 390x844 and 1280x800 is still owed**, and
   should include the run log sheet, the sky scrolled to the deep tiers, and the
   two seam lines while the pair is 3 or more cells out of mirror.
2. The daily and seed levels are generated on the main thread (about 0.2 to 2s
   for tier 4). It has always been that way and it is behind a 400ms timeout at
   boot, but on a slow phone it is a visible hitch. A worker would fix it.
3. Undo was considered and left out. It is the obvious quality of life feature
   for a puzzle game, but it interacts with par stars and the whole star economy,
   so it is a Director call rather than a deepening pass call.
4. Icons are referenced but not created here (main loop owns all five).
5. No Sunbeam earn wiring, per the handoff11 deviation list.

## Next thing

Open it on a phone. Everything below the board changed and only a person can
say whether the level card, the ribbon and a 157px pad read as generous or as
padding. Then look at the sky at tier 7, where 100 stars now live.

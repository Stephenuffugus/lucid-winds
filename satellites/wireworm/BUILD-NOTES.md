# WIREWORM — build notes

**Status: SHIPPABLE.** Spec HANDOFF-11 §6, plan `incoming/handoff11/PLAN-4-WIREWORM.md`, craft `incoming/handoff11/CRAFT.md`.
Game id `wireworm` · accent electric lime `#a3e635` · 20x20 grid · portal `cat:"action"` · icon 🐛.

```
node sim.js --test        PASSED 252 / FAILED 0   (252 assertions)   exit 0
node sim.js --runs=20000  balance sweep, FOUR agents, table below
node sim.js --bands       the two missed balance bands, tested not inherited
node sim.js --watch=SEED  ASCII frames [--every=N] [--agent=greedy|randomsafe|random|filler] [--mode=daily]
```

> **Deepening pass, second session.** 205 assertions in, 252 out. Nothing was
> rewritten. What changed: the board filler agent that §6.5's second win
> condition was missing, the two missed bands tested rather than argued, a
> tightening combo window so the ladder stops pinning, the CREEP hazard, and a
> daily that is a different game from endless instead of a different seed.
> Sections 12 to 16 are this pass; sections 1 to 11 are the first build and are
> still true except where a number is restated.

`sim.js` extracts the SIM, SAVE and TEST blocks out of `index.html` between marker
comments, so node runs the same code the phone runs. There is no second copy of
the game to drift.

---

## 1. Assertion count: 252 (was 205)

236 game assertions + 16 source level gates, all inside the one `--test` run.
Suites: config, rng, new game, movement, circuit cases, combo, overload,
discharge, spawns, determinism, input queue, fuzz, save, copy, **regressions**,
**creep**, **daily**, **board filler**, circuit battery (1000 shapes), balance
envelope.

The 47 added by the second pass: 8 on the combo window ladder, 17 on the creep
hazard and its four fairness rules, 9 on endless against daily, 8 on the board
filler and the avoidance BFS, plus 5 folded into the existing suites.

The 16 source gates run against the file itself, not the runtime: `Math.random`
/ `document` / `window` / `canvas` / `performance` / `requestAnimationFrame` /
`setTimeout` / `localStorage` / `Date` absent from the SIM block, no dash
characters in the COPY table, no literal close script tag inside a JS string,
all three marker pairs present, and `sw.js` deleting only `wireworm-` caches.
**Comments are stripped before the source scan.** The first version of this gate
failed the file because the RNG header contains the sentence "Math.random is
banned" (repo law: strip comments before analysing source).

`--test` sets `process.exitCode`, prints `RESULT: PASS` or `RESULT: FAIL`, and
exits nonzero on any failure. If you see exit 0 over a red suite you piped it
through `tail`, which returns tail's status; check `${PIPESTATUS[0]}`.

---

## 2. Gates I watched FAIL first

Every gate was broken on purpose in a scratch copy and watched go red before it
was trusted green. A probe that cannot fail is not evidence.

| break | what went red | exit |
|---|---|---|
| A live wire made non lethal | sealed pocket regression, `every run ends` | 1 |
| B `OVERLOAD_CELLS` 220 → 260 | `overload cells is 55 percent of the grid` | 1 |
| C circuit slice keeps duplicate cells | `every energized slice matches the brute force reference` (831 mismatches) | 1 |
| D a dash added to `COPY.start` | both dash gates (runtime and source) | 1 |
| E `Math.random` added inside SIM | `SIM is free of Math.random` | 1 |
| F terminal rescue removed | sealed pocket regression + `every run ends` | 1 |
| G queue `push` returns true on overflow | `a push past capacity is refused, not swallowed` | 1 |
| restored | PASSED 205 / FAILED 0 | 0 |

**The break the plan named does not work, and that is the correct outcome.**
The plan says "set the tick speed ramp to zero and confirm greedy blows past
2000 ticks". It cannot: the speed ramp lives entirely in the driver and SIM is
time free, so the ramp has zero effect on any tick count the sweep measures.
Break A is the honest substitute for "the game is too safe" and it does go red.

---

## 3. Balance sweep, 20,000 runs per agent

```
WIREWORM balance sweep   runs=20000  tick cap=8000  base seed=1
grid 20x20  overload at 220 cells  discharge every 90 ticks
ramp 220ms minus 4ms per circuit, floor 90ms

RANDOM   (plain uniform walk, HANDOFF §6.6 agent)
                   min     p10     p25   MEDIAN     p75     p90      max      mean
  run ticks          4      24      34       55      87     128      465      67.9
  score              0       0       0        0       0       0      345       1.4
  circuits           0       0       0        0       0       0        2       0.0
  overloads          0       0       0        0       0       0        0       0.0
  deaths: wall 19392   live wire 608   hit tick cap 0   peak energized 141/400

RANDOMSAFE   (uniform over the moves that are not instantly fatal)
                   min     p10     p25   MEDIAN     p75     p90      max      mean
  run ticks         16     320     669     1424    2783    5116     8000    2117.9
  score              0      24      59      131     247     417     2906     193.6
  circuits           0       1       1        2       3       5       15       2.6
  overloads          0       0       0        0       0       0        1       0.0
  deaths: wall 3217   live wire 15744   hit tick cap 1039   peak energized 219/400

GREEDY   (BFS to the matching terminal avoiding energized cells)
                   min     p10     p25   MEDIAN     p75     p90      max      mean
  run ticks         22     155     210      281     374     571     8000     386.6
  score              5     340     496      676     894    1166     6568     752.4
  circuits           1       7      10       13      16      20       83      13.4
  overloads          0       0       0        0       0       0        2       0.0
  deaths: wall 3296   live wire 16572   hit tick cap 132   peak energized 219/400

GATES
  FAIL  random median run length 60 to 200 ticks   [55]
  FAIL  greedy median run length 300 to 900 ticks   [281]
  PASS  greedy is not too safe (median under 2000)   [281]
  PASS  greedy outlives random   [281 vs 55]
  PASS  safety filtered random walk reported (no gate)   [1424]
  PASS  energized never exceeded the grid   [219]
  PASS  under 2 percent of greedy runs reach the tick cap   [0.66%]
  PASS  no plain random run reached the tick cap   [0]
```

### Gate results, stated plainly

| gate | target | measured | verdict |
|---|---|---|---|
| random median run length | 60 to 200 ticks | **55** | MISS by 8 percent, low side |
| greedy median run length | 300 to 900 ticks | **281** | MISS by 6 percent, low side |
| greedy not too safe | median under 2000 | 281 | PASS, comfortably |
| greedy outlives random | — | 281 vs 55 | PASS |
| energized never exceeds grid | ≤ 400 | 219 peak | PASS |

**Both misses are real and I did not tune them away.** Reporting them is worth
more than a green number I would not believe. Detail:

**The 60 to 200 random band is a property of grid geometry, not of any tunable.**
A uniform random walk over `{-1, 0, +1}` from the centre of a 20x20 board turns
two ticks out of three, so it is a very local walk and it reaches the boundary in
a median of 55 ticks. 19,392 of 20,000 random runs die at the wall having never
completed a circuit. Nothing in CONFIG moves this except `GRID`, which the spec
fixes at 20. Corrected value for HANDOFF §9: **a plain random walk on this board
medians 55 ticks, not 60 to 200.** The band would be met by a walk with more
straight line persistence, but that is tuning the measuring stick.

**The 300 to 900 greedy band was chased with the one TUNE lever and the lever is
dead.** `DISCHARGE_INTERVAL` is the only value §6.5 leaves open ("every ~90
ticks"). Swept at 1200 runs each:

| DISCHARGE_INTERVAL | greedy median ticks | median score | capped |
|---|---|---|---|
| 90 (shipped) | 290 | 684 | 7/1200 |
| 75 | 288 | 688 | 5/1200 |
| 60 | 295 | 686 | 10/1200 |
| 50 | 296 | 682 | 5/1200 |
| 40 | 301 | 680 | 7/1200 |

A 2.25x change in the interval moves the median 11 ticks, which is inside the
run to run noise. Setting it to 40 would put the number "in band" at 301 while
changing nothing about the game. **I left it at the spec value of 90 rather than
buy a green gate for one tick.** Greedy sits at 281 over 20,000 runs, about 6 percent
under the floor, and the spec's actual intent (over 2000 means too safe) is met
by a factor of seven.

**A third agent is reported that the spec does not ask for.** My brief defined
the random agent as one that "avoids certain death when a safe option exists".
That agent is a different animal: median **1424** ticks, seven times the top of
the band, because in this game the only lethal thing is wire the player has to
build themselves, so an agent that never walks into a wall is close to immortal
until it completes circuits. Both are shipped and reported: `random` is the
handoff's agent and carries the gate, `randomsafe` is my brief's agent and is
reported without a gate.

---

## 4. What I SAW in the ASCII frames

Read three greedy runs (seeds 7, 12345, 555) and one randomsafe run (seed 7)
frame by frame before trusting any sweep number.

1. **The greedy agent plays a recognisable game.** It chains circuits, the board
   partitions into visible corridors of live wire, and all three runs died to
   `live` at 190 to 260 ticks. It dies to the maze it built, which is the entire
   premise. It is not walking into pockets; the pocket problem was real earlier
   and is fixed (section 5).
2. **The combo ladder is a formality for a competent player.** Completions land
   every 5 to 25 ticks against a 40 tick window, so combo pins at x4 within
   about 50 ticks and stays there. In three runs it dropped exactly once. The 40
   tick window is spec (§6.2) so I did not touch it, but the ×1 to ×4 ladder is
   not a decision at this board size, it is a warm up.
3. **The greedy agent never triggers an overload.** Zero overloads across all
   three runs, peak coverage 25 to 30 percent, and the 20k sweep medians 0
   overloads for every agent. The board filler playstyle §6.5 promises exists
   only for a player who steers for it deliberately; the sweep numbers therefore
   under represent that half of the design.
4. **Discharge pickups go unclaimed.** Seed 555 died with a pickup sitting on
   the board. My greedy agent only diverts for one past 22 percent coverage and
   it usually dies around 25 percent, so the relief valve barely gets exercised.
5. **Circuit lengths are healthy and varied**: 2 to 45 cells, red and amber pairs
   producing the long dangerous runs the colour weights intend.

---

## 5. Two real defects the sweep found, both fixed in SIM

**A soft lock. Seeds 9001, 9003, 9012, 9013 and 9027 ran forever.** The worm
seals itself into a pocket; no terminal is reachable; and every free cell is
either unreachable or hugging live wire, so no discharge pickup can spawn either.
The run could never end and never progress. That is a player facing dead end, not
an agent artefact. Fix: `rescueCheck`, a reachability sweep every
`STALL_CHECK` = 24 ticks. If no terminal is reachable, or if the worm has made no
progress at all for `STALL_LIMIT` = 300 ticks, the pairs are relocated into the
region the player is actually in, and if there is nowhere legal at all the oldest
circuit trips as a mercy. This is also the only thing that guarantees every run
terminates. **Named regression assertions were written before the fix** and are
in `suiteRegressions`, including a hand built total seal.

**The greedy agent would not swap colour out of a trap.** Seed 9027 held a charge
whose pair was walled off, targeted only that pair, and orbited to the tick cap
while a perfectly reachable blue pair sat on the board. Fixed by falling back to
"any reachable terminal", which is what swapping charge is for.

Together these turned the balance picture around: greedy went from dying at 252
ticks while the blind random walker lived past 1246 (backwards, and exactly the
trap the plan warned about) to 281 versus 55 over 20,000 runs each.

---

## 6. Spec ambiguities and where they landed

All resolved per PLAN-4, not re litigated. Recorded defaults where the plan left
room:

- **Circuit length = unique cells in the slice**, not the raw trail index span.
  Counting duplicates would pay a player for circling a 2x2 box forever, which
  breaks §6.3's spatial economy. Score is `floor(uniqueCells × colour × combo)`.
- **Charge swap despawns the abandoned pair entirely** and a fresh pair spawns,
  keeping exactly two complete pairs on the board (§6.2) with no dangling
  unmatched terminal.
- **Overload deletes every wire cell** and resets an open circuit's `sliceStart`
  to where the player stands. Without that reset the next completion would
  resurrect the wire the breaker just cleared, which breaks the promise of the
  breaker. Combo is preserved through an overload, per plan item 8.
- **Overload fires at `energized >= 220`** (`floor(400 × 0.55)`). Asserted red at
  219 and green at 220 so "exactly at the threshold" is a tested claim.
- **Completing a circuit restores wire that an earlier discharge erased** from
  inside the still open slice, so the slice is never energized with holes in it.
  This has its own regression assertion.
- **Nothing spawns inside the uncommitted circuit.** A terminal dropped on a
  pending slice cell gets overwritten the instant the circuit closes, orphaning
  its pair. Found by reasoning, fixed in `spawnCandidates`, gated by assertion.
- **Blue and amber pairs spawn at uniform random distance.** Spec constrains only
  red (maximally far, exact O(n) max manhattan pair, checked against O(n²) brute
  force) and green (within 6 cells).
- **Input queue holds 2, not 1.** A strict one slot queue drops a fast double tap,
  which is the thing CRAFT §A forbids. `push` returns **false** when it refuses,
  so "never dropped or doubled" is a testable claim rather than a hope.

## 7. CONFIG that moved from spec

Nothing in the spec's own numbers moved. Grid 20, overload 55 percent, bonus ×5,
discharge ~90, combo window 40, ladder ×1/×1.5/×2/×3/×4, colour multipliers and
weights, tick ramp 220/−4/90 are all as written. Two values were **added**:
`STALL_CHECK` 24 and `STALL_LIMIT` 300, both for the soft lock fix in section 5.
`RED_MIN_DIST` 20 and `GREEN_MAX_DIST` 6 make the "far apart" and "close"
language of §6.4 testable.

**Second pass amendment.** One spec number now has a documented deviation and
three values were added:

| key | value | status |
|---|---|---|
| `COMBO_WINDOWS` | `[40, 40, 32, 26, 20]` | **deviates from spec.** §6.2 says a flat 40. Director default, reasoning in section 14. The spec's 40 is preserved at the bottom of the ladder. |
| `CREEP_INTERVAL` | 45 | new, section 15 |
| `DAILY_TICKS` | 600 | new, section 16 |
| `FILL_TARGET` | 90 | new, **sweep agent only, no effect on the game.** Swept, table in section 12. |

Grid 20, overload 55 percent, bonus x5, discharge ~90, the x1 to x4 ladder, the
colour multipliers and weights and the tick ramp are all still exactly as
written in §6.

## 8. Touch targets, measured

Design viewport 375x667 and 390x844. Rendered sizes:

- Turn pads `#padL` / `#padR`: half the width each (about 179px at 375) by the
  full leftover column height, minimum 64px. Far over 48.
- Board tap zones `#zoneL` / `#zoneR`: 50 percent width by the full board height,
  about 187 x 371. Full height as required.
- Footer buttons EXIT / DAILY / START: 48px minimum height, third width each.
- Options gear, sheet toggles: 48x48 and 88x48.
- No text under 13px anywhere.

## 9. Craft shipped

C minor pentatonic throughout (`deg2freq` quantises every pitched sound):
completion arpeggio note count scales with circuit length and its starting degree
climbs with combo, so a long red circuit at ×4 plays the biggest phrase in the
game; a low hum while charged pitched by colour; noise burst through a falling
lowpass plus a resolving chord on overload. PCB board look with rounded joints,
per colour glyph repeated along energized runs (**pattern doubles colour**, shape
also inside every terminal ring, so the board reads in greyscale). The open
circuit tether tints the pending slice so you SEE the shape before committing.
150ms spark race on completion with cells locking behind the front. 640x960 death
card with DOWNLOAD and SHARE. Overload warning ramp past 35 percent. Combo ring
that drains and blinks in its last quarter. `?seed=` links, daily mode with a
streak, input log replay of your best run through the same `step()`. Options
panel: volume, sound, haptics, reduced motion, turn zones. Embed protocol with
`SWS_EXIT()` and a findable EXIT button. `prefers-reduced-motion` kills glow
pulse, shake, flash and turns the spark into an instant state change.

Haptics are gated behind the first real user gesture (the game auto starts, so
the worm charges its first terminal before any tap and Chrome blocks and logs a
vibrate made before a gesture). Values match the CRAFT ledger: 10ms routine
confirm, 25ms scoring beat, `[30,40,80]` run ending.

## 10. Defects found by LOOKING, not by gates

The main loop shot the running page and found three things twelve green
assertions did not. Root causes:

1. **HUD mangled.** The combo canvas carries an intrinsic 104x104 and sat inside
   a 52px wrapper under `position:absolute; inset:0`. An over constrained
   absolutely positioned replaced element keeps its intrinsic size, so the ring
   overflowed onto the score text. The stray ")" in the status line was the
   ring's arc crossing the text, not a template bug. Fixed with explicit CSS
   sizing (52x52 display, 104 backing store for dpr) plus `overflow:hidden`.
2. **Board stranded in dead space**, roughly 250px above and 300px below on a
   390x844 phone. A square board on a tall phone is width bound, so the board
   cannot grow into that space. Fixed by giving the leftover column to two large
   visible turn pads instead of black, which also makes the input model obvious.
3. **Dead trail too dim** against the board. Brightened from `#38452b` to
   `#55693e` and thickened from 0.20 to 0.26 of a cell. Energized wire keeps its
   separate identity through brightness, thickness, glow, marching glyph and
   pattern, so the colourblind rule is unaffected.

## 11. Known gaps and the next thing

1. **The two balance bands are missed low** (random 55 vs 60, greedy 287 vs 300)
   and are reported rather than tuned. Section 3 has the reasoning.
2. **132 of 20,000 greedy runs (0.66 percent) reach the 8000 tick cap.** These
   are still completing circuits, so they are lucky seeds rather than soft locks
   (the zero progress case is fixed and regression tested). The sweep gates the
   rate at under 2 percent rather than demanding zero.
3. **The overload playstyle is unmeasured.** No agent steers for the breaker, so
   half of §6.5's design has no sweep coverage. **This is the next thing I would
   build**: a third "filler" agent that deliberately maximises coverage toward
   the 220 cell threshold, to confirm the board filler path is competitive with
   the combo chaser rather than assuming it.
4. **Combo pins at ×4** for competent play. Worth a director call on whether the
   40 tick window should tighten at higher circuit counts.
5. **Not verified in a real browser by me.** I ran no browser: five agents on a
   two core box makes gates lie, so the main loop owns every browser gate. Node
   verification only from this side, plus the main loop's screenshots.
6. Icons are referenced but not created here (`icon-192.png`, `icon-512.png`,
   `icon-maskable-512.png`); the main loop renders all five games' icons.

*(Gaps 1, 3 and 4 above were the brief for the second pass. Sections 12 to 16
are what happened to them. Gap 5 still stands: no browser was run from this side
either, eight agents on two cores.)*

---
---

# SECOND PASS — the deepening

## 12. The board filler: the overload playstyle now has an agent

The first build's own verdict was that half of §6.5 was unmeasured, because
nothing in the sweep ever steered for the breaker and every median read
`overloads 0`. It now has an agent, `agentFiller`, and the answer is not the one
the gap note assumed.

**How it plays.** Charge on any terminal, then deliberately take the LONG way
round: BFS to the free reachable cell furthest from the matching terminal, grow
the uncommitted slice, and only close the circuit once the slice would add
`FILL_TARGET` cells to the load meter. It steers on `pendingNew`, not on slice
length, because re walking wire that is already live scores again but moves the
breaker not at all. It refuses to route over the discharge pickup: a board
filler standing on the relief valve is throwing away its own wall. Survival is
the same `survivalTurn` tail the greedy agent uses, extracted verbatim and
**proved bit identical over 600 seeds** before anything else was measured
(`ww_refactor_check.js`, run once, not shipped).

**FILL_TARGET was swept, not guessed** (500 runs per cell, before the creep and
combo changes landed):

| FILL_TARGET | median ticks | median score | median peak load | runs that trip the breaker |
|---|---|---|---|---|
| 25 | 248 | 268 | 150 | 5.4% |
| 40 | 307 | 317 | 174 | 17.0% |
| 55 | 536 | 407 | 169 | 32.3% |
| 70 | 639 | 459 | 180 | 37.8% |
| **90 (shipped)** | **995** | **1616** | **207** | **51.0%** |
| 110 | 1045 | 1387 | 133 | 46.8% |

Monotone up to 90 and then it turns over: at 110 the agent is so busy detouring
that it stops closing circuits at all and its median peak load collapses from
207 to 133. 90 is the top of the curve, not a taste.

### The verdict, in one line

**Board filling is not decorative and it is not strictly worse. It is a
different bet with the same expected shape and a much fatter tail.** At
FILL_TARGET 90 the filler medians 1616 score against greedy's 681, with a p90 of
5429 against 1165 and a max of 16876 against 3993, and it trips the breaker in
half its runs where greedy trips one in fifty.

The honest asterisk is the rate. Score per 100 ticks: **greedy 237, filler
162**. The combo chaser scores FASTER, the board filler scores MORE PER RUN. In
an endless run, where the clock is free, the filler wins. That is why the daily
now has a clock (section 16): with 600 ticks on the board the two strategies
trade places, and the mode difference is a genuine strategic fork rather than a
different seed.

The two styles are mutually exclusive in practice and the ASCII frames show why:
a filler circuit takes 100 to 130 ticks, so **the filler holds x1 combo for its
entire run**. Combo chasing forfeits the breaker, board filling forfeits the
ladder. That was the design's claim in §6.5 and it is now a measurement.

Three sweep gates were added and all three were watched go red (break 6:
`agentFiller` aliased to `agentGreedy`).

---

## 13. The two missed bands, tested instead of inherited

The first pass argued that the random band is grid geometry and that
`DISCHARGE_INTERVAL` is a dead lever. Both claims are now experiments, in
`node sim.js --bands`, which rebuilds the game from source with a CONFIG value
patched so a frozen tunable can be swept without editing the shipped file.

### Experiment 1: the random band is geometry, and it is now proved

A plain random walk with **the entire game removed** — no terminals, no wire,
no circuits, just a walker on an empty board of size N until it crosses the
edge:

```
grid   median ticks to the wall
  16       36
  20       54   <- the spec grid
  24       77
  28      103
  32      137
  40      200
the same walk INSIDE the fully running game on the spec grid: 54
```

**54 and 54.** The random agent's run length is identical with the whole game
present and with the whole game deleted, to the tick. Nothing in CONFIG, no
spawn rule, no relief valve, no hazard can move that number, because the random
agent dies at the boundary before the game happens to it (2898 of 3000 runs die
at the wall, median 0 circuits).

And the band names its own grid. The 60 to 200 tick envelope in §6.6 is the
envelope of a **22 to 40 cell board**. §6.2 fixes the board at 20.
**The spec's verification band contradicts the spec's own grid**, and that is
the whole finding. Confirmed value for HANDOFF §9: **a plain random walk on a
20x20 board medians 54 ticks.** The band is not missed, it is inapplicable, and
the honest fix is to correct the document rather than the game. The previous
pass reached the same conclusion by reasoning; this is the measurement.

### Experiment 2 and 3: the greedy band and the levers

Greedy now medians **280 ticks** against a 300 to 900 band (it was 281 before
this pass; the tightening combo window costs score, not lifetime). Two things
changed for the better underneath that unchanged number:

- **The tick cap runs are gone.** 0 of 3000 greedy runs reached the 8000 tick
  cap, against 132 of 20000 (0.66%) before. The creep is what did it: an agent
  that stalls now accumulates load until something gives. Known gap 2 from the
  first pass is closed, not gated around.
- **The safety filtered walker came down** from a median 1231 from 1424, and its
  cap rate from 5.2% to 2.8%. Ambient pressure exists now.

The lever sweeps are printed by `--bands` experiments 2 and 3 and are reproduced
in section 17. The short version has not changed and is now measured twice:
`DISCHARGE_INTERVAL` moves the greedy median by less than the run to run noise
across a 12x range, because greedy dies to LOCAL entrapment at around 35 percent
coverage while the pickup clears the OLDEST circuit, which is usually somewhere
else on the board. **Buying the 300 floor by setting a spec value to a number
that changes nothing about the game is a green light bought with a lie**, and it
is still declined. 280 versus a floor of 300 is a 7 percent miss on a band whose
sibling gate has just been shown to describe a different board size; the spec's
real intent (over 2000 means too safe) is met by a factor of seven.

---

## 14. The combo ladder stops pinning: the window tightens as you climb

The first pass reported the defect precisely: completions land every 5 to 25
ticks against a flat 40 tick window, so combo pins at x4 inside about 50 ticks
and drops roughly once per run. The top of the ladder was a warm up, not a
decision.

**Director default, implemented and recorded: the window is per rung and it
tightens.**

```
COMBO_WINDOWS = [40, 40, 32, 26, 20]     indexed by the rung you are standing on
COMBO_LADDER  = [ 1, 1.5,  2,  3,  4]    unchanged, spec
```

The three options on the table were a longer ladder, a decaying cap, and risk
that scales with combo. The longer ladder is more of the same problem further
along. A decaying cap needs a second number on screen. The tightening window
needs **no new UI at all**: the combo ring already drains over the window, so it
simply drains visibly faster at the top, and it goes gold at x3 and above so the
change is legible without a readout. Spec's 40 ticks is preserved exactly where
the spec talks about it, at the bottom of the ladder.

What it buys, in the game's own terms: holding x4 costs a circuit every 20
ticks, which is inside the time a long red circuit takes. **You can have the
multiplier or you can have the length. Not both.** That is the same
spatial economy decision §6.3 is built on, now applied to time.

Six assertions cover it (each rung survives to the edge of its own window, each
rung drops one tick past it, the windows never widen, the top costs at least a
third less than the bottom, a drop falls all the way to x1). Break 4 flattened
`COMBO_WINDOWS` back to all 40s and the ladder gate went red.

---

## 15. CREEP: the hazard that makes board space scarce

**The problem, stated as a number.** The safety filtered random walker medians
1231 ticks against a competent greedy 287. A careless player outliving a
competent one is not a paradox, it is a diagnosis: the only lethal thing in this
game was wire the player built themselves, so a player who simply refused to
close circuits was safe more or less forever. Nothing on the board moved unless
the player moved it. A game with no ambient pressure.

**The hazard.** Current that has nowhere to go spreads. Every `CREEP_INTERVAL`
= 45 ticks **without a completion**, one empty cell touching live wire lights up
and joins the newest circuit, so a later discharge still clears it. The clock
resets on every completion, so a player who is actually playing never sees it.

It is deliberately the cheapest possible new element to read: a creep cell is
drawn as ordinary energized wire. **No new visual vocabulary at 19px.** The only
addition is a single expanding ring on the cell that just lit, so the one thing
on this board that moves without the player reads as an event rather than a
rendering glitch, plus a low third below the root in the pentatonic (the only
sound in the game that is not something the player did). Reduced motion kills
the ring, not the sound.

**Fairness rules, all four unit tested against the candidate list itself:**

- never a cell within one step of the worm's head (you always get to react)
- never a cell inside the circuit you are currently drawing (your pending shape
  is yours)
- never a terminal and never the discharge pickup
- reverted on the spot if that cell just cut the worm off from every terminal

It can trip the breaker, and that is the point: sitting still near the threshold
becomes a way to CASH the overload, not only a way to be punished. Watch seed 7
with the filler and you can see it: `t492 creep`, `t537 creep`, ... `t722 circuit
Red`, `t741 OVERLOAD cleared 227 cells for 1135`.

**A gate that could not fail, caught and fixed.** The first version of the head
adjacency assertion was statistical: play 40 boards, log every creep, assert none
landed next to the head. It passed with the guard deleted. Head adjacent
candidates are so rare in ordinary play that 320 sampled creeps never produced
one. `creepCandidates` was split out of `creepStep` for exactly this reason and
the fairness rules are now asserted against the candidate list on a board built
so that the banned cells would otherwise qualify, with a companion assertion that
the board still makes the test interesting. Breaks 1, 2 and 3 each delete one
fairness rule and each goes red.

---

## 16. Endless and daily are now different games, not different seeds

Daily was the daily seed and nothing else. It is now a **fixed shift: 600 ticks,
one board, everyone the same**, and the run ends on the clock with its own death
line ("The shift ended. Nothing killed you but the clock.").

This is one field in SIM (`tickLimit`, set from `newGame(seed, {mode})`) and it
changes the whole calculus, because of the rate measurement in section 12: the
combo chaser scores 237 per 100 ticks and the board filler 162. **On an open
clock the filler wins on total; on a 600 tick clock the chaser wins.** The mode
choice is therefore a strategy choice, which is the only kind of mode difference
worth shipping. It also makes the daily comparable between players in a way a
survival run never is: same seed, same clock, only the play differs.

The HUD swaps the tick counter for a countdown in daily and shows your daily
best rather than your all time best. Nine assertions, including that endless and
daily open on a bit identical board (`hashState` equal) so the clock is the only
difference. Break 5 removed the clock and six gates went red.

---

## 18. Gates watched FAIL in this pass

Same discipline as section 2. Every new gate was broken on purpose in a scratch
copy of the directory and watched go red before it was trusted green.

| break | what went red | exit |
|---|---|---|
| 1 creep ignores the head adjacency rule | `no creep candidate is next to the worm head` | 1 |
| 2 creep may take the circuit you are drawing | `no creep candidate sits inside the circuit you are drawing` | 1 |
| 3 creep may take a terminal or the pickup | `no creep candidate is a terminal or the relief valve` | 1 |
| 4 `COMBO_WINDOWS` flattened back to all 40s | `holding the top rung costs at least a third less time than the bottom` | 1 |
| 5 the daily loses its clock | 6 gates: the clock value, `the daily always ends`, `the daily never runs past its clock`, two named runs, `some daily runs end on the clock` | 1 |
| 6 `agentFiller` aliased to `agentGreedy` | `the board filler trips the breaker`, `the board filler builds longer circuits than the combo chaser` | 1 |
| 7 the `if (!st.circuits.length) return` guard removed from `creepStep` | **nothing** | 0 |
| restored | PASSED 252 / FAILED 0 | 0 |

**Break 7 is reported because it did not work.** With no circuits on the board
there is no live wire for anything to touch, so `creepCandidates` returns an
empty list and the early return is a pure no op. The guard stays in as defence
against a future caller, but the honest statement is that it is not load bearing
and no gate covers it. That is the same category as the first pass's finding
that the plan's named break (zeroing the tick ramp) cannot fail this game.

**A gate that could not fail was found and replaced.** The first version of the
break 1 gate was statistical and passed with the guard deleted. See section 15.
It was rewritten as a unit test of `creepCandidates` against a purpose built
board, plus a companion assertion that the board still makes the test
interesting, so the gate cannot quietly go vacuous if the fixture drifts.

**The greedy refactor was proved, not assumed.** Extracting `survivalTurn` out
of `agentGreedy` so the filler could share it is exactly the kind of "harmless"
change that silently moves every balance number in the file. Before any new
measurement was taken, the pre refactor agent was rebuilt from the exported
primitives and compared run for run: identical final tick, score and state hash
over 600 seeds.

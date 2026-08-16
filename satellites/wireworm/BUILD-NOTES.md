# WIREWORM — build notes

**Status: SHIPPABLE.** Spec HANDOFF-11 §6, plan `incoming/handoff11/PLAN-4-WIREWORM.md`, craft `incoming/handoff11/CRAFT.md`.
Game id `wireworm` · accent electric lime `#a3e635` · 20x20 grid · portal `cat:"action"` · icon 🐛.

```
node sim.js --test        PASSED 205 / FAILED 0   (205 assertions)   exit 0
node sim.js --runs=20000  balance sweep, three agents, table below
node sim.js --watch=SEED  ASCII board frames  [--every=N] [--agent=greedy|randomsafe|random]
```

`sim.js` extracts the SIM, SAVE and TEST blocks out of `index.html` between marker
comments, so node runs the same code the phone runs. There is no second copy of
the game to drift.

---

## 1. Assertion count: 205

189 game assertions + 16 source level gates, all inside the one `--test` run.
Suites: config, rng, new game, movement, circuit cases, combo, overload,
discharge, spawns, determinism, input queue, fuzz, save, copy, **regressions**,
circuit battery (1000 shapes), balance envelope.

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

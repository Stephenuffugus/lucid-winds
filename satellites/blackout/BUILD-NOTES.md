# BLACKOUT — build notes

**Status: SHIPPABLE.** Generator proven, 253 assertions green, playable loop end to end.
Game id `blackout`, accent cold cyan `#5ad1e6`, portal category `puzzle`, icon 🕯️.

Files: `index.html` (whole game), `sim.js` (node runner), `sw.js`, `manifest.webmanifest`,
this file. Icons are referenced but not created here (main loop renders all five).

---

## 1. The moat: 10,000 cases, every one proven unique

`node sim.js --cases=10000` — exit code 0, all gates passed.

```
BLACKOUT verification sweep, 10000 cases, 18739 ms
==========================================================
cases generated            10000   (unbuildable: 0)
uniqueness pass rate       100.00%   gate 100%
regeneration retry rate    0.01%   gate under 15%
minimal set median         11   gate 10 to 12
minimal set range          6 to 18
minimal set inside 8 to 14 97.40%   gate 95% or better
motive only minimal sets   0   gate 0
clue text contradictions   0   gate 0
worst reach cost           16 actions   gate 16 or less
average reach cost         10.65 actions
greedy agent solve rate    94.25%   gate above 90%
greedy agent avg actions   14.96 of 20
perfect agent solve rate   100.00%   gate 100%
avg clue pool / placed noise 44.1 / 9.2
avg minimal clues behind press 0.88

minimal set size histogram
   6      17  #
   7      32  #
   8     817  ###################
   9    1156  ###########################
  10    1542  ####################################
  11    1697  ########################################
  12    1718  ########################################
  13    1468  ##################################
  14    1342  ###############################
  15     146  ###
  16      51  #
  17      13  #
  18       1  #

SWEEP GATES PASSED
```

The sweep does not trust the generator's own claim. For every case it re-solves the
full pool AND re-solves the minimal set alone, and asserts both collapse to exactly
one tuple that deep equals the truth. Two independent checks per case, 20,000 in total.

Exit codes: `--cases` exits 1 if any gate fails, `--test` exits 1 if any assertion
fails or any grep gate trips. Both verified by watching them go red (section 4).

---

## 2. Assertion harness

`node sim.js --test`

```
total assertions 253
PASSED 253 / FAILED 0
```

**253 assertions**, floor was 80. Same suite runs in the page at `?test=1` and is
exposed as `window.__TEST__`. It lives between `// ---- TEST_EXPORT_START ----`
markers so there is exactly one copy of it.

Coverage by suite:

| Suite | What it proves |
|---|---|
| RNG | same seed same stream, ranges, shuffle integrity, seedFromString stability, same seed gives the same case |
| DATA | six of each, at least two tall and two staff, no attribute unique to one person, adjacency symmetric, no isolated room, weapon classes complete, no dash in any name |
| Predicates | **all 12 clue types against hand built TRUE and FALSE tuples**, 51 assertions, including both sub forms of types 5, 6, 7, 8, 9, 10, 12 |
| Cells | `clueExcludedCells` for all 12 types against hand computed expectations (a "no motive" clue clears an 18 cell row, a "not the cord" clue clears a 6 cell column, an alibi clears nothing on its own) |
| Generation | 200 fresh cases: uniqueness, minimal set alone proves it, every pool clue true of the truth, retry rate, median, band, motive only, reachability, text sanity, slot capacity, press gating, every minimal clue actually placed |
| Agents | greedy over 90 percent, perfect 100 percent, neither ever spends over budget |
| Marks | counter maths on eight scripted mark patterns, auto mark never crosses out the truth |
| Step | costs, refusals, locked press, stars, win, loss, the contradicting clue really contradicts and is still true of the truth |
| Save | corrupt json, empty string, array, null all recover; counters ADD, bests MAX and MIN (two tab law); archive caps at ten newest first; **mid case resume**; tampered save fields clamped or dropped |
| Fuzz | 5,000 random legal and illegal actions: nothing throws, actionsLeft never negative, the board never holds an illegal mark |
| Copy | every phrasing bank has six or more lines with no repeats, no dash anywhere in copy, every rendered clue is clean |
| Regression | four bugs that actually happened, kept as named tests (see section 5) |

---

## 3. CONFIG numbers that moved, and why

The handoff gave the shape, not the clue mix. Everything below was resolved by
sweeps, never by feel.

| Value | Spec | Shipped | Why |
|---|---|---|---|
| Clue pool size | 40 to 60 | 44.1 average | inside band, measured not assumed |
| `POOL.alibi` | not given | 18 (6 forced) | alibi cuts only 30 of 1296 tuples. It is the weakest clue in the game, which is exactly why the pool wants a lot of it: weak clues raise the uniqueness rate AND the minimal set size at once. The first six are the murder hour for all six people, because the police always ask everybody about that hour. |
| `POOL.sight` | not given | 12 | the other weak type, cuts 18 tuples |
| timeline `exact` mode | implied by "the clock stopped at 10:15" | **removed** | one clue that hands over the whole time axis cuts 1080 tuples and collapses minimal set size. The clock stopped phrasings now serve the `not` mode. This is the one spec surface I dropped. |
| `MAX_PRESS_MINIMAL` | not given | 2 | the plan's bound: 6 searches + 6 interviews + 2 presses at 2 each = 16 of 20 |
| `REACH_BOUND` | 20 (budget) | 16 | plan's tighter bound, asserted per case, worst observed exactly 16 |
| `PRESS_BIAS` | not given | 0.06 | greedy agent realism knob, see below |
| noise clues | 6 to 12 | 9.2 average placed | in band |

### Two generator decisions worth a Director veto

**a) Reinforcement instead of blind regeneration.** A purely random pool lands on a
unique solution **36.7 percent** of the time (measured, N=1500 via the `baseMiss`
counter). The misses usually sit at two to four survivors, not dozens. Rather than
throw a whole world away, the builder looks at which axis is still open and emits
more clues from the same twelve factories aimed at it, all still true of the truth by
construction. Spec 4.3 step 4 (discard and regenerate) is still there and still runs,
it just runs almost never.

Both numbers are visible: **base pool unique on first try 36.7 percent, retry rate
after reinforcement 0.01 percent**. Deleting the `reinforce()` call puts the retry
rate back above 60 percent, which fails the 15 percent gate outright (measured at
90.4 percent with the ownership factory also removed, see section 4). Reinforcement
is the honest fix for "the clue generator is too weak", because it makes the
generator stronger rather than making the gate softer. If the Director wants the raw
random pool to be the headline number instead, that is a one line change and the gate
then fails honestly.

**b) Choosing among proofs.** An irredundant clue set is not unique: different removal
orders give different valid minimal sets, all of which prove the same single solution.
The generator tries up to five removal orders and keeps one inside 8 to 14. This
chooses among proofs, it never weakens one. Without it the band was 85.7 percent;
with it, 97.4 percent. The 2.6 percent outside the band is real and reported, not
clamped: 49 cases below 8 and 211 above 14 out of 10,000.

---

## 4. Gates I watched fail first

A probe that cannot fail is not evidence. Every gate below was seen red before green.

1. **Uniqueness gate.** Commented out the weapon ownership clue factory and disabled
   reinforcement. Retry rate went **0.01 percent to 90.36 percent** and one case in
   200 could not be built at all. `GATE FAIL` printed, exit 1. Restored.
2. **Text sanity gate.** Went red on its own during the build: 61 of 200 cases
   flagged, because `clueSubjects` demanded that every trace clue name its substance
   and two of the six "far" phrasings do not. The predicate depends only on the room,
   so the requirement was wrong, not the prose. Fixed the checker.
3. **Retry gate, median gate, band gate, greedy gate.** All four printed `GATE FAIL`
   on the first four sweeps of the session. They are in the pasted output above only
   because they were fixed, not because they cannot fail.
4. **Greedy agent gate.** Raising `PRESS_BIAS` or targeting basics by live candidates
   both drop it under 90 percent (targeting basics measured 78.0 percent). Left at a
   plain sweep with targeted presses, 94.25 percent.
5. **Motive only gate and reachability gate** are structurally impossible to trip,
   because motive clues only constrain the culprit axis and placement is built to the
   bound. So instead of trusting a silent zero, the checkers themselves are unit
   tested with a positive instance: `isMotiveOnly` is asserted to return true on a
   hand built motive only set and false on a mixed one.
6. **Grep gates.** `--grep` fails on `Math.random` inside the SIM markers, on a DOM
   identifier in SIM, on a dash in any player facing string, and on a literal closing
   script tag inside a JS string.
7. **DOM smoke.** A minimal DOM stub in node (not a browser, the main loop owns
   browsers) drives boot, clicks every control, marks the board and accuses. It went
   red first and found a real bug: `row.appendChild(sv.firstChild)` on a silhouette
   would throw and kill the entire render if `innerHTML` ever produced nothing.
   Changed to append the wrapper.

### A note on the grep gate itself

The first version of the DOM identifier check flagged the word **window** inside this
clue phrasing:

> "Through the {r} window at {t}: {d}."

That is a window in a wall in a murder mystery. The checker now strips comments and
blanks the contents of string literals before hunting for identifiers. The prose was
not touched. A gate that pressures you into worse writing is worse than no gate.

---

## 5. Fuzz to regression

Crashes became named assertions before they were fixed. Four are permanent:

- `the greedy agent does not strand itself early` — the agent used to have no legal
  action left when no live suspect could be pressed, so it broke out of its loop and
  guessed. Solve rate read 79.6 percent for the wrong reason.
- `a trace clue only has to name its room` — the text sanity false positive above.
- `reinforcement never emits a false clue` — 30 cases, every pool clue re-checked
  against the truth, because reinforcement writes clues on a different code path.
- `the world always seats the killer alone at the hour` — the Cellar has one
  neighbour, which is the shape that can trap a random walk generator. 60 worlds
  checked: every room index valid, the killer in the murder room at the murder hour,
  nobody else in that room at that hour, and the killer always has a motive.

---

## 6. Touch targets, measured at 375x667

Repo law is 48px rendered, not the handoff's 44.

| Control | Rendered size at 375px wide |
|---|---|
| Deduction board cell | 48.2 x 48 px. Grid is `64px + repeat(6, minmax(46px,1fr))` inside a 353px content box: (353 minus 64) / 6 = 48.17px. Wrapped in `overflow-x:auto` so it can never squeeze under 46px on a narrower phone. |
| Search / Ask / Press buttons | min 48 x 48, inside 56px rows |
| Bottom nav tabs | 125 x 54 |
| Accuse | 48 tall, 84 wide |
| Header exit and options | 48 x 48 minimum |
| Accusation picker cells | 111 x 48 (3 columns) |
| Options toggles | 64 x 48 |
| Journal clue cards | full width x 48 minimum |

Not verified in a real browser by me. I do not run browsers (five builders sharing a
2 core box makes every gate lie); the numbers above are computed from the CSS box
model and the main loop owns the tap probe and the LOOKING pass.

---

## 7. Craft that shipped

- **Key of A minor, sparse.** Every pitched sound is quantised to the A minor scale.
  Clue discovery is a low pluck plus a fifth, spending an action is a pocket watch
  tick that gains a bright edge at four actions left, the accusation is the only loud
  moment: a held three note pad. Room tone is a band passed noise bed whose centre
  frequency shifts as you move between rooms.
- **Generated case titles.** "The Conservatory Affair", "The Midnight Question".
  Deterministic from the seed, two templates over two curated banks.
- **The pocket watch.** The action budget is a dial with a hand that sweeps, not a
  number. A press turns it twice.
- **Procedural suspect silhouettes.** Height, spectacles and a service collar drawn
  from the same attribute set the sighting clues test, so "a tall figure in
  spectacles" has referents you can see.
- **Clue touch highlighting.** Tapping a note in the journal haloes the board cells
  its predicate constrains, **without marking anything**. It is the marginal set: what
  this clue adds on top of everything you already hold, so it sharpens as the case
  narrows. Auto mark stays off by default per spec 4.6, and is a separate opt in.
- **The reveal teaches.** A wrong accusation plays the truth as three beats (who,
  where and when, with what) and then stamps the specific clue that contradicts your
  tuple. A win shows which of the notes you found were the ones doing real work, so
  you learn what good evidence looks like.
- **Case archive** with replay by seed, `?seed=` links, daily case with a streak,
  spoiler free share strings, options panel.
- Embed protocol and a findable `SWS_EXIT()` button top left on every surface.

---

## 8. Known gaps and the next thing I would do

1. **Unreliable narrators (spec 4.7) are not built.** Deliberate, per the plan.
   The solver would need "exactly one solution consistent with all but one clue and
   none consistent with all", which is a different and much heavier search.
2. **No browser has rendered this page.** Everything above is node. The LOOKING pass,
   the tap probe and `page_health.mjs` are the main loop's.
3. **2.6 percent of minimal sets fall outside 8 to 14** (49 below, 211 above of
   10,000). Reported, not clamped.
4. **The greedy agent is the weakest number at 94.25 percent** and it is sensitive to
   its press policy. It is a model of a careless player, not a bound on the game.
5. **No Sunbeam earn wiring**, consistent with the other August 16 builds.
6. **Next thing I would do:** interleave the clue journal with the board tabs so a
   note can be dragged onto the row it accuses, which is the one interaction the
   deduction board is still missing. After that, unreliable narrators.

---

## 9. Commands

```
node sim.js --test            # 253 assertions, exit 1 on any failure
node sim.js --cases=10000     # the 4.8 sweep, exit 1 on any gate failure
node sim.js --watch=12345     # one case printed in full: truth, who was where,
                              # weapon ownership, motives, the whole clue pool with
                              # how many tuples each clue cuts, the minimal set
                              # starred, the placement map, both agents
node sim.js --grep            # Math.random, DOM in SIM, dashes in copy
```

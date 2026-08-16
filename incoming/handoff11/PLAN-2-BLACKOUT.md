# PLAN 2 — BLACKOUT (build second)

Spec: HANDOFF-11.md §4 (solution space §4.2, generation algorithm §4.3, 12 clue types §4.4, action budget §4.5, deduction board §4.6, verification §4.8). The generation algorithm in §4.3 is the core deliverable — build and verify it before ANY UI exists (§8: "Do not start the UI until 10,000 cases verify unique").

**Target:** `satellites/blackout/` · accent cold cyan `#5ad1e6` · portal card `cat:"puzzle"` · ic 🕯️ (record final pick).

## Spec ambiguities — RESOLVED

1. **World data (DATA layer, fixed across all cases; only assignments are procedural):**
   - 6 suspects with fixed names and attributes: `{name, tall:bool, staff:bool, wearsGlasses:bool}` — at least 2 tall, at least 2 staff, no attribute unique to one suspect (or a single sighting clue could solve culprit alone). Invent period-neutral names (no dashes, no real-person names).
   - 6 weapons each with a `class` (blade / blunt / cord / poison / firearm / blade — classes may repeat) for §4.4 clue 7.
   - 6 rooms with an adjacency map (used by clue 5) and a `staffOnly` flag on at least one (clue 3).
   - 6 time slots, ordered (7pm…midnight), for clues 6 and 11.
2. **Clue = data object, never a closure:** `{id, type, params}` plus a pure `cluePasses(clue, C, world)` dispatcher. This keeps clues serializable (save/resume — BLACKOUT supports resume per HANDOFF §1.4), makes the solver a plain double loop, and lets sim.js extract everything. Surface text is rendered separately by `clueText(clue, world, phrasingIndex)` from a template table — **6 phrasings per clue type minimum** (§4.4), phrasing chosen by RNG at generation.
3. **All 12 clue types implemented as predicate factories** per the §4.4 table. Each factory takes (truth, world, rng) and must generate a clue that is TRUE of the truth tuple by construction; assert this at generation time for every clue emitted.
4. **Motive clues** (type 8): allowed in the pool, but the §4.8 rule is enforced structurally: after MINIMIZE, if the minimal set is motive-only (or if removing all motive clues from the full pool leaves >1 candidate — check both), regenerate.
5. **Clue placement / reachability (§4.3 step 6–7, made concrete):** discovery slots are the 6 rooms (search: yields 1–2 clues) and the 6 suspects (interview: 1 clue; press: 1 more). Place every minimal-set clue in a basic slot (search or interview), EXCEPT at most 2 minimal clues placed behind Press. Worst case to see every minimal clue: 6 searches + 6 interviews + 2 presses×2 = 16 actions ≤ 20 budget. Assert this bound on every generated case. Redundant noise clues (6–12, §4.3 step 6) fill remaining slots.
6. **Press mechanic (§4.5, made concrete):** Press on suspect S unlocks when the player HOLDS any discovered clue whose params reference S (ownership, alibi, sighting, exclusion-pair). Costs 2 actions, yields S's press clue. The UI shows why press is locked ("find something that mentions them first" — reworded without dashes).
7. **Accusation:** a 4-part picker (suspect/weapon/room/time), one shot, confirm dialog. Wrong → reveal truth + the specific held-or-placed clue that contradicts the player's accusation (compute: first clue in the case whose predicate fails their tuple). Rating on win: actions remaining → 3/2/1 stars (≥8 / ≥4 / otherwise).
8. **Candidate counter (§4.6):** derived ONLY from the player's manual ✗ marks on the board — `1296 minus tuples excluded by marked ✗ cells` (a tuple is excluded if any of its 3 pairings with the culprit row, or its attribute cell, is marked ✗… implement as: counter = count of tuples consistent with the mark grid). It can be WRONG if they mark wrong; that is the game. The optional auto-mark-contradictions toggle (settings, default OFF) applies discovered clues' predicates to the grid mechanically.
9. **Daily case:** the daily seed generates the case; share string like `BLACKOUT day 142 solved in 13 moves` (no dashes). Endless mode: NEW CASE button, seed = rng.
10. **Unreliable narrator (§4.7) is OUT of this block.** Do not build it. Note it as the known gap.

## SIM/GEN API

```js
// inside SIM_EXPORT markers
generateCase(seed) -> {truth, world, cluePool, minimalSet, placements, retries}
solve(clues, world) -> [candidateTuples]        // filter 1296 by cluePasses
minimize(cluePool, world, rng) -> minimalSet    // greedy removal, shuffled order
newGame(caseObj) -> state                        // actionsLeft:20, discovered:[], marks:{}
step(state, action) -> {state, events}           // search/interview/press/mark/accuse
candidateCountFromMarks(marks) -> n
greedyAgent(caseObj, rng) -> {solved, actionsUsed}   // for the >90% gate
```

`solve` is the heart: 1,296 tuples × ≤60 clues, pure, must run in <50ms. The greedy agent (§4.8): searches unsearched rooms and interviews uninterviewed suspects in random order, presses when unlocked, maintains the TRUE candidate set from discovered clues, accuses when it hits 1 (or when actions run out, accuses a random remaining candidate — that's the <10% failure allowance). A PERFECT agent (visits exactly the placement slots of the minimal set — it may cheat by reading placements) must be 100%.

## Build phases (commit + push after each)

1. **DATA + RNG + clue predicate dispatcher.** Unit-assert each of the 12 predicate types against hand-built tuples (true case + false case each = 24 assertions right here).
2. **Generator + solver + minimizer (§4.3 steps 1–7 verbatim).** Include the retry counter.
3. **Verification harness in node FIRST (`sim.js --cases=10000`):** all §4.8 gates — 10,000 cases unique-solution, retry rate <15%, minimal set size 8–14 median ~11 (print the histogram), greedy agent >90% / perfect agent 100%, no motive-only minimal sets, reachability ≤16 actions, and the string-level sanity pass (render every minimal clue's text, assert the templated fields match the truth-consistent params — e.g. an alibi text never places the culprit outside the murder room at murder time incorrectly). Watch it FAIL first: comment out one clue-type factory and confirm uniqueness collapses before trusting green.
4. **In-page TEST harness** (≥80 assertions): fold in the node gates at smaller N (200 cases), plus save round-trip with mid-case resume, corrupt-save recovery, mark-grid counter correctness on scripted mark sequences, 5,000-action fuzz on `step` (random legal + illegal actions, no throw, actionsLeft never negative).
5. **VIEW.** Two surfaces: the deduction board (§4.6 — 6×6 grid, three tabs weapon/room/time, tap cycles ✓/✗/?, live candidate counter) and the investigation surface (room list + suspect list with action costs, discovered clue journal). Portrait 390×844; the board cells are the touch-target risk — 6 columns at 390px is 65px/cell, fine, but verify RENDERED size at 375×667.
6. **INPUT + SAVE** (resume mid-case).
7. **Polish.** Cold, quiet audio (single low pad on discovery, sharper sting on accusation). Losing must teach (§4.5): the reveal screen highlights the contradicting clue.
8. **SW + manifest + icons; portal card + thumb + LOOKING pass + deploy + live grep** per README. Suggested ds: "Every mystery is generated with exactly one answer and the proof to find it."

## Known risks

- Uniqueness retry rate is the schedule risk: if regeneration exceeds 15%, the fix is stronger clue factories (more narrowing types per case, especially timeline + alibi), not looser assertions.
- The minimize step must shuffle removal order per-case (deterministic from the case seed) or minimal sets will bias toward late clue types and the 8–14 distribution gate will fail for structural reasons.
- Surface-text templating is where silent contradictions live — the string-level sanity pass in phase 3 is not optional.

# HANDOFF.md — SIX GAMES, ONE SESSION

**Owner:** Stephen / SWS Strategic Media LLC (Lucid Winds / Sky Walk Studio)
**Target:** Claude Code, GitHub Codespaces, single overnight/4-hour block
**Deliverable:** Six standalone single-file PWA games, each independently shippable

---

## 0. READ THIS FIRST

Six games are specified below. **Do not attempt all six in one pass.** Read Section 8 (Build Order) before writing any code. If you are one instance, build in priority order and stop when the block ends — a finished DEEPWELL beats six half-games. If you are one of several parallel instances, take exactly one game and ignore the rest of this document except Sections 1–3.

Each game is specified to the point where balance numbers are given, not invented. Where a number is given, use it. Where a number is marked `TUNE`, the sim harness derives it.

**Non-negotiable:** every game ships with a passing test harness. A game that runs but has no harness is not done.

---

## 1. SHARED CONVENTIONS (ALL SIX GAMES)

### 1.1 Architecture

- **One file.** `index.html` containing all HTML, CSS, and JS. No build step, no bundler, no npm dependencies, no CDN imports.
- **No frameworks.** Vanilla DOM and/or Canvas 2D. No React, no Three.js, no physics libs.
- **No external assets.** All visuals are CSS, SVG, or Canvas draw calls. All audio is WebAudio synthesis (oscillators + noise buffers). Zero network requests at runtime.
- **Mobile-first, portrait-first.** Assume a 390×844 viewport as the design target. Touch is the primary input; keyboard is a bonus. Minimum tap target 44×44 CSS px. No hover-dependent interactions.
- **Offline-capable.** Inline `manifest.json` via a data-URI link tag, plus a minimal inline service worker registered from a Blob URL. If the SW registration fails, the game must still run — wrap in try/catch and continue.
- **Safe area.** Respect `env(safe-area-inset-*)`. No content under the notch or home indicator.

### 1.2 File layout inside `index.html`

Keep this order. It makes diffing and handoff sane:

```
<head>       meta, title, manifest link, <style>
<body>       #app root, minimal static markup
<script>     Section order:
  1. CONFIG        — all tunable constants in one frozen object
  2. RNG           — seeded PRNG, no Math.random anywhere else
  3. DATA          — content tables (items, enemies, rooms, etc.)
  4. GEN           — procedural generation + verification
  5. SIM           — pure state machine, zero DOM references
  6. VIEW          — all rendering, reads SIM state, never mutates it
  7. INPUT         — event wiring
  8. SAVE          — localStorage persistence
  9. TEST          — assertion harness
  10. BOOT         — init, run tests in dev mode, start loop
```

**The SIM layer must never touch the DOM.** This is what makes headless testing possible. If a sim function references `document`, `window`, `canvas`, or `performance`, it is in the wrong layer. Time comes in as a parameter.

### 1.3 Deterministic RNG (mandatory, identical in all six)

```js
// mulberry32 — fast, seedable, good enough for games
function makeRNG(seed) {
  let a = seed >>> 0;
  const r = () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  r.int = (n) => Math.floor(r() * n);
  r.range = (lo, hi) => lo + Math.floor(r() * (hi - lo + 1));
  r.pick = (arr) => arr[Math.floor(r() * arr.length)];
  r.shuffle = (arr) => { const a2 = arr.slice();
    for (let i = a2.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a2[i], a2[j]] = [a2[j], a2[i]]; }
    return a2; };
  r.weighted = (pairs) => { // [[item, weight], ...]
    let total = 0; for (const p of pairs) total += p[1];
    let x = r() * total;
    for (const p of pairs) { x -= p[1]; if (x <= 0) return p[0]; }
    return pairs[pairs.length - 1][0]; };
  r.seed = seed >>> 0;
  return r;
}
```

`Math.random` is banned in SIM and GEN. Grep for it before declaring done. Cosmetic-only randomness in VIEW (particle jitter) is allowed but must not feed back into SIM.

**Daily seed:** `seedFromString(new Date().toISOString().slice(0,10) + GAME_ID)` using a simple FNV-1a string hash. Every game gets a daily challenge seed for free.

### 1.4 Save format

```js
{ v: 1, gameId: "deepwell", stats: {...}, unlocks: [...], best: {...}, settings: {...} }
```

- Key: `lw_<gameId>_v1`
- Every read wraps in try/catch and falls back to a fresh default object. Corrupt saves must never white-screen the game.
- Version field present from day one. Write a `migrate(save)` stub even if it's a no-op.
- Never store in-progress run state unless the game explicitly supports resume (DEEPWELL and BLACKOUT do; the rest do not).

### 1.5 Test harness contract

Identical shape in all six:

```js
const TEST = {
  results: [], 
  assert(name, cond, detail) { this.results.push({name, pass: !!cond, detail}); },
  eq(name, a, b) { this.assert(name, a === b, `expected ${b}, got ${a}`); },
  near(name, a, b, tol) { this.assert(name, Math.abs(a-b) <= tol, `expected ~${b}, got ${a}`); },
  run() { /* call every suite */ },
  report() { /* returns {passed, failed, failures[]} */ }
};
```

- Runs automatically when URL contains `?test=1`, rendering a pass/fail panel over the game.
- Also exposed as `window.__TEST__` so a headless runner can call it.
- **Assertion floor: 80 per game.** SHARDFALL hit 141; that's the bar to beat, not the ceiling.
- Must include: RNG determinism (same seed → identical run), save round-trip, generation validity (see per-game criteria), balance envelope (see per-game criteria), and no-crash fuzz (5,000 random inputs, no exceptions thrown).

### 1.6 Headless sim runner

Each game also emits `sim.js` — a Node script that imports nothing and re-declares the CONFIG/RNG/DATA/GEN/SIM layers by reading them out of `index.html` via a marker-comment extraction:

```js
// ---- SIM_EXPORT_START ----
// ---- SIM_EXPORT_END ----
```

`node sim.js --runs=50000 --seed=1` runs the balance sweep and prints a table. This is how balance numbers marked `TUNE` get resolved. Do not eyeball balance. Run the sweep.

### 1.7 Visual language

Shared studio identity, executed per-game:

- Dark base (`#0a0b0f`–`#14161d`), one saturated accent per game, one warm highlight.
- System font stack, heavy weights for numbers, `font-variant-numeric: tabular-nums` on anything that ticks.
- Motion: 120–180ms ease-out for UI, no bouncy easing. Respect `prefers-reduced-motion` — when set, disable screen shake and particles entirely.
- No text smaller than 13px. No pure-red/green as the sole channel for meaning (colorblind safety).
- Every game opens straight into play or a one-tap start. No splash screens, no logos, no tutorials-as-walls. Teach through the first 30 seconds of play.

### 1.8 Definition of done (per game)

1. Loads offline in a fresh profile, no console errors.
2. `?test=1` shows all green, ≥80 assertions.
3. `node sim.js --runs=10000` completes and reports balance inside the stated envelope.
4. Playable start-to-end-condition on a 390×844 touch viewport.
5. Save persists across reload; corrupt save recovers gracefully.
6. Header comment block: game ID, seed policy, tuning notes, known gaps.

---

## 2. THE SIX GAMES — SUMMARY TABLE

| # | Title | Genre | Session | Core risk | Verification moat |
|---|-------|-------|---------|-----------|-------------------|
| 1 | **DEEPWELL** | Push-your-luck mining roguelite | 4–8 min | Balance feel | 50k-run sim sweep |
| 2 | **BLACKOUT** | Deduction / procedural mystery | 10–15 min | Solver correctness | Uniqueness proof per case |
| 3 | **PARALLEL** | Mirrored-input puzzle platformer | 20–40 min total | Level solvability | BFS solver per level |
| 4 | **WIREWORM** | Circuit-building snake | 2–5 min | Readability | Circuit-detection tests |
| 5 | **SIEGE OF ONE** | Inverted tower defense | 8–12 min | Two-mode cohesion | Wave DPS math |
| 6 | **LAST CALL** | Restaurant closing-shift crunch | 6–10 min | Scope | Queue throughput sim |

---

## 3. GAME 1 — DEEPWELL

**Game ID:** `deepwell` · **Accent:** amber `#f0a742` on near-black · **Priority: BUILD FIRST**

### 3.1 Pitch

One shaft. Dig down. Every meter deeper is worth more and costs more. Light, air, and carry weight all run out. The only real decision in the game is *when to turn around* — and the game is built so that decision is agonizing every single time.

### 3.2 Core loop

1. Buy/equip at the surface with cash from previous runs.
2. Descend. Each tick of depth consumes lamp fuel and air.
3. Encounter nodes: ore veins, pockets, hazards, shrines.
4. Mine ore → gains value, adds weight → weight slows ascent and burns more air.
5. Decide: descend further, or ascend.
6. Ascend costs `weight × depth` in air. If air hits zero mid-ascent, you lose the run's cargo (not permanent progress).
7. Bank cash. Upgrade. Repeat.

**The hook:** ascent cost scales with what you're carrying. Greed is literally the thing that kills you, and the player can compute it. Never hide the ascent cost — show a live "AIR TO SURFACE: 34 / 51" readout. The tension is *informed*, not random.

### 3.3 Resources

| Resource | Start | Cap | Drain |
|----------|-------|-----|-------|
| Air | 100 | 100 (upgradeable to 180) | 1/depth descending, `1 + weight/20` per depth ascending |
| Lamp | 100 | 100 (upgradeable to 200) | 1.5/depth, ×2 in Dark strata |
| Weight | 0 | 40 (upgradeable to 90) | — |
| Integrity | 3 | 3 (upgradeable to 6) | Hazards remove 1; at 0 the run ends immediately, cargo lost |

Lamp at zero doesn't kill — it blinds. Below zero lamp, node contents are hidden until you commit to them. This is a *better* failure than death: it keeps the player playing while punishing them.

### 3.4 Strata (depth bands)

| Band | Depth | Ore tier | Hazard rate | Modifier |
|------|-------|----------|-------------|----------|
| Topsoil | 0–20 | 1 | 5% | — |
| Shale | 21–50 | 1–2 | 12% | — |
| Dark Seam | 51–90 | 2–3 | 20% | Lamp drain ×2 |
| Wet Shelf | 91–140 | 3–4 | 25% | Air drain ×1.4 |
| The Glass | 141–200 | 4–5 | 30% | Hazards deal 2 integrity |
| Below | 201+ | 5 | 35% + 1%/10 depth | All of the above |

`Below` is unbounded. There is no win screen — the record is the score. Depth record and cash-banked record are tracked separately so two playstyles both have a leaderboard.

### 3.5 Ore table

| Ore | Tier | Weight | Value | Notes |
|-----|------|--------|-------|-------|
| Slag | 1 | 3 | 4 | Filler, teaches the weight/value ratio |
| Copper | 1 | 4 | 9 | |
| Iron | 2 | 6 | 18 | |
| Silver | 2 | 5 | 26 | Good ratio, feels great |
| Cobalt | 3 | 7 | 42 | |
| Gold | 3 | 9 | 60 | Heavy, tempting, the classic trap |
| Beryl | 4 | 4 | 75 | Light + valuable = the dream pull |
| Uranite | 4 | 8 | 95 | Drains lamp 3/depth while carried |
| Voidglass | 5 | 6 | 160 | |
| Heartstone | 5 | 12 | 300 | Run-defining. One per run max, deep only. |

Value-per-weight is deliberately non-monotonic. Beryl at 18.75/wt vs Gold at 6.67/wt means an informed player *drops gold for beryl*, and that moment — voluntarily throwing away gold — is the best feeling in the game. Make dropping cargo a one-tap action.

### 3.6 Node types

Generate one node every 3–6 depth, weighted by band:

- **Vein** (45%) — 1–3 ore of band tier. Mining takes 2 depth-ticks of resources.
- **Pocket** (15%) — air or lamp refill, `TUNE` amount (start: 25–40).
- **Hazard** (band rate) — gas pocket, collapse, flood. Costs integrity unless prevented by gear.
- **Shrine** (8%) — offers a one-time devil's bargain. See below.
- **Cache** (7%) — flat cash, weightless. The safe-play reward.
- **Empty** (remainder) — nothing. Necessary; without empties, descent has no cost-of-time feel.

**Shrine bargains** (pick 12, offer 1 random, always show exact numbers):

1. +40 air, −1 integrity
2. Double next vein's value, +50% its weight
3. Drop all cargo → gain cash equal to 60% of its value, instantly, no ascent needed
4. +30 lamp, all ore mined from here weighs +2
5. Reveal all nodes for the next 20 depth, −20 air
6. Halve current weight, lose half current cargo value
7. Next hazard is nullified, −25 lamp
8. +1 integrity, −30 air and −30 lamp
9. Teleport up 15 depth, lose one random ore
10. All Tier-1 ore in cargo becomes Tier-2 ore, +1 weight each
11. Gain 100 cash now, next 3 veins are empty
12. Free full lamp refill, hazard rate +10% for the rest of the run

### 3.7 Upgrades (surface shop, permanent)

Six tracks, 5 levels each, escalating cost `base × 2.1^level`:

| Track | Effect/level | Base cost |
|-------|--------------|-----------|
| Tank | +16 air | 60 |
| Lamp | +20 lamp | 50 |
| Pack | +10 weight cap | 80 |
| Brace | +1 integrity (max 3 levels) | 150 |
| Drill | Mining costs 1 less tick | 110 |
| Assay | See node contents 2 nodes ahead | 90 |

Full clear ≈ 11,400 cash. Target: **~25 runs to full clear** for a median player. The sim resolves whether that holds.

### 3.8 Balance envelope (sim must confirm)

Run 50,000 sims across three policies — Greedy (never turn back until air < ascent cost), Cautious (turn at 60% air), Optimal (turn at exact break-even + 10% buffer):

- Greedy loses cargo in **55–70%** of runs.
- Cautious loses cargo in **<8%** of runs but banks **35–50%** of Optimal's cash.
- Optimal banks the most, but its *variance* must be high enough that Cautious wins some individual runs. If Optimal dominates every percentile, the game is solved — raise hazard variance.
- Median session length: **4–8 minutes**. If sims imply longer, raise resource drain.
- Depth-200 reachable by an unupgraded player in **<3%** of runs; by a fully-upgraded player in **>60%**.

Print a table of these per policy. If any bound is missed, adjust CONFIG and re-run — do not adjust the bounds.

### 3.9 Feel notes

- Depth counter is the biggest element on screen. It should tick like an odometer.
- Ascent is *faster* than descent visually (2× scroll speed) so the escape has momentum.
- A single rising tone that gets more dissonant as `air remaining − ascent cost` narrows. Silence when comfortable. This one audio cue carries the entire game's tension.
- When cargo is lost, show exactly what was lost and its value. Twist the knife. That's the retention mechanic.

---

## 4. GAME 2 — BLACKOUT

**Game ID:** `blackout` · **Accent:** cold cyan `#5ad1e6` · **Priority: BUILD SECOND**

### 4.1 Pitch

A procedurally generated murder with a **mathematically guaranteed unique solution**. Not vibes-based deduction — the generator proves solvability before it ships the case to the player. Infinite cases, every one fair.

This is the one with a defensible moat. Anyone can clone a mystery game; almost nobody bothers to write the solver.

### 4.2 Solution space

A case is a tuple: **(culprit, weapon, room, time)**

- 6 suspects, 6 weapons, 6 rooms, 6 time slots = **1,296 possible solutions**
- Exactly one is true
- The player's job is to reduce 1,296 → 1

### 4.3 Generation algorithm (this is the core deliverable)

```
1. Pick truth T = (culprit, weapon, room, time) from RNG.
2. Build the full world state:
   - Each suspect has a location at each time slot (6 suspects × 6 slots).
   - The culprit is in the murder room at the murder time. Everyone else is elsewhere at that time.
   - Each weapon has an owner and a starting room.
   - Each suspect has a motive strength 0–3 toward the victim.
3. Generate a CLUE POOL of 40–60 clues. Each clue is a predicate over the
   solution space: given a candidate tuple C, clue.test(C) → true/false.
   Every clue must be TRUE of T. (No lying clues in v1. See 4.7.)
4. SOLVE: candidates = all 1,296 tuples filtered by every clue in the pool.
   ASSERT candidates.length === 1 AND candidates[0] deep-equals T.
   If not, discard the case and regenerate. Log the retry count.
5. MINIMIZE: greedily remove clues whose removal keeps |candidates| === 1.
   The remaining set is the MINIMAL SUFFICIENT SET (typically 8–14 clues).
6. Distribute: minimal-set clues are placed across the 6 rooms and 6 suspects
   as discoverable evidence. Add 6–12 redundant clues from the pool as
   consistent-but-unnecessary noise.
7. ASSERT every clue in the minimal set is reachable within the player's
   action budget (see 4.5). If not, regenerate.
```

Step 4 is non-negotiable and cheap — 1,296 candidates × ~50 predicates is under 65k operations. Run it on every case.

### 4.4 Clue types (implement all 12)

Each is a predicate factory. `C` is a candidate tuple.

| # | Type | Example surface text | Predicate |
|---|------|---------------------|-----------|
| 1 | Alibi | "Vance was in the Conservatory at 9pm" | `!(C.culprit===vance && C.time===9pm && C.room!==conservatory)` |
| 2 | Weapon ownership | "The letter opener belongs to Mira" | Narrows weapon↔suspect pairing |
| 3 | Room access | "The cellar was locked; only staff had keys" | `!(C.room===cellar && !staff.includes(C.culprit))` |
| 4 | Witness sighting | "Someone saw a tall figure leave the study" | Excludes suspects by attribute |
| 5 | Physical trace | "Mud in the hall — from the garden" | Constrains room adjacency at time |
| 6 | Timeline | "The clock stopped at 10:15" | Narrows time |
| 7 | Weapon trace | "The wound was narrow and deep" | Narrows weapon class |
| 8 | Motive | "Ellis stood to inherit" | Weighted, never sufficient alone |
| 9 | Exclusion pair | "Two people were together all evening" | Removes pairs |
| 10 | Negative space | "No one entered the library after 8" | Time+room exclusion |
| 11 | Sequence | "The scream came before the car left" | Orders two events |
| 12 | Object state | "The window was locked from inside" | Constrains access route |

Surface text is templated from a table so the same predicate reads differently across cases. Write **6 phrasings per clue type minimum** — this is the cheapest possible replayability.

### 4.5 Player actions and budget

The player has **20 actions** per case. Actions:

- **Search a room** (1 action) — yields 1–2 physical clues placed there
- **Interview a suspect** (1 action) — yields 1 clue; suspects may deflect
- **Press a suspect** (2 actions) — requires a contradicting clue in hand; yields a strong clue
- **Cross-reference** (0 actions) — the deduction board, always free

The action budget is what makes it a game rather than a checklist. The minimal set is 8–14 clues; 20 actions with imperfect targeting makes it tight but always winnable.

**Accusation:** one shot. Correct → case solved, rating based on actions used. Wrong → the case is lost, but reveal the full solution and the specific clue that would have contradicted the player's accusation. Losing must teach.

### 4.6 Deduction board (the main UI)

A 6×6 grid interface, suspect × (weapon/room/time) tabs. Player marks cells ✓ / ✗ / ? manually. **Do not auto-solve for the player.** Optionally offer an "auto-mark contradictions" toggle in settings for accessibility — default off.

Show a live candidate counter: "**47 possibilities remain**". This is derived from the player's *marks*, not from the true clue set — so it can be wrong if they mark wrong. That's the game.

### 4.7 Stretch: unreliable narrators

If time permits, add a v2 mode where exactly one suspect (never the culprit... or sometimes the culprit) gives one false statement. The solver then requires: exactly one solution consistent with all-but-one clue, and no solution consistent with all clues. Do not build this until v1 passes every test.

### 4.8 Verification requirements

- Generate **10,000 cases**, assert all have exactly one solution.
- Assert regeneration retry rate **< 15%** (higher means the clue generator is too weak).
- Assert minimal set size distribution is 8–14, median ~11.
- Assert every case is solvable within 20 actions by a scripted greedy agent in **>90%** of cases. A perfect agent must be 100%.
- Assert no case's minimal set contains only motive clues (motive alone must never be sufficient).
- Assert clue surface text never contradicts the truth tuple (string-level sanity pass).

---

## 5. GAME 3 — PARALLEL

**Game ID:** `parallel` · **Accent:** violet `#8b7cf6` · **Priority: THIRD**

### 5.1 Pitch

Every level has two of you. Move left, one goes left and the other goes right. Get both to their exits simultaneously. Sixty levels, procedurally generated, every single one solver-verified.

### 5.2 Rules

- Grid-based, 12×12 max. Discrete moves, no physics.
- Input: LEFT / RIGHT / UP (jump) / WAIT. Player A takes the input; player B takes the horizontal mirror. UP and WAIT apply to both identically.
- A blocked move is a no-op for that avatar only — this is the entire source of puzzle depth. Walls let you *de-synchronize* the pair.
- Gravity: after every input, both avatars fall until supported.
- Tiles: floor, wall, spike (death), exit-A, exit-B, key, door, one-way plate, crumbling floor (breaks after 1 traversal), ice (slide until blocked).
- Win: both avatars stand on their respective exits at the same time.
- Death: either avatar touches a spike → instant restart, no penalty. Restart must be < 200ms and one tap.

### 5.3 Generation + solver

**Solver (build this first, before the generator):**

State = `(ax, ay, bx, by, keysMask, brokenMask)`. BFS from initial state over the 4 inputs. Return shortest solution length, or null.

State space bound: 144 × 144 × 2^k × 2^c. Cap keys at 3 and crumbling tiles at 5 → ≤ 144²×8×32 ≈ 5.3M worst case, typically far less. BFS with a Set of packed integer keys is fast enough. Pack state into a single integer.

**Generator:**

```
1. Carve a random room layout at target density (walls 25–40%).
2. Place exits, then spikes, then features by difficulty tier.
3. Run solver.
4. Accept only if: solvable AND solution length in the tier's target band
   AND at least one "desync moment" exists (a state where a move affects
   exactly one avatar) AND a naive greedy agent FAILS to solve it.
5. Minimize: try removing each wall; if still solvable at same length, keep
   removed. Produces clean-looking levels instead of noisy mazes.
```

The "greedy agent fails" check is what separates a puzzle from a corridor. Greedy agent = always move toward reducing Manhattan distance of A to exit-A.

### 5.4 Difficulty tiers

| Tier | Levels | Grid | Solution length | Features |
|------|--------|------|-----------------|----------|
| 1 | 1–10 | 8×8 | 4–10 | walls only |
| 2 | 11–22 | 10×10 | 8–18 | + spikes |
| 3 | 23–35 | 10×10 | 14–26 | + keys/doors |
| 4 | 36–48 | 12×12 | 20–36 | + crumbling, one-way |
| 5 | 49–60 | 12×12 | 30–55 | + ice, all combined |

Generate all 60 at build time with a fixed master seed, embed as a compact string array in DATA. Do not generate at runtime — you want the same 60 levels for every player so they can compare.

Add a **Daily** mode: one tier-4 level from the daily seed, generated at runtime, shareable result string (`PARALLEL #142 — 23 moves, 4 deaths`).

### 5.5 Verification

- All 60 embedded levels solve via BFS.
- All 60 fail the greedy agent.
- No level's solution length falls outside its tier band.
- Solution lengths increase monotonically *on average* across tiers (fit a line, assert positive slope).
- Fuzz: 5,000 random input sequences on each of 10 sample levels, no exceptions, no state corruption.
- Level string round-trip: encode → decode → identical grid.

---

## 6. GAME 4 — WIREWORM

**Game ID:** `wireworm` · **Accent:** electric lime `#a3e635` · **Priority: FOURTH**

### 6.1 Pitch

Snake, but your trail is live wire. Connect terminals to complete circuits and score. Completed circuits stay energized and kill you on contact. You are building the maze that kills you.

### 6.2 Rules

- 20×20 grid. Worm moves continuously, one cell per tick. Tick starts at 220ms, decreases 4ms per circuit completed, floor 90ms.
- Input: turn left / turn right relative to heading (swipe or tap-halves). Relative controls, not absolute — critical for one-thumb mobile play.
- The worm leaves a permanent wire trail. Trail does not decay.
- **Terminals** spawn in pairs (matched colors), 2 pairs on screen at all times.
- Touching a terminal charges the worm with that color. Touching its match while charged **completes a circuit**: the entire path traced between them becomes energized.
- Energized wire is lethal on contact. Un-energized wire is passable — you can cross your own dead trail freely.
- Score = `circuitLength × colorMultiplier × comboMultiplier`.
- Combo: completing a circuit within 40 ticks of the last one increments combo (×1, ×1.5, ×2, ×3, cap ×4).
- Death: hitting energized wire or a wall. That's it.

### 6.3 The good decision

Longer paths between terminals score more but energize more of the board, shrinking your own space. Short greedy circuits score little but keep the board open. Every single circuit is a spatial-economy decision, and unlike snake, the player *chose* the shape of the danger.

### 6.4 Colors and multipliers

| Color | Multiplier | Spawn weight |
|-------|-----------|--------------|
| Green | 1.0 | 40 |
| Blue | 1.5 | 30 |
| Amber | 2.5 | 20 |
| Red | 4.0 | 10 |

Red pairs spawn maximally far apart (forcing long, dangerous paths). Green pairs spawn close.

### 6.5 Relief valves

Without a way to clear the board, every run ends the same. Two valves:

- **Discharge pickup** — spawns every ~90 ticks. De-energizes the oldest circuit and removes its wire. Never spawns adjacent to energized wire.
- **Overload** — when energized cells exceed 55% of the grid, ALL circuits discharge, awarding `energizedCells × 5` bonus, and the board clears to bare trail. This is a *reward*, so pushing toward it is a viable high-risk strategy.

Overload creates a second win-condition mindset (board-filler vs combo-chaser) from almost no extra code.

### 6.6 Verification

- Circuit detection: the traced path between terminals is computed correctly for 1,000 synthetic trail shapes, including self-crossing paths and paths that revisit cells.
- Assert energized cells never exceed grid capacity.
- Assert overload triggers exactly at threshold and clears fully.
- Assert discharge never spawns on an unreachable cell.
- Sim 20,000 runs with a random-walk agent and a simple greedy agent; assert median run length 60–200 ticks (random) and 300–900 ticks (greedy). If greedy exceeds 2,000, the game is too safe.
- Determinism: same seed + same input sequence → identical final score, verified 500×.

---

## 7. GAME 5 — SIEGE OF ONE & GAME 6 — LAST CALL

These two are lower priority. Build only if 1–4 are done and verified. Specs are deliberately tighter — expand at implementation time.

### 7.1 SIEGE OF ONE

**Game ID:** `siege` · **Accent:** rust orange `#e8703a`

Inverted tower defense. A single horizontal lane, 30 cells. You are one defender who both **places traps between waves** and **fights in the lane in real time** during waves.

- **Build phase:** 20 seconds (skippable). Spend scrap on traps placed in lane cells.
- **Combat phase:** enemies advance from the right. You move left/right in the lane, attack with a cooldown, and are subject to your own traps' terrain (a pit slows you too).
- Lose when an enemy reaches cell 0. Survive 20 waves to win; endless mode after.

**Traps (6):** Spike Strip (damage over cell), Pit (slow + fall damage), Ballista (ranged, needs line of sight), Brazier (burn stacking), Wall (blocks 3 hits then breaks, blocks you too), Snare (single-target hold).

**Enemies (8):** Runner (fast, low HP), Brute (slow, high HP), Shielded (immune to first 3 hits), Flyer (ignores ground traps), Sapper (destroys the first trap it touches), Healer (heals nearby), Swarm (spawns 5 at once), Warden (boss, wave 10 and 20).

**Wave HP curve:** `baseHP × 1.18^wave`, total wave HP `TUNE` so that a perfectly-optimized trap loadout clears wave 20 with ~15% margin. Scrap income: `40 + 12×wave`.

**Verification:** simulate every trap loadout combination against every wave (combinatorial sweep, cap at reasonable loadout size). Assert no single loadout clears all 20 waves without player combat contribution — the player must matter. Assert at least 4 distinct loadouts can reach wave 15.

### 7.2 LAST CALL

**Game ID:** `lastcall` · **Accent:** warm sodium `#ffb347`

Real-time resource crunch: the last 90 minutes of a restaurant shift, compressed to 8 minutes. You're the one still on the floor.

- **Queues:** tickets (kitchen), tables (service), closing tasks (side work).
- **Constraint:** you can do one thing at a time, and closing tasks can only be done when their zone is clear. A table that won't leave blocks the whole dining room breakdown.
- **Events:** walk-in at 10 minutes to close, fryer goes down, a server called off, a two-top that camps, a comp that needs a manager, a delivery that has to be put away cold-first.
- **Scoring:** tickets served × satisfaction, minus overtime minutes, minus tasks left undone. Best score is *not* max service — it's the balance.

The domain authenticity is the differentiator. Write the event and ticket text with real specificity (a 12-top that splits the check seventeen ways; the walk-in that orders the one thing that takes 22 minutes).

**Verification:** queue throughput sim over 10,000 shifts with three policies (service-first, close-first, balanced). Assert balanced wins on median score and that neither extreme is dominant. Assert no shift is unwinnable (score > 0 achievable in 100% of seeds) and that a perfect score is achieved in < 2% of runs.

---

## 8. BUILD ORDER AND TIME BUDGET

### If you are a single instance (4-hour block)

| Time | Task |
|------|------|
| 0:00–0:20 | Shared scaffold: CONFIG/RNG/SAVE/TEST/manifest/SW as a reusable template file. Do this once, copy for each game. |
| 0:20–1:40 | **DEEPWELL** complete + sim sweep + 80 assertions. |
| 1:40–3:10 | **BLACKOUT** — solver first, generator second, UI third. Do not start the UI until 10,000 cases verify unique. |
| 3:10–3:50 | **PARALLEL** — BFS solver, generate and embed 60 levels, minimal UI. |
| 3:50–4:00 | Final pass: run all harnesses, write per-game header notes, update this HANDOFF with actual tuned numbers and known gaps. |

Games 4–6 do not get built in a single 4-hour block. Do not start them. Leaving three polished games is the win condition.

### If you are running parallel instances

One game per instance. Every instance reads Sections 1–3 (shared conventions) and its own game section only. Do not share state, do not import from each other, do not coordinate. Each produces a standalone `index.html` + `sim.js`. Merge is just copying six folders.

**Recommended parallel assignment:** DEEPWELL and BLACKOUT get the two strongest instances (most logic). PARALLEL needs the solver written carefully. WIREWORM, SIEGE, and LAST CALL are the most self-contained and least risky.

### Order of operations *within* a game (all six)

```
1. CONFIG + DATA tables         (numbers first, they're already in this doc)
2. SIM layer, pure functions    (no DOM, no rendering)
3. TEST harness against SIM     (write assertions BEFORE the UI)
4. sim.js + balance sweep       (fix numbers before drawing anything)
5. VIEW layer                   (now that the game is known-correct)
6. INPUT + SAVE
7. Polish: audio, motion, share string
```

**Do not build the UI first.** Every one of these games is a state machine with a skin. Building the skin first means tuning by feel, which is the failure mode this entire document exists to prevent.

---

## 9-RESULT. THE BLOCK REPORT (filled in 2026-08-16)

**Five of six SHIPPED AND LIVE** at `lucidwinds.com/satellites/<id>/`, all five carded in the
portal `FEATURED` array as `beta:true`. LAST CALL was parked by Stephen before the block began
and was never started. Deploy commit `e8dfd0cd`, verified live by grepping production HTML for a
content marker rather than trusting a 200.

| Game | Status | Assertions | Balance verdict |
|---|---|---|---|
| DEEPWELL | SHIPPED | 229 / 0 failed | 5 of 7 bounds hit, 2 missed and reported |
| BLACKOUT | SHIPPED | 253 / 0 failed | 10,000 cases, 100% unique, 0.01% retry |
| PARALLEL | SHIPPED | 140 / 0 failed | 60 of 60 levels BFS verified, tier slope +6.54 |
| WIREWORM | SHIPPED | 205 / 0 failed | 2 bands missed low, reported not tuned |
| SIEGE OF ONE | SHIPPED | 193 / 0 failed | all 7 sweep gates green |
| LAST CALL | NOT STARTED | n/a | parked by the Director |

**1,020 assertions, zero failing.** Every suite runs headless: `node satellites/<id>/sim.js --test`.

### Spec numbers that turned out wrong under simulation

- **§3.7 full clear is 11,400. It is not.** The spec's own upgrade formula sums to **15,253**.
  At that price a median player needs ~216 runs, not the stated ~25. DEEPWELL shipped the real
  number. The root cause of both missed DEEPWELL bounds is one thing: the pack fills before the
  air gets frightening, so a careful player and a perfect player play the same game. Next lever
  is `PACK_BASE` 40 down to ~28.
- **§3.6 hazards make depth 200 unreachable by construction.** 44 nodes of specced hazard rates
  average 13.4 integrity of damage against a maximum of 6 braces. Resolved using §3.6's own
  "unless prevented by gear" clause (`BRACE_SHRUG_PER_LEVEL 0.25`); no specced hazard rate or
  damage value moved.
- **§6.6's random-agent band of 60 to 200 ticks contradicts §6.2's own 20x20 grid, and this is
  now PROVEN rather than argued.** A plain random walk with the entire game deleted medians 54
  ticks, and the random agent inside the fully running game also medians 54. The band is the
  envelope of a 22 to 40 cell board. **Corrected value: 54 ticks.** Separately, DISCHARGE_INTERVAL
  turned out to be under swept rather than a dead lever (the greedy band is reachable at 25 or
  lower); it was still declined, because a valve that frequent deletes the oldest circuit faster
  than a board filler can build the next one, which would buy the gate by destroying the overload
  win condition. That win condition is also now measured for the first time: a filling agent
  medians 1616 against the chaser's 681 and trips the breaker in 51% of runs against 2%.
- **§3.5 mining "2 depth-ticks" contradicts the 5 level Drill upgrade** (it would dead end at
  level 2). Cost now scales with ore tier, per the plan's ruling.
- **§1.1's Blob URL service worker does not work.** Chrome rejects blob: registrations, so that
  path silently ships no offline support. All five use real `sw.js` files with per game cache
  prefixes.

### What the verification actually caught (the case for building this way)

- **WIREWORM had a genuine soft lock.** The worm could seal itself into a pocket where no
  terminal was reachable and no discharge pickup could legally spawn, so the run could never end.
  Found by its own "every run ends" assertion. Fixed in SIM, with the regression assertions
  written *before* the fix.
- **DEEPWELL's harness opened at 218 passed / 10 failed and four of those reds were real bugs**,
  including a shrine bargain that could eject the player out of the shaft entirely.
- **PARALLEL watched 17 gates fail on purpose and found 3 that could not fail at all**, then
  fixed the gates rather than banking the free green. One was a missing assertion: its crumble
  fixture could not tell "breaks when you leave" from "breaks instantly".
- **The LOOKING pass found what 8 of 8 green checks could not:** PARALLEL's mirror seam was
  painting *underneath* the opaque tile layer, so the defining feature of the game only showed
  through gaps. WIREWORM's combo canvas kept its intrinsic 104px inside a 52px wrapper, so the
  HUD rendered as `best ) 17 ticks`. DEEPWELL's AIR TO SURFACE bar read completely full when the
  ascent cost was zero, teaching danger at the safest moment in the game.

### Known gaps, honestly

- **No human has played any of these.** Verification is not playtesting; that is why all five
  shipped `beta:true` behind the tester gate.
- BLACKOUT and SIEGE got their LOOKING pass in the last minutes of the block, phone and desktop.
  Both hold up. BLACKOUT ships its generated case title, the pocket watch action dial, room access
  hints on the room list, and procedural suspect silhouettes that carry the attributes the
  sighting clues refer to. SIEGE opens on a clean title card with a findable BACK TO THE ARCADE.
  **One defect found and not yet fixed: BLACKOUT truncates its generated case title in the
  header** ("THE EVENING BUSINE..."), which is the most identity carrying string in the game.
  It needs to wrap or shrink to fit. Left unfixed rather than making an unverified edit to a live
  page with the block ending; it is cosmetic and the game is dev gated.
- No builder ran a browser at all, by instruction, so every UI is node verified plus the main
  loop's own boot and tap probes.
- WIREWORM's overload playstyle has no sweep coverage: no agent steers for the breaker, so half
  of §6.5's design is unmeasured.
- PARALLEL's level select stars are 54px but sit 33 to 40px apart, so neighbours overlap.

---

## 9. WHAT TO REPORT BACK

Update this file in place when the block ends. For each game attempted:

- Status: SHIPPED / PARTIAL / NOT STARTED
- Assertion count and pass rate
- Sim sweep output table (actual numbers, pasted)
- Any CONFIG value that had to move from the spec, and why
- Known gaps and the single next thing you'd do
- Line count and approximate load-time

If a spec number in this document turned out to be wrong under simulation, **say so explicitly and give the corrected value.** That's the most valuable thing in the report.

---

## 10. HARD CONSTRAINTS RECAP

- Single file. No dependencies. No network at runtime.
- No `Math.random` in SIM or GEN.
- SIM never touches the DOM.
- ≥80 assertions per game, all passing.
- Balance resolved by simulation, not by feel.
- Every generated puzzle/case verified solvable before it reaches a player.
- Ships offline on a phone in portrait.

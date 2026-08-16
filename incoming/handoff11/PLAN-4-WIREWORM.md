# PLAN 4 — WIREWORM (build fourth)

Spec: HANDOFF-11.md §6 (rules §6.2, decision §6.3, colors §6.4, relief valves §6.5, verification §6.6).

**Target:** `satellites/wireworm/` · accent electric lime `#a3e635` · portal card `cat:"action"` · ic 🐛 (record final pick).

## Spec ambiguities — RESOLVED

1. **A circuit is the chronological trail slice, not a pathfind.** The trail is an ordered list of visited cells. Touching terminal T1 of color X while uncharged sets `charge = {color:X, sliceStart: trailIndex}`. Touching T1's match completes the circuit: every trail cell from `sliceStart` to now becomes energized (self-crossings and revisited cells energize too — a cell is energized if ANY energized slice contains it). This is what "the path traced between them" (§6.2) means; the §6.6 circuit-detection tests target exactly this slice semantics.
2. **Touching a DIFFERENT color's terminal while charged swaps the charge** (new color, sliceStart resets to here). The old partial path stays as dead trail. One charge at a time; a small charge chip on the worm's head shows the held color.
3. **Touching your own already-touched terminal again**: no-op. Terminals are consumed only when their circuit completes; the completed pair despawns and a replacement pair spawns (keeping 2 pairs on screen at all times, §6.2) by the §6.4 weights — red pairs spawn maximally far apart (compute the max-min-distance pair of free cells), green close (≤6 cells apart).
4. **Death = hitting energized wire or the grid edge** (§6.2 "or a wall" = the boundary; there are no interior walls). The worm has no body-collision — dead trail is explicitly passable; the worm IS the trail head.
5. **Terminals never spawn on trail**, energized or dead, and never inside a fully enclosed energized region unreachable from the worm's head (flood-fill check from the head; same check for the discharge pickup — that is the §6.6 "unreachable cell" gate).
6. **Discharge pickup (§6.5):** de-energizes the OLDEST living circuit AND deletes its wire cells from the board entirely (cells belonging to another still-energized circuit stay). Spawns every ~90 ticks (TUNE), never adjacent (8-neighborhood) to energized wire, at most 1 on screen.
7. **Overload (§6.5):** when energized cells > 55% of the 400-cell grid, ALL circuits discharge, bonus `energizedCells × 5`, and every wire cell on the board is DELETED — the board resets to open space with the worm, terminals, and score intact ("clears to bare trail" reads ambiguous; full clear is the one that makes overload a strategy worth steering into — record as the interpretation). Combo is preserved through an overload.
8. **Combo (§6.2):** ladder ×1 → ×1.5 → ×2 → ×3 → ×4 (cap), increments if the completion is within 40 ticks of the previous, resets to ×1 otherwise. A visible combo timer ring drains over the 40 ticks.
9. **Score** = `circuitLength × colorMultiplier × comboMultiplier`, floored to int. Daily mode: daily seed drives terminal spawns; share string (no dashes): `WIREWORM day 142: 4,380 in 214 ticks`.
10. **Tick loop lives in VIEW/BOOT; SIM is `step(state, turn)` per tick** with `turn ∈ {-1, 0, +1}` (relative, §6.2). Speed ramp (220ms → −4ms per circuit → floor 90ms) is applied by the driver from `state.circuitsCompleted` — SIM stays time-free.

## SIM API

```js
newGame(seed) -> state        // 20×20, worm at center, 2 pairs spawned
step(state, turn) -> {state, events}   // move 1 cell, resolve touch/complete/death/spawns/overload
// events: moved, charged, completed{cells,score,combo}, discharged, overload{bonus}, died{cause}
```

## Build phases (commit + push after each)

1. **CONFIG + RNG + SIM.** Everything above; grid as a flat Uint8Array of cell states (empty / dead-wire / energized / terminal / pickup) plus the ordered trail list and circuit records.
2. **TEST harness (before UI), ≥80 assertions:**
   - The §6.6 circuit battery: 1,000 synthetic trail shapes (scripted turn sequences from a seeded generator) — assert the energized slice matches a brute-force reference computed from the recorded trail indices; include self-crossing and revisit shapes by construction.
   - Energized count never exceeds grid size; overload fires exactly when crossing 55% and fully clears; discharge always reachable (flood-fill assert); terminals always land on legal cells; red-pair min distance ≥ TUNE floor.
   - Determinism ×500: same seed + same turn script → identical score and final grid hash (§6.6).
   - Save round-trip (best score, best combo, settings — no mid-run resume, §1.4); corrupt save recovery; 5,000-input fuzz (random turns until death, restart, repeat; no exceptions, no negative/NaN).
3. **sim.js — the §6.6 balance sweep:** 20,000 runs, two agents: random-walk (uniform turn, but never turn into certain death if a safe option exists) and greedy (BFS to the matching terminal avoiding energized cells and the edge; recompute each tick). Gates: random median run 60–200 ticks; greedy median 300–900; greedy > 2,000 means too safe → raise speed ramp or spawn pressure (move CONFIG, not gates). Print score distributions per agent. Watch it fail first (set the tick-speed ramp to zero and see greedy blow past 2,000).
4. **VIEW.** Canvas. Dead trail dim gray-green; energized wire BRIGHT lime with a 2px glow and a distinct dash pattern (never color alone — colorblind law); terminals as filled rings in their color WITH a per-color glyph inside (again not color-alone). Score + combo ring top, safe-area padded. Worm head has a directional face.
5. **INPUT.** Tap-halves (left half = turn left, right half = turn right) AND horizontal swipe; both zones full-height, way over 48px. Keyboard ←/→ bonus. This is the one game where input latency is feel-critical: read input into a 1-slot queue applied at the next tick, and assert in TEST that a queued turn is never dropped or doubled.
6. **Polish.** Rising hum while charged (WebAudio osc, pitch by color multiplier), zap arpeggio on completion scaled by combo, big dumb chord on overload. Death shows the final board with your circuits lit ("look what you built" is the retention beat). `prefers-reduced-motion` kills glow pulse and shake.
7. **SW + manifest + icons; portal card + thumb + LOOKING pass + deploy + live grep** per README. Suggested ds: "Snake where your trail is live wire and every circuit you complete becomes part of the maze that kills you."

## Known risks

- The greedy sim agent is load-bearing for balance: if it's dumb (walks into pockets), the 300–900 gate passes for the wrong reason. Sanity: print 3 sample greedy runs as ASCII frames and LOOK at them before trusting the sweep.
- Slice semantics + discharge deletion interact: a cell in two energized circuits must stay energized when only the older circuit discharges — this exact case goes in the TEST battery.
- 20×20 on a 390px canvas = 19px cells — readability is the stated core risk (§2). The LOOKING pass must confirm energized vs dead wire is unmistakable at arm's length on the phone screenshot, and at desktop width the canvas must stay centered with letterboxing, not stretch.

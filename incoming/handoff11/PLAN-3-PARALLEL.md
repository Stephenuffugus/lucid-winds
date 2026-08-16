# PLAN 3 — PARALLEL (build third)

Spec: HANDOFF-11.md §5 (rules §5.2, generator+solver §5.3, tiers §5.4, verification §5.5). Build the SOLVER FIRST, before the generator, before any UI (§5.3's own instruction).

**Target:** `satellites/parallel/` · accent violet `#8b7cf6` · portal card `cat:"puzzle"` · ic 🪞 (record final pick).

## THE ONE RULE THAT SAVES THIS BUILD

**The solver and the game call the SAME transition function.** `stepWorld(state, input, level)` lives once in SIM; BFS imports it; the playable game imports it; the fuzzer imports it. Two implementations of movement WILL drift and every "solver-verified" claim becomes a lie. If you find yourself writing movement logic twice, stop.

## Movement semantics — RESOLVED (the spec never defines what UP does on a grid; implement exactly this)

Order of a single input tick:
1. Resolve each avatar's move (A gets the input; B gets the horizontal mirror of LEFT/RIGHT; UP and WAIT identical for both). Avatars resolve simultaneously from the pre-tick state; if both would enter the same cell they both stay (record this collision rule visibly in a comment).
2. **LEFT/RIGHT:** move 1 cell if target is passable. If target is a wall but the cell above the wall AND the cell above the avatar are both free, step up onto it (mantle, 1 high max — same MANTLE RULE the chameleon repo landed on). Otherwise no-op for that avatar only (blocked no-ops are the whole puzzle, §5.2).
3. **UP (jump):** if the cell above is free, rise 1 and set that avatar `airborne`. An airborne avatar ignores gravity for exactly ONE subsequent input (so UP then LEFT clears a 1-gap and lands on a 1-high ledge; 2-high walls are unclimbable). Any input while airborne clears the flag after it resolves.
4. **Ice:** an avatar that ends its horizontal move on ice keeps sliding in its move direction until the next cell is not enterable (wall/edge) or it leaves ice. Sliding happens within the same tick, before gravity.
5. **Gravity:** after moves resolve (and airborne flags are spent), both avatars fall until supported. Falling through a spike cell = death. There is no fall damage.
6. **Tile triggers**, in the cell an avatar ends the tick in or passed through while falling: spike = death (instant restart, one tap, <200ms, §5.2); key = collected (sets bit, opens matching door tiles); crumbling floor = marked broken AFTER the avatar leaves it (1 traversal, §5.2); one-way plate = enterable only in its arrow direction (treat as wall from other sides).
7. **Win check:** A on exit-A AND B on exit-B after gravity settles, same tick.

State = `(ax, ay, bx, by, airborneA, airborneB, keysMask≤3 bits, brokenMask≤5 bits)` — pack into one integer (coords 4 bits each on ≤12×12). Ice adds no state (slides resolve within the tick). Death states are terminal, pruned in BFS.

## Solver + generator (§5.3, kept, with these concretions)

- BFS over the 4 inputs with a `Set` of packed ints, returns shortest solution (input string) or null. Budget cap: 2M states visited → treat as unsolvable (log it).
- **Greedy agent** (the fails-the-corridor-check, §5.3): at each state, pick the input minimizing A's Manhattan distance to exit-A, ties broken LEFT<RIGHT<UP<WAIT, 4× solution-length step cap, must NOT reach the win state.
- **Desync-moment check:** at least one state on the found solution path where the input moved exactly one avatar.
- Wall-minimize pass verbatim from §5.3 (remove wall → still solvable at SAME length → keep removed).

## Level pipeline — 60 levels generated OFFLINE, embedded as data

Write `gen.js` (node, shares the SIM via the marker extraction like sim.js) that generates all 60 levels per the §5.4 tier table from master seed `0x50415241`, emits them as a compact encoded string array to paste into DATA. **Do not generate the 60 at runtime** (§5.4 — everyone gets the same levels). Encoding: `w,h,` + RLE of tile codes, with a decode function in SIM; round-trip asserted (§5.5). Rerunning `gen.js` with the same seed must reproduce the array byte-for-byte — assert that too (this is the drift alarm for the shared step function).

Daily mode: one tier-4 level generated AT runtime from the daily seed (same generator, verified by the same BFS before presenting — if the daily seed fails generation within 300 attempts, fall back to attempt-index salting; never show an unverified level). Share string (no dashes): `PARALLEL day 142 solved in 23 moves, 4 deaths`.

## Build phases (commit + push after each)

1. **SIM core:** tiles, packing, `stepWorld`, win/death checks. Hand-build 6 tiny fixture levels (one per mechanic: mantle, jump-gap, mirror-desync, key/door, crumbling, ice) and assert exact scripted outcomes on each — these fixtures are the movement-semantics contract, write them BEFORE the solver.
2. **BFS solver + greedy agent + desync check** against the fixtures (known shortest lengths asserted).
3. **Generator + minimizer + `gen.js`;** generate the 60, embed. Gates (§5.5, all in `sim.js --verify`): all 60 solve via BFS at embedded solution length; all 60 fail greedy; lengths inside tier bands; positive slope on the tier-length line fit; encode/decode round-trip. Watch it fail first: corrupt one embedded level string and see the gate go red.
4. **In-page TEST** (≥80): fixtures + determinism + save round-trip (progress = highest level + per-level best moves/deaths; no mid-level resume, §1.4) + corrupt save + the §5.5 fuzz (5,000 random input sequences × 10 sample levels, no exceptions, state stays inside the grid, masks stay in range).
5. **VIEW.** Flat high-contrast grid, A and B visually distinct beyond color (shape + label, colorblind law). Both avatars animate the same 120–150ms slide. Level select = a simple 60-cell grid with tier coloring and best-moves stamps. Restart button and swipe-anywhere input zones ≥48px; controls: on-screen ◀ ▲ ▶ ⏸(wait) buttons AND swipe; keyboard arrows + space(wait) as bonus.
6. **INPUT + SAVE + daily mode.**
7. **Polish:** move tick sound, death thud, win chord; deaths are cheap and instant (§5.2). `prefers-reduced-motion` respected.
8. **SW + manifest + icons; portal card + thumb + LOOKING pass + deploy + live grep** per README. Suggested ds: "Two of you share one set of controls and both have to reach the door at the same moment."

## Known risks

- Generation yield at tiers 4–5 is the schedule risk: accepting only greedy-failing, band-length, desync-having levels may need hundreds of attempts per accepted level. That cost is paid OFFLINE in gen.js, so it's fine — but budget it (log attempts-per-accept; if tier 5 exceeds ~2,000 attempts/level, loosen wall density range, not the acceptance gates).
- The airborne flag is the likeliest solver/game drift point — it is why the fixtures in phase 1 exist. Any change to movement semantics after levels are embedded REQUIRES regenerating and re-verifying all 60.
- 12×12 grid at 390px width = 32px cells; fine for viewing, but never make cells themselves touch targets.

## Signature craft

- **Key: E minor. The audio IS the sync state (the standout):** two soft detuned voices, one per avatar, a fifth apart. While the pair moves in mirror they sound consonant; every desync moment (a move that affects exactly one avatar — the SIM already emits this event for the solver check) bends one voice a half step until they re-sync. Players will FEEL desync before they can articulate it. This is one oscillator pair and an event listener, and no other puzzle game on the portal sounds like it.
- **Par scores from the solver (the other standout):** the BFS optimum is already computed for all 60 levels — embed it. Level complete shows "you 27, best possible 23"; matching par earns a star on the level-select map. Nobody shipping procedural puzzles shows provable par; we can because we wrote the solver. TEST-assert every embedded par equals a fresh BFS run in `sim.js --verify`.
- **The mirror seam:** a faint vertical shimmer down the level's mirror axis. Avatar A in the accent violet, avatar B in the warm highlight, DIFFERENT SHAPES (circle vs diamond) with tiny A/B glyphs — colorblind law, and it matters double here because the whole game is telling twins apart.
- **Death is a rewind, not a punishment:** 150ms desaturating smear back to start, deaths counter ticks up quietly, input stays live the entire time (<200ms law). Optional ghost: last attempt's paths as dotted trails (settings toggle, default on until first clear of the level, then off).
- **Win moment:** both exits pulse once in phase, the two voices land on a unison, 25ms haptic. Sixty of these must not get old, so keep it under a second and never modal until the player taps next.
- **Level select as a constellation:** five tier-clusters of stars, lines connecting cleared levels, par-stars glowing brighter. Progress reads as a sky filling in, on-brand for the studio, and it's just SVG dots and lines.
- **Best-run replays** per level from the input log (CRAFT.md C): tap a cleared level's star to watch your best solution. The replay doubles as the "how did I do that" memory aid at tier 5.
- **Daily share** includes the seed link; the shared level opens in daily mode for the recipient with your moves/deaths line shown as the bar to beat.
- Cut-last order: sync audio > par stars > mirror seam and avatar shapes > rewind death > constellation select > ghosts > replays.

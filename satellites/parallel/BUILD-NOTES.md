# PARALLEL — build notes

**Status: SHIPPED.** 60 of 60 levels generated, embedded and solver verified.
Game ID `parallel`, accent violet `#8b7cf6`, portal category `puzzle`, icon 🪞.

| Gate | Result |
|---|---|
| `node sim.js --test` | **PASSED 140 / FAILED 0** (140 assertions), exit 0 |
| `node sim.js --verify` | **VERIFY PASSED**, all §5.5 gates over 60 levels, exit 0 |
| `node sim.js --grep` | PASSED (no `Math.random` or page objects in SIM, script tags balanced, no dashes in copy) |
| `node gen.js --check` | **REPRODUCIBLE** byte for byte from seed `0x50415241` |
| Script block syntax | parses clean under `vm.createScript` (1712 lines) |
| Service worker | `parallel-` prefixed, `node --check` clean, activate deletes only its own prefix |

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

Total 18.9s for all 60. **Yield was the named schedule risk and it did not
materialise**: tier 5 needed 63.9 attempts per accept against a 2000 budget, so
the wall density ranges were never loosened and no acceptance gate was touched.

Tier vs solution length line fit slope **+6.54** (must be > 0).

## Verification table (all 60, from `--verify`)

Every level: BFS solves it, fresh BFS length equals the embedded par, greedy
agent fails, a desync moment exists, codec round trips, band respected.

| Tier | Levels | Band | Min | Max | Mean |
|---|---|---|---|---|---|
| 1 | 10 | [4,10] | 6 | 10 | 8.1 |
| 2 | 12 | [8,18] | 8 | 17 | 13.3 |
| 3 | 13 | [14,26] | 14 | 25 | 18.7 |
| 4 | 13 | [20,36] | 20 | 34 | 24.9 |
| 5 | 12 | [30,55] | 30 | 49 | 34.8 |

BFS states explored per level range from ~200 (tier 1) to ~73k (tier 4/5).
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
`clamp(62px,13vh,118px)` tall and one quarter of the app width each
(~86px at 375), so **86 x 86 minimum**. Header, restart, sheet close and toggle
buttons are all `min-width:48px; min-height:48px`. Win card buttons `min-height:48px`.
Level select stars carry a transparent 26px diameter hit circle on top of the
visible 6 to 11px star; that is the one control **under 48px** and it is a known
gap, listed below.

## Known gaps

1. **No browser has run this.** I was instructed not to run puppeteer (five
   agents on a 2 core box). Everything above is node verified plus a desk check
   of the layout maths. The `?test=1` panel, the audio graph, touch handling and
   the constellation SVG have not been seen in a real browser by me.
2. **Level select star hit area is 26px, not 48px.** Needs to become a 48px
   invisible circle or a list fallback.
3. Phone vertical slack ~214px below the board, inherent to a square board in
   portrait at 390px. Would need a landscape layout or a non square board to fix.
4. No install nudge after first clear (CRAFT E) and no last 10 runs history
   screen (CRAFT C). Stats are collected, just not surfaced.
5. Icons are referenced but not created here (main loop owns all five).
6. No Sunbeam earn wiring, per the handoff11 deviation list.

## Next thing

Run it in a real browser at 390x844 and 1280x800, confirm the seam and the board
fill read as intended, then fix the level select star hit area to 48px.

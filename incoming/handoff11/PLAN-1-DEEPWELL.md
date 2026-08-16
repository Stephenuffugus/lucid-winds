# PLAN 1 — DEEPWELL (build first)

Spec: HANDOFF-11.md §3 (all tables live there — resource table §3.3, strata §3.4, ore §3.5, nodes §3.6, shrines §3.6, upgrades §3.7, balance envelope §3.8, feel §3.9). Read §3 completely before writing code. This plan resolves the spec's ambiguities and sequences the build; the numbers stay in the handoff.

**Target:** `satellites/deepwell/` · accent amber `#f0a742` · portal card `cat:"action"` (confirm the tag exists; fall back to whatever the closest existing tag is) · ic 🪨 or ⛏️ (pick one, record it).

## Spec ambiguities — RESOLVED (implement exactly this, note deviations in the report)

1. **Movement is node-to-node, not per-meter taps.** The world is a generated column of nodes (one per 3–6 depth, §3.6). DESCEND advances to the next node, charging per-depth drains for the gap (air 1/depth, lamp 1.5/depth, strata modifiers applied per the band each meter falls in). The depth odometer animates through the gap; the decision points are the nodes.
2. **Ascent is one commitment.** Tapping ASCEND surfaces you in one continuous move; no stopping at nodes on the way up. Cost is charged per depth: air `1 + weight/20` per depth (×1.4 in Wet Shelf bands passed through). This keeps "AIR TO SURFACE: 34 / 51" honest and the turn-around decision singular. The live readout is computed by the SIM (`ascentCost(state)`) and shown at ALL times — never hidden, per §3.2.
3. **Mining cost scales with ore tier.** Spec says veins take "2 depth-ticks" but gives Drill 5 levels of "1 less tick", which would dead-end at level 2. Resolution: mining a vein costs `oreTier` ticks of resources (tier 1 = 1 tick … tier 5 = 5 ticks), Drill −1/level, floor 1 tick. A tick = the drain of 1 depth of descent at current strata. This makes deep veins heavier decisions and all 5 Drill levels real. Flag this in the §9 report as a spec correction.
4. **Weight cap is hard.** Mining that would exceed the cap is blocked with the reason shown; dropping any cargo item is one tap, always available (§3.5 — the drop-gold-for-beryl moment is the game's best feeling, make the drop list show value AND weight AND value/weight).
5. **Uranite's lamp drain (3/depth while carried)** applies during BOTH descent and ascent, stacking per uranite carried.
6. **Heartstone**: spawn eligible only at depth ≥141, max one per run (a run flag), always in a vein by itself.
7. **Lamp below zero**: lamp clamps at 0; while at 0, node contents render as "?" until the player commits (mines/enters). Not death (§3.3).
8. **Integrity 0 ends the run immediately, cargo lost, cash banked so far kept.** Air 0 mid-ascent: cargo lost, player surfaces alive, keep banked cash and upgrades. Both show EXACTLY what was lost and its value (§3.9 — twist the knife).
9. **Run resume**: DEEPWELL saves in-progress run state (HANDOFF §1.4 allows it). Save on every node decision. On load with a live run, offer RESUME or ABANDON (abandon = cargo lost, honest).
10. **Shrines**: implement all 12 bargains from §3.6 verbatim, always show exact numbers, offer exactly 1 per shrine node, accept/decline. Bargain 12's +10% hazard rate is additive to band rate for the rest of the run.

## SIM API (pure, zero DOM — this exact shape makes sim.js trivial)

```js
// between // ---- SIM_EXPORT_START ---- and // ---- SIM_EXPORT_END ----
newRun(rng, upgrades) -> state            // generates the node column lazily as you descend
visibleNodes(state) -> [...]              // respects lamp-blind and Assay upgrade
ascentCost(state) -> {air, perDepth}      // the number on screen at all times
actions(state) -> ['descend','ascend','mine','drop:<i>','shrine:accept','shrine:decline']
step(state, action, rng) -> {state, events[]}   // the ONLY mutator; events drive VIEW + audio
runOver(state) -> null | {reason, lostCargo, banked}
shopBuy(save, track) -> save              // cost = base × 2.1^level, tracks/caps per §3.7
```

Node generation is seeded per run (`makeRNG(runSeed)`); daily-challenge mode reuses the same code with the daily seed and a fixed upgrade loadout (everyone digs the same well). Node column generated deterministically from the seed as depth increases — depth D's node must not depend on player choices, only on the seed (needed for the reveal shrine bargain #5 and Assay).

## Build phases (each ends with a commit + push)

1. **CONFIG + DATA + RNG.** Every table from §3 as frozen objects. `TUNE` values start at the given starting points (pocket refill 25–40).
2. **SIM.** The API above. No DOM references anywhere in the layer — grep for `document|window|canvas|performance` inside the markers as an assertion.
3. **TEST harness (before UI).** ≥80 assertions. Must include, beyond the §1.5 mandatory set:
   - RNG determinism: same seed + same action script → deep-equal final state (run 3 scripted policies).
   - Ascent-cost invariant: after every step, `ascentCost` equals the brute-force per-depth sum.
   - Weight cap never exceeded; drop always legal; mining blocked at cap.
   - All 12 shrine bargains: apply each to a synthetic state, assert exact numeric outcome.
   - Strata modifiers: lamp ×2 in Dark Seam, air ×1.4 in Wet Shelf, 2-integrity hazards in The Glass, Below's escalating hazard rate.
   - Heartstone: 10k generated columns, never 2 per run, never above depth 141.
   - Save round-trip incl. mid-run resume; corrupt JSON in `lw_deepwell_v1` → fresh save, no throw.
   - Fuzz: 5,000 random-legal-action runs, no exceptions, no negative resources, no NaN anywhere in state (walk the object).
4. **sim.js + the §3.8 sweep.** Extract via markers, implement the three policies EXACTLY as defined (Greedy / Cautious 60% / Optimal break-even+10%), 50k runs each, print the table: cargo-loss %, banked cash percentiles, session length estimate (count decisions × ~4s + travel depth × ~0.15s as the time model — state the model in the output), depth-200 reach % unupgraded vs full. **If a bound misses, move CONFIG, not bounds** (§3.8). Also sweep the ~25-runs-to-full-clear economy target (§3.7) with the Cautious policy as "median player". Paste the final table into the §9 report AND into the game's header comment.
5. **VIEW.** Portrait canvas or DOM column. Depth odometer is the biggest element (§3.9). One screen: odometer, air/lamp/weight/integrity bars, AIR TO SURFACE readout, current node card, action buttons (≥48px), cargo drawer with one-tap drop. Ascent animates 2× descent speed.
6. **INPUT + SAVE.** Taps only; keyboard bonus (↓ descend, ↑ ascend, m mine).
7. **Audio + polish.** The single rising-dissonance tone driven by `air − ascentCost` margin (§3.9) — WebAudio oscillator pair whose detune widens as margin narrows, silent when comfortable. Death/loss screens itemize the lost cargo. Share string (no dashes): `DEEPWELL day 142: banked 312 at depth 87` style. `prefers-reduced-motion` kills the shake.
8. **SW + manifest + icons** per README deviations 1–2.
9. **Portal card + thumb + LOOKING pass + deploy + live grep** per README. Suggested ds: "Dig deep, carry too much, and decide when to turn around before the air decides for you."

## Known risks

- The time-model for "4–8 min median session" is an estimate, not a measurement — state the assumed seconds-per-decision in the sweep output so the number is arguable.
- Optimal-policy break-even math must use the SIM's own `ascentCost`, not a re-derivation (two implementations of the cost formula WILL drift — the sim policies import the same function).
- Watch the sweep gate fail first: temporarily set air drain to 0.1 and confirm Greedy's loss rate collapses below the 55–70% band before trusting the harness.

## Signature craft (see CRAFT.md for the shared standards; this is what makes DEEPWELL specifically sing)

- **Key: D minor.** Every pitched sound quantized to it. The game's soul is one sound: the air-margin tone — two sine oscillators at D3, detune spread driven by `1 − margin` (margin = `(air − ascentCost) / air`), gain fading in below 30% margin, fully silent above. At near-zero margin the beat frequency should be genuinely uncomfortable. Pickaxe hits are filtered noise bursts pitched UP by ore tier (slag thuds, voidglass rings); Heartstone landing in the bag gets a sub-octave D1 boom plus the `[30,40,80]` haptic.
- **The odometer is the protagonist.** Rolling digit drums, biggest element on screen (§3.9). Strata transitions recolor the shaft background and stamp the band name once ("DARK SEAM") as you cross. Your all-time depth record is a physical etched line in the shaft — descending PAST it triggers a single clean chime, a haptic, and the line redraws below you. Passing your own record must feel like an event, because it is the game's real win condition.
- **The greed ledger.** The cargo drawer sorts by value/weight and shows the ratio per item; when the player taps DROP on gold while holding beryl, fire a tiny approving glint (no text, no toast — the game noticing quietly). Loss screens itemize the manifest with values counting up one by one, then the depth it died at: "The beryl is still down there. 87m." Run history is styled as a mining company logbook: date, depth, banked, lost, one line each.
- **Live decision support, never automation:** alongside AIR TO SURFACE, show the delta preview on every action button — DESCEND shows the air/lamp it will cost, MINE shows its tick cost at the current strata. The player computes greed themselves (§3.2, informed tension); we just never make them do arithmetic.
- **Shrine bargains as full-screen cards** — parchment-dark card, the exact numbers huge, ACCEPT in gold and WALK AWAY in sage, both ≥48px. A declined shrine dims as you pass. Bargain outcomes append to the run log so the loss screen can say "took the devil's air at 63m."
- **Ascent is cinematic:** 2× scroll, passed nodes streaking by, the margin tone resolving to silence as you approach the surface with room to spare — or tightening if the player cut it close. Surfacing with cargo plays a banked-cash count-up in the shop.
- **Seed links:** the death/share card includes `?seed=` — "Dig the shaft that killed me." Daily = same door, daily seed, fixed loadout (already specced).
- **Replay/ghost:** input-log replay of your record run, watchable from the logbook (CRAFT.md C — free with the SIM).
- Cut-last order if time runs short: margin tone > odometer/record line > loss manifest > shrine cards > logbook > replay.

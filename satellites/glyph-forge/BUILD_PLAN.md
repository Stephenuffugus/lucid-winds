# Glyph Forge — Combat-Depth Overhaul (build plan)

Branch: `combat-depth-overhaul`. Goal: make the game *engaging and fun*, not just
balanced. Grounded in a 9-agent competition-research + audit pass (Balatro, Slay
the Spire, Monster Train, Into the Breach, Inscryption, mobile roguelite market
2024-26). Full synthesis archived in the session record.

## Diagnosis (the one-paragraph version)
Glyph Forge has a deep, juicy, **order-dependent scoring engine** (POWER+ → MULT+
→ XMULT×, Balatro-style) but almost **no game around it**: the enemy is a passive
HP counter that deals a fixed, varianceless number, so all 13 fights collapse to
"cast the biggest spell my hand allows," and a full heal between fights deletes
attrition. The multiplier that makes the engine sing (XMULT) is **invisible**
(the full damage breakdown is dev-gated), so the ~80% who never win literally
cannot learn the one thing that wins. Fix: **give the enemy agency the player can
READ and ANSWER** (telegraphed intent + a defensive Ward verb + persistent HP +
status), and **make the engine legible**. Most plumbing already exists unused
(`currentThreat`, `ignoreWard`/`trueDamage`/`burn`, the trace renderer, the
threat-meter anchor) — the work is wiring + tuning, not inventing.

## Discipline (every batch)
- One `index.html`, single `<script>`. `node test.js` + `node sim-run.js` green.
- New combat RNG uses seeded **offset** seeds `mulberry32(rngSeed + encIdx*PRIME +
  turn)` with a prime ≠ 7919 (the cast seed); never `Date.now`/`Math.random`.
  Re-derive identically in `sim-run.js` so the determinism assertion PASSES.
- Damage-math inside `resolveSpell`/`applyDepth`/`onSpellBound` auto-propagates to
  the sim; **run-loop** changes (armor/ward/status/heal) must be hand-mirrored in
  `sim-run.js` (`applyCast`, `enemyAttack`, `beginEnc`) and any asserted value in
  `test.js`.
- Save key `glyph-forge-v1` additive-only; backfill every new `run.*` field in
  `ensureRunDepth()`; guard new nested `meta.*` (loadState shallow-merges meta).
- New depth gated at run-construction / `beginEncounter` / behind `runHelp()` /
  Ascension — never inside `resolveSpell` — so tier-0 stays byte-identical where
  intended and veteran builds aren't flattened.

## Batches — ALL SHIPPED ✅ (branch `combat-depth-overhaul`)
- **A · Foundation** ✅ honest harness (sim no longer over-counts hand size).
  Re-baselined 56.0 → 49.1%.
- **B · Enemy Intent** ✅ telegraphed, tag-flavored intents (ATTACK / CHARGE→
  UNLEASH / MEND) in the threat meter; damage-neutral (49.1 → 49.7%), shared
  pure `lockIntent`/`executeIntent` so the sim measures real behavior.
- **C1 · Armor + pierce** ✅ tier-3+boss `armor`; `ignoreWard`/`trueDamage`
  revived (bypass it); HP-compensated to ~neutral (50.3%). (C2 status/attrition
  deferred — see backlog.)
- **D · Legibility** ✅ live POWER→XMULT→fluency breakdown, XMULT defined,
  turn-1 *shape*-pair coach, ASCENDED overkill. Pure display.
- **E · Sculpt + Boss + Surfacing** ✅ 3-phase Sovereign that reads your dominant
  element (47.1%), Forget-a-Glyph deck-thinning, transmutation chase chip.
- **F · Goals + polish** ✅ win-free Mastery goals (Detonator/Alchemist/Wayfarer),
  Sigil-picker taglines + Free-last, Final Page hidden +2 surfaced.

Final sim: **overall 47.1%** (band 30-55), all 7 Sigils in band, **determinism
PASS**, `node test.js` green. Build stamp `b17 combat-depth`.

## v1.1 backlog (deliberately deferred — scope/risk control)
- **Full status system** (Vulnerable / Weak / Poison) via 2-3 new runes — the
  defensive *answer* to the telegraph beyond Quake's stun, and Vulnerable-before-
  XMULT deepens the order puzzle. Greedy AI undervalues cross-turn statuses, so
  baseline-safe; design magnitudes by hand (StS-standard).
- **Revive `burn`** (Wildfire's promised DoT) — needs the DoT tick + death-during-
  enemy-turn handling; pairs with Poison.
- **Attrition** — cut the inter-fight +8 heal to a scarce, chosen resource so HP
  compounds. Highest balance risk; re-gate healing as reward choices first.
- **Champion-path accumulate** — `run.champion.path = i` overwrites; the spec
  tree should stack chosen branches (rewrite 6 `apply()` fns + re-sim).
- **Codex "Resonances" catalog** + **sequential rune-by-rune cast animation**.
- **Final relic/Sigil re-tune** (see balance debt above) now that combat systems
  are settled.

## Honest baseline (post Batch-A harness fix, greedy-AI, 100 runs/Sigil)
free 55 · ember 58 · order 65 · void 37 · tide 52 · zephyr 42 · umbra 35 —
**overall 49.1%** (band 30-55), determinism PASS. (Pre-fix overall was 56.0%;
void was the most inflated, 67→37, because it leaned on hand-size mechanics.)

## Balance debt (defer to final pass, after Batch C reshapes relic values)
- Relic spread is wide: Serpent's Coil / Unseen Hand / Riptide Knot ≈ **+26pts**
  (top), Whisper Glass **+3.3** (bottom). Don't tune now — `trueDamage`/`ignoreWard`
  relics (Storm Sigil etc.) are **no-ops until enemies get ward/armor** in Batch C,
  so values will shift. Re-tune relics + Sigils together at the end.
- `retrigger` is the AI default (57% of runs) but wins only 45.5%; xmult/mono win
  60-65% but are under-discovered — Batches D/E must teach + reward them.
- `singularity` (×hand size) / `pandemonium` (Σ hand basePower) top out weak in
  real play (hand shrinks to ~2 when you stage 3) — consider rescaling off
  `run.deck.length` during the final pass.
- **The Final Page is a trap** (relic delta −28pts). The sim previously ignored
  its hidden "+2 enemy damage/turn"; Batch B's shared `lockIntent` recoil now
  models it, exposing the relic as net-negative for optimal play. Final pass:
  surface the +2 in its description (Batch F) and/or re-cost it. Tidal Ledger
  (+28) / Riptide Knot (+26) remain the top end of the spread.

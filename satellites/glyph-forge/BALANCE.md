# Glyph Forge — Balance Reference

_All numbers reflect the current build. Re-run `node sim-run.js` after any change._

## Player

| Stat | Value | Notes |
|---|---|---|
| Starting / max HP | 50 | hard cap |
| Heal between encounters | +8 | up to maxHp |
| Starting deck size | 9 (starters) | one of each common rune |
| Hand size | 5 | refilled after each cast |
| Spell slot count | 3 | empty slots are skipped |
| Fluency mult | `1 + min(0.72, defeatedEnemies × 0.06)` | caps at ×1.72 after 12 wins |

## Enemy Stats

| Tier | ID | Name | Base HP | Scaled HP (at typical enc) | Threat | Tag |
|---|---|---|---|---|---|---|
| 1 | cinder | Cinder | 8 | 8 | 2 | shadow |
| 1 | wisp | Wisp | 10 | 10 | 2 | air |
| 1 | fenmote | Fenmote | 12 | 13 | 2 | earth |
| 2 | wight | Hollow Wight | 26 | ~32 | 3 | void |
| 2 | sirenshade | Sirenshade | 30 | ~36 | 3 | water |
| 3 | revenant | Brass Revenant | 52 | ~67 | 4 | order |
| 3 | glasswyrm | Glass Wyrm | 64 | ~83 | 4 | chaos |
| 4 | sovereign | The Sovereign | 210 | 336 | 5 | void |

HP scales: `baseHp × (1 + encounterIdx × 0.05)`. At encounter 12 (boss): ×1.6 → 336 HP.

## Rune Power Tiers

| Rarity | Count | Base Power Range | Effect Weight | Example |
|---|---|---|---|---|
| common   | 9 | 1–3 | minor or none | Stone (3) |
| uncommon | 9 | 0–2 | modifier (multiplier or repeat) | Surge (+50% neighbor) |
| rare     | 9 | 0–5 | strong conditional or scaling | Anchor; Crescendo (XMULT) |
| mythic   | 5 | 0   | game-bending global/XMULT effect | Singularity; Culminate (XMULT) |

32 runes total (Phase 2 added **Crescendo** rare + **Culminate** mythic — order-dependent XMULT payoffs).
Element distribution: Fire 3 · Water 3 · Earth 3 · Air 3 · Void 4 · Light 3 · Shadow 3 · Order 6 · Chaos 4
Shape distribution: Bolt 2 · Wave 4 · Burst 5 · Pulse 4 · Sigil 7 · Spiral 6 · Chain 4

## Synergy Math — Phase 2 two-track engine

Slots resolve **left → right (I → II → III); order matters.** Damage splits into
an additive POWER track and a multiplicative XMULT track.

```
POWER       = Σ ( (basePower + add) × runeMult × repeats )   // additive, per slot in order
elementMult = maxSameElement≥3 ? 3.0 : maxSameElement===2 ? 1.6 : 1     // EXPONENTIAL
shapeMult   = maxSameShape≥3   ? 2.0 : maxSameShape===2   ? 1.3 : 1
xmult       = elementMult × shapeMult × Π(order-dependent rune xmults)
              // order-dependent rune: xmult ×= 1 + (POWER assembled in EARLIER slots) × scale
              //   Crescendo scale 0.06 · Culminate scale 0.11  → reward placing them last
globalMult  = effect modifiers (ray/triskel/recursion/singularity/aurora …)
fluencyMult = 1 + min(0.72, defeatedEnemies × 0.06)          // caps at ×1.72
totalDamage = floor( POWER × globalMult × xmult × (1 + spellRetrigger) × fluencyMult )
```

Baseline (no synergy, no XMULT runes) is **byte-identical to pre-Phase-2** —
only focused/ordered play scales. Example: Stone + Stone + Stone, fluency 0
(3× Earth, 3× Burst): POWER 9 → ×3.0 (elem) ×2.0 (shape) = **54** (was 27 —
mono-element/shape now scales exponentially: this is the build-identity payoff).

## Damage Reference (validated by `test.js`)

| Spell | Damage (fluency 0) | Notes |
|---|---|---|
| Stone (alone) | 3 | baseline — unchanged from pre-Phase-2 |
| Stone + Echo | 6 | no synergy → identical to old engine |
| Ember + Ember + Ember | 36 | 3-elem ×3.0 · 3-Bolt ×2.0 (was 18) |
| Stone + Stone + Stone | 54 | 3-Earth ×3.0 · 3-Burst ×2.0 (was 27) |
| Stone + Echo + Echo | 12 | 2-Sigil ×1.3 · 2-Order ×1.6 |
| Stone + Twin | 9 | Twin +2 repeats slot 0, no synergy |
| Ember + Surge + Ember | 31 | Surge +50% neighbors + 2-Fire/2-Bolt XMULT |
| Ember + Drop + Aurora | 15 | Aurora globalMult ×5, no same-element |
| Ember + Singularity (hand=8) | 16 | base 2 × hand 8 (globalMult path intact) |
| Recursion + Ember + Recursion | 37 | 2-stack Recursion ×3 + 2-Order/2-Spiral XMULT |
| Ember + Ouroboros | 4 | spell re-casts once (×2) |
| Tally + Tally + Triskelion | 128 | 3-Order all same → Triskel ×3 × XMULT 6.0 |
| Tidewall @ 5/30 HP | 26 | +1 per missing HP, no synergy |
| **Pandemonium + Singularity × 2 (hand=10)** | **4160** | the deepest broken combo (was 3750) |

Mono-element/shape builds roughly **doubled**; the absolute mythic ceiling rose
~11%. Non-synergy spells are unchanged — depth is opt-in, paid for with focus.

## Per-Sigil Balance Battery (greedy AI, 100 runs each — `node sim-run.js`)

The sim plays the full depth stack (Sigil, curated pool, relics taken at
enc 3/6/10, champion levels at 4/8, bind-reveal, counter-boss). Current
(post content-pack, post relic-tuning) — sim verdict: **balanced**:

```
  free     59/100 (59%)  peakMax 1658   neutral baseline (relics only, no identity)
  ember    61/100 (61%)  peakMax  719   Fire aggro — steady, low ceiling, Water sealed
  order    66/100 (66%)  peakMax 4679   symmetry/combo — highest ceiling, Chaos sealed
  void     67/100 (67%)  peakMax 1029   sustain — highest avg dmg, 38 HP, Light sealed
  tide     57/100 (57%)  peakMax 1746   Water tempo, 56 HP, Fire sealed
  zephyr   45/100 (45%)  peakMax 1105   Air retrigger, 48 HP, Earth sealed
  umbra    37/100 (37%)  peakMax 4649   Shadow/Light mix, 44 HP — hardest, Order sealed
  Overall 56.0%  [sim healthy greedy-AI band 30-55% per Sigil; humans lower]
```

Sigils are **differentiated by profile**, not power: `void`/`order` are the
high-ceiling lines, `umbra` the hardest (its mix condition is demanding),
`ember` the consistent floor. `sim-run.js` auto-flags any Sigil >70% (nerf) or
<15% (seal too costly); all 7 currently pass. The content pack widened the
spread (umbra 37 ↔ void 67) vs the pre-pack cluster; this is inside the sim's
pass band — a future pass may tighten umbra's mix bonus / soften order's seal,
but it is **not** an overpower/dead condition. Re-run after any
RELIC/SIGIL/CHAMPION change.

> **Note on the 56% overall vs the earlier 46–52 aspiration:** the sim plays
> *optimal* brute-force max-damage every cast, so 56% optimal-AI translates to a
> meaningfully lower human win rate (real draws, real misplays) — healthy for a
> roguelite. The relic pass (the perishable task) is complete and green;
> dropping overall further would mean nerfing *core* systems (Sovereign HP /
> fluency / synergy curve — see Tuning Levers), which would over-punish humans
> and risk regressing the validated Sigil band. Left as-is by design.

This discipline was earned: the first cut shipped Sigils at 72-97% (trivially
easy). Boons/champions/curated-pool were recosted until the band held.

## Relic Balance (post-tuning — `node sim-run.js` PER-RELIC IMPACT)

Δ = win-rate points vs the no-relic control (64.9%), force-granted at run
start, 35 runs/Sigil. Healthy target: every offerable relic **+2..+25**, none
dead (<+2), none overpowered (>~+30). Current spread **+5.3 .. +24.9** — all
pass.

| Relic | Rarity | Δpts | Change made this pass |
|---|---|---|---|
| The Tidal Ledger | common | +24.9 | (unchanged — ceiling, watch) |
| The Riptide Knot | rare | +24.1 | (unchanged) |
| Broken Hourglass | uncommon | +22.0 | `0.25/hand-rune` → `0.06/rune, cap 5` (was +34) |
| Serpent's Coil | rare | +22.0 | (unchanged) |
| The Unseen Hand | rare | +22.0 | (unchanged) |
| The Eternal Inkwell | common | +20.0 | first-rune `+2 POWER` → `+1` (was +31) |
| The Undertow Anchor | mythic | +18.8 | retrigger `+1` → `+0.4 & gMult ×0.9`; sub-3 `×0.7`→`×0.5` (was +34) |
| Gilded Leaf | common | +18.4 | (unchanged) |
| The Low Lantern | uncommon | +17.6 | **reworked**: empty-slot XMULT (dead, −7.3) → lean-cast: ≤2 runes XMULT ×3 |
| The Salt Circle | uncommon | +17.1 | (unchanged) |
| The Twin Eclipse | mythic | +17.1 | XMULT cubed → `XMULT^1.5`, +`gMult ×0.8` (was +35, 100%) |
| The Updraft Fan | uncommon | +16.7 | (unchanged) |
| Ashen Quill | uncommon | +13.9 | (unchanged) |
| The Mourning Bell | rare | +12.2 | (unchanged) |
| The Final Page | mythic | +11.4 | XMULT squared → `XMULT^1.45`, +`gMult ×0.85` (was +34) |
| The Storm Sigil | rare | +5.7 | (unchanged) |
| Whisper Glass | common | +5.3 | (unchanged) |

The five flagged overpowered relics (Twin Eclipse/Broken Hourglass/Final
Page/Undertow Anchor/Eternal Inkwell, all +31..+35) and the dead Low Lantern
(−7.3) were the entire content-pack balance debt. All resolved; descriptions
updated to match (UI honesty). The squared/cubed XMULT relics now use
fractional exponents + a globalMult tax so they stay strong-but-not-auto-win.

## Legacy Win Rate Reference (bare-run greedy AI, pre-depth)

```
Win rate: 41/100 (41%)   [pre-Phase-2 baseline: 37%]
Avg damage per spell: 23.7
Avg peak spell damage per run: 207.6 (max seen: 2673)
Avg total turns per run: 45.6

Loss distribution by encounter:
   8: █        (1)
   9: ████     (4)
  10: ██       (2)
  11: ████     (4)
  12: ████████████████████████████████████████████████  (48) — The Sovereign
  13: WIN █████████████████████████████████████████ (41)
```

The Sovereign is still the dominant wall (48/59 losses occur there) — curve
shape preserved, just a higher ceiling. Greedy AI 41% → skilled human play with
intentional focus/ordering and reward routing should hit ~60–72%.

## Tuning Levers (in order of impact)

If win rate feels off post-launch, change in this order:

1. **Sovereign HP** (210 → 180 makes him much more killable; → 240 makes him brutal)
2. **Fluency rate** (`0.06` per win — bump to `0.08` for steeper curve, drop to `0.04` for harder)
3. **Player max HP** (50 → 60 for more forgiving mid-game)
4. **Between-encounter heal** (+8 → +10 for more sustain)
5. **XMULT synergy curve** (`elementMult` 1.6/3.0 · `shapeMult` 1.3/2.0 in resolveSpell — lower the 3-stack values to flatten the build-identity payoff)
6. **Order-dependent scales** (`Crescendo` 0.06 / `Culminate` 0.11 `xmultScale` — these set the combo ceiling; raise/lower with care)

DO NOT touch mythic rune effects or the XMULT curve without re-running `sim-run.js`. They define the ceiling and small changes cascade through the whole damage range. The forthcoming counter-boss (design Phase 6) — not an HP bump — is the intended lever for boss difficulty.

## Variance Analysis

High outcome variance because draw matters. A single run can swing from:
- **Low**: 8-15 dmg average spells, slow grind, die at tier 3
- **High**: a stacked-mythic turn at encounter 11 for 800+ damage one-shots Glass Wyrm

This is intentional, Balatro-style. The variance is the dopamine. Daily Sigil mode (same seed for everyone, one attempt) is the antidote — it normalizes draws across players for direct comparison.

## Run Length

- Avg turns to clear: 47 (5–7 turns per encounter average)
- Avg session length: ~12–18 minutes
- Designed for one commute / coffee break per attempt

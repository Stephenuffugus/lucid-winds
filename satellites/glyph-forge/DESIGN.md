# Glyph Forge — Design Document

## Pitch

**Glyph Forge** is a pocket roguelite deckbuilder where every spell you cast is a hand-built rune fusion. Two or three sigils combined, instantly resolved, big number on screen. Find combos that shouldn't work. Beat 13 encounters. The art is the dopamine.

Mobile-first, single-handed portrait play, single-file vanilla HTML/CSS/JS PWA. Ships installable.

## Pillars

1. **Tactile fusion**: every spell is composed in real time from your hand of runes. No card "play" abstraction — you SEE the spell assemble.
2. **Discovery as currency**: finding a combo names it forever in your codex. The codex IS the meta-progression.
3. **Big numbers feel like puzzles solved**: 1000+ damage spells exist but require you to have figured out how to get there.
4. **Run takes 12–18 minutes**: short enough for a coffee break. 13 encounters with rising stakes.
5. **Beautiful**: the art carries the whole vibe. Without good rune art this game is a number generator. With it, it's a magic codex.

## Core Loop (per encounter, ~45 seconds)

```
1. Encounter starts. Hand of 5 runes.
2. Player taps 1–3 runes from hand → they slot into spell slots I/II/III.
3. Live damage readout updates as runes are placed.
4. Player taps INSCRIBE → spell resolves → damage pop → enemy HP drops.
5. Used runes go to discard, hand refills to 5.
6. If enemy alive: enemy attacks (threat damage). Repeat from 2.
7. If enemy dies: reward modal — pick 1 of 3 runes OR heal 10.
8. Move to next encounter. Restore 5 HP.
```

## Spell Resolution Pipeline

```
1. Collect runes in spell slots (filter nulls).
2. Run each rune's effect() in order, mutating a shared context:
     - runeMod[i] = { mult, add, repeats, lifesteal }
     - globalMult, healSelf, bonusDraw, spellRetrigger,
       pandemonium, burnNext, stun, ignoreWard, trueDamage
3. Calculate element synergy: max same-element count → ×1+0.5 per extra
4. Calculate shape resonance:  max same-shape count    → ×1+0.25 per extra
5. Apply globalMult *= elementMult * shapeMult
6. Damage tally:
     totalDmg = Σ (basePower[i] + add[i]) × mult[i] × repeats[i]
     + pandemoniumBonus
7. If spellRetrigger > 0: totalDmg *= (1 + spellRetrigger)
8. Apply Fluency mult: totalDmg *= (1 + min(0.72, defeatedEnemies × 0.06))
9. Floor and return.
```

The whole pipeline is deterministic given the same hand + slot order + fluency, which makes daily seeds work.

## Fluency (Progression Multiplier)

Every defeated enemy permanently boosts spell damage for the rest of the run by +6%, capped at +72% (×1.72). This represents the player becoming fluent in the codex over the course of a run. Without it, late-game enemies become impossibly tanky relative to mid-game damage output.

- Encounters 1–3: ×1.00 → ×1.18
- Encounter 7: ×1.36
- Encounter 12 (boss): ×1.66 → ×1.72

## Rune Data Model

Every rune has:

```js
{
  id:        'ember',         // stable string for save data
  name:      'Ember',
  element:   'Fire',          // 9 elements
  shape:     'Bolt',          // 7 shapes
  basePower: 2,               // 0..5 baseline damage
  rarity:    'common',        // common | uncommon | rare | mythic
  glyph:     '☄',             // unicode fallback if art not loaded
  desc:      'A small spark…', // tooltip body
  effect:    (ctx, i) => {…}, // optional context mutator
  starter:   true              // included in opening deck
}
```

There are 30 runes total: 9 common (starter), 9 uncommon, 8 rare, 4 mythic.

### The Nine Elements

| Element | Vibe | Common Rune |
|---|---|---|
| Fire    | Direct damage, amplification | Ember |
| Water   | Sustain, cascading effects   | Drop |
| Earth   | Heavy single-target, anchoring | Stone |
| Air     | Buffs, movement, draws       | Gust |
| Void    | Removal, scaling, singularity | Hollow |
| Light   | Multipliers, weakness, beacon | Ray |
| Shadow  | Steal, drain, draw            | Veil |
| Order   | Repetition, counting, structure | Tally |
| Chaos   | Random, copying, recursion    | Roll |

### The Seven Shapes

Bolt, Wave, Burst, Spiral, Chain, Pulse, Sigil. These cluster within elements and matter for the Shape Resonance bonus.

## Synergies (the system)

**Element synergy**: 2+ runes of the same element → spell mult ×1.5 (×2 for 3 same).
**Shape resonance**: 2+ runes of the same shape → spell mult ×1.25 (×1.5 for 3 same).

These stack multiplicatively. Three same-element three-same-shape = ×3.

## Named Combos (the codex)

Some specific compositions are named and recorded in the player's codex:

- **Triple Conflagration**: 3 Fire runes
- **Stuttering Bell**: 2+ Echo runes
- **False Twin**: Echo + Mirror
- **Aurora Spire**: Aurora + 3 different elements
- **The Singular Inscription**: any spell containing Singularity
- **Spiral of Spirals**: 2+ Recursion
- **All Glyphs Speak**: any spell containing Pandemonium
- **Sun-Up Hex**: Wildfire + Surge
- **Tail-Eater**: any spell containing Ouroboros
- **Resonant Form**: all 3 slots same shape
- **Doubled Prologue**: any spell containing Twin
- **Three Laws Bound**: 3 Order runes
- **Pandaemonium Triad**: 3 Chaos runes
- **The Drowned Choir**: 3 Water runes

When a player casts a spell that matches a combo for the first time, a banner flashes with `INSCRIBED` underneath. From then on the codex tracks the peak damage achieved with that combo.

## Run Structure

13 encounters. Path is fixed (no branching) but enemies are tier-randomized:

- Encounters 1–3:  Tier 1 (Cinder, Wisp, Fenmote)
- Encounters 4–7:  Tier 2 (Hollow Wight, Sirenshade)
- Encounters 8–12: Tier 3 (Brass Revenant, Glass Wyrm)
- Encounter 13:    Tier 4 boss (The Sovereign)

Enemy HP scales by encounter index: `hp × (1 + idx × 0.05)`.
Sovereign at the end is 210 HP × 1.6 = 336 HP scaled. He hits for 5 damage per turn (threat 5).

After each victory: pick 1 of 3 runes OR heal +10 HP ("Mend The Vellum"). Defeating the enemy also increments Fluency.

Reward pool tiering:
- Enc 0–3: common + uncommon
- Enc 4–8: uncommon + rare
- Enc 9–11: rare + mythic

## Meta-Progression

Persisted in `localStorage` under key `glyph-forge-v1`:

```js
state.meta = {
  discoveredRunes:    [...],   // unlocked rune ids
  discoveredCombos:   { id: { name, peakDamage, runeIds, firstSeen } },
  runeUseCount:       { id: int },   // for Sympathy rune
  runsCompleted:      int,
  runsAttempted:      int,
  bestRun:            int,           // highest encounter reached
}
```

No currency, no shop. The meta is purely cosmetic discovery — but the game tracks every weird thing you tried.

## Daily Sigil

A "Daily Sigil" button starts a deterministic run using today's date as a seed (`daily-YYYY-MM-DD`). Everyone gets the same starting deck, the same path, the same reward offers. Future addition: leaderboard via Firebase.

## Player Balance

- **Max HP**: 50
- **Between-encounter heal**: +8 HP
- **Skip-reward heal**: +10 HP
- **Hand size**: 5
- **Spell slots**: 3
- **Starting deck**: the 9 starter runes (one of each baseline element)
- **Fluency multiplier**: scales from ×1.00 → ×1.72 over the course of a run

## Failure States

- Player HP hits 0 → run ends, return to title.
- Hand has no runes → impossible (hand always refills to 5 from deck+discard cycle).
- No deck cards AND no discard → impossible since you always draw before spell resolves.

## Tested Balance Metrics

(from `sim-run.js`, 100 synergy-aware greedy-AI runs)
- Win rate (greedy AI): **37%**
- Losses by encounter: clustered at 11 (tier 3) and 12 (boss — 35/63 losses)
- Avg total turns per run: 47
- Expected real-player win rate: **55–70%**

Boss kills tend to require either: a mythic-anchored combo (Recursion/Singularity/Pandemonium/Aurora) or a stacked Triskelion + same-element triple.

## Theoretical Damage Ceiling

Best 3-rune combo found: Singularity × 2 + Wildfire with 10-card hand = **1125 damage**.
With realistic 5-card hand: ~280 damage.
This is intentional: the "broken combo" is the reward for understanding the system.

## What's NOT in this MVP

- Multiplayer / async pvp
- Sound / music (placeholder for future)
- Multiple difficulty modes
- Boss-specific mechanics (Sovereign right now just hits hard; ideally has phases)
- Hand modifiers, deck modifiers, relics
- Animation polish beyond what's already there

These are good v1.1 additions but not needed to ship.

## Why It's Shippable

- One HTML file. No build step.
- Vanilla JS, no framework, no compile.
- PWA = installable on iOS / Android home screen.
- Asset auto-loader = drop a PNG, refresh, art appears.
- localStorage save = no backend required.
- Firebase optional, only for daily leaderboard.

**One-week build to MVP** for a solo dev. Two-week polish.

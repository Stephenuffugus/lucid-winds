# Tarot Run — Balance Reference

_All numbers reflect the current build. Re-run `node sim-run.js` after any change._

## Player

| Stat | Value | Notes |
|---|---|---|
| Starting / max HP | 60 | hard cap unless A Bent Key relic |
| Starting energy | 3 / turn | +1 turn 1 from Querent's Coin |
| Starting hand size | 5 | drawn at combat start and each turn |
| Hand cap | 10 | cards drawn over cap are skipped |
| Starting deck size | 16 cards | 12 numbered + Aces + Fool |
| Starting gold | 0 | |
| Reading reveal cost | 1 energy | per Major Arcana flipped |
| Rest heal | 40% maxHp | ~24 HP at start |

## Enemy Stats

| Tier | ID | Name | Base HP | HP at typical floor | Key Intents |
|---|---|---|---|---|---|
| 1 | spectre   | The Spectre        | 22 | 22 → 25 | atk 5, atk 3, block 5 |
| 1 | jackal    | Brass Jackal       | 28 | 28 → 32 | atk 6, atk 4×2 |
| 1 | echoman   | The Echo-Man       | 24 | 24 → 27 | atk 4, weak 1, atk 7 |
| 2 | duelist   | The Suit-Duelist   | 45 | 51 → 57 | atk 9, atk 6×2, block 8, str+2 |
| 2 | reflection| The Reflection     | 38 | 44 → 50 | atk 7, atk 5×2, copy block |
| 2 | sleeper   | The Sleeper        | 52 | 58 → 64 | atk 11, vuln 2, block 10 |
| 3 | gilded    | The Gilded Idol    | 70 | 81 → 87 | atk 13, atk 7×2, str+3, block 14 |
| 3 | archivist | The Archivist      | 62 | 73 → 79 | atk 10, weak 2, vuln 2, atk 16 |
| 3 elite | twins | The Reversed Twins | 78 | 94 | atk 8×2, atk 14, add curse |
| 3 elite | oracle| The Bound Oracle   | 88 | 104 | atk 18, weak 3, atk 10 |
| 4 boss | crown | The Crowned Fool   | 180 | 196 | atk 14, atk 8×2, vuln 2, str+4, atk 24 |

HP scales: `baseHp + floor × 1.2`.

## Card Power Curves

### Wands (damage)
Ace=4, 2=5, 3=6, 4=7, 5=8, 6=9, 7=10, 8=11, 9=12, 10=13, Page=6+draw 1, Knight=12 (+6 if enemy full HP), Queen=9+burn 2, King=18+1 energy

### Cups (heal + draw)
Ace=heal 1, 2=heal 2, 3=heal 3, 4=heal 3, 5=heal 4, 6=heal 5, 7=heal 5+draw 1, 8=heal 6+draw 1, 9=heal 7+draw 1, 10=heal 8+draw 1, Page=draw 2, Knight=heal 6+resolve, Queen=heal 10+ward 6, King=heal 14+draw 2+discard 1

### Swords (pierce + debuff)
Ace=pierce 2, 2=pierce 3, 3=pierce 4, 4=pierce 5, 5=pierce 6, 6=pierce 6, 7=pierce 7, 8=pierce 8, 9=pierce 9, 10=pierce 10, Page=pierce 4+weak, Knight=pierce 8, Queen=pierce 6+vuln, King=pierce 12+weak+vuln

### Pentacles (block + wealth)
Ace=block 4, 2=block 5, 3=block 6, 4=block 7, 5=block 8, 6=block 9, 7=block 10, 8=block 11, 9=block 12, 10=block 13, Page=block 7+5g, Knight=block 14, Queen=block 10+plate, King=block 18+heal 4

### Major Arcana (signature plays)
- **The Fool** (cost 0): shuffle 3 random Minor cards into hand (ephemeral)
- **The Magician** (cost 2): all cards cost -1 this turn
- **The High Priestess** (cost 1): peek + reorder top 3
- **The Empress** (cost 1): heal 12 + draw 1
- **The Emperor** (cost 2): block 16 + plate
- **The Hierophant** (cost 1): tutor any card from draw pile
- **The Lovers** (cost 1): choose block 8+heal 4 OR strike 14
- **The Chariot** (cost 2): strike 10 + block 10
- **Strength** (cost 1): +2 to all attacks
- **The Hermit** (cost 0): discard hand, draw that many
- **Wheel of Fortune** (cost 1): random — strike 18 / heal 14 / draw 4 / block 18
- **Justice** (cost 2): strike = enemy intent value (or 8)
- **The Hanged Man** (cost 0): +2 energy, -4 HP at turn end
- **Death** (cost 1): banish hand, strike 4 per card banished
- **Temperance** (cost 1): heal 6 + block 6 + draw 1
- **The Devil** (cost 0): strike 22, -6 HP
- **The Tower** (cost 2): strike 14, discard hand
- **The Star** (cost 0): heal 8 + draw 2
- **The Moon** (cost 1): weak 2 + vuln 2
- **The Sun** (cost 2): strike 16 + block 6 + heal 4
- **Judgement** (cost 2): return a discard to hand, costs 0 this turn
- **The World** (cost 3): strike 12 + heal 8 + block 12 + draw 2

## Damage Profile (validated by `test-cards.js`)

| Suit | Cards | Avg Damage | Max Damage |
|---|---|---|---|
| Wands  | 14 | 9.7  | 18 (King of Wands) |
| Swords | 14 | 6.4  | 12 (King of Swords pierce) |
| Major  | 22 | 17.1 (of damage-dealers) | 32 (Death w/ 8-card hand) |
| Cups   | 14 | 0    | 0 (heal/draw, no damage) |
| Pents  | 14 | 0    | 0 (block/heal, no damage) |

## Suit Aspect Resonance

3+ same-suit plays in one turn trigger an aspect:

| Suit | Aspect |
|---|---|
| Wands | +3 Strength |
| Cups  | Heal 6 |
| Swords| Pierce next 2 |
| Pents | Block 10 |
| Major | Draw 2 |

## Win Rate Tests (50 sim runs, synergy-aware greedy AI)

```
Win rate: 13/50 (26%)
Avg deck size at end: 23.4
Avg end HP: 8.8

Loss-by-floor histogram:
  flr 8: ███████ (7)         first elite/T3
  flr 12: ███ (3)            second elite
  flr 14: ███████████████████████████ (27)   ← THE BOSS WALL
  WIN: █████████████ (13)
```

Diagnosis: 27/37 losses are at the boss (73%). This is correct — the boss should be the wall.

The simulator AI does NOT use the Reading mechanic (it doesn't reveal Major Arcana from the spread). A real player who reveals 2-3 Reading cards per combat for clutch heals / damage bursts should hit **50-65% win rate**.

## Tuning Levers (in order of impact)

1. **Crowned Fool HP** (180 base, 196 at floor 14) — single biggest knob. -20 to make beatable, +20 to brutalize.
2. **Crowned Fool intent damage** (peak 24 on Coronation Strike) — affects late-combat survival
3. **Player max HP** (60) — affects mid-game survival
4. **Rest heal %** (40% maxHp) — affects how often you NEED to rest
5. **Reward pool tiering** — at floor 9+ everything is rare. Could include uncommon for variety.

DO NOT touch The Devil, Death, The Tower, or The World effects without re-running `test-cards.js`. These are the highest-impact Major Arcana — small balance shifts cascade through endgame damage.

## Variance Analysis

Tarot Run is more deterministic than Glyph Forge because draw order matters less (you draw 5 each turn, with cycling). Variance comes from:

1. **Path randomization** — favorable elite/rest placement helps
2. **The Reading** — getting Strength or The World as a Reading is a huge boost; getting only weak Majors is a downer
3. **Reward offers** — sometimes you don't get a card that matches your build
4. **Relic distribution** — Silvered Tooth + Dancer's Bell + Ribbon of Fate is a degenerate combo

A run can swing from "lost on floor 8 to a tough Sleeper draw" to "killed the boss with The World + Strength + 3 of Wands in hand."

## Run Length

- Avg combats per run: ~9 (15 floors, ~60% are combat/elite/boss)
- Avg turns per combat: ~6
- Avg total turns per run: ~55
- Avg session: 15–22 minutes
- Designed for one commute / coffee break per attempt

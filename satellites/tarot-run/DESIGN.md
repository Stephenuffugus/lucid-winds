# Tarot Run — Design Document

## Pitch

**Tarot Run** is a phone-native roguelite deckbuilder where every card is a hand-painted tarot. Climb a 15-floor tower. Build a 78-card collection. Win by surviving the Crowned Fool. Each combat opens with a **Reading** — three Major Arcana flipped face-down as Past, Present, Future — that you can spend energy to reveal and play as one-shot powers.

Mobile-first, single-handed portrait, single-file vanilla HTML/CSS/JS PWA. Ships installable.

## Pillars

1. **The deck is the art.** 78 unique hand-painted cards. The visual delight is the meta-progression.
2. **The Reading is the hook.** No other deckbuilder has Major Arcana as a face-down draft at combat start. It's the tarot-specific identity.
3. **Phone-native.** Single hand, single thumb. Card tap = play. End Turn one-tap. No drag mechanics required.
4. **15-floor run, ~20 minutes.** Long enough for a real strategic arc, short enough for a coffee break.
5. **Smith-Waite art lineage.** No generic fantasy. No anime. The whole game looks like a 1909 illuminated deck come to life under stage footlights.

## Core Loop (per combat, ~90 seconds)

```
1. Combat begins. Draw 5 cards. 3 Energy. 3 face-down Major Arcana appear above the enemy (the Reading).
2. Tap cards from hand to play them. Each plays for its energy cost.
3. (Optional) Tap a face-down Reading card to pay 1 energy and add it to your hand as a one-shot ephemeral card.
4. Build to 3-of-a-suit in a single turn to trigger an Aspect Resonance bonus.
5. Tap End Turn → enemy resolves intent → reset block, draw 5, energy back to 3.
6. Repeat until enemy or you hits 0 HP.
7. Win: reward — pick 1 of 3 cards, OR skip for gold. Boss/elite drops are rare-tier.
```

## Path Structure

15 floors, displayed bottom-to-top like a tower. Each floor has 1–2 nodes you choose between (after floor 0).

- **Floor 0**: forced single tier-1 combat (tutorial fight)
- **Floors 1–7**: combat / event / rest / treasure (weighted toward combat). Tier 1–2 enemies.
- **Floor 4 & 9**: guaranteed treasure
- **Floors 8 & 12**: forced choice between **Elite** and **Rest**. The skill check.
- **Floors 9–13**: tier 3 enemies + occasional elites
- **Floor 14**: The Crowned Fool (boss)

## Card Data Model

```js
{
  id:        'wands-7',          // unique stable string
  name:      'Seven of Wands',
  suit:      'wands',            // wands | cups | swords | pents | major
  arcanaNum: 7,                  // 0-21 for Major; 1-14 for Minor (Ace=1, Page=11)
  cost:      2,                  // energy 0-3
  glyph:     '⚸',                // unicode fallback
  desc:      'Strike 10.',       // shown on card face
  flavor:    'The brand awakens.',
  rarity:    'uncommon',         // starter | common | uncommon | rare
  starter:   true,               // if in opening deck (subset of cards)
  play:      (ctx) => {...},     // mutate combat state, return result obj
  reversedPlay: (ctx) => {...}   // optional flipped variant
}
```

## The 78 Cards

### Major Arcana (22 cards) — Once-Per-Combat Powers
Each is a unique, named tarot card with a hand-written effect. Big effects: Strength gives +2 to all attacks, Death banishes hand for damage, The World does everything at once. **A player can play at most one Major Arcana per combat.** They are the punctuation.

### Minor Arcana (56 cards) — Suit-Themed Pip Cards

| Suit | Theme | Numerical scaling |
|---|---|---|
| **Wands** (Fire) | Strike. Damage and burn. | Ace=4 dmg → 10=13 dmg → King=18 dmg |
| **Cups** (Water) | Heal. Sustain. Draw. | Ace=heal 1 → 10=heal 8 → King=heal 14 |
| **Swords** (Air) | Pierce (ignore block). Debuff. | Ace=2 pierce → 10=10 pierce → King=12 pierce + Weak + Vuln |
| **Pentacles** (Earth) | Block. Wealth. Plate. | Ace=block 4 → 10=block 13 → King=block 18 + heal |

Court cards (Page/Knight/Queen/King) introduce signature mechanics:
- Page: card draw / utility
- Knight: aggressive bonus damage
- Queen: balance — defensive with offensive support
- King: capstone effect — the suit's most powerful single play

## The Reading Mechanic (the differentiator)

At the start of every combat, **three Major Arcana** are drawn from a pool of Major cards you don't already own. They appear face-down above the enemy as Past / Present / Future.

- Each card costs **1 energy to reveal**.
- When revealed, the card is added to your hand as an **ephemeral** one-shot. It doesn't go to your discard after play — it vanishes.
- You can never play more than one Major Arcana per combat (whether from your deck or the Reading).
- The Reading is shuffled fresh for each combat.

This means players see the strategic possibilities before combat starts and can choose to spend energy to unlock them. A bad enemy intent + The Star in the future slot? Save energy, reveal Star, heal yourself. Big enemy that won't block? Reveal The Sun for 16 damage.

## Suit Aspect Resonance

When the player plays **3 cards of the same suit in a single turn**, an Aspect Resonance triggers:

| Suit | Aspect Effect |
|---|---|
| Wands | Gain **Strength** (+3 to all attacks this combat) |
| Cups | Heal 6 HP |
| Swords | Gain **Pierce** (next 2 attacks ignore block) |
| Pentacles | Gain 10 Block |
| Major | (only triggers if you have 3 Majors ephemeral from Reading) Draw 2 |

This rewards suit-focused deckbuilding and gives the player a reason to chase a suit identity over the run.

## Reversed Cards

When you draw a card, there's a **5% chance** it comes Reversed (rotated 180° on display). Reversed cards run their `reversedPlay` function instead of `play`. Most cards don't have a reversed variant yet (MVP cut), but the framework is in place for v1.1 content.

Relic interaction: **Broken Mirror** increases reverse chance to 20% and adds +1 effect to reversed plays.

## Run Setup

- **Starter deck (16 cards)**: 3 Aces of each suit, 3× 2-of-each, 3× 3-of-each, plus duplicate Aces of Wands/Cups/Pentacles, plus The Fool. Total = 16.
- **Starting relic**: Querent's Coin (+1 energy turn 1 of every combat).
- **Starting HP**: 60 / 60
- **Starting gold**: 0

## Combat State

```js
combat = {
  enemyId, rng,
  turn: 1,
  reading: [majorId, majorId, majorId],
  readingRevealed: [false, false, false],
  turnCostMod: 0,            // The Magician
  hangedManCost: 0,          // pending self-damage
  aspectsTriggeredThisTurn: {wands:0, cups:0, swords:0, pents:0, major:0},
  cardsPlayedThisTurn: 0,
  firstAttackThisCombat: true,
  currentMajorCast: null,    // tracks once-per-combat Major
  pendingChoice: null,       // for cards like Lovers/Hierophant
}

player = {
  energy: 3, maxEnergy: 3,
  block: 0,
  hp, maxHp,
  gold,
  hand, draw, discard,        // arrays of { cardId, reversed, ephemeral?, zeroCostThisTurn? }
  buffs: { strength, plate, resolve, ward, pierce_next },
  debuffs: { weak, vulnerable, frail },
}
```

## Damage Resolution Pipeline

```
1. Start with raw card power.
2. Add player.buffs.strength.
3. Multiply by 1.5 if enemy has Vulnerable.
4. Multiply by 0.75 if player has Weak.
5. (For non-Pierce attacks) Subtract enemy block first.
6. Apply to enemy HP.
```

Pierce attacks skip step 5. Block applies before HP for both sides; block resets to 0 at start of each turn.

## Relics (15 total)

Passive items found in treasure rooms or some events. They modify combat in subtle ways:

| Relic | Effect |
|---|---|
| Querent's Coin (starter) | +1 energy turn 1 |
| Sealed Letter | Drawing a Major draws +1 card |
| A Bent Key | +5 max HP. Heal 5 each encounter. |
| Ribbon of Fate | First card each turn costs 0 |
| Broken Mirror | Reversed chance 5% → 20%. Reversed +1 effect. |
| Wax Mask | Start each combat with 6 block |
| The Thurible | Heal 2 each turn |
| Iron Chalice | When you heal, draw 1 (once per turn) |
| Dancer's Bell | Every 3rd card per turn → +1 energy |
| Silvered Tooth | First attack each combat hits twice |
| Crooked Lens | See enemy intent 2 turns ahead |
| A Forgotten Name | If you would die, instead heal to 10 (once per combat) |
| Ace of Aces | Aces cost 0 |
| Fool's Feather | Free Fool in hand at combat start |
| Two of Coins | +5 gold per enemy defeated |

## Meta-Progression

Persisted in `localStorage` under key `tarot-run-v1`:

```js
state.meta = {
  discoveredCards: { id: { name, seen: int, played: int } },
  runsCompleted: int,
  runsAttempted: int,
  bestFloor: int,
  relicsFound: { id: true },
}
```

The codex shows a 78-card grid where undiscovered cards are dim silhouettes. Discovery is purely cosmetic — there's no grind/unlock gating. Every card is available from run 1.

## Daily Reading

A "Today's Spread" button (under the title's Codex button) generates a deterministic seed from the current date (`daily-YYYY-M-D`). Everyone gets the same path, the same draws, the same reward offers, the same Reading. Future addition: leaderboard via Firebase.

## Failure States

- Player HP hits 0 → run ends, return to title.
- Cannot end turn while a card is mid-resolution (pending choice modal blocks input).
- Decks with no playable cards: turn ends automatically (you keep drawing 0-cost cards until none are playable; engine prevents soft locks).

## Tested Balance

(from `sim-run.js`, 50-run synergy-aware greedy AI; AI does NOT use Reading mechanic — humans will)
- Win rate (greedy AI): **26%**
- 27/37 losses are at the boss (floor 14)
- Mid-game gates: floor 8 elite (~14% lose) and floor 12 elite (~6% lose)
- Avg final deck size: 23.4 cards
- Avg session: ~20 minutes

Expected real-player win rate with Reading + smart Major play: **50–65%**.

## What's NOT in this MVP

- Sound / music (placeholder for v1.1)
- Animation polish beyond what's already there
- Multiplayer / async PvP
- Multiple difficulty modes ("Ascensions" Slay-the-Spire style would be ideal v1.1)
- Boss phase mechanics — Crowned Fool just has 5 intents; ideally has phase 2
- Card upgrades beyond "Study" (currently not fully implemented — placeholder in rest node)

## Why It's Shippable

- One HTML file. No build step.
- Vanilla JS, no framework.
- PWA-installable; works offline after first load.
- Auto-art-loader: drop PNGs into `/art-slots/`, refresh.
- localStorage save: no backend required.
- 90 art slots is the only gating factor — even with just 22 majors + 11 enemies the game is playable & beautiful.

**One-week build to MVP** for a solo dev (this is the MVP). Two-week polish for art import + balance pass.

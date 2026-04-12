# PETAL WALK — PETAL BLINK GAME SPEC
## For: Claude Code (super-duper-enigma)
## From: Claude (Lead Dev) — Director Approved
## Date: March 31, 2026

---

## WHAT THIS IS

A new game for the Game tab game selector. Speed card-matching game. Player clears a 30-card hand as fast as possible by matching one attribute to either of two discard piles.

---

## GAME SELECTOR ENTRY

Add to the G array in the Game Hub:

```javascript
{id:'blink', n:'Petal Blink', i:'⚡', r:'Match 1 trait (shape, color, count) to clear your hand. Speed wins!'}
```

---

## CARD SYSTEM

### Three Attributes Per Card

**Shapes (6):**
- Leaf — teardrop / pointed oval
- Bloom — simple 5-petal flower
- Stem — thick straight vertical line
- Seed — small oval / bean shape
- Droplet — water drop
- Vine — S-curve / wavy line

**Colors (5):**
- Forest green: #4A7C35
- Golden amber: #D4A843
- Dusty rose: #C47A7A
- Sky blue: #5B9BD5
- Warm cream: #E8DCC8

**Counts (3):** 1, 2, or 3 instances of the shape drawn on the card

**Total unique cards:** 6 × 5 × 3 = 90 possible cards.

### Deck Construction

Each game: randomly select 30 unique cards from the 90-card pool. No duplicates within a single game.

### Card Rendering

Each card is a rounded rectangle with a subtle border. The shape(s) are centered on the card face. For count 2, shapes are side by side. For count 3, shapes form a triangle arrangement (2 on top, 1 below). All shapes are filled with their color on a dark card background matching the Petal Walk theme (rgba(26,31,23,.6) with a subtle green border).

**SVG shape definitions (all drawn at roughly 20×20px scale, centered on card):**

```
Leaf:     M10,2 Q15,0 18,8 Q20,16 10,20 Q0,16 2,8 Q5,0 10,2 Z
          (teardrop pointing up)

Bloom:    5 ellipses rotated 72° apart around center, small circle in middle
          (simple 5-petal flower)

Stem:     rect x=8 y=2 width=4 height=18 rx=2
          (thick vertical line with rounded ends)

Seed:     ellipse cx=10 cy=10 rx=6 ry=8
          (vertical oval, slightly taller than wide)

Droplet:  M10,2 Q16,10 10,20 Q4,10 10,2 Z
          (classic water drop shape, pointed top, round bottom)

Vine:     M4,2 Q16,8 4,14 Q16,18 10,20
          (S-curve, stroke only, no fill, stroke-width 3)
```

These are approximate — make them look clean and distinct at card size. The critical requirement is that all 6 shapes are instantly distinguishable from each other by silhouette alone (colorblind safe).

---

## MATCHING RULE

A card is a valid play on a discard pile if it shares **at least one attribute** with the top card of that pile.

- Same shape OR same color OR same count = valid
- No shared attributes = invalid

This is intentionally generous. The game is about speed, not puzzle-solving.

**Examples:**
- Hand: 2 blue leaves → Pile: 1 blue seed → VALID (color match: blue)
- Hand: 3 rose blooms → Pile: 3 green stems → VALID (count match: 3)
- Hand: 1 amber vine → Pile: 2 blue droplet → INVALID (no match)

---

## GAME FLOW

### Setup
1. Shuffle 30-card deck
2. Place top card face-up on Pile A
3. Place next card face-up on Pile B
4. Deal 3 cards to player's hand
5. 25 cards remain in draw pile
6. Timer starts at 0:00.0, counting UP

### Play Loop
1. Player taps a card in their hand → card highlights with glow border
2. Player taps Pile A or Pile B
3. IF valid match:
   - Card animates from hand to pile (150ms fly + slight scale bounce)
   - Hand gap fills by sliding remaining cards together
   - New card auto-draws from draw pile to hand (100ms slide in)
   - If streak counter 5+ → show 🔥 indicator
4. IF invalid match:
   - Card does horizontal shake animation (200ms)
   - Card deselects
   - No penalty (time lost is the only cost)
5. Tapping a different hand card while one is selected switches selection

### Stuck State
If no hand card matches either pile:
- Player taps the DRAW button
- Top card of draw pile plays onto whichever discard pile the player taps
- 2-second penalty added to timer (clock flashes red, +2.0 visibly ticks up)
- This refreshes the pile tops, hopefully unblocking the hand

### Win Condition
All 30 cards played (hand empty, draw pile empty). Timer stops. Display final time.

### Fail State
None. The draw button always provides an out. The game always completes. Score is time.

### Edge Cases
- If initial Pile A and Pile B top cards are identical: reshuffle deck and redeal
- If draw pile is empty and hand has no valid plays (extremely unlikely with match-by-one in 90-card pool): auto-win, discard remaining hand cards, display completion with cards-remaining noted
- Guard against: tapping pile before selecting a hand card (do nothing / show subtle hint)

---

## DIFFICULTY MODES

### Easy (default)
- Match by any 1 shared attribute
- Timer counts up, no limit
- No draw penalty

### Medium
- Match by any 1 shared attribute
- Timer counts DOWN from 60 seconds
- Draw penalty: -3 seconds from remaining time
- If timer hits 0: game over, score = cards remaining (lower is better)

### Hard
- Must match by exactly 2 shared attributes (much harder to find valid plays)
- Timer counts up, no limit
- Draw penalty: +3 seconds

Difficulty selector: 3 buttons above the play area before game starts. Same pattern as other games in the hub.

---

## MOBILE UI LAYOUT

Target: Pixel 9 (412×924 CSS viewport)

```
┌────────────────────────────────┐
│  ⚡ Petal Blink                │
│  ⏱ 00:00.0    Cards: 24/30   │
├────────────────────────────────┤
│                                │
│     ┌─────┐      ┌─────┐     │
│     │PILE │      │PILE │     │
│     │  A  │      │  B  │     │
│     │     │      │     │     │
│     └─────┘      └─────┘     │
│                                │
│         ┌─────┐               │
│         │DRAW │               │
│         │ 22  │               │
│         └─────┘               │
│                                │
├────────────────────────────────┤
│  ┌─────┐  ┌─────┐  ┌─────┐  │
│  │HAND │  │HAND │  │HAND │  │
│  │  1  │  │  2  │  │  3  │  │
│  │     │  │     │  │     │  │
│  └─────┘  └─────┘  └─────┘  │
├────────────────────────────────┤
│  🔥 Streak: 7  │  Best: 34.2s │
└────────────────────────────────┘
```

**Card sizes:**
- Pile cards: ~100×140px (large, easy to tap)
- Hand cards: ~90×126px (slightly smaller, 3 fit across with gutters)
- Draw pile: ~70×98px (smaller, centered between piles and hand)

**All cards, piles, and buttons use position within the game panel — NOT position:fixed.** Fixed positioning is reserved for Wild tab overlays only.

---

## ANIMATIONS

| Event | Animation | Duration |
|-------|-----------|----------|
| Valid play | Card flies from hand to pile, slight overshoot + settle | 150ms |
| Invalid play | Horizontal shake (3px left-right oscillation) | 200ms |
| Card draw to hand | Slides in from draw pile position | 100ms |
| Draw penalty | Clock text turns red, "+2.0" floats up and fades | 500ms |
| Streak 5+ | 🔥 emoji pulses next to streak counter | continuous |
| Win | Hand area bursts (cards scale up + fade out), time glows green | 400ms |
| Selection | Card lifts slightly (translateY -4px) + green glow border | 150ms |

---

## SOUND (Web Audio API)

Same pattern as existing Simon/other games in the hub:

- Valid play: soft ascending chime. Pitch increases with streak length.
- Invalid play: dull low thud
- Draw penalty: low buzz / descending tone
- Win: quick ascending arpeggio (4 notes)
- Card select: very subtle click

All sounds generated via Web Audio oscillators — no audio files needed.

---

## HASH INTEGRATION

### Attention Weight Entry

Add to the `_aw` object:

```javascript
blink: {game_complete:3, speed_bonus:2, default:0}
```

### Hash Events

- `buildAttentionPayload('game_start')` → fires when timer starts
- `buildAttentionPayload('game_complete')` → fires when all cards cleared → 3 hashes (× _dm difficulty multiplier)
- `buildAttentionPayload('speed_bonus')` → fires if completed under 45s on Medium or under 90s on Hard → 2 bonus hashes

### Difficulty Multiplier

Same as existing system:
- Easy: `_dm = 1.0`
- Medium: `_dm = 1.5`
- Hard: `_dm = 2.0`

### Target Hash Rate

~5 hashes per game on Medium (3 base × 1.5 = 4.5 + possible speed bonus = 6.5). Games last 30–90 seconds. High replay rate means good hash throughput per session.

---

## RECORDS

Store in `sws_game_records` under key `blink`:

```javascript
blink: {
  gamesPlayed: 0,
  bestTimeEasy: null,    // milliseconds, null if never completed
  bestTimeMedium: null,
  bestTimeHard: null,
  totalCardsPlayed: 0,
  longestStreak: 0,      // consecutive plays without draw penalty
  fastestStreak5: null   // fastest time to reach a 5-streak
}
```

---

## STREAK SYSTEM

- Each consecutive valid play (no draw button) increments streak counter
- Using the draw button resets streak to 0
- Streak of 5+ shows 🔥 indicator
- Streak of 10+ shows 🔥🔥
- Streak of 15+ shows 🔥🔥🔥
- Longest streak tracked in records
- Streak is displayed below the play area: "🔥 Streak: 7"

---

## WHAT NOT TO DO

- Do NOT use position:fixed for any game elements
- Do NOT rewrite switchTab
- Do NOT modify any economy values
- Do NOT add new localStorage keys without the sws_ prefix
- Do NOT load external assets — all shapes are inline SVG
- Do NOT make the game panel wider than the existing game hub container

---

## TESTING CHECKLIST

1. [ ] All 6 shapes render distinctly at card size
2. [ ] All 5 colors are visually distinct
3. [ ] Matching logic correctly validates all single-attribute matches
4. [ ] Invalid plays are correctly rejected
5. [ ] Draw penalty adds time and refreshes pile
6. [ ] Game completes when all 30 cards are played
7. [ ] Timer displays correctly (MM:SS.s format)
8. [ ] Difficulty modes all function
9. [ ] Hash events fire at correct moments
10. [ ] Records save and persist in localStorage
11. [ ] No overlap with other game panels
12. [ ] Plays correctly on Pixel 9 in Chrome incognito
13. [ ] Streak counter increments and resets correctly
14. [ ] Sounds play without blocking UI
15. [ ] Game selector shows Petal Blink in the scrollable row

---

*Spec complete. Ready for Claude Code build.*

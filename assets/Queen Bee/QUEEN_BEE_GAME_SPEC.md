# PETAL WALK — QUEEN BEE (ENGINE-BUILDING CARD GAME) GAME SPEC
## For: Claude Code (super-duper-enigma)
## From: Claude (Lead Dev) — Director Approved
## Date: March 31, 2026

---

## WHAT THIS IS

A new game for the Game tab game selector. An engine-building card game where players collect pollen tokens, buy botanical cards that produce permanent pollen, and race to 15 Growth Points. The mechanic is the same family as Splendor, Century: Spice Road, and Gizmos — collect resources to buy cards that generate more resources, building an increasingly powerful engine.

**Design reference:** Modeled after Splendor Digital by Days of Wonder (AI opponents, card market tension, noble system), Century: Spice Road (clean resource trading), and BoardGameGeek solo variant community (solo scoring challenges).

**Name in game:** "Queen Bee"

**Legal basis:** Engine-building (collect resources → buy permanent resource producers → race to points) is a public domain game mechanic used across dozens of published games. Our card economy, art, values, and theme are entirely original.

---

## GAME SELECTOR ENTRY

```javascript
{id:'pollen', n:'Queen Bee', i:'🐝', r:'Collect pollen, grow plants that produce more pollen. Race to 15 Growth Points!'}
```

---

## THE CONCEPT — WHY THIS GAME IS ADDICTIVE

For players who've never seen this mechanic, here's the hook in plain language:

**Turn 1-5:** You're broke. You can only pick up a few pollen tokens. Everything costs too much.

**Turn 6-10:** You buy your first cheap plant card. It permanently produces green pollen every turn. Now you need less green pollen from the bank. You buy another card. Now you produce blue AND green.

**Turn 11-15:** Your engine is running. Cards that cost 5 pollen? You already produce 3 permanently — you only need 2 from the bank. You're buying expensive cards in one turn that would have taken three turns earlier.

**Turn 16-20:** You're a pollen factory. Ancient Trees that cost 8 pollen? Easy. Each one gives you 4-5 Growth Points. You cross 15 and win.

**The feeling:** Slow start → accelerating power → explosive finale. This is the same dopamine curve as compound interest, tech trees in strategy games, and every "idle clicker" game. Humans are wired to love watching exponential growth.

---

## RESOURCE SYSTEM

### Five Pollen Types

| Pollen | Color | Hex | Icon |
|--------|-------|-----|------|
| Leaf Pollen | Forest green | #4A7C35 | Small leaf shape |
| Bloom Pollen | Dusty rose | #C47A7A | Small petal shape |
| Rain Pollen | Sky blue | #5B9BD5 | Small droplet shape |
| Root Pollen | Warm amber | #D4A843 | Small root shape |
| Spore Pollen | Soft cream | #E8DCC8 | Small spore dot |

### Golden Pollen (Wild)

| Pollen | Color | Hex | Icon |
|--------|-------|-----|------|
| Golden Pollen | Bright gold | #FFD700 | Small star/sun |

Golden Pollen is wild — it can substitute for any color when buying cards. More valuable, harder to get.

### Pollen Token Supply (Scales by Player Count)

| Mode | Per Color | Gold | Total |
|------|-----------|------|-------|
| Solo (Puzzle Mode) | 4 | 3 | 23 |
| vs 1 AI | 5 | 5 | 30 |
| vs 2 AI (future) | 7 | 5 | 40 |

When you buy a card, spent pollen tokens return to the supply. When you collect tokens, they come from the supply. If a color is empty, you can't collect it.

---

## CARD SYSTEM

### Three Tiers

**Tier 1 — Seedlings (40 cards)**
The engine builders. Cheap to buy, no/few Growth Points, but they permanently produce pollen.

**Tier 2 — Saplings (30 cards)**
The bridge. Moderate cost, moderate Growth Points. Start scoring while building.

**Tier 3 — Ancient Trees (20 cards)**
The finishers. Expensive, high Growth Points. Your engine exists to buy these.

### What Every Card Has

```
┌─────────────────────┐
│ GP: 2          🟢   │  ← Growth Points (top-left), Produces color (top-right)
│                      │
│   [Botanical art]    │  ← Simple plant illustration
│                      │
│ Cost:                │
│ 🟢🟢🔵🔵🟡         │  ← 2 green + 2 blue + 1 amber to buy
└─────────────────────┘
```

- **Growth Points (GP):** 0-5. Your score. First to 15 wins.
- **Production color:** The permanent pollen this card produces. Once bought, you effectively have +1 of this color forever.
- **Cost:** The pollen tokens required to buy this card. Permanent production from previously bought cards counts toward cost (reducing what you need from your token stash).

### Card Economy Design

**CRITICAL: These values are entirely original — not copied from any existing game.**

**Tier 1 — Seedlings (40 cards, ~8 per color)**

Each color has 8 cards that PRODUCE that color. Costs are distributed across other colors:

| GP | Produces | Cost | Qty |
|----|----------|------|-----|
| 0 | Green | 1B, 1R, 1A | 2 |
| 0 | Green | 2B | 2 |
| 0 | Green | 3S | 1 |
| 0 | Green | 1B, 1R, 1S | 1 |
| 1 | Green | 2R, 2A | 2 |

*(Repeat similar pattern for Blue, Rose, Amber, and Spore production)*

**Simplified generation rule for Claude Code:**
```
Tier 1: 40 cards
  - 32 cards with 0 GP, costing 1-4 total pollen across 1-3 colors
  - 8 cards with 1 GP, costing 3-4 total pollen across 2 colors
  - Each of the 5 colors is produced by exactly 8 cards
  - No card costs the same color it produces (you don't spend green to make green)
  - Costs are spread so no single color is over-demanded
```

**Tier 2 — Saplings (30 cards, 6 per color)**
```
Tier 2: 30 cards
  - 10 cards with 1 GP, costing 4-5 total pollen across 2-3 colors
  - 10 cards with 2 GP, costing 5-6 total pollen across 2-3 colors
  - 10 cards with 3 GP, costing 6-7 total pollen across 3 colors
  - Each of the 5 colors is produced by exactly 6 cards
  - At least one card per color requires a "splash" of a third color
```

**Tier 3 — Ancient Trees (20 cards, 4 per color)**
```
Tier 3: 20 cards
  - 4 cards with 3 GP, costing 6-7 total pollen across 2 colors (one heavily weighted)
  - 8 cards with 4 GP, costing 7-9 total pollen across 2-3 colors
  - 8 cards with 5 GP, costing 8-10 total pollen across 3-4 colors
  - Each of the 5 colors is produced by exactly 4 cards
```

### Card Generation at Build Time

Claude Code should generate all 90 cards with the constraints above and hard-code them as a static array. Cards do NOT change between games — the deck is always the same 90 cards, shuffled differently each game. This allows players to learn the card pool over time (like learning a deck in a card game).

```javascript
var POLLEN_CARDS = {
  tier1: [
    {id:'t1_01', gp:0, produces:'green', cost:{blue:1, rose:1, amber:1}},
    {id:'t1_02', gp:0, produces:'green', cost:{blue:2}},
    // ... 38 more
  ],
  tier2: [
    {id:'t2_01', gp:1, produces:'green', cost:{blue:2, rose:2, spore:1}},
    // ... 29 more
  ],
  tier3: [
    {id:'t3_01', gp:4, produces:'green', cost:{blue:3, rose:3, amber:1}},
    // ... 19 more
  ]
};
```

### The Market Display

At any time, the "market" shows:
- 4 face-up Tier 1 cards
- 4 face-up Tier 2 cards
- 4 face-up Tier 3 cards
- Plus the top of each deck (face down, showing how many remain)

When a card is bought or reserved, it's immediately replaced from its deck.

---

## POLLINATOR TILES (BONUS VP)

10 Pollinator tiles in the game, 5 randomly selected per game.

Each Pollinator requires a specific combination of permanent production (bought cards, NOT tokens):

| Pollinator | Requires | Bonus GP |
|------------|----------|----------|
| Monarch Butterfly | 3 Green + 3 Blue | 3 |
| Honeybee | 3 Rose + 3 Amber | 3 |
| Hummingbird | 3 Blue + 3 Spore | 3 |
| Luna Moth | 3 Green + 3 Rose | 3 |
| Bumblebee | 3 Amber + 3 Spore | 3 |
| Dragonfly | 4 Green + 2 Blue | 3 |
| Ladybug | 4 Rose + 2 Amber | 3 |
| Firefly | 4 Amber + 2 Green | 3 |
| Cicada | 4 Blue + 2 Spore | 3 |
| Scarab | 4 Spore + 2 Rose | 3 |

**How Pollinators work:**
- Pollinators are visible to all players from the start
- At the END of your turn, if your permanent production meets or exceeds a Pollinator's requirements, you automatically claim it
- Each Pollinator can only be claimed by one player (first to qualify gets it)
- A Pollinator gives +3 GP immediately
- You can claim multiple Pollinators if you qualify for several at once

---

## PLAYER ACTIONS (One Per Turn)

On your turn, you do exactly ONE of these:

### Action 1: Collect Pollen Tokens
Choose ONE of:
- **Take 3 different colors:** Pick one token each of 3 different colors from the supply
- **Take 2 of one color:** Pick 2 tokens of the same color (ONLY if there are 4+ of that color in supply before taking)

**Hand limit:** Maximum 10 pollen tokens in hand at end of turn. If over 10, must discard down to 10 (return excess to supply, player chooses which to discard).

### Action 2: Buy a Card
- Buy one face-up card from the market OR one of your reserved cards
- Pay its cost in pollen tokens (returned to supply)
- Permanent production from cards you already own counts as "free" pollen:
  - Example: Card costs 3 green + 2 blue. You own 2 green-producing cards. You only need to spend 1 green token + 2 blue tokens from your hand.
- Golden Pollen tokens substitute for any color (1 gold = 1 of any color)
- Card goes to your tableau (permanent collection)
- Empty market slot immediately refills from the deck

### Action 3: Reserve a Card
- Take any face-up market card OR the top card of any tier deck (blind reserve)
- Card goes to your hand (hidden reserve, max 3 reserved cards)
- You receive 1 Golden Pollen token from the supply (if available)
- Reserved cards can be bought on future turns using Action 2
- Reserving is strategic: deny opponents a card they need while banking a gold token

---

## GAME MODES

### Solo Puzzle Mode (Easy)
- No AI opponent
- Goal: reach 15 GP in as few turns as possible
- Supply: 4 per color + 3 gold
- Only 3 Pollinators active
- Score = number of turns to reach 15 GP (lower is better)
- If you reach turn 30 without 15 GP: game over, score = total GP earned
- Personal best tracking per turn count

### vs AI (Medium)
- 1 AI opponent
- Standard competitive rules: first to 15 GP wins
- Supply: 5 per color + 5 gold
- 4 Pollinators active
- AI plays at "Greedy" level (see AI section)

### vs Smart AI (Hard)
- 1 AI opponent
- Same as Medium but AI plays at "Strategic" level
- 5 Pollinators active
- Supply: 5 per color + 5 gold

---

## AI OPPONENT DESIGN

### Why AI Matters Here

Unlike Boggle or Minesweeper, this game NEEDS an opponent to create tension. Without someone threatening to take the card you want, there's no urgency. Even mediocre AI transforms the experience.

### AI: Greedy (Medium Difficulty)

Simple decision tree, evaluated each turn:

```
Priority 1: Can I buy a card worth 3+ GP? → BUY IT (pick highest GP)
Priority 2: Can I buy a card worth 1-2 GP that also gets me closer to a Pollinator? → BUY IT
Priority 3: Can I buy any Tier 2+ card? → BUY IT (pick the one closest to a Pollinator requirement)
Priority 4: Can I buy any Tier 1 card? → BUY the one producing the color I have least of
Priority 5: COLLECT POLLEN → Take 3 different colors, preferring colors needed for affordable cards
Never reserves (too complex for greedy AI)
```

**Greedy AI timing:** 600-1000ms "thinking" delay

### AI: Strategic (Hard Difficulty)

Evaluates all possible actions and scores them:

```
For each possible action (collect tokens, buy card, reserve card):
  Score the action based on:
  
  BUY scoring:
  + GP value × 10
  + 5 if this card's production color moves toward a Pollinator
  + 3 if this card makes a Tier 3 card affordable within 2 turns
  + 8 if buying this DENIES the player a card they likely need
    (check if player's production colors align with this card's cost)
  - 2 per token spent (prefer efficient purchases)
  
  COLLECT scoring:
  + 3 per token that moves toward buying a specific target card
  + 1 for taking 3 different (flexibility)
  + 5 for taking 2 of a scarce color the player also needs
  
  RESERVE scoring:
  + 6 if the card is a Tier 3 with 4+ GP that the player could buy soon
  + 4 for the gold token gained
  + 2 if it blocks a player's likely purchase path
  
Pick the highest-scoring action (ties broken randomly)
```

**Strategic AI timing:** 800-1200ms "thinking" delay

### AI Personality (Subtle, Builds Trust)

- AI never plays instantly (always has a thinking delay)
- After AI buys a high-value card: no gloating, just a subtle pulse on the card
- After AI claims a Pollinator: brief butterfly/bee animation on the Pollinator tile
- AI's actions should be visible and understandable — show what the AI took and why (brief text: "AI bought Forest Sapling (+2 GP)")

---

## MOBILE UI LAYOUT

Target: Pixel 9 (412×924 CSS viewport)

This is the most complex UI on the platform. Every piece of information matters. Here's the layout:

```
┌────────────────────────────────────┐
│  🐝 Queen Bee     Turn: 12    │
│  You: 9 GP  │  AI: 7 GP          │
├────────────────────────────────────┤
│  POLLINATORS                       │
│  [🦋 3/3+3/3] [🐝 2/3+2/3] [...]│
│   (claimed!)   (in progress)       │
├────────────────────────────────────┤
│  MARKET                            │
│  Tier 3: [Card][Card][Card][Card] │
│  Tier 2: [Card][Card][Card][Card] │
│  Tier 1: [Card][Card][Card][Card] │
├────────────────────────────────────┤
│  POLLEN SUPPLY                     │
│  🟢:3 🌸:4 🔵:2 🟡:5 ⚪:4 ⭐:3 │
├────────────────────────────────────┤
│  YOUR POLLEN: 🟢2 🔵1 ⭐1 (4/10)│
│  YOUR CARDS: 🟢🟢🌸🔵 (4 prod)  │
│  RESERVED: [1 card]               │
├────────────────────────────────────┤
│ [Collect 3 Diff] [Collect 2 Same] │
│ [Buy Card] [Reserve Card]         │
├────────────────────────────────────┤
│  ⚡ Hashes: 3                      │
└────────────────────────────────────┘
```

### Card Rendering (Small Cards in Market)

Market cards must be readable at small size. Each card is approximately 70×100px:

```
┌──────────┐
│GP:2    🟢│  ← top line: GP value + production color dot
│          │
│ 🌿 art  │  ← small botanical icon (leaf/bloom/tree by tier)
│          │
│🟢🟢🔵🟡│  ← cost: colored dots along bottom
└──────────┘
```

**Tier visual distinction:**
- Tier 1 cards: thin green border, small leaf icon
- Tier 2 cards: medium amber border, small bush icon
- Tier 3 cards: thick gold border, small tree icon

**Tap a card → expand to detail view:**
Show full-size card (200×280px) centered on screen with:
- All info at readable size
- "Buy" button (grayed out if can't afford)
- "Reserve" button (grayed out if 3 already reserved)
- "Close" button
- Semi-transparent backdrop behind

### Scrollable Layout

The full UI is taller than one screen. Use a scrollable container within the game panel:
- Pollinators + Market visible on first scroll position (top priority)
- Supply + your status + actions visible by scrolling down slightly
- Keep GP scores pinned at top (always visible)

**Alternative: Collapsible sections.** Pollinators can collapse to a single row of icons after first viewing. Supply can show as a compact single line.

### Player's Production Display

Show permanent production as colored dots in a row:
```
Your Plants: 🟢🟢🌸🔵 = produces 2 green, 1 rose, 1 blue per turn
```

This is the "engine" visualized. Watching this row grow is the core satisfaction.

---

## HOW BUYING WORKS (Step by Step)

This is the most complex interaction. Must be crystal clear.

### Step 1: Player taps a market card
→ Card expands to detail view

### Step 2: Detail view shows affordability
```
┌──────────────────────────────┐
│  Forest Sapling               │
│  Tier 2 — Produces: 🟢       │
│  Growth Points: +2            │
│                                │
│  Cost:                         │
│  🟢 × 3  (you produce 2, need 1 from tokens ✓)
│  🔵 × 2  (you produce 0, need 2 from tokens ✓)
│  🟡 × 1  (you produce 1, need 0 — FREE! ✓)
│                                │
│  Total token cost: 1🟢 + 2🔵 │
│  You have: 2🟢 + 3🔵 — CAN AFFORD │
│                                │
│  [BUY]         [RESERVE]      │
│          [CLOSE]               │
└──────────────────────────────┘
```

### Step 3: Player taps BUY
→ Tokens deducted from hand (returned to supply)
→ Card slides from market to player's tableau
→ Market slot refills from deck
→ Production row updates (new dot added)
→ GP counter updates
→ Check Pollinators for auto-claim
→ Turn ends, AI takes its turn

### Key UX: Show the Math

The affordability breakdown (what you produce vs. what you need to pay from tokens) is the CORE learning moment. New players don't understand how production works until they see "you produce 2 green, so you only need 1 green token." This click moment is when the game hooks them.

**Always show:**
- Full cost of the card
- How much your permanent production covers
- How many tokens you actually need to pay
- Whether you can afford it (green checkmark vs red X)
- If Golden Pollen could fill a gap: "Use 1 ⭐ for missing blue?"

---

## ONBOARDING (First Play Only)

This game NEEDS a tutorial. Engine-building is not intuitive like matching pairs.

### Interactive Tutorial (5 steps, plays out on a simplified board)

**Step 1: "Welcome to the Garden"**
"Grow a garden of plants that produce pollen. Use pollen to grow bigger plants. Reach 15 Growth Points to win."
[Show the market with 4 Tier 1 cards]

**Step 2: "Collect Pollen"**
"First, collect pollen from the supply. Tap 3 different colors."
[Highlight the supply, guide player to tap 3 colors]
→ Player collects 3 pollen tokens

**Step 3: "Buy Your First Plant"**
"Now buy a Seedling! This one costs 2 green + 1 blue. You have enough!"
[Highlight an affordable Tier 1 card, guide to tap and buy]
→ Card joins player's tableau
"This plant now produces green pollen permanently! See?"
[Highlight the production dot that appeared]

**Step 4: "Your Engine Grows"**
"Next turn, this card costs 3 green. But you already produce 1 green. So you only need 2 green tokens!"
[Show the math breakdown with arrows]
→ Player buys another card
"Now you produce 2! Every card makes the next one easier."

**Step 5: "Race to 15!"**
"Buy expensive Ancient Trees for big Growth Points. Attract Pollinators for bonus points. First to 15 wins!"
[Show a Tier 3 card and a Pollinator tile]
"Ready? Let's play for real."
→ Tutorial ends, real game starts

**Total tutorial time:** ~90 seconds. Skip button available. Never shows again after completion.

---

## ANIMATIONS

### Card Purchase
1. Tokens fly from player's hand to supply (100ms each, staggered)
2. Card slides from market to player's tableau area (300ms)
3. New production dot appears with a pop animation (scale 0 → 1.2 → 1.0, 200ms)
4. GP counter rolls up if card has GP
5. Market slot refills from deck (card slides in from deck, 200ms)

### Pollinator Claim
1. Pollinator tile pulses gold (300ms)
2. Tile slides/flies to the claiming player's area
3. Butterfly/bee/etc icon does a small flight animation
4. GP counter jumps up by 3

### Token Collection
- Tokens float from supply to player's hand area (150ms per token, staggered)
- Subtle "clink" sound per token

### AI Turn
- Brief "thinking" indicator (pulsing dots, 600-1200ms)
- AI's action plays out with the same animations as the player
- Brief text overlay: "AI collected 3 pollen" or "AI bought Canopy Oak (+4 GP)"
- 500ms pause after AI action before player's turn starts

### Game Win
- GP counter hits 15 → numbers glow gold
- All player's cards do a gentle wave animation
- "Garden Complete!" with botanical flourish
- Pollinators (if claimed) do flight animation around the screen

---

## SOUND DESIGN (Web Audio API)

| Event | Sound |
|-------|-------|
| Token collected | Soft crystalline "clink" (high sine, 60ms) |
| Card purchased | Satisfying "plant growing" — ascending two-note (200ms) |
| Pollinator claimed | Bright triumphant chime + subtle buzz (bee) (400ms) |
| Card expanded (detail view) | Soft paper unfold (white noise, filtered, 80ms) |
| Invalid action | Dull thud (low sine, 60ms) |
| AI thinking | Silence (tension) |
| AI action | Same sounds as player but slightly muted (80% volume) |
| Win | Full ascending arpeggio + nature ambience swell (800ms) |
| Lose | Gentle descending chord — not harsh (400ms) |

---

## HASH INTEGRATION

### Attention Weight Entry

```javascript
pollen: {card_buy:0, milestone:1, game_complete:3, efficient_win:2, pollinator_claim:1, default:0}
```

### Hash Events

| Event | Trigger | Hashes |
|-------|---------|--------|
| milestone | At 5 GP, 10 GP, and 15 GP | 1 each = 3 total |
| game_complete | Game ends (win or lose, any mode) | 3 × _dm |
| efficient_win | Win in 20 or fewer turns (Puzzle mode) | 2 |
| pollinator_claim | Each Pollinator claimed by player | 1 each |

### Difficulty Multiplier

- Puzzle Mode (solo): `_dm = 1.0`
- vs Greedy AI: `_dm = 1.5`
- vs Strategic AI: `_dm = 2.0`

### Target Hash Rate

Typical game with AI: 3 milestones + 3 completion + 1-2 pollinators = 7-8 base hashes × multiplier. Games last 10-15 minutes. Excellent hash rate for a strategy game.

---

## RECORDS

```javascript
pollen: {
  gamesPlayed: 0,
  wins: 0,
  losses: 0,
  
  // Puzzle mode
  bestTurnsPuzzle: null,     // fewest turns to 15 GP
  puzzleGamesPlayed: 0,
  
  // vs AI
  winsVsGreedy: 0,
  winsVsSmart: 0,
  
  // Achievements
  totalCardsBought: 0,
  totalPollinatorsClaimed: 0,
  mostGPOneGame: 0,
  fastestWinTurns: null,
  perfectEngines: 0,          // wins where you produced all 5 colors
  
  // Per-session
  longestWinStreak: 0
}
```

---

## GAME END SCREEN

### Win:
```
┌────────────────────────────────┐
│                                │
│     🐝 Garden Complete! 🐝    │
│                                │
│     You: 17 GP  AI: 12 GP    │
│     Turns: 22                  │
│     Cards Bought: 11           │
│     Pollinators: 2             │
│                                │
│     Your Engine:               │
│     🟢🟢🟢🌸🌸🔵🔵🟡⚪⚪⚪│
│     (11 permanent production!) │
│                                │
│     ⚡ +11 Hashes Earned       │
│                                │
│   [Play Again]  [Harder AI]    │
│                                │
└────────────────────────────────┘
```

### Lose:
```
│     Garden Still Growing...    │
│     You: 12 GP  AI: 16 GP    │
│                                │
│     Your engine was strong —   │
│     the AI was just faster     │
│     this time.                 │
│                                │
│   [Try Again]  [Easier Mode]   │
```

Soft loss messaging. The garden is "still growing," not "dead." Encourage retry.

---

## BALANCE TESTING REQUIREMENTS

### This Game MUST Be Stress-Tested

Engine-building games live or die on card balance. If any strategy is obviously dominant, the game becomes solved and boring. Stephen flagged this and he's right.

### Test Protocol

1. **AI vs AI simulation (1000 games):** Run both AI levels against each other. Track which colors get overrepresented in winning strategies. If one color wins >25% more than others, the card economy is unbalanced.

2. **Greedy strategy test:** Can a player win by ONLY buying the cheapest available card every turn? If yes, Tier 3 cards aren't rewarding enough.

3. **Rush strategy test:** Can a player win by ignoring Tier 1 entirely and saving for Tier 3? If yes, Tier 1 cards aren't cheap enough.

4. **Pollinator balance test:** Are certain Pollinators claimed >2× more than others? If so, their requirements may be too easy.

5. **Turn count distribution:** Across 100 AI games, winning turn count should average 20-25 turns. Under 15 = too fast (not enough engine-building). Over 30 = too slow (costs too high).

6. **Fun test (most important):** Stephen plays 5 games on Pixel 9. Does the "engine coming online" moment feel satisfying? Does the AI create real draft tension? Can a new player understand what's happening by game 2?

### Tuning Levers

If balance is off, these are the knobs to turn:
- **Token supply per color:** More tokens = faster games, less scarcity
- **Tier 1 card costs:** Cheaper = faster engine start, quicker overall game
- **Tier 3 GP values:** Higher = more rewarding to build big, shorter endgame
- **Pollinator requirements:** Lower = more achievable, higher = more strategic commitment
- **Hand limit (10 tokens):** Lower = more forced spending, higher = more hoarding

---

## WHAT NOT TO DO

- Do NOT use position:fixed for any game elements
- Do NOT rewrite switchTab
- Do NOT modify any economy values (the Petal Walk economy, not this game's card economy)
- Do NOT copy any specific card values from Splendor or any published game
- Do NOT skip the onboarding tutorial — this game is NOT self-explanatory
- Do NOT let the AI play instantly — thinking delays create tension
- Do NOT hide the production math — showing "you produce 2, need 1 more" is the core learning moment
- Do NOT make the AI too strong on Medium — players should win ~65% on Greedy
- Do NOT make the AI too weak on Hard — players should win ~40% on Strategic
- Do NOT allow turn 1 card purchases (player never has enough tokens)

---

## TESTING CHECKLIST

1. [ ] 90 cards generate with correct distribution (40/30/20 across tiers)
2. [ ] 5 Pollinators selected randomly from pool of 10 each game
3. [ ] Token supply initializes correctly for each mode
4. [ ] Collect 3 different: works, enforces different colors
5. [ ] Collect 2 same: works, enforces 4+ supply rule
6. [ ] Hand limit of 10 tokens enforced with discard prompt
7. [ ] Card purchase: production correctly reduces token cost
8. [ ] Card purchase: Golden Pollen substitutes for any color
9. [ ] Card purchase: market refills from correct tier deck
10. [ ] Reserve: card goes to hand, gold token given, max 3 reserved
11. [ ] Pollinator auto-claims when production requirements met
12. [ ] Pollinator cannot be claimed by both players
13. [ ] GP tracking correct for both players
14. [ ] Game ends when either player reaches 15 GP
15. [ ] AI (Greedy): makes reasonable decisions, never invalid moves
16. [ ] AI (Strategic): demonstrably stronger than Greedy
17. [ ] AI response timing in correct range (600-1200ms)
18. [ ] Affordability breakdown shows correct math in card detail view
19. [ ] Tutorial plays correctly on first launch
20. [ ] Tutorial never shows again after completion
21. [ ] All animations play smoothly
22. [ ] GP counter updates correctly after every card buy and pollinator claim
23. [ ] Solo puzzle mode: tracks turns, scores correctly
24. [ ] Hash events fire at correct milestones
25. [ ] Records save and persist
26. [ ] Soft loss messaging displays correctly
27. [ ] Card detail view opens/closes cleanly
28. [ ] All card info readable at 70×100px market size
29. [ ] Plays correctly on Pixel 9 in Chrome incognito
30. [ ] No overlap with other game panels
31. [ ] Run 100-game AI simulation to verify balance before shipping

---

*Spec complete. Ready for Claude Code build. REQUIRES balance testing before production deployment.*

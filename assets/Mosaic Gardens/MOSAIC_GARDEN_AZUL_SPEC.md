# PETAL WALK — MOSAIC GARDEN (AZUL-STYLE TILE DRAFTING) GAME SPEC
## For: Claude Code (super-duper-enigma)
## From: Claude (Lead Dev) — Director Approved
## Date: April 1, 2026
## R&D Sources: Azul official app, Board Game Arena, Tabletopia, BGG solo variants

---

## WHAT THIS IS

A new game for the Game tab game selector. A tile-drafting pattern game where players take colored tiles from shared factory displays, fill staging rows on their personal board, then score points by transferring completed rows to a mosaic wall. Manage waste, plan patterns, race to complete rows/columns for bonus points.

**Name in game:** "Mosaic Garden" — you're laying colored tiles into a garden mosaic.

**Legal basis:** Tile drafting from shared pools into personal pattern boards is an unprotectable game mechanic. Our tile set, colors, board layout, and scoring values are original. The name "Azul" and its Portuguese tile artwork are protected — we use botanical theming instead.

---

## GAME SELECTOR ENTRY

```javascript
{id:'mosaic', n:'Mosaic Garden', i:'🪻', r:'Draft tiles from garden beds, fill your mosaic rows, score for patterns!'}
```

---

## THE CONCEPT — WHY THIS GAME HOOKS PLAYERS

**The Grab:** 5 factory displays each show 4 random tiles. You pick ALL tiles of one color from one factory. The rest get pushed to the center pool. The greed of scooping 3-4 tiles at once is visceral.

**The Puzzle:** Your board has 5 staging rows (sizes 1-5). Each row can only hold ONE color. When a row fills completely, one tile transfers to your 5×5 mosaic wall. Where it lands matters — adjacent tiles cascade bonus points.

**The Pain:** Tiles that don't fit any staging row go to your floor line — negative points. Taking too many tiles is punishing. The tension between "I need those tiles" and "I can't store them" is the core game.

**The Payoff:** Completed rows, columns, and full-color sets on the wall give big endgame bonuses. The long game rewards planning.

---

## COMPONENTS

### Tile Colors (5 botanical colors)

| Tile | Color | Hex | Icon |
|------|-------|-----|------|
| Petal | Dusty rose | #C47A7A | 🌸 |
| Leaf | Forest green | #4A7C35 | 🌿 |
| Berry | Sky blue | #5B9BD5 | 💧 |
| Sunstone | Golden amber | #D4A843 | ☀️ |
| Frost | Soft cream | #E8DCC8 | ❄️ |

### Tile Counts
- 20 tiles per color × 5 colors = **100 tiles total**
- Stored in a draw bag, shuffled

### Factories (Shared Displays)
- **2 players (us):** 5 factory displays
- Each round: draw 4 random tiles from the bag onto each factory (20 tiles dealt)
- Center area: starts empty, accumulates leftovers

### Player Board
Each player has:
- **5 Staging Rows** (left side): row 1 holds 1 tile, row 2 holds 2, ... row 5 holds 5
- **5×5 Mosaic Wall** (right side): predetermined pattern of where each color goes
- **Floor Line** (bottom): 7 slots for excess tiles with increasing penalties

---

## THE WALL PATTERN

The mosaic wall has a fixed color pattern (same as standard Azul):

```
Row 1: [Petal] [Leaf]  [Berry] [Sun]   [Frost]
Row 2: [Frost] [Petal] [Leaf]  [Berry] [Sun]
Row 3: [Sun]   [Frost] [Petal] [Leaf]  [Berry]
Row 4: [Berry] [Sun]   [Frost] [Petal] [Leaf]
Row 5: [Leaf]  [Berry] [Sun]   [Frost] [Petal]
```

Each color appears exactly once per row and once per column (Latin square). When a staging row completes, the tile transfers to the matching color position in that wall row.

**This means:** If staging row 3 is filled with Petal tiles, the tile goes to row 3, column 3 (where Petal lives in row 3).

---

## GAME FLOW

### Round Structure (repeat 5-7 rounds until game ends)

**Phase 1: DRAFTING**

Players alternate turns. On your turn:

**Option A — Take from a Factory:**
1. Choose one factory display
2. Choose one COLOR from that factory
3. Take ALL tiles of that color from that factory
4. Remaining tiles on that factory move to the CENTER area
5. Place your taken tiles on one staging row (must all go to same row, row must be empty or already have that color)
6. Tiles that overflow or can't be placed go to your floor line

**Option B — Take from the Center:**
1. Take ALL tiles of one color from the center area
2. First player to take from center also takes the "first player" marker (goes to floor line slot 1 — costs -1 point but you go first next round)
3. Place tiles as above

**Drafting ends** when ALL factories and the center are empty.

**Phase 2: WALL-TILING (Scoring)**

For each player, top to bottom:
1. Check each staging row
2. If a staging row is COMPLETELY FILLED:
   - Move the rightmost tile to the corresponding wall position
   - Score that tile (base 1 + adjacency bonuses)
   - Discard remaining tiles from that staging row to the box lid (out of game)
3. If a staging row is NOT full: tiles stay for next round (carry over)
4. Apply floor line penalties
5. Clear floor line

**Phase 3: PREPARE NEXT ROUND**
- Refill factories (4 tiles each from bag)
- If bag is empty, refill from discarded tiles
- If still not enough, use what's available

### Game End Trigger
The game ends at the END of the round where any player completes a HORIZONTAL ROW on their wall (5 tiles in a row). Finish the current round's scoring, then calculate endgame bonuses.

---

## SCORING

### Tile Placement Scoring (during wall-tiling phase)

When a tile is placed on the wall:
- **Isolated tile** (no adjacent tiles horizontally or vertically): **1 point**
- **Has horizontal neighbors:** Count all connected tiles in that row (including the placed tile): **+N points**
- **Has vertical neighbors:** Count all connected tiles in that column (including the placed tile): **+N points**
- If it has BOTH horizontal AND vertical neighbors, count BOTH directions (the placed tile counts for each direction)

**Examples:**
```
Tile placed at X:

[ ][ ][■][ ][ ]     Score: 1 (isolated)
[ ][ ][ ][ ][ ]

[ ][■][X][■][ ]     Score: 3 (horizontal: 3 connected)
[ ][ ][ ][ ][ ]

[ ][ ][■][ ][ ]
[ ][■][X][■][ ]     Score: 3 (horizontal) + 2 (vertical) = 5
[ ][ ][ ][ ][ ]

[■][■][■][X][■]
[ ][ ][ ][■][ ]     Score: 5 (horizontal) + 2 (vertical) = 7
[ ][ ][ ][■][ ]
```

### Floor Line Penalties

| Floor Slot | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|-----------|---|---|---|---|---|---|---|
| Penalty   |-1 |-1 |-2 |-2 |-2 |-3 |-3 |

Total maximum penalty: -14 points. Score cannot go below 0.

### Endgame Bonuses

After the final round:
- **Complete horizontal row** (5 tiles across): **+2 points** per completed row
- **Complete vertical column** (5 tiles down): **+7 points** per completed column
- **All 5 of one color placed** on the wall: **+10 points** per completed color

These bonuses reward long-term pattern planning over pure tactical drafting.

---

## SOLO MODE DESIGN

Based on the highest-rated BGG solo variant, adapted for our platform:

### Ghost Gardener (Solo Opponent)

Instead of a human opponent, a "Ghost Gardener" drafts tiles automatically:

**After your turn:**
1. Ghost picks the factory (or center) with the MOST tiles of a single color
2. Ghost takes all tiles of that color
3. Those tiles are discarded to the box lid (out of game) — they're gone
4. Remaining tiles from that factory go to center (as normal)

**This creates real scarcity** — the Ghost removes tiles from the game without scoring them. You're racing against depletion, not another score.

### Solo Scoring Targets

| Rating | Score |
|--------|-------|
| ⭐ | 0-39 (Seedling) |
| ⭐⭐ | 40-59 (Gardener) |
| ⭐⭐⭐ | 60-79 (Artisan) |
| ⭐⭐⭐⭐ | 80+ (Master Mosaicist) |

### vs AI Mode (Medium/Hard)

For a full competitive experience:

**Medium AI:**
```
1. Score each possible draft (factory + color combination):
   - +5 per tile that completes a staging row this turn
   - +3 per tile that fits an active staging row
   - +2 if this color would place adjacent to existing wall tiles
   - -4 per tile that would go to floor
2. Pick highest scoring option
```

**Hard AI:**
```
All of Medium, plus:
   - +6 if taking this denies the player a color they clearly need
   - +4 if this placement is one step from completing a wall row/column
   - +3 for tiles that work toward the most-advanced color set
   - Look 1 round ahead: evaluate if leaving certain tiles helps or hurts
```

---

## MOBILE UI LAYOUT

Target: Pixel 9 (412×924 CSS viewport)

```
┌────────────────────────────────────┐
│ 🪻 Mosaic Garden    Score: 23     │
│ Round 3 of ~5     Ghost: —        │
├────────────────────────────────────┤
│ GARDEN BEDS (factories)            │
│ ┌──────┐ ┌──────┐ ┌──────┐       │
│ │🌸🌿  │ │☀️💧  │ │❄️❄️  │       │
│ │💧☀️  │ │🌸🌿  │ │🌸💧  │       │
│ └──────┘ └──────┘ └──────┘       │
│ ┌──────┐ ┌──────┐                 │
│ │🌿🌿  │ │☀️❄️  │   CENTER:      │
│ │🌸❄️  │ │💧🌸  │   🌸🌸💧      │
│ └──────┘ └──────┘                 │
├────────────────────────────────────┤
│ YOUR BOARD                         │
│ Staging          Wall              │
│      [🌸]  →  [🌸][ ][ ][ ][ ]  │
│    [🌿][🌿] → [ ][🌸][ ][ ][ ]  │
│  [ ][ ][☀️] → [ ][ ][🌸][ ][ ]  │
│  [ ][ ][ ][ ]→ [ ][ ][ ][🌸][ ] │
│  [ ][ ][ ][ ][ ]→[ ][ ][ ][ ][🌸]│
│ Floor: [-1][-1][-2][-2][-2][-3][-3]│
│         🌿  ☀️                     │
├────────────────────────────────────┤
│ ⚡ Hashes: 3                       │
└────────────────────────────────────┘
```

### Tile Sizes
- Factory tiles: 32×32px (large enough to tap individual colors)
- Staging row tiles: 28×28px
- Wall tiles: 24×24px (smaller, info-dense)
- Floor tiles: 20×20px

### Interaction Flow

**Step 1:** Tap a factory → it highlights, shows available colors
**Step 2:** Tap a COLOR within that factory → all tiles of that color lift/glow
**Step 3:** Tap a STAGING ROW to place them → tiles slide into row slots
- If tiles overflow, overflow auto-goes to floor
- Invalid placement (row has different color) → shake, deselect

**Alternative:** Tap factory, tap color, and the game auto-suggests the best row (highlight it) — player confirms or picks different row. This speeds up play.

### Factory Display Layout
- 5 factories arranged in a 3+2 grid
- Each factory is a rounded rectangle showing 4 tiles in a 2×2 grid
- Center pile shown to the right of factories, tiles stacked/listed
- When a factory is emptied, it dims and shows "empty"

### Wall Display
- 5×5 grid, each cell shows the target color as a faded ghost
- Placed tiles show at full opacity with a subtle 3D shadow
- Unplaced positions show the color at 15% opacity (guide for planning)

### Scoring Animation
When tiles transfer from staging to wall:
1. Tile slides from staging row to wall position (300ms)
2. Score counter ticks up (each adjacent tile highlights briefly)
3. If completing a row/column: brief golden flash along the completed line
4. Floor penalties: each penalty tile shakes, score ticks down in red

---

## ANIMATIONS

| Event | Animation |
|-------|-----------|
| Take tiles from factory | Tiles lift (scale 1.1), others slide to center |
| Place tiles in staging | Tiles slide from selection to row slots, left to right |
| Staging row completes | Brief glow, tiles pulse |
| Wall transfer | Tile slides from staging → wall position (300ms arc) |
| Score cascade | Adjacent wall tiles briefly illuminate in sequence |
| Floor penalty | Penalty tiles shake, score pulses red |
| Endgame bonus | Completed rows/columns highlight gold, bonus points float up |
| Round transition | Factories refill from bag (tiles cascade in) |
| Ghost takes tiles | Tiles fade out with a ghostly swirl effect |

---

## SOUND DESIGN (Web Audio API)

| Event | Sound |
|-------|-------|
| Tile draft (take from factory) | Ceramic "clink" — satisfying grab |
| Tiles to center (leftover push) | Soft scatter/slide sound |
| Place in staging | Soft "click" per tile |
| Wall transfer | Heavier ceramic "thunk" — tile setting into mosaic |
| Score tick up | Quick ascending pip per point |
| Floor penalty | Descending dull tone per penalty point |
| Row/column complete | Bright chime |
| Color set complete | Triumphant chord |
| Game end | Full arpeggio |

The wall transfer "thunk" is the signature sound — like a mosaic tile being set into plaster. It needs weight and satisfaction.

---

## HASH INTEGRATION

```javascript
mosaic: {round_complete:1, game_complete:3, high_score:2, perfect_round:1, default:0}
```

| Event | Trigger | Hashes |
|-------|---------|--------|
| round_complete | End of each scoring phase | 1 per round (~5 rounds = 5) |
| game_complete | Game finishes | 3 × _dm |
| high_score | Beat personal best | 2 |
| perfect_round | Complete a round with 0 floor penalties | 1 |

Difficulty: Solo=1.0, vs Medium AI=1.5, vs Hard AI=2.0

Target: 8-11 hashes per game, 10-15 minute sessions.

---

## RECORDS

```javascript
mosaic: {
  gamesPlayed: 0,
  highScore: 0,
  totalScore: 0,
  avgScore: 0,
  completedRows: 0,
  completedColumns: 0,
  completedColors: 0,
  perfectRounds: 0,
  totalFloorPenalties: 0,
  bestRoundScore: 0,
  winsVsAI: 0,
  fourStarGames: 0
}
```

---

## STRESS TEST REQUIREMENTS

1. **Solo score distribution:** Average should be 45-65 points. Under 30 = Ghost too aggressive. Over 80 = Ghost too passive.
2. **Game length:** 5-7 rounds typical. Under 4 = wall completes too fast (tiles too cheap). Over 8 = wall never completes (too hard to fill rows).
3. **Floor penalty rate:** 15-25% of tiles should hit the floor across all games. Under 10% = no tension. Over 35% = too punishing.
4. **Color distribution:** All 5 colors should appear on walls roughly equally. Any color >25% or <15% = factory generation bias.
5. **Endgame bonus frequency:** Players should complete 2-3 rows, 0-1 columns, 0-1 color sets on average. Columns and color sets should be rare but achievable.
6. **AI balance:** Medium AI should beat random play 80%+. Hard AI should beat Medium 65%+.

---

## WHAT NOT TO DO

- Do NOT use position:fixed for any game elements
- Do NOT rewrite switchTab
- Do NOT modify any economy values
- Do NOT skip the staging → wall transfer animation — it IS the scoring moment
- Do NOT let players place tiles on a staging row that already has a different color
- Do NOT let players place tiles on a staging row whose wall position is already filled
- Do NOT forget the first-player-from-center penalty (-1 floor tile)
- Do NOT make the Ghost too aggressive (players should score 40-70 in solo)
- Do NOT hide the wall pattern — the ghost/faded colors are essential for planning
- Do NOT auto-play the wall transfer — let the player see each tile's score accumulate

---

## TESTING CHECKLIST

1. [ ] 100 tiles generated correctly (20 per color)
2. [ ] 5 factories show 4 random tiles each at round start
3. [ ] Taking all tiles of one color from a factory works
4. [ ] Remaining factory tiles move to center
5. [ ] Taking from center works, first player marker applied
6. [ ] Tiles place correctly in staging rows (one color per row)
7. [ ] Overflow tiles go to floor automatically
8. [ ] Staging row carries over if not complete
9. [ ] Complete staging row triggers wall transfer at end of round
10. [ ] Tile goes to correct wall position based on color + row
11. [ ] Cannot place in a staging row whose wall position is filled
12. [ ] Scoring: isolated tile = 1 point
13. [ ] Scoring: horizontal chain counted correctly
14. [ ] Scoring: vertical chain counted correctly
15. [ ] Scoring: both directions counted when applicable
16. [ ] Floor penalties applied correctly (-1,-1,-2,-2,-2,-3,-3)
17. [ ] Score cannot go below 0
18. [ ] Game ends when any horizontal wall row is complete
19. [ ] Endgame bonuses: +2 per complete row, +7 per column, +10 per color
20. [ ] Ghost Gardener drafts correctly in solo mode
21. [ ] AI makes reasonable drafting decisions
22. [ ] Bag refills from discard when empty
23. [ ] All animations play smoothly
24. [ ] Factory and center emptying detection triggers phase transition
25. [ ] Hash events fire correctly
26. [ ] Records save and persist
27. [ ] Plays correctly on Pixel 9 in Chrome incognito

---

*Spec complete. Prototype and stress test to follow.*

# PETAL WALK — VINE CROSS (GOMOKU/FIVE IN A ROW) GAME SPEC
## For: Claude Code | Director Approved | April 1, 2026
## R&D: Gomoku Quest, Pikachu Gomoku, Pente, Reddit r/abstractgames r/gomoku

---

## WHAT THIS IS

Five in a row on a grid. Place stones, get 5 connected (horizontal, vertical, or diagonal) to win. Player vs AI. Zero luck — pure strategy. 200M+ players in Asia.

**Name:** "Vine Cross" — grow your vine across the garden trellis.

**Legal:** Gomoku is public domain (originated in Japan, 1800s). No IP concerns.

---

## GAME SELECTOR ENTRY

```javascript
{id:'vinecross', n:'Vine Cross', i:'⚫', r:'Place stones to get 5 in a row. Block your opponent! Pure strategy.'}
```

---

## CORE RULES

1. Grid of intersections (default 11×11)
2. Players alternate placing one stone per turn
3. Player = green stones (vines), AI = rose stones (thorns)  
4. First to get exactly 5 in a row (horizontal, vertical, or diagonal) wins
5. If board fills with no 5-in-a-row: draw (extremely rare)

### Board Sizes
- 9×9: Quick games, beginner-friendly (~3 min)
- 11×11: Default sweet spot for mobile (~5 min)
- 13×13: Advanced (~8 min)
- 15×15: Tournament standard (~12 min)

### Swap Rule (Medium/Hard modes)
After the first player places their first stone, the second player can choose to SWAP colors instead of placing. This eliminates first-player advantage — the standard tournament fix.

For our game: Player always goes first. On Medium/Hard, the AI will swap if the player's opening move is too strong (center or near-center). This teaches players about fair openings.

---

## AI DESIGN — 10 Difficulty Levels

### Core: Minimax + Alpha-Beta + Pattern Evaluation

```javascript
var PATTERNS = {
  FIVE:       100000,  // 5 in a row — win
  OPEN_FOUR:   10000,  // .XXXX. — guaranteed win
  HALF_FOUR:    5000,  // OXXXX. or .XXXXO — win if not blocked
  OPEN_THREE:   1000,  // .XXX. — two moves from win
  HALF_THREE:    500,  // OXXX. — one-sided three
  OPEN_TWO:      100,  // .XX. — building
  HALF_TWO:       10   // OXX. — early development
};

function evaluate(board, player) {
  var score = 0;
  // Scan all rows, columns, diagonals
  // For each window of 5 cells:
  //   Count player stones, opponent stones, empty
  //   Match against pattern table
  //   Add/subtract score
  // Weight defensive patterns at 1.1x (slightly prefer blocking)
  return score;
}
```

### Difficulty Levels

| Level | Name | Minimax Depth | Behavior |
|-------|------|--------------|----------|
| 1 | Seedling | 0 | Random valid moves (prefers center area) |
| 2 | Sprout | 1 | Blocks immediate wins, otherwise random |
| 3 | Bud | 1 | Blocks wins + makes own pairs |
| 4 | Leaf | 2 | 2-ply search, basic evaluation |
| 5 | Stem | 3 | 3-ply, fuller evaluation |
| 6 | Branch | 4 | 4-ply, strong intermediate |
| 7 | Canopy | 5 | 5-ply, solid club player |
| 8 | Grove | 6 | 6-ply, expert |
| 9 | Forest | 7 | 7-ply + threat detection |
| 10 | Ancient | 8 | 8-ply + threats + opening book |

**Key insight from Reddit complaints:** Levels 1-5 should feel like a smooth learning curve. 6-8 should challenge experienced players. 9-10 should be genuinely hard to beat. NEVER jump difficulty abruptly.

### AI Response Timing
- Levels 1-3: 300-500ms (instant feel but not jarring)
- Levels 4-6: 500-800ms
- Levels 7-8: 800-1200ms
- Levels 9-10: 1000-1500ms (thinking feel)

### Move Ordering (for alpha-beta efficiency)
Before running minimax, sort candidate moves by:
1. Adjacent to existing stones (no isolated moves)
2. Threat responses first (blocks/extends 3s and 4s)
3. Center-preference for early game

This reduces the effective branching factor from ~100 to ~15-20, making depth 6-8 feasible in real-time.

---

## POST-GAME ANALYSIS (Reddit's #1 request)

After every game (win or lose):

### Winning Line Highlight
- The 5-in-a-row that won is highlighted with a bright glow line connecting the stones
- Winning stones pulse with color

### Critical Move Indicator
- The move where the losing player "lost" the game is marked with a red diamond
- Definition: the first move after which the evaluation swings permanently to the winner's favor by >5000 points (meaning a forced win exists)
- Tooltip: "This move allowed an unstoppable threat"

### Move-by-Move Replay
- Step through the game move by move with ◀▶ buttons
- At each step, show the board evaluation bar (green vs rose, like a chess engine bar)
- This teaches players to understand position strength

### This Feature Alone Differentiates Us
No major Gomoku app offers accessible post-game analysis. Chess apps do (Lichess, Chess.com). We're bringing that standard to Gomoku.

---

## THREAT VISUALIZATION (Optional Toggle)

When enabled (toggle in settings, OFF by default):
- All "open three" patterns on the board show a subtle dotted line extending to their potential winning cells
- All "open four" patterns glow with a warning color
- Player's threats: green dotted lines
- AI's threats: rose dotted lines

**This is a LEARNING TOOL, not a cheat.** New players can't "see" threats — they don't know what a fork (two open threes) looks like. This visualization teaches threat awareness, the #1 skill in Gomoku.

Disable for competitive play. Enable by default for levels 1-4.

---

## HINT SYSTEM

3 hints per game:
- Tap 💡 → show top 3 recommended moves as numbered circles on the board
- #1 = best move (largest circle, brightest)
- #2, #3 = alternatives (smaller, dimmer)
- Hints stay visible for 3 seconds then fade
- Using hints is fine — this is a learning platform, not a tournament

---

## MOBILE UI LAYOUT

Target: Pixel 9 (412×924 CSS viewport)

```
┌────────────────────────────────────┐
│ ⚫ Vine Cross     Level 5 (Stem)  │
│ You: 🟢  AI: 🌸   Move: 12      │
├────────────────────────────────────┤
│                                    │
│  ┌─┬─┬─┬─┬─┬─┬─┬─┬─┬─┬─┐       │
│  ├─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┤       │
│  ├─┼─┼─┼─●─┼─┼─┼─┼─┼─┼─┤       │
│  ├─┼─┼─┼─┼─○─┼─┼─┼─┼─┼─┤       │
│  ├─┼─┼─●─●─●─┼─┼─┼─┼─┼─┤       │
│  ├─┼─┼─┼─○─○─┼─┼─┼─┼─┼─┤       │
│  ├─┼─┼─┼─┼─┼─●─┼─┼─┼─┼─┤       │
│  ├─┼─┼─┼─┼─┼─┼─┼─┼─┼─┼─┤       │
│  ...                               │
│  └─┴─┴─┴─┴─┴─┴─┴─┴─┴─┴─┘       │
│                                    │
│  [Eval bar: ████████░░░ +320]     │
│                                    │
├────────────────────────────────────┤
│  [↩ Undo] [💡 3] [📊 Analysis]   │
│  ⚡ Hashes: 2                      │
└────────────────────────────────────┘
```

### Board Sizing

| Grid | Intersection Size | Total Board |
|------|------------------|-------------|
| 9×9 | 36px | 324px |
| 11×11 | 30px | 330px |
| 13×13 | 26px | 338px |
| 15×15 | 22px | 330px |

All fit within 340px. Minimum tap target is 22px for 15×15 — tight but workable since stones snap to nearest intersection.

### Board Rendering
- Background: warm wood texture (#DEB887 with subtle grain via CSS gradient)
- Grid lines: thin dark lines (#4A3728) 
- Star points: small dots at traditional positions (for 11×11: center + 4 corners of inner box)
- Stones: circular with radial gradient for 3D look
  - Player: green (#4A7C35 center, #3a6028 edge) — vine stones
  - AI: rose (#C47A7A center, #a05555 edge) — thorn stones
- Last move indicator: small bright dot on the most recently placed stone

### Evaluation Bar
Below the board, a horizontal bar shows the AI's assessment of the position:
- Green (left) = player advantage
- Rose (right) = AI advantage
- Centered = even
- Number shows the raw evaluation score

This is borrowed from chess engines (Lichess/Stockfish bar) and gives immediate feedback on whether a move was good or bad.

---

## ANIMATIONS

| Event | Animation |
|-------|-----------|
| Stone placed | Scale 0→1.1→1.0 with slight bounce (150ms) |
| Stone placed — sound | Soft "tok" — wood on wood |
| Last move marker | Small dot pulses on newest stone |
| AI thinking | Three subtle dots pulsing under the board ("...") |
| Win — 5 in a row | Winning line glows, stones in the line pulse, bright connecting line drawn |
| Win — celebration | Brief confetti, "Vine Complete!" text |
| Loss | Gentle "Garden Overgrown..." text, no harsh sounds |
| Hint | 3 numbered circles fade in on recommended intersections |
| Undo | Stone shrinks to 0 and vanishes (100ms) |
| Threat lines (when enabled) | Subtle dotted lines extending from open patterns |
| Eval bar update | Smooth slide to new position (200ms ease) |

### Win Line Animation (THE Payoff)
1. Brief pause (200ms) after winning stone placed
2. Bright line draws through all 5 winning stones (300ms, left-to-right or top-to-bottom)
3. Winning stones pulse with enhanced glow
4. Board dims except winning line
5. Victory text + stars appear after 500ms

---

## SOUND DESIGN

| Event | Sound |
|-------|-------|
| Stone placed (player) | Warm "tok" — wood tap (sine 300Hz + noise burst, 40ms) |
| Stone placed (AI) | Slightly different "tok" — higher pitch (sine 400Hz, 40ms) |
| Capture threat created | Subtle tension tone (low sine 150Hz, 200ms, barely audible) |
| Win | Ascending 5-note melody (one note per winning stone, staggered) |
| Loss | Gentle descending two-note |
| Hint | Soft bell (sine 800Hz, 150ms) |
| Undo | Quiet reverse "pop" |

**The stone placement "tok"** should feel like a Go stone on a wooden board — one of the most satisfying sounds in gaming. Warm, resonant, solid.

---

## HASH INTEGRATION

```javascript
vinecross: {game_complete:3, win_bonus:2, analysis_view:1, streak_bonus:2, default:0}
```

| Event | Trigger | Hashes |
|-------|---------|--------|
| game_complete | Any finished game (win, loss, or draw) | 3 × _dm |
| win_bonus | Winning the game | 2 |
| analysis_view | Viewing post-game analysis (incentivize learning) | 1 |
| streak_bonus | 3-game win streak | 2 |

Difficulty multiplier: Levels 1-3=1.0, 4-6=1.5, 7-8=2.0, 9-10=2.5

---

## RECORDS

```javascript
vinecross: {
  gamesPlayed: 0,
  wins: 0, losses: 0, draws: 0,
  winsByLevel: [0,0,0,0,0,0,0,0,0,0], // index 0-9 for levels 1-10
  currentWinStreak: 0,
  bestWinStreak: 0,
  highestLevelBeaten: 0,
  totalMoves: 0,
  averageGameLength: 0,
  analysisViewed: 0
}
```

### Level Progression
- Start at Level 1 unlocked
- Beat a level 2 times → unlock next level
- This prevents frustration from jumping too high too fast

---

## STRESS TEST REQUIREMENTS

1. **AI strength verification:** At each level, AI should beat the level below it >65% of the time
2. **AI response time:** All levels complete within their time budget on Pixel 9
3. **No illegal moves:** AI never places on an occupied intersection
4. **Win detection:** Correctly identifies all horizontal, vertical, and diagonal 5-in-a-rows
5. **Draw detection:** Correctly handles full board with no winner
6. **First-player advantage:** Without swap rule, first player should win 55-60% (natural game bias). With swap rule, should drop to 50-52%.
7. **Game length distribution:** Average 30-60 total moves for 11×11. Under 20 = AI too weak. Over 80 = AI too passive.
8. **Pattern evaluation accuracy:** Unit tests for every pattern type (open four, half three, etc.)

---

## WHAT NOT TO DO

- Do NOT use position:fixed
- Do NOT rewrite switchTab
- Do NOT modify economy values
- Do NOT make the default board 15×15 (too big for mobile — use 11×11)
- Do NOT skip the evaluation bar (it's the teaching tool)
- Do NOT make AI level jumps feel abrupt
- Do NOT forget the last-move indicator (players lose track without it)
- Do NOT allow placing on occupied intersections
- Do NOT skip post-game analysis (it's our differentiator)
- Do NOT make threat visualization default ON (overwhelming for beginners)

---

## TESTING CHECKLIST

1. [ ] Board renders correctly at all 4 sizes
2. [ ] Stones place on intersections with tap
3. [ ] No double-placement on occupied spots
4. [ ] Win detection: horizontal 5
5. [ ] Win detection: vertical 5
6. [ ] Win detection: diagonal 5 (both directions)
7. [ ] Win line animation highlights correct stones
8. [ ] AI plays valid moves at all 10 levels
9. [ ] AI difficulty scales smoothly (no cliff)
10. [ ] AI responds within time budgets
11. [ ] Swap rule functions on Medium/Hard
12. [ ] Undo works (removes last player+AI move pair)
13. [ ] Hint shows 3 recommended moves
14. [ ] Post-game analysis: winning line highlighted
15. [ ] Post-game analysis: critical move marked
16. [ ] Move-by-move replay with eval bar
17. [ ] Threat visualization toggles on/off
18. [ ] Evaluation bar updates after each move
19. [ ] Level progression: unlock next level after 2 wins
20. [ ] Stone placement sound plays
21. [ ] Hash events fire correctly
22. [ ] Records save and persist
23. [ ] Plays on Pixel 9 in Chrome incognito
24. [ ] Board sizes switchable from settings

---

*Spec complete. Prototype and stress test follow.*

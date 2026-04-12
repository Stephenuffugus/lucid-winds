# PETAL WALK — SEED SOWING (MANCALA) GAME SPEC
## For: Claude Code (super-duper-enigma)
## From: Claude (Lead Dev) — Director Approved
## Date: March 31, 2026

---

## WHAT THIS IS

A new game for the Game tab game selector. Classic Mancala pit-and-seed board game, player vs AI. Two rule variants: Kalah (Easy/Medium) and Oware (Hard). The botanical theme is a perfect fit — you are literally sowing seeds.

**Design reference:** Modeled after the best features of Gazeus Games Mancala (animation quality), cardgames.io (speed and responsiveness), and CoolMathGames (onboarding clarity).

---

## GAME SELECTOR ENTRY

Add to the G array:

```javascript
{id:'mancala', n:'Seed Sow', i:'🌰', r:'Sow seeds pit to pit. Capture the most to win! Tap a pit to sow.'}
```

---

## BOARD LAYOUT

Classic Mancala board: 2 rows of 6 pits + 2 stores (one on each end).

```
        ┌───────────────────────────────────┐
        │           AI's Store (left)       │
        │  ┌────┐                    ┌────┐ │
        │  │    │ [6] [5] [4] [3] [2] [1] │ │  ← AI's pits (top row, right to left)
        │  │ AI │                    │ YOU│ │
        │  │    │ [1] [2] [3] [4] [5] [6] │ │  ← Player's pits (bottom row, left to right)
        │  └────┘                    └────┘ │
        │           Player's Store (right)  │
        └───────────────────────────────────┘
```

**Orientation:** Player's pits are on the bottom. Player's store is on the right. AI's pits are on the top (mirrored). AI's store is on the left. Sowing direction is counterclockwise.

**Counterclockwise path from player's perspective:** Player pit 1 → 2 → 3 → 4 → 5 → 6 → Player Store → AI pit 1 → 2 → 3 → 4 → 5 → 6 → AI Store → back to Player pit 1. (Skip opponent's store during sowing — standard rule.)

---

## STARTING POSITION

- **Kalah mode:** 4 seeds per pit (48 seeds total)
- **Oware mode:** 4 seeds per pit (48 seeds total)

Both modes start identically. The rules diverge on captures and extra turns.

---

## RULES: KALAH MODE (Easy / Medium difficulty)

### Sowing
1. Player taps one of their 6 pits (must contain at least 1 seed)
2. All seeds are picked up from that pit
3. Seeds are dropped one-per-pit counterclockwise
4. SKIP the opponent's store (never drop a seed there)
5. DO drop a seed in your own store when passing it

### Free Turn
If the last seed lands in the player's own store → player gets another turn immediately. Visual indicator: store glows, text says "Free Turn!"

### Capture
If the last seed lands in an EMPTY pit on the player's side AND the opposite pit (AI's side) has seeds → capture that last seed AND all seeds from the opposite pit. All captured seeds go into the player's store.

**Opposite pit mapping:**
- Player pit 1 ↔ AI pit 6
- Player pit 2 ↔ AI pit 5
- Player pit 3 ↔ AI pit 4
- Player pit 4 ↔ AI pit 3
- Player pit 5 ↔ AI pit 2
- Player pit 6 ↔ AI pit 1

### Game End
Game ends when ALL 6 pits on one side are empty. The player who still has seeds in their pits collects all remaining seeds into their store. Highest store count wins.

---

## RULES: OWARE MODE (Hard difficulty)

### Sowing
Same as Kalah — pick up all seeds, sow counterclockwise, one per pit.

### Key Differences from Kalah
1. **No free turns.** Landing in your store does NOT grant an extra turn.
2. **No store sowing.** Seeds are only sowed into the 12 pits, never into stores. Stores only receive captured seeds.
3. **Capture rule:** If the LAST seed lands in an opponent's pit AND that pit now has exactly 2 or 3 seeds → capture those seeds. ALSO capture from any consecutive preceding pits (moving backward along the sowing path) that also have 2 or 3 seeds. This chain capture is what makes Oware deep.
4. **Grand Slam protection:** If a capture would take ALL seeds from the opponent's side, the capture is forfeited (no seeds taken). You must always leave the opponent with at least one seed to play.
5. **Starvation rule:** If a player has no seeds and the opponent cannot sow into their side, the opponent captures all remaining seeds.

### Game End
Game ends when one side is empty (or no legal moves exist). Player with 25+ seeds wins (out of 48). Tie at 24-24 is possible.

---

## AI OPPONENTS

### AI Difficulty Levels

Three levels, integrated with the Kalah/Oware mode selection:

| Setting | Rules | AI Behavior |
|---------|-------|-------------|
| Easy | Kalah | Random valid move (avoids leaving easy captures when possible) |
| Medium | Kalah | Greedy — picks move that maximizes immediate captures + free turns |
| Hard | Oware | Minimax with alpha-beta pruning, depth 8 |

### AI Implementation

**Easy AI (Kalah):**
```
1. List all valid moves (pits with seeds > 0)
2. Filter out moves that give opponent an obvious capture (if possible)
3. Prefer moves that land in store (free turn)
4. Otherwise pick randomly from remaining
```

**Medium AI (Kalah):**
```
1. List all valid moves
2. Score each move:
   - +10 per seed captured
   - +5 if lands in store (free turn)
   - -3 if leaves opponent a capture opportunity
3. Pick highest scoring move (ties broken randomly)
```

**Hard AI (Oware):**
```
1. Minimax with alpha-beta pruning
2. Depth: 8 plies (4 full rounds of play)
3. Evaluation function:
   - Store difference (my seeds - opponent seeds) × 10
   - Seeds on my side × 1 (having seeds = having options)
   - Capture threats × 3
4. Move ordering: try captures first for better pruning
5. Time budget: must return move within 500ms on Pixel 9
```

### AI Response Timing

- Easy: AI "thinks" for 400–800ms (random delay to feel natural)
- Medium: AI "thinks" for 600–1000ms
- Hard: AI calculates then adds 200ms minimum delay (even if computation is fast)

Never let AI respond instantly — it feels wrong. The brief pause makes it feel like a thinking opponent.

---

## SEED SOWING ANIMATION — THE MOST IMPORTANT PART

This is what makes or breaks the game. Reference: Gazeus Games Mancala.

### Animation Sequence

When a pit is tapped:

1. **Pickup (200ms):** All seeds in the pit float upward slightly (scale up, lift), pit visually empties. A subtle "scoop" sound plays.

2. **Sowing (120ms per seed per pit):** Seeds drop one at a time into each subsequent pit. Each drop:
   - Seed follows a slight arc trajectory (not a straight line)
   - Lands with a tiny bounce (scale 1.0 → 1.1 → 1.0 over 80ms)
   - Soft "tik" sound on landing (pitch varies slightly for variety)
   - Pit's seed count number updates immediately on landing
   - Seed settles into a slightly randomized position within the pit (not grid-aligned — organic feel)

3. **Final seed special treatment:**
   - If lands in player's store (free turn): store GLOWS green for 600ms, "Free Turn!" text fades in above
   - If triggers capture: captured seeds float in an arc from the opposite pit to the player's store (300ms flight time), triumphant chime sound
   - If normal: just the standard landing

### Animation Speed

- Default: 120ms between seed drops
- With 12+ seeds being sowed: accelerate to 80ms per drop (long sows shouldn't bore the player)
- Player can tap anywhere during sowing to set speed to 40ms (fast-forward, like the best apps do)

### Seed Visuals

Seeds are small circles/ovals (not literal botanical seeds — too complex at small size). Use a warm brown (#8B6914) with a subtle radial gradient for dimension. Each seed gets a slightly randomized position within its pit so clusters look organic, not grid-like.

**Seed sizes:**
- In pit: 8px diameter
- During arc flight: 10px diameter (slightly larger for visibility)

**When pits have many seeds (8+):** Seeds overlap slightly and cluster naturally. Don't try to show every individual seed at exact positions — show a cluster with the count number overlaid.

---

## MOBILE UI LAYOUT

Target: Pixel 9 (412×924 CSS viewport)

```
┌────────────────────────────────────┐
│  🌰 Seed Sow          ⏱ 02:34    │
│  Easy (Kalah)  ●○○               │
├────────────────────────────────────┤
│                                    │
│  ┌────┐                           │
│  │ AI │  ← AI store               │
│  │ 12 │                           │
│  └────┘                           │
│                                    │
│  (6) (5) (4) (3) (2) (1)  ← AI   │
│  [ 4] [ 4] [ 4] [ 4] [ 4] [ 4]  │
│                                    │
│  ─────────── board ───────────── │
│                                    │
│  [ 4] [ 4] [ 4] [ 4] [ 4] [ 4]  │
│  (1) (2) (3) (4) (5) (6)  ← You  │
│                                    │
│                           ┌────┐  │
│              You store →  │YOU │  │
│                           │  0 │  │
│                           └────┘  │
│                                    │
├────────────────────────────────────┤
│  Seeds Captured: 0/24 needed      │
│  ⚡ Hashes: 0                      │
└────────────────────────────────────┘
```

### Actual Board Rendering

The board should look like a carved wooden surface (dark wood tone: #3B2414 with subtle grain texture via CSS gradient). Pits are circular depressions (darker circles with inset box-shadow). Stores are larger ovals on the left and right ends.

**Pit sizes:**
- Regular pits: 48px diameter circles
- Stores: 60px wide × 100px tall ovals
- Spacing: ~6px between pits

**Layout approach:** CSS Grid for the pit arrangement. The board is a single container with:
- Row 1: AI pits (6 cells, right-to-left order)
- Row 2: Player pits (6 cells, left-to-right order)  
- Left column: AI store (spans both rows)
- Right column: Player store (spans both rows)

### Visual Indicators

- **Valid move highlighting:** On player's turn, all non-empty player pits have a subtle green pulse/glow border. Pits with 0 seeds are dimmed.
- **Last move indicator:** After AI plays, briefly highlight the pit AI chose (blue flash, 400ms)
- **Capture preview (Medium/Easy only):** When player hovers/long-presses a pit, show a dotted arc trail indicating where the last seed would land. If it's a capture, highlight the opposite pit. This is the killer UX feature from cardgames.io.

---

## SOUND DESIGN (Web Audio API)

| Event | Sound | Implementation |
|-------|-------|----------------|
| Seed pickup | Soft scoop / whoosh | White noise burst, 100ms, bandpass filter |
| Seed landing | Soft "tik" | Short sine wave click, 40ms, varying pitch (200-400Hz) |
| Capture | Triumphant chime | Two ascending tones, 300ms |
| Free turn | Bright ding | High sine, 500Hz, 200ms with reverb |
| AI thinking | None (silence builds tension) | — |
| Game win | Ascending arpeggio | 4 notes, major chord |
| Game lose | Gentle descending tone | 2 notes, soft |
| Invalid tap | Dull thud | Low sine, 60Hz, 80ms |

All generated via Web Audio oscillators — no audio files.

---

## HASH INTEGRATION

### Attention Weight Entry

```javascript
mancala: {capture:1, game_complete:3, dominant_win:2, default:0}
```

### Hash Events

- `buildAttentionPayload('game_start')` → when first move is made
- `buildAttentionPayload('capture')` → each time player captures seeds → 1 hash
- `buildAttentionPayload('game_complete')` → when game ends (win or lose) → 3 hashes (× _dm)
- `buildAttentionPayload('dominant_win')` → if player wins with 36+ seeds (out of 48) → 2 bonus hashes

### Difficulty Multiplier

- Easy (Kalah, random AI): `_dm = 1.0`
- Medium (Kalah, greedy AI): `_dm = 1.5`
- Hard (Oware, minimax AI): `_dm = 2.0`

### Target Hash Rate

Average game has 3-5 captures + completion = ~6-8 raw hashes × difficulty multiplier. Games last 3-6 minutes. Excellent hash throughput.

---

## RECORDS

Store in `sws_game_records` under key `mancala`:

```javascript
mancala: {
  gamesPlayed: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  bestScoreEasy: 0,      // highest seed count at win
  bestScoreMedium: 0,
  bestScoreHard: 0,
  totalSeedsCaptured: 0,
  longestWinStreak: 0,
  perfectGames: 0         // wins with 40+ seeds
}
```

---

## GAME END SCREEN

```
┌────────────────────────────────┐
│                                │
│        🌰 YOU WIN! 🌰         │
│                                │
│     You: 31    AI: 17         │
│                                │
│     Captures: 4               │
│     Free Turns: 3             │
│     Time: 4:12                │
│                                │
│     ⚡ +8 Hashes Earned       │
│                                │
│   [Play Again]  [Change Mode] │
│                                │
└────────────────────────────────┘
```

On loss:
```
│        Seeds Scattered...      │
│     You: 18    AI: 30         │
│     [Try Again]  [Easier Mode]│
```

"Easier Mode" button only appears if playing Medium or Hard. Soft landing — never make the player feel bad about losing. The message is about seeds, not failure.

---

## ONBOARDING (First Play Only)

On first ever game launch (check `sws_game_records.mancala.gamesPlayed === 0`):

Show a brief overlay with 3 panels (swipe or tap to advance):

**Panel 1:** "Tap a pit to pick up its seeds. They sow one-by-one counterclockwise." [Simple arrow animation showing the path]

**Panel 2:** "Land your last seed in your store for a free turn!" [Highlight the store]

**Panel 3:** "Land in an empty pit on your side to capture the opposite pit's seeds!" [Show capture arrow]

Then: "Ready to grow? [Start Game]"

This overlay never shows again after first game. Keep it to 3 panels max — no one reads 5+ panel tutorials.

---

## WHAT NOT TO DO

- Do NOT use position:fixed for any game elements
- Do NOT rewrite switchTab
- Do NOT modify any economy values
- Do NOT add new localStorage keys without the sws_ prefix
- Do NOT make the AI instant — always add thinking delay
- Do NOT skip the sowing animation — it IS the game feel
- Do NOT show raw numbers without the visual seed clusters in pits
- Do NOT allow tapping during AI's turn or during sow animation (queue the input or ignore)

---

## TESTING CHECKLIST

1. [ ] Board renders correctly — 12 pits + 2 stores, proper orientation
2. [ ] Kalah rules: free turn on store landing works
3. [ ] Kalah rules: capture from empty pit + opposite works
4. [ ] Oware rules: capture on 2-3 seeds in opponent pit works
5. [ ] Oware rules: chain capture (consecutive 2-3 pits) works
6. [ ] Oware rules: grand slam protection (can't take all opponent seeds)
7. [ ] Sowing animation plays seed-by-seed with arc trajectories
8. [ ] Animation accelerates for 12+ seed sows
9. [ ] Tap-to-fast-forward during sowing works
10. [ ] AI responds within time budgets for each difficulty
11. [ ] AI never makes invalid moves
12. [ ] Game end detection fires when one side is empty
13. [ ] Remaining seeds collected correctly at game end
14. [ ] Stores display correct counts throughout
15. [ ] Valid move highlighting shows on player's turn
16. [ ] Capture preview shows on long-press (Easy/Medium)
17. [ ] Hash events fire correctly
18. [ ] Records save and persist
19. [ ] Onboarding overlay shows on first play only
20. [ ] All sounds play without blocking UI
21. [ ] Plays correctly on Pixel 9 in Chrome incognito
22. [ ] No overlap with other game panels
23. [ ] Difficulty selector works and switches rule sets

---

*Spec complete. Ready for Claude Code build.*

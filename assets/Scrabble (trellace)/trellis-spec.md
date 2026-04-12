# TRELLIS — Complete Game Spec
## Petal Walk Word Board Game (Scrabble-style)

**Game #16 in the Petal Walk suite**
**Botanical Name:** Trellis
**Hash Code:** `trellis`
**Genre:** Word Board / Strategy
**Players:** 1 (vs AI)
**Session Length:** 12-25 minutes
**Difficulty Levels:** Seedling / Gardener / Botanist

---

## COMPETITIVE ANALYSIS

### Top Competitors
1. **Scrabble GO** (Scopely) — Official license, ~10M downloads
2. **Words With Friends 2** (Zynga) — ~50M downloads  
3. **Wordfeud** — ~10M downloads, cleaner but ad-supported
4. **Lexulous** — Small but passionate user base

### Their Biggest Weaknesses (sourced from Reddit, app store reviews)
1. **ADS** — "#1 complaint across every competitor. "I just want clean Scrabble without watching a 30-second ad between every turn"
2. **Bloat** — Multiple currencies, energy systems, daily streaks that feel coercive
3. **Fake multiplayer** — Bots disguised as real players; deceptive UX
4. **Dictionary fights** — "That's not a word!" frustration with no transparency
5. **No good solo AI** — Most focus on async multiplayer; single-player is an afterthought
6. **Performance** — Crashes, battery drain, 500MB+ app sizes
7. **Dark patterns** — Notification spam, "your friend is waiting!", streak anxiety
8. **Tile RNG complaints** — "I always get garbage tiles" (perception, not reality)

### Their Best Features (what to keep)
1. Premium squares (DW/TW/DL/TL) — core mechanic, non-negotiable
2. 7-tile rack with tile exchange option
3. Word definitions shown after play (educational + satisfying)
4. Score tracking with running totals
5. Tile bag visibility (know what's left)
6. 50-point bingo bonus for using all 7 tiles
7. Clean board readability (letter + point value visible)

### Our Advantages
1. **Zero ads, zero bloat, zero fake multiplayer** — "clean Scrabble" is literally what Reddit asks for
2. **Professional AI with 3 difficulty levels** — real single-player experience
3. **Word definitions shown on play** — botanical flavor when possible
4. **Transparent dictionary** — word validation is visible, not hidden
5. **Botanical dark garden aesthetic** — unlike any competitor's visual identity
6. **Hash integration** — every game contributes to the attention economy
7. **Tiny footprint** — single HTML file + external dictionary, no 500MB install

---

## GAME RULES

### Setup
- Standard 15×15 board with premium squares
- 100 tiles in bag (standard Scrabble distribution)
- Each player draws 7 tiles
- Player goes first

### Tile Distribution (100 total)
| Letter | Count | Points | Letter | Count | Points |
|--------|-------|--------|--------|-------|--------|
| A | 9 | 1 | N | 6 | 1 |
| B | 2 | 3 | O | 8 | 1 |
| C | 2 | 3 | P | 2 | 3 |
| D | 4 | 2 | Q | 1 | 10 |
| E | 12 | 1 | R | 6 | 1 |
| F | 2 | 4 | S | 4 | 1 |
| G | 3 | 2 | T | 6 | 1 |
| H | 2 | 4 | U | 4 | 1 |
| I | 9 | 1 | V | 2 | 4 |
| J | 1 | 8 | W | 2 | 4 |
| K | 1 | 5 | X | 1 | 8 |
| L | 4 | 1 | Y | 2 | 4 |
| M | 2 | 3 | Z | 1 | 10 |
| Blank | 2 | 0 | | | |

### Premium Squares (standard layout)
- **TW (Triple Word):** (0,0), (0,7), (0,14), (7,0), (7,14), (14,0), (14,7), (14,14)
- **DW (Double Word):** (1,1), (1,13), (2,2), (2,12), (3,3), (3,11), (4,4), (4,10), (7,7)★, (10,4), (10,10), (11,3), (11,11), (12,2), (12,12), (13,1), (13,13)
- **TL (Triple Letter):** (1,5), (1,9), (5,1), (5,5), (5,9), (5,13), (9,1), (9,5), (9,9), (9,13), (13,5), (13,9)
- **DL (Double Letter):** (0,3), (0,11), (2,6), (2,8), (3,0), (3,7), (3,14), (6,2), (6,6), (6,8), (6,12), (7,3), (7,11), (8,2), (8,6), (8,8), (8,12), (11,0), (11,7), (11,14), (12,6), (12,8), (14,3), (14,11)

### Turn Actions
1. **Place tiles** — Form a word connecting to existing tiles (or crossing center on first turn)
2. **Exchange tiles** — Swap 1-7 tiles with the bag (lose your turn, bag must have ≥7 tiles)
3. **Pass** — Skip your turn

### Scoring
- Letter values × premium square multipliers (letter premiums first, then word premiums)
- Premiums only apply on the turn a tile is placed on that square
- All cross-words formed also score
- **Bingo bonus:** +50 points for using all 7 tiles in one play
- **End game:** Remaining tiles in rack deducted from your score; if you emptied your rack, you get the sum of opponent's remaining tiles added to yours

### Game End
- Bag empty AND one player plays all remaining tiles, OR
- Both players pass consecutively (2 passes total), OR
- 6 consecutive scoreless turns (3 per player)

---

## AI DESIGN

### Architecture
- **Data structure:** Trie built from word list at game load
- **Move generation:** Appel & Jacobson algorithm (anchor-based, cross-check validated)
- **Production dictionary:** ENABLE (173K words, public domain) loaded from external file on Hostinger
- **Prototype dictionary:** Embedded curated ~5-8K word subset

### Algorithm: Move Generation
1. Compute anchor squares (empty squares adjacent to ≥1 filled square; center on empty board)
2. Compute cross-check sets for every empty square (which letters form valid perpendicular words)
3. For each anchor, in each direction (horizontal, vertical):
   a. Determine left/up extension limit (consecutive empty non-anchor squares)
   b. Recursively build left prefix from rack tiles (up to limit)
   c. At anchor, extend right through Trie, checking cross-checks and rack availability
   d. When Trie node marks end-of-word and we've passed the anchor, record the move
4. Score all valid moves
5. Apply difficulty filter

### Difficulty Levels
- **Seedling (Easy):** Picks randomly from bottom 60% of valid moves; never plays bingos; max 5-letter words
- **Gardener (Medium):** Picks from top 40% of valid moves with weighted randomness; considers rack leave (vowel/consonant balance)
- **Botanist (Hard):** Picks highest-scoring move; considers rack leave quality; plays bingos when available

### AI Personality
- Seedling: "Your garden helper" — plays simple, common words
- Gardener: "A worthy opponent" — competent but beatable
- Botanist: "The master cultivator" — near-optimal play, very hard to beat

---

## MOBILE UI (Pixel 9 — 360×740 CSS viewport)

### Layout (top to bottom)
1. **Score Bar** (40px) — Player name + score | Tiles remaining | AI name + score
2. **Board** (340px) — 15×15 grid, ~22px cells, horizontally centered
3. **Rack** (50px) — 7 tiles, 42px each, centered, tap-to-select
4. **Controls** (50px) — Play ✓ | Swap ↔ | Pass ⊘ | Recall ↩ | Shuffle 🔀

### Interaction Model
1. **Tap tile in rack** → tile highlights (selected)
2. **Tap empty board square** → selected tile places there (tentative, highlighted)
3. **Tap placed tentative tile** → returns to rack
4. **Tap Play** → validates word(s), scores, commits, AI takes turn
5. **Tap Swap** → opens swap mode (tap tiles to toggle swap selection, confirm)
6. **Tap Recall** → returns all tentative tiles to rack
7. **Tap Shuffle** → randomizes rack tile order

### Blank Tile Handling
- When placing a blank, modal popup shows A-Z letter picker
- Blank displays chosen letter in italics with no point value shown

### Board Colors (botanical dark garden)
- Background: #0d100c
- Regular cell: rgba(26,36,22,0.3)
- DL: #4A7C35 (forest green) with "DL" text
- TL: #5B9BD5 (sky blue) with "TL" text
- DW: #D4A843 (golden amber) with "DW" text
- TW: #C47A7A (dusty rose) with "TW" text
- Center star: #D4A843 with ★
- Placed tiles: warm cream (#E8DCC8) background
- Tentative tiles: cream with pulsing border
- Selected rack tile: lifted shadow + glow

---

## HASH INTEGRATION

### Milestone Events
- 1 hash per valid word played scoring ≥15 points
- 1 hash per bingo (all 7 tiles)
- 1 hash per game won
- Bonus hash for winning with ≥100 point margin

### buildAttentionPayload() Integration
```javascript
_sr('trellis', {
  w: won,           // boolean
  s: playerScore,   // final score
  ws: wordsPlayed,  // total words played
  bw: bestWord,     // highest-scoring single word
  bs: bestScore,    // score of best word
  bg: bingos        // number of bingos
});
```

### Records Tracked
- Highest single word score
- Highest game score
- Most bingos in one game
- Longest word played
- Total words played (lifetime)
- Win/loss record per difficulty

---

## GAME SELECTOR ENTRY
```javascript
{
  id: 'trellis',
  name: 'Trellis',
  icon: '🌿',
  desc: 'Word board — grow words across the garden grid',
  cat: 'strategy',
  diff: 'medium',
  time: '12-25 min'
}
```

---

## PRODUCTION DICTIONARY ARCHITECTURE

### File: `lucidwinds.com/data/trellis-dict.txt`
- ENABLE word list (public domain)
- ~173,000 words, one per line, uppercase
- ~1.8MB raw, ~600KB with gzip (Hostinger serves gzipped automatically)
- Cached in localStorage after first load (key: `trellis-dict-v1`)

### Load Sequence
1. Check localStorage for cached dictionary
2. If cached and version matches, use it (instant)
3. If not cached, show "Loading dictionary..." with progress
4. Fetch from server, store in localStorage
5. Build Trie from word list (~2-3 seconds)
6. Game ready

### Fallback
- If fetch fails, use embedded minimal word list (~2K words)
- Show toast: "Using basic dictionary — connect to internet for full experience"

---

## TESTING CHECKLIST

### Functional
- [ ] First word must cross center square
- [ ] All subsequent words connect to existing tiles
- [ ] All formed words (main + cross) validated against dictionary
- [ ] Scoring correct with all premium combinations
- [ ] Bingo bonus awarded correctly (+50)
- [ ] Tile exchange works (returns tiles, draws new, loses turn)
- [ ] Pass works correctly
- [ ] Game end conditions all trigger correctly
- [ ] Blank tile letter selection works
- [ ] Blank tiles score 0 points
- [ ] AI generates valid moves at all 3 difficulty levels
- [ ] AI handles edge cases (no valid moves → exchange or pass)
- [ ] Tile bag depletes correctly
- [ ] End-game tile deduction calculated correctly

### UI/UX (Pixel 9)
- [ ] Board fits on screen without horizontal scroll
- [ ] All premium square labels visible
- [ ] Tile placement via tap works reliably
- [ ] Rack tiles clearly show letter + point value
- [ ] Score updates in real-time during tentative placement
- [ ] AI turn has visible thinking indicator
- [ ] Word definitions show after valid play
- [ ] Swap mode clearly distinct from play mode
- [ ] No overlapping elements or z-index issues

### Performance
- [ ] Trie builds in < 5 seconds from embedded word list
- [ ] AI move generation < 3 seconds per turn
- [ ] No janky scrolling or rendering
- [ ] Memory usage stable over 20+ turns

### Hash Integration
- [ ] Milestones fire at correct thresholds
- [ ] buildAttentionPayload receives correct data
- [ ] Records update correctly

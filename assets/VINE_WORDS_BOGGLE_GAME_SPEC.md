# PETAL WALK — VINE WORDS (BOGGLE-STYLE WORD GRID) GAME SPEC
## For: Claude Code (super-duper-enigma)
## From: Claude (Lead Dev) — Director Approved
## Date: March 31, 2026

---

## WHAT THIS IS

A new game for the Game tab game selector. Find words by tracing paths through a grid of letters. Swipe or tap adjacent letters to spell words. Score based on word length. Beat the clock. The mechanic behind Ruzzle (100M+ downloads), Boggle With Friends, and WordBrain.

**Design reference:** Modeled after Ruzzle (timer pressure, letter multipliers, length² scoring, swipe gesture), Boggle With Friends (daily challenges, clean UI), and SpellTower (gravity mode as an advanced variant).

**Name in game:** "Vine Words" — you trace word paths like growing vines through a letter garden.

---

## GAME SELECTOR ENTRY

```javascript
{id:'vinewords', n:'Vine Words', i:'🔤', r:'Swipe through adjacent letters to spell words. Longer words = bigger scores. Beat the clock!'}
```

---

## CORE RULES

1. A 4×4 grid of letters is generated
2. Timer starts: 120 seconds (2 minutes)
3. Player traces paths through adjacent letters to form words
4. Each letter can only be used ONCE per word (but resets for the next word)
5. Minimum word length: 3 letters
6. Valid words score points based on length
7. When timer hits 0: game over, show results
8. Same word cannot be scored twice in one game

### Adjacency Rule

A letter is adjacent to any of its 8 neighbors (horizontal, vertical, diagonal). A path must move through adjacent letters only, and cannot revisit a letter within the same word.

```
For grid position (1,1):
  Adjacent = (0,0) (0,1) (0,2)
             (1,0)       (1,2)
             (2,0) (2,1) (2,2)
```

Corner letters have 3 neighbors, edge letters have 5, center letters have 8.

---

## SCORING SYSTEM

### Length-Based Scoring (Ruzzle-inspired exponential)

| Word Length | Base Points |
|-------------|-------------|
| 3 letters | 1 |
| 4 letters | 2 |
| 5 letters | 4 |
| 6 letters | 8 |
| 7 letters | 15 |
| 8+ letters | 25 |

Longer words are DRAMATICALLY more valuable. This drives players to hunt for big words instead of spamming 3-letter words.

### Letter Multipliers (Ruzzle's secret weapon)

At game start, 3-4 random tiles get multiplier badges:

| Multiplier | Effect | Visual |
|------------|--------|--------|
| 2L | Double the base points of this letter's word | Small green "2L" badge |
| 3L | Triple the base points of this letter's word | Small gold "3L" badge |
| 2W | Double the entire word's score | Small green "2W" badge |
| 3W | Triple the entire word's score | Small gold "3W" badge |

Multiplier placement rules:
- 2 letter multipliers (2L or 3L) placed randomly
- 1-2 word multipliers (2W or 3W) placed randomly
- Never place on the same tile
- Multipliers are assigned during grid generation, persist all game
- A word passing through multiple multipliers stacks them multiplicatively

**Example:** Word "BLOOM" (5 letters = 4 points base) passing through a 2L tile and a 2W tile = 4 × 2 = 8 points for the word.

Wait — let's simplify. The multiplier applies to the word score, not individual letters. This matches Ruzzle's actual behavior:

- If any letter in the word has a letter multiplier: word base score is multiplied
- If any letter in the word has a word multiplier: final word score is multiplied
- Multiple multipliers in one word: multiply sequentially

**Simplified example:**
"THORN" (5 letters = 4 pts base). The 'H' has 2L, the 'N' has 3W.
Score = 4 (base) × 2 (2L) × 3 (3W) = 24 points.

---

## GRID GENERATION

### Letter Distribution

NOT random uniform. Use weighted distribution that produces word-rich grids:

```javascript
var LETTER_WEIGHTS = {
  // High frequency vowels (heavily weighted)
  'E': 13, 'A': 9, 'I': 8, 'O': 8, 'U': 4,
  // High frequency consonants
  'T': 9, 'N': 7, 'S': 7, 'R': 7, 'H': 5, 'L': 5,
  // Medium frequency
  'D': 4, 'C': 3, 'G': 3, 'M': 3, 'B': 2, 'P': 2,
  'F': 2, 'W': 2, 'Y': 2, 'K': 1, 'V': 1,
  // Low frequency (rare)
  'J': 1, 'X': 1,
  // Special handling
  'Q': 0, 'Z': 0  // Excluded entirely — Q without U is frustrating, Z rarely helps
};
```

### Grid Quality Rules

After generating a random grid, verify:

1. **Vowel check:** At least 4 vowels (A, E, I, O, U) in the 16-tile grid. If fewer, regenerate.
2. **Vowel spread:** At least one vowel in each quadrant (top-left 2×2, top-right 2×2, bottom-left 2×2, bottom-right 2×2). This prevents dead zones.
3. **No duplicate adjacent:** Avoid placing the same letter in two adjacent tiles (looks weird, rarely helps).
4. **Minimum findable words:** Run the word-finder algorithm on the generated grid. If fewer than 30 valid words exist, regenerate. Target: 50-150 findable words per grid.

### Grid Validation (Pre-compute)

On grid generation, run the full word search (using the Trie) and store the complete list of findable words. This is used for:
- Validating player guesses in O(1) (lookup in the pre-computed set)
- Showing missed words at game end
- Ensuring grid quality

```javascript
function findAllWords(grid, trie) {
  var found = {};
  for (var r = 0; r < 4; r++) {
    for (var c = 0; c < 4; c++) {
      // DFS from each starting cell
      dfsSearch(grid, trie, r, c, '', [], found);
    }
  }
  return Object.keys(found);
}

function dfsSearch(grid, trie, r, c, word, visited, found) {
  if (r < 0 || r > 3 || c < 0 || c > 3) return;
  if (visited includes [r,c]) return;
  
  var letter = grid[r][c];
  var newWord = word + letter;
  
  if (!trie.hasPrefix(newWord)) return; // prune: no words start with this prefix
  
  if (newWord.length >= 3 && trie.hasWord(newWord)) {
    found[newWord] = true;
  }
  
  var newVisited = visited.concat([[r,c]]);
  // Recurse to all 8 neighbors
  for (var dr = -1; dr <= 1; dr++) {
    for (var dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      dfsSearch(grid, trie, r + dr, c + dc, newWord, newVisited, found);
    }
  }
}
```

---

## TRIE DATA STRUCTURE (Word Lookup Engine)

### What It Is

A Trie (prefix tree) allows O(n) word lookup and prefix checking, where n = word length. Essential for two things:
1. Real-time path validation (is the player's current trace a valid prefix?)
2. Word validation on submit (is this a complete word?)

### Building the Trie

```javascript
function buildTrie(wordList) {
  var root = {};
  for (var i = 0; i < wordList.length; i++) {
    var node = root;
    var word = wordList[i];
    for (var j = 0; j < word.length; j++) {
      var ch = word[j];
      if (!node[ch]) node[ch] = {};
      node = node[ch];
    }
    node['$'] = true; // marks end of valid word
  }
  return root;
}

function hasPrefix(trie, prefix) {
  var node = trie;
  for (var i = 0; i < prefix.length; i++) {
    if (!node[prefix[i]]) return false;
    node = node[prefix[i]];
  }
  return true;
}

function hasWord(trie, word) {
  var node = trie;
  for (var i = 0; i < word.length; i++) {
    if (!node[word[i]]) return false;
    node = node[word[i]];
  }
  return node['$'] === true;
}
```

### Memory Budget

A Trie built from 50,000 words in pure JS objects uses roughly 2-4MB of heap. This is fine for modern phones (Pixel 9 has 12GB RAM). The Trie builds in <200ms on first game load, then persists in memory for the session.

### Word List

Reuse and expand the Sprout word list. Target:
- **Scoring words:** ~15,000 common English words (3-8 letters). These are words players will recognize and feel good about finding.
- **Valid but non-scoring:** Additional ~35,000 words accepted as valid (no "not a word" frustration) but that are uncommon. These score normally — we don't penalize vocabulary depth.

**Total: ~50,000 words.** Store as a compressed string, split on load, build Trie once.

```javascript
// Approximately 300KB as a comma-separated string
// Loads once, builds Trie once, stays in memory
var _vineWordList = "AAH,AAL,AAS,ABA,ABO,ABS,...".split(",");
var _vineTrie = buildTrie(_vineWordList);
```

### Shared Word List With Sprout

If Sprout (Wordle game) is already built, its 5-letter word list is a subset of this one. The Vine Words list is the superset containing all lengths 3-8+. Build the shared list once in a common variable and let both games reference it.

---

## INPUT: THE SWIPE GESTURE

### This Is The Most Important UX Decision

Ruzzle proved that swiping through letters is dramatically more engaging than tapping each letter. The finger traces a vine-like path through the grid. This is our primary input.

### How Swipe Works

1. **Touch start:** Player puts finger on a letter tile → tile highlights, letter appears in the word preview bar
2. **Touch move:** Player drags finger to adjacent tiles → each new adjacent tile highlights, letter appends to word preview, a line draws connecting the tiles showing the path
3. **Touch end / lift finger:** 
   - If word is valid (3+ letters, in dictionary, not already found): SCORE IT
   - If word is invalid: path disappears, tiles reset, brief feedback

### Path Drawing

As the player swipes, draw a visible vine/line connecting the centers of selected tiles:

```css
.vine-path {
  stroke: rgba(74,124,53,.6);
  stroke-width: 4;
  stroke-linecap: round;
  stroke-linejoin: round;
  fill: none;
  filter: drop-shadow(0 0 3px rgba(74,124,53,.3));
}
```

The path should feel organic — use SVG `<polyline>` connecting tile centers with slight curvature (or just straight segments — Ruzzle uses straight and it's fine).

### Real-Time Prefix Feedback

As the player traces, check the current letter sequence against the Trie:

- **Valid prefix (could become a word):** Path line stays green, word preview text is white
- **Invalid prefix (no word starts with this):** Path line turns red/gray, word preview text dims. Player CAN still continue (maybe they'll backtrack) but the visual feedback says "this isn't going anywhere."
- **Complete valid word:** Word preview text turns bright green. Player can lift finger to score OR keep going for a longer word.

### Backtracking

If the player moves their finger BACK to the previous tile in the path:
- Remove the last tile from the path
- Update word preview
- This allows correcting the path without lifting and starting over

### Tap Fallback

Some players prefer tapping. Support tap-per-letter as a fallback:
1. Tap first letter → selected
2. Tap adjacent letter → added to path
3. Tap non-adjacent letter → reset, start new word from tapped letter
4. Tap "Submit" button or double-tap last letter → submit word

But swipe should be the primary and encouraged input method.

---

## MOBILE UI LAYOUT

Target: Pixel 9 (412×924 CSS viewport)

```
┌────────────────────────────────────┐
│  🔤 Vine Words       ⏱ 1:47      │
│  Score: 34    Words: 8            │
├────────────────────────────────────┤
│                                    │
│  Current word: T H O R N  ✓      │
│                                    │
├────────────────────────────────────┤
│                                    │
│     ┌────┬────┬────┬────┐        │
│     │ T  │ H  │ E  │ S  │        │
│     │    │ 2L │    │    │        │
│     ├────┼────┼────┼────┤        │
│     │ O  │ R  │ A  │ N  │        │
│     │    │    │    │ 3W │        │
│     ├────┼────┼────┼────┤        │
│     │ L  │ I  │ N  │ D  │        │
│     │    │    │    │    │        │
│     ├────┼────┼────┼────┤        │
│     │ P  │ E  │ B  │ M  │        │
│     │    │    │ 2W │    │        │
│     └────┴────┴────┴────┘        │
│                                    │
│     [SVG path overlay draws       │
│      vine trail through tiles]    │
│                                    │
├────────────────────────────────────┤
│  Found words:                      │
│  THORN(24) LINE(2) RAIN(2) ...   │
│                                    │
├────────────────────────────────────┤
│  ⚡ Hashes: 2                      │
└────────────────────────────────────┘
```

### Tile Sizes

- Grid tile: 80×80px (large for easy swiping — finger needs room)
- Total grid: 4 × 80 + 3 × 4 (gap) = 332px wide — centered
- Letter font: 28px bold, centered in tile
- Multiplier badge: 12px, positioned in bottom-right corner of tile

### Tile Appearance

```css
.vw-tile {
  width: 80px;
  height: 80px;
  background: rgba(26,31,23,.5);
  border: 2px solid rgba(74,124,53,.2);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 28px;
  color: var(--cream);
  user-select: none;
  -webkit-user-select: none;
  touch-action: none; /* CRITICAL: prevents browser scroll during swipe */
  transition: background 0.1s, border-color 0.1s, transform 0.1s;
}

.vw-tile.active {
  background: rgba(74,124,53,.3);
  border-color: rgba(74,124,53,.6);
  transform: scale(1.05);
}

.vw-tile.scored {
  /* brief flash when word scores */
  animation: tileScore 0.3s ease;
}

@keyframes tileScore {
  0% { background: rgba(74,124,53,.5); }
  100% { background: rgba(26,31,23,.5); }
}
```

### CRITICAL: touch-action: none

The grid container AND all tiles MUST have `touch-action: none` in CSS. Without this, the browser will intercept swipe gestures as scroll events and the game becomes unplayable. This is the #1 bug in web-based swipe word games.

```css
.vw-grid {
  touch-action: none;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}
```

### Word Preview Bar

Above the grid, show the current word being traced:

- Letters appear one at a time as the player swipes
- Valid complete word: text turns green, small ✓ appears
- Invalid prefix: text stays white/dim
- After scoring: brief "THORN +24" flash in green, then clears

### Found Words List

Below the grid, a scrollable area showing scored words:

- Newest word first
- Format: "WORD (points)" 
- Scrolls if more than 3-4 words visible
- Capped at ~50px height to not crowd the grid

---

## GAME MODES

### Classic (Default)
- 4×4 grid
- 120-second timer
- Standard letter distribution
- Multipliers active

### Quick Round
- 4×4 grid
- 60-second timer
- For players who want faster games
- Same scoring

### Big Grid (Advanced)
- 5×5 grid (25 tiles)
- 180-second timer
- More words possible, harder to trace long paths
- Higher scoring ceiling
- Letter tiles shrink to 62×62px to fit (5 × 62 + 4 × 4 = 326px — still fits)

### Daily Challenge
- Same grid for all players on the same day (seeded by date, same as Sprout)
- 120-second timer
- Leaderboard-style: "You found 12 words for 87 points. Can you beat it tomorrow?"
- One attempt per day
- Streak tracking (consecutive days played)

---

## GAME END SCREEN

When timer hits 0:

```
┌────────────────────────────────────┐
│                                    │
│        🔤 Time's Up!              │
│                                    │
│    Your Score: 87                  │
│    Words Found: 12                 │
│    Longest Word: THORN (5)         │
│    Best Word: THRONE (24 pts)      │
│                                    │
│    Words You Missed: 43            │
│    [Show Missed Words ▼]           │
│                                    │
│    ⚡ +6 Hashes Earned             │
│                                    │
│   [Play Again]  [Daily Challenge]  │
│                                    │
└────────────────────────────────────┘
```

### "Show Missed Words" — THE RETENTION HOOK

This is what Ruzzle, Boggle With Friends, and every successful word game does. When the player taps "Show Missed Words":

- Expand a scrollable list of ALL findable words in the grid that the player didn't find
- Sort by length (longest first) — show the player the 7-letter word they missed
- Color code: common words in white, long words in gold
- THIS is what makes players think "I could've gotten THRONE! One more game."
- This single feature drives more replays than anything else in the game

### Missed Word Display

```
Words You Missed (43):
  THRONE (6) ← gold highlight
  LINDEN (6) ← gold highlight
  SHRED (5)
  LITHE (5)
  RIND (4)
  BEND (4)
  THE (3)
  HER (3)
  ...
```

---

## ANIMATIONS

### Word Score

When a valid word is submitted:

1. Path tiles flash green simultaneously (100ms)
2. Word and score float upward from the grid center: "+24 THORN" in green, rises 40px and fades over 600ms
3. Score counter in header rolls up to new total
4. Tiles return to normal state (ready for next word)

### Invalid Word Attempt

1. Path tiles flash red briefly (150ms)
2. Path line turns red and fades (200ms)
3. Small shake of the word preview bar
4. No sound or very subtle low tone

### Timer Warning

When 30 seconds remain:
- Timer text turns amber/gold
- At 10 seconds: timer turns red, subtle pulse animation
- At 0: brief screen flash, "Time's Up!" overlay

### Game Start

- Grid tiles cascade in from the left, row by row (similar to Mahjong load)
- "READY" text for 500ms → "GO!" for 300ms → timer starts
- Total pre-game: ~1.5 seconds

---

## SOUND DESIGN (Web Audio API)

| Event | Sound |
|-------|-------|
| Tile touched (swipe start) | Soft pop, 40ms |
| Tile added to path (swipe continues) | Quick ascending click, pitch rises with word length |
| Valid word scored | Satisfying chime + word length affects pitch (longer = higher chord) |
| Long word scored (6+) | Extra flourish: quick ascending arpeggio |
| Invalid word | Soft dull tone, 60ms |
| Timer at 30s | Subtle single tick |
| Timer at 10s | Gentle ticking every second |
| Game end | Descending gentle chime (not harsh — this is "time's up" not "you lost") |

**The swipe sound design is crucial.** As the player drags through letters, each new tile should make a progressively higher-pitched click. This creates a musical trail that subconsciously rewards longer paths. Ruzzle does this and it's deeply satisfying.

```javascript
// Pitch increases with path length
function playTileAddSound(pathLength) {
  var baseFreq = 300;
  var freq = baseFreq + (pathLength * 60); // 300, 360, 420, 480, 540...
  playTone(freq, 0.04); // 40ms click at increasing pitch
}
```

---

## HASH INTEGRATION

### Attention Weight Entry

```javascript
vinewords: {milestone:1, game_complete:2, daily_challenge:3, long_word_bonus:1, high_score:2, default:0}
```

### Hash Events

| Event | Trigger | Hashes |
|-------|---------|--------|
| milestone | Every 5 words found | 1 each (at 5, 10, 15 words = 3 milestones typical) |
| game_complete | Game ends (timer runs out) | 2 × _dm |
| daily_challenge | Completing the daily challenge | 3 (flat) |
| long_word_bonus | Finding a 7+ letter word | 1 per occurrence |
| high_score | Beating your personal best score | 2 |

### Difficulty Multiplier

- Classic (4×4, 120s): `_dm = 1.0`
- Quick Round (4×4, 60s): `_dm = 1.0`
- Big Grid (5×5, 180s): `_dm = 1.5`

### Target Hash Rate

Typical game: 3 milestones + 2 complete + possible long word bonus = 6-7 hashes per 2-minute game. With daily challenge: +3. Extremely high hash-per-minute ratio.

---

## RECORDS

```javascript
vinewords: {
  gamesPlayed: 0,
  highScore: 0,
  highScoreClassic: 0,
  highScoreBigGrid: 0,
  mostWordsOneGame: 0,
  longestWordEver: '',
  longestWordLength: 0,
  totalWordsFound: 0,
  totalPointsScored: 0,
  
  // Daily
  dailyPlayed: 0,
  dailyStreak: 0,
  dailyMaxStreak: 0,
  dailyLastPlayed: null,   // 'YYYY-MM-DD'
  dailyBestScore: 0,
  
  // Fun stats
  averageWordsPerGame: 0,
  averageScorePerGame: 0,
  wordsOver6Letters: 0
}
```

---

## WORD LIST MANAGEMENT

### Size Optimization

50,000 words × ~6 bytes average = ~300KB as raw text. This is significant for the single-file budget.

**Compression approach:** 
1. Sort the word list alphabetically
2. Store as delta-encoded: each word stores only the characters that differ from the previous word
3. Or simpler: just store as one comma-separated string and accept the 300KB

**Alternative: Two-file approach**
- Core game code in `index.html` as normal
- Word list in `vinewords-dict.js` loaded lazily when player first opens Vine Words
- This keeps the main file lighter

**Director decision needed:** Is 300KB acceptable in the single file, or should the dictionary be a lazy-loaded separate file? For now, spec assumes single-file with the raw comma-separated string.

### Offensive Word Filtering

Before finalizing the word list, filter out:
- Slurs and hate speech
- Extremely vulgar words
- Words that would be inappropriate in a general-audience game

Use a standard profanity filter list. Better to exclude 200 offensive words than have one show up in a daily challenge.

---

## WHAT NOT TO DO

- Do NOT use position:fixed for any game elements
- Do NOT rewrite switchTab
- Do NOT modify any economy values
- Do NOT forget `touch-action: none` on the grid — this WILL break swiping
- Do NOT accept 1-2 letter words (minimum 3)
- Do NOT show the complete word list during gameplay (only after game ends)
- Do NOT make the grid tiles smaller than 60px on any device — swiping needs room
- Do NOT use the device keyboard — all input is via swipe/tap on the grid
- Do NOT generate grids with fewer than 30 findable words — regenerate instead
- Do NOT skip the "missed words" screen — it's the #1 replay driver

---

## TESTING CHECKLIST

1. [ ] 4×4 grid renders with proper tile sizes and spacing
2. [ ] Letter distribution produces word-rich grids (30+ findable words)
3. [ ] Vowel distribution rules are enforced (4+ vowels, spread across quadrants)
4. [ ] Swipe gesture works: touch-start → drag → touch-end flow
5. [ ] Path draws between tile centers as player swipes
6. [ ] Adjacent-only constraint enforced (can't skip tiles)
7. [ ] No letter reuse within a single word
8. [ ] Backtracking works (move finger back to remove last letter)
9. [ ] Tap-per-letter fallback works
10. [ ] Trie builds successfully from word list
11. [ ] Valid words score correctly with length-based scoring
12. [ ] Multipliers apply correctly (letter × word multiplication)
13. [ ] Same word cannot be scored twice
14. [ ] Timer counts down and triggers game end at 0
15. [ ] Word preview bar updates in real-time during swipe
16. [ ] Prefix feedback: green for valid prefix, red for dead end
17. [ ] Found words list displays and scrolls correctly
18. [ ] Game end screen shows score, words found, longest word
19. [ ] "Show Missed Words" displays all unfound words sorted by length
20. [ ] Daily Challenge produces same grid for same date
21. [ ] Daily Challenge: one attempt per day, streak tracking
22. [ ] 5×5 Big Grid mode generates and plays correctly
23. [ ] Quick Round (60s) mode works
24. [ ] Ascending pitch sound plays as path grows
25. [ ] Valid word chime plays on score
26. [ ] Hash events fire correctly
27. [ ] Records save and persist
28. [ ] `touch-action: none` prevents scroll interference during swipe
29. [ ] Plays correctly on Pixel 9 in Chrome incognito
30. [ ] No overlap with other game panels

---

*Spec complete. Ready for Claude Code build.*

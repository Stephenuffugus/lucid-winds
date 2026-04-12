# PETAL WALK — SPROUT (WORD DEDUCTION) GAME SPEC
## For: Claude Code (super-duper-enigma)
## From: Claude (Lead Dev) — Director Approved
## Date: March 31, 2026

---

## WHAT THIS IS

A new game for the Game tab game selector. A 5-letter word guessing game in the style of Wordle. Player has 6 attempts to guess a hidden word. Each guess reveals which letters are correct (right spot), present (wrong spot), or absent. Two modes: Daily Challenge (one word per day, same for all players) and Unlimited (endless random words).

**Design reference:** Modeled after NYT Wordle (restraint, clarity, keyboard tracking), Wordle Unlimited (endless mode), and Dordle (proof the mechanic scales for advanced players).

**Name in game:** "Sprout" — 5-letter word, botanical branding.

---

## GAME SELECTOR ENTRY

Add to the G array:

```javascript
{id:'sprout', n:'Sprout', i:'🌱', r:'Guess the 5-letter word in 6 tries. 🟩=right spot, 🟨=wrong spot, ⬛=miss.'}
```

---

## CORE RULES

1. A secret 5-letter word is chosen
2. Player types a 5-letter guess
3. Each letter in the guess is evaluated:
   - **GREEN (🟩):** Letter is in the word AND in the correct position
   - **YELLOW (🟨):** Letter is in the word but in the WRONG position
   - **GRAY (⬛):** Letter is NOT in the word at all
4. Player gets 6 guesses total
5. Win: guess the word within 6 tries
6. Lose: fail to guess in 6 tries → word is revealed

### Duplicate Letter Handling (CRITICAL — most clones get this wrong)

This must match NYT Wordle's behavior exactly:

- If the secret word has one 'E' and the player guesses a word with two 'E's:
  - The 'E' in the correct position gets GREEN
  - The other 'E' gets GRAY (not yellow), because there's only one 'E' and it's accounted for
- If the secret word has two 'E's and the player guesses one 'E':
  - That 'E' gets GREEN or YELLOW as appropriate
- Rule: GREEN matches are assigned first. Then remaining unmatched secret letters are checked for YELLOW. Each secret letter can only be "claimed" once.

**Algorithm:**
```
1. Create array of 5 results, all start as GRAY
2. Pass 1 — find GREENs:
   For each position i:
     if guess[i] === secret[i]:
       result[i] = GREEN
       mark secret[i] as "used"
3. Pass 2 — find YELLOWs:
   For each position i where result[i] is still GRAY:
     search for guess[i] in secret where that secret position is not "used"
     if found:
       result[i] = YELLOW
       mark that secret position as "used"
4. All remaining are GRAY
```

---

## WORD LIST

### Two Lists Required

**Answer list (~2,500 words):** Common, recognizable 5-letter English words that a typical player would know. No obscure words, no slurs, no offensive terms. This is the pool that secret words are drawn from.

Seed the list with botanical words where possible (these should be sprinkled in, not dominant — maybe 10-15% of the pool):
BLOOM, FROND, SPORE, THORN, PETAL, FLORA, PLANT, SHRUB, STALK, GROVE, ROOTS, HERBS, TULIP, LILAC, DAISY, PANSY, ASTER, CEDAR, BIRCH, MAPLE, OLIVE, HEDGE, WHEAT, GRAIN, GOURD, FUNGI, MOSSY, LEAFY, GROWN, SEEDS, FIELD, MARSH, CREEK, EARTH, MULCH, LOAMY, PRUNE, GRAFT, FRUIT, BERRY, MELON, PEACH, MANGO, LEMON, GRAPE

**Valid guess list (~10,000 words):** Broader list of all recognized 5-letter English words. Players can guess words from this list even if they'd never be an answer. This prevents frustration from "that should be a word!" rejections while keeping answers accessible.

### Word List Storage

Embed both lists as compressed strings in the game code. At ~6 chars per word (5 letters + delimiter), 10,000 words ≈ 60KB. This is acceptable within the single-file budget.

**Compression approach:** Store as a single comma-separated string, split on load:
```javascript
var _sproutAnswers = "BLOOM,FROND,SPORE,...".split(",");
var _sproutValid = "AAHED,AALII,ABACI,...".split(",");
```

### Daily Word Selection

Daily Challenge word is deterministic based on date:
```javascript
function getDailyWord() {
  var d = new Date();
  var dayIndex = Math.floor((d.getTime() - new Date(2026, 3, 1).getTime()) / 86400000);
  // Shuffle answer list with seeded PRNG based on a fixed secret key
  var shuffled = seededShuffle(_sproutAnswers, 'pw_sprout_2026');
  return shuffled[dayIndex % shuffled.length];
}
```

This ensures:
- Same word for all players on the same day
- Words don't repeat for ~7 years (2,500 word pool)
- Sequence isn't predictable without the seed key

### Unlimited Mode Word Selection

Random word from _sproutAnswers using Math.random(). New word each game. No restrictions on repeats (player won't notice).

---

## GAME MODES

### Daily Challenge
- One word per day
- All players get the same word
- Can only play once per day
- Result saved to localStorage with date key
- If already completed today: show result, can't replay
- Streak tracking: consecutive days played/won

### Unlimited
- Random word each game
- Play as many times as you want
- No streak tracking (that's daily-only)
- Slightly lower hash reward than daily (to incentivize the daily habit)

### Hard Mode (toggle, works in both modes)
- Any GREEN letter must stay in that position in subsequent guesses
- Any YELLOW letter must be used somewhere in subsequent guesses
- Forces logical deduction, prevents random guessing
- Visual indicator when Hard Mode is on
- If a guess violates hard mode: reject with message "Must use confirmed letters" — do NOT submit the guess

---

## MOBILE UI LAYOUT

Target: Pixel 9 (412×924 CSS viewport)

This layout is critical. It must feel as clean as NYT Wordle.

```
┌────────────────────────────────────┐
│  🌱 Sprout         Daily #42      │
│  [Daily] [Unlimited]  [Hard: OFF] │
├────────────────────────────────────┤
│                                    │
│   ┌───┬───┬───┬───┬───┐          │
│   │ P │ L │ A │ N │ T │  → 🟩🟨⬛🟨⬛  Row 1 (guessed) │
│   ├───┼───┼───┼───┼───┤          │
│   │ S │ H │ R │ U │ B │  → 🟩⬛⬛⬛🟩  Row 2 (guessed) │
│   ├───┼───┼───┼───┼───┤          │
│   │ S │ P │ O │ R │ E │  → typing  Row 3 (current)  │
│   ├───┼───┼───┼───┼───┤          │
│   │   │   │   │   │   │  Row 4 (empty)              │
│   ├───┼───┼───┼───┼───┤          │
│   │   │   │   │   │   │  Row 5 (empty)              │
│   ├───┼───┼───┼───┼───┤          │
│   │   │   │   │   │   │  Row 6 (empty)              │
│   └───┴───┴───┴───┴───┘          │
│                                    │
├────────────────────────────────────┤
│  ┌─┬─┬─┬─┬─┬─┬─┬─┬─┬─┐         │
│  │Q│W│E│R│T│Y│U│I│O│P│         │
│  ├─┼─┼─┼─┼─┼─┼─┼─┼─┼─┤         │
│  │A│S│D│F│G│H│J│K│L│ │         │
│  ├─┼─┼─┼─┼─┼─┼─┼─┼─┼─┤         │
│  │⏎│Z│X│C│V│B│N│M│⌫│ │         │
│  └─┴─┴─┴─┴─┴─┴─┴─┴─┴─┘         │
├────────────────────────────────────┤
│  ⚡ Hashes: 4  │  🔥 Streak: 12  │
└────────────────────────────────────┘
```

### Grid Tiles

- Each tile: 52×52px with 4px gap
- Total grid width: 5 × 52 + 4 × 4 = 276px — centered
- **Empty tile:** Dark border, no fill (rgba(74,124,53,.15) border)
- **Typing tile:** Letter visible, border brightens (rgba(74,124,53,.4))
- **GREEN revealed:** #538D3E (muted forest green) — letter white, bold
- **YELLOW revealed:** #B59F3B (muted golden amber) — letter white, bold
- **GRAY revealed:** #3A3A3C (dark gray) — letter white
- Reveal animation: tiles flip one at a time, left to right, 300ms per tile with 150ms stagger between tiles

### Keyboard

- QWERTY layout, 3 rows
- Bottom row: ENTER (left), Z-M, BACKSPACE (right)
- Key size: ~34×48px
- Keys change color to match best result for that letter:
  - GREEN > YELLOW > GRAY (green overrides yellow if same letter was green elsewhere)
  - Unguessed keys: neutral dark (rgba(74,124,53,.2))
- Tap a key → letter appears in current row's next empty tile
- Tap BACKSPACE → removes last letter in current row
- Tap ENTER → submits guess (if 5 letters and word is valid)

### No Physical Keyboard Support Needed

This is a mobile game on Pixel 9. The on-screen keyboard IS the input. Do not open the device's soft keyboard — our custom keyboard is the only input.

---

## ANIMATIONS

### Tile Reveal (THE signature animation)

When player submits a guess, tiles reveal one at a time, left to right:

1. Tile starts face-up with letter visible on neutral background
2. Tile flips (rotateX 90° over 150ms — letter disappears)
3. At 90° (edge-on), background color changes to GREEN/YELLOW/GRAY
4. Tile flips back to face-up (another 150ms — letter reappears on colored background)
5. Total per tile: 300ms
6. Stagger: 150ms between each tile
7. Total for full row: 300 + (4 × 150) = 900ms

**CSS for flip:**
```css
.tile-flip {
  animation: flipIn 150ms ease-in forwards, flipOut 150ms ease-out 150ms forwards;
}
@keyframes flipIn {
  from { transform: rotateX(0deg); }
  to   { transform: rotateX(90deg); }
}
@keyframes flipOut {
  from { transform: rotateX(90deg); }
  to   { transform: rotateX(0deg); }
}
```

### Other Animations

| Event | Animation | Duration |
|-------|-----------|----------|
| Letter typed | Tile scales up briefly (1.0 → 1.08 → 1.0) | 80ms |
| Invalid word | Entire row shakes horizontally | 300ms (3 oscillations) |
| Win | All tiles in winning row bounce in sequence | 500ms, 100ms stagger |
| Lose | Word reveal fades in below grid | 400ms |
| Keyboard key press | Key darkens briefly | 100ms |

### Win Celebration

If solved:
- Winning row tiles bounce one at a time (translateY -10px and back, 100ms stagger)
- After bounce: brief delay (500ms), then show results modal

### Loss Reveal

If all 6 guesses used:
- 800ms pause after last tile reveals
- Answer appears above the grid: "The word was SPORE" (fade in, green text)
- Then show results modal

---

## RESULTS / SHARE MODAL

After every completed game (win or lose), show a modal:

```
┌────────────────────────────────┐
│        🌱 Sprout #42           │
│                                │
│    ⬛🟨⬛⬛🟩                  │
│    🟩⬛⬛⬛🟩                  │
│    🟩🟩🟩🟩🟩                  │
│                                │
│    Solved in 3/6 !             │
│                                │
│    Daily Streak: 12 🔥         │
│    Win Rate: 94%               │
│                                │
│    ⚡ +6 Hashes Earned         │
│                                │
│  [Share Grid]  [Play Again*]   │
│                                │
└────────────────────────────────┘
```

*"Play Again" → launches Unlimited mode (Daily is once per day). If already in Unlimited, just starts a new word.

### Share Grid

Tap "Share Grid" → copies emoji grid to clipboard:

```
🌱 Sprout #42 — 3/6

⬛🟨⬛⬛🟩
🟩⬛⬛⬛🟩
🟩🟩🟩🟩🟩
```

Use `navigator.clipboard.writeText()` with fallback to a textarea-select-copy for older browsers. Show "Copied!" toast for 1.5s after tapping.

---

## SOUND DESIGN (Web Audio API)

| Event | Sound |
|-------|-------|
| Letter typed | Very soft key click (barely audible, 30ms) |
| Guess submitted | Subtle "lock in" tone (low, firm, 100ms) |
| GREEN reveal | Clear positive chime (ascending, 80ms) |
| YELLOW reveal | Neutral mid-tone (flat, 60ms) |
| GRAY reveal | Soft dull tap (low, 40ms) |
| Invalid word | Buzz (low, 150ms) |
| Win | Bright ascending arpeggio (C-E-G-C, 400ms) |
| Lose | Gentle descending two-note (200ms) |

**Tile reveals play their sound as each tile flips, creating a musical sequence as the row reveals.** This is subtle but satisfying — a row of all greens sounds like an ascending melody.

---

## HASH INTEGRATION

### Attention Weight Entry

```javascript
sprout: {game_complete:2, daily_solve:3, hard_mode_bonus:2, perfect_solve:2, default:0}
```

### Hash Events

| Event | Trigger | Hashes |
|-------|---------|--------|
| game_complete | Any completed game (win or lose, daily or unlimited) | 2 × _dm |
| daily_solve | Solving the Daily Challenge | 3 (flat, no multiplier — same reward for everyone) |
| hard_mode_bonus | Solving while Hard Mode is ON | 2 × _dm |
| perfect_solve | Solving in 1 guess (astronomically rare) | 2 |

### Difficulty Multiplier for Unlimited Mode

- Normal: `_dm = 1.0`
- Hard Mode: `_dm = 1.5`

### Target Hash Rate

- Daily Challenge solved normally: 2 (complete) + 3 (daily) = 5 hashes
- Daily Challenge solved on hard: 2 + 3 + 2 = 7 hashes
- Unlimited game: 2 hashes per game, ~2-3 minutes each, high replay
- This deliberately makes the Daily Challenge more valuable to drive daily return habit

---

## DAILY STREAK SYSTEM

This is the retention superweapon. Model after NYT Wordle's streak tracking.

### Tracked Stats (localStorage)

```javascript
// stored in sws_game_records.sprout
sprout: {
  // Unlimited stats
  gamesPlayed: 0,
  gamesWon: 0,
  guessDistribution: [0,0,0,0,0,0],  // index 0 = solved in 1, index 5 = solved in 6
  
  // Daily stats
  dailyPlayed: 0,
  dailyWon: 0,
  dailyStreak: 0,         // current consecutive days solved
  dailyMaxStreak: 0,      // best ever streak
  dailyLastPlayed: null,  // ISO date string 'YYYY-MM-DD'
  dailyGuessDistribution: [0,0,0,0,0,0],
  
  // Combined
  hardModeWins: 0
}
```

### Streak Logic

```
On daily game completion:
  today = new Date().toISOString().slice(0,10)  // 'YYYY-MM-DD'
  yesterday = (today minus 1 day)
  
  if dailyLastPlayed === yesterday:
    dailyStreak += 1  // continuing streak
  else if dailyLastPlayed === today:
    // already played today, do nothing
  else:
    dailyStreak = 1  // streak broken, start fresh
    
  dailyLastPlayed = today
  dailyMaxStreak = max(dailyMaxStreak, dailyStreak)
```

### Guess Distribution Bar Chart

In the results modal and stats view, show a horizontal bar chart:

```
1 ▓░░░░░░  2
2 ▓▓▓▓▓░░  14
3 ▓▓▓▓▓▓▓  22  ← most common
4 ▓▓▓▓░░░  11
5 ▓▓░░░░░  6
6 ▓░░░░░░  3
```

The bar for the current game's guess count is highlighted green. This is directly from NYT Wordle and players love seeing their distribution evolve over time.

---

## INVALID GUESS HANDLING

When player taps ENTER:

1. **Less than 5 letters:** Do nothing. (Or subtle shake of the current row.)
2. **Word not in valid list:** Row shakes horizontally. Brief toast appears: "Not in word list" (fades after 1.5s). Letters remain — player can backspace and fix.
3. **Hard Mode violation:** Row shakes. Toast: "Must use [letter] in position [N]" or "Must include [letter]". Letters remain.

---

## MODE SWITCHING

Above the grid, two pill buttons: `[Daily]` `[Unlimited]`

- Active mode has filled background (green)
- Inactive mode has outline only
- Tapping switches mode immediately
- If Daily is already completed today: grid shows completed state (all guesses visible, non-interactive). Player can view but not replay.
- Hard Mode toggle is a small switch/pill to the right: `[Hard: OFF]` / `[Hard: ON]`

---

## COLOR ACCESSIBILITY

The default GREEN/YELLOW/GRAY color scheme is not colorblind-safe (green-yellow is problematic for deuteranopia).

**Add a high-contrast colorblind mode** (toggle in settings or auto-detect if possible):
- GREEN → Orange (#F5793A)
- YELLOW → Blue (#85C0F9)  
- GRAY → Dark gray (unchanged)

This matches NYT Wordle's colorblind mode exactly and is proven effective.

Store preference: `localStorage.setItem('sws_sprout_colorblind', 'true')`

---

## WHAT NOT TO DO

- Do NOT use position:fixed for any game elements
- Do NOT rewrite switchTab
- Do NOT modify any economy values
- Do NOT open the device soft keyboard — our on-screen keyboard is the only input
- Do NOT allow guessing non-5-letter strings
- Do NOT reveal the answer until the game is over (win or all 6 guesses used)
- Do NOT let daily challenge be replayed (show completed state if already done today)
- Do NOT make the tile reveal instant — the staggered flip IS the tension
- Do NOT skip the duplicate letter handling algorithm — getting this wrong is the #1 bug in Wordle clones

---

## TESTING CHECKLIST

1. [ ] Grid renders 6 rows × 5 tiles, centered, proper sizing
2. [ ] On-screen keyboard renders QWERTY, all keys tappable
3. [ ] Letter input fills tiles left to right in current row
4. [ ] Backspace removes rightmost letter in current row
5. [ ] Enter submits only when 5 valid letters are entered
6. [ ] Invalid word → row shakes, toast appears, letters persist
7. [ ] Valid guess → tiles flip one at a time with color reveal
8. [ ] GREEN/YELLOW/GRAY logic is correct (test with duplicate letters!)
9. [ ] Keyboard keys update colors after each guess
10. [ ] GREEN overrides YELLOW on keyboard for same letter
11. [ ] Win triggers bounce animation + results modal
12. [ ] Loss reveals answer + shows results modal
13. [ ] Daily mode: same word for any player on same date
14. [ ] Daily mode: cannot replay after completion (shows completed grid)
15. [ ] Daily streak increments correctly on consecutive days
16. [ ] Daily streak resets if a day is skipped
17. [ ] Unlimited mode: new random word each game
18. [ ] Hard Mode: rejects guesses that don't use confirmed letters
19. [ ] Share Grid copies correct emoji grid to clipboard
20. [ ] Guess distribution bar chart displays correctly
21. [ ] Hash events fire at correct moments
22. [ ] Records save and persist in localStorage
23. [ ] Colorblind mode toggles and applies correct colors
24. [ ] Sounds play during tile reveals (different pitch per color)
25. [ ] Plays correctly on Pixel 9 in Chrome incognito
26. [ ] No overlap with other game panels

---

## WORD LIST APPENDIX

### Starter Answer List (Partial — Claude Code should expand to ~2,500)

Priority: common English words that most adults know. Mix in botanical words (~10-15%).

**Botanical words (include all of these):**
BLOOM, FROND, SPORE, THORN, PETAL, FLORA, PLANT, SHRUB, STALK, GROVE, HERBS, TULIP, LILAC, DAISY, PANSY, ASTER, CEDAR, BIRCH, MAPLE, OLIVE, HEDGE, WHEAT, GRAIN, GOURD, FUNGI, LEAFY, GROWN, SEEDS, FIELD, MARSH, CREEK, EARTH, MULCH, PRUNE, GRAFT, FRUIT, BERRY, MELON, PEACH, MANGO, LEMON, GRAPE, ACORN, ALDER, CROPS, FERNS, GRASS, LOTUS, MAIZE, PALMS, REEDS, ROSES, VINES, BLOOM, BOUGH, BRIAR

**Common English words (sample — expand to fill 2,500):**
ABOUT, ABOVE, AFTER, AGAIN, ALIGN, ALLOW, ALONE, ALONG, ANGRY, APART, APPLE, APPLY, ARENA, ARGUE, ARISE, ASIDE, AVOID, AWAKE, AWARD, AWARE, BASIC, BEACH, BEGIN, BEING, BELOW, BENCH, BIRTH, BLACK, BLAME, BLANK, BLAST, BLAZE, BLEED, BLEND, BLIND, BLOCK, BLOOD, BOARD, BOUND, BRAIN, BRAND, BRAVE, BREAD, BREAK, BREED, BRIEF, BRING, BROAD, BROKE, BROWN, BRUSH, BUILD, BURST, BUYER...

Claude Code should use a well-known open-source 5-letter word list (such as the one from the original Wordle source, which was published publicly) and filter for common, non-offensive words. Target: 2,500 answers, 10,000 valid guesses.

---

*Spec complete. Ready for Claude Code build.*

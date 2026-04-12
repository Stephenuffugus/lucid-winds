# PETAL WALK — JADE GARDEN (MAHJONG SOLITAIRE) GAME SPEC
## For: Claude Code (super-duper-enigma)
## From: Claude (Lead Dev) — Director Approved
## Date: March 31, 2026

---

## WHAT THIS IS

A new game for the Game tab game selector. Classic Mahjong Solitaire — match pairs of exposed identical tiles to clear a layered formation. Zero AI. Pure spatial reasoning and pattern recognition. Long, meditative sessions.

**Design reference:** Modeled after Microsoft Mahjong (layout variety, daily challenges), Arkadium/AARP Mahjong (senior-friendly sizing, clean interface), MobilityWare (animations, sound), and 1001 Mahjong (layout library depth).

**Name in game:** "Jade Garden"

---

## GAME SELECTOR ENTRY

Add to the G array:

```javascript
{id:'mahjong', n:'Jade Garden', i:'🀄', r:'Match exposed pairs of identical tiles to clear the garden. Tap two matching free tiles.'}
```

---

## TILE SYSTEM

### Tile Set: 144 Tiles Total

Traditional Mahjong Solitaire uses 144 tiles: 36 unique faces × 4 copies each.

**Our 36 unique tile faces, botanically themed:**

**Blooms (9 tiles, 4 copies each = 36):**
Bloom 1 through Bloom 9 — numbered flower designs, increasingly complex. Simple petal count: 1-petal, 2-petal, ... 9-petal.

**Leaves (9 tiles, 4 copies each = 36):**
Leaf 1 through Leaf 9 — numbered leaf designs. Simple leaf shapes with vein count matching the number.

**Seeds (9 tiles, 4 copies each = 36):**
Seed 1 through Seed 9 — numbered seed/pod designs. Seed clusters matching the number.

**Seasons (4 unique tiles, each appears once = 4):**
Spring (cherry blossom), Summer (sunflower), Autumn (maple leaf), Winter (bare branch).
**Special rule:** All 4 seasons match with each other (any season pairs with any season). This is traditional Mahjong Solitaire behavior.

**Elements (4 unique tiles, each appears once = 4):**
Rain (droplets), Sun (rays), Soil (mound), Wind (swirl).
**Special rule:** All 4 elements match with each other (same as seasons).

**Companions (4 tiles, 4 copies each = 16):**
Butterfly, Bee, Ladybug, Worm — simple iconic designs.

**Roots (4 tiles, 4 copies each = 16):**
Taproot, Fibrous, Bulb, Rhizome — simple root system silhouettes.

**Total: 36 + 36 + 36 + 4 + 4 + 16 + 16 = 148**

Hmm, that's 4 over. Adjust: Remove Roots category. Use:
- Blooms 1-9: 9 × 4 = 36
- Leaves 1-9: 9 × 4 = 36
- Seeds 1-9: 9 × 4 = 36
- Companions: 4 × 4 = 16
- Roots: 3 × 4 = 12
- Seasons: 4 × 1 = 4 (wild-match group)
- Elements: 4 × 1 = 4 (wild-match group)

**Total: 36 + 36 + 36 + 16 + 12 + 4 + 4 = 144 ✓**

### Tile Rendering

Each tile is a small rounded rectangle with:
- **3D depth effect:** Light top face, darker right edge, darker bottom edge (simulating a thick tile viewed from above-left)
- **Size:** 40×56px face, plus 3px right shadow and 3px bottom shadow = 43×59px total visual
- **Background:** Warm ivory/cream (#F5F0E1) for the tile face
- **Border:** Subtle line (#C4B998)
- **Shadow edges:** Right edge (#B8A87A), Bottom edge (#A89868) — creates the 3D stacked look
- **Icon:** Centered on the face, ~28×28px, using the botanical designs described above in Petal Walk palette colors

### Tile States

| State | Appearance |
|-------|-----------|
| **Free (playable)** | Full brightness, normal appearance |
| **Blocked** | Slightly dimmed (opacity 0.7), no interaction |
| **Selected (first tap)** | Bright green glow border (#4A7C35), lifted slightly (translateY -2px, enhanced shadow) |
| **Matched (vanishing)** | Scale up to 1.1, fade to 0, over 300ms |
| **Hint highlighted** | Pulsing soft golden glow, 800ms cycle |

---

## BOARD LAYOUTS

### What Makes a Tile "Free" (Playable)

A tile is free if:
1. It has NO tile on top of it (nothing in the layer above overlapping it)
2. It has a free edge on the LEFT side OR the RIGHT side (not blocked by an adjacent tile on both sides)

A tile blocked on both left AND right is not free, even if nothing is above it.

### Layout: Classic Turtle (Default)

The traditional Mahjong Solitaire "turtle" formation. 5 layers high at the peak.

```
Layer 0 (bottom): 12 columns × 8 rows with some edge removals (base shape)
Layer 1: 10 × 6 (centered on layer 0)
Layer 2: 8 × 4
Layer 3: 6 × 2
Layer 4: 1 tile (the cap)

Plus: 2 wing tiles extending left and right of layer 0
Plus: 1 extra tile extending from each wing
```

Total: 144 tiles arranged in the classic turtle silhouette.

**Layer position offsets:** Each layer is offset by half a tile width and half a tile height from the layer below, creating the overlapping stacked effect.

```
Layer stacking (side view):
    ┌─┐
   ┌┤ ├┐
  ┌┤│ │├┐
 ┌┤│└─┘│├┐
 │└┘   └┘│
 └────────┘
```

### Additional Layouts (build at least 3 total for launch)

**Layout 2: Fortress**
- Square base with a tall center column
- More vertical stacking = harder (fewer free tiles at any time)

**Layout 3: Cross / Garden Bed**
- Plus-sign shape
- Wide and flat = easier (more free tiles available)

**Layout 4: Pyramid**
- Triangle shape tapering to a point
- Medium difficulty

### Layout Data Format

Each layout is defined as an array of tile positions:

```javascript
var LAYOUTS = {
  turtle: [
    // Each entry: [layer, col, row]
    // Layer 0
    [0, 0, 3], [0, 0, 4], // left wing
    [0, 1, 2], [0, 1, 3], [0, 1, 4], [0, 1, 5],
    [0, 2, 1], [0, 2, 2], [0, 2, 3], [0, 2, 4], [0, 2, 5], [0, 2, 6],
    // ... etc for all 144 positions
    // Layer 1
    [1, 2, 2], [1, 2, 3], // ... centered subset
    // ... through Layer 4
    [4, 5, 3] // cap tile
  ],
  fortress: [ /* ... */ ],
  cross: [ /* ... */ ]
};
```

### Guaranteed Solvability

**CRITICAL:** Every dealt board MUST be solvable. Use the reverse-solve generation algorithm:

```
1. Start with empty board, all 144 tile positions defined by layout
2. Working from the TOP layer DOWN (and from CENTER outward):
   a. Find two positions that are currently "free" (would be free if filled)
   b. Assign the same tile face to both positions
   c. Mark both as "placed"
3. Repeat until all 144 positions are filled (72 matched pairs)
4. The order of placement IS the guaranteed solution path (in reverse)
```

For Seasons and Elements (wild-match groups):
- Place all 4 Season tiles as 2 pairs (Spring+Summer as pair 1, Autumn+Winter as pair 2)
- Since any season matches any season, both pairs are valid matches
- Same for Elements

**Store the solution path** so the "solve" animation (end-of-game review) can show one valid solution.

---

## GAME FLOW

### Setup
1. Player selects layout (or default: Turtle)
2. Board generates using reverse-solve algorithm
3. All 144 tiles render in formation
4. Timer starts at 0:00 counting up
5. Moves counter starts at 0

### Play Loop
1. Player taps a FREE tile → tile highlights with green glow (selected)
2. Player taps a second FREE tile:
   - If tiles MATCH → both tiles vanish with animation + sound. Move counter +1.
   - If tiles DON'T MATCH → second tile briefly flashes red. First tile deselects. 
3. Tapping the already-selected tile deselects it
4. Tapping a blocked tile → nothing happens (subtle shake or dim flash)
5. After each match, check if any valid pairs remain:
   - If yes → continue
   - If no → see "No More Moves" below

### Matching Rules
- Two tiles match if they have the same face (Bloom 3 + Bloom 3)
- Exception: any Season matches any other Season
- Exception: any Element matches any other Element
- Both tiles must be FREE (not blocked)

### Win Condition
All 144 tiles cleared. Board empty. Display completion stats.

### No More Moves
If no valid pairs exist among free tiles:
- Show overlay: "No matching pairs available"
- Options: [Shuffle ♻️] or [New Game]
- **Shuffle:** Randomly rearrange all remaining tiles on the board into the SAME positions (don't change the layout shape, just which face is where). Costs 30 seconds added to timer. Limited to 3 shuffles per game.
- This should be rare with the reverse-solve algorithm, but it CAN happen if the player matches in an order that blocks the remaining solution path.

---

## HINT SYSTEM

### How Hints Work
- Player taps the HINT button (💡)
- Two matching free tiles pulse with golden glow for 3 seconds
- Limited to 5 hints per game
- Each hint adds 15 seconds to timer (soft penalty — discourages over-reliance)
- Hint button shows remaining count: "💡 4"

### Hint Selection Logic
1. Find all valid matching pairs among free tiles
2. Prefer pairs where at least one tile is on the top layer (most useful to clear)
3. If multiple options, pick randomly among top-layer pairs
4. Highlight both tiles simultaneously

---

## UNDO

- Player can undo the last match (tiles reappear in their positions)
- Only 1 level of undo (last match only)
- Undo button grays out when no undo is available
- Undo does NOT affect timer
- Each undo use tracked in stats

---

## MOBILE UI LAYOUT

Target: Pixel 9 (412×924 CSS viewport)

```
┌────────────────────────────────────┐
│  🀄 Jade Garden     ⏱ 04:32      │
│  Turtle  Pairs: 58/72  Moves: 14  │
├────────────────────────────────────┤
│                                    │
│                                    │
│         ┌─┐                        │
│        ┌┤ ├┐      ← Layer 4       │
│       ┌┤│ │├┐     ← Layer 3       │
│      ┌┤│└─┘│├┐    ← Layer 2       │
│     ┌┤│└───┘│├┐   ← Layer 1       │
│    ┌┤│└─────┘│├┐  ← Layer 0       │
│    │└┤       ├┘│                   │
│    └─┤       ├─┘                   │
│      └───────┘                     │
│                                    │
│  (Board is centered and scaled     │
│   to fit within ~380×400px area)   │
│                                    │
├────────────────────────────────────┤
│  [💡 5] [↩ Undo] [♻️ 3] [⚙️]     │
├────────────────────────────────────┤
│  ⚡ Hashes: 3  │  Best: 3:42      │
└────────────────────────────────────┘
```

### Board Scaling

The board must fit within approximately 380px wide × 420px tall on Pixel 9. The Turtle layout at full tile size (43×59px per tile) spans roughly:
- Width: 14 columns × 22px half-tile offset ≈ 308px + tile width = ~350px
- Height: 8 rows × 30px half-tile offset ≈ 240px + 5 layers × 6px offset = ~270px

This fits. If future layouts are wider, apply a CSS transform scale to fit within the container.

### Tile Interaction Areas

Each tile's tap target must be at least 40×40px. With our 40×56px face size, this is met. Ensure tap targets don't overlap between layers — the TOP-MOST tile at any visual position should receive the tap event.

**Z-index layering:** Each layer gets a higher z-index. Within a layer, tiles render left-to-right, top-to-bottom. This ensures top tiles are visually and interactively on top.

### Touch Handling

```javascript
// On tap, find the topmost tile at tap coordinates
function getTileAtPoint(x, y) {
  // Iterate tiles from highest layer to lowest
  // For each tile, check if (x,y) falls within its rendered bounds
  // Return first (topmost) match
  // If tile is not free, return null (can't interact)
}
```

---

## 3D TILE RENDERING (CRITICAL — THIS IS THE VISUAL HOOK)

### Tile CSS Approach

Each tile is a div with layered box-shadows and borders to simulate 3D depth:

```css
.mj-tile {
  width: 40px;
  height: 56px;
  background: #F5F0E1;
  border: 1px solid #C4B998;
  border-radius: 4px;
  position: absolute;
  cursor: pointer;
  /* 3D depth: right and bottom edges */
  box-shadow: 
    2px 2px 0 0 #B8A87A,   /* right edge */
    3px 3px 0 0 #A89868,   /* bottom-right corner depth */
    1px 1px 3px rgba(0,0,0,.15); /* subtle real shadow */
  transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.3s ease;
}

.mj-tile.free {
  opacity: 1;
}

.mj-tile.blocked {
  opacity: 0.65;
  cursor: default;
}

.mj-tile.selected {
  transform: translateY(-3px);
  box-shadow:
    2px 4px 0 0 #B8A87A,
    3px 5px 0 0 #A89868,
    0 0 12px rgba(74,124,53,.5),  /* green glow */
    1px 1px 6px rgba(0,0,0,.2);
  border-color: #4A7C35;
}

.mj-tile.hint {
  animation: hintPulse 800ms ease-in-out infinite;
}

@keyframes hintPulse {
  0%, 100% { box-shadow: 2px 2px 0 0 #B8A87A, 0 0 4px rgba(212,168,67,.2); }
  50%      { box-shadow: 2px 2px 0 0 #B8A87A, 0 0 14px rgba(212,168,67,.6); }
}
```

### Layer Positioning

```javascript
// Position each tile based on layer, col, row
function positionTile(layer, col, row) {
  var TILE_W = 40;
  var TILE_H = 56;
  var LAYER_OFFSET_X = -3;  // each layer shifts left and up slightly
  var LAYER_OFFSET_Y = -3;
  var HALF_W = TILE_W / 2;  // tiles on upper layers are offset by half-tile
  
  var x = col * (TILE_W + 2) + (layer * LAYER_OFFSET_X);
  var y = row * (TILE_H / 2 + 2) + (layer * LAYER_OFFSET_Y);
  var z = layer * 10; // z-index per layer
  
  return { left: x, top: y, zIndex: z };
}
```

The half-tile height offset for rows creates the overlapping effect where each row covers the bottom half of the row above.

---

## TILE FACE ICONS

All tile faces are simple inline SVG icons at ~28×28px. They need to be instantly distinguishable at small size.

### Design Approach

**Blooms 1-9:** A circle with N petals radiating outward. 1=single petal, 9=full chrysanthemum. Color: dusty rose (#C47A7A). The number is also displayed small in the bottom-right corner for clarity.

**Leaves 1-9:** A leaf outline with N vein lines inside. Color: forest green (#4A7C35). Number in bottom-right.

**Seeds 1-9:** N small ovals clustered together. Color: golden amber (#D4A843). Number in bottom-right.

**Companions (4):** Butterfly, Bee, Ladybug, Worm — simple iconic silhouettes. Color: each gets its own color from the palette.

**Roots (3):** Taproot (single line down with small branches), Fibrous (many thin lines), Bulb (round base with stem). Color: warm brown (#8B6914).

**Seasons (4):** Cherry blossom (pink), Sunflower (gold), Maple leaf (orange-red), Bare branch (gray-brown). Each is unique and labeled with the season name small at bottom.

**Elements (4):** Rain drops (blue), Sun rays (gold), Soil mound (brown), Wind swirl (light gray). Each unique, labeled.

### Distinguishability Rule

Every tile face must be identifiable by:
1. Shape alone (for colorblind players)
2. Color family (for quick scanning)
3. Number or label (as fallback)

Never rely on color alone to distinguish two tile faces.

---

## ANIMATIONS

### Tile Match (most important)

When two tiles are matched:

1. Both tiles simultaneously:
   - Scale up to 1.15 over 100ms
   - Brief bright flash (white overlay at 30% opacity, 50ms)
2. Then:
   - Scale back to 1.0 and fade to opacity 0 over 200ms
   - Slight upward drift (translateY -8px) during fade
3. Total: ~350ms
4. Sound: Crisp ceramic "click-clack" (two quick tones)

### Tile Selection

- Tile lifts (translateY -3px) with enhanced shadow over 100ms
- Green glow border appears

### Invalid Match Attempt

- Second tile flashes red border (100ms on, 100ms off)
- Both tiles deselect
- Subtle low "thud" sound

### Shuffle

- All remaining tiles simultaneously shrink to 0 scale (200ms)
- Brief pause (200ms)
- Tiles reappear at new positions, growing from 0 to 1 scale (200ms)
- Total: ~600ms

### Win Celebration

- Remaining (empty) board briefly flashes
- "Garden Cleared!" text with botanical flourish animation
- Stats modal slides up

### Board Load

- Tiles cascade in from the bottom layer up, 20ms stagger per tile
- Creates a satisfying "building" effect as the formation assembles
- Total: ~2.5 seconds for 144 tiles

---

## SOUND DESIGN (Web Audio API)

| Event | Sound | Implementation |
|-------|-------|----------------|
| Tile select | Soft ceramic tap | Sine 800Hz, 30ms, quick decay |
| Tile match | Crisp double-click | Two sine tones: 600Hz then 900Hz, 40ms each, 30ms gap |
| Invalid match | Dull knock | Sine 200Hz, 60ms |
| Hint highlight | Gentle bell | Sine 1000Hz with slow decay, 200ms |
| Shuffle | Rattling cascade | White noise burst through bandpass, 400ms |
| Board load | Cascading clicks | Rapid quiet taps at increasing pitch during tile cascade |
| Win | Triumphant chime | C major arpeggio ascending, 500ms |
| No more moves | Descending two-note | 400Hz → 250Hz, 300ms |

**The tile match sound is THE most important sound in the game.** It needs to be crisp, ceramic, satisfying. Think of the sound of two porcelain pieces clicking together. This is what brings players back.

---

## HASH INTEGRATION

### Attention Weight Entry

```javascript
mahjong: {milestone:1, game_complete:4, speed_clear:2, no_hint_bonus:2, default:0}
```

### Hash Events

| Event | Trigger | Hashes |
|-------|---------|--------|
| milestone | Every 12 pairs matched (at pairs 12, 24, 36, 48, 60) | 1 each = 5 total |
| game_complete | Board fully cleared | 4 × _dm |
| speed_clear | Completed under 5 minutes | 2 |
| no_hint_bonus | Completed without using any hints | 2 |

### Difficulty Multiplier

- Turtle layout: `_dm = 1.0`
- Fortress layout: `_dm = 1.5`
- Custom harder layouts: `_dm = 2.0`

### Target Hash Rate

Full clear: 5 milestones + 4 completion = 9 base hashes. With bonuses up to 13. Games last 8-15 minutes. Excellent hash-per-minute ratio for longer sessions.

---

## STAR RATING (Per Game)

After completion, award 1-3 stars (modeled after MobilityWare):

| Stars | Criteria |
|-------|----------|
| ⭐ | Completed (any time, hints used) |
| ⭐⭐ | Completed under 8 minutes OR 2 or fewer hints used |
| ⭐⭐⭐ | Completed under 5 minutes AND zero hints used |

Display stars in the completion modal and in game records. Stars give players a secondary goal beyond just clearing the board.

---

## RECORDS

```javascript
mahjong: {
  gamesPlayed: 0,
  gamesWon: 0,           // full clears only
  bestTimeTurtle: null,   // milliseconds
  bestTimeFortress: null,
  bestTimeCross: null,
  bestTimePyramid: null,
  totalPairsMatched: 0,
  totalHintsUsed: 0,
  totalShufflesUsed: 0,
  perfectGames: 0,        // 3-star completions
  longestSession: 0       // longest single game in ms
}
```

---

## GAME END SCREEN

```
┌────────────────────────────────────┐
│                                    │
│      🀄 Garden Cleared! 🀄        │
│            ⭐⭐⭐                  │
│                                    │
│     Time: 4:32                     │
│     Moves: 72                      │
│     Hints: 0                       │
│     Shuffles: 0                    │
│                                    │
│     ⚡ +13 Hashes Earned           │
│                                    │
│   [Play Again]  [New Layout]       │
│                                    │
└────────────────────────────────────┘
```

On incomplete game (quit or no-more-moves with no shuffles):
```
│      Garden Resting...             │
│     Pairs Cleared: 48/72          │
│     ⚡ +5 Hashes (milestones)     │
│   [Try Again]  [Different Layout] │
```

---

## LAYOUT SELECTOR

Before game start, show a layout picker:

```
┌────────────────────────────────────┐
│  Choose Your Garden                │
│                                    │
│  ┌──────┐  ┌──────┐  ┌──────┐   │
│  │🐢    │  │🏰    │  │✚     │   │
│  │Turtle│  │Fort  │  │Cross │   │
│  │ ★☆☆ │  │ ★★☆ │  │ ★☆☆ │   │
│  └──────┘  └──────┘  └──────┘   │
│                                    │
│  ┌──────┐                         │
│  │△     │                         │
│  │Pyramid│                        │
│  │ ★★☆ │                         │
│  └──────┘                         │
│                                    │
│  Difficulty: ★ = easier, ★★★ = harder │
└────────────────────────────────────┘
```

Each layout card shows:
- Icon representing the shape
- Name
- Difficulty stars
- Best time (if previously played)

---

## TOOLBAR

Below the board, a clean row of action buttons:

```
[💡 5]  [↩ Undo]  [♻️ 3]  [⚙️]
 Hint     Undo    Shuffle  Settings
```

- **Hint (💡):** Shows remaining count. Grayed out when 0 remaining. Tap → highlights a matching pair for 3 seconds.
- **Undo (↩):** Grayed out when no undo available. Tap → last matched pair reappears.
- **Shuffle (♻️):** Shows remaining count. Grayed out when 0 remaining. Tap → confirmation "Shuffle remaining tiles? +30s penalty" → [Yes] [No].
- **Settings (⚙️):** Opens panel for: Sound on/off, layout change, colorblind mode, quit to menu.

---

## WHAT NOT TO DO

- Do NOT use position:fixed for any game elements
- Do NOT rewrite switchTab
- Do NOT modify any economy values
- Do NOT make tiles flat — the 3D depth effect is essential
- Do NOT skip the solvability algorithm — unsolvable boards destroy player trust
- Do NOT make tile tap targets smaller than 40×40px
- Do NOT allow tapping blocked tiles (no response, no error — just nothing)
- Do NOT auto-select the only remaining match — let the player find it
- Do NOT show all valid pairs at once in hint mode — show only ONE pair

---

## TESTING CHECKLIST

1. [ ] 144 tiles render in correct Turtle formation
2. [ ] Tiles show visible 3D depth/layering
3. [ ] Free tile detection works (not blocked left+right, not covered above)
4. [ ] Only free tiles respond to taps
5. [ ] Tile selection highlights correctly (green glow, lift)
6. [ ] Matching identical tiles removes both with animation
7. [ ] Seasons wild-match (any season pairs with any season)
8. [ ] Elements wild-match (any element pairs with any element)
9. [ ] Non-matching pairs flash red and deselect
10. [ ] Board is always solvable (test 20+ random generations)
11. [ ] "No more moves" detection fires correctly
12. [ ] Shuffle rearranges tiles and adds time penalty
13. [ ] Hint highlights one valid pair, decrements counter
14. [ ] Undo restores last matched pair
15. [ ] Timer runs and displays correctly
16. [ ] Move counter increments on each match
17. [ ] Star rating calculates correctly at completion
18. [ ] All 3+ layouts generate and render correctly
19. [ ] Board scales to fit Pixel 9 viewport
20. [ ] Tile cascade load animation plays on game start
21. [ ] Match sound is crisp ceramic double-click
22. [ ] Hash events fire at correct milestones
23. [ ] Records save and persist
24. [ ] Layout selector shows all available layouts with best times
25. [ ] Plays correctly on Pixel 9 in Chrome incognito
26. [ ] Topmost tile receives tap when tiles overlap between layers
27. [ ] No overlap with other game panels

---

*Spec complete. Ready for Claude Code build.*

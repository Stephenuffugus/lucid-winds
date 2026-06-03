# LUCID WINDS — Games Manifest

> **Audience:** Sky Wolf Studios Director. Read-only inventory of every
> mini-game inside Lucid Winds, as of HEAD `ac8ddb7` (2026-05-23).
>
> **Source of truth:** the `G` array at `index.html:61752-61819` is the live
> game registry. Every entry here was copied from there; modular files were
> spot-checked under `/workspaces/lucid-winds/games/`.

---

## Quick facts

- **65 registered games** (the `G[]` array).
- **54 modular** — one file each in `/games/<id>.js`, loaded on demand by `_sg()` at `index.html:63220-63227`.
- **11 inline** — defined directly in `index.html` (mostly classic board / dice).
- **2 marked WIP** in the registry: `rhythmvine`, `stonegarden` (still playable, flagged for refinement).
- **All 65 share one earn API**: `_e('event_name')` → `window.earnHashes(amount, source)`.
- **All games run inside one signed-in Firebase Auth session** (Email/Password, Google, or Facebook). No anonymous play.

### Categories (declared at `index.html:61745-61751`)

| Key | Label | Icon |
|---|---|---|
| `creative` | CREATIVE | 🎵 |
| `card` | CARD GAMES | 🂡 |
| `puzzle` | PUZZLES | 🧩 |
| `board` | BOARD GAMES | ♟ |
| `pattern` | PATTERN & MEMORY | 🧠 |
| `dice` | DICE GAMES | 🎲 |

### Engine glue

- **Game switch:** `window._sg(id)` at `index.html:63138` — tears down the previous game, mounts the new one into `#fg-ag`, lazy-loads `games/{id}.js?v={LW_VERSION}` if not loaded yet.
- **Shared API for modular games:** `window._G` at `index.html:63129-63135` (exports `e`, `play`, `playWin`, `st`, `xt`, `ms`, `mm`, `mc`, `sm`, `sh`, `sr`, `gr`, `setDiff`, fullscreen helpers).
- **Per-game reward table:** `_aw[gameId][eventName]` — looked up inside `_e()`.

---

## Game inventory — 65 games

Columns:
- **ID** — the string passed to `_sg(id)` and stored as `_a` (current game).
- **Display name** — as shown in the picker.
- **Cat** — category key (creative / card / puzzle / board / pattern / dice).
- **One-line concept** — quoted from the registry blurb in `index.html` or shortened from there.
- **Path** — `games/<id>.js` (modular) or `inline` (in `index.html`).
- **Status** — `WORKING` / `WIP` (flagged `wip:true` in the registry) / `UNVERIFIED` (file present, not deeply audited this pass).
- **Controls** — primary input modality.
- **Standalone needs** — minimum to lift the game out of LW into its own page.

### CREATIVE (8)

| ID | Display name | Cat | One-line concept | Path | Status | Controls | Standalone needs |
|---|---|---|---|---|---|---|---|
| `song` | Music Studio | creative | Full music production studio. Layer drums, bass, keys and leads. | `games/song.js` | WORKING | Tap pads / keys, Web Audio | Drop `_G` shim; uses `AudioContext` + samples; pull `assets/sfx/` |
| `bloomwheel` | Bloom Wheel | creative | Draw botanical mandalas on a spinning canvas synced to a generative beat. | inline (`index.html`) | WORKING | Canvas drag, audio | Move inline block out; uses `AudioContext` + `_bwKillAudio` |
| `breathing` | Breathing Garden | creative | Guided breathing with 4 patterns. Bloom with every breath. | `games/breathing.js` | WORKING | Tap (timed) | Self-contained; shim `_G.e` and `_play` |
| `colorgarden` | Color Garden | creative | Tap to fill botanical coloring pages. 23 colors, 3 procedural scenes. | `games/colorgarden.js` | WORKING | Tap fills | Save-throttle gate (`_lwArtSaveGate`); needs scene assets |
| `pixelgarden` | Pixel Garden | creative | Pixel art painter. Draw with 24 botanical colors. Save as PNG. | `games/pixelgarden.js` | WORKING | Tap / drag pixels | Self-contained; canvas → PNG via toDataURL |
| `seedtoss2` | Seed Toss | creative | Flick seeds into the pot. Physics + wind at higher levels. | `games/seedtoss2.js` | WORKING | Drag / flick | Self-contained physics; mount target div |
| `storyseeds` | Story Seeds | creative | Daily writing prompts. Save your entries. | `games/storyseeds.js` | WORKING | Keyboard | localStorage for entries; daily prompt rotation |
| `stonegarden` | Stone Garden | creative | Stack stones in zen balance. Reach the target height. | `games/stonegarden.js` | **WIP** (registry `wip:true`) | Drag / drop | Tagged WIP in registry; physics needs polish |
| `rhythmvine` | Rhythm and Vine | creative | Tap to the beat. Perfect/Great/Good timing windows. | `games/rhythmvine.js` | **WIP** (registry `wip:true`) | Tap (timed) | Tagged WIP; needs `AudioContext` cleanup (May 22 thermal audit) |

### CARD (10)

| ID | Display name | Cat | One-line concept | Path | Status | Controls | Standalone needs |
|---|---|---|---|---|---|---|---|
| `klondike` | Klondike | card | The classic. Build 4 foundation piles Ace to King by suit. | `games/klondike.js` | WORKING | Tap / drag | Needs shared `_cards.js` card utilities |
| `spider` | Spider | card | Build King-to-Ace runs by suit. 1, 2, or 4 suit variants. | `games/spider.js` | WORKING | Tap / drag | Same — `_cards.js` |
| `freecell` | FreeCell | card | All cards visible. Use 4 free cells to maneuver. | `games/freecell.js` | WORKING | Tap / drag | `_cards.js` |
| `pyramid` | Pyramid | card | Remove pairs that sum to 13. Kings remove alone. | `games/pyramid.js` | WORKING | Tap | `_cards.js` |
| `tripeaks` | TriPeaks | card | Build up or down on the waste pile to clear three peaks. | `games/tripeaks.js` | WORKING | Tap | `_cards.js` |
| `golf` | Golf Solitaire | card | Move cards one rank up or down to the waste pile. | `games/golf.js` | WORKING | Tap | `_cards.js` |
| `cribbage` | Cribbage | card | Count to 15, peg to 121. Cards + math + strategy. | `games/cribbage.js` | WORKING | Tap | `_cards.js`, scoring lib internal |
| `bowergarden` | Euchre | card | 4-player trick-taking with bowers. You + AI partner vs 2 AI. | `games/bowergarden.js` | WORKING | Tap | `_cards.js`, AI inline |
| `bleedinghearts` | Bleeding Hearts | card | Classic Hearts. Avoid hearts (1pt) and Queen of Spades (13pt). | `games/bleedinghearts.js` | WORKING | Tap | `_cards.js`, AI inline |
| `gardenspades` | Garden Spades | card | Classic Spades. Bid your tricks, spades is trump. | `games/gardenspades.js` | WORKING | Tap | `_cards.js`, AI inline |
| `juniper` | Juniper | card | Draw, discard, build sets and runs. Go out first. | `games/juniper.js` | WORKING | Tap / drag | `_cards.js` |

### PUZZLE (22)

| ID | Display name | Cat | One-line concept | Path | Status | Controls | Standalone needs |
|---|---|---|---|---|---|---|---|
| `merge` | 2048 | puzzle | Swipe or tap arrows to merge same-number tiles. Reach 2048. | `games/merge.js` | WORKING | Swipe / arrows | Self-contained grid logic |
| `lights` | Lights Out | puzzle | Tap a light to toggle it AND its 4 neighbors. | `games/lights.js` | WORKING | Tap | Self-contained |
| `mines` | Minesweeper | puzzle | Tap to dig. Numbers show adjacent mines. Flag with 🚩 mode. | `games/mines.js` | WORKING | Tap / long-press | Self-contained |
| `sudoku` | Sudoku | puzzle | Fill every row, column and 3×3 box with digits 1-9. | `games/sudoku.js` | WORKING | Tap / keyboard | Puzzle bank inside file |
| `wordsearch` | Word Search | puzzle | Swipe across letters to spell a word. Themed packs. | `games/wordsearch.js` | WORKING | Swipe | Needs word bank (uses `word-banks.js`) |
| `rootrush` | Root Rush | puzzle | Slide roots to free a sprouting seed. 65 solver-verified levels. | `games/rootrush.js` | WORKING | Drag | Self-contained, level bank inline |
| `hanoi` | Tower of Hanoi | puzzle | Stack every disc on the far peg. 3/4 pegs, 3-8 discs. | `games/hanoi.js` | WORKING | Tap / drag | Self-contained |
| `slider` | 15 Puzzle | puzzle | Slide tiles into the empty space. 3×3, 4×4, or 5×5. | `games/slider.js` | WORKING | Tap | Self-contained |
| `picross` | Bloom Grid | puzzle | Fill/cross squares from clues to reveal a hidden picture. | inline (`index.html`) | WORKING | Tap | Move inline block; uses procedural pic generator |
| `colorsort` | Bee's Pollen Sort | puzzle | Sort pollen into matching vials. 60 levels, free undo. | `games/colorsort.js` | WORKING | Tap | Self-contained, level bank inline |
| `flood` | Flood Fill | puzzle | Tap a color to flood from the top-left. | `games/flood.js` | WORKING | Tap | Self-contained |
| `pipe` | Vine Puzzle | puzzle | Rotate vine tiles to connect the flow from source to end. | `games/pipe.js` | WORKING | Tap to rotate | Self-contained |
| `sokoban` | Sokoban | puzzle | Push crates onto targets. Crates only push, never pull. | inline (`index.html`) | WORKING | Tap / swipe | Move inline block; level bank inline |
| `petalfall` | Block Drop | puzzle | Arrange falling blocks to clear rows. | `games/petalfall.js` | WORKING | Tap / swipe | Self-contained Tetris-like |
| `gardenlines` | Garden Lines | puzzle | Place tiles to build matching lines (shape or color). | `games/gardenlines.js` | WORKING | Drag | Self-contained |
| `kakuro` | Garden Sums | puzzle | Fill cells with 1-9 so each run adds to its clue. | `games/kakuro.js` | WORKING | Tap / keyboard | Self-contained; puzzle bank inline |
| `mosaic` | Mosaic Garden | puzzle | Pull colored tiles to fill mosaic rows for points. | `games/mosaic.js` | WORKING | Tap / drag | Self-contained |
| `rootflow` | Root Flow | puzzle | Draw paths to connect matching roots. Fill every cell. | `games/rootflow.js` | WORKING | Drag | Self-contained |
| `rootmaze` | Root Maze | puzzle | Navigate the shifting maze. Reach the treasure before the AI. | `games/rootmaze.js` | WORKING | Tap / swipe | Self-contained AI |
| `jade` | Jade Garden | puzzle | Mahjong: match free pairs to clear the turtle. Hint + shuffle. | `games/jade.js` | WORKING | Tap | Tile-set assets in `/assets/games/jade/` |
| `petalmatch` | Petal Match | puzzle | Swap botanical gems to make lines. Chain cascades for combos. | `games/petalmatch.js` | WORKING | Swap (tap two) | Self-contained match-3 |
| `sprout` | Sprout | puzzle | Find the hidden 5-letter word in 6 guesses. Wordle-like. | `games/sprout.js` | WORKING | Keyboard | Needs 5-letter word list (in `word-banks.js`) |
| `vinewords` | Vine Words | puzzle | Find words by connecting adjacent letters. 2 min timer. | `games/vinewords.js` | WORKING | Drag | Needs `vinewords-dict.js` (loaded by `_sg`) |

### BOARD (11)

| ID | Display name | Cat | One-line concept | Path | Status | Controls | Standalone needs |
|---|---|---|---|---|---|---|---|
| `chess` | Chess | board | Classic chess vs AI. Tap a piece, tap where to move. | `games/chess.js` | WORKING | Tap | AI engine inline |
| `c4` | Connect Fleur | board | Drop pieces to connect 4 in a row. | `games/c4.js` | WORKING | Tap column | Self-contained; AI inline. Memory note: an inline duplicate exists, edit the modular file. |
| `battleship` | Tide Hunt | board | Hunt hidden vessels on a 10×10 grid. | `games/battleship.js` | WORKING | Tap | AI placement logic inline |
| `mastermind` | Seed Code | board | Crack the hidden 4-color code. (`diff:1` — difficulty picker shown) | inline (`index.html`) | WORKING | Tap pegs | Move inline block out; uses difficulty selector |
| `checkers` | Checkers | board | Jump opponent pieces. Reach the far side to crown a King. | inline (`index.html`) | WORKING | Tap | Move inline block; AI inline |
| `reversi` | Reversi | board | Place pieces to surround and flip your opponent. | inline (`index.html`) | WORKING | Tap | Move inline block; AI inline |
| `backgammon` | Backgammon | board | Roll dice, move pieces. Bear off all 15 first. | inline (`index.html`) | WORKING | Tap | Move inline block; dice + AI inline |
| `seedsow` | Seed Sow | board | Mancala: sow seeds, capture into your store. First to empty wins. | `games/seedsow.js` | WORKING | Tap pit | Self-contained; AI inline |
| `vinecross` | Vine Cross | board | Get five in a row before the AI. 9/11/13 board sizes. | `games/vinecross.js` | WORKING | Tap | AI inline |
| `livingstones` | Living Stones | board | Go: 24 verified puzzles + full MCTS play (9×9, 13×13). | `games/livingstones.js` | WORKING | Tap | Puzzles inline; MCTS uses `games/livingstones-ai-worker.js` (Web Worker) |
| `trellis` | Trellis | board | Word-builder on a 15×15 grid vs AI. | `games/trellis.js` | WORKING | Drag tiles | Needs dictionary + tile bag; AI inline |
| `pollen` | Master Pollinator | board | Engine builder: collect pollen, grow plants, race to 15 Growth. | `games/pollen.js` | WORKING | Tap | Self-contained |

### PATTERN & MEMORY (8)

| ID | Display name | Cat | One-line concept | Path | Status | Controls | Standalone needs |
|---|---|---|---|---|---|---|---|
| `set` | Three Sisters | pattern | Tap 3 cards where each trait is ALL same or ALL different. | inline (`index.html`) | WORKING | Tap | The original SET game; deeply wired into LW UI (dashboard, win flow). Hardest of the 65 to extract — has its own status bar, growth strip, and engine integration |
| `stopten` | Stop at Ten | pattern | Start the clock. Stop it at exactly 10.00 seconds. | `games/stopten.js` | WORKING | Tap | Self-contained timer |
| `memory` | Memory | pattern | Flip 2 cards per turn. Match all pairs to clear the board. | `games/memory.js` | WORKING | Tap | Card-image assets in `assets/games/memory/` |
| `simon` | Echo | pattern | Watch the pattern flash, then repeat it in order. | `games/simon.js` | WORKING | Tap (sequence) | Self-contained; `AudioContext` (registered in May 22 thermal cleanup) |
| `dailybloom` | Daily Bloom | pattern | Daily cognitive workout. 8 evidence-backed exercises, 4 min. | `games/dailybloom.js` | WORKING | Tap / drag | Self-contained; tracks per-domain XP |
| `numbergarden` | Fast Math | pattern | 60-second arithmetic drill. Add, subtract, multiply, streak. | `games/numbergarden.js` | WORKING | Tap (multiple-choice) | Self-contained |
| `recall` | Memory Meadow | pattern | Watch symbols, count backwards, tap the ones you saw. | `games/recall.js` | WORKING | Tap | Self-contained |
| `pottingbench` | Speed Sort | pattern | Speed card sorting. Match any attribute to either pile. | `games/pottingbench.js` | WORKING | Tap / swipe | Trait card deck inline |

### DICE (3)

| ID | Display name | Cat | One-line concept | Path | Status | Controls | Standalone needs |
|---|---|---|---|---|---|---|---|
| `yahtzee` | Seed Shaker | dice | Five-dice classic. Roll 3 times, fill 13 categories. | inline (`index.html`) | WORKING | Tap (roll / hold) | Move inline block; dice assets `assets/dice/` |
| `farkle` | Farkle | dice | Roll 6 dice. Keep 1s, 5s, and three-of-a-kinds. Bank or bust. | inline (`index.html`) | WORKING | Tap | Move inline block; dice assets |
| `doubleshutter` | Double Shutter | dice | Shut the box twice. Roll 2 dice, shut tiles summing to roll. | inline (`index.html`) | WORKING | Tap tiles | Move inline block; dice assets |

---

## How a game wires into the engine

**Modular pattern** (e.g. `games/memory.js:1-6`):

```js
// ═══ LUCID WINDS — Memory Garden ═══
(function(){
'use strict';
var G=window._G;
// Aliases for shared utilities
var _e=G.e,_play=G.play,ms=G.ms,mm=G.mm,mc=G.mc,sm=G.sm,sh=G.sh,_sr=G.sr,_st=G.st,_xt=G.xt,_setDiff=G.setDiff;
```

Then the game calls `_e('progress')`, `_e('milestone')`, `_e('game_win')`, or
`_e('game_loss')` at the moment of each meaningful event, and the engine
takes it from there.

**Game switch / loader** at `index.html:63138-63227` (`_sg(id)` function): destroys
the prior game, mounts the new one, lazy-loads `games/{id}.js?v={LW_VERSION}`
if not loaded, registers a back button, fires `lw-studio-open` / `lw-studio-close`
events for the music-game audio cooperation.

---

## What each game would need to stand alone

These notes assume the game is being lifted into a separate web page that does NOT have LW's `window._G` or `window._e`. Almost every game needs the same shim:

```js
// Minimal shim a host page provides for any LW modular game:
window._G = {
  e:        function(event){ /* award sunbeams via your earn API */ },
  play:     function(sfx)  { /* sound effect */ },
  playWin:  function()     { /* victory chime */ },
  st:       function(){}, xt: function(){},   // session start / stop
  ms: function(){}, mm: function(){}, mc: function(){},   // misc UI helpers
  sm: function(){}, sh: function(){}, sr: function(){}, gr: function(){},
  setDiff:  function(d){},                    // difficulty selector
  solEnterFS: function(){}, solClearFS: function(){}, solExitFS: function(){},
  getM: function(){ return 0; }, setM: function(){}
};
```

After that:

- **Card games (Klondike, Spider, FreeCell, Pyramid, TriPeaks, Golf, Cribbage,
  Euchre, Hearts, Spades, Juniper):** also need `_cards.js` (shared card-deck
  utilities) loaded first. `_sg` loads it via the `_cdMk` cache when any of
  `_solGames[id]` triggers.
- **`vinewords`:** also needs `vinewords-dict.js` loaded.
- **`livingstones`:** uses `livingstones-ai-worker.js` as a Web Worker; copy
  the worker file too.
- **`song`, `bloomwheel`, `breathing`, `rhythmvine`:** create their own
  `AudioContext`. The May 22 thermal audit added `_lwRegisterGameCleanup` so
  contexts close on game exit and pause on `visibilitychange`. Standalone hosts
  should preserve that cleanup discipline or expect mobile heat / battery
  complaints.
- **Asset paths:** several games inline `<img src="assets/games/<id>/...">`. A
  standalone host must serve those assets at the same relative path or rewrite
  the references.
- **Inline games** (11 listed above): the source is embedded in `index.html` and
  needs to be cut out cleanly. The boundaries are visible by searching for the
  game's `id` (e.g. `mastermind`, `picross`) and tracing the function block. No
  modular file exists yet for these.

---

## Caveats

- **Inline games are the hardest extractions.** They share helper functions
  with the rest of the IIFE in `index.html`. The CLAUDE.md note says a syntax
  error in any of the 26 script blocks kills all functions in that block —
  extraction has to respect those boundaries.
- **`set` (Three Sisters)** is even more deeply wired: it has its own
  `#trios-dash`, `#trios-wrap`, `#set-status` DOM, its own growth strip, and
  the dashboard treats it as the "home" game. Lifting it cleanly is a project
  on its own.
- **WIP flags** (`rhythmvine`, `stonegarden`) signal "playable but not polished"
  per Stephen's design call. They credit sunbeams normally.
- **Status verification.** Every game in `G[]` is wired into `_sg` and loads
  on demand. I haven't played all 65 in this session — "WORKING" here means
  "the registry entry is live, the modular file exists (or the inline block is
  present), and the game's `_e()` call sites are wired." Per-game functional QA
  is out of scope for read-only recon.

---

*Companion file: `ENGINE_ARCHITECTURE.md` (answers 1-9 about the Sunbeam
engine). Both files were created by the LW codebase Claude on 2026-06-03 in
read-only mode — no other files were touched.*

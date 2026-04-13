# ART TODO — Mini-Games

Per-game art audit checklist. Mark each game with **OK** (ships as-is), **NEEDS** (specific asset), or **POLISH** (optional elevation) as you test.

Status key:
- ✅ Already has custom art
- 🎨 Uses CSS/SVG/emoji only — may want MJ art
- 🔍 Review on device

---

## Already Art-Rich (✅)
| Game | Current Art |
|------|-------------|
| chess | 14 piece PNGs in `assets/games/chess/` |
| memory | 18 tile images in `assets/games/memory/` |
| lights | 3 bulb states in `assets/games/lights/` |
| c4 | disc art in `assets/games/c4/` |
| flood | tile art in `assets/games/flood/` |
| pipe | pipe sprites in `assets/games/pipe/` |
| simon | pad art in `assets/games/simon/` |
| minesweeper | cells in `assets/games/minesweeper/` |
| sokoban | Stephen completed — DO NOT re-brief |
| Card solitaires (klondike/freecell/spider/pyramid/tripeaks/golf/gardenspades) | Full deck in `assets/games/cards/` |

---

## Newly Wired — Needs Review (🔍)

Check each on device. Flag NEEDS if emoji/SVG feels flat next to the art-rich games.

| Game | File | Current Visual Style | Art Candidate |
|------|------|----------------------|---------------|
| bleedinghearts | games/bleedinghearts.js | ? | heart bloom sprite? |
| bowergarden | games/bowergarden.js | ? | trellis/bower backdrop? |
| breathing | games/breathing.js | pulsing circle | breath-orb art |
| colorgarden | games/colorgarden.js | color swatches | swatch frame |
| cribbage | games/cribbage.js | cards (shared) | peg board art |
| dailybloom | games/dailybloom.js | ? | daily ritual frame |
| gardenlines | games/gardenlines.js | dots/lines | bead/line tiles |
| hanoi | games/hanoi.js | disc stack | carved disc art |
| jade | games/jade.js | mahjong-style | tile art (spec exists: JADE_GARDEN_MAHJONG_GAME_SPEC.md) |
| juniper | games/juniper.js | ? | ? |
| kakuro | games/kakuro.js | number grid | — likely text-only OK |
| livingstones | games/livingstones.js | Go-style stones | stone sprites |
| merge | games/merge.js | 2048-style tiles | tile ramp 2→2048 |
| mosaic | games/mosaic.js | ? | tile art |
| numbergarden | games/numbergarden.js | numeric | — likely text-only OK |
| petalblink | games/petalblink.js | petals | petal sprites (spec exists) |
| petalmatch | games/petalmatch.js | match-3 | 6-8 petal icons |
| pixelgarden | games/pixelgarden.js | picross | — grid OK |
| pollen | games/pollen.js | particles | pollen mote sprite |
| recall | games/recall.js | ? | ? |
| rhythmvine | games/rhythmvine.js | rhythm lanes | note sprite |
| rootflow | games/rootflow.js | flow/pipe variant | root tile set |
| rootmaze | games/rootmaze.js | maze | root path tiles |
| seedsow | games/seedsow.js | mancala (spec exists) | pit + seed art |
| seedtoss2 | games/seedtoss2.js | toss game | seed + target art |
| song | games/song.js | music game | note/stave art |
| sprout | games/sprout.js | wordle (spec exists) | letter tile frame |
| stonegarden | games/stonegarden.js | zen garden | stone + rake sprites |
| storyseeds | games/storyseeds.js | text adventure | — text OK |
| sudoku | games/sudoku.js | number grid | — text OK |
| trellis | games/trellis.js | ? | trellis frame |
| vinecross | games/vinecross.js | crossword | — text OK |
| vinewords | games/vinewords.js | boggle (spec exists) | letter bead art |
| wordsearch | games/wordsearch.js | letter grid | — text OK |

---

## Universal / Shared Art Wants
- [ ] **Game win overlay frame** (currently CSS) — ornate Celtic border matching set-51
- [ ] **Game picker tile frames** — each game's tile in picker could use thumbnail art (some already have via `assets/games/thumbs/`)
- [ ] **Difficulty chips** (Easy/Medium/Hard/Expert) — currently text chips, could get seasonal trim
- [ ] **Back button** — current CSS pill is fine but could get a petal motif

---

## Process
1. Stephen plays through each 🔍 game on device.
2. Marks NEEDS / POLISH / OK in this file.
3. Claude Code drafts Midjourney prompts for approved items, appends to `ART_TODO.md`.
4. Stephen runs MJ, drops files into `assets/games/<gameId>/`, Claude Code wires them.

---
_Generated: 2026-04-13. Rule: never brief art Stephen has already completed (Sokoban, card backs, dice 5/6). Always verify with Stephen before adding a game to the active brief list._

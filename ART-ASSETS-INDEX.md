# ART ASSETS INDEX

> The phone copy of batch 1 is a Google Doc in 012Assets: https://docs.google.com/document/d/1ZJ_65jToqmmKH9bXIrp3JHyJxUfCwTz7fYTzPLwcQ5g/edit ("ART QUEUE — START HERE"). This file is the source of truth; the Doc is regenerated from it.

## BATCH 1, six files. Nothing below this box matters until these are in.

| # | file | what | covers |
|---|---|---|---|
| 1 | `assets/games/bg/family-bench-900x1600.jpg` | a dark greenhouse potting bench seen from above, worn wood or slate, one warm lamp from the upper left, corners falling to near black, nothing in the middle third | 41 natives: every puzzle, pattern, word, math and creative game |
| 2 | `assets/games/bg/family-table-900x1600.jpg` | a dark green felt table with a warm lamp pool at the centre, near black corners, a hint of worn wood along the bottom edge | 14 natives: every card and dice game |
| 3 | `assets/games/bg/family-board-900x1600.jpg` | a dark walnut tabletop, straight grain, one warm lamp from the upper left, near black corners | 11 natives: every board game |
| 4 | `satellites/litter-bug/bug-style-hero-1024x1024.png` | ONE bug, cel shaded flat vector look, facing right, in the game palette (rust, moss, spark, ooze, glass, ash); never shipped, it sets the style every traced part follows | every bug in Litter Bug |
| 5 | `satellites/litter-bug/bg-alley-900x1600.jpg` | the night alley: brick, green dumpster with the lid up and a cat on it, chain fence right, one sodium lamp top right with a puddle, near black ground band across the bottom third | every screen of Litter Bug |
| 6 | `satellites/attic/bg-attic-900x1600.png` | a midnight attic: rafters top third, a round dormer window right with one cool shaft of light, crates along the floor, a bulb top left; about fifteen points lighter than #171310 so the shapes read | every screen of The Attic |

The three family plates are wired by me once they land: the backdrop hook already picks
`assets/games/bg/<id>.jpg` per game, so each game gets a copy of its family's plate under its own name.
Full bleed plates are portrait 900x1600 (the host resizes any side over 1600). Masters stay yours; web
copies are cut under new names.

## Everything else (parked until batch 1 is in)

One `ART_ASSETS.md` per game. Natives keep theirs in `assets/games/<id>/`
(drop the files there too); satellites in `satellites/<slug>/docs/`, which is where eleven of the
twelve new games keep theirs and is the convention as of 2026-09-07; the eleven vendored satellites in
`docs/art-lists/<slug>/` because their folders are byte copies of their upstream repos. Order is the
Sep 04 audit rank (the games that change the most first). "first ask" is the row that matters most.

**Where to start, by return per file:** every native's first row is a full bleed backdrop and the hook
is already live (`assets/games/bg/<id>.jpg` is picked up automatically), so a backdrop is one file for
a whole game. After that, the boards and tables (Chess is the ceiling), then Litter Bug's places and
its style hero, then The Attic's plate and veil.

| rank | game | folder | files | first ask |
|---|---|---|---|---|
| 1 | Petal Alchemy | `satellites/petal-alchemy/` | 4 | `satellites/petal-alchemy/assets/bg-bench-540x960.jpg` |
| 2 | Shut the Box | `assets/games/doubleshutter/` | 4 | `bg-shutbox-750x1334.jpg` |
| 3 | Wild Wardens (vendored) | `docs/art-lists/wild-wardens/` | 5 | `assets/art/bg-title-1080x2340.jpg` |
| 4 | Nonogram Bloom | `assets/games/picross/` | 4 | `board-plate-420x420.png` |
| 5 | Rabbit Ronin | `satellites/rabbit-samurai/` | 5 | `bg-crate-far.png` |
| 6 | Abduct a Chameleon 3D (vendored) | `docs/art-lists/abduct-a-chameleon/` | 3 | `assets/ui/howto-backdrop-1334x750.jpg` |
| 7 | Rootbound | `satellites/rootbound/` | 5 | `bg-rootbound-540x960.jpg` |
| 8 | Rhythm and Vine | `assets/games/rhythmvine/` | 4 | `bg-rhythmvine-trellis-540x900.jpg` |
| 9 | First Sprout | `satellites/first-sprout/` | 4 | `satellites/first-sprout/assets/bg-grove-night-750x1334.jpg` |
| 10 | Garden Guard | `satellites/garden-td/` | 6 | `assets/gg/maps/map_w1_kitchen.png` |
| 11 | Impossible Garden | `satellites/impossible-garden/` | 4 | `satellites/impossible-garden/assets/bg-garden-540x960.jpg` |
| 12 | Tetroku | `satellites/leaf-fit/` | 5 | `bg-trellis-540x960.jpg` |
| 13 | Tangent | `satellites/tangent/` | 4 | `bg-nearside-1080x2340.jpg` |
| 14 | Mosaic Garden | `assets/games/mosaic/` | 5 | `bg-mosaic-540x960.jpg` |
| 15 | Sudoku | `assets/games/sudoku/` | 3 | `bg-sudoku-540x960.jpg` |
| 16 | Star Field | `satellites/star-field/` | 4 | `bg-starfield-night-540x960.jpg` |
| 17 | Stone Garden | `assets/games/stonegarden/` | 4 | `bg-stonegarden-750x1600.jpg` |
| 18 | Story Seeds | `assets/games/storyseeds/` | 4 | `bg-storyseeds-540x960.jpg` |
| 19 | Season Sway | `satellites/season-sway/` | 4 | `visitor-portraits-sheet-1024x1024.png` |
| 20 | Deepwell | `satellites/deepwell/` | 4 | `satellites/deepwell/art/deepwell-04-shale.png (and -topsoil, -darkseam, -wetshelf, -theglass)` |
| 21 | Root Maze | `assets/games/rootmaze/` | 5 | `bg-rootmaze-540x960.jpg` |
| 22 | Sea Battle | `assets/games/battleship/` | 5 | `assets/games/battleship/bg-sea-540x960.jpg` |
| 23 | Breathing Garden | `assets/games/breathing/` | 3 | `bg-breathing-540x960.jpg` |
| 24 | Power Scalers | `satellites/power-scalers/` | 4 | `bg-arena-540x960.jpg` |
| 25 | Rule Root | `satellites/rule-root/` | 5 | `bg-rule-garden-540x960.jpg` |
| 26 | Bloom Breaker | `satellites/bloom-breaker/` | 4 | `bg-bramble-540x960.jpg` |
| 27 | Pollinator Paths | `satellites/pollinator-paths/` | 8 | `bg-meadow-night-540x960.jpg` |
| 28 | Cipher Bloom | `satellites/cipher-bloom/` | 4 | `bg-cipher-title-540x960.jpg` |
| 29 | Line Loom | `satellites/line-loom/` | 4 | `assets/valley-night-540x960.jpg` |
| 30 | Pit Bike Rally | `satellites/pitbike-rally/` | 2 | `bg-rotate-portrait-540x960.jpg` |
| 31 | Mancala | `assets/games/seedsow/` | 4 | `bg-seedsow-750x1334.jpg` |
| 32 | Stop Motion | `satellites/stop-motion/` | 4 | `bg-bench-540x960.jpg` |
| 33 | Meadow Weave | `satellites/meadow-weave/` | 4 | `bg-weave-540x960.jpg` |
| 34 | Silt | `satellites/silt/` | 3 | `assets/backdrops/how_shelf_540x784.jpg` |
| 35 | Burrow Bowl | `satellites/burrow-bowl/` | 4 | `bg-burrow-lane-540x960.jpg` |
| 36 | Bloom Wheel | `assets/games/bloomwheel/` | 4 | `wheel-plate-840x840.png` |
| 37 | Tempo Grove | `satellites/tempo-grove/` | 6 | `bg-grove-540x784.jpg` |
| 38 | Garden Lines | `assets/games/gardenlines/` | 4 | `gl-tile-faces-576x96.png` |
| 39 | Litter Bug (vendored) | `docs/art-lists/litter-bug/` | 9 | `bg-alley-900x1600.jpg` |
| 40 | Bramble Court | `satellites/bramble-court/` | 4 | `cards/portraits-sheet-1680x2100.png` |
| 41 | Bee's Pollen Sort | `assets/games/colorsort/` | 5 | `assets/games/colorsort/bg-hive-540x960.jpg` |
| 42 | Garden Estates | `satellites/garden-estates/` | 5 | `bg-garden-estates-540x960.jpg` |
| 43 | Sunforge | `satellites/ring-stacker/` | 4 | `sunforge-core-256x256.png` |
| 44 | Merge & Blast | `satellites/merge-blast/` | 3 | `bg-merge-540x960.jpg` |
| 45 | Daily Bloom | `assets/games/dailybloom/` | 4 | `bg-dailybloom-540x960.jpg` |
| 46 | Root Groups | `satellites/root-groups/` | 4 | `bg-grove-540x960.jpg` |
| 47 | Twin Lanterns | `satellites/twin-lanterns/` | 4 | `bg-night-garden-750x1334.jpg` |
| 48 | Color Garden | `assets/games/colorgarden/` | 4 | `paper-1200x1200.jpg` |
| 49 | Memory Meadow | `assets/games/recall/` | 4 | `assets/games/recall/bg-meadow-540x960.jpg` |
| 50 | Tinker Loft | `satellites/tinker-loft/` | 4 | `bg-loft-540x960.jpg` |
| 51 | Think Fast | `satellites/micro-meadow/` | 4 | `bg-meadow-540x960.jpg` |
| 52 | Fast Math | `assets/games/numbergarden/` | 5 | `abacus-owl-idle.png` |
| 53 | Word Sprout | `assets/games/sprout/` | 3 | `bg-sprout-540x960.jpg` |
| 54 | Speed Sort | `assets/games/pottingbench/` | 4 | `bg-pottingbench-540x960.jpg` |
| 55 | HUNCH (vendored) | `docs/art-lists/hunch/` | 5 | `assets/personas/persona_critic_idle@3x.png (plus noir, sunny, gremlin, zen)` |
| 56 | Checkers | `assets/games/checkers/` | 4 | `assets/games/checkers/board-720x720.png` |
| 57 | Block Drop | `assets/games/petalfall/` | 4 | `assets/games/petalfall/blocks-sheet-448x64.png` |
| 58 | Plot Bloom | `satellites/plot-bloom/` | 3 | `bg-plot-540x960.jpg` |
| 60 | Create A Critter | `satellites/create-a-critter/` | 4 | `logo-nest-256x256.png` |
| 61 | Word Search | `assets/games/wordsearch/` | 5 | `bg-wordsearch-herbarium-750x1334.jpg` |
| 62 | Loop Warden | `satellites/loop-warden/` | 4 | `loop-ring-540x540.png` |
| 63 | Flipbook | `satellites/flipbook/` | 4 | `bg-desk-540x960.jpg` |
| 64 | Pixel Garden | `assets/games/pixelgarden/` | 4 | `bg-pixelgarden-540x960.jpg` |
| 65 | Seed Reel | `satellites/seed-reel/` | 4 | `bg-seedreel-bed-540x960.jpg` |
| 66 | Bubblenaut | `satellites/bubblenaut/` | 3 | `assets/bg-moss-moon-750x1000.jpg` |
| 67 | Minesweeper | `assets/games/mines/` | 4 | `assets/games/minesweeper/hidden-tiles-4x-256x256.png` |
| 68 | Mosaic Draft | `satellites/mosaic-draft/` | 6 | `bg-workshop-540x960.jpg` |
| 69 | Wireworm | `satellites/wireworm/` | 6 | `assets/ww-substrate-1024.png` |
| 70 | Reversi | `assets/games/reversi/` | 5 | `bg-reversi-540x960.jpg` |
| 71 | Dew Trail | `assets/games/dewtrail/` | 5 | `assets/games/dewtrail/bg-pond-750x1334.jpg` |
| 72 | Go (Living Stones) | `assets/games/livingstones/` | 4 | `board-kaya-380x380.png` |
| 73 | Skitterlings (vendored) | `docs/art-lists/skitterlings/` | 3 | `menu-hero-750x420.jpg` |
| 74 | Vine Words | `assets/games/vinewords/` | 4 | `bg-vinewords-540x960.jpg` |
| 75 | Mini Crossword | `satellites/mini-crossword/` | 3 | `assets/games/mini-crossword/bg-desk-540x960.jpg` |
| 76 | Vinewinder | `satellites/vinewinder/` | 5 | `bg-garden-mist-750x1334.jpg` |
| 77 | Garden Path | `satellites/garden-path/` | 5 | `tile-flower-6x-96x96.png` |
| 78 | Fence Off | `satellites/fence-off/` | 5 | `bg-yard-540x960.jpg` |
| 79 | Word Lightning | `satellites/bloomzap/` | 3 | `satellites/bloomzap/assets/bg-storm-540x960.jpg` |
| 80 | Hexa Hive | `satellites/hexa-hive/` | 4 | `assets/hab-meadow-540x960.jpg, hab-desert, hab-rainforest, hab-jungle, hab-swamp, hab-mountains, hab-coast, hab-tundra, hab-orchard, hab-volcano` |
| 81 | No Pain, No Gain | `satellites/no-pain-no-gain/` | 4 | `bg-workshop-540x960.jpg` |
| 82 | Aura Farm | `satellites/aura-farm/` | 4 | `bg-menu-540x960.jpg` |
| 83 | Tomato Man (vendored) | `docs/art-lists/tomato-man/` | 5 | `art/ui/logo.png` |
| 84 | Root Weave | `satellites/root-weave/` | 6 | `how-icon-goal-64x64.png` |
| 85 | Root Flow | `assets/games/rootflow/` | 4 | `assets/games/rootflow/bg-loam-540x960.jpg` |
| 86 | Sproing | `satellites/sproing/` | 4 | `bg-menu-375x667.jpg` |
| 87 | Tarot Run (vendored) | `docs/art-lists/tarot-run/` | 5 | `art-slots/title-mark.png` |
| 88 | Glyph Forge (vendored) | `docs/art-lists/glyph-forge/` | 4 | `art-slots/enemy-cinder.png (+7 siblings, filenames already listed in ASSET_MANIFEST.json 'enemies')` |
| 89 | Dewball | `satellites/dewball/` | 4 | `assets/ground-w1.jpg` |
| 90 | Sweet Spot (vendored) | `docs/art-lists/sweet-spot/` | 5 | `bg-court-540x960.jpg` |
| 91 | Lamplighter | `satellites/lamplighter/` | 5 | `bg-lamplighter-town-540x340.png` |
| 92 | Orb Orchard | `satellites/orb-orchard/` | 6 | `horizon-dawn-540x260.png` |
| 93 | Nova Bloom | `satellites/nova-bloom/` | 3 | `bg_how.jpg` |
| 94 | Sprout Dice | `satellites/sprout-dice/` | 3 | `assets/bg_trellis.jpg` |
| 95 | Skyshot | `satellites/skyshot/` | 5 | `bg-nightgarden-375x667.jpg` |
| 96 | Budburst | `satellites/budburst/` | 4 | `satellites/budburst/assets/powers/bomb-200x74.png (plus rainbow, recolour, trueaim, uproot, bloomblast, timefreeze, bulwark, and one per booster)` |
| 97 | Conduit | `satellites/conduit/` | 5 | `conduit-floors.png` |
| 98 | Mouse Trap | `satellites/mouse-trap/` | 3 | `bg-garden-540x960.jpg` |
| 99 | Four in a Row | `assets/games/c4/` | 4 | `board-840x720.png` |
| 100 | Spider | `assets/games/spider/` | 3 | `bg-spider-felt-750x1200.jpg` |
| 101 | Pollen Panic | `satellites/pollen-panic/` | 4 | `bg-garden-loam-750x1334.jpg` |
| 102 | Dragon Philosophy | `satellites/dragon-philosophy/` | 4 | `satellites/dragon-philosophy/art/manifest.json` |
| 103 | Flock the World | `docs/art-lists/flock-the-world/` | 4 | `art/bg/bg_game.webp` |
| 104 | TriPeaks | `assets/games/tripeaks/` | 4 | `bg-tripeaks-table-750x1334.jpg` |
| 105 | Memory | `assets/games/memory/` | 4 | `bg-memory-540x960.jpg` |
| 106 | Klondike | `assets/games/klondike/` | 4 | `assets/decks/floral/card-back.png` |
| 107 | Parallel | `satellites/parallel/` | 5 | `tile-wall-92x92.png` |
| 108 | FreeCell | `assets/games/freecell/` | 4 | `bg-cardtable-750x1334.jpg` |
| 109 | Golf Solitaire | `assets/games/golf/` | 4 | `bg-cardtable-750x1334.jpg` |
| 110 | Lights Out | `assets/games/lights/` | 4 | `bg-lights-540x960.jpg` |
| 111 | Hedgerow | `satellites/hedgerow/` | 4 | `satellites/hedgerow/skins/s1/sprites/soil.jpg` |
| 112 | Vine Puzzle | `assets/games/pipe/` | 6 | `assets/games/pipe/vine-straight-b.png` |
| 113 | Blackout | `satellites/blackout/` | 4 | `bg-parlour-540x960.jpg` |
| 114 | Picnic Panic | `satellites/picnic-panic/` | 4 | `picnic-swarm-sheet-512x512.png` |
| 115 | Letter Launch (vendored) | `docs/art-lists/letter-launch/` | 5 | `satellites/letter-launch/docs/art/board-plate-480x420.png` |
| 116 | Snakes & Ladders | `satellites/snakes-ladders/` | 5 | `bg-table-540x960.jpg` |
| 117 | 2048 | `assets/games/merge/` | 3 | `tray-merge-480x480.png` |
| 118 | Yacht-Sea | `assets/games/yahtzee/` | 4 | `score-icons-13-832x64.png` |
| 119 | Stop at Ten | `assets/games/stopten/` | 3 | `bg-stopten-shed-750x1000.jpg` |
| 120 | Tower of Hanoi | `assets/games/hanoi/` | 4 | `hanoi-plank-660x120.png` |
| 121 | Backgammon | `assets/games/backgammon/` | 5 | `board-1024x838.png` |
| 122 | Super Slice | `satellites/slice-3d/` | 4 | `ff-strata-512x1024.jpg` |
| 123 | Word Trellis | `assets/games/trellis/` | 4 | `bg-trellis-540x960.jpg` |
| 124 | Seed Toss | `assets/games/seedtoss2/` | 4 | `bg-seedtoss-dusk-380x480.jpg` |
| 125 | Fox & Basket | `satellites/fox-basket/` | 5 | `bg-orchard-500x250.jpg` |
| 126 | Frost Watch | `satellites/frost-watch/` | 5 | `assets/meadow/frozen-136x520.jpg` |
| 127 | Bleeding Hearts | `assets/games/bleedinghearts/` | 4 | `trick-well-300x200.png` |
| 128 | Hues | `satellites/hues/` | 4 | `bg-hues-540x960.jpg` |
| 129 | Cribbage | `assets/games/cribbage/` | 4 | `cribbage-board-680x180.png` |
| 130 | Siege of One | `satellites/siege/` | 5 | `art/lane/sky-wall.png` |
| 131 | Shell Shuffle | `satellites/shell-shuffle/` | 4 | `bg-table-540x960.jpg` |
| 132 | Three Sisters | `assets/games/set/` | 3 | `bg-set-table-540x960.jpg` |
| 133 | Garden Rummy | `assets/games/juniper/` | 4 | `assets/games/juniper/felt-750x1334.jpg` |
| 134 | Nectar Drop | `satellites/nectar-drop/` | 3 | `satellites/nectar-drop/assets/ui/tut-basket-256x256.png` |
| 135 | Sled Vine | `satellites/sled-vine/` | 2 | `assets/ui/how_icons_88x88.png` |
| 136 | Stop the Light | `satellites/stop-the-light/` | 5 | `bg-firefly-ring-375x667.jpg` |
| 137 | Moon Claw | `satellites/moon-claw/` | 5 | `bg-arcade-540x960.jpg` |
| 138 | Code Breaker | `assets/games/mastermind/` | 4 | `assets/games/mastermind/new-game-btn-360x360.png` |
| 139 | Pong Arena | `satellites/pong/` | 4 | `arena-court-540x960.jpg` |
| 140 | Kakuro | `assets/games/kakuro/` | 3 | `bg-ledger-750x1334.jpg` |
| 141 | Master Pollinator | `assets/games/pollen/` | 4 | `bg-pollen-meadow-540x960.jpg` |
| 142 | Spore Drift | `satellites/spore-drift/` | 4 | `fg-kelp-fronds-540x300.png` |
| 143 | Doodle Pad | `satellites/doodle-pad/` | 3 | `paper-tooth-540x500.png` |
| 144 | The Attic | `satellites/attic/` | 4 | `bg-attic-900x1600.png` |
| 145 | Aura Off | `satellites/aura-off/` | 3 | `bg-square-dusk-540x960.jpg` |
| 146 | Times Table Quest | `satellites/multiplication-chart/` | 4 | `bg-slate-540x960.jpg` |
| 147 | 15 Puzzle | `assets/games/slider/` | 3 | `bg-slider-bench-750x800.jpg` |
| 148 | OriVex | `satellites/petalvex/` | 3 | `bed-plate-720x720.png` |
| 150 | Root Rush | `assets/games/rootrush/` | 4 | `bg-rootrush-soil-600x600.jpg` |
| 151 | Pyramid | `assets/games/pyramid/` | 3 | `bg-card-table-540x960.jpg` |
| 152 | Blooming Words | `satellites/blooming-words/` | 3 | `assets/bg-cyanotype-750x1334.jpg` |
| 153 | Bandit's Box | `satellites/bandits-box/` | 3 | `assets/bench-750x1000.jpg` |
| 154 | Farkle | `assets/games/farkle/` | 4 | `dice-faces-768x128.png` |
| 155 | Flood Fill | `assets/games/flood/` | 4 | `assets/games/flood/board-frame-780x780.png` |
| 156 | Five in a Row | `assets/games/vinecross/` | 4 | `board-wood-1040x1040.jpg` |
| 157 | Tally (vendored) | `docs/art-lists/tally/` | 4 | `bg-tally-attic-750x1334.jpg` |
| 158 | Garden Spades | `assets/games/gardenspades/` | 4 | `assets/games/gardenspades/felt-750x1334.jpg` |
| 159 | Flatulence Fighter | `satellites/flatulence-fighter/` | 4 | `bg-chapel-540x960.jpg` |
| 160 | Keepsies | `satellites/keepsies/` | 4 | `assets/env/ring-chalk-1024.png` |
| 161 | Music Studio | `assets/games/song/` | 4 | `tex-song-slate-256x256.png` |
| 162 | Dew Snip | `satellites/dew-snip/` | 4 | `assets/ui/btn_plate_primary.png` |
| 163 | Sokoban | `assets/games/sokoban/` | 4 | `wall-hedge-128x128.png` |
| 164 | Chess | `assets/games/chess/` | 3 | `p-king-green.png (and the other 11: p-{king,queen,rook,bishop,knight,pawn}-{green,gold}.png)` |
| 165 | Vine Runner | `satellites/vine-runner/` | 5 | `art/run-2.png` |
| 166 | Bramblewick | `satellites/bramblewick/` | 4 | `menu-vignette-540x960.png` |
| 167 | Ripcord | `satellites/ripcord/` | 4 | `bg-arena-surround-540x960.jpg` |
| 168 | Petal Plunge | `satellites/petal-plunge/` | 4 | `bg_meadow.jpg (repaint, 540x960)` |
| 169 | Cosmic Cadets | `satellites/seed-flutter/` | 4 | `fg-results-cliffline-540x260.png` |
| 170 | Burr Blast | `satellites/burr-blast/` | 4 | `story-frame-375x667.png` |
| 171 | Echo | `assets/games/simon/` | 4 | `bg-simon-750x1334.jpg` |
| 172 | Euchre | `assets/games/bowergarden/` | 4 | `assets/games/cards/table-baize-750x1334.jpg` |
| 173 | Acorn Drop | `satellites/tonic-drop/` | 5 | `assets/backgrounds/bg_title.jpg` |
| 174 | Seed Pot | `satellites/seed-pot/` | 3 | `assets/pot/pot_classic_front-560x300.png` |
| 175 | Inkbound | `satellites/grubtrap/` | 3 | `frame-bed-edge-96x96-9slice.png` |
| 176 | Petal Match | `assets/games/petalmatch/` | 3 | `pm-bg-fade-540x180.png` |
| 177 | Jade Garden | `satellites/mahjong/` | 3 | `assets/chrome/tray-mat-360x560.png` |
| 178 | Berry Vine | `satellites/berry-vine/` | 3 | `satellites/berry-vine/assets/bg/bg_title.jpg (repaint)` |
| 179 | Jumping Jimothy | `satellites/stream-hop/` | 3 | `assets/how/how_paper_540x960.jpg` |
| 180 | Blobworks | `satellites/greenhouse-pinball/` | 3 | `hud-score-plate-240x88.png` |
| 181 | Bridgevine | `satellites/bridgevine/` | 3 | `bg_deep_night_v2.jpg` |
| 182 | Petal Slice | `satellites/petal-slice/` | 4 | `fg-porch-autumn-540x180.png` |
| 183 | Puppy Dash | `satellites/puppy-dash/` | 3 | `art/ui/card-plate-160x180.png` |
| 184 | Pop N Lock | `satellites/chaff-wars/` | 2 | `assets/ui/lock-plate.png` |
| 185 | Sixfold (vendored) | `docs/art-lists/sixfold/` | 2 | `rank-seals-576x96.png` |

_183 games, 745 files._

Not listed: Whack Box and LOAF live outside this repo (`ext-` cards).

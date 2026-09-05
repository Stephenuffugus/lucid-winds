# MINESWEEPER art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/mines/` under the names below; say which landed and the code side wires them.

## Conventions, read once
- Sizes in the rows are written at 1x, the size the game shows them at. Deliver full bleed plates at
  900x1600 portrait (a row that says 540x960 means that file at 900x1600) and everything else at twice
  the size the row names. Never a side over 1600 px: the host's image optimizer resizes anything bigger
  on the way out, so a 1080x1920 plate would arrive at 900x1600 anyway, resampled by a stranger.
- PNG with alpha for anything that sits on the game (pieces, parts, tiles, frames, tokens); JPG or
  WebP for full bleed plates. Your master goes in the vault and the web copy is cut under a new
  name; nothing you send is ever overwritten or shrunk in place.
- Style anchors: the midnight greenhouse palette (deep blacks, sage #7ab356, gold #c8a84b, cream
  #e8dcc8) unless the row names its own, one light direction (upper left), no text baked into a
  plate unless the row asks for it, no real trademarks or mascots, generated art is never called
  hand painted.
- The "replaces" column says what is on screen today and what the file unlocks. Rows are in the
  order they change the most.

**Game:** `play-mines` · native · puzzle · audit impact 4/5 · effort M · audit rank 67

## Background wanted

bg-rootfloor-540x960.jpg - a dark forest floor under the grid: leaf litter and moss falling out of focus toward the edges, a warm lantern pool sitting exactly where the board lands, so the dug field has somewhere to be. Full-bleed.

## Files

| file | spec | replaces |
|---|---|---|
| `assets/games/minesweeper/hidden-tiles-4x-256x256.png` | 256x256 sheet holding four 128x128 tile variants (different moss, pebbles, root fragments), under 120KB total | Replaces one 444KB bitmap repeated 144 times; picking a variant by (r*7+c)%4 kills the wallpaper look at a stroke. |
| `assets/games/minesweeper/revealed-128.png, flag-128.png, mine-128.png` | three 128x128 PNGs, under 40KB each | The current revealed/flag/mine art is 516KB, 597KB and 516KB respectively for tiles that render at 26px - about 1.6MB of wasted download. |
| `assets/games/minesweeper/board-frame-1080x1080.png` | 1080x1080 transparent PNG, 9-slice with mitred corners | A carved wooden planting-bed frame behind .ng so the board ends at a made edge instead of a hard rectangular cut. |
| `assets/games/minesweeper/icon-flag-96x96.png and icon-newgame-96x96.png` | two 96x96 transparent PNGs in gold and sage | Replaces the scarlet flag emoji and the bright blue refresh emoji, the two most off-palette marks in the frame. |

_4 files._

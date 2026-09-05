# 2048 art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/merge/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-merge` · native · math · audit impact 4/5 · effort M · audit rank 117

## Background wanted

bg-merge-grove-540x960.jpg - a night greenhouse potting bench: out-of-focus glass panes and hanging leaves behind, a warm gold lantern glow falling from the top right, dropping to deep near-black across the bottom third so the tile tray reads as sitting on a real table under a lamp.

## Files

| file | spec | replaces |
|---|---|---|
| `tray-merge-480x480.png` | 480x480 transparent, painted dark slate-and-wood seed tray with 16 recessed square wells, a soft inner shadow inside each well, warm rim light along the top-left lip | Sits behind .tb#Rb2 and replaces the invisible .t0 cells, which currently differ from the page background by about 4 RGB points. Gives the board an edge and a ground. |
| `bg-merge-grove-540x960.jpg` | 540x960 full-bleed, night greenhouse bench, gold lamp glow top-right, near-black bottom | The game has no background of its own; the tray and the painted tiles currently sit on the same shared gradient as 65 other natives. |
| `arrow-pad-256x256.png` | 256x256 transparent 2x2 sheet, four painted brass-and-leaf directional keys (up, down, left, right), warm gold with sage inlay, big readable silhouettes | Replaces the emoji arrows in the four direction buttons at games/merge.js:88, which currently render in the system font and clash with everything else on screen. |

_3 files._

# SOKOBAN art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/sokoban/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-sokoban` · native · puzzle · audit impact 4/5 · effort S · audit rank 163

## Background wanted

A painted garden-bed ground under the whole grid plus a frame, so the board has an edge instead of dissolving into the page. Not a full-screen scene — the tiles carry the art; it needs a bed and a border.

## Files

| file | spec | replaces |
|---|---|---|
| `wall-hedge-128x128.png` | 128x128 transparent. Repaint the bramble at roughly 2.5x its current luminance (target mean RGB ~45-55, currently 17,19,15), with a sage-lit top edge and a warm rim on the left so it reads as a solid barrier, and edges that butt cleanly against a neighbouring hedge tile. | Replaces assets/games/sokoban/wall.png, which is darker than the page ground and makes the whole board look empty. |
| `floor-path-128x128.png` | 128x128 seamless tiling, opaque, no transparent margin. Damp soil with pressed flagstone fragments; the pattern must continue across a tile seam so a run of floor cells reads as one path. | Replaces floor.png, currently one isolated pale stone with transparent edges, so ground cells never join up. |
| `board-frame-540x540.png` | 540x540, 9-slice-friendly: a painted raised soil/timber garden-bed border ~28px thick, transparent centre, a few trailing leaves overlapping the top-left and bottom-right corners. | Gives the grid an edge; right now the board ends in a hard cut to black on all four sides. |
| `sokoban tiles re-exported at 128x128 (player, crate, planted, target, wall, floor, player-on-target)` | Seven 128x128 PNGs, transparent where the README asks, as assets/games/sokoban/README.txt already specifies. | wall.png is 1785px/2.8MB and the folder is 9.8MB for tiles that render at 40-80px on a phone. The art is good; the delivery is ~100x oversized. |

_4 files._

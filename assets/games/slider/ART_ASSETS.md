# 15 PUZZLE art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/slider/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-slider` · native · puzzle · audit impact 3/5 · effort S · audit rank 147

## Background wanted

A painted greenhouse-bench surface behind the board so the tray sits ON something instead of floating on the fleet-wide radial gradient: worn dark wood or slate with a warm lamp falloff from top-left.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-slider-bench-750x800.jpg` | 750x800 (2x for a 375x400 slot), painted dark potting-bench wood with visible grain, warm rim light from the top-left, corners falling to near-black | Gives .Dboard something to sit on; today the board floats on the same radial gradient as 65 other games |
| `tile-face-160x160.png` | 160x160 transparent, one painted leaf-green ceramic tile face: soft bevel, warm highlight along the top edge, faint glaze mottling, transparent outside the rounded square | Replaces the .Dtile linear-gradient so the tiles read as objects; CSS tints it gold for the .home state instead of swapping a second gradient |
| `tile-socket-160x160.png` | 160x160 transparent, an empty recessed socket: inner shadow, a darker floor, a little moss or grit in two corners | Makes the blank square read as a slot rather than a hole in the render |

_3 files._

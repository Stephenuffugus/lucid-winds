# ECHO art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/simon/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-simon` · native · pattern · audit impact 3/5 · effort S · audit rank 171

## Background wanted

A dark greenhouse bench or stone sill running behind and under the 2x2 grid, warm gold rim light raking from the left, so the four carved panels read as objects laid on a surface rather than four stickers on black. Also a carved frame around the grid to bind them into one instrument.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-simon-750x1334.jpg` | 750x1334 full-bleed, dark greenhouse interior, a stone or worn-wood bench surface across the middle third, warm gold rim from the left, deep falloff top and bottom so the tiles stay the brightest thing | the painted tiles currently sit on the same empty shell gradient as an art-free game; a ground is the single thing separating this from Chess |
| `frame-simon-tiles-780x780.png` | 780x780 transparent PNG, a carved wood and tarnished-brass 2x2 frame with four square cut-outs and a centre cross member, worn edges, soft warm rim on the top lip | binds the four panels into one instrument instead of four separate floating cards, and gives the grid a silhouette |
| `spring/summer/autumn/winter-tile.webp` | 512x512 webp at quality 80, target under 80KB each, re-exported from the existing PNGs | the four tiles are currently 1.0-1.2MB PNGs each (8.5MB total in assets/games/simon/, and each file is duplicated as both -btn.png and -tile.png) to fill a roughly 165px box on a phone |
| `plate-simon-label-160x40.png` | 160x40 transparent PNG, a small dark brass nameplate with a soft inner shadow, one per tile | gives the season label a readable ground so it can be raised to 0.75rem without fighting the flower art behind it |

_4 files._

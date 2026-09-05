# SEA BATTLE art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/battleship/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-battleship` · native · board · audit impact 5/5 · effort M · audit rank 22

## Background wanted

A full-bleed painted night-sea chart behind the grid: deep teal-black water with a warm lamp falloff from the top-left, faint parchment rules and chart marginalia bleeding under the board edges, a scatter of hand-drawn depth soundings in the dead water columns. It is the biggest single lift available - right now half the frame is unpainted void.

## Files

| file | spec | replaces |
|---|---|---|
| `assets/games/battleship/bg-sea-540x960.jpg` | 540x960 full-bleed. Night sea seen from above: deep teal-black water, warm lamp glow top-left falling off to near-black bottom-right, faint cream chart rules and depth soundings, a soft compass rose ghosted at 8% in one corner. | Replaces the shared shell radial gradient. Fills the empty C-G columns and the dead space above and below the two boards with something composed. |
| `assets/games/battleship/ship-hulls-320x64.png` | 320x64 transparent sprite sheet, five hulls at cell pitch 32px: lengths 2,3,3,4,5. Olive-sage decks, dark keel line, warm gold rim light along the top edge, a soft drop shadow baked in. | Replaces .th-cell.placed. One image per ship instead of one rounded square per cell, so a 5-ship finally reads as a 5-ship. |
| `assets/games/battleship/hit-splash-96x96.png` | 96x96 transparent PNG. Amber ember burst with a curl of dark smoke and scattered splinters, warm rim light, painterly not vector. | Replaces the 💥 OS emoji at line 459 - the only piece of hit feedback in the game and currently the loudest style break on screen. |
| `assets/games/battleship/miss-ripple-96x96.png` | 96x96 transparent PNG. A pale sage water ring with a soft second ring and a faint foam speckle, 40% opacity core. | Replaces the bare middle-dot '·' used for misses, which currently looks like a rendering artefact rather than a shot. |
| `assets/games/battleship/icons-radar-tide-128x64.png` | 128x64 transparent, two 64x64 cells: a brass radar dish with a sweep arc, and a curling wave with gold foam. | Replaces 📡 and 🌊 in the RADAR / TIDE STRIKE buttons so the two special abilities stop being OS emoji. |

_5 files._

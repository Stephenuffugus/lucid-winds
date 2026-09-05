# BACKGAMMON art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/backgammon/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-backgammon` · native · board · audit impact 4/5 · effort M · audit rank 121

## Background wanted

assets/games/backgammon/board-1024x838.png laid onto .bg-board: a painted walnut playing field with visible grain, inlaid points and a brass-capped centre bar. Behind it the shared page gradient should gain a soft vignette so the board's frame is a transition and not a cut into flat black.

## Files

| file | spec | replaces |
|---|---|---|
| `board-1024x838.png` | 1024x838 (11:9), full-bleed opaque. Painted walnut playing field: visible grain running vertically, 24 inlaid points alternating warm cream-sage and deep rose-brown, a brass-capped centre bar, warm rim light from the upper left, subtle inner shadow under the frame lip. | Replaces .bg-board's #2C1810 fill plus the 24 clip-path triangles (shared.css:2532, 2556-2560). Gives the board depth and, critically, separates the two point colours that currently sit at the same luminance. |
| `checker-sage-96.png` | 96x96 transparent PNG. A carved wooden disc in sage-green stain, one pressed shamrock in the face, top-left specular rim light, soft contact shadow baked into the lower edge. | Replaces .checker.human's radial-gradient plus the U+2618 text glyph in ::after (shared.css:2568, 2570). Right now the player's whole piece is a CSS circle with a font character on it. |
| `checker-rose-96.png` | 96x96 transparent PNG. The same carved disc in a dusty rose stain with a pressed four-point star, matched lighting to checker-sage-96 so the pair reads as one carved set. | Replaces .checker.ai's radial-gradient plus the U+2726 glyph (shared.css:2569, 2571). |
| `bg-frame-corner-128.png` | 128x128 transparent PNG, vine-and-leaf corner ornament carved in the same wood and at the same relief as new-game-btn.png. One per board corner, mirrored. | Ties the board to the one painted asset already on screen. Today the plaque button and the board look like they came from two different games. |
| `die-faces-384x64.png` | 384x64 sprite strip, six 64x64 cells, faces 1 through 6. Painted bone dice with warm amber pips, a soft top highlight and a cast shadow. | Replaces .bg-die's linear-gradient(145deg,#FAF5E8,#E8DCC8) box (shared.css:2585) and the die emoji sitting on the ROLL button. |

_5 files._

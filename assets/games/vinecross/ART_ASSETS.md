# FIVE IN A ROW art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/vinecross/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-vinecross` · native · board · audit impact 3/5 · effort M · audit rank 156

## Background wanted

Keep the board painted rather than gradient-built, and put a table under it. The board is already the right idea; it needs a real surface and a ground plane so it is not a floating rectangle.

## Files

| file | spec | replaces |
|---|---|---|
| `board-wood-1040x1040.jpg` | 1040x1040 (2x the 520px max canvas), full-bleed. Painted walnut goban face: real grain running one direction, two or three subtle knots off-centre, a soft bowl of warm lamp light at the middle, corners falling to shadow. | Replaces the diagonal linear-gradient at games/vinecross.js:107-109. Turns brown vinyl into wood, and is the single highest-return asset for this game. |
| `stone-sage-128x128.png` | 128x128 transparent. Painted jade-green seed stone, warm rim light from top-left, faint internal translucency, a soft contact shadow baked into the bottom edge. | Replaces the canvas radial-gradient player stone. Drawn at 2x so it stays crisp at the 13x13 and 9x9 cell sizes. |
| `stone-rose-128x128.png` | 128x128 transparent. Painted rose-quartz stone, same light direction, but a DELIBERATELY different silhouette - slightly flattened top and a small nick in the rim - so the two sides read apart with colour removed. | Fixes the shared-silhouette fault: today only hue tells your stones from the computer's. |
| `table-vignette-750x400.png` | 750x400 transparent PNG. A dark tabletop plane - deep sage-black timber with warm gold rim light along the top edge and a soft falloff outward, sized to sit under and slightly wider than the board. | Gives the board a ground to sit on and fills the empty horizon above it, so the frame is a scene instead of a rectangle in void. |

_4 files._

# FOUR IN A ROW art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/c4/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-c4` · native · board · audit impact 4/5 · effort M · audit rank 99

## Background wanted

Wire the existing assets/games/c4/board.png as the grid background and repaint it at 2x as assets/games/c4/board-840x720.png: walnut with visible grain, drilled holes with a bright top lip, a bevelled outer frame and a warm rim light, plus a soft outer glow so the board sits on the page instead of against it.

## Files

| file | spec | replaces |
|---|---|---|
| `board-840x720.png` | 840x720 opaque (2x the existing 420x360 board.png). Painted walnut board: visible vertical grain, 42 drilled holes each with an inner shadow and a bright top-lip highlight, a bevelled frame edge, warm light from the upper left. | Replaces the flat CSS gradient at c4.js:102 and supersedes the unused 1x board.png, which is too low-res for a 2x or 3x phone. The board is currently the only unpainted surface in a game whose pieces are painted. |
| `rose-128.png, iris-128.png, lily-128.png` | 128x128 transparent PNG each, matching zinnia.png's painting style, lighting angle and petal density. Player-side blooms. | Replaces .c4-rose, .c4-iris and .c4-lily radial gradients plus the U+273F glyph stamped on them (c4.js:30, 32, 34, 47), so all four themes are painted rather than only ZINNIA. |
| `sunflower-128.png, tulip-128.png, dahlia-128.png` | 128x128 transparent PNG each. AI-side blooms, deliberately given a DIFFERENT flower form from the player set — flat-faced ray petals or a spiked star bloom, not another pom-pom — so the two sides differ in silhouette and not only in hue. Repaint calendula.png to the same rule. | Replaces .c4-sun, .c4-tulip and .c4-dahlia plus the U+25C6 glyph (c4.js:31, 33, 35, 48), and fixes the shared-silhouette problem visible in play-c4-2play.png where green and pink discs are the same shape. |
| `piece-shadow-128.png` | 128x128 transparent PNG, a soft elliptical contact shadow with a warm dark core, sized to sit just under a seated 128px bloom. | Drawn under each placed piece so the discs sit down in the drilled holes; today they float flat on the board with no contact. |

_4 files._

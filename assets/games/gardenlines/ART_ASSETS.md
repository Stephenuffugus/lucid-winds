# GARDEN LINES art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/gardenlines/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-gardenlines` · native · puzzle · audit impact 4/5 · effort M · audit rank 38

## Background wanted

bg-gardenlines-540x960.jpg - a dark potting-shed tabletop seen from above: weathered boards running diagonally, a soft gold lamp pool behind the board area, heavy vignette at the edges, so the grid sits on a surface instead of in empty space.

## Files

| file | spec | replaces |
|---|---|---|
| `gl-tile-faces-576x96.png` | 576x96 PNG, transparent, six 96x96 painted botanical tokens: fern frond, toadstool, seedling, sun, dew drop, blossom - house palette, warm rim light, big readable silhouettes | Replaces the six emoji at games/gardenlines.js:11, which ARE the game's art and which render in five mismatched styles. |
| `gl-tile-plate-96x96.png` | 96x96 PNG, transparent, 9-slice-safe ceramic tile plate with a bevelled edge, top rim light and a dark underside, designed to sit over a colour tint | Replaces the flat CSS colour square in .GLtile so each piece has an edge and a body instead of being a colour swatch. |
| `gl-cell-empty-96x96.png` | 96x96 PNG, transparent, a shallow pressed socket in wood with a soft inner shadow | Replaces the near-invisible dashed .GLempty.inbounds outline so the empty board reads as a set of sockets waiting for tiles. |
| `gl-seed-bag-64x64.png` | 64x64 PNG, transparent, a small linen drawstring seed bag, warm gold rim light | Gives the 'Bag 96' counter an icon; it is currently bare monospace text at 0.7rem. |

_4 files._

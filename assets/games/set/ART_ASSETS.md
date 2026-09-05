# THREE SISTERS art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/set/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-set` · native · pattern · audit impact 4/5 · effort M · audit rank 132

## Background wanted

A painted table: dark oiled-wood bench top with a worn linen runner under the grid, warm gold rim light from the top-right, vignetting to near-black at the frame edges. It replaces the grey slab AND gives the bare radial gradient something to be.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-set-table-540x960.jpg` | 540x960 full-bleed, no transparency. Midnight greenhouse table: dark oiled wood, a worn cream-green linen runner across the middle third where the grid sits, warm gold rim light from top-right, heavy vignette to #0d100c at all four edges. | Replaces the flat #b6bcb2 slab and the empty radial gradient; gives the cards a surface to sit on instead of a grey rectangle cut out of black. |
| `card-face-set-256x358.png` | 256x358 (2.5:3.5), transparent corners. Aged cream-green card stock, subtle paper grain, a 4px sage inner rule inset 8px, soft warm drop shadow baked into the lower edge. | Replaces the flat #232d1f .grove-card fill so twelve cards read as objects on a table rather than CSS rectangles. |
| `card-glow-selected-256x358.png` | 256x358, transparent, additive. A warm gold bloom hugging the card border, brightest at the corners, falling off to nothing 20px in. | Replaces the plain gold border + box-shadow on .grove-card.selected so a picked card lifts instead of just changing outline colour. |

_3 files._

# TRIPEAKS art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/tripeaks/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-tripeaks` · native · card · audit impact 4/5 · effort S · audit rank 104

## Background wanted

A card-table plate: dark moss felt with a warm gold rim light raking in from the top right, a soft vignette, and a faint ring of shadow under where the three peaks sit. The painted deck is the best card art in the fleet and it is currently floating on a flat gradient.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-tripeaks-table-750x1334.jpg` | 750x1334 full-bleed, near-black moss felt with visible weave, warm gold rim light from top-right, heavy vignette at the corners, no baked-in UI | Replaces the shared one-gradient ground; gives the painted cards a surface so the empty bottom half becomes table instead of void. |
| `tripeaks-peak-shadow-256x96.png` | 256x96 transparent PNG, soft elliptical drop shadow, ~35% black at centre falling to zero | Drawn under each of the three peaks so the pyramid sits on the table; today the cards have no contact shadow and hover in space. |
| `tripeaks-slot-empty-96x134.png` | 96x134 transparent PNG, faint sage outline of a card with a small corner knot, ~18% opacity | Marks a cleared card position so the pyramid keeps its silhouette as it empties; right now cleared cards leave holes in the shape. |
| `icon-deck-style-64x64.png` | 64x64 transparent PNG, two fanned painted cards in sage and gold | Replaces the 🃏 emoji on the Style button (games/tripeaks.js:19), the only emoji standing in for art in the game's own chrome. |

_4 files._

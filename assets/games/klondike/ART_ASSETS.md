# KLONDIKE art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/klondike/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-klondike` · native · card · audit impact 4/5 · effort M · audit rank 106

## Background wanted

bg-cardtable-540x960.jpg - a dark greenhouse table from above: worn deep-green felt or moss cloth, warm gold rim light entering from the upper left, soft vignette into the four corners so the cards read as objects lying on a surface. Full-bleed, no baked frame or UI.

## Files

| file | spec | replaces |
|---|---|---|
| `assets/decks/floral/card-back.png` | 240x336 (renders ~48x66 at 1x), full-bleed opaque, no transparency | The floral deck ships faces and pips but no back, so it borrows the LW botanical green damask. A red-and-black botanical lattice on cream drawn by the same hand as queen-red.png would make face and back one deck. |
| `assets/games/cards/foundation-slot-240x336.png` | 240x336 transparent PNG, one file with a faint suit sigil per corner variant or four files | Replaces the 1px dashed outline plus grey suit glyph that currently marks each empty foundation - a carved sage stone recess with a gold embossed sigil. |
| `assets/games/cards/stock-count-plate-96x96.png` | 96x96 transparent PNG, dark plate with a thin gold rim | The remaining-stock 24 is printed straight onto the damask back and is barely readable; it needs a plate behind it. |
| `bg-cardtable-540x960.jpg` | 540x960 full-bleed JPG, deep green felt, gold rim light upper left, corner vignette | The table is currently the shared radial gradient shared with 66 other games; a real surface is what separates this from Chess. |

_4 files._

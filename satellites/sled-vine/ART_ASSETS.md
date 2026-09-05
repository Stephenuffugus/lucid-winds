# SLED VINE art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/sled-vine/` under the names below; say which landed and the code side wires them.

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

**Game:** `sled-vine` · satellite · action · audit impact 3/5 · effort S · audit rank 135

## Background wanted

None needed — bg_grove.jpg is real painted art and it reads. What it needs is placement: ease the scrim's top stop from e0 (.88) to about cc (.80) and the mid from b0 to 88 so the whole frame is one continuous grove instead of a black slab pasted on a flower bed.

## Files

| file | spec | replaces |
|---|---|---|
| `assets/ui/how_icons_88x88.png` | 616x88 transparent PNG, seven 88x88 cells: goal flower, ink pen, bloom-gate ring, sprouting leaf pair, thorn cluster, eraser, calendar. Painted sage and gold on transparent, warm rim light, readable at 34px. | Replaces the seven emoji bullets and kills the bare white ring that currently reads as a broken image. |
| `assets/backgrounds/bg_grove_canopy_540x300.png` | 540x300 transparent PNG, a soft canopy of vine and hanging seed pods along the top edge, fading to fully transparent by 60% height. | Gives the top of the How screen something behind the copy so the frame stops being black-over-art with a hard seam in the middle. |

_2 files._

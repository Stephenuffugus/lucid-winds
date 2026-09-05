# PUPPY DASH art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/puppy-dash/` under the names below; say which landed and the code side wires them.

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

**Game:** `puppy-dash` · satellite · action · audit impact 2/5 · effort S · audit rank 183

## Background wanted

None needed. The environment is already painted and reads correctly. The work here is the menu-over-art treatment and the top-band crowding, not a new background.

## Files

| file | spec | replaces |
|---|---|---|
| `art/ui/card-plate-160x180.png` | 160x180 transparent PNG, painted cream-and-tan card plate with a soft brushed edge, subtle inner warmth, top-left light | Replaces the flat CSS cream slab on .pick so the runner cards sit in the painted world instead of on top of it. |
| `art/ui/wordmark-compact-330x110.webp` | 330x110, the PUPPY DASH lockup stacked to two short lines or set at a lower cap height, transparent | The current wordmark overflows a 667px viewport so half the game's name is never seen on a phone. |
| `art/ui/chip-plate-140x48.png` | 140x48 transparent PNG, a small painted wooden/tan pill with a soft drop shadow | Gives the injected Music and New song chips somewhere to land so they stop floating on sky and on the CTA. |

_3 files._

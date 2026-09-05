# LIGHTS OUT art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/lights/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-lights` · native · puzzle · audit impact 4/5 · effort M · audit rank 110

## Background wanted

A full-bleed 540x960 forest-floor backdrop behind the whole page so the board sits in a place instead of on a void, plus a painted frame or vignette so the grid.png crop stops ending on a straight line.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-lights-540x960.jpg` | 540x960 full-bleed, deep night forest floor receding into darkness, warm gold firefly motes in the top third, moss and leaf litter at the bottom | Replaces the shared flat radial gradient so the board sits in a scene rather than on empty black. |
| `frame-lights-420x420.png` | 420x420 transparent, 9-slice mossy stone-and-root border with rounded corners, ~28px inset | Closes the hard photo crop of grid.png, which currently ends on a 1px line with ferns sliced mid-leaf. |
| `shroom-off-160.png` | 160x160 transparent, unlit cap with a cream rim light and a faint gold underglow at the base | Replaces shroom-off.png, which is so close in value to the stone socket that dormant cells read as empty holes. |
| `shroom-on-a/b/c-160.png` | three 160x160 transparent variants, cap tilt and gill count varied, same mint-into-gold glow | Replaces the single shroom-on.png so a lit row is not one sprite stamped five times. |

_4 files._

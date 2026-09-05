# ROOTBOUND art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/rootbound/` under the names below; say which landed and the code side wires them.

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

**Game:** `rootbound` · satellite · puzzle · audit impact 5/5 · effort L · audit rank 7

## Background wanted

A painted midnight garden bed. The premise is sliding planters aside to free a golden bloom out of a garden gate, and the screen currently shows none of that. Looking down into dark loam with sage leaf edges creeping in at the corners and a warm gold glow at the centre would give the puzzle a place to happen.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-rootbound-540x960.jpg` | 540x960, full-bleed. Painted midnight garden bed seen from above: dark warm loam texture, sage paper-cut leaf edges creeping in from all four corners, a soft gold pool of light at the centre, heavy vignette at the frame edge. | Replaces the flat #0b0f0b page. Drops into a new satellites/rootbound/assets/ folder, which does not exist yet, so this is also the game's first art hook. |
| `planter-tile-128x128.png` | 128x128, transparent, 9-sliceable (32px corners). Painted terracotta and weathered wood planter block with warm gold rim light on the top-left edge and a soft cast shadow on the bottom-right. | The sliding pieces are currently flat gradient rectangles in #12180e and gold. A lit, shadowed planter makes the pieces read as objects with weight, which is the whole point of a sliding-block puzzle. |
| `bloom-goal-96x96.png` | 96x96, transparent, with the glow baked in. The golden bloom the player is freeing: warm gold petals, cream centre, a soft halo. | The target piece is presently a gold gradient rectangle identical in shape to every other piece except its colour. A painted bloom makes the goal obvious at a glance. |
| `gate-96x160.png` | 96x160, transparent. A painted garden gate in weathered sage-painted wood, standing open, with a warm glow spilling through the opening. | Marks the exit edge of the board. Right now the exit is an unmarked gap in the frame. |
| `bed-thumbs-320x64.png` | 320x64, five 64x64 frames, transparent. One tiny painted vignette per section: a seedbed tray, a row of sprouts, a bud, a full bloom, a tangle of wild roots. | Gives the forty-tile level select five distinct visual anchors so the sections stop being one undifferentiated wall of padlocks. |

_5 files._

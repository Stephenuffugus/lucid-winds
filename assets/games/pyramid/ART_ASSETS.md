# PYRAMID art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/pyramid/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-pyramid` · native · card · audit impact 3/5 · effort M · audit rank 151

## Background wanted

bg-card-table-540x960.jpg - dark green felt with visible weave, a warm pooled lamp light falling from top-centre onto the pyramid apex, felt darkening to near-black at the corners, a hint of worn wood at the very bottom edge behind the button row.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-card-table-540x960.jpg` | 540x960 full-bleed, dark green felt weave, warm pooled lamplight top-centre, near-black vignette corners, wood edge along the bottom 8% | replaces the shared shell gradient; gives the white cards a surface so they stop reading as cut-outs floating in a void |
| `pyramid-frame-540x420.png` | 540x420 transparent, thin vine-and-Celtic-knot corner frame sized to the pyramid area, gold #c8a84b at 40% with a sage inner line, corners only (no full box) | matches the Celtic frame that makes Chess read as strong; the pyramid currently has no compositional container at all |
| `waste-slot-plate-96x132.png` | 96x132 transparent, a soft inset shadow well with a faint embossed suit watermark at 12% opacity | replaces the dashed placeholder rectangle next to the stock pile |

_3 files._

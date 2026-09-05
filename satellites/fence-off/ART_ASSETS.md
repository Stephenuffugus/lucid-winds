# FENCE OFF art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/fence-off/` under the names below; say which landed and the code side wires them.

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

**Game:** `fence-off` · satellite · board · audit impact 4/5 · effort M · audit rank 78

## Background wanted

assets/bg-yard-540x960.jpg — a dusk garden yard seen from above at a slight angle: dark loam and clipped turf, a soft warm lantern glow from the top edge, deeper shadow at the bottom corners, painted so the 9x9 grid of cells reads as garden plots rather than table cells. Draw it as a canvas Image beneath the cell fills so the cell rounded rects become translucent turf tiles.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-yard-540x960.jpg` | 540x960 full-bleed, dusk garden yard from above, dark loam and turf, warm lantern glow at the top edge, corner vignette | replaces the canvas linear gradient so the board sits in a place instead of on a colour |
| `tile-turf-56x56.png` | 56x56 seamless, two variants (light/dark) of clipped turf with faint mowing direction, transparent PNG to multiply over the yard | gives the 81 identical flat rounded rects a visible, painted checker instead of an alternation you cannot see at 375px |
| `fence-post-h-120x28.png and fence-post-v-28x120.png` | 120x28 and 28x120 transparent, a painted two-rail wooden fence with warm rim light on the top rail and a soft shadow under it | replaces drawFenceBar's flat filled bar — the fences are the title mechanic and they are currently rectangles |
| `pawn-you-72x72.png and pawn-rival-72x72.png` | two 72x72 transparent pieces in ONE silhouette family — same rounded body, same base, one warm gold and one cool indigo, soft top light | replaces the gold dotted ring and the blue triangle-in-a-square, which currently read as two unrelated symbols rather than two racers |
| `gate-open-120x28.png` | 120x28 transparent, the fence art with its middle rail swung open, warm gold highlight on the hinge | the vault mechanic turns a fence into a gate and there is no art for that state at all |

_5 files._

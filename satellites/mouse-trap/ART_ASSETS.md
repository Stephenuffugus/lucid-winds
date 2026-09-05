# MOUSE TRAP art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/mouse-trap/` under the names below; say which landed and the code side wires them.

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

**Game:** `mouse-trap` · satellite · puzzle · audit impact 4/5 · effort M · audit rank 98

## Background wanted

A painted 540x960 night veg patch: soil rows in perspective at the bottom, a low woven fence and bean poles at the sides, one warm lantern glow at the top-left, and the middle band held dark and quiet so the hex board reads on top. Plus a soft radial pool of light under the board so the board's rectangle does not simply stop against black.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-garden-540x960.jpg` | 540x960 full-bleed JPG, night vegetable patch: soil rows and a low woven fence, warm gold lantern falloff from the upper-left, sage and copper foliage in the outer 15%, central 480x420 band held under 10% luminance | replaces the solid #0b0f0b stage fill and fills the dead lower third of the frame |
| `hex-soil-96x96.png / hex-hedge-96x96.png / hex-edge-96x96.png` | three 96x96 transparent PNG hex tiles - turned earth with pebbles, a clipped box hedge with warm rim light, and a gold-lit garden-edge tile with the soil falling away past it; each drawn to the same hex outline so they tessellate | replaces drawHedge()'s gradient-fill-plus-five-circles (line 449) and the two flat hex fills, so the board becomes painted ground instead of three colour swatches |
| `mouse-96x96-4frames.png` | one 384x96 transparent strip, four 96x96 frames: idle sniffing, mid-run with ears back, trapped with wide eyes, escaping with a happy squint - painted grey-brown with pink ears and nose, warm rim light | replaces the ellipse-and-arc vector mouse in drawMouse() (line 459) whose three states are already coded, so the art can drop straight into the existing phase switch |

_3 files._

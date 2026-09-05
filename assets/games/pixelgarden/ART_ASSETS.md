# PIXEL GARDEN art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/pixelgarden/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-pixelgarden` · native · creative · audit impact 4/5 · effort M · audit rank 64

## Background wanted

bg-pixelgarden-540x960.jpg - a painted dark wooden potting-bench top seen from above, with the warm lamp pool placed at 70% -10% so it lands where the existing shell gradient hotspot already is, a folded rag and a jar of brushes along the bottom edge. Local contrast kept under about 18% so pixel art still reads on top of it.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-pixelgarden-540x960.jpg` | 540x960, full-bleed JPG. Painted dark wooden bench top, warm lamp pool top-right, a rag and a jar of brushes along the bottom edge, deep near-black values, local contrast under 18%. | Replaces the shared radial gradient that 66 natives already use. Gives the drawing tool a room to sit in instead of a void, and fills the empty black either side of the palette. |
| `canvas-mat-360x360.png` | 360x360, transparent PNG. A painted paper or linen mat with a soft rim-lit bevel and a cast shadow, sized to sit under the 336px canvas with a 12px reveal. | Replaces the invisible 1px rgba(122,179,86,0.2) border on games/pixelgarden.js:52. Gives the drawing surface a physical edge so the empty canvas stops reading as a hole in the page. |
| `palette-tray-336x224.png` | 336x224, transparent PNG. A painted wooden or chipped-enamel paint tray with 24 recessed wells on a 6x4 grid, each well 48x48 with an inner shadow, warm rim light from top-right. | Replaces the flat 6x4 colour slab. Puts the swatches into wells so the palette stops out-shouting the artwork it is meant to serve. |
| `tool-icons-288x96.png` | 288x96, transparent PNG, six 48x48 cells: brush, eraser, fill bucket, dropper, mirror butterfly, grid. Cream line art with a sage active state baked as a second 288x96 row. | Replaces the all-caps word buttons DRAW/ERASE/FILL/PICK/MIRROR/GRID. Collapses two ragged wrapped rows into one clean icon row and buys back roughly 55px of the vertical overflow that is clipping the canvas. |

_4 files._

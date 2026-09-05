# SPROING art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/sproing/` under the names below; say which landed and the code side wires them.

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

**Game:** `sproing` · satellite · action · audit impact 3/5 · effort S · audit rank 86

## Background wanted

bg-menu-375x667.jpg for the title and shell screens: reuse the look of the existing assets/bg/bg_garden_bed.jpg (warm night garden bed, dew-lit leaves, soft depth) darkened and blurred at the bottom so the button stack still reads over it. This is the cheapest win in the batch because the painted asset already exists and only needs a menu-safe variant plus a CSS background-image on .screen.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-menu-375x667.jpg` | 375x667 at 1x, export 1125x2001 at 3x, full-bleed. A darkened, softly blurred crop of the existing assets/bg/bg_garden_bed.jpg with a warm rim of dew light at the top and a deep near-black wash across the bottom 45% so the PLAY slab and chips stay legible. | The title screen currently paints flat #000 (index.html:38) while six painted backgrounds sit unused in assets/bg/. |
| `sproing-tools-sheet-192.png` | One sheet, eight cells at 192x192, transparent PNG. Brush small, brush large, brush dot, eraser, fill bucket, eyedropper, undo arrow, trash. All painted in the same warm-cream-on-sage house palette with a single light source from upper left. | Replaces the six mismatched system emoji standing in for the drawing tools, the only iconography on the Draw Your Climber screen. |
| `sketchbook-frame-343x260.png` | 343x260 at 1x, export 1029x780 at 3x, transparent PNG with a 16px 9-slice border. A pinned sketchbook page: torn top edge, faint paper tooth, a soft cast shadow on all four sides, corner tape. | Frames the raw cream paint rectangle so it reads as a sketchbook page rather than an empty form field with a hard 1px edge. |
| `sproing-mascot-320.png` | 320x320 transparent PNG. The avocado climber painted properly: warm rim light on the upper left, soft ambient occlusion where the pit meets the flesh, a hint of a sproing spring under it. | The current mascot is a flat two-tone shape in a plain green ring and it is the only character art on the title screen. |

_4 files._

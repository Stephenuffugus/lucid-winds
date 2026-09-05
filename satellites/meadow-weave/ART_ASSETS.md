# MEADOW WEAVE art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/meadow-weave/` under the names below; say which landed and the code side wires them.

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

**Game:** `meadow-weave` · satellite · puzzle · audit impact 4/5 · effort M · audit rank 33

## Background wanted

bg-weave-540x960.jpg - a painted midnight meadow seen from above: dark loam and moss, a pond glint low-left, hedgerow silhouettes at the edges, and a pool of warm lantern light falling on the centre so the hex flower sits inside a place instead of on black.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-weave-540x960.jpg` | 540x960 full-bleed painted midnight meadow, deep loam and moss, pond glint low-left, hedgerow silhouettes at the frame edges, warm gold light pooling at centre | replaces the flat canvas gradient at index.html:472 so the board is not floating in void |
| `hex-biome-faces-640x128.png` | sheet of 5 painted hex faces, 128x128 each, transparent: meadow grass tuft, pond ripple, forest canopy, wheat field, orchard blossom - each with a warm rim on the top-left edge | replaces the flat BIOMES colours and the ASCII sym glyphs so terrain looks like terrain |
| `hex-slot-ghost-128x128.png` | 128x128 transparent, a soft dashed gold hex outline with a faint inner glow | replaces the setLineDash([4,4]) 1.2px outline at line 476 that currently reads as a CSS border |
| `tray-shelf-540x150.png` | 540x150 transparent PNG, painted dark wood shelf with a warm gold lip along the top edge and a soft drop shadow above it | replaces the hard rgba(12,18,12,0.9) fillRect tray so the UI meets the board through a transition |

_4 files._

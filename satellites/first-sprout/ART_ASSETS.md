# FIRST SPROUT art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/first-sprout/` under the names below; say which landed and the code side wires them.

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

**Game:** `first-sprout` · satellite · creative · audit impact 5/5 · effort M · audit rank 9

## Background wanted

assets/bg-grove-night-750x1334.jpg - a painted midnight-greenhouse sky: deep near-black blue, a warm gold moon with a soft halo, a low hedge silhouette on the horizon so it is not empty, and a warm rim on the soil mound. Drawn once with `drawImage` before the sprites, so the whole scene stops being gradients.

## Files

| file | spec | replaces |
|---|---|---|
| `satellites/first-sprout/assets/bg-grove-night-750x1334.jpg` | 750x1334 full-bleed JPG, painted night sky with a soft star field, warm gold moon with halo, and a low dark hedge on the horizon | Replaces the three-stop linear gradient, the two-circle moon (lines 420-421) and the 26 fillRect stars (line 423) in one drawImage. |
| `satellites/first-sprout/assets/soil-mound-750x420.png` | 750x420 transparent PNG, painted dark loam with visible clods, a grass fringe along the top edge and a warm gold rim from the kindled glow | Replaces the flat quadratic-curve fill at line 425 and gives the sky-to-ground edge a transition instead of a hard colour step. |
| `satellites/first-sprout/assets/sprout-stages-512x2048.png` | 512x512 transparent cells, 4 stages stacked: dormant seed, first shoot, leafed stem, bloomed - matched to the game's kindle/wake/bloom/canopy flags | Replaces the ellipse leaves and seven-ellipse flower at lines 438-442 so the thing the player is growing is actually drawn. |
| `satellites/first-sprout/assets/moon-256.png` | 256x256 transparent PNG, painted crescent with craters and a soft gold halo | If the full background is too much work, this alone kills the worst single element in the frame. |

_4 files._

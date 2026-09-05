# POLLEN PANIC art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/pollen-panic/` under the names below; say which landed and the code side wires them.

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

**Game:** `pollen-panic` · satellite · action · audit impact 4/5 · effort M · audit rank 101

## Background wanted

A painted night garden bed under the maze. Dark loam with warm brown mulch and leaf litter, vignetted to near-black at the edges so the cream pellets keep contrast, and enough interest in the upper band to fill the dead space above the maze.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-garden-loam-750x1334.jpg` | 750x1334, full-bleed. Painted night soil bed seen from above: near-black warm brown with mulch and leaf-litter texture, a soft gold glow bleeding down from the top edge, heavy vignette at the corners. | Replaces the flat #101B0E body fill and gives the 90px dead band above the maze something to be. |
| `hedge-tile-64x64.png` | 64x64, tileable and 9-sliceable, transparent corners. A painted boxwood hedge block: sage green mass, warm gold rim light along the top edge, a soft dark shadow along the bottom. | Replaces the flat green rounded bars. Gives every wall a lit top and a shadowed base so hedges stop meeting the ground on a hard edge. |
| `pests-sheet-256x64.png` | 256x64, four frames at 64x64, transparent. Aphid, beetle, moth, snail. Each a clearly different silhouette (round, domed, winged, shelled) in the game's pink and violet range with a cream eye highlight. | The three chasers currently share one blob silhouette in three near-identical pinks. Distinct silhouettes are the single biggest readability win on this screen. |
| `sunberry-32x32.png` | 32x32, transparent, with a soft warm bloom baked in. A painted berry with a gold highlight and a small leaf. | Replaces the plain fillRect power pellet, so the thing the player chases is visually the prize instead of a slightly bigger square. |

_4 files._

# POLLINATOR PATHS art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/pollinator-paths/` under the names below; say which landed and the code side wires them.

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

**Game:** `pollinator-paths` · satellite · puzzle · audit impact 4/5 · effort M · audit rank 27

## Background wanted

bg-meadow-night-540x960.jpg drawn full-bleed under the canvas the way spore-drift draws abyss.jpg: painted night meadow, deep sage-black ground occupying the lower third with soft grass silhouettes, indigo sky above, a low warm moon glow top-right, gentle vignette so the pads pop.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-meadow-night-540x960.jpg` | 540x960 full-bleed, painted night meadow, indigo sky, sage-black grass silhouettes across the lower third, low warm moon glow top-right | Replaces the flat #0b0f0b canvas fill. Gives the game a place instead of a void and stops the frame reading as 85% empty. |
| `flowerpad-bee-96x96.png` | 96x96 transparent, painted flower pad from above, sage leaves, warm gold rim light, bee silhouette pressed into the centre | Replaces the canvas rosette (disc + spokes + cream blob) whose species silhouette is illegible at its 48px rendered size. |
| `flowerpad-butterfly-96x96.png` | 96x96 transparent, same pad language, rose petals, butterfly silhouette, dashed gold inner ring baked in | Same as above; also makes the three pads differ by shape and hue rather than by ring dash pattern alone. |
| `flowerpad-hummingbird-96x96.png` | 96x96 transparent, cream-gold petals, hummingbird silhouette, dotted inner ring baked in | Completes the pad set so shapes match shapes as the How screen promises. |
| `flier-bee-48x48.png` | 48x48 transparent, side-on painted bee, warm gold rim light, big readable silhouette, 3-frame wing strip optional | The bee is currently a ~24px canvas blob barely distinguishable from a dust mote. |
| `flier-butterfly-48x48.png` | 48x48 transparent, painted butterfly, rose and cream wings, warm rim light | There is no butterfly art at all; the three species must read apart at a glance while lines cross. |
| `flier-hummingbird-48x48.png` | 48x48 transparent, painted hummingbird, sage and gold, blurred wing pass | Third flier, same reason. |
| `ring-blossom-128x128.png` | 128x128 transparent, rose petal ring with a soft inner glow and a faint gold pollen dust | Replaces the bare 2px pink stroke circles that currently look unfinished. |

_8 files._

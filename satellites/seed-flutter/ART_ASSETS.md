# COSMIC CADETS art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/seed-flutter/` under the names below; say which landed and the code side wires them.

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

**Game:** `seed-flutter` · satellite · action · audit impact 3/5 · effort S · audit rank 169

## Background wanted

none needed — the skies are already painted and good. What is missing is a middle-ground: a foreground silhouette layer so the hollow band on the results screen is not bare sky.

## Files

| file | spec | replaces |
|---|---|---|
| `fg-results-cliffline-540x260.png` | 540x260 transparent PNG. A near-black silhouetted cliff edge with two star-spires and three drifting seed shapes, soft gold rim light along the top contour, fully opaque at the bottom edge. | Sits across the bottom third of #s-go so the ~170px dead band between the stats and the Again button becomes foreground instead of empty sky. |
| `ui-results-card-460x300.png` | 460x300 nine-slice transparent PNG, matching the existing assets/ui/card_frame.png language: thin gold rule, dark translucent fill, small corner flourishes. | Puts the run summary on a plate. Right now every line floats loose on painted sky, which is why the small sage and grey lines vanish. |
| `icon-stardust-40x40.png` | 40x40 transparent PNG, a painted gold mote with a soft bloom, matching the star_full.png rendering. | Replaces the 🪙 emoji in the '+1 Stardust' line. assets/ui already has this icon family, so the one emoji in the sentence is the only thing breaking the painted look. |
| `fg-title-vignette-540x300.png` | 540x300 transparent PNG, a soft dark cloud bank fading from opaque at the bottom to nothing at the top. | Goes over the bottom of bg_title.jpg so the four mode buttons sit on darkness rather than on the comet burst, which is currently the brightest area of the title screen. |

_4 files._

# ORB ORCHARD art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/orb-orchard/` under the names below; say which landed and the code side wires them.

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

**Game:** `orb-orchard` · satellite · action · audit impact 4/5 · effort M · audit rank 92

## Background wanted

The sky gradient is genuinely good and should stay as code; what is missing is the horizon. Want a painted horizon band drawn over the gradient at the HORIZON line: warm gold haze, a low cloud shelf, faint distant orchard silhouettes, so the ground fades into the sky instead of ending at it. Three variants to match the existing SKIES (dawn / nebula / aurora). The ground itself needs no painted background - it needs its two greens desaturated and value-separated, which is a colour change, not art.

## Files

| file | spec | replaces |
|---|---|---|
| `horizon-dawn-540x260.png` | 540x260 transparent PNG, bottom-aligned to the horizon line: warm gold haze fading up to transparent, a soft low cloud shelf, faint dark orchard silhouettes along the very bottom edge, no hard edges anywhere | Kills the hard 1px seam where the checker plane currently just stops against the sky, and gives the run somewhere to be going. |
| `horizon-nebula-540x260.png / horizon-aurora-540x260.png` | same framing, repainted to the existing SKIES palettes - nebula purple/rose #e58fa0 glow, aurora teal/ice #bfe0f2 glow | The three skies are already wired and unlockable; one band each makes the unlock visible instead of a hue shift. |
| `runner-seedling-96x128.png` | 96x128 transparent PNG, a cream seed body with a green sprout leaf and two small feet, a face, warm rim light down the left edge and a dark contact shadow, big readable silhouette at 26px | Replaces the ctx.ellipse blob that currently vanishes against the blue orbs. Also wants firefly and comet variants - the wardrobe already sells them as three hex pairs. |
| `orbs-sheet-384x96.png` | 384x96 transparent PNG, four 96px cells: dew orb (cool glass, cool rim light top-left, warm bounce under), sunbead (gold torus with an inner glow), thorn (spiked black-plum silhouette, unmistakably hostile), bumper (silver studded puck) | Four gameplay objects currently rendered as near-identical spheres; four distinct silhouettes is what makes the board readable at a glance. |
| `spring-96x96.png` | 96x96 transparent PNG, a coiled green spring pad in a compressed pose, sage #7ab356 with a gold highlight | The fifth hazard, currently another coloured sphere, and the one the help text says throws you three tiles. |
| `grove-plot-540x300.png` | 540x300 transparent PNG, an empty orchard plot at night: twelve dotted planting sockets in rows, one seedling in the first socket, soft ground shadow | THE GROVE screen - the frame the audit harness actually captured - is currently 470px of empty black under one grey sentence. This is the empty state a player sees before they have cleared anything. |

_6 files._

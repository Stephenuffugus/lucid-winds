# PETAL SLICE art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/petal-slice/` under the names below; say which landed and the code side wires them.

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

**Game:** `petal-slice` · satellite · action · audit impact 2/5 · effort S · audit rank 182

## Background wanted

None needed - it is already the strongest background in this batch. What it wants is a foreground layer split off the same painting so pods can fall behind the porch rail and the pots, giving the frame depth instead of a flat wallpaper the action floats in front of.

## Files

| file | spec | replaces |
|---|---|---|
| `fg-porch-autumn-540x180.png` | 540x180 transparent PNG, the porch boards and the near leaf litter cut out of bg_autumn.jpg as a separate foreground plate, soft focus, drawn after the objects | pods currently vanish at the bottom edge with nothing in front of them; a foreground plate lets them fall behind the porch and turns the dead lower 18% into depth |
| `pod_long_140x230.png` | 140x230 transparent PNG, an elongated milkweed-style seed pod, split seam down the long axis, matt sage skin with a soft broad highlight instead of a hard specular ellipse | breaks the three-way silhouette tie between pod_green, berry_blue and burr, so the player can read what is coming by outline alone |
| `blossom_star_223x199_v2.png` | 223x199 transparent PNG, a spikier six-point star blossom with visible stamens, rose and cream, to replace or sit beside blossom_pink | the current blossom is the only non-circle in the set; a second distinct outline gives the object bank three readable shapes rather than one |
| `hud_plate_score_200x86.png` | 200x86 transparent PNG, painted brass-and-leaf score plate with a dark centre, 9-sliceable | the score is currently bare cream numerals sitting straight on a busy painted backdrop with no ground under them - it needs a plate wherever it moves to |

_4 files._

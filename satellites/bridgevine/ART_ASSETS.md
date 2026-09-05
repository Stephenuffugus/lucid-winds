# BRIDGEVINE art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/bridgevine/` under the names below; say which landed and the code side wires them.

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

**Game:** `bridgevine` · satellite · puzzle · audit impact 2/5 · effort S · audit rank 181

## Background wanted

none needed - four painted skies already ship. What it needs is for the chosen sky to actually READ: bg_deep_night.jpg is so dark it is indistinguishable from #000 in the Free Play shot, so either raise its floor by 8-10% luminance or default Free Play to bg_meadow_dusk.jpg.

## Files

| file | spec | replaces |
|---|---|---|
| `bg_deep_night_v2.jpg` | same 540x960 frame as the existing sky plates, but with the black floor lifted to about 8% luminance and a faint moon-lit cloud bank across the upper third | the current deep-night plate is invisible behind the trellis, which is why the top 45% of the play screen reads as void |
| `trellis_arc_glow.png` | 540x400 transparent, the same arc geometry as the existing frame but with a warm rim highlight along the top edge of each arc, additive-blend safe | the arcs currently read as scratches; a rim pass makes the empty upper half read as ceiling structure instead of nothing |
| `haze_midground.png` | 540x220 transparent, a soft warm mist band, tileable horizontally, 20-30% alpha | there is a hard edge where the painted landscape backdrop meets the black above it; a haze band gives that seam a transition |

_3 files._

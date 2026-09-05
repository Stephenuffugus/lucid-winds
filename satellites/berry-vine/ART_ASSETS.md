# BERRY VINE art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/berry-vine/` under the names below; say which landed and the code side wires them.

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

**Game:** `berry-vine` · satellite · action · audit impact 3/5 · effort S · audit rank 178

## Background wanted

None needed, the art already exists and is the strongest in the batch. What it needs is a REPAINT of bg_title.jpg with the composition fixed: hero berry moved into the lower third, and a quiet band of deep space held across the upper 45% for the wordmark and paragraph to land on.

## Files

| file | spec | replaces |
|---|---|---|
| `satellites/berry-vine/assets/bg/bg_title.jpg (repaint)` | 540x960, same nebula language and palette. Hero star-berry moved down to sit between roughly y=560 and y=860, its halo contained. Upper 45% held as quiet deep space, value under 15%, no bright comet arc crossing the copy band. | Fixes the one real fault on this screen: the intro paragraph and the studio line are currently painted over by the art's brightest area. |
| `satellites/berry-vine/assets/ui/btn_plate_primary.png (repaint)` | 320x96 9-slice, 34% border-image insets to match the existing plate. Same olive body and warm gold-green rim as btn_plate.png, but with a brighter interior glow and a slightly thicker rim so it still reads as primary. | Kills the pink neon rim that is the only thing on the menu wearing a different silhouette from the other five plates. |
| `satellites/berry-vine/assets/ui/icon_home.png` | 60x60 transparent PNG, a painted arcade-door or wolf-mark glyph in the same warm gold-on-olive as the other six ui/icon_*.png files. | The 'All Sky Wolf games' bar is the one unpainted button on the screen; giving it a plate and an icon closes the set. |

_3 files._

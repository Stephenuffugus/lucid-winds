# NECTAR DROP art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/nectar-drop/` under the names below; say which landed and the code side wires them.

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

**Game:** `nectar-drop` · satellite · action · audit impact 3/5 · effort S · audit rank 134

## Background wanted

None needed - the background art already exists and is good. The gap is one layer up: the tutorial and menu panels have no painted plate, so flat rectangles sit on top of the painting.

## Files

| file | spec | replaces |
|---|---|---|
| `satellites/nectar-drop/assets/ui/tut-basket-256x256.png` | 256x256 transparent PNG, painted woven basket with warm rim light, a pollen ball arcing into it, soft glow under the catch | Replaces the bucket emoji on the 'Baskets & bins' tutorial card - the single most off-palette object visible in either play frame. |
| `satellites/nectar-drop/assets/ui/card-plate-360x220.png` | 360x220 transparent PNG, painted vellum/leaf-paper panel with soft gold edging and a feathered outer edge, 9-sliceable centre | Sits behind the tutorial cards and the menu buttons so they stop being flat dark rectangles pasted over the painting. |
| `satellites/nectar-drop/assets/ui/tut-peg-256x256.png and tut-bloom-256x256.png` | 256x256 transparent PNGs, painted: a wooden peg with pollen dust caught on it; a red bloom mid-pop with petals scattering | The carousel has four dots, so three more .helprow rows carry the same emoji treatment as the bucket. Same fix applied across the set. |

_3 files._

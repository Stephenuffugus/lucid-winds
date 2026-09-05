# SILT art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/silt/` under the names below; say which landed and the code side wires them.

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

**Game:** `silt` · satellite · creative · audit impact 4/5 · effort S · audit rank 34

## Background wanted

Keep panel_wash.jpg but lift the scrim to .30-to-.62 so it reads as a lit stone shelf behind the copy, and let the boot frame be s-title with title_shelf.jpg instead of dropping a new player onto a text wall 80ms after load. A new how_shelf backdrop would beat panel_wash because that image is too even to survive any scrim.

## Files

| file | spec | replaces |
|---|---|---|
| `assets/backdrops/how_shelf_540x784.jpg` | 540x784 full-bleed JPG. A damp stone shelf lit warm from the upper left, soil and one glowing spore across the bottom third, the top two thirds deliberately dark and low-detail so 14px cream body copy stays legible under a .30 scrim. | Replaces the flat black How screen. panel_wash.jpg is too evenly lit to read through any scrim, which is why the current 3.3MB asset folder produces a blank page. |
| `assets/ui/how_icons_88x88.png` | 880x88 transparent PNG, ten 88x88 cells in a row: goal ring, pointing hand, sprout, pulse heart, flame, bloom, prism shard, stone, moss frond, film clapper. Sage and gold on transparent, warm rim light, readable at 34px. | Replaces the ten emoji bullets in .helprow .hi so the How screen reads as a painted page rather than a chat message. |
| `assets/ui/panel_rim_540x28.png` | 540x28 transparent PNG, a soft painted gold-to-nothing rim with a slight ink deckle. | The text panel currently meets the backdrop on a hard 1px edge; this gives the two surfaces a transition. |

_3 files._

# LOOP WARDEN art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/loop-warden/` under the names below; say which landed and the code side wires them.

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

**Game:** `loop-warden` · satellite · card · audit impact 4/5 · effort M · audit rank 62

## Background wanted

A night meadow the loop can float over. bg-loop-540x960.jpg: a low horizon at roughly y=520 with dark rolling meadow, a treeline silhouette, one distant campfire glow, and the sky above graded indigo to near-black so the ring reads as a clock hanging over the land. Keep the four quadrant tints as a multiply overlay so night, dawn, noon and dusk still recolour the world.

## Files

| file | spec | replaces |
|---|---|---|
| `loop-ring-540x540.png` | Transparent PNG of a painted brass and dark-wood clock ring with 16 engraved recessed tile slots around it, quadrant enamel inlays in indigo, rose, gold and copper, and small engraved marks at the four time positions. | Replaces the ctx.roundRect ring of dim brown squares, which is currently the entire visual identity of the game and reads as unpainted placeholder geometry. |
| `tiles/land-sheet-576x288.png` | 8x4 sheet of 72x72 transparent tiles for the land types the deck names: clover field, watchtower, graveyard, camp, meadow, grove, ruin, well. Painted top-down, warm rim light, readable at 40px. | Replaces the unicode dingbats standing in for every land in the hand and on the ring, and gives the ring slots something to hold. |
| `ui/warden-sheet-384x128.png` | Four 96x128 painted portraits for the wardens the wardrobe already defines (Warden, Knight, Ranger, Moth Monk), transparent, chest-up, in house palette. | The wardrobe currently offers those four as the glyphs shield, knight-chess-piece, arrow and crescent. Four painted portraits turn a cosmetic list into a reason to unlock. |
| `ui/palette-swatch-96x96 x3` | Three painted 96x96 swatch chips for the Emberwood, Frostmere and Gloaming loop palettes, each showing that palette's ring and ground in miniature. | Replaces the brown, blue and purple square emoji currently used as the palette icons, which is the most literal case of emoji standing in for art in the batch. |

_4 files._

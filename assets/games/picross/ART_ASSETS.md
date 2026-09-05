# NONOGRAM BLOOM art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/picross/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-picross` · native · puzzle · audit impact 5/5 · effort S · audit rank 4

## Background wanted

bg-picross-540x960.jpg - a dim herbarium page: pressed-fern paper texture in deep sage-black, a soft warm gold pool centred where the grid sits so the puzzle is lit, edges falling to near-black. It should read as a stitched sampler laid on cloth, which is exactly what a nonogram is.

## Files

| file | spec | replaces |
|---|---|---|
| `board-plate-420x420.png` | 420x420 transparent, painted dark linen or slate plate with a warm gold hairline edge, a soft inner shadow inside the rim and a faint woven texture | Sits behind the grid table (#Xw) so the puzzle has a ground; today the 5x5 floats on the shared shell gradient with nothing marking where the board begins. |
| `cell-filled-96x96.png` | 96x96 transparent, a single painted sage leaf-tile with a warm gold rim light on its top-left edge and a soft shadow at the bottom, designed to tile cleanly edge to edge | Replaces the rgba(74,124,53,.4) fill at games/_inline/picross.js:63 so filling a square reads as placing a leaf, instead of the square getting about twelve RGB points lighter. |
| `new-game-btn-256x256.png` | 256x256 transparent, the SAME copper-and-vine plaque re-exported at button scale, plus a matching narrower plaque for the size selector | The live asset is 3.4 MB for a phone button - the heaviest thing on the page - and its lone painted partner in that row is a plain CSS select. A matching pair at a sane size fixes both the weight and the silhouette clash. |
| `bg-picross-540x960.jpg` | 540x960 full-bleed pressed-fern herbarium paper, warm gold pool at centre, near-black edges | The game has no background of its own and the frame is roughly two thirds empty near-black. |

_4 files._

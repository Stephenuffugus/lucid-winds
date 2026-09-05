# VINE WORDS art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/vinewords/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-vinewords` · native · word · audit impact 4/5 · effort M · audit rank 74

## Background wanted

A full-bleed night garden wall with a real climbing vine: dark stone or weathered board, a thick vine entering bottom-left and branching up the left and top edges with three or four broad leaves overlapping the frame, a warm lantern glow behind the board area falling to near-black at the corners. The name should be visible in the art before you read the title.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-vinewords-540x960.jpg` | 540x960 full-bleed painterly night-garden wall. Vine entering bottom-left, climbing the left and top edges, 4-5 broad sage leaves with warm rim light; centre 340x340 region kept under 12% luminance so letters stay readable. | Replaces the bare shared radial gradient and finally makes the title literal. Fixes the empty horizon in one asset. |
| `vinewords-frame-800x800.png` | 800x800 transparent PNG. Woven willow square frame ~48px thick with visible twist and tendrils, three leaves overlapping the corners so the silhouette is not a perfect square. Inner opening 704x704 for the 4x4 grid. | Gives the grid an edge that meets the background through a transition instead of ending on flat black, and stops the board being a bare rectangle. |
| `vinewords-tile-96x96.png` | 96x96 transparent PNG. Painted bark-and-moss rounded tile, soft top-left rim light, seated shadow at the bottom, faint grain. Blank face; the letter is drawn over it. | Replaces the linear-gradient + 2px rgba(122,179,86,.25) border on all 16 cells, which is currently the entire art budget of the game. |
| `vinewords-tile-lit-96x96.png` | 96x96 transparent PNG. Same tile with a warm gold bloom in the bevel and a brighter rim, for the in-path selected state. | Gives the drag trail a painted destination instead of just swapping a background rgba value. |

_4 files._

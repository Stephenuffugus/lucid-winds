# GARDEN PATH art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/garden-path/` under the names below; say which landed and the code side wires them.

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

**Game:** `garden-path` · satellite · board · audit impact 4/5 · effort M · audit rank 77

## Background wanted

bg-gardenpath-540x960.jpg - a painted night garden lawn seen from above: mown grass bands, moss patches, a scatter of fallen petals, low hedge softening the frame edges, deep sage falling to near-black at top and bottom so the path ribbon and the deck card both read over it.

## Files

| file | spec | replaces |
|---|---|---|
| `tile-flower-6x-96x96.png` | six painted flower heads at 96x96 each, transparent PNG, one per COLORS entry (Poppy, Marigold, Sunflower, Fern, Forget-me-not, Violet), each with a genuinely DIFFERENT petal silhouette and warm rim light | replaces the identical ctx.arc circles in drawTile so tiles are told apart by shape as well as hue, and kills the beaded-necklace read |
| `bg-gardenpath-540x960.jpg` | 540x960 full-bleed painted garden ground, grass and moss, petals, hedge at the frame edge, dark falloff top and bottom | replaces the two-stop canvas gradient that is currently the entire background |
| `throne-256x256.png` | 256x256 transparent PNG, painted mossy stone throne with a gold crown resting on it, warm rim light from the left | replaces the flat gold rounded rectangle at the top of the board, which does not read as a throne at 375px |
| `mascot-5x-128x128.png` | five 128x128 transparent PNGs - Gnome, Fairy, Sprite, Princess, King - painted chest-up, each a distinct silhouette, same eye-line so they do not jitter when swapped | replaces the ~20px hand-coded vector figures that currently overlap each other on the start tile |
| `path-ribbon-tile-64x64.png` | 64x64 tileable painted stepping-stone and gravel strip with soft dirt edges and a transparent margin | replaces the flat grey rgba ribbon and gives the path a transition into the ground instead of a hard 1px edge |

_5 files._

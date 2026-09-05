# HEDGEROW art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/hedgerow/` under the names below; say which landed and the code side wires them.

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

**Game:** `hedgerow` · satellite · puzzle · audit impact 4/5 · effort M · audit rank 111

## Background wanted

One painted bed per skin at the real field size, drawn once instead of tiled — a 510x748 near-black loam with quiet, sparse, LOW-contrast detail so pests can sit on it and be read. The busy pebbled texture belongs at 240px on a card, not at 68px repeated eleven times.

## Files

| file | spec | replaces |
|---|---|---|
| `satellites/hedgerow/skins/s1/sprites/soil.jpg` | Repaint at 510x748 (the real field, COLS*CS x ROWS*CS at 540 wide), full-bleed, drawn once with drawCover instead of tiled. Deep near-black loam, a few large soft clods, one or two buried pebbles, contrast kept inside a narrow band so no detail is brighter than a pest. No saturated teal or gold dots. | Replaces the 240px pebble texture that becomes confetti static at 68px tiled. This is the single change that fixes the whole play screen. |
| `satellites/hedgerow/skins/s1/sprites/planted.jpg` | Repaint at 68x68, seamless on all four edges, designed to be READ at 34px: one seedling motif, big simple silhouette, sage on near-black, no fine stippling. | Replaces the 240px seedling field that becomes a grey 34px brick when stamped per cell. Same repaint needed for hedge.jpg and grow.jpg (same 240px source, same 34px cell). |
| `satellites/hedgerow/skins/s1/sprites/ladybug.png` | 96x96 transparent, redraw with a 2px cream rim light on the top-left edge and a soft dark contact shadow baked at the bottom. Same treatment for beetle, snail, aphid, caterpillar, grub — 6 files per skin. | The pests currently camouflage into the bed. A rim and a shadow are what make a ball read on any texture, on all six skins. |
| `satellites/hedgerow/skins/s1/sprites/edge_hedge_510x34.png` | 510x34 transparent strip: the shadowed under-edge of a hedge wall, dark at the top fading to nothing, with a few root wisps. | Gives the flat lime hedge bands a transition into the soil instead of the current hard 1px edge. |

_4 files._

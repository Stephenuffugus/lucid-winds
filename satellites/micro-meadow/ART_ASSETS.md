# THINK FAST art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/micro-meadow/` under the names below; say which landed and the code side wires them.

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

**Game:** `micro-meadow` · satellite · action · audit impact 4/5 · effort M · audit rank 51

## Background wanted

bg-meadow-540x960.jpg drawn once under the canvas: a painted ground-level meadow with a dark loam band across the bottom third, sage grass silhouettes, dew glints and a warm gold horizon wash, so every mini-game has a floor and a horizon instead of a gradient.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-meadow-540x960.jpg` | 540x960 full-bleed painted night meadow - near-black loam bottom third, sage grass blades in silhouette, warm gold horizon glow, soft dew bokeh, centre kept dark for readability | replaces the flat 2-stop canvas gradient; gives the empty playfield a ground plane and a horizon |
| `sprout-droopy-160x160.png + sprout-happy-160x160.png` | 160x160 transparent pair, painted seedling - wilted with a curled leaf, then perked with a water bead and a soft rim light | replaces the fillRect/arc doodle that is the current tap target in the WATER round |
| `icons-modes-96x96.png` | 6-up 96px sheet on transparent (rush, daily, boss, zen, gallery, wardrobe) painted in sage and gold with matching silhouette weights | replaces the six mismatched vendor emoji on the menu so the button column reads as one set |
| `heart-48x48.png` | 48x48 transparent, cream-filled heart with a warm gold rim, plus a hollow empty variant | the current hearts are near-black on near-black and cannot be seen at all |

_4 files._

# PETAL ALCHEMY art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/petal-alchemy/` under the names below; say which landed and the code side wires them.

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

**Game:** `petal-alchemy` · satellite · creative · audit impact 5/5 · effort M · audit rank 1

## Background wanted

A painted apothecary bench. This is the one game in the batch where a background would also solve the composition problem: the empty half of the play screen is exactly where a bench surface and shelved jars belong.

## Files

| file | spec | replaces |
|---|---|---|
| `satellites/petal-alchemy/assets/bg-bench-540x960.jpg` | 540x960 JPG, full-bleed, midnight apothecary bench: dark wood surface across the lower third, shelves of faintly glowing jars behind, one warm gold lamp pool top-centre, near-black at the extreme top and bottom so the header bar and tray still read | Replaces the flat radial gradient and fills the 430px of dead black under the element row. Also establishes the art hook this game does not currently have. |
| `satellites/petal-alchemy/assets/elem-air.png, elem-seed.png, elem-soil.png, elem-sun.png, elem-water.png` | 128x128 transparent PNGs each: a pollen-lit curl of wind; a seed with a split husk; a crumb of dark loam on a leaf; a small sun cabochon; a dew bead with a highlight. Warm rim light, big readable silhouette | Replaces the five base emoji, brown-square Soil worst of all. These five are on screen 100% of the time, so they are the highest-value five files in the batch. |
| `satellites/petal-alchemy/assets/tray-plate-375x120.png` | 375x120 transparent PNG, painted wooden combine tray with two carved recesses, a plus sign and equals sign inlaid in brass, and a gold arrow well at the right; full-bleed horizontally, transparent above | Replaces the three near-black rectangles at the bottom that currently make the core combine action nearly invisible. |
| `satellites/petal-alchemy/assets/shelf-empty-240x240.png` | 240x240 transparent PNG, a painted empty shelf bracket with one dusty jar, intended to render at about 25% opacity | Centred in #pa-shelf when few elements are discovered, so the void reads as an empty shelf waiting to fill rather than a page that failed to render. |

_4 files._

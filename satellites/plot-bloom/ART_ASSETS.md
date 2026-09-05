# PLOT BLOOM art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/plot-bloom/` under the names below; say which landed and the code side wires them.

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

**Game:** `plot-bloom` · satellite · puzzle · audit impact 4/5 · effort M · audit rank 58

## Background wanted

A painted greenhouse soil bed. bg-plot-540x960.jpg: dark loam inside a low wooden frame, one warm lamp glow entering from top-centre, deep vignette to the corners, so the grid reads as tilled plots rather than empty UI cells.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-plot-540x960.jpg` | 540x960 full-bleed painted dark loam bed inside a wooden bench frame, warm lamp pool top-centre, deep vignette; must stay dark enough for cream text | Replaces the flat radial gradient on #pb-shell. Gives the board a surface and kills both dead black bands. |
| `tile-plot-empty-96x96.png` | 96x96 transparent PNG, painted square of tilled earth with a soft raised rim and a top-left highlight | Replaces the flat #141b0d .cell.empty fill so the 49 cells are visible without relying on a 1px border. |
| `piece-flower-96x96.png (plus piece-tree, piece-pond, piece-hive, piece-bench, piece-veg, piece-hedge at the same size)` | seven 96x96 transparent PNGs, painted top-down garden props, one light direction from top-left, matched silhouette mass so no piece dominates | Replaces the seven emoji in THEMES 'classic' at index.html:259 that currently render at 26px in cells and 34px in hand cards. |

_3 files._

# ROOT FLOW art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/rootflow/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-rootflow` · native · puzzle · audit impact 3/5 · effort M · audit rank 85

## Background wanted

A cross-section of dark soil behind the grid so the board reads as a bed you are threading roots through: a 540x960 backdrop of packed loam with pebbles and mycelium threads, dimmed and vignetted, plus a distinct darker soil texture INSIDE the .RFgrid so the playfield separates from the page.

## Files

| file | spec | replaces |
|---|---|---|
| `assets/games/rootflow/bg-loam-540x960.jpg` | 540x960 full-bleed soil cross-section, dark packed loam, a few pale pebbles, faint mycelium threads, heavy vignette so the board reads on top | replaces the shared grey-green shell gradient and gives the board somewhere to be |
| `assets/games/rootflow/soil-cell-256.png` | 256x256 seamless darker soil tile, slightly cooler than the backdrop | fills .RFgrid so the playfield is a visible bed rather than a 2px outline around the same colour as the page |
| `assets/games/rootflow/seed-*.png (10 files)` | 10 PNGs at 96x96 with alpha, one per COLORS entry: painted seeds and bulbs (acorn, bean, corm, tuber, sunflower seed, pip, hull, spore case, stone, rhizome), each a different SHAPE not just a different colour, warm rim light | replaces the ten glowing CSS discs so a colourblind player can tell pairs apart by silhouette, and so the endpoints stop reading as candy |
| `assets/games/rootflow/root-arm-sheet.png` | 192x64 strip with alpha: a straight root segment and an elbow, tapered and slightly irregular, tintable white-on-alpha | .RFarm is currently a flat rectangle of solid colour; a tintable root sprite makes the drawn path look grown instead of drawn |

_4 files._

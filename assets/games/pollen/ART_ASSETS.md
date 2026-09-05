# MASTER POLLINATOR art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/pollen/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-pollen` · native · board · audit impact 3/5 · effort M · audit rank 141

## Background wanted

bg-pollen-meadow-540x960.jpg - a night meadow seen low to the ground: deep near-black loam at the bottom, moonlit blooms softening out at the left and right edges, one warm gold rim along the grass tips, heavy vignette so the card row stays the brightest thing. Also wanted behind the SEATS modal at low opacity so the first screen is not a bare form.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-pollen-meadow-540x960.jpg` | 540x960 full-bleed, deep near-black loam ground, moonlit blooms blurred at the edges, warm gold rim light on grass tips, strong vignette | replaces the shared shell radial gradient; gives the painted cards a place to sit instead of floating on the same gradient as 65 other natives |
| `assets/games/masterpollinator/tier{1,2,3}/*.png re-export at 240x320` | 240x320 PNG or WebP, under 40KB each, same paintings, opaque | the shipped art is 1.8-1.9MB PER FILE (blue-tailed-damselfly.png is 1,946,154 bytes) across 90 flowers + 11 pollinators - tens of MB for a phone to pull a 120px-wide card |
| `pollen-tokens-sheet-192x48.png` | 192x48 transparent sprite strip, 4 painted pollen-grain discs at 48x48 (green/rose/amber/spore) plus a gold one, soft painterly, warm rim light | replaces the CSS glossy-marble pips currently rendered over the flower paintings |
| `pollen-tree-64x64.png` | 64x64 transparent, a small painted canopy silhouette with gold rim light | the round/supply counters use the raw emoji tree; it is the only emoji left in the board furniture |

_4 files._

# SEED REEL art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/seed-reel/` under the names below; say which landed and the code side wires them.

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

**Game:** `seed-reel` · satellite · dice · audit impact 4/5 · effort M · audit rank 65

## Background wanted

A painted night garden bed. Dark loam rows seen from slightly above, low stone edging, sage foliage bleeding in from the frame corners, one warm gold lantern glow upper-left, top 200px kept near-black so the HUD stays readable.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-seedreel-bed-540x960.jpg` | 540x960 full-bleed painted night garden: dark loam, soft stone bed edging, sage foliage bleeding in from all four corners, single warm lantern glow upper-left, top 200px near-black | replaces the two-stop CSS gradient plus the stray 10% white disc; gives the empty bed a ground instead of a void |
| `tile-soil-92x92.png` | 92x92 transparent, a soft painted soil cell: rounded dark loam square with a faint pressed rim and a hint of grain | replaces the rgba(20,26,18,0.5) rounded rect at drawBoard line 557 so an empty cell reads as prepared soil, not an empty box |
| `sprites-seedreel-552x460.png` | one atlas, 6 cols x 5 rows of 92x92 transparent painted icons covering the 28 SYMS keys (seed, sprout, leaf, clover, grass, berry, flower, worm, mushroom, foxglove, bee, rain, sun, tree, moon, koi and the rest) | replaces the emoji glyphs so all 28 tiles come from one hand instead of 33 different vendor fonts |
| `moon-seedreel-160x160.png` | 160x160 transparent painted moon, soft warm halo, faint maria, cream rim light | replaces the flat 10%-opacity disc, and lets it move up off the Bloom Quota bar |

_4 files._

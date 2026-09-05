# ROOT RUSH art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/rootrush/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-rootrush` · native · puzzle · audit impact 3/5 · effort S · audit rank 150

## Background wanted

bg-rootrush-soil-600x600.jpg tiling inside the board, plus bg-rootrush-surround-540x960.jpg behind the page - dark loam with visible grit, a few pale pebbles, fine hair-roots threading through, lit warm from the top-left so the board has a light direction, going near-black at the bottom-right corner.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-rootrush-soil-600x600.jpg` | 600x600, dark loam texture, scattered pale pebbles and fine hair-roots, warm top-left light falling to near-black bottom-right, no visible grid | replaces the three-stop CSS gradient inside .RRboard; gives the puzzle a real surface |
| `root-blocks-sheet-512x512.png` | 512x512 transparent sheet: 6 painted root segments (h2, h3, v2, v3 plus two knotted variants) with bark texture, side nubs and a visible cut end, each in a distinct wood tone - one pale birch-root, one grey-barked, one dark peat, one ruddy | replaces the ten near-identical CSS browns so two blocks in one frame stop sharing both colour and silhouette |
| `seed-pod-block-160x80.png` | 160x80 transparent, a warm seed pod with a real painted sprout breaking from its top, sage leaves, gold rim light, soft inner glow | replaces the .RRblock.special green gradient plus the raw 🌱 emoji that is currently the player's entire avatar |
| `exit-gate-48x140.png` | 48x140 transparent, a gold-lit gap torn in the soil wall with warm light spilling through and a few root ends at the edges | replaces the 10px .RRexit radial-gradient sliver, which is easy to miss on a phone |

_4 files._

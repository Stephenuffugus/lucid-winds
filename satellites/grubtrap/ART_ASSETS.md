# INKBOUND art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/grubtrap/` under the names below; say which landed and the code side wires them.

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

**Game:** `grubtrap` · satellite · puzzle · audit impact 3/5 · effort S · audit rank 175

## Background wanted

none needed - the painted skin backgrounds already carry the frame and there are eight of them. What is missing is not another background but a transition between the board and the backdrop.

## Files

| file | spec | replaces |
|---|---|---|
| `frame-bed-edge-96x96-9slice.png` | 96x96 transparent 9-slice: a painted planter-bed rim in wet soil with moss in the corners and a few pebbles, soft shadow on the inner edge | replaces the 1px maroon rect around the board and gives the playfield an actual edge into the painted backdrop instead of a hard cut |
| `dpad-key-144x144.png plus dpad-key-pressed-144x144.png` | 144x144 transparent, a painted stone or root cap key with a carved arrow, warm rim light, and a pressed variant sunk 4px with a darker top | replaces the flat olive CSS gradient slabs built in buildCtrl() - the only unpainted objects on a fully painted screen |
| `hero-glow-ring-128x128.png` | 128x128 transparent, a soft warm cream halo with a slightly denser inner ring, premultiplied for additive blending | replaces the procedural critterGlow() radial gradient so the ~20px hero and grub keep a readable silhouette against a busy tile field |

_3 files._

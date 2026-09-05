# MANCALA art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/seedsow/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-seedsow` · native · board · audit impact 4/5 · effort M · audit rank 31

## Background wanted

A painted night-garden tabletop: dark moss-green cloth under the board, warm lantern glow falling from the upper right, out-of-focus greenhouse glass and one leaf silhouette at the top edge. It is a tabletop board game and it currently floats on a bare gradient with nothing under it.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-seedsow-750x1334.jpg` | 750x1334 full-bleed, near-black moss cloth, warm lantern falloff from upper right, blurred glass and one leaf silhouette top edge, centre kept quiet so the board reads | replaces the shared shell radial gradient; gives the board a surface to sit on instead of floating in a void |
| `board-seedsow-960x420.png` | 960x420 transparent PNG, carved olive-wood mancala board seen slightly from above, 12 pits plus 2 end stores, visible end grain, warm gold rim light on the top lip, cool shadow inside each pit | replaces the .ss-board linear-gradient(#5a3f22,#7a5c3a) and the radial-gradient .ss-pit holes - the whole board is currently three CSS gradients |
| `seed-seedsow-48x48.png` | 48x48 transparent PNG, one painted amber seed husk with a specular highlight and a soft drop shadow; ship 3 rotation variants in a 144x48 strip | replaces .ss-seed, a 6px radial-gradient dot - 48 of these dots are the only thing that moves during play |
| `store-seedsow-160x340.png` | 160x340 transparent PNG, a deeper carved end bowl with a lit rim, one warm-toned for the player store and one coral-toned for the AI store | replaces .ss-store, currently a radial-gradient pill with a 30px border-radius that reads as a rounded rectangle, not a bowl |

_4 files._

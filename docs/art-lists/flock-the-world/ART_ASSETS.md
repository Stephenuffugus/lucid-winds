# FLOCK THE WORLD art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`docs/art-lists/flock-the-world/` under the names below; say which landed and the code side wires them.

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

**Game:** `flock-the-world` · satellite · puzzle · audit impact 4/5 · effort M · audit rank 103

## Background wanted

A painted plate behind the map on #game, dark enough that the canvas stays the brightest thing: a war-room table seen from above with paper edges, a cold monitor glow and a coffee ring. bg_warroom.webp already exists in art/bg and is unused, so the first move is to hang it before painting anything new.

## Files

| file | spec | replaces |
|---|---|---|
| `art/bg/bg_game.webp` | 1080x1920 full-bleed, a night war-room desk seen from above, dark walnut and cold monitor light, paper edges and a coffee ring at the margins, everything within two values of #080d14, no text | gives the play screen, which today is a flat panel colour, the ground every other screen in this game already has |
| `art/ui/hud_plate.webp` | 1080x260 transparent PNG or webp, a brushed dark instrument plate with a hairline sodium edge and four recessed stat wells | backs the Date / Capital / Influence / Suspicion row so the labels stop floating as grey text on black |
| `art/ui/nav_ledger.webp and six siblings (deploy, watch, story, crisis, world, feed)` | seven 96x96 transparent icons, filled shapes with warm rim light rather than 1.7px hairline strokes, each a distinct silhouette (a ledger book, a van, an eye, a page, a siren, a globe, a ticker) | replaces the seven thin inline SVG strokes that collapse into identical grey marks at 13-16px |
| `art/bg/wordmark_alt.webp` | 900x360 transparent, the same lockup redrawn in warm gold and cream with a soft rim light instead of chrome and orange gloss | brings the loudest object in the fleet back into the midnight greenhouse palette, if the Director wants the house look to win |

_4 files._

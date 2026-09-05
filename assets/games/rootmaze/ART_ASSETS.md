# ROOT MAZE art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/rootmaze/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-rootmaze` · native · puzzle · audit impact 5/5 · effort L · audit rank 21

## Background wanted

bg-rootmaze-540x960.jpg - a painted cross-section of dark soil: strata bands, small stones, pale mycelium threads, a lantern glow from top-right. The board should look cut INTO earth; right now a flat black canvas floats on a flat black page with no boundary between them.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-rootmaze-540x960.jpg` | 540x960, full-bleed JPG. Painted soil cross-section: strata bands, pebbles, faint mycelium filaments, a warm lantern pool at top-right, all values kept under 20% luminance so the board reads on top. | Replaces the flat #0d100c canvas clear at games/rootmaze.js:541. Gives the maze a place to be dug into and puts a boundary between the canvas and the page. |
| `tile-sheet-rootmaze-512x512.png` | 512x512, transparent PNG. A 4x4 sheet of 128px painted maze tiles: straight, elbow, tee, cross, each in a plain and a fixed/gilded variant. Real root bark on the corridors, a soft inner shadow at the tile seam, warm rim light from top-right. | Replaces ctx.strokeStyle='#a88356' bars and the #221a12 / #2a2018 tile fills (games/rootmaze.js:448-478) - i.e. every tile on the board. This is the single biggest lift available in the game. |
| `treasures-sheet-576x192.png` | 576x192, transparent PNG. Eighteen painted 96x96 botanical tokens matching the TREASURES array at games/rootmaze.js:16 (sunflower, rose, tulip, mushroom, hyacinth, cactus, bamboo, clover, cherry blossom, potted plant, hibiscus, maple, wheat, lotus, herb, seedling, deciduous, evergreen), house palette, big readable silhouettes distinguishable at 24px. | Replaces the 15px system emoji, which are the loudest wrongness in the frame and are also a playability fault - three of them cannot be told apart at the rendered size. |
| `tokens-rootmaze-192x96.png` | 192x96, transparent PNG, two 96x96 cells. A painted seeker lantern-sprite in sage and its rival mirror in rose, each with a warm rim light and a cast ground shadow. | Replaces drawToken() at games/rootmaze.js:521-530, which draws a flat coloured circle with a black stroke and an emoji glyph on top of it. |
| `arrow-push-64x64.png` | 64x64, transparent PNG. A painted brass push-lever seen end-on with a shadow and a warm highlight, plus a 64x64 pressed variant. | Replaces ctx.fillText of a bare sans-serif triangle glyph on an rgba(200,168,75,0.18) rectangle (games/rootmaze.js:506-513). These are the game's primary input and they are currently typography. |

_5 files._

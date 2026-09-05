# CODE BREAKER art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/mastermind/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-mastermind` · native · board · audit impact 3/5 · effort M · audit rank 138

## Background wanted

bg-codebreaker-540x960.jpg - a dark seed-sorting bench: worn wood counter, a bank of shallow apothecary drawers going out of focus at the top, a lantern glow entering upper right, so the guess rows read as trays set on a table. Full-bleed.

## Files

| file | spec | replaces |
|---|---|---|
| `assets/games/mastermind/new-game-btn-360x360.png` | 360x360 transparent PNG, under 60KB, sage and gold seed packet | Replaces the shared 1529x1529 / 3.4MB bronze plaque that is off-palette and 26x larger than its render size. |
| `assets/games/mastermind/row-tray-1080x220.png` | 1080x220 transparent PNG, 9-sliceable, renders about 360x73 | Each guess row is currently a flat rgba() rounded rectangle. A shallow wooden tray with four seed wells and two peg holes at the right would give the board a surface. |
| `assets/games/mastermind/peg-right-96x96.png and peg-near-96x96.png` | two 96x96 transparent PNGs - a filled sprout peg and a hollow gold ring peg | The feedback pegs are the game's entire information channel and are currently plain CSS circles. |
| `bg-codebreaker-540x960.jpg` | 540x960 full-bleed JPG, dark wooden seed bench, lantern glow upper right | The game has no background of its own at all. |

_4 files._

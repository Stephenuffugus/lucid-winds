# BLOCK DROP art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/petalfall/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-petalfall` · native · puzzle · audit impact 4/5 · effort M · audit rank 57

## Background wanted

bg-petalfall-540x960.jpg - a night greenhouse pane behind the well: blurred glass with condensation, a bough of blossom leaning in from the upper left, a warm gold lamp glow low right, dark enough that a bright piece still reads on top. The SEASONS table already exists, so ship four: bg-petalfall-spring / -summer / -autumn / -winter-540x960.jpg and swap on level.

## Files

| file | spec | replaces |
|---|---|---|
| `assets/games/petalfall/blocks-sheet-448x64.png` | 448x64, seven 64x64 transparent tiles, one per tetromino | Replaces ctx.fillRect plus a hand-drawn 2px white and 2px black bevel (petalfall.js:630-639) - seven soft-edged painted petals with a warm rim light instead of seven plastic squares. |
| `assets/games/petalfall/well-frame-660x1200.png` | 660x1200 transparent PNG, 9-sliceable, with a lip at the bottom | The well is currently a 1px rose stroke; a carved planter frame gives the pieces something to land in. |
| `assets/games/petalfall/petal-particle-64x64.png` | 64x64 transparent PNG, four rotation variants on one 256x64 strip | The game is named for falling petals and shows none - one drifting petal for line clears and idle drift earns the name. |
| `assets/games/petalfall/icon-hold / -drop / -fast / -pause-96x96.png` | four 96x96 transparent PNGs in var(--gold) | Replaces the U+29C9 tofu box and the two orange emoji in the control bar. |

_4 files._

# SUDOKU art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/sudoku/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-sudoku` · native · math · audit impact 5/5 · effort M · audit rank 15

## Background wanted

A painted night-workbench ground plus a paper surface under the grid, so the 9x9 sits ON something instead of floating in the shared void. This is the whole lift for this game.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-sudoku-540x960.jpg` | 540x960 full-bleed. Night greenhouse workbench seen from above: dark slate, faint moss creeping in at the left and bottom edges, a warm gold lamp falloff entering top-right, centre deliberately flat and unbusy so the grid stays legible over it. | Replaces the shared 66-game radial gradient. Gives Sudoku its own room instead of the default corridor. |
| `sudoku-board-paper-880x880.png` | 880x880 (2x the 440px max grid), transparent outer edge. Aged vellum/ledger paper in cream-over-charcoal at low opacity, soft inner vignette, a faint hand-ruled hairline exactly on the 3x3 box lines, worn corners. | Sits behind .ug as background-image. Gives the board a material AND paints in the box structure that the CSS rules currently lose. |
| `sudoku-key-plate-216x188.png` | 216x188 (2x the ~108x94 pad key), transparent. A painted river-stone chip with warm rim light top-left, a soft contact shadow bottom, and a slightly irregular edge so no two keys look die-cut. | Replaces the flat rgba(26,31,23,.65) .upb rectangles - the 10 number keys are half the screen and currently carry no art at all. |

_3 files._

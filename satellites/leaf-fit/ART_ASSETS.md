# TETROKU art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/leaf-fit/` under the names below; say which landed and the code side wires them.

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

**Game:** `leaf-fit` · satellite · puzzle · audit impact 5/5 · effort M · audit rank 12

## Background wanted

bg-trellis-540x960.jpg - a painted midnight trellis: dark lattice woodwork with moss in the joints, ivy creeping in from the left edge, a faint moon glow top-left, and a deep near-black falloff at the bottom so the piece tray still reads over it. The board should then sit on a painted plinth rather than floating on nothing.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-trellis-540x960.jpg` | 540x960 full-bleed painted midnight trellis wall, dark lattice, moss in the joints, ivy at one edge, moon glow top-left, near-black at the bottom | replaces the two-stop canvas gradient and finally gives the 'midnight trellis' in the game's own copy something to actually be |
| `sprig-6x-128x128.png` | six painted leaf sprigs at 128x128 transparent PNG, one per piece colour, each a different leaf shape, tinted sage / warm gold / rose / copper / pale blue / cream, soft rim light | replaces the flat rounded-square cells and the off-palette Blockudoku blue and salmon; makes pieces readable by shape as well as colour |
| `board-plinth-96x96-9slice.png` | 96x96 transparent 9-slice painted stone-and-bark frame with a soft inner shadow and mossy corners | gives the board an edge and a transition; right now it is a 1px hairline rectangle sitting on nothing |
| `cell-empty-64x64.png` | 64x64 painted empty trellis socket - a woven square, faintly lit at the top-left, transparent margin | replaces the #141d10 flat fill so an empty board is legible instead of a black hole |
| `bloom-burst-256x256.png` | 256x256 transparent painted pollen and petal burst, warm gold centre falling to transparent, additive-friendly | replaces the plain ctx.arc particle spray used for a line clear, which is the game's only moment of reward |

_5 files._

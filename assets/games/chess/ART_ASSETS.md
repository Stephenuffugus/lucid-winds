# CHESS art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/chess/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-chess` · native · board · audit impact 4/5 · effort S · audit rank 164

## Background wanted

bg-chess-540x960.jpg behind the whole page - a dark green baize tabletop with the corner of a carved shelf and a warm lamp pool falling on the board's top-left, so the painted frame sits ON something instead of floating on shell black. Also re-export chess-board.png at 1024x1024; it renders at up to 420 CSS px, so 512 is already soft on a 2x phone.

## Files

| file | spec | replaces |
|---|---|---|
| `p-king-green.png (and the other 11: p-{king,queen,rook,bishop,knight,pawn}-{green,gold}.png)` | 256x256 PNG-32 WITH ALPHA. Piece only, fully transparent background, warm rim light from upper-left, one soft contact-shadow ellipse baked at the base. Gold set warmed ~10% and green set lightened ~15% so both read against dark walnut. | Replaces the current 128x128 RGB opaque tiles that stamp a black rectangle over the board under every piece. This single re-export is the biggest visual win available in this batch. |
| `chess-board.png` | 1024x1024 JPG/PNG, same painted walnut+maple board and carved frame, gem inlays regularised into four corner clusters instead of scattered specks. | Current file is 512x512 shown at 420 CSS px, soft at 2x; and the random specks read as noise. |
| `bg-chess-540x960.jpg` | 540x960 full-bleed, deep green baize table, warm lamp pool top-centre falling off to near-black at the bottom edge, a shelf corner and a mug at the lower left. | Fills the empty 280px of flat black under the board and gives the frame a surround to meet. |

_3 files._

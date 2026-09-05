# CRIBBAGE art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/cribbage/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-cribbage` · native · card · audit impact 4/5 · effort M · audit rank 129

## Background wanted

bg-cribbage-540x960.jpg - a deep sage-black baize with a warm lamp pool top-centre, a worn wooden table edge at the bottom and a corner of a knitted throw, so the gold-framed panel has a surround. Recolour the felt itself off casino green: #123a24 to #0c2a19, letting the gold frame and the brass pegs carry the warmth.

## Files

| file | spec | replaces |
|---|---|---|
| `cribbage-board-680x180.png` | 680x180 PNG-32 with alpha, painted walnut peg board, two drilled hole tracks with real bored shadows, a brass end-rail, worn edges. | Replaces the pure-CSS repeating-linear-gradient wood strip and the 3x6px CSS hole dots - the one hero object on the screen currently costs nothing and looks it. |
| `bg-cribbage-540x960.jpg` | 540x960 full-bleed, dark baize + table edge + warm lamp pool, falling to near-black at the bottom so the shell footer blends. | Kills the hard edge where the green panel stops and 200px of flat black begins under it. |
| `suit-spade-64.png, suit-heart-64.png, suit-diamond-64.png, suit-club-64.png` | 64x64 PNG-32 transparent, downsampled from the existing assets/decks/floral/suit-*.png. | The existing floral pips are 993KB to 1.6MB EACH and are used at 18px; 25MB of deck art is unshippable on a phone, so nobody sees it and the emoji fallback wins. 64px derivatives make the painted deck actually usable. |
| `court-{jack,queen,king}-{red,black}-128x180.png` | 128x180 PNG-32 transparent, downsampled from the existing assets/decks/floral/{jack,queen,king}-{red,black}.png (currently 2.2-3.0MB each). | Gives J/Q/K real faces instead of a bare serif letter next to a mushroom emoji. |

_4 files._

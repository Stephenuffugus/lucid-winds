# KAKURO art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/kakuro/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-kakuro` · native · math · audit impact 3/5 · effort S · audit rank 140

## Background wanted

A dark slate or green-ledger surface with faint ruled lines and a warm lamp pool top-centre, vignetted to near-black. The grid should look like it is printed on something.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-ledger-750x1334.jpg` | 750x1334 full-bleed, dark green-black ledger surface, faint ruled lines at low contrast, warm lamp pool at 50%/20%, vignetted to near-black at the edges | Replaces the shared shell gradient so the grid sits on a surface rather than floating on the default background every native shares. |
| `kakuro-clue-tile-96x96.png` | 96x96 transparent PNG, dark slate tile with a real gold diagonal rule corner to corner at about 35 percent alpha, subtle top bevel, transparent corners for the numerals | Replaces the invisible 0.06-alpha CSS gradient in .KKcell.clue::before so across and down clues stop reading as one ambiguous square. |
| `kakuro-cell-paper-96x96.png` | 96x96 transparent PNG, warm cream vellum with faint fibre texture and a soft inner shadow at the top edge | Replaces the flat rgba(245,240,225,0.9) fill on .KKcell.white so filled cells look like paper rather than a solid swatch. |

_3 files._

# GARDEN RUMMY art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/juniper/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-juniper` · native · card · audit impact 4/5 · effort M · audit rank 133

## Background wanted

The same felt construction repainted near-black-green with a sage nap and gold vignette, plus a painted stock/discard tray so the two centre cards sit somewhere rather than floating on flat colour.

## Files

| file | spec | replaces |
|---|---|---|
| `assets/games/juniper/felt-750x1334.jpg` | 750x1334 felt: #12271c to #0b1a12 ramp, woven sage nap, warm gold vignette top edge, a slightly worn oval under the stock/discard row | replaces the #2a1f48 plum gradient so the table joins the midnight-greenhouse palette |
| `assets/games/cards/shroom@2x.png, flower@2x.png, bee@2x.png, bird@2x.png` | 256x256 transparent each, the four botanical suits repainted: soft painterly shading, warm rim light upper-left, a small contact shadow, silhouettes readable at 24px | the current pips are 1.3-2.1KB flat clip art scaled up to fill a 46x64 card face; they are the loudest thing in the frame and they clash with the painted card back directly above them |
| `assets/games/juniper/table-inlay-360x200.png` | 360x200 transparent, a shallow painted two-well tray: two card-shaped depressions with soft rims and contact shadows, faint gold hairline between them | the stock and discard currently float in flat purple with only 0.68rem text labels underneath; the tray gives them a motivated place |
| `assets/decks/floral/card-front-frame-256x356.png` | 256x356 transparent, cream card face with painted deckle edge and hairline floral border inset 6%, centre transparent | shared with gardenspades and the other seven card games - stops painted pips landing on plain CSS rectangles |

_4 files._

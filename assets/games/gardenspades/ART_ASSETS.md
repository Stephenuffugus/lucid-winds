# GARDEN SPADES art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/gardenspades/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-gardenspades` · native · card · audit impact 3/5 · effort S · audit rank 158

## Background wanted

The same felt construction repainted into the house palette: deep near-black-green with a sage weave and a warm gold vignette, plus a feathered outer shadow so the panel edge fades into the page instead of ending on a hard brass line.

## Files

| file | spec | replaces |
|---|---|---|
| `assets/games/gardenspades/felt-750x1334.jpg` | 750x1334 tileable-centre felt: #12271c to #0b1a12 ramp, visible woven sage nap, warm gold vignette at the top edge, a faint worn patch under the trick area | replaces the #0e3a5c blue gradient so the table joins the midnight-greenhouse palette instead of reading as a poker room |
| `assets/games/gardenspades/trick-well-420x360.png` | 420x360 transparent, a shallow carved-wood inlay: a soft-edged oval depression with a faint gold compass rose or leaf medallion at 12% opacity, contact shadow around the rim | fills the 160px empty rectangle at the frame's optical centre with something composed, without competing with played cards |
| `assets/games/gardenspades/frame-corner-160x160.png` | 160x160 transparent, painted brass-and-olive table-edge corner ornament, designed to be mirrored into all four corners | turns the flat 2px #6b4520 border into a table edge and softens the hard panel/page boundary |
| `assets/decks/floral/card-front-frame-256x356.png` | 256x356 transparent, cream card face with a painted deckle edge, a hairline floral border inset 6%, and a soft inner shadow; centre transparent for the pip | the floral pips are real art landing on a plain #F5F0E1 CSS rectangle - this is the surface they need, and it is shared with juniper and the other seven card games |

_4 files._

# GOLF SOLITAIRE art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/golf/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-golf` · native · card · audit impact 4/5 · effort S · audit rank 109

## Background wanted

The same card-table asset as FreeCell: bottle-green felt, warm lamp pool, near-black vignette, wood rail across the bottom. One asset serves both card games and closes the dead lower half.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-cardtable-750x1334.jpg` | 750x1334 full-bleed, bottle-green felt with visible nap, warm lamp pool at 50%/22%, near-black vignette, dark wood rail across the bottom 12 percent | Shared with FreeCell. Replaces the flat shell gradient and fills the empty bottom 45 percent. |
| `deck-count-plate-72x72.png` | 72x72 transparent PNG, dark near-black disc at about 75 percent opacity with a thin warm gold ring, soft outer falloff | Sits under the remaining-count numeral on the deck back so the number stops fighting the ornate pattern. |
| `golf-waste-well-100x140.png` | 100x140 transparent PNG, an engraved felt well with a thin gold edge, empty | Anchors the waste pile position, which currently has no marked home, and gives the deck/waste pair a motivated group. |
| `card-contact-shadow-140x48.png` | 140x48 transparent PNG, soft elliptical drop shadow, about 30 percent black at centre falling to zero | Same asset as FreeCell. Gives every column a transition to the felt instead of a hard cut edge. |

_4 files._

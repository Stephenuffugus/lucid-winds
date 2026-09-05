# ROOT WEAVE art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/root-weave/` under the names below; say which landed and the code side wires them.

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

**Game:** `root-weave` · satellite · puzzle · audit impact 3/5 · effort S · audit rank 84

## Background wanted

None needed as new art. Reuse the existing assets/backgrounds/bg_midnight.jpg behind .screen at 55-65% darkness so the How wall, title and wardrobe sit in the same soil as the board.

## Files

| file | spec | replaces |
|---|---|---|
| `how-icon-goal-64x64.png` | 64x64 transparent, painted sage-and-gold line art of a bulb at the centre of a clean weave | Replaces the target emoji in the How gutter with something in the game's own palette. |
| `how-icon-drag-64x64.png` | 64x64 transparent, a hand drawing a bulb along a glowing root | Replaces the pointing-hand emoji. |
| `how-icon-taproot-64x64.png` | 64x64 transparent, an anchored bulb with a burr knot, copper and sage | Replaces the knot emoji, which renders as a flat system glyph and is the worst offender in the gutter. |
| `how-icon-bloom-64x64.png` | 64x64 transparent, a root mandala opening into a rose bloom | Replaces the blossom emoji and previews the actual keepsake art. |
| `how-icon-candle-64x64.png` | 64x64 transparent, a warm nudge candle with a soft gold halo | Replaces the candle emoji, which is the second flat glyph in the column. |
| `how-icon-daily-64x64.png` | 64x64 transparent, a dew-marked leaf calendar in sage and gold | Replaces the calendar emoji and finishes the set so the gutter reads as one painted column. |

_6 files._

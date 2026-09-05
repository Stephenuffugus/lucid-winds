# MERGE & BLAST art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/merge-blast/` under the names below; say which landed and the code side wires them.

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

**Game:** `merge-blast` · satellite · math · audit impact 4/5 · effort M · audit rank 44

## Background wanted

A painted 540x960 full-bleed backdrop of a night potting bench seen from above - dark stained wood, a lantern glow up in one corner, seed packets and a trowel at the edges - with the centre deliberately kept dark and low-contrast so the number tiles stay legible on top of it. This is the single change that would move the game from plain to decent.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-merge-540x960.jpg` | 540x960 full-bleed JPG, night potting-bench overhead: near-black stained wood, warm gold lantern falloff from the top-left, sage foliage creeping the outer 15%, centre 400x600 kept under 12% luminance so tiles read | replaces the flat linear-gradient(180deg,#14141f,#0d0d14) that is the entire background of every screen, and fills the empty top half of the title frame |
| `tile-plate-120x120.png` | 120x120 transparent PNG, one painted enamel/clay tile plate with a warm rim light top-left and a soft drop shadow, painted in neutral cream so code can tint it per value | replaces the rr()+flat fill+16% white wash rounded rect drawn at line 464-467, so the ten rainbow values become one painted object in ten glazes instead of ten flat swatches |
| `wordmark-merge-blast-460x120.png` | 460x120 transparent PNG, painted wordmark in cream and warm gold with a sage sprout through the ampersand, soft outer glow baked in | replaces the CSS background-clip:text gradient at line 50 whose blue/yellow/rose is off the house palette and reads as clip art |

_3 files._

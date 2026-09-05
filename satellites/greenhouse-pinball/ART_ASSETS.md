# BLOBWORKS art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/greenhouse-pinball/` under the names below; say which landed and the code side wires them.

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

**Game:** `greenhouse-pinball` · satellite · action · audit impact 2/5 · effort S · audit rank 180

## Background wanted

None needed. The table backdrop is painted, full-bleed and correct; the only art gap is a frame or apron treatment behind the HUD readouts.

## Files

| file | spec | replaces |
|---|---|---|
| `hud-score-plate-240x88.png` | 240x88 transparent, painted clay-and-brass score bezel with a recessed dark glass window and two rivets, sized so the digits sit inside the window | gives the score a ground of its own so the injected Music chip no longer reads as part of the readout, and stops raw text floating on clay |
| `btn-pause-clay-96x96.png` | 96x96 transparent, a sculpted clay button with two brass pause bars pressed into it, warm rim light on the top edge | replaces the flat dark rounded slab currently sitting on the painted table at top-centre |
| `popup-bonus-plate-220x64.png` | 220x64 transparent, a soft warm glow plate with feathered edges that the floating score pops draw on top of | separates 'BONUS +500' and '+1000' from the busy table behind them so they stop reading as overlapping noise |

_3 files._

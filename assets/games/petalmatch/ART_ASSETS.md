# PETAL MATCH art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/petalmatch/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-petalmatch` · native · puzzle · audit impact 3/5 · effort S · audit rank 176

## Background wanted

None needed - four painted chapter backdrops already ship and they look right. What it needs is for the backdrop to stop ending on a hard line: extend it under the shell footer or fade it out.

## Files

| file | spec | replaces |
|---|---|---|
| `pm-bg-fade-540x180.png` | 540x180 transparent, a vertical gradient from fully clear at the top to solid #0d100c at the bottom, no detail | Laid at the bottom of #PMbg so the painted chapter backdrop dissolves into the shell instead of ending on the straight cut line visible above Add to Home Screen. |
| `pu-dig.png / pu-cut.png / pu-wash.png / pu-boost.png` | four 96x96 transparent painted tool icons - brass trowel, garden shears, copper watering can, sunburst - warm rim light, on alpha | Turns the powerup shelf from four grey words into four objects. The code comment at games/petalmatch.js:313 already names this exact path (runtime/pu-<key>.png) and the hook was never painted. |
| `pill-locked.png` | 160x56 transparent 9-slice, a desaturated but still painted version of the existing pill-thin.png with a faint brass edge | So an unaffordable powerup looks deliberately locked rather than unstyled - right now DIG/CUT/WASH read as broken UI on top of finished art. |

_3 files._

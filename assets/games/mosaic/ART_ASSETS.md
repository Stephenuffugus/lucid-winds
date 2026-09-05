# MOSAIC GARDEN art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/mosaic/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-mosaic` · native · puzzle · audit impact 5/5 · effort L · audit rank 14

## Background wanted

A dim conservatory floor - dark slate with a faint grout grid and a warm lamp falloff top-centre - so a game about laying tiles is happening on a floor instead of in a void.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-mosaic-540x960.jpg` | 540x960 full-bleed, dark slate conservatory floor, faint grout grid receding, warm lamp falloff top-centre, deep near-black corners | The game currently has no background of any kind - it is the shared gradient behind flat CSS panels. |
| `tile-petal.png / tile-leaf.png / tile-berry.png / tile-sun.png / tile-frost.png` | five 96x96 transparent, glazed ceramic tiles with a rim highlight, a soft drop shadow and a painted motif (petal, leaf, drop, sun, flake) in the existing colours #e07a8a #6bad4a #5b9bd5 #d4a843 #a0c4e8 | Replaces the flat hex fill plus emoji in mkTile (games/mosaic.js:730) - the only 'art' in the game is currently a system emoji at 0.9rem. |
| `panel-tray-9slice.png` | 320x320 transparent 9-slice, mossy stone tray edge with a shallow inner lip, ~24px inset | Applied to .MSboard so the two identical CSS rectangles become physical trays and stop sharing a silhouette. |
| `factory-dish-152.png` | 152x152 transparent, painted shallow stone dish with a worn rim, top-down | Replaces the .MSfac 76px CSS circle (games/mosaic.js:70) that is the tile-drafting pool. |
| `floor-strip-9slice.png` | 300x80 transparent 9-slice, cracked terracotta and swept debris, muted | Replaces the maroon .MSfloor band so the penalty row reads as a floor you dropped tiles on, rather than as the loudest red rectangle on screen. |

_5 files._

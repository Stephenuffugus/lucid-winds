# JADE GARDEN art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/mahjong/` under the names below; say which landed and the code side wires them.

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

**Game:** `mahjong` · satellite · board · audit impact 3/5 · effort S · audit rank 177

## Background wanted

Keep it. What is missing is a tray: a painted mat under the board so the tiles rest on something instead of floating on the room photo, plus a bamboo table skin so the level named Bamboo Grove does not get the generic table.

## Files

| file | spec | replaces |
|---|---|---|
| `assets/chrome/tray-mat-360x560.png` | 360x560, transparent PNG, painted felt/moss mat with a soft gold rim and feathered outer edge, safe to stretch vertically | Replaces the board floating directly on bg-table.jpg. Gives the tile grid a surface and turns the current hard board/backdrop edge into a transition. |
| `assets/chrome/hud-plate-375x56.png` | 375x56, transparent PNG, dark inked band, opaque at the top edge feathering to zero at the bottom, full-bleed horizontally | Sits behind .pbar so the timer, 'Bamboo Grove' and the pairs count stop competing with the lit glass roof in the photo. |
| `assets/chrome/bg-table-bamboo.jpg` | 540x960 JPG, full-bleed, night bamboo grove seen past a dark table edge, warm lantern glow top-centre, deep near-black lower third so tiles read | The Bamboo Grove layout currently renders on the generic bg-table.jpg while glass/moss/nightbloom/oak skins exist. Named level with no matching table. |

_3 files._

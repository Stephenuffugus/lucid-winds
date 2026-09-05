# SHUT THE BOX art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/doubleshutter/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-doubleshutter` · native · dice · audit impact 5/5 · effort M · audit rank 2

## Background wanted

A full-bleed dark walnut tabletop lit from the upper left, warm gold rim on the near edge, vignetted to near-black at the corners. This is a pub/parlour dice game and it currently has no table at all.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-shutbox-750x1334.jpg` | 750x1334 full-bleed, dark walnut tabletop under a single warm lamp from upper-left, grain visible in the lit third, vignetted to near-black at all four edges | Replaces the shared radial gradient. Gives the box somewhere to sit instead of floating on flat black. |
| `shutbox-frame-702x440.png` | 702x440 transparent PNG, the open hinged box body: two routed channels sized for 9 tiles each, brass hinge pins at the corners, worn edge highlights, interior in shadow | Sits behind the two .ds-row grids so the tiles read as tiles in a box. Replaces nothing (there is no frame today). |
| `shutbox-tile-covered-96x96.png` | 96x96 transparent PNG, a face-down tile: dark wood in shadow, single brass pin, faint top-edge highlight | Replaces the CSS diagonal-hatch slab used for covered BACK tiles, which currently reads as a missing image. |
| `new-game-btn-256x256.png` | 256x256 transparent PNG, reissue of the existing carved plaque at button resolution | assets/games/new-game-btn.png is 3,386,974 bytes (3.4MB) for a button that renders at about 90px, and six inline games load it. |

_4 files._

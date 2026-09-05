# STONE GARDEN art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/stonegarden/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-stonegarden` · native · creative · audit impact 5/5 · effort M · audit rank 17

## Background wanted

A moonlit zen garden painted as a real scene: raked sand receding toward a dark treeline, a genuine moon disc with a halo in the upper right, one warm paper-lantern point low on the left to break the monochrome, and a mist band where the sand meets the trees. The whole centre of the frame is currently empty black, which is the single largest wasted surface in this batch.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-stonegarden-750x1600.jpg` | 750x1600 full-bleed (taller than the viewport so it can parallax as the camera rises), moonlit zen garden - raked sand foreground, dark treeline midground, real moon disc plus halo upper right, one warm lantern point lower left, mist transition where sand meets trees | replaces the three-stop #0f1410 sky gradient and the formless radial-gradient moon; fills a play area that is currently pure black |
| `stones-stonegarden-1024x512.png` | 1024x512 sprite sheet, 10 painted river stones on transparent, each with a warm-lit top edge, a cool shadow side and visible mineral grain; deliberately distinct silhouettes - flat slab, tall wedge, boulder, disc, hex, teardrop | replaces drawStoneBody's two-stop createLinearGradient polygon; the stones are the game and right now they are flat grey blobs, four of them sharing one silhouette |
| `moon-stonegarden-256x256.png` | 256x256 transparent PNG, a cream moon disc with faint maria and a soft two-stage halo | the current moon is a bare radial gradient at 0.18 alpha with no disc and reads as a smudge |
| `rail-stonegarden-96x1334.png` | 96x1334 transparent PNG, a painted stone shelf or bamboo rail with a lit top edge, mirrorable for the right side | replaces drawTrayZone's rgba(16,20,12) gradient column, which currently reads as a slightly darker patch of the same black rather than a tray the stones sit in |

_4 files._

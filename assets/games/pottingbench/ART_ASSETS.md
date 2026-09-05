# SPEED SORT art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/pottingbench/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-pottingbench` · native · pattern · audit impact 4/5 · effort M · audit rank 54

## Background wanted

bg-pottingbench-540x960.jpg - a painted potting-bench top. The game is literally named for a bench and there is no bench anywhere on screen. Horizontal weathered planks, a terracotta pot, a coil of twine and scattered soil in the lower third (which fills the 130px dead band), warm lamp light from top-right, near-black in the upper third so the big clock numeral stays readable.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-pottingbench-540x960.jpg` | 540x960, full-bleed JPG. Painted potting-bench top: weathered horizontal planks, a terracotta pot, a coil of twine and a scatter of soil in the lower third, warm rim light from top-right, upper third kept near-black. | Replaces the shared radial gradient and puts something in the 130px empty band under New Game. Delivers the bench the game is named after. |
| `card-face-100x140.png` | 100x140, transparent PNG. A painted seed-packet card face: aged paper, a stitched or torn edge, a soft drop shadow, blank centre so the existing clover/pot/droplet SVG shapes draw on top of it. | Replaces the bare rounded div with a 2px sage border at games/pottingbench.js:216-217. The card shapes are already real inline SVG in the house palette - they just have nothing to sit on. |
| `pile-slot-120x170.png` | 120x170, transparent PNG. An empty painted card slot recessed into the bench: inner shadow, a shallow lip, faint soil dust in the corner. | Replaces border:2px solid rgba(122,179,86,0.3) on PILE A and PILE B so the piles sit in the bench instead of floating on black. |
| `start-plate-340x96.png` | 340x96, transparent PNG. A painted brass-and-wood START plate with a warm rim light, a stamped label and a cast shadow; plus a 340x96 pressed variant. | Replaces the linear-gradient slab at games/pottingbench.js:184, which is currently the only lit object on the screen and reads as an unstyled default. |

_4 files._

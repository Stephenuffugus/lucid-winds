# REVERSI art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/reversi/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-reversi` · native · board · audit impact 4/5 · effort S · audit rank 70

## Background wanted

bg-reversi-540x960.jpg - a painted night garden table: a dark stone slab with moss creeping in from the corners and a warm lantern glow from top-right, the board recessed into it. Reversi shares Chess's exact shape and Chess is the fleet's 'strong' example precisely because it has a painted board and a frame.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-reversi-540x960.jpg` | 540x960, full-bleed JPG. Painted night garden table: dark stone slab, moss in the corners, a warm lantern glow from top-right, deep values so light stones stay the brightest thing in frame. | Replaces the shared radial gradient. Gives the board a table to sit on instead of floating in the same black as the buttons. |
| `board-frame-reversi-460x460.png` | 460x460, transparent PNG with a transparent 8x8 well in the centre and a 30px carved stone-and-vine border, soft inner shadow on the well lip, warm rim light top-right. | Replaces .rvb{border:3px solid rgba(74,124,53,.25)} at shared.css:2451. The board currently meets the page through a hard 3px line with no transition - this is the 'every surface meets another through a transition' fault. |
| `disc-moss-96x96.png` | 96x96, transparent PNG. Painted moss stone: wet rim light, a real leaf blade with visible venation, a soft ground shadow. House sage palette. | Replaces SVG_MOSS at games/_inline/reversi.js:36, which is five concentric flat circles plus a lens shape and reads as clip art at its rendered 40px. |
| `disc-lichen-96x96.png` | 96x96, transparent PNG. Painted lichen stone: crusted gold plates, a bone-white rosette, a soft ground shadow. House gold palette. | Replaces SVG_LICHEN at games/_inline/reversi.js:37, the gold twin of the same clip-art problem, so the two sides read as objects rather than icons. |
| `assets/games/new-game-btn.png` | RESIZE, not a repaint. Currently 1529x1529 and 3.35MB, displayed at clamp(120px,35vw,180px) = about 131px. Re-export at 360x360, target under 45KB. | A 3.35MB PNG shipped to render 131px wide is a 25x oversize on the single heaviest asset in the game, and it is loaded by every native that uses .gb-new. |

_5 files._

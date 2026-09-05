# SNAKES & LADDERS art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/snakes-ladders/` under the names below; say which landed and the code side wires them.

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

**Game:** `snakes-ladders` · satellite · board · audit impact 4/5 · effort M · audit rank 116

## Background wanted

A painted tabletop, 540x960: dark oak boards running horizontally with warm rim light picking out the grain, going near-black at the top and bottom edges so the HUD and the player cards stay legible, and a soft warm lamp pool centred behind the board. The board itself then gets a carved wooden frame plate so it meets the table through a transition instead of a hard cut.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-table-540x960.jpg` | 540x960 full-bleed JPG. Dark oak tabletop, horizontal grain, warm lamp pool centred at y~330, corners falling to near-black. | Replaces the canvas gradient fill at index.html:342. Gives the die and the player cards a surface instead of a black void. |
| `board-frame-500x500.png` | 500x500 PNG, transparent centre. A carved sage-and-gold wooden rim about 22px thick with mitred corners, a Celtic corner knot at each corner, and an inner drop shadow onto the play squares. | Kills the hard rectangular edge where the green board meets black. Ties the game to the house card border language. |
| `snake-body-tiles-256x64.png` | 256x64 PNG strip, transparent: head, three body segments, tail, painted with a sage-green back, cream belly scales, warm rim light along the top of the coil. | Replaces the flat tan `#8a5a30` stroke bodies. Painted scales read as snakes, not worms, and separate them from the brown ladders they currently tangle with. |
| `ladder-wood-64x256.png` | 64x256 PNG, transparent, 9-slice friendly. Two warm oak rails with visible grain, rungs with a lit top face and a shadowed underside. | Replaces `strokeStyle='#8a5a30'; lineWidth:2.8` sticks. Gives the ladders a lit face so they sit visibly ABOVE the snakes. |
| `die-face-128x128.png` | Six 128x128 PNGs (die-1 through die-6), transparent. Bone-cream die with a warm gold pip inset, soft top-left key light, rounded corners. | Replaces the two-stop gradient rounded rect at index.html:472. The roll is the whole game beat and it currently looks like a placeholder. |

_5 files._

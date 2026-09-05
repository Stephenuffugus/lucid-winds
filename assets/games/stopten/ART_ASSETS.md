# STOP AT TEN art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/stopten/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-stopten` · native · pattern · audit impact 4/5 · effort M · audit rank 119

## Background wanted

A painted potting-shed interior behind the frame so the panel sits in a room rather than a void: dark boards, a warm lamp pool falling from the upper left, a shelf line low in the frame, all darkened enough that the gold border and the clock still read on top.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-stopten-shed-750x1000.jpg` | 750x1000 full-bleed, painted potting shed: dark vertical boards, a warm lamp pool top-left, a shelf edge across the lower third with two silhouetted pots, overall value kept low | Fills the empty ground the .st-frame currently floats in, and gives the gold frame a reason to be a frame |
| `buddy-stopten-idle-148x148.png (plus -focused, -happy, -sad)` | 148x148 transparent each (2x for the 74px slot), painted seed-sprout character: warm rim light from upper left, two real veined leaves, four expressions matching the existing states | This is the exact file games/stopten.js:89 already names and nobody has painted; it replaces the flat inline SVG that currently reads as clip art |
| `frame-corner-leaf-64x64.png` | 64x64 transparent, a painted gold leaf-and-tendril corner ornament, designed to mirror into all four corners | Replaces the four 14px radial-gradient dots (.st-corner) that currently read as smudges |

_3 files._

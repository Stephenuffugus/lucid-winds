# TIMES TABLE QUEST art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/multiplication-chart/` under the names below; say which landed and the code side wires them.

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

**Game:** `multiplication-chart` · satellite · math · audit impact 3/5 · effort M · audit rank 146

## Background wanted

bg-slate-540x960.jpg - a painted chalkboard/desk: dark green-black slate with faint chalk grain, a warm lamp fall-off from the top-left, a wooden frame edge, so the chart sits on a surface instead of floating on void.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-slate-540x960.jpg` | 540x960 full-bleed painted chalkboard with a worn wooden frame edge and a warm lamp wash from the top-left, centre kept near-black so cell colours still pop | replaces the flat radial gradient; gives the grid a surface and stops the board floating in void |
| `chalk-frame-540x420.png` | 540x420 transparent, hand-drawn chalk double rule with soft corner flourishes sized to wrap the 12x12 grid | gives the board an edge instead of the current hard cut between coloured cells and black background |
| `tile-tex-64x64.png` | 64x64 seamless faint paper/chalk tooth, greyscale, to multiply over the cells at about 8% opacity | kills the flat vector-swatch look without changing any of the hues or the readability |
| `badge-perfect-200x200.png` | 200x200 transparent gold laurel-and-star stamp with a soft glow | the Perfect round bonus is currently the bold word "Perfect" and nothing else |

_4 files._

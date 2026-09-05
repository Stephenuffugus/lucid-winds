# IMPOSSIBLE GARDEN art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/impossible-garden/` under the names below; say which landed and the code side wires them.

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

**Game:** `impossible-garden` · satellite · puzzle · audit impact 5/5 · effort L · audit rank 11

## Background wanted

One painted 540x960 night-garden backdrop with an impossible-geometry read — hedge arches that do not quite meet, a stair that returns to itself, deep near-black with sage and a single warm lantern. It needs to be a real image because the game currently has no visual identity at all beyond an indigo ramp, and the maze itself is thin vector line-work that would sit well on a painted ground.

## Files

| file | spec | replaces |
|---|---|---|
| `satellites/impossible-garden/assets/bg-garden-540x960.jpg` | 540x960 full-bleed. Night hedge garden under a low moon, arches that fold back on themselves, path stones fading into the dark, deep near-black ground, sage foliage, one warm gold lantern glow. Bottom 40% deliberately quiet so menu slabs read on it. | Replaces the flat indigo linear-gradient on #stage and .screen, which is the entire visual identity of the game today. |
| `satellites/impossible-garden/assets/title-hero-540x420.png` | 540x420 transparent, sits behind the wordmark: a single impossible arch in silhouette with a wanderer figure at its base, warm rim light from the right. | Fills the empty space between the title block and the button stack on boot, where there is currently nothing at all. |
| `satellites/impossible-garden/assets/garden-thumb-1-184x184.png` | 184x184 each, eight files (garden-thumb-1 through -8). A small painted vignette of that garden's signature shape — a spiral, a bridge, a knot, a stair — near-black ground, sage line, gold node. | Gives .lvlcard something other than a numeral so eight tiles in one frame stop sharing a silhouette, and fills the picker's empty lower half by letting the grid breathe wider. |
| `satellites/impossible-garden/assets/node-bloom-64x64.png` | 64x64 transparent, the goal bloom, painted rather than the current ellipse-petals-plus-#ffe9a8-dot that game code draws at index.html:407. | The goal is the one thing the player looks for and it is currently six vector ellipses; a painted bloom gives the puzzle a focal point. |

_4 files._

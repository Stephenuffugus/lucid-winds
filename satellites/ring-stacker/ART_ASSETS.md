# SUNFORGE art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/ring-stacker/` under the names below; say which landed and the code side wires them.

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

**Game:** `ring-stacker` · satellite · puzzle · audit impact 4/5 · effort M · audit rank 43

## Background wanted

bg-gyre-540x960.jpg - a painted night sky for the forge: deep near-black at the top thinning into a warm gold horizon glow at the bottom, a slow scatter of stars, and the suggestion of a molten ring low in frame. It would fill the two empty bands (top quarter and the 140px mid-gap) that make the menu read unfinished.

## Files

| file | spec | replaces |
|---|---|---|
| `sunforge-core-256x256.png` | 256x256 transparent, a molten gold core with a corona and heat shimmer, premultiplied soft edge so it can be drawn additively | replaces the flat ctx.createRadialGradient halo at index.html:745 that is currently the entire visual identity of the golden core the whole game is about |
| `forge-pieces-512x512.png` | 512x512 transparent, 16 cells of 64x64: forged segments in brass, iron and obsidian, each with a warm rim light on one edge and a cool one on the other so rotation reads | the falling pieces are flat filled rectangles; painted segments would make a landed tower look welded instead of stacked |
| `sunforge-wordmark-420x120.png` | 420x120 transparent, painted SUNFORGE lettering: hammered gold with a teal-to-rose heat gradient running through it and a faint ember glow | replaces the CSS background-clip:text gradient at index.html:50, which is the only decorative element on the whole title screen |
| `bg-gyre-540x960.jpg` | 540x960 full-bleed as in background_want, deep #0e1018 ground | fills the empty top quarter and the 140px dead band in the middle of the menu |

_4 files._

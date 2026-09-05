# MOON CLAW art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/moon-claw/` under the names below; say which landed and the code side wires them.

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

**Game:** `moon-claw` · satellite · action · audit impact 3/5 · effort M · audit rank 137

## Background wanted

bg-arcade-540x960.jpg - a painted night arcade room behind the cabinet: dark patterned carpet with a lit floor strip, a second cabinet blurred at the frame edge, warm neon spill up the back wall, so the cabinet is standing somewhere instead of on black.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-arcade-540x960.jpg` | 540x960 full-bleed painted night arcade interior, dark carpet, blurred second cabinet at the edge, warm neon wash on the back wall, vignette to near-black at the corners | replaces the flat .screen.solid gradient so the menu and how-to screens are a place, not a black page |
| `plush-sheet-512x512.png` | 512x512 transparent sheet, 16 painted plushies at 128x128 (frog, owl, moth, moon, koi, toad, mushroom, bee, snail, fox kit, acorn, star, and 4 variants), each with a soft warm rim light from the top-left and stitched-seam detail | replaces the flat vector prizes drawn from line 1560 on, and gives enough distinct silhouettes to kill the repeated-frog pile |
| `cabinet-frame-420x560.png` | 420x560 transparent, painted cabinet chrome and wood frame with a lit marquee, glass reflection streaks baked into the upper third, hollow centre | replaces the drawn rects at index.html:1314-1370 and fills the empty upper half of the glass with reflection instead of flat navy |
| `prize-chute-160x220.png` | 160x220 transparent, a dark chute mouth with a rubber flap, a scuffed metal lip and a warm interior glow | replaces the plain black rectangle that currently meets the cabinet floor at a hard edge |
| `claw-96x96.png` | 96x96 transparent, painted brass claw, three jaws, warm specular on the inner curve, faint wear on the tips | gives the one object the whole game is named after some weight; it is currently a gold stroke |

_5 files._

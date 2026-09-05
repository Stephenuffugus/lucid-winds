# TEMPO GROVE art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/tempo-grove/` under the names below; say which landed and the code side wires them.

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

**Game:** `tempo-grove` · satellite · action · audit impact 4/5 · effort M · audit rank 37

## Background wanted

A painted night grove behind and below the board: near-black canopy across the top, a soft sage mist band behind the playfield, and a low garden bed of leaves and pale blossoms filling the 170px of dead canvas between the board and the dock. That dead band is where the garden border and the petals fiction already live in the copy, so paint the thing the game keeps talking about.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-grove-540x784.jpg` | 540x784 full-bleed, painted night grove: near-black canopy top third, soft sage mist band mid, a low bed of leaves and pale blossoms across the bottom 200px, warm gold fireflies, everything dark enough to sit behind a bright board | Replaces the radial-gradient plus the flat #0b0f0b fillRect, and fills the ~170px of empty black between the board frame and the dock that currently holds only a floating ladybug fab |
| `tile-sun-60x60.png` | 60x60 transparent PNG (2x of the 30px CELL), painted warm gold seed pod with a lit dome, a soft cast shadow at the lower right and a cream rim on the upper left | Replaces drawCellPx's flat fillRect plus an 11px ctx.arc dot, which is the entire art of the Sun piece |
| `tile-moon-60x60.png` | 60x60 transparent PNG, painted indigo hollow bud with a cool rim highlight and an open centre so it reads as the inverse of the Sun tile at a glance | Replaces the flat indigo rect with a stroked diamond outline; Sun and Moon currently differ only by one small glyph and share a silhouette |
| `sweepline-glow-120x784.png` | 120x784 transparent PNG, a painted vertical light shaft: hot cream core, warm gold bloom, wide soft falloff to nothing at both edges, meant to be drawn with globalCompositeOperation lighter | Replaces the ctx.fillRect trail plus two stroked lines at 646-655; the sweepline is the best moment in the game and is currently a plain gold bar |
| `petal-16x16.png (4 colour variants: rose, cream, gold, sage)` | 16x16 transparent PNGs, single painted petals with a soft edge and a faint inner vein, four hue variants for the garden border | Replaces ctx.arc(pos.x,pos.y,1.6,...) at line 623: the border petals are 1.6px radius dots that scale to about 1.1 real px and are effectively invisible on a phone |
| `next-tray-300x160.png` | 300x160 transparent PNG, a shallow painted wood-and-leaf tray with a warm inner shadow, sized to sit under the three NEXT preview pieces | The NEXT pieces are the only elements on screen with no frame; they float on bare black next to a fully framed board |

_6 files._

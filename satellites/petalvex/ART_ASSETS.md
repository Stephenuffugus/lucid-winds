# ORIVEX art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/petalvex/` under the names below; say which landed and the code side wires them.

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

**Game:** `petalvex` · satellite · puzzle · audit impact 3/5 · effort M · audit rank 148

## Background wanted

Keep the painted themes, they are the best art in this batch. What is missing is a painted SURFACE for the bed to sit on: right now the empty bed sits directly on the theme's empty sky. Add a bed plate drawn under the slots, and add more themes in the bg_theme_2 midnight register so the pale winter/day themes stop dominating the roll.

## Files

| file | spec | replaces |
|---|---|---|
| `bed-plate-720x720.png` | 720x720, transparent outside the square. A painted linen or paper quilt square with a stitched border and faint cell divisions painted in; warm neutral, slightly darker than the theme sky. | Replaces the rgba(18,22,14,0.26) slot wash. Turns the empty 355px bed from a flat hole in the sky into a fabric bed the tiles get laid onto. |
| `bg_theme_8.jpg through bg_theme_11.jpg` | 540x960 each, four files, full-bleed. Paper-cut night scenes in the register of the existing bg_theme_2: deep navy paper ground, gold paper lanterns, sage paper leaves along the bottom, a cream paper moon, a few star flecks. | Four of the eight live themes are pale daylight scenes that fight the midnight greenhouse palette and wash out the pastel tiles. Doubling the midnight themes halves how often a cold pale one rolls. |
| `tray-shelf-750x210.png` | 750x210, full-bleed, transparent above the shelf line. A painted wooden or folded-paper ledge with a soft cast shadow under its front lip. | The tray tiles currently float on the snow bank with only a 9px grey 'TRAY' label to explain them. A ledge gives the tiles somewhere to sit and separates tray from board. |

_3 files._

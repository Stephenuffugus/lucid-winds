# BLOOM BREAKER art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/bloom-breaker/` under the names below; say which landed and the code side wires them.

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

**Game:** `bloom-breaker` · satellite · action · audit impact 4/5 · effort M · audit rank 26

## Background wanted

bg-bramble-540x960.jpg - a painted midnight bramble wall receding into fog: thorny arches across the top where the brick rows sit, a warm lantern low on the left, mossy floor behind the paddle. Dark enough (under 15% luminance) that the white ball stays the brightest thing on screen.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-bramble-540x960.jpg` | 540x960 full-bleed, midnight bramble wall into fog, thorn arches top, warm lantern lower-left, mossy floor band at the bottom, all under 15% luminance | replaces the empty near-black canvas fill; fills the dead 70% of the frame and gives the game its own identity instead of generic breakout |
| `brick-bramble-64x28.png, brick-bud-64x28.png, brick-stone-64x28.png` | 64x28 transparent PNG each, painterly, warm rim light from upper left, two-hit and one-hit variants as separate files (brick-bramble-cracked-64x28.png) | replaces the flat roundRect fills so bricks read as woven bramble and buds; also fixes the paddle/brick/chip silhouette collision |
| `paddle-leaf-120x22.png` | 120x22 transparent PNG, a curled sage leaf with a gold midrib, 9-slice safe (16px caps) so it can stretch when the paddle grows | replaces the plain green capsule; the paddle is the object the player watches for the whole run and it currently has no art at all |
| `powerups-sheet-16x-64x64.png` | one 1024x64 strip, sixteen 64x64 transparent cells, painterly icons for magnet, shield, multiball, slow, fire, laser, boomerang, heart, bomb, bloom | replaces the 16 system emoji currently drawn as powerup faces, which render as a different typeface on every device and clash with the flat rects |

_4 files._

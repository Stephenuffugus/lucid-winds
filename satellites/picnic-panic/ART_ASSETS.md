# PICNIC PANIC art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/picnic-panic/` under the names below; say which landed and the code side wires them.

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

**Game:** `picnic-panic` · satellite · action · audit impact 4/5 · effort M · audit rank 114

## Background wanted

bg-picnic-lawn-540x960.jpg - painted night lawn seen from above: mown grass bands receding upward into a warm lantern glow, a corner of the checked blanket and a wicker basket bleeding in at the bottom edge, fireflies as depth. Full-bleed, keeps the gingham frame around it, gives the swarm somewhere to descend into.

## Files

| file | spec | replaces |
|---|---|---|
| `picnic-swarm-sheet-512x512.png` | 512x512 transparent, 8 cells of 64x64 (fly, ant, mosquito, beetle, ladybug, wasp, butterfly, cricket) painted as one family: same warm gold rim light, same 3px cream outline, same top-down 3/4 angle | replaces the 12 mismatched system emoji in the TYPES map (index.html:551-562) so the swarm reads as one enemy set instead of twelve clip-art strangers |
| `snapdragon-hero-96x96.png` | 96x96 transparent, 3 frames (idle, lean-left, lean-right) of a terracotta pot with a snapdragon, warm gold rim light, big readable silhouette | replaces the 18px tulip emoji player at index.html:1292 - the hero is currently smaller and dimmer than the enemies |
| `bg-picnic-lawn-540x960.jpg` | 540x960 full-bleed painted lawn as described in background_want, deep #14281c ground | replaces the two-stop flat green gradient on #stage; gives the field a horizon so the descent has depth |
| `picnic-powerup-icons-320x64.png` | 320x64 transparent, 10 cells of 32x32: painted seed pods, thorn, spore cap, honey drop, blossom, hourglass, ward sigil | replaces the 10 food-and-plant emoji drawn at 18px serif in index.html:1321 (acorn, chilli, cactus, mushroom, honey pot, target, hourglass) which currently read as a snack menu, not as weapons |

_4 files._

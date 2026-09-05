# SEED POT art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/seed-pot/` under the names below; say which landed and the code side wires them.

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

**Game:** `seed-pot` · satellite · puzzle · audit impact 3/5 · effort M · audit rank 174

## Background wanted

None needed. bg_autumn.jpg is already painted, warm and correctly vignetted, and the lamp motivates the light on the pot. Everything wrong here is compositional, not a missing background.

## Files

| file | spec | replaces |
|---|---|---|
| `assets/pot/pot_classic_front-560x300.png` | 560x300 transparent PNG, the lower front lip and belly of the classic pot painted as a separate overlay layer, same lighting as the existing pot sprite, soft feathered top edge | Drawn AFTER the fruits, it tucks the bottom of the pile behind clay so contents read as inside the vessel. Fixes the worst fault without touching the physics constants. |
| `assets/ui/next_panel-190x96.png` | 190x96 transparent PNG, painted wooden NEXT plate with two inset gold sockets, sized so it fits inside the 540-wide canvas with 16px of margin | Replaces the current panel whose right socket ring is cut by the canvas edge. |
| `assets/ui/fab_plate-96x96.png` | 96x96 transparent PNG, a small painted wooden disc with a warm rim light and a soft drop shadow | Gives the ladybug fab and the Music chip a surface so they stop floating on painted clay. |

_3 files._

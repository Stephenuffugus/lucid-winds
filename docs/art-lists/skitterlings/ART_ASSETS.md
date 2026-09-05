# SKITTERLINGS art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`docs/art-lists/skitterlings/` under the names below; say which landed and the code side wires them.

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

**Game:** `skitterlings` · satellite · action · audit impact 4/5 · effort S · audit rank 73

## Background wanted

Keep the procedural worlds, they are the game's best asset. What is missing is the menu and the game-over screen: both should show the CURRENT world's sky live behind a much lighter scrim, so the 'Reached Dewspring Morning' line has the actual Dewspring dawn behind it instead of black.

## Files

| file | spec | replaces |
|---|---|---|
| `menu-hero-750x420.jpg` | 750x420 JPG, full-bleed. A skitterling mid-leap in silhouette against a Dewspring dawn sky - warm peach sky0 to cream sky1, hill parallax, one glimmer spark ahead of it, bottom edge fading to the menu navy #141a2e. | Replaces the empty band at the top of the menu that the clipped story text and rotate pill currently fight over. Gives the title screen a picture. |
| `fav-slot-empty-96x96.png` | 96x96 PNG, transparent. A soft dashed sage ring with a faint sleeping skitterling curl inside at 25% opacity. | Replaces the bare star textContent in `#favBar`. Turns three grey holes into three 'not yet found' invitations. |
| `creature-shadow-220x50.png` | 220x50 PNG, transparent. A soft elliptical contact shadow, warm-black, feathered. | The RUN OVER creature has no shadow and floats. One plate fixes every creature on that screen. |

_3 files._

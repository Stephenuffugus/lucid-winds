# SPORE DRIFT art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/spore-drift/` under the names below; say which landed and the code side wires them.

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

**Game:** `spore-drift` · satellite · action · audit impact 3/5 · effort S · audit rank 142

## Background wanted

None needed - abyss.jpg is already the strongest background in this batch and the wardrobe swap is wired. What is missing is a near plane: one drifting foreground silhouette layer for parallax depth.

## Files

| file | spec | replaces |
|---|---|---|
| `fg-kelp-fronds-540x300.png` | 540x300 transparent, near-plane kelp silhouettes in near-black with a faint teal edge, tileable horizontally | Adds a foreground plane so the scene has near, mid and far instead of sprites floating on one flat backdrop. |
| `spore-predator-96x96.png` | 96x96 transparent, a barbed non-spherical hostile in rose and deep red, warm rim light, distinctly not a ball | Bigger-than-you currently has to be read from radius alone. A different silhouette makes the core rule legible at a glance. |
| `mote-warm-64x64.png` | 64x64 transparent, a warm gold food mote with a soft halo, matching the existing motes sheet slicing | The two food classes currently differ only by scale; hue separation lets a player triage without measuring. |
| `hud-spore-mass-32x32.png` | 32x32 transparent, a small spore glyph in sage with a gold rim | Lets the SPORE MASS label shrink to an icon plus a number so the music chip stops fighting the word. |

_4 files._

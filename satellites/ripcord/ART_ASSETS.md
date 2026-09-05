# RIPCORD art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/ripcord/` under the names below; say which landed and the code side wires them.

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

**Game:** `ripcord` · satellite · action · audit impact 3/5 · effort M · audit rank 167

## Background wanted

bg-arena-surround-540x960.jpg — the room the dish sits in, so the empty bands above and below the arena become a place instead of a black margin.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-arena-surround-540x960.jpg` | 540x960 full-bleed. A dim workshop floor around the dish: worn boards, a coil of rope, a chalk box, two hanging lamps throwing warm gold pools into the top 150px and bottom 180px of the frame, everything at least 3 stops darker than the arena. | Replaces the flat --lo void behind #stage. Fills the two dead bands that currently top and tail every gameplay frame. |
| `ui-shout-plate-360x96.png` | 360x96 transparent PNG. A torn chalk-dust banner, soft feathered edges, slightly warmer than the dirt, sitting about 55% opaque in the middle and fading to nothing at the ends. | Goes under 'YOU BURST +2' and the other result shouts so they stop sitting unshaded on the arena texture. |
| `hud-score-plate-375x110.png` | 375x110 transparent PNG. A slate-and-brass scorebar: two dark score wells left, a thin brass rule, a worn label strip right for the rung counter. | Gives the '0 0 / FIRST TO FOUR / rung 1 of 25, balance' header something to sit on, so the top void reads as arena furniture rather than an unfilled margin. |
| `env-3d-floor-1024x1024.jpg` | 1024x1024 tileable dark boards, warm brown, low-frequency grain, plus a separate 2048x512 horizon gradient card (near-black at the top fading to #1a1310). | The LAUNCH 3D scene's far plane is the same value as the dish's shadow, so a chrome bowl floats in nothing. A floor and a horizon card also give the chrome something warm to reflect. |

_4 files._

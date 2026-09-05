# TINKER LOFT art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/tinker-loft/` under the names below; say which landed and the code side wires them.

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

**Game:** `tinker-loft` · satellite · puzzle · audit impact 4/5 · effort M · audit rank 50

## Background wanted

bg-loft-540x960.jpg - a painted attic loft interior sized to the game's own 540x960 stage: rafters overhead, a dusty window top-left throwing the warm key light the vignette is currently faking, a workbench edge and floorboards at the bottom, corners falling to near-black so the canvas pieces stay the brightest thing. Same wood/brass/cream palette the CSS vars already declare.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-loft-540x960.jpg` | 540x960 JPG (the exact stage size), painted attic interior, rafters + dusty window top-left, workbench and floorboards low, near-black corners, wood #8a5a2e and brass #c8a84b palette | Replaces the flat #171009 stage fill so both the help wall and the machine behind it sit in a room instead of on a brown void. |
| `parts-sheet-512x512.png` | 512x512 transparent PNG, 4x4 grid of 128px painted part icons (plank, domino, fan, balloon, funnel, seesaw, scissors, marble, spike, basket, bell, bucket, saw, string), warm brass-and-wood rim light, silhouettes matching the canvas renderers | Gives the tray real icons and lets the HOW TO TINKER wall show each part beside the sentence that names it, instead of nine gold bold words. |
| `marble-128x128.png` | 128x128 transparent PNG, painted glass marble with a warm specular highlight, a coloured core and a soft contact shadow | The marble is the protagonist of every level and is currently a canvas arc(); a painted one gives the eye something to follow during a run. |
| `goal-home-256x256.png` | 256x256 transparent PNG, painted brass cup or woven basket 'home' with a warm inner glow, soft ground shadow | Makes the goal readable at a glance instead of another canvas primitive of the same brass colour as everything else. |

_4 files._

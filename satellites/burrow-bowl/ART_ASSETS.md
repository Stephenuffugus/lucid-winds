# BURROW BOWL art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/burrow-bowl/` under the names below; say which landed and the code side wires them.

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

**Game:** `burrow-bowl` · satellite · action · audit impact 4/5 · effort M · audit rank 35

## Background wanted

bg-burrow-lane-540x960.jpg - a moonlit clearing floor in perspective: packed earth and short cropped grass running away from the player, two real burrow mouths with rimmed soil and dark throats, a low warm lantern off to one side, a hedge line closing the horizon so it is not empty. Dark enough that gold rings sit legibly on top.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-burrow-lane-540x960.jpg` | 540x960 full-bleed, moonlit clearing in perspective, packed earth + cropped grass, hedge line closing the horizon at the top third, warm lantern spill from the left, everything under 18% luminance | replaces the flat navy canvas fill; fixes the dead empty top third and gives the rings a surface to be painted on instead of floating in colour |
| `burrow-mouth-160x110.png` | 160x110 transparent PNG, a real burrow entrance: rimmed loose soil, grass tufts on the upper lip, a dark throat with a hint of depth, warm rim light from the left | replaces the black ellipse with a gold stroke that currently stands in for the two 100 burrows - the game's two highest-value targets have no art |
| `ring-plate-420x300.png` | 420x300 transparent, the five concentric scoring rings painted as worn brass inlay set into earth, with the value numerals engraved into clear gaps in each band | replaces the stroked ellipses and fixes the labels-on-strokes collision by baking the numbers into gaps in the rings |
| `dewball-48x48.png` | 48x48 transparent, a glowing dew sphere with a bright specular and a soft blue-green inner glow, plus dewball-trail-32x32.png | the ball the player flicks nine times a round is currently a plain filled circle |

_4 files._

# BLOOMING WORDS art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/blooming-words/` under the names below; say which landed and the code side wires them.

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

**Game:** `blooming-words` · satellite · word · audit impact 3/5 · effort M · audit rank 152

## Background wanted

A cyanotype pressed-plant plate. The og:image:alt already calls this 'a cyanotype word game with a five-petal bloom and ferns' - the game should look like an actual sun-print: paper grain, uneven exposure at the edges, ghosted fronds laid across the sheet.

## Files

| file | spec | replaces |
|---|---|---|
| `assets/bg-cyanotype-750x1334.jpg` | 750x1334 full-bleed. Cyanotype sun-print: prussian ground #0d3350 falling to #04121e, visible cold-press paper grain, brush-edge exposure falloff at all four borders, three ghosted fern fronds laid diagonally (upper-right, lower-left, one crossing centre) at 12-18% white. No hard edges - the plate should feel bled onto paper. | Replaces the flat two-stop radial and the near-invisible .fern SVG. Fills the empty band above the board and makes the ground read as pressed paper instead of a gradient. |
| `assets/blooms-512x512.png` | 512x512 transparent PNG, 4x4 grid of 128px cells: sixteen pressed wildflowers in cyanotype white (chicory, yarrow, forget-me-not, tulip, poppy, fern tip, clover and so on), each with visible pressed-flat veining and a slight ink halo. | The whole reward loop is 'pressed 0/10 flowers' and a planted word currently produces a gold cell border plus a 9x13px CSS rectangle .petal. One sheet turns the payoff into actual specimens. |
| `assets/pebble-128x128.png` | 128x128 transparent PNG. A wet river pebble, pale mint-white, warm rim light upper-left, soft shadow lower-right, slight surface mottling. Letter drawn on top in the existing serif, not baked in. | Replaces .disc's radial-gradient plus triple inset box-shadow. The five discs are the only thing the thumb touches; a painted stone is the cheapest way to make the game look handmade. |

_3 files._

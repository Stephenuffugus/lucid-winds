# MINI CROSSWORD art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/mini-crossword/` under the names below; say which landed and the code side wires them.

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

**Game:** `mini-crossword` · satellite · word · audit impact 4/5 · effort M · audit rank 75

## Background wanted

A painted desk-at-night scene. This is a paper game with a paper metaphor already in the code (papers are called Newsprint / Graph / Parchment) and nothing on screen is paper. A desk plus a paper card under the grid would do more here than anywhere else in the batch.

## Files

| file | spec | replaces |
|---|---|---|
| `assets/games/mini-crossword/bg-desk-540x960.jpg` | 540x960 JPG, full-bleed, dark oak desk at night seen from above-front, one warm lamp pool in the upper third, a pencil and a sprig of rosemary resting at the lower edge, deep near-black at the bottom so the keyboard reads | Replaces the flat radial gradient. Gives the puzzle a place to sit and stops the grid from floating in undifferentiated black. |
| `assets/games/mini-crossword/paper-newsprint-560x560.png` | 560x560 transparent PNG, painted paper card with softly torn edges, faint fibre texture, warm cream-grey, slight lift shadow baked in | Drawn under the canvas grid so the 5x5 reads as paper on a desk and the blocked squares have something to be black against. Three more variants (graph, parchment, midnight) already have colour entries in PAPERS and would become real skins. |
| `assets/games/mini-crossword/key-cap-56x72.png` | 56x72 transparent PNG, painted keycap with a warm top bevel and a soft bottom lip, 9-sliceable centre | Replaces the 30 flat #211a3a rectangles that currently make up the whole bottom half of the frame. |

_3 files._

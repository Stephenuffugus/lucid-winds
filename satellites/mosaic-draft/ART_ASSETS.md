# MOSAIC DRAFT art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/mosaic-draft/` under the names below; say which landed and the code side wires them.

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

**Game:** `mosaic-draft` · satellite · board · audit impact 4/5 · effort M · audit rank 68

## Background wanted

A painted potter's workshop at night, 540x960: a brick kiln mouth glowing amber low-left, a shelf of unglazed pots receding into shadow at right, dust hanging in one shaft of light, ground values kept at #0b0807-#1b1512 so the existing HUD panels and plates still read on top. The game already has a THEMES map (workshop / nightkiln / alabaster / emberstudio) so four variants of the same plate would light up the wardrobe with no new code.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-workshop-540x960.jpg` | 540x960 full-bleed JPG, near-black #0b0807 ground, amber kiln mouth glowing low-left, shelf of unglazed pots in shadow right, one dusty light shaft, no detail in the centre third where the plates sit | Replaces the flat brown radial vignette that is currently the entire background; gives the game the workshop its copy keeps promising. |
| `bg-nightkiln-540x960.jpg / bg-alabaster-540x960.jpg / bg-emberstudio-540x960.jpg` | same 540x960 framing and composition as bg-workshop, relit to the existing THEMES palettes (#11141f cool, #2c2b25 pale, #241110 ember) | The wardrobe already sells four themes but they only change six hex values; one repaint each turns a colour swap into a real unlock. |
| `shards-sheet-640x256.png` | 640x256 transparent PNG, 5 columns x 2 rows of 128px cells: Cobalt / Amber / Jade / Garnet / Pearl, top row matte unglazed with a chipped edge, bottom row glazed with a wet specular streak top-left and a warm bounce along the bottom; keep each kind's distinct glyph shape (tri/cir/sq/star/cross) pressed into the clay rather than drawn on top | Replaces the flat rounded rect + 1px stroke glyph that every one of the ~60 tiles on screen currently uses. This is the single biggest lift in the game. |
| `plate-kiln-256x256.png` | 256x256 transparent PNG, a fired clay kiln plate seen slightly from above, warm rim light top-left, soft dark cast shadow baked into the lower 20px, shallow inner well | Replaces the flat #2e241a circle so the five factory plates lift off the panel instead of matching its value. |
| `wall-plaster-540x400.png` | 540x400 transparent PNG, the 5x5 wall as a grouted plaster panel with 25 recessed square sockets and a shadow inside each socket | Empty wall slots are currently 1px outlined boxes floating in nothing; recessed sockets make an empty slot read as a place a tile goes. |
| `rivals-3x-192x192.png` | three 192x192 transparent bust portraits - Tam the Apprentice, Mirela the Artisan, Kover the Master - warm rim light, storybook, clay-dusted aprons | Replaces the emoji (artist / artist / older person) currently standing in as rival faces on the ladder screen. |

_6 files._

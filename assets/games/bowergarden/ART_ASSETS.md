# EUCHRE art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/bowergarden/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-bowergarden` · native · card · audit impact 3/5 · effort S · audit rank 172

## Background wanted

A painted baize plate to replace the three-stop gradient: woven felt nap, a slightly worn darker ring where the trick lands, a warm overhead lamp falloff, and a walnut rail that actually has grain at the bottom edge. The composition is already right - this is a texture pass, not a redesign.

## Files

| file | spec | replaces |
|---|---|---|
| `assets/games/cards/table-baize-750x1334.jpg` | 750x1334 full-bleed. Green felt with visible nap and a few pulled fibres, warm lamp pool centred at 50% 25% falling to near-black at the corners, a worn darker oval in the middle where tricks land, walnut rail with grain across the bottom 8%. | Replaces the CSS gradient at bowergarden.js:112-114 and the hard rail seam. Same layout, real surface. |
| `assets/games/cards/trick-inlay-300x420.png` | 300x420 transparent PNG. A soft-edged oval of darker felt with a thin gold-thread border, feathered so it has no hard corner anywhere. | Replaces the lighter-green rounded rectangle that currently floats in the middle of the table as a stray box. |
| `assets/games/cards/seat-plate-120x40.png` | 120x40 transparent PNG, one carved wooden nameplate with a gold-inlay edge, greyscale-tintable so one file serves all three seats. | Gives PARTNER / WEST / EAST somewhere to sit. Right now three labels and three 'passed' pills float on bare felt with no motivated grouping. |
| `assets/decks/floral/pip-corner-32x32.png (x4 suits, red and black)` | 32x32 transparent, a small solid version of each suit pip readable at 12px. | Feeds the missing bottom-right mirrored index on the card face, so ranks read at a glance instead of one small top-left number. |

_4 files._

# FARKLE art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/farkle/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-farkle` · native · dice · audit impact 3/5 · effort M · audit rank 154

## Background wanted

bg-farkle-porch-540x960.jpg - a night porch table shot from above: worn plank wood, a lantern pool of warm gold light centred where the tray sits, dark falloff to all four edges, so the tray reads as a place rather than a brown rectangle pasted onto black.

## Files

| file | spec | replaces |
|---|---|---|
| `dice-faces-768x128.png` | 768x128 PNG, transparent, six 128x128 dice faces, bone-white painted dice with warm rim light from upper-left and hand-inked pips | Replaces the emoji die in the title and buttons and the CSS-dot dice in the tray; gives the biggest element on screen something painted to hold. |
| `dice-tray-felt-512x512.jpg` | 512x512 seamless tile, dark sage felt with visible nap and a worn lighter centre | Replaces the feTurbulence noise, which at 180px tiling reads as TV static rather than cloth, and pulls the tray back toward the house sage palette. |
| `farkle-icons-192x64.png` | 192x64 PNG, transparent, three 64x64 icons: a coin purse, a curled reroll arrow, a leather dice cup | Replaces the money-bag emoji on Bank, the reset arrow and the die emoji on Style, so the button row stops being emoji. |
| `farkle-streak-ember-96x96.png` | 96x96 PNG, transparent, a painted ember with a soft gold bloom | Replaces the flame emoji used for the hot-streak state, which is the loudest thing on screen when it fires. |

_4 files._

# MEMORY art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/memory/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-memory` · native · pattern · audit impact 4/5 · effort M · audit rank 105

## Background wanted

A dark greenhouse potting bench seen from above with a warm lamp pool in the centre, so the cards lie ON something instead of floating on the shell's gradient.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-memory-540x960.jpg` | 540x960 full-bleed, dark slate potting bench from directly above, warm lamp pool centred, soft moss and scattered seed at the edges, deep falloff to near-black at the corners | Gives the cards a surface. Right now the play screen is sixteen cards on the shared gradient with nothing behind them. |
| `00-card-back-v2.png` | 540x720 at 3:4 with TRANSPARENT corners, sage-and-gold Celtic knot back on deep near-black, warm rim light, a single small rose accent | Replaces the orange/cobalt mandala that fights the house palette, and kills the opaque black square that currently shows as a mismatched inset rectangle on every card. |
| `card-frame-3x4.png` | 240x320 transparent 9-slice, thin gold double-line with corner knots in the set-51 seasonal-knot language, ~14px inset | Applied to .mw so a card has a defined edge against the black ground instead of a barely-visible rgba(74,124,53,.22) hairline. |
| `01-18 face cards, re-matted` | same 18 paintings, alpha background instead of the baked black square, 3:4 | So a flipped flower sits on the card rather than on a black tile inside the card. |

_4 files._

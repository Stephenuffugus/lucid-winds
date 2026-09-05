# SIXFOLD art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`docs/art-lists/sixfold/` under the names below; say which landed and the code side wires them.

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

**Game:** `sixfold` · satellite · card · audit impact 2/5 · effort S · audit rank 185

## Background wanted

none needed - the painted backgrounds already exist and are good. What is missing is a scrim: the duel modal needs a dark vertical gradient of its own so the card stack lands on a deliberate ground rather than straight on blurred photography.

## Files

| file | spec | replaces |
|---|---|---|
| `rank-seals-576x96.png` | 576x96 atlas, six 96x96 transparent painted tier seals (Iron, Bronze, Silver, Gold, Jade, Onyx): an inked kanji on a stamped washi disc with a warm rim light and a torn paper edge | replaces the bare text glyph in the tier badge span, which currently renders as a plain system-font kanji next to painted art |
| `duel-scrim-375x667.png` | 375x667 transparent PNG: black-to-transparent vertical gradient with a soft vignette baked in, about 70% opacity through the centre band | gives the RANKED DUEL card stack a ground so its translucent panels stop meeting the blurred photo through a hard rectangular edge |

_2 files._

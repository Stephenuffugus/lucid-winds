# RULE ROOT art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/rule-root/` under the names below; say which landed and the code side wires them.

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

**Game:** `rule-root` · satellite · puzzle · audit impact 4/5 · effort M · audit rank 25

## Background wanted

bg-rule-garden-540x960.jpg: a painted night garden bed seen from slightly above, carved word-tile stones half-sunk in dark loam along the bottom, sage foliage framing the left and right edges, a warm gold lantern glow behind where the title sits. Same jpg reused behind .screen so menus and board share one place.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-rule-garden-540x960.jpg` | 540x960 full-bleed, painted night garden bed, dark loam foreground, word-stones half-sunk along the bottom, sage foliage framing both edges, warm gold lantern glow upper centre | Replaces the single radial gradient that is currently the whole background of both boot and play. |
| `tile-word-verb-128x96.png` | 128x96 transparent, a carved sage stone slab with a warm gold rim light and a shallow chiselled face for the word | The word tiles are the entire game and are currently canvas rectangles with a linear gradient (index.html:1072). |
| `tile-word-noun-128x96.png` | 128x96 transparent, a rooty bark-wrapped variant of the same slab, copper-toned | Nouns and verbs currently share one silhouette; a player parses the rule sentence by reading, not by seeing. |
| `lvlcard-frame-96x96.png` | 96x96 transparent, a small painted seed-pod frame; ship a second gold-lit solved variant lvlcard-frame-done-96x96.png | Gives the level select something to look at other than fourteen identical dimmed rounded rectangles. |
| `chapter-divider-470x24.png` | 470x24 transparent, a thin painted vine rule in sage with a gold node at the left end | The four CHAPTER labels currently float with no separation; a divider gives the grid a spine and hides the ragged left edge. |

_5 files._

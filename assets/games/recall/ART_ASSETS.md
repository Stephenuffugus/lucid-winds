# MEMORY MEADOW art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/recall/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-recall` · native · pattern · audit impact 4/5 · effort L · audit rank 49

## Background wanted

A meadow the game is named after: a full-bleed 540x960 painted night meadow - grass silhouettes along the bottom third, a low warm moon glow, soft bokeh seed heads - dark enough that gold cards read on top of it. That alone fills the dead 380px and gives the cards a ground.

## Files

| file | spec | replaces |
|---|---|---|
| `assets/games/recall/bg-meadow-540x960.jpg` | 540x960 full-bleed, night meadow, grass and seed-head silhouettes across the bottom third, low warm moon glow upper right, deep near-black sky | fills the empty bottom two thirds and delivers on the name Memory Meadow |
| `assets/games/recall/sym-*.png (20 files)` | 20 PNGs at 96x96 with alpha, one per SYMBOLS entry in games/recall.js (Fern, Bloom, Sun, Spore, Pine, Grain, Clover, Cactus, Palm, Leaf, Hibiscus, Bouquet, Rose, Tulip, Lavender, Berry, Grape, Root, Corn, Apple), painterly, warm rim light, big readable silhouette, sage and gold and rose on transparent | replaces all 20 colour emoji - this is the entire visual content of the game |
| `assets/games/recall/card-face-148x172.png` | 148x172 (2x of the 74x86 card) nine-slice-safe card face: dark pressed-earth panel, thin gold rule inset 4px, soft inner shadow | replaces the flat rgba gold tint so the three cards have depth instead of reading as coloured rectangles |
| `assets/games/recall/card-face-selected-148x172.png` | same size, sage-lit variant with a warm outer glow | the selected state is currently only a border-colour swap in _RCT, which is nearly invisible on a phone |

_4 files._

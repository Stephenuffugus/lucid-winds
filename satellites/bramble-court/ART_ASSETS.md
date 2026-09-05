# BRAMBLE COURT art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/bramble-court/` under the names below; say which landed and the code side wires them.

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

**Game:** `bramble-court` · satellite · card · audit impact 4/5 · effort L · audit rank 40

## Background wanted

A painted card-table plate. bg-table-540x960.jpg: dark moss felt with a visible woven weave, a warm gold lamp pool falling from top-centre so cards sit in light, bramble and thorn creeping in from the four corners as vignette, and a strip of dark wood table lip along the bottom 200px to give the dead lower third something to be. Keeps the three felt tints as a colour-dodge overlay so felt-rose and felt-gild still work.

## Files

| file | spec | replaces |
|---|---|---|
| `cards/portraits-sheet-1680x2100.png` | 10x10 atlas of 168x210 cells (50 used), transparent background, one painted creature per cell: soft painterly, warm rim light from top-left, big readable silhouette at 88px. Roster is 50 entries across 12 archetypes (bug, wingb, bird, beast, frog, fish, jelly, shell, crawl, eye, ori, myst). | Replaces portrait(), which the source itself labels 'procedural canvas art per card (placeholder skin; the art pack re-skins these later)'. Every creature is currently two ellipses and a dot for an eye. |
| `cards/frame-sage-168x210.png and cards/frame-rust-168x210.png` | Transparent PNG card frames, 8px painted border, sage-green rounded frame with a leaf at the top notch and a rust angular frame with a thorn, plus a solid name plate band across the bottom 30px. | Replaces the CSS 2px solid borders on .cardel.own1/.own2 and gives the name a painted plate that the edge numbers can sit beside instead of on top of. |
| `bg-table-540x960.jpg` | Full-bleed 540x960 painted felt table, moss weave, top-centre lamp pool, bramble corners, wood lip along the bottom 200px. | Replaces the flat radial gradient and fills the empty bottom half of the draft and duel screens. |
| `soil/fertile-148x152.png and soil/thorn-148x152.png` | Transparent board-cell tiles matching .bcell, 148x152: fertile is turned dark loam with sage shoots, thorn is cracked ground with rust brambles. Soft edges so they blend into the felt. | Replaces .bcell.fert and .bcell.thorn, which are currently a dashed border plus a radial gradient, and makes the soil rule visible before you place. |

_4 files._

# HEXA HIVE art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/hexa-hive/` under the names below; say which landed and the code side wires them.

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

**Game:** `hexa-hive` · satellite · puzzle · audit impact 4/5 · effort M · audit rank 80

## Background wanted

Ten painted habitat backdrops, one per HABITATS row, at 540x960 full-bleed with the sun/moon and horizon baked in. The switch is already written (G.hab = HABITATS[(level-1)%len], index.html:281), so this is a drawImage swap inside drawScene, not new plumbing.

## Files

| file | spec | replaces |
|---|---|---|
| `assets/hab-meadow-540x960.jpg, hab-desert, hab-rainforest, hab-jungle, hab-swamp, hab-mountains, hab-coast, hab-tundra, hab-orchard, hab-volcano` | 540x960 full-bleed JPG each, painterly, deep near-black at top and bottom so the gold comb and the HUD stay readable, sun or moon and a soft horizon painted in, warm rim light on the terrain. | Replaces the two-stop gradient plus flat orb plus flat hill polygon in drawScene(). One asset per HABITATS row; the level switcher already exists. |
| `assets/comb-frame-540x540.png` | 540x540 PNG, transparent, a painted wax comb frame with real wax thickness, warm gold rim light on the upper-left edge of each cell, empty cells dark honey rather than black. | Replaces hexPath + rgba(20,14,6,0.72) fill at index.html:591, which is the difference between wax and an outline. |
| `assets/chip-amber-128x128.png, chip-rose, chip-honey, chip-pollen` | 128x128 PNG each, transparent, one painted honeycomb chip seen slightly from above with a bevelled edge and a wax sheen; drawn repeatedly to build a stack. | Replaces the three-polygon flat stack at index.html:538-540 (dark base, flat body, one white 20% blob for a highlight). |
| `assets/bee-96x96.png` | 96x96 PNG, transparent, painted bee from above, soft wing blur, warm gold body, a readable silhouette at 24px. | Replaces the yellow ellipse with two dark rectangles for stripes at index.html:661-662. |

_4 files._

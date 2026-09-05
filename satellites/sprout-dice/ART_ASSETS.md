# SPROUT DICE art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/sprout-dice/` under the names below; say which landed and the code side wires them.

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

**Game:** `sprout-dice` · satellite · dice · audit impact 4/5 · effort M · audit rank 94

## Background wanted

assets/bg_trellis.jpg on #s-map — a painted vertical trellis: dark wet timber uprights, sage vine climbing from the bottom of frame toward the top, warm gold light at the current floor and cold blue at the locked floors above, so progression is legible from the background alone. Apply the same .55/.72 scrim already used on #s-combat.

## Files

| file | spec | replaces |
|---|---|---|
| `assets/bg_trellis.jpg` | 540x960 full-bleed JPG. Painted trellis of dark timber and climbing sage vine, warm light low in frame cooling to blue up top, structurally simple through the middle so 15px node titles stay readable under a .55-to-.72 scrim. | Replaces the bare CSS gradient on the map screen, the screen a player looks at most during a run, and gives the floor ladder a physical reason to be vertical. |
| `assets/node_icons_96x96.png` | 576x96 transparent PNG, six 96x96 cells: aphid, beetle, slug, elite skull-moth, rest lantern, boss crown. Painted, warm rim light, big readable silhouettes at 40px. | Replaces the caterpillar/tent/skull emoji returned by nodeInfo (lines 543-545) so five floors in one frame stop sharing an identical silhouette. Crops of the existing pest_*.png would also work. |
| `assets/ui/node_lock_48x48.png and assets/ui/node_check_48x48.png` | Two 48x48 transparent PNGs: a painted brass padlock and a sage tick, both with a soft drop shadow to match .pest-img's treatment. | Replaces the lock and tick system emoji so the right-hand column is one consistent painted set instead of three unrelated glyph sizes. |

_3 files._

# BUBBLENAUT art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/bubblenaut/` under the names below; say which landed and the code side wires them.

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

**Game:** `bubblenaut` · satellite · action · audit impact 4/5 · effort M · audit rank 66

## Background wanted

One painted plate per world behind the tile grid. The palettes are already written and named (Moss Moon, Crystal Caverns, Rust Belt, Frost Ring, Magma Core) - each just needs a real cavern behind the rectangles so the room stops being a flat fill with dots on it.

## Files

| file | spec | replaces |
|---|---|---|
| `assets/bg-moss-moon-750x1000.jpg` | 750x1000 full-bleed. Painted moss-cavern interior: wet dark rock #07130c to #0a1a12, clumps of pale lichen catching a cool green rim light, a few drips and a faint spore haze, depth falling to black at the edges. Value kept below the platform green #3fae72 everywhere so platforms read on top. Same painting repeated for the other four worlds in their own palettes. | Replaces ctx.fillStyle=bg plus 40 star dots (index.html:759-763). Fixes the value collapse by pushing the ground a full step darker and gives the room somewhere to be. |
| `assets/tiles-mossmoon-256x64.png` | 256x64 transparent PNG, four 64x64 cells: platform-top, platform-middle, wall-block, wall-corner. Painted stone with moss on the upper lip, warm rim light on the top edge, dark undercut. Tileable horizontally. | Replaces the roundRect capsule plus two 4px highlight/shadow strips at index.html:783-789. Turns the platforms and the surrounding frame into a built room instead of a border of green bars. |
| `assets/critter-hopper-192x64.png` | 192x64 transparent PNG, three 64x64 frames of a hop cycle. Round lime #9be86f body, two big dark eyes, a squash on landing, warm underlight. One sheet per critter (Hopper, Skitter, Drone, Slick, Cinder). | A critter is currently ctx.arc plus two dots, the same shape and hue family as everything else. A sprite with its own silhouette makes the thing you are hunting findable in one glance. |

_3 files._

# BUDBURST art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/budburst/` under the names below; say which landed and the code side wires them.

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

**Game:** `budburst` · satellite · action · audit impact 4/5 · effort M · audit rank 96

## Background wanted

The game screen needs one. A painted 540x960 canopy: layered leaf masses top and bottom, a warm shaft of light down the centre, near-black core value so the coloured buds keep their contrast. The menus can stay on the noise ground, which is already correct house style and looks fine.

## Files

| file | spec | replaces |
|---|---|---|
| `satellites/budburst/assets/powers/bomb-200x74.png (plus rainbow, recolour, trueaim, uproot, bloomblast, timefreeze, bulwark, and one per booster)` | 200x74 transparent PNG each, painted landscape-format vignette that fills the tile canvas edge to edge rather than a centred glyph. Bomb: a seedpod with a lit fuse and a soft blast ring. Uproot: a hand pulling a row of buds free of the vine. Time Freeze: a bud caught in frost with the canopy stalled behind it. Warm rim light, house palette, big readable silhouette. | Replaces iconPreview()'s 34px emoji fillText, which leaves ~160px of empty canvas on every one of the sixteen shop tiles. The hook already exists; it is a one-line swap from fillText to drawImage. |
| `satellites/budburst/assets/bg-canopy-540x960.jpg` | 540x960 full-bleed. Layered leaf masses crowding in from the top and bottom edges, a warm gold shaft down the centre, deep near-black core so bud colours stay legible on top. Soft painterly, no hard horizon line. | The playfield is currently the same radial gradient as every menu. This is the screen the player spends all their time on and it has no place. |
| `satellites/budburst/assets/modes/arcade-64x64.png (plus blitz, puzzle, endless, zen, daily)` | Six 64x64 transparent PNGs in one visual family: a painted spark, a sand-timer, a knotted vine puzzle, a spiral of falling leaves, a still pond leaf, a calendar leaf. Same line weight and rim-light direction across all six. | Replaces ✦ ⏱️ 🧩 🌀 🍃 📅 in .mc-ic, which currently mixes a text glyph with five colour emoji so the six mode cards do not share a family. |
| `satellites/budburst/assets/coin-40x40.png and nectar-40x40.png` | Two 40x40 transparent PNGs: a warm gold coin with a bud stamped on it, and a honey drop with a soft internal glow. Both drawn to read at 20px. | 🪙 appears 22 times and 🍯 10 times, including inline inside body text ('Upgrade · 220 🍯'), so the two currencies of the game are system emoji that render differently on every device. |

_4 files._

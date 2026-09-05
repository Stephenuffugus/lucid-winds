# VINE PUZZLE art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/pipe/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-pipe` · native · puzzle · audit impact 4/5 · effort M · audit rank 112

## Background wanted

A soil bed behind and under the grid so the board sits IN a garden instead of floating. vine-bg.png already exists as a 128x128 tile - repeat it as the .lg container background with a dark vignette, then paint one full-bleed 540x960 backdrop of a night vegetable plot (raised bed edge at the bottom, dark canopy at the top).

## Files

| file | spec | replaces |
|---|---|---|
| `assets/games/pipe/vine-straight-b.png` | 128x128 PNG with ALPHA, vine only, no soil - a second straight run with a different leaf count and a knot in the wood | replaces the third and fourth identical straight tile in a row; kills the wallpaper repeat |
| `assets/games/pipe/vine-corner-b.png` | 128x128 PNG with ALPHA, vine only - a second corner with the elbow tighter and leaves on the outside of the bend | same, for corners |
| `assets/games/pipe/soil-bed-512.png` | 512x512 seamless tiling soil, dark loam, wet speckles, no vine | one continuous bed drawn under the whole grid so the alpha vine tiles lay on it and seams disappear |
| `assets/games/pipe/vine-source.png` | 128x128 REPAINT - a pale sprouting seed with two cotyledons pushing out of the soil and one clear exit direction | gives START its own silhouette; the current file was abandoned for reading as a 4-way crossroad and the end-cap was used instead |
| `assets/games/pipe/vine-bloom.png` | 128x128 - an open rose-pink bloom on a short stem, one entry stub, warm rim light | the goal text says connect the root to the BLOOM but FINISH currently shows a brown swirl with a small gold nut |
| `assets/games/pipe/bg-vinepuzzle-540x960.jpg` | 540x960 full-bleed, night vegetable plot, raised bed timber across the bottom, dark leaf canopy top, one warm lantern glow off-centre | replaces the shared grey-green shell gradient behind the board |

_6 files._

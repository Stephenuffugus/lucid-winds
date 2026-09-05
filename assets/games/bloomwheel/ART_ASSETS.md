# BLOOM WHEEL art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/bloomwheel/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-bloomwheel` · native · creative · audit impact 4/5 · effort S · audit rank 36

## Background wanted

Keep the ground dark so strokes pop, but the canvas needs a visible wheel behind them: assets/games/bloomwheel/wheel-plate-840x840.png — dark slate with faint concentric sage rings, a small gold hub bloom and a soft radial vignette — plus a painted rim so the square canvas is a wheel and not a void.

## Files

| file | spec | replaces |
|---|---|---|
| `wheel-plate-840x840.png` | 840x840 opaque. Near-black slate ground with four concentric sage rings at 10-14 percent opacity, a small warm gold hub bloom at centre, and a radial vignette darkening the corners. | Replaces the flat #0d100c fillRect at bloomwheel.js:183 so the empty canvas reads as a spinning wheel with a centre, instead of the black hole it is now. |
| `wheel-rim-880x880.png` | 880x880 transparent PNG. A painted brass-and-vine ring with warm rim light on the upper left and a cast shadow on the lower right; the centre 840px is fully transparent. | Frames the canvas so the square drawing surface has an edge, replacing the bare border-radius:12px against black (bloomwheel.js:36). |
| `petal-guides-840x840-4.png / -8.png / -12.png` | Three 840x840 transparent overlays showing 4, 8 and 12 faint gold sector spokes radiating from the hub, roughly 15 percent opacity, with a slightly brighter first spoke. | Swapped when the player taps 4/8/12 PETALS, so the symmetry choice is visible before the first stroke. Today the only feedback is a highlighted button and 3 percent alpha spokes nobody can see. |
| `brush-tips-256x64.png` | 256x64 sprite, four 64x64 cells: round, chisel, spatter and ribbon brush marks painted in cream on transparent. | Replaces the bullet character standing in as the brush indicator on the BRUSH button (visible as a small green dot in play-bloomwheel-2play.png). |

_4 files._

# LAMPLIGHTER art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/lamplighter/` under the names below; say which landed and the code side wires them.

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

**Game:** `lamplighter` · satellite · puzzle · audit impact 5/5 · effort M · audit rank 91

## Background wanted

bg-lamplighter-town-540x340.png, a painted dusk skyline strip with varied roof lines (a gable, a clock tower, a chimney cluster, a domed hall), a hill behind, chimney smoke, and a soft haze band along the bottom so it dissolves into the grid instead of stopping at a hard line. The window rects can still be drawn on top so the kindling stays live.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-lamplighter-town-540x340.png` | 540x340 transparent-bottomed PNG, painted dusk skyline with varied silhouettes, a hill behind, chimney smoke, and a 40px haze gradient fading to transparent at the bottom edge | replaces the procedural rectangle town and removes the hard horizon where the art meets the grid |
| `tile-cobble-96x96.png` | 96x96 seamless tile, warm grey cobbles with dark mortar and a faint damp sheen, neutral enough to take a gold light wash | replaces the flat #221c33 walkway fill so lit and unlit cells differ by light rather than by a colour swap that currently reads as tan drywall |
| `lamp-lit-96x96.png` | 96x96 transparent, painted iron lantern on a short post with a warm flame and a soft bloom, warm rim light on the ironwork | replaces drawLamp's stacked circles, the single most-repeated object on the board |
| `lamp-clash-96x96.png` | 96x96 transparent, the same lantern cracked, its glass smoked, a dull ember instead of a flame, one thin ember-orange highlight | replaces the pure-red no-entry ring so the error state stays inside the plum-and-gold palette |
| `house-tiles-288x96.png` | 288x96 transparent, three painted 96x96 shuttered house fronts (narrow, wide, gabled) with dark windows and a gold eave line | replaces the identical dark rect plus triangle roof stamped on every house cell, so two houses in one frame stop sharing a silhouette |

_5 files._

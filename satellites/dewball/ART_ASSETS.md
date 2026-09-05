# DEWBALL art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/dewball/` under the names below; say which landed and the code side wires them.

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

**Game:** `dewball` · satellite · action · audit impact 5/5 · effort M · audit rank 89

## Background wanted

Painted seamless ground per world through the hook that already exists, plus a painted sky plate so the horizon has a picture in it instead of fog. Priority is w1 Crumb Country (the first world every player sees) then w2 Toybox Peaks.

## Files

| file | spec | replaces |
|---|---|---|
| `assets/ground-w1.jpg` | 1024x1024 seamless, red and cream gingham with visible thread weave, a soft wine ring, a scatter of crumbs baked in, gentle cloth folds; tiles with itself edge to edge | the exact file the game already requests and 404s; it drops in with zero code change at index.html:3225 and turns the chessboard into fabric |
| `assets/ground-w2.jpg through assets/ground-w7.jpg` | 1024x1024 seamless each: playroom carpet loops, night-garden soil and moss, market cobbles, wet dusk sand with ripples, meadow grass, and a mixed world tile | same hook, six more worlds; each is currently a flat two-colour procedural checker in a different palette |
| `assets/sky-w1.jpg` | 2048x1024 equirectangular, late-afternoon picnic sky, warm cumulus, a hint of tree canopy at the bottom edge; needs a three-line loader mirroring the ground hook | replaces the blown-out empty fog band that fills the top third of every frame |
| `assets/card-w1.jpg through card-w7.jpg` | 320x180 each, a painted vignette of that world (the blanket corner, the toybox floor, the night garden), warm rim light, big readable shape | replaces the 2rem emoji that is the only picture on the level-select card today (.wcard .wemoji at index.html:174) |

_4 files._

# PONG ARENA art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/pong/` under the names below; say which landed and the code side wires them.

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

**Game:** `pong` · satellite · action · audit impact 3/5 · effort M · audit rank 139

## Background wanted

arena-court-540x960.jpg - a painted deck for the ball to live on: dark lacquered wood or brushed steel with a soft centre-line bloom, a warm rim of light down each wall, and a vignette that keeps the paddles the brightest things in frame. Today the ball flies over a flat gradient with no floor, so nothing conveys speed or depth.

## Files

| file | spec | replaces |
|---|---|---|
| `arena-court-540x960.jpg` | 540x960 full-bleed painted court, deep #05060e ground, centre-line glow, side-wall rim light, vignette | replaces the two-stop canvas gradient at index.html:1348 so the ball has a surface |
| `paddle-skins-512x256.png` | 512x256 transparent, 8 cells of 128x32: painted paddle skins (chrome, brass, mossed stone, bone, obsidian, gold) each with a specular highlight and a soft under-shadow | replaces the createLinearGradient/chrome stroke fakes at index.html:1265 and 1402 - the whole cosmetic economy is currently CSS-style gradients on a rectangle |
| `gauntlet-node-icons-384x128.png` | 384x128 transparent, 12 cells of 32x32: painted rank badges for the 12 career levels (first serve, sky, multiball, orbit, gauntlet, ace, boss) in gold/teal/rose | replaces the mixed emoji in the career rows so the ladder reads as a progression instead of a spreadsheet |
| `pong-title-band-540x360.jpg` | 540x360, painted hero band: a court seen at a low angle receding into dark, warm bloom at the horizon, safe empty top third for the wordmark | the boot screen is a wordmark floating on flat navy; this gives the title a stage and hides the chip landing zone |

_4 files._

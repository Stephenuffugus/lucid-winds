# STAR FIELD art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/star-field/` under the names below; say which landed and the code side wires them.

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

**Game:** `star-field` · satellite · puzzle · audit impact 5/5 · effort M · audit rank 16

## Background wanted

A painted night sky. Deep near-black at the bottom rising into a faint sage-teal haze, a scatter of small stars and one soft nebula bloom off-centre, with the middle band kept dark and low-contrast so the puzzle grid stays legible on top of it.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-starfield-night-540x960.jpg` | 540x960 full-bleed painted night sky: deep near-black bottom into a sage-teal haze, scattered small stars, one soft rose nebula bloom upper-right, the middle 500x500 kept dark and flat | replaces the flat THEMES[].bg fill; gives the empty lower third and the bare top strip something to be, and stops the board floating in a void |
| `star-glyph-atlas-256x64.png` | 256x64, four 64x64 transparent painted markers matching the existing fn cases (star, firefly, rose, bloom): warm gold petals, a cream core, a soft halo | replaces the hand-rolled starPath and ellipse loops at lines 407-410, which currently draw CSS-shape-grade forms |
| `bed-tint-tiles-512x86.png` | six 86x86 tileable transparent overlays of soft painted soil and nebula grain at about 25% opacity, laid out in one 512x86 strip | multiplied over the flat TINTS fills so each constellation bed has texture instead of being one solid rectangle |
| `pip-planted-64x64.png` | 64x64 transparent painted seed pip: a small cream seed with a warm gold rim light and a faint shadow | replaces the rgba(200,196,180,0.5) grey dot drawn for the v===1 marker at line 373 |

_4 files._

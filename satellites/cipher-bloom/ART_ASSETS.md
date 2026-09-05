# CIPHER BLOOM art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/cipher-bloom/` under the names below; say which landed and the code side wires them.

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

**Game:** `cipher-bloom` · satellite · word · audit impact 4/5 · effort M · audit rank 28

## Background wanted

A painted midnight garden behind the title/menu screen, and a warm vellum texture under the #paper cryptogram card. The game is about letters worn into something; right now nothing on screen has a surface.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-cipher-title-540x960.jpg` | 540x960 full-bleed, painted midnight garden: a carved stone tablet half sunk in moss with letters worn shallow, one shaft of moonlight from upper left, deep near-black ground, sage foliage, gold glints, bottom third darkened so the button stack reads | Replaces the flat linear-gradient on the title .screen. The menu currently floats on nothing. |
| `paper-vellum-516x600.png` | 516x600 transparent PNG, warm cream vellum with faint tooth, a soft deckled left edge and a subtle inner shadow, tileable vertically | Replaces #paper's flat linear-gradient(180deg,#e8dcc8,#dccbb0) at index.html:106. The cryptogram card is the hero surface of the game and is currently two stops of beige. |
| `blooms-sheet-8x-192x192.png` | One 1536x192 strip, eight 192x192 cells on transparent: eight painted keepsake blooms, warm rim light, gold-cream centres, one per unlock tier | Replaces the procedural flower drawn with ctx.ellipse and ctx.arc at index.html:607-614. That flower is the reward for solving a verse and it is currently three ellipses and a dot ring. |
| `gallery-plinth-420x260.png` | 420x260 transparent PNG, a painted empty stone seed tray with two small gold pins and a soft shadow, sage moss at the base | Gives the no blooms yet gallery something to look at instead of 500px of black. |

_4 files._

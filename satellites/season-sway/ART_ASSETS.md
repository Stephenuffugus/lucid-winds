# SEASON SWAY art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/season-sway/` under the names below; say which landed and the code side wires them.

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

**Game:** `season-sway` · satellite · card · audit impact 5/5 · effort L · audit rank 19

## Background wanted

bg-garden-night-540x960.jpg - the one little garden the game is about: a raised bed in the near foreground, a trellis and a hung lantern behind it, deep #0d100c ground, warm gold rim light on the leaves, soft painterly. Four seasonal recolours of the same composition (spring blossom, summer haze, autumn copper, winter frost) so the field itself tells you which season you are in.

## Files

| file | spec | replaces |
|---|---|---|
| `visitor-portraits-sheet-1024x1024.png` | 1024x1024 transparent, 64 cells of 128x128 for the 40 visitors plus spares: painted storybook busts, warm rim light, each with a distinct silhouette (mole vs hedgehog, toad vs chorus frog, heron vs dove) | replaces the single emoji glyph each visitor gets today, and fixes the duplicate and simply wrong glyphs at index.html:317-356 (Mole and Hedgehog both use the hedgehog, Cicada uses musical notes, Moth uses a moon) |
| `card-face-parchment-540x620.png` | 540x620, warm cream vellum with a deckled edge, faint pressed-leaf watermark, a 2px gold inner rule and a soft inner shadow, 9-slice safe margins of 40px | replaces the flat cream roundRect drawn at index.html:585 so the card looks like something you hold |
| `bg-garden-night-540x960.jpg` | 540x960 full-bleed, four seasonal variants of one composition as in background_want | fills the empty top 190px and makes the season visible instead of being a word behind the music chip |
| `meter-gauges-352x480.png` | 352x480 transparent, 4 cells of 88x120: painted sundial, rain gutter, soil core and hive gauges with a marked safe band and a needle or fill line | replaces the four black fillRect columns with emoji caps at index.html:562, which are the only readout of the balance the whole game is about |

_4 files._

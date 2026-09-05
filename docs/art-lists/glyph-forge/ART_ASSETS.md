# GLYPH FORGE art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`docs/art-lists/glyph-forge/` under the names below; say which landed and the code side wires them.

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

**Game:** `glyph-forge` · satellite · puzzle · audit impact 5/5 · effort L · audit rank 88

## Background wanted

A full-bleed painted scriptorium ground: an open codex page on a dark oak desk, candle rim light from the upper left falling off into black at the edges so the gold UI still floats. It is a game about inscribing a page and the page is missing.

## Files

| file | spec | replaces |
|---|---|---|
| `art-slots/enemy-cinder.png (+7 siblings, filenames already listed in ASSET_MANIFEST.json 'enemies')` | 1024x1024 PNG, dark background, masked into a 180px circle. Baroque chiaroscuro portrait, faceless or partly obscured, like a portrait in a haunted library. | Replaces nothing at all: the slot 404s today so the enemy is five red diamonds and one truncated word. Highest single lift in the game. |
| `art-slots/rune-roll.png, rune-hollow.png, rune-gust.png, rune-drop.png, rune-ember.png (+25 more, all named in ASSET_MANIFEST.json)` | 512x512 PNG, transparent or dark ground, renders inside a 5:7 card at roughly 80x110. One illuminated sigil on aged parchment, glowing edge, distinct silhouette at thumbnail size. | Replaces the single Unicode glyph printed by .rune-art.placeholder::after (content: attr(data-glyph), 32px). The card frames are already good; only the faces are stand-ins. |
| `art-slots/title-mark.png` | 1024x1024 PNG with transparency, must read inside a circular gold frame at 200x200. Symmetrical ritual mark. | 404s today; the title screen is type only. |
| `art-slots/bg-scriptorium-540x960.jpg` | 540x960 full-bleed, painted desk and open codex page, candlelight from upper left, edges falling to near-black so gold UI stays legible. | Replaces two faint radial gradients. Not in the existing manifest; add it. |

_4 files._

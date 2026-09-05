# DRAGON PHILOSOPHY art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/dragon-philosophy/` under the names below; say which landed and the code side wires them.

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

**Game:** `dragon-philosophy` · satellite · card · audit impact 4/5 · effort L · audit rank 102

## Background wanted

art/bg-patron-hall-750x1334.jpg - a dim dragon hall lit by one low brazier, banner colour keyed to the patron (red for Vairex), painted soft so the card plate still reads on top of it. And reuse menu-bg.jpg at ~0.25 opacity behind the patron grid instead of leaving it flat.

## Files

| file | spec | replaces |
|---|---|---|
| `satellites/dragon-philosophy/art/manifest.json` | the file itself, shaped `{ "<cardId>": "art/cards/<cardId>.png" }` | Without it the already-built `card-art--real` <img> never renders, so any painted card art is invisible to the game. This is the cheapest single fix in the batch. |
| `satellites/dragon-philosophy/art/cards/<cardId>.png` | 512x384 transparent PNG per card, painted illustration, roughly 40 non-common cards to start | Drops into `.card__art` over the procedural sigil that every card currently shows. |
| `satellites/dragon-philosophy/art/patrons/vairex.png` | 640x640 transparent PNG, painted head-and-shoulders dragon portrait with warm rim light, one per patron | Fills the empty top third of the confirm card where the red arrow glyph currently stands in for a character. |
| `satellites/dragon-philosophy/art/bg-patron-hall-750x1334.jpg` | 750x1334 full-bleed JPG, dim hall with a single warm light source, dark enough that cream text holds | Replaces flat violet on the screen where the player makes the one choice that shapes the whole run. |

_4 files._

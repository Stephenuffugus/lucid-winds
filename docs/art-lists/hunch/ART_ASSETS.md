# HUNCH art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`docs/art-lists/hunch/` under the names below; say which landed and the code side wires them.

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

**Game:** `hunch` · satellite · creative · audit impact 4/5 · effort M · audit rank 55

## Background wanted

none needed as a full-bleed painting - the game's own ART_ASSETS.md fixes a flat dark navy on purpose and that decision is coherent. What it needs is the theme backdrop it already specced and never received: assets/cosmetics/themes/theme_default_bg.png at 1080x1920, a dark navy field with a faint neon grid and film grain, so the screen is not one flat colour.

## Files

| file | spec | replaces |
|---|---|---|
| `assets/personas/persona_critic_idle@3x.png (plus noir, sunny, gremlin, zen)` | 1024x1024 transparent PNG each, chest-up mascot, consistent framing and eye-line across the set, distinct silhouette and signature colour, glowing with a slight machine undertone | the five AI personas are currently literal emoji in the source (index.html:391-397) - this is the game's whole cast, and its own ART_ASSETS.md ranks it priority 2 |
| `assets/fx/canvas_paper_1024.png` | 1024x1024 tileable off-white paper (#f7f5ef) with a faint tooth and a soft inner shadow at the edges, opaque | replaces the raw #fff drawing rectangle so the canvas meets the navy through a transition instead of the harshest value jump on the screen |
| `assets/currency/coin_hunch@3x.png` | 256x256 transparent PNG, a lime-and-teal coin mark with neon glow, 12% safe margin | replaces the coin emoji in the header and shop rows |
| `assets/cosmetics/themes/theme_default_bg.png` | 1080x1920, dark navy #0d0e1a with a faint lime neon grid falling off toward the bottom and subtle film grain | replaces the single radial gradient that is the entire background |
| `icons/icon.png` | 1024x1024 PNG no alpha, neon-lime pencil tip morphing into a glowing AI eye, centred, full-bleed dark ground | ART_ASSETS.md ranks the store icon priority 1 and only icons/icon.svg exists - the store master was never made |

_5 files._

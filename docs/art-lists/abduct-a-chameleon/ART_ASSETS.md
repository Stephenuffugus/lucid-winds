# ABDUCT A CHAMELEON 3D art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`docs/art-lists/abduct-a-chameleon/` under the names below; say which landed and the code side wires them.

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

**Game:** `abduct-a-chameleon` · satellite · party · audit impact 4/5 · effort M · audit rank 6

## Background wanted

Two painted plates, because the two screens a phone player actually sees are both bare: a full-bleed night-street backdrop behind #howto so the rules read over an image instead of a void, and the same scene behind #rotate so the most-seen screen on a portrait phone is not an emoji on flat navy.

## Files

| file | spec | replaces |
|---|---|---|
| `assets/ui/howto-backdrop-1334x750.jpg` | 1334x750 landscape, full-bleed, painted night village street seen from slightly above: deep indigo #0E1220 ground, one warm sodium lamp pool low-left, a chameleon silhouette flattened against a wall, saucer running lights small on the horizon. Pre-darkened to ~35% luminance so 15px cream body copy reads over it with no scrim. | Replaces the flat #080c19f2 fill behind #howto and #rotate. Fixes the bleed-through at the same time (an opaque image cannot ghost) and gives the rules screen the only art it will ever have. |
| `assets/ui/saucer-beam-512x512.png` | 512x512 transparent PNG. Saucer seen three-quarter from below, warm amber cone beam falling out of it, soft rim light on the hull, glow bloom baked in. No text, no frame. | The CONNECTING... state and the tap-to-start card are currently pure type. Drop this above the heading so the loading screen and the rotate gate both carry the game's one strong silhouette. |
| `assets/ui/lobby-frame-1334x750.png` | 1334x750 transparent PNG, a border/vignette only: dark indigo falloff on all four edges, a thin amber hairline inset ~24px, corners weighted. Centre 600x420 fully transparent so the Playroom iframe shows through it. | The Playroom lobby cannot be restyled, but it can be framed. This puts a Sky Wolf edge around the stock SDK card so screen two stops looking like a different product. |

_3 files._

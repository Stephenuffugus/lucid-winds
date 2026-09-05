# PIT BIKE RALLY art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/pitbike-rally/` under the names below; say which landed and the code side wires them.

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

**Game:** `pitbike-rally` · satellite · action · audit impact 4/5 · effort S · audit rank 30

## Background wanted

bg-rotate-portrait-540x960.jpg — the existing bg_menu sunset dirt track recomposed vertical, under a dark scrim, so the rotate wall shows the game it is asking you to turn your phone for.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-rotate-portrait-540x960.jpg` | 540x960 full-bleed. The bg_menu scene recomposed vertical: wolf on the rock high-left, green pit bike centre-third, SKYWOLF garage low-right, sunset sky top. Baked-in 40% darkening top and bottom so white type reads. | Replaces the flat #17181c fill on #rotate-ov. Turns the only screen a portrait player sees from an empty box into the game's poster. |
| `icon-rotate-phone-96x160.png` | 96x160 transparent PNG. A painted phone with a warm gold bezel, a sliver of the dirt track visible on its screen, soft rim light from the left. | Replaces the 52x88 CSS border rectangle (#rotate-ov .phone) which is a wireframe placeholder sitting next to a repo full of painted art. |

_2 files._

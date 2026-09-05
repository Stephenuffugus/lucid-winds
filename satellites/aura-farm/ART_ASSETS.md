# AURA FARM art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/aura-farm/` under the names below; say which landed and the code side wires them.

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

**Game:** `aura-farm` · satellite · creative · audit impact 4/5 · effort M · audit rank 82

## Background wanted

A painted 540x960 dusk-park plate behind the MENU and the rules sheet, so the title card sits somewhere instead of on a void: indigo sky, black tree silhouettes, one warm lamp, low fog band. The in-run canvas venues can stay procedural, they already have a day cycle.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-menu-540x960.jpg` | 540x960, full-bleed, painted dusk park: indigo sky graded to a warm horizon, black tree and lamp-post silhouettes, low fog band, motes in the air | Replaces the flat var(--ink) void behind the title card and the rules sheet; the game currently has no background image anywhere. |
| `logo-aurafarm-720x240.png` | 720x240, transparent, painted wordmark: cream letterforms with a warm gold rim light and a few drifting motes caught in the glow | Replaces the four-stop CSS gradient text that clashes with everything around it. |
| `icon-essence-128.png (x6: joy, hope, awe, sorrow, rage, dread)` | 128x128 each, transparent, painted glass-bead essence motes in the six existing emotion colours (#ffd75e, #8effc1, #9ef3ff, #6fa8ff, #ff6b52, #b06bff) | Replaces the emoji in EMOTIONS at index.html:295-301 that are used as the game's core currency icons. |
| `howto-plate-540x300.jpg` | 540x300, painted header band: a hand cupping a glowing mote over dark grass, warm rim light | Gives the rules wall an opening picture instead of starting on paragraph one. |

_4 files._

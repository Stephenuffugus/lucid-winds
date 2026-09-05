# POP N LOCK art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/chaff-wars/` under the names below; say which landed and the code side wires them.

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

**Game:** `chaff-wars` · satellite · puzzle · audit impact 2/5 · effort S · audit rank 184

## Background wanted

None needed. Both backgrounds are painted, on-voice and already wired with a versioned URL. What it wants is a heavier scrim on the select screen only, not a new image.

## Files

| file | spec | replaces |
|---|---|---|
| `assets/ui/lock-plate.png` | 104x104 transparent PNG (renders at 52px in `.fem`), a painted padlock on a boarded plank in the game's spray-paint palette | Replaces the bare emoji in thirteen of fourteen ladder rows, which is the only place emoji stand in for art in an otherwise fully painted game. |
| `assets/logo/studio-wordmark.png` | 480x48 transparent PNG, 'SKY WOLF STUDIO' as a stencilled spray tag with a dark drop shadow | Replaces the unreadable grey text under the logo so the studio credit survives the neon wall behind it. |

_2 files._

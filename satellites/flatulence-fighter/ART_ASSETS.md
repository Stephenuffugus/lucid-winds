# FLATULENCE FIGHTER art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/flatulence-fighter/` under the names below; say which landed and the code side wires them.

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

**Game:** `flatulence-fighter` · satellite · action · audit impact 3/5 · effort M · audit rank 159

## Background wanted

A dim chapel behind the actor. bg-chapel-540x960.jpg: pew backs in dark wood receding into the lower third, a stained-glass window throwing a cool bloom high on the left, candle warmth low right, everything desaturated toward the existing parchment key so the cream cards still read on top. Keep the paper texture as a screen-blend overlay so the current pressure vignette still works.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-chapel-540x960.jpg` | Full-bleed painted chapel interior at the stage size: pew backs bottom third, stained-glass bloom upper left, candle glow lower right, values held down so the cream .card panels keep contrast. | Replaces the flat parchment gradient and gives the game the room its whole premise is set in. |
| `sprites/mourner-360x360.png` | Transparent PNG of the player character from the chest up, in a dark suit collar, in the same soft cartoon line as the current SVG face. Six expression variants on a 1080x1080 sheet: calm, strain, clench, relief, panic, slipped. | Replaces the bare floating SVG head. The face currently has no body and no shoulders, so it reads as a balloon rather than a person in a pew. |
| `sprites/scene-cast-540x260.png` | Transparent strip of the three onlookers named in the copy (the widow, the priest, a neighbour) at pew scale, painted, back three-quarter view so they can turn. | The alert text says 'The widow turns to look' and nothing on screen turns. Replaces a line of text with a beat you can see. |
| `ui/icons-action-192x192.png` | Three 64x64 painted icons on one sheet: a handkerchief cough, a water glass, a folded fan. Warm rim light, transparent. | Replaces the emoji standing in for COUGH, SIP and WAFT, and gives the three identical cards three different silhouettes. |

_4 files._

# STOP THE LIGHT art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/stop-the-light/` under the names below; say which landed and the code side wires them.

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

**Game:** `stop-the-light` · satellite · action · audit impact 3/5 · effort M · audit rank 136

## Background wanted

bg-firefly-ring-375x667.jpg, full-bleed: a night garden clearing seen from above, dark loam and moss going near-black at the top and bottom edges, a faint circle of pale stones or dew-lit petals where the ring sits so the ring has a place to live, and a warm gold pool of light at the centre. The ring itself stays canvas-drawn on top so all the existing glow and drift work is untouched.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-firefly-ring-375x667.jpg` | 375x667 at 1x, export 1125x2001 at 3x, full-bleed no transparency. Night garden clearing from above: dark moss and loam, a faint ring of dew-lit stones at the centre matching the play ring's radius, near-black falloff at the top and bottom so wordmark and buttons stay readable. | Replaces the single vertical gradient at index.html:1348 and fills the ~300px of empty navy above and below the ring. |
| `ring-plate-720.png` | 720x720 transparent PNG, centred. The dead ring painted as a wreath of dark furled leaves with a carved stone rim, cool blue-grey, soft ambient occlusion at the inner edge. | Replaces the identical navy petal() spikes so the non-scoring ring stops sharing a silhouette with the gold band. |
| `band-gold-720.png` | 720x720 transparent PNG, same centre and radius as ring-plate. A warm gold arc painted as open blooms with lit petal edges and a pale cream heart at its exact middle, alpha falling off at both ends of the arc. | Makes the scoring band a different object from the ring, and paints the 'pale heart' the rules describe as a place rather than a lighter shade of the same spike. |
| `firefly-96.png` | 96x96 transparent PNG plus a 3-frame pulse strip at 288x96. A painted firefly with a warm gold abdomen glow, faint wing blur, cool blue body. | The player's only moving object is currently a bare radial gradient dot (index.html:1615) with no body. |
| `howto-icons-144.png` | One sheet, seven cells at 144x144, transparent PNG. Firefly, ring, gold band, scales (bank vs go again), a broken ring (miss), three fireflies, a drifting band. All in warm cream on transparent, one weight, one light source. | Replaces the seven mismatched unicode glyphs (✦ ● ⚖ ✖ ☀ ∿ ↻) that are the only imagery on the How to Play wall. |

_5 files._

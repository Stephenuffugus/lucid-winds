# WORD LIGHTNING art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/bloomzap/` under the names below; say which landed and the code side wires them.

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

**Game:** `bloomzap` · satellite · word · audit impact 4/5 · effort M · audit rank 79

## Background wanted

It needs one. A painted 540x960 storm night: dark hedge and garden-wall silhouette across the bottom third so the empty band has content, sheeting rain, one fork of lightning behind cloud upper right, and a single warm lit cottage window on the horizon for the touch of gold. Near-black ground so the yellow wordmark and the cream copy still read on top.

## Files

| file | spec | replaces |
|---|---|---|
| `satellites/bloomzap/assets/bg-storm-540x960.jpg` | 540x960 full-bleed. Night garden under storm: near-black hedge and stone wall silhouette across the lower third, rain sheeting at roughly 72 degrees, one fork of lightning half-hidden behind cloud in the upper right, a single warm gold lit window on the horizon. Overall value dark enough that cream body text reads at 14px. | Replaces the flat navy plus invisible CSS hatching, and fills the 380px of empty navy under the mode rows. |
| `satellites/bloomzap/assets/storm-drizzle-96x96.png, storm-downpour-96x96.png, storm-tempest-96x96.png` | Three 96x96 transparent PNGs with escalating silhouettes, not just escalating weather: a small round cloud with three drops; a heavy wide cloud with sheeting rain and a lean; a black anvil cloud with a gold fork below it. Warm rim light on the cloud tops, painted, soft. | Replaces 💧 🌧️ ⛈️ and makes the three difficulty rows distinguishable at a glance instead of three identical pills. |
| `satellites/bloomzap/assets/tile-letter-96x96.png` | 96x96 transparent PNG, a letter tile plate: dark glass body, warm gold hairline rim, a soft specular sweep across the upper left, a slight bottom shadow lip. Second variant tile-letter-struck-96x96.png with a hot white-blue crackle for the zap state. | The .chip letter rack is currently flat #141c2c rectangles; a painted plate is what makes the core screen of the game look like anything. |

_3 files._

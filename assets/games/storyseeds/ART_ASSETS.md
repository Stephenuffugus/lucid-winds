# STORY SEEDS art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/storyseeds/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-storyseeds` · native · creative · audit impact 5/5 · effort M · audit rank 18

## Background wanted

A painted writing desk at night: a journal edge along the bottom, a candle or lantern glow falling from the upper left across the page, everything else dropping to near-black. It is a contemplative writing game with a garden voice and currently it looks like a form.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-storyseeds-540x960.jpg` | 540x960 full-bleed. Night desk: dark timber, the corner of a leather journal bottom-right, a warm candle pool of light upper-left falling off to #0d100c, a pressed leaf and a stub of pencil in a motivated group near the journal rather than scattered. | The game has no background at all; the whole screen is currently the shared shell gradient. |
| `prompt-card-540x260.png` | 540x260, transparent outside the card. Deckled cream-green parchment with a soft warm shadow, a pressed fern in the top-left corner, a thin gold rule across the lower third where the category sits. | Gives the prompt block a container. Right now the emoji, the italic line and the category float loose with nothing behind them. |
| `icon-prompt-96x96-observation.png (plus -perspective, -memory, -imagination, -senses, -feeling, -gratitude, -wisdom)` | Eight 96x96 transparent painted emblems, warm rim light, big silhouette at 48px: an open eye; a rain-struck leaf; a pressed dried flower; a moon over a garden gate; a hand in soil; a heart-shaped leaf; two folded hands; a river-worn stone. | Replaces the 30 system emoji at storyseeds.js:108 (one per category, not one per prompt) with house-voice art. |
| `paper-texture-540x420.png` | 540x420 tileable, opaque. Warm cream ruled paper with visible fibre and a faint gutter shadow down the left edge, supplied as a night-toned variant at ~18% luminance so cream text stays legible on it. | Backs the textarea so the biggest object on the screen is a page, not an empty rectangle. |

_4 files._

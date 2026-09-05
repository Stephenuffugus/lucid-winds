# WORD SPROUT art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/sprout/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-sprout` · native · word · audit impact 4/5 · effort M · audit rank 53

## Background wanted

A painted seed bed along the bottom edge behind the keyboard, fading up through deep green-black to an empty night sky behind the board — quiet enough that the letter tiles stay the brightest thing, but it puts the game's own subject on the screen.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-sprout-540x960.jpg` | 540x960 full-bleed. Bottom 25%: dark tilled soil with one pale sprout breaking through, warm gold key-light from the upper left. Upper 75%: deep green-black graduating to #0d100c, a soft glow where the board sits. Heavy vignette. | The game currently has no background at all beyond the shared shell gradient; every native looks identical because of it. |
| `sprout-stage-96x96-1.png through sprout-stage-96x96-6.png` | Six 96x96 transparent painted growth stages: seed, split husk, two seed-leaves, true leaves, bud, open bloom. Warm rim light from the left, big readable silhouette at 48px. | One stage lights beside the board per guess row used, so the six guesses are a growing plant. Puts the title on the screen and gives the frame a subject. |
| `key-cap-64x84.png` | 64x84 nine-slice PNG: warm dark stone/wood key cap, 2px lit top edge, soft shadow at the bottom, transparent outside the rounded rect. | Replaces the flat rgba(36,42,30,.95) fill on .pw-key so the keyboard reads as objects rather than 26 identical grey boxes. |

_3 files._

# SKYSHOT art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/skyshot/` under the names below; say which landed and the code side wires them.

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

**Game:** `skyshot` · satellite · action · audit impact 4/5 · effort M · audit rank 95

## Background wanted

bg-nightgarden-375x667.jpg, full-bleed: a real night garden looking straight up a warm-lit slingshot from the bottom of the frame, brambles and hedge silhouettes at the left and right edges, the sky opening cold navy toward a moon at top, warm gold lantern haze at ground level so the bottom third has something in it besides scrim. Painted once and drawn under the canvas gradient at low alpha so the existing glow work still reads.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-nightgarden-375x667.jpg` | 375x667 at 1x, export 1125x2001 at 3x, full-bleed no transparency. Night garden looking up: hedge and bramble silhouettes framing left and right, warm lantern haze at the bottom, cold navy sky opening upward, one soft moon top-right. | Replaces the bare linear-gradient sky (index.html:822) and gives the bottom 40% of the title screen something under the #s-title scrim other than a black slab. |
| `moonbud-set-256.png` | One sheet, four cells at 256x256, transparent PNG. Four distinct bud silhouettes: a closed bud, a half-open bud, a wide bloom, and a spiny bramble bud. Cream centre, warm gold petals, cool rim light on the moon-facing edge. | Replaces the identical four-ellipse blob drawn at index.html:966-985 so the three buds on screen stop being one shape at three sizes. |
| `moon-crescent-160.png` | 160x160 transparent PNG, soft-edged. A painted waxing crescent with a faint earthshine disc, warm cream on the lit limb going cool blue in the shadow, no hard terminator line. | Replaces the two-disc crescent that currently photographs as a chipped grey ball, drawn from the MOONX/MOONY radial at index.html:825. |
| `slingshot-plate-220x180.png` | 220x180 transparent PNG. A forked branch slingshot with a leather pouch and a green sprout wound round it, warm rim light from below, sitting on a small mound of soil. | The launcher is currently a green dot on a hairline stem (the AX/AY glow at index.html:899); it is the thing the player aims with and it has no art. |
| `lvlcard-plate-108.png` | 108x108 at 1x, export 324x324 at 3x, transparent PNG with a 22px 9-slice border. Painted stone-and-vine tile in three states: locked (cold, mossed over), next (warm gold edge, lantern lit), cleared (three carved stars). | Replaces the flat #101625 .lvlcard rounded rects (index.html:104-114) so a screen of 24 tiles stops reading as a disabled form. |

_5 files._

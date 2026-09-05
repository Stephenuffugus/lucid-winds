# FAST MATH art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/numbergarden/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-numbergarden` · native · math · audit impact 4/5 · effort M · audit rank 52

## Background wanted

bg-abacus-540x960.jpg - a dim study desk at night: a soroban lying in soft focus across the lower third, a warm lamp pool from the top left, ink-dark falloff at the edges so the keypad reads as lit paper on a dark desk rather than dark boxes on dark nothing.

## Files

| file | spec | replaces |
|---|---|---|
| `abacus-owl-idle.png` | 216x216 transparent (68px at 3x), painted round tawny owl perched on a soroban bead rail, warm gold rim light from the left, big readable silhouette with visible wings and feet, neutral eyes | Fills the live 404 at /assets/games/numbergarden/abacus-owl-idle.png and replaces the flat ellipse SVG. games/numbergarden.js:102 already loads it with an onerror fallback, so dropping the file in is the entire job. |
| `abacus-owl-happy.png` | 216x216 transparent, same owl, arched happy eyes, one wing raised, a faint gold sparkle over the shoulder | The mood system already switches art paths by mood (line 66); happy currently degrades to the same brown blob with a curved line for eyes. |
| `abacus-owl-oops.png` | 216x216 transparent, same owl, tilted head, dropped brow, one bead knocked loose off the rail | Third mood on the same hook; without it a wrong answer changes almost nothing on screen. |
| `sprout-idle.png` | 216x216 transparent, painted sage seedling with two leaf-arms and a face, warm rim light, on a small clay lip | The FLASH ANZAN master mascot at games/numbergarden.js:66; today it renders as a yellow ellipse with two green comma leaves. |
| `bg-abacus-540x960.jpg` | 540x960 full-bleed night study desk with a soroban in soft focus and a warm lamp pool top-left | The game has no background at all; the keypad and mascot float on the same shared gradient as 65 other natives. |

_5 files._

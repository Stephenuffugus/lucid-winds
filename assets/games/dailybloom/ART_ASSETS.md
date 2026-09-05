# DAILY BLOOM art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/dailybloom/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-dailybloom` · native · pattern · audit impact 4/5 · effort M · audit rank 45

## Background wanted

bg-dailybloom-540x960.jpg - a dim greenhouse potting bench before dawn: misted glass panes across the top, out-of-focus seedling trays low, one warm gold lamp glow at bottom-left, top third held near-black so the HUD and the Bebas titles stay readable.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-dailybloom-540x960.jpg` | 540x960 full-bleed JPG, dawn greenhouse interior, misted glass top, blurred seedling trays low, warm gold lamp glow bottom-left, top third near-black | Replaces the shared radial-gradient void; gives the exercise a room to sit in and kills the empty bottom half. |
| `bloom-progress-petals-256x64.png` | 256x64 PNG, transparent, eight 32x32 petal glyphs in filled and unfilled states on one sheet | Replaces the eight plain 10px CSS .DBdot circles so the session progress reads as a flower opening, matching the game's name. |
| `db-domain-icons-384x128.png` | 384x128 PNG, transparent, six 64x64 icons: memory (seed head), attention (eye in leaves), speed (wind), language (etched word), logic (branch fork), reaction (dew drop) | Replaces the Bebas text labels in .DBhubChip and .DBexplainDom, which are currently the only thing marking each exercise's domain. |
| `db-tile-plate-160x64.png` | 160x64 PNG, transparent, 9-slice-safe painted card plate with warm rim light on the top edge and a soft drop shadow | Replaces the flat rgba(26,36,22,0.75) rectangle behind .DBopt and the word-recall tiles so answers read as objects instead of form fields. |

_4 files._

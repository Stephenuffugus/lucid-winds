# TOWER OF HANOI art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/hanoi/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-hanoi` · native · puzzle · audit impact 4/5 · effort M · audit rank 120

## Background wanted

bg-hanoi-bench-540x960.jpg - a greenhouse workbench at night: a deep wooden bench top the plank can rest on, terracotta pots and a watering can blurred at the frame edges, one warm gold lamp from upper-left casting the tower's shadow to the right, top third near-black so the HUD stays readable.

## Files

| file | spec | replaces |
|---|---|---|
| `hanoi-plank-660x120.png` | 660x120 PNG, transparent, a painted worn wood plank with visible grain, cut and chamfered ends, and a soft contact shadow baked into the bottom edge | Replaces the CSS-gradient bar so the base is an object resting on a bench instead of a rounded rectangle with a hard edge. |
| `hanoi-peg-32x220.png` | 32x220 PNG, transparent, a turned wooden dowel with warm rim light on the left, a socket collar at the base, tall enough to stand clear above a full 8-disk stack | Replaces the 7x20px CSS toothpick rods, which are invisible as targets, and gives a rod tall enough that it never has to be drawn over the disks. |
| `hanoi-disk-sheet-1280x160.png` | 1280x160 PNG, transparent, eight 160x160 disks largest to smallest, painted stone and wood rings in sage through gold to terracotta, each with a real top face and a visible centre hole | Replaces the CSS pills - the centre hole lets the rod pass THROUGH the disk and fixes the splinter effect, and distinct materials stop the two green disks sharing a silhouette. |
| `hanoi-win-glow-540x300.png` | 540x300 PNG, transparent, a warm gold bloom with drifting motes, alpha falloff to nothing at the edges | Replaces the leaf and star emoji currently carrying the solved state. |

_4 files._

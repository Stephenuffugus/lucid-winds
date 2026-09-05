# SWEET SPOT art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`docs/art-lists/sweet-spot/` under the names below; say which landed and the code side wires them.

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

**Game:** `sweet-spot` · satellite · action · audit impact 5/5 · effort M · audit rank 90

## Background wanted

A full-bleed painted clay court from the receiving end: raked clay with directional drag marks, chalk lines with worn shoe scuffs, a real net with tape and posts at the current 30% line, a dark hedge or empty stands across the top 15% to close the horizon, warm low sun from the upper left. This is the single change that would transform the game, because right now the background IS the game.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-court-540x960.jpg` | 540x960 full-bleed, painted clay court in receiver POV, raked clay texture, worn chalk lines, net with tape and posts across the upper third, dark hedge/stands across the top 15%, warm low sun from upper left, vignetted corners | Replaces the flat linear-gradient(160deg,#d8552c,#a83c1b) plus five 3px div lines, and fills the 55% of the frame that is currently empty orange |
| `opponent-ready-260x260.png` | 260x260 transparent PNG, painted opponent player in a ready stance seen from behind the net, rim-lit from upper left, big readable silhouette, sized to stand just above the net line | Gives the empty upper court a subject and a sense of depth; there is currently nothing to look at above the timing bar |
| `racket-swing-320x220.png` | 320x220 transparent PNG, foreground racket head entering from the bottom-left on the swing, strings with slight motion blur, warm rim light on the frame | Anchors the timing bar to a physical action; the bar currently floats as an abstract gauge with no connection to tennis |
| `ball-felt-96x96.png` | 96x96 transparent PNG, painted felt tennis ball with the seam curve, fuzz edge and a warm rim highlight, neutral enough to be tinted by the existing ball-skin gradients | Replaces #ball, an 18px CSS circle with border-radius:50% and a flat var(--gold) fill; the shop sells 11 ball skins that are all just radial-gradients |
| `net-tape-540x120.png` | 540x120 transparent PNG, painted net band with white tape, visible mesh and a slight centre sag, soft shadow cast onto the clay below | Replaces .court .net {height:3px;background:var(--line)}, which is indistinguishable from the baselines and does not read as a net |

_5 files._

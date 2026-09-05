# YACHT-SEA art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/yahtzee/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-yahtzee` · native · dice · audit impact 4/5 · effort L · audit rank 118

## Background wanted

A painted felt ground in the house palette instead of the navy CSS ramp - a dice porch at night, deep teal-green baize under a warm lamp pool. If the Director wants the nautical theme kept, then commit to it with a painted harbour-night backdrop rather than a flat three-stop gradient pretending to be one.

## Files

| file | spec | replaces |
|---|---|---|
| `score-icons-13-832x64.png` | 832x64 transparent strip, 13 frames of 64x64: buoy, oars, shell, sail, compass, anchor, fish school, fleet, full deck, wake, current, yacht, tide. One painted set - one light source from top-left, one line weight, warm rim light, sage/gold/cream with a touch of rose. | Replaces the 13 mismatched emoji at games/_inline/yahtzee.js:49-61. This alone lifts the scorecard from ransom note to a designed object, and it is the biggest single visual win in the game. |
| `felt-pan-1120x1120.jpg` | 1120x1120 tileable. Painted felt/baize in deep teal-green, visible nap texture, a warm lamp falloff pooling at the top-centre, edges darkening. | Replaces the SVG-turbulence-over-navy-gradient stack in #Ypan and pulls the game back into the midnight greenhouse palette, which then lets the dice hue-rotate hack be deleted. |
| `bg-yacht-sea-540x960.jpg` | 540x960 full-bleed. A porch at night looking out over dark water: deep sage-black sky, one warm lantern glow top-left, a low band of water at the bottom, centre kept quiet so the scorecard stays legible over it. | Replaces the shared 66-game shell gradient behind the pan, so the game has a room instead of the default corridor. |
| `total-plate-680x120.png` | 680x120 transparent. A worn brass nameplate with a warm inner glow, hand-punched edges and two small rivets, sized to sit behind the TOTAL row. | The final score is the biggest number in the game and currently sits on a plain gold-bordered rectangle built from two rgba stops. |

_4 files._

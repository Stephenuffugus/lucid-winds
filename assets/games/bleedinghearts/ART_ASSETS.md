# BLEEDING HEARTS art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`assets/games/bleedinghearts/` under the names below; say which landed and the code side wires them.

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

**Game:** `play-bleedinghearts` · native · card · audit impact 4/5 · effort M · audit rank 127

## Background wanted

bg-hearts-540x960.jpg - a wine-dark parlour: worn burgundy baize, a brass lamp pool falling top-centre, the edge of a dark wood table and a spilled hand of cards at the lower corner, dropping to near-black at the bottom edge. Keeps the existing colour story and gives the two gold panels something to sit on instead of a bare gradient.

## Files

| file | spec | replaces |
|---|---|---|
| `trick-well-300x200.png` | 300x200 PNG-32 with alpha, a painted oval felt inlay ringed with a thin brass bead, dark centre, soft inner shadow, transparent outside the oval. | Fills the empty rgba(26,31,23,0.3) rectangle that is the centre of the table and the biggest dead area in the frame. |
| `bg-hearts-540x960.jpg` | 540x960 full-bleed wine parlour with a lamp pool top-centre, falling to near-black at the bottom. | Replaces the flat CSS gradient and removes the hard rounded edge where the maroon panel meets the shell's green radial. |
| `queen-spades-96x134.png` | 96x134 PNG-32 transparent, a painted Q-of-spades face in the floral deck's line-art style, with a faint red bleed at the edges. | The Queen of Spades is this game's signature card and currently gets only a dark-red CSS border and a box-shadow aura. One painted card would give the whole game a hero image. |
| `suit-{spade,heart,diamond,club}-64.png` | 64x64 PNG-32 transparent, downsampled from assets/decks/floral/suit-*.png (currently 993KB-1.6MB each). | Same shared fix as Cribbage: the painted pips are unusable at 1-2MB apiece, so emoji win by default on every card in hand. |

_4 files._

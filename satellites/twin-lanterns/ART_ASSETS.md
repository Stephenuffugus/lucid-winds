# TWIN LANTERNS art asset list

Written Sep 05 2026 from the fleet art audit (Sep 04, every game shot at 375x667 and looked at) and
the games pass that followed. This is the ask for the image lane. Finished files go in
`satellites/twin-lanterns/` under the names below; say which landed and the code side wires them.

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

**Game:** `twin-lanterns` · satellite · party · audit impact 4/5 · effort M · audit rank 47

## Background wanted

A painted night garden, 750x1334 full-bleed: deep near-black ground, sage foliage silhouettes down both sides, a stone path of pale glowing stones receding to the centre, and two warm lantern glows at the near corners. Held very dark so the 56px grid cells still read on top of it. This is the single change that would carry the whole game - it is the only screen furniture the design needs.

## Files

| file | spec | replaces |
|---|---|---|
| `bg-night-garden-750x1334.jpg` | 750x1334 JPG, full-bleed, painted night garden: near-black ground, sage foliage silhouettes at the edges, pale stone path receding, two warm lantern glows low in frame, values kept under about 20% so UI reads. | Replaces the single radial gradient on body. It is the entire visual identity of the game and it does not exist. |
| `lantern-lit-256.png and lantern-dark-256.png` | Two 256x256 PNGs, transparent, painted brass lantern - one with a warm lit flame and a glow, one cold and unlit. | Replaces the 32px inline SVG on .cell.lantern (which is deliberate and correct but is a 24-viewbox line drawing), and gives the title screen and the pair screen a real object to show. |
| `stone-lit-192.png and stone-dark-192.png` | Two 192x192 PNGs, transparent, painted river stone - one warm-lit with a soft inner glow, one dark and wet. | Replaces .cell.stone, which is currently a #2b2a18 fill with an inset box-shadow and a typographic star pushed in through ::after. |
| `help-icons-5x128.png` | One sheet, 5 cells at 128x128, transparent: lantern, gift stone in a palm, a thought mark, two hands passing a phone, a flame. One painted style, warm rim light. | Replaces the five mismatched emoji in the How to play gutter, including the conifer that currently stands in for 'hand the phone over'. |

_4 files._

# WHISTLESTOP, the art it reads and the art it does without

Whistlestop ships with **zero image files** and looks finished, because the
track and the trains are drawn by code and have to stay drawn: they rotate,
they snap, and a curve has to meet a straight exactly. Nothing below is needed
to play it. Everything below is an upgrade, and the code either reads it or
ignores it silently.

The three sheets are written as paste ready prompts in
`plans/whistlestop/ART-PACK-WHISTLESTOP.md`.

| File Stephen delivers | Used for | Delivered at | In the game as | Read by |
|---|---|---|---|---|
| `rug.png` | the ground, tiled | 1:1, seamless | `art/rug.jpg` 1024x1024 q75, under 220 KB | not wired yet, see below |
| `props.png` | tree, station, tunnel mountain, cow, water tower, all on white, one sheet | 1:1 | `art/prop-<name>.png`, cut and keyed by Fable | not wired yet, see below |
| `icon-mark.png` | the PWA icon, if it beats the drawn one | 1:1 | `icon-512.png`, `icon-192.png`, `icon-maskable-512.png` | `tools/icons.mjs` |

## What is drawn by code, and stays drawn

- **The track.** Two tones of maple, two routed grooves, a joint disc at every
  end. It has to be drawn because a piece is a shape at an arbitrary angle and
  a joint has to close exactly.
- **The trains.** The engine is the dark head with a black funnel and the cars
  are a lighter tint of the same colour, so a child can see the front of the
  train from across the rug. They rotate and mirror; a bitmap would have to be
  drawn eight ways.
- **The stations, the levers, the buffer stops.** All keyed to the puzzle's own
  colours, which are data.
- **The rug and the floor.** A clay wool with a weft and a warp, a border band,
  a fringe on the short ends, and floorboards under it.
- **The scenery.** Trees, bushes, a station house, a water tower and a cow,
  placed in GROUPS (a copse, a yard, a field) around the railway.

## If the two painted sheets arrive

Neither is wired, on purpose: a painted rug and painted props are a real
improvement and also a real risk of making the wooden track harder to read
against them, which is the one thing this game cannot afford. The hook to add
is small and is written down here so the next session does not have to work it
out:

- `drawRug` fills `rugRect()` with `PAL.rug` and then draws the weave. To use a
  painted tile: create an `Image` at boot with `onerror` leaving the drawn rug
  alone, and if it loads, `createPattern` it and fill the same rect. **Check
  the contrast first:** the boot gate asserts the wood is at least 40 points of
  luminance lighter than the wool, and a painted rug has to keep passing it.
- `drawProps` draws each prop by kind. To use painted props: key an image per
  kind, draw it at the same base point with the same shadow under it, and keep
  the cow's head as a drawn overlay, because it moves.

## What is deliberately absent

No music, no recorded audio at all: every sound is synthesised in about eighty
lines, which is why the whole game is one file and works with no network.

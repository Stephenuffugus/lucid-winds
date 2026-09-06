# Fathom art assets

**Fathom ships with zero image files and looks finished**, because sonar line art on black IS the
design. Everything below is an upgrade for the title screen and the shelf, and the game must never
wait on any of it. If a file is absent the code draws what it draws today and nothing breaks.

Prompts to paste are in `plans/fathom/ART-PACK-FATHOM.md`.

## What the code already reads

| Path in the game | What it is | What happens if it is missing |
|---|---|---|
| `art/title-bg.jpg` | title backdrop behind the drawn word, painted in at 35 percent | an `Image` with an `onerror`; the drawn title stands alone, which is what ships today |

Nothing else. There is no sprite, no font file, no audio file: every sound is synthesised in
`AUDIO` and every shape is a stroke in `VIEW`.

## What Stephen delivers, when his Midjourney month allows

| File he delivers | Used for | Delivered size | In game |
|---|---|---|---|
| `title-bg.png` | the title backdrop | 9:16 | `art/title-bg.jpg`, 900x1600, q80, under 300 KB. **The host resizes anything over 1600 px**, so never deliver larger |
| `key-art.png` | the arcade tile and a store tile | 1:1 | `docs/thumb.png` at 512, under 150 KB. Also the source for a painted icon if it reads at 48 px |
| `icon-mark.png` | the PWA icon and the favicon, if better than the drawn one | 1:1 | 512, 192, and a maskable 512 with the mark inside the **central 80 percent** (Android crops maskables to an arbitrary shape, and a radius over 50 in viewBox units collapses the tile to a circle whose corners composite to black on iOS) |

## What is generated, and by what

| File | Made by | Notes |
|---|---|---|
| `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` | `node tools/icons.mjs` | one motif: a stone under the water with one ring going out and cave walls lit where the ring has reached them. The first pass read as a camera aperture with an eye in the middle and was redrawn |
| `docs/thumb.png` | `node tools/thumb.mjs` | shot from the RUNNING game, in a generated deep cave because cave one opens in a rectangle and a rectangle photographed square is a rectangle. The tool refuses to write a tile that is under 0.6 percent lit |
| `docs/shots/*.png` | `node tools/shots.mjs`, and the gates | evidence, under 200 KB each, at 412, 375 and 320 |

## The palette, which is the whole art direction

```
background   #000000   nothing is ever painted on it that sound did not reveal
walls        #9FE8FF   cold cyan white, a wide low alpha stroke under a thin bright one
just lit     #ffffff   the crest, for 220 ms, running along a wall behind the ring
pickups      #FFC97A   warm amber: caches, pearls, the exit crystal
lurkers      #FF5A4D   dim red, DOTS on an undulating body, never a polyline
you          #7FD8CC   soft teal, a radial glow 20 units across
```

**No shadowBlur, ever.** Six hundred segments with a blur is a slideshow on a phone. The look is a
wide low alpha stroke under a thin bright one, and `tools/lint.mjs` fails the build if `shadowBlur`
appears anywhere in the code.

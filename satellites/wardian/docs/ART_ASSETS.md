# WARDIAN, art

Everything in the game is drawn by code tonight. This file is the list of what
painted art would replace, what it has to be, and what happens to the drawn
version when it arrives. The app never waits on any of it.

Sheets live in `plans/wardian/ART-PACK-WARDIAN.md` and in 012Assets as
`Wardian — Art Pack`.

## What is drawn by code right now

| Thing | Where | Notes |
|---|---|---|
| the room and its window | `drawRoom` | three backdrops: a windowsill, a desk lamp, a cold room |
| the jar, rim and base | `jarPath`, `drawBackGlass`, `drawFrontGlass` | a rounded rect with a brass rim, a radial sheen and beads |
| the soil | `drawSoil`, `soilY` | a mounded curve, one gradient down the depth, crumbs, pebbles and old roots |
| moss | `drawMoss` | one path per run of covered cells, with fur over it |
| the eight flora | `drawPlant`, `drawFrond`, `drawBlade`, `drawDroplet`, `drawRay`, `drawFruit` | segment trees; the frond unrolls from a crozier over forty ticks |
| the three fauna | `drawAgents` | springtail dots, a pillbug that rolls, a beetle with a light and a trail |
| stones and driftwood | `drawHardscape` | set INTO the soil with a contact shadow |
| weather | `drawWeather` | rain down the outside of the glass, frost creeping in at the corners |
| the hour | `drawLight`, `TINTS`, `VEIL` | a veil, not added light |
| journal plates | `drawPlate` | the SAME renderer, in pencil on cream, fitted to each species |
| the icons | `tools/icons.mjs` | a jar with a fern, drawn as SVG and rendered to PNG |

## What painted art would replace

| File | Replaces | Delivered | In game |
|---|---|---|---|
| `room-backdrop.png` | `drawRoom`'s wall and table | 9:16 | `art/room.jpg` 900x1600 q80, drawn behind everything, the code version stays as the fallback |
| `jar-glass.png` | the front glass only | 3:4 with alpha | `art/jar.png` 1200x1600, drawn over the contents; the rim, sheen and beads come out of `drawFrontGlass` and the beads move back on top |
| `journal-plates.png` | the eleven plates | 1:1 sheet | cut to `art/plates/<species>.png` 256x256; `drawPlate` keeps working for anything not yet painted |
| `icon-mark.png` | the drawn icon | 1:1 | 512, 192 and maskable 512 through `tools/icons.mjs` |

Every one of them is loaded behind an `onerror` that falls back to the drawn
version, so a missing file is a slightly plainer jar and never a broken one.

## The palette

```
--room   #17120E   the wall
--panel  #241C15   sheets and chips
--brass  #C9A24B   the rim, the type, the one bright accent
--leaf   #7BB264   a fern at noon (the hour tints it)
--cream  #EDE3D2   text
--paper  #EFE4C8   the journal page
```

The hour moves every colour in the jar through `TINTS` and `VEIL`. Anything
painted has to hold up under a warm noon veil and a cold night one, so paint it
neutral and let the veil do the hour.

## Rules that any painted version has to keep

- The jar is drawn in two halves, back and front, with everything living
  between them. A single flat jar image cannot go in front of the plants.
- The glass has ONE sheen, feathered on every side. A gradient poured into a
  rectangle leaves a seam down the picture.
- Nothing painted may sit in the bottom left 120 by 120: that corner belongs to
  the fleet music chip.
- No text in any painted asset. Every word in this game comes from `WORDS`.

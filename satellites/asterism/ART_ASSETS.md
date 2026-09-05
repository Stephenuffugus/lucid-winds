# Asterism art assets

**Asterism ships with no image files and looks finished**, because the sky is drawn from the real
catalogue and the type is a system serif. Everything below is an upgrade. The app must never wait on
any of it: each path is read behind an `onerror` that leaves the drawn version alone.

Prompts to paste are in `plans/asterism/ART-PACK-ASTERISM.md`.

## What the code will read, when the files exist

| Path | What it is | If it is missing |
|---|---|---|
| `art/plate-frame.png` | the Plate poster border, empty centre | the Plate layout draws its own double rule and corner roundels, which is what ships today |
| `art/parchment.jpg` | the myth sheet and the almanac spread, tiled at 20 percent | the sheet is a CSS gradient, which is what ships today |
| `art/hills.png` | the ground silhouette | the horizon is drawn from a fixed noise, ragged, with a breath of skyglow above it |
| `icon-mark.png` | a painted PWA icon, only if it beats the drawn one | `tools/icons.mjs` draws four stars joined by a gold line |

## What Stephen delivers

| File | Delivered | In game |
|---|---|---|
| `plate-frame.png` | 4:5 | `art/plate-frame.png` at 1200x1500. **The host resizes anything over 1600 px on a side**, so never deliver larger; it is drawn scaled up at 2048x2560 on export |
| `parchment.png` | 1:1 | `art/parchment.jpg` 1024x1024 q75 |
| `hills.png` | wide, keyed from white | `art/hills.png` 1600x400 with alpha |
| `icon-mark.png` | 1:1 | 512, 192, and a maskable 512 with the mark inside the **central 80 percent** |

## What is generated, and by what

| File | Made by |
|---|---|
| `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` | `node tools/icons.mjs` |
| `docs/thumb.png` | `node tools/thumb.mjs`, from the RUNNING app: three real taps join the Summer Triangle over Columbus on a frozen July night, one real drag centres it, and the tool refuses a tile with no sky or no gold in it |
| `docs/shots/*.png` | `node tools/shots.mjs`, at 412, 375 and 320, evidence at 1.5x and under 200 KB each |

## The catalogue is not art, and it has a licence

`data/hyg-asterism.json` is the HYG database v4.4 by David Nash, **CC BY SA 4.0**. It is a separate
file on purpose so the share alike obligation attaches to the data rather than to the whole app, and
the credit appears in the About sheet and on every exported poster. Whether that is enough before a
paid store is Stephen's question, not a session's (plan 3.2 and section 10).

## The palette, which is the whole art direction

```
sky, true dark    #070A1A     the base under everything
sky, twilight     #0E1836     sun between 18 and 6 degrees below
sky, dusk         #1B2A55     sun between 6 below and the horizon
the pen           #E8C97A     chalk gold, 1.5 px, with a waver and an ease
a picked star     a gold radial glow, never a ring
type              #E8E2D2 on the sky, #2A2318 on the parchment
the serif         Georgia, Iowan Old Style, Palatino Linotype, Book Antiqua, Times New Roman
```

Star colour comes from the catalogue's colour index and is pulled back toward white as a star dims,
because a faint star has no colour to the eye. That is the single most important rule in the render:
without it the sky is confetti.

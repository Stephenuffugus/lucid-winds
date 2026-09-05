# Fathom art pack

Three sheets, paste ready. **The game ships finished without any of them**: sonar line art on black
IS the design, and `satellites/fathom/ART_ASSETS.md` lists the exact paths the code reads so a drop
can be wired in ten minutes. Nothing waits on this.

The `--ar` and `--style` flags below are Midjourney syntax, not player copy; the no dashes law
applies to what a player reads, and none of this is read by a player.

---

## 1. `title-bg.png` — the backdrop behind the drawn word

Painted in at 35 percent opacity behind a stroked cyan FATHOM, so it must be **dark, quiet and
bottom heavy**, with nothing important in the middle third where the word sits.

```
a flooded limestone cave chamber seen from underwater, almost total darkness, one
faint cold cyan glow far below picking out the edges of rock shelves and a still
water surface, bioluminescent, no creature, no diver, no light source visible,
deep blue black, fine grain, painterly, wide empty space in the upper middle,
--ar 9:16 --style raw --stylize 250
```

Second angle, if the first is too busy:

```
the mouth of a submerged cave passage in near total black, a single ring of pale
cyan light expanding through the water and catching the rock walls where it
touches them, everything else unlit, minimal, quiet, no creature, no text,
--ar 9:16 --style raw --stylize 200
```

Delivered 9:16. Goes in as `art/title-bg.jpg`, 900x1600, q80, under 300 KB. **The host resizes
anything over 1600 px**, so never deliver larger than that.

---

## 2. `key-art.png` — the arcade tile and a store tile

Square, and it has to read at 150 px on a shelf next to a hundred other tiles, so: one shape, one
light, no small detail.

```
a small pale stone sinking through black water with one expanding ring of cold
cyan light around it, the ring catching fragments of cave wall where it passes
them, everything else pure black, sonar, minimal, high contrast, no text,
--ar 1:1 --style raw --stylize 150
```

Warmer alternative, if the cyan reads cold on the shelf:

```
pitch black water, a single warm amber crystal glowing faintly far off, and a
ring of cold cyan light expanding toward it from the near corner, only the rock
the ring has touched is visible, minimal, no creature, no text,
--ar 1:1 --style raw --stylize 150
```

Goes in as `docs/thumb.png`, 512 square, under 150 KB. Fable moves it to
`portal-assets/thumbs/fathom.png`.

---

## 3. `icon-mark.png` — the PWA icon, only if it beats the drawn one

The drawn icon is already shipped (`node tools/icons.mjs`). A painted one only replaces it if it
reads better at 48 px.

```
app icon, a single expanding ring of cold cyan light on pure black with one small
warm dot at its centre and two short fragments of cave wall lit where the ring
touches them, flat, minimal, centred, no text, no gradient background,
--ar 1:1 --style raw --stylize 100
```

Three files come out of one square: 512, 192, and a **maskable 512 with the mark inside the central
80 percent**. Android crops maskable icons to an arbitrary shape and only the central 80 percent is
guaranteed visible, and a corner radius over 50 in viewBox units collapses the tile to a circle
whose transparent corners composite to BLACK on an iOS home screen.

---

## What NOT to draw

- **No eye.** The player is blind. The first drawn icon put an amber dot in a dark halo at the
  centre of a ring and it read as a pupil.
- **No aperture, no reticle, no crosshair.** A ring with symmetrical radial ticks reads as a camera.
- **No creature on the tile.** The lurkers are only ever seen as a fading ghost of where they were,
  and a picture of one on the shelf gives away the only thing the game keeps hidden.
- **No diver, no torch, no helmet light.** There is no light in this game except the sound.

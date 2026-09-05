# Airworthy, Art Pack (four sheets, paste ready)

**For:** Stephen's Midjourney month. Relax mode, four variations per prompt, upscale only the pick. The plane is drawn by
code (it is re-folded for every design) and stays drawn. These sheets are the far layers of the two courses, the workshop
paper, and the icon. Bring the PNGs to `satellites/airworthy/art-drop/` (never overwrite a raw file) and the ART-LEDGER row
moves from LISTED to DROPPED.

**The look, in one line:** a paper craft diorama. Courses built from cardboard, construction paper and tape, soft afternoon
light through high windows, warm workshop nostalgia.

**Locked suffix for every Airworthy prompt** (paste it on the end of each one; reuse the seed of the first pick):

```
--style raw --s 170 --chaos 5 --no text, letters, numbers, watermark, people, faces, hands, airplanes
```

---

## Sheet 1 of 4: The Gym (21:9)

File back: `gym-backdrop.png`. The far layer of The Gym, parallaxed behind the flight; nothing in the foreground.

```
a school gymnasium built as a paper craft diorama, cardboard walls, construction paper bleachers, tape lines on a wooden floor, tall high windows with soft afternoon light, a paper banner hanging from the rafters, wide panorama, everything far away, empty middle air, warm and nostalgic --ar 21:9
```

## Sheet 2 of 4: The Backyard (21:9)

File back: `backyard-backdrop.png`. The far layer of The Backyard.

```
a suburban backyard built as a paper craft diorama, a cardboard fence, a construction paper tree, a little grill with a curl of tissue paper smoke, a clothesline with paper shirts, a box fan on the patio, late afternoon light, wide panorama, empty middle air, warm and playful --ar 21:9
```

Pick, for both, the one with the most empty air across the middle; the plane flies through it.

## Sheet 3 of 4: Paper (1:1, tileable)

File back: `paper.png`. The workshop sheet, tiled.

```
seamless tileable texture of plain white printer paper with a faint fibre grain, evenly lit, no creases, no edges, no lines, flat, subtle, repeating pattern --ar 1:1 --tile
```

## Sheet 4 of 4: Icon mark (1:1)

File back: `icon-mark.png`. The PWA icon, only if it beats the drawn one; the mark inside the central 80 percent.

```
app icon, a single white folded paper airplane seen from three quarters above, crisp creases, a soft shadow, on a warm cardboard brown background, centred, generous margin, flat paper craft style, no border, no text --ar 1:1
```

---

## Delivery table

| Sheet | Ratio | File back | Where it lands |
|---|---|---|---|
| 1 The Gym | 21:9 | `gym-backdrop.png` | `satellites/airworthy/art/gym.jpg` 1600x686 q80 |
| 2 The Backyard | 21:9 | `backyard-backdrop.png` | `satellites/airworthy/art/backyard.jpg` 1600x686 q80 |
| 3 Paper | 1:1 tile | `paper.png` | `satellites/airworthy/art/paper.jpg` 1024x1024 q75 |
| 4 Icon mark | 1:1 | `icon-mark.png` | `icon-512.png`, `icon-192.png`, `icon-maskable-512.png` |

# Updraft, Art Pack (four sheets, paste ready)

**For:** Stephen's Midjourney month. Relax mode, four variations per prompt, upscale only the pick. The kite, the line and
the tail are drawn by code and stay drawn. Bring the PNGs to `satellites/updraft/art-drop/` (never overwrite a raw
file); the ART-LEDGER row moves to DROPPED.

**The look, in one line:** a Peanuts field on the first day of spring. Painterly flat layers, big cumulus, one oak,
wildflowers.

**Locked suffix for every Updraft prompt** (reuse the seed of the first pick):

```
--style raw --s 180 --chaos 5 --no text, letters, watermark, people, hands, faces, kites
```

## Sheet 1 of 4: Field (9:16)

File back: `field.png`. The bottom layer: grass and far hills, the sky left mostly empty because the code draws the clouds
and the time of day.

```
a wide grassy field with wildflowers in the foreground and soft far hills, painterly flat layers, the upper two thirds a plain pale spring sky with no clouds, tall portrait composition, warm and gentle, no trees in the centre --ar 9:16
```

## Sheet 2 of 4: Mabel the oak (1:1)

File back: `mabel.png`. One big oak on white, keyed by Fable.

```
a single big old oak tree in full leaf on a pure white background, painterly flat style, wide crown, a swing rope hanging from one branch, warm light, no ground, no shadow on the ground --ar 1:1
```

## Sheet 3 of 4: Kites (1:1)

File back: `kites.png`. Five kites on white, spaced apart: a diamond, a delta, a box kite, a sled kite, a long dragon kite
with a serpent tail. For the picker cards only.

```
product sheet on pure white, five different kites laid out with space between them: a classic diamond kite in red and yellow, a triangular delta kite in blue, a box kite in green and white, a soft sled kite in orange, a long chinese dragon kite with a serpent tail, painterly flat style, no strings, no background --ar 1:1
```

## Sheet 4 of 4: Icon mark (1:1)

File back: `icon-mark.png`. The PWA icon, only if it beats the drawn one.

```
app icon, a small red diamond kite high in a pale blue sky with a long ribbon tail curling behind it and a thin line bowing down out of frame, flat painted style, centred, generous margin, no border, no text --ar 1:1
```

## Delivery table

| Sheet | Ratio | File back | Where it lands |
|---|---|---|---|
| 1 Field | 9:16 | `field.png` | `satellites/updraft/art/field.jpg` 900x1600 q80 |
| 2 Mabel | 1:1 | `mabel.png` | `satellites/updraft/art/mabel.png` 800x800 with alpha |
| 3 Kites | 1:1 | `kites.png` | `satellites/updraft/art/kite-<id>.png` 256x256 cut by Fable |
| 4 Icon mark | 1:1 | `icon-mark.png` | `icon-512.png`, `icon-192.png`, `icon-maskable-512.png` |

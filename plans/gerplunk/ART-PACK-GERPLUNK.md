# Gerplunk, Art Pack (three sheets, paste ready)

**For:** Stephen's Midjourney month. Relax mode, four variations per prompt, upscale only the pick. The water is drawn by
code and stays drawn. Sheet 1 can be Stephen's own photograph of the real treeline instead of a prompt; the code only
needs a silhouette. Bring the PNGs to `satellites/gerplunk/art-drop/` (never overwrite a raw file); the ART-LEDGER row
moves to DROPPED.

**The look, in one line:** a lake at golden hour, from the shore, built like a memory. Warm dusk gradient, dark treeline,
nothing busy.

**Locked suffix for every Gerplunk prompt** (reuse the seed of the first pick):

```
--style raw --s 170 --chaos 5 --no text, letters, watermark, people, boats, houses, faces
```

## Sheet 1 of 3: Treeline (21:9)

File back: `treeline.png`. The far shore as a pure black silhouette on pure white; Fable keys the white away.

```
a far lake shore treeline of pines and hardwoods with one taller pine, drawn as a pure black silhouette on a pure white background, no gradient, no water, no sky, no grey, clean hard edge, wide panorama --ar 21:9
```

## Sheet 2 of 3: Stones (1:1)

File back: `stones.png`. The eight stones on white, one sheet, spaced apart: sandstone, shale, a rough granite chunk, a
perfect flat oval skimmer, a heavy flat, a piece of green sea glass, a fossil stone with a crinoid print, a lucky clear
quartz.

```
product sheet on pure white, eight different small stones laid out in two rows with space between them: a tan sandstone, a grey shale, a rough granite chunk, a perfectly flat oval grey skimming stone, a heavy flat dark stone, a piece of frosted green sea glass, a stone with a small fossil crinoid print, a clear quartz pebble, soft warm light from the left, photoreal, no background --ar 1:1
```

## Sheet 3 of 3: Icon mark (1:1)

File back: `icon-mark.png`. The PWA icon, only if it beats the drawn one; the mark inside the central 80 percent.

```
app icon, a flat grey stone skipping across warm golden water leaving three small rings behind it, dusk light, flat painted style, centred, generous margin, no border, no text --ar 1:1
```

## Delivery table

| Sheet | Ratio | File back | Where it lands |
|---|---|---|---|
| 1 Treeline | 21:9 | `treeline.png` | `satellites/gerplunk/art/treeline.png` 1600x400 with alpha |
| 2 Stones | 1:1 | `stones.png` | `satellites/gerplunk/art/stone-<id>.png` 256x256 cut by Fable |
| 3 Icon mark | 1:1 | `icon-mark.png` | `icon-512.png`, `icon-192.png`, `icon-maskable-512.png` |

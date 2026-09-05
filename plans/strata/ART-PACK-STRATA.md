# Strata, Art Pack (three sheets, paste ready)

**For:** Stephen's Midjourney month. Relax mode, four variations per prompt, upscale only the pick. Bones, sediment and
dust are drawn by code and stay drawn (every skeleton is generated). Bring the PNGs to `satellites/strata/art-drop/`
(never overwrite a raw file); the ART-LEDGER row moves to DROPPED.

**The look, in one line:** field journal romance. Canvas tents, tan paper, careful hands, a warm museum hall with brass
placards.

**Locked suffix for every Strata prompt** (reuse the seed of the first pick):

```
--style raw --s 160 --chaos 5 --no text, letters, watermark, people, hands, faces, dinosaurs, skeletons
```

## Sheet 1 of 3: Journal paper (1:1, tileable)

File back: `journal-paper.png`. Under the journal and the plates.

```
seamless tileable texture of tan field notebook paper with faint fibre and a very light age tone, evenly lit, no creases, no lines, no marks, flat, repeating pattern --ar 1:1 --tile
```

## Sheet 2 of 3: Museum hall (21:9)

File back: `hall.png`. The hall with no exhibits: warm wood floor, tall windows, empty space along the middle for plinths.

```
a warm natural history museum hall with a polished wood floor, tall arched windows with afternoon light, cream walls with brass fittings, completely empty of exhibits, wide panorama, painterly, calm --ar 21:9
```

## Sheet 3 of 3: Icon mark (1:1)

File back: `icon-mark.png`. The PWA icon, only if it beats the drawn one.

```
app icon, a small brush sweeping tan dust off a single pale fossil bone half buried in layered sediment bands of ochre and rust, flat painted style, centred, generous margin, no border, no text --ar 1:1
```

## Delivery table

| Sheet | Ratio | File back | Where it lands |
|---|---|---|---|
| 1 Journal paper | 1:1 tile | `journal-paper.png` | `satellites/strata/art/paper.jpg` 1024x1024 q75 |
| 2 Hall | 21:9 | `hall.png` | `satellites/strata/art/hall.jpg` 1600x686 q80 |
| 3 Icon mark | 1:1 | `icon-mark.png` | `icon-512.png`, `icon-192.png`, `icon-maskable-512.png` |

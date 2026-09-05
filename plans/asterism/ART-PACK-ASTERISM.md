# Asterism, Art Pack (four sheets, paste ready)

**For:** Stephen's Midjourney month. Relax mode, four variations per prompt, upscale only the pick. The app ships with no
image files: the sky is real stars drawn by code, the parchment is CSS, the ground is a drawn silhouette, the Plate poster has
a drawn border. These four sheets are upgrades. Bring the PNGs to `satellites/asterism/art-drop/` (never overwrite a raw
file) and the ART-LEDGER row moves from LISTED to DROPPED.

**The look, in one line:** a vintage celestial atlas, engraved, cream ink on deep indigo, gold hairlines, planetarium hush.
Nothing sci fi, nothing neon.

**Locked suffix for every Asterism prompt** (paste it on the end of each one; reuse the seed of the first pick on the others):

```
--style raw --s 150 --chaos 5 --no text, letters, numbers, watermark, people, faces, planets, moon
```

---

## Sheet 1 of 4: Plate poster frame (4:5)

File back: `plate-frame.png`. The border for the Plate poster layout. The centre must be EMPTY deep indigo; the app draws
the stars and the myth inside it. Delivered at 1200x1500 (the host resizes anything over 1600 px); drawn at 2048x2560.

```
an ornate engraved border frame for a vintage celestial atlas plate, cream and pale gold fine line engraving on deep indigo, corner ornaments of laurel and small compass roses, a thin double rule inside the ornaments, the entire centre of the image left as empty flat deep indigo with no stars and no drawing, symmetrical, antique copperplate engraving style, high detail on the border only --ar 4:5
```

Pick the one whose centre is truly empty and whose border is symmetrical; a border that leans is useless.

## Sheet 2 of 4: Parchment (1:1, tileable)

File back: `parchment.png`. Tiled at 20 percent opacity under the myth text and the almanac spread.

```
seamless tileable texture of old parchment paper, warm cream with faint fibre and gentle mottling, no creases, no burns, no edges, no writing, evenly lit, subtle, flat, repeating pattern --ar 1:1 --tile
```

Pick the flattest one; anything with a visible edge or a dark blotch will show as a repeat.

## Sheet 3 of 4: Ground silhouette (wide)

File back: `hills.png`. The horizon strip: rolling hills and a treeline in pure black on pure white, so Fable can key the
white to transparent. Ohio first; a Pennsylvania treeline skin later.

```
a horizon strip of gently rolling Ohio farm hills with a scattered treeline and one small barn, drawn as a pure black silhouette on a pure white background, no gradient, no sky, no stars, no grey, clean hard edge, wide panorama --ar 21:9
```

Pick the one with the most white and the cleanest edge; the hills should sit in the bottom third.

## Sheet 4 of 4: Icon mark (1:1)

File back: `icon-mark.png`. The PWA icon, only if it beats the drawn one; the mark must sit inside the central 80 percent.

```
app icon, seven small cream stars joined by a thin gold hairline into a simple asterism shape on deep indigo, centred, generous margin, flat engraved line style, three colours only cream gold and indigo, no border, no text --ar 1:1
```

Pick the one with the fewest strokes. If none beats the drawn icon, skip it.

---

## Delivery table

| Sheet | Ratio | File back | Where it lands |
|---|---|---|---|
| 1 Plate frame | 4:5 | `plate-frame.png` | `satellites/asterism/art/plate-frame.png` 1200x1500 |
| 2 Parchment | 1:1 tile | `parchment.png` | `satellites/asterism/art/parchment.jpg` 1024x1024 q75 |
| 3 Hills | 21:9 | `hills.png` | `satellites/asterism/art/hills.png` 1600x400 with alpha (Fable keys it) |
| 4 Icon mark | 1:1 | `icon-mark.png` | `icon-512.png`, `icon-192.png`, `icon-maskable-512.png` |

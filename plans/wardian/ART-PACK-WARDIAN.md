# Wardian, Art Pack (four sheets, paste ready)

**For:** Stephen's Midjourney month. Relax mode, four variations per prompt, upscale only the pick. The app ships with no
image files: the jar, the plants and the bugs are drawn by code and grow by code. These sheets dress the room, the glass and
the journal. Bring the PNGs to `satellites/wardian/art-drop/` (never overwrite a raw file) and the ART-LEDGER row moves from
LISTED to DROPPED.

**The look, in one line:** a snow globe that is actually alive. Soft flat vector shading, warm dark room, thin glass with one
specular streak, cream paper journal with pencil drawings. Quiet, miniature, slightly magical.

**Locked suffix for every Wardian prompt** (paste it on the end of each one; reuse the seed of the first pick on the others):

```
--style raw --s 160 --chaos 5 --no text, letters, watermark, people, hands, faces
```

---

## Sheet 1 of 4: Room backdrop (9:16)

File back: `room-backdrop.png`. The warm dark room behind the jar, at 100 percent; the jar is drawn over it.

```
a warm dark room at night seen from a desk, out of focus, a wooden shelf edge and a window with a faint blue night outside, soft vignette, no objects in the centre, flat vector shading, cozy, muted amber and deep brown, empty centre for a glass jar to be placed over --ar 9:16
```

Pick the one with the emptiest centre and the softest edges.

## Sheet 2 of 4: Jar glass (3:4)

File back: `jar-glass.png`. The front glass layer: a round sealed jar drawn as glass only, on pure black, so Fable can key it
to a screen blend over the living contents.

```
a sealed round glass terrarium jar with a cork lid, drawn as glass only, thin rim, one soft white specular streak down the left side, faint reflections, completely transparent interior, on a pure black background, flat vector illustration, centred --ar 3:4
```

Pick the one whose interior is truly empty; any moss or plants painted inside makes it useless.

## Sheet 3 of 4: Journal plates (1:1, one sheet)

File back: `journal-plates.png`. Eleven small pencil drawings on cream, in a grid, for the Jarwright's field journal: cushion
moss, button fern, glass vine, ghost mushroom, dew sprout, frost fern, sunburst bloom, moon cap, springtails, pillbug,
glowbeetle. Fable cuts them apart.

```
a naturalist's field journal page on cream paper, eleven small pencil sketches in an even grid: a cushion of moss, a small button fern, a climbing vine on glass, a pale ghost mushroom, a sprout holding a dew drop, a frost covered fern, a small sunburst flower, a faint blue mushroom cap, a cluster of tiny springtails, a pillbug, a small glowing beetle, delicate graphite line work, no text, no labels --ar 1:1
```

Pick the one where all eleven are separate and readable; an even grid is not required, separation is.

## Sheet 4 of 4: Icon mark (1:1)

File back: `icon-mark.png`. The PWA icon, only if it beats the drawn one; the mark inside the central 80 percent.

```
app icon, a small round glass jar with a cork lid holding a tiny green fern and moss, warm dark background, flat vector illustration, one specular streak, centred, generous margin, no border, no text --ar 1:1
```

---

## Delivery table

| Sheet | Ratio | File back | Where it lands |
|---|---|---|---|
| 1 Room backdrop | 9:16 | `room-backdrop.png` | `satellites/wardian/art/room.jpg` 900x1600 q80 |
| 2 Jar glass | 3:4 | `jar-glass.png` | `satellites/wardian/art/jar.png` 1200x1600 with alpha (Fable keys it) |
| 3 Journal plates | 1:1 | `journal-plates.png` | `satellites/wardian/art/plates/<species>.png` 256x256 each (Fable cuts) |
| 4 Icon mark | 1:1 | `icon-mark.png` | `icon-512.png`, `icon-192.png`, `icon-maskable-512.png` |

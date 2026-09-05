# Fathom, Art Pack (three sheets, paste ready)

**For:** Stephen's Midjourney month. Relax mode, four variations per prompt, upscale only the pick. Fathom ships with no image
files and looks finished without these; they upgrade the title and the store tile. Bring the PNGs to
`satellites/fathom/art-drop/` (never overwrite a raw file) and the ART-LEDGER row moves from LISTED to DROPPED.

**The look, in one line:** sonar sketching a flooded cave. Pure black, thin cold cyan line light, one warm amber glint, a small
blind creature. Eerie and beautiful, never horror, a ten year old can look at it.

**Locked suffix for every Fathom prompt** (paste it on the end of each one, then reuse the seed of the first pick on the other two):

```
--style raw --s 180 --chaos 8 --no text, watermark, letters, people, faces, gore
```

---

## Sheet 1 of 3: Title backdrop (9:16)

File back: `title-bg.png`. Used behind the drawn word FATHOM at 35 percent opacity; the code resizes it to 900x1600.

```
a small blind pale cave creature seen from behind at the edge of still black water inside a vast flooded cavern, the cave walls and stalactites drawn only as thin glowing cyan sonar lines that fade into total darkness, one expanding ring of pale cyan light on the water, a single tiny warm amber glint far away, deep black everywhere else, bioluminescent deep cave, minimal line art on black, high contrast, calm and eerie, no fog, no clutter --ar 9:16
```

Pick the one where the ring reads as light moving outward, not as a drawn circle, and where the black stays black.

## Sheet 2 of 3: Key art (1:1)

File back: `key-art.png`. The portal thumb and any store tile; the code cuts a 512 square under 150 KB.

```
square composition, a tiny echo stone falling into black water at the exact centre, one bright cyan ring spreading from where it lands, the ring catching the edges of cave rocks and a long dim ribbon of red orange dots curling in the dark at the ring's edge, everything else pure black, thin glowing line art, bioluminescent deep cave, minimal, high contrast, eerie and beautiful, readable at small size --ar 1:1
```

Pick the one that still reads at the size of a postage stamp: stone, ring, one hint of the creature.

## Sheet 3 of 3: Icon mark (1:1)

File back: `icon-mark.png`. The PWA icon and favicon, only if it beats the drawn mark; the mark must sit inside the central 80
percent of the square because Android crops the corners.

```
app icon, a single small pale stone dropping into black water with one clean cyan ring around the splash, centred, generous black margin on all sides, flat glowing line art, two colours only cyan and pale white on pure black, no gradient background, no border, no text --ar 1:1
```

Pick the one with the fewest lines. If none beats the drawn icon, skip it; the drawn one ships.

---

## Delivery table

| Sheet | Ratio | File back | Where it lands in the game |
|---|---|---|---|
| 1 Title backdrop | 9:16 | `title-bg.png` | `satellites/fathom/art/title-bg.jpg` 900x1600 q80 |
| 2 Key art | 1:1 | `key-art.png` | `portal-assets/thumbs/fathom.png` 512x512 png, under 150 KB |
| 3 Icon mark | 1:1 | `icon-mark.png` | `icon-512.png`, `icon-192.png`, `icon-maskable-512.png` |

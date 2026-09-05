# Doohickey, Art Pack (three sheets, paste ready)

**For:** Stephen's Midjourney month. Relax mode, four variations per prompt, upscale only the pick. The parts are drawn by
code in a thick outline cartoon style and stay drawn, because painted parts cannot squash on a bounce. These sheets dress
the page and the title. Bring the PNGs to `satellites/doohickey/art-drop/` (never overwrite a raw file) and the ART-LEDGER
row moves from LISTED to DROPPED.

**The look, in one line:** a toy box on cream paper. Thick outlines, flat saturated primaries, a faint grid, Saturday
morning cartoon contraptions.

**Locked suffix for every Doohickey prompt** (paste it on the end of each one; reuse the seed of the first pick):

```
--style raw --s 180 --chaos 6 --no text, letters, numbers, watermark, people, faces, hands
```

---

## Sheet 1 of 3: Paper (1:1, tileable)

File back: `paper.png`. Tiled under the drawn grid at 25 percent.

```
seamless tileable texture of cream drawing paper with a faint fibre grain, evenly lit, no creases, no edges, no lines, no marks, flat, subtle, repeating pattern --ar 1:1 --tile
```

## Sheet 2 of 3: Title plate (16:9)

File back: `title-plate.png`. Behind the title at 60 percent; the word DOOHICKEY is drawn by the game.

```
a cheerful cartoon illustration of an absurd chain reaction machine sprawling across a workshop bench, ramps, a row of dominoes, a box fan, a red balloon on a string, a seesaw, a tin bucket, a brass bell, and a sleeping cat at the end, thick black outlines, flat saturated primary colours on cream paper, empty space in the upper middle for a title, playful, no text --ar 16:9
```

Pick the one with the emptiest upper middle and the clearest silhouettes.

## Sheet 3 of 3: Icon mark (1:1)

File back: `icon-mark.png`. The PWA icon, only if it beats the drawn one; the mark inside the central 80 percent.

```
app icon, a single blue marble about to strike a short row of three red dominoes leaning toward a small brass bell, thick black outlines, flat primary colours on cream, centred, generous margin, no border, no text --ar 1:1
```

---

## Delivery table

| Sheet | Ratio | File back | Where it lands |
|---|---|---|---|
| 1 Paper | 1:1 tile | `paper.png` | `satellites/doohickey/art/paper.jpg` 1024x1024 q75 |
| 2 Title plate | 16:9 | `title-plate.png` | `satellites/doohickey/art/title.jpg` 1600x900 q80 |
| 3 Icon mark | 1:1 | `icon-mark.png` | `icon-512.png`, `icon-192.png`, `icon-maskable-512.png` |

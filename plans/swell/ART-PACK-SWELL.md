# Swell, Art Pack (four sheets, paste ready)

**For:** Stephen's Midjourney month. Relax mode, four variations per prompt, upscale only the pick. The app ships with no
image files: the aurora is generated from the music and stays generated. These sheets sit behind the three mood cards in the
picker and, if it beats the drawn one, the icon. Bring the PNGs to `satellites/swell/art-drop/` (never overwrite a raw file)
and the ART-LEDGER row moves from LISTED to DROPPED.

**The look, in one line:** a dark concert hall seen from the podium, painted light. Cinematic, generous, a little
overwhelming in the good way. No instruments in focus, no people, no text.

**Locked suffix for every Swell prompt** (paste it on the end of each one; reuse the seed of the first pick on the others):

```
--style raw --s 200 --chaos 6 --no text, letters, watermark, people, faces, hands, instruments
```

---

## Sheet 1 of 4: Dawn plate (4:3)

File back: `mood-dawn.png`. Behind the Dawn card at 45 percent.

```
the first light of morning pouring into a vast empty concert hall from high windows, warm amber and pale gold haze, dust in the light, wide cinematic painting, soft, generous, hopeful, no instruments, no people --ar 4:3
```

## Sheet 2 of 4: Storm plate (4:3)

File back: `mood-storm.png`. Behind the Storm card.

```
a vast dark concert hall with weather inside it, low storm clouds rolling under the ceiling, a single shaft of cold blue light on the empty podium, deep indigo and slate, brass gold glints in the dark, dramatic cinematic painting, no instruments, no people --ar 4:3
```

## Sheet 3 of 4: Lullaby plate (4:3)

File back: `mood-lullaby.png`. Behind the Lullaby card.

```
a small warm room at night with a music box glow, soft lavender and dusk blue, a curtain moving gently, tiny points of light drifting like slow snow, calm, quiet, safe, painted, no instruments, no people --ar 4:3
```

Pick, for all three, the one that reads at the size of a card (about 340 by 255 on a phone) with the mood name laid over it.

## Sheet 4 of 4: Icon mark (1:1)

File back: `icon-mark.png`. The PWA icon, only if it beats the drawn one; the mark inside the central 80 percent.

```
app icon, three vertical curtains of aurora light rising from a single point at the bottom centre, amber ice blue and gold on near black, centred, generous margin, flat painted glow, no border, no text --ar 1:1
```

---

## Delivery table

| Sheet | Ratio | File back | Where it lands |
|---|---|---|---|
| 1 Dawn | 4:3 | `mood-dawn.png` | `satellites/swell/art/mood-dawn.jpg` 1200x900 q80 |
| 2 Storm | 4:3 | `mood-storm.png` | `satellites/swell/art/mood-storm.jpg` 1200x900 q80 |
| 3 Lullaby | 4:3 | `mood-lullaby.png` | `satellites/swell/art/mood-lullaby.jpg` 1200x900 q80 |
| 4 Icon mark | 1:1 | `icon-mark.png` | `icon-512.png`, `icon-192.png`, `icon-maskable-512.png` |

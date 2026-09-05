# Whistlestop, Art Pack (three sheets, paste ready)

**For:** Stephen's Midjourney month. Relax mode, four variations per prompt, upscale only the pick. The track and the
trains are drawn by code (they rotate and snap) and stay drawn. Bring the PNGs to `satellites/whistlestop/art-drop/`
(never overwrite a raw file); the ART-LEDGER row moves to DROPPED.

**The look, in one line:** a wooden train set on a sunlit rug, seen from rug level. Warm wood, solid toy colours, Sunday
morning.

**Locked suffix for every Whistlestop prompt** (reuse the seed of the first pick):

```
--style raw --s 160 --chaos 5 --no text, letters, watermark, people, hands, faces, trains, track
```

## Sheet 1 of 3: Rug (1:1, tileable)

File back: `rug.png`.

```
seamless tileable texture of a soft woven wool rug in muted sage and cream with a simple repeating pattern, seen straight down in warm morning window light, flat, no edges, no fringe, repeating pattern --ar 1:1 --tile
```

## Sheet 2 of 3: Props (1:1)

File back: `props.png`. Five wooden toy props on white, spaced apart: a round tree, a small station with a red roof, a
tunnel mountain, a cow, a water tower. Fable keys and cuts them.

```
product sheet on pure white, five chunky wooden toy train set props with space between them: a round green tree on a peg, a small wooden station with a red roof, a green tunnel mountain with an arch, a black and white wooden cow, a wooden water tower, solid painted toy colours, soft warm light, front three quarter view, photoreal, no background --ar 1:1
```

## Sheet 3 of 3: Icon mark (1:1)

File back: `icon-mark.png`. The PWA icon, only if it beats the drawn one.

```
app icon, a chunky red wooden toy train engine seen from three quarters on a curve of wooden track, warm light, flat painted style, centred, generous margin, no border, no text --ar 1:1
```

## Delivery table

| Sheet | Ratio | File back | Where it lands |
|---|---|---|---|
| 1 Rug | 1:1 tile | `rug.png` | `satellites/whistlestop/art/rug.jpg` 1024x1024 q75 |
| 2 Props | 1:1 | `props.png` | `satellites/whistlestop/art/prop-<name>.png` cut and keyed by Fable |
| 3 Icon mark | 1:1 | `icon-mark.png` | `icon-512.png`, `icon-192.png`, `icon-maskable-512.png` |

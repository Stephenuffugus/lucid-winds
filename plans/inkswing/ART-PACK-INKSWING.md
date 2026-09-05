# Inkswing, Art Pack (three sheets, paste ready)

**For:** Stephen's Midjourney month. Relax mode, four variations per prompt, upscale only the pick. The drawing is made by
maths and the rig is drawn by code; these sheets give the paper, the felt and the hero image. Bring the PNGs to
`satellites/inkswing/art-drop/` (never overwrite a raw file); the ART-LEDGER row moves to DROPPED.

**The look, in one line:** a Victorian instrument maker's desk. Brass, cream laid paper, iron gall ink, black felt.

**Locked suffix for every Inkswing prompt** (reuse the seed of the first pick):

```
--style raw --s 150 --chaos 4 --no text, letters, watermark, people, hands, faces
```

## Sheet 1 of 3: Rig hero (1:1)

File back: `rig-hero.png`. The icon and the card.

```
a small brass harmonograph pendulum machine on a walnut desk, a weighted brass bob hanging over a sheet of cream paper with a fine ink spiral drawn on it, seen from three quarters above, warm window light, antique scientific instrument, photoreal, centred, generous margin --ar 1:1
```

## Sheet 2 of 3: Paper (1:1, tileable)

File back: `paper.png`.

```
seamless tileable texture of cream laid paper with a faint chain line pattern and soft fibre, evenly lit, no creases, no edges, no marks, flat, repeating pattern --ar 1:1 --tile
```

## Sheet 3 of 3: Felt (1:1, tileable)

File back: `felt.png`. The dark felt under the sand mode.

```
seamless tileable texture of black wool felt, fine fibre, matte, very subtle, evenly lit, no edges, flat, repeating pattern --ar 1:1 --tile
```

## Delivery table

| Sheet | Ratio | File back | Where it lands |
|---|---|---|---|
| 1 Rig hero | 1:1 | `rig-hero.png` | icon set and `docs/thumb.png` source |
| 2 Paper | 1:1 tile | `paper.png` | `satellites/inkswing/art/paper.jpg` 1024x1024 q75 |
| 3 Felt | 1:1 tile | `felt.png` | `satellites/inkswing/art/felt.jpg` 1024x1024 q75 |

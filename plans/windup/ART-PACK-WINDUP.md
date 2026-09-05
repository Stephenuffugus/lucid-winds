# Windup, Art Pack (three sheets, paste ready)

**For:** Stephen's Midjourney month. Relax mode, four variations per prompt, upscale only the pick. The box is drawn by
code tonight; these sheets replace the drawn box only if the hero can be cut into layers, and they dress the cloth and the
wrapping. Bring the PNGs to `satellites/windup/art-drop/` (never overwrite a raw file); the ART-LEDGER row moves to
DROPPED.

**The look, in one line:** an heirloom in miniature. Walnut, brass, dark velvet, soft lamp light. Nothing shiny, nothing
new.

**Locked suffix for every Windup prompt** (reuse the seed of the first pick):

```
--style raw --s 160 --chaos 4 --no text, letters, watermark, people, hands, faces
```

## Sheet 1 of 3: Box layers (1:1)

File back: `box-layers.png`. Four separate renders on one white sheet: the walnut body seen from the front three quarters,
the open lid alone, the brass comb with fifteen tines alone, the crank handle alone. Fable keys and cuts them.

```
product sheet on pure white, four separate objects laid out with space between them: a small walnut music box body with a paper strip slot, its hinged lid alone, a brass comb with fifteen tines alone, a small brass crank handle alone, same soft lamp lighting on all four, front three quarter view, photoreal miniature, no background --ar 1:1
```

Pick the one where the four objects do not touch and the lighting matches across them.

## Sheet 2 of 3: Velvet (1:1, tileable)

File back: `velvet.png`. The cloth under the box, tiled.

```
seamless tileable texture of deep burgundy velvet under soft warm lamp light, fine nap, gentle sheen, no folds, no edges, flat, repeating pattern --ar 1:1 --tile
```

## Sheet 3 of 3: Wrapping papers (3:1)

File back: `wraps.png`. Three wrapping paper patterns side by side on one sheet: Birthday (confetti dots on cream),
Snowfall (small white snowflakes on dusty blue), Night Sky (tiny gold stars on indigo). Fable cuts them into tiles.

```
three wrapping paper swatches side by side, each a flat repeating pattern: small confetti dots on cream, small white snowflakes on dusty blue, tiny gold stars on deep indigo, flat printed paper look, evenly lit, clean vertical divisions, no ribbon, no text --ar 3:1
```

## Delivery table

| Sheet | Ratio | File back | Where it lands |
|---|---|---|---|
| 1 Box layers | 1:1 | `box-layers.png` | `satellites/windup/art/box-{body,lid,comb,crank}.png` keyed and cut by Fable |
| 2 Velvet | 1:1 tile | `velvet.png` | `satellites/windup/art/velvet.jpg` 1024x1024 q75 |
| 3 Wraps | 3:1 | `wraps.png` | `satellites/windup/art/wrap-{birthday,snowfall,nightsky}.jpg` 512x512 tiles |

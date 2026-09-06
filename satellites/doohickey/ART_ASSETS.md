# DOOHICKEY, art

Every part is drawn by code and stays that way: a painted part could not squash
and stretch, and squash is most of what makes a cartoon contraption funny. This
file is the list of what painted art WOULD replace and the rules it has to keep.

Three sheets in `plans/doohickey/ART-PACK-DOOHICKEY.md`, with a copy in 012Assets
as `Doohickey — Art Pack`.

## What is drawn by code

| Thing | Where | Notes |
|---|---|---|
| the paper and its grid | `drawPaper` | cream sheet, a lighter sheet for the scene, a 24 unit grid, a fat ink border |
| every part | `drawBody` and `PART_COLOUR` | drawn from the SAME geometry the sim builds, so a picture cannot drift from the physics |
| the marble, domino pips, the bell, the fan and its cone, the balloon's highlight, the spring's zigzag, the switch's lamp, the cat's face | `drawBody` | the marks that make a part readable at a glance |
| ropes and pins | `drawRopes` | a rope is a line between two bodies, a pin is a dot at the anchor |
| squash and stretch | `drawBody` | render only, never simulated: a fast body is up to 18 percent longer along its travel |
| dust | `puff`, on the world's contact callback | a puff where something actually hit, sized by the closing speed |
| motion lines | `drawStreaks` | anything over 300 units a second |
| confetti | `confetti` | five colours, on the win only |
| the bonus stars | `drawBonus` | hollow until touched, gold after |
| the tray tiles | `drawTile` | the same renderer on a 96 square canvas, so a tile is a picture of the part |
| the icons | `tools/icons.mjs` | the marble, the ramp, three dominoes and the bell, as SVG rendered to PNG |

## What painted art would replace

| File | Replaces | Delivered | In game |
|---|---|---|---|
| `paper.png` | the flat cream of `drawPaper` | 1:1 tile | `art/paper.jpg` 1024x1024 q75, tiled at 25 percent UNDER the drawn grid |
| `title-plate.png` | the flat title screen | 16:9 | `art/title.jpg` 1600x900 q80, behind the title column |
| `icon-mark.png` | the drawn icon | 1:1 | 512, 192 and maskable 512 through `tools/icons.mjs` |

Both are loaded behind an `onerror` that falls back to the drawn version, so a
missing file is a plainer board and never a broken one.

## The palette

```
--paper  #F4EBD3   the sheet
--paper2 #EADFC0   the tray dock and the quieter buttons
--ink    #2C2418   every outline, every letter
--red    #D8503C   dominoes, the balloon, STOP
--blue   #3D6FB4   the marble, the fan
--yellow #E8B33C   the bell, the bonus stars, the selection ring
--green  #4E9A52   the seesaw, the spring, GO
--plum   #8A5A9B   planks, the bucket, the cat
```

## Rules any painted version has to keep

- **Outlines are 3 units and ink.** The look is a Saturday morning cartoon and
  the outline is what holds it together at phone size.
- **A part must read at 56 px**, because that is the size of its tray tile.
- **No part may be painted with its own shadow**: the parts rotate, and a baked
  shadow rotates with them and points the wrong way.
- **Nothing painted goes in the bottom left 120 by 120**: that corner belongs to
  the fleet's music chip.
- **No text in any painted asset.** Every word in this game is in the HTML.

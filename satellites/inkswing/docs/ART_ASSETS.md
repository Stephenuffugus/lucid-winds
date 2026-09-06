# INKSWING, what is drawn and what is not

Nothing in this game is a painted asset. The sheet, its grain, the brass arm,
the bob, the pen and every line the pen leaves are drawn by code at run time,
because the line is the product and a picture of a line is not one. The only
files that ship are the three icons and the portal tile, and both are generated
by tools in this folder.

## What ships

| File | What it is | Made by |
|---|---|---|
| `icon-192.png`, `icon-512.png`, `icon-maskable-512.png` | the app icons: the brass arm over a sheet with a knot on it | `node tools/icons.mjs` |
| `docs/thumb.png` | the portal tile, 512 square, a 3:2 knot caught mid draw | `node tools/thumb.mjs` |
| `docs/shots/*.png` | the evidence, not assets | `node tools/shots.mjs` |

`tools/thumb.mjs` refuses to write a tile that is not at least 30 percent paper,
2 percent ink and has no brass in its upper half. The ink floor is measured, not
guessed: the same crop reads 0.63 percent at one second of drawing, 1.10 at four
seconds, 3.75 on the twenty six second knot the tile is made of and 8.02 on a
full ninety second throw. Inkswing's failure mode is a beautiful empty sheet, so
"is there a drawing on it" is the only question a tile has to answer.

## The palette

```
--paper     #F0E8D5   the sheet
--paper-lo  #E2D7BE   its shadowed edge
--cream     #FBF6E8   everything a player reads
--ink       #1E2A3A   the text, and the darkest of the inks
--brass     #B08D3E   the arm, the bob, the primary button
--brass-lo  #7A6127   its shadow side
--felt      #20241F   the sand mode ground
--muted     #7C7360   captions
```

The ground behind everything is `#151A22`, which is not a variable because it is
the room rather than the object.

## The five inks

They are a real ink cabinet rather than a colour picker: iron gall, indigo,
oxblood, verdigris and a deep blue. Each is a hue plus a wet edge, and the pen
lays a pale hair when it is whipped and a dark pool when it slows, so a single
colour reads as a line with pressure in it.

## How the sheet is made to look like paper

- **A seeded grain**, so it never crawls between frames.
- **A double edge**: the sheet's own shadow on the ground, and a lighter inner
  bevel, which is what stops it reading as a rectangle of flat colour.
- **The drawing accumulates into offscreen layers, one per ink**, at screen
  resolution. It is never redrawn from history per frame: a ninety second throw
  is thirty thousand points and re rendering all of them every frame is a
  slideshow by the twentieth second. Undo is a discarded layer rather than a
  rebuild.
- **The poster does not scale the screen up.** It re renders from the throw list
  at 2048 by 2560, which is the whole reason the throw list exists.

## The known faults in the tile, named 2026-09-06

Opened and read, not assumed. The brass arm runs from the top edge straight
through the centre and splits the knot into two halves, which pulls the eye up
and out of the frame. The composition sits high, so there is an empty band of
cream across the bottom eighth. The posterization that keeps the file under
150 KB leaves two visible seams in the paper gradient. None of the three is
worth another hour against building the games that are not started yet, and all
three are written down here so the next person does not have to find them again.

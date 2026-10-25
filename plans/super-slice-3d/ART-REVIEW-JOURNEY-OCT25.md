# Super Slice 3D: the Journey orchard kit, reviewed (Fable, 25 Oct 2026)

**Intake:** done by Opus at 00:20 UTC and not repeated: `docs/briefs/super-slice-3d/JOURNEY-KIT-INTAKE-OCT25.md` (21 of
21 files at the asked sizes, real alpha on the cut outs, opaque tiles, no extras, no MISSING; the visible bounds of every
cut out measured; every tile's first and last line IDENTICAL, so a straight repeat draws that line twice). Vaulted as
`vault-20261025-super-slice-journey-kit` (downloaded back, matched). The zip is `assets/super-slice-journey-kit.zip` (8.6
MB, not committed). Re-extracted for this review into `/tmp/claude-1000/ssjk/zip/` with `python3 -I` (gone at a
codespace stop). The brief it answers: `ASTRA-SUPER-SLICE-JOURNEY-KIT-OCT24.html`.

## The look (one contact sheet of all 21, plus the grass repeated 3 x 3 at 200 px and 12 x 6 at 50 px)

It is the Orchard Loft set's own hand: warm upper left light, soft painted edges, the same saturation as decor1 to
decor4. Five trees that read apart at 150 px (red apples, yellow pears, purple plums, a tall slim poplar, a hazy
blue grey far tree), trunks at the bottom centre with nothing below the feet. Two low wide bushes, one with pink
flowers. Tufts and flower clumps that are small and quiet. A red capped white spotted mushroom that looks bouncy. A
ringed stump disc, a bark tile, a gold pennant with no pole (the game's pole stays), a horizontal branch leafy at the
right end, a braided vine, a plank with one crack in its middle, a soil face with roots, stones and a grass overhang
along its top edge, and a soft band of orchard hills with little trees along its bottom edge.

**Three things wrong, named (seen, not guessed):**
1. **The grass tile carries a diagonal light band.** Repeated 3 x 3 at 200 px it is a lattice of diagonal stripes; at 50
   px a tile it melts into a uniform lime with faint diagonals. The Journey camera looks ALONG the counter at a grazing
   angle, so one tile covers more than 50 px near the knife: expect the stripes. Two cheap defences for Part H, before
   anyone asks Astra for a repaint: `THREE.MirroredRepeatWrapping` on both axes (every other tile is a mirror, which
   breaks a directional drift into a diamond), and a repeat of 6 to 8 world units a tile with a slight tint toward the
   old greens (`0x3c5a34` family) so the lime does not shout beside the painted props. Judge in the shot; if it still
   stripes, say so and ask for a repaint rather than ship a shimmer.
2. **The crack repeats per tile.** The shelf in the code is 3.4 units wide (`cw=3.4`, a constant: the brief's "4 to 6" was
   wrong), so ONE tile per shelf shows one crack. Fine as long as the repeat is 1 per shelf, never per world unit.
3. **The branch is a slim stick** where the code draws a fat leaf blob at the right end: at 300 px it still reads as a
   branch the fruit hangs from, and the leaves are at the right end as the code's blob is (`lf.position.x = x1+2`).
   Check it at the camera distance in the look; the fallback is to keep the code's leaf blob beside the sprite.

Also seen: the hills band has small orchard trees painted along its bottom edge; placed between the sky and the back
row they will read as a third, far row. Good, as long as its bottom sits at the ground line and never floats above the
back trees. The soil face's overhang must land at the lip, not a unit below it (the UV mapping rule in Part H).

## Her numbers against the code (`satellites/slice-3d/index.html`, `buildLevel` 1463 onward, BUILD v7.3)

| Her claim (IMPLEMENTATION.md, from our brief) | The code | Verdict |
|---|---|---|
| counter 3 tall, 14 deep | `g` BoxGeometry(len+70, 3, 14) at y -1.5; `soil` (len+70, 1.1, 14.2) at -2.6; `lip` (len+70, 0.5, 14.4) at 0, top 0.25 = `GRASS_TOP` | true; the grass you see is the LIP's top at 0.25 (Part G1): the texture goes on the same box, the constant does not move |
| trees 9 to 17 apart, 9 to 19 tall | `tx += 9+rng()*8`; trunk `th = 8+rng()*10` from y -1, crown sphere r 2.6 to 5 at the top | true (8 to 18 trunk, crown above); two depths z -9 to -15 by rng |
| stump radius 1.7, 2.4 to 4.8 tall | `stump(x,h)`: Cylinder(1.7, 2, h) + ring (1.75, 0.25) on top, block `vt 0.125` | true |
| mushroom cap 4.4 over a 2.2 stem | stem Cylinder(0.7, 0.9, 2.2) at y 1.1, cap half sphere r 2.2 at y 2.2; block w 4.2 h 2.9 spring | true |
| branch 6 to 14 long, 8 to 11 up | `branchOver(x0,x1,y)`: Cylinder(0.35, 0.45, (x1-x0)+4) + leaf sphere (1.4, scaled 1.6 x 0.7) at x1+2, y+0.6 | the span is set by the callers; the shape is as she says |
| shelf 4 to 6 wide, 0.9 tall | `crumble`: Box(3.4, 0.9, 6) + a dark crack box + a leg | 3.4 wide, not 4 to 6 (our brief's error) |
| flag 3.4 x 2.2 | `PlaneGeometry(3.4, 2.2)`, yellow 0xffd76a, DoubleSide, at (wallX-0.4, 27.6, 0), pole Cylinder(0.18, 6) at (wallX+1.5, 26) | true; the plane faces z (sideways to the run), so at the player's camera it may read edge on: the look decides whether Part H turns it to face the approach as the x10 labels do (`rotation.y = -PI/2`) |
| stripes, tufts, flowers, bushes | stripe boxes (4 x 0.08 x 13.6) at y 0.26 every 8 units; tuft cones (0.28, 0.9 to 1.5) at z 3.5 to 6; stems + bloom spheres at z -3 to -5; bush spheres (1.2 to 2, scaled 1.5 x 0.8) at y -0.2, z 6.4 to 7.6 | all from the level's rng stream: the draws MUST stay even when the meshes hide (the comment on the clouds says why: every later draw comes from the same stream) |
| the Climb floor is the same counter | `buildClimb` 2754 to 2758: the same three boxes | true: the same textures go there |

Her acceptance checklist (end of `IMPLEMENTATION.md`) is a fair start for the gate; the suite's rows are what count.

## Sorted

**Keep (agree):** every one of the 21 pieces, as the brief asked; her integration order (tiles first, then the cut
outs); her `asset_index.json` visible bounds as the anchor source (the margin law, memory
`feedback_painted_tiles_carry_margins_measure_them`); trimming the duplicated last line of every tile so the repeat
wraps exactly.

**Change:** the grass wraps mirrored and tinted (above); the far hills tile along x on a short plane rather than at its
own 4:1 aspect across the whole course (a 360 unit wide plane at 4:1 would be 90 units tall); the vine texture goes on
the existing string cylinder only if it reads at the camera distance (a 0.06 radius cylinder shows about two pixels: the
look decides, the code look is the fallback).

**His:** nothing in this kit is priced or a mode. One taste question for the look: the lime of the new grass against
the old `0x3c5a34` counter sides, if the tint does not settle it.

**Kill:** nothing.

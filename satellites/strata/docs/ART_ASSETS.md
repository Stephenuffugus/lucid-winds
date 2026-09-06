# STRATA, the art it has and the art it does without

**There is no painted art in this game.** Every animal, every cliff, every plinth,
every placard and every icon is GENERATED: drawn by code at run time, or rendered
by a tool in this folder from code and written out as a file. Nothing in Strata was
painted by a person, and no line in this document should ever be read as saying it
was.

Checked against `satellites/strata/index.html` at stamp `20260906f` on 2026-09-07.
Every claim below names the code that makes the thing. Where a claim could not be
found in the file it was cut.

This file supersedes the older copy at `satellites/strata/ART_ASSETS.md`, which was
written before the plate, the framed wall, the journal and the rename existed, and
which says three things that are no longer true. Those are listed at the end.

---

## 1. What ships as an image file today

Four PNGs ship. All four are generated, none is painted, and each has a tool in
this repo that rebuilds it from the code.

| File | Size | Made by | What it is |
|---|---|---|---|
| `satellites/strata/icon-512.png` | 512x512 | `tools/icons.mjs` | a skull coming out of a cliff, drawn as inline SVG in the tool at lines 30 onward, with sediment bands behind it |
| `satellites/strata/icon-192.png` | 192x192 | `tools/icons.mjs` | the same mark |
| `satellites/strata/icon-maskable-512.png` | 512x512 | `tools/icons.mjs` | the same mark drawn smaller inside a full bleed field, because Android crops a maskable icon and only the middle 80 percent is safe |
| `satellites/strata/docs/thumb.png` | 512x512, 146 KB | `tools/thumb.mjs` | the arcade tile: a real dig, shot through the game's own canvas, cropped around a freed skull, then bit dropped with `& 0xF0` so it stays under 150 KB |

The three icons are pulled by `index.html` lines 12 to 14 and by
`manifest.webmanifest`. The tile is copied to `portal-assets/thumbs/strata.png` for
the arcade card.

Everything else on the screen is drawn live.

---

## 2. Drawn by code right now, item by item

Each row says what the code does today, where it lives, and what a painted file
would have to replace if Stephen ever wanted one. A size in the last column is what
a painter would need to deliver for the surface as it is built now.

### The cliff, which is the game

| Thing | Drawn by | Would be replaced by |
|---|---|---|
| The rock face | `paintCliff`, index.html 1593. 200 by 300 cells of density written into one `ImageData` and put down as a single `putImageData` per frame. Colour comes from the band palette `PAL` at 1541, mixed toward dust as density falls, plus a per cell grain | nothing. A painted cliff cannot change as a thumb takes rock off it, which is the whole game |
| The six beds | `bandLines`, 1061. Five wavy boundaries cut the grid into six beds of unequal thickness, each with its own wave amplitude, phase and frequency | nothing |
| The bedding lines | `drawBands`, 1642. A dark stroke and a light stroke a pixel below it, so superposition can be seen | nothing |
| The laminae inside a bed | `newDig`, 1201, using `LAM_F` and `LAM_T` at 1199 and 1200. Each of the six beds gets its own lamination spacing and its own tilt, because one frequency across a whole cliff reads as corduroy | a paper or rock grain tile could sit UNDER the canvas at low opacity, `art/rock-grain.png`, 512x512, seamless, but it would fight the density readout and is not recommended |
| A bone still buried | `paintCliff`, the `d.bone[i]` branch at 1598. Painted by the SAME maths as the rock beside it, so a skeleton does not show through before a brush has touched it | nothing |
| A bone coming up | the same branch, 1613. A smoothstep from rock to `PAL.bone` as the cover thins past 0.34 | nothing |
| A bone's outline | `drawBoneEdges`, 1665 | nothing |
| The hollow the tools leave | `PAL.cavity` at 1550, painted where density is at or under 0.03 | nothing |
| The dust | `spawnDust` 1731, `stepDust` 1741, `drawDust` 1751. Grains with velocity and gravity, at most `DUST_MAX` 400 at once, drawn as one small filled rectangle each | a grain sprite sheet, `art/dust.png`, 64x64 with 8 grains of 16x16, would let each grain be a shape instead of a square. Small win, real cost in fill rate |
| The pressure ring | `drawPressure`, 1766. A 30 pixel radius arc AROUND the finger, gold under the warn line and red over it | nothing |
| The scan | `drawScan`, 1779. Three expanding rings over the largest bone in the site | nothing |

### The tools

| Thing | Drawn by | Would be replaced by |
|---|---|---|
| The four tool tiles | `index.html` 238 to 243, styled at 60. Each is 58 by 58 CSS pixels: a paper tile with a 3 pixel ink border and a system emoji glyph, broom, hammer, pick and magnifier | **the clearest painting job in the game.** Four tiles, `art/tool-brush.png`, `art/tool-chisel.png`, `art/tool-pick.png`, `art/tool-scan.png`, 174x174 each for a 3x phone, transparent background, one ink weight, readable at 58 px. The emoji are the only glyphs in Strata that a different phone draws differently |

### The mounting bench

| Thing | Drawn by | Would be replaced by |
|---|---|---|
| The bench ground | CSS at 183: `#scrMount` is flat `--paper`, and `#mountCv` at 188 also paints `background:var(--paper)` | a tiled paper, see section 3. Note the canvas paints its own paper today, so a tile behind it would be hidden until that background is removed |
| The armature silhouette | `drawMount`, 2831, the faint pass at 2840. The whole animal at 0.16 alpha under everything else | nothing |
| A placed bone | `drawMount` 2850. Cream fill, darker outline; a cracked bone fills a shade duller | nothing |
| A glued seam on a cracked bone | `drawMount` 2857. A jittered line along the bone's own spine in rust | nothing |
| An empty slot | `drawMount` 2870. The bone's shape, dotted | nothing |
| Bronze infill for what the ground kept | `drawMount` 2877. Bronze at 0.32 alpha, deliberately quieter than a real bone | nothing |
| The tray tiles | `paintTray` 2915 and `boneTile` 2924, styled at 191. Each bone drawn into a 58 by 58 tile at a shared measure so a rib and a skull are not the same rounded rectangle | nothing. Every tile is a different bone |

### The museum

| Thing | Drawn by | Would be replaced by |
|---|---|---|
| The hall itself | CSS at 198: a four stop vertical gradient, wall from `#7A6244` to `#6E5638`, then a hard floor line at 63 percent, then floor from `#54402A` to `#4A3826` | a painted hall, see section 3 |
| A plinth | CSS at 203 to 219. A 190 wide column: a canvas 190 by 210, a paper base strip 26 tall, a brass placard at least 70 tall | `art/plinth.png`, 570x630 for 3x, would replace the base strip and the ground shadow only. The specimen canvas has to stay a canvas |
| The specimen on the plinth | `plinthFor`, 3077. The skeleton regenerated from the seed and drawn feet down on the plinth, backing store 380 by 420 | nothing |
| The framed plate on the wall | `plinthFor` 3088, styled at 208 and shown only on a phone at least 760 tall. A 264 by 330 canvas running the full plate renderer scaled down | nothing. The frame border is CSS, and `art/frame.png` at 396x495 for 3x could replace it |
| The placard text | `plinthFor` 3120. Name, era, who found it or whose museum it is on loan from, condition | nothing |
| A crate somebody sent | `cratePlinth`, 3056, styled at 169. A tan box with two repeating linear gradients for the slats, a package emoji and TAP TO OPEN | `art/crate.png`, 570x630 for 3x. The second clearest painting job after the tools, and the emoji is the same portability problem |

### The plate, which is the picture that leaves the game

| Thing | Drawn by | Would be replaced by |
|---|---|---|
| The whole plate | `renderPlate`, 3212, exported at 1080 by 1350 by `exportPlate`, 3279 | nothing whole |
| The paper it sits on | `renderPlate` 3216. `#EFE2C8` with a radial darkening toward the edges | `art/paper.jpg`, see section 3. This is the surface where a painted paper would do the most good and the least harm, because nothing on the plate has to be read out of the rock |
| The rock frame | `renderPlate` 3222, with nine wavy sediment strokes at 3226 so the frame is a cliff and not a brown box | a painted cliff crop, `art/plate-rock.jpg`, 950x740, would work here, because this frame is a still picture and not a dig |
| The skeleton on it | `renderPlate` 3234, regenerated from the seed and stood on the frame's floor with an ellipse shadow | nothing |
| The type | `renderPlate` 3250 to 3276, Georgia with a serif fallback, 22 px to 66 px in a 1080 wide space | nothing |

### The screens

| Thing | Drawn by | Would be replaced by |
|---|---|---|
| The title | `index.html` 245, over a live dig. `startDemo` at 2716 opens a fixed site, `the-title-cliff`, and brushes eighteen of its big bones clean, so the title screen IS the game. The CSS at 100 lays a five stop scrim over it, light at the top and dark under the buttons | nothing. A painted title plate would replace the one screen whose job is to prove the game generates animals |
| The how screen | `index.html` 255. Three lines of type on the shared rock ground | nothing |
| The field journal | `index.html` 304, styled at 121 to 152. Tan paper, ruled rows, the same hand as the placards | `art/paper.jpg` tiled behind it, see section 3 |
| Every button | CSS at 46. Paper fill, 3 pixel ink border, 3 pixel ink drop, uppercase | nothing. A painted button slab over painted art is a fleet rule against, and there is no painted art here to put one over |

---

## 3. The two sheets that are planned, and the hooks they need

Both are described as prompts in `plans/strata/ART-PACK-STRATA.md`. Neither is
wired, on purpose: each is a real improvement and each risks making the BONES
harder to read, which is the one thing this game cannot afford.

**`art/paper.jpg`, 1024x1024, seamless tile, quality 75.** For the mounting bench,
the journal page and the plate ground. Delivered 1 to 1 from a `journal-paper.png`
master.
To wire it: the tile goes behind the canvas as a CSS background on `#scrMount`
(line 183) AND the canvas's own `background:var(--paper)` at line 188 has to come
off, or the canvas covers the tile completely. That second half is the part the old
document missed.

**`art/hall.jpg`, 1600x686, 21 by 9, quality 80.** For the museum backdrop, painted
with no plinths in it. Delivered from a `hall.png` master.
To wire it: it replaces the gradient at line 198. The painted floor line has to sit
below the top of the plinth bases or every specimen reads as hanging in the air, and
the wall band has to stay dark enough that a cream skeleton on a 190 wide canvas
still separates from it.

**`icon-mark.png`, 1024x1024.** Only if a painted mark beats the generated one at 48
pixels. It would feed `tools/icons.mjs`, which writes the three PNGs in section 1.

---

## 4. What must stay drawn, whatever arrives

- **Every animal.** Spine, ribcage, skull, limbs and ornament, all from one number.
  `species` at 526 and `bones` at 744. There is a different animal in every cliff and
  no painter can keep up with that. This is the game and it can never be art.
- **The cliff and its beds.** The picture has to change under a thumb, per unit of
  travel and per second of rest.
- **The dust.**
- **The armature, the bronze infill and the glued seams.**
- **The plinth specimens and the plate skeleton**, which are regenerated from the
  seed by the same calls, so a picture can never show an animal the museum does not
  hold.

---

## 5. What is deliberately absent

- **No recorded audio and no music file.** The tak, the tik, the shhh, the clink, the
  crack, the jacket, the scan and the keep are about ninety lines of Web Audio in
  `AUDIO` at 2422. That is why the whole game is one file and works with no network.
  The page does include the fleet's `/music-unlocks.js` at line 223, which is the
  studio wide music chip and not Strata's own sound.
- **No sprite sheet, no font file, no texture.** The type is a system stack.
- **No painted background on any screen.**

---

## 6. Three things the older copy of this file got wrong

Written down so the next reader does not inherit them.

1. It said Strata **ships with zero image files**. It ships four PNGs, listed in
   section 1. They are generated rather than painted, which is the true statement,
   and it is not the same statement.
2. It said the dust is **pooled**. It is not. `spawnDust` at 1731 pushes onto an
   array and `stepDust` at 1741 splices out of it. It is BOUNDED at
   `DUST_MAX` 400, which is what keeps a long brushing session from leaking, and
   pooling it is still worth doing.
3. It said the hall is a **two stop gradient**. It is four stops with a hard floor
   line at 63 percent, line 198, and since Sep 06 each plinth also hangs a framed
   plate on the wall above it on a phone at least 760 tall.

It also described the paper hook as "the canvas stays transparent". The canvas does
not stay transparent today. Section 3 says what has to change.

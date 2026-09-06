# STRATA, the art it reads and the art it does without

Strata ships with **zero image files** and looks finished, because the animals
have to be drawn by code: there is a different one in every cliff and no
painter can keep up with that. Nothing below is needed to play it.

The three sheets are written as paste ready prompts in
`plans/strata/ART-PACK-STRATA.md`.

| File Stephen delivers | Used for | Delivered at | In the game as | Read by |
|---|---|---|---|---|
| `journal-paper.png` | the mounting bench and the plate, tiled | 1:1, seamless | `art/paper.jpg` 1024x1024 q75 | not wired yet, see below |
| `hall.png` | the museum backdrop, no plinths | 21:9 | `art/hall.jpg` 1600x686 q80 | not wired yet, see below |
| `icon-mark.png` | the PWA icon, if it beats the drawn one | 1:1 | `icon-512.png`, `icon-192.png`, `icon-maskable-512.png` | `tools/icons.mjs` |

## What is drawn by code, and stays drawn

- **Every animal.** Its spine, its ribcage, its skull, its limbs and its
  ornament, all from one seed. This is the whole game and it can never be art.
- **The cliff.** Two hundred by three hundred cells of density, painted as one
  `putImageData` per frame, with six bedding planes that vary in thickness and
  a lamination frequency and tilt per bed.
- **The dust**, poured and settled, bounded at four hundred grains and pooled.
- **The mounting bench**, the bronze infill and the glued seams a cracked bone
  keeps showing.
- **The hall**, its plinths, its brass placards and the crate a loan arrives in.

## If the two painted sheets arrive

Neither is wired, on purpose. A painted paper behind the bench and a painted
hall behind the plinths are both real improvements and both risk making the
BONES harder to read, which is the one thing this game cannot afford. The hooks:

- the bench paints `#scrMount` with a flat `--paper`; a tiled image goes behind
  the canvas, and the canvas stays transparent.
- the hall paints `#scrHall` with a two stop gradient standing in for a wall and
  a floor; a 21:9 image replaces it, and the floor line has to stay below the
  plinths or the specimens look like they are hanging.

## What is deliberately absent

No music and no recorded audio: the tak, the tik, the shhh, the clink and the
crack are about ninety lines of Web Audio, which is why the whole game is one
file and works with no network at all.

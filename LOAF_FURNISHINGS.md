# LOAF — the furnishings list (Meshy lane)

Companion to LOAF_PLAN.md §the Room. The room ships 2D today; the 3D
layer is LOAF_3D_PLAN.md. This list serves both: GLBs bank for the 3D
room, and the same meshes render to sprites for the 2D room through the
pipeline Ripcord already proved (mesh → studio render → artcut).

Rules of the house, inherited from the plan's hard lines:
- The CAT is the hero. Props are supporting cast: soft shapes, muted
  colours, nothing that upstages her. No prop implies harm, illness,
  confinement or absence.
- Scale reference: a sitting cat is ~0.25m tall. State sizes in prompts.
- `target_polycount: 3000`, textures ON here (unlike chameleon — LOAF
  keeps its materials).

## The list — 16 pieces

| id | prompt seed | size |
|---|---|---|
| tower_three | a carpeted three-tier cat tower with a hide cube | 1.2 tall |
| post_sisal | a sisal rope scratching post on a flat base | 0.6 |
| box_cardboard | a plain open cardboard box, flaps out | 0.35 |
| bed_donut | a round plush donut cat bed | 0.5 dia |
| perch_window | a window perch shelf with a cushion | 0.55 wide |
| tunnel_felt | a felt play tunnel, slight sag in the middle | 0.9 long |
| bowl_food | a ceramic food bowl, wide and shallow | 0.16 |
| bowl_water | a ceramic water bowl, taller | 0.14 |
| fountain | a small ceramic pet water fountain | 0.22 |
| yarn_rainbow | a rainbow yarn ball with a loose strand | 0.09 |
| mouse_toy | a grey felt mouse toy with a cord tail | 0.12 |
| wand_feather | a feather teaser wand | 0.5 |
| ball_bell | a plastic ball with a bell inside, lattice shell | 0.06 |
| grass_pot | a small pot of cat grass | 0.15 |
| mat_woven | a flat round woven mat | 0.6 dia |
| shelf_steps | two wall steps for climbing, carpet tops | 0.35 each |

Prompt template: "<seed>, soft rounded shapes, cozy, clean simple game
asset, single object, no scene". Nothing sharp-edged: the room reads
gentle or it reads wrong.

## Order

Nothing here is blocked or urgent — the room's floor rules and phase
gate come first (Director's call). When the 3D room goes live, pilot 4
(tower_three, box_cardboard, bed_donut, yarn_rainbow), LOOK at them
next to a cat model for scale and softness, then run the rest.

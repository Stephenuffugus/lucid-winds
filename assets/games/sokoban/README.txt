SOKOBAN (GARDEN PATH) — RESKIN ASSETS

Drop these 7 PNG files into this folder (assets/games/sokoban/).
The game auto-detects them — if missing, it falls back to the inline SVG art.

Recommended size: 96×96 or 128×128 PNG, transparent background.
Tiles render from ~40px (narrow phones) up to ~80px (tablets).

REQUIRED FILES:
  player.png             — The mover (gardener / seed-carrier)
  crate.png              — Pushable object (seed sack / pot)
  planted.png            — Crate landed on target — WIN STATE (planted bloom / glowing pot)
  target.png             — Empty destination (tilled plot / dashed ring)
  wall.png               — Barrier (hedge / stone wall / bramble)
  floor.png              — Walkable ground (garden path / soil)
  player-on-target.png   — Player standing on target (subtle halo)

ART RULES:
- High contrast silhouettes — crate vs planted must read instantly
- Target = subtle (destination, not focal point)
- Wall = darkest/heaviest — defines play area
- Floor = lightest — sits behind everything

OPTIONAL:
  bg.png                 — Full-screen background behind the grid
  ../thumbs/sokoban.png  — Picker thumbnail (goes in assets/games/thumbs/)

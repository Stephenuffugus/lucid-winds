# Sheet 01 — Warden tokens + monsters

**PATCH-REQUIRED wiring:** the hero renders as a glyph token in `render()` (search
`WARDENS[PROG.warden]`) and monsters as shape-coded canvas paths in `drawShape(x,y,r,shape,col,elite)`.
To use sprites: load per-id PNG, `c.drawImage` centered, hero ~26 px in game (render 128 px,
downscale), monsters ~16 px (render 96 px). KEEP the shape language — each monster's
silhouette must still read as its shape class (slime=round, rat=triangular, skeleton=square,
wolf=pointed/pentagon, harpy=diamond) because that is the colorblind channel. Until patched,
this sheet doubles as wardrobe CARD ART for the `.wcard` icons (drop-in, no engine change).

**PROMPT (copy-paste):**

Ember Vigil style: cozy dark-fantasy storybook game art, warm campfire ember glow on
deep indigo night, soft painted texture, amber rim light, brass clockwork accents,
crisp readable game-asset silhouettes, high contrast, no text, no watermark, flat
FF00FF magenta background for cutout. A sprite sheet, 2 rows x 5 columns, each cell
256x256 pixels on flat magenta FF00FF.
Row 1, five characters seen from a high three-quarter view, standing on nothing:
(1) THE WARDEN, a small round-shouldered sentinel in a cream E8DCC8 hooded cloak
holding a lantern staff, amber FFB35C glow.
(2) THE KNIGHT, the same small sentinel build in steel-grey C9CED6 plate with a plume,
brass C8A84B trim.
(3) THE RANGER, the sentinel in a moss-green 8FD6A8 hood with a shortbow on the back,
one arrow glowing amber.
(4) THE MOTH MONK, the sentinel in dusty violet B9A6E8 robes with faint moth wings and
a crescent moon pendant, cool blue 5B9BD5 glow.
(5) THE CAMPFIRE, a stone fire ring with crossed logs and one tall friendly flame in
amber FFB35C with a cream core.
Row 2, five monsters, each silhouette matching its shape class exactly:
(6) SLIME, a round gelatinous blob, mossy green 8FD68F, one lazy eye, ROUND silhouette.
(7) RAT, a lean scruffy rat lunging forward, tawny C9A06A, TRIANGULAR wedge silhouette.
(8) SKELETON, a boxy little skeleton soldier with a square pauldron frame, pale violet
B9A6E8 bone glow, SQUARE silhouette.
(9) WOLF, a bristling wolf mid-snarl, rust red D97B6C, angular five-point PENTAGON
silhouette, ember eyes.
(10) HARPY, a screeching bird-woman diving with wings up and tail down, storm yellow
E8DE8A, DIAMOND silhouette.
Even spacing, nothing touching cell edges, no text anywhere.

**Elite marker (same sheet or corner cell):** a small floating gold FFD76A four-point
diamond crown, 64x64, used above Deep Loop elites.

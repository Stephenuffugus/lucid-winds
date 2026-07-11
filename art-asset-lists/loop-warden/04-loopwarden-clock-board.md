# Sheet 04 — Clock board + full-bleed backdrops

**Wiring:** backdrops are DROP-IN — draw a 540x680 image in `render()` before
`drawWedges()`, keyed by `PROG.pal` (`PALS` keys: ember / frost / gloam). Keep them DARK
(85-92% near-black) so the quadrant wedge tints (10% alpha fills), tile ring and floaters
stay readable. The dial face and quadrant emblems are PATCH-REQUIRED (today drawn in
`drawDial`). Backdrops generated ONCE at 1080x1360, shipped at 540x680 (host resizes
>1600px — stay under). Target <=150KB each as JPG.

**PROMPT A — three full-bleed board backdrops (no magenta, one image per paragraph):**

1. EMBERWOOD backdrop: Ember Vigil style, a near-black scorched woodland clearing seen
from above at dusk, the faintest warm brown 3A3226 earth ring where a path circles a
dark center, ember motes drifting, soft vignette, no creatures, no text, dark enough
for bright game pieces on top, 1080x1360 portrait.
2. FROSTMERE backdrop: same composition language, near-black frozen lake under aurora,
faint ice blue 3C5468 ring, sparse snow motes, no text, 1080x1360 portrait.
3. GLOAMING backdrop: same composition language, near-black violet heath at last light,
faint purple 4E4168 ring, drifting spores of dim light, no text, 1080x1360 portrait.

**PROMPT B — clock dial + quadrant emblems (sprite sheet, copy-paste):**

Ember Vigil style: cozy dark-fantasy storybook game art, warm campfire ember glow on
deep indigo night, soft painted texture, amber rim light, brass clockwork accents,
crisp readable game-asset silhouettes, high contrast, no text, no watermark, flat
FF00FF magenta background for cutout. A sprite sheet, 2 rows x 4 columns, each cell
256x256 pixels on flat magenta FF00FF:
Row 1, four round quadrant emblems, each a brass-rimmed medallion:
(1) DAWN, a rose pink E8A0BF sky with a half-risen sun over hills.
(2) NOON, a blazing gold F2C94C full sun with straight rays.
(3) DUSK, a copper D4842A half-sun sinking into silhouette ridges.
(4) NIGHT, a deep blue 5B9BD5 crescent moon with three stars.
Row 2: (5) THE DAY WHEEL, a large ornate brass clock ring split into four enamel
quarters colored rose E8A0BF, gold F2C94C, copper D4842A and blue 5B9BD5, with a
single lantern hand. (6) LOOP TILE, one worn square flagstone, dark umber 2B2417,
subtle rounded corners, lit from one side. (7) MEADOW RING, a small circle of pale
standing pebbles on bare earth, moonlit. (8) CAMPFIRE GLOW, a soft radial amber
FFB35C light halo with no source object.
Even spacing, nothing touching cell edges, no text anywhere.

**Colorblind note (binding):** the four quarter emblems must differ by ICON (sun position
/ moon), not color alone — the engine also shows DAWN/NOON/DUSK/NIGHT as text labels and
distinct hatch textures; art must keep the icon channel.

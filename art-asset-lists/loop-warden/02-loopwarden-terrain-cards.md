# Sheet 02 — The 12 terrain cards

**DROP-IN wiring (no engine patch):** hand cards are DOM buttons (`.card` built in
`renderHand`). Wire each illustration as a `background-image` keyed by card id with the
existing symbol/name/hint text laid over a darkened lower third. Also reused at ~34 px as
the on-board structure badge if sheet 04's token patch lands. Render 512 px per cell,
ship at 256.

Card ids in code: grove, grave, ratden, den, shrine, tower, mount, field, totem, market,
moon, sun. The last two are the clock-bender cards — make them feel special (brass +
enamel, more clockwork than terrain).

**PROMPT (copy-paste, makes one 3x4 sheet):**

Ember Vigil style: cozy dark-fantasy storybook game art, warm campfire ember glow on
deep indigo night, soft painted texture, amber rim light, brass clockwork accents,
crisp readable game-asset silhouettes, high contrast, no text, no watermark, flat
FF00FF magenta background for cutout. A sprite sheet, 3 rows x 4 columns, each cell
256x256 pixels on flat magenta FF00FF, each cell one small square terrain vignette
with softly rounded corners, painted like a tiny storybook diorama floating on magenta:
(1) GROVE, a healing spring under two silver birches, soft green 7AC47A light, fireflies.
(2) GRAVEYARD, three crooked headstones and one open grave breathing pale violet B9A6E8
mist, a bone hand emerging.
(3) RAT WARREN, a burrow mouth in a dirt bank with glinting eyes inside, tawny C9A06A.
(4) WOLF DEN, a dark cave mouth between rocks with two ember eyes and scattered bones,
rust red D97B6C accents.
(5) SUN SHRINE, a small stone altar holding a golden sunburst relic, warm gold FFD76A
rays, motes rising.
(6) WATCHTOWER, a lean stone tower with a lit brazier top and a bowman silhouette,
cool blue 9EC7E8 moonlight.
(7) MOUNTAIN, a single steep snow-capped peak with an ominous winged speck circling it,
stone grey B8B2A6.
(8) CLOVER FIELD, a soft meadow knoll glowing faint green 8FD6A8 under starlight.
(9) STORM TOTEM, a carved thunder totem crackling with one bright lightning arc,
storm yellow E8DE8A on indigo.
(10) TRADING POST, a lantern-lit market stall with hanging scales and coin sacks,
warm amber E8B46A.
(11) MOON WELL, a round stone well brimming with liquid moonlight, crescent moon
reflected, cool blue 7F9FE8 glow, thin brass clock ring floating above it.
(12) SUN DIAL, an ornate brass C8A84B sundial casting a burning noon shadow, gold
F2C94C glare, thin brass clock ring floating above it.
Even spacing, nothing touching cell edges, no text anywhere.

**Optional 13th asset (separate 512x768 image):** an empty CARD FRAME — rounded
rectangle, soot-black panel, thin brass double border, small clock notch at the top
center where the quadrant symbol sits. Used behind every card face.

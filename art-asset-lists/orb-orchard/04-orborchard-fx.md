# Sheet 04 — FX (seal burst, collect sparkles, hits, launches, speed plate, perfect burst)

**Wiring:** the engine already runs a burst list (`G.fx`, drawn as expanding stroked rings
in `render()`) for seal conversions and sunbead pickups — cells 1-3 replace that ring with
a 3-frame `drawImage` sequence scaled by `pp.sc` (small patch). Cells 4-9 are new juice at
the same hook points: dew pickup, sunbead pickup, thorn death (`fail()` + shake), bumper
bounce (`bounce()`), spring launch (`startJump(3,1)`), player jump. Cell 10 sits behind the
engine's "SPEED UP!" canvas text (text stays engine-drawn); cell 11 fires on the PERFECT
win screen; cell 12 star twinkles can salt any sky. All PATCH-level but tiny — each is one
`drawImage` at an existing event. Author at 256px; renderer is 270×410 internal,
pixel-upscaled ×2. FX honor the `PROG.fx` toggle.

**PROMPT (copy-paste):**

Chrome Horizon style: glossy 90s arcade special-stage art, candy-lacquer and polished
chrome surfaces with bright specular highlights, airbrushed gradient light, saturated
jewel colors over deep dusk blues, clean rounded game-asset silhouettes readable at 24
pixels, no text anywhere, flat magenta FF00FF background for knockout. A sprite sheet of
glowing visual effects, 3 rows x 4 columns, each cell 256x256 pixels on flat magenta
FF00FF, effects centered, nothing touching cell edges.
Row 1, the golden seal burst in three frames plus the dew sparkle: (1) SEAL BURST frame A,
a small tight ring of warm gold light FFE18C just igniting; (2) SEAL BURST frame B, the
ring grown to mid size with tiny gold sparks FFF2C8 flying off; (3) SEAL BURST frame C,
a wide thin fading gold ring with drifting motes; (4) DEW SPARKLE, a cluster of crisp
four-point icy white twinkles EAF7FF with a faint sky blue 8FC4EC bloom.
Row 2, impacts and launches: (5) SUNBEAD GLINT, one bright cream FFF2C8 star glint with a
small gold C8A84B halo ring; (6) THORN HIT, a sharp burst of garnet shards A23444 around
a hot white core flash, dangerous and sudden; (7) BUMPER BONK, a silvery F2F5F8 impact
ring with three small chrome stars C9CED6 knocked loose; (8) SPRING LAUNCH, a springy
spiral puff of mint light 79D68A corkscrewing upward with speed ticks.
Row 3, motion and celebration: (9) JUMP DUST, a soft cream E8DCC8 puff of two small
clouds kicked outward at ground level; (10) SPEED PLATE, a wide horizontal streak plate of
radiant gold FFD778 light with speedlines tapering at both ends, an empty calm center left
clear for overlaid text; (11) PERFECT BURST, a grand radial burst of gold rays C8A84B with
cream FFF2C8 star sparkles and one bright ring, triumphant; (12) STAR TWINKLES, a loose
set of five tiny white FFFFFF pinprick twinkles in three sizes for salting night skies.
Even spacing, no text anywhere.

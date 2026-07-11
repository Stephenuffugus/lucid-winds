# Sheet 04 — Backdrops + the Thaw Meadow strip

**DROP-IN wiring (sky) / SMALL-PATCH wiring (ground):** the sky backdrop is one full-bleed
image drawn first in `render()` (540x700, before the hills) — zero engine changes.
The ground band is 12 segment columns x 45px wide from y=700 to 960; thaw rows are 45x16px
tiles stacked up from the very bottom (0 to 6 rows per segment, `G.seg[]`); frozen texture is
small diamond glyphs (the colorblind cue for frozen — keep diamonds in art). Tiles wire in with
a one-line `drawImage` patch per rect. Generate sky at 1080x1400 and downscale; tiles at 4x.

**PROMPT (copy-paste):**

Midnight Vigil style: storybook paper-cut winter night art, layered matte flat shapes with
subtle paper grain, deep indigo midnight tones, crisp faceted ice-crystal geometry, warm
amber firelight accents with soft glow, clean bold silhouettes, cozy but composed, no text,
no watermark, crisp game-asset edges, flat FF00FF magenta background for cutout.
A layout sheet on flat magenta FF00FF with generous magenta gutters between panels.
Top half, one wide tall panel 1080x1400 pixels: a deep winter midnight sky backdrop,
indigo 070A16 zenith melting to steel blue 26364E horizon, a bright paper cut crescent
moon upper right, scattered tiny stars, faint drifting snowfall, two soft layered hill
silhouettes 1B2A3E along the bottom edge, empty of any creatures or buildings, calm and
still, built to sit behind falling game pieces.
Bottom half, one row of four square tiles, each 256x256 pixels:
(1) FROZEN GROUND tile, pale blue ice DFEEF8 with faint hairline cracks and two small
hollow diamond frost glyphs 8FB4CC, seamless when repeated side by side.
(2) THAW ROW tile, fresh spring meadow grass in deep green 5D9440 with a lighter 6FA84E
blade pattern, seamless when repeated side by side.
(3) BLOOMING THAW ROW tile, the same green meadow grass dotted with three tiny gold FFD98A
and pink E58FA0 wildflower specks, seamless when repeated side by side.
(4) GROUND LIP strip, a crisp snow white EEF7FD packed snow edge with soft blue shadow,
a thin horizontal border strip, seamless when repeated side by side.
Even spacing, nothing touching panel edges, no text anywhere.

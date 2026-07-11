# Sheet 03 — Sky panels (Dawn / Nebula / Aurora) + title hero panel

**Wiring:** DROP-IN. Draw the cut panel in `render()` before the checker-quad pass, keyed
by `PROG.sky` (`SKIES` keys `dawn` / `nebula` / `aurora`); the engine's gradient, glow disc
and procedural stars can then be skipped for that sky. Keep each panel's lower third dark
so orbs, the runner and the gold HUD stay readable — the checkerboard ground covers roughly
the bottom two thirds of the frame, but the fogged horizon blends INTO the panel's mid band,
so the mid band must stay close to the listed mid hex (distance fog mixes tile colors toward
it). Cell 4 title panel is a CSS background behind `#s-title` (DOM-only). Cut each cell,
ship at 540×820 JPG ≤150KB each (host resizes >1600px — stay under).

**PROMPT (copy-paste):**

Chrome Horizon style: glossy 90s arcade special-stage art, airbrushed gradient light,
saturated jewel colors over deep dusk blues, soft ambient occlusion, no text anywhere,
flat magenta FF00FF background for knockout. A sheet of four portrait panels, 2 rows x 2
columns, each cell 512x832 pixels on flat magenta FF00FF with wide magenta gutters,
panels fully inside their cells, nothing touching cell edges. Each panel is a smooth
airbrushed sky only, no ground, no characters, calm and vast.
Panel 1, DAWN: night indigo 0A1230 at the top blending through steel blue 27406E to a
warm burnished gold glow C8A84B pooling low, one small radiant gold sun disc sitting just
above the glow band, no stars, serene first-light mood.
Panel 2, NEBULA: deep violet-black 180A2C at the top through royal violet 4A286E to a
soft muted rose glow E58FA0 low down, wisps of faint nebula dust, sparse pinprick stars in
the upper half, the rose kept dusty and muted, never hot pink.
Panel 3, AURORA: near-black teal 061A1E at the top through deep sea green 1E5A54 to a
pale ice glow BFE0F2 low down, two gentle ribbons of aurora light curling through the
upper half, sparse pinprick stars, crisp cold air mood.
Panel 4, TITLE HERO: a tiny cream E8DCC8 rounded runner seen from behind, standing on the
crest of a glossy lacquered checkerboard planetoid in leaf green 79B356 and deep moss
3F5C2F that curves away below, polished glass dew orbs 8FC4EC and one gold ring E2B34D
floating along the curve, all under the Dawn sky of panel 1, cinematic and inviting, the
runner small against the vast sky, no text anywhere.

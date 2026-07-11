# Sheet 05 — UI chrome + title art

**DROP-IN wiring (no engine patch):** all DOM. Title art sits behind `#s-title` (CSS
background). Button plaques fill the `.btn` / `#retreatbtn` / `.buy` faces (painted plaque
pattern — art fills the button, text overlays). HUD chips (`#hud .chip`), hint bar
(`#hint`), camp rows (`.camprow`) get 9-slice panels. Keep every plaque readable behind
0.7rem+ cream text.

**PROMPT A — title art (one image, no magenta):**

Ember Vigil style key art, 1080x1920 portrait: a small hooded warden with a lantern
staff stands at a campfire on a ring-shaped stone path that loops away into the dark,
the ring quartered by four skies at once — rose dawn E8A0BF, gold noon F2C94C, copper
dusk D4842A and blue night 5B9BD5 — like a giant clock laid on the land, a brass clock
ring faintly etched in the sky above, distant monster silhouettes waiting on the far
side of the loop, warm ember glow against deep indigo 0B0D12 night, cozy dark-fantasy
storybook painting, no text, no watermark. Leave the lower third calm and dark for
menu buttons.

**PROMPT B — UI plaque sheet (copy-paste):**

Ember Vigil style: cozy dark-fantasy storybook game art, warm campfire ember glow on
deep indigo night, soft painted texture, amber rim light, brass clockwork accents,
crisp readable game-asset silhouettes, high contrast, no text, no watermark, flat
FF00FF magenta background for cutout. A sprite sheet, 3 rows x 3 columns on flat
magenta FF00FF:
(1) LONG BUTTON PLAQUE, 512x128, a soot-black wooden plank with thin brass double
border and faint ember underglow, empty center for text.
(2) GOLD BUTTON PLAQUE, 512x128, same plank with warm amber C8A84B sheen, for the
primary action.
(3) BLUE BUTTON PLAQUE, 512x128, same plank with cool moonlit 5B9BD5 sheen, for the
daily mode.
(4) HUD CHIP PANEL, 256x128, a small rounded soot panel with one brass rivet per
corner, empty center.
(5) HINT SCROLL, 512x128, a low dark parchment strip with curled ends, empty center.
(6) RETREAT PLAQUE, 512x128, the plank with a small campfire icon woven into the left
edge and an ember-lit right arrow into the right edge, empty center.
(7) CAMP PANEL, 512x160, a wide dark panel with a tent-canvas texture top edge and
brass corners, empty center.
(8) OVER BANNER, 512x256, a hanging cloth banner in deep indigo with brass rings and
a subtle clock-quarters motif along the bottom hem, empty center.
(9) TOAST PILL, 384x96, a small rounded soot pill with amber border glow, empty center.
Even spacing, nothing touching cell edges, no text anywhere.

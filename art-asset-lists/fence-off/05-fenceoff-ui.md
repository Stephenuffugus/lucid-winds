# Sheet 05 — UI chrome (buttons, chips, ribbons, wordmark)

**DROP-IN wiring:** all UI is DOM (`.btn`, `.dbtn`, `.chip`, `.rungcard`, `.wcard` in the CSS).
Painted plaques go in as `background-image` fills on the existing elements — art FILLS the
button, text stays live DOM on top (per the painted-plaque house rule). 48px minimum touch
targets are already enforced by the CSS; art must not shrink hit areas. Wordmark replaces the
`<h1>` text on the title screen only if it stays legible at 320px wide.

**PROMPT (copy-paste):**

Tin Yard style: vintage wind-up tin toy game art, warm enamel paint on pressed metal,
brass rivets and copper edges, soft studio lighting, deep slate blue workshop tones,
subtle painted wear, crisp game-asset silhouettes, no text, no watermark, flat FF00FF
magenta background for cutout. A sprite sheet, 3 rows x 3 columns, each cell 512x256
pixels on flat magenta FF00FF, pressed-tin game interface plates with empty faces and
no lettering.
Row 1:
(1) WIDE PRIMARY BUTTON plate, warm brass C9A34A frame with amber E0B64F enamel face and
four corner rivets, rounded rectangle.
(2) WIDE SECONDARY BUTTON plate, steel indigo 7F8CFF frame with slate 1A2030 enamel face,
rounded rectangle.
(3) SMALL SQUARE DOCK BUTTON plate, slate face with copper edge, subtle pressed border.
Row 2:
(1) HUD CHIP plate, small slim capsule in dark slate 0D0F14 with a thin brass rim.
(2) VICTORY RIBBON, a folded pressed-tin banner ribbon in gold FFD76A with cream E8DCC8
trim, ends swallow-tailed.
(3) DEFEAT RIBBON, the same folded banner in steel indigo 7F8CFF with slate trim.
Row 3:
(1) WORDMARK PLATE, a large empty rectangular tin sign with brass frame, two mounting
bolts and a small copper archway emblem at top center, face left blank.
(2) WARDROBE CARD frame, a small portrait tin frame with rounded corners and a tiny
wind-up key emblem at the base.
(3) LADDER RUNG MEDAL, a round enamel medal with a fence picket emblem, in bronze copper
tones B07B3E.
Even spacing, nothing touching cell edges, no text anywhere.

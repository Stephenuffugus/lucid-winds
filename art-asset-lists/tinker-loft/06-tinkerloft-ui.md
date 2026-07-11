# Sheet 06 — UI chrome

**DROP-IN wiring:** tray cards are `.traybtn`, run plaque is `#runbtn`, HUD chips
are `#hud .chip`, level cards `.lvlcard`, wardrobe cards `.wcard`, screen buttons
`.btn` — all CSS `background-image` swaps, zero engine changes. Title wordmark
sits above the `s-title` buttons. Follow `feedback_painted_plaque_buttons`: art
FILLS the button, text stays live DOM on top.

**PROMPT (copy-paste):**

Brass and Chalk style: warm vintage attic workshop game art, hand-built wooden and
brass contraption parts, chunky readable silhouettes, soft painterly shading with
crisp edges, chalk-white guide marks, no text, no watermark, flat FF00FF magenta
background for cutout. A sprite sheet, 3 rows x 3 columns, each cell 340x200
pixels on flat magenta FF00FF.
Row 1: (1) WIDE WOODEN PLAQUE button, oiled hardwood with brass corner screws and
a subtle chalk underline, empty center for live text. (2) GREEN RUN plaque, same
wooden plaque with a deep green baize inlay and brass edge, empty center. (3) RED
RESET plaque, same plaque with a worn oxblood leather inlay, empty center.
Row 2: (4) TRAY CARD, a small upright parchment tag with a brass eyelet at top and
soft drop shadow, empty. (5) HUD CHIP, a slim rounded dark walnut chip with a thin
brass border, empty. (6) LEVEL CARD, a square parchment workshop ticket with a
stamped brass corner rosette, empty center.
Row 3: (7) TITLE WORDMARK ORNAMENT, a horizontal brass-and-wood marquee frame with
a small gear finial at each end and chalk flourishes, open center for the game
title text. (8) LOCK BADGE, a tiny brass padlock with a chalk keyhole mark.
(9) STAR BADGE, a chunky brass five-point star on a small parchment ribbon for
no-nudge clears.
Even spacing, nothing touching cell edges, no text anywhere.

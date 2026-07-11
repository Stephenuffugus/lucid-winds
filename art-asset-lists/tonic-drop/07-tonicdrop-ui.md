# Sheet 07 — UI chrome: title crest · mode plaques · dock pads · HUD chips · card frames · ribbons

**DROP-IN wiring (DOM/CSS only):** every screen is HTML. These wire as CSS `background-image`
plates with LIVE DOM text kept on top (house rule — no baked labels):
- title crest replaces the `h1` on `#s-title` ("TONIC DROP", teal + cream).
- 4 mode buttons `#b-service` 🍾 / `#b-daily` 📅 / `#b-sprint` ⏱️ / `#b-zen` 🌙 (`.btn` teal/gold/blue).
- 5 dock pads `.padbtn`: `#c-left` ◀ · `#c-rot` ⟳ (`.rot` gold) · `#c-right` ▶ · `#c-soft` ⬇ ·
  `#c-hard` ⤓ (`.hard` blue). Touch targets stay ≥48px — art never shrinks the hit area.
- HUD `.chip` plates + `.hbtn` ⌂ back: grumps ▽ / score / caps 💰 / stage note.
- `.lvlcard` level-select frame (+ done ✓ / locked states) and `.scard` shop-card frame.
- win ribbon ("BOTTLE CLEARED" / "BOTTLE RACED") and over ribbon ("BOTTLE OVERFLOWED") for
  `#s-over`; `#toast` plate; the in-canvas "next" preview plate near the neck.
Render at 2×, downscale; keep every plate's center quiet and text-free.

**PROMPT (copy-paste):**

Apothecary Fizz style: moonlit tonic-apothecary game art — hand-blown tinted glass, cork and
brass fittings, deep plum-indigo shadows warmed by candle-gold rim light, glossy but crisp
game-asset silhouettes, no text, no watermark, flat FF00FF magenta background for cutout. A UI
sprite sheet, 4 rows x 4 columns, each cell 300x160 pixels on flat magenta FF00FF, empty
text-free centers, subjects centered, nothing touching cell edges.
Row 1, (1) TITLE CREST, a small glowing tonic bottle flanked by a teal, an amber and a rose
gel-cap with a brass banner ribbon beneath (empty for the words TONIC DROP), spanning wider,
288x140; (2) a wide primary BUTTON plaque, dark plum glass 1E1836 with a teal 46B3A6 rim and
soft top sheen, 288x96; (3) the same plaque in a GOLD C8A84B rim variant, 288x96; (4) the same
in a BLUE 5B9BD5 rim variant, 288x96.
Row 2, the four MODE emblems, each a small icon on a rounded dark lacquer tile with a thin rim:
(5) BOTTLE SERVICE, a corked tonic bottle; (6) DAILY BOTTLE, a bottle with a small calendar tag;
(7) SPRINT, a bottle streaking with speed lines and a tiny stopwatch; (8) ZEN FIZZ, a calm
crescent moon over gently rising bubbles.
Row 3, the five DOCK pads, chunky rounded square buttons of plum lacquer 191330 with a pressed
bevel, one cream chrome glyph each: (9) LEFT arrow ◀; (10) TURN, a circular rotate arrow ⟳ on a
gold-tinted 241C10 pad; (11) RIGHT arrow ▶; (12) SOFT DOWN, a single down chevron ⬇.
Row 4, (13) HARD DROP pad, the down-to-bar drop glyph ⤓ on a blue-tinted 14202B pad; (14) a slim
HUD CHIP plate, dark glass with a fine gold rim and a small ▽ grump-count mark area; (15) a
LEVEL/SHOP CARD frame, a rounded dark tile with a thin brass rim and a corner check-mark slot;
(16) two stacked RIBBON banners, a warm gold-green "cleared" banner above a muted plum-red
"overflowed" banner, both empty for text. Even spacing, consistent corner radii, no text
anywhere.

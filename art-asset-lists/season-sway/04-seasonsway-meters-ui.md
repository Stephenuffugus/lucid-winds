<!-- Season Sway · Sheet 4: Meters, seasons, card chrome, HUD & feedback FX -->
<!-- Copy everything below into your image generator to make this ONE sheet. -->

STYLE — "Gilded Almanac" (Season Sway / Sky Wolf Studios ink-and-gilt oracle deck). The instruments of the Keeper's card table: apothecary-style meter frames, gilt season medallions, lamplit wooden buttons and soft feedback washes, all in engraved-ink linework with flat warm gouache fills, one gilt-foil glint each, subtle paper grain, soft cel shading. Compact rounded silhouettes, centered and upright, pictographic only. Palette: midnight #0d100c / #0b0f0b, panel #0f150c, hedge line #2a331f, sage #7ab356, deep green #3f6b34, moss #8a9178, cream #e8dcc8, gold #c8a84b, button gold #d9b85a→#b2913a edged #eed48a, bloom #ffe9a8; meter hues sun-gold #d9b85a, rain-blue #6fb0e0, soil-umber #9c7a4a, wildlife-violet #c58fe0; choice-blue #5b9bd5, dew #bfe0f2; season tints spring #E8A0BF, summer #D4A843, autumn #D4842A, winter #A0C4E8; danger ember #e56b6b / high-amber #e5b06b; up-leaf #9ad06b / down-rose #e58f8f; ink #3a2c1e. NO photoreal, NO neon or glow blowout, NO text / letters / numbers / logos / watermarks (every label — S/R/O/W, names, season word, card count — is code-drawn). Compress under 150KB.

Create one sprite sheet. File: ss_ui.png. Grid: 4 columns x 5 rows (20 cells, left-to-right, top-to-bottom). Cell: 512x512. Master: 2048x2560.

KNOCKOUT: Flat magenta #FF00FF fills the entire background of every cell. NO magenta / hot-pink inside the art — keep wildlife-violet #c58fe0, spring pink #E8A0BF and down-rose #e58f8f clearly distinct from #FF00FF. Every piece centered, upright, fully inside its cell with margin, NO ground shadow; glow ribbons and washes (cells 17-20) must keep their light fully contained within the cell. COLORBLIND LAW (restated from the game): the four meters live at FIXED positions and each carries its OWN unmistakable pictogram silhouette — no two icons may share a silhouette, and identity must never rest on hue alone; the choice-preview arrows are ▲/▼ SHAPES first, color second; the danger state adds a FLASHING frame, not just a color change.

METER INSTRUMENTS (cells 1-9) — the four vertical gauges at the bottom of play (engine: rounded frame ~112x150, dark well, 28px fill bar, cream center target line, icon above, label below):
1. meter_frame — the shared gauge housing: a rounded-corner apothecary frame in panel #0f150c with a fine sage #7ab356 ink rim and a slim dark inner well running vertically; a thin cream #e8dcc8 target line crosses the well's exact middle. Portrait proportions (about 3:4 wide:tall inside the cell, matching the ~112x150 frame). The engine draws the colored fill inside the well.
2. meter_icon_sun — the Sun pictogram: a small round gilt sun in #d9b85a with SHORT TRIANGULAR RAYS, ink contour. Silhouette: rayed disc.
3. meter_icon_rain — the Rain pictogram: a plump cloud in dew #bfe0f2 / #6fb0e0 with THREE FALLING DROPS below it, ink contour. Silhouette: cloud-with-drops — never confusable with the rayed disc.
4. meter_icon_soil — the Soil pictogram: a rounded earth MOUND in soil-umber #9c7a4a with a single two-leaf sprout #7ab356 rising from it, ink contour. Silhouette: mound-with-sprout.
5. meter_icon_wild — the Wildlife pictogram: a small butterfly in wildlife-violet #c58fe0 with rounded ink-lined wings OPEN. Silhouette: twin-wing spread. Keep the violet away from #FF00FF.
6. meter_arrow_up — the choice-preview rise arrow: a chunky upward triangle in up-leaf #9ad06b shaped like a tiny pointed LEAF (stem nub at the base), ink contour; reads as ▲ at 18px.
7. meter_arrow_down — the choice-preview fall arrow: a chunky downward triangle in down-rose #e58f8f shaped like a tiny drooping PETAL, ink contour; reads as ▼ at 18px. Must mirror cell 6's weight so the pair reads by orientation alone.
8. meter_frame_danger — the danger state of cell 1: the same housing with the rim re-inked in ember #e56b6b, slightly thickened, with small heat-ticks at the corners; the engine pulses its alpha to make the warning FLASH (motion carries the alarm, not color alone).
9. meter_bar_cap — a small rounded gloss cap: a subtle cream #e8dcc8 sheen crescent the engine can seat on top of any colored fill bar so the liquid reads glassy; on transparent, tint-neutral.

SEASON MEDALLIONS (cells 10-13) — the turning year (engine shows the season name in the HUD and washes the screen 6% with the tint; these medallions give the HUD a gilt emblem, one per season, all struck from the same round coin so only the CENTER PICTOGRAM and rim tint change):
10. season_spring — a gilt-rimmed round medallion, spring-tinted #E8A0BF field, center pictogram a five-petal BLOSSOM in cream and ink.
11. season_summer — the same coin, summer gold #D4A843 field, center pictogram a rayed SUN disc.
12. season_autumn — the same coin, autumn copper #D4842A field, center pictogram a single falling OAK LEAF.
13. season_winter — the same coin, winter ice #A0C4E8 field, center pictogram a six-arm SNOWFLAKE. Four distinct center silhouettes: blossom / sun / leaf / flake.

TABLE FURNITURE (cells 14-16) — the lamplit wooden UI:
14. hud_chip — the square 48px corner chip (menu ‹ and retry ↻ live here, glyphs code-drawn): a rounded dark panel #0f150c with a soft sage #7ab356 ink rim and a faint inner lamplight gradient; quiet, touchable.
15. btn_plate — the standard menu button plate: a wide rounded lozenge in deep hedge greens (#1a2415 → #121a0f feel) with a fine #2a331f ink rim and a warm top sheen; landscape (about 3:1) inside the cell. Text is code-drawn.
16. btn_plate_gold — the primary button plate: the same lozenge struck in button gold #d9b85a → #b2913a with an #eed48a bright edge and a gilt-foil top glint; the "begin the year" button. Landscape 3:1.

FEEDBACK & FX (cells 17-20):
17. choice_ribbon_left — the LEFT swipe edge glow: a soft vertical ribbon of choice-blue #5b9bd5 light, dense at the left edge and feathering to nothing rightward, faint ink almanac-scroll filigree inside; the engine scales its alpha with drag distance. Fully contained.
18. choice_ribbon_right — the RIGHT swipe edge glow: the mirrored ribbon in gold #d9b85a with the same filigree; dense at the right edge, feathering leftward. Left=blue and right=gold also differ by SIDE, so no hue dependence.
19. swipe_hint — a pictographic first-run hint: a small cream #e8dcc8 pointing hand with two short curved motion arcs sweeping left and right of it (NO words); gentle, semi-transparent, lamplit.
20. ending_wash — the run-end vignette: a soft radial wash that deepens toward the frame in midnight #0a0d0a with a warm #ffe9a8 heart at center where the keepsake bloom appears; the engine fades it in over the table. Calm, chapel-quiet, fully contained.

# Sheet 05 — Court board + felts (1536×1024, grid 3×2 cells of 512px)

**Copy-paste prompt:**

Illuminated-manuscript trading card art, aged vellum texture, burnished gold leaf accents, woodcut engraving linework, deep walnut and brass surroundings, soft candlelit shading, no text anywhere in the image, flat magenta #FF00FF background for knockout. A sprite sheet on a 3×2 grid of 512px cells, isolated on flat magenta #FF00FF:

Row 1: (1) the COURT BOARD: a dark walnut 3×3 card table inlaid with brass square borders, subtle candle vignette, empty squares slightly recessed; (2) FERTILE square overlay: warm brass-green luminous inlay with tiny rising motes; (3) THORN square overlay: iron ring of forged thorns on darkened wood.
Row 2 — full-bleed TABLE FELTS (512px tiles, soft, sit behind the board): (1) Midnight Court: deep green-black damask; (2) Rose Court: oxblood damask with faint rose thread; (3) Gilded Court: black-and-gold brocade, the richest of the three.

**Wire notes:** board underlays `#board` (cells stay engine-positioned, 148×152 + 7px gaps); fertile/thorn overlays sit inside `.bcell.fert/.thorn` under the engine `RICH +1` / `THORN −1` tags; felts replace the `#stage` gradient classes (default / `felt-rose` / `felt-gild`) — unlocks: free / beat 5 courtiers / beat all 10 (live `WARD` thresholds).

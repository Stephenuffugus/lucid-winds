/**
 * Astra's round 2 plates in numbers (m3 step 11). Every number the code uses for a plate lives here, in the unit her anchors use for that plate or at her
 * CSS display size where the plate draws at half its pixels; test/plates.mjs holds each one to src/data/astra_r2.json, and index.html's style sheet writes the same ones.
 */
export const CHIP = { w: 152, h: 56, slice: 24, pipX0: 16, pipStep: 20, pipY: 39, pipSize: 16, nameBand: [10, 7, 132, 15] };   // m4: her round 3 chip, 304 by 112 at 152 by 56, pips 20 apart
export const TIER_TILE = { slice: 32, mark: [48, 10], markSize: 16, content: [13, 22, 70, 61] };   // m4: her round 3 render box inside the retained 192 tile
export const TIER_PILL = { w: 280, h: 48, slice: 32, mark: [140, 10], markSize: 16, content: [12, 21, 256, 15] };
export const LEVEL_STRIP = { w: 320, h: 60, slice: 28, mark: [27, 30], markSize: 24, level: [47, 9, 260, 18], reward: [47, 32, 260, 16] };
export const POT_CLOTH = { w: 335, h: 240, slice: 40, stakeX0: 47.5, stakeStep: 60, stakeSize: 48 };
/* the plate is 900 by 1200; the tin shows rows cropTop to cropBottom, the resting places and the names, so the tin's screen stays on a 640 tall phone */
export const HEIRLOOM = {
  w: 900, h: 1200, cropTop: 320, cropBottom: 712, canvasPx: 200,
  windows: [[30, 340, 240, 240], [330, 340, 240, 240], [630, 340, 240, 240]],
  names: [[24, 604, 252, 100], [324, 604, 252, 100], [624, 604, 252, 100]],
  rests: [[150, 460], [450, 460], [750, 460]]
};
/* centre x, centre y, radius x, radius y at her 320 CSS display */
export const POUCH_MOUTH = { standard: [160, 125, 108, 78], collector: [160, 128, 110, 76], grail: [156.5, 131.5, 97.5, 70] };
export const POUCH = { display: 320, renderR: 60, canvasPx: 240 };
export const SHARE_MARBLE = { w: 1080, h: 1080, render_window: [96, 180, 888, 570], wordmark_band: [96, 48, 888, 84], name_band: [96, 794, 888, 76], provenance_band: [96, 914, 888, 96] };
export const SHARE_MATCH = {
  w: 1080, h: 1920, title_band: [72, 64, 936, 120], render_window: [72, 252, 936, 936], score_band: [72, 1232, 936, 124], techniques_band: [72, 1390, 936, 84],
  pot_cloth_box: [72, 1510, 936, 318], pot_render_centers: [[252, 1620], [540, 1620], [828, 1620]], pot_render_radius: 66, provenance_band: [108, 1724, 864, 68], footer_band: [72, 1848, 936, 48]
};
/* an integer repeat round the ring (her rule), keyed by the ring in feet; her line 40 px of a 64 px strip is the 52 mm line, so the strip's band is 83.2 mm */
export const CHALK_REPEATS = { 5: 2, 7: 3, 10: 4, 13: 5 };
export const CHALK_STRIP = { linePx: 40, lineM: 0.052, bandM: 0.0832 };
export const CROSS_R2 = { sizePx: 256, armPx: 100 };
export const LAG_R2 = { widthPx: 1024, heightPx: 64, linePx: 20 };
/* the band stands on the fence's foot; the strip does not tile, so it pans in a window of bearings about the first view (windowDeg) and steps aside beyond it */
export const HORIZON = { w: 4096, h: 512, footY: 360, windowDeg: 75 };

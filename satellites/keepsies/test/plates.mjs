/* PLATES (m3 step 11): every number the code uses for one of Astra's round 2 plates equals her anchors in src/data/astra_r2.json. A plate wired by eye drifts a few pixels a screen and nobody can say from what. */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { CHIP, TIER_TILE, TIER_PILL, LEVEL_STRIP, POT_CLOTH, HEIRLOOM, POUCH_MOUTH, POUCH, SHARE_MARBLE, SHARE_MATCH, CHALK_REPEATS, CHALK_STRIP, HORIZON, CROSS_R2, LAG_R2 } from '../src/render/plates.js?v=20261106a';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const A = JSON.parse(readFileSync(join(ROOT, 'src/data/astra_r2.json'), 'utf8')).anchors;
const H = readFileSync(join(ROOT, 'index.html'), 'utf8');
let fails = 0;
const ok = (c, m) => { if (!c) { console.log('FAIL ' + m); fails++; } };
const same = (a, b, m) => ok(JSON.stringify(a) === JSON.stringify(b), m + ': code ' + JSON.stringify(a) + ', hers ' + JSON.stringify(b));
const half = (a) => a.map(v => v / 2);
const css = (t, m) => ok(H.indexOf(t) >= 0, 'index.html lacks ' + t + ' (' + m + ')');

/* B2 the player chip: her pip centres are at x = 32 + 48k, y 78 of 352 by 112, drawn at half size */
const chip = A['ui/player_chip_r2.png'];
same(chip.pip_centers.map(half), Array.from({ length: 7 }, (_, k) => [CHIP.pipX0 + CHIP.pipStep * k, CHIP.pipY]), 'chip pip centres');
same(half(chip.pip_size)[0], CHIP.pipSize, 'chip pip size');
same(half(chip.name_band), CHIP.nameBand, 'chip name band');
same(chip.nine_slice[0], CHIP.slice, 'chip slice');
css('border-image:var(--chip) ' + CHIP.slice + ' / ' + CHIP.slice / 2 + 'px stretch', 'the chip draws on her slice');
css('max-width:' + CHIP.w + 'px', 'the chip stands at her width');

/* B3 the tier frames: the mark is its own icon at her centre, never stretched with the frame */
for (const t of ['common', 'uncommon', 'rare', 'epic', 'grail']) {
  const tile = A['ui/tier_' + t + '_tile.png'], pill = A['ui/tier_' + t + '_pill.png'];
  same(half(tile.mark_center), TIER_TILE.mark, t + ' tile mark');
  same(half(tile.content_box), TIER_TILE.content, t + ' tile content box');
  same(half(pill.mark_center), TIER_PILL.mark, t + ' pill mark');
  same(half(pill.content_box), TIER_PILL.content, t + ' pill content box');
  same(tile.nine_slice[0], TIER_TILE.slice, t + ' tile slice');
  same(pill.nine_slice[0], TIER_PILL.slice, t + ' pill slice');
}
css('border-image:var(--tier-common) ' + TIER_TILE.slice + ' / ' + TIER_TILE.slice / 2 + 'px stretch', 'the tile frame on her slice');
ok(TIER_PILL.content[3] >= 14, 'a 14 px pill label fits her content box');

/* B4 the level strip */
const lv = A['ui/level_up_strip.png'];
same(half(lv.mark_center), LEVEL_STRIP.mark, 'level strip mark');
same(half(lv.level_band), LEVEL_STRIP.level, 'level band');
same(half(lv.reward_band), LEVEL_STRIP.reward, 'reward band');
same(lv.css_size, [LEVEL_STRIP.w, LEVEL_STRIP.h], 'level strip size');

/* B5 the pot cloth: five stake slots show at once */
const pot = A['ui/pot_cloth_r2.png'];
same(pot.css_size, [POT_CLOTH.w, POT_CLOTH.h], 'pot cloth size');
same(pot.nine_slice[0], POT_CLOTH.slice, 'pot cloth slice');
same(pot.stake_size[0] / 2, POT_CLOTH.stakeSize, 'stake size');
same(pot.stake_centers[0].map(p => p[0] / 2), Array.from({ length: 5 }, (_, k) => POT_CLOTH.stakeX0 + POT_CLOTH.stakeStep * k), 'stake centres');
ok(5 * POT_CLOTH.stakeSize + 4 * (POT_CLOTH.stakeStep - POT_CLOTH.stakeSize) <= pot.stake_rows[0][2] / 2, 'five stakes fit her row');
css('border-image:var(--pot-cloth) ' + POT_CLOTH.slice + ' fill / ' + POT_CLOTH.slice / 2 + 'px stretch', 'the cloth on her slice');

/* B6 the heirloom cloth */
const hl = A['ui/heirloom_cloth_r2.webp'];
same(hl.render_windows, HEIRLOOM.windows, 'heirloom render windows');
same(hl.name_bands, HEIRLOOM.names, 'heirloom name bands');
same(hl.resting_places.map(r => r.center), HEIRLOOM.rests, 'heirloom resting places');
ok(HEIRLOOM.cropTop <= hl.render_windows[0][1] && HEIRLOOM.cropBottom >= hl.name_bands[0][1] + hl.name_bands[0][3], 'the shown rows hold the windows and the names');

/* B10 the open pouches: POUCH_MOUTH from her anchors, the render r 60 of a 320 display */
for (const k of ['standard', 'collector', 'grail']) {
  const p = A['ui/pouch_' + k + '_open_r2.webp'];
  same(POUCH_MOUTH[k], p.mouth_ellipse, k + ' mouth');
  same([POUCH_MOUTH[k][0], POUCH_MOUTH[k][1]], p.live_render_center, k + ' render centre');
  same(POUCH.renderR, p.live_render_radius, k + ' render radius');
  same(POUCH.display, p.display_css[0], k + ' display');
  ok(POUCH.renderR <= POUCH_MOUTH[k][3] && POUCH.renderR <= POUCH_MOUTH[k][2], k + ': the render circle fits her mouth');
}

/* B11 the share cards */
const sm = A['sharing/share_marble_r2.png'], st = A['sharing/share_match_r2.png'];
for (const f of ['render_window', 'wordmark_band', 'name_band', 'provenance_band']) same(SHARE_MARBLE[f], sm[f], 'marble card ' + f);
for (const f of ['title_band', 'render_window', 'score_band', 'techniques_band', 'pot_cloth_box', 'pot_render_centers', 'pot_render_radius', 'provenance_band', 'footer_band']) same(SHARE_MATCH[f], st[f], 'match card ' + f);

/* B8 the chalk: an integer repeat per ring, her line 40 px of 64 is the 52 mm line */
const ck = A['env/chalk_stroke.webp'];
same(CHALK_REPEATS, { 5: 2, 7: 3, 10: 4, 13: 5 }, 'chalk repeats');
same(CHALK_STRIP.linePx, ck.line_thickness, 'chalk line px');
ok(Math.abs(CHALK_STRIP.bandM - CHALK_STRIP.lineM * 64 / ck.line_thickness) < 1e-9, 'the band is the line times 64 over 40');
same(CROSS_R2.armPx, A['env/cross_marker_r2.png'].arm_extent, 'cross arm extent');
same(LAG_R2.linePx, A['env/lag_line_r2.png'].line_thickness, 'lag line px');

/* B9 the horizon: the fence's foot, and the band stands on it */
const hz = A['env/horizon_strip.webp'];
same(HORIZON.footY, hz.fence_foot_y, 'horizon foot');

console.log(fails ? fails + ' FAILED' : 'PLATES OK');
process.exit(fails ? 1 : 0);

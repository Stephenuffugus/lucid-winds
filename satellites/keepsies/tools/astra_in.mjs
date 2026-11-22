/**
 * Astra's pack v1 into the served folder (KEEPSIES_BUILD_PLAN.md step 2).
 *
 *   node tools/astra_in.mjs [packDir]      default /workspaces/keepsies-astra-v1/pack
 *
 * The masters stay in the pack, outside git. This copies the runtime set into assets/ (env/, ui/, sharing/,
 * store/), builds the ONE icon sprite assets/ui/icons.svg (symbol i-<name> for each of the 49 icons in its own
 * viewBox, ink currentColor, and the two wordmarks with their background plate dropped and their ink turned to
 * currentColor), lays the three identity icons over the ones beside index.html and the arcade thumb over
 * portal-assets/thumbs/keepsies.jpg. Re-runnable and deterministic: the same pack writes the same bytes.
 *
 * Never shipped: store/ holds the six store frames for the store kit (exempt from the size rule, never loaded,
 * and left out of the deploy's served set); the 640 px pouch masters, the 320 px portrait masters, the Meshy
 * references, the promo art and the contact sheets stay in the pack.
 *
 * ROUND 2 (m3 step 5): after v1, from /workspaces/keepsies-astra-round2 (ASTRA2 to change it): the 15 D icons and the two owner marks join the
 * one sprite, the runtime files go to assets/env, assets/ui and assets/sharing under law 7 (R2 below; the heavy PNGs become WebP in a real
 * Chrome canvas), her anchors for those files go to src/data/astra_r2.json. Never her previews, boards or Meshy references.
 *
 *   node tools/astra_in.mjs --check      ASTRA IN OK: every round 2 output exists, under 1600 px a side (store excepted) and under its byte cap,
 *                                        the sprite holds all 49 old ids plus the 17 new. Never reads a pack, so CI can run it.
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, readdirSync, existsSync, statSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CHECK = process.argv.includes('--check');
const PACK = join((process.argv[2] && process.argv[2] !== '--check' && process.argv[2]) || '/workspaces/keepsies-astra-v1/pack', 'assets');
const PACK2 = process.env.ASTRA2 || '/workspaces/keepsies-astra-round2';
const OUT = join(ROOT, 'assets');
const R2_JSON = join(ROOT, 'src', 'data', 'astra_r2.json');
const OLD_IDS = 51 /* 49 icons and the 2 wordmarks */, NEW_ICONS = ['d_icons/arch', 'd_icons/column', 'd_icons/confirm', 'd_icons/lay_bunch', 'd_icons/lay_cross', 'd_icons/lay_ring', 'd_icons/lay_x', 'd_icons/level_up', 'd_icons/loaf', 'd_icons/move_statue', 'd_icons/orb', 'd_icons/provenance', 'd_icons/share', 'd_icons/statues', 'd_icons/undo', 'a_statues/owner_you', 'a_statues/owner_dusty'];

/* the size of a PNG or WebP on disk, from its header */
function imageSize(file) {
  const b = readFileSync(file);
  if (b.slice(1, 4).toString() === 'PNG') return [b.readUInt32BE(16), b.readUInt32BE(20)];
  if (b.slice(0, 4).toString() === 'RIFF' && b.slice(8, 12).toString() === 'WEBP') {
    const fmt = b.slice(12, 16).toString();
    if (fmt === 'VP8X') return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
    if (fmt === 'VP8L') { const v = b.readUInt32LE(21); return [1 + (v & 0x3fff), 1 + ((v >> 14) & 0x3fff)]; }
    if (fmt === 'VP8 ') return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
  }
  return null;
}
if (CHECK) {
  const bad = [], meta = JSON.parse(readFileSync(R2_JSON, 'utf8')), files = Object.assign({}, meta.files, JSON.parse(readFileSync(join(ROOT, 'src', 'data', 'astra_r3.json'), 'utf8')).files);   // round 2 and round 3
  let bytes = 0;
  for (const rel of Object.keys(files)) {
    const f = join(OUT, rel), cap = files[rel].cap;
    if (!existsSync(f)) { bad.push(rel + ' is missing'); continue; }
    const n = statSync(f).size; bytes += n;
    if (n > cap) bad.push(rel + ' is ' + n + ' bytes, its cap is ' + cap);
    if (!/\.svg$/.test(rel) && !rel.startsWith('store/')) { const sz = imageSize(f); if (!sz) bad.push(rel + ': no size read'); else if (Math.max(sz[0], sz[1]) > 1600 && !files[rel].over) bad.push(rel + ' is ' + sz.join('x') + ', over 1600 px a side'); }
  }
  const sprite = readFileSync(join(OUT, 'ui', 'icons.svg'), 'utf8'), ids = (sprite.match(/<symbol id="i-/g) || []).length;
  if (ids !== OLD_IDS + NEW_ICONS.length) bad.push('the sprite holds ' + ids + ' ids, not ' + (OLD_IDS + NEW_ICONS.length));
  for (const nm of NEW_ICONS) if (sprite.indexOf('id="i-' + nm.split('/')[1] + '"') < 0) bad.push('the sprite lacks i-' + nm.split('/')[1]);
  for (const nm of ['top_down', 'zoom', 'play', 'wordmark_keepsies']) if (sprite.indexOf('id="i-' + nm + '"') < 0) bad.push('an old id is gone: i-' + nm);
  if (bad.length) { console.log('ASTRA IN FAILED\n  ' + bad.join('\n  ')); process.exit(1); }
  console.log('ASTRA IN OK: ' + Object.keys(files).length + ' round 2 files, ' + (bytes / 1024).toFixed(0) + ' KB, ' + ids + ' symbols');
  process.exit(0);
}

const BOSSES = ['dusty', 'marlene', 'pitboss', 'ironsides', 'curator'];
const COPY = {
  env: ['b_ring/dirt_albedo.webp', 'b_ring/chalk_ring.png', 'b_ring/cross_marker.png', 'b_ring/lag_line.png',
    'b_ring/ground_shadow.png', 'b_ring/lot_panorama.webp'],
  ui: [].concat(
    // the ten boss states at 160 and at 96 (the 320 px masters stay in the pack)
    ...BOSSES.map(b => ['ring', 'kept_it'].map(s => ['c_people/boss_' + b + '_' + s + '.webp', 'c_people/boss_' + b + '_' + s + '_96.webp'])).flat(),
    ['c_people/dusty_tin_scene.webp', 'c_people/heirloom_cloth.webp', 'c_people/rung_opponents_sheet.png'],
    // the six pouch states at 320
    ...['standard', 'collector', 'grail'].map(p => ['closed', 'open'].map(s => 'e_economy/pouch_' + p + '_' + s + '.webp')),
    ['e_economy/clay_bowl.svg', 'e_economy/chores_board.svg', 'e_economy/level_up.svg', 'e_economy/pot_cloth.svg',
      'e_economy/showcase_6.svg', 'e_economy/showcase_12.svg', 'e_economy/ransom_envelope.svg'],
    ['g_hud/minimap_frame.svg', 'g_hud/house_rule_on.svg', 'g_hud/house_rule_off.svg', 'g_hud/pip_empty.svg',
      'g_hud/pip_lit.svg', 'g_hud/player_chip.svg', 'g_hud/result_card.svg', 'g_hud/voice_bubble.svg',
      'g_hud/technique_toast.svg', 'g_hud/aim_line.svg', 'g_hud/snap_trail.svg', 'g_hud/reticle_settling.svg',
      'g_hud/reticle_settled.svg'],
    ['common', 'uncommon', 'rare', 'epic', 'grail'].map(t => 'g_hud/tier_' + t + '.svg'),
    [0, 1, 2, 3].map(n => 'g_hud/calibration_' + n + '.svg')
  ).flat(),
  sharing: ['i_sharing/marble_card.png', 'i_sharing/match_card.png'],
  store: ['snap', 'ring_pot', 'collection', 'heirloom', 'ransom', 'showcase'].map((n, i) => 'j_store/frame_' + (i + 1) + '_' + n + '.png')
};

let n = 0;
for (const dir of Object.keys(COPY)) {
  mkdirSync(join(OUT, dir), { recursive: true });
  for (const rel of COPY[dir]) { copyFileSync(join(PACK, rel), join(OUT, dir, rel.split('/').pop())); n++; }
}

/* ---------------------------------------------------------------- the one sprite */
function parts(file) {
  const svg = readFileSync(file, 'utf8');
  const vb = (svg.match(/viewBox="([^"]+)"/) || [])[1];
  const body = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  if (!vb) throw new Error(file + ' has no viewBox');
  return { vb, body };
}
const syms = [];
const icons2 = NEW_ICONS.map(nm => ({ id: nm.split('/')[1], file: join(PACK2, 'assets', nm + '.svg') }));
const icons = readdirSync(join(PACK, 'f_icons')).filter(f => /^icon_.*\.svg$/.test(f)).sort();
for (const f of icons) {
  const { vb, body } = parts(join(PACK, 'f_icons', f));
  if (/#[0-9a-f]{3,6}/i.test(body)) throw new Error(f + ' carries a fixed colour; the sprite is currentColor only');
  syms.push('<symbol id="i-' + f.slice(5, -4) + '" viewBox="' + vb + '">' + body + '</symbol>');
}
for (const ic2 of icons2) {
  const { vb, body } = parts(ic2.file);
  if (/#[0-9a-f]{3,6}/i.test(body)) throw new Error(ic2.file + ' carries a fixed colour; the sprite is currentColor only');
  syms.push('<symbol id="i-' + ic2.id + '" viewBox="' + vb + '">' + body + '</symbol>');
}
for (const w of ['keepsies', 'pocket_legends']) {
  let { vb, body } = parts(join(PACK, 'a_identity', 'wordmark_' + w + '_light.svg'));
  body = body.replace(/<rect width="1000" height="210" fill="#[0-9a-f]{6}"\/>/i, '').replace(/stroke="#[0-9a-f]{6}"/gi, 'stroke="currentColor"');
  syms.push('<symbol id="i-wordmark_' + w + '" viewBox="' + vb + '">' + body + '</symbol>');
}
writeFileSync(join(OUT, 'ui', 'icons.svg'),
  '<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden">\n'
  + syms.join('\n') + '\n</svg>\n');

/* ---------------------------------------------------------------- identity */
copyFileSync(join(PACK, 'a_identity/icon_192.png'), join(ROOT, 'icon-192.png'));
copyFileSync(join(PACK, 'a_identity/icon_512.png'), join(ROOT, 'icon-512.png'));
copyFileSync(join(PACK, 'a_identity/icon_maskable_512.png'), join(ROOT, 'icon-maskable-512.png'));
copyFileSync(join(PACK, 'a_identity/keepsies.jpg'), join(ROOT, '..', '..', 'portal-assets', 'thumbs', 'keepsies.jpg'));

/* ---------------------------------------------------------------- round 2 */
/* out, source, byte cap, anchors key; webp: [w, h, quality, cropBottomRow] drawn through a real Chrome canvas; every other file copied as is */
const R2 = [
  ['env/horizon_strip.webp', 'b_fixes/horizon_strip.png', 160000, 'b_fixes/horizon_strip.png', { webp: [2048, 220, 0.8, 440], over: 1 }],
  ['env/chalk_stroke.webp', 'b_fixes/chalk_stroke.svg', 40000, 'b_fixes/chalk_stroke.svg', { webp: [2048, 64, 0.9], over: 1 }],
  ['env/cross_marker_r2.png', 'b_fixes/cross_marker.png', 4000, 'b_fixes/cross_marker.svg'], ['env/lag_line_r2.png', 'b_fixes/lag_line.png', 2000, 'b_fixes/lag_line.svg'],
  ['env/shadow_dark.png', 'b_fixes/shadow_dark.png', 12000, 'b_fixes/shadow_dark.svg'], ['ui/contact_lift.png', 'b_fixes/dark_plate_contact_lift.png', 24000, 'b_fixes/dark_plate_contact_lift.svg'],
  ['ui/tray.png', 'a_statues/tray.png', 10000, 'a_statues/tray.svg'], ['ui/tile_idle.png', 'a_statues/tile_idle.png', 5000, 'a_statues/tile_idle.svg'], ['ui/tile_pressed.png', 'a_statues/tile_pressed.png', 5000, 'a_statues/tile_pressed.svg'], ['ui/tile_dragging.png', 'a_statues/tile_dragging.png', 5000, 'a_statues/tile_dragging.svg'],
  ['ui/not_here_chip.png', 'a_statues/not_here_chip.png', 5000, 'a_statues/not_here_chip.svg'], ['env/footprint_allowed.png', 'a_statues/footprint_arch_allowed.png', 14000, 'a_statues/footprint_arch_allowed.svg'], ['env/footprint_blocked.png', 'a_statues/footprint_arch_blocked.png', 14000, 'a_statues/footprint_arch_blocked.svg'],
  ['env/move_reach.png', 'a_statues/move_reach.png', 60000, 'a_statues/move_reach.svg'], ['env/move_origin.png', 'a_statues/move_origin.png', 3000, 'a_statues/move_origin.svg'],
  ['ui/aim_dash.svg', 'b_fixes/aim_dash.svg', 1000, 'b_fixes/aim_dash.svg'], ['ui/aim_cap.svg', 'b_fixes/aim_cap.svg', 1000, 'b_fixes/aim_cap.svg'],
  ['env/calibration_target.png', 'c_screens/calibration_target.png', 40000, 'c_screens/calibration_target.svg'], ['ui/calibration_hint.png', 'c_screens/calibration_hint.png', 6000, 'c_screens/calibration_hint.svg'],
  ['ui/player_chip_r2.png', 'b_fixes/player_chip.png', 6000, 'b_fixes/player_chip.svg'], ['ui/level_up_strip.png', 'b_fixes/level_up_strip.png', 6000, 'b_fixes/level_up_strip.svg'],
  ['ui/pot_cloth_r2.png', 'b_fixes/pot_cloth.png', 14000, 'b_fixes/pot_cloth.svg'], ['ui/heirloom_cloth_r2.webp', 'b_fixes/heirloom_cloth.png', 60000, 'b_fixes/heirloom_cloth.svg', { webp: [900, 1200, 0.85] }]
].concat(['common', 'uncommon', 'rare', 'epic', 'grail'].flatMap(t => [['ui/tier_' + t + '_pill.png', 'b_fixes/tier_' + t + '_pill.png', 6000, 'b_fixes/tier_' + t + '_pill.svg'], ['ui/tier_' + t + '_tile.png', 'b_fixes/tier_' + t + '_tile.png', 6000, 'b_fixes/tier_' + t + '_tile.svg']]),
  ['standard', 'collector', 'grail'].map(p => ['ui/pouch_' + p + '_open_r2.webp', 'b_fixes/pouch_' + p + '_open.png', 40000, 'b_fixes/pouch_' + p + '_open.png', { webp: [320, 320, 0.85], halve: 1 }]),
  [['sharing/share_marble_r2.png', 'b_fixes/share_marble.png', 12000, 'b_fixes/share_marble.svg'], ['sharing/share_match_r2.png', 'b_fixes/share_match.png', 20000, 'b_fixes/share_match.svg', { over: 1 }],
   ['store/frame_7_statues.png', 'e_store/statues_store_frame.png', 40000, 'e_store/statues_store_frame.svg']]);
const anchors2 = JSON.parse(readFileSync(join(PACK2, 'anchors.json'), 'utf8')), meta2 = { _: 'Astra round 2: the anchors of the files in use and each file byte cap (tools/astra_in.mjs). Written by the tool.', files: {}, anchors: {}, owner_decals_mm: anchors2._owner_decal_placements_mm, statue_geometry_mm: anchors2._statue_geometry_mm };
const toConvert = [];
for (const [out, src, cap, key, o] of R2) {
  mkdirSync(dirname(join(OUT, out)), { recursive: true });
  const a = anchors2['assets/' + key];
  meta2.files[out] = o && o.over ? { cap, over: 1 } : { cap };
  if (a) {
    const c = JSON.parse(JSON.stringify(a));
    if (o && o.halve && c.mouth_ellipse) { c.mouth_ellipse = c.mouth_ellipse.map(v => v / 2); c.live_render_center = c.live_render_center.map(v => v / 2); c.live_render_radius /= 2; }
    meta2.anchors[out] = c;
  }
  if (o && o.webp) toConvert.push({ out, src: join(PACK2, 'assets', src), w: o.webp[0], h: o.webp[1], q: o.webp[2], crop: o.webp[3] || 0 });
  else copyFileSync(join(PACK2, 'assets', src), join(OUT, out));
}
const require = createRequire(import.meta.url), puppeteer = require('/workspaces/lucid-winds/node_modules/puppeteer');
const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] }), page = await browser.newPage();
for (const c of toConvert) {
  const mime = /\.svg$/.test(c.src) ? 'image/svg+xml' : 'image/png', data = 'data:' + mime + ';base64,' + readFileSync(c.src).toString('base64');
  const url = await page.evaluate(async (data, c) => {
    const im = new Image(); im.src = data; await im.decode();
    const cv = document.createElement('canvas'); cv.width = c.w; cv.height = c.h;
    const srcH = c.crop || im.naturalHeight || c.h;
    cv.getContext('2d').drawImage(im, 0, 0, im.naturalWidth || c.w, srcH, 0, 0, c.w, c.h);
    return cv.toDataURL('image/webp', c.q);
  }, data, c);
  writeFileSync(join(OUT, c.out), Buffer.from(url.slice(url.indexOf(',') + 1), 'base64'));
}
await browser.close();
writeFileSync(R2_JSON, JSON.stringify(meta2, null, 1) + '\n');

/* ---------------------------------------------------------------- round 3 (m4, KEEPSIES_M4_BUILD_PLAN.md step 0) */
/* from /workspaces/keepsies-astra-round3 (ASTRA3 to change it): the hold circle and its braced state, the spin marks, the dial cue
   (SVG, 154 and 48 px, drawn as they will show), her chip at 152 by 56, the chalk stroke with its breaks (PNG, 2048 by 64, over
   1600 wide by nature), the optional fine dirt tile (off by default). Her reticles are drawn inline by main.js from her numbers
   (the radius moves, the strokes never scale), her snap card is inlined in index.html, her tier tiles, pills, shadow_dark and
   owner marks are byte equal to what the game holds (retained), and her ground_shadow is round 2's under a new name (left). */
const PACK3 = process.env.ASTRA3 || '/workspaces/keepsies-astra-round3/pack';
const R3 = [
  ['ui/hold_circle.svg', 'a_circle/hold_circle.svg', 2000], ['ui/hold_circle_braced.svg', 'a_circle/hold_circle_braced.svg', 2000],
  ['ui/spin_marks.svg', 'a_circle/spin_marks.svg', 2000], ['ui/dial_cue.svg', 'a_circle/dial_cue.svg', 2000],
  ['ui/player_chip_r3.png', 'e_plates/player_chip.png', 6000],
  ['env/chalk_stroke_r3.png', 'c_close_view/chalk_stroke.png', 12000, { over: 1 }],
  ['env/dirt_detail.webp', 'c_close_view/dirt_detail.webp', 150000]
];
if (existsSync(PACK3)) {
  const anchors3 = JSON.parse(readFileSync(join(PACK3, 'anchors.json'), 'utf8')), meta3 = { _: 'Astra round 3: the anchors of the files in use and each file byte cap (tools/astra_in.mjs). Written by the tool.', files: {}, anchors: {} };
  for (const [out, src, cap, o] of R3) {
    mkdirSync(dirname(join(OUT, out)), { recursive: true });
    copyFileSync(join(PACK3, 'assets', src), join(OUT, out));
    meta3.files[out] = o && o.over ? { cap, over: 1 } : { cap };
    const a = anchors3['assets/' + src]; if (a) meta3.anchors[out] = a;
  }
  // retained files whose round 3 anchors moved (the tier tiles' render box, the pills): recorded, never copied (byte equal to what the game holds)
  for (const t of ['common', 'uncommon', 'rare', 'epic', 'grail']) for (const kind of ['tile', 'pill']) {
    const a = anchors3['assets/e_plates/tier_' + t + '_' + kind + '.png']; if (a) meta3.anchors['ui/tier_' + t + '_' + kind + '.png'] = a;
  }
  writeFileSync(join(ROOT, 'src', 'data', 'astra_r3.json'), JSON.stringify(meta3, null, 1) + '\n');
  console.log('ASTRA IN: round 3, ' + R3.length + ' files');
}

console.log('ASTRA IN: ' + n + ' files, ' + syms.length + ' symbols (' + icons.length + ' + ' + icons2.length + ' icons and 2 wordmarks), 3 icons, the thumb');

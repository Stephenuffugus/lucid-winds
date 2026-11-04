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
 */
import { readFileSync, writeFileSync, copyFileSync, mkdirSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PACK = join(process.argv[2] || '/workspaces/keepsies-astra-v1/pack', 'assets');
const OUT = join(ROOT, 'assets');

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
const icons = readdirSync(join(PACK, 'f_icons')).filter(f => /^icon_.*\.svg$/.test(f)).sort();
for (const f of icons) {
  const { vb, body } = parts(join(PACK, 'f_icons', f));
  if (/#[0-9a-f]{3,6}/i.test(body)) throw new Error(f + ' carries a fixed colour; the sprite is currentColor only');
  syms.push('<symbol id="i-' + f.slice(5, -4) + '" viewBox="' + vb + '">' + body + '</symbol>');
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

console.log('ASTRA IN: ' + n + ' files, ' + syms.length + ' symbols (' + icons.length + ' icons and 2 wordmarks), 3 icons, the thumb');

/* Gate `astra` (the Astra brief's section 9, the cut script): tools/astra_cut.py takes Astra's zip in, checks it and
 * cuts it into the SPRITES block's pixel strings. The fixture (test/astra_fixture.py) is an Astra shaped checkpoint made
 * from the page's own sprites, its PNG rows cycling the five filter types: the cut must give back every sprite exactly,
 * and splicing it into the page must leave the page byte for byte. A one pixel change and a new elite key splice in and
 * pass the lint and H-spr-1 on the copy. Every broken variant is refused for its own reason: a pixel off the 16 colours,
 * alpha 128, a strip one pixel short, Sun in the moth, a hero frame without Ink in its feet row, a PNG that differs from
 * its source grid, a wrong sha256, a 16 bit PNG, a path out of the zip ('../evil.txt', nothing written outside), a
 * folder not empty. ART2: the hero's poses carry Sun and are cut, Sun in an effect is refused, an effect frame not named
 * <clip>_<n> is refused, a new effect strip comes as named clips (not an unknown key), and the key cap (44, ART2's)
 * refuses the cut that would reach it. Runs the cutter at SB_ASTRA_CUT when set (redwatch's mutants), the page at SB_PAGE when set.
 *
 * Watched red by CUT_NO_PALETTE_CHECK, CUT_SEMI_ALPHA, CUT_PAETH_WRONG, CUT_NO_SOURCE_COMPARE, CUT_ZIP_SLIP,
 * CUT_SUN_ANYWHERE, CUT_FEET_UNCHECKED, SPLICE_JOINS_LINES, CUT_SUN_PAST_HERO, CUT_POSE_SUN_REFUSED, CUT_FX_NAMES_FREE,
 * CUT_FX_UNKNOWN and CUT_CAP_UNCHECKED. */
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import vm from 'node:vm';

const GAME = join(dirname(fileURLToPath(import.meta.url)), '..');
const PAGE = process.env.SB_PAGE || join(GAME, 'index.html');
const CUT = process.env.SB_ASTRA_CUT || join(GAME, 'tools', 'astra_cut.py');
const FIX = join(GAME, 'test', 'astra_fixture.py');
const TMP = '/tmp/claude-1000/shutterbug-astra-gate';
const fails = [];
const say = (ok, line) => { console.log((ok ? '  ok    ' : '  FAIL  ') + line); if (!ok) fails.push(line); };
const run = (args, opts = {}) => { const r = spawnSync(args[0], args.slice(1), Object.assign({ cwd: GAME, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }, opts)); return { code: r.status, out: (r.stdout || '') + (r.stderr || '') }; };
const py = (args) => run(['python3', '-I'].concat(args));

rmSync(TMP, { recursive: true, force: true }); mkdirSync(TMP, { recursive: true });
const html = readFileSync(PAGE, 'utf8');
const SB = createRequire(import.meta.url)(join(GAME, 'tools', 'core-loader.js')).loadCore(PAGE);
const sm = html.match(/\/\* SPRITES BEGIN \*\/([\s\S]*?)\/\* SPRITES END \*\//);
const SPRITES = vm.runInNewContext(sm[1] + '\n;SPRITES');
const plain = {}; for (const k of Object.keys(SPRITES)) plain[k] = { w: SPRITES[k].w, h: SPRITES[k].h, frames: Object.assign({}, SPRITES[k].frames) };
writeFileSync(join(TMP, 'sprites.json'), JSON.stringify(Object.assign({ _palette: Array.from(SB.palette.HEX) }, plain)));

/* a fixture through intake and check: the cutter's output and its JSON */
function through(tag, extra, src, page) {
  const zip = join(TMP, tag + '.zip'), dest = join(TMP, tag), out = join(TMP, tag + '.json');
  const f = py([FIX, src || join(TMP, 'sprites.json'), zip].concat(extra || []));
  if (f.code !== 0) return { fixture: f.out, code: -1, out: '' };
  const i = py([CUT, 'intake', zip, '--dest', dest]);
  if (i.code !== 0) return { code: i.code, out: i.out, intake: true, dest };
  const c = py([CUT, 'check', dest, '--sprites', out, '--page', page || PAGE]);
  return { code: c.code, out: c.out, json: existsSync(out) ? JSON.parse(readFileSync(out, 'utf8')) : null, dest };
}
const lintOk = page => run(['node', 'tools/lint.mjs', '--page', page]).out.includes('LINT OK');
const sprOk = page => run(['node', 'harness.js', '--page', page, '--only', 'H-spr-1']).out.includes('SHUTTERBUG HARNESS OK');

/* the round trip */
const good = through('good');
const keys = Object.keys(plain);
const same = good.json && keys.every(k => good.json[k] && good.json[k].w === plain[k].w && good.json[k].h === plain[k].h && JSON.stringify(good.json[k].frames) === JSON.stringify(plain[k].frames));
say(good.code === 0 && /CHECK OK/.test(good.out), 'the fixture of the page\'s own ' + keys.length + ' sprites is taken in and checked' + (good.code === 0 ? '' : ' (' + good.out.split('\n').filter(l => /REFUSE|Error/.test(l)).slice(0, 3).join(' | ') + ')'));
say(!!same, 'the cut gives back every sprite exactly: ' + keys.length + ' keys, ' + keys.reduce((a, k) => a + Object.keys(plain[k].frames).length, 0) + ' frames, through PNG rows of all five filter types');
writeFileSync(join(TMP, 'good.sprites.json'), JSON.stringify(good.json || {}));
const s1 = py([CUT, 'splice', join(TMP, 'good.sprites.json'), PAGE, '--out', join(TMP, 'copy-same.html')]);
say(s1.code === 0 && existsSync(join(TMP, 'copy-same.html')) && readFileSync(join(TMP, 'copy-same.html'), 'utf8') === html, 'splicing the cut back leaves the page byte for byte');

/* a legal one pixel change */
const tw = through('tweak', ['--tweak']);
writeFileSync(join(TMP, 'tweak.sprites.json'), JSON.stringify(tw.json || {}));
py([CUT, 'splice', join(TMP, 'tweak.sprites.json'), PAGE, '--out', join(TMP, 'copy-tweak.html')]);
const tcopy = existsSync(join(TMP, 'copy-tweak.html')) ? readFileSync(join(TMP, 'copy-tweak.html'), 'utf8') : '';
const a = html.split('\n'), b = tcopy.split('\n'), diff = a.map((l, i) => l === b[i] ? null : i).filter(i => i !== null);
say(tw.code === 0 && a.length === b.length && diff.length === 1 && /^\s+idle0: '/.test(b[diff[0]]), 'a one pixel change to hero.idle0 splices in as exactly one changed line (' + diff.length + ' lines differ)');
say(lintOk(join(TMP, 'copy-tweak.html')) && sprOk(join(TMP, 'copy-tweak.html')), 'the changed copy passes the lint and H-spr-1');

/* a new key: since ART1 the page holds Astra's moth_elite, so the new key is proven on a copy of the page without it
   (its comment and entry cut out, the fixture's sprites without it): the splice appends it again */
const noEl = html.replace(/,\n    \/\* the five elites \(Astra, Q160\)[\s\S]*?\*\/\n    moth_elite: \{ w: 24, h: 24, frames: \{\n[\s\S]*?\n    \} \}/, '');
writeFileSync(join(TMP, 'page-no-elite.html'), noEl);
const plainNoEl = Object.assign({}, plain); delete plainNoEl.moth_elite;
writeFileSync(join(TMP, 'sprites-no-elite.json'), JSON.stringify(Object.assign({ _palette: Array.from(SB.palette.HEX) }, plainNoEl)));
const keysNoEl = Object.keys(plainNoEl);
say(noEl !== html && !/moth_elite/.test(noEl.match(/\/\* SPRITES BEGIN \*\/([\s\S]*?)\/\* SPRITES END \*\//)[1]), 'the copy of the page without moth_elite holds no moth_elite (' + keysNoEl.length + ' keys)');
const el = through('elite', ['--elite'], join(TMP, 'sprites-no-elite.json'), join(TMP, 'page-no-elite.html'));
writeFileSync(join(TMP, 'elite.sprites.json'), JSON.stringify(el.json || {}));
py([CUT, 'splice', join(TMP, 'elite.sprites.json'), join(TMP, 'page-no-elite.html'), '--out', join(TMP, 'copy-elite.html')]);
const ecopy = existsSync(join(TMP, 'copy-elite.html')) ? readFileSync(join(TMP, 'copy-elite.html'), 'utf8') : '';
const ekeys = ecopy ? Object.keys(vm.runInNewContext(ecopy.match(/\/\* SPRITES BEGIN \*\/([\s\S]*?)\/\* SPRITES END \*\//)[1] + '\n;SPRITES')) : [];
say(el.code === 0 && /a new key moth_elite/.test(el.out) && ekeys.length === keysNoEl.length + 1 && ekeys.includes('moth_elite') && /\/\* moth_elite: from Astra \(enemies\/enemy_moth_elite\.png\) \*\//.test(ecopy), 'a new key, moth_elite at 24x24, is appended with its comment (' + ekeys.length + ' keys) and named as a render change');
say(lintOk(join(TMP, 'copy-elite.html')) && sprOk(join(TMP, 'copy-elite.html')), 'the copy with the new key passes the lint and H-spr-1');

/* ART2: the hero's poses carry Sun and are cut (the round trip above holds them); fx keys come as named effects, not
   unknown keys; the key cap refuses the cut that would reach it, its value read from the cutter */
const poses = ['hero_dash', 'hero_hurt', 'hero_squash', 'hero_stretch', 'hero_dropin'];
say(good.code === 0 && poses.every(k => plain[k] && Object.values(plain[k].frames).some(f => f.includes('e')) && new RegExp('cut     ' + k + ' ').test(good.out)),
  'the hero\'s poses (' + poses.join(', ') + ') each carry Sun and are cut, not refused');
const noFx = html.replace(/,\n    fx_shockwave: \{ w: 48, h: 48, frames: \{\n[\s\S]*?\n    \} \}/, '');
writeFileSync(join(TMP, 'page-no-fx.html'), noFx);
const fxFix = through('fxnew', [], join(TMP, 'sprites.json'), join(TMP, 'page-no-fx.html'));
say(noFx !== html && fxFix.code === 0 && /an effect fx_shockwave \(anvil_boots, wide_lens\): R\.draw must learn the clips it binds/.test(fxFix.out) && !/an unknown key fx_/.test(fxFix.out),
  'an effect strip new to the page (fx_shockwave on a copy without it) is taken as named clips (anvil_boots, wide_lens), never as an unknown key' + (fxFix.code === 0 ? '' : ' (' + fxFix.out.split('\n').filter(l => /REFUSE/.test(l)).slice(0, 2).join(' | ') + ')'));
const CAP = Number((readFileSync(CUT, 'utf8').match(/^MAX_SPRITES = (\d+)/m) || [])[1]);
const capped = through('cap', ['--pad', String(CAP - keys.length)]);
say(CAP === 44 && capped.code === 1 && capped.out.includes(CAP + ' names after this cut; the game stays under ' + CAP), 'a cut that would leave ' + CAP + ' names (the page\'s ' + keys.length + ' and ' + (CAP - keys.length) + ' more) is refused at the cap of ' + CAP + ', ART2\'s and no higher');

/* every broken variant refused for its own reason */
const BREAKS = [
  ['offpalette', 'off the 16 colours', 'a pixel off the 16 colours is refused for being off the 16 colours'],
  ['alpha', 'has alpha 128', 'a pixel at alpha 128 is refused (alpha 0 or 255 only)'],
  ['size', 'not 2 frames of 16x16', 'a strip one pixel short is refused for its size'],
  ['sun', 'Sun in moth', 'Sun in the moth is refused (Sun belongs to the hero and the beacon)'],
  ['feet', 'hero.idle0 has no Ink in its feet row', 'a hero frame without Ink in its feet row is refused'],
  ['source', 'differs from its source grid', 'a PNG that differs from its source grid is refused'],
  ['sha', 'is not the manifest', 'a wrong sha256 is refused'],
  ['depth16', 'not an 8 bit RGBA PNG', 'a 16 bit PNG is refused by name'],
  /* ART2: Sun stays the hero's (and its poses') past hero_*, and an effect's frames are named <clip>_<n> */
  ['sunfx', 'Sun in fx_projectiles', 'Sun in an effect (fx_projectiles) is refused: only the hero, its hero_* poses and the beacon carry it'],
  ['fxname', 'fx_enemy_hit frame hit is not <clip>_<n>', 'an effect frame not named <clip>_<n> is refused'],
];
for (const [kind, text, line] of BREAKS) {
  const r = through('break-' + kind, ['--break', kind]);
  say(r.code === 1 && r.out.includes(text), line + (r.code === 1 && r.out.includes(text) ? '' : ' (exit ' + r.code + ': ' + r.out.split('\n').filter(l => /REFUSE|CHECK/.test(l)).slice(0, 2).join(' | ') + ')'));
}
const slip = through('break-slip', ['--break', 'slip']);
say(slip.intake && slip.code === 1 && slip.out.includes('an unsafe path in the zip') && !existsSync(join(TMP, 'evil.txt')) && !existsSync(join(TMP, 'break-slip')), 'a path out of the zip (../evil.txt) is refused before a byte is written');
mkdirSync(join(TMP, 'full'), { recursive: true }); writeFileSync(join(TMP, 'full', 'x'), 'x');
const full = py([CUT, 'intake', join(TMP, 'good.zip'), '--dest', join(TMP, 'full')]);
say(full.code === 1 && full.out.includes('is not empty'), 'a zip is never extracted into a folder that is not empty');

if (fails.length) { console.log('\nASTRA FAILED: ' + fails.length + '\n' + fails.map(f => '  ' + f).join('\n')); process.exit(1); }
console.log('ASTRA OK');

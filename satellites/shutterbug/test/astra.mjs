/* Gate `astra` (the Astra brief's section 9, the cut script): tools/astra_cut.py takes Astra's zip in, checks it and
 * cuts it into the SPRITES block's pixel strings. The fixture (test/astra_fixture.py) is an Astra shaped checkpoint made
 * from the page's own sprites, its PNG rows cycling the five filter types: the cut must give back every sprite exactly,
 * and splicing it into the page must leave the page byte for byte. A one pixel change and a new elite key splice in and
 * pass the lint and H-spr-1 on the copy. Every broken variant is refused for its own reason: a pixel off the 16 colours,
 * alpha 128, a strip one pixel short, Sun in the moth, a hero frame without Ink in its feet row, a PNG that differs from
 * its source grid, a wrong sha256, a 16 bit PNG, a path out of the zip ('../evil.txt', nothing written outside), a
 * folder not empty. ART2: the hero's poses carry Sun and are cut, Sun in an effect is refused, an effect frame not named
 * <clip>_<n> is refused, a new effect strip comes as named clips (not an unknown key). ART3: the key cap (43) moved
 * to the splice (a cut past it is checked, its splice refused); a delivery naming its game SHUTTERBUG with 16 and 64 px
 * effects and fx_beacon_light carrying Sun is cut (Sun in another effect and a 24 px effect still refused); a renamed
 * key's entry replaces the page's frames whole (the hero alone merges by frame). Runs the cutter at SB_ASTRA_CUT when set (redwatch's mutants), the page at SB_PAGE when set.
 *
 * Watched red by CUT_NO_PALETTE_CHECK, CUT_SEMI_ALPHA, CUT_PAETH_WRONG, CUT_NO_SOURCE_COMPARE, CUT_ZIP_SLIP,
 * CUT_SUN_ANYWHERE, CUT_FEET_UNCHECKED, SPLICE_JOINS_LINES, CUT_SUN_PAST_HERO, CUT_POSE_SUN_REFUSED, CUT_FX_NAMES_FREE,
 * CUT_FX_UNKNOWN, CUT_CAP_RAISED, and since ART3 CUT_GAME_CASE, CUT_FX_SIDES_NARROW, CUT_BEACON_FX_SUN, SPLICE_CAP_GONE
 * and SPLICE_KEEPS_RENAMED (CUT_SUN_PAST_HERO also watches round 3's chip). */
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
/* ART3: the cap moved to the splice, where the page grows: a cut past it is checked (a whole delivery may be checked
   and parked), and its splice is refused, the page untouched; the cap is 43, the least that takes ART3's splice */
const CAP = Number((readFileSync(CUT, 'utf8').match(/^MAX_SPRITES = (\d+)/m) || [])[1]);
const capped = through('cap', ['--pad', String(CAP - keys.length)]);
writeFileSync(join(TMP, 'cap.sprites.json'), JSON.stringify(capped.json || {}));
const capS = py([CUT, 'splice', join(TMP, 'cap.sprites.json'), PAGE, '--out', join(TMP, 'copy-cap.html')]);
say(keys.length < CAP && capped.code === 0 && capped.out.includes('a whole splice would leave ' + CAP + ' names'),
  'a cut that would leave ' + CAP + ' names (the page\'s ' + keys.length + ' and ' + (CAP - keys.length) + ' more) is checked: a whole delivery may be checked and parked' + (capped.code === 0 ? '' : ' (exit ' + capped.code + ')'));
say(capS.code === 1 && capS.out.includes(CAP + ' names after this splice; the page stays under ' + CAP) && !existsSync(join(TMP, 'copy-cap.html')),
  'its splice is refused at the cap, the page unwritten (splice exit ' + capS.code + ')');
say(CAP === 43, 'the cap is 43, ART3\'s (the least that takes its 42 names) and no higher (' + CAP + ')');

/* ART3: round 3's shapes: the game named in capitals, a 16 px and a 64 px effect, the beacon's lighting with its Sun */
const r3 = through('round3', ['--round3']);
const r3why = r3.code === 0 ? '' : ' (' + r3.out.split('\n').filter(l => /REFUSE/.test(l)).slice(0, 3).join(' | ') + ')';
say(!/game is/.test(r3.out) && /cut     fx_boss_chip/.test(r3.out), 'round 3\'s manifest naming its game SHUTTERBUG is the game\'s' + r3why);
say(/cut     fx_boss_chip 16x16: chip_0/.test(r3.out) && /cut     fx_boss_down 64x64: down_0/.test(r3.out), 'round 3\'s 16 px chip and 64 px fall are cut as effects' + r3why);
say(/cut     fx_beacon_light 16x16: light_0/.test(r3.out), 'round 3\'s fx_beacon_light carries the beacon\'s Sun and is cut' + r3why);
say(r3.code === 0, 'a delivery of round 3\'s shapes checks OK' + r3why);
const r3sun = through('round3-sun', ['--round3', '--break', 'sunchip']), r3side = through('round3-side', ['--round3', '--break', 'fx24']);
say(r3sun.code === 1 && r3sun.out.includes('Sun in fx_boss_chip'), 'Sun in another effect of round 3 (fx_boss_chip) is still refused: the beacon\'s lighting alone carries it');
say(r3side.code === 1 && r3side.out.includes('fx_boss_chip is 24x24: an effect is square, 16 or 32 or 48 or 64 a side'), 'an effect 24 a side is still refused (16, 32, 48 or 64)');
/* ART3: Astra merges by sprite key: a key's entry (round 2's icon_weapons, J1 to charm) replaces the page's frames
   whole, in its order, even where a name is shared (the old strip's jump, dive and charm); the hero alone merges */
const ren = { icon_weapons: { w: 24, h: 24, frames: {} } }, old = Object.keys(plain.icon_weapons.frames);
old.slice().reverse().forEach((n, i) => { ren.icon_weapons.frames[i === 0 ? old[0] : 'Z' + i] = plain.icon_weapons.frames[n]; });
writeFileSync(join(TMP, 'renamed.json'), JSON.stringify(ren));
py([CUT, 'splice', join(TMP, 'renamed.json'), PAGE, '--out', join(TMP, 'copy-renamed.html')]);
const rcopy = existsSync(join(TMP, 'copy-renamed.html')) ? readFileSync(join(TMP, 'copy-renamed.html'), 'utf8') : '';
const rspr = rcopy ? vm.runInNewContext(rcopy.match(/\/\* SPRITES BEGIN \*\/([\s\S]*?)\/\* SPRITES END \*\//)[1] + '\n;SPRITES') : null;
say(!!rspr && JSON.stringify(Object.keys(rspr.icon_weapons.frames)) === JSON.stringify(Object.keys(ren.icon_weapons.frames)) && Object.keys(rspr).length === keys.length,
 'a key\'s entry (icon_weapons as ' + old[0] + ', Z1 to Z' + (old.length - 1) + ') replaces the page\'s ' + old.length + ' frames whole, in its own order, no other old name kept' + (rspr ? ' (' + Object.keys(rspr.icon_weapons.frames).slice(0, 3).join(' ') + ' ...)' : ''));

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

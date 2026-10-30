/* Gate `astra` (the Astra brief's section 9, the cut script): tools/astra_cut.py takes Astra's zip in, checks it and
 * cuts it into the SPRITES block's pixel strings. The fixture (test/astra_fixture.py) is an Astra shaped checkpoint made
 * from the page's own sprites, its PNG rows cycling the five filter types: the cut must give back every sprite exactly,
 * and splicing it into the page must leave the page byte for byte. A one pixel change and a new elite key splice in and
 * pass the lint and H-spr-1 on the copy. Every broken variant is refused for its own reason: a pixel off the 16 colours,
 * alpha 128, a strip one pixel short, Sun in the moth, a hero frame without Ink in its feet row, a PNG that differs from
 * its source grid, a wrong sha256, a 16 bit PNG, a path out of the zip ('../evil.txt', nothing written outside), a
 * folder not empty. Runs the cutter at SB_ASTRA_CUT when set (redwatch's mutants), the page at SB_PAGE when set.
 *
 * Watched red by CUT_NO_PALETTE_CHECK, CUT_SEMI_ALPHA, CUT_PAETH_WRONG, CUT_NO_SOURCE_COMPARE, CUT_ZIP_SLIP,
 * CUT_SUN_ANYWHERE, CUT_FEET_UNCHECKED and SPLICE_JOINS_LINES. */
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
function through(tag, extra) {
  const zip = join(TMP, tag + '.zip'), dest = join(TMP, tag), out = join(TMP, tag + '.json');
  const f = py([FIX, join(TMP, 'sprites.json'), zip].concat(extra || []));
  if (f.code !== 0) return { fixture: f.out, code: -1, out: '' };
  const i = py([CUT, 'intake', zip, '--dest', dest]);
  if (i.code !== 0) return { code: i.code, out: i.out, intake: true, dest };
  const c = py([CUT, 'check', dest, '--sprites', out, '--page', PAGE]);
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

/* a new key */
const el = through('elite', ['--elite']);
writeFileSync(join(TMP, 'elite.sprites.json'), JSON.stringify(el.json || {}));
py([CUT, 'splice', join(TMP, 'elite.sprites.json'), PAGE, '--out', join(TMP, 'copy-elite.html')]);
const ecopy = existsSync(join(TMP, 'copy-elite.html')) ? readFileSync(join(TMP, 'copy-elite.html'), 'utf8') : '';
const ekeys = ecopy ? Object.keys(vm.runInNewContext(ecopy.match(/\/\* SPRITES BEGIN \*\/([\s\S]*?)\/\* SPRITES END \*\//)[1] + '\n;SPRITES')) : [];
say(el.code === 0 && /a new key moth_elite/.test(el.out) && ekeys.length === keys.length + 1 && ekeys.includes('moth_elite') && /\/\* moth_elite: from Astra \(enemies\/enemy_moth_elite\.png\) \*\//.test(ecopy), 'a new key, moth_elite at 24x24, is appended with its comment (' + ekeys.length + ' keys) and named as a render change');
say(lintOk(join(TMP, 'copy-elite.html')) && sprOk(join(TMP, 'copy-elite.html')), 'the copy with the new key passes the lint and H-spr-1');

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

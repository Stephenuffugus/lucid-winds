/* Plants for TINT's P0 laws: a folder copy per plant (satellites/math, satellites/tint, tools/), each edit asserted to match
   exactly once, then the named gate run in the copy and its FAIL lines printed. Usage: node tint-p0-plants.cjs [prefix] */
const fs = require('fs'), path = require('path'), { spawnSync } = require('child_process');
const REPO = '/workspaces/lucid-winds', SP = __dirname;
const K = 'tint/colour.js', E = 'tint/engine.js', C = 'tint/content.js';
const PLANTS = [
  ['c1 mixed in sRGB', 'test/colour.mjs', [[K, 'const d = channels(dye).map(toLinear);', 'const d = channels(dye).map(v => v / 255);']]],
  ['c2 no reduction before mixing', 'test/colour.mjs', [[K, 'const [A, B] = reduceRatio(dyeParts, whiteParts);', 'const [A, B] = [dyeParts, whiteParts];']]],
  ['c3 a light dye', 'test/colour.mjs', [[K, "madder: '#8e2a2a',", "madder: '#c9a227',"]]],
  ['c4 the wrong gamma one way', 'test/colour.mjs', [[K, 'return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);', 'return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.2);']]],
  ['c5 halves rounded away', 'test/colour.mjs', [[K, 'const A = Math.round(a * 1000), B = Math.round(b * 1000),', 'const A = Math.round(a), B = Math.round(b),']]],
  ['c6 a clock in the colours', 'test/colour.mjs', [[K, "export const WHITE = '#ffffff';", "export const WHITE = '#ffffff';\nexport const BORN = Date.now();"]]],
  ['e1 same by the difference', 'test/engine.mjs', [[E, "answer: reduceRatio(...left).join(':') === reduceRatio(...right).join(':') ? 'same' : 'different'", "answer: (left[0] - left[1]) === (right[0] - right[1]) ? 'same' : 'different'"]]],
  ['e2 incomplete left out', 'test/engine.mjs', [[E, 'for (const e of ERROR_TAXONOMY) chosen.push(', 'for (const e of ERROR_TAXONOMY.slice(0, 4)) chosen.push('], [E, 'const e = pick(r, ERROR_TAXONOMY);', 'const e = pick(r, ERROR_TAXONOMY.slice(0, 4));']]],
  ['e3 four rinses', 'test/engine.mjs', [[E, 'rinse = new Set(slots.slice(0, 3))', 'rinse = new Set(slots.slice(0, 4))']]],
  ['e4 whole factors only', 'test/engine.mjs', [[E, 'notWhole = new Set(stage > 1 ? slots.slice(3, 10) : [])', 'notWhole = new Set([])']]],
  ['e5 halves at stage 1', 'test/engine.mjs', [[E, 'notWhole = new Set(stage > 1 ? slots.slice(3, 10) : [])', 'notWhole = new Set(slots.slice(3, 10))']]],
  ['e6 five that scale', 'test/engine.mjs', [[E, 'filter(b => b.isProportional)).slice(0, 4);', 'filter(b => b.isProportional)).slice(0, 5);'], [E, 'filter(b => !b.isProportional)).slice(0, 6);', 'filter(b => !b.isProportional)).slice(0, 5);']]],
  ['e7 a fresh family discretized', 'test/engine.mjs', [[E, "const rep = fresh || stage < 2 ? 'continuous' :", "const rep = stage < 2 ? 'continuous' :"]]],
  ['e8 a rinse that scales', 'test/engine.mjs', [[E, '      if (fixed === scaled) fixed += 1;', '      fixed = scaled;']]],
  ['e9 the bank flag by size', 'test/engine.mjs', [[E, 'isProportional: proportionalAnswer === actual', 'isProportional: proportionalAnswer <= actual']]],
  ['e10 scales scored backwards', 'test/engine.mjs', [[E, "return { correct: (choice === 'scales') === t.isProportional };", "return { correct: (choice === 'scales') !== t.isProportional };"]]],
  ['e11 an unseeded shuffle', 'test/engine.mjs', [[E, 'const j = Math.floor(r() * (i + 1));', 'const j = Math.floor(Math.random() * (i + 1));']]],
  ['e12 any dye for a different pair', 'test/engine.mjs', [[E, "p.answer === 'same' || lightnessGap(DYES[n], p.left, p.right) >= MIN_GAP", "p.answer === 'same' || lightnessGap(DYES[n], p.left, p.right) >= 0"]]],
  ['l1 cross multiplication taught', 'tools/lint.mjs', [[C, "go: 'Go on'", "go: 'Cross multiply to check'"]]],
  ['l2 an unstamped import', 'tools/lint.mjs', [[E, "'./colour.js?v=20260916g'", "'./colour.js'"]]]
];
const only = process.argv[2];
for (const [name, gate, edits] of PLANTS.filter(p => !only || p[0].startsWith(only))) {
  const D = path.join(SP, 'plant-tint');
  fs.rmSync(D, { recursive: true, force: true });
  fs.mkdirSync(path.join(D, 'satellites'), { recursive: true });
  fs.cpSync(path.join(REPO, 'satellites/math'), path.join(D, 'satellites/math'), { recursive: true });
  fs.cpSync(path.join(REPO, 'satellites/tint'), path.join(D, 'satellites/tint'), { recursive: true });
  fs.cpSync(path.join(REPO, 'tools'), path.join(D, 'tools'), { recursive: true });
  let planted = true;
  for (const [file, from, to] of edits) {
    const p = path.join(D, 'satellites', file), s = fs.readFileSync(p, 'utf8');
    const n = s.split(from).length - 1;
    if (n !== 1) { console.log(name.padEnd(36) + 'NOT PLANTED (' + file + ' matches ' + n + ' times)'); planted = false; break; }
    fs.writeFileSync(p, s.replace(from, () => to));
  }
  if (!planted) continue;
  const r = spawnSync(process.execPath, [gate], { cwd: path.join(D, 'satellites/tint'), encoding: 'utf8', timeout: 300000 });
  const out = (r.stdout || '') + (r.stderr || '');
  const failLines = out.split('\n').filter(l => /FAIL/.test(l)).map(l => l.trim().slice(0, 190));
  console.log(name.padEnd(36) + (failLines.length ? failLines.join(' | ') : out.split('\n').filter(l => /OK$/.test(l)).join(' ') + '   <- planted nothing seen'));
}
fs.rmSync(path.join(SP, 'plant-tint'), { recursive: true, force: true });

/* Plants for BRIM's lint: a folder copy per plant (satellites/{math,crease,brim} and the repo's tools/ at the same depth),
   one asserted edit, the lint run in the copy. */
const fs = require('fs'), path = require('path'), { execFileSync, spawnSync } = require('child_process');
const SP = __dirname, SAT = '/workspaces/lucid-winds/satellites';
const PLANTS = [
  ['l10 given water in a comparison mode', 'main.js', '    clearFill(v);\n', '    clearFill(v);\n    holdLevel(v, 0.5);\n'],
  ['l8 the empty band sized with its fraction', 'render.js', '  v.den.textContent = String(f.d);\n', '  v.den.textContent = String(f.d);\n  v.band.style.height = ((1 - f.n / f.d) * 100) + \'%\';\n'],
  ['l9 the band lit as the round starts', 'main.js', '    clearFill(v);\n', '    clearFill(v);\n    lightEmpty(v, 0.5, 1);\n'],
  ['l6 a glass filled as the round starts', 'main.js', '    clearFill(v);\n', '    clearFill(v);\n    fillTo(v, 0.5, 1);\n'],
  ['l7 water given a height with its fraction', 'render.js', '  v.den.textContent = String(f.d);\n', '  v.den.textContent = String(f.d);\n  v.water.style.height = (f.n / f.d * 100) + \'%\';\n'],
  ['l1 Date in the pairs', 'pairs.js', "export const CASE_TYPES", "export const MADE = Date.now();\nexport const CASE_TYPES"],
  ['l2 an unstamped import', 'engine.js', "import { PAIR_BANK } from './pairs.js?v=20260916b';", "import { PAIR_BANK } from './pairs.js';"],
  ['l3 a key twice', 'engine.js', "  return { correct: side === larger, larger };", "  const said = {\n    larger: larger,\n    correct: side === larger,\n    larger: larger\n  };\n  return said;"],
  ['l4 a multiply in a string', 'engine.js', "export const SESSION_LENGTH = 12;", "export const SESSION_LENGTH = 12;\nexport const HELP = 'multiply across to check';"],
  ['l5 a .mjs import', 'engine.js', "import { PAIR_BANK } from './pairs.js?v=20260916b';", "import { PAIR_BANK } from './pairs.mjs?v=20260916b';"]
];
for (const [name, file, from, to] of PLANTS.filter(p => !process.argv[2] || p[0].startsWith(process.argv[2]))) {
  const root = path.join(SP, 'brimlint'), dir = path.join(root, 'satellites');
  fs.rmSync(root, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  for (const g of ['math', 'crease', 'brim']) execFileSync('cp', ['-r', path.join(SAT, g), dir]);
  execFileSync('cp', ['-r', '/workspaces/lucid-winds/tools', root]);
  const p = path.join(dir, 'brim', file), src = fs.readFileSync(p, 'utf8');
  if (src.split(from).length !== 2) throw new Error(name + ': the match is not exactly once');
  fs.writeFileSync(p, src.replace(from, () => to));
  const r = spawnSync('node', [path.join(dir, 'brim', 'tools', 'lint.mjs')], { encoding: 'utf8' });
  const lines = ((r.stdout || '') + (r.stderr || '')).split('\n').filter(l => /FAIL|Error/.test(l)).map(l => l.trim().slice(0, 200));
  console.log(name.padEnd(28) + (lines.length ? lines.slice(0, 3).join(' | ') : 'NOTHING (the plant was not seen)'));
  fs.rmSync(root, { recursive: true, force: true });
}

/* Plants for GLIMPSE P0's Node laws: a folder copy of satellites/{math,glimpse} and the repo's tools/ per plant, one asserted
   edit, the named gate run in the copy, its FAIL lines printed. */
const fs = require('fs'), path = require('path'), { execFileSync, spawnSync } = require('child_process');
const SP = __dirname, SAT = '/workspaces/lucid-winds/satellites';
const PLANTS = [
  ['g1 a hull twice its area', 'test/generator.mjs', 'engine.js', '  return Math.abs(a) / 2;\n}\n\nexport function measure', '  return Math.abs(a);\n}\n\nexport function measure'],
  ['g2 touching allowed in a scatter', 'test/generator.mjs', 'engine.js', "if (others.every(o => Math.hypot(o.x - x, o.y - y) - o.r - q >= MIN_GAP) && dots.every(o => Math.hypot(o.x - x, o.y - y) - o.r - q >= MIN_GAP))", "if (others.every(o => Math.hypot(o.x - x, o.y - y) - o.r - q >= -0.01) && dots.every(o => Math.hypot(o.x - x, o.y - y) - o.r - q >= -0.01))"],
  ['g3 density upside down', 'test/generator.mjs', 'engine.js', 'density: hull > 0 ? cumArea / hull : 0', 'density: hull > 0 ? hull / cumArea : 0'],
  ['g4 strategies not half and half', 'test/generator.mjs', 'engine.js', "(i < trials / 2 ? 'size' : 'area')", "(i < trials * 0.8 ? 'size' : 'area')"],
  ['g5 area matching ignores the count', 'test/generator.mjs', 'engine.js', 'Math.sqrt(logUniform(0.01, 0.05) / (Math.PI * n))', 'Math.sqrt(logUniform(0.01, 0.05) / (Math.PI * 5))'],
  ['e1 one flash length for all', 'test/engine.mjs', 'engine.js', '  return count <= 5 ? 400 : 350;', '  return 400;'],
  ['e2 random before its tier', 'test/engine.mjs', 'engine.js', 'FLASH_ORDER[t] : FLASH_ORDER[r.int(t + 1)]', 'FLASH_ORDER[t] : FLASH_ORDER[r.int(FLASH_ORDER.length)]'],
  ['e3 few built on five', 'test/engine.mjs', 'engine.js', 'const fiveCount = tier <= 0 ? 8 :', 'const fiveCount = tier <= 0 ? 3 :'],
  ['e4 the complement off by one', 'test/engine.mjs', 'engine.js', "answer: ask === 'complement' ? 10 - count : count", "answer: ask === 'complement' ? 9 - count : count"],
  ['e5 two spread types only', 'test/engine.mjs', 'engine.js', "['sameSpread', 'fewerWider', 'sameSize'][i % 3]", "['sameSpread', 'fewerWider', 'sameSize'][i % 2]"],
  ['e6 slow answers climb', 'test/engine.mjs', 'engine.js', 'return { correct, climbs: correct && rtMs <= SLOW_MS };', 'return { correct, climbs: correct };'],
  ['e7 six pads to a row', 'test/engine.mjs', 'engine.js', 'const rows = Math.ceil(pads.length / 4)', 'const rows = Math.ceil(pads.length / 6)'],
  ['e8 an unseeded shuffle', 'test/engine.mjs', 'engine.js', 'const j = r.int(i + 1);', 'const j = Math.floor(Math.random() * (i + 1));'],
  ['e9 no total served twice', 'test/engine.mjs', 'engine.js', 'const splits = [{ parts: [5, T - 5], twin: true }, { parts: twin || [5, T - 5], twin: true }];', 'const splits = [{ parts: [5, T - 5], twin: false }, { parts: twin || [5, T - 5], twin: false }];'],
  ['l1 a sound per firefly', 'tools/lint.mjs', 'engine.js', 'export function measure(dots) {', "export function blinkAll(dots) {\n  for (const d of dots) { sound('blink'); }\n}\n\nexport function measure(dots) {"],
  ['l2 a clock in the engine', 'tools/lint.mjs', 'engine.js', 'const SLOW_MS = 2500;', 'const SLOW_MS = 2500, BORN = Date.now();'],
  ['l3 an unstamped import', 'tools/lint.mjs', 'engine.js', 'export const MIN_GAP = 0.012;', "import { COPY } from './content.js';\nexport const MIN_GAP = 0.012;"]
];
for (const [name, gate, file, from, to] of PLANTS.filter(p => !process.argv[2] || p[0].startsWith(process.argv[2]))) {
  const root = path.join(SP, 'glp0'), dir = path.join(root, 'satellites');
  fs.rmSync(root, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  for (const g of ['math', 'glimpse']) execFileSync('cp', ['-r', path.join(SAT, g), dir]);
  execFileSync('cp', ['-r', '/workspaces/lucid-winds/tools', root]);
  const p = path.join(dir, 'glimpse', file), src = fs.readFileSync(p, 'utf8');
  if (src.split(from).length !== 2) { console.log(name.padEnd(36) + 'NOT PLANTED: the match is not exactly once'); continue; }
  fs.writeFileSync(p, src.replace(from, () => to));
  const r = spawnSync('node', [path.join(dir, 'glimpse', gate)], { encoding: 'utf8', timeout: 600000 });
  const lines = ((r.stdout || '') + (r.stderr || '')).split('\n').filter(l => /FAIL|Error/.test(l)).map(l => l.trim().slice(0, 200));
  console.log(name.padEnd(36) + (lines.length ? lines.slice(0, 2).join(' | ') : 'NOTHING (the plant was not seen)'));
  fs.rmSync(root, { recursive: true, force: true });
}

/* Plants for BRIM's P0 laws: a folder copy of satellites/{math,crease,brim} per plant, one asserted edit, both Node gates run
   in the copy, their FAIL lines printed. */
const fs = require('fs'), path = require('path'), { execFileSync, spawnSync } = require('child_process');
const SAT = '/workspaces/lucid-winds/satellites', SP = __dirname;
const PLANTS = [
  ['p1 a seed pair dropped', 'pairs.js', "  pair('residual', '3/4', '7/9'),\n", ''],
  ['p2 a tag its numbers do not have', 'pairs.js', "pair('same-side-half', '1/5', '1/3')", "pair('residual', '1/5', '1/3')"],
  ['p3 an equal pair', 'pairs.js', "pair('same-denominator', '1/4', '3/4')", "pair('same-denominator', '2/4', '2/4')"],
  ['p4 a gap trap with two gaps', 'pairs.js', "pair('gap-trap', '3/4', '4/5')", "pair('gap-trap', '3/4', '5/7')"],
  ['p5 grade 3 for any grade 3 list', 'pairs.js', "&& (left.n === right.n || left.d === right.d)) return 3;", ") return 3;"],
  ['e1 a straddle read as same side', 'engine.js', "  if (side < 0) out.push('straddle-half');", "  if (side < 0) out.push('same-side-half');"],
  ['e2 scoreChoice backwards', 'engine.js', "const larger = a > b ? 'left'", "const larger = a < b ? 'left'"],
  ['e3 B2 without its neighbours', 'engine.js', "    const free = kinds.filter(k => !near.includes(k));", "    const free = kinds;"],
  ['e4 B3 by chance', 'engine.js', "    const flip = (a > b ? 'left' : 'right') !== side[i];", "    const flip = r() < 0.5;"],
  ['e5 B6 one gap trap', 'engine.js', "  const want = 2 + (r() < 0.5 ? 1 : 0);", "  const want = 1;"],
  ['e6 HALF ignores its streak', 'engine.js', "filter(p => sameSideOpen || !features(p).includes('same-side-half'))", "filter(p => true)"],
  ['e7 no obvious first round', 'engine.js', "  const opening = mode === 'matching' && session === 0;", "  const opening = false;"],
  ['e8 equivalents stop short', 'engine.js', "for (let k = 2; d * k <= maxDenominator; k++)", "for (let k = 2; d * k < maxDenominator; k++)"],
  ['e9 LEVEL all doubling', 'engine.js', "  const notDoubling = all.filter(c => ![2, 4, 8].includes(c.split));", "  const notDoubling = all.filter(c => c.split === 2);"],
  ['e10 an unseeded die', 'engine.js', "  const want = 2 + (r() < 0.5 ? 1 : 0);", "  const want = 2 + (Math.random() < 0.5 ? 1 : 0);"],
  ['e11 grade 3 serves grade 4', 'engine.js', "grade === 3 ? p.grade === 3 : p.grade <= grade", "p.grade <= Math.max(4, grade)"]
];
for (const [name, file, from, to] of PLANTS.filter(p => !process.argv[2] || p[0].startsWith(process.argv[2]))) {
  const dir = path.join(SP, 'brimplant');
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  for (const g of ['math', 'crease', 'brim']) execFileSync('cp', ['-r', path.join(SAT, g), dir]);
  const p = path.join(dir, 'brim', file), src = fs.readFileSync(p, 'utf8');
  if (src.split(from).length !== 2) throw new Error(name + ': the match is not exactly once');
  fs.writeFileSync(p, src.replace(from, () => to));
  const lines = [];
  for (const gate of ['pairs', 'engine']) {
    const r = spawnSync('node', [path.join(dir, 'brim', 'test', gate + '.mjs')], { encoding: 'utf8', timeout: 300000 });
    lines.push(...((r.stdout || '') + (r.stderr || '')).split('\n').filter(l => /FAIL|Error/.test(l)).map(l => l.trim().slice(0, 230)));
  }
  console.log(name.padEnd(36) + (lines.length ? lines.slice(0, 3).join(' | ') : 'NOTHING (the plant was not seen)'));
  fs.rmSync(dir, { recursive: true, force: true });
}

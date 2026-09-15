/* Plants for CORE lint law 3 with the builder's own stamp: each a folder copy of satellites/math (and the repo's tools/ that
   the lint imports, by the same relative depth), one asserted edit, the lint run in the copy, its FAIL lines printed. */
const fs = require('fs'), path = require('path'), { execFileSync, spawnSync } = require('child_process');
const SP = __dirname, SAT = '/workspaces/lucid-winds/satellites';
const PLANTS = [
  ['b1 the builder imports schemas at CORE stamp', 'config/config.js', "./schemas.js?v=20260915f", "./schemas.js?v=20260915e"],
  ['b2 the builder page loads config.js at CORE stamp', 'config/index.html', "./config.js?v=20260915f", "./config.js?v=20260915e"],
  ['b3 core.js imports pure.js at the builder stamp', 'core/core.js', "./pure.js?v=20260915e", "./pure.js?v=20260915f"],
  ['b4 the builder page loads core.css at the builder stamp', 'config/index.html', "../core/core.css?v=20260915e", "../core/core.css?v=20260915f"]
];
for (const [name, file, from, to] of PLANTS) {
  const root = path.join(SP, 'bplant'), dir = path.join(root, 'satellites');
  fs.rmSync(root, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  execFileSync('cp', ['-r', path.join(SAT, 'math'), dir]);
  execFileSync('cp', ['-r', '/workspaces/lucid-winds/tools', root]);
  const p = path.join(dir, 'math', file), src = fs.readFileSync(p, 'utf8');
  if (src.split(from).length !== 2) throw new Error(name + ': the match is not exactly once');
  fs.writeFileSync(p, src.replace(from, () => to));
  const r = spawnSync('node', [path.join(dir, 'math', 'core', 'tools', 'lint.mjs')], { encoding: 'utf8' });
  const lines = ((r.stdout || '') + (r.stderr || '')).split('\n').filter(l => /FAIL|Error|OK$/.test(l)).map(l => l.trim().slice(0, 260));
  console.log(name.padEnd(56) + (lines.length ? lines.join(' | ') : 'NOTHING'));
  fs.rmSync(root, { recursive: true, force: true });
}

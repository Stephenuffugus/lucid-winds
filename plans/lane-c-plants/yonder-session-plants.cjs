/* Plants for YONDER's session laws (engine laws 9 to 13): each plant is a folder copy with one fault written into
   engine.js, its match asserted first, and the copy's engine gate run. Usage: node yonder-session-plants.cjs */
const fs = require('fs'), path = require('path'), { execFileSync, spawnSync } = require('child_process');
const SAT = '/workspaces/lucid-winds/satellites', SP = __dirname;
const PLANTS = [
  ['e12 a promotion two roads up', "const up = RANGES[RANGES.indexOf(max) + 1];", "const up = RANGES[Math.min(RANGES.length - 1, RANGES.indexOf(max) + 2)];"],
  ['e13 a frontier with no MILEPOSTS', "if (route.action === 'frontier') { rec.stagesAtBand = 0; s.pending = 'mileposts'; }", "if (route.action === 'frontier') { rec.stagesAtBand = 0; }"],
  ['e14 no probe after MILEPOSTS', "if (kind === 'mileposts') { s.pending = null; s.reprobe = true; return { session: s, route: null }; }", "if (kind === 'mileposts') { s.pending = null; return { session: s, route: null }; }"],
  ['e15 never a drop back', "if ((session.sinceDrop || 0) >= 2 && below.length)", "if ((session.sinceDrop || 0) >= 99 && below.length)"],
  ['e16 a drop back upward', "const below = RANGES.filter(m => m < home && session.roads[m] && session.roads[m].mastered);", "const below = RANGES.filter(m => m !== home && session.roads[m] && session.roads[m].mastered);"],
  ['e17 the session changed in place', "  const s = copy(session);\n  s.stages++;", "  const s = session;\n  s.stages++;"],
  ['e18 a stage written to home\'s record', "  const rec = s.roads[max] || freshRecord();\n  rec.started = true;", "  const rec = s.roads[s.home] || freshRecord();\n  rec.started = true;"],
  ['e19 quarters on every road', "const posts = [max / 2].concat(max % 4 === 0 ? [max / 4, (3 * max) / 4] : []);", "const posts = [max / 2, max / 4, (3 * max) / 4];"]
];
for (const [name, from, to] of PLANTS) {
  const dir = path.join(SP, 'splant');
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  execFileSync('cp', ['-r', path.join(SAT, 'math'), path.join(SAT, 'yonder'), dir]);
  const p = path.join(dir, 'yonder', 'engine.js'), src = fs.readFileSync(p, 'utf8');
  if (src.split(from).length !== 2) throw new Error(name + ': the match is not exactly once');
  fs.writeFileSync(p, src.replace(from, () => to));
  const r = spawnSync('node', [path.join(dir, 'yonder', 'test', 'engine.mjs')], { encoding: 'utf8', maxBuffer: 16 * 1024 * 1024 });
  const lines = ((r.stdout || '') + (r.stderr || '')).split('\n').filter(l => /FAIL|Error/.test(l)).map(l => l.slice(0, 200));
  console.log(name.padEnd(38) + (lines.length ? lines.join(' | ') : 'NO FAILURE (the plant was not seen)'));
}
fs.rmSync(path.join(SP, 'splant'), { recursive: true, force: true });

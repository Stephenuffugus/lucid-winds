/* Plants for CREASE's HALFWAY gate: each plant is a folder copy of satellites/math and satellites/crease (from PLANT_SAT, a
   snapshot of the WIRED tree) with its faults written one edit at a time (every match asserted first), then test/halfway.mjs
   run in the copy and its FAIL lines printed. Usage: node crease-halfway-plants.cjs [name prefix] */
const fs = require('fs'), path = require('path'), { execFileSync, spawnSync } = require('child_process');
const SAT = process.env.PLANT_SAT || '/workspaces/lucid-winds/satellites', SP = __dirname;
const PLANTS = [
  ['h1 exactly half from the start', [['main.js', "    el('half').hidden = !halfOpen;", "    el('half').hidden = false;"]]],
  ['h2 a timeout counted in the tier', [['main.js', "const tierNow = () => adaptTier(results.filter(x => !x.timedOut).map(x => x.correct), TIER_CONFIG);",
    "const tierNow = () => adaptTier(results.map(x => x.correct === null ? false : x.correct), TIER_CONFIG);"]]],
  ['h3 a countdown bar on the screen', [['main.js', "    else if (Math.max(0, now - roundStart) >= HALF_MS) { choose(null); return; }",
    "    else if (Math.max(0, now - roundStart) >= HALF_MS) { choose(null); return; }\n    document.getElementById('target').style.paddingBottom = Math.round((now - roundStart) / 600) + 'px';"]]],
  ['h4 the half unlocked at three', [['main.js', "HALF_MS = 6000, STREAK_FOR_HALF = 5;", "HALF_MS = 6000, STREAK_FOR_HALF = 3;"]]],
  ['h5 a wrong choice takes half away', [['main.js', "    if (streak >= STREAK_FOR_HALF) halfOpen = true;", "    halfOpen = streak >= STREAK_FOR_HALF;"]]],
  ['h6 the truth read off a rounded value', [['engine.js', "  return twice === task.denominator ? 'half' : twice < task.denominator ? 'less' : 'more';",
    "  const v = task.numerator / task.denominator;\n  return Math.abs(v - 0.5) < 0.07 ? 'half' : v < 0.5 ? 'less' : 'more';"]]],
  ['h8 the page never tells the engine half is open', [['main.js', '  state.halfOpen = halfOpen;\n', '']]],
  ['h7 a timed out round marked wrong', [['main.js', "correct: choice === null ? null : choice === truth, timedOut: choice === null,", "correct: choice === truth, timedOut: choice === null,"]]]
];
const only = process.argv[2];
for (const [name, edits] of PLANTS.filter(p => !only || p[0].startsWith(only))) {
  const dir = path.join(SP, 'hplant');
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  execFileSync('cp', ['-r', path.join(SAT, 'math'), path.join(SAT, 'crease'), dir]);
  let planted = true;
  for (const [file, from, to] of edits) {
    const p = path.join(dir, 'crease', file), src = fs.readFileSync(p, 'utf8');
    if (src.split(from).length !== 2) { planted = false; console.log(name.padEnd(40) + 'NOT PLANTED: the match is not exactly once in ' + file); break; }
    fs.writeFileSync(p, src.replace(from, () => to));
  }
  if (!planted) { fs.rmSync(dir, { recursive: true, force: true }); continue; }
  const r = spawnSync('node', [path.join(dir, 'crease', 'test', 'halfway.mjs')], { encoding: 'utf8', timeout: 1500000, maxBuffer: 64 * 1024 * 1024, env: Object.assign({}, process.env, { NODE_PATH: '/workspaces/lucid-winds/node_modules' }) });
  const lines = ((r.stdout || '') + (r.stderr || '')).split('\n').filter(l => /FAIL|Error|OK$/.test(l)).map(l => l.trim().slice(0, 220));
  console.log(name.padEnd(40) + (lines.length ? lines.slice(0, 4).join(' | ') : 'NOTHING (the plant was not seen)'));
  fs.rmSync(dir, { recursive: true, force: true });
}

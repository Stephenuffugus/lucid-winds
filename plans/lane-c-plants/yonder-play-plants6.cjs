/* Plants for YONDER's P1 play gate: each group is a folder copy of satellites/math and satellites/yonder with the
   faults written one edit at a time, each edit asserting its match first; then the copy's play gate runs and every
   FAIL line is printed. Usage: node yonder-play-plants.cjs <group> */
const fs = require('fs'), path = require('path'), { execFileSync, spawnSync } = require('child_process');
const SAT = process.env.PLANT_SAT || '/workspaces/lucid-winds/satellites', SP = __dirname;
const GROUPS = {
  G1: [
    ['p01 the number off by one', 'main.js', "targetEl.textContent = String(target);", "targetEl.textContent = String(stage[(index + 1) % stage.length]);"],
    ['p01b', 'main.js', "const target = stage[index], placement = value * MAX;", "const target = stage[(index + 1) % stage.length], placement = value * MAX;"],
    ['p10 a small flag', 'index.html', "#road .lw-stone { top: 50px;", "#road .lw-stone { width: 40px; height: 40px; margin-left: -20px; top: 50px;"],
    ['p13 the flag moved back', 'main.js', "      state.arrivedAt = now;", "      state.arrivedAt = now; line.stone.style.left = tx + 'px';"]
  ],
  G2: [
    ['p02 a placement scaled wrong', 'main.js', "const target = stage[index], placement = value * MAX;", "const target = stage[index], placement = value * MAX * 1.02;"],
    ['p08 the probe no slower', 'main.js', "const WALK = 1200, PROBE_WALK = 2400,", "const WALK = 1200, PROBE_WALK = 1200,"],
    ['p11 the numeral in the ends\' row', 'index.html', "#truth { position: absolute; top: 194px;", "#truth { position: absolute; top: 150px;"]
  ],
  G3: [
    ['p03 the post before the flag', 'main.js', "truthEl.hidden = true; truthMark.hidden = true; truthEl.textContent = '';", "truthEl.hidden = true; truthMark.hidden = false; truthEl.textContent = '';"],
    ['p03b', 'main.js', "  const target = stage[index];\n  targetEl", "  const target = stage[index];\n  truthMark.style.left = fromNormalized(target / MAX, geom, road.getBoundingClientRect().width) + 'px';\n  targetEl"],
    ['p06 a far walk takes longer', 'main.js', "tone.from = pitchFor(placement, MAX);", "state0.walkMs = walkMs = walkMs * (1 + Math.abs(value - target / MAX)); tone.from = pitchFor(placement, MAX);"],
    ['p06b', 'main.js', "  const walkMs = reduced()", "  const state0 = {}; let walkMs = reduced()"],
    ['p06c', 'main.js', "const result = { round, stage: stageNo, item: index, target, placement, value, pae: scoreEstimate(placement, target, { min: 0, max: MAX }),\n    isProbe, walkMs,", "const result = { round, stage: stageNo, item: index, target, placement, value, pae: scoreEstimate(placement, target, { min: 0, max: MAX }),\n    isProbe, get walkMs() { return walkMs; },"],
    ['p09 one road for every round', 'main.js', "  geom = lineGeometry(roads);", "  geom = geom || lineGeometry(roads);"]
  ],
  G4: [
    ['p04 next before the walk ends', 'main.js', "  walk = state;\n", "  walk = state; nextBtn.hidden = false; state.done = true;\n"],
    ['p12 an unseeded road', 'main.js', "  geom = lineGeometry(roads);", "  geom = lineGeometry(Math.random);"]
  ],
  G6: [
    ['p12 an unseeded road', 'main.js', "  geom = lineGeometry(roads);", "  geom = lineGeometry(Math.random);"]
  ],
  G5: [
    ['p05 the traveler stops short', 'main.js', "traveler.style.left = (fx + (tx - fx) * p) + 'px';", "traveler.style.left = (fx + (tx - fx) * p * 0.97) + 'px';"],
    ['p07 a near round in its own colour', 'main.js', "      truthMark.hidden = false;", "      truthMark.hidden = false; truthMark.style.background = result.pae < 0.05 ? '#3a8a3a' : '';"]
  ]
};
const g = process.argv[2];
const dir = path.join(SP, 'plant-' + g);
fs.rmSync(dir, { recursive: true, force: true });
fs.mkdirSync(dir, { recursive: true });
execFileSync('cp', ['-r', path.join(SAT, 'math'), path.join(SAT, 'yonder'), dir]);
for (const [name, file, from, to] of GROUPS[g]) {
  const p = path.join(dir, 'yonder', file), src = fs.readFileSync(p, 'utf8');
  if (src.split(from).length !== 2) throw new Error(name + ': the match is not exactly once in ' + file);
  fs.writeFileSync(p, src.replace(from, () => to));
  console.log('planted ' + name);
}
const r = spawnSync('node', [path.join(dir, 'yonder', 'test', 'play.mjs')], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, env: Object.assign({}, process.env, { NODE_PATH: '/workspaces/lucid-winds/node_modules' }) });
const out = (r.stdout || '') + (r.stderr || '');
console.log(out.split('\n').filter(l => /FAIL|Error|OK$/.test(l)).map(l => l.slice(0, 240)).join('\n'));
fs.rmSync(dir, { recursive: true, force: true });

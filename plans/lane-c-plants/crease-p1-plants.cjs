/* Plants for CREASE's FREEHAND gate: each plant is a folder copy of satellites/math and satellites/crease (from PLANT_SAT,
   a snapshot) with its faults written one edit at a time (every match asserted first), then test/freehand.mjs run in the
   copy and its FAIL lines printed. Usage: node crease-p1-plants.cjs [name prefix] */
const fs = require('fs'), path = require('path'), { execFileSync, spawnSync } = require('child_process');
const SAT = process.env.PLANT_SAT || '/workspaces/lucid-winds/satellites', SP = __dirname;
const PLANTS = [
  ['f1 a tick left on the strip', [['render.js', "export function placePins(strip, geom) {\n  strip.querySelectorAll('.pin').forEach(p => p.remove());",
    "export function placePins(strip, geom) {\n  strip.querySelectorAll('.pin').forEach(p => p.remove());\n  const tick = make('div', 'tick'); tick.style.cssText = 'position:absolute;top:110px;left:50%;width:2px;height:34px;background:#8f826c'; strip.append(tick);"]]],
  ['f2 the truth before the commit', [['main.js', "  placePins(strip, geom);\n", "  placePins(strip, geom);\n  buildReveal(strip, { geom, parts: task.whole * task.denominator, trueK: task.numerator, label: '', clipNorm: 0, truthNorm: task.numerator / task.denominator / task.whole }); setReveal(strip, 0.5);\n"],
    ['main.js', "import { placePins, clearReveal, buildReveal, setReveal } from './render.js?v=20260915a';", "import { placePins, clearReveal, buildReveal, setReveal } from './render.js?v=20260915a';"]]],
  ['f3 a crease off its place', [['render.js', "    crease.style.left = fromNormalized(k / parts, geom, W) + 'px';", "    crease.style.left = fromNormalized(k / parts, geom, W) + (k === 1 ? 3 : 0) + 'px';"]]],
  ['f4 every crease labelled', [['render.js', "    if (k === trueK) {", "    if (k === trueK || k === 1) {"]]],
  ['f5 a far round reveals slower', [['main.js', "  const ms = reduced() ? REVEAL_REDUCED : REVEAL;", "  const ms = (reduced() ? REVEAL_REDUCED : REVEAL) * (scored.near ? 1 : 1.6);"]]],
  ['f6 an unseeded strip', [['engine.js', "    strip: lineGeometry(r)", "    strip: lineGeometry(Math.random)"]]],
  ['f7 a tier from nowhere', [['main.js', "  state.tier = tierNow();", "  state.tier = 0;"]]],
  ['f8 a clip too small', [['index.html', '</style>', '  #strip .lw-stone { width: 40px; height: 40px; margin-left: -20px; }\n</style>']]],
  ['f9 a truth off its place', [['render.js', "  truth.style.left = truthX + 'px';", "  truth.style.left = (truthX + 6) + 'px';"]]],
  ['f10 no whole marked on a long strip', [['render.js', "    if (k % perUnit === 0) crease.classList.add('unit');", "    if (k % perUnit === 0 && k === -1) crease.classList.add('unit');"]]],
  ['f11 the label in the ends\' row again', [['index.html', '</style>', '  .crease-label, .crease.unit .crease-label { top: 40px; }\n</style>']]]
];
const only = process.argv[2];
for (const [name, edits] of PLANTS.filter(p => !only || p[0].startsWith(only))) {
  const dir = path.join(SP, 'fplant');
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  execFileSync('cp', ['-r', path.join(SAT, 'math'), path.join(SAT, 'crease'), dir]);
  for (const [file, from, to] of edits) {
    if (from === to) continue;
    const p = path.join(dir, 'crease', file), src = fs.readFileSync(p, 'utf8');
    if (src.split(from).length !== 2) throw new Error(name + ': the match is not exactly once in ' + file);
    fs.writeFileSync(p, src.replace(from, () => to));
  }
  const r = spawnSync('node', [path.join(dir, 'crease', 'test', 'freehand.mjs')], { encoding: 'utf8', timeout: 1500000, maxBuffer: 64 * 1024 * 1024, env: Object.assign({}, process.env, { NODE_PATH: '/workspaces/lucid-winds/node_modules' }) });
  const lines = ((r.stdout || '') + (r.stderr || '')).split('\n').filter(l => /FAIL|Error|OK$/.test(l)).map(l => l.trim().slice(0, 220));
  console.log(name.padEnd(34) + (lines.length ? lines.slice(0, 4).join(' | ') : 'NOTHING (the plant was not seen)'));
  fs.rmSync(dir, { recursive: true, force: true });
}

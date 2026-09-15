/* Plants for CREASE mode's gate: each plant is a folder copy of satellites/math and satellites/crease (from PLANT_SAT, a
   snapshot) with its faults written one edit at a time (every match asserted first), then test/crease.mjs run in the copy
   and its FAIL lines printed. Usage: node crease-p2-plants.cjs [name prefix] */
const fs = require('fs'), path = require('path'), { execFileSync, spawnSync } = require('child_process');
const SAT = process.env.PLANT_SAT || '/workspaces/lucid-winds/satellites', SP = __dirname;
const PLANTS = [
  ['c1 an unequal crease', [['render.js', "    if (k % perUnit === 0) crease.classList.add('unit');\n    crease.style.left = fromNormalized(k / parts, geom, W) + 'px';\n    strip.append(crease);",
    "    if (k % perUnit === 0) crease.classList.add('unit');\n    crease.style.left = fromNormalized(k / parts, geom, W) + (k === 1 ? 4 : 0) + 'px';\n    strip.append(crease);"]]],
  ['c2 a fold labelled during play', [['render.js', "    strip.append(crease);\n  }\n}\n\n/* the strip back to a plain strip",
    "    const tag = make('span', 'crease-label'); tag.textContent = k + '/' + parts; crease.append(tag);\n    strip.append(crease);\n  }\n}\n\n/* the strip back to a plain strip"]]],
  ['c3 the clip does not snap', [['main.js', "  line.setSnap(task.whole * parts);", "  line.setSnap(0);"],
    ['main.js', "snap: CREASING ? task.whole * parts : 0 });", "snap: 0 });"]]],
  ['c4 unfolding below one part', [['main.js', "  const to = Math.max(1, Math.min(MAX_PARTS, parts + delta));", "  const to = Math.max(0, Math.min(MAX_PARTS, parts + delta));"]]],
  ['c5 the folds kept under the truth', [['main.js', "  /* the folds made are the child's; the reveal's creases are the truth's, drawn fresh */\n  clearFolds(strip);", "  /* kept */"]]]
];
const only = process.argv[2];
for (const [name, edits] of PLANTS.filter(p => !only || p[0].startsWith(only))) {
  const dir = path.join(SP, 'cmplant');
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  execFileSync('cp', ['-r', path.join(SAT, 'math'), path.join(SAT, 'crease'), dir]);
  for (const [file, from, to] of edits) {
    const p = path.join(dir, 'crease', file), src = fs.readFileSync(p, 'utf8');
    if (src.split(from).length !== 2) throw new Error(name + ': the match is not exactly once in ' + file);
    fs.writeFileSync(p, src.replace(from, () => to));
  }
  const r = spawnSync('node', [path.join(dir, 'crease', 'test', 'crease.mjs')], { encoding: 'utf8', timeout: 1500000, maxBuffer: 64 * 1024 * 1024, env: Object.assign({}, process.env, { NODE_PATH: '/workspaces/lucid-winds/node_modules' }) });
  const lines = ((r.stdout || '') + (r.stderr || '')).split('\n').filter(l => /FAIL|Error|OK$/.test(l)).map(l => l.trim().slice(0, 220));
  console.log(name.padEnd(36) + (lines.length ? lines.slice(0, 4).join(' | ') : 'NOTHING (the plant was not seen)'));
  fs.rmSync(dir, { recursive: true, force: true });
}

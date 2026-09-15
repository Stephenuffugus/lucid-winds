/* Plants for BRIM's P2 and P3 gates: a folder copy of satellites/{math,crease,brim} (from PLANT_SAT, the frozen copy the third
   full check passed on) per plant, its edits asserted exactly once, the named gate run in the copy under the gate lock (the
   timeout inside the lock), its FAIL lines printed. Usage: node brim-p2p3-plants.cjs [name prefix] */
const fs = require('fs'), path = require('path'), { execFileSync, spawnSync } = require('child_process');
const SAT = process.env.PLANT_SAT || '/workspaces/lucid-winds/satellites', SP = __dirname;
const PLANTS = [
  ['h1 a wrong choice keeps the streak', 'half', [['main.js', '  streak = s.correct ? streak + 1 : 0;', '  streak = streak + 1;']]],
  ['b1 the band a tenth too tall', 'brim', [['render.js', "  v.band.style.height = ((1 - value) * v.glass.clientHeight) + 'px';", "  v.band.style.height = ((1.1 - value) * v.glass.clientHeight) + 'px';"]]],
  ['v1 the true split etched first', 'level', [['main.js', "    fadeEtch(v, 'mark', Math.min(1, p / 0.5));\n    fadeEtch(v, 'truth', Math.max(0, Math.min(1, (p - 0.5) / 0.5)));", "    fadeEtch(v, 'truth', Math.min(1, p / 0.5));\n    fadeEtch(v, 'mark', Math.max(0, Math.min(1, (p - 0.5) / 0.5)));"]]],
  ['a1 no pour for a glass chosen', 'audio', [['main.js', "  sound('tap');\n  sound('pour');", "  sound('tap');"]]],
  ['c1 the builder offers another grade', 'config', [['../math/config/schemas.js', "type: 'enum', values: Object.freeze(['3', '4', '5']), default: '4', label: 'Fractions for grade',", "type: 'enum', values: Object.freeze(['3', '4', '5']), default: '3', label: 'Fractions for grade',"]]],
  ['s1 every bottle the first', 'specimens', [['shelf.js', "collectOnce(shelf, 'bottle-' + (shelf.length + 1))", "collectOnce(shelf, 'bottle-1')"]]],
  ['r1 two waters alike in lightness', 'art', [['index.html', '  #right .water { background: #b89ab0; }', '  #right .water { background: #2a7478; }']]],
  ['p1 a fill frame that works 30 ms', 'pace', [['render.js', '  const level = levelAt(value, p), h = level * v.glass.clientHeight;', '  const busy = performance.now(); while (performance.now() - busy < 30) { /* a planted slow frame */ }\n  const level = levelAt(value, p), h = level * v.glass.clientHeight;']]],
  ['y1 the caption under 0.7 rem', 'layout', [['index.html', '  #caption { min-height: 2.4em; text-align: center; font-size: var(--type-20);', '  #caption { min-height: 2.4em; text-align: center; font-size: 0.6rem;']]],
  ['o1 the worker deletes every cache', 'offline', [['sw.js', "keys.filter(k => k.indexOf('brim-') === 0 && k !== SHELL_VERSION)", 'keys.filter(k => k !== SHELL_VERSION)']]]
];
const only = process.argv[2];
for (const [name, gate, edits] of PLANTS.filter(p => !only || p[0].startsWith(only))) {
  const dir = path.join(SP, 'brimp2p3plant');
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  for (const g of ['math', 'crease', 'brim']) execFileSync('cp', ['-r', path.join(SAT, g), dir]);
  let planted = true;
  for (const [file, from, to] of edits) {
    const p = path.join(dir, 'brim', file), src = fs.readFileSync(p, 'utf8');
    if (src.split(from).length !== 2) { console.log(name.padEnd(38) + 'NOT PLANTED: the match is not exactly once in ' + file); planted = false; break; }
    fs.writeFileSync(p, src.replace(from, () => to));
  }
  if (!planted) { fs.rmSync(dir, { recursive: true, force: true }); continue; }
  const r = spawnSync('flock', ['-w', '43200', '/tmp/sws-gate.lock', 'timeout', '1800', 'node', path.join('test', gate + '.mjs')], { cwd: path.join(dir, 'brim'), encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, env: Object.assign({}, process.env, { NODE_PATH: '/workspaces/lucid-winds/node_modules' }) });
  const lines = ((r.stdout || '') + (r.stderr || '')).split('\n').filter(l => /FAIL|Error|OK$/.test(l)).map(l => l.trim().slice(0, 230));
  console.log(name.padEnd(38) + gate.padEnd(10) + (lines.length ? lines.slice(0, 3).join(' | ') : 'NOTHING (the plant was not seen)') + ' [exit ' + r.status + ']');
  fs.rmSync(dir, { recursive: true, force: true });
}
console.log('plants done');

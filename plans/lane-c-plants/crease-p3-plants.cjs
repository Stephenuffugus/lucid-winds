/* Plants for CREASE's P3 gates (specimens, art, pace, layout, offline, config): each plant is a folder copy of
   satellites/math and satellites/crease (from PLANT_SAT, a snapshot of a green tree) with its faults written one edit at a
   time (every match asserted exactly once first), then its gate run in the copy and its FAIL lines printed.
   Usage: node crease-p3-plants.cjs [name prefix] */
const fs = require('fs'), path = require('path'), { execFileSync, spawnSync } = require('child_process');
const SAT = process.env.PLANT_SAT || '/workspaces/lucid-winds/satellites', SP = __dirname;
const PLANTS = [
  ['sp1 a specimen every round', 'specimens', [['crease/main.js', '  const ended = runRounds >= RUN;', '  const ended = true;']]],
  ['sp2 the shelf counts', 'specimens', [['crease/shelf.js', '    section.hidden = false;', "    section.hidden = false;\n    go.textContent = String(rec.collect.length);"]]],
  ['sp3 past twenty four', 'specimens', [['crease/shelf.js', 'r.collect = shelf.length < SHELF_SIZE ?', 'r.collect = true ?']]],
  ['sp4 one paper for all', 'specimens', [['crease/shelf.js', 'paletteFor(i % 3)', 'paletteFor(0)'], ['crease/shelf.js', 'cells.push({ row, col, shape, paper: i % 3 });', 'cells.push({ row, col, shape, paper: 0 });']]],
  ['sp5 a reload mid run earns', 'specimens', [['crease/main.js', 'let runRounds = 0;', "let runRounds = Number(sessionStorage.getItem('crease-run') || 0);"], ['crease/main.js', '  runRounds++;', "  runRounds++;\n  sessionStorage.setItem('crease-run', String(runRounds % RUN));"]]],
  ['ar1 a pin for a clip', 'art', [['crease/main.js', "line.stone.append(spriteCanvas('clip', 3));", "line.stone.append(spriteCanvas('pin', 3));"]]],
  ['ar2 the truth off its place', 'art', [['crease/index.html', '#truth-clip { position: absolute; top: 90px; width: 21px; height: 48px; margin-left: -10.5px;', '#truth-clip { position: absolute; top: 90px; width: 21px; height: 48px; margin-left: -2px;']]],
  ['ar3 two doors alike', 'art', [['crease/main.js', "crease: ['doorCrease', COPY.startCrease]", "crease: ['doorFreehand', COPY.startCrease]"]]],
  ['ar4 the clip off the strip', 'art', [['crease/index.html', '#strip .lw-stone canvas { position: absolute; left: 50%; bottom: -8px;', '#strip .lw-stone canvas { position: absolute; left: 50%; bottom: 6px;']]],
  ['pa1 a heavy frame', 'pace', [['crease/main.js', '    setReveal(strip, p);', '    setReveal(strip, p);\n    for (let z = 0; z < 3e7; z++) Math.sqrt(z);']]],
  ['pa2 the truth off its curve', 'pace', [['crease/render.js', 'const first = Math.min(1, Math.max(0, p / 0.6))', 'const first = Math.min(1, Math.max(0, p / 0.9))']]],
  ['pa3 less motion not shorter', 'pace', [['crease/main.js', 'REVEAL_REDUCED = 320', 'REVEAL_REDUCED = 900']]],
  ['pa4 creases before the truth', 'pace', [['crease/render.js', 'second = Math.min(1, Math.max(0, (p - 0.6) / 0.4))', 'second = Math.min(1, Math.max(0, (p - 0.3) / 0.7))']]],
  ['la1 next too short', 'layout', [['crease/index.html', '#next { grid-column: 2; min-width: 64px; min-height: 56px; }', '#next { grid-column: 2; min-width: 64px; min-height: 40px; }']]],
  ['la2 the stack in small type', 'layout', [['crease/index.html', '.stack-label { font-size: 1rem;', '.stack-label { font-size: 0.6rem;']]],
  ['la3 the doors pushed off', 'layout', [['crease/index.html', '.doors { display: flex; flex-wrap: wrap;', '.doors { display: flex; flex-wrap: nowrap; margin-left: 300px;']]],
  ['la4 the shelf go under the fold', 'layout', [['crease/index.html', '#shelf { position: fixed; inset: 0;', '#shelf { position: fixed; inset: 0; padding-top: 900px;']]],
  ['of1 every cache deleted', 'offline', [['crease/sw.js', "keys.filter(k => k.indexOf('crease-') === 0 && k !== SHELL_VERSION)", 'keys.filter(k => k !== SHELL_VERSION)']]],
  ['of2 render.js not precached', 'offline', [['crease/sw.js', "  './render.js?v=20260916a',\n", '']]],
  ['of3 a miss that never settles', 'offline', [['crease/sw.js', '}).catch(() => null), NET_TIMEOUT_MS).then(res => res || new Response', '}).catch(() => null), 600000).then(res => res || new Response']]],
  ['of4 the manifest misnamed', 'offline', [['crease/manifest.webmanifest', '"name": "Crease",', '"name": "Fold",']]],
  ['co1 the builder defaults another grade', 'config', [['math/config/schemas.js', "type: 'enum', values: Object.freeze(['3', '4']), default: '3', label: 'Fractions for grade'", "type: 'enum', values: Object.freeze(['3', '4']), default: '4', label: 'Fractions for grade'"]]],
  ['co2 the page takes a count the builder does not', 'config', [['crease/config.js', "count: Object.freeze({ type: 'enum', values: Object.freeze(['10', '20', '30']), default: '10' })", "count: Object.freeze({ type: 'enum', values: Object.freeze(['10', '20', '30', '40']), default: '10' })"]]]
];
const only = process.argv[2];
for (const [name, gate, edits] of PLANTS.filter(p => !only || p[0].startsWith(only))) {
  const dir = path.join(SP, 'p3plant');
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  execFileSync('cp', ['-r', path.join(SAT, 'math'), path.join(SAT, 'crease'), dir]);
  let planted = true;
  for (const [file, from, to] of edits) {
    const p = path.join(dir, file), src = fs.readFileSync(p, 'utf8');
    if (src.split(from).length !== 2) { console.log(name.padEnd(46) + 'NOT PLANTED: the match is not exactly once in ' + file); planted = false; break; }
    fs.writeFileSync(p, src.replace(from, () => to));
  }
  if (!planted) { fs.rmSync(dir, { recursive: true, force: true }); continue; }
  const r = spawnSync('node', [path.join(dir, 'crease', 'test', gate + '.mjs')], { encoding: 'utf8', timeout: 1500000, maxBuffer: 64 * 1024 * 1024, env: Object.assign({}, process.env, { NODE_PATH: '/workspaces/lucid-winds/node_modules' }) });
  const lines = ((r.stdout || '') + (r.stderr || '')).split('\n').filter(l => /FAIL|Error|OK$/.test(l)).map(l => l.trim().slice(0, 220));
  console.log(name.padEnd(46) + (lines.length ? lines.slice(0, 3).join(' | ') : 'NOTHING (the plant was not seen)') + (r.signal ? ' [killed ' + r.signal + ']' : ''));
  fs.rmSync(dir, { recursive: true, force: true });
}

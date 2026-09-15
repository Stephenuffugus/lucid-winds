/* Plants for GAUGE's browser gates, P1 to P3 (plans/gauge/HANDOFF-GAUGE.md): a folder copy of satellites/{math,gauge} and tools
   (from PLANT_ROOT, a frozen copy made with git archive of the commit the gates passed on) per plant, its edits asserted exactly
   once, the named gate run in the copy under the gate lock with the timeout inside it, its FAIL lines printed. A plant whose edit
   does not match exactly once prints NOT PLANTED and counts for nothing; a planted gate that stays green prints NOTHING and the
   plant is rewritten, never counted.
   Usage: PLANT_ROOT=<frozen copy root> node gauge-p1p3-plants.cjs [name prefix] [--dry]   (--dry checks anchors only) */
const fs = require('fs'), path = require('path'), { execFileSync, spawnSync } = require('child_process');
const ROOT = process.env.PLANT_ROOT, SP = process.env.PLANT_SCRATCH || path.join(__dirname, '.plant-scratch');
if (!ROOT) { console.log('set PLANT_ROOT to a frozen copy root (holding satellites/ and tools/)'); process.exit(2); }
const PLANTS = [
  ['c1 the larger lit before the hold', 'compare', [['main.js', "  later(reduced() ? 0 : HOLD_MS, () => {\n    if (truth === 'same')", "  later(0, () => {\n    if (truth === 'same')"]]],
  ['d1 the child\'s rule in the title', 'code', [['main.js', '  code = classifyRun(responses);', "  code = classifyRun(responses);\n  if (code) document.title = 'Gauge ' + code;"]]],
  ['z1 a rule node made on every draw', 'zoom', [['main.js', '  ruleMine.show(lvl.from, lvl.places, at, false);', "  ruleMine.show(lvl.from, lvl.places, at, false);\n  el('rule-mine').append(document.createElement('i'));"]]],
  ['s1 the choice lit, not the answer', 'same', [['main.js', "    el(sameItem.answer === 'same' ? 'same-yes' : 'same-no').classList.add('is-more');", "    el(choice === 'same' ? 'same-yes' : 'same-no').classList.add('is-more');"]]],
  ['a1 every detent one pitch', 'audio', [['main.js', 'detent0: detentAt(440), detent1: detentAt(554), detent2: detentAt(660), detent3: detentAt(784)', 'detent0: detentAt(440), detent1: detentAt(440), detent2: detentAt(440), detent3: detentAt(440)']]],
  ['g1 the builder offers another default', 'config', [['../math/config/schemas.js', "type: 'enum', values: Object.freeze(['compare', 'zoom', 'same']), default: 'compare', label: 'Mode',", "type: 'enum', values: Object.freeze(['compare', 'zoom', 'same']), default: 'zoom', label: 'Mode',"]]],
  ['o1 the worker deletes every cache', 'offline', [['sw.js', "keys.filter(k => k.indexOf('gauge-') === 0 && k !== SHELL_VERSION)", 'keys.filter(k => k !== SHELL_VERSION)']]],
  ['y1 go on under 56 px', 'layout', [['index.html', '  #next { min-width: 64px; min-height: 56px; }', '  #next { min-width: 30px; min-height: 30px; width: 30px; height: 30px; padding: 0; }']]],
  ['p1 a node made on every move', 'pace', [['main.js', "  sound('detent' + Math.max(0, Math.min(3, levels[levels.length - 1].places)));", "  el('zoom-view').append(document.createElement('i'));\n  sound('detent' + Math.max(0, Math.min(3, levels[levels.length - 1].places)));"]]],
  ['r1 the true marker in the child\'s brass', 'art', [['index.html', '  .rule .marker.truth { background: rgba(38, 40, 43, 0.25); border-color: #26282b; }', '  .rule .marker.truth { background: rgba(176, 138, 62, 0.45); border-color: #b08a3e; }']]],
  ['s2 every instrument the first', 'specimens', [['case.js', "collectOnce(kept, 'instrument-' + (kept.length + 1))", "collectOnce(kept, 'instrument-1')"]]]
];
const args = process.argv.slice(2), dry = args.includes('--dry'), only = args.find(a => !a.startsWith('--'));
for (const [name, gate, edits] of PLANTS.filter(p => !only || p[0].startsWith(only))) {
  if (dry) {
    for (const [file, from] of edits) {
      const n = fs.readFileSync(path.join(ROOT, 'satellites', 'gauge', file), 'utf8').split(from).length - 1;
      console.log(name.padEnd(40) + gate.padEnd(10) + (n === 1 ? 'anchor once' : 'ANCHOR ' + n + ' TIMES in ' + file) + (fs.existsSync(path.join(ROOT, 'satellites', 'gauge', 'test', gate + '.mjs')) ? '' : ' (NO GATE FILE)'));
    }
    continue;
  }
  /* ⛔ one folder per invocation and plant (see game-plants.cjs): a shared folder let one run delete another's tree */
  const dir = path.join(SP, 'gauge-plant-' + process.pid + '-' + name.split(' ')[0]);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(path.join(dir, 'satellites'), { recursive: true });
  for (const g of ['math', 'gauge']) execFileSync('cp', ['-r', path.join(ROOT, 'satellites', g), path.join(dir, 'satellites')]);
  execFileSync('cp', ['-r', path.join(ROOT, 'tools'), dir]);
  let planted = true;
  for (const [file, from, to] of edits) {
    const p = path.join(dir, 'satellites', 'gauge', file), src = fs.readFileSync(p, 'utf8');
    if (src.split(from).length !== 2) { console.log(name.padEnd(40) + 'NOT PLANTED: the match is not exactly once in ' + file); planted = false; break; }
    fs.writeFileSync(p, src.replace(from, () => to));
  }
  if (!planted) { fs.rmSync(dir, { recursive: true, force: true }); continue; }
  const r = spawnSync('flock', ['-w', '43200', '/tmp/sws-gate.lock', 'timeout', '2400', 'node', path.join('test', gate + '.mjs')], { cwd: path.join(dir, 'satellites', 'gauge'), encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, env: Object.assign({}, process.env, { NODE_PATH: '/workspaces/lucid-winds/node_modules' }) });
  const lines = ((r.stdout || '') + (r.stderr || '')).split('\n').filter(l => /FAIL|Error|OK$/.test(l)).map(l => l.trim().slice(0, 240));
  console.log(name.padEnd(40) + gate.padEnd(10) + (lines.length ? lines.slice(0, 3).join(' | ') : 'NOTHING (the plant was not seen)') + ' [exit ' + r.status + ']');
  fs.rmSync(dir, { recursive: true, force: true });
}
console.log('plants done');

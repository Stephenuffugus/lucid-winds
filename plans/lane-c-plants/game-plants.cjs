/* A plant runner for any lane C game's browser gates. A folder copy of satellites/{math,<game>} and tools (from PLANT_ROOT, a frozen
   copy made with git archive of the commit under test) per plant, its edits asserted exactly once, the named gate run in the copy
   under the gate lock with the timeout inside it, its FAIL lines printed.
   - A plant whose edit does not match exactly once prints NOT PLANTED and counts for nothing.
   - A planted gate that stays green prints NOTHING: the plant is rewritten, never counted.
   - --pair runs the same gate unplanted on the same frozen copy first; a plant counts only when its own green run is green.
   - --dry checks every anchor and gate file without running anything.
   Usage: PLANT_ROOT=<frozen copy root> node game-plants.cjs <game> <plants.json> [name prefix] [--pair] [--dry]
   A plants file is a JSON array of [name, gate, [[file relative to satellites/<game>, exact old text, new text], ...]]. */
const fs = require('fs'), path = require('path'), { execFileSync, spawnSync } = require('child_process');
const args = process.argv.slice(2), flags = args.filter(a => a.startsWith('--')), rest = args.filter(a => !a.startsWith('--'));
const [GAME, LIST, only] = rest;
const ROOT = process.env.PLANT_ROOT, SP = process.env.PLANT_SCRATCH || path.join(__dirname, '.plant-scratch');
const dry = flags.includes('--dry'), pair = flags.includes('--pair');
if (!GAME || !LIST || !ROOT) { console.log('usage: PLANT_ROOT=<frozen copy root> node game-plants.cjs <game> <plants.json> [prefix] [--pair] [--dry]'); process.exit(2); }
const PLANTS = JSON.parse(fs.readFileSync(path.resolve(__dirname, LIST), 'utf8'));
const GAMEDIR = path.join(ROOT, 'satellites', GAME);

function runGate(cwd, gate) {
  const r = spawnSync('flock', ['-w', '43200', '/tmp/sws-gate.lock', 'timeout', '2400', 'node', path.join('test', gate + '.mjs')], { cwd, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, env: Object.assign({}, process.env, { NODE_PATH: '/workspaces/lucid-winds/node_modules' }) });
  const lines = ((r.stdout || '') + (r.stderr || '')).split('\n').filter(l => /FAIL|Error|OK$/.test(l)).map(l => l.trim().slice(0, 240));
  return { status: r.status, lines };
}
const greens = {};
for (const [name, gate, edits] of PLANTS.filter(p => !only || p[0].startsWith(only))) {
  if (dry) {
    for (const [file, from] of edits) {
      const p = path.join(GAMEDIR, file), n = fs.existsSync(p) ? fs.readFileSync(p, 'utf8').split(from).length - 1 : -1;
      console.log(name.padEnd(42) + gate.padEnd(10) + (n === 1 ? 'anchor once' : n < 0 ? 'NO FILE ' + file : 'ANCHOR ' + n + ' TIMES in ' + file) + (fs.existsSync(path.join(GAMEDIR, 'test', gate + '.mjs')) ? '' : ' (NO GATE FILE)'));
    }
    continue;
  }
  if (pair && !(gate in greens)) {
    const g = runGate(GAMEDIR, gate);
    greens[gate] = g.status === 0;
    console.log(('green run').padEnd(42) + gate.padEnd(10) + (g.lines.slice(-2).join(' | ') || '(no result line)') + ' [exit ' + g.status + ']');
  }
  /* ⛔ every invocation and every plant gets its own folder: two runs of one game shared a single folder, and the second
     deleted the first's tree under a running gate, which reported ENOENT and looked like a plant that planted nothing */
  const dir = path.join(SP, GAME + '-plant-' + process.pid + '-' + name.split(' ')[0]);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(path.join(dir, 'satellites'), { recursive: true });
  for (const g of ['math', GAME]) execFileSync('cp', ['-r', path.join(ROOT, 'satellites', g), path.join(dir, 'satellites')]);
  execFileSync('cp', ['-r', path.join(ROOT, 'tools'), dir]);
  let planted = true;
  for (const [file, from, to] of edits) {
    const p = path.join(dir, 'satellites', GAME, file), src = fs.readFileSync(p, 'utf8');
    if (src.split(from).length !== 2) { console.log(name.padEnd(42) + 'NOT PLANTED: the match is not exactly once in ' + file); planted = false; break; }
    fs.writeFileSync(p, src.replace(from, () => to));
  }
  if (!planted) { fs.rmSync(dir, { recursive: true, force: true }); continue; }
  const r = runGate(path.join(dir, 'satellites', GAME), gate);
  const verdict = r.lines.some(l => /FAIL/.test(l)) ? '' : 'NOTHING (the plant was not seen) ';
  const counts = pair ? (greens[gate] ? '' : ' (DOES NOT COUNT: the green run was not green)') : '';
  console.log(name.padEnd(42) + gate.padEnd(10) + verdict + (r.lines.slice(0, 3).join(' | ') || '') + ' [exit ' + r.status + ']' + counts);
  fs.rmSync(dir, { recursive: true, force: true });
}
console.log('plants done');

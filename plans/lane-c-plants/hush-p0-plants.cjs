/* Plants for HUSH's P0 laws: a folder copy per plant (satellites/math, satellites/hush, tools/), each edit asserted to match
   exactly once, then the named gate run in the copy and its FAIL lines printed. A plant whose match is missing says NOT PLANTED.
   Usage: node hush-p0-plants.cjs [name prefix] */
const fs = require('fs'), path = require('path'), { spawnSync } = require('child_process');
const REPO = '/workspaces/lucid-winds', SP = __dirname;
const E = 'hush/engine.js', C = 'hush/content.js';
const PLANTS = [
  ['e1 a quarter no-go at easy', 'test/engine.mjs', [[E, 'Math.floor(n * 9 / 40)', 'Math.floor(n / 4)']]],
  ['e2 a no-go after two go', 'test/engine.mjs', [[E, "out.push('go', 'go', 'go', 'nogo')", "out.push('go', 'go', 'nogo', 'go')"]]],
  ['e3 the count rounded up', 'test/engine.mjs', [[E, 'Math.floor(n * 9 / 40)', 'Math.ceil(n * 9 / 40)']]],
  ['e4 no shuffle', 'test/engine.mjs', [[E, 'for (let i = slots - 1; i > 0; i--) {', 'for (let i = slots - 1; i > slots; i--) {']]],
  ['e5 one gap', 'test/engine.mjs', [[E, 'GAP_MIN + Math.floor(r() * (GAP_MAX - GAP_MIN + 1))', 'GAP_MIN + 400']]],
  ['e6 no grace', 'test/engine.mjs', [[E, 'stepAt <= hiddenAt + GRACE_MS', 'stepAt <= hiddenAt']]],
  ['e7 a step in the gap counts', 'test/engine.mjs', [[E, 'stepAt >= paintedAt && ', '']]],
  ['e8 reaction time off paint', 'test/engine.mjs', [[E, "rtMs: stepAt - paintedAt } : { outcome: 'miss'", "rtMs: stepAt - paintedAt + 16 } : { outcome: 'miss'"]]],
  ['e9 a dear false alarm in Careful', 'test/engine.mjs', [[E, "if (outcome === 'falseAlarm') return -1;", "if (outcome === 'falseAlarm') return fork === 'careful' ? -2 : -1;"]]],
  ['e10 a miss steps back', 'test/engine.mjs', [[E, "  if (outcome === 'correctRejection' && fork === 'careful') return 1;", "  if (outcome === 'miss') return -1;\n  if (outcome === 'correctRejection' && fork === 'careful') return 1;"]]],
  ['e11 under zero', 'test/engine.mjs', [[E, 'Math.min(SETTLE, Math.max(0, steps + delta))', 'Math.min(SETTLE, steps + delta)']]],
  ['e12 the settle at 21', 'test/engine.mjs', [[E, 'SETTLE = 18', 'SETTLE = 21']]],
  ['e13 similarity on the go history', 'test/engine.mjs', [[E, "const nogo = trials.filter(t => t.type === 'nogo').map(t => t.outcome === 'correctRejection');", 'const nogo = go;']]],
  ['e14 the ratio per trial', 'test/engine.mjs', [[E, 'const q = adaptStaircase(clean,', 'const q = adaptStaircase(nogo,']]],
  ['e15 modes mixed in a run', 'test/engine.mjs', [[E, 'map(type => ({ mode, type,', "map((type, i) => ({ mode: i % 5 === 4 ? 'mirror' : mode, type,"]]],
  ['e16 Simon always says', 'test/engine.mjs', [[E, "says: type === 'go'", 'says: true']]],
  ['e17 a command that catches', 'test/engine.mjs', [[C, "'march in place'", "'catch a cloud'"]]],
  ['l1 a clock in the engine', 'tools/lint.mjs', [[E, 'export const GRACE_MS = 150;', 'export const GRACE_MS = 150;\nexport const BORN = Date.now();']]],
  ['l2 a motion sensor', 'tools/lint.mjs', [[C, "export const SIGNAL_WORD = 'Hush says';", "export const SIGNAL_WORD = 'Hush says';\nexport const MOTION = 'devicemotion';"]]],
  ['l3 an unstamped import', 'tools/lint.mjs', [[E, "'./content.js?v=20260916d'", "'./content.js'"]]],
  ['l4 patience in the copy', 'tools/lint.mjs', [[C, "go: 'Go on'", "go: 'Patience wins'"]]],
  ['l5 a sound in a loop', 'tools/lint.mjs', [[C, "export const SIGNAL_WORD = 'Hush says';", "export const SIGNAL_WORD = 'Hush says';\nexport function steps(a, sound) { for (const x of a) { sound(x); } }"]]],
  ['l6 a dash in the copy', 'tools/lint.mjs', [[C, "step: 'Step'", "step: 'Step - closer'"]]]
];
const only = process.argv[2];
for (const [name, gate, edits] of PLANTS.filter(p => !only || p[0].startsWith(only))) {
  const D = path.join(SP, 'plant-hush');
  fs.rmSync(D, { recursive: true, force: true });
  fs.mkdirSync(path.join(D, 'satellites'), { recursive: true });
  fs.cpSync(path.join(REPO, 'satellites/math'), path.join(D, 'satellites/math'), { recursive: true });
  fs.cpSync(path.join(REPO, 'satellites/hush'), path.join(D, 'satellites/hush'), { recursive: true });
  fs.cpSync(path.join(REPO, 'tools'), path.join(D, 'tools'), { recursive: true });
  let planted = true;
  for (const [file, from, to] of edits) {
    const p = path.join(D, 'satellites', file), s = fs.readFileSync(p, 'utf8');
    if (s.split(from).length !== 2) { console.log(name.padEnd(36) + 'NOT PLANTED (' + file + ' matches ' + (s.split(from).length - 1) + ' times)'); planted = false; break; }
    fs.writeFileSync(p, s.replace(from, () => to));
  }
  if (!planted) continue;
  const r = spawnSync(process.execPath, [gate], { cwd: path.join(D, 'satellites/hush'), encoding: 'utf8', timeout: 300000 });
  const out = (r.stdout || '') + (r.stderr || '');
  const failLines = out.split('\n').filter(l => /FAIL/.test(l)).map(l => l.trim().slice(0, 200));
  console.log(name.padEnd(36) + (failLines.length ? failLines.join(' | ') : out.split('\n').filter(l => /OK$/.test(l)).join(' ') + '   <- planted nothing seen'));
}
fs.rmSync(path.join(SP, 'plant-hush'), { recursive: true, force: true });

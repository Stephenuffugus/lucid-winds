/* The gate on the gates.
 *
 *   node test/mutants.mjs
 *
 * Every mutation below is a plausible wrong version of one rule. Each one must
 * turn `sim.js --test` red, AND it must be the NAMED assertion that goes red,
 * because a mutation that only breaks some unrelated thing proves nothing about
 * the assertion that is supposed to guard the rule.
 *
 * This exists because of the studio's most expensive lesson twice over: a probe
 * that cannot fail is not evidence, and a gate nobody has watched fail is
 * decoration. It caught one here already: the first collision assertion asked
 * only how far apart the trains FINISHED, which a sim that lets them overlap
 * and then stops them satisfies perfectly. It is now the closest they ever came.
 *
 * ⛔ Nothing here writes to index.html. Each mutant is a scratch copy and
 * sim.js is pointed at it with WHISTLESTOP_HTML.
 */
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = readFileSync(join(ROOT, 'index.html'), 'utf8');
const dir = mkdtempSync(join(tmpdir(), 'whistlestop-mut-'));
const fails = [];
const say = (ok, line) => { console.log((ok ? '  ok    ' : '  FAIL  ') + line); if (!ok) fails.push(line); };

const MUTANTS = [
  { name: 'joints only merge when they are exactly on top of each other',
    catches: 'the eighth curve closes the ring',
    from: 'MERGE_EPS: 0.12,', to: 'MERGE_EPS: 0.0,' },

  { name: 'a car is worked out from the edge the ENGINE is on, not the route it took',
    catches: 'and every coupling holds its spacing through a curve',
    from: `  var seg = segAt(tr, d), e = g.edges[seg.edge];
  var s = (seg.dir > 0 ? 0 : e.len) + seg.dir * (d - seg.d0);`,
    to: `  var segE = segAt(tr, tr.p), seg = { edge: segE.edge, dir: segE.dir, d0: segE.d0 };
  var e = g.edges[seg.edge];
  var s = (seg.dir > 0 ? 0 : e.len) + seg.dir * (d - seg.d0);` },

  { name: 'every switch is a facing switch, so coming back up an arm obeys the lever',
    catches: 'a train coming back down the straight arm reaches the base with the lever one way',
    from: '    if (from === j.through || from === j.branch) {', to: '    if (false) {' },

  { name: 'a collision stops the trains but leaves them inside each other',
    catches: 'and neither ever got inside the other',
    from: '    t2.p = before[i].p; t2.dir = before[i].dir;', to: '    t2.dir = before[i].dir;' },

  { name: 'a route once recorded is never re-derived, so a thrown lever is ignored',
    catches: 'The Crossing: its own solution gets every train home',
    from: `function validateAhead(g, tr) {
  var i;`, to: `function validateAhead(g, tr) {
  var i;
  if (1) return false;` },

  { name: 'nothing ever snaps, so every piece lands where the finger dropped it',
    catches: 'an end three tenths of a unit away does snap',
    from: '  if (!best) return { x: x, y: y, rot: rot, snapped: false, node: -1, d: 1e9 };',
    to: '  best = null; if (!best) return { x: x, y: y, rot: rot, snapped: false, node: -1, d: 1e9 };' },

  { name: 'a curve is as long as the straight line across it, not the way round',
    catches: 'a curve is a forty five degree arc of the wooden radius',
    from: "    len: CURVE_R_W * (turn < 0 ? -turn : turn) * DEG,",
    to: "    len: len2(pb.x - pa.x, pb.y - pa.y)," },

  { name: 'a shared rug forgets which way round each piece was',
    catches: 'and with every piece back where it was',
    from: "    var r = Math.round(((p.rot / DEG) % 360 + 360) % 360 / 45) & 7;",
    to: "    var r = 0;" },

  { name: 'a shared rug is rebuilt from the rounded numbers without re-snapping',
    catches: 'and every joint on every rebuilt rug is properly closed',
    from: `    var sn = snapPose(g, p.type, p.x, p.y, p.rot);
    out.pieces.push({ type: p.type, x: sn.x, y: sn.y, rot: sn.rot });`,
    to: `    out.pieces.push({ type: p.type, x: p.x, y: p.y, rot: p.rot });` },

  { name: 'a train runs straight past its own station',
    catches: 'The First Switch: its own solution gets every train home',
    from: '      if (len2(nd.x - eng.x, nd.y - eng.y) <= CONFIG.ARRIVE_D * U) {',
    to: '      if (false) {' },

  { name: 'the trains on two separate rings can stop each other through thin air',
    catches: 'and neither ring stops the other',
    from: `function edgesRelated(g, e1, e2) {
  if (e1 === e2) return true;`,
    to: `function edgesRelated(g, e1, e2) {
  if (1) return true;
  if (e1 === e2) return true;` },

  { name: 'a train that hits the buffer keeps going',
    catches: 'and its arc length never once leaves the rails',
    from: "  if (tr.dir > 0 && tr.p > hi) { tr.p = hi; tr.dir = -1; ev.push({ t: 'bump', train: tr }); }",
    to: "  if (false) { tr.p = hi; tr.dir = -1; ev.push({ t: 'bump', train: tr }); }" },

  { name: 'the rules reach for the built in sine nobody has pinned down',
    catches: 'the rules call no maths nobody has pinned down',
    from: 'function dsin(x) {\n  var r = dreduce(x);',
    to: 'function dsin(x) {\n  if (x === 1e99) return Math.sin(x);\n  var r = dreduce(x);' }
];

/* the shipped file first: if THIS is not green the run below says nothing */
function run(path) {
  try {
    const out = execFileSync('node', [join(ROOT, 'sim.js'), '--test'], {
      cwd: ROOT, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024,
      env: Object.assign({}, process.env, { WHISTLESTOP_HTML: path })
    });
    return { code: 0, out };
  } catch (e) { return { code: e.status === undefined ? 1 : e.status, out: (e.stdout || '') + (e.stderr || '') }; }
}
const base = run(join(ROOT, 'index.html'));
say(base.code === 0, 'the shipped rules pass before anything is broken');
if (base.code !== 0) { console.log(base.out.split('\n').slice(-12).join('\n')); process.exit(1); }

for (const m of MUTANTS) {
  if (SRC.indexOf(m.from) < 0) { say(false, 'the mutation has drifted from the code: ' + m.name); continue; }
  const path = join(dir, 'm' + MUTANTS.indexOf(m) + '.html');
  writeFileSync(path, SRC.replace(m.from, m.to));
  const r = run(path);
  const lines = r.out.split('\n').filter(l => l.indexOf('FAIL  ') === 0);
  const caught = lines.some(l => l.indexOf(m.catches) >= 0);
  say(r.code !== 0 && caught, 'when ' + m.name + ', "' + m.catches + '" goes red'
    + (r.code === 0 ? ' (NOTHING WENT RED)' : caught ? ' (' + lines.length + ' red)' : ' (red, but not that one: '
      + lines.slice(0, 2).map(l => l.slice(6, 70)).join(' | ') + ')'));
}
rmSync(dir, { recursive: true, force: true });
console.log('');
if (fails.length) { console.log(fails.length + ' MUTANT(S) SURVIVED'); process.exit(1); }
console.log('MUTANTS OK');

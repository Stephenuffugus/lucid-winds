/**
 * The opponent has to think inside the time a person will wait.
 *
 *   node test/ai_budget.mjs [turns]
 *
 * ⛔ GATED ON COUNTS AND RATIOS, NEVER ON A BARE MILLISECOND. This box has two
 * cores and an absolute threshold near the noise floor is a coin toss; a gate
 * that reports a failure on passing code teaches you to ignore gates. So the
 * assertions are: every turn evaluated at least eight candidates, and every turn
 * finished inside 1.1 times its own deadline. Both survive a slow machine,
 * because a slow machine makes the planner cut candidates rather than run late.
 *
 * Watched to fail by dropping the deadline to 50 ms, which starves the candidate
 * count without making anything late.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { initPhysics, createWorld, disposeWorld, addSurface, addMarble } from '../src/core/physics.js?v=20260905a';
import { makeStreams } from '../src/core/rng.js?v=20260905a';
import { STARTER_ENTRIES, CROSS_MIX } from '../src/core/marbleBody.js?v=20260905a';
import { plan } from '../src/game/ai.js?v=20260905a';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const T = JSON.parse(readFileSync(join(ROOT, 'src/data/tuning.json'), 'utf8'));
const TURNS = parseInt(process.argv[2] || '100', 10);
const DEADLINE = process.argv[3] ? parseInt(process.argv[3], 10) : null;

await initPhysics();

function scene(seed) {
  const W = createWorld(T, { ringRadius: T.ringer.ringRadius });
  addSurface(W, { kind: 'dirt', box: { hx: 30, hy: 0.05, hz: 30 }, pos: { x: 0, y: -0.05, z: 0 } });
  const sp = T.ringer.crossSpacing;
  const mibs = [];
  let k = 0;
  const rng = makeStreams(seed);
  for (let i = -3; i <= 3; i++) {
    mibs.push(addMarble(W, STARTER_ENTRIES[CROSS_MIX[k % CROSS_MIX.length]], { x: i * sp, z: 0 })); k++;
    if (i !== 0) { mibs.push(addMarble(W, STARTER_ENTRIES[CROSS_MIX[k % CROSS_MIX.length]], { x: 0, z: i * sp })); k++; }
  }
  // the taw somewhere on the ring edge, so the turns are not all the same shot
  const a = rng.match.next() * Math.PI * 2;
  const taw = addMarble(W, STARTER_ENTRIES.taw_clearie,
    { x: Math.sin(a) * T.ringer.ringRadius, z: Math.cos(a) * T.ringer.ringRadius });
  return { W, mibs, taw, rng };
}

const fails = [];
let minCand = 1e9, maxRatio = 0, sumMs = 0, sumCand = 0;
const t0 = Date.now();
for (let i = 0; i < TURNS; i++) {
  const { W, mibs, taw, rng } = scene(7000 + i);
  const opts = { difficulty: 'shark', taw, mibs, rng: rng.ai, tuning: T };
  if (DEADLINE) opts.deadlineMs = DEADLINE;
  const r = plan(W, opts);
  const ratio = r.elapsedMs / r.deadlineMs;
  if (r.evaluated < minCand) minCand = r.evaluated;
  if (ratio > maxRatio) maxRatio = ratio;
  sumMs += r.elapsedMs; sumCand += r.evaluated;
  if (r.evaluated < 8) fails.push('turn ' + i + ': only ' + r.evaluated + ' candidates evaluated');
  if (ratio > 1.1) fails.push('turn ' + i + ': took ' + r.elapsedMs.toFixed(0) + ' ms against a '
    + r.deadlineMs + ' ms deadline, ratio ' + ratio.toFixed(2));
  disposeWorld(W);
}
const wall = (Date.now() - t0) / 1000;

console.log('turns            ' + TURNS + ' Shark turns in ' + wall.toFixed(1) + ' s');
console.log('candidates       ' + (sumCand / TURNS).toFixed(1) + ' mean, ' + minCand + ' worst (the floor is 8)');
console.log('think time       ' + (sumMs / TURNS).toFixed(0) + ' ms mean against a ' + (DEADLINE || T.ai.deadlineMs) + ' ms deadline');
console.log('worst ratio      ' + maxRatio.toFixed(2) + ' of the deadline (the ceiling is 1.10)');

if (fails.length) {
  console.log('\n' + fails.length + ' problem' + (fails.length > 1 ? 's' : '') + ', first few:');
  for (const f of fails.slice(0, 6)) console.log('  ' + f);
  console.log('AI BUDGET FAILED');
  process.exit(1);
}
console.log('\nAI BUDGET OK');

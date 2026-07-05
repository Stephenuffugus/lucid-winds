/* Structural + invariant validation of the passive tree and progression.
 * Asserts: full tree connectivity, valid race starts, refund-connectivity invariant
 * (0 violations across many fuzzed allocations), and a non-degenerate balance spread.
 * Usage: node test/validate.js [path-to-html]
 */
const { loadGame, frontier, randomOC } = require('./harness-core');
const API = loadGame();
const TREE = API.TREE;
let ok = true;
const assert = (name, cond, extra) => { console.log((cond ? '  ok  ' : ' FAIL ') + name + (extra ? '  ' + extra : '')); if (!cond) ok = false; };

/* 1) connectivity from hub */
const seen = new Set(['hub']), q = ['hub'];
while (q.length) { const c = q.shift(); for (const nb of TREE.byId[c].neighbors) if (!seen.has(nb)) { seen.add(nb); q.push(nb); } }
const unreached = TREE.nodes.filter(n => !seen.has(n.id));
assert('tree fully connected from hub', unreached.length === 0,
  `nodes=${TREE.nodes.length} edges=${TREE.edges.length} unreachable=${unreached.length}`);
if (unreached.length) console.log('   ->', unreached.map(n => n.id).slice(0, 10));

/* 2) race starts valid + connected */
let startOK = true;
for (const r of API.RACES) { const s = TREE.startByRace[r.key]; if (!TREE.byId[s] || !seen.has(s)) { startOK = false; console.log('   bad start', r.key, s); } }
assert('all race start nodes valid & connected', startOK);

/* 3) node/keystone inventory */
const types = {}; TREE.nodes.forEach(n => types[n.type] = (types[n.type] || 0) + 1);
const keys = TREE.nodes.filter(n => n.type === 'keystone').map(n => n.keystone);
console.log('  info  node types:', JSON.stringify(types));
console.log('  info  keystones :', keys.join(', '));
assert('has >= 6 keystones', keys.length >= 6);
assert('has >= 12 notables', (types.notable || 0) >= 12);

/* 4) refund-connectivity invariant fuzz */
let refundViolations = 0, refundTests = 0;
for (let t = 0; t < 400; t++) {
  const race = API.pick(API.RACES).key;
  const oc = { id: 'x', race, baseStats: { str: 50, dur: 50, sta: 50, int: 50, spd: 50, cmb: 50 }, powers: [], record: { w: 0, l: 0 }, level: 40, xp: 0, tree: { allocated: [] } };
  API.migrateOC(oc);
  const alloc = new Set(oc.tree.allocated);
  for (let i = 0; i < API.pointsTotal(oc); i++) { const f = frontier(TREE, alloc); if (!f.length) break; alloc.add(API.pick(f)); }
  oc.tree.allocated = [...alloc];
  const start = TREE.startByRace[race];
  for (const id of oc.tree.allocated) {
    if (id === start) continue; refundTests++;
    if (API.canRefund(oc, id)) {
      const remain = new Set(oc.tree.allocated.filter(x => x !== id));
      const s2 = new Set([start]), q2 = [start];
      while (q2.length) { const c = q2.shift(); for (const nb of TREE.byId[c].neighbors) if (remain.has(nb) && !s2.has(nb)) { s2.add(nb); q2.push(nb); } }
      for (const rr of remain) if (!s2.has(rr)) { refundViolations++; break; }
    }
  }
}
assert('refund never disconnects the web', refundViolations === 0, `tests=${refundTests} violations=${refundViolations}`);

/* 5) progression math sanity */
assert('xpNeeded strictly increasing', [...Array(50)].every((_, i) => i < 2 || API.xpNeeded(i) > API.xpNeeded(i - 1)));
assert('pointsAvail never negative on fresh OC', (() => {
  for (let i = 0; i < 50; i++) { const oc = randomOC(API, { level: API.randInt(1, 50), noTree: true }); if (API.pointsAvail(oc) < 0) return false; } return true;
})());

/* 6) balance spread (non-degenerate) */
function alloc(oc) { const a = new Set(oc.tree.allocated); for (let i = 0; i < API.pointsTotal(oc); i++) { const f = frontier(TREE, a); if (!f.length) break; a.add(API.pick(f)); } oc.tree.allocated = [...a]; }
const squad = []; for (let i = 0; i < 8; i++) { const oc = randomOC(API, { level: 30, noTree: true }); alloc(oc); squad.push(oc); }
const wins = squad.map(() => 0);
for (let i = 0; i < squad.length; i++) for (let j = 0; j < squad.length; j++) {
  if (i === j) continue; let iw = 0;
  for (let k = 0; k < 11; k++) if (API.simulate(squad[i], squad[j]).winnerIsA) iw++;
  if (iw >= 6) wins[i]++;
}
console.log('  info  balance round-robin (matchups won of 7):', wins.join(' '));
assert('balance is not fully degenerate', !(wins.every(w => w === 0) || wins.every(w => w === 7)));

console.log(ok ? '\n✅ validation passed' : '\n❌ validation FAILED');
process.exit(ok ? 0 : 1);

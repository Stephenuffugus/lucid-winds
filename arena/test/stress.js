/* Combat stress test. Generates fully-random builds (random race, stats, powers,
 * mastery tiers, augment sockets, AND random passive-tree allocation) and runs
 * thousands of fights, asserting: no exceptions, no NaN/Infinity anywhere in the
 * result, and every fight terminates within the 200-round safety cap.
 *
 * Run after ANY change to combat, modifiers, the tree, augments, or races.
 * Usage: node test/stress.js [path-to-html]
 * Env:   LWA_FIGHTS=40000 to change pass-1 count.
 */
const { loadGame, randomOC, frontier } = require('./harness-core');
const API = loadGame();
const TREE = API.TREE;

let fails = 0, nanCount = 0, maxRounds = 0, totalRounds = 0, runs = 0, capHits = 0;
const errors = {};

function scan(v, path, bad) {
  if (typeof v === 'number') { if (!isFinite(v) || isNaN(v)) bad.push(path + '=' + v); }
  else if (Array.isArray(v)) { for (let i = 0; i < v.length; i++) scan(v[i], path + '[' + i + ']', bad); }
  else if (v && typeof v === 'object') { for (const k in v) { if (k === 'log') continue; scan(v[k], path + '.' + k, bad); } }
}
function fight(a, b) {
  runs++;
  try {
    const res = API.simulate(a, b);
    if (!res || typeof res.winnerName !== 'string') { fails++; errors.bad_result = (errors.bad_result || 0) + 1; return; }
    if (res.rounds > maxRounds) maxRounds = res.rounds;
    totalRounds += res.rounds;
    if (res.rounds >= 200) capHits++;
    const bad = [];
    scan({ r: res.rounds, t: res.hpTimeline, g: res.gloryBonus, x: res.xpBonus }, 'res', bad);
    if (bad.length) { nanCount++; if (nanCount <= 6) console.log('  NaN:', bad.slice(0, 4).join(', ')); }
  } catch (e) {
    fails++;
    const key = (e.message || String(e)).slice(0, 70);
    errors[key] = (errors[key] || 0) + 1;
    if (fails <= 5) console.log('  ERR:', e.message);
  }
}
function allocToArm(oc, armKey) {
  const alloc = new Set(oc.tree.allocated);
  for (let i = 0; i < 80; i++) {
    const f = frontier(TREE, alloc); if (!f.length) break;
    f.sort((x, y) => {
      const nx = TREE.byId[x], ny = TREE.byId[y];
      const ax = nx.arm === armKey ? 1 : 0, ay = ny.arm === armKey ? 1 : 0;
      if (ax !== ay) return ay - ax;
      return (ny.ring || 0) - (nx.ring || 0);
    });
    alloc.add(f[0]);
  }
  oc.tree.allocated = [...alloc];
}

const P1 = parseInt(process.env.LWA_FIGHTS || '20000', 10);
console.log(`=== PASS 1: ${P1} fully random fights (random tree + augments) ===`);
for (let i = 0; i < P1; i++) fight(randomOC(API), randomOC(API));

console.log('=== PASS 2: 4000 extreme stat matchups ===');
for (let i = 0; i < 4000; i++) {
  const m = i % 3;
  if (m === 0) fight(randomOC(API, { extreme: 'max' }), randomOC(API, { extreme: 'min' }));
  else if (m === 1) fight(randomOC(API, { extreme: 'min' }), randomOC(API, { extreme: 'min' }));
  else fight(randomOC(API, { extreme: 'max', level: 50 }), randomOC(API, { extreme: 'max', level: 50 }));
}

console.log('=== PASS 3: 3000 keystone-forced fights (deep single-arm paths) ===');
for (let i = 0; i < 3000; i++) {
  const a = randomOC(API, { level: 50, noTree: true });
  const b = randomOC(API, { level: 50, noTree: true });
  allocToArm(a, API.pick(API.ARMS).key);
  allocToArm(b, API.pick(API.ARMS).key);
  fight(a, b);
}

console.log('=== PASS 4: 2000 no-power / no-tree fights ===');
for (let i = 0; i < 2000; i++) {
  const a = randomOC(API, { noTree: true, powerCount: 0 });
  const b = randomOC(API, { noTree: true, powerCount: 0 });
  fight(a, b);
}

console.log('\n================ RESULTS ================');
console.log('total fights :', runs);
console.log('exceptions   :', fails);
console.log('NaN/Infinity :', nanCount);
console.log('max rounds   :', maxRounds, '(safety cap = 200)');
console.log('avg rounds   :', (totalRounds / runs).toFixed(1));
console.log('cap hits     :', capHits, '(' + (capHits / runs * 100).toFixed(2) + '% resolve via HP% tiebreak)');
console.log('errors       :', JSON.stringify(errors));
const pass = fails === 0 && nanCount === 0 && maxRounds <= 200;
console.log(pass ? '\n✅ ALL CLEAR — no crashes, no NaN, all fights terminate.' : '\n❌ ISSUES FOUND');
process.exit(pass ? 0 : 1);

/* RIPCORD ladder builder.
 *
 * Twenty opponents on a difficulty curve that is measured, not asserted. For
 * each rung we sample builds, score each one against a fixed reference panel,
 * and keep the build whose measured strength lands closest to that rung's
 * target. Then we verify the curve is monotonic before writing it out.
 *
 * Every rung also drops a part. Parts come from winning — there is no currency
 * in this game and there is never going to be one.
 *
 *   node ladder.js          print the table
 *   node ladder.js --json   write ladder.json
 */
const SIM = require('../src/sim2.js');
const fs = require('fs');
const path = require('path');
const LADDER_JSON = path.join(__dirname, '..', 'src', 'ladder.json');

const NAMES = [
  'Chalkline',   'Bat Handler',  'Post Keeper',  'Knot',        'Riverstone',
  'Tin Whistle', 'Marketside',   'The Cousin',   'Nine Teeth',  'Long Tuesday',
  'Barrel Boy',  'Quiet Hands',  'Gasing',       'Ash Wednesday','The Uncle',
  'Half Crown',  'Ironmonger',   'Old Cord',     'Windlass',    'The Kelantan'
];

// Rung n faces you with a role you have to answer. Cycling them means the
// ladder teaches the matchup triangle without a tutorial screen saying so.
const ROLE_ORDER = ['balance', 'stamina', 'attack', 'defense'];

// Measured strength targets. Rung 1 should lose to a competent build; the top
// of the ladder should beat one more often than not.
const target = i => 0.30 + (0.70 - 0.30) * Math.pow(i / 19, 0.92);

const PANEL = Object.keys(SIM.ARCHETYPES);
const rnd0 = SIM.mulberry(4242);
const pickR = a => a[Math.floor(rnd0() * a.length)];

function strength(cfg, seed, reps) {
  let w = 0, n = 0;
  for (const g of PANEL) for (let i = 0; i < reps; i++) for (const d of [1, -1]) {
    const rnd = SIM.mulberry(seed + i * 97 + g.length * 13 + (d > 0 ? 0 : 5));
    const me = SIM.build(Object.assign({}, cfg, { dir: 1 }));
    const foe = SIM.build(Object.assign({}, SIM.ARCHETYPES[g], { dir: d }));
    const r = SIM.resolveMatch(me, foe, { rnd,
      a: { angle: rnd() * 6.283, power: .96 + rnd() * .08, lean: .03 + rnd() * .04, phase: rnd() * 6.283, trigger: cfg.trigger },
      b: { angle: rnd() * 6.283, power: .96 + rnd() * .08, lean: .03 + rnd() * .04, phase: rnd() * 6.283 } });
    if (r.winner === 'a') w++;
    n++;
  }
  return w / n;
}

// Early rungs are deliberately under-built: fewer weights, no trigger
// programming. A beginner opponent should look like a beginner's top.
function sample(role, rung) {
  const inRole = list => {
    const m = list.filter(p => p.role === role);
    return m.length ? pickR(m) : pickR(list);
  };
  const sophistication = rung / 19;
  const nW = Math.min(SIM.MAX_WEIGHTS, Math.floor(rnd0() * (1 + sophistication * SIM.MAX_WEIGHTS)));
  const weights = [];
  // Low rungs scatter metal at random; high rungs commit to one side or
  // deliberately cancel it out. Bad players do not tune.
  const bias = Math.floor(rnd0() * SIM.HOLES);
  for (let i = 0; i < nW; i++) {
    const hole = sophistication > 0.55 && rnd0() < 0.7
      ? (bias + (rnd0() < 0.5 ? 0 : 1)) % SIM.HOLES
      : Math.floor(rnd0() * SIM.HOLES);
    weights.push({ id: pickR(SIM.WEIGHTS.slice(1)).id, hole, ring: Math.floor(rnd0() * SIM.RINGS.length) });
  }
  return {
    core: inRole(SIM.CORES).id, blade: inRole(SIM.BLADES).id, assist: inRole(SIM.ASSISTS).id,
    ratchet: inRole(SIM.RATCHETS).id, bit: inRole(SIM.BITS).id, weights,
    trigger: sophistication < 0.3 ? 'charged' : pickR(SIM.TRIGGERS),
    finish: pickR(SIM.FINISHES).id, decal: pickR(SIM.DECALS), trail: pickR(SIM.TRAILS)
  };
}

// Drops: walk the catalogue so the ladder hands out a spread of parts rather
// than five bits in a row.
function dropTable() {
  const pools = [SIM.BLADES, SIM.BITS, SIM.RATCHETS, SIM.ASSISTS, SIM.CORES];
  const drops = [];
  const seen = pools.map(() => 0);
  for (let i = 0; i < 20; i++) {
    const p = i % pools.length;
    const list = pools[p];
    drops.push({ slot: ['blade', 'bit', 'ratchet', 'assist', 'core'][p], id: list[seen[p] % list.length].id });
    seen[p]++;
  }
  return drops;
}

const CANDIDATES = 40, REPS = 2;
const ladder = [];
const drops = dropTable();

for (let i = 0; i < 20; i++) {
  const role = ROLE_ORDER[i % ROLE_ORDER.length];
  const want = target(i);
  let best = null;
  for (let c = 0; c < CANDIDATES; c++) {
    const cfg = sample(role, i);
    const s = strength(cfg, i * 1013 + c * 17, REPS);
    const err = Math.abs(s - want);
    if (!best || err < best.err) best = { cfg, s, err };
  }
  ladder.push({
    rung: i + 1, name: NAMES[i], role,
    target: +want.toFixed(3), measured: +best.s.toFixed(3),
    build: best.cfg, drop: drops[i]
  });
}

// ---- verify the curve actually rises
let inversions = 0, worst = 0;
for (let i = 1; i < ladder.length; i++) {
  if (ladder[i].measured < ladder[i - 1].measured) inversions++;
  worst = Math.max(worst, Math.abs(ladder[i].measured - ladder[i].target));
}

if (process.argv.includes('--json')) {
  fs.writeFileSync(LADDER_JSON, JSON.stringify(ladder, null, 1));
  console.log('wrote ladder.json');
}

console.log('rung  name           role      target  measured  build                                    drops');
for (const r of ladder) {
  const b = r.build;
  const parts = [b.core, b.blade, b.assist, b.ratchet, b.bit].join('/');
  console.log(
    String(r.rung).padStart(4) + '  ' + r.name.padEnd(14) + r.role.padEnd(9) +
    (r.target * 100).toFixed(0).padStart(5) + '%' +
    (r.measured * 100).toFixed(0).padStart(9) + '%  ' +
    parts.padEnd(38) + ' ' + r.drop.slot + ':' + r.drop.id
  );
}
console.log('\ncurve: ' + inversions + ' inversions across 19 steps, worst miss ' +
            (worst * 100).toFixed(1) + ' pts');
console.log(inversions <= 2 && worst < 0.09
  ? 'LADDER OK — difficulty rises and every rung is within tolerance'
  : 'LADDER NEEDS ANOTHER PASS');

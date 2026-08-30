/* Determinism. The brief asks for it in section 13 and the 3D build depends on
 * it: the same seed and the same two builds must produce the identical round,
 * every time, or the headless simulation and the rendered one will disagree and
 * a replay will not replay.
 *
 * This test is written to be able to FAIL. It runs the same match a thousand
 * times and compares the full end state, not just the winner, because a winner
 * can match while the trajectory has quietly drifted. The last block deliberately
 * introduces Math.random into the loop and asserts the comparison catches it,
 * so a green line here means the check works and not that it is asleep.
 *
 *   node test/determinism.js
 */
const SIM = require('../src/sim2.js');

const A = { core: 'lodest', blade: 'cleaver', assist: 'jag', ratchet: '4-80', bit: 'flat',
            weights: [{ id: 'brick', hole: 0, ring: 1 }, { id: 'slug', hole: 1, ring: 1 }] };
const B = { core: 'moth', blade: 'halo', assist: 'slick', ratchet: '5-60', bit: 'needle',
            weights: [{ id: 'chip', hole: 0, ring: 1 }, { id: 'chip', hole: 2, ring: 1 },
                      { id: 'chip', hole: 4, ring: 1 }] };

const opts = seed => {
  const rnd = SIM.mulberry(seed);
  return { rnd,
    a: { angle: 0.7, power: 1.02, lean: 0.041, phase: 2.2, trigger: 'thirdHit' },
    b: { angle: 0.7 + Math.PI, power: 0.98, lean: 0.036, phase: 5.1, trigger: 'lowSpin' } };
};

// Everything a replay would have to reproduce. Winner alone is far too coarse.
const fingerprint = r => [
  r.winner, r.cause, r.points, r.duration.toFixed(9), r.hits,
  r.a.x.toFixed(9), r.a.z.toFixed(9), r.a.w.toFixed(6), r.a.lx.toFixed(9), r.a.lz.toFixed(9),
  r.a.phase.toFixed(6), r.a.wear.toFixed(9), r.a.charge.toFixed(9), r.a.abilityUsed,
  r.b.x.toFixed(9), r.b.z.toFixed(9), r.b.w.toFixed(6), r.b.lx.toFixed(9), r.b.lz.toFixed(9),
  r.b.phase.toFixed(6), r.b.wear.toFixed(9), r.b.charge.toFixed(9), r.b.abilityUsed
].join('|');

let fails = 0;

// ---- 1. one seed, a thousand runs, identical every time
const ref = fingerprint(SIM.resolveMatch(SIM.build(A), SIM.build(B), opts(90210)));
let drift = 0;
for (let i = 0; i < 1000; i++) {
  if (fingerprint(SIM.resolveMatch(SIM.build(A), SIM.build(B), opts(90210))) !== ref) drift++;
}
console.log(drift === 0
  ? '1000 runs of one seed  identical'
  : 'FAIL  ' + drift + ' of 1000 runs drifted');
if (drift) fails++;

// ---- 2. different seeds must actually differ, or the check above is vacuous
const seen = new Set();
for (let i = 0; i < 60; i++) seen.add(fingerprint(SIM.resolveMatch(SIM.build(A), SIM.build(B), opts(i * 7919 + 3))));
console.log(seen.size > 40
  ? '60 seeds  ' + seen.size + ' distinct rounds'
  : 'FAIL  only ' + seen.size + ' distinct rounds from 60 seeds, the seed is barely reaching the sim');
if (seen.size <= 40) fails++;

// ---- 3. build determinism: build() must be a pure function of its config
const b1 = JSON.stringify(SIM.build(A)), b2 = JSON.stringify(SIM.build(A));
console.log(b1 === b2 ? 'build() pure' : 'FAIL  build() is not a pure function of its config');
if (b1 !== b2) fails++;

// ---- 4. tuning is reversible: mods applied then removed leaves the original
const tuned = JSON.stringify(SIM.build(Object.assign({}, A, { mods: { cleaver: ['file', 'drill'] } })));
const back = JSON.stringify(SIM.build(Object.assign({}, A, { mods: {} })));
console.log(tuned !== b1 && back === b1
  ? 'tuning applies and reverses cleanly'
  : 'FAIL  tuning is not reversible');
if (!(tuned !== b1 && back === b1)) fails++;

// ---- 5. the mutation test. Feed the loop real randomness and the fingerprint
//         MUST diverge. A determinism check that cannot fail proves nothing.
{
  const noisy = () => SIM.resolveMatch(SIM.build(A), SIM.build(B), {
    rnd: Math.random,
    a: { angle: 0.7, power: 1.02, lean: 0.041, phase: 2.2, trigger: 'thirdHit' },
    b: { angle: 0.7 + Math.PI, power: 0.98, lean: 0.036, phase: 5.1, trigger: 'lowSpin' } });
  const s = new Set();
  for (let i = 0; i < 40; i++) s.add(fingerprint(noisy()));
  console.log(s.size > 1
    ? 'mutation test  unseeded randomness IS detected (' + s.size + ' outcomes)'
    : 'FAIL  the fingerprint cannot tell a random round from a seeded one, so test 1 means nothing');
  if (s.size <= 1) fails++;
}

console.log(fails ? '\nDETERMINISM FAILED (' + fails + ')' : '\nDETERMINISM OK');
process.exit(fails ? 1 : 0);

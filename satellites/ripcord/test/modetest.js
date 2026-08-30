/* modetest — the three extra modes each need their own pacing targets, because
 * "it runs" is not the same as "it is worth playing".
 *
 * The point of keeping Uri, Taya and the target range is that they reward
 * DIFFERENT builds. If the top that wins the striking match also wins the
 * endurance one, then stamina parts are dead weight and the mode is decoration
 * with extra steps. So the important assertion in here is not a duration, it is
 * that the ranking of the four archetypes changes between modes.
 *
 *   node test/modetest.js [reps]
 */
const SIM = require('../src/sim2.js');

const REPS = parseInt(process.argv[2] || '40', 10);
const NAMES = Object.keys(SIM.ARCHETYPES);
const spec = n => SIM.build(SIM.ARCHETYPES[n]);
const pct = x => (x * 100).toFixed(1).padStart(5);
const median = a => { const b = a.slice().sort((x, y) => x - y); return b[Math.floor(0.5 * (b.length - 1))]; };
const fails = [];

/* ---------------------------------------------------------------- PANGKAH */
/* Measured here only so the other modes have something to be different from. */
const pangkah = {};
for (const A of NAMES) {
  let w = 0, n = 0;
  for (const B of NAMES) for (let i = 0; i < REPS; i++) {
    const rnd = SIM.mulberry(i * 7919 + A.length * 31 + B.length * 17);
    const r = SIM.resolveMatch(spec(A), spec(B), { rnd,
      a: { power: .96 + rnd() * .08, lean: .03 + rnd() * .04, phase: rnd() * 6.283 },
      b: { power: .96 + rnd() * .08, lean: .03 + rnd() * .04, phase: rnd() * 6.283 } });
    if (r.winner === 'a') w++;
    n++;
  }
  pangkah[A] = w / n;
}

/* -------------------------------------------------------------------- URI */
const uri = {}, uriDur = [];
for (const A of NAMES) {
  let w = 0, n = 0;
  for (const B of NAMES) for (let i = 0; i < REPS; i++) {
    const rnd = SIM.mulberry(i * 104729 + A.length * 13 + B.length * 7);
    const r = SIM.resolveUri(spec(A), spec(B), { rnd,
      a: { power: .96 + rnd() * .08, lean: .03 + rnd() * .04 },
      b: { power: .96 + rnd() * .08, lean: .03 + rnd() * .04 } });
    if (r.winner === 'a') w++;
    n++;
    uriDur.push(r.duration);
  }
  uri[A] = w / n;
}
const uriMed = median(uriDur);

console.log('               pangkah    uri     rank change');
const pRank = NAMES.slice().sort((a, b) => pangkah[b] - pangkah[a]);
const uRank = NAMES.slice().sort((a, b) => uri[b] - uri[a]);
for (const n of NAMES)
  console.log('  ' + n.padEnd(12) + pct(pangkah[n]) + '%  ' + pct(uri[n]) + '%   ' +
    (pRank.indexOf(n) + 1) + ' to ' + (uRank.indexOf(n) + 1));
console.log('\nuri round median ' + uriMed.toFixed(1) + 's');

if (uriMed < 12 || uriMed > 45) fails.push('uri median ' + uriMed.toFixed(1) + 's, outside 12 to 45');
// The load bearing assertion: the endurance mode must not have the same answer.
let moved = 0;
for (const n of NAMES) if (pRank.indexOf(n) !== uRank.indexOf(n)) moved++;
if (moved < 2) fails.push('uri ranks the archetypes the same way pangkah does, so it rewards nothing new');
// And specifically: the stamina build must beat the attack build at endurance.
{
  let w = 0;
  for (let i = 0; i < REPS * 4; i++) {
    const rnd = SIM.mulberry(i * 31337);
    const r = SIM.resolveUri(spec('stamina'), spec('attack'), { rnd });
    if (r.winner === 'a') w++;
  }
  const rate = w / (REPS * 4);
  console.log('stamina against attack at uri: ' + pct(rate) + '%   (at pangkah it is ' +
              pct(pangkah.stamina) + '% overall)');
  if (rate < 0.70) fails.push('stamina beats attack at uri only ' + pct(rate) +
    ' percent, the endurance mode is not rewarding endurance');
}

/* ------------------------------------------------------------------- TAYA */
/* The free strike is a STAKE, not a kill. A clean top must survive it; a top
 * that has already been worked over must not. */
{
  let clean = 0, worn = 0, wears = [];
  for (let i = 0; i < REPS * 4; i++) {
    const rnd = SIM.mulberry(i * 9176);
    const A = NAMES[i % 4], B = NAMES[(i * 3 + 1) % 4];
    const a = SIM.resolveTaya(spec(A), spec(B), { rnd, carryWear: 0 });
    const b = SIM.resolveTaya(spec(A), spec(B), { rnd: SIM.mulberry(i * 9176), carryWear: 0.72 });
    if (a.burst) clean++;
    if (b.burst) worn++;
    wears.push(a.wear);
  }
  const n = REPS * 4;
  console.log('\ntaya free strike');
  console.log('  bursts a clean top      ' + pct(clean / n) + '%   (must stay under 15)');
  console.log('  bursts a worn top       ' + pct(worn / n) + '%   (must be over 55)');
  console.log('  wear from one strike    ' + median(wears).toFixed(3));
  if (clean / n > 0.15) fails.push('taya bursts a clean top ' + pct(clean / n) +
    ' percent of the time, winning one round should not win the next');
  if (worn / n < 0.55) fails.push('taya barely finishes a worn top, so the free strike carries no stake');
}

/* ------------------------------------------------------------------ RANGE */
{
  const scores = [], hits = [];
  for (let i = 0; i < REPS * 4; i++) {
    const rnd = SIM.mulberry(i * 5501);
    const me = spec(NAMES[i % 4]);
    let total = 0, hit = 0;
    for (let shot = 0; shot < SIM.MODES.range.shots; shot++) {
      const aim = (i * 0.37 + shot * 1.13) % 6.283;
      const r = SIM.resolveRangeShot(me, aim, 0.94 + (shot % 3) * 0.05, { rnd });
      total += r.score; if (r.hit) hit++;
    }
    scores.push(total); hits.push(hit / SIM.MODES.range.shots);
  }
  const med = median(scores), hitRate = hits.reduce((a, b) => a + b, 0) / hits.length;
  console.log('\ntarget range over ' + SIM.MODES.range.shots + ' shots');
  console.log('  median score            ' + med + '   (must land between 4 and 26)');
  console.log('  shots that hit anything ' + pct(hitRate) + '%   (must be over 40)');
  if (med < 4 || med > 26) fails.push('range median score ' + med + ', outside 4 to 26');
  if (hitRate < 0.40) fails.push('only ' + pct(hitRate) + ' percent of range shots hit anything, which is frustrating');
}

/* ------------------------------------------------------------------ FIELD */
/* The Field's whole claim is that it tracks the player. "It generates an
 * opponent" is not that claim; the test has to show that a different player gets
 * a different opponent, and that the one it picks is near the target it was
 * asked for. */
{
  console.log('\nthe Field');
  const targets = [0.30, 0.45, 0.60, 0.75];
  let worst = 0;
  const hit = [];
  for (const t of targets) {
    const errs = [];
    for (let i = 0; i < 6; i++) {
      const rnd = SIM.mulberry(i * 4441 + Math.round(t * 1000));
      const p = SIM.fieldOpponent(rnd, t, i * 7919, 12);
      errs.push(Math.abs(p.strength - t));
    }
    const mean = errs.reduce((a, b) => a + b, 0) / errs.length;
    worst = Math.max(worst, mean);
    hit.push({ t, mean });
    console.log('  asked for ' + pct(t) + '%   missed by ' + (mean * 100).toFixed(1) + ' pts on average');
  }
  if (worst > 0.10) fails.push('the Field misses its target by ' + (worst * 100).toFixed(1) +
    ' points, so it is not building to the player it was told about');

  /* And it has to MOVE. A weak player and a strong one must not meet the same
   * opponents, or the mode is a random generator with a target parameter it
   * ignores. */
  const weakCfg = { core: 'moth', blade: 'halo', assist: 'none', ratchet: '0-70', bit: 'taper', weights: [] };
  const strongCfg = SIM.ARCHETYPES.stamina;
  const weak = SIM.strengthOf(weakCfg, 4242, 2);
  const strong = SIM.strengthOf(strongCfg, 4242, 2);
  const forWeak = SIM.fieldOpponent(SIM.mulberry(11), weak, 5501, 12).strength;
  const forStrong = SIM.fieldOpponent(SIM.mulberry(11), strong, 5501, 12).strength;
  console.log('  a ' + pct(weak) + '% player is offered a ' + pct(forWeak) + '% opponent');
  console.log('  a ' + pct(strong) + '% player is offered a ' + pct(forStrong) + '% opponent');
  if (!(forStrong > forWeak + 0.05))
    fails.push('the Field offers the same opponent to a weak player and a strong one, ' +
      'so it is not tracking anybody');
}

console.log(fails.length ? '\nMODETEST FAILED\n  ' + fails.join('\n  ') : '\nMODETEST OK');
process.exit(fails.length ? 1 : 0);

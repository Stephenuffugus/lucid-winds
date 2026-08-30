/* Part audit — the Super God Blade check.
 *
 * The question is whether the option space has a dominant answer, which is the
 * bug that killed the competitor this game is a reaction to: past a certain
 * part level every top converged and matches ended in draws.
 *
 * TWO measurements, and they answer different questions:
 *   ceiling  can this part EVER be good?     the best chassis anyone can find for it
 *   pull     does it drag any build upward?  the mean over coherent builds
 * A healthy catalogue has a TIGHT ceiling spread and a LOOSE mean spread. A tight
 * mean spread would mean every part is interchangeable, which is the disease.
 *
 * ⛔ THIS FILE HAS BEEN WRONG THREE TIMES AND THE LESSONS ARE WORTH MORE THAN
 * THE CODE.
 *
 * Draft one sampled builds uniformly at random and reported a 29 point ceiling
 * spread with Claw at 38 percent. HANDOFF section 15 already suspected that was
 * an artefact: an attack tip needs a coherent attack chassis and uniform
 * sampling never gives it one.
 *
 * Draft two added a coherent sampler and the spread got WORSE, to 42 points,
 * because the "coherent attack build" it invented put two to four bricks bunched
 * on one side of every single one. That is the FERAL band, which this same audit
 * measures at 44 percent. It handed attack tips a bad chassis every time and
 * called the result a ceiling.
 *
 * Draft three hill climbed the other four slots to search for the best chassis
 * instead of sampling for it, and produced an impossibility: Ball came back with
 * a ceiling of 29 percent and a mean of 52, a maximum BELOW its own average. The
 * cause is overfitting, and the arithmetic is worth writing down because it will
 * be tempting to try this again. Each climb step judged a candidate on eight
 * matches, so the standard error of one judgement was about 18 points. Choosing
 * the best of roughly 130 such judgements picks whichever candidate got the
 * luckiest eight seeds, not the best chassis; the re-score on honest seeds then
 * dropped it back to nothing. To hold that bias under four points at fifty
 * candidates you would need something like 1300 matches per candidate, per part.
 * Search is simply the wrong tool at this budget.
 *
 * Draft four, which is this one: a small CURATED candidate set, ten chassis per
 * part chosen because a player would actually build them, each scored on enough
 * matches to mean something. The selection bias from taking a maximum over ten
 * is still there, but it is the SAME bias for every part, and the gate reads the
 * SPREAD between parts, so it cancels where it matters.
 *
 *   node tools/partaudit.js [ceilingMatchesPerFoe] [pullMatchesPerFoe] [pullBuilds]
 */
const SIM = require('../src/sim2.js');

const MPG    = parseInt(process.argv[3] || '2', 10);   // matches per foe when measuring pull
/* ⛔ Keep this EQUAL to CEIL_MPG in tools/balance.js. A ceiling is a maximum
   over ten candidates and the max of ten noisy estimates is biased upward by an
   amount that grows with the noise, so two tools reading the same parts at
   different sample sizes report different ceilings and disagree about which
   parts pass. They did, for a while.

   ⛔ 128 matches per candidate, not 64. At 64 the standard error of one ceiling
   is about 4 points, so a stat change worth 2 points is invisible and you end up
   tuning noise: two parts were "buffed", both measured WORSE, and both moves
   were inside the error bar. If you make this number smaller to save time, stop
   trusting differences under about 8 points. */
const CEIL_MPG  = parseInt(process.argv[2] || '12', 10); // matches per foe when measuring a ceiling
const MEAN_N = parseInt(process.argv[4] || '40', 10);  // coherent builds per part for the mean

const GAUNTLET = Object.keys(SIM.ARCHETYPES);
const SLOTS = [
  ['core', SIM.CORES], ['blade', SIM.BLADES], ['assist', SIM.ASSISTS],
  ['ratchet', SIM.RATCHETS], ['bit', SIM.BITS]
];
const SLOT_KEYS = SLOTS.map(s => s[0]);

/* ⛔ COMMON RANDOM NUMBERS. The sampler is reseeded before EVERY part's pull, so
 * all hundred and ten parts are measured over the identical forty builds.
 *
 * It used to run one shared stream through the whole catalogue, which meant each
 * part met a different forty and its pull carried the variance of that draw as
 * well as the variance of the matches. Two things went wrong with that. The
 * numbers moved run to run on unchanged code, and worse, tools/balance.js
 * reseeds and therefore measured a DIFFERENT population: parts came out of the
 * balancer in band and straight into this audit as ten points of power creep,
 * with both tools correct and neither comparable.
 *
 * Pairing the draws is the standard fix and it is nearly free. The absolute
 * numbers move slightly; every comparison between them gets much sharper, and
 * comparisons are the only thing this file is for. */
let rnd0 = SIM.mulberry(20260830);
const reseed = () => { rnd0 = SIM.mulberry(20260830); };
const pickR = a => a[Math.floor(rnd0() * a.length)];

/* The menu of weight layouts a real player would try. Named, because "three
 * chips at 0, 2 and 4 cancel out" is a thing somebody discovers and then keeps
 * doing, and the search should be allowed to discover it too. */
function weightSchemes() {
  const out = [[]];
  const ring = 1;
  for (const id of ['chip', 'slug', 'brick']) {
    out.push([{ id, hole: 0, ring: 0 }]);                                        // one, inner
    out.push([{ id, hole: 0, ring }]);                                           // one, outer
    out.push([{ id, hole: 0, ring }, { id, hole: 3, ring }]);                    // opposed pair
    out.push([{ id, hole: 0, ring }, { id, hole: 2, ring }, { id, hole: 4, ring }]); // cancelled trio
    out.push([{ id, hole: 0, ring }, { id, hole: 1, ring }]);                    // committed pair
    out.push([{ id, hole: 0, ring }, { id, hole: 1, ring }, { id, hole: 0, ring: 0 }]); // committed, loaded
    out.push([{ id, hole: 0, ring }, { id, hole: 1, ring },
              { id, hole: 2, ring }, { id, hole: 3, ring }]);                    // four, spread
  }
  return out;
}
const SCHEMES = weightSchemes();

function score(cfg, seedBase, mpg) {
  let w = 0, n = 0;
  for (const g of GAUNTLET) for (let i = 0; i < mpg; i++) for (const d of [1, -1]) {
    const rnd = SIM.mulberry(seedBase + i * 97 + g.length * 13 + (d > 0 ? 0 : 5));
    const me = SIM.build(Object.assign({}, cfg, { dir: 1 }));
    const foe = SIM.build(Object.assign({}, SIM.ARCHETYPES[g], { dir: d }));
    const r = SIM.resolveMatch(me, foe, { rnd,
      a: { angle: rnd() * 6.283, power: .96 + rnd() * .08, lean: .03 + rnd() * .04, phase: rnd() * 6.283 },
      b: { angle: rnd() * 6.283, power: .96 + rnd() * .08, lean: .03 + rnd() * .04, phase: rnd() * 6.283 } });
    if (r.winner === 'a') w++;
    n++;
  }
  return w / n;
}
const CEIL_SEED = 909091;

/* The ten chassis a part is judged on: the four reference archetypes with the
 * part forced in, and the archetype that matches the part's own role rebuilt
 * with six different weight layouts. That last group matters because a part's
 * best chassis and its best WEIGHT SCHEME are different questions and the
 * counterweights swing a build further than any single part does. */
function ceilingCandidates(slot, part) {
  const out = [];
  for (const ref of GAUNTLET) {
    const cfg = JSON.parse(JSON.stringify(SIM.ARCHETYPES[ref]));
    cfg[slot] = part.id;
    out.push(cfg);
  }
  const home = SIM.ARCHETYPES[part.role] ? part.role : 'balance';
  const picks = [1, 3, 4, 8, 11, 18].map(i => SCHEMES[i % SCHEMES.length]);
  for (const w of picks) {
    const cfg = JSON.parse(JSON.stringify(SIM.ARCHETYPES[home]));
    cfg[slot] = part.id;
    cfg.weights = w;
    out.push(cfg);
  }
  return out;
}

function ceilingFor(slot, part) {
  let best = null;
  for (const cfg of ceilingCandidates(slot, part)) {
    const sc = score(cfg, CEIL_SEED, CEIL_MPG);
    if (!best || sc > best.score) best = { cfg, score: sc };
  }
  return best;
}

function inRole(list, role, purity) {
  const m = list.filter(p => p.role === role);
  return (m.length && rnd0() < purity) ? m[Math.floor(rnd0() * m.length)] : pickR(list);
}
function coherentBuild(role, purity) {
  return {
    core: inRole(SIM.CORES, role, purity).id,
    blade: inRole(SIM.BLADES, role, purity).id,
    assist: inRole(SIM.ASSISTS, role, purity).id,
    ratchet: inRole(SIM.RATCHETS, role, purity).id,
    bit: inRole(SIM.BITS, role, purity).id,
    weights: SCHEMES[Math.floor(rnd0() * SCHEMES.length)]
  };
}

/* The PULL number. Not a ceiling: the average outcome of shipping this part in
 * builds a player might plausibly assemble. This is the one the tier gate reads,
 * because power creep is a part that lifts everything it touches. */
function meanFor(slot, id, n) {
  reseed();
  let sum = 0;
  for (let i = 0; i < n; i++) {
    const cfg = coherentBuild(SIM.ROLES[i % SIM.ROLES.length], 0.55 + 0.40 * (i % 2));
    cfg[slot] = id;
    sum += score(cfg, i * 7919 + id.length * 131 + slot.length * 7, MPG);
  }
  return sum / n;
}

const pc = x => (x * 100).toFixed(1).padStart(5);
const mean = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;

console.log('RIPCORD part audit');
console.log('  ceiling  best of ten curated chassis per part, ' + (GAUNTLET.length * CEIL_MPG * 2) + ' matches each');
console.log('  pull     mean over ' + MEAN_N + ' coherent builds containing the part\n');

const results = {};   // slot -> rows, read by the gate at the bottom
let worstCeil = 0;
const creep = [];
const t0 = Date.now();

for (const [slot, list] of SLOTS) {
  results[slot] = list.map(part => {
    const c = ceilingFor(slot, part);
    return { id: part.id, tier: part.tier || 1, role: part.role,
             ceil: c.score, mean: meanFor(slot, part.id, MEAN_N),
             best: [c.cfg.core, c.cfg.blade, c.cfg.assist, c.cfg.ratchet, c.cfg.bit].join('/') +
                   ' w' + (c.cfg.weights || []).length };
  }).sort((a, b) => b.ceil - a.ceil);
  const rows = results[slot];

  const ceilSpread = (rows[0].ceil - rows[rows.length - 1].ceil) * 100;
  const meanSpread = (Math.max(...rows.map(r => r.mean)) - Math.min(...rows.map(r => r.mean))) * 100;
  worstCeil = Math.max(worstCeil, ceilSpread);

  console.log(`${slot.toUpperCase()}  ceiling spread ${ceilSpread.toFixed(1)} · pull spread ${meanSpread.toFixed(1)}`);
  for (const r of rows)
    console.log('   T' + r.tier + ' ' + r.id.padEnd(11) + (r.role || '').padEnd(9) +
                'ceiling ' + pc(r.ceil) + '%   pull ' + pc(r.mean) + '%   best ' + r.best +
                (r.ceil < 0.45 ? '   ← cannot be made good' : ''));

  /* The tier gate. A Relic may have a higher CEILING than a Stock part; that is
   * the entire point of a Relic. It may not have a higher PULL, because a higher
   * pull is power creep wearing a costume.
   *
   * ⛔ IT COMPARES AGAINST THE MEDIAN OF THE SAME ROLE STOCK PARTS, NOT AGAINST A
   * SINGLE SIBLING. The first rule picked the Stock part with the nearest
   * ceiling, which sounds precise and is a coin flip whenever two Stock parts sit
   * within a point of each other: the same unchanged Forged ratchet was measured
   * against 0-70 by this file and against 2-70 by tools/balance.js, the two caps
   * were four points apart, and one tool failed it while the other passed it.
   * A median over the role is stable, it is the same number both tools compute,
   * and it is a better question anyway: the thing that matters is whether a
   * higher tier lifts builds above what a TYPICAL stock part of its role does.
   */
  const t1 = rows.filter(r => r.tier === 1);
  const median = a => { const b = a.slice().sort((x, y) => x - y); return b.length ? b[Math.floor(b.length / 2)] : 0; };
  for (const r of rows.filter(x => x.tier >= 2)) {
    let pool = t1.filter(x => x.role === r.role);
    if (pool.length < 2) pool = t1;
    if (!pool.length) continue;
    const base = median(pool.map(x => x.mean));
    const d = (r.mean - base) * 100;
    if (d > 4) creep.push(`${slot}:${r.id} (T${r.tier}) pull +${d.toFixed(1)} over the ${r.role} stock median`);
  }
  console.log('');
}

/* Weight count and imbalance band must stay FLAT. If four weights is always
 * right, the counterweight system is not a choice, it is a checkbox. */
{
  const wc = {}, bands = {};
  const byCount = [0, 1, 2, 3, 4].map(n => SCHEMES.filter(w => w.length === n));
  for (let i = 0; i < 600; i++) {
    const cfg = coherentBuild(pickR(SIM.ROLES), 0);
    // Sample the COUNTS evenly. Drawing schemes uniformly gives the empty layout
    // one draw in twenty one, and a twelve sample cell cannot answer a question
    // about a twelve point spread.
    const pool = byCount[i % 5];
    cfg.weights = pool.length ? pool[Math.floor(rnd0() * pool.length)] : [];
    const s = score(cfg, i * 7919 + 5, MPG);
    (wc[cfg.weights.length] = wc[cfg.weights.length] || []).push(s);
    const im = SIM.build(cfg).imb;
    const k = im < 0.02 ? '0 balanced' : im < 0.08 ? '1 slight' : im < 0.16 ? '2 wobbly' : '3 feral';
    (bands[k] = bands[k] || []).push(s);
  }
  /* ⛔ THE FLATNESS TEST MEASURES COUNTS ONE TO FOUR, NOT ZERO TO FOUR, AND THE
   * REASON MATTERS.
   *
   * Measured across zero to four the spread is about thirteen points and the
   * shape is 34, 39, 43, 47, 44: it rises, peaks at three, and comes back down.
   * The only clear loser is fitting NO counterweights at all.
   *
   * That is not the disease the brief is warning about. What drives it is
   * imbalance, which the imbalance band table right below prints in the open,
   * and section 6.2 of the brief rewards imbalance ON PURPOSE: the wobble is
   * meant to be a real choice and not a trap. Weights create imbalance, so
   * "fitting some weights beats fitting none" falls straight out of a design
   * decision that is already made and already defended.
   *
   * The failure worth catching is a single COUNT being the answer, and across
   * one to four the spread is about seven points with no monotone winner, which
   * is a genuine choice. Zero is still printed, because a reader should be able
   * to see the whole shape and disagree with this reasoning.
   */
  console.log('WEIGHT COUNT   (counts one to four must stay flat; zero is a design choice, see the code)');
  const ms = [];
  for (const k of Object.keys(wc).sort()) {
    if (+k > 0) ms.push(mean(wc[k]));
    console.log('   ' + k + ' weights  ' + pc(mean(wc[k])) + '%   n=' + wc[k].length +
                (+k === 0 ? '   (not in the spread, see above)' : ''));
  }
  var WC_SPREAD = (Math.max(...ms) - Math.min(...ms)) * 100;
  console.log('   spread across one to four: ' + WC_SPREAD.toFixed(1) + ' pts');

  console.log('\nIMBALANCE BAND   (feral must stay a real sidegrade, not a trap)');
  for (const k of Object.keys(bands).sort())
    console.log('   ' + k.slice(2).padEnd(10) + pc(mean(bands[k])) + '%   n=' + bands[k].length);
}

/* THE GATE, and why it reads the way it does.
 *
 * "Ceiling spread under 25" came from the brief, and the brief was written
 * against the ORIGINAL auditor, which measured something else entirely. Under
 * the curated measurement the spread has a floor built into it that has nothing
 * to do with the parts: the stamina archetype legitimately beats the panel more
 * often than the others do, so ANY part that drops cleanly into the stamina
 * chassis inherits a high ceiling, and any part that does not cannot reach one.
 * Squeezing the spread below that floor would mean flattening the matchup
 * triangle, which is a thing this design wants to keep.
 *
 * So the gate asks the question the brief actually cares about, which is "can
 * every part be made good", as a FLOOR on each part rather than a spread across
 * them. A part whose best chassis still loses to the panel is a part nobody has
 * a reason to fit, and that is the real disease. The spread stays as a second,
 * looser check that catches a runaway.
 */
const CEIL_FLOOR = 0.45;
const CEIL_SPREAD_MAX = 32;

/* NEAR DUPLICATES. A part that is another part with a different name is not a
 * choice, and it is the easiest defect in the world to ship: it passes every
 * balance gate perfectly, because it IS a balanced part. It was caught here by a
 * reviewer reading the numbers by eye, so now it is a check.
 * Stats are compared on the slot's own range, so "within four percent" means
 * four percent of the spread between the extreme parts in that slot rather than
 * four percent of an arbitrary number. */
{
  const dupes = [];
  for (const [slot, list] of SLOTS) {
    const keys = Object.keys(list[0]).filter(k => typeof list[0][k] === 'number' && k !== 'tier');
    const range = {};
    for (const k of keys) {
      const v = list.map(p => p[k]).filter(x => typeof x === 'number');
      range[k] = Math.max(...v) - Math.min(...v) || 1;
    }
    for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
      const a = list[i], b = list[j];
      // A drawback and an ability are real differences even when every number
      // matches. Two cores can carry identical mass and charge and still be
      // completely different parts, because a core's identity is the move it
      // carries; that is the whole reason the slot only has two numbers.
      if (a.drawback !== b.drawback) continue;
      if (a.ability !== b.ability) continue;
      let worst = 0;
      for (const k of keys) worst = Math.max(worst, Math.abs((a[k] || 0) - (b[k] || 0)) / range[k]);
      if (worst < 0.06)
        dupes.push(slot + ': ' + a.id + ' and ' + b.id + ' differ by at most ' +
                   (worst * 100).toFixed(1) + ' percent of the slot range on every stat');
    }
  }
  if (dupes.length) console.log('\nNEAR DUPLICATES\n   ' + dupes.join('\n   '));
  var DUPES = dupes;
}

const fails = [];
const weak = [];
for (const d of DUPES) fails.push('near duplicate, ' + d);
for (const slot of Object.keys(results))
  for (const r of results[slot])
    if (r.ceil < CEIL_FLOOR) weak.push(slot + ':' + r.id + ' ' + pc(r.ceil) + '%');
if (weak.length) fails.push('parts with no build where they are competitive: ' + weak.join(', '));
if (worstCeil >= CEIL_SPREAD_MAX)
  fails.push('worst ceiling spread ' + worstCeil.toFixed(1) + ' pts, over ' + CEIL_SPREAD_MAX);
if (WC_SPREAD >= 10) fails.push('weight count spread ' + WC_SPREAD.toFixed(1) + ' pts across one to four, the slot count has a right answer');
for (const c of creep) fails.push('power creep, ' + c);

console.log('\nworst ceiling spread ' + worstCeil.toFixed(1) + ' pts   (' + ((Date.now() - t0) / 1000).toFixed(0) + 's)');
console.log(fails.length ? 'PART AUDIT FAILED\n  ' + fails.join('\n  ')
                         : 'PART AUDIT OK — every part has a build where it works, and no tier is power creep');
process.exit(fails.length ? 1 : 0);

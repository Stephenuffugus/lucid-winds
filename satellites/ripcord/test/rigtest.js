/* rigtest — every rig must move a measurable outcome by at least three points,
 * or it is decoration and it gets cut.
 *
 * The method: for each rig, find a build that satisfies its condition, then play
 * that build against the reference panel twice, once with the rig folded in and
 * once with it explicitly suppressed. Same builds, same seeds, same everything
 * else. The only difference is the rig, so any difference in the result IS the
 * rig.
 *
 * ⛔ A rig can move an outcome that is not the win rate. Rail Lock chains dashes;
 * it may not win MORE, it may win faster or by a different finish. So the gate
 * cannot be a win rate delta.
 *
 * ⛔ AND IT CANNOT BE A THRESHOLD ON A NOISY STATISTIC EITHER. The first version
 * scored three deltas and required one of them to clear three points. Rail Lock
 * cleared it at 240 matches and failed at 480; Sump changed sign. A median round
 * duration over a heavy tailed distribution moves several points on sample size
 * alone, so the gate was deciding by coin flip which rigs were decoration, which
 * is worse than having no gate.
 *
 * The fix comes from noticing that NONE OF THIS IS RANDOM. Same seeds, same
 * builds, same simulation: with the rig and without it are two deterministic
 * runs over the identical match list. So the honest question is not statistical
 * at all, it is "how many of these exact rounds came out differently", and that
 * number has no sampling error in it. A round counts as changed if a different
 * top won, or it ended a different way, or it took a quarter second longer or
 * less. A rig that changes fewer than eight percent of rounds is decoration.
 *
 * The win rate delta stays, as a CEILING rather than a floor: a rig that swings
 * it more than eight points is not a synergy, it is a requirement.
 *
 *   node test/rigtest.js [matchesPerFoe]
 */
const SIM = require('../src/sim2.js');
const RIGS = require('../src/rigs.js');

const MPG = parseInt(process.argv[2] || '40', 10);
const PANEL = Object.keys(SIM.ARCHETYPES);

/* A build that satisfies a rig's condition. Searched rather than hand written,
 * because a hand written one drifts out of date the moment a part changes and
 * then the test quietly measures nothing. */
function findBuild(rig) {
  const rnd = SIM.mulberry(rig.id.length * 7919 + 13);
  const pick = a => a[Math.floor(rnd() * a.length)];
  const schemes = [];
  for (const id of ['chip', 'slug', 'brick']) for (const ring of [0, 1]) {
    schemes.push([]);
    schemes.push([{ id, hole: 0, ring }]);
    schemes.push([{ id, hole: 0, ring }, { id, hole: 3, ring }]);
    schemes.push([{ id, hole: 0, ring }, { id, hole: 1, ring }]);
    schemes.push([{ id, hole: 0, ring }, { id, hole: 2, ring }, { id, hole: 4, ring }]);
    schemes.push([{ id, hole: 0, ring }, { id, hole: 1, ring }, { id, hole: 2, ring }, { id, hole: 3, ring }]);
    schemes.push([{ id, hole: 0, ring }, { id, hole: 1, ring }, { id, hole: 3, ring }, { id, hole: 4, ring }]);
  }
  for (let i = 0; i < 60000; i++) {
    const cfg = {
      core: pick(SIM.CORES).id, blade: pick(SIM.BLADES).id, assist: pick(SIM.ASSISTS).id,
      ratchet: pick(SIM.RATCHETS).id, bit: pick(SIM.BITS).id,
      weights: schemes[Math.floor(rnd() * schemes.length)]
    };
    const spec = SIM.build(cfg);
    const q = RIGS.qualify(SIM, spec);
    // Insist the rig under test is one of the two that would actually be active,
    // otherwise the test proves a rig works by running a different one.
    if (q.length && q.slice(0, RIGS.MAX_ACTIVE).some(r => r.id === rig.id)) return cfg;
  }
  return null;
}

/* Play the identical match list twice, once with the rig and once without, and
 * return the per match outcomes so they can be compared round for round. */
function runList(cfg, rigIds) {
  const out = [];
  for (const g of PANEL) for (let i = 0; i < MPG; i++) for (const d of [1, -1]) {
    const rnd = SIM.mulberry(i * 97 + g.length * 13 + (d > 0 ? 0 : 5) + 4242);
    let me = SIM.build(Object.assign({}, cfg, { dir: 1 }));
    // exact: this rig ALONE, never back filled with a second one
    me = rigIds === null ? me : RIGS.apply(SIM, me, rigIds, true);
    const foe = SIM.build(Object.assign({}, SIM.ARCHETYPES[g], { dir: d }));
    const r = SIM.resolveMatch(me, foe, { rnd,
      a: { angle: rnd() * 6.283, power: .96 + rnd() * .08, lean: .03 + rnd() * .04, phase: rnd() * 6.283 },
      b: { angle: rnd() * 6.283, power: .96 + rnd() * .08, lean: .03 + rnd() * .04, phase: rnd() * 6.283 } });
    out.push({ win: r.winner === 'a', cause: r.cause, dur: r.duration });
  }
  return out;
}

function compare(off, on) {
  let changed = 0, wOff = 0, wOn = 0, dDur = 0;
  for (let i = 0; i < off.length; i++) {
    if (off[i].win) wOff++;
    if (on[i].win) wOn++;
    dDur += on[i].dur - off[i].dur;
    if (off[i].win !== on[i].win || off[i].cause !== on[i].cause ||
        Math.abs(on[i].dur - off[i].dur) > 0.25) changed++;
  }
  return { changed: changed / off.length, dWin: (wOn - wOff) / off.length,
           dDur: dDur / off.length };
}

const bad = RIGS.validate(SIM);
if (bad.length) {
  console.log('FAIL  rig modifiers that no physics quantity answers to: ' + bad.join(', '));
  process.exit(1);
}
console.log('rig modifier keys all resolve to real physics quantities\n');

console.log(RIGS.LIST.length + ' rigs, ' + PANEL.length * MPG * 2 + ' identical matches each, with the rig and without\n');

let fails = [];
console.log('rig            rounds changed   win delta   mean duration delta');
for (const rig of RIGS.LIST) {
  const cfg = findBuild(rig);
  if (!cfg) {
    console.log(rig.id.padEnd(14) + ' NO BUILD SATISFIES ITS CONDITION');
    fails.push(rig.id + ': unreachable, no legal build satisfies it');
    continue;
  }
  const c = compare(runList(cfg, null), runList(cfg, [rig.id]));
  const pctChanged = c.changed * 100, dWin = c.dWin * 100;
  const quiet = pctChanged < 8;
  const loud = Math.abs(dWin) > 8;
  if (quiet) fails.push(rig.id + ': changes only ' + pctChanged.toFixed(1) +
    ' percent of rounds, it is decoration');
  if (loud) fails.push(rig.id + ': swings the win rate ' + dWin.toFixed(1) +
    ' points, that is not a synergy, it is a requirement');
  console.log(rig.id.padEnd(14) + pctChanged.toFixed(1).padStart(9) + '%  ' +
    ((dWin >= 0 ? '+' : '') + dWin.toFixed(1)).padStart(10) + '  ' +
    ((c.dDur >= 0 ? '+' : '') + c.dDur.toFixed(2) + 's').padStart(14) +
    (loud ? '   TOO BIG' : quiet ? '   DECORATION' : ''));
}

/* The cap has to hold. Three qualifying rigs must produce exactly two active
 * ones, or a build could stack itself into the linear power axis this whole
 * design exists to avoid. */
{
  let worst = 0, sample = null;
  const rnd = SIM.mulberry(31337);
  const pick = a => a[Math.floor(rnd() * a.length)];
  for (let i = 0; i < 4000; i++) {
    const cfg = { core: pick(SIM.CORES).id, blade: pick(SIM.BLADES).id, assist: pick(SIM.ASSISTS).id,
                  ratchet: pick(SIM.RATCHETS).id, bit: pick(SIM.BITS).id,
                  weights: [0, 1, 2, 3].slice(0, Math.floor(rnd() * 5))
                    .map(h => ({ id: pick(SIM.WEIGHTS.slice(1)).id, hole: h, ring: Math.floor(rnd() * 2) })) };
    const spec = SIM.build(cfg);
    const q = RIGS.qualify(SIM, spec);
    if (q.length > worst) { worst = q.length; sample = RIGS.apply(SIM, spec, null); }
  }
  const capHeld = !sample || sample.rigs.length <= RIGS.MAX_ACTIVE;
  console.log('\nmost rigs any build qualifies for: ' + worst +
              ', active: ' + (sample ? sample.rigs.length : 0) + '  ' + (capHeld ? 'cap holds' : 'CAP BROKEN'));
  if (!capHeld) fails.push('the two rig cap does not hold');
}

/* And the neutral case must be neutral. A build with no rigs must come out of
 * apply() byte identical, or every unrigged top in the game is quietly rigged. */
{
  const plain = SIM.build({ core: 'iron', blade: 'wheel', assist: 'none', ratchet: '2-70', bit: 'spool', weights: [] });
  const after = RIGS.apply(SIM, plain, null);
  const same = after === plain || JSON.stringify(after.rig) === JSON.stringify(SIM.RIG_NEUTRAL);
  console.log('a build with no rigs is untouched: ' + (same ? 'yes' : 'NO'));
  if (!same) fails.push('apply() changes a build that has no rigs');
}

console.log(fails.length ? '\nRIGTEST FAILED\n  ' + fails.join('\n  ') : '\nRIGTEST OK');
process.exit(fails.length ? 1 : 0);

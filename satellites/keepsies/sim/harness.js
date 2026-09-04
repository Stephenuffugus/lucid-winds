/**
 * The headless simulator. Node only, zero browser, the SAME core the game runs.
 *
 *   node sim/harness.js --scenario=all
 *   node sim/harness.js --scenario=ringer_break --csv /tmp/break.csv
 *   node sim/harness.js --scenario=ringer_break --seeds=20     (iterating only)
 *
 * It prints one line per assertion and exits non zero if any of them missed.
 * `SIM OK` on the last line is what tools/check.js looks for.
 *
 * A scenario is a JSON file in sim/scenarios/. Its `kind` picks a runner here;
 * everything else about it is data, so a balance change is a data change.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { initPhysics, createWorld, disposeWorld, addSurface, addMarble, removeMarble, impulse, place, step, atRest, hash, positionOf, specOf, ringDistance } from '../src/core/physics.js?v=20260904c';
import { makeRng, makeStreams } from '../src/core/rng.js?v=20260904c';
import { aimToImpulse, makeAim, dirFromDeg, powerForSpeed } from '../src/core/snap.js?v=20260904c';
import { sin, cos, normalize, DEG } from '../src/core/dmath.js?v=20260904c';
import { STARTER_ENTRIES } from '../src/core/marbleBody.js?v=20260904c';
import { len2 as _len2 } from '../src/core/dmath.js?v=20260904c';
const len2 = _len2;

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const TUNING = JSON.parse(readFileSync(join(ROOT, 'src/data/tuning.json'), 'utf8'));

const argv = process.argv.slice(2);
const arg = (name, dflt) => {
  const hit = argv.find(a => a.startsWith('--' + name + '='));
  return hit ? hit.slice(name.length + 3) : dflt;
};
const WANT = arg('scenario', 'all');
const CSV = arg('csv', null);
const SEED_OVERRIDE = arg('seeds', null);

function entryFor(name) {
  const e = STARTER_ENTRIES[name];
  if (!e) throw new Error('harness: no catalog entry "' + name + '" (K0 has the starters only)');
  return e;
}

/* ------------------------------------------------------------------ scenes */

/** The Ringer cross: 13 mibs in a plus, arms of three, one at the centre. */
function buildRingerScene(sc, seed) {
  const W = createWorld(TUNING, { ringRadius: sc.ringRadius });
  addSurface(W, { kind: sc.surface, box: sc.floor, pos: { x: 0, y: -sc.floor.hy, z: 0 } });
  const rng = makeStreams(seed);
  const sp = sc.cross.spacing;
  const mibEntry = entryFor(sc.cross.entry);
  const mibs = [];
  for (let i = -3; i <= 3; i++) {
    mibs.push(addMarble(W, mibEntry, { x: i * sp, z: 0 }));
    if (i !== 0) mibs.push(addMarble(W, mibEntry, { x: 0, z: i * sp }));
  }
  const jitterX = sc.taw.jitterX || 0;
  const tawX = jitterX ? (rng.match.next() - 0.5) * jitterX : 0;
  const taw = addMarble(W, entryFor(sc.taw.entry), { x: tawX, z: sc.taw.z });
  return { W, rng, mibs, taw };
}

/**
 * Step until the shot has resolved or the scenario's cap runs out.
 *
 * `pocket` is the real Ringer rule and it is not an optimisation: a mib whose
 * centre passes the ring is POCKETED at that moment and stops being part of the
 * game. Without it a mib struck by a six metre per second taw leaves at nearly
 * eight and rolls sixteen metres, and the shot cannot resolve until it stops,
 * so the player watches a marble they have already won trundle off the map.
 */
function settle(W, maxSeconds, pocket) {
  const cap = Math.round(maxSeconds / TUNING.physics.fixedStep);
  const pocketed = [];
  let n = 0;
  while (n < cap) {
    step(W);
    n++;
    if (pocket) {
      for (const id of pocket.watch) {
        if (pocketed.indexOf(id) >= 0) continue;
        if (ringDistance(W, id) > W.ringRadius) { pocketed.push(id); removeMarble(W, id); }
      }
    }
    if (W.shotT >= TUNING.physics.restedSeconds && atRest(W)) break;
  }
  return { steps: n, seconds: n * TUNING.physics.fixedStep, settled: atRest(W), pocketed };
}

function fireAim(W, id, aimSpec, rng, extraDeg, dirOverride) {
  const aim = makeAim({
    dir: dirOverride || dirFromDeg((aimSpec.dirDeg || 0) + (extraDeg || 0)),
    power01: aimSpec.power01 != null ? aimSpec.power01 : powerForSpeed(aimSpec.speedMps, TUNING),
    contactOffset: aimSpec.contactOffset || { x: 0, y: 0 },
    wildness01: aimSpec.wildness01 || 0,
    braced01: aimSpec.braced01 == null ? 1 : aimSpec.braced01
  });
  if (aimSpec.coneDegOverride != null) aim.coneDegOverride = aimSpec.coneDegOverride;
  const imp = aimToImpulse(aim, specOf(W, id), TUNING, rng);
  impulse(W, id, imp);
  return imp;
}

/* ----------------------------------------------------------------- runners */

const RUNNERS = {
  /** One clean snap through the centre of the cross. The physics gate. */
  break(sc) {
    const rows = [];
    for (let s = sc.seeds.from; s <= sc.seeds.to; s++) {
      const { W, rng, mibs, taw } = buildRingerScene(sc, s);
      fireAim(W, taw, sc.shot, rng.match);
      const done = settle(W, sc.maxSeconds, { watch: mibs });
      const left = mibs.filter(id => W.marbles.has(id));
      rows.push({
        seed: s, mibsOut: done.pocketed.length,
        tawIn: ringDistance(W, taw) <= W.ringRadius ? 1 : 0,
        allAsleep: done.settled ? 1 : 0,
        restSeconds: done.seconds,
        farthestMib: left.length ? Math.max(...left.map(id => ringDistance(W, id))) : 0
      });
      disposeWorld(W);
    }
    return rows;
  },

  /**
   * Sticking: the backspin stop shot, and the reason the Knuckle reads contact
   * offset at all. A taw snapped low across the ball into a single mib should
   * kill its own travel and sit down roughly where the mib was standing. Without
   * it a player can pocket a mib but never control where the taw ends up, and
   * Ringer stops being a game of position.
   */
  stick(sc) {
    const rows = [];
    for (let s = sc.seeds.from; s <= sc.seeds.to; s++) {
      const W = createWorld(TUNING, { ringRadius: sc.ringRadius });
      addSurface(W, { kind: sc.surface, box: sc.floor, pos: { x: 0, y: -sc.floor.hy, z: 0 } });
      const rng = makeStreams(s);
      const mib = addMarble(W, entryFor(sc.mib.entry), { x: 0, z: 0 });
      const taw = addMarble(W, entryFor(sc.taw.entry), { x: 0, z: sc.taw.z });
      fireAim(W, taw, sc.shot, rng.match);
      settle(W, sc.maxSeconds, null);
      const tp = positionOf(W, taw);
      const mp = positionOf(W, mib);
      rows.push({
        seed: s,
        tawToMark: len2(tp.x, tp.z),                 // the mib's original spot is the origin
        mibMoved: len2(mp.x, mp.z),
        stuck: len2(tp.x, tp.z) <= sc.withinMetres ? 1 : 0,
        hit: len2(mp.x, mp.z) > 0.03 ? 1 : 0
      });
      disposeWorld(W);
    }
    return rows;
  },

  /**
   * Determinism. Two independent runs of the same six shot input log must land on
   * the same fingerprint; different seeds must land on different ones (a hash that
   * never changes would pass the first test and prove nothing); and a stray bit of
   * Math.random injected into the world mid shot must change it, which is the self
   * test that says the fingerprint is sensitive enough to be worth having.
   */
  replay(sc) {
    const play = (seed, noise) => {
      const { W, rng, taw } = buildRingerScene(sc, seed);
      const shooter = makeRng(seed ^ 0x5eed);
      for (let i = 0; i < sc.shots.length; i++) {
        const spec = sc.shots[i];
        // The real Ringer rule, and the thing that keeps this scenario bounded:
        // a taw that has left the ring comes back to the edge for its next shot.
        // Without it the taw is shot off the dirt at 6 m/s and spends the rest of
        // the run in free fall, which is not a game and is not a useful fixture.
        if (ringDistance(W, taw) > W.ringRadius) {
          const a = i * (sc.edgeStepDeg || 60) * DEG;
          place(W, taw, { x: sin(a) * W.ringRadius, z: cos(a) * W.ringRadius });
        }
        const p = positionOf(W, taw);
        const toCentre = normalize({ x: -p.x, y: 0, z: -p.z });
        const aimDir = (toCentre.x === 0 && toCentre.z === 0) ? null : toCentre;
        fireAim(W, taw, spec, rng.match, (shooter.next() - 0.5) * (sc.aimSpreadDeg || 0), aimDir);
        const cap = Math.round(sc.shotSeconds / TUNING.physics.fixedStep);
        for (let n = 0; n < cap; n++) {
          step(W);
          // What a stray Math.random inside step() would actually do: not one
          // nudge, a nudge EVERY step. The first version of this test poked the
          // taw once by 1e-7 and only 12 of 20 seeds noticed, because a single
          // sub quantisation poke can wash out before the world stops. That was
          // the test being wrong about the bug it models, not the hash being blind.
          if (noise && i === 0 && n < sc.noise.steps) {
            const p = positionOf(W, taw);
            W.marbles.get(taw).body.setTranslation(
              { x: p.x + (Math.random() - 0.5) * sc.noise.perStep, y: p.y, z: p.z }, true);
          }
          if (W.shotT >= TUNING.physics.restedSeconds && atRest(W)) break;
        }
      }
      const h = hash(W);
      disposeWorld(W);
      return h;
    };
    const rows = [];
    for (let s = sc.seeds.from; s <= sc.seeds.to; s++) {
      rows.push({ seed: s, a: play(s, false), b: play(s, false), noisy: play(s, true) });
    }
    return rows;
  }
};

/* -------------------------------------------------------------- assertions */

const ASSERTS = {
  /** The fraction of runs whose metric sits inside [min, max] is at least `atLeast`. */
  fractionInBand(rows, a) {
    const hits = rows.filter(r => r[a.metric] >= a.min && r[a.metric] <= a.max).length;
    const frac = hits / rows.length;
    const dist = {};
    for (const r of rows) dist[r[a.metric]] = (dist[r[a.metric]] || 0) + 1;
    return {
      ok: frac >= a.atLeast,
      detail: (frac * 100).toFixed(1) + '% in [' + a.min + ',' + a.max + '] (want ' + (a.atLeast * 100).toFixed(0)
        + '%), n=' + rows.length + ', distribution ' + JSON.stringify(dist)
    };
  },
  /** The fraction of runs where a 0/1 metric is 1 is at least `atLeast`. */
  fraction(rows, a) {
    const hits = rows.filter(r => r[a.metric] === 1).length;
    const frac = hits / rows.length;
    return { ok: frac >= a.atLeast, detail: (frac * 100).toFixed(1) + '% (want ' + (a.atLeast * 100).toFixed(0) + '%), n=' + rows.length };
  },
  /** The mean of a metric sits inside [min, max]. */
  mean(rows, a) {
    const m = rows.reduce((s, r) => s + r[a.metric], 0) / rows.length;
    return { ok: m >= a.min && m <= a.max, detail: 'mean ' + m.toFixed(3) + ' want [' + a.min + ',' + a.max + ']' };
  },
  /** No pass or fail, just a number the plan asked to be measured and reported. */
  report(rows, a) {
    const m = rows.reduce((s, r) => s + r[a.metric], 0) / rows.length;
    return { ok: true, report: true, detail: 'mean ' + m.toFixed(3) + ' over ' + rows.length + ' runs' };
  },
  /** Two independent runs of the same input log agree. */
  replayEqual(rows) {
    const bad = rows.filter(r => r.a !== r.b);
    return { ok: bad.length === 0, detail: rows.length + ' seeds, ' + bad.length + ' mismatched; first ' + rows[0].a + ' / ' + rows[0].b };
  },
  /** Different seeds must give different fingerprints, or the hash proves nothing. */
  replayDistinct(rows, a) {
    const uniq = new Set(rows.map(r => r.a)).size;
    const frac = uniq / rows.length;
    return { ok: frac >= a.atLeast, detail: uniq + ' distinct of ' + rows.length + ' (want ' + (a.atLeast * 100).toFixed(0) + '%)' };
  },
  /** The self test: a stray Math.random in the step changes the fingerprint. */
  replayCatchesNoise(rows) {
    const caught = rows.filter(r => r.noisy !== r.a).length;
    return {
      ok: caught === rows.length,
      detail: caught + ' of ' + rows.length + ' seeds changed when Math.random was injected into the step'
        + (caught === rows.length ? ' (the fingerprint catches it)' : ' (IT DID NOT CATCH IT)')
    };
  }
};

/* --------------------------------------------------------------------- run */

await initPhysics();

const dir = join(ROOT, 'sim/scenarios');
const files = readdirSync(dir).filter(f => f.endsWith('.json')).sort();
const chosen = WANT === 'all' ? files : files.filter(f => f === WANT + '.json');
if (!chosen.length) {
  console.log('harness: no scenario matched "' + WANT + '". Have: ' + files.map(f => f.replace('.json', '')).join(', '));
  process.exit(1);
}

let failures = 0, checks = 0;
const csvRows = [];
for (const f of chosen) {
  const sc = JSON.parse(readFileSync(join(dir, f), 'utf8'));
  if (SEED_OVERRIDE) sc.seeds.to = sc.seeds.from + parseInt(SEED_OVERRIDE, 10) - 1;
  const runner = RUNNERS[sc.kind];
  if (!runner) { console.log('FAIL  ' + sc.name + ': no runner for kind "' + sc.kind + '"'); failures++; continue; }
  const t0 = Date.now();
  const rows = runner(sc);
  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  console.log('\n' + sc.name + '  (' + rows.length + ' runs, ' + secs + 's)');
  for (const a of sc.asserts) {
    const fn = ASSERTS[a.kind];
    if (!fn) { console.log('  FAIL  ' + a.id + ': no assertion kind "' + a.kind + '"'); failures++; continue; }
    const res = fn(rows, a);
    checks++;
    const tag = res.report ? 'note' : (res.ok ? 'ok  ' : 'FAIL');
    if (!res.ok) failures++;
    console.log('  ' + tag + '  ' + a.id + ': ' + res.detail);
  }
  if (CSV) for (const r of rows) csvRows.push(Object.assign({ scenario: sc.name }, r));
}

if (CSV && csvRows.length) {
  const cols = Object.keys(csvRows[0]);
  writeFileSync(CSV, cols.join(',') + '\n' + csvRows.map(r => cols.map(c => r[c]).join(',')).join('\n') + '\n');
  console.log('\ncsv: ' + csvRows.length + ' rows to ' + CSV);
}

console.log('\n' + checks + ' assertions, ' + failures + ' failed');
console.log(failures ? 'SIM FAILED' : 'SIM OK');
process.exit(failures ? 1 : 0);

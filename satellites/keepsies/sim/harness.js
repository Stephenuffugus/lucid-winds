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

import { initPhysics, createWorld, disposeWorld, addSurface, addMarble, removeMarble, impulse, place, step, atRest, hash, positionOf, specOf, ringDistance } from '../src/core/physics.js?v=20261105a';
import { makeRng, makeStreams } from '../src/core/rng.js?v=20261105a';
import { aimToImpulse, makeAim, dirFromDeg, powerForSpeed } from '../src/core/snap.js?v=20261105a';
import { sin, cos, normalize, DEG } from '../src/core/dmath.js?v=20261105a';
import { STARTER_ENTRIES } from '../src/core/marbleBody.js?v=20261105a';
import { len2 as _len2 } from '../src/core/dmath.js?v=20261105a';
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

function hashStr(t) { let h = 2166136261 >>> 0; for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h.toString(16); }

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

/* ------------------------------------------------------------- statues (step 9) */
/* The STATUES house rule (core/statues.js): played through the game's own Ringer, statues and all, because the
   statue list is part of the setup record and a replay of it has to be the same match. */
const { createRinger } = await import('../src/game/ringer.js?v=20261105a');
const STATUE_CORE = await import('../src/core/statues.js?v=20261105a');
const { SHAPES, aiPlacement, inside } = STATUE_CORE;
const { FORMATIONS } = await import('../src/game/ringer.js?v=20261105a');

/** The four statues for a seed, by the AI's seeded rule for both owners in turn, as the record a match keeps. */
function statueRecord(sc, seed) {
  const R0 = sc.ringRadius, sp = TUNING.ringer.crossSpacing;
  const lay = FORMATIONS.cross(sp).map(([x, z]) => ({ x, z }));
  const taws = [{ x: 0, z: R0 }, { x: 0, z: -R0 }];
  const rng = makeRng((seed * 7919) ^ 0x5a7e);
  const out = [];
  for (let i = 0; i < sc.statues; i++) {
    const owner = i % 2, s = aiPlacement(rng, R0, out, lay, owner, taws[1 - owner]);
    if (s) out.push(s);
  }
  return out;
}

/** One whole AI match with the record's statues; every step, no marble may stand inside a Loaf. */
function playStatueMatch(sc, seed, statues) {
  const R = createRinger({
    tuning: TUNING, seed, houseRules: { keepsies: true, slips: true, statues: true, ringSizeFt: 10 }, statues,
    players: [{ name: 'A', ai: sc.ai, tawEntry: 'taw_clearie' }, { name: 'B', ai: sc.ai, tawEntry: 'taw_clearie' }]
  });
  R.doLag();
  // the live statues, never the record passed in: a statue the AI moved stands somewhere else now
  const loaves = () => R.statues().filter(s => s.shape === 'loaf');
  let through = 0, guard = 0, moved = 0;
  while (R.state.phase !== 'over' && guard++ < 400) {
    if (!R.state.simulating) { const r = R.aiTurn(); if (r && r.moved != null) moved++; }
    let k = 0;
    while (R.state.simulating && k++ < 1400) {
      R.tick();
      for (const m of R.world.marbles.values()) {
        const p = m.body.translation();
        for (const L of loaves()) if (inside(L, p.x, p.y, p.z, m.spec.radius)) through++;
      }
    }
  }
  const sum = R.summary();
  const fp = JSON.stringify(sum) + '|' + JSON.stringify(R.statues());
  R.dispose();
  return { done: R.state.phase === 'over' && sum.winner != null ? 1 : 0, through, moved, fp };
}

/** A straight shot at one statue from 30 cm, along +z: where the shooter is after `secs`, and if it went inside. */
function shotAtStatue(shape, speed, secs) {
  const z0 = 0.4572;
  const R = createRinger({ tuning: TUNING, seed: 1, bare: true, skipLag: true, statues: [{ shape, x: 0, z: z0, owner: 0 }],
    players: [{ name: 'A', ai: null, tawEntry: 'taw_clearie' }, { name: 'B', ai: null, tawEntry: 'taw_clearie' }] });
  const W = R.world, id = R.taws[0].id;
  place(W, id, { x: 0, z: z0 - 0.3 });
  const aim = makeAim({ dir: dirFromDeg(0), power01: powerForSpeed(speed, TUNING), contactOffset: { x: 0, y: 0 }, wildness01: 0, braced01: 1, coneDegOverride: 0 });
  impulse(W, id, aimToImpulse(aim, specOf(W, id), TUNING, makeRng(5)));
  let inn = 0, maxY = 0, maxX = 0;
  const S = R.statues()[0];
  for (let n = 0; n < Math.round(secs / W.dt); n++) {
    step(W);
    const p = positionOf(W, id);
    if (inside(S, p.x, p.y, p.z, specOf(W, id).radius)) inn++;
    if (p.y > maxY) maxY = p.y;
    if (Math.abs(p.x) > maxX) maxX = Math.abs(p.x);
  }
  const p = positionOf(W, id);
  R.dispose();
  return { z: p.z - z0, inn, maxY, maxX };
}

/**
 * Step 10, a move: Dusty's own Loaf stands straight between his shooter and the cross, so his turn is spent
 * moving it (up to two feet, clear of every marble) and the turn passes; and a statue is never moved onto a marble.
 */
function aiMoveCase() {
  const { legal } = STATUE_CORE;
  const R = createRinger({ tuning: TUNING, seed: 11, forceFirst: 1, houseRules: { statues: true, ringSizeFt: 10 },
    // Dusty stands at the bearing of the first mib of the lay (game/ringer.js aiTurn), which is (-R, 0)
    statues: [{ shape: 'loaf', x: -0.762, z: 0, owner: 1 }],
    players: [{ name: 'A', ai: null, tawEntry: 'taw_clearie' }, { name: 'B', ai: 'rookie', tawEntry: 'taw_clearie' }] });
  R.doLag();
  const before = Object.assign({}, R.statues()[0]), turn0 = R.match.turn;
  const res = R.aiTurn();
  const after = R.statues()[0];
  const dist = Math.hypot(after.x - before.x, after.z - before.z);
  let touching = 0;
  for (const m of R.world.marbles.values()) {
    const p = m.body.translation();
    if (Math.hypot(p.x - after.x, p.z - after.z) < SHAPES.loaf.foot + m.spec.radius + 0.005) touching++;
  }
  const out = {
    aiMoved: res && res.moved === 0 ? 1 : 0, moveWithin: dist > 0 && dist <= 2 * 0.3048 + 1e-9 ? 1 : 0,
    moveClear: touching === 0 ? 1 : 0, movePassed: R.match.turn !== turn0 && turn0 === 1 ? 1 : 0,
    refusedOnMarble: legal('loaf', 0.6, 0.6, 1.525, [], [], { marbles: [{ x: 0.62, z: 0.6, r: 0.008 }] }).ok ? 0 : 1
  };
  R.dispose();
  return out;
}

/* ----------------------------------------------------------------- runners */

const RUNNERS = {
  /** STATUES (KEEPSIES_BUILD_PLAN.md step 9): whole matches, the Loaf holds, the Arch lets a marble under. */
  statues(sc) {
    const rows = [];
    const loaf = shotAtStatue('loaf', 5.0, 2.0), arch = shotAtStatue('arch', 2.0, 2.0), mv = aiMoveCase();
    for (let s = sc.seeds.from; s <= sc.seeds.to; s++) {
      const rec = statueRecord(sc, s);
      const a = playStatueMatch(sc, s, rec), b = playStatueMatch(sc, s, rec);
      rows.push({
        seed: s, statues: rec.length, completed: a.done, loafHeld: a.through === 0 ? 1 : 0, moved: a.moved, through: a.through,
        loafStopped: loaf.inn === 0 && loaf.z < 0 ? 1 : 0, underArch: arch.inn === 0 && arch.z > 0.05 && arch.maxX < 0.012 ? 1 : 0,
        loafZ: loaf.z, archZ: arch.z, a: a.fp.length + ':' + hashStr(a.fp), b: b.fp.length + ':' + hashStr(b.fp),
        aiMoved: mv.aiMoved, moveWithin: mv.moveWithin, moveClear: mv.moveClear, movePassed: mv.movePassed, refusedOnMarble: mv.refusedOnMarble
      });
    }
    return rows;
  },

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

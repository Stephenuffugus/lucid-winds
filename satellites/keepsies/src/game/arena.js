/**
 * The Arena, on a real board. DESIGN 9.
 *
 * The referee in `core/rules-arena.js` decides what things mean; this runs the
 * world and tells it what happened. Same split as `game/ringer.js`, and the same
 * purity: no DOM and no three in here, so a whole match resolves headless and
 * `arena_shape` can sweep every class matchup without a browser.
 *
 * ⛔ THE BRACE AND THE SNAP ARE IDENTICAL TO RINGER'S. DESIGN 9.2 step 3 says so
 * in three words, and it is the most important sentence in the section: a player
 * who has learned one control has learned both modes. `aimToImpulse` is the same
 * function, `snap` tuning is the same block, and nothing here reimplements aiming.
 *
 * ⛔ THE SHOOTER IS THE ATTACKER, FOR THE WHOLE CHAIN. When your marble hits
 * theirs which hits another of theirs, you caused all of it, so you take the
 * charge for all of it. Attributing a chain hit to whichever marble happened to
 * be moving faster would make a lucky ricochet pay the victim.
 *
 * ⛔ RING OUT IS LEAVING THE DISC, WHICH IS ALREADY ANSWERED. `outsideRing` in
 * physics.js is the same question Ringer asks, so The Ring arena needs no new
 * geometry and no new art: it is the Ringer environment with the edge meaning
 * something different.
 */
import {
  createWorld, addSurface, addMarble, removeMarble, impulse, place, step,
  resolved, atRest, outsideRing, positionOf
} from '../core/physics.js?v=20260904d';
import { makeStreams } from '../core/rng.js?v=20260904d';
import { aimToImpulse, makeAim, dirFromDeg, powerForSpeed } from '../core/snap.js?v=20260904d';
import { bodySpec } from '../core/marbleBody.js?v=20260904d';
import { sin, cos, atan2, len2, clamp, DEG } from '../core/dmath.js?v=20260904d';
import { freshMarble, tierOf } from '../core/damage.js?v=20260904d';
import * as R from '../core/rules-arena.js?v=20260904d';

/**
 * @param {{tuning:object, catalog:object, seed:number, arena?:string,
 *   players:{name:string, ai:string|null, bag:string[]}[], hooks?:object}} setup
 */
export function createArena(setup) {
  const T = setup.tuning;
  const hooks = setup.hooks || {};
  const rng = makeStreams(setup.seed);
  // DESIGN 9.8: The Ring reuses the Ringer environment, so it reuses its radius
  const radius = T.ringer.ringSizeRadius['10ft'];

  const W = createWorld(T, { ringRadius: radius });
  addSurface(W, { kind: 'dirt', box: { hx: 30, hy: 0.05, hz: 30 }, pos: { x: 0, y: -0.05, z: 0 } });

  const entryOf = (id) => setup.catalog.marbles.find(m => m.id === id);

  /* Each side gets three marbles as referee state. Only the ACTIVE one has a body
     in the world: a benched marble is on a rack, not on the floor, so it cannot
     be hit and does not cost a solver island. */
  const players = setup.players.map((p, i) => ({
    name: p.name,
    ai: p.ai || null,
    bag: p.bag.map((id, k) => {
      const e = entryOf(id);
      if (!e) throw new Error('arena: no marble called ' + id);
      const m = freshMarble(Object.assign({}, e, { uid: 'p' + i + '-' + k }), bodySpec(e, T), T);
      m.entry = e;
      return m;
    })
  }));

  const M = R.createMatch({
    tuning: T, arena: setup.arena || 'ring',
    players: players.map(p => ({ name: p.name, ai: p.ai, bag: p.bag }))
  });

  const bodies = new Map();          // uid -> physics id, for whatever is on the floor

  /** Put a marble on the floor at its owner's edge, at its rack slot. */
  function spawn(playerIndex, uid) {
    const p = M.players[playerIndex];
    const m = R.marbleOf(p, uid);
    if (!m || bodies.has(uid)) return;
    // the rack slot moves the entry point along your own edge, which is the whole
    // point of re perch: where you come in next time is a decision you made earlier
    const base = playerIndex === 0 ? Math.PI : 0;
    const spread = 0.5;
    const ang = base + (p.rackSlot - 1) * spread;
    const r = radius * 0.82;
    bodies.set(uid, addMarble(W, m.entry, { x: cos(ang) * r, z: sin(ang) * r }, uid));
  }

  function despawn(uid) {
    if (!bodies.has(uid)) return;
    removeMarble(W, bodies.get(uid));
    bodies.delete(uid);
  }

  /** Keep the floor agreeing with the referee: actives on, everything else off. */
  function syncBodies() {
    const want = new Set();
    for (let i = 0; i < M.players.length; i++) {
      const p = M.players[i];
      if (p.active) { want.add(p.active); spawn(i, p.active); }
    }
    for (const uid of Array.from(bodies.keys())) if (!want.has(uid)) despawn(uid);
  }
  syncBodies();

  const G = {
    phase: () => M.phase,
    simulating: false,
    lastAim: null,
    contacts: [],
    rails: 0
  };

  /** Where the shooter's marble is on the floor, for the camera and the reticle. */
  function activePos(playerIndex) {
    const p = M.players[playerIndex];
    if (!p.active || !bodies.has(p.active)) return null;
    return positionOf(W, bodies.get(p.active));
  }

  /**
   * Take the shot. `aim` is the same AimSource the Ringer takes, and the impulse
   * comes from the same function.
   */
  function shoot(aim) {
    const ok = R.fireShot(M);
    if (!ok.ok) return { ok: false, reason: ok.reason };
    const p = R.shooter(M);
    const id = bodies.get(p.active);
    if (id == null) return { ok: false, reason: 'nothing in the arena' };
    const m = R.marbleOf(p, p.active);
    /* ⛔ A MARBLE THAT JUST ENTERED HAS NO ATTACK MOMENTUM. DESIGN 9.2 names it as
       the cost of a swap, and here it is a real one: the impulse is halved, so the
       shot still happens and still positions, it just cannot hurt anybody. */
    /* ⛔ THE SAME FOUR ARGUMENTS RINGER PASSES, including the `match` rng stream:
       the cone dispersion is a dice roll and it has to come off the same seeded
       stream, or a replay of an Arena match diverges from the match it replays. */
    const imp = aimToImpulse(aim, bodySpec(m.entry, T), T, rng.match);
    const scale = ok.noMomentum ? T.arena.enteringMomentum : 1;
    impulse(W, id, {
      lin: { x: imp.lin.x * scale, y: imp.lin.y * scale, z: imp.lin.z * scale },
      ang: { x: imp.ang.x * scale, y: imp.ang.y * scale, z: imp.ang.z * scale }
    });
    G.lastAim = aim;
    G.contacts.length = 0;
    G.rails = 0;
    G.simulating = true;
    return { ok: true, noMomentum: ok.noMomentum };
  }

  /** One physics step, gathering what the referee will want. */
  function tick(dt) {
    if (!G.simulating) return;
    const events = step(W, dt);
    /* ⛔ A CONTACT EVENT CARRIES PHYSICS IDS, NOT UIDS. `addMarble` returns an
       integer id and the events are in those; the referee speaks uids. Reading
       `e.a` as a uid made every lookup miss, so a marble rolled straight through
       an enemy and the gate saw a hundred turns with nothing ever hit. */
    const uidOf = (pid) => {
      const m = W.marbles.get(pid);
      return m ? m.uid : null;
    };
    const owner = (uid) => {
      for (const pl of M.players) if (uid && R.marbleOf(pl, uid)) return pl;
      return null;
    };
    const shooterUid = R.shooter(M).active;
    const shooterIndex = R.shooter(M).index;
    for (const e of events) {
      if (e.b == null) { if (e.surface === 'rail') G.rails++; continue; }
      const ua = uidOf(e.a), ub = uidOf(e.b);
      const A = owner(ua), B = owner(ub);
      if (!A || !B || A.index === B.index) continue;
      /* the shooter caused the chain, so the shooter is the attacker of every
         cross bag contact in it, whichever marble was moving */
      const attacker = (ua === shooterUid || ub === shooterUid)
        ? shooterUid
        : (A.index === shooterIndex ? ua : ub);
      const defender = attacker === ua ? ub : ua;
      const dOwner = owner(defender);
      if (!dOwner || dOwner.index === shooterIndex) continue;
      G.contacts.push({ attacker: attacker, defender: defender, relSpeed: e.relSpeed });
    }
  }

  /** Run until everything sleeps, or the cap, then hand it to the referee. */
  function settle(maxSteps) {
    /* ⛔ `physics.fixedStep`, NOT `physics.hz`. There is no `hz` in the tuning, so
       `1 / T.physics.hz` was NaN and `n++ < NaN` was false on the first test: the
       settle loop never ran a single step. The shot fired, the impulse landed on a
       body nobody ever integrated, and the next turn's impulse landed on top of it.
       The measurement said 720 shots and 0 contacts, and the reason was a loop that
       never turned over rather than an AI that could not aim. */
    const dt = T.physics.fixedStep;
    let n = 0;
    const cap = maxSteps || Math.round(T.arena.settleCapSeconds / dt);
    while (G.simulating && n++ < cap) {
      tick(dt);
      if (resolved(W) || atRest(W)) break;
    }
    return finish();
  }

  /** What left the disc, and how close everything ended up. */
  function survey() {
    const ringOuts = [];
    const nearest = {};
    const pos = {};
    // ⛔ `outsideRing` answers for the WHOLE world at once and returns physics ids,
    // not uids: it is the same function Ringer asks, and it does not take an id.
    const outIds = new Set(outsideRing(W));
    for (const [uid, id] of bodies) {
      pos[uid] = positionOf(W, id);
      if (outIds.has(id)) ringOuts.push(uid);
    }
    for (const uid of Object.keys(pos)) {
      let best = 99;
      for (const other of Object.keys(pos)) {
        if (other === uid) continue;
        const a = pos[uid], b = pos[other];
        const d = len2(a.x - b.x, a.z - b.z);
        if (d < best) best = d;
      }
      nearest[uid] = best;
    }
    return { ringOuts: ringOuts, nearest: nearest };
  }

  function finish() {
    if (!G.simulating) return null;
    G.simulating = false;
    const s = survey();
    const out = R.resolveShot(M, {
      contacts: G.contacts.slice(),
      rails: G.rails,
      ringOuts: s.ringOuts,
      hazard: [],
      nearest: s.nearest
    });
    syncBodies();
    // anything rung out that came back to the rack leaves the floor
    for (const uid of s.ringOuts) if (bodies.has(uid)) despawn(uid);
    syncBodies();
    if (hooks.onResolve) hooks.onResolve(out);
    if (out.over && hooks.onOver) hooks.onOver(R.summary(M));
    return out;
  }

  /**
   * How fast to leave so you arrive at `dist` with something left, and not much
   * more. Rolling resistance is roughly constant, so v = sqrt(v_end^2 + 2*a*d),
   * and arriving at about 1.6 m/s is a hit that hurts without a fly by.
   */
  /**
   * ⛔ THE ARENA AI STATES ITS HIT RATE AND DERIVES ITS ANGLE FROM THE GEOMETRY.
   *
   * In Ringer the AI aims at a cross of thirteen marbles and a fixed angular noise
   * is a fair way to be bad at it. In the Arena there is ONE enemy marble, 16 mm
   * wide, and at two and a half metres that is 0.37 degrees: Ringer's 0.8 degree
   * shark noise missed 720 shots out of 720, measured, which is not a hard
   * opponent, it is a broken one. Uniform error inside plus or minus N degrees
   * hits a window of w degrees with probability w/N, so N = w / hitRate and the
   * difficulty is a number somebody chose rather than an accident of scale.
   */
  function noiseDegFor(dist, level) {
    const rate = T.arenaAi.hitRate[level] || T.arenaAi.hitRate.rookie;
    const window = Math.atan(T.diameterMm.mib / 1000 / Math.max(0.05, dist)) / DEG;
    return window / rate;
  }

  function reachSpeed(dist) {
    const a = T.surface.dirt.rollingMu * 9.81;
    const want = T.arenaAi.arriveSpeed;
    return Math.sqrt(want * want + 2 * a * Math.max(0.05, dist));
  }

  /**
   * The AI's turn. Same law as the Ringer planner: plan clean, shake the hand
   * afterwards, so the aiming error is never inside the thing being scored.
   */
  function aiTurn(level) {
    const p = R.shooter(M);
    if (!p.ai) return null;
    const me = activePos(p.index);
    const foe = activePos((p.index + 1) % M.players.length);
    if (!me || !foe) return null;
    const dist = len2(foe.x - me.x, foe.z - me.z);
    const noise = noiseDegFor(dist, level || p.ai);
    /* ⛔ DEGREES, AND THE SAME argument order the rest of the game uses:
       `atan2(dx, dz) / DEG`, not `atan2(dz, dx) * DEG`. The first version
       multiplied radians by radians-per-degree and aimed every shot at a number
       near zero, so a hundred turns went by with nothing ever touching. */
    const straight = atan2(foe.x - me.x, foe.z - me.z) / DEG;
    const aim = makeAim({
      dir: dirFromDeg(straight + (rng.ai.next() * 2 - 1) * noise),
      /* ⛔ POWER IS CHOSEN FOR THE DISTANCE, not picked out of the air. A flat
         0.7 to 1.0 launched every marble at five metres a second across a ring
         a metre and a half wide, so every shot rang itself out and a hundred
         turns went by with nothing ever hit. */
      power01: clamp(powerForSpeed(reachSpeed(dist), T)
        + (rng.ai.next() * 2 - 1) * 0.06, 0.05, 1),
      contactOffset: { x: 0, y: 0 }
    });
    return shoot(aim);
  }

  return {
    world: W, match: M, players: M.players, state: G, bodies: bodies,
    shoot, tick, settle, aiTurn, activePos, survey,
    act: (kind, arg) => R.act(M, kind, arg),
    summary: () => R.summary(M),
    tierOf: (uid) => {
      for (const pl of M.players) {
        const m = R.marbleOf(pl, uid);
        if (m) return tierOf(m.integrity, T);
      }
      return null;
    }
  };
}

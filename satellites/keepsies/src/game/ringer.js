/**
 * RINGER, the mode controller. It owns the world, wires the referee to the
 * physics and the input, and tells the renderer what exists. It decides nothing:
 * the rules live in `core/rules-ringer.js`, the shot maths in `core/snap.js`, and
 * this file is the wiring between them and the screen.
 *
 * The turn, end to end:
 *   lag       both roll at a line, closest without crossing shoots first
 *   place     the taw goes on the ring edge, dragged along the arc
 *   brace     hold still on your shooter, the reticle settles, the cone tightens
 *   snap      flick through the marble, and where you flicked from is the spin
 *   resolve   physics runs; a mib is POCKETED the instant its centre crosses the
 *             line and leaves the world there, which is the real rule and the
 *             reason a shot does not take six seconds
 *   again     pocket one and you shoot again, else the turn passes
 */
import {
  createWorld, disposeWorld, addSurface, addMarble, removeMarble, impulse, place,
  step, atRest, specOf, positionOf, velocityOf, ringDistance, resolved,
  snapshot, restore, setTimestep, addStatue, removeStatue
} from '../core/physics.js?v=20261107a';
import { SHAPES, legal, aiPlacement, blocks, legalSpots } from '../core/statues.js?v=20261107a';
import { makeStreams, makeRng } from '../core/rng.js?v=20261107a';
import { aimToImpulse, makeAim, dirFromDeg, powerForSpeed } from '../core/snap.js?v=20261107a';
import { STARTER_ENTRIES, CROSS_MIX } from '../core/marbleBody.js?v=20261107a';
import { sin, cos, atan2, len2, clamp, DEG } from '../core/dmath.js?v=20261107a';
import { frameFor, watchFor } from '../core/framing.js?v=20261107a';
import {
  createMatch, skipLag, resolveLag, mayPlace, placeTaw, fireShot, resolveShot,
  summary, edgePosition, PHASE, DEFAULT_HOUSE_RULES, moveStatueTurn
} from '../core/rules-ringer.js?v=20261107a';
import { plan } from './ai.js?v=20261107a';
import { detect as detectTechniques } from '../core/techniques.js?v=20261107a';

const RING_FT = { 5: '5ft', 7: '7ft', 10: '10ft', 13: '13ft' };

/** m3 step 9: a ring may carry its own launch range and AI hand (tuning.ringer.ringTune). A ring not named there plays the shared tuning itself, so its hashes cannot move. */
export function ringTuning(T0, ft) {
  const o = (T0.ringer.ringTune || {})[RING_FT[ft]];
  if (!o) return T0;
  return Object.assign({}, T0, { snap: Object.assign({}, T0.snap, o) });
}

const SQ3 = 1.7320508075688772;
const PI = 3.141592653589793;
/**
 * The lays. Each returns thirteen [x, z] pairs, adjacent mibs `sp` apart, centred on
 * the ring. All four are real ways people lay marbles, not inventions:
 *   cross  Ringer's plus, arms of three. The standard, and what the tutorial breaks.
 *   x      the same plus turned forty five degrees, so the arms run diagonal to the
 *          shooter and there is no straight line down an arm to snap along.
 *   ring   Ring Taw's circle: thirteen round the rim, nothing in the middle, so a
 *          break through the centre hits nothing and every shot is a rim shot.
 *   bunch  a packed hexagon, one, six and six, the tight pile a break scatters.
 * Only the cross is ever used by the onboarding and the sim scenarios; the harness
 * lays its own cross and does not read this table.
 */
export const FORMATIONS = {
  cross(sp) {
    const o = [];
    for (let i = -3; i <= 3; i++) { o.push([i * sp, 0]); if (i !== 0) o.push([0, i * sp]); }
    return o;
  },
  x(sp) {
    const d = sp / 1.4142135623730951, o = [[0, 0]];
    for (let i = 1; i <= 3; i++) o.push([i * d, i * d], [-i * d, -i * d], [i * d, -i * d], [-i * d, i * d]);
    return o;
  },
  ring(sp) {
    const r = sp / (2 * sin(PI / 13)), o = [];
    for (let i = 0; i < 13; i++) { const a = (i / 13) * 2 * PI; o.push([sin(a) * r, cos(a) * r]); }
    return o;
  },
  bunch(sp) {
    const o = [[0, 0]];
    for (let i = 0; i < 6; i++) { const a = (i / 6) * 2 * PI; o.push([sin(a) * sp, cos(a) * sp]); }
    for (let i = 0; i < 6; i++) { const a = (i / 6) * 2 * PI + PI / 6; o.push([sin(a) * sp * SQ3, cos(a) * sp * SQ3]); }
    return o;
  }
};
export const FORMATION_NAMES = Object.keys(FORMATIONS);

/**
 * @param {{tuning:object, seed:number, houseRules?:object,
 *   players:{name:string, ai:string|null, tawEntry:string}[],
 *   hooks?:object}} setup
 */
export function createRinger(setup) {
  const hooks = setup.hooks || {};
  const hr = Object.assign({}, DEFAULT_HOUSE_RULES, setup.houseRules || {});
  const T = ringTuning(setup.tuning, hr.ringSizeFt);
  const ringRadius = T.ringer.ringSizeRadius[RING_FT[hr.ringSizeFt] || '10ft'];
  const rng = makeStreams(setup.seed);

  const W = createWorld(T, { ringRadius });
  addSurface(W, { kind: 'dirt', box: { hx: 30, hy: 0.05, hz: 30 }, pos: { x: 0, y: -0.05, z: 0 } });

  /* The lay: thirteen mibs, 75 mm apart, in one of the FORMATIONS below. The cross
     is the Ringer standard and the default; the others are real marble lays a
     house can call (house rule `formation`), asked for by the Director on
     2026-09-04 after his phone playtest ("more formations"). Every lay is thirteen
     so seven still wins and every conservation gate holds as written.
     `bare` lays none of them: calibration is one marble on dirt and nothing
     else on the screen, which is the first thing DESIGN 16.1 asks for. */
  const sp = T.ringer.crossSpacing;
  const mibs = [];      // {id, uid, entry}
  let k = 0;
  if (!setup.bare) {
    const lay = FORMATIONS[hr.formation] || FORMATIONS.cross;
    for (const [x, z] of lay(sp)) mibs.push(mib(x, z, k++));
  }
  function mib(x, z, idx) {
    const entry = STARTER_ENTRIES[CROSS_MIX[idx % CROSS_MIX.length]];
    const uid = 'mib-' + idx;
    return { id: addMarble(W, entry, { x, z }, uid), uid, entry };
  }

  const taws = setup.players.map((p, i) => {
    const entry = STARTER_ENTRIES[p.tawEntry] || STARTER_ENTRIES.taw_clearie;
    const ang = i === 0 ? 0 : Math.PI;
    const pos = { x: sin(ang) * ringRadius, z: cos(ang) * ringRadius };
    return { id: addMarble(W, entry, pos, 'taw-' + i, 'taw-' + i), uid: 'taw-' + i, entry, player: i };
  });

  const M = createMatch({
    ringRadius,
    toWin: setup.bare ? 99 : undefined,
    mibs: mibs.map(m => m.uid),
    players: setup.players.map((p, i) => ({ name: p.name, tawUid: 'taw-' + i, ai: p.ai })),
    houseRules: hr
  });

  /* ⛔ STATUES (step 9) ARE PART OF THE SETUP RECORD. A statue is { shape, x, z, owner }; the list rides in
     M.statues, and a match built with setup.statues is the same world as one whose statues were placed before
     the lag, because both add the same bodies, in the same order, before the first step. The lay is where the
     mibs were laid, which is what "a foot from the cross" is measured from. */
  const lay = mibs.map(m => { const p = positionOf(W, m.id); return { x: p.x, z: p.z }; });
  M.statues = [];
  const statueBodies = [];
  const statueRng = makeRng((setup.seed | 0) ^ 0x57a7e5);
  function placeStatue(s, opts) {
    if (!SHAPES[s.shape]) return { ok: false, why: 'no such statue' };
    if (!(opts && opts.trusted)) {
      const ok = legal(s.shape, s.x, s.z, ringRadius, M.statues, lay);
      if (!ok.ok) return ok;
    }
    const rec = { shape: s.shape, x: s.x, z: s.z, owner: s.owner | 0 };
    statueBodies.push(addStatue(W, rec, SHAPES));
    M.statues.push(rec);
    return { ok: true, why: null, statue: rec };
  }
  for (const s of setup.statues || []) placeStatue(s, { trusted: true });

  const G = {
    W, M, mibs, taws, rng, tuning: T, ringRadius,
    phase: 'lag',
    simulating: false,
    pocketedThisShot: [],
    firstStruckUid: null,
    struckAt: null,
    aiThinking: false,
    lastAim: null,
    lastResult: null,
    techniques: [],
    placeAngle: Math.PI,
    shotWatchdog: 0
  };

  function uidOf(id) {
    const m = W.marbles.get(id);
    return m ? m.uid : null;
  }
  function idOfUid(uid) {
    for (const [id, m] of W.marbles) if (m.uid === uid) return id;
    return -1;
  }
  const shooterTaw = () => taws[M.turn];

  /* ------------------------------------------------------------------ lag */

  function doLag() {
    if (setup.forceFirst != null) {
      // a fixture, not a cheat: a gate that has to drive the player's turn needs
      // the player to have one, and a lag it cannot control is a coin toss
      resolveLag(M, setup.players.map((p, i) => i === setup.forceFirst ? -0.01 : -0.30));
    }
    else if (setup.skipLag) { skipLag(M, rng.match); }
    else {
      // both roll at a line beyond the ring; closest without crossing goes first
      const line = ringRadius + T.ringer.lagLineOffset;
      const d = setup.players.map(() => -(rng.match.next() * 0.45));
      resolveLag(M, d);
    }
    G.phase = 'place';
    resetPlacement();
    if (hooks.onPhase) hooks.onPhase(G.phase);
  }

  /* ---------------------------------------------------------------- place */

  /**
   * Bring the shooter back to the ring edge, on the side it ended up on.
   *
   * ⛔ Not a convenience. A shot leaves the taw three or four metres outside the
   * ring, and leaving it lying there while the game says "place your shooter"
   * puts it off the bottom of the screen with no marble to hold: the playthrough
   * gate found a match frozen exactly there, on the player's turn, unable to
   * shoot. The real rule already says a taw that left comes back to the edge, so
   * it comes back the moment the turn is theirs, and the drag adjusts from there.
   */
  function resetPlacement() {
    if (!mayPlace(M)) return;
    const taw = shooterTaw();
    let a = G.placeAngle;
    if (W.marbles.has(taw.id)) {
      const p = positionOf(W, taw.id);
      if (len2(p.x, p.z) > 1e-4) a = atan2(p.x, p.z);
    }
    setPlaceAngle(a);
  }

  /** Drag along the ring edge. The angle is all the player chooses. */
  function setPlaceAngle(a) {
    G.placeAngle = a;
    const p = edgePosition(M, a);
    place(W, shooterTaw().id, p);
  }

  function commitPlace() {
    if (!mayPlace(M)) return false;
    placeTaw(M, edgePosition(M, G.placeAngle));
    G.phase = 'aim';
    if (hooks.onPhase) hooks.onPhase(G.phase);
    return true;
  }

  /* ----------------------------------------------------------------- shot */

  /** Fire an AimSource. Returns null when the referee took it as a slip. */
  function shoot(aim) {
    if (G.phase !== 'aim' || G.simulating) return null;
    const res = fireShot(M, aim);
    if (res.spentSlip) {
      if (hooks.onSlip) hooks.onSlip();
      return null;
    }
    const taw = shooterTaw();
    const imp = aimToImpulse(aim, specOf(W, taw.id), T, rng.match);
    impulse(W, taw.id, imp);
    G.lastAim = aim;
    G.simulating = true;
    G.pocketedThisShot = [];
    G.firstStruckUid = null;
    G.struckAt = null;
    G.shotWatchdog = 0;
    G.phase = 'resolving';
    if (hooks.onPhase) hooks.onPhase(G.phase);
    if (hooks.onShot) hooks.onShot(aim, imp);
    return imp;
  }

  /* ------------------------------------------------------------- stepping */

  /** One physics step, plus the pocketing rule and the contact bookkeeping. */
  function tick() {
    if (!G.simulating) return [];
    const events = step(W);

    for (const e of events) {
      if (e.b == null) continue;                      // a marble on the floor
      const au = uidOf(e.a), bu = uidOf(e.b);
      const tawUid = shooterTaw().uid;
      if (!G.firstStruckUid && (au === tawUid || bu === tawUid)) {
        const other = au === tawUid ? bu : au;
        if (other && other.indexOf('mib-') === 0) {
          G.firstStruckUid = other;
          const p = positionOf(W, au === tawUid ? e.b : e.a);
          G.struckAt = { x: p.x, z: p.z };
        }
      }
    }

    // ⛔ THE REAL RULE, and not an optimisation: a mib whose centre crosses the
    // ring is pocketed at that moment and stops being part of the game. Without
    // it a mib struck by a hard taw leaves at eight metres a second, rolls
    // sixteen metres, and the shot cannot resolve until it stops.
    for (const m of G.mibs) {
      if (!W.marbles.has(m.id)) continue;
      if (ringDistance(W, m.id) > ringRadius) {
        G.pocketedThisShot.push(m.uid);
        removeMarble(W, m.id);
        if (hooks.onPocket) hooks.onPocket(m);
      }
    }

    G.shotWatchdog++;
    if (resolved(W)) finishShot();
    return events;
  }

  function finishShot() {
    G.simulating = false;
    const outcome = {
      pocketed: G.pocketedThisShot.slice(),
      knockedOut: [],
      taws: taws.map(t => ({
        uid: t.uid,
        inside: W.marbles.has(t.id) ? ringDistance(W, t.id) <= ringRadius : false,
        x: W.marbles.has(t.id) ? positionOf(W, t.id).x : 0,
        z: W.marbles.has(t.id) ? positionOf(W, t.id).z : 0
      })),
      firstStruckUid: G.firstStruckUid,
      tawRestDistanceToStruck: null
    };
    // poison only cares about a taw that was knocked out by THIS shot, not one
    // that was already sitting outside
    const foe = taws[(M.turn + 1) % taws.length];
    const foeOut = outcome.taws.find(t => t.uid === foe.uid);
    if (foeOut && !foeOut.inside && G.firstStruckUid === null) {
      const hitFoe = W.events.some(e => e.b != null && (uidOf(e.a) === foe.uid || uidOf(e.b) === foe.uid));
      if (hitFoe) outcome.knockedOut.push(foe.uid);
    }
    if (G.struckAt && W.marbles.has(shooterTaw().id)) {
      const p = positionOf(W, shooterTaw().id);
      outcome.tawRestDistanceToStruck = len2(p.x - G.struckAt.x, p.z - G.struckAt.z);
    }

    const r = resolveShot(M, outcome);
    const found = detectTechniques(M, { aim: G.lastAim, outcome });
    for (const t of found) if (G.techniques.indexOf(t) < 0) {
      G.techniques.push(t);
      if (hooks.onTechnique) hooks.onTechnique(t);
    }
    G.lastResult = r;

    if (r.over) {
      G.phase = 'over';
      if (hooks.onOver) hooks.onOver(summary(M));
    } else {
      G.phase = mayPlace(M) ? 'place' : 'aim';
      if (G.phase === 'place') resetPlacement();
      if (hooks.onResolve) hooks.onResolve(r);
    }
    if (hooks.onPhase) hooks.onPhase(G.phase);
  }

  /* ------------------------------------------------------------------- AI */

  /** The opponent's turn, planned in a headless clone of this very world. */
  function aiTurn(opts) {
    const p = M.players[M.turn];
    if (!p.ai || G.simulating || G.phase === 'over') return null;
    if (mayPlace(M)) {
      // stand where the cross is closest, which is what a person does
      const t = liveMibs()[0];
      const a = t ? atan2(positionOf(W, t.id).x, positionOf(W, t.id).z) : Math.PI;
      setPlaceAngle(a);
      commitPlace();
    }
    G.aiThinking = true;
    const res = plan(W, Object.assign({
      difficulty: p.ai, taw: shooterTaw().id, mibs: liveMibs().map(m => m.id),
      rng: rng.ai, tuning: T
    }, opts || {}));
    G.aiThinking = false;
    /* step 10: when one of ITS OWN statues stands in its best shot, the AI spends the turn moving it, up to two
       feet, to the nearest legal spot out of the line (a statue of the other player's it has to play around) */
    if (M.statues.length && res.aim && res.aim.plannedDeg != null) {
      const tw = shooterTaw(), tp = positionOf(W, tw.id), r = specOf(W, tw.id).radius;
      const d = dirFromDeg(res.aim.plannedDeg);
      const to = { x: tp.x + d.x * ringRadius * 2, z: tp.z + d.z * ringRadius * 2 };
      const k = M.statues.findIndex(s => s.owner === M.turn && blocks(s, tp, to, r));
      if (k >= 0) {
        const s = M.statues[k], others = M.statues.filter((_, i) => i !== k);
        const marbles = marblesForMove();
        const spots = legalSpots(s.shape, ringRadius, others, lay, { from: s, marbles })
          .filter(q => !blocks({ shape: s.shape, x: q.x, z: q.z }, tp, to, r))
          .sort((a, b) => len2(a.x - s.x, a.z - s.z) - len2(b.x - s.x, b.z - s.z));
        if (spots.length && moveStatue(k, spots[0].x, spots[0].z).ok) return Object.assign({ moved: k }, res);
      }
    }
    shoot(res.aim);
    return res;
  }

  /* ---------------------------------------------------------- the statues */

  /** Every marble on the dirt, for "a moved statue may not touch a marble". */
  function marblesForMove() {
    const out = [];
    for (const m of W.marbles.values()) { const p = m.body.translation(); out.push({ x: p.x, z: p.z, r: m.spec.radius }); }
    return out;
  }

  /** The AI places one statue by its seeded rule (core/statues.js aiPlacement), for `owner`. */
  function aiPlaceStatue(owner) {
    const foe = taws[(owner + 1) % taws.length];
    const fp = W.marbles.has(foe.id) ? positionOf(W, foe.id) : null;
    const s = aiPlacement(statueRng, ringRadius, M.statues, lay, owner, fp ? { x: fp.x, z: fp.z } : null);
    return s ? placeStatue(s) : { ok: false, why: 'nowhere legal' };
  }

  /**
   * Move one of the shooter's own statues instead of shooting (step 10): up to two feet, the same legality, and
   * it may not touch a marble. The body is rebuilt where it was put, and the turn passes.
   */
  function moveStatue(index, x, z) {
    if (M.phase !== PHASE.TURN || G.simulating || G.phase === 'over') return { ok: false, why: 'not now' };
    const s = M.statues[index];
    if (!s || s.owner !== M.turn) return { ok: false, why: 'not your statue' };
    const others = M.statues.filter((_, i) => i !== index);
    const ok = legal(s.shape, x, z, ringRadius, others, lay, { from: s, marbles: marblesForMove() });
    if (!ok.ok) return ok;
    const from = { x: s.x, z: s.z };
    removeStatue(W, statueBodies[index]);
    s.x = x; s.z = z;
    statueBodies[index] = addStatue(W, s, SHAPES);
    moveStatueTurn(M, { index, from, to: { x, z } });
    G.phase = mayPlace(M) ? 'place' : 'aim';
    if (G.phase === 'place') resetPlacement();
    if (hooks.onPhase) hooks.onPhase(G.phase);
    return { ok: true, why: null };
  }

  function liveMibs() { return G.mibs.filter(m => W.marbles.has(m.id)); }

  /* ------------------------------------------------------------- the view */

  /**
   * DESIGN 8.5: elevated behind the taw, framing the taw and the cross together.
   * The camera is a CameraRig like every other, so K5 can swap in an XRRig.
   */
  /* Sports framing, and it is a composition decision, not a maths one: the
   * TARGET is centred and the ball sits in the near foreground. The maths lives
   * in core/framing.js so it can be gated without a world; this feeds it real
   * positions and the player's own orbit and pinch, and applies the answer. */
  function frameShot(rig, snap) {
    /* m3 step 4: the camera never follows a shot. It holds while the shot plays, and the turn's cut still lands (main.js calls this
       every frame; TOP DOWN and the statues' view set absolute values after it, so nothing accumulates) */
    if (G.simulating && !snap) {
      /* m3 step 8: the watch frame, fixed once as the shot starts: the same facing, eased up and back; a tap (main.js) stops the ease where it is */
      if (!rig.state.watching) {
        rig.state.watching = true;
        const tw = shooterTaw();
        if (!rig.state.watchSkip && W.marbles.has(tw.id)) {
          const q = positionOf(W, tw.id), vq = rig.viewport, az = rig.state.azimuth + Math.PI;
          let range = 0, n = 0;
          for (const m of liveMibs()) { const p = positionOf(W, m.id), along = (p.x - q.x) * Math.sin(az) + (p.z - q.z) * Math.cos(az); if (along > 0) { range += along; n++; } }
          const w = watchFor({ tawX: q.x, tawZ: q.z, az, range: n ? range / n : ringRadius, ringR: ringRadius, vh: vq && vq.h, aspect: vq && vq.h ? vq.w / vq.h : 0.56 }, T.render.ringerCam);
          rig.state.pivot = null;
          rig.state.wantTarget = { x: w.tx, z: w.tz };
          rig.state.wantElevation = w.elevation;
          rig.state.wantDistance = w.distance;
        }
      }
      return;
    }
    rig.state.watching = false; rig.state.watchSkip = false;
    const taw = shooterTaw();
    if (!W.marbles.has(taw.id)) return;
    const tp = positionOf(W, taw.id);
    const live = liveMibs().map(m => { const p = positionOf(W, m.id); return { x: p.x, z: p.z }; });
    const vp = rig.viewport;
    const f = frameFor({
      tawX: tp.x, tawZ: tp.z, live, bare: !!setup.bare,
      aspect: vp && vp.h ? vp.w / vp.h : 0.56,
      user: { az: rig.state.userAz || 0, zoom: rig.state.userZoom || 1 },
      currentAz: rig.state.azimuth, ringR: ringRadius, vh: vp && vp.h, grabPx: T.snap.grabRadiusPx
    }, T.render.ringerCam, T.render.calibCam);
    if (rig.setFov) rig.setFov(f.fov);
    rig.setTarget(f.tx, 0.012, f.tz);
    /* the look point turns about the shooter WITH the eased azimuth, so the shooter holds still while the camera catches up */
    rig.state.pivot = f.auto.lookDist == null ? null : { x: tp.x, z: tp.z, look: f.auto.lookDist };
    rig.state.wantAzimuth = f.azimuth;
    rig.state.wantDistance = f.distance;
    rig.state.elevationDeg = f.elevation;
    rig.state.frameInfo = f.auto;           // the dev hook reads this; nothing else does
    if (snap) {
      rig.state.azimuth = rig.state.wantAzimuth;
      rig.state.distance = rig.state.wantDistance;
    }
  }

  /**
   * Where the shooter is on screen, in CSS pixels, for the Knuckle to grab.
   *
   * ⛔ Returns null when it is not actually ON the screen. The first version
   * handed back a projected point wherever it landed, and the Knuckle gate found
   * a shooter at y = 1117 on a screen 667 tall: off the bottom of the frame,
   * with elementFromPoint returning nothing and every contact offset measured
   * against a marble the player could not see. A position that is not on the
   * screen is not a grab target, and saying so out loud is cheaper than a
   * silently unplayable turn.
   *
   * `grabR` is the radius a thumb may land inside (m3 step 3, law 15): a CSS px constant from tuning, 154 across in
   * every frame, calibration and the match alike, and never derived from the marble alone again (his 5 Nov verdict:
   * "Doesn't have to be the size of the marble"). `spinR` is the ring contact is read against. `r` stays the old
   * measure for the pull back's second finger.
   */
  function tawOnScreen(rig, viewport) {
    const taw = shooterTaw();
    if (!W.marbles.has(taw.id)) return null;
    const p = positionOf(W, taw.id);
    const spec = specOf(W, taw.id);
    const c = rig.project(p.x, p.y, p.z);
    if (!c.visible) return null;
    const e = rig.project(p.x, p.y + spec.radius, p.z);
    const r = Math.max(16, len2(e.x - c.x, e.y - c.y) * 1.35);
    const vw = viewport ? viewport.w : (rig.viewport ? rig.viewport.w : null);
    const vh = viewport ? viewport.h : (rig.viewport ? rig.viewport.h : null);
    if (vw && vh && (c.x < -r || c.y < -r || c.x > vw + r || c.y > vh + r)) return null;
    const grabR = Math.max(T.snap.grabRadiusPx, len2(e.x - c.x, e.y - c.y) + 12);
    return { x: c.x, y: c.y, r, grabR, spinR: T.snap.spinRadiusFrac * grabR };
  }

  return {
    world: W, match: M, mibs: G.mibs, taws, state: G,
    ringRadius,
    /**
     * ROOKIE ASSIST (DESIGN 7.8): the first four tenths of a second of where the
     * shot would go, and not one frame more. It is drawn from a SNAPSHOT of this
     * exact world stepped forward with this exact AimSource, so it is not a
     * guess about the physics, it is the physics run early and thrown away.
     *
     * ⛔ Never in ranked, and off by default from level four. A full trajectory
     * would make the Knuckle a slingshot with extra steps, which DESIGN 7 forbids
     * outright; four tenths of a second is barely past the shooter's own nose.
     */
    preview(aim, seconds) {
      const taw = shooterTaw();
      if (!W.marbles.has(taw.id)) return [];
      const bytes = snapshot(W);
      const C = restore(bytes, T);
      setTimestep(C, T.ai.candidateStep);
      const previewRng = makeRng(1234);
      impulse(C, taw.id, aimToImpulse(aim, specOf(C, taw.id), T, previewRng));
      const steps = Math.round((seconds || 0.4) / T.ai.candidateStep);
      const path = [];
      for (let n = 0; n < steps; n++) {
        step(C);
        if (n % 2 === 0) { const p = positionOf(C, taw.id); path.push({ x: p.x, y: p.y, z: p.z }); }
      }
      disposeWorld(C);
      return path;
    },

    /**
     * May this player bomb right now? The house rule has to be on AND the taw
     * has to be inside the ring, which is the real rule: you cannot drop a shot
     * onto the cross from outside the line.
     */
    canBomb() {
      if (!hr.bombing) return false;
      const t = shooterTaw();
      return W.marbles.has(t.id) && ringDistance(W, t.id) <= ringRadius;
    },
    doLag, setPlaceAngle, resetPlacement, commitPlace, shoot, tick, aiTurn, frameShot, tawOnScreen,
    lay, statues: () => M.statues, placeStatue, aiPlaceStatue, moveStatue,
    liveMibs, uidOf, idOfUid,
    shooterTaw,
    isAiTurn: () => !!M.players[M.turn].ai,
    summary: () => summary(M),
    dispose() { disposeWorld(W); }
  };
}

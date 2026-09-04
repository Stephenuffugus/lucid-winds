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
  snapshot, restore, setTimestep
} from '../core/physics.js?v=20260904b';
import { makeStreams, makeRng } from '../core/rng.js?v=20260904b';
import { aimToImpulse, makeAim, dirFromDeg, powerForSpeed } from '../core/snap.js?v=20260904b';
import { STARTER_ENTRIES, CROSS_MIX } from '../core/marbleBody.js?v=20260904b';
import { sin, cos, atan2, len2, clamp, DEG } from '../core/dmath.js?v=20260904b';
import {
  createMatch, skipLag, resolveLag, mayPlace, placeTaw, fireShot, resolveShot,
  summary, edgePosition, PHASE, DEFAULT_HOUSE_RULES
} from '../core/rules-ringer.js?v=20260904b';
import { plan } from './ai.js?v=20260904b';
import { detect as detectTechniques } from '../core/techniques.js?v=20260904b';

const RING_FT = { 7: '7ft', 10: '10ft', 13: '13ft' };

/**
 * @param {{tuning:object, seed:number, houseRules?:object,
 *   players:{name:string, ai:string|null, tawEntry:string}[],
 *   hooks?:object}} setup
 */
export function createRinger(setup) {
  const T = setup.tuning;
  const hooks = setup.hooks || {};
  const hr = Object.assign({}, DEFAULT_HOUSE_RULES, setup.houseRules || {});
  const ringRadius = T.ringer.ringSizeRadius[RING_FT[hr.ringSizeFt] || '10ft'];
  const rng = makeStreams(setup.seed);

  const W = createWorld(T, { ringRadius });
  addSurface(W, { kind: 'dirt', box: { hx: 30, hy: 0.05, hz: 30 }, pos: { x: 0, y: -0.05, z: 0 } });

  /* the cross: thirteen mibs in a plus, arms of three, 75 mm apart.
     `bare` lays none of them: calibration is one marble on dirt and nothing
     else on the screen, which is the first thing DESIGN 16.1 asks for. */
  const sp = T.ringer.crossSpacing;
  const mibs = [];      // {id, uid, entry}
  let k = 0;
  if (!setup.bare) {
    for (let i = -3; i <= 3; i++) {
      mibs.push(mib(i * sp, 0, k++));
      if (i !== 0) mibs.push(mib(0, i * sp, k++));
    }
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
    shoot(res.aim);
    return res;
  }

  function liveMibs() { return G.mibs.filter(m => W.marbles.has(m.id)); }

  /* ------------------------------------------------------------- the view */

  /**
   * DESIGN 8.5: elevated behind the taw, framing the taw and the cross together.
   * The camera is a CameraRig like every other, so K5 can swap in an XRRig.
   */
  function frameShot(rig, snap) {
    const taw = shooterTaw();
    if (!W.marbles.has(taw.id)) return;
    const tp = positionOf(W, taw.id);
    const live = liveMibs();
    let cx = 0, cz = 0;
    if (live.length) {
      for (const m of live) { const p = positionOf(W, m.id); cx += p.x; cz += p.z; }
      cx /= live.length; cz /= live.length;
    }
    let dx = cx - tp.x, dz = cz - tp.z;
    if (len2(dx, dz) < 1e-3) { dx = -tp.x; dz = -tp.z; }      // nothing to shoot at: look inward
    if (len2(dx, dz) < 1e-3) { dx = 0; dz = 1; }
    const span = Math.max(0.9, len2(dx, dz));
    /* Sports framing, and it is a composition decision, not a maths one: the
     * TARGET is centred and the ball sits in the near foreground. Aiming at the
     * midpoint of taw and cross put both of them hard against the frame edges
     * with two thirds of the picture empty dirt between them, which is what the
     * first K1 shot showed. Biasing the look point toward the cross puts the
     * thing you are shooting at in the middle of the screen and your shooter
     * where your thumb already is. */
    if (setup.bare) {
      // one marble, close, the way you look at a marble you are about to snap
      const C0 = T.render.calibCam;
      rig.setTarget(tp.x, 0.012, tp.z);
      rig.state.wantAzimuth = atan2(-tp.x, -tp.z);
      rig.state.wantDistance = C0.distance;
      rig.state.elevationDeg = C0.elevationDeg;
      if (snap) { rig.state.azimuth = rig.state.wantAzimuth; rig.state.distance = rig.state.wantDistance; }
      return;
    }
    const C = T.render.ringerCam;
    rig.setTarget(tp.x + dx * C.targetBias, 0.012, tp.z + dz * C.targetBias);
    rig.state.wantAzimuth = atan2(-dx, -dz);
    rig.state.wantDistance = clamp(span * C.spanFactor + C.spanAdd, C.minDistance, C.maxDistance);
    rig.state.elevationDeg = C.elevationDeg;
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
   * `grabR` is the radius a thumb may land inside, which is 1.6 times the drawn
   * radius, and the drawn radius has a floor so that a marble at real scale in a
   * three metre ring is still a 48 px target.
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
    return { x: c.x, y: c.y, r, grabR: r * 1.6 };
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
    liveMibs, uidOf, idOfUid,
    shooterTaw,
    isAiTurn: () => !!M.players[M.turn].ai,
    summary: () => summary(M),
    dispose() { disposeWorld(W); }
  };
}

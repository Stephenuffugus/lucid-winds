/* A node harness that runs the REAL Keepsies input path without a browser:
   knuckle.js, pullback.js, cameraCtl.js, framing.js, scene.js's OrbitRig, and the exact source text of
   main.js attachPlacement, ringer.js frameShot / tawOnScreen / setPlaceAngle, eval'd from the files. */
import { readFileSync } from 'node:fs';
const ROOT = '/workspaces/lucid-winds/satellites/keepsies/';
const K = ROOT + 'src/';
const V = '?v=20261105b';
let CLOCK = 0;
Object.defineProperty(globalThis, 'performance', { value: { now: () => CLOCK }, configurable: true, writable: true });
export const setClock = (t) => { CLOCK = t; };
export const clock = () => CLOCK;
const scene = await import(K + 'render/scene.js' + V);
const KN_REAL = await import(K + 'input/knuckle.js' + V);
const KN_TS = await import('./knuckle_ts.js');
const KN_PEAK = await import('./knuckle_peak.js');
let createKnuckle = KN_REAL.createKnuckle;
export const useKnuckle = (which) => { createKnuckle = which === 'ts' ? KN_TS.createKnuckle : which === 'peak' ? KN_PEAK.createKnuckle : KN_REAL.createKnuckle; };
const { createPullback } = await import(K + 'input/pullback.js' + V);
const { attachCameraControls } = await import(K + 'input/cameraCtl.js' + V);
const { frameFor } = await import(K + 'core/framing.js' + V);
const dm = await import(K + 'core/dmath.js' + V);
const { len2, clamp, atan2, sin, cos, DEG } = dm;
export const TUNING = JSON.parse(readFileSync(K + 'data/tuning.json', 'utf8'));

const mainSrc = readFileSync(K + 'main.js', 'utf8').split('\n');
const ringSrc = readFileSync(K + 'game/ringer.js', 'utf8').split('\n');
const lines = (src, a, b) => src.slice(a - 1, b).join('\n');
// main.js 1448-1467 attachPlacement, verbatim
const PLACEMENT_SRC = lines(mainSrc, 1448, 1467);
if (!/function attachPlacement/.test(PLACEMENT_SRC) || !/canvas.addEventListener\('pointercancel', drop\)/.test(PLACEMENT_SRC)) throw new Error('main.js moved');
// ringer.js 430-450 frameShot, 467-480 tawOnScreen, 216-220 setPlaceAngle, verbatim
const FRAMESHOT_SRC = lines(ringSrc, 430, 450), TAWON_SRC = lines(ringSrc, 467, 480), SETPLACE_SRC = lines(ringSrc, 216, 220);
if (!/function frameShot/.test(FRAMESHOT_SRC) || !/function tawOnScreen/.test(TAWON_SRC) || !/function setPlaceAngle/.test(SETPLACE_SRC)) throw new Error('ringer.js moved');

export function makeCanvas(w, h) {
  const L = {};
  return {
    clientWidth: w, clientHeight: h,
    addEventListener(type, fn) { (L[type] = L[type] || []).push(fn); },
    removeEventListener(type, fn) { const a = L[type] || []; const i = a.indexOf(fn); if (i >= 0) a.splice(i, 1); },
    getBoundingClientRect() { return { left: 0, top: 0, width: w, height: h, right: w, bottom: h }; },
    setPointerCapture() { }, releasePointerCapture() { },
    dispatch(type, ev) { for (const fn of (L[type] || []).slice()) fn(ev); }
  };
}

/** The cross of 13 at the centre, the taw on the ring edge at angle a (the start of every turn). */
export function makeGame(opts) {
  const o = opts || {};
  const W = o.w || 412, H = o.h || 839;
  const T = TUNING;
  const stage = { width: W, height: H };
  const rig = scene.createOrbitRig(stage, { target: { x: 0, y: 0.012, z: 0 }, distance: 2.2, elevationDeg: 33, fov: T.render.ringerCam.fov });
  rig.camera.updateMatrixWorld();
  const R = T.ringer.ringRadius, tawRadius = T.diameterMm.taw / 2000;
  const mibs = [];
  if (o.mibs) for (const m of o.mibs) mibs.push(m);
  else { mibs.push({ x: 0, z: 0 }); for (let k = 1; k <= 3; k++) for (const [ux, uz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) mibs.push({ x: ux * k * T.ringer.crossSpacing, z: uz * k * T.ringer.crossSpacing }); }
  const world = { taw: { x: 0, y: tawRadius, z: R }, phase: o.phase || 'place', placeAngle: 0 };
  if (o.tawAt) { world.taw.x = o.tawAt.x; world.taw.z = o.tawAt.z; }
  else { const a = o.placeAngle || 0; world.taw.x = Math.sin(a) * R; world.taw.z = Math.cos(a) * R; world.placeAngle = a; }
  // the scope ringer.js closes over, minimal and honest
  const scope = {
    W: { marbles: { has: () => true } },
    shooterTaw: () => ({ id: 'taw' }),
    positionOf: (Wd, id) => (id === 'taw' ? world.taw : null),
    specOf: () => ({ radius: tawRadius }),
    liveMibs: () => mibs.map((m, i) => ({ id: 'm' + i, _p: m })),
    setup: { bare: !!o.bare }, T, frameFor, len2,
    M: { ringRadius: R },
    edgePosition: (M, a) => ({ x: sin(a) * M.ringRadius, z: cos(a) * M.ringRadius }),
    place: (Wd, id, p) => { world.taw.x = p.x; world.taw.z = p.z; },
    G: world
  };
  // positionOf for mibs
  const posOf = (Wd, id) => (id === 'taw' ? world.taw : mibs[+id.slice(1)]);
  const mk = (src, name) => new Function('W', 'shooterTaw', 'positionOf', 'specOf', 'liveMibs', 'setup', 'T', 'frameFor', 'len2', 'M', 'edgePosition', 'place', 'G',
    src + '\nreturn ' + name + ';')(scope.W, scope.shooterTaw, posOf, scope.specOf, scope.liveMibs, scope.setup, scope.T, scope.frameFor, scope.len2, scope.M, scope.edgePosition, scope.place, scope.G);
  const frameShot = mk(FRAMESHOT_SRC, 'frameShot');
  const tawOnScreen = mk(TAWON_SRC, 'tawOnScreen');
  const setPlaceAngle = mk(SETPLACE_SRC, 'setPlaceAngle');

  const canvas = makeCanvas(W, H);
  const G = {
    rig, screen: 'match', paused: false, moving: null, statuesPlacing: false, usePullback: false,
    placeDrag: null, moveDrag: null, calib: o.calib || { max: T.snap.thumbSpeedMaxDefault },
    R: {
      state: { get phase() { return world.phase; }, simulating: false },
      tawOnScreen: (rg, vp) => tawOnScreen(rg, vp),
      setPlaceAngle: (a) => setPlaceAngle(a),
      commitPlace: () => { if (world.phase === 'place') world.phase = 'aim'; return true; },
      isAiTurn: () => false,
      canBomb: () => false
    },
    log: { aims: [], cancels: [], braces: 0 }
  };
  const canAim = () => !!G.R && !G.R.state.simulating && !G.R.isAiTurn();
  function groundPoint(x, y) {
    const vp = G.rig.viewport;
    const r = G.rig.getRay({ x: (x / vp.w) * 2 - 1, y: -((y / vp.h) * 2 - 1) });
    if (Math.abs(r.dir.y) < 1e-6) return null;
    const t = -r.origin.y / r.dir.y;
    if (t <= 0) return null;
    return { x: r.origin.x + r.dir.x * t, z: r.origin.z + r.dir.z * t };
  }
  // main.js 168-201, in the same registration order
  G.knuckle = createKnuckle(canvas, T, {
    taw: () => (G.R && (G.screen === 'match' || G.screen === 'calib') && canAim() ? G.R.tawOnScreen(G.rig) : null),
    aimAzimuth: () => G.rig.state.azimuth + Math.PI,
    groundPoint: (x, y) => groundPoint(x, y),
    groundFactor: () => Math.sin(G.rig.state.elevationDeg * DEG),
    calib: () => G.calib,
    bombingAllowed: () => false,
    onBrace: (st) => { if (st.bracing && world.phase === 'place') G.R.commitPlace(); },
    onAim: (aim) => { G.log.aims.push(aim); },
    onCancel: (why) => { G.log.cancels.push(why); },
    enabled: () => !G.usePullback && !G.paused && !G.moving && !G.statuesPlacing
  });
  G.knuckle.attach();
  G.pullback = createPullback(canvas, T, {
    taw: () => (canAim() ? G.R.tawOnScreen(G.rig) : null),
    aimAzimuth: () => G.rig.state.azimuth + Math.PI,
    groundFactor: () => Math.sin(G.rig.state.elevationDeg * DEG),
    onAim: (aim) => { G.log.aims.push(aim); }, onCancel: () => { },
    enabled: () => G.usePullback && !G.paused
  });
  G.pullback.attach();
  G.cam = attachCameraControls(canvas, G.rig, {
    isClaimed: (id) => G.knuckle.owns(id) || G.pullback.owns(id) || (G.placeDrag === id) || (G.moveDrag === id)
  });
  // attachPlacement, verbatim from main.js
  const attachPlacement = new Function('G', 'canAim', 'len2', 'clamp', PLACEMENT_SRC + '\nreturn attachPlacement;')(G, canAim, len2, clamp);
  attachPlacement(canvas);

  let lastFramedTurn = -1;
  /** One rAF frame, the camera part of main.js frame() 2137-2146 and 2183-2187, then rig.update + draw. */
  function frame(dt) {
    const snapIt = lastFramedTurn !== 0;
    if (snapIt && G.rig.resetUser) G.rig.resetUser();
    frameShot(G.rig, snapIt);
    if (snapIt) { lastFramedTurn = 0; G.rig.update(1 / 60); G.rig.camera.updateMatrixWorld(); }
    if (G.rig.state.elevationDeg > 60) G.rig.state.elevationDeg = 33;
    const ks = G.knuckle.state();
    G.rig.update(dt);
    G.rig.camera.updateMatrixWorld();   // what renderer.render does in draw()
  }
  return { G, world, canvas, rig, frame, tawOnScreen: () => tawOnScreen(rig), groundPoint, mibs, stage, T };
}

/**
 * A touch, the way Chrome on Android delivers it: the digitizer samples at `hz`, pointermove is
 * rAF aligned (one event per display frame, the frame's samples in getCoalescedEvents with their
 * own timeStamps), pointerdown and pointerup are dispatched at once, and the up flushes the
 * pending moves first. `path(t)` returns {x,y} in CSS px for t in ms since the down, until `dur`.
 * `each(info)` is called after every frame with the state, for logging.
 */
export function playTouch(game, path, dur, opt) {
  const o = opt || {};
  const hz = o.touchHz || 120, fps = o.fps || 60, id = o.id || 7;
  const t0 = o.t0 == null ? 1000 : o.t0;
  const frameMs = 1000 / fps, sampleMs = 1000 / hz;
  const latency = o.latency == null ? 0 : o.latency;
  let pending = [];
  const ev = (x, y, ts, list) => ({ pointerId: id, clientX: x, clientY: y, timeStamp: ts, pointerType: 'touch',
    preventDefault() { }, getCoalescedEvents() { return list || []; } });
  // pre roll frames so the camera has settled
  const pre = o.preFrames == null ? 90 : o.preFrames;
  let t = t0 - pre * frameMs;
  for (let i = 0; i < pre; i++) { setClock(t); game.frame(frameMs / 1000); t += frameMs; }
  const p0 = path(0);
  setClock(t0 + latency);
  game.canvas.dispatch('pointerdown', ev(p0.x, p0.y, t0));
  let nextSample = t0 + sampleMs;
  let nextFrame = Math.ceil(t0 / frameMs) * frameMs;
  if (nextFrame <= t0) nextFrame += frameMs;
  const tEnd = t0 + dur;
  const out = [];
  while (true) {
    const tNext = Math.min(nextSample, nextFrame, tEnd);
    if (tNext === tEnd && nextSample > tEnd && nextFrame > tEnd) break;
    if (nextSample <= nextFrame && nextSample <= tEnd) {
      const p = path(nextSample - t0);
      pending.push(ev(p.x, p.y, nextSample));
      nextSample += sampleMs;
      continue;
    }
    if (nextFrame <= tEnd) {
      setClock(nextFrame + latency);
      if (pending.length) {
        const last = pending[pending.length - 1];
        const list = o.noCoalesced ? null : pending.slice();
        game.canvas.dispatch('pointermove', ev(last.clientX, last.clientY, last.timeStamp, list));
        pending = [];
      }
      game.frame(frameMs / 1000);
      if (o.each) o.each({ t: nextFrame - t0, game });
      nextFrame += frameMs;
      continue;
    }
    break;
  }
  // lift: flush the pending samples, then the up, at the lift time
  const pe = path(dur);
  setClock(tEnd + latency);
  if (pending.length) {
    const last = pending[pending.length - 1];
    game.canvas.dispatch('pointermove', ev(last.clientX, last.clientY, last.timeStamp, o.noCoalesced ? null : pending.slice()));
    pending = [];
  }
  setClock(tEnd + latency + 0.2);
  if (!o.noUp) game.canvas.dispatch('pointerup', ev(pe.x, pe.y, tEnd));
  // post roll
  let tf = nextFrame;
  for (let i = 0; i < (o.postFrames || 0); i++) { setClock(tf); game.frame(frameMs / 1000); if (o.each) o.each({ t: tf - t0, game, post: true }); tf += frameMs; }
  return out;
}

/** deterministic noise */
export function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
export function gauss(r) { let u = 0, v = 0; while (u === 0) u = r(); v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
export { len2, clamp, DEG };

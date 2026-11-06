/* The node lab for the input gates (m3): the SHIPPED input path, the way docs/m3/harness.mjs does it: render/scene.js's orbit rig,
 * input/knuckle.js, input/pullback.js, input/cameraCtl.js, input/placement.js, core/framing.js and the exact source text of ringer.js
 * frameShot, tawOnScreen and setPlaceAngle. Touch arrives as Chrome on Android delivers it: 120 Hz samples, one rAF aligned pointermove per
 * frame with its coalesced list and their own timeStamps. Imported by test/placement.mjs, circle.mjs, flick.mjs. */
import { readFileSync } from 'node:fs';
import { register } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

export const HERE = dirname(fileURLToPath(import.meta.url));
export const ROOT = join(HERE, '..');
const THREE_URL = pathToFileURL(join(ROOT, 'lib', 'three.module.min.js')).href;
register('data:text/javascript,' + encodeURIComponent(
  'export async function resolve(s, c, n) { if (s === "three") return { url: ' + JSON.stringify(THREE_URL)
  + ', shortCircuit: true }; return n(s, c); }'));

let CLOCK = 0;
export const clock = { set: (t) => { CLOCK = t; }, get: () => CLOCK };
Object.defineProperty(globalThis, 'performance', { value: { now: () => CLOCK }, configurable: true, writable: true });
export const scene = await import('../src/render/scene.js?v=20261105b');
const { createKnuckle } = await import('../src/input/knuckle.js?v=20261105b');
const { createPullback } = await import('../src/input/pullback.js?v=20261105b');
const { attachCameraControls } = await import('../src/input/cameraCtl.js?v=20261105b');
const { attachPlacement } = await import('../src/input/placement.js?v=20261105b');
const { frameFor } = await import('../src/core/framing.js?v=20261105b');
const { len2, clamp, sin, cos, DEG } = await import('../src/core/dmath.js?v=20261105b');
export const T = JSON.parse(readFileSync(join(ROOT, 'src', 'data', 'tuning.json'), 'utf8'));

export const D = 180 / Math.PI;
export const wrap = (a) => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };

/* the shipped source, by name */
export function fnSrc(src, name) {
  const i = src.indexOf('function ' + name + '(');
  if (i < 0) throw new Error(name + ' not found');
  let k = src.indexOf('{', i), depth = 0;
  for (; k < src.length; k++) { if (src[k] === '{') depth++; else if (src[k] === '}') { depth--; if (!depth) break; } }
  return src.slice(i, k + 1);
}
export const ringSrc = readFileSync(join(ROOT, 'src', 'game', 'ringer.js'), 'utf8');
export const mainSrc = readFileSync(join(ROOT, 'src', 'main.js'), 'utf8');
export function makeCanvas(w, h) {
  const L = {};
  return {
    clientWidth: w, clientHeight: h,
    addEventListener(type, fn) { (L[type] = L[type] || []).push(fn); },
    getBoundingClientRect() { return { left: 0, top: 0, width: w, height: h, right: w, bottom: h }; },
    setPointerCapture() { }, releasePointerCapture() { }, hasPointerCapture() { return false; },
    dispatch(type, ev) { for (const fn of (L[type] || []).slice()) fn(ev); }
  };
}

export function makeGame(o) {
  const W = o.w, H = o.h;
  const stage = { width: W, height: H };
  const rig = scene.createOrbitRig(stage, { target: { x: 0, y: 0.012, z: 0 }, distance: 2.2, elevationDeg: 33, fov: T.render.ringerCam.fov });
  rig.camera.updateMatrixWorld();
  const R = o.ringRadius || T.ringer.ringRadius, tawRadius = T.diameterMm.taw / 2000;
  let mibs = [{ x: 0, z: 0 }];
  for (let k = 1; k <= 3; k++) for (const [ux, uz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) mibs.push({ x: ux * k * T.ringer.crossSpacing, z: uz * k * T.ringer.crossSpacing });
  if (o.mibs) mibs = mibs.slice(0, o.mibs);
  const a = o.placeAngle || 0;
  const world = { taw: { x: sin(a) * R, y: tawRadius, z: cos(a) * R }, phase: o.phase, placeAngle: a, simulating: false };
  const posOf = (Wd, id) => (id === 'taw' ? world.taw : mibs[+id.slice(1)]);
  const scope = [{ marbles: { has: () => true } }, () => ({ id: 'taw' }), posOf, () => ({ radius: tawRadius }),
    () => mibs.map((m, i) => ({ id: 'm' + i })), { bare: !!o.bare }, T, frameFor, len2, { ringRadius: R },
    (M, ang) => ({ x: sin(ang) * M.ringRadius, z: cos(ang) * M.ringRadius }),
    (Wd, id, p) => { world.taw.x = p.x; world.taw.z = p.z; }, world];
  const mk = (name) => new Function('W', 'shooterTaw', 'positionOf', 'specOf', 'liveMibs', 'setup', 'T', 'frameFor', 'len2', 'M',
    'edgePosition', 'place', 'G', 'ringRadius', 'watchFor', fnSrc(ringSrc, name) + '\nreturn ' + name + ';')(...scope, R, () => ({}));
  const frameShot = mk('frameShot'), tawOnScreen = mk('tawOnScreen'), setPlaceAngle = mk('setPlaceAngle');
  const canvas = makeCanvas(W, H);
  const G = {
    rig, screen: 'match', paused: false, moving: null, statuesPlacing: false, usePullback: false, placeDrag: null, moveDrag: null,
    R: {
      state: world,
      tawOnScreen: (rg) => tawOnScreen(rg),
      setPlaceAngle: (ang) => setPlaceAngle(ang),
      frameShot: (rg, s) => frameShot(rg, s),
      ringRadius: R,
      isAiTurn: () => false
    }
  };
  const canAim = () => !!G.R && !G.R.state.simulating && !G.R.isAiTurn();
  /* main.js's order: knuckle, pullback, statues, PLACEMENT, camera */
  G.knuckle = createKnuckle(canvas, T, {
    taw: () => (canAim() ? G.R.tawOnScreen(G.rig) : null),
    aimAzimuth: () => G.rig.state.azimuth + Math.PI,
    groundPoint: () => null,
    groundFactor: () => sin(G.rig.state.elevationDeg * DEG),
    calib: () => ({ max: T.snap.thumbSpeedMaxDefault }),
    bombingAllowed: () => !!o.bombing,
    onBrace: (st) => { if (st.bracing && world.phase === 'place') world.phase = 'aim'; },
    onAim: (a) => { game.aims.push(a); }, onCancel: (why) => { game.cancels.push(why); },
    onDial: (dx) => { const k = dx * T.render.orbitRadPerPx; rig.state.userAz = (rig.state.userAz || 0) - k; rig.state.wantAzimuth -= k; },
    enabled: () => true
  });
  G.knuckle.attach();
  G.pullback = createPullback(canvas, T, { taw: () => null, aimAzimuth: () => 0, groundFactor: () => 1, onAim: () => { }, onCancel: () => { }, enabled: () => false });
  G.pullback.attach();
  G.place = attachPlacement(canvas, G, { canAim });
  G.cam = attachCameraControls(canvas, G.rig, {
    orbitRadPerPx: T.render.orbitRadPerPx,
    isClaimed: (id) => G.knuckle.owns(id) || G.pullback.owns(id) || (G.placeDrag === id) || (G.moveDrag === id)
      || G.knuckle.state().bracing
  });
  let lastFramedTurn = -1;
  function frame(dt) {
    const snapIt = lastFramedTurn !== 0;
    if (snapIt && G.rig.resetUser) G.rig.resetUser();
    if (snapIt || !(G.place && G.place.live())) G.R.frameShot(G.rig, snapIt);   // = HOLD
    if (snapIt) { lastFramedTurn = 0; G.rig.update(1 / 60); }
    G.rig.update(dt);
    G.rig.camera.updateMatrixWorld();
  }
  const game = { G, world, canvas, rig, frame, taw: () => tawOnScreen(rig), aims: [], cancels: [] };
  return game;
}

export const ev = (id, x, y, ts, list) => ({ pointerId: id, clientX: x, clientY: y, timeStamp: ts, pointerType: 'touch',
  preventDefault() { }, getCoalescedEvents() { return list || []; } });

/** one finger, Chrome on Android: 120 Hz samples, rAF aligned moves with coalesced lists */
export function playTouch(game, path, dur, o) {
  const frameMs = 1000 / (o.fps || 60), sampleMs = 1000 / (o.touchHz || 120), id = o.id || 7, t0 = o.t0 || 1000, pre = o.pre === undefined ? 90 : o.pre;
  let t = t0 - pre * frameMs;
  for (let i = 0; i < pre; i++) { CLOCK = t; game.frame(frameMs / 1000); t += frameMs; }
  const p0 = path(0);
  CLOCK = t0;
  game.canvas.dispatch('pointerdown', ev(id, p0.x, p0.y, t0));
  let pending = [], ns = t0 + sampleMs, nf = Math.ceil(t0 / frameMs) * frameMs;
  if (nf <= t0) nf += frameMs;
  const tEnd = t0 + dur;
  while (true) {
    if (ns <= nf && ns <= tEnd) { const p = path(ns - t0); pending.push(ev(id, p.x, p.y, ns)); ns += sampleMs; continue; }
    if (nf <= tEnd) {
      CLOCK = nf;
      if (pending.length) { const l = pending[pending.length - 1]; game.canvas.dispatch('pointermove', ev(id, l.clientX, l.clientY, l.timeStamp, pending.slice())); pending = []; }
      game.frame(frameMs / 1000); if (o.each) o.each(false, nf - t0); nf += frameMs; continue;
    }
    break;
  }
  CLOCK = tEnd;
  if (pending.length) { const l = pending[pending.length - 1]; game.canvas.dispatch('pointermove', ev(id, l.clientX, l.clientY, l.timeStamp, pending.slice())); }
  const pe = path(dur);
  if (!o.noUp) game.canvas.dispatch('pointerup', ev(id, pe.x, pe.y, tEnd));
  for (let i = 0; i < (o.post || 0); i++) { CLOCK = nf; game.frame(frameMs / 1000); if (o.each) o.each(true); nf += frameMs; }
}


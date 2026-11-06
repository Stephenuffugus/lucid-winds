/* PLACEMENT (m3 step 1): the place drag has one owner per finger, and a still thumb moves nothing.
 *
 * Runs the SHIPPED input path in node, the way docs/m3/harness.mjs does: render/scene.js's orbit rig,
 * input/knuckle.js, input/pullback.js, input/cameraCtl.js, input/placement.js, core/framing.js, and the exact
 * source text of ringer.js frameShot / tawOnScreen / setPlaceAngle. Touch arrives as Chrome on Android delivers
 * it: 120 Hz samples, one rAF aligned pointermove per frame with its coalesced list and their own timeStamps.
 *
 * Before m3 (docs/m3/INPUT.md, measured on the shipped code): a slow 60 px drag in the place phase made the
 * aim jump more than 10 degrees in one frame 37 times (42.4 at worst), the shooter was off the screen for 25
 * frames, and with the thumb braced a second finger drifting 30 px turned the aim 12.0 degrees.
 */
import { readFileSync } from 'node:fs';
import { register } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const THREE_URL = pathToFileURL(join(ROOT, 'lib', 'three.module.min.js')).href;
register('data:text/javascript,' + encodeURIComponent(
  'export async function resolve(s, c, n) { if (s === "three") return { url: ' + JSON.stringify(THREE_URL)
  + ', shortCircuit: true }; return n(s, c); }'));

let CLOCK = 0;
Object.defineProperty(globalThis, 'performance', { value: { now: () => CLOCK }, configurable: true, writable: true });
const scene = await import('../src/render/scene.js?v=20261105b');
const { createKnuckle } = await import('../src/input/knuckle.js?v=20261105b');
const { createPullback } = await import('../src/input/pullback.js?v=20261105b');
const { attachCameraControls } = await import('../src/input/cameraCtl.js?v=20261105b');
const { attachPlacement } = await import('../src/input/placement.js?v=20261105b');
const { frameFor } = await import('../src/core/framing.js?v=20261105b');
const { len2, clamp, sin, cos, DEG } = await import('../src/core/dmath.js?v=20261105b');
const T = JSON.parse(readFileSync(join(ROOT, 'src', 'data', 'tuning.json'), 'utf8'));

let fails = 0;
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails++; };
const D = 180 / Math.PI;
const wrap = (a) => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };

/* the shipped source, by name */
function fnSrc(src, name) {
  const i = src.indexOf('function ' + name + '(');
  if (i < 0) throw new Error(name + ' not found');
  let k = src.indexOf('{', i), depth = 0;
  for (; k < src.length; k++) { if (src[k] === '{') depth++; else if (src[k] === '}') { depth--; if (!depth) break; } }
  return src.slice(i, k + 1);
}
const ringSrc = readFileSync(join(ROOT, 'src', 'game', 'ringer.js'), 'utf8');
const mainSrc = readFileSync(join(ROOT, 'src', 'main.js'), 'utf8');
/* the frame loop's camera line, which this gate mirrors: it has to be in main.js word for word */
const HOLD = 'if (snapIt || !(G.place && G.place.live())) G.R.frameShot(G.rig, snapIt);';
ok(mainSrc.indexOf(HOLD) >= 0, 'main.js holds the camera while the place drag is live');
ok(mainSrc.indexOf("G.place = attachPlacement(canvas, G,") >= 0
  && mainSrc.indexOf("G.place = attachPlacement(") < mainSrc.indexOf('G.cam = attachCameraControls('),
  'main.js registers the place drag BEFORE the camera');
ok(/G\.knuckle\.state\(\)\.bracing/.test(mainSrc.slice(mainSrc.indexOf('G.cam = attachCameraControls('), mainSrc.indexOf('G.cam = attachCameraControls(') + 400)),
  'while braced the brace owns every finger (isClaimed)');
ok(!/attachPlacement\(canvas\) \{/.test(mainSrc), 'the old in-file attachPlacement is gone');

function makeCanvas(w, h) {
  const L = {};
  return {
    clientWidth: w, clientHeight: h,
    addEventListener(type, fn) { (L[type] = L[type] || []).push(fn); },
    getBoundingClientRect() { return { left: 0, top: 0, width: w, height: h, right: w, bottom: h }; },
    setPointerCapture() { }, releasePointerCapture() { }, hasPointerCapture() { return false; },
    dispatch(type, ev) { for (const fn of (L[type] || []).slice()) fn(ev); }
  };
}

function makeGame(o) {
  const W = o.w, H = o.h;
  const stage = { width: W, height: H };
  const rig = scene.createOrbitRig(stage, { target: { x: 0, y: 0.012, z: 0 }, distance: 2.2, elevationDeg: 33, fov: T.render.ringerCam.fov });
  rig.camera.updateMatrixWorld();
  const R = T.ringer.ringRadius, tawRadius = T.diameterMm.taw / 2000;
  const mibs = [{ x: 0, z: 0 }];
  for (let k = 1; k <= 3; k++) for (const [ux, uz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) mibs.push({ x: ux * k * T.ringer.crossSpacing, z: uz * k * T.ringer.crossSpacing });
  const a = o.placeAngle || 0;
  const world = { taw: { x: sin(a) * R, y: tawRadius, z: cos(a) * R }, phase: o.phase, placeAngle: a, simulating: false };
  const posOf = (Wd, id) => (id === 'taw' ? world.taw : mibs[+id.slice(1)]);
  const scope = [{ marbles: { has: () => true } }, () => ({ id: 'taw' }), posOf, () => ({ radius: tawRadius }),
    () => mibs.map((m, i) => ({ id: 'm' + i })), { bare: false }, T, frameFor, len2, { ringRadius: R },
    (M, ang) => ({ x: sin(ang) * M.ringRadius, z: cos(ang) * M.ringRadius }),
    (Wd, id, p) => { world.taw.x = p.x; world.taw.z = p.z; }, world];
  const mk = (name) => new Function('W', 'shooterTaw', 'positionOf', 'specOf', 'liveMibs', 'setup', 'T', 'frameFor', 'len2', 'M',
    'edgePosition', 'place', 'G', fnSrc(ringSrc, name) + '\nreturn ' + name + ';')(...scope);
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
    bombingAllowed: () => false,
    onBrace: (st) => { if (st.bracing && world.phase === 'place') world.phase = 'aim'; },
    onAim: () => { }, onCancel: () => { },
    enabled: () => true
  });
  G.knuckle.attach();
  G.pullback = createPullback(canvas, T, { taw: () => null, aimAzimuth: () => 0, groundFactor: () => 1, onAim: () => { }, onCancel: () => { }, enabled: () => false });
  G.pullback.attach();
  G.place = attachPlacement(canvas, G, { canAim });
  G.cam = attachCameraControls(canvas, G.rig, {
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
  return { G, world, canvas, rig, frame, taw: () => tawOnScreen(rig) };
}

const ev = (id, x, y, ts, list) => ({ pointerId: id, clientX: x, clientY: y, timeStamp: ts, pointerType: 'touch',
  preventDefault() { }, getCoalescedEvents() { return list || []; } });

/** one finger, Chrome on Android: 120 Hz samples, rAF aligned moves with coalesced lists */
function playTouch(game, path, dur, o) {
  const frameMs = 1000 / 60, sampleMs = 1000 / 120, id = o.id || 7, t0 = 1000;
  let t = t0 - 90 * frameMs;
  for (let i = 0; i < 90; i++) { CLOCK = t; game.frame(frameMs / 1000); t += frameMs; }
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
      game.frame(frameMs / 1000); o.each(false); nf += frameMs; continue;
    }
    break;
  }
  CLOCK = tEnd;
  if (pending.length) { const l = pending[pending.length - 1]; game.canvas.dispatch('pointermove', ev(id, l.clientX, l.clientY, l.timeStamp, pending.slice())); }
  const pe = path(dur);
  game.canvas.dispatch('pointerup', ev(id, pe.x, pe.y, tEnd));
  for (let i = 0; i < (o.post || 0); i++) { CLOCK = nf; game.frame(frameMs / 1000); o.each(true); nf += frameMs; }
}

/* 1. the place drag: 60 px to the left over 500 ms, off the shooter, at 412x839 and 360x780 */
for (const [w, h] of [[412, 839], [360, 780], [412, 915]]) {
  const g = makeGame({ w, h, phase: 'place' });
  let prevAim = null, maxStep = 0, off = 0, prevRing = null, dirs = new Set(), firstStep = null, maxUserAz = 0;
  let sx0 = null, sxEnd = null, maxStepDrag = 0;
  playTouch(g, (t) => ({ x: 300 - 60 * Math.min(1, t / 500), y: 500 }), 500, { post: 90, each: (post) => {
    const st = g.rig.state, aim = wrap(st.azimuth + Math.PI), ring = Math.atan2(g.world.taw.x, g.world.taw.z), ts = g.taw();
    if (!ts) off++;
    if (prevAim !== null) { const j = Math.abs(wrap(aim - prevAim)) * D; maxStep = Math.max(maxStep, j); if (!post) maxStepDrag = Math.max(maxStepDrag, j); }
    if (prevRing !== null) { const d = wrap(ring - prevRing); if (Math.abs(d) > 1e-9) dirs.add(Math.sign(d)); if (firstStep === null && !post) firstStep = Math.abs(d) * D; }
    if (!post && ts) { if (sx0 === null) sx0 = ts.x; sxEnd = ts.x; }
    maxUserAz = Math.max(maxUserAz, Math.abs(st.userAz || 0) * D);
    prevAim = aim; prevRing = ring;
  } });
  const tag = w + 'x' + h + ': ';
  ok(maxStep <= 3, tag + 'no aim change over 3 degrees in any frame (largest ' + maxStep.toFixed(2) + ', during the drag ' + maxStepDrag.toFixed(2) + '; shipped 42.4)');
  ok(off === 0, tag + 'the shooter is never off the screen (' + off + ' frames; shipped 25)');
  ok(dirs.size === 1, tag + 'its ring angle moves one way only');
  ok(sx0 !== null && sxEnd < sx0 - 5, tag + 'its screen x goes the finger\'s way (' + (sx0 || 0).toFixed(1) + ' to ' + (sxEnd || 0).toFixed(1) + ')');
  ok(maxUserAz < 1e-9, tag + 'userAz stays 0 (' + maxUserAz.toFixed(3) + ')');
  ok(firstStep !== null && firstStep < 1, tag + 'the first move does not jump (' + (firstStep || 0).toFixed(3) + ' degrees)');
}

/* 2. a still finger moves nothing */
{
  const g = makeGame({ w: 412, h: 839, phase: 'place' });
  const ring0 = Math.atan2(g.world.taw.x, g.world.taw.z);
  let maxAz = 0, az0 = null;
  playTouch(g, () => ({ x: 300, y: 500 }), 500, { each: () => { if (az0 === null) az0 = g.rig.state.azimuth; maxAz = Math.max(maxAz, Math.abs(wrap(g.rig.state.azimuth - az0)) * D); } });
  const ring1 = Math.atan2(g.world.taw.x, g.world.taw.z);
  ok(Math.abs(wrap(ring1 - ring0)) * D < 1e-6 && maxAz < 1e-6, 'a still finger moves neither the shooter (' + (Math.abs(wrap(ring1 - ring0)) * D).toFixed(4) + ') nor the camera (' + maxAz.toFixed(4) + ')');
}

/* 3. braced, a second finger drifting 30 px turns nothing */
{
  const g = makeGame({ w: 412, h: 839, phase: 'aim' });
  const frameMs = 1000 / 60;
  let t = 0;
  const tick = (n) => { for (let i = 0; i < n; i++) { CLOCK = t; g.frame(frameMs / 1000); t += frameMs; } };
  tick(90);
  const s = g.taw();
  CLOCK = t; g.canvas.dispatch('pointerdown', ev(1, s.x, s.y, t));
  tick(20);
  const braced = g.G.knuckle.state().bracing;
  const az0 = g.rig.state.azimuth;
  CLOCK = t; g.canvas.dispatch('pointerdown', ev(2, 100, 400, t));
  for (let k = 1; k <= 18; k++) { CLOCK = t; g.canvas.dispatch('pointermove', ev(2, 100 + 30 * k / 18, 400, t)); tick(1); g.canvas.dispatch('pointermove', ev(1, s.x, s.y, t)); }
  tick(10);
  const turned = Math.abs(wrap(g.rig.state.azimuth - az0)) * D;
  ok(braced, 'the thumb on the shooter braces');
  ok(turned < 0.1, 'braced, a second finger drifting 30 px turns the aim ' + turned.toFixed(3) + ' degrees (under 0.1; shipped 12.0)');
}

console.log(fails ? fails + ' FAILED' : 'PLACEMENT OK');
process.exit(fails ? 1 : 0);

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
import { HERE, ROOT, clock, T, D, wrap, mainSrc, makeGame, ev, playTouch } from './inputlab.mjs?v=20261105b';

let fails = 0;
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails++; };
const setClock = clock.set;

/* the frame loop's camera line, which this gate mirrors: it has to be in main.js word for word */
const HOLD = 'if (snapIt || !(G.place && G.place.live())) G.R.frameShot(G.rig, snapIt);';
ok(mainSrc.indexOf(HOLD) >= 0, 'main.js holds the camera while the place drag is live');
ok(mainSrc.indexOf("G.place = attachPlacement(canvas, G,") >= 0
  && mainSrc.indexOf("G.place = attachPlacement(") < mainSrc.indexOf('G.cam = attachCameraControls('),
  'main.js registers the place drag BEFORE the camera');
ok(/G\.knuckle\.state\(\)\.bracing/.test(mainSrc.slice(mainSrc.indexOf('G.cam = attachCameraControls('), mainSrc.indexOf('G.cam = attachCameraControls(') + 400)),
  'while braced the brace owns every finger (isClaimed)');
ok(!/attachPlacement\(canvas\) \{/.test(mainSrc), 'the old in-file attachPlacement is gone');


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
  const tick = (n) => { for (let i = 0; i < n; i++) { setClock(t); g.frame(frameMs / 1000); t += frameMs; } };
  tick(90);
  const s = g.taw();
  setClock(t); g.canvas.dispatch('pointerdown', ev(1, s.x, s.y, t));
  tick(20);
  const braced = g.G.knuckle.state().bracing;
  const az0 = g.rig.state.azimuth;
  setClock(t); g.canvas.dispatch('pointerdown', ev(2, 100, 400, t));
  for (let k = 1; k <= 18; k++) { setClock(t); g.canvas.dispatch('pointermove', ev(2, 100 + 30 * k / 18, 400, t)); tick(1); g.canvas.dispatch('pointermove', ev(1, s.x, s.y, t)); }
  tick(10);
  const turned = Math.abs(wrap(g.rig.state.azimuth - az0)) * D;
  ok(braced, 'the thumb on the shooter braces');
  ok(turned < 0.1, 'braced, a second finger drifting 30 px turns the aim ' + turned.toFixed(3) + ' degrees (under 0.1; shipped 12.0)');
}

/* 4. m3 step 2: a drag off the shooter in the aim phase turns the aim by the orbit gain, and the shooter stays put; so does a 2
   degree fine aim step, frame by frame while the camera eases (shipped 16 px) */
{
  const g = makeGame({ w: 412, h: 915, phase: 'aim' });
  ok(/orbitRadPerPx/.test(mainSrc.slice(mainSrc.indexOf('G.cam = attachCameraControls('), mainSrc.indexOf('G.cam = attachCameraControls(') + 400)), 'main.js hands the camera its gain from tuning');
  let t = 0; const frameMs = 1000 / 60, tick = (n, each) => { for (let i = 0; i < n; i++) { setClock(t); g.frame(frameMs / 1000); if (each) each(); t += frameMs; } };
  tick(90);
  const az0 = g.rig.state.azimuth, s0 = g.taw();
  setClock(t); g.canvas.dispatch('pointerdown', ev(5, 100, 300, t));
  for (let k = 1; k <= 20; k++) { setClock(t); g.canvas.dispatch('pointermove', ev(5, 100 + 5 * k, 300, t)); tick(1); }
  setClock(t); g.canvas.dispatch('pointerup', ev(5, 200, 300, t));
  tick(120);
  const turned = Math.abs(wrap(g.rig.state.azimuth - az0)) * D, s1 = g.taw();
  ok(Math.abs(turned - 20) <= 0.5, 'a 100 px drag turns the aim ' + turned.toFixed(2) + ' degrees (20 plus or minus 0.5)');
  ok(Math.abs(s1.x - s0.x) < 2 && Math.abs(s1.y - s0.y) < 2, 'the shooter stays where it is on the screen under the orbit (moved ' + (s1.x - s0.x).toFixed(1) + ', ' + (s1.y - s0.y).toFixed(1) + ' px)');
  const step = 2 * Math.PI / 180, s2 = g.taw();
  g.rig.state.userAz += step; g.rig.state.wantAzimuth += step;
  let worst = 0;
  tick(40, () => { const q = g.taw(); worst = Math.max(worst, Math.hypot(q.x - s2.x, q.y - s2.y)); });
  ok(worst < 1, 'a 2 degree fine aim step moves the shooter ' + worst.toFixed(2) + ' px at most while the camera eases (under 1; shipped 16)');
}

console.log(fails ? fails + ' FAILED' : 'PLACEMENT OK');
process.exit(fails ? 1 : 0);

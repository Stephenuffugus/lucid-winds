/**
 * Boot and the screen router.
 *
 * K0's game is one marble on a dirt disc: tap it and it goes, and you hear it
 * hit the ground. That is deliberately small. The physics under it already
 * passes its own break in the harness, which is the order the design insists on
 * (DESIGN 5.4): feel is validated numerically before it is validated visually.
 *
 * Each screen is a module exporting `enter(params)` and `exit()`. In K0 the two
 * screens live here; from K2 they are files in meta/ and game/.
 */
import { detectQuality } from './render/quality.js?v=20260904a';
import { createStage, createOrbitRig, resize, draw, THREE } from './render/scene.js?v=20260904a';
import { buildRingerGround } from './render/arenaEnv.js?v=20260904a';
import { makeMarbleMesh, makeContactShadow, placeContactShadow } from './render/marbleMesh.js?v=20260904a';
import { attachCameraControls } from './input/cameraCtl.js?v=20260904a';
import * as AUDIO from './audio/synth.js?v=20260904a';
import { initPhysics, createWorld, addSurface, addMarble, impulse, place, step, resolved, atRest, hash, specOf, positionOf, velocityOf } from './core/physics.js?v=20260904a';
import { makeStreams } from './core/rng.js?v=20260904a';
import { aimToImpulse, makeAim, dirFromDeg, powerForSpeed } from './core/snap.js?v=20260904a';
import { STARTER_ENTRIES } from './core/marbleBody.js?v=20260904a';

const $ = (id) => document.getElementById(id);
const TEST = /[?&]keepsiestest=1/.test(location.search);

const G = {
  tuning: null, tier: null, stage: null, rig: null, ground: null, cam: null,
  W: null, rng: null, meshes: new Map(), shadows: new Map(), prev: new Map(), taw: null,
  acc: 0, last: 0, raf: 0, screen: 'title', frames: 0, booted: false, freeCam: false
};

/* ------------------------------------------------------------------- boot */

async function boot() {
  const res = await fetch('src/data/tuning.json?v=20260904a');
  if (!res.ok) throw new Error('tuning.json did not load: ' + res.status);
  G.tuning = await res.json();
  AUDIO.configure(G.tuning);

  G.tier = detectQuality(G.tuning);
  const canvas = $('stage');
  G.stage = createStage(canvas, G.tuning, G.tier);
  // frame the TAW, not the ring centre. The first version of this pointed the
  // camera at the origin with the marble 0.55 m behind it, and the render gate
  // went green on a photograph of empty dirt: a green gate is not a look.
  // low and close, the angle you actually look at a marble from when you are
  // knuckled down over it: high enough to read the ground, low enough that the
  // horizon is in frame and the marble has something to be small against.
  G.rig = createOrbitRig(G.stage, { target: { x: 0, y: 0.011, z: 0.55 }, distance: 0.42, elevationDeg: 17, azimuth: 0 });
  G.ground = buildRingerGround(G.stage, G.tuning, { discRadius: 12 });

  await initPhysics();
  buildRange();

  G.cam = attachCameraControls(canvas, G.rig, { onTap: onTap });
  addEventListener('resize', () => { if (resize(G.stage)) drawNow(); });
  if (window.visualViewport) visualViewport.addEventListener('resize', () => { if (resize(G.stage)) drawNow(); });

  $('boot').hidden = true;
  showScreen('title');
  G.booted = true;
  G.last = performance.now();
  G.raf = requestAnimationFrame(frame);
  if (TEST) installDevHook();
}

/** One taw on the dirt, at real scale. 22 mm, and it looks 22 mm. */
function buildRange() {
  G.W = createWorld(G.tuning, { ringRadius: G.tuning.ringer.ringRadius });
  addSurface(G.W, { kind: 'dirt', box: { hx: 5, hy: 0.05, hz: 5 }, pos: { x: 0, y: -0.05, z: 0 } });
  G.rng = makeStreams(20260904);
  const entry = Object.assign({}, STARTER_ENTRIES.taw_clearie, {
    render: { recipe: 'clearGlass', palette: ['#2b4a6b', '#9fc9e8', '#e8f2ff'] }
  });
  G.taw = addMarble(G.W, entry, { x: 0, z: 0.55 }, 'taw-1');
  const spec = specOf(G.W, G.taw);
  const mesh = makeMarbleMesh(entry, spec, G.tuning, G.tier, 'taw-1');
  G.stage.scene.add(mesh);
  const sh = makeContactShadow(spec.radius);
  G.stage.scene.add(sh);
  G.shadows.set(G.taw, sh);
  G.meshes.set(G.taw, mesh);
  G.prev.set(G.taw, { p: new THREE.Vector3(0, spec.radius, 0.55), q: new THREE.Quaternion() });
}

/* ----------------------------------------------------------------- screens */

function showScreen(name) {
  G.screen = name;
  $('title').hidden = name !== 'title';
  $('hud').hidden = name !== 'range';
}

function startRange() {
  AUDIO.unlock();
  showScreen('range');
  resetTaw();
}

function resetTaw() {
  place(G.W, G.taw, { x: 0, z: 0.55 });
  G.W.shotT = 999;
  syncMeshes(1);
}

/* ------------------------------------------------------------------- input */

/**
 * K0's shot: a tap sends the taw away from the camera at a middling snap. The
 * real Knuckle, with its brace, its thumb speed and its contact offset, is K1;
 * this exists so the physics can be seen and heard before it is played.
 */
function onTap(cx, cy) {
  if (G.screen !== 'range') return;
  AUDIO.unlock();
  const az = G.rig.state.azimuth;
  const dir = { x: -Math.sin(az), y: 0, z: -Math.cos(az) };
  const aim = makeAim({ dir, power01: powerForSpeed(2.6, G.tuning), coneDegOverride: 1.5 });
  const imp = aimToImpulse(aim, specOf(G.W, G.taw), G.tuning, G.rng.match);
  impulse(G.W, G.taw, imp);
  if (navigator.vibrate) { try { navigator.vibrate(8); } catch (e) { } }
  const hud = $('hudLine');
  if (hud) hud.textContent = 'snap at ' + imp.speed.toFixed(2) + ' metres a second';
}

/* -------------------------------------------------------------------- loop */

function physStep() {
  for (const [id, mesh] of G.meshes) {
    const p = positionOf(G.W, id);
    const b = G.W.marbles.get(id).body.rotation();
    const pr = G.prev.get(id);
    pr.p.set(p.x, p.y, p.z);
    pr.q.set(b.x, b.y, b.z, b.w);
  }
  const events = step(G.W);
  if (events.length) {
    AUDIO.playContacts(events, (id) => {
      const m = G.W.marbles.get(id);
      return m ? m.spec : null;
    });
  }
}

function syncMeshes(alpha) {
  for (const [id, mesh] of G.meshes) {
    const m = G.W.marbles.get(id);
    if (!m) continue;
    const p = m.body.translation(), r = m.body.rotation();
    const pr = G.prev.get(id);
    mesh.position.set(
      pr.p.x + (p.x - pr.p.x) * alpha,
      pr.p.y + (p.y - pr.p.y) * alpha,
      pr.p.z + (p.z - pr.p.z) * alpha
    );
    mesh.quaternion.set(r.x, r.y, r.z, r.w);
    const sh = G.shadows.get(id);
    if (sh) placeContactShadow(sh, mesh.position.x, mesh.position.y, mesh.position.z, m.spec.radius);
  }
}

function drawNow() {
  G.rig.update(1 / 60);
  draw(G.stage, G.rig);
}

function frame(now) {
  G.raf = requestAnimationFrame(frame);
  const dt = Math.min(0.25, (now - G.last) / 1000);
  G.last = now;
  const h = G.tuning.physics.fixedStep;
  const maxSteps = G.tuning.physics.maxSubstepsPerFrame;
  G.acc += dt;
  let n = 0;
  while (G.acc >= h && n < maxSteps) { G.acc -= h; physStep(); n++; }
  // ⛔ a tab that was in the background comes back with a full accumulator and
  // would otherwise simulate the missing minute in one frame. Drop the debt.
  if (G.acc > h * maxSteps) G.acc = 0;
  syncMeshes(G.acc / h);
  if (!G.freeCam) {
    const m = G.meshes.get(G.taw);
    if (m) G.rig.setTarget(m.position.x, m.position.y, m.position.z);
  }
  G.rig.update(dt);
  draw(G.stage, G.rig);
  G.frames++;
}

/* ---------------------------------------------------------------- dev hook */

function installDevHook() {
  window.KEEPSIES_DEV = {
    state() {
      return {
        screen: G.screen, frames: G.frames, quality: G.tier.name,
        marbles: G.W.marbles.size, t: G.W.t, steps: G.W.steps,
        resolved: resolved(G.W), atRest: atRest(G.W), hash: hash(G.W),
        taw: positionOf(G.W, G.taw), tawVel: velocityOf(G.W, G.taw),
        audio: AUDIO.isRunning()
      };
    },
    tick(n) { for (let i = 0; i < (n || 60); i++) physStep(); syncMeshes(0); return G.W.steps; },
    snap(aimSource) {
      const aim = makeAim(aimSource || { dir: dirFromDeg(180), power01: 0.5 });
      const imp = aimToImpulse(aim, specOf(G.W, G.taw), G.tuning, G.rng.match);
      impulse(G.W, G.taw, imp);
      return imp;
    },
    scenario(name) { if (name === 'range') { resetTaw(); return true; } return false; },
    /** Put the camera exactly where a tester wants it, including under the floor. */
    camera(azimuthDeg, elevationDeg, distance, opts) {
      G.freeCam = true;
      const st = G.rig.state;
      st.allowUnder = !!(opts && opts.allowUnder);
      st.azimuth = st.wantAzimuth = azimuthDeg * Math.PI / 180;
      st.elevationDeg = elevationDeg;
      st.distance = st.wantDistance = distance;
      G.rig.update(1 / 60);
      return { azimuthDeg, elevationDeg: st.elevationDeg, distance, clamped: !st.allowUnder };
    },
    followTaw() { G.freeCam = false; },
    start: startRange,
    reset: resetTaw
  };
}

/* --------------------------------------------------------------------- go */

window.addEventListener('error', (e) => {
  const b = $('boot');
  if (b && !G.booted) { b.hidden = false; b.textContent = 'Keepsies could not start: ' + (e.message || 'unknown'); }
});

$('play').addEventListener('click', startRange);
boot().catch((e) => {
  const b = $('boot');
  if (b) { b.hidden = false; b.textContent = 'Keepsies could not start: ' + e.message; }
  console.error(e);
});

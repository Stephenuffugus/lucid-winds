/* Probe 04 (Opus, K0): the three Rapier features the plan REQUIRES and that
 * Fable's probes 01 to 03 never touched, proven on the DETERMINISTIC build we
 * actually vendored, before a line of game code rides on them.
 *
 *   1. ColliderDesc.trimesh          arenas (K3) are trimeshes
 *   2. world.takeSnapshot()          the AI planner samples from a snapshot
 *   3. World.restoreSnapshot(bytes)  ... and restores it per candidate
 *      3b. does restore preserve rigid body HANDLES? the wrapper's id map
 *          depends on it
 *   4. determinism of the deterministic build, run to run, on this box
 *   5. cost of a step, for the AI budget arithmetic in HANDOFF 4.3
 *
 * Run: node sim/probes/04_det_build_smoke.mjs   (from satellites/keepsies)
 */
import RAPIER from '../../lib/rapier.js';

await RAPIER.init();
console.log('rapier (deterministic-compat)', RAPIER.version());

function build() {
  const w = new RAPIER.World({ x: 0, y: -9.81, z: 0 });
  w.timestep = 1 / 120;
  // 1. a trimesh floor: two triangles making a 4 m square at y = 0
  const verts = new Float32Array([-2, 0, -2, 2, 0, -2, 2, 0, 2, -2, 0, 2]);
  const idx = new Uint32Array([0, 1, 2, 0, 2, 3]);
  const floorBody = w.createRigidBody(RAPIER.RigidBodyDesc.fixed());
  w.createCollider(RAPIER.ColliderDesc.trimesh(verts, idx).setFriction(0.55).setRestitution(0.35), floorBody);
  const ids = [];
  for (let i = 0; i < 6; i++) {
    const rb = w.createRigidBody(RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(-0.3 + i * 0.12, 0.008 + i * 0.004, 0)
      .setLinearDamping(0.02).setAngularDamping(0.02).setCcdEnabled(true));
    w.createCollider(RAPIER.ColliderDesc.ball(0.008).setDensity(2500).setFriction(0.30).setRestitution(0.78), rb);
    ids.push(rb.handle);
  }
  return { w, ids };
}

function fingerprint(w) {
  let h = 2166136261 >>> 0;
  const mix = (n) => { h ^= n | 0; h = Math.imul(h, 16777619) >>> 0; };
  w.bodies.forEach((b) => {
    const p = b.translation(), r = b.rotation(), v = b.linvel();
    for (const n of [p.x, p.y, p.z, r.x, r.y, r.z, r.w, v.x, v.y, v.z]) mix(Math.round(n * 1e6));
  });
  return ('00000000' + h.toString(16)).slice(-8);
}

// 1 + 4: trimesh floor holds the marbles up, and two runs agree
function run(steps) {
  const { w } = build();
  const t0 = process.hrtime.bigint();
  for (let s = 0; s < steps; s++) w.step();
  const ms = Number(process.hrtime.bigint() - t0) / 1e6;
  let minY = 9;
  w.bodies.forEach((b) => { if (b.isDynamic()) minY = Math.min(minY, b.translation().y); });
  return { fp: fingerprint(w), ms, minY };
}
const a = run(360), b = run(360);
console.log('1. trimesh floor      lowest marble centre y =', a.minY.toFixed(5),
  a.minY > 0.006 ? 'PASS (nothing fell through)' : 'FAIL');
console.log('4. determinism        ', a.fp, b.fp, a.fp === b.fp ? 'PASS' : 'FAIL');
console.log('5. cost               ', (a.ms / 360).toFixed(3), 'ms per step for 6 marbles on a trimesh');

// 2 + 3 + 3b: snapshot, restore, handles, and does a restored world diverge?
const live = build();
for (let s = 0; s < 60; s++) live.w.step();
const bytes = live.w.takeSnapshot();
console.log('2. takeSnapshot       ', bytes.length, 'bytes', bytes.length > 0 ? 'PASS' : 'FAIL');
const fpAtSnap = fingerprint(live.w);

const restored = RAPIER.World.restoreSnapshot(bytes);
console.log('3. restoreSnapshot    ', fingerprint(restored) === fpAtSnap ? 'PASS (identical state)' : 'FAIL');

let handlesOk = true;
for (const h of live.ids) {
  const rb = restored.getRigidBody(h);
  if (!rb) { handlesOk = false; break; }
  const p0 = live.w.getRigidBody(h).translation(), p1 = rb.translation();
  if (Math.round(p0.x * 1e6) !== Math.round(p1.x * 1e6)) { handlesOk = false; break; }
}
console.log('3b. handles preserved ', handlesOk ? 'PASS' : 'FAIL');

// and the restored world must step identically to the live one
for (let s = 0; s < 120; s++) { live.w.step(); restored.step(); }
console.log('3c. restored diverges?', fingerprint(live.w) === fingerprint(restored) ? 'PASS (identical after 120 more steps)' : 'FAIL');

// restoring twice from the same bytes must give the same thing (the AI does this 24 times a turn)
const r2 = RAPIER.World.restoreSnapshot(bytes);
for (let s = 0; s < 120; s++) r2.step();
console.log('3d. restore is reusable', fingerprint(r2) === fingerprint(restored) ? 'PASS' : 'FAIL');

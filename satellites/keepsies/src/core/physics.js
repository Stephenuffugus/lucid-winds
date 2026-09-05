/**
 * The Rapier world wrapper. Zero DOM, zero three.js: this file runs unchanged in
 * Node, in the AI worker, in the Practice Ring worker and (Phase 4) on a server.
 *
 * THREE THINGS THAT COST SOMEBODY A DAY, WRITTEN DOWN SO THEY DO NOT AGAIN:
 *
 * 1. Rapier has NO rolling resistance and no spinning friction either. Linear damping is v /= (1 + dt*c), which
 *    is exponential: a marble never stops and never carries. Real marbles roll
 *    under a roughly constant deceleration. So every step applies
 *        F = -min(mu_r * m * g, |v| * m / dt) * v_hat
 *    to every awake marble touching a surface. The min is what stops the force
 *    reversing a marble that is already nearly still.
 * 2. addForce is PERSISTENT in Rapier. Without resetForces(true) FIRST it
 *    accumulates every step and brakes the whole scene to a stop. Fable's first
 *    sweep did exactly that and knocked nothing out of the ring at any setting
 *    (sim/probes/03_sweep_run1_BUGGED_persistent_force.txt).
 * 3. The design's break (3.5 m/s, damping 0.18) knocks out ZERO mibs. The
 *    numbers that work are in tuning.json and were measured, not guessed
 *    (HANDOFF-KEEPSIES 4.1).
 * 4. ⛔⛔ RAPIER HARD CLAMPS ANGULAR VELOCITY TO PI/4 RADIANS PER STEP. At 1/120
 *    that is 94.25 rad/s, measured in a vacuum with nothing touching, and there
 *    is no integration parameter for it. A 22 mm taw rolling at 2.6 m/s needs
 *    236 rad/s, so at any real shooting speed a marble in this engine CANNOT
 *    spin fast enough to roll, let alone carry backspin. Setting kBack anywhere
 *    from 1.25 to 13 produced byte identical results because every one of them
 *    was clamped to the same number.
 *
 *    So the floor contact is OURS. Every marble carries its own unclamped `spin`
 *    here; the patch model below decides whether it is sliding or rolling and
 *    applies the friction force and the torque itself; and Rapier's angvel is
 *    written from that each step, clamped, for rendering and for marble on
 *    marble contact only. The floor's own friction is set to zero in Rapier with
 *    a Min combine rule so nothing is counted twice.
 *
 *    What that costs, stated plainly: spin picked up FROM a marble on marble
 *    collision is overwritten rather than read back, so billiards style throw
 *    between two marbles is not modelled. A struck mib arrives with no spin, its
 *    patch slips, and friction spins it up to rolling, which is right. The taw
 *    keeps the spin it was snapped with straight through the collision, which is
 *    the effect the whole input scheme exists to give the player.
 */
import RAPIER from '../../lib/rapier.js';
import { len2, len3 } from './dmath.js?v=20260905a';
import { bodySpec } from './marbleBody.js?v=20260905a';

let _ready = false;

/** Load the wasm once. Everything else in this file is synchronous. */
export async function initPhysics() {
  if (!_ready) { await RAPIER.init(); _ready = true; }
  return RAPIER;
}

/** True once initPhysics has resolved. */
export function isReady() { return _ready; }

/** The vendored engine, for the rare caller that needs a raw type. */
export function engine() { return RAPIER; }

/**
 * @typedef {{a:number, b:number|null, surface:string|null, relSpeed:number,
 *   normal:{x:number,y:number,z:number}, point:{x:number,y:number,z:number}, t:number}} ContactEvent
 */

/**
 * @param {object} tuning parsed tuning.json
 * @param {{ringRadius?:number}} [opts]
 */
export function createWorld(tuning, opts) {
  if (!_ready) throw new Error('physics: call await initPhysics() before createWorld');
  const t = tuning.physics;
  const world = new RAPIER.World({ x: 0, y: t.gravityY, z: 0 });
  world.timestep = t.fixedStep;
  // Rapier's default tolerances assume objects about a metre across and allow
  // 5 mm of penetration. Our marbles are 16 mm, so that default lets a third of
  // a mib sink into the floor. lengthUnit tells the solver how big a typical
  // object here really is and scales every tolerance with it.
  if (t.lengthUnit) world.integrationParameters.lengthUnit = t.lengthUnit;
  return {
    rapier: world,
    tuning,
    queue: new RAPIER.EventQueue(true),
    marbles: new Map(),      // id -> marble record
    byCollider: new Map(),   // collider handle -> marble id
    statics: new Map(),      // collider handle -> {kind, normal, rollingMu}
    events: /** @type {ContactEvent[]} */ ([]),
    ringRadius: (opts && opts.ringRadius) || tuning.ringer.ringRadius,
    dt: t.fixedStep,   // the world's OWN step, see setTimestep
    t: 0,
    shotT: 0,
    steps: 0,
    nextId: 1,
    restedFor: 0,
    _pre: []
  };
}

/**
 * Change a world's step. The AI's candidates run at 1/60 while the match always
 * resolves at 1/120, and a guess is allowed to be coarser than the record.
 *
 * ⛔ Both numbers have to move together. The first version set Rapier's timestep
 * and left `step()` integrating its own forces at the tuning's 1/120, so every
 * rolling resistance cap and every spin update in a candidate was half of what
 * the real shot would do, and the planner was predicting a game it was not
 * playing.
 */
export function setTimestep(W, dt) {
  W.dt = dt;
  W.rapier.timestep = dt;
}

/**
 * Write a marble's true spin into Rapier, clamped to what the engine will accept.
 * The clamp is pi/4 radians per step and is not negotiable; above it the marble
 * simply renders as a blur, which is what a marble at that speed looks like.
 */
function pushSpin(m, dt) {
  const w = m.spin;
  const mag = len3(w.x, w.y, w.z);
  const cap = 0.7853981633974483 / dt;
  if (mag <= cap) { m.body.setAngvel({ x: w.x, y: w.y, z: w.z }, false); return; }
  const k = cap / mag;
  m.body.setAngvel({ x: w.x * k, y: w.y * k, z: w.z * k }, false);
}

/** Free the wasm memory this world holds. Call it when a match or a candidate ends. */
export function disposeWorld(W) {
  if (!W || !W.rapier) return;
  W.queue.free();
  W.rapier.free();
  W.rapier = null;
  W.marbles.clear();
  W.byCollider.clear();
  W.statics.clear();
}

/**
 * A floor. `spec.kind` names a row of tuning.surface; give it either
 * `{box:{hx,hy,hz,pos}}` (the dirt slab) or `{trimesh:{vertices,indices}}` (arenas).
 */
export function addSurface(W, spec) {
  const s = W.tuning.surface[spec.kind];
  if (!s) throw new Error('physics: unknown surface "' + spec.kind + '"');
  const body = W.rapier.createRigidBody(RAPIER.RigidBodyDesc.fixed()
    .setTranslation(spec.pos ? spec.pos.x : 0, spec.pos ? spec.pos.y : 0, spec.pos ? spec.pos.z : 0));
  let desc;
  if (spec.trimesh) {
    desc = RAPIER.ColliderDesc.trimesh(spec.trimesh.vertices, spec.trimesh.indices);
  } else {
    const b = spec.box || { hx: 5, hy: 0.05, hz: 5 };
    desc = RAPIER.ColliderDesc.cuboid(b.hx, b.hy, b.hz);
  }
  /* Friction ZERO with a Min combine rule, so marble on floor friction is ours
     alone (scar 4) while marble on marble keeps Rapier's own averaging. The
     surface's real friction is still in tuning.json and is still used; it is just
     used by the patch model in step() instead of by the solver. */
  desc.setFriction(0).setFrictionCombineRule(RAPIER.CoefficientCombineRule.Min)
    .setRestitution(s.restitution)
    .setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS);
  const col = W.rapier.createCollider(desc, body);
  W.statics.set(col.handle, {
    kind: spec.kind,
    rollingMu: s.rollingMu,
    spinningMu: s.spinningMu == null ? s.rollingMu : s.spinningMu,
    friction: s.friction,
    normal: spec.normal || { x: 0, y: 1, z: 0 }
  });
  return col.handle;
}

/**
 * @param {object} W
 * @param {object} entry a catalog entry
 * @param {{x:number,y?:number,z:number}} pos y defaults to resting on y = 0
 * @param {string} [uid] the collection instance this marble is
 * @returns {number} the marble id inside this world
 */
export function addMarble(W, entry, pos, uid) {
  const spec = bodySpec(entry, W.tuning);
  const t = W.tuning.physics;
  const rb = W.rapier.createRigidBody(RAPIER.RigidBodyDesc.dynamic()
    .setTranslation(pos.x, pos.y == null ? spec.radius : pos.y, pos.z)
    .setLinearDamping(t.linearDamping)
    .setAngularDamping(t.angularDamping)
    .setCcdEnabled(true));
  const col = W.rapier.createCollider(RAPIER.ColliderDesc.ball(spec.radius)
    .setDensity(spec.density)
    .setFriction(spec.friction)
    .setRestitution(spec.restitution)
    .setActiveEvents(RAPIER.ActiveEvents.COLLISION_EVENTS), rb);
  const id = W.nextId++;
  W.marbles.set(id, {
    id, uid: uid || ('m' + id), entryId: entry.id, entry, spec,
    body: rb, collider: col,
    surfaces: new Set(), // static collider handles this marble is touching
    spin: { x: 0, y: 0, z: 0 }, // the TRUE angular velocity, unclamped. See scar 4.
    out: false
  });
  W.byCollider.set(col.handle, id);
  return id;
}

/** Remove a marble from the world (pocketed, shattered, ringed out). */
export function removeMarble(W, id) {
  const m = W.marbles.get(id);
  if (!m) return;
  W.byCollider.delete(m.collider.handle);
  W.rapier.removeRigidBody(m.body);
  W.marbles.delete(id);
}

/** Mass in kg. */
export function massOf(W, id) { return W.marbles.get(id).spec.mass; }
/** Moment of inertia of the solid sphere, kg m^2. */
export function inertiaOf(W, id) { return W.marbles.get(id).spec.inertia; }
/** The body spec (radius, density, hardness, ...). */
export function specOf(W, id) { return W.marbles.get(id).spec; }
/** Position, as a plain object. */
export function positionOf(W, id) { const p = W.marbles.get(id).body.translation(); return { x: p.x, y: p.y, z: p.z }; }
/** Linear velocity, as a plain object. */
export function velocityOf(W, id) { const v = W.marbles.get(id).body.linvel(); return { x: v.x, y: v.y, z: v.z }; }

/**
 * Apply an impulse. `lin` is a LINEAR IMPULSE in kg m/s and `ang` an ANGULAR
 * IMPULSE in kg m^2/s, which is what the words mean; `core/snap.js` multiplies a
 * launch speed by mass and a spin by inertia to get here. Starts the shot clock.
 */
export function impulse(W, id, imp) {
  const m = W.marbles.get(id);
  if (!m) throw new Error('physics: impulse to unknown marble ' + id);
  m.body.wakeUp();
  if (imp.lin) m.body.applyImpulse({ x: imp.lin.x, y: imp.lin.y || 0, z: imp.lin.z }, true);
  if (imp.ang) {
    // straight into OUR spin, never applyTorqueImpulse: Rapier would clamp it to
    // 94 rad/s and every snap would carry the same spin as every other (scar 4)
    const inv = 1 / m.spec.inertia;
    m.spin.x += imp.ang.x * inv;
    m.spin.y += imp.ang.y * inv;
    m.spin.z += imp.ang.z * inv;
    pushSpin(m, W.tuning.physics.fixedStep);
  }
  W.shotT = 0;
  W.restedFor = 0;
}

/** Place a marble exactly (setup, the taw returning to the edge). */
export function place(W, id, pos, opts) {
  const m = W.marbles.get(id);
  m.body.setTranslation({ x: pos.x, y: pos.y == null ? m.spec.radius : pos.y, z: pos.z }, true);
  if (!opts || opts.zeroVelocity !== false) {
    m.body.setLinvel({ x: 0, y: 0, z: 0 }, true);
    m.body.setAngvel({ x: 0, y: 0, z: 0 }, true);
    m.spin.x = m.spin.y = m.spin.z = 0;
  }
}

/**
 * One fixed step. Order matters and is the order of the three scars at the top:
 * reset forces, apply rolling resistance, step, read events, keep the sleep book.
 */
export function step(W) {
  const tun = W.tuning.physics;
  const dt = W.dt;
  const g = -tun.gravityY;
  W.events.length = 0;

  // pre step state: a closing speed is measured before the solver has answered it
  const pre = W._pre;
  pre.length = 0;
  for (const m of W.marbles.values()) {
    const p = m.body.translation(), v = m.body.linvel();
    pre.push({ id: m.id, px: p.x, py: p.y, pz: p.z, vx: v.x, vy: v.y, vz: v.z });
  }

  for (const m of W.marbles.values()) {
    const body = m.body;
    // ⛔ addForce AND addTorque are persistent in Rapier. These two lines are not optional.
    body.resetForces(true);
    body.resetTorques(true);
    if (body.isSleeping()) { m.spin.x = m.spin.y = m.spin.z = 0; continue; }
    const v = body.linvel();
    const speed = len3(v.x, v.y, v.z);
    body.enableCcd(speed > tun.ccdAboveSpeed);
    if (m.surfaces.size === 0) { pushSpin(m, dt); continue; } // in the air, spin just persists
    let mu = 0, spinMu = 0, kinMu = 0, nx = 0, ny = 1, nz = 0;
    for (const h of m.surfaces) {
      const s = W.statics.get(h);
      if (!s) continue;
      if (s.rollingMu > mu) { mu = s.rollingMu; nx = s.normal.x; ny = s.normal.y; nz = s.normal.z; }
      if (s.spinningMu > spinMu) spinMu = s.spinningMu;
      const k = (m.spec.friction + s.friction) * 0.5;   // Rapier's own average rule, kept
      if (k > kinMu) kinMu = k;
    }
    const mass = m.spec.mass;
    const inertia = m.spec.inertia;
    const R = m.spec.radius;
    const w = m.spin;

    /* THE CONTACT PATCH. This is where backspin becomes a stop shot.
     *
     * The vector from the centre to the ground contact is -R*n, so the material
     * at the contact is moving at  u = v + w x (-R*n). If that is not zero the
     * marble is SLIDING and Coulomb friction acts on the patch, which both slows
     * the marble and torques its spin toward rolling. A marble snapped with
     * backspin arrives with its patch moving FORWARD faster than the marble, so
     * friction pushes backward hard: it digs in and sits down. That is Sticking,
     * and it is the reason the Knuckle reads where the snap crossed the ball.
     *
     * The force is capped so one step can never overshoot the slip and reverse
     * it: for a solid sphere the patch speed falls at (1/m + R^2/I)|F| and
     * R^2/I is 2.5/m, hence the 3.5. */
    const rcx = -R * nx, rcy = -R * ny, rcz = -R * nz;
    let ux = v.x + (w.y * rcz - w.z * rcy);
    let uy = v.y + (w.z * rcx - w.x * rcz);
    let uz = v.z + (w.x * rcy - w.y * rcx);
    const un = ux * nx + uy * ny + uz * nz;
    ux -= un * nx; uy -= un * ny; uz -= un * nz;
    const slip = len3(ux, uy, uz);

    if (slip > tun.slipEpsilon && kinMu > 0) {
      const load = mass * g;
      const cap = slip * mass / (3.5 * dt);
      const fmag = Math.min(kinMu * load, cap);
      const fx = -(ux / slip) * fmag, fy = -(uy / slip) * fmag, fz = -(uz / slip) * fmag;
      body.addForce({ x: fx, y: 0, z: fz }, true);
      // the same force at the patch is a torque about the centre
      const k = dt / inertia;
      w.x += (rcy * fz - rcz * fy) * k;
      w.y += (rcz * fx - rcx * fz) * k;
      w.z += (rcx * fy - rcy * fx) * k;
    } else {
      // rolling. The spin is whatever rolling without slipping demands, plus a
      // yaw about the contact normal that nothing else brakes.
      const wn = w.x * nx + w.y * ny + w.z * nz;
      const rollx = (ny * v.z - nz * v.y) / R;
      const rolly = (nz * v.x - nx * v.z) / R;
      const rollz = (nx * v.y - ny * v.x) / R;
      let keep = wn;
      if (spinMu > 0) {
        const rate = spinMu * mass * g * R / inertia;   // rad per second per second
        const mag = keep < 0 ? -keep : keep;
        const left = mag - rate * dt;
        keep = left <= 0 ? 0 : (keep < 0 ? -left : left);
      }
      w.x = rollx + nx * keep;
      w.y = rolly + ny * keep;
      w.z = rollz + nz * keep;

      // rolling resistance: a roughly constant deceleration along the floor,
      // which is what a real marble feels and what Rapier does not have
      const sp = len2(v.x, v.z);
      if (mu > 0 && sp >= 1e-6) {
        const brake = mu * mass * g;
        const most = sp * mass / dt;       // never reverse a marble that is nearly still
        const f = brake < most ? brake : most;
        body.addForce({ x: (-v.x / sp) * f, y: 0, z: (-v.z / sp) * f }, true);
      }
    }
    pushSpin(m, dt);
  }

  W.rapier.step(W.queue);

  const byId = new Map();
  for (const p of pre) byId.set(p.id, p);
  W.queue.drainCollisionEvents((h1, h2, started) => {
    const a = W.byCollider.get(h1);
    const b = W.byCollider.get(h2);
    const sa = W.statics.get(h1);
    const sb = W.statics.get(h2);
    const marbleId = a != null ? a : b;
    const stat = a != null ? sb : sa;
    const statHandle = a != null ? h2 : h1;

    if (marbleId != null && stat) {
      const m = W.marbles.get(marbleId);
      if (m) {
        if (started) m.surfaces.add(statHandle);
        else m.surfaces.delete(statHandle);
      }
      if (started) {
        const p = byId.get(marbleId);
        if (p) {
          const n = stat.normal;
          const closing = -(p.vx * n.x + p.vy * n.y + p.vz * n.z);
          W.events.push({
            a: marbleId, b: null, surface: stat.kind,
            relSpeed: closing > 0 ? closing : -closing,
            normal: { x: n.x, y: n.y, z: n.z },
            point: { x: p.px - n.x * m.spec.radius, y: p.py - n.y * m.spec.radius, z: p.pz - n.z * m.spec.radius },
            t: W.t
          });
        }
      }
      return;
    }

    if (a != null && b != null && started) {
      // two spheres: the centre line IS the contact normal, exactly, and it is
      // known from the positions before the step, which is what closing speed wants
      const pa = byId.get(a), pb = byId.get(b);
      if (!pa || !pb) return;
      const dx = pb.px - pa.px, dy = pb.py - pa.py, dz = pb.pz - pa.pz;
      const L = len3(dx, dy, dz);
      if (L < 1e-9) return;
      const nx = dx / L, ny = dy / L, nz = dz / L;
      const rx = pa.vx - pb.vx, ry = pa.vy - pb.vy, rz = pa.vz - pb.vz;
      const closing = rx * nx + ry * ny + rz * nz;
      const ra = W.marbles.get(a).spec.radius;
      W.events.push({
        a, b, surface: null,
        relSpeed: closing > 0 ? closing : -closing,
        normal: { x: nx, y: ny, z: nz },
        point: { x: pa.px + nx * ra, y: pa.py + ny * ra, z: pa.pz + nz * ra },
        t: W.t
      });
    }
  });

  // the sleep book. A marble counts as at rest when Rapier has parked it, or
  // when it is under both thresholds; rolling couples spin to speed, so a marble
  // that is still crawling is still spinning and neither test alone is enough.
  let allRest = true;
  for (const m of W.marbles.values()) {
    if (m.body.isSleeping()) continue;
    const v = m.body.linvel(), w = m.spin;
    if (len3(v.x, v.y, v.z) > tun.sleepLinear || len3(w.x, w.y, w.z) > tun.sleepAngular) { allRest = false; break; }
  }
  W.restedFor = allRest ? W.restedFor + dt : 0;
  W.t += dt;
  W.shotT += dt;
  W.steps++;
  return W.events;
}

/**
 * Has the shot finished? Either everything has been at rest for restedSeconds,
 * or the cap has run out. Never true in the first instants of a shot.
 */
export function resolved(W) {
  const tun = W.tuning.physics;
  if (W.shotT >= tun.resolveCapSeconds) return true;
  return W.shotT >= tun.restedSeconds && W.restedFor >= tun.restedSeconds;
}

/** True when every marble is at rest, ignoring the shot clock. */
export function atRest(W) {
  return W.restedFor >= W.tuning.physics.restedSeconds;
}

/**
 * The state fingerprint. Positions, rotations, velocities and the sleep flag,
 * quantised to 1e-6 and folded with FNV-1a. Two runs of the same input log on
 * two machines must produce this same string or Phase 4 is a lie.
 */
export function hash(W) {
  let h = 2166136261 >>> 0;
  const mix = (n) => { h ^= (n | 0); h = Math.imul(h, 16777619) >>> 0; };
  const ids = [...W.marbles.keys()].sort((x, y) => x - y);
  mix(ids.length);
  for (const id of ids) {
    const m = W.marbles.get(id);
    const p = m.body.translation(), r = m.body.rotation(), v = m.body.linvel();
    mix(id);
    for (const n of [p.x, p.y, p.z, r.x, r.y, r.z, r.w, v.x, v.y, v.z,
      m.spin.x, m.spin.y, m.spin.z]) mix(quantise(n));
    mix(m.body.isSleeping() ? 1 : 0);
  }
  return ('00000000' + h.toString(16)).slice(-8);
}

/**
 * A number, to a micrometre, as a 32 bit integer.
 *
 * ⛔ The obvious `Math.round(n * 1e6) | 0` GOES BLIND on a marble that has left
 * the world. A body in unbounded free fall reaches y of minus ten thousand and
 * beyond; ToInt32 of a float that large has no low bits left, so every such
 * marble hashes to the same 0 and a real divergence stops registering. The
 * replay self test caught this: 16 of 20 seeds failed to notice injected noise,
 * because their taw had rolled off the floor and been falling ever since.
 * The modulo keeps the low bits (n * 1e6 is an exact integer up to 1e9 metres)
 * and anything past that is a deterministic marker, not a silent zero.
 */
function quantise(n) {
  if (n !== n) return 0x4e614e;                       // NaN
  if (n > 1e9) return 0x7ffffff1;
  if (n < -1e9) return -0x7ffffff1;
  return (Math.round(n * 1e6) % 4294967296) | 0;
}

/* ---- snapshot and restore: the AI samples 24 candidates from one of these ---- */

const _enc = new TextEncoder();
const _dec = new TextDecoder();

/**
 * Serialise the whole world. The bytes carry a small JSON header with the marble
 * bookkeeping the engine's own snapshot does not know about, so `restore` needs
 * nothing but the bytes and the tuning.
 * @returns {Uint8Array}
 */
export function snapshot(W) {
  const meta = {
    t: W.t, shotT: W.shotT, steps: W.steps, restedFor: W.restedFor,
    nextId: W.nextId, ringRadius: W.ringRadius,
    marbles: [...W.marbles.values()].map(m => ({
      id: m.id, uid: m.uid, entry: m.entry, body: m.body.handle, collider: m.collider.handle,
      surfaces: [...m.surfaces], spin: [m.spin.x, m.spin.y, m.spin.z], out: m.out
    })),
    statics: [...W.statics.entries()].map(([h, s]) => [h, s])
  };
  const head = _enc.encode(JSON.stringify(meta));
  const body = W.rapier.takeSnapshot();
  const out = new Uint8Array(4 + head.length + body.length);
  out[0] = head.length & 255; out[1] = (head.length >>> 8) & 255;
  out[2] = (head.length >>> 16) & 255; out[3] = (head.length >>> 24) & 255;
  out.set(head, 4);
  out.set(body, 4 + head.length);
  return out;
}

/**
 * Rebuild a world from `snapshot` bytes. Rapier preserves handles across a
 * snapshot (proved in sim/probes/04_det_build_smoke.mjs), which is what lets the
 * marble map be rebuilt by handle instead of by rebuilding the scene.
 */
export function restore(bytes, tuning) {
  const hl = bytes[0] | (bytes[1] << 8) | (bytes[2] << 16) | (bytes[3] << 24);
  const meta = JSON.parse(_dec.decode(bytes.subarray(4, 4 + hl)));
  const world = RAPIER.World.restoreSnapshot(bytes.subarray(4 + hl));
  world.timestep = tuning.physics.fixedStep;
  const W = {
    rapier: world, tuning, queue: new RAPIER.EventQueue(true),
    marbles: new Map(), byCollider: new Map(), statics: new Map(), events: [],
    ringRadius: meta.ringRadius, t: meta.t, shotT: meta.shotT, steps: meta.steps,
    nextId: meta.nextId, restedFor: meta.restedFor, dt: tuning.physics.fixedStep, _pre: []
  };
  for (const [h, s] of meta.statics) W.statics.set(h, s);
  for (const m of meta.marbles) {
    const body = world.getRigidBody(m.body);
    const collider = world.getCollider(m.collider);
    if (!body || !collider) throw new Error('physics: snapshot lost handle ' + m.body);
    W.marbles.set(m.id, {
      id: m.id, uid: m.uid, entryId: m.entry.id, entry: m.entry,
      spec: bodySpec(m.entry, tuning), body, collider,
      surfaces: new Set(m.surfaces),
      spin: m.spin ? { x: m.spin[0], y: m.spin[1], z: m.spin[2] } : { x: 0, y: 0, z: 0 },
      out: m.out
    });
    W.byCollider.set(m.collider, m.id);
  }
  return W;
}

/** Distance from the ring centre on the floor plane. */
export function ringDistance(W, id) {
  const p = W.marbles.get(id).body.translation();
  return len2(p.x, p.z);
}

/** Every marble whose centre is beyond the ring radius. */
export function outsideRing(W) {
  const out = [];
  for (const id of W.marbles.keys()) if (ringDistance(W, id) > W.ringRadius) out.push(id);
  return out;
}

// Rapier world for TUMBLE (DESIGN 13.1, 13.2, 13.4).
// No three.js in here, so the pile, the flick and the basket are testable in Node.

import RAPIER from '@dimforge/rapier3d-compat';
import { PHYS, TABLE, BASKET, ODDBIN } from './config.js';
import { SILHOUETTES, colliderLayout } from './silhouettes.js';
import { quatFromTo, quatFromAxisAngle, quatMul, quatRotate, rng32, segSegDist2D, clamp } from './mathx.js';

let initP = null;
export function initPhysics() {
  if (!initP) initP = RAPIER.init();
  return initP;
}
export { RAPIER };

const Y = { x: 0, y: 1, z: 0 };
// sock colliders also report kinematic-vs-fixed pairs so a held sock can thaw a frozen pile
const ACTIVE_TYPES = 15 | 8704; // DEFAULT | KINEMATIC_FIXED

export class Physics {
  constructor(opts = {}) {
    this.world = new RAPIER.World({ x: 0, y: PHYS.gravity, z: 0 });
    this.world.timestep = 1 / PHYS.hz;
    this.dt = 1 / PHYS.hz;
    this.bodies = new Map();         // id -> rec
    this.byCollider = new Map();     // collider handle -> id
    this.time = 0;
    this.stepCount = 0;
    this.basketRadius = opts.basketRadius || BASKET.radius;
    this.basketTilt = 0;             // radians about the basket's local Z (Basket Balance)
    this.basketTiltX = 0;
    this._buildStatic();
  }

  // ---------- static set: table, rails, invisible walls, basket, Odd Bin ----------
  _buildStatic() {
    const W = this.world;
    const fixed = W.createRigidBody(RAPIER.RigidBodyDesc.fixed());
    const T = TABLE;
    const depth = T.front - T.back;
    const cz = (T.front + T.back) / 2;
    const add = (desc) => W.createCollider(desc.setFriction(0.8).setRestitution(0.05), fixed);
    // table top (surface at y = 0)
    add(RAPIER.ColliderDesc.cuboid(T.halfW + 0.2, 0.05, depth / 2 + 0.1).setTranslation(0, -0.05, cz));
    // visible rails: left, right, front
    add(RAPIER.ColliderDesc.cuboid(T.railT / 2, T.railH / 2, depth / 2).setTranslation(-T.halfW - T.railT / 2, T.railH / 2, cz));
    add(RAPIER.ColliderDesc.cuboid(T.railT / 2, T.railH / 2, depth / 2).setTranslation(T.halfW + T.railT / 2, T.railH / 2, cz));
    add(RAPIER.ColliderDesc.cuboid(T.halfW + T.railT, T.railH / 2, T.railT / 2).setTranslation(0, T.railH / 2, T.front + T.railT / 2));
    // back wall
    add(RAPIER.ColliderDesc.cuboid(T.halfW + 0.2, 0.6, 0.02).setTranslation(0, 0.6, T.back - 0.02));
    // invisible glass so a wild flick never leaves the table (misses stay on the table, DESIGN 3.3)
    const glassH = 1.4;
    add(RAPIER.ColliderDesc.cuboid(0.02, glassH / 2, depth / 2 + 0.1).setTranslation(-T.halfW - 0.02, glassH / 2, cz));
    add(RAPIER.ColliderDesc.cuboid(0.02, glassH / 2, depth / 2 + 0.1).setTranslation(T.halfW + 0.02, glassH / 2, cz));
    add(RAPIER.ColliderDesc.cuboid(T.halfW + 0.1, glassH / 2, 0.02).setTranslation(0, glassH / 2, T.front + 0.02));
    add(RAPIER.ColliderDesc.cuboid(T.halfW + 0.1, 0.02, depth / 2 + 0.1).setTranslation(0, glassH, cz));
    this._buildOddBin(fixed);
    this._buildBasket();
  }

  _buildOddBin(fixed) {
    const W = this.world, B = ODDBIN;
    const add = (hx, hy, hz, x, y, z) =>
      W.createCollider(RAPIER.ColliderDesc.cuboid(hx, hy, hz).setTranslation(B.x + x, y, B.z + z).setFriction(0.9).setRestitution(0.05), fixed);
    add(B.halfW, B.wallT / 2, B.halfD, 0, B.wallT / 2, 0);
    add(B.wallT / 2, B.height / 2, B.halfD, -B.halfW, B.height / 2, 0);
    add(B.wallT / 2, B.height / 2, B.halfD, B.halfW, B.height / 2, 0);
    add(B.halfW, B.height / 2, B.wallT / 2, 0, B.height / 2, -B.halfD);
    add(B.halfW, B.height / 2, B.wallT / 2, 0, B.height / 2, B.halfD);
  }

  _buildBasket() {
    const W = this.world, B = BASKET;
    if (this.basketBody) W.removeRigidBody(this.basketBody);
    const body = W.createRigidBody(
      RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(B.x, 0, B.z)
    );
    this.basketBody = body;
    const R = this.basketRadius, r0 = B.bottomRadius * (R / B.radius), H = B.height, N = B.segments;
    // floor
    W.createCollider(RAPIER.ColliderDesc.cylinder(0.008, r0 + 0.01).setTranslation(0, 0.008, 0).setFriction(0.9).setRestitution(0.1), body);
    // tapered wall slats
    const slope = Math.atan2(R - r0, H);
    const midR = (R + r0) / 2;
    const segW = (2 * Math.PI * midR) / N;
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2;
      const cx = Math.cos(a) * midR, cz = Math.sin(a) * midR;
      // rotate a thin box: yaw to face outward, then lean outward by the slope
      const yaw = quatFromAxisAngle(0, 1, 0, -a);
      const lean = quatFromAxisAngle(0, 0, 1, -slope);
      const q = quatMul(yaw, lean);
      W.createCollider(
        RAPIER.ColliderDesc.cuboid(B.wallT / 2, H / 2, segW / 2 + 0.004)
          .setTranslation(cx, H / 2, cz).setRotation(q).setFriction(0.6).setRestitution(0.25),
        body
      );
    }
    // rim: capsules around the top edge. Real rim bounces (DESIGN 3.1).
    const rimR = 0.009;
    for (let i = 0; i < N; i++) {
      const a0 = (i / N) * Math.PI * 2, a1 = ((i + 1) / N) * Math.PI * 2;
      const p0 = { x: Math.cos(a0) * R, z: Math.sin(a0) * R }, p1 = { x: Math.cos(a1) * R, z: Math.sin(a1) * R };
      const d = { x: p1.x - p0.x, y: 0, z: p1.z - p0.z };
      const len = Math.hypot(d.x, d.z);
      const q = quatFromTo(Y, { x: d.x / len, y: 0, z: d.z / len });
      W.createCollider(
        RAPIER.ColliderDesc.capsule(len / 2, rimR).setTranslation((p0.x + p1.x) / 2, H, (p0.z + p1.z) / 2).setRotation(q).setRestitution(0.45).setFriction(0.5),
        body
      );
    }
  }

  setBasketRadius(r) {
    if (Math.abs(r - this.basketRadius) < 1e-6) return;
    this.basketRadius = r;
    this._buildBasket();
  }

  // Basket Balance: tilt the basket about its base (radians, x and z axes).
  setBasketTilt(tx, tz) {
    this.basketTiltX = tx; this.basketTilt = tz;
    const q = quatMul(quatFromAxisAngle(1, 0, 0, tx), quatFromAxisAngle(0, 0, 1, tz));
    this.basketBody.setNextKinematicRotation(q);
    this.basketBody.setNextKinematicTranslation({ x: BASKET.x, y: 0, z: BASKET.z });
  }

  // ---------- dynamic bodies ----------
  addSock(id, silId, opts = {}) {
    const sil = SILHOUETTES[silId];
    const scale = opts.scale || 1;
    const p = opts.pos || { x: 0, y: 0.1, z: 0 };
    const q = opts.rot || { x: 0, y: 0, z: 0, w: 1 };
    const desc = RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(p.x, p.y, p.z)
      .setRotation(q)
      .setLinearDamping(PHYS.sock.linDamp)
      .setAngularDamping(PHYS.sock.angDamp)
      .setCanSleep(true);
    if (opts.vel) desc.setLinvel(opts.vel.x, opts.vel.y, opts.vel.z);
    if (opts.angvel) desc.setAngvel(opts.angvel);
    if (opts.sleeping) desc.setSleeping(true);
    const rb = this.world.createRigidBody(desc);
    const colliders = [];
    for (const c of colliderLayout(sil, scale)) {
      let cd;
      if (c.box) {
        cd = RAPIER.ColliderDesc.cuboid(c.box[0], c.box[1], c.box[2])
          .setTranslation(c.at[0], c.at[1] + c.box[1], c.at[2])
          .setRotation(quatFromAxisAngle(0, 1, 0, c.yaw));
      } else {
        const dx = c.b[0] - c.a[0], dz = c.b[2] - c.a[2];
        const len = Math.hypot(dx, dz) || 1e-4;
        cd = RAPIER.ColliderDesc.capsule(len / 2, c.r)
          .setTranslation((c.a[0] + c.b[0]) / 2, c.r, (c.a[2] + c.b[2]) / 2)
          .setRotation(quatFromTo(Y, { x: dx / len, y: 0, z: dz / len }));
      }
      cd.setDensity(PHYS.sock.density).setFriction(PHYS.sock.friction).setRestitution(PHYS.sock.restitution).setActiveCollisionTypes(ACTIVE_TYPES);
      const col = this.world.createCollider(cd, rb);
      colliders.push(col);
      this.byCollider.set(col.handle, id);
    }
    const rec = { id, kind: 'sock', rb, colliders, rest: 0, silId, scale, held: false, off: false, frozen: false };
    if (opts.frozen) this._freeze(rec);
    this.bodies.set(id, rec);
    return rec;
  }

  addBall(id, opts = {}) {
    const p = opts.pos || { x: 0, y: 0.2, z: 0 };
    const B = PHYS.ball;
    const desc = RAPIER.RigidBodyDesc.dynamic()
      .setTranslation(p.x, p.y, p.z)
      .setLinearDamping(B.linDamp)
      .setAngularDamping(B.angDamp)
      .setCcdEnabled(true);
    if (opts.vel) desc.setLinvel(opts.vel.x, opts.vel.y, opts.vel.z);
    const rb = this.world.createRigidBody(desc);
    const col = this.world.createCollider(
      RAPIER.ColliderDesc.ball(B.radius).setDensity(B.density).setFriction(B.friction).setRestitution(B.restitution).setActiveCollisionTypes(ACTIVE_TYPES),
      rb
    );
    this.byCollider.set(col.handle, id);
    const rec = { id, kind: 'ball', rb, colliders: [col], rest: 0, held: false, off: false, frozen: false };
    this.bodies.set(id, rec);
    return rec;
  }

  // Removing a body that was just switched between fixed and dynamic can panic Rapier 0.20 inside the next
  // step ("unreachable"; measured in review, about 1 run in 13). During a Load a removed body is only
  // disabled and forgotten; the whole world is freed when the next Load starts.
  remove(id) {
    const rec = this.bodies.get(id);
    if (!rec) return;
    this._thawContacts(rec);
    this._thawNear(rec.rb.translation(), 0.2);
    for (const c of rec.colliders) { this.byCollider.delete(c.handle); c.setEnabled(false); }
    rec.rb.setEnabled(false);
    this.bodies.delete(id);
  }

  has(id) { return this.bodies.has(id); }
  get(id) { return this.bodies.get(id); }

  // Collisions off (a sock flying to the hand, a pocketed sock, a ball being lobbed).
  setGhost(id, ghost) {
    const rec = this.bodies.get(id);
    if (!rec || rec.off === ghost) return;
    if (ghost) {
      this._thawContacts(rec);
      this._thawNear(rec.rb.translation(), 0.2);
      rec.frozen = false;
      rec.rb.setBodyType(RAPIER.RigidBodyType.KinematicPositionBased, false);
    }
    rec.off = ghost;
    for (const c of rec.colliders) c.setEnabled(!ghost);
    if (!ghost) {
      rec.rest = 0;
      rec.rb.setBodyType(RAPIER.RigidBodyType.Dynamic, true);
    }
  }

  // ---------- freezing: our aggressive sleep (DESIGN 13.1) ----------
  // Rapier's own sleep() marks a body asleep but keeps integrating gravity, so a
  // hand-slept sock sinks through the table (measured 2026-09-17). A resting sock
  // becomes a FIXED body instead: free to simulate, still solid, thawed on contact.
  _freeze(rec) {
    rec.frozen = true;
    rec.rest = 0;
    rec.anchor = rec.anchorLoose = null;
    rec.rb.setLinvel({ x: 0, y: 0, z: 0 }, false);
    rec.rb.setAngvel({ x: 0, y: 0, z: 0 }, false);
    rec.rb.setBodyType(RAPIER.RigidBodyType.Fixed, false);
  }
  _thaw(rec) {
    if (!rec.frozen) return;
    rec.frozen = false;
    rec.rest = 0;
    rec.anchor = rec.anchorLoose = null;
    rec.rb.setBodyType(RAPIER.RigidBodyType.Dynamic, true);
  }
  _thawContacts(rec) {
    for (const c of rec.colliders) {
      this.world.contactPairsWith(c, (other) => {
        const id = this.byCollider.get(other.handle);
        if (id === undefined) return;
        const r = this.bodies.get(id);
        if (r && r.frozen) this._thaw(r);
      });
    }
  }
  _thawNear(p, radius) {
    for (const r of this.bodies.values()) {
      if (!r.frozen) continue;
      const t = r.rb.translation();
      if (Math.hypot(t.x - p.x, t.z - p.z) < radius && t.y > p.y - 0.06) this._thaw(r);
    }
  }
  thaw(id) { const r = this.bodies.get(id); if (r) this._thaw(r); }
  isFrozen(id) { const r = this.bodies.get(id); return !!r && r.frozen; }

  // Grab: the body goes kinematic and chases the finger (DESIGN 13.4).
  grab(id) {
    const rec = this.bodies.get(id);
    if (!rec) return;
    this._thawContacts(rec);
    rec.frozen = false;
    rec.held = true;
    rec.rb.setBodyType(RAPIER.RigidBodyType.KinematicPositionBased, true);
    const t = rec.rb.translation();
    rec.target = { x: t.x, y: Math.max(t.y, PHYS.holdHeight), z: t.z };
    rec.holdRot = rec.rb.rotation();
    this._thawNear(t, 0.22);
  }

  setHoldTarget(id, x, z, y = PHYS.holdHeight) {
    const rec = this.bodies.get(id);
    if (!rec || !rec.held) return;
    rec.target = { x: clamp(x, -TABLE.halfW + 0.03, TABLE.halfW - 0.03), y, z: clamp(z, TABLE.back + 0.05, TABLE.front - 0.03) };
  }

  release(id, vel, angvel) {
    const rec = this.bodies.get(id);
    if (!rec) return;
    // a quick flick can end before the body has risen to the finger plane (a slow frame,
    // a 100 ms swipe); it leaves from where the finger lifted it, not from inside the pile
    if (rec.held && rec.target) {
      const t = rec.rb.translation();
      if (t.y < rec.target.y - 0.01) rec.rb.setTranslation({ x: rec.target.x, y: rec.target.y, z: rec.target.z }, true);
    }
    rec.held = false;
    rec.rest = 0;
    rec.rb.setBodyType(RAPIER.RigidBodyType.Dynamic, true);
    const v = vel || { x: 0, y: 0, z: 0 };
    const sp = Math.hypot(v.x, v.y, v.z);
    const k = sp > PHYS.maxFlick ? PHYS.maxFlick / sp : 1;
    rec.rb.setLinvel({ x: v.x * k, y: v.y * k, z: v.z * k }, true);
    rec.rb.setAngvel(angvel || { x: 0, y: 0, z: 0 }, true);
    if (rec.kind === 'sock') rec.rb.enableCcd(sp > 1.2);
    rec.rb.wakeUp();
  }

  // Teleport (used when a sock drops back from the hand).
  place(id, pos, rot, vel) {
    const rec = this.bodies.get(id);
    if (!rec) return;
    this._thaw(rec);
    rec.rb.setTranslation(pos, true);
    if (rot) rec.rb.setRotation(rot, true);
    rec.rb.setLinvel(vel || { x: 0, y: 0, z: 0 }, true);
    rec.rb.setAngvel({ x: 0, y: 0, z: 0 }, true);
    rec.rest = 0;
    rec.rb.wakeUp();
  }

  // Two-finger shake: an upward impulse on bodies near the swipe path (DESIGN 3.1).
  shake(points, dir, strength = 1) {
    let n = 0;
    for (const rec of this.bodies.values()) {
      if (rec.held || rec.off || rec.kind !== 'sock') continue;
      const t = rec.rb.translation();
      let best = Infinity;
      for (const p of points) best = Math.min(best, Math.hypot(t.x - p.x, t.z - p.z));
      if (best > 0.12) continue;
      this._thaw(rec);
      const m = rec.rb.mass();
      const fall = 1 - best / 0.12;
      rec.rb.wakeUp();
      rec.rb.applyImpulse({ x: dir.x * 0.35 * m * fall * strength, y: m * (0.9 + 0.5 * fall) * strength, z: dir.z * 0.35 * m * fall * strength }, true);
      rec.rb.applyTorqueImpulse({ x: (Math.sin(t.x * 91) * 0.002) * m, y: 0, z: (Math.cos(t.z * 73) * 0.002) * m }, true);
      rec.rest = 0;
      n++;
    }
    return n;
  }


  jostle(p, r = 0.16, strength = 0.35) {
    for (const rec of this.bodies.values()) {
      if (rec.held || rec.off || rec.kind !== 'sock') continue;
      const t = rec.rb.translation();
      const d = Math.hypot(t.x - p.x, t.z - p.z);
      if (d > r) continue;
      this._thaw(rec);
      const m = rec.rb.mass(), k = (1 - d / r) * strength;
      rec.rb.applyImpulse({ x: ((t.x - p.x) / (d + 1e-3)) * m * k * 0.3, y: m * k, z: ((t.z - p.z) / (d + 1e-3)) * m * k * 0.3 }, true);
      rec.rest = 0;
    }
  }

  // ---------- stepping ----------
  step() {
    const dt = this.dt;
    for (const rec of this.bodies.values()) {
      if (!rec.held || !rec.target) continue;
      const t = rec.rb.translation();
      const a = 1 - Math.exp(-PHYS.holdStiffness * dt);
      const nx = t.x + (rec.target.x - t.x) * a;
      const ny = t.y + (rec.target.y - t.y) * a;
      const nz = t.z + (rec.target.z - t.z) * a;
      rec.rb.setNextKinematicTranslation({ x: nx, y: ny, z: nz });
      // settle the held sock flat while keeping its heading
      if (rec.holdRot) rec.rb.setNextKinematicRotation(rec.holdRot);
      this._thawContacts(rec);
      this._thawNear({ x: nx, y: ny - 0.02, z: nz }, 0.09);
    }
    this.world.step();
    this.time += dt;
    this.stepCount++;
    this._sleeper(dt);
  }

  // Rest is measured as DRIFT, not speed: a sock wedged in the pile can spin in
  // place at 5 rad/s forever without going anywhere (measured), and that is rest.
  _drift(rec, dt) {
    const t = rec.rb.translation(), q = rec.rb.rotation();
    // two clocks: a tight one (4 mm, 3 deg) and a loose one (12 mm, 15 deg) for socks
    // that rock in place without ever getting anywhere
    const clock = (key, lim, cosLim) => {
      const a = rec[key];
      if (!a) { rec[key] = { x: t.x, y: t.y, z: t.z, q, rest: 0 }; return 0; }
      const d = Math.hypot(t.x - a.x, t.y - a.y, t.z - a.z);
      const dot = Math.abs(q.x * a.q.x + q.y * a.q.y + q.z * a.q.z + q.w * a.q.w);
      if (d > lim || dot < cosLim) { rec[key] = { x: t.x, y: t.y, z: t.z, q, rest: 0 }; return 0; }
      a.rest += dt;
      return a.rest;
    };
    const tight = clock('anchor', PHYS.restDrift, PHYS.restTurnCos);
    const loose = clock('anchorLoose', PHYS.restDrift * 3, PHYS.restTurnCosLoose);
    rec.rest = Math.max(tight, loose / 2);
    return rec.rest;
  }

  // Aggressive sleeping (DESIGN 13.1): about 0.5 s at rest and the body freezes.
  _sleeper(dt) {
    for (const rec of this.bodies.values()) {
      if (rec.held || rec.off || rec.frozen) { rec.anchor = rec.anchorLoose = null; continue; }
      const rb = rec.rb;
      const rest = this._drift(rec, dt);
      if (!this.noFreeze && rest >= PHYS.sleepAfter) { this._freeze(rec); continue; }
      const v = rb.linvel();
      if (v.x * v.x + v.y * v.y + v.z * v.z > PHYS.thawSpeed * PHYS.thawSpeed) this._thawContacts(rec);
      // safety: anything that escapes comes back to the middle of the table
      const t = rb.translation();
      if (t.y < -0.3 || Math.abs(t.x) > TABLE.halfW + 0.3 || t.z > TABLE.front + 0.3 || t.z < TABLE.back - 0.3) {
        rb.setTranslation({ x: 0, y: 0.3, z: 0.05 }, true);
        rb.setLinvel({ x: 0, y: 0, z: 0 }, true);
        rec.anchor = rec.anchorLoose = null;
      }
    }
  }

  counts() {
    let total = 0, awake = 0;
    for (const rec of this.bodies.values()) {
      total++;
      if (!rec.frozen) awake++;
    }
    return { total, awake };
  }

  allAsleep(filter) {
    for (const rec of this.bodies.values()) {
      if (filter && !filter(rec)) continue;
      if (rec.held || rec.off) continue;
      if (!rec.frozen) return false;
    }
    return true;
  }

  pose(id) {
    const rec = this.bodies.get(id);
    if (!rec) return null;
    const t = rec.rb.translation(), q = rec.rb.rotation();
    return { x: t.x, y: t.y, z: t.z, qx: q.x, qy: q.y, qz: q.z, qw: q.w };
  }

  velocity(id) {
    const rec = this.bodies.get(id);
    return rec ? rec.rb.linvel() : { x: 0, y: 0, z: 0 };
  }

  // Ray pick against colliders. Returns { id, toi, point } or null.
  pick(origin, dir, maxToi = 10) {
    const ray = new RAPIER.Ray(origin, dir);
    const hit = this.world.castRay(ray, maxToi, true, undefined, undefined, undefined, undefined, (col) => {
      const id = this.byCollider.get(col.handle);
      if (id === undefined) return false;
      const rec = this.bodies.get(id);
      return !!rec && !rec.held && !rec.off;
    });
    if (!hit) return null;
    const id = this.byCollider.get(hit.collider.handle);
    const toi = hit.timeOfImpact !== undefined ? hit.timeOfImpact : hit.toi;
    return { id, toi, point: { x: origin.x + dir.x * toi, y: origin.y + dir.y * toi, z: origin.z + dir.z * toi } };
  }

  // Is a point inside the basket's volume (in the basket's tilted frame)?
  inBasket(p, margin = 0) {
    const lx = p.x - BASKET.x, lz = p.z - BASKET.z;
    // undo the tilt approximately (small angles)
    const ly = p.y + lx * Math.sin(this.basketTilt) - lz * Math.sin(this.basketTiltX);
    if (ly < -0.01 || ly > BASKET.height + margin) return false;
    const r = BASKET.bottomRadius * (this.basketRadius / BASKET.radius) + (this.basketRadius - BASKET.bottomRadius * (this.basketRadius / BASKET.radius)) * clamp(ly / BASKET.height, 0, 1);
    return Math.hypot(lx, lz) < r;
  }

  inBin(p, margin = 0) {
    return Math.abs(p.x - ODDBIN.x) < ODDBIN.halfW && Math.abs(p.z - ODDBIN.z) < ODDBIN.halfD && p.y < ODDBIN.height + margin && p.y > -0.01;
  }

  // ---------- the dump (DESIGN 13.2: pre-simulated offscreen so the pile is settled at door-open) ----------
  // items: [{ id, silId, scale }]. Socks are placed in loose layers (a mound: each
  // layer a little narrower), dropped a centimetre, and simulated until the whole pile
  // is quiet. The tumble out of the dryer is drawn by the renderer as an arc onto each
  // sock's landing spot, in the order returned here, so the physics never has to
  // survive a 200-sock avalanche. Returns { settledAt, frames, ids, order, landing }.
  dump(items, opts = {}) {
    const rand = rng32(opts.seed || 1);
    const maxT = opts.maxSeconds || 4;
    const record = opts.record !== false;
    const T = TABLE, D = PHYS.dump;
    // heightfield over the play area, 2 cm cells
    const CELL = 0.02;
    const gx0 = -T.halfW, gz0 = T.playBack;
    const GW = Math.ceil((2 * T.halfW) / CELL), GD = Math.ceil((T.front - T.playBack) / CELL);
    const hf = new Float32Array(GW * GD);
    const landing = new Map();
    const order = [];
    const footprint = (silId, sc, x, z, yaw) => {
      // sample the collider rafts in world XZ
      const pts = [];
      const cy = Math.cos(yaw), sy = Math.sin(yaw);
      for (const c of colliderLayout(SILHOUETTES[silId], sc)) {
        if (c.box) { pts.push([x + c.at[0] * cy + c.at[2] * sy, z - c.at[0] * sy + c.at[2] * cy, c.box[2]]); continue; }
        const n = Math.max(2, Math.ceil(Math.hypot(c.b[0] - c.a[0], c.b[2] - c.a[2]) / 0.015));
        for (let i = 0; i <= n; i++) {
          const lx = c.a[0] + (c.b[0] - c.a[0]) * (i / n), lz = c.a[2] + (c.b[2] - c.a[2]) * (i / n);
          pts.push([x + lx * cy + lz * sy, z - lx * sy + lz * cy, c.r]);
        }
      }
      return pts;
    };
    const cellsOf = (pts, fn) => {
      for (const [px, pz, r] of pts) {
        const i0 = Math.floor((px - r - gx0) / CELL), i1 = Math.floor((px + r - gx0) / CELL);
        const j0 = Math.floor((pz - r - gz0) / CELL), j1 = Math.floor((pz + r - gz0) / CELL);
        for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) {
          if (i < 0 || j < 0 || i >= GW || j >= GD) return false;
          fn(j * GW + i);
        }
      }
      return true;
    };
    // things already lying on the table (balls, when the pile is reshuffled mid Load) raise their cells
    for (const o of opts.obstacles || []) cellsOf([[o.x, o.z, o.r]], (c) => { hf[c] = Math.max(hf[c], o.h); });
    for (const it of items) {
      const sc = it.scale || 1;
      const sil = SILHOUETTES[it.silId];
      let best = null;
      for (let k = 0; k < 28; k++) {
        // the lowest of many spots wins, so the pile spreads like dumped laundry
        const u = rand(), v = rand();
        const x = (u - 0.5) * (2 * T.halfW - 0.12);
        const z = T.playBack + 0.05 + v * (T.front - T.playBack - 0.12);
        const yaw = rand() * Math.PI * 2;
        const pts = footprint(it.silId, sc, x, z, yaw);
        let top = 0;
        if (!cellsOf(pts, (c) => { if (hf[c] > top) top = hf[c]; })) continue;
        if (!best || top < best.top - 0.004) best = { x, z, yaw, pts, top };
      }
      if (!best) { const yaw = rand() * 6.28; best = { x: 0, z: 0.05, yaw, pts: footprint(it.silId, sc, 0, 0.05, yaw), top: 0 }; cellsOf(best.pts, (c) => { if (hf[c] > best.top) best.top = hf[c]; }); }
      const thick = sil.t * sc * 1.08;
      cellsOf(best.pts, (c) => { hf[c] = best.top + thick; });
      const flip = rand() < 0.5 ? Math.PI : 0;
      const q = quatMul(quatFromAxisAngle(0, 1, 0, best.yaw), quatFromAxisAngle(1, 0, 0, flip));
      const y = best.top + 0.004 - lowestPoint(it.silId, sc, q);
      this.addSock(it.id, it.silId, { scale: sc, pos: { x: best.x, y, z: best.z }, rot: q });
      const rb = this.bodies.get(it.id).rb;
      rb.setLinearDamping(D.linDamp);
      rb.setAngularDamping(D.angDamp);
      landing.set(it.id, { layer: best.top, x: best.x, y, z: best.z, q });
      order.push(it.id);
    }
    let layers = 0;
    for (const h of hf) layers = Math.max(layers, h);
    // landing order for the renderer: bottom layers first, then outward from the middle
    order.sort((a, b) => {
      const A = landing.get(a), B = landing.get(b);
      return A.layer - B.layer || (Math.hypot(A.x, A.z) - Math.hypot(B.x, B.z));
    });
    const ids = items.map((i) => i.id);
    const frames = [];
    let settledAt = -1;
    const maxSteps = Math.ceil(maxT / this.dt);
    // During the dump nobody freezes alone (a lone freeze makes its neighbours pop);
    // the whole pile freezes together once every sock has been still for a moment.
    this.noFreeze = true;
    for (let s = 0; s < maxSteps; s++) {
      this.step();
      if (record) frames.push(this.snapshot(ids));
      let quietAll = s > 6;
      if (quietAll) for (const rec of this.bodies.values()) {
        if (rec.kind !== 'sock' || rec.frozen || rec.held || rec.off) continue;
        if (rec.rest < D.settleHold) { quietAll = false; break; }
      }
      if (quietAll) { settledAt = (s + 1) * this.dt; break; }
    }
    this.noFreeze = false;
    for (const rec of this.bodies.values()) {
      if (rec.kind !== 'sock') continue;
      rec.rb.setLinearDamping(PHYS.sock.linDamp);
      rec.rb.setAngularDamping(PHYS.sock.angDamp);
      if (!rec.frozen && !rec.held && !rec.off) this._freeze(rec);
    }
    return { steps: frames.length, settledAt, frames, ids, order, landing, packedTop: layers };
  }

  // Endless mode feed and Odd Bin pop-outs: drop one sock from above a free spot.
  dropSock(id, silId, opts = {}) {
    const rand = opts.rand || Math.random;
    const T = TABLE;
    const x = (rand() - 0.5) * (T.halfW * 1.4), z = T.playBack + 0.1 + rand() * (T.front - T.playBack - 0.25);
    const q = quatMul(quatFromAxisAngle(0, 1, 0, rand() * Math.PI * 2), quatFromAxisAngle(1, 0, 0, rand() < 0.5 ? Math.PI : 0));
    let top = 0;
    for (const r of this.bodies.values()) { const t = r.rb.translation(); if (Math.hypot(t.x - x, t.z - z) < 0.2) top = Math.max(top, t.y); }
    const y = top + 0.12 - lowestPoint(silId, opts.scale || 1, q);
    this.addSock(id, silId, { scale: opts.scale, pos: { x, y, z }, rot: q, vel: opts.vel || { x: 0, y: -0.5, z: 0 } });
    return { x, y, z, q };
  }

  // Pose of every id as [x,y,z,qx,qy,qz,qw] * n. Missing bodies write NaN.
  snapshot(ids, out) {
    const f = out || new Float32Array(ids.length * 7);
    for (let i = 0; i < ids.length; i++) {
      const rec = this.bodies.get(ids[i]);
      const o = i * 7;
      if (!rec) { f[o] = NaN; continue; }
      const t = rec.rb.translation(), q = rec.rb.rotation();
      f[o] = t.x; f[o + 1] = t.y; f[o + 2] = t.z; f[o + 3] = q.x; f[o + 4] = q.y; f[o + 5] = q.z; f[o + 6] = q.w;
    }
    return f;
  }

  free() {
    this.world.free();
  }
}

// Lowest y (relative to the body origin) of a sock's colliders under rotation q.
const _lowCache = new Map();
function lowestPoint(silId, scale, q) {
  const key = silId + ':' + scale;
  let pts = _lowCache.get(key);
  if (!pts) {
    pts = [];
    for (const c of colliderLayout(SILHOUETTES[silId], scale)) {
      if (c.box) {
        for (const sx of [-1, 1]) for (const sz of [-1, 1]) for (const sy of [0, 2]) {
          const lx = c.box[0] * sx, lz = c.box[2] * sz, cy = Math.cos(c.yaw), sn = Math.sin(c.yaw);
          pts.push({ x: c.at[0] + lx * cy + lz * sn, y: sy * c.box[1], z: c.at[2] - lx * sn + lz * cy, r: 0 });
        }
      } else {
        pts.push({ x: c.a[0], y: c.r, z: c.a[2], r: c.r }, { x: c.b[0], y: c.r, z: c.b[2], r: c.r });
      }
    }
    _lowCache.set(key, pts);
  }
  let low = Infinity;
  for (const p of pts) low = Math.min(low, quatRotate(q, p).y - p.r);
  return low;
}

// Launch velocity for a lob from p to q that takes `time` seconds (tap to basket, DESIGN 3.1).
export function lobVelocity(p, q, time) {
  const g = -PHYS.gravity;
  return {
    x: (q.x - p.x) / time,
    y: (q.y - p.y) / time + 0.5 * g * time,
    z: (q.z - p.z) / time,
  };
}

// Launch speed that carries a ball `dist` metres out and `dh` up at pitch `el`, with the ball's air damping.
export function idealSpeed(dist, dh, el) {
  const g = -PHYS.gravity, c = Math.cos(el), t = Math.tan(el);
  const den = 2 * c * c * (dist * t - dh);
  if (den <= 0) return 0;
  const v = Math.sqrt((g * dist * dist) / den);
  // damping shortens the flight: stretch the horizontal speed by the lost distance (first order)
  const T = dist / (v * c), k = PHYS.ball.linDamp;
  return k > 0 ? v * Math.sqrt((k * T) / (1 - Math.exp(-k * T))) : v;
}

export { quatRotate };

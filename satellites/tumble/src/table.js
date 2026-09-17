// Everything on the table: sock and ball entities, their physics bodies, the pose
// each one is drawn with (interpolated physics, held in the hand, in flight, or
// replaying the dump), and the held presentation rule (DESIGN 3.1: the held sock
// renders large and toward the camera).

import * as THREE from 'three';
import { PHYS, HELD, DRYER, TABLE } from './config.js';
import { SILHOUETTES } from './silhouettes.js';
import { quatSlerp, clamp, smooth, rng32 } from './mathx.js';

const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _v = new THREE.Vector3();
const _s = new THREE.Vector3();
const _e = new THREE.Euler();

export class Table {
  constructor(physics, render) {
    this.P = physics;
    this.R = render;
    this.ents = new Map();      // id -> entity
    this.prev = new Map();      // id -> pose before the last step
    this.cur = new Map();       // id -> pose after the last step
    this.playback = null;
    this.nextId = 1;
    this.heldScale = HELD.scale;
    this.time = 0;
  }

  newId() { return this.nextId++; }

  // ---------- entities ----------
  addSockEntity(sock) {
    // sock: { id, silId, scale, tile, insideOut, ... } from the Load; the entity keeps a ref
    const e = { kind: 'sock', id: sock.id, sock, state: 'hidden', glow: 0, phase: (sock.id * 1.37) % 6.28, flip: 0 };
    this.ents.set(sock.id, e);
    return e;
  }

  addBallEntity(ball) {
    const e = { kind: 'ball', id: ball.id, ball, state: 'hidden', glow: 0, phase: (ball.id * 0.73) % 6.28 };
    this.ents.set(ball.id, e);
    return e;
  }

  remove(id) {
    if (this.P.has(id)) this.P.remove(id);
    this.ents.delete(id);
    this.prev.delete(id);
    this.cur.delete(id);
  }

  clear() {
    for (const id of [...this.ents.keys()]) this.remove(id);
    this.playback = null;
  }

  // ---------- the dump ----------
  dump(socks, seed, opts = {}) {
    for (const s of socks) this.addSockEntity(s);
    const t0 = performance.now();
    const d = this.P.dump(socks.map((s) => ({ id: s.id, silId: s.silId, scale: s.scale })), { seed, maxSeconds: opts.maxSeconds || 4 });
    const simMs = performance.now() - t0;
    const n = d.order.length;
    const spacing = Math.min(0.034, 1.7 / Math.max(1, n));
    const rand = rng32(seed ^ 0x5bd1e995);
    const arrive = new Map();
    d.order.forEach((id, i) => arrive.set(id, 0.45 + i * spacing + rand() * spacing * 0.6));
    const frames = d.frames;
    const idx = new Map(d.ids.map((id, i) => [id, i]));
    const starts = new Map();
    for (const id of d.ids) {
      const a = rand() * Math.PI * 2, r = rand() * DRYER.doorR * 0.55;
      starts.set(id, {
        x: DRYER.x + Math.cos(a) * r, y: DRYER.doorY + Math.sin(a) * r * 0.8, z: TABLE.back - 0.1,
        q: new THREE.Quaternion().setFromEuler(new THREE.Euler(rand() * 6.28, rand() * 6.28, rand() * 6.28)),
        spin: new THREE.Vector3(rand() - 0.5, rand() - 0.5, rand() - 0.5).normalize(),
        lift: 0.12 + rand() * 0.16,
      });
    }
    const flight = 0.5;
    let end = 0;
    for (const id of d.ids) end = Math.max(end, arrive.get(id) + frames.length * this.P.dt);
    this.playback = { frames, idx, arrive, starts, flight, t: 0, end: end + 0.05, simMs, settledAt: d.settledAt, n };
    for (const s of socks) this.ents.get(s.id).state = 'dumping';
    this.snapshotAll();
    return this.playback;
  }

  playbackDone() { return !this.playback || this.playback.t >= this.playback.end; }

  finishPlayback() {
    if (!this.playback) return;
    for (const e of this.ents.values()) if (e.state === 'dumping') e.state = 'table';
    this.playback = null;
    this.snapshotAll();
  }

  // ---------- physics bookkeeping ----------
  snapshotAll() {
    for (const id of this.ents.keys()) {
      const p = this.P.pose(id);
      if (!p) continue;
      this.prev.set(id, p);
      this.cur.set(id, p);
    }
  }

  afterStep() {
    for (const [id, rec] of this.P.bodies) {
      if (rec.frozen && this.cur.has(id)) { this.prev.set(id, this.cur.get(id)); continue; }
      const p = this.P.pose(id);
      this.prev.set(id, this.cur.get(id) || p);
      this.cur.set(id, p);
    }
  }

  interp(id, alpha) {
    const a = this.prev.get(id), b = this.cur.get(id);
    if (!a || !b) return this.P.pose(id);
    const q = quatSlerp({ x: a.qx, y: a.qy, z: a.qz, w: a.qw }, { x: b.qx, y: b.qy, z: b.qz, w: b.qw }, alpha);
    return { x: a.x + (b.x - a.x) * alpha, y: a.y + (b.y - a.y) * alpha, z: a.z + (b.z - a.z) * alpha, qx: q.x, qy: q.y, qz: q.z, qw: q.w };
  }

  // ---------- the held presentation ----------
  // Screen point -> world matrix for a sock (or ball) shown in the hand.
  heldPose(e, sx, sy, opts = {}) {
    const R = this.R;
    const scale = opts.scale || this.heldScale;
    const dist = R.tableDistance() / scale;
    const pxPerM = R.h / (2 * dist * Math.tan(THREE.MathUtils.degToRad(R.camera.fov) / 2));
    let halfPx = 40;
    if (e.kind === 'sock') {
      const sil = SILHOUETTES[e.sock.silId];
      halfPx = (sil.leg + sil.w * 0.6) * (e.sock.scale || 1) * pxPerM * 0.5 + 10;
    } else {
      halfPx = PHYS.ball.radius * pxPerM;
    }
    const lift = opts.lift === undefined ? HELD.liftPx : opts.lift;
    let cy = sy - lift - halfPx;
    cy = clamp(cy, halfPx + 64, R.h - halfPx - 10);
    // keep the whole sock on screen: the foot reaches right of centre, the leg a little left
    let wide = halfPx;
    if (e.kind === 'sock') { const sil = SILHOUETTES[e.sock.silId]; wide = (sil.foot * 0.8 + sil.w * 0.5) * (e.sock.scale || 1) * pxPerM; }
    const cx = clamp(sx, Math.min(R.w / 2, 0.35 * wide + 14), Math.max(R.w / 2, R.w - wide - 8));
    const pos = R.rayPoint(cx, cy, dist);
    // basis: leg (local X) points down the screen, foot (local Z) to the right, face toward the camera
    const cam = R.camera;
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(cam.quaternion);
    const up = new THREE.Vector3(0, 1, 0).applyQuaternion(cam.quaternion);
    const X = up.clone().negate();
    const Z = right.clone();
    const Y = new THREE.Vector3().crossVectors(Z, X);
    const basis = new THREE.Matrix4().makeBasis(X, Y, Z);
    const q = new THREE.Quaternion().setFromRotationMatrix(basis);
    // lean, second look (tilt shows heel/toe) and the flip spin
    const tilt = opts.tilt || 0;
    const extra = new THREE.Quaternion().setFromAxisAngle(up, tilt + (e.flipSpin || 0));
    const lean = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3().crossVectors(right, up), 0.18 + (opts.lean || 0));
    q.premultiply(lean).premultiply(extra);
    if (e.kind === 'sock') {
      // centre the L: shift so the leg sits above the heel point
      const sil = SILHOUETTES[e.sock.silId];
      const off = new THREE.Vector3(-(sil.leg * 0.15), -(sil.t * 0.5), -(sil.foot * 0.25)).multiplyScalar(e.sock.scale || 1).applyQuaternion(q);
      pos.add(off);
    }
    return { x: pos.x, y: pos.y, z: pos.z, qx: q.x, qy: q.y, qz: q.z, qw: q.w, scale: 1 };
  }

  // ---------- drawing ----------
  draw(dt, alpha, hand) {
    const R = this.R;
    this.time += dt;
    R.begin();
    const pb = this.playback;
    if (pb) pb.t += dt;
    for (const e of this.ents.values()) {
      if (e.state === 'hidden' || e.state === 'gone') continue;
      let pose = null, held = false;
      if (e.state === 'dumping' && pb) pose = this._playbackPose(e, pb);
      else if (e.state === 'held' || e.state === 'pocket') { pose = e.viewPose; held = true; }
      else if (e.state === 'flying') pose = this._flightPose(e, dt);
      else if (e.vis) pose = e.vis;
      else pose = this.interp(e.id, alpha);
      if (!pose) continue;
      e.drawn = pose;
      _q.set(pose.qx, pose.qy, pose.qz, pose.qw);
      const sc = (e.kind === 'sock' ? e.sock.scale || 1 : 1) * (pose.scale || 1);
      _m.compose(_v.set(pose.x, pose.y, pose.z), _q, _s.set(sc, sc, sc));
      if (e.kind === 'sock') {
        const flags = e.sock.insideOut ? 1 : 0;
        R.sock(e.sock.silId, _m, e.sock.tile, flags, e.glow, e.phase, held || e.nearCam);
      } else {
        R.ball(_m, e.ball.tile, e.glow, e.phase, held || e.nearCam);
      }
    }
    R.end();
  }

  _playbackPose(e, pb) {
    const t = pb.t, ta = pb.arrive.get(e.id);
    const i = pb.idx.get(e.id);
    const landF = pb.frames[0];
    if (t < ta - pb.flight) return null;
    if (t < ta) {
      const k = (t - (ta - pb.flight)) / pb.flight;
      const s = pb.starts.get(e.id);
      const o = i * 7;
      const lx = landF[o], ly = landF[o + 1], lz = landF[o + 2];
      const kk = smooth(k);
      const x = s.x + (lx - s.x) * kk;
      const z = s.z + (lz - s.z) * k;
      const y = s.y + (ly - s.y) * kk + Math.sin(k * Math.PI) * s.lift;
      _q.set(landF[o + 3], landF[o + 4], landF[o + 5], landF[o + 6]);
      const spin = new THREE.Quaternion().setFromAxisAngle(s.spin, (1 - kk) * 7);
      const qq = s.q.clone().slerp(_q, kk).premultiply(spin);
      return { x, y, z, qx: qq.x, qy: qq.y, qz: qq.z, qw: qq.w };
    }
    const f = pb.frames[Math.min(pb.frames.length - 1, Math.floor((t - ta) / this.P.dt))];
    const o = i * 7;
    if (Number.isNaN(f[o])) return null;
    return { x: f[o], y: f[o + 1], z: f[o + 2], qx: f[o + 3], qy: f[o + 4], qz: f[o + 5], qw: f[o + 6] };
  }

  // A flight blends from a start pose to a (possibly moving) target pose.
  fly(e, from, toFn, dur, onDone, opts = {}) {
    e.state = 'flying';
    e.flight = { from, toFn, dur, t: 0, onDone, arc: opts.arc || 0, spin: opts.spin || 0, near: !!opts.near };
    e.nearCam = !!opts.near;
  }

  _flightPose(e, dt) {
    const f = e.flight;
    if (!f) return e.drawn;
    f.t += dt;
    const k = clamp(f.t / f.dur, 0, 1);
    const kk = smooth(k);
    const to = f.toFn();
    const a = f.from;
    const q = quatSlerp({ x: a.qx, y: a.qy, z: a.qz, w: a.qw }, { x: to.qx, y: to.qy, z: to.qz, w: to.qw }, kk);
    const pose = {
      x: a.x + (to.x - a.x) * kk,
      y: a.y + (to.y - a.y) * kk + Math.sin(k * Math.PI) * f.arc,
      z: a.z + (to.z - a.z) * kk,
      qx: q.x, qy: q.y, qz: q.z, qw: q.w,
      scale: (a.scale || 1) + ((to.scale || 1) - (a.scale || 1)) * kk,
    };
    if (k >= 1) {
      e.flight = null;
      e.nearCam = false;
      const cb = f.onDone;
      e.state = 'table';
      e.drawn = pose;
      if (cb) cb(pose);
    }
    return pose;
  }
}

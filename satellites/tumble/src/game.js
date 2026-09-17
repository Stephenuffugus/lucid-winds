// TUMBLE state machine (DESIGN 3, 13.5): Menu -> Load (Dump -> Play) -> Sweep -> Results.

import * as THREE from 'three';
import { initPhysics, Physics } from './physics.js';
import { Renderer } from './render.js';
import { Table } from './table.js';
import { Input } from './input.js';
import { loadSilhouettes } from './geo.js';
import { PHYS, HELD, VERSION } from './config.js';
import { rng32 } from './mathx.js';
import { Debug } from './debug.js';

export class Game {
  constructor(root, params) {
    this.root = root;
    this.params = params;
    this.canvas = root.querySelector('#stage');
    this.state = 'boot';
    this.acc = 0;
    this.last = 0;
    this.stepMs = 0;
    this.hand = null;       // { id, mode: 'drag' | 'pocket', ptr }
    this.frame = 0;
  }

  async boot(progress = () => {}) {
    progress('Warming up the dryer');
    await initPhysics();
    const sils = await loadSilhouettes('./');
    progress('Folding the table');
    this.physics = new Physics();
    this.render = new Renderer(this.canvas, { preserve: this.params.has('shots'), lowShadows: this.params.has('low') });
    this.render.init(sils);
    this.table = new Table(this.physics, this.render);
    this.input = new Input(this.canvas, this._handlers());
    this.debug = this.params.get('debug') === '1' ? new Debug(this.root) : null;
    const ro = () => this.resize();
    window.addEventListener('resize', ro);
    window.visualViewport?.addEventListener('resize', ro);
    this.resize();
    const cam = this.params.get('cam');
    if (cam) {
      const v = cam.split(',').map(Number);
      this.render.camOverride = { pos: v.slice(0, 3), look: v.slice(3, 6), fov: v[6] || 40 };
      this.render._applyPose(this.render.camOverride);
    }
    this.state = 'idle';
    requestAnimationFrame((t) => this.loop(t));
  }

  resize() {
    const vv = window.visualViewport;
    const w = Math.round(vv ? vv.width : window.innerWidth);
    const h = Math.round(vv ? vv.height : window.innerHeight);
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    this.render.resize(w, h);
  }

  // ---------- a test pile (step 1) ----------
  smokePile(n, seed = 1) {
    this.table.clear();
    const r = rng32(seed);
    const socks = [];
    for (let i = 0; i < n; i++) {
      socks.push({ id: this.table.newId(), silId: Math.floor(r() * 8), scale: r() < 0.12 ? 0.82 : 1, tile: Math.floor(r() * 64), insideOut: r() < 0.15 });
    }
    this.startDump(socks, seed);
  }

  startDump(socks, seed) {
    this.state = 'dump';
    const pb = this.table.dump(socks, seed);
    if (this.params.has('skipdump')) pb.t = pb.end;
    this.lastDump = { n: socks.length, simMs: pb.simMs, settledAt: pb.settledAt };
    this.render.setDryerDoor(0);
    return pb;
  }

  // ---------- loop ----------
  loop(tms) {
    requestAnimationFrame((t) => this.loop(t));
    const dt = this.last ? Math.min(0.05, (tms - this.last) / 1000) : 1 / 60;
    this.last = tms;
    this.frame++;
    const P = this.physics, T = this.table;
    if (this.state === 'dump') {
      const pb = T.playback;
      const door = Math.min(1, (pb ? pb.t : 1) / 0.35);
      this.render.setDryerDoor(door);
      this.render.dryerGlow.intensity = 1.6 * door;
      if (T.playbackDone()) {
        T.finishPlayback();
        this.state = 'play';
        this.onPlay?.();
      }
    } else {
      this.acc += dt;
      let n = 0;
      const t0 = performance.now();
      while (this.acc >= P.dt && n < PHYS.maxStepsPerFrame) {
        this._beforeStep();
        P.step();
        T.afterStep();
        this.acc -= P.dt;
        n++;
      }
      if (n) this.stepMs = (performance.now() - t0) / n;
      if (n === PHYS.maxStepsPerFrame) this.acc = 0;
      const door = this.render.dryerDoor.rotation.y;
      if (door < 0) this.render.setDryerDoor(Math.max(0, -door / 1.9 - dt * 1.5));
      this.render.dryerGlow.intensity = Math.max(0, this.render.dryerGlow.intensity - dt * 2);
    }
    this._updateHand(dt);
    T.draw(dt, this.acc / P.dt, this.hand);
    this.render.render(dt);
    if (this.debug) this.debug.update(dt, this);
  }

  _beforeStep() {
    const h = this.hand;
    if (h && h.mode === 'drag' && this.physics.has(h.id)) {
      const p = this.render.planePoint(h.ptr.x, h.ptr.y, PHYS.holdHeight);
      if (p) this.physics.setHoldTarget(h.id, p.x, p.z);
    }
  }

  _updateHand(dt) {
    const h = this.hand;
    if (!h) return;
    const e = this.table.ents.get(h.id);
    if (!e) { this.hand = null; return; }
    if (h.mode === 'drag') {
      const vx = h.ptr.vx || 0;
      h.tilt = (h.tilt || 0) * 0.85 + THREE.MathUtils.clamp(vx / 1400, -0.6, 0.6) * 0.15;
      e.viewPose = this.table.heldPose(e, h.ptr.x, h.ptr.y, { tilt: h.tilt });
    }
  }

  // ---------- input ----------
  _handlers() {
    return {
      down: (p) => this._down(p),
      dragStart: (p) => this._dragStart(p),
      drag: (p) => this._drag(p),
      release: (p, v, still) => this._release(p, still),
      tap: (p) => this._tap(p),
      doubleTap: (p) => this._doubleTap(p),
      secondTap: (p) => this._secondTap(p),
      shake: (path, dir) => this._shake(path, dir),
      cancel: (p) => this._release(p, true),
    };
  }

  pickAt(x, y) {
    if (this.state !== 'play') return null;
    const tryAt = (px, py) => {
      const r = this.render.ray(px, py);
      const hit = this.physics.pick(r.origin, r.dir);
      if (!hit) return null;
      const e = this.table.ents.get(hit.id);
      return e && e.state === 'table' ? { e, hit } : null;
    };
    let got = tryAt(x, y);
    if (got) return got;
    // fat finger: a ring of rays, nearest hit wins
    const R = 16;
    for (let k = 0; k < 8 && !got; k++) {
      const a = (k / 8) * Math.PI * 2;
      got = tryAt(x + Math.cos(a) * R, y + Math.sin(a) * R);
    }
    return got;
  }

  _down(p) {
    const got = this.pickAt(p.x, p.y);
    if (!got) return false;
    this.pending = { id: got.e.id, p };
    return true;
  }

  _dragStart(p) {
    if (!this.pending || this.hand) return;
    const e = this.table.ents.get(this.pending.id);
    this.pending = null;
    if (!e || e.state !== 'table') return;
    this.physics.grab(e.id);
    e.state = 'held';
    this.hand = { id: e.id, mode: 'drag', ptr: { x: p.x, y: p.y, vx: 0 } };
    e.viewPose = this.table.heldPose(e, p.x, p.y);
    this.onGrab?.(e);
  }

  _drag(p) {
    const h = this.hand;
    if (!h || h.mode !== 'drag') return;
    const n = p.hist.length;
    if (n >= 2) {
      const a = p.hist[n - 2], b = p.hist[n - 1];
      const dt = Math.max(4, b.t - a.t) / 1000;
      h.ptr.vx = (b.x - a.x) / dt;
    }
    h.ptr.x = p.x; h.ptr.y = p.y;
  }

  _release(p, still) {
    this.pending = null;
    const h = this.hand;
    if (!h || h.mode !== 'drag') return;
    const e = this.table.ents.get(h.id);
    this.hand = null;
    if (!e) return;
    const v = still ? { x: 0, y: 0, z: 0 } : this.input.velocity(p, (s) => this.render.planePoint(s.x, s.y, PHYS.holdHeight));
    const lift = this.render.planePoint(p.x, p.y, PHYS.holdHeight);
    if (lift) this.physics.setHoldTarget(e.id, lift.x, lift.z);
    const from = e.viewPose;
    const pose = this.physics.pose(e.id);
    // the sock drops back from the hand to its body under the finger, then flies
    e.state = 'flying';
    this.table.fly(e, from, () => ({ ...this.physics.pose(e.id), scale: 1 }), 0.12, () => { e.state = 'table'; });
    this.physics.release(e.id, { x: v.x || 0, y: Math.min(1.2, Math.hypot(v.x || 0, v.z || 0) * 0.15), z: v.z || 0 }, { x: (v.z || 0) * 4, y: 0, z: -(v.x || 0) * 4 });
    void pose;
    this.onRelease?.(e, v);
  }

  _tap() {}
  _doubleTap() {}
  _secondTap() {}

  _shake(path, dir) {
    if (this.state !== 'play') return;
    const pts = path.map((s) => this.render.planePoint(s.x, s.y, 0)).filter(Boolean);
    const a = this.render.planePoint(path[0].x, path[0].y, 0), b = this.render.planePoint(path[path.length - 1].x, path[path.length - 1].y, 0);
    const d = a && b ? { x: b.x - a.x, z: b.z - a.z } : { x: 0, z: 0 };
    const l = Math.hypot(d.x, d.z) || 1;
    this.physics.shake(pts, { x: d.x / l, z: d.z / l });
    void dir;
  }

  // ---------- dev hooks for gates ----------
  devApi() {
    const g = this;
    return {
      version: VERSION,
      get state() { return g.state; },
      counts: () => g.physics.counts(),
      lastDump: () => g.lastDump,
      screenOf: (id) => {
        const e = g.table.ents.get(id);
        const p = e && (e.drawn || g.physics.pose(id));
        return p ? g.render.project(p) : null;
      },
      pose: (id) => g.physics.pose(id),
      ids: () => [...g.table.ents.keys()],
      tableIds: () => [...g.table.ents.values()].filter((e) => e.state === 'table').map((e) => e.id),
      hand: () => (g.hand ? { id: g.hand.id, mode: g.hand.mode } : null),
      smoke: (n, seed) => g.smokePile(n, seed),
      pickAt: (x, y) => { const got = g.pickAt(x, y); return got ? got.e.id : null; },
      heldScreen: () => { const e = g.hand && g.table.ents.get(g.hand.id); return e && e.viewPose ? g.render.project(e.viewPose) : null; },
      // a table sock whose centre is on screen and is what a finger there would pick
      findPickable: (margin = 70) => {
        for (const e of g.table.ents.values()) {
          if (e.state !== 'table') continue;
          const s = g.render.project(g.physics.pose(e.id));
          if (s.x < margin || s.x > g.render.w - margin || s.y < margin * 2 || s.y > g.render.h - margin) continue;
          const got = g.pickAt(s.x, s.y);
          if (got && got.e.id === e.id) return { id: e.id, x: s.x, y: s.y };
        }
        return null;
      },
      stepMs: () => g.stepMs,
    };
  }
}

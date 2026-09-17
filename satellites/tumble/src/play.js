// The table controller: turns gestures into sock handling (DESIGN 3.1).
//
//   drag a sock ............ it lifts and follows the finger; release flicks it
//   tap a sock ............. it jumps into the hand (bottom of the screen)
//   tap another sock ....... it flies to the hand; a match rolls into a ball, a mismatch drops back
//   hold + tap another ..... same, with the first sock still under the finger
//   double tap ............. flips the sock (inside out socks must be flipped to read)
//   flick a ball ........... an arc shot at the basket; misses stay on the table
//   tap the basket ......... the ball in hand is lobbed in (accessibility, DESIGN 12)
//   tap the Odd Bin ........ the sock in hand goes to the Bin (or its mate comes out: a Reunion)
//   tap empty table ........ puts the sock or ball in hand back down
//   two finger swipe ....... shakes the pile apart

import * as THREE from 'three';
import { PHYS, BASKET, ODDBIN, SHOT, TABLE } from './config.js';
import { lobVelocity } from './physics.js';
import { SILHOUETTES } from './silhouettes.js';
import { clamp, quatFromAxisAngle, quatMul } from './mathx.js';

const HAND_R = 96;          // px, the pocket's tap radius
const FLY = 0.28;           // s, a sock flying to the hand

export class Play {
  constructor(game) {
    this.g = game;
    this.P = game.physics;
    this.R = game.render;
    this.T = game.table;
    this.S = null;
    this.hand = null;
    this.pending = null;
    this.shots = new Map();
    this.pops = new Map();
    this.watch = new Map();   // table socks and strays checked for landing in the bin or basket
    this.busy = 0;            // flights in progress that must finish before the Load can end
  }

  begin(session) {
    this.S = session;
    this.hand = null;
    this.pending = null;
    this.shots.clear();
    this.busy = 0;
  }

  get locked() { return !this.S || (this.S.phase !== 'play' && this.S.phase !== 'sweep') || this.g.state !== 'play'; }

  // ---------- geometry helpers ----------
  pocketPoint() { return { x: this.R.w * 0.5, y: this.R.h * 0.8 }; }
  hitPocket(p) {
    if (!this.hand || this.hand.mode !== 'pocket') return false;
    const c = this.pocketPoint();
    return Math.hypot(p.x - c.x, p.y - c.y) < HAND_R;
  }
  screenOfWorld(x, y, z) { return this.R.project({ x, y, z }); }
  hitBasket(p) {
    const c = this.R.project({ x: BASKET.x, y: BASKET.height * 0.6, z: BASKET.z });
    const e = this.R.project({ x: BASKET.x + this.P.basketRadius, y: BASKET.height * 0.6, z: BASKET.z });
    const r = Math.max(34, Math.abs(e.x - c.x) * 1.25);
    return Math.hypot(p.x - c.x, (p.y - c.y) * 0.9) < r;
  }
  hitBin(p) {
    const c = this.R.project({ x: ODDBIN.x, y: ODDBIN.height * 0.6, z: ODDBIN.z });
    const e = this.R.project({ x: ODDBIN.x + ODDBIN.halfW, y: ODDBIN.height * 0.6, z: ODDBIN.z });
    const r = Math.max(34, Math.abs(e.x - c.x) * 1.3);
    return Math.hypot(p.x - c.x, (p.y - c.y) * 0.9) < r;
  }

  pickAt(x, y) {
    const tryAt = (px, py) => {
      const r = this.R.ray(px, py);
      const hit = this.P.pick(r.origin, r.dir);
      if (!hit) return null;
      const e = this.T.ents.get(hit.id);
      if (!e || e.state !== 'table') return null;
      if (e.kind === 'sock') { const s = this.S.sock(e.id); if (!s || s.state !== 'table') return null; }
      if (e.kind === 'ball') { const b = this.S.ball(e.id); if (!b || b.state !== 'table') return null; }
      return e;
    };
    let got = tryAt(x, y);
    for (let k = 0; k < 8 && !got; k++) {
      const a = (k / 8) * Math.PI * 2;
      got = tryAt(x + Math.cos(a) * 16, y + Math.sin(a) * 16);
    }
    return got;
  }

  // ---------- gestures ----------
  down(p) {
    this.pending = null;
    if (this.locked) return false;
    if (this.hitPocket(p)) { this.pending = { type: 'pocket', p }; return true; }
    const e = this.pickAt(p.x, p.y);
    if (e) { this.pending = { type: 'ent', id: e.id, p }; return true; }
    this.pending = { type: 'empty', p };
    return false;
  }

  dragStart(p) {
    const pd = this.pending;
    this.pending = null;
    if (!pd || this.locked) return;
    if (pd.type === 'pocket' && this.hand && this.hand.mode === 'pocket') {
      // pull the item out of the hand and carry it
      const e = this.T.ents.get(this.hand.id);
      const pt = this.R.planePoint(p.x, p.y, PHYS.holdHeight);
      if (e && pt) {
        this.P.place(e.id, pt);
        this.P.setGhost(e.id, false);
        this.P.grab(e.id);
        this.hand.mode = 'drag';
        this.hand.ptr = { x: p.x, y: p.y, vx: 0 };
        e.state = 'held';
      }
      return;
    }
    if (pd.type !== 'ent') return;
    const e = this.T.ents.get(pd.id);
    if (!e || e.state !== 'table') return;
    if (this.hand) {
      // something is already in the hand: a drag on another sock means "this one"
      if (e.kind === 'sock' && this.hand.kind === 'sock') this.bringToHand(e);
      return;
    }
    this.P.grab(e.id);
    e.state = 'held';
    if (e.kind === 'ball') this.S.pickUpBall(e.id); else this.S.setState(e.id, 'hand');
    this.hand = { id: e.id, kind: e.kind, mode: 'drag', ptr: { x: p.x, y: p.y, vx: 0 }, tilt: 0 };
    this.g.sfx('grab');
    this.g.haptic(8);
  }

  drag(p) {
    const h = this.hand;
    if (!h || h.mode !== 'drag') return;
    const n = p.hist.length;
    if (n >= 2) {
      const a = p.hist[n - 2], b = p.hist[n - 1];
      h.ptr.vx = (b.x - a.x) / (Math.max(4, b.t - a.t) / 1000);
    }
    h.ptr.x = p.x; h.ptr.y = p.y;
    if (h.kind === 'ball' && this.g.comfort('goodToss')) this.g.arcPreview(this._launchFor(p, true));
  }

  release(p, still) {
    this.pending = null;
    const h = this.hand;
    this.g.arcPreview(null);
    if (!h || h.mode !== 'drag') return;
    const e = this.T.ents.get(h.id);
    if (!e) { this.hand = null; return; }
    const lift = this.R.planePoint(p.x, p.y, PHYS.holdHeight);
    if (lift) this.P.setHoldTarget(e.id, lift.x, lift.z);
    // a slow release over the Bin or the basket is a drop into it
    if (still || this._speedPx(p) < 220) {
      if (h.kind === 'sock' && this.hitBin(p)) { this.hand = null; this.P.release(e.id, { x: 0, y: 0, z: 0 }); this.toBin(e); return; }
      if (h.kind === 'ball' && this.hitBasket(p)) { this.hand = null; this.P.release(e.id, { x: 0, y: 0, z: 0 }); this.lob(e); return; }
    }
    this.hand = null;
    const from = e.viewPose;
    if (h.kind === 'ball') {
      const L = still ? null : this._launchFor(p, false);
      e.state = 'flying';
      this.T.fly(e, from, () => ({ ...this.P.pose(e.id), scale: 1 }), 0.1, () => { e.state = 'table'; });
      if (L && L.speed >= SHOT.minSpeed) {
        this.P.release(e.id, L.v, { x: -L.v.z * 8, y: 0, z: L.v.x * 8 });
        this._trackShot(e.id, L.start, false);
        this.g.sfx('toss');
      } else {
        this.P.release(e.id, { x: 0, y: 0, z: 0 });
        this.S.dropBall(e.id);
        this.watch.set(e.id, 0);
      }
      return;
    }
    const v = still ? { x: 0, y: 0, z: 0 } : this.g.input.velocity(p, (s) => this.R.planePoint(s.x, s.y, PHYS.holdHeight));
    e.state = 'flying';
    this.T.fly(e, from, () => ({ ...this.P.pose(e.id), scale: 1 }), 0.12, () => { e.state = 'table'; });
    const sp = Math.hypot(v.x || 0, v.z || 0);
    this.P.release(e.id, { x: v.x || 0, y: Math.min(1.4, sp * 0.18), z: v.z || 0 }, { x: (v.z || 0) * 4, y: 0, z: -(v.x || 0) * 4 });
    this.S.setState(e.id, 'table');
    this.watch.set(e.id, 0);
    if (sp > 0.6) this.g.sfx('whoosh', { speed: sp });
  }

  _speedPx(p) {
    const v = this.g.input.velocity(p);
    return Math.hypot(v.x || 0, v.y || 0);
  }

  cancel(p) {
    if (this.hand && this.hand.mode === 'drag') this.release(p, true);
    this.pending = null;
  }

  tap(p) {
    const pd = this.pending;
    this.pending = null;
    if (this.locked) return;
    if (this.S.phase === 'sweep') { this.sweepTap(p); return; }
    const h = this.hand;
    if (h && h.mode === 'pocket') {
      if (this.hitPocket(p)) { if (h.kind === 'sock') this.flip(this.T.ents.get(h.id)); return; }
      if (pd && pd.type === 'ent') {
        const e = this.T.ents.get(pd.id);
        if (e && e.kind === 'sock' && h.kind === 'sock') { this.bringToHand(e); return; }
        if (e && e.kind === 'ball') { this.g.hint('One thing at a time: put this down first.'); return; }
      }
      if (this.hitBasket(p)) {
        if (h.kind === 'ball') { const e = this.T.ents.get(h.id); this.hand = null; this.lob(e); }
        else this.g.hint('That one needs its twin before it can go in the basket.');
        return;
      }
      if (this.hitBin(p)) {
        if (h.kind === 'sock') { const e = this.T.ents.get(h.id); this.hand = null; this.toBin(e); }
        else this.g.hint('The Odd Bin is for socks without a twin.');
        return;
      }
      const pt = this.R.planePoint(p.x, p.y, 0.12);
      if (pt && Math.abs(pt.x) < TABLE.halfW && pt.z > TABLE.playBack && pt.z < TABLE.front) this.putDown(pt);
      return;
    }
    if (h && h.mode === 'drag') return;
    if (pd && pd.type === 'ent') {
      const e = this.T.ents.get(pd.id);
      if (e) this.toPocket(e);
      return;
    }
    if (this.hitBasket(p) && this.S.sub === 'balance') { this.g.settleBasket(); return; }
    if (this.hitBin(p)) { this.g.hint('Odd socks go in here. Pick one up first.'); return; }
  }

  doubleTap(p) {
    if (this.locked) return;
    const h = this.hand;
    if (h && h.kind === 'sock' && (h.mode === 'pocket' || h.mode === 'drag')) { this.flip(this.T.ents.get(h.id)); return; }
    const e = this.pickAt(p.x, p.y);
    if (e && e.kind === 'sock') this.flip(e);
  }

  secondTap(p) {
    if (this.locked) return;
    const h = this.hand;
    if (!h || h.kind !== 'sock') return;
    const e = this.pickAt(p.x, p.y);
    if (e && e.kind === 'sock' && e.id !== h.id) { this.bringToHand(e); return; }
    if (this.hitBin(p) && h.mode === 'drag') {
      const he = this.T.ents.get(h.id);
      this.P.release(he.id, { x: 0, y: 0, z: 0 });
      this.hand = null;
      this.toBin(he);
    }
  }

  shake(path) {
    if (this.locked) return;
    const pts = path.map((s) => this.R.planePoint(s.x, s.y, 0)).filter(Boolean);
    if (pts.length < 2) return;
    const a = pts[0], b = pts[pts.length - 1];
    const d = { x: b.x - a.x, z: b.z - a.z };
    const l = Math.hypot(d.x, d.z) || 1;
    if (this.g.settings.reduceMotion) { this.g.fadeReshuffle(pts); return; }
    const n = this.P.shake(pts, { x: d.x / l, z: d.z / l }, this.g.comfort('sortByFeel') ? 0.8 : 1);
    if (n) this.g.sfx('shuffle', { bodies: n });
    if (this.g.comfort('sortByFeel')) this.g.looseSort(pts);
  }

  // ---------- flows ----------
  _pocketPose(e) {
    const c = this.pocketPoint();
    return this.T.heldPose(e, c.x, c.y, { lift: 0, center: true });
  }

  toPocket(e) {
    if (this.hand) return;
    const from = e.drawn || this.P.pose(e.id);
    this.P.setGhost(e.id, true);
    if (e.kind === 'ball') this.S.pickUpBall(e.id); else this.S.setState(e.id, 'hand');
    this.hand = { id: e.id, kind: e.kind, mode: 'pocket', ptr: null, tilt: 0 };
    this.busy++;
    this.T.fly(e, { ...from, scale: 1 }, () => this._pocketPose(e), 0.22, () => {
      this.busy--;
      if (this.hand && this.hand.id === e.id && this.hand.mode === 'pocket') { e.state = 'pocket'; e.viewPose = this._pocketPose(e); }
    }, { near: true, arc: 0.05 });
    this.g.sfx('grab');
    this.g.haptic(8);
    this._showHints(e);
  }

  _showHints(e) {
    if (e.kind !== 'sock') return;
    // Knows the drawer: the real twin glows faintly (DESIGN 9.4)
    if (this.g.comfort('knowsTheDrawer')) {
      const mate = this.S.mateOf(e.id);
      if (mate !== null) { const me = this.T.ents.get(mate); if (me) me.hintGlow = 0.35; }
    }
  }

  _clearHints() { for (const e of this.T.ents.values()) e.hintGlow = 0; }

  handPose(e) {
    const h = this.hand;
    if (!h) return this._pocketPose(e);
    if (h.mode === 'drag') return this.T.heldPose(e, h.ptr.x, h.ptr.y, { tilt: h.tilt });
    return this._pocketPose(e);
  }

  bringToHand(e2) {
    const h = this.hand;
    if (!h || h.kind !== 'sock' || e2.id === h.id || e2.state !== 'table') return;
    const from = e2.drawn || this.P.pose(e2.id);
    const home = this.P.pose(e2.id);
    this.P.setGhost(e2.id, true);
    this.S.setState(e2.id, 'hand');
    const held = this.T.ents.get(h.id);
    this.busy++;
    this.T.fly(e2, { ...from, scale: 1 }, () => {
      const p = this.handPose(held);
      // meet beside the held sock
      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.R.camera.quaternion).multiplyScalar(0.05);
      return { ...p, x: p.x + right.x, y: p.y + right.y, z: p.z + right.z };
    }, FLY, () => {
      this.busy--;
      e2.state = 'held';
      e2.viewPose = e2.drawn;
      this.resolveMatch(held, e2, home);
    }, { near: true, arc: 0.12 });
    this.g.sfx('fly');
  }

  resolveMatch(a, b, home) {
    if (!this.hand || this.hand.id !== a.id) {
      // the first sock left the hand while the second was flying: put the second back
      this._dropBack(b, home);
      return;
    }
    const r = this.S.match(a.id, b.id);
    if (!r.ok) {
      this.g.sfx('huh');
      this._dropBack(b, home, true);
      this.g.onMismatch?.(a, b);
      return;
    }
    this._rollBall(a, b, r);
  }

  _dropBack(e, home, jostle = false) {
    const target = { x: home.x, y: Math.max(home.y, 0.05) + 0.08, z: home.z, qx: home.qx, qy: home.qy, qz: home.qz, qw: home.qw, scale: 1 };
    e.state = 'flying';
    this.busy++;
    this.T.fly(e, { ...(e.drawn || target) }, () => target, 0.3, () => {
      this.busy--;
      this.P.place(e.id, target, { x: target.qx, y: target.qy, z: target.qz, w: target.qw });
      this.P.setGhost(e.id, false);
      this.S.setState(e.id, 'table');
      e.state = 'table';
      this.T.snapshotOne(e.id);
      if (jostle) this.P.jostle(target, 0.14, 0.3);
      this.watch.set(e.id, 0);
    }, { arc: 0.1 });
  }

  // "thwip": the pair rolls into a ball in the hand (DESIGN 3.1, 13.2)
  _rollBall(a, b, r) {
    const h = this.hand;
    const ballId = r.ball;
    const ball = this.S.ball(ballId);
    const pa = a.viewPose || a.drawn, pb = b.drawn;
    this.busy++;
    const be = this.T.addBallEntity({ id: ballId, tile: a.sock.tile, key: ball.key });
    be.state = 'hidden';
    const dur = 0.36;
    const center = () => this.handPose(be);
    this.T.anim(a, (k) => shrinkTo(pa, center(), k), dur);
    this.T.anim(b, (k) => shrinkTo(pb, center(), k), dur);
    this.g.sfx('thwip');
    this.g.haptic(18);
    setTimeoutFrames(this.g, dur, () => {
      this.busy--;
      this.T.remove(a.id);
      this.T.remove(b.id);
      const pt = (h && h.mode === 'drag' && this.R.planePoint(h.ptr.x, h.ptr.y, PHYS.holdHeight)) || { x: 0, y: PHYS.holdHeight, z: 0.3 };
      this.P.addBall(ballId, { pos: pt });
      if (this.hand && this.hand.id === a.id) {
        this.hand.id = ballId;
        this.hand.kind = 'ball';
        if (this.hand.mode === 'drag') { this.P.grab(ballId); be.state = 'held'; }
        else { this.P.setGhost(ballId, true); be.state = 'pocket'; }
        be.viewPose = this.handPose(be);
        be.pop = 1;
      } else {
        this.P.setGhost(ballId, false);
        be.state = 'table';
        this.S.dropBall(ballId);
      }
      this._clearHints();
      this.g.onMatch?.(r, be);
    });
  }

  flip(e) {
    if (!e || e.kind !== 'sock') return;
    const s = this.S.sock(e.id);
    if (!s) return;
    e.flipSpin = 0;
    this.T.spin(e, 0.32);
    if (s.insideOut) {
      this.S.flip(e.id);
      e.sock.insideOut = false;
      this.g.sfx('flip');
      this.g.onFlip?.(e);
    } else {
      this.g.sfx('flipSoft');
    }
  }

  toBin(e) {
    const s = this.S.sock(e.id);
    if (!s) return;
    const from = e.viewPose || e.drawn || this.P.pose(e.id);
    this.P.setGhost(e.id, true);
    const above = { x: ODDBIN.x, y: ODDBIN.height + 0.12, z: ODDBIN.z, qx: 0, qy: 0, qz: 0, qw: 1, scale: 1 };
    e.state = 'flying';
    this.busy++;
    this.T.fly(e, { ...from }, () => above, 0.42, () => {
      this.busy--;
      const r = this.S.bin(e.id);
      if (r.ok) {
        this.P.place(e.id, { x: ODDBIN.x + (Math.random() - 0.5) * 0.06, y: ODDBIN.height + 0.04, z: ODDBIN.z + (Math.random() - 0.5) * 0.05 }, quatFromAxisAngle(0, 1, 0, Math.random() * 6.28));
        this.P.setGhost(e.id, false);
        e.state = 'table';
        e.inBin = true;
        this.T.snapshotOne(e.id);
        this.g.sfx('bin');
        this.g.onBinned?.(e, r);
      } else {
        this.g.sfx('huh');
        this.g.hint('This one still has a twin somewhere on the table.');
        this._popOut(e);
      }
    }, { arc: 0.18 });
  }

  _popOut(e) {
    const t = { x: (Math.random() - 0.5) * 0.3, y: 0.3, z: TABLE.playBack + 0.25 };
    this.P.place(e.id, { x: e.drawn ? e.drawn.x : t.x, y: 0.35, z: e.drawn ? e.drawn.z : t.z });
    this.P.setGhost(e.id, false);
    this.P.release(e.id, { x: (t.x - (e.drawn ? e.drawn.x : 0)) * 1.4, y: 1.4, z: (t.z - (e.drawn ? e.drawn.z : 0)) * 1.4 });
    e.state = 'table';
    this.S.setState(e.id, e.kind === 'ball' ? 'table' : 'table');
    this.T.snapshotOne(e.id);
    this.watch.set(e.id, 0);
  }

  putDown(pt) {
    const h = this.hand;
    if (!h) return;
    const e = this.T.ents.get(h.id);
    this.hand = null;
    this._clearHints();
    if (!e) return;
    const target = { x: pt.x, y: 0.12, z: pt.z, qx: 0, qy: 0, qz: 0, qw: 1, scale: 1 };
    const yaw = quatFromAxisAngle(0, 1, 0, Math.random() * 6.28);
    target.qx = yaw.x; target.qy = yaw.y; target.qz = yaw.z; target.qw = yaw.w;
    e.state = 'flying';
    this.busy++;
    this.T.fly(e, { ...(e.viewPose || e.drawn) }, () => target, 0.24, () => {
      this.busy--;
      this.P.place(e.id, target, yaw);
      this.P.setGhost(e.id, false);
      e.state = 'table';
      if (e.kind === 'ball') this.S.dropBall(e.id); else this.S.setState(e.id, 'table');
      this.T.snapshotOne(e.id);
      this.watch.set(e.id, 0);
    }, { arc: 0.05 });
  }

  // ---------- shots ----------
  _launchFor(p, preview) {
    const h = this.hand;
    if (!h) return null;
    const v = this.g.input.velocity(p, (s) => this.R.planePoint(s.x, s.y, PHYS.holdHeight));
    let vx = v.x || 0, vz = v.z || 0;
    let sp = Math.hypot(vx, vz) * SHOT.gain;
    if (sp < SHOT.minSpeed) return preview ? null : { speed: sp };
    sp = Math.min(SHOT.maxSpeed, sp);
    const start = this.P.pose(h.id) || this.R.planePoint(p.x, p.y, PHYS.holdHeight);
    // gentle aim assist toward the basket when the flick is already close (cozy first)
    const bx = BASKET.x - start.x, bz = BASKET.z - start.z;
    const aimA = Math.atan2(bz, bx), flickA = Math.atan2(vz, vx);
    let dA = aimA - flickA;
    while (dA > Math.PI) dA -= 2 * Math.PI;
    while (dA < -Math.PI) dA += 2 * Math.PI;
    let ang = flickA;
    if (Math.abs(dA) < SHOT.assistAngle) ang = flickA + dA * SHOT.assist;
    const el = SHOT.elevation;
    const hv = sp * Math.cos(el), vy = sp * Math.sin(el);
    return { speed: sp, start: { x: start.x, y: start.y, z: start.z }, v: { x: Math.cos(ang) * hv, y: vy, z: Math.sin(ang) * hv } };
  }

  _trackShot(id, start, tap) {
    const dist = Math.hypot(BASKET.x - start.x, BASKET.z - start.z);
    this.S.shoot(id, { tap, distance: dist });
    this.shots.set(id, { t: 0, slow: 0, start, tap, touchedRim: false });
    this.busy++;
  }

  lob(e) {
    if (!e) return;
    const from = e.viewPose || e.drawn;
    const start = { x: clamp(from ? from.x : 0, -0.3, 0.3), y: 0.25, z: TABLE.front - 0.2 };
    this.P.place(e.id, start);
    this.P.setGhost(e.id, false);
    this.P.release(e.id, { x: 0, y: 0, z: 0 });
    const target = { x: BASKET.x, y: BASKET.height + 0.04, z: BASKET.z };
    const v = lobVelocity(start, target, SHOT.lobTime);
    this.P.get(e.id).rb.setLinvel(v, true);
    e.state = 'flying';
    this.T.fly(e, { ...(from || start), scale: 1 }, () => ({ ...this.P.pose(e.id), scale: 1 }), 0.16, () => { e.state = 'table'; });
    this._trackShot(e.id, start, true);
    this.g.sfx('toss');
  }

  // ---------- per physics step ----------
  step(dt) {
    if (!this.S) return;
    for (const [id, sh] of this.shots) {
      const rec = this.P.get(id);
      if (!rec) { this.shots.delete(id); this.busy--; continue; }
      sh.t += dt;
      const p = rec.rb.translation(), v = rec.rb.linvel();
      const sp = Math.hypot(v.x, v.y, v.z);
      const inB = this.P.inBasket(p, 0.02);
      sh.slow = sp < 0.3 ? sh.slow + dt : 0;
      if (inB && (sh.slow > 0.12 || rec.frozen)) {
        this.shots.delete(id); this.busy--;
        const res = this.S.shotResult(id, true);
        this.g.onShot?.(id, true, res, p);
        continue;
      }
      if (!inB && (rec.frozen || (sh.slow > 0.35 && p.y < 0.15) || sh.t > 5)) {
        this.shots.delete(id); this.busy--;
        this.S.shotResult(id, false);
        this.g.onShot?.(id, false, null, p);
        this.watch.set(id, 0);
      }
    }
    // things that land in the bin or basket on their own (flicked socks, rolling balls)
    for (const [id, age] of this.watch) {
      const rec = this.P.get(id);
      const e = this.T.ents.get(id);
      if (!rec || !e) { this.watch.delete(id); continue; }
      const t = age + dt;
      this.watch.set(id, t);
      const p = rec.rb.translation();
      const v = rec.rb.linvel();
      const slow = Math.hypot(v.x, v.y, v.z) < 0.25;
      if (e.kind === 'sock' && e.state === 'table') {
        if (this.P.inBin(p, 0.02) && slow) {
          this.watch.delete(id);
          const r = this.S.bin(id);
          if (r.ok) { e.inBin = true; this.g.sfx('bin'); this.g.onBinned?.(e, r); }
          else { this.g.hint('This one still has a twin somewhere on the table.'); this.g.sfx('huh'); this._popOut(e); }
          continue;
        }
        if (this.P.inBasket(p, 0.02) && slow) {
          this.watch.delete(id);
          this.g.hint('Socks go in the basket as pairs. Find its twin first.');
          this._popOut(e);
          continue;
        }
      }
      if (e.kind === 'ball' && e.state === 'table') {
        const b = this.S.ball(id);
        if (b && b.state === 'table' && this.P.inBasket(p, 0.02) && slow) {
          // a stray that rolled or was dropped in counts as made
          this.watch.delete(id);
          b.state = 'flying';
          const res = this.S.shotResult(id, true);
          this.g.onShot?.(id, true, res, p);
          continue;
        }
        if (this.P.inBin(p, 0.02) && slow) { this.watch.delete(id); this._popOut(e); continue; }
      }
      if (rec.frozen || t > 6) this.watch.delete(id);
    }
  }

  // ---------- per frame ----------
  frame(dt) {
    const h = this.hand;
    for (const e of this.T.ents.values()) {
      let glow = e.hintGlow || 0;
      if (e.kind === 'sock' && this.S) {
        const s = this.S.sock(e.id);
        if (s && s.reunion && s.state === 'table' && this.g.comfort('oddEye')) glow = Math.max(glow, 0.45);
      }
      if (e.kind === 'ball' && this.S && this.S.phase === 'sweep') {
        const b = this.S.ball(e.id);
        if (b && b.state === 'table') glow = 0.9;
      }
      e.glow = glow;
    }
    if (!h) return;
    const e = this.T.ents.get(h.id);
    if (!e) { this.hand = null; return; }
    if (h.mode === 'drag') {
      h.tilt = h.tilt * 0.85 + clamp((h.ptr.vx || 0) / 1400, -0.6, 0.6) * 0.15 * (this.g.comfort('secondLook') ? 1.6 : 1);
      if (e.state === 'held') e.viewPose = this.T.heldPose(e, h.ptr.x, h.ptr.y, { tilt: h.tilt });
    } else if (e.state === 'pocket') {
      h.tilt = Math.sin(this.T.time * 1.3) * 0.08;
      e.viewPose = this.T.heldPose(e, this.pocketPoint().x, this.pocketPoint().y, { lift: 0, center: true, tilt: h.tilt });
    }
  }

  // ---------- sweep (DESIGN 3.3) ----------
  sweepTap(p) {
    let best = null, bd = 60;
    for (const b of this.S.strays()) {
      const s = this.R.project(this.P.pose(b.id));
      const d = Math.hypot(s.x - p.x, s.y - p.y);
      if (d < bd) { bd = d; best = b.id; }
    }
    if (best !== null) this.sweepOne(best);
  }

  sweepOne(id) {
    const e = this.T.ents.get(id);
    if (!e || !this.S.sweep(id)) return;
    const from = this.P.pose(id);
    this.P.setGhost(id, true);
    const target = { x: BASKET.x + (Math.random() - 0.5) * 0.05, y: BASKET.height * 0.5, z: BASKET.z + (Math.random() - 0.5) * 0.05, qx: 0, qy: 0, qz: 0, qw: 1, scale: 1 };
    this.T.fly(e, { ...from, scale: 1 }, () => target, 0.45, () => {
      this.P.place(id, target);
      this.P.setGhost(id, false);
      e.state = 'table';
      this.T.snapshotOne(id);
      this.g.sfx('basket', { soft: true });
    }, { arc: 0.3 });
  }
}

function shrinkTo(a, c, k) {
  const kk = k * k * (3 - 2 * k);
  const q = new THREE.Quaternion(a.qx, a.qy, a.qz, a.qw);
  const spin = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0.3, 1, 0.2).normalize(), kk * 5);
  q.multiply(spin);
  return {
    x: a.x + (c.x - a.x) * kk, y: a.y + (c.y - a.y) * kk, z: a.z + (c.z - a.z) * kk,
    qx: q.x, qy: q.y, qz: q.z, qw: q.w,
    scale: (a.scale || 1) * (1 - 0.8 * kk),
  };
}

// run a callback after `sec` seconds of game time (so a frozen tab does not fire it early)
function setTimeoutFrames(game, sec, fn) {
  game.later(sec, fn);
}

export { quatMul };

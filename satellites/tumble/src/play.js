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
import { lobVelocity, idealSpeed } from './physics.js';
import { SILHOUETTES } from './silhouettes.js';
import { clamp, quatFromAxisAngle, quatMul, quatSlerp, smooth, clothLift } from './mathx.js';
import { footprintPick } from './pick.js';

const HAND_R = 96;          // px, the pocket's tap radius
const HAND_CORE = 44;       // px, inside this the tap is the held sock's even when a table sock peeks out behind it
const KEEP_PHYSICAL = 3;    // basketed balls that stay physical; older ones are drawn packed in the basket
const DOUBLE_WAIT = 0.34;   // s, a fetch waits this long in case the tap was the first of a double tap (Input DOUBLE_MS)
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
    this.watch = new Map();   // table socks and strays checked for landing in the bin or basket: id -> { t, left }
    this.busy = 0;            // flights in progress that must finish before the Load can end
    this.gen = 0;             // bumped per Load, so a flight from an old Load cannot touch busy
  }

  // nothing stays on the clip between Loads
  clearClip() { const e = this.clipped !== null && this.clipped !== undefined ? this.T.ents.get(this.clipped) : null; this.clipped = null; if (e && e.state === 'clip') e.state = 'table'; }

  begin(session) {
    this.S = session;
    this.hand = null;
    this.pending = null;
    this.shots.clear();
    this.watch.clear();
    this.busy = 0;
    this.gen++;
    this.inBasket = [];
    this.packCount = 0;
    this.binCount = 0;
    this.clipped = null;     // the sock on the Bobby Pin's clip, if she has one (DESIGN-T2 2.5)
  }

  // Something on the table to keep an eye on until it settles: did it land in the Bin or the basket on its own?
  // `left` records that it has been outside the basket, so a ball still sitting in a tipped basket is not scored again.
  watchItem(id) { this.watch.set(id, { t: 0, left: false }); }
  unwatch(id) { this.watch.delete(id); }

  // A flight the Load waits for. Finishing it or having it cut short (replaced, removed) lets go exactly once.
  flyBusy(e, from, toFn, dur, onDone, opts = {}) {
    const gen = this.gen;
    let open = true;
    const close = () => { if (open) { open = false; if (gen === this.gen) this.busy--; } };
    this.busy++;
    this.T.fly(e, from, toFn, dur, (pose) => { close(); if (gen === this.gen && onDone) onDone(pose); }, { ...opts, onAbort: close });
  }

  get locked() { return !this.S || (this.S.phase !== 'play' && this.S.phase !== 'sweep') || this.g.state !== 'play'; }

  // ---------- geometry helpers ----------
  // low on the screen so the held sock covers as little of the pile as it can (Stephen, Sep 17: "sometimes its in the way
  // of its match"); heldPose clamps it onto the screen
  pocketPoint() { return { x: this.R.w * 0.5, y: this.R.h * 0.85 }; }
  // THE BOBBY PIN (DESIGN-T2 2.5, the `sockClip` comfort): one sock can be parked on a clip at the table's
  // edge while she keeps looking. It is MOTOR friction only: the sock is still hers to match by hand, the
  // clip never says which one it is, and the law of a comfort keeps it out of Rush and the Daily.
  clipPoint() { return { x: this.R.w * 0.13, y: this.R.h * 0.58 }; }
  clipOn() { return this.g.comfort('sockClip'); }
  hitClip(p) {
    if (!this.clipOn()) return false;
    const c = this.clipPoint();
    return Math.hypot(p.x - c.x, p.y - c.y) < 48;
  }
  _clipPose(e) { const c = this.clipPoint(); return this.T.heldPose(e, c.x, c.y, { lift: 0, center: true, scale: this.T.heldScale * 0.62 }); }

  // park the sock in her hand on the clip
  park(e) {
    if (!e || e.kind !== 'sock' || this.clipped) return false;
    this.clipped = e.id;
    this.hand = null;
    e.state = 'clip';
    e.viewPose = this._clipPose(e);
    this.g.sfx('flipSoft');
    return true;
  }

  // take it back into the hand
  unpark() {
    const e = this.clipped !== null && this.clipped !== undefined ? this.T.ents.get(this.clipped) : null;
    this.clipped = null;
    if (!e) return false;
    if (this.hand) { e.state = 'clip'; this.clipped = e.id; return false; }
    e.state = 'pocket';
    this.hand = { id: e.id, kind: 'sock', mode: 'pocket', ptr: null, tilt: 0 };
    e.viewPose = this._pocketPose(e);
    this.g.sfx('grab');
    return true;
  }

  // the sock in her hand meets the one on the clip
  matchClipped() {
    const h = this.hand;
    const e = this.clipped !== null && this.clipped !== undefined ? this.T.ents.get(this.clipped) : null;
    if (!h || h.kind !== 'sock' || !e) return false;
    const held = this.T.ents.get(h.id);
    if (!held || held.id === e.id) return false;
    this.clipped = null;
    e.state = 'held';
    e.viewPose = this._clipPose(e);
    const home = e.cameFrom ? { x: e.cameFrom.x, y: 0.1, z: e.cameFrom.z } : { x: 0, y: 0.1, z: 0.05 };
    this.flyBusy(e, { ...(e.viewPose || {}), scale: 1 }, () => {
      const pp = this.handPose(held);
      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.R.camera.quaternion).multiplyScalar(0.05);
      return { ...pp, x: pp.x + right.x, y: pp.y + right.y, z: pp.z + right.z };
    }, FLY, () => { e.viewPose = e.drawn; this.resolveMatch(held, e, home); }, { near: true, arc: 0.12 });
    this.g.sfx('fly');
    return true;
  }
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

  // What the finger means is the sock the player SEES under it. A sock's physics shape is two rails with a gap down
  // the middle (src/pick.js says why that matters): in a heap a tap through the gap picked up the sock UNDERNEATH,
  // worse the bigger the Load. So the footprint of every sock on the table is tested too, and whichever is nearest
  // along the ray wins. `?oldpick=1` is the old behaviour, kept so the gate can watch it fail.
  pickAt(x, y) {
    // NOT through the Odd Bin or the basket: a ray through either goes on to the table behind it, and a footprint is a
    // far bigger target than a rail, so a tap ON THE BIN picked up a sock lying behind it and the sock in hand never
    // went in (gate step 3 caught it the day this shipped). Inside those two tap zones the pick is what it always was.
    const zone = this.hitBin({ x, y }) || this.hitBasket({ x, y });
    const socks = zone || (this.g.params && this.g.params.has('oldpick')) ? null : this._footprints();
    const tryAt = (px, py) => {
      const r = this.R.ray(px, py);
      let hit = this.P.pick(r.origin, r.dir);
      if (socks) { const f = footprintPick(r.origin, r.dir, socks); if (f && (!hit || f.toi < hit.toi)) hit = f; }
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

  // every sock lying on the table, with the pose the physics holds for it (one list for all nine rays of a tap)
  _footprints() {
    const out = this._fp || (this._fp = []);
    out.length = 0;
    for (const e of this.T.ents.values()) {
      if (e.kind !== 'sock' || e.state !== 'table') continue;
      const rec = this.P.get(e.id);
      if (!rec || rec.held || rec.off) continue;
      const pose = this.P.pose(e.id);
      if (pose) out.push({ id: e.id, silId: rec.silId, scale: rec.scale || 1, pose });
    }
    return out;
  }

  // Put what is in the hand back where it came from. On a Heavy or a Mountain Load the table is covered, so "tap an
  // empty spot to put it down" had nowhere to tap and every try picked up another sock (Stephen, Sep 21 2026: "i will
  // try to put a sock i accidentally picked up back and it wont let me"). What she does by hand always works.
  putBack() {
    const h = this.hand;
    if (this.locked || !h || h.mode !== 'pocket' || h.rolling) return false;
    const e = this.T.ents.get(h.id);
    const from = (e && e.cameFrom) || { x: 0, z: (TABLE.playBack + TABLE.front) / 2 };
    this.putDown({ x: clamp(from.x, -TABLE.halfW * 0.9, TABLE.halfW * 0.9), z: clamp(from.z, TABLE.playBack + 0.04, TABLE.front - 0.04) });
    return true;
  }

  // ---------- gestures ----------
  down(p) {
    this.pending = null;
    if (this.locked) return false;
    const e = this.pickAt(p.x, p.y);
    if (this.hitPocket(p)) {
      // a table sock peeking out beside the held one is what the thumb wants (Stephen, Sep 17: "its in the way of its
      // match and i cant click on it"); only a press near the held sock's middle means the held sock itself
      const c = this.pocketPoint();
      // Sleeves rolled up (DESIGN-T2 2.6): the whole pocket is the held sock's, so a turn can start anywhere
      // on it. Without the peg only the middle is, because a table sock peeking out beside it is usually what
      // the thumb wants (Stephen, Sep 17).
      const core = this.g.comfort('sleevesRolled') ? HAND_R : HAND_CORE;
      if (!e || Math.hypot(p.x - c.x, p.y - c.y) <= core) { this.pending = { type: 'pocket', p }; return true; }
    }
    if (e) { this.pending = { type: 'ent', id: e.id, p }; return true; }
    this.pending = { type: 'empty', p };
    return false;
  }

  dragStart(p) {
    const pd = this.pending;
    this.pending = null;
    if (!pd || this.locked) return;
    if (pd.type === 'pocket' && this.hand && this.hand.mode === 'pocket') {
      if (this.hand.rolling) return;
      // pull the item out of the hand and carry it
      const e = this.T.ents.get(this.hand.id);
      const pt = this.R.planePoint(p.x, p.y, PHYS.holdHeight);
      if (e && pt) {
        this.T.cancelFlight(e);
        this.P.place(e.id, pt);
        this.P.setGhost(e.id, false);
        this.P.grab(e.id);
        this.hand.mode = 'drag';
        this.hand.ptr = { x: p.x, y: p.y, vx: 0 };
        const f0 = e.drawn || e.viewPose;
        e.lift = f0 ? { from: { ...f0 }, t: 0 } : null;
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
    this.unwatch(e.id);
    e.viewPose = e.drawn || this.P.pose(e.id);
    // the sock rises from the pile to the thumb over a moment instead of jumping there
    e.lift = { from: { ...e.viewPose, scale: e.viewPose.scale || 1 }, t: 0 };
    e.state = 'held';
    if (e.kind === 'ball') this.S.pickUpBall(e.id); else { this.S.setState(e.id, 'hand'); this._pulled(e); }
    this.hand = { id: e.id, kind: e.kind, mode: 'drag', ptr: { x: p.x, y: p.y, vx: 0 }, tilt: 0 };
    this.g.sfx('grab');
    this.g.haptic('pickUp');
  }

  // A sock is lifted out of the heap (DESIGN-T2 2.2, the `pull` moment). It pays no coin: the only thing that
  // hangs on it is a find that comes out this way, and the find is drawn from where the sock was.
  _pulled(e) {
    const at = e.drawn || this.P.pose(e.id) || null;
    this.S.pull(e.id, at ? { x: at.x, y: (at.y || 0) + 0.06, z: at.z } : null);
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
    if (h.rolling) { h.mode = 'pocket'; h.ptr = null; return; }
    const e = this.T.ents.get(h.id);
    if (!e) { this.hand = null; return; }
    const lift = this.R.planePoint(p.x, p.y, PHYS.holdHeight);
    if (lift) this.P.setHoldTarget(e.id, lift.x, lift.z);
    // a slow release over the Bin or the basket is a drop into it
    if (still || this._speedPx(p) < 220) {
      if (h.kind === 'sock' && this.hitBin(p)) { this.hand = null; this.P.release(e.id, { x: 0, y: 0, z: 0 }); this.toBin(e); return; }
      if (h.kind === 'ball' && this.hitBasket(p)) { this.hand = null; this.P.release(e.id, { x: 0, y: 0, z: 0 }); this.lob(e, { x: BASKET.x, y: BASKET.height + 0.1, z: BASKET.z }, 0.2); return; }
    }
    this.hand = null;
    // (a flick can end before the first held frame was drawn)
    const from = e.viewPose || e.drawn || this.P.pose(e.id);
    if (h.kind === 'ball') {
      const L = still ? null : this._launchFor(p, false, h.id);
      e.state = 'flying';
      this.T.fly(e, from, () => ({ ...this.P.pose(e.id), scale: 1 }), 0.1, () => { e.state = 'table'; });
      if (L && L.speed >= SHOT.minSpeed) {
        this.P.release(e.id, L.v, { x: -L.v.z * 8, y: 0, z: L.v.x * 8 });
        this._trackShot(e.id, L.start, false);
        this.g.sfx('toss');
      } else {
        this.P.release(e.id, { x: 0, y: 0, z: 0 });
        this.S.dropBall(e.id);
        this.watchItem(e.id);
      }
      return;
    }
    const v = still ? { x: 0, y: 0, z: 0 } : this.g.input.velocity(p, (s) => this.R.planePoint(s.x, s.y, PHYS.holdHeight));
    e.state = 'flying';
    this.T.fly(e, from, () => ({ ...this.P.pose(e.id), scale: 1 }), 0.12, () => { e.state = 'table'; });
    const sp = Math.hypot(v.x || 0, v.z || 0);
    this.P.release(e.id, { x: v.x || 0, y: Math.min(1.4, sp * 0.18), z: v.z || 0 }, { x: (v.z || 0) * 4, y: 0, z: -(v.x || 0) * 4 });
    this.S.setState(e.id, 'table');
    this.watchItem(e.id);
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
    this.tapPocketed = null;
    // the Sweep (DESIGN 3.3): a tap pops a stray into the basket; nothing else is live after the clock
    if (this.S && this.S.phase === 'sweep' && this.g.state === 'sweep') { this.sweepTap(p); return; }
    if (this.locked) return;
    const h = this.hand;
    if (h && h.rolling) return;
    // the clip, before anything else a tap could mean at that corner
    if (this.hitClip(p)) {
      if (h && h.kind === 'sock' && h.mode === 'pocket') {
        if (this.clipped !== null && this.clipped !== undefined) { if (this.matchClipped()) return; }
        else if (this.park(this.T.ents.get(h.id))) return;
      } else if (!h && this.unpark()) return;
    }
    if (h && h.mode === 'pocket') {
      // down() already chose between the held sock and a table sock under the same thumb
      if ((pd && pd.type === 'pocket') || (!pd && this.hitPocket(p))) { if (h.kind === 'sock') this.flip(this.T.ents.get(h.id)); return; }
      if (pd && pd.type === 'ent') {
        const e = this.T.ents.get(pd.id);
        if (e && e.kind === 'sock' && h.kind === 'sock' && e.id !== h.id) { this.deferBring(e, p); return; }
        if (e && e.kind === 'ball') { this.g.hint('One thing at a time: put this down first, with the arrow at the bottom left.'); return; }
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
      // the press may be old news: Sock Puppet or a shake can have moved this one since the finger went down
      const e = this.T.ents.get(pd.id);
      if (e && this._onTable(e)) { this.toPocket(e); this.tapPocketed = e.id; }
      return;
    }
    if (this.hitBasket(p) && this.S.sub === 'balance') { this.g.settleBasket(); return; }
    if (this.hitBin(p)) { this.g.hint('Odd socks go in here. Pick one up first.'); return; }
  }

  _onTable(e) {
    if (e.state !== 'table' || e.packed || e.inBin) return false;
    const s = e.kind === 'sock' ? this.S.sock(e.id) : this.S.ball(e.id);
    return !!s && s.state === 'table';
  }

  // With a sock in hand, a tap on a table sock means "this one", but it may be the first half of a double tap
  // (flip that sock to read it). The fetch waits out the double tap window.
  deferBring(e, p) {
    // answer the tap at once (a little hop, the grab sound) even though the fetch waits out the double tap window
    if (!this.g.settings.reduceMotion) e.nudge = 1;
    this.g.sfx('grab');
    const token = {};
    this.bringWait = { token, id: e.id, x: p.x, y: p.y };
    this.g.later(DOUBLE_WAIT, () => {
      const w = this.bringWait;
      if (!w || w.token !== token) return;
      this.bringWait = null;
      if (this.locked || !this.hand || this.hand.rolling) return;
      const e2 = this.T.ents.get(w.id);
      if (e2 && this._onTable(e2)) this.bringToHand(e2);
    });
  }

  doubleTap(p) {
    if (this.locked) return;
    const h = this.hand;
    if (h && h.rolling) return;
    // the first tap of this pair queued a fetch: it was a flip instead
    const w = this.bringWait;
    this.bringWait = null;
    if (w) {
      const e = this.T.ents.get(w.id);
      if (e && this._onTable(e)) { this.flip(e); return; }
    }
    // the first tap picked this sock up: the double tap flips it in the hand
    const first = this.tapPocketed;
    this.tapPocketed = null;
    if (h && h.kind === 'sock' && (h.id === first || h.mode === 'drag' || this.hitPocket(p))) { this.flip(this.T.ents.get(h.id)); return; }
    const e = this.pickAt(p.x, p.y);
    if (e && e.kind === 'sock') { this.flip(e); return; }
    if (h && h.kind === 'sock') this.flip(this.T.ents.get(h.id));
  }

  secondTap(p) {
    if (this.locked) return;
    const h = this.hand;
    if (!h || h.kind !== 'sock' || h.rolling) return;
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
    if (from) e.cameFrom = { x: from.x, z: from.z }; // where putBack returns it
    this.P.setGhost(e.id, true);
    this.unwatch(e.id);
    if (e.kind === 'ball') this.S.pickUpBall(e.id); else { this.S.setState(e.id, 'hand'); this._pulled(e); }
    this.hand = { id: e.id, kind: e.kind, mode: 'pocket', ptr: null, tilt: 0 };
    this.flyBusy(e, { ...from, scale: 1 }, () => this._pocketPose(e), 0.22, () => {
      if (this.hand && this.hand.id === e.id && this.hand.mode === 'pocket') { e.state = 'pocket'; e.viewPose = this._pocketPose(e); }
    }, { near: true, arc: 0.05 });
    this.g.sfx('grab');
    this.g.haptic('pickUp');
    this._showHints(e);
  }

  _showHints(e) {
    if (e.kind !== 'sock') return;
    // a hero sock introduces itself
    if (e.sock.hero) { const t = `${e.sock.hero.name}. ${e.sock.hero.flavor}`; this.g.hint(t, Math.min(7000, Math.max(3600, 1500 + t.length * 40))); }
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
    if (h.mode === 'drag') return this._dragPose(e, h);
    return this._pocketPose(e);
  }

  // A dragged sock floats above the thumb so its pattern stays readable; a dragged ball sits under the thumb, where the
  // throw starts (Stephen, Sep 17: "the ball is actually above where im touching, it should be in the middle").
  _dragPose(e, h) {
    if (e.kind === 'ball') return this.T.heldPose(e, h.ptr.x, h.ptr.y, { tilt: h.tilt, lift: 0, center: true });
    return this.T.heldPose(e, h.ptr.x, h.ptr.y, { tilt: h.tilt });
  }

  bringToHand(e2) {
    const h = this.hand;
    if (!h || h.kind !== 'sock' || e2.id === h.id || e2.state !== 'table') return;
    const from = e2.drawn || this.P.pose(e2.id);
    const home = this.P.pose(e2.id);
    this.P.setGhost(e2.id, true);
    this.unwatch(e2.id);
    this.S.setState(e2.id, 'hand');
    const held = this.T.ents.get(h.id);
    this.flyBusy(e2, { ...from, scale: 1 }, () => {
      const p = this.handPose(held);
      // meet beside the held sock
      const right = new THREE.Vector3(1, 0, 0).applyQuaternion(this.R.camera.quaternion).multiplyScalar(0.05);
      return { ...p, x: p.x + right.x, y: p.y + right.y, z: p.z + right.z };
    }, FLY, () => {
      e2.state = 'held';
      e2.viewPose = e2.drawn;
      this.resolveMatch(held, e2, home);
    }, { near: true, arc: 0.12 });
    this.g.sfx('fly');
  }

  resolveMatch(a, b, home) {
    if (!this.hand || this.hand.id !== a.id || this.hand.rolling) {
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
    this.flyBusy(e, { ...(e.drawn || target) }, () => target, 0.3, () => {
      this.P.place(e.id, target, { x: target.qx, y: target.qy, z: target.qz, w: target.qw });
      this.P.setGhost(e.id, false);
      this.S.setState(e.id, 'table');
      e.state = 'table';
      this.T.snapshotOne(e.id);
      if (jostle) { const n = this.P.jostle(target, 0.14, 0.3); if (n) this.g.sfx('shuffle', { bodies: n }); }
      this.watchItem(e.id);
    }, { arc: 0.1 });
  }

  // "thwip": the pair rolls into a ball in the hand (DESIGN 3.1, 13.2)
  _rollBall(a, b, r) {
    const h = this.hand;
    const ballId = r.ball;
    const ball = this.S.ball(ballId);
    const pa = a.viewPose || a.drawn, pb = b.drawn;
    if (h && h.id === a.id) h.rolling = true;
    const gen = this.gen;
    this.busy++;
    const be = this.T.addBallEntity({ id: ballId, tile: a.sock.tile, key: ball.key });
    be.state = 'hidden';
    const dur = 0.36;
    const center = () => this.handPose(be);
    this.T.anim(a, (k) => shrinkTo(pa, center(), k), dur);
    this.T.anim(b, (k) => shrinkTo(pb, center(), k), dur);
    this.g.sfx('thwip');
    this.g.haptic('pair');
    setTimeoutFrames(this.g, dur, () => {
      if (gen !== this.gen) return;
      this.busy--;
      this.T.remove(a.id);
      this.T.remove(b.id);
      const pt = (h && h.mode === 'drag' && this.R.planePoint(h.ptr.x, h.ptr.y, PHYS.holdHeight)) || { x: 0, y: PHYS.holdHeight, z: 0.3 };
      this.P.addBall(ballId, { pos: pt });
      if (this.hand && this.hand.id === a.id) {
        this.hand.rolling = false;
        this.hand.id = ballId;
        this.hand.kind = 'ball';
        if (this.hand.mode === 'drag') { this.P.grab(ballId); be.state = 'held'; }
        else { this.P.setGhost(ballId, true); be.state = 'pocket'; }
        be.viewPose = this.handPose(be);
        be.pop = 1;
        this.g.sfx('match');
      } else {
        this.P.setGhost(ballId, false);
        be.state = 'table';
        this.S.dropBall(ballId);
        this.watchItem(ballId);
        this.g.sfx('match');
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
      // the coin from the cuff falls where the sock is, in the hand or on the table
      this.S.flip(e.id, e.viewPose || this.g.physics.pose(e.id) || null);
      // the right side shows once the sock has started to turn over
      this.g.later(0.08, () => { e.sock.insideOut = false; });
      this.g.sfx('flip');
      this.g.onFlip?.(e);
    } else {
      this.g.sfx('flipSoft');
    }
  }

  toBin(e) {
    const s = this.S.sock(e.id);
    if (!s) return;
    this.unwatch(e.id);
    const from = e.viewPose || e.drawn || this.P.pose(e.id);
    this.P.setGhost(e.id, true);
    const above = { x: ODDBIN.x, y: ODDBIN.height + 0.12, z: ODDBIN.z, qx: 0, qy: 0, qz: 0, qw: 1, scale: 1 };
    // the Bin's answer does not depend on the flight, so it is asked now: an odd sock folds itself into the Bin in one
    // motion (Stephen, Sep 17: binning "should be a little more fluid"); a sock that still has a twin flies up and pops out
    const r = this.S.phase === 'play' ? this.S.bin(e.id) : { ok: false };
    if (r.ok) {
      e.inBin = true;
      const target = this.binPose(e, this.binCount++);
      if (this.P.has(e.id)) this.P.remove(e.id);
      this.flyBusy(e, { ...from }, () => target, 0.45, () => { e.vis = target; this.g.sfx('bin'); this.g.onBinned?.(e, r); }, { arc: 0.22 });
      return;
    }
    this.flyBusy(e, { ...from }, () => above, 0.42, () => {
      if (this.S.phase === 'play') { this.g.sfx('huh'); this.g.hint('This one still has a twin somewhere on the table.'); }
      this._popOut(e);
    }, { arc: 0.18 });
  }

  // An odd sock in the Bin leaves the physics world and is drawn folded small inside the box, one on top of the
  // other (a long sock at full size stuck out over the rim, and the Bin never needs to be dug through).
  _tuckIntoBin(e, from) {
    e.inBin = true;
    const k = this.binCount++;
    const target = this.binPose(e, k);
    if (this.P.has(e.id)) this.P.remove(e.id);
    this.T.fly(e, { ...(from || target) }, () => target, 0.2, () => { e.vis = target; }, { arc: 0.02 });
  }

  binPose(e, k) {
    // (the mesh origin is the middle of the sock's centreline, so the spot is where the sock sits)
    const sil = SILHOUETTES[e.sock.silId];
    const sc = sil.leg + sil.foot > 0.36 ? 0.42 : 0.5;
    const yaw = (k % 2 ? 0.4 : -0.3) + ((k * 0.37) % 0.3);
    const q = quatFromAxisAngle(0, 1, 0, yaw);
    return {
      x: ODDBIN.x + (((k * 37) % 5) - 2) * 0.012, y: 0.02 + Math.min(k, 9) * 0.01, z: ODDBIN.z + (((k * 53) % 5) - 2) * 0.008,
      qx: q.x, qy: q.y, qz: q.z, qw: q.w, scale: sc,
    };
  }

  _popOut(e) {
    const t = { x: (Math.random() - 0.5) * 0.3, y: 0.3, z: TABLE.playBack + 0.25 };
    this.P.place(e.id, { x: e.drawn ? e.drawn.x : t.x, y: 0.35, z: e.drawn ? e.drawn.z : t.z });
    this.P.setGhost(e.id, false);
    this.P.release(e.id, { x: (t.x - (e.drawn ? e.drawn.x : 0)) * 1.4, y: 1.4, z: (t.z - (e.drawn ? e.drawn.z : 0)) * 1.4 });
    e.state = 'table';
    this.S.setState(e.id, e.kind === 'ball' ? 'table' : 'table');
    this.T.snapshotOne(e.id);
    this.watchItem(e.id);
  }

  putDown(pt) {
    const h = this.hand;
    if (!h) return;
    const e = this.T.ents.get(h.id);
    this.hand = null;
    this._clearHints();
    if (!e) return;
    const rec = this.P.get(e.id);
    if (rec && rec.held) this.P.release(e.id, { x: 0, y: 0, z: 0 });
    const target = { x: pt.x, y: 0.12, z: pt.z, qx: 0, qy: 0, qz: 0, qw: 1, scale: 1 };
    const yaw = quatFromAxisAngle(0, 1, 0, Math.random() * 6.28);
    target.qx = yaw.x; target.qy = yaw.y; target.qz = yaw.z; target.qw = yaw.w;
    this.flyBusy(e, { ...(e.viewPose || e.drawn) }, () => target, 0.24, () => {
      this.P.place(e.id, target, yaw);
      this.P.setGhost(e.id, false);
      e.state = 'table';
      if (e.kind === 'ball') this.S.dropBall(e.id); else this.S.setState(e.id, 'table');
      this.T.snapshotOne(e.id);
      this.watchItem(e.id);
    }, { arc: 0.05 });
  }

  // ---------- shots ----------
  // the hand is already empty when a release asks, so the thrown item's id comes in
  _launchFor(p, preview, id = this.hand && this.hand.id) {
    if (id === null || id === undefined) return null;
    const v = this.g.input.velocity(p, (s) => this.R.planePoint(s.x, s.y, PHYS.holdHeight));
    const vx = v.x || 0, vz = v.z || 0;
    // direction from the table plane; strength from the finger's speed in screen heights a second, so the same
    // flick throws the same wherever it starts (on the table plane, a flick near the back covers more ground)
    let sp = ((v.px || 0) / Math.max(1, this.R.h)) * SHOT.gain;
    const raw = sp;
    if (sp < SHOT.minSpeed) return preview ? null : { speed: sp };
    sp = Math.min(SHOT.maxSpeed, sp);
    const start = this.P.pose(id) || this.R.planePoint(p.x, p.y, PHYS.holdHeight);
    // gentle aim assist toward the basket when the flick is already close (cozy first)
    const bx = BASKET.x - start.x, bz = BASKET.z - start.z;
    const aimA = Math.atan2(bz, bx), flickA = Math.atan2(vz, vx);
    let dA = aimA - flickA;
    while (dA > Math.PI) dA -= 2 * Math.PI;
    while (dA < -Math.PI) dA += 2 * Math.PI;
    let ang = flickA;
    const el = SHOT.elevation;
    if (Math.abs(dA) < SHOT.assistAngle) {
      ang = flickA + dA * SHOT.assist;
      // a flick in the right direction at roughly the right strength gets its strength nudged as well
      const ideal = idealSpeed(Math.hypot(bx, bz), BASKET.height - 0.02 - start.y, el);
      if (ideal && sp > ideal * SHOT.rangeWindow[0] && sp < ideal * SHOT.rangeWindow[1]) sp += (ideal - sp) * SHOT.rangeAssist;
      if (!preview) this.lastFlick = { px: v.px || 0, raw, ideal, launch: sp, aimed: true };
    } else if (!preview) {
      this.lastFlick = { px: v.px || 0, raw, ideal: 0, launch: sp, aimed: false };
    }
    const hv = sp * Math.cos(el), vy = sp * Math.sin(el);
    return { speed: sp, start: { x: start.x, y: start.y, z: start.z }, v: { x: Math.cos(ang) * hv, y: vy, z: Math.sin(ang) * hv } };
  }

  _trackShot(id, start, tap) {
    const dist = Math.hypot(BASKET.x - start.x, BASKET.z - start.z);
    this.S.shoot(id, { tap, distance: dist });
    this.shots.set(id, { t: 0, slow: 0, start, tap, touchedRim: false });
    this.busy++;
  }

  // startAt: where the ball leaves from (a drop over the basket starts right above it); time: the flight
  lob(e, startAt = null, time = SHOT.lobTime) {
    if (!e) return;
    const from = e.viewPose || e.drawn;
    const start = startAt || { x: clamp(from ? from.x : 0, -0.3, 0.3), y: 0.25, z: TABLE.front - 0.2 };
    this.P.place(e.id, start);
    this.P.setGhost(e.id, false);
    this.P.release(e.id, { x: 0, y: 0, z: 0 });
    const target = { x: BASKET.x, y: BASKET.height + 0.04, z: BASKET.z };
    const v = lobVelocity(start, target, time);
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
      // impacts are felt the moment they happen: a sudden change of velocity (gravity alone is 0.16 m/s a step)
      const dv = sh.lv ? Math.hypot(v.x - sh.lv.x, v.y - sh.lv.y, v.z - sh.lv.z) : 0;
      sh.lv = { x: v.x, y: v.y, z: v.z };
      if (dv > 0.9 && sh.t - (sh.hitT ?? -1) > 0.08) {
        sh.hitT = sh.t;
        const rimD = Math.hypot(Math.hypot(p.x - BASKET.x, p.z - BASKET.z) - this.P.basketRadius, p.y - BASKET.height);
        if (rimD < 0.065) { sh.touchedRim = true; this.g.sfx('rim'); }
        else if (inB) { if (!sh.felt) { sh.felt = true; this.g.onBasketIn?.(p); } }
        else this.g.sfx(sh.felt || inB ? 'land' : 'flop', { speed: dv });
      }
      sh.slow = sp < 0.3 ? sh.slow + dt : 0;
      if (inB && (sh.slow > 0.12 || rec.frozen)) {
        this.shots.delete(id); this.busy--;
        const res = this.S.shotResult(id, true);
        this.g.onShot?.(id, true, res, p, sh.felt);
        this.basketed(id);
        continue;
      }
      if (!inB && (rec.frozen || (sh.slow > 0.35 && p.y < 0.15) || sh.t > 5)) {
        this.shots.delete(id); this.busy--;
        this.S.shotResult(id, false);
        this.g.onShot?.(id, false, null, p);
        this.watchItem(id);
      }
    }
    // things that land in the bin or basket on their own (flicked socks, rolling balls)
    // (a snapshot: a landing can spill the basket, which watches the spilled balls again)
    for (const [id, w] of [...this.watch]) {
      if (this.watch.get(id) !== w) continue;
      const rec = this.P.get(id);
      const e = this.T.ents.get(id);
      if (!rec || !e) { this.watch.delete(id); continue; }
      w.t += dt;
      const t = w.t;
      const p = rec.rb.translation();
      const v = rec.rb.linvel();
      const slow = Math.hypot(v.x, v.y, v.z) < 0.25;
      if (!this.P.inBasket(p, 0)) w.left = true;
      if (e.kind === 'sock' && e.state === 'table') {
        const s = this.S.sock(id);
        if (!s || s.state !== 'table' || e.inBin) { this.watch.delete(id); continue; }
        if (this.P.inBin(p, 0.02) && slow) {
          this.watch.delete(id);
          const r = this.S.bin(id);
          if (r.ok) { this._tuckIntoBin(e, e.drawn || this.P.pose(id)); this.g.sfx('bin'); this.g.onBinned?.(e, r); }
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
        if (b && b.state === 'table' && w.left && this.S.phase === 'play' && this.P.inBasket(p, 0.02) && slow) {
          // a stray that rolled or was dropped in counts as made
          this.watch.delete(id);
          b.state = 'flying';
          const res = this.S.shotResult(id, true);
          this.g.onShot?.(id, true, res, p);
          this.basketed(id);
          continue;
        }
        if (this.P.inBin(p, 0.02) && slow) { this.watch.delete(id); this._popOut(e); continue; }
      }
      if (rec.frozen || t > 6) this.watch.delete(id);
    }
  }

  // ---------- a basket that never fills up ----------
  // A real basket holds about twenty balls and a Mountain Load has fifty pairs. Only the newest three basketed balls
  // stay physical; older ones become a packed pile drawn inside the basket, so a later shot can always land.
  basketed(id) {
    if (!this.inBasket) this.inBasket = [];
    if (this.inBasket.includes(id)) return;
    this.inBasket.push(id);
    // the basket floor holds about four balls in one layer: with more kept physical, a lob lands on a heap at rim
    // height and bounces out (measured: 17 of 50 tap lobs missed in a Mountain Load with six kept)
    const live = this.inBasket.filter((b) => this.P.has(b));
    if (live.length <= KEEP_PHYSICAL) return;
    const old = live[0];
    const e = this.T.ents.get(old);
    if (!e) return;
    this.P.remove(old);
    this.packCount = (this.packCount || 0) + 1;
    e.vis = this.packedPose(this.packCount - 1);
    e.packed = true;
    if (e.drawn && !this.g.settings.reduceMotion) this.T.fly(e, { ...e.drawn, scale: 1 }, () => e.vis || e.drawn, 0.25, null, { arc: 0.02 });
    else e.state = 'table';
  }

  packedPose(i) {
    // rings of three, rising to just under the rim, then sitting on top of the pile
    const layer = Math.min(3, Math.floor(i / 3)), k = i % 3;
    const a = k * 2.094 + layer * 0.9 + (i > 11 ? i * 0.7 : 0);
    const r = this.P.basketRadius * 0.42;
    return { x: BASKET.x + Math.cos(a) * r, y: 0.05 + layer * 0.045, z: BASKET.z + Math.sin(a) * r, qx: 0, qy: Math.sin(a / 2), qz: 0, qw: Math.cos(a / 2), scale: 1 };
  }

  // A tipped basket (Basket Balance) spills the packed balls too: they become physical again.
  unpackAll() {
    for (const e of this.T.ents.values()) {
      if (!e.packed) continue;
      const v = e.vis;
      this.P.addBall(e.id, { pos: { x: v.x, y: v.y + 0.02, z: v.z } });
      this.T.cancelFlight(e);
      e.state = 'table';
      e.packed = false;
      e.vis = null;
      this.T.snapshotOne(e.id);
    }
    this.packCount = 0;
    this.inBasket = [];
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
    if (!h) { this.R.setHandGlow(null); return; }
    const e = this.T.ents.get(h.id);
    if (!e) { this.hand = null; this.R.setHandGlow(null); return; }
    if (h.mode === 'drag') {
      this.R.setHandGlow(null);
      // Second look (DESIGN 9.4): with the peg, moving the held sock sideways turns it far enough to show the heel
      const lim = this.g.comfort('secondLook') ? 0.95 : 0.15;
      h.tilt = h.tilt * 0.85 + clamp((h.ptr.vx || 0) / 900, -lim, lim) * 0.15;
      if (e.state === 'held') {
        const to = this._dragPose(e, h);
        const L = e.lift;
        // the cloth gives before it rises (DESIGN-T2 7.5), and it takes a touch longer than it used to
        if (L && L.t < 1 && !this.g.settings.reduceMotion) { L.t = Math.min(1, L.t + dt / 0.2); e.viewPose = blendPose(L.from, to, clothLift(L.t)); } else e.viewPose = to;
      }
    } else if (e.state === 'pocket') {
      h.tilt = Math.sin(this.T.time * 1.3) * 0.08;
      e.viewPose = this.T.heldPose(e, this.pocketPoint().x, this.pocketPoint().y, { lift: 0, center: true, tilt: h.tilt });
      this.R.setHandGlow(e.viewPose, h.kind === 'ball' ? 0.22 : 0.38);
    } else this.R.setHandGlow(null);
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
      this.g.sfx('basket', { soft: true, mat: this.g.basketMat });
      this.basketed(id);
    }, { arc: 0.3 });
  }
}

function blendPose(a, b, k) {
  const q = quatSlerp({ x: a.qx, y: a.qy, z: a.qz, w: a.qw }, { x: b.qx, y: b.qy, z: b.qz, w: b.qw }, k);
  return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, z: a.z + (b.z - a.z) * k, qx: q.x, qy: q.y, qz: q.z, qw: q.w, scale: (a.scale || 1) + ((b.scale || 1) - (a.scale || 1)) * k };
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

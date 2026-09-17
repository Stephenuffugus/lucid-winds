// One-thumb gestures (DESIGN 3.1). Pointer events only, so mouse, pen and touch all work.
//
//   down(p)            a primary pointer went down; return true if something was picked
//   dragStart(p)       it moved past the slop
//   drag(p)            every move while dragging
//   release(p, vel)    lifted after a drag; vel = px/s from the last 3 samples
//   tap(p)             a quick press without movement
//   doubleTap(p)       a second tap close in time and place
//   secondTap(p)       another finger tapped while the primary is held (hold + tap)
//   shake(path, dir)   two fingers swiped together
//   cancel()           the gesture was abandoned

const SLOP = 9;          // px before a press becomes a drag
const TAP_MS = 320;
const DOUBLE_MS = 330;
const DOUBLE_PX = 34;

export class Input {
  constructor(el, h) {
    this.el = el;
    this.h = h;
    this.pointers = new Map();
    this.primary = null;
    this.lastTap = null;
    this.enabled = true;
    this.samples = 3;
    const opt = { passive: false };
    el.addEventListener('pointerdown', (e) => this._down(e), opt);
    el.addEventListener('pointermove', (e) => this._move(e), opt);
    el.addEventListener('pointerup', (e) => this._up(e), opt);
    el.addEventListener('pointercancel', (e) => this._cancel(e), opt);
    el.addEventListener('lostpointercapture', (e) => { if (this.pointers.has(e.pointerId)) this._cancel(e); });
    el.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  _pt(e) {
    const r = this.el.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top, t: e.timeStamp || performance.now(), id: e.pointerId, type: e.pointerType };
  }

  _down(e) {
    if (!this.enabled) return;
    e.preventDefault();
    try { this.el.setPointerCapture(e.pointerId); } catch (err) { /* synthetic events */ }
    const p = this._pt(e);
    const rec = { ...p, x0: p.x, y0: p.y, t0: p.t, moved: false, hist: [p], picked: false };
    this.pointers.set(e.pointerId, rec);
    if (!this.primary) {
      this.primary = rec;
      rec.picked = !!this.h.down?.(p);
    } else {
      rec.secondary = true;
      // hold + tap: a thumb resting on a sock has not moved yet, so lift the sock now, before the second tap lands
      const pr = this.primary;
      if (pr.picked && !pr.started && !pr.moved) { pr.started = true; this.h.dragStart?.(pr); }
      // two fingers down: remember the pair for a shake
      this.pair = { a: pr, b: rec, path: [] };
    }
  }

  _move(e) {
    const rec = this.pointers.get(e.pointerId);
    if (!rec) return;
    e.preventDefault();
    const evs = typeof e.getCoalescedEvents === 'function' ? e.getCoalescedEvents() : [];
    const list = evs && evs.length ? evs : [e];
    for (const ev of list) {
      const p = this._pt(ev);
      rec.x = p.x; rec.y = p.y; rec.t = p.t;
      rec.hist.push(p);
      if (rec.hist.length > 12) rec.hist.shift();
    }
    if (!rec.moved && Math.hypot(rec.x - rec.x0, rec.y - rec.y0) > SLOP) {
      rec.moved = true;
      if (rec === this.primary && !rec.started && !(this.pair && this.pair.b.moved)) { rec.started = true; this.h.dragStart?.(rec); }
    }
    if (this.pair && (rec === this.pair.a || rec === this.pair.b)) {
      const a = this.pair.a, b = this.pair.b;
      // one finger holding a sock while the other only taps: the held sock still follows the thumb
      if (!(a.moved && b.moved)) { if (rec === this.primary && rec.moved && rec.started) this.h.drag?.(rec); return; }
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      this.pair.path.push(mid);
      if (this.pair.path.length > 3 && !this.pair.fired) {
        const p0 = this.pair.path[0];
        const dx = mid.x - p0.x, dy = mid.y - p0.y;
        if (Math.hypot(dx, dy) > 28) {
          this.pair.fired = true;
          this.h.shake?.(this.pair.path.slice(), { x: dx, y: dy });
        }
      } else if (this.pair.fired && this.pair.path.length % 3 === 0) {
        this.h.shake?.(this.pair.path.slice(-4), { x: mid.x - this.pair.path[this.pair.path.length - 4].x, y: mid.y - this.pair.path[this.pair.path.length - 4].y });
      }
      return;
    }
    if (rec === this.primary && rec.moved) this.h.drag?.(rec);
  }

  _up(e) {
    const rec = this.pointers.get(e.pointerId);
    if (!rec) return;
    e.preventDefault();
    const p = this._pt(e);
    rec.x = p.x; rec.y = p.y; rec.t = p.t;
    this.pointers.delete(e.pointerId);
    // a press that started a drag (hold + tap) always ends as a release, however short it was
    const still = !rec.moved && !rec.started;
    const quick = p.t - rec.t0 < TAP_MS && still;
    if (rec.secondary) {
      if (quick && !(this.pair && this.pair.fired)) this.h.secondTap?.(p);
      if (this.pair && (this.pair.b === rec)) {
        if (this.pair.fired && this.primary) { this.primary.shook = true; }
        this.pair = null;
      }
      return;
    }
    if (rec !== this.primary) return;
    this.primary = null;
    const shook = rec.shook || (this.pair && this.pair.fired);
    this.pair = null;
    if (shook) { this.h.cancel?.(rec); return; }
    if (quick) {
      const lt = this.lastTap;
      if (lt && p.t - lt.t < DOUBLE_MS && Math.hypot(p.x - lt.x, p.y - lt.y) < DOUBLE_PX) {
        this.lastTap = null;
        this.h.doubleTap?.(p, rec);
      } else {
        this.lastTap = p;
        this.h.tap?.(p, rec);
      }
      return;
    }
    // a still press that lifted nothing is a tap however long the thumb rested (it used to do nothing past 320 ms);
    // a slow press never opens a double tap
    if (still) { this.lastTap = null; this.h.tap?.(p, rec); return; }
    if (!rec.moved) { this.h.release?.(rec, { x: 0, y: 0 }, true); return; }
    this.h.release?.(rec, null, false);
  }

  _cancel(e) {
    const rec = this.pointers.get(e.pointerId);
    if (!rec) return;
    this.pointers.delete(e.pointerId);
    // a lost second finger ends the pair, so the thumb goes back to dragging instead of shaking
    if (this.pair && (this.pair.a === rec || this.pair.b === rec)) this.pair = null;
    if (rec === this.primary) {
      this.primary = null;
      this.pair = null;
      this.h.cancel?.(rec);
    }
  }

  // Flick velocity from the last N samples (DESIGN 3.1: the last 3), in px/s.
  velocity(rec, map) {
    const hs = rec.hist;
    const n = Math.min(hs.length, Math.max(2, this.samples));
    const a = hs[hs.length - n], b = hs[hs.length - 1];
    const dt = Math.max(8, b.t - a.t) / 1000;
    // a finger that stopped before lifting throws nothing
    if (rec.t - b.t > 90) return { x: 0, y: 0, z: 0 };
    if (map) {
      // world velocity on the table plane under each sample (a screen angle is not a yaw)
      const A = map(a), B = map(b);
      if (A && B) return { x: (B.x - A.x) / dt, y: 0, z: (B.z - A.z) / dt, px: Math.hypot(b.x - a.x, b.y - a.y) / dt };
    }
    return { x: (b.x - a.x) / dt, y: (b.y - a.y) / dt, px: Math.hypot(b.x - a.x, b.y - a.y) / dt };
  }
}

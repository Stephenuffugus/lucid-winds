// Pointer input on the field (design 14 §3), plus the global "no long-press menus, no selection" rules.
// One finger's touch is recognised as one gesture and handed to `g` (ui/gesture.js, which knows the tool):
//   down      the finger lands (paint and erase act at once)
//   tap       it lifts within ui.tapSlop CSS px of where it landed, before a long press; `doubleTap` if a second tap
//             comes within ui.doubleTapMs near the first
//   drag      it moved past tapSlop: dragStart, then drag(from, to, cssDx, cssDy) per move, then dragEnd
//   longPress it stayed still for ui.longPressMs; if `g.longPress` takes it (the Hand lifted a creature), every move
//             after is a `carry` and lifting the finger is a `release`; if not, lifting it is a (slow) tap
// A second finger turns the touch into a camera gesture (the pair's midpoint pans, their spread zooms, snapping to
// the camera's levels) and ends the one-finger gesture (`cancel`), except a carry, which is released where that
// finger lifts. The mouse wheel zooms at the cursor.
export function attachInput(cv, g, getCam, onCamera, U) {
  document.addEventListener('contextmenu', (e) => e.preventDefault());
  document.addEventListener('selectstart', (e) => e.preventDefault());
  document.addEventListener('dragstart', (e) => e.preventDefault());
  const pts = new Map(); // pointerId -> [cssX, cssY]
  let one = null, pinch = null, lastTap = null;
  const css = (ev) => { const r = cv.getBoundingClientRect(); return [ev.clientX - r.left, ev.clientY - r.top]; };
  const world = (p) => getCam().toWorld(p[0], p[1]);
  const mid = () => { const [a, b] = [...pts.values()]; return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, Math.hypot(a[0] - b[0], a[1] - b[1]) || 1]; };
  const stop = () => { if (one && one.timer) { clearTimeout(one.timer); one.timer = 0; } };

  // getCam() is null until the world exists (the first frame); input before then does nothing.
  cv.addEventListener('pointerdown', (ev) => {
    const cam = getCam();
    if (!cam || (ev.pointerType === 'mouse' && ev.button !== 0)) return;
    cv.setPointerCapture(ev.pointerId);
    const p = css(ev);
    pts.set(ev.pointerId, p);
    if (pts.size === 1) {
      one = { id: ev.pointerId, p0: p, p, state: 'press', timer: 0 };
      g.down(...world(p));
      one.timer = setTimeout(() => {
        if (!one || one.state !== 'press') return;
        one.timer = 0;
        one.state = g.longPress(...world(one.p)) ? 'carry' : 'still';
      }, U.longPressMs);
    } else if (pts.size === 2) {
      stop();
      if (one && one.state !== 'carry') { if (one.state === 'drag') g.dragEnd(); g.cancel(); one.state = 'gone'; }
      const [mx, my, d] = mid();
      pinch = { mx, my, d, zoom: cam.zoom };
    }
  });
  cv.addEventListener('pointermove', (ev) => {
    const cam = getCam();
    if (!cam || !pts.has(ev.pointerId)) return;
    const p = css(ev);
    pts.set(ev.pointerId, p);
    if (pts.size === 2 && pinch) {
      const [mx, my, d] = mid();
      cam.panBy(mx - pinch.mx, my - pinch.my);
      const z = cam.nearest(pinch.zoom * (d / pinch.d));
      if (z !== cam.zoom) cam.zoomAt(z, mx, my);
      pinch.mx = mx; pinch.my = my;
      onCamera();
      return;
    }
    if (!one || ev.pointerId !== one.id || pts.size !== 1) return;
    const prev = one.p;
    one.p = p;
    if (one.state === 'carry') { g.carry(...world(p)); return; }
    if ((one.state === 'press' || one.state === 'still') && Math.hypot(p[0] - one.p0[0], p[1] - one.p0[1]) > U.tapSlop) {
      stop();
      one.state = 'drag';
      g.dragStart(...world(one.p0));
      g.drag(world(one.p0), world(p), p[0] - one.p0[0], p[1] - one.p0[1]);
      return;
    }
    if (one.state === 'drag') g.drag(world(prev), world(p), p[0] - prev[0], p[1] - prev[1]);
  });
  const up = (ev) => {
    if (!pts.has(ev.pointerId)) return;
    pts.delete(ev.pointerId);
    if (pts.size < 2) pinch = null;
    if (!one || ev.pointerId !== one.id) return;
    stop();
    const s = one.state, p = one.p;
    one = null;
    if (ev.type === 'pointercancel' && s !== 'carry') { if (s === 'drag') g.dragEnd(); g.cancel(); return; }
    if (s === 'carry') g.release(...world(p));
    else if (s === 'drag') g.dragEnd();
    else if (s === 'press' || s === 'still') { // a long press nobody took is a slow tap
      const t = ev.timeStamp;
      if (lastTap && t - lastTap.t < U.doubleTapMs && Math.hypot(p[0] - lastTap.p[0], p[1] - lastTap.p[1]) < U.tapSlop * 3) { lastTap = null; g.doubleTap(...world(p)); }
      else { lastTap = { t, p }; g.tap(...world(p), p[0], p[1]); }
    }
  };
  cv.addEventListener('pointerup', up);
  cv.addEventListener('pointercancel', up);
  cv.addEventListener('wheel', (ev) => {
    const cam = getCam();
    if (!cam) return;
    ev.preventDefault();
    cam.step(ev.deltaY < 0 ? 1 : -1, ...css(ev));
    onCamera();
  }, { passive: false });
}

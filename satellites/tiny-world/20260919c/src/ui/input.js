// Pointer input on the canvas, plus the global "no long-press menus, no selection" rules.
// One finger (or the mouse) uses the selected tool at the world point under it; a second finger turns the
// touch into a camera gesture: the pair's midpoint pans, their spread zooms (snapping to the camera's
// whole-number levels). The mouse wheel zooms at the cursor. Full gestures and pan lock are M3-5.
export function attachInput(cv, actor, getCam, onCamera) {
  document.addEventListener('contextmenu', (e) => e.preventDefault());
  document.addEventListener('selectstart', (e) => e.preventDefault());
  document.addEventListener('dragstart', (e) => e.preventDefault());
  const pts = new Map(); // pointerId -> [cssX, cssY]
  let tool = false, pinch = null;
  const css = (ev) => { const r = cv.getBoundingClientRect(); return [ev.clientX - r.left, ev.clientY - r.top]; };
  const mid = () => { const [a, b] = [...pts.values()]; return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, Math.hypot(a[0] - b[0], a[1] - b[1]) || 1]; };
  // getCam() is null until the world exists (the first frame); input before then does nothing.
  cv.addEventListener('pointerdown', (ev) => {
    const cam = getCam();
    if (!cam) return;
    cv.setPointerCapture(ev.pointerId);
    pts.set(ev.pointerId, css(ev));
    if (pts.size === 1) { tool = true; actor.down(...cam.toWorld(...css(ev))); }
    else if (pts.size === 2) { tool = false; const [mx, my, d] = mid(); pinch = { mx, my, d, zoom: cam.zoom }; }
  });
  cv.addEventListener('pointermove', (ev) => {
    const cam = getCam();
    if (!cam || !pts.has(ev.pointerId)) return;
    pts.set(ev.pointerId, css(ev));
    if (pts.size === 1 && tool) actor.move(...cam.toWorld(...css(ev)));
    else if (pts.size === 2 && pinch) {
      const [mx, my, d] = mid();
      cam.panBy(mx - pinch.mx, my - pinch.my);
      const z = cam.nearest(pinch.zoom * (d / pinch.d));
      if (z !== cam.zoom) cam.zoomAt(z, mx, my);
      pinch.mx = mx; pinch.my = my;
      onCamera();
    }
  });
  for (const n of ['pointerup', 'pointercancel']) cv.addEventListener(n, (ev) => {
    pts.delete(ev.pointerId);
    if (pts.size < 2) pinch = null;
    if (pts.size === 0) tool = false;
  });
  cv.addEventListener('wheel', (ev) => {
    const cam = getCam();
    if (!cam) return;
    ev.preventDefault();
    cam.step(ev.deltaY < 0 ? 1 : -1, ...css(ev));
    onCamera();
  }, { passive: false });
}

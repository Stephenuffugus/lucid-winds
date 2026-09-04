/**
 * Orbit and pinch, and nothing else. This module owns gestures that move the
 * CAMERA; `input/knuckle.js` owns the gesture that moves a MARBLE, and the two
 * never share a pointer: a brace claims its pointer with setPointerCapture and
 * this one ignores any pointer the brace has claimed.
 *
 * ⛔ A long press for SELECTION fires pointercancel, not a release. The canvas
 * carries `user-select: none` and `touch-action: none` for that reason; without
 * them the gesture is stolen by the browser halfway through.
 */

/**
 * @param {HTMLCanvasElement} canvas
 * @param {object} rig an OrbitRig from render/scene.js
 * @param {{isClaimed?:(id:number)=>boolean, onTap?:(x:number,y:number)=>void}} [hooks]
 */
export function attachCameraControls(canvas, rig, hooks) {
  const h = hooks || {};
  const pointers = new Map();
  let lastPinch = 0;
  let moved = 0;
  let downAt = 0;

  const claimed = (id) => !!(h.isClaimed && h.isClaimed(id));

  function onDown(e) {
    if (claimed(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, ox: e.clientX, oy: e.clientY });
    if (pointers.size === 1) { moved = 0; downAt = performance.now(); }
    if (pointers.size === 2) lastPinch = pinchSpan();
  }

  function pinchSpan() {
    const a = [...pointers.values()];
    const dx = a[0].x - a[1].x, dy = a[0].y - a[1].y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function onMove(e) {
    const p = pointers.get(e.pointerId);
    if (!p) return;
    const dx = e.clientX - p.x;
    p.x = e.clientX; p.y = e.clientY;
    moved += Math.abs(dx) + Math.abs(e.clientY - p.oy);
    /* Written to BOTH the want values and the user offsets. In a match frameShot
       rebuilds the want values every frame from its auto-frame plus these offsets,
       so writing the offsets is what makes the gesture survive; in freeCam nothing
       rebuilds them and the direct write is what moves the camera. */
    if (pointers.size === 1) {
      rig.state.wantAzimuth -= dx * 0.007;
      rig.state.userAz = (rig.state.userAz || 0) - dx * 0.007;
    } else if (pointers.size === 2) {
      const span = pinchSpan();
      if (lastPinch > 0) {
        const k = lastPinch / Math.max(1, span);
        rig.state.wantDistance = Math.max(rig.state.minDistance,
          Math.min(rig.state.maxDistance, rig.state.wantDistance * k));
        rig.state.userZoom = Math.max(0.15, Math.min(4, (rig.state.userZoom || 1) * k));
      }
      lastPinch = span;
    }
  }

  function onUp(e) {
    const p = pointers.get(e.pointerId);
    pointers.delete(e.pointerId);
    if (pointers.size < 2) lastPinch = 0;
    if (!p) return;
    const dist = Math.abs(e.clientX - p.ox) + Math.abs(e.clientY - p.oy);
    const held = performance.now() - downAt;
    if (dist < 10 && held < 400 && h.onTap) h.onTap(e.clientX, e.clientY);
  }

  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  // a cancel is a real ending, not a lost event: clean up exactly as on up
  canvas.addEventListener('pointercancel', (e) => { pointers.delete(e.pointerId); lastPinch = 0; });

  function onWheel(e) {
    e.preventDefault();
    const k = 1 + e.deltaY * 0.0012;
    rig.state.wantDistance = Math.max(rig.state.minDistance,
      Math.min(rig.state.maxDistance, rig.state.wantDistance * k));
    rig.state.userZoom = Math.max(0.15, Math.min(4, (rig.state.userZoom || 1) * k));
  }
  canvas.addEventListener('wheel', onWheel, { passive: false });

  return {
    detach() {
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('wheel', onWheel);
      pointers.clear();
    },
    activePointers: () => pointers.size
  };
}

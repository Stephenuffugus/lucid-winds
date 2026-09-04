/**
 * The pull back fallback (DESIGN 7.8).
 *
 * Classic drag aim with a power meter, for anyone who cannot or would rather not
 * flick: drag back from the shooter, let go, and it goes the other way. It
 * produces the SAME AimSource as the Knuckle, so nothing downstream knows or
 * cares which one made the shot, and `wildness01` is always zero because a drag
 * has no path to be wild along.
 *
 * The match records `assist: 'pullback'` so Phase 4 matchmaking can keep like
 * with like. Nothing in the copy ever shames it, and nothing in the game is
 * closed off by it.
 */
import { clamp, len2, atan2, DEG } from '../core/dmath.js?v=20260904b';
import { makeAim } from '../core/snap.js?v=20260904b';

/** How far back you have to drag for a full power shot, in CSS pixels. */
const FULL_DRAG_PX = 190;

/**
 * @param {HTMLCanvasElement} canvas
 * @param {object} tuning
 * @param {{taw:()=>object|null, aimAzimuth:()=>number, onAim?:Function,
 *   onDrag?:Function, onCancel?:Function, enabled?:()=>boolean}} hooks
 */
export function createPullback(canvas, tuning, hooks) {
  const T = tuning.snap;
  const S = { active: false, id: -1, sx: 0, sy: 0, x: 0, y: 0, offsetId: -1, offX: 0, offY: 0 };
  const on = () => !hooks.enabled || hooks.enabled();

  function down(e) {
    if (!on()) return;
    const taw = hooks.taw();
    if (!taw) return;
    const r = canvas.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    if (S.active) {
      // a second finger sets the spin, which is the drag's stand in for contact
      S.offsetId = e.pointerId;
      S.offX = clamp((x - taw.x) / taw.r, -1, 1);
      S.offY = clamp(-(y - taw.y) / taw.r, -1, 1);
      return;
    }
    if (len2(x - taw.x, y - taw.y) > (taw.grabR || taw.r * 1.6) * 1.15) return;
    S.active = true; S.id = e.pointerId;
    S.sx = x; S.sy = y; S.x = x; S.y = y;
    S.offX = 0; S.offY = 0; S.offsetId = -1;
    try { canvas.setPointerCapture(e.pointerId); } catch (err) { }
    e.preventDefault();
    if (hooks.onDrag) hooks.onDrag(readout());
  }

  function move(e) {
    if (!S.active) return;
    const r = canvas.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    if (e.pointerId === S.offsetId) {
      const taw = hooks.taw();
      if (taw) { S.offX = clamp((x - taw.x) / taw.r, -1, 1); S.offY = clamp(-(y - taw.y) / taw.r, -1, 1); }
      return;
    }
    if (e.pointerId !== S.id) return;
    S.x = x; S.y = y;
    if (hooks.onDrag) hooks.onDrag(readout());
  }

  function readout() {
    const dx = S.x - S.sx, dy = S.y - S.sy;
    const pull = len2(dx, dy);
    return {
      power01: clamp(pull / FULL_DRAG_PX, 0, 1),
      // you drag BACKWARD, so the shot goes the other way
      deg: pull > 6 ? atan2(-dx, dy) / DEG : null,
      offset: { x: S.offX, y: S.offY },
      pullPx: pull
    };
  }

  function up(e) {
    if (!S.active || e.pointerId !== S.id) {
      if (e.pointerId === S.offsetId) S.offsetId = -1;
      return;
    }
    const out = readout();
    S.active = false; S.id = -1; S.offsetId = -1;
    try { canvas.releasePointerCapture(e.pointerId); } catch (err) { }
    if (out.pullPx < 12 || out.deg === null) {
      if (hooks.onCancel) hooks.onCancel('tooShort');
      return null;
    }
    const base = hooks.aimAzimuth ? hooks.aimAzimuth() : 0;
    // a screen angle is not a yaw: the camera looks down at the dirt, so the
    // drag's angle is mapped onto the ground the same way the Knuckle's is
    const k = hooks.groundFactor ? clamp(hooks.groundFactor(), 0.05, 1) : 1;
    const screen = clamp(out.deg * DEG, -80 * DEG, 80 * DEG);
    const fine = clamp(Math.atan(Math.tan(screen) * k), -T.fineAngleMaxDeg * DEG, T.fineAngleMaxDeg * DEG);
    const aim = makeAim({
      dir: { x: Math.sin(base + fine), y: 0, z: Math.cos(base + fine) },
      power01: out.power01,
      contactOffset: out.offset,
      wildness01: 0,
      braced01: 1,
      assist: 'pullback'
    });
    aim.thumbSpeed = null;
    aim.slipped = false;
    if (hooks.onAim) hooks.onAim(aim);
    return aim;
  }

  const d = (e) => down(e), m = (e) => move(e), u = (e) => up(e);
  const c = (e) => { if (S.active && e.pointerId === S.id) { S.active = false; if (hooks.onCancel) hooks.onCancel('cancel'); } };

  return {
    attach() {
      canvas.addEventListener('pointerdown', d, { passive: false });
      canvas.addEventListener('pointermove', m, { passive: false });
      canvas.addEventListener('pointerup', u);
      canvas.addEventListener('pointercancel', c);
    },
    detach() {
      canvas.removeEventListener('pointerdown', d);
      canvas.removeEventListener('pointermove', m);
      canvas.removeEventListener('pointerup', u);
      canvas.removeEventListener('pointercancel', c);
      S.active = false;
    },
    owns(pointerId) { return S.active && (pointerId === S.id || pointerId === S.offsetId); },
    state: () => ({ dragging: S.active, readout: S.active ? readout() : null }),
    /** For the gate: run the whole drag without a pointer. */
    _feed(from, to, taw, offset) {
      S.active = true; S.id = -1; S.sx = from.x; S.sy = from.y; S.x = to.x; S.y = to.y;
      S.offX = offset ? offset.x : 0; S.offY = offset ? offset.y : 0;
      return up({ pointerId: -1 });
    }
  };
}

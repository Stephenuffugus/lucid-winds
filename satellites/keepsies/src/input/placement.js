/**
 * The place drag (m3 step 1): the finger that slides the shooter along the chalk at the start of a turn.
 *
 * ⛔ ONE OWNER PER FINGER. Until m3 this lived in main.js and was registered AFTER the camera, so one drag both
 * orbited the camera and moved the shooter, and it placed the shooter from the camera's own moving azimuth plus
 * half a turn: the shooter went to the far side of the ring, the camera chased it, and a slow 60 px drag made the
 * aim jump 37 times by more than 10 degrees (42.4 at worst) with the shooter off the screen for 25 frames. That is
 * the "freaks out and skips around" of his 5 Nov verdict (docs/m3/INPUT.md). Now:
 *   - this registers before the camera, and the camera drops any pointer it has claimed (cameraCtl.js);
 *   - the drag is RELATIVE: the ring angle at the down plus the finger's x travel times a gain, so the shooter
 *     slides along the NEAR edge the finger's way and a still finger moves nothing. The gain is measured at the
 *     down from the frozen camera so the shooter keeps pace with the finger on the glass (1 px for 1 px), capped
 *     at `gainRadPerPx` (0.006 rad per px, the plan's figure): at that cap a ten foot shooter ran 3.6 px for
 *     every px of thumb and left the screen inside a 60 px drag, so the cap is only reached where the ring is
 *     seen edge on. Lift and drag again to go further; after the lift the camera eases behind it;
 *   - it never reads the camera's azimuth, and while the drag is live `live()` is true and main.js holds the
 *     camera still; after the lift the frame eases back behind the shooter.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {object} G the game state of main.js (R, rig, moving, statuesPlacing, knuckle, placeDrag)
 * @param {{canAim:()=>boolean, gainRadPerPx?:number}} hooks
 */
import { len2, sin, cos } from '../core/dmath.js?v=20261107a';

export function attachPlacement(canvas, G, hooks) {
  const h = hooks || {};
  const gain = h.gainRadPerPx == null ? 0.006 : h.gainRadPerPx;
  let x0 = 0, a0 = 0, k = gain;

  /** radians of ring angle per px of finger, signed so the shooter goes the finger's way on the screen */
  function gainAt(a) {
    const R = G.R.ringRadius, d = 0.02;
    if (!R || !G.rig || !G.rig.project) return gain;
    const p = G.rig.project(sin(a + d) * R, 0, cos(a + d) * R);
    const q = G.rig.project(sin(a - d) * R, 0, cos(a - d) * R);
    const pxPerRad = (p.x - q.x) / (2 * d);
    if (!(Math.abs(pxPerRad) > 1 / gain)) return pxPerRad < 0 ? -gain : gain;
    return 1 / pxPerRad;
  }

  canvas.addEventListener('pointerdown', (e) => {
    if (G.placeDrag !== null && G.placeDrag !== undefined) return;   // one finger places
    if (G.moving || G.statuesPlacing) return;
    if (!G.R || !h.canAim() || G.R.state.phase !== 'place') return;
    if (G.knuckle && G.knuckle.owns(e.pointerId)) return;              // the brace took it first
    if (G.knuckle && G.knuckle.state && G.knuckle.state().bracing) return;
    const t = G.R.tawOnScreen(G.rig);
    const r = canvas.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    if (t && len2(x - t.x, y - t.y) <= t.grabR) return;   // that is a brace, not a placement
    G.placeDrag = e.pointerId;
    x0 = e.clientX;
    a0 = G.R.state.placeAngle;
    k = gainAt(a0);
  }, { passive: false });

  canvas.addEventListener('pointermove', (e) => {
    if (G.placeDrag !== e.pointerId) return;
    if (!G.R || G.R.state.phase !== 'place') { G.placeDrag = null; return; }
    G.R.setPlaceAngle(a0 + (e.clientX - x0) * k);
  });

  const drop = (e) => { if (G.placeDrag === e.pointerId) G.placeDrag = null; };
  canvas.addEventListener('pointerup', drop);
  canvas.addEventListener('pointercancel', drop);

  return {
    /** true while a finger is placing: the camera holds its facing */
    live: () => G.placeDrag !== null && G.placeDrag !== undefined
  };
}

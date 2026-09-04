/**
 * core/framing.js — where the camera stands for a Ringer shot, as pure maths.
 *
 * Pulled out of game/ringer.js so the framing can be gated without a physics world.
 * `frameShot` in ringer.js feeds this real positions and applies the answer to the rig.
 *
 * Two things this fixes, both found on the Director's phone on 2026-09-04 ("the end game
 * is almost impossible, there needs to be a zoom aim something"):
 *
 *  1. THE LEAN. The sports framing stood a fixed 1.9 m back from the gap between the
 *     shooter and the cross, which is right for thirteen mibs and wrong for one: with a
 *     single mib left 1 m away the camera sat 2.9 m off and a 16 mm mib was seven pixels
 *     tall on a 375 px screen. DECISIONS.md:229 had already named the answer and parked it,
 *     "a camera that leans toward the cross while you are aiming is the real answer and it
 *     is not built." It is built here: targetBias slides from its full-cross value toward
 *     an endgame value as the live count falls below `leanFull`, and the distance slides
 *     from the sports framing to the CLOSEST camera that still holds the frame together.
 *
 *     ⛔ The first version of the lean guessed that closest camera (a fixed `spanAddEnd`
 *     of 0.75 m behind a look point 70% of the way to the mib) and a headless probe of the
 *     real engine showed the shooter projecting at y = 866 on a 667 px screen with one mib
 *     left: OFF THE BOTTOM, and the brace is a touch on the shooter. So the end frame is now
 *     derived, not guessed. For a camera at elevation e looking at a point on the ground,
 *     a ground point a metres along the view axis from that point (positive = beyond it)
 *     lands at  y / halfHeight = a sin e / ((a cos e + d) tanV)  where d is the camera
 *     distance and tanV = tan(fov / 2). Holding the shooter (a = -bias*span) at the bottom
 *     edge and the far side of the target cluster (a = (1-bias)*span + spread) at the top,
 *     inside `fitEdgeBottom` and `fitEdgeTop` of the half height (the HUD owns both ends of
 *     the screen), gives two floors on d, and the closest camera is where they balance:
 *     bias = k2 / (k1 + k2) with k1 = cos e + sin e/(fitEdgeBottom tanV) and k2 = sin e/
 *     (fitEdgeTop tanV) - cos e, which is 0.30 at 30 degrees, a 28 degree lens and edges of
 *     0.66 and 0.80. That is `targetBiasEnd`. From the ring edge a lone mib 1.5 m away then
 *     sits 2.7 m from the camera instead of 4.1 m (1.5x the pixels) WITH the shooter clear of
 *     the buttons, and that is the physical limit of one portrait frame at this lens: a 16 mm mib
 *     at 1.5 m subtends 0.6 degrees whatever the camera does. The rest of the reach for the
 *     last marbles is the spyglass, not the camera.
 *
 *     Both floors and the spread floor (two survivors on opposite sides must both stay on a
 *     portrait screen) are HARD at every lean, so the shooter cannot leave the frame again.
 *
 *  2. THE PLAYER'S OWN ZOOM AND ORBIT SURVIVE. DESIGN 8.5 lists pinch zoom and one-finger
 *     orbit, DESIGN 7.7 makes orbit THE coarse aim ("aiming direction = camera-forward ±
 *     the snap's fine angle"), and input/cameraCtl.js implemented both. Then frameShot
 *     overwrote wantAzimuth and wantDistance every frame, so both were inert in a match: the
 *     player could only fine-tune ±25° off a centroid they could not turn away from. The
 *     player's orbit and pinch are now OFFSETS (rig.state.userAz, rig.state.userZoom) laid
 *     on top of the auto-frame, and the turn-change cut resets them.
 *
 * ⛔ Nothing here touches the accuracy cone. DESIGN 9.6: never rubber-band aim. A closer
 * camera lets you SEE the marble and turn to face it; it does not make the thumb steadier.
 */
import { sin, cos, atan2, len2, clamp, DEG } from './dmath.js?v=20260904d';

/**
 * @param {object} inp
 * @param {number} inp.tawX  shooter's taw, world x
 * @param {number} inp.tawZ
 * @param {{x:number,z:number}[]} inp.live   every mib still in play
 * @param {number} [inp.aspect]  viewport w/h; portrait phone ≈ 0.56
 * @param {boolean} [inp.bare]   calibration: one marble, close
 * @param {{az?:number, zoom?:number}} [inp.user]  the player's orbit (rad) and pinch (×)
 * @param {object} C   tuning.render.ringerCam
 * @param {object} [calib]   tuning.render.calibCam, for bare
 */
export function frameFor(inp, C, calib) {
  const { tawX, tawZ } = inp;
  const live = inp.live || [];
  let cx = 0, cz = 0;
  for (const p of live) { cx += p.x; cz += p.z; }
  if (live.length) { cx /= live.length; cz /= live.length; }
  let dx = cx - tawX, dz = cz - tawZ;
  if (len2(dx, dz) < 1e-3) { dx = -tawX; dz = -tawZ; }      // nothing to shoot at: look inward
  if (len2(dx, dz) < 1e-3) { dx = 0; dz = 1; }
  const span = Math.max(0.9, len2(dx, dz));

  if (inp.bare && calib) {
    // one marble, close, the way you look at a marble you are about to snap
    return { tx: tawX, tz: tawZ, azimuth: atan2(-tawX, -tawZ), distance: calib.distance,
      elevation: calib.elevationDeg, auto: { t: 1, spread: 0, floor: 0 } };
  }

  // t = 1 is the full sports framing (leanFull or more live), t = 0 is the full
  // endgame lean, reached at exactly ONE mib left, which is the shot the Director
  // called almost impossible.
  const leanFull = Math.max(2, C.leanFull == null ? 5 : C.leanFull);
  const t = clamp((live.length - 1) / (leanFull - 1), 0, 1);
  const biasEnd = C.targetBiasEnd == null ? C.targetBias : C.targetBiasEnd;
  const bias = biasEnd + (C.targetBias - biasEnd) * t;
  // the pinch looks AT the target: zooming in slides the look point onto the mibs, so a
  // player who leans in sees the lay and not the dirt under their own shooter
  const uz = inp.user && inp.user.zoom ? inp.user.zoom : 1;
  // ⛔ the look point must REACH the target by half zoom: at 0.24x after a 48 degree orbit
  // the first slide (linear, reaching it only at zero) left the mib 0.24 m beside the look
  // point, which at 1.15 m depth is off the right edge of a portrait frame (k2-endgame-pinch
  // showed dirt and nothing else). And the floors below belong to the AUTO frame: a player
  // who pinches in has chosen to give up the shooter for a look at the lay, so the pinch
  // multiplies the auto distance and the shooter floor does not refuse it (the second pass
  // took the floors at the slid look point and a 0.24x pinch stopped at 1.39 m).
  const biasUser = bias + (1 - bias) * clamp((1 - uz) / 0.5, 0, 1);
  const sports = span * C.spanFactor + C.spanAdd;

  // The spread floor. Two survivors on opposite sides of the ring must both stay on a
  // portrait screen, so the camera may not come closer than the cluster's radius needs at
  // this lens. Horizontal half-angle from the vertical fov and the aspect.
  // ⛔ measured ACROSS the view axis and ALONG it, not as a radius: a mib knocked to the far
  // ring edge on the axis needs vertical room and no horizontal room at all, and a radius
  // charged it for both (an eleven mib frame went from 3.42 m to 4.13 m after one scatter)
  const ndx = dx / Math.max(1e-6, len2(dx, dz)), ndz = dz / Math.max(1e-6, len2(dx, dz));
  let spread = 0, spreadLat = 0, spreadAlong = 0;
  for (const p of live) {
    const rx = p.x - cx, rz = p.z - cz;
    spread = Math.max(spread, len2(rx, rz));
    spreadLat = Math.max(spreadLat, Math.abs(rx * ndz - rz * ndx));
    spreadAlong = Math.max(spreadAlong, rx * ndx + rz * ndz);
  }
  // ⛔ core/ may not call Math transcendentals: the azimuth this returns feeds the
  // shot, the shot feeds the deterministic physics, and replay verification wants
  // identical hashes on every platform. tan(hHalf) = tan(fov/2) * aspect exactly, and
  // tan is sin over cos from dmath, so no Math.atan or Math.tan is needed here.
  const aspect = Math.max(0.3, inp.aspect || 0.56);
  const halfV = (C.fov * DEG) / 2;
  const tanH = (sin(halfV) / cos(halfV)) * aspect;
  const margin = C.spreadMargin == null ? 1.15 : C.spreadMargin;
  // ⛔ the horizontal floor belongs to the LEAN only. The ring is 3 m across and a portrait 28
  // degree lens cannot hold it: the approved sports frame lets side mibs leave the screen and
  // the player orbits or goes top down. Below leanFull a survivor off the side would be the
  // whole game, so from there the frame widens to keep every one of them.
  const floor = spreadLat > 0 && t < 1 ? (spreadLat / tanH) * margin : 0;

  // The vertical fit: the shooter at the bottom edge, the far side of the cluster at the top.
  const tanV = sin(halfV) / cos(halfV);
  const e = C.elevationDeg * DEG, se = sin(e), ce = cos(e);
  // ⛔ two edges, not one: the HUD owns the bottom of the screen (the house rules chip and
  // the TOP DOWN and PAUSE buttons, the bottom 17 percent at 375 by 667) and the names and
  // pocket dots own the top 8. A shooter put at 0.85 of the half height sat between the two
  // buttons with the chip over its grab radius (k2-endgame-one, first pass of the fit).
  const edgeT = C.fitEdgeTop == null ? 0.84 : C.fitEdgeTop;
  // ⛔ the lean may never put the shooter LOWER than the approved sports frame does, and it
  // may never move the approved frame either: the bottom edge is fitEdgeBottom or the sports
  // frame's own shooter height, whichever is lower on the screen. At a full cross the floor
  // then reproduces the sports framing exactly (a fixed 0.56 edge pushed a full cross from
  // 3.80 m to 4.22 m in the gate), and in the lean the shooter stays above the house rules
  // chip on a 568 px screen, where the chip tops out at 83% of the height.
  const tanV0 = sin(halfV) / cos(halfV);
  const e0 = C.elevationDeg * DEG;
  const sT = C.targetBias * span;
  const ySports = (sT * sin(e0)) / Math.max(1e-6, (sports - sT * cos(e0)) * tanV0);
  const edgeB = Math.max(C.fitEdgeBottom == null ? 0.56 : C.fitEdgeBottom, ySports);
  const tawFloor = (bias * span) * (ce + se / (edgeB * tanV));
  const mibFloor = ((1 - bias) * span + spreadAlong) * (se / (edgeT * tanV) - ce);
  const fit = Math.max(tawFloor, mibFloor, floor);
  // t = 1 stands where the contact sheet put it, t = 0 stands as close as the fit allows,
  // and the fit is a floor at every t
  let distance = Math.max(sports * t + fit * (1 - t), fit);

  const autoAz = atan2(-dx, -dz);
  const autoDist = clamp(distance, C.minDistance, C.maxDistance);
  const ua = inp.user && inp.user.az ? inp.user.az : 0;
  return {
    tx: tawX + dx * biasUser, tz: tawZ + dz * biasUser,
    azimuth: autoAz + ua,
    distance: clamp(autoDist * uz, C.minDistance, C.maxDistance),
    elevation: C.elevationDeg,
    auto: { azimuth: autoAz, distance: autoDist, t, spread, spreadLat, spreadAlong, floor, span, bias: biasUser, autoBias: bias, tawFloor, mibFloor, fit }
  };
}

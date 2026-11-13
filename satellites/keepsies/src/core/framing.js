/**
 * core/framing.js — where the camera stands for a Ringer shot, as pure maths.
 *
 * Pulled out of game/ringer.js so the framing can be gated without a physics world.
 * `frameShot` in ringer.js feeds this real positions and applies the answer to the rig.
 *
 * m3 step 8 replaced the sports framing and the lean (below, the history) with the aim frame, the watch frame and LOOK.
 *
 * Two things the old version fixed, both found on the Director's phone on 2026-09-04 ("the end game
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
import { sin, cos, atan, atan2, len2, clamp, DEG, PI } from './dmath.js?v=20261113a';

/**
 * @param {object} inp
 * @param {number} inp.tawX  shooter's taw, world x
 * @param {number} inp.tawZ
 * @param {{x:number,z:number}[]} inp.live   every mib still in play
 * @param {number} [inp.aspect]  viewport w/h; portrait phone ≈ 0.56
 * @param {boolean} [inp.bare]   calibration: one marble, close
 * @param {{az?:number, zoom?:number}} [inp.user]  the player's orbit (rad) and pinch (×)
 * @param {number} [inp.currentAz]  the rig's azimuth now: the answer is the nearest equivalent of the wanted angle (m3 step 2)
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

  if (inp.bare && calib) {
    // one marble, close, the way you look at a marble you are about to snap
    return { tx: tawX, tz: tawZ, azimuth: atan2(-tawX, -tawZ), distance: calib.distance,
      elevation: calib.elevationDeg, fov: C.fov, auto: { t: 1, spread: 0, floor: 0 } };
  }

  /* m3 step 8, THE AIM FRAME (his 5 Nov verdict: "The view is terrible"; docs/m3/VIEW.md Framing 3). Close and low behind the shooter, by a table keyed by the ring: the shooter
     stands where its 154 px circle clears the bottom chips, the far side of the live mibs under the names. For a camera at elevation e looking at a point on the ground, a ground point
     a metres along the view axis lands at y / halfHeight = a sin e / ((a cos e + d) tanV); holding the shooter at the bottom edge and the far side at the top gives two floors on d, and
     the closest camera is where they balance. The sports framing and the lean are retired (docs/DECISIONS.md): at ten foot today's camera drew the shooter 14.6 px and a mib 7.2. */
  const leanFull = Math.max(2, C.leanFull == null ? 5 : C.leanFull);
  const t = clamp((live.length - 1) / (leanFull - 1), 0, 1);
  const uz = inp.user && inp.user.zoom ? inp.user.zoom : 1;
  const L = len2(dx, dz), ndx = dx / Math.max(1e-6, L), ndz = dz / Math.max(1e-6, L);
  let spread = 0, spreadLat = 0, spreadAlong = 0;
  for (const p of live) {
    const rx = p.x - cx, rz = p.z - cz;
    spread = Math.max(spread, len2(rx, rz));
    spreadLat = Math.max(spreadLat, Math.abs(rx * ndz - rz * ndx));
    spreadAlong = Math.max(spreadAlong, rx * ndx + rz * ndz);
  }
  const A = aimRow(C, inp.ringR == null ? L : inp.ringR);
  const e = A.elevationDeg * DEG, se = sin(e), ce = cos(e), halfV = (A.fov * DEG) / 2, tanV = sin(halfV) / cos(halfV);
  const aspect = Math.max(0.3, inp.aspect || 0.56), tanH = tanV * aspect;
  const S = Math.max(C.aimMinSpan, L + spreadAlong), edgeB = edgeOf(inp.vh, C.fitBottomPx + (inp.grabPx || 77) + 4);
  let edgeT = edgeOf(inp.vh, C.fitTopPx);
  let fit = fitSpan(S, se, ce, tanV, edgeB, edgeT), fov = A.fov;
  /* m3 step 11: the names stand either side of a gap on the centre line. A far mib in the gap may stand level with them (the opening's far arm); one off the line would stand behind a chip, so the top edge falls to their foot */
  const yClear = edgeOf(inp.vh, C.fitTopClearPx), gap = C.fitGapPx / ((inp.vh || 915) / 2);
  for (const p of live) {
    const rx = p.x - tawX, rz = p.z - tawZ, a = rx * ndx + rz * ndz, l = rx * ndz - rz * ndx, dep = (a - fit.b) * ce + fit.d;
    if (dep > 0 && ((a - fit.b) * se) / (dep * tanV) > yClear && Math.abs(l) / (dep * tanV) > gap) { edgeT = yClear; fit = fitSpan(S, se, ce, tanV, edgeB, edgeT); break; }
  }
  /* below a full board a survivor off the side would be the whole game, so the frame widens to keep every one of them: first the lens, to 44 degrees, then the distance */
  const margin = C.spreadMargin == null ? 1.15 : C.spreadMargin;
  let floor = spreadLat > 0 && t < 1 ? (spreadLat / tanH) * margin : 0;
  if (floor > fit.d) {
    const tanWide = clamp((spreadLat * margin) / (fit.d * aspect), tanV, C.aimWideTan);
    fit = fitSpan(S, se, ce, tanWide, edgeB, edgeT);
    floor = (spreadLat * margin) / (tanWide * aspect);
    if (floor > fit.d) { const tw2 = clamp((spreadLat * margin) / (fit.d * aspect), tanV, C.aimWideTan); fit = fitSpan(S, se, ce, tw2, edgeB, edgeT); floor = (spreadLat * margin) / (tw2 * aspect); fov = (2 * atan(tw2)) / DEG; } else fov = (2 * atan(tanWide)) / DEG;
  }
  // the pinch looks AT the target: zooming in slides the look point onto the mibs, by half zoom it has reached them
  const look = fit.b + Math.max(0, L - fit.b) * clamp((1 - uz) / 0.5, 0, 1);
  const autoAz = atan2(-dx, -dz);
  const autoDist = clamp(Math.max(fit.d, floor), C.minDistance, C.maxDistance);
  const ua = inp.user && inp.user.az ? inp.user.az : 0;
  /* ⛔ m3 step 2. THE SEAM: atan2 wraps at plus or minus 180 degrees and the rig eases toward whatever it is handed, so a
     shooter walking across the ring's far side sent the camera 64 degrees in a frame the long way round. The wanted angle
     is the nearest equivalent of where the camera is. THE PIVOT: the orbit turned about a point 0.76 m in front of the
     shooter, so the shooter slid 3.3 to 3.6 px per px of thumb and left the screen after 70 px. The look point now turns
     with the orbit about the SHOOTER: the shooter stays where it is and the aim is straight up the screen from it. */
  const ta = autoAz + ua;
  let wantAz = ta;
  if (inp.currentAz != null) {
    const TWO = 2 * PI;
    while (wantAz - inp.currentAz > PI) wantAz -= TWO;
    while (wantAz - inp.currentAz < -PI) wantAz += TWO;
  }
  return {
    tx: tawX - look * sin(ta), tz: tawZ - look * cos(ta),
    azimuth: wantAz,
    distance: clamp(autoDist * uz, C.minDistance, C.maxDistance),
    elevation: A.elevationDeg, fov,
    auto: { azimuth: autoAz, distance: autoDist, t, spread, spreadLat, spreadAlong, floor, span: L, bias: look / Math.max(1e-6, L), lookDist: look, fit: fit.d }
  };
}

/** the ring's row of the aim table: its nearest by radius */
function aimRow(C, R) {
  let best = C.aimClose[0];
  for (const r of C.aimClose) if (Math.abs(r.ringR - R) < Math.abs(best.ringR - R)) best = r;
  return best;
}
/** a screen height in CSS px from an edge as a fraction of the half height */
function edgeOf(vh, px) { const H = vh || 915; return (H / 2 - px) / (H / 2); }
/** the closest camera holding the near point at the bottom edge and a point S beyond it at the top: b is how far past the near point it looks, d how far it stands */
function fitSpan(S, se, ce, tanV, edgeB, edgeT) {
  const k1 = ce + se / (edgeB * tanV), k2 = se / (edgeT * tanV) - ce, b = (S * k2) / (k1 + k2);
  return { b, d: b * k1 };
}

/**
 * The watch frame (m3 step 8): on the flick the camera holds its facing and eases up and back to show the struck mibs and their side of the chalk. Same azimuth: the camera never follows the shot.
 * @param {{tawX:number,tawZ:number,az:number,range:number,ringR:number,vh?:number,aspect?:number}} inp  az is the aim's own bearing
 */
export function watchFor(inp, C) {
  const W = C.watch, A = aimRow(C, inp.ringR), e = W.elevationDeg * DEG, se = sin(e), ce = cos(e), halfV = (A.fov * DEG) / 2, tanV = sin(halfV) / cos(halfV);
  const S = clamp(inp.range + W.pastTarget, W.minSpan, 2 * inp.ringR + 0.1);
  const fit = fitSpan(S, se, ce, tanV, W.edgeBottom, edgeOf(inp.vh, C.fitTopClearPx));
  const aspect = Math.max(0.3, inp.aspect || 0.56), wide = (inp.ringR * W.chalkFrac) / (tanV * aspect);
  return { tx: inp.tawX + sin(inp.az) * fit.b, tz: inp.tawZ + cos(inp.az) * fit.b, distance: clamp(Math.max(fit.d, wide), C.minDistance, C.maxDistance), elevation: W.elevationDeg, fov: A.fov };
}

/**
 * LOOK (m3 step 8, today's TOP DOWN refit; the statues' placement and move view too): straight down, the chalk plus 5 cm fitted to the width minus 16 px, between topPx and the height minus botPx.
 * @param {{ringR:number,vw:number,vh:number,topPx:number,botPx:number,az:number}} inp
 */
export function lookFit(inp, C) {
  const A = aimRow(C, inp.ringR), halfV = (A.fov * DEG) / 2, tanV = sin(halfV) / cos(halfV), Rm = inp.ringR + 0.05;
  const byWidth = (Rm * inp.vh) / (tanV * (inp.vw - 16)), byHeight = (2 * Rm * inp.vh) / (2 * tanV * (inp.vh - inp.topPx - inp.botPx));
  const d = Math.max(byWidth, byHeight), ppm = inp.vh / (2 * d * tanV), off = (inp.topPx - inp.botPx) / 2 / ppm;
  /* the ring's middle stands off the screen's by off (positive: below it), so the look point stands that far ahead of the ring's middle, away from the camera */
  return { tx: -sin(inp.az) * off, tz: -cos(inp.az) * off, distance: d, elevation: C.lookElevationDeg, fov: A.fov };
}

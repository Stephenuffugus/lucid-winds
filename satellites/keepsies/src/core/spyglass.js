/**
 * core/spyglass.js — the zoom aim, as pure maths.
 *
 * Stephen, from his phone (2026-09-04): "there needs to be a zoom aim something some way to
 * make it more possible to hit the last couple marbles." The camera cannot do it alone: from
 * the ring edge a 16 mm mib 1.5 m away subtends 0.6 degrees, and the closest stand that keeps
 * the shooter in frame (core/framing.js) still leaves it at nine pixels. And the settled cone
 * is plus or minus 1.5 degrees, 130 mm wide at that range: the question the player is asking
 * of the screen is not "where is the marble" but "is it inside my cone, and how centred".
 *
 * So while the thumb is braced and the target is small on the main screen, the game opens a
 * spyglass: a second, narrow lens render of the same dirt from the main camera's own
 * position, looking straight down the aim line (camera forward through the shooter, DESIGN
 * 7.7) to the range of the mib nearest that line, with the cone's width at that range drawn
 * as a bracket. The main camera does not move and the cone is not touched (DESIGN 9.6).
 * Orbit to walk the bracket onto the marble; hold still to tighten it.
 *
 * This file decides WHERE it looks and WHAT it marks. render/scene.js draws it, main.js
 * wires it, and test/spyglass.mjs gates this maths without a world.
 */
import { sin, cos, clamp, DEG } from './dmath.js?v=20260904d';

/**
 * @param {object} inp
 * @param {number} inp.tawX      the shooter's taw, world x
 * @param {number} inp.tawZ
 * @param {number} inp.azimuth   the aim azimuth, world radians; the aim line runs (sin, cos)
 * @param {{x:number,z:number}[]} inp.live   every mib still in play
 * @param {number} inp.coneDeg   the accuracy cone's HALF angle right now (snap.js returns half)
 * @param {object} C   tuning.render.spyglass
 * @returns {null | {tx:number, tz:number, range:number, lateral:number, coneHalfM:number, mib:object}}
 *   null when nothing lies ahead of the shooter
 */
export function spyglassFor(inp, C) {
  const dx = sin(inp.azimuth), dz = cos(inp.azimuth);
  const minAhead = C.minAhead == null ? 0.05 : C.minAhead;
  let best = null;
  for (const m of inp.live || []) {
    const rx = m.x - inp.tawX, rz = m.z - inp.tawZ;
    const along = rx * dx + rz * dz;
    if (along < minAhead) continue;                    // behind the shooter, or under it
    const lateral = rx * dz - rz * dx;                 // signed distance off the aim line
    // ⛔ the mib nearest the LINE, not the nearest mib: the scope shows what the shot is
    // pointed at, and with the last two on opposite sides of the ring the nearest one is
    // very often the one you are turned away from
    const better = !best || Math.abs(lateral) < Math.abs(best.lateral) - 1e-9 ||
      (Math.abs(Math.abs(lateral) - Math.abs(best.lateral)) <= 1e-9 && along < best.along);
    if (better) best = { mib: m, along, lateral };
  }
  if (!best) return null;
  const cone = clamp(inp.coneDeg == null ? 1.5 : inp.coneDeg, 0.05, 45) * DEG;
  return {
    tx: inp.tawX + dx * best.along, tz: inp.tawZ + dz * best.along,
    range: best.along, lateral: best.lateral,
    coneHalfM: best.along * (sin(cone) / cos(cone)),
    mib: best.mib
  };
}

/** Scope pixels per metre at `camDist` from the spyglass camera, for a square scope. */
export function scopePxPerM(camDist, C) {
  const half = ((C.fovDeg == null ? 5 : C.fovDeg) * DEG) / 2;
  const visible = 2 * camDist * (sin(half) / cos(half));
  return (C.sizePx == null ? 180 : C.sizePx) / Math.max(1e-6, visible);
}

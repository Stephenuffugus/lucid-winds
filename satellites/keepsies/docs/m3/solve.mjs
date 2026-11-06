// The best a camera can do: for a ring of radius R, the shooter at the edge and the whole cross
// in the HUD-free band, which camera (elevation, lens) makes the centre mib biggest?
import { makeCam, place, proj, spherePx, cross, T, DEG } from './viewnum.mjs';
const CIRCLE_R = 77;           // Stephen's "three times bigger" hold circle: 51 px across today, ~154 px wanted
const TOP = 59, BOT = 94;      // the names and pocket dots; the corner buttons and the house rules chip (CSS)
export function fit(W, H, R, el, fov, opts = {}) {
  const yb = H - BOT - CIRCLE_R - 6, yt = TOP + 22;
  const tanV = Math.tan(fov * DEG / 2), se = Math.sin(el * DEG), ce = Math.cos(el * DEG);
  const y1 = -(yb - H / 2) / (H / 2), y2 = (H / 2 - yt) / (H / 2);
  const s = opts.farReach == null ? 0.233 : opts.farReach;   // the far arm of the cross plus a mib radius
  const L = R;
  const k1 = ce + se / (Math.abs(y1) * tanV), k2 = se / (y2 * tanV) - ce;
  if (k2 <= 0) return null;
  const b = (L + s) * k2 / (L * (k1 + k2)), d = b * L * k1;
  return { b, d, yb, yt };
}
export function measure(W, H, R, el, fov, f) {
  const cam = makeCam(W, H, fov);
  const tx = 0, tz = R - f.b * R;
  place(cam, tx, 0.012, tz, 0, el, f.d);
  const taw = spherePx(cam, W, H, { x: 0, y: 0.011, z: R }, 0.011);
  const tp = proj(cam, W, H, 0, 0.011, R);
  const c = spherePx(cam, W, H, { x: 0, y: 0.008, z: 0 }, 0.008);
  const cp = proj(cam, W, H, 0, 0.008, 0);
  const far = proj(cam, W, H, 0, 0.008, -0.225), side = proj(cam, W, H, 0.225, 0.008, 0);
  const ringFar = proj(cam, W, H, 0, 0, -R);
  const ringL = proj(cam, W, H, -R, 0, 0), ringRt = proj(cam, W, H, R, 0, 0);
  const dep = Math.atan2(cam.position.y, Math.hypot(cam.position.x, cam.position.z)) / DEG;
  return { taw: taw.w, tawY: tp.y, mib: c.w, mibY: cp.y, farY: far.y, sideX: side.x, ringFarY: ringFar.y,
    ringW: ringRt.x - ringL.x, dep, camH: cam.position.y, camToMib: c.dist, camToTaw: taw.dist };
}
const isMain = process.argv[1] && process.argv[1].endsWith('solve.mjs');
if (isMain) {
  for (const [W, H] of [[412, 915], [360, 780]]) {
    console.log(`\n${W}x${H}: shooter held at y=${H - BOT - CIRCLE_R - 6} (room for a 154 px circle above the chip), far arm of the cross at y=${TOP + 22}`);
    for (const [name, R] of [['13 ft', 1.9812], ['10 ft', 1.525], ['7 ft', 1.0668], ['5 ft', 0.762], ['4 ft', 0.6096], ['3 ft', 0.4572]]) {
      let best = null;
      for (let el = 12; el <= 70; el += 2) for (let fov = 18; fov <= 60; fov += 2) {
        const f = fit(W, H, R, el, fov); if (!f) continue;
        const m = measure(W, H, R, el, fov, f);
        if (m.dep < 0) continue;
        // the lay must be readable: the depression angle at the cross at least 18 degrees, the side arms on screen
        const cdep = Math.atan2(m.camH, m.camToMib * 0 + Math.hypot(0, (R - f.b * R) + Math.cos(el * DEG) * f.d)) / DEG;
        if (cdep < 18) continue;
        if (m.sideX > W - 8) continue;
        if (!best || m.mib > best.m.mib) best = { el, fov, f, m, cdep };
      }
      // and today's camera for the same ring, for comparison: el 30, fov 28 at the sports distance
      const b = best;
      console.log(`  ${name.padEnd(5)} best: el ${b.el}°, lens ${b.fov}°, ${b.f.d.toFixed(2)} m from the look point (bias ${b.f.b.toFixed(2)}), camera ${b.m.camH.toFixed(2)} m up; centre mib ${b.m.mib.toFixed(1)} px, shooter ${b.m.taw.toFixed(1)} px; ring ${b.m.ringW.toFixed(0)} px wide, far chalk at y=${b.m.ringFarY.toFixed(0)}; looks down on the cross at ${b.cdep.toFixed(0)}°`);
    }
  }
}

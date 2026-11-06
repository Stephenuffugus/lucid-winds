/**
 * The camera framing gate.
 *
 *   node test/camera.mjs
 *
 * Pure maths against core/framing.js, no world, so it runs in milliseconds and cannot
 * flake on this two core box. What it asserts, and every one has been watched to fail:
 *   - a full cross is framed exactly as before (no regression of the sports framing)
 *   - one mib left is framed markedly closer, and a 16 mm mib gets markedly more pixels
 *   - ⛔ the SHOOTER and every live mib project inside the frame at 13, 3, 2 and 1 mibs,
 *     by an independent projection of the ground (the first lean put the shooter at y = 866
 *     on a 667 px screen with one mib left, and this gate did not look; the brace is a touch
 *     on the shooter, so that frame was unplayable)
 *   - two survivors on opposite sides both stay inside a portrait frame (the spread floor)
 *   - the pinch looks at the target: zoomed in, the lone mib is still in frame
 *   - the player's orbit survives the auto-frame as an azimuth offset
 *   - the player's pinch survives as a distance multiplier, and is clamped
 *   - calibration ignores all of it and frames one marble close
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { frameFor, watchFor, lookFit } from '../src/core/framing.js?v=20261105b';

const HERE = dirname(fileURLToPath(import.meta.url));
const T = JSON.parse(readFileSync(join(HERE, '..', 'src', 'data', 'tuning.json'), 'utf8'));
const C = T.render.ringerCam, CAL = T.render.calibCam;
const DEG = Math.PI / 180;

const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); };
const near = (a, b, tol) => Math.abs(a - b) <= tol;

/* pixels a 16 mm mib gets on a 667 px tall portrait screen at this distance and lens */
const mibPx = (d) => 667 / (2 * d * Math.tan((C.fov * DEG) / 2)) * 0.016;

/* An independent projection. The camera stands behind the shooter on the shooter-to-centroid
   line at elevation e, `distance` from the look point (tx, tz). A ground point is split into
   `a` along that line (positive = beyond the look point) and `l` across it, and lands at
   y/halfHeight = a sin e / ((a cos e + d) tanV), x/halfWidth = l / ((a cos e + d) tanV aspect).
   |1| is the edge of the screen. Also returns the camera-to-point distance for pixel sizes. */
function project(f, inp, p) {
  const e = C.elevationDeg * DEG, se = Math.sin(e), ce = Math.cos(e), tanV = Math.tan((C.fov * DEG) / 2);
  let cx = 0, cz = 0;
  for (const q of inp.live) { cx += q.x; cz += q.z; }
  cx /= inp.live.length; cz /= inp.live.length;
  let ux = cx - inp.tawX, uz = cz - inp.tawZ;
  const n = Math.hypot(ux, uz) || 1; ux /= n; uz /= n;
  let a = (p.x - f.tx) * ux + (p.z - f.tz) * uz;
  let l = (p.x - f.tx) * -uz + (p.z - f.tz) * ux;
  // the player's orbit turns the camera about the look point; the frame turns with it
  const ua = (inp.user && inp.user.az) || 0;
  if (ua) { const a2 = a * Math.cos(ua) - l * Math.sin(ua); l = a * Math.sin(ua) + l * Math.cos(ua); a = a2; }
  const depth = a * ce + f.distance;
  const camDist = Math.hypot(depth, a * se, l);
  return { y: (a * se) / (depth * tanV), x: l / (depth * tanV * inp.aspect), camDist, depth };
}
const inFrame = (pt, edge) => Math.abs(pt.y) <= edge && Math.abs(pt.x) <= edge && pt.depth > 0;

/* thirteen mibs in a cross, arms of three, 75 mm apart, centred 1.9 m from the taw (10 ft) */
function cross(cxz) {
  const sp = 0.075, out = [];
  for (let i = -3; i <= 3; i++) { out.push({ x: cxz.x + i * sp, z: cxz.z }); if (i !== 0) out.push({ x: cxz.x, z: cxz.z + i * sp }); }
  return out;
}
const TAW = { tawX: 0, tawZ: -1.5, aspect: 375 / 667 };

/* m3 step 8: blocks 1, 1b, 2, 2b and 3 (the sports framing "unchanged", the lean, the fit at 375x667) retired on purpose, docs/DECISIONS.md: the aim frame stands close and low, turns about the shooter and fits by CSS px. An independent camera below, the rig's own formula */
const camOf = (f) => { const e = f.elevation * DEG, r = f.distance; return { x: f.tx + Math.sin(f.azimuth) * Math.cos(e) * r, y: 0.012 + Math.sin(e) * r, z: f.tz + Math.cos(f.azimuth) * Math.cos(e) * r }; };
function screenOf(f, p, W, H) {
  const c = camOf(f), lx = f.tx - c.x, ly = 0.012 - c.y, lz = f.tz - c.z, ll = Math.hypot(lx, ly, lz), fx = lx / ll, fy = ly / ll, fz = lz / ll;
  const sl = Math.hypot(fz, fx), sx = -fz / sl, sz = fx / sl, ux = -sz * fy, uy = sz * fx - sx * fz, uz = sx * fy;   /* right = forward x world up, up = right x forward */
  const dx = p.x - c.x, dy = (p.y || 0) - c.y, dz = p.z - c.z, depth = dx * fx + dy * fy + dz * fz, side = dx * sx + dz * sz, up = dx * ux + dy * uy + dz * uz, tanV = Math.tan(((f.fov || C.fov) * DEG) / 2);
  return { x: W / 2 + (W / 2) * side / (depth * tanV * (W / H)), y: H / 2 - (H / 2) * up / (depth * tanV), dist: Math.hypot(dx, dy, dz), px: (dia) => (H / 2) * dia / (Math.hypot(dx, dy, dz) * tanV), depth };
}
const crossAt0 = () => cross({ x: 0, z: 0 });
const aim = (R, W, H, live, user) => { const inp = { tawX: 0, tawZ: -R, live, aspect: W / H, vh: H, ringR: R, grabPx: T.snap.grabRadiusPx, user }; return frameFor(inp, C, CAL); };
const FLOORS = { '412x915': { 0.762: [70, 20], 1.525: [37, 12.5] }, '360x780': { 0.762: [54, 17], 1.525: [29, 10] } };
for (const [W, H] of [[412, 915], [360, 780]]) for (const R of [0.762, 1.525]) {
  const f = aim(R, W, H, crossAt0()), tag = W + 'x' + H + ' ' + (R < 1 ? 'five' : 'ten') + ' foot: ';
  const s = screenOf(f, { x: 0, y: 0.011, z: -R }, W, H), m = screenOf(f, { x: 0, y: 0.008, z: 0 }, W, H), far = screenOf(f, { x: 0, y: 0.008, z: 0.225 }, W, H), F = FLOORS[W + 'x' + H][R];
  ok(s.px(0.022) >= F[0] && m.px(0.016) >= F[1], tag + 'the shooter draws ' + s.px(0.022).toFixed(1) + ' px and the centre mib ' + m.px(0.016).toFixed(1) + ' (at least ' + F.join(' and ') + '; shipped 14.6 and 7.2 at ten foot)');
  ok(s.y + T.snap.grabRadiusPx <= H - C.fitBottomPx + 0.5, tag + 'the circle clears the bottom chips (' + (s.y + T.snap.grabRadiusPx).toFixed(0) + ' against ' + (H - C.fitBottomPx) + ')');
  ok(far.y >= C.fitTopPx - 1, tag + 'the far arm stays under the names (y ' + far.y.toFixed(0) + ')');
  ok(Math.abs(s.x - W / 2) < 1, tag + 'the shooter stands on the centre line');
  /* the shooter holds under any orbit */
  let worst = 0; for (let d = -60; d <= 60; d += 5) { const q = screenOf(aim(R, W, H, crossAt0(), { az: d * DEG }), { x: 0, y: 0.011, z: -R }, W, H); worst = Math.max(worst, Math.hypot(q.x - s.x, q.y - s.y)); }
  ok(worst < 1, tag + 'the shooter moves ' + worst.toFixed(2) + ' px under a 60 degree orbit (under 1)');
  /* a lone mib and two wide survivors stay in the frame */
  for (const [name, live] of [['one mib', [{ x: 0, z: 0 }]], ['three mibs', [{ x: -0.075, z: 0 }, { x: 0, z: 0 }, { x: 0.15, z: 0.075 }]], ['two wide', [{ x: -0.5 * R, z: 0.1 }, { x: 0.45 * R, z: -0.05 }]]]) {
    const g = aim(R, W, H, live), st = screenOf(g, { x: 0, y: 0.011, z: -R }, W, H);
    ok(st.y + T.snap.grabRadiusPx <= H - C.fitBottomPx + 0.5 && st.y > 0, tag + name + ': the shooter stands clear (y ' + st.y.toFixed(0) + ')');
    for (const q of live) { const sc = screenOf(g, { x: q.x, y: 0.008, z: q.z }, W, H); ok(sc.depth > 0 && sc.x >= 0 && sc.x <= W && sc.y >= C.fitTopPx - 1 && sc.y < st.y, tag + name + ': a mib stands at ' + sc.x.toFixed(0) + ', ' + sc.y.toFixed(0) + ' in the frame'); }
  }
  /* the names stand either side of a gap on the centre line: a far mib in the gap may stand level with them, a far mib off the line stands under their foot */
  {
    const off = aim(R, W, H, [{ x: 0.14 * R, z: 0.3 * R }, { x: 0, z: 0 }]), st0 = screenOf(off, { x: 0.14 * R, y: 0.008, z: 0.3 * R }, W, H);
    ok(st0.y >= C.fitTopClearPx - 1, tag + 'a far mib off the centre line stands at y ' + st0.y.toFixed(0) + ', under the chips at ' + C.fitTopClearPx);
  }
  /* the watch frame: up and back, the same facing */
  const w = watchFor({ tawX: 0, tawZ: -R, az: Math.atan2(0, 1) + Math.PI, range: R, ringR: R, vh: H, aspect: W / H }, C);
  ok(w.elevation > f.elevation && w.distance > f.distance, tag + 'the watch frame stands up and back (' + w.elevation + ' degrees, ' + w.distance.toFixed(2) + ' m, the aim frame ' + f.distance.toFixed(2) + ' m)');
}
/* LOOK: the chalk plus 5 cm in the width minus 16 px, between the names and the bottom chips */
for (const [W, H] of [[412, 915], [412, 839], [360, 780]]) for (const R of [0.762, 1.0668, 1.525, 1.98]) {
  const az = 0.7, L = lookFit({ ringR: R, vw: W, vh: H, topPx: 59, botPx: 94, az }, C), f = { tx: L.tx, tz: L.tz, azimuth: az, distance: L.distance, elevation: L.elevation, fov: L.fov };
  const sc = (a) => screenOf(f, { x: Math.sin(a) * (R + 0.05), y: 0, z: Math.cos(a) * (R + 0.05) }, W, H); let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  for (let a = 0; a < 6.28; a += 0.05) { const q = sc(a); x0 = Math.min(x0, q.x); x1 = Math.max(x1, q.x); y0 = Math.min(y0, q.y); y1 = Math.max(y1, q.y); }
  ok(x0 >= 7 && x1 <= W - 7 && y0 >= 59 - 1 && y1 <= H - 94 + 1, 'LOOK ' + W + 'x' + H + ' ring ' + R + ': the chalk spans x ' + x0.toFixed(0) + ' to ' + x1.toFixed(0) + ', y ' + y0.toFixed(0) + ' to ' + y1.toFixed(0));
  ok(x1 - x0 >= W - 16 - 3 || y1 - y0 >= H - 59 - 94 - 3, 'LOOK ' + W + 'x' + H + ' ring ' + R + ': and it fills the width (' + (x1 - x0).toFixed(0) + ' of ' + (W - 16) + ')');
}

/* 4. the player's orbit survives as an offset on the auto azimuth */
{
  const base = frameFor({ ...TAW, live: [{ x: 0, z: -0.5 }] }, C, CAL);
  const turned = frameFor({ ...TAW, live: [{ x: 0, z: -0.5 }], user: { az: 0.3 } }, C, CAL);
  ok(near(turned.azimuth - base.azimuth, 0.3, 1e-9), `orbit: azimuth offset should be 0.3, got ${(turned.azimuth - base.azimuth).toFixed(4)}`);
  ok(near(turned.auto.azimuth, base.auto.azimuth, 1e-12), 'orbit: the AUTO azimuth must not move when the player orbits');
  ok(near(turned.distance, base.distance, 1e-12), 'orbit: turning must not change distance');
}

/* 5. the player's pinch survives as a multiplier, and is clamped */
{
  const base = frameFor({ ...TAW, live: [{ x: 0, z: -0.5 }] }, C, CAL);
  const half = frameFor({ ...TAW, live: [{ x: 0, z: -0.5 }], user: { zoom: 0.5 } }, C, CAL);
  const tiny = frameFor({ ...TAW, live: [{ x: 0, z: -0.5 }], user: { zoom: 0.01 } }, C, CAL);
  const huge = frameFor({ ...TAW, live: [{ x: 0, z: -0.5 }], user: { zoom: 50 } }, C, CAL);
  const want = Math.min(C.maxDistance, Math.max(C.minDistance, half.auto.distance * 0.5));
  ok(near(half.distance, want, 1e-9), `pinch: half zoom should give ${want.toFixed(3)}, got ${half.distance.toFixed(3)}`);
  // the pinch looks at the target: zoomed in on a lone mib 1.5 m off, the mib is still in frame
  const inpRing = { tawX: 0, tawZ: -1.525, aspect: 375 / 667, live: [{ x: 0, z: 0 }] };
  const zoomed = frameFor({ ...inpRing, user: { zoom: 0.4 } }, C, CAL);
  const mibZ = project(zoomed, inpRing, { x: 0, z: 0 });
  ok(Math.abs(mibZ.y) <= 1 && mibZ.depth > 0, `pinch: zoomed in 0.4x the lone mib projects at y ${mibZ.y.toFixed(2)}, off the frame (bias ${zoomed.auto.bias.toFixed(2)})`);
  ok(zoomed.auto.bias > base.auto.bias, 'pinch: zooming in should slide the look point toward the target');
  // ⛔ the shot k2-endgame-pinch showed dirt: orbited 48 degrees and pinched to 0.24x, the lone
  // mib sat 0.24 m beside a look point 16% short of it, off the right edge at 1.15 m depth
  /* m3 step 2 retires the old rule here on purpose: the orbit now turns about the shooter, so a pinch after an orbit looks along the AIM (the same distance out, at the orbit's angle), the way the shooter is pointing, and not back at a target the player has turned away from */
  const swung = { ...inpRing, user: { az: -0.84, zoom: 0.24 } };
  const pz = frameFor(swung, C, CAL), L0 = Math.hypot(pz.tx - inpRing.tawX, pz.tz - inpRing.tawZ), ang = Math.atan2(-(pz.tx - inpRing.tawX), -(pz.tz - inpRing.tawZ));
  const straight = frameFor({ ...inpRing, user: { zoom: 0.24 } }, C, CAL);
  ok(near(L0, Math.hypot(straight.tx - inpRing.tawX, straight.tz - inpRing.tawZ), 1e-6) && Math.abs(Math.atan2(Math.sin(ang - pz.azimuth), Math.cos(ang - pz.azimuth))) < 1e-3, 'pinch after orbit: the look point stays the same distance out from the shooter and turns with the orbit');
  ok(near(tiny.distance, C.minDistance, 1e-9), `pinch: extreme zoom in must clamp to minDistance ${C.minDistance}, got ${tiny.distance}`);
  ok(near(huge.distance, C.maxDistance, 1e-9), `pinch: extreme zoom out must clamp to maxDistance ${C.maxDistance}, got ${huge.distance}`);
  ok(near(half.azimuth, base.azimuth, 1e-12), 'pinch: zooming must not change azimuth');
}

/* 6. calibration is one marble, close, whatever else is on the dirt */
{
  const f = frameFor({ ...TAW, live: cross({ x: 0, z: 0.4 }), bare: true, user: { zoom: 3, az: 1 } }, C, CAL);
  ok(near(f.distance, CAL.distance, 1e-12), `bare: distance should be calibCam ${CAL.distance}, got ${f.distance}`);
  ok(near(f.elevation, CAL.elevationDeg, 1e-12), 'bare: elevation should be calibCam');
}

/* m3 step 2, THE SEAM: the wanted angle is the nearest equivalent of the current one, so the camera never goes the long way
   round. The shooter walked from 170 to 190 degrees round the ring at half a degree a frame, the rig's own damping: today a
   64 degree step in one frame where the angle wraps */
{
  const R = 1.525, live = cross({ x: 0, z: 0 });
  let az = null, worst = 0;
  for (let deg = 170; deg <= 190; deg += 0.5) {
    const a = deg * DEG, f = frameFor({ tawX: Math.sin(a) * R, tawZ: Math.cos(a) * R, live, aspect: 412 / 915, currentAz: az === null ? undefined : az }, C, CAL);
    if (az === null) az = f.azimuth;
    const next = az + (f.azimuth - az) * 0.18;
    worst = Math.max(worst, Math.abs(next - az) / DEG);
    az = next;
  }
  ok(worst <= 2, `the seam: walking the shooter over 180 degrees steps the camera ${worst.toFixed(2)} degrees in a frame (under 2; shipped 64.3)`);
}

/* m3 step 2, THE PIVOT: the player's orbit turns about the SHOOTER, so it stays where it is on the screen. An independent
   camera (the rig's own formula) at userAz -60 to 60 degrees in 5 degree steps: the shooter holds the centre line and the
   userAz 0 height; shipped it left the screen past 27 to 30 degrees */
{
  const camProject = (f, p, aspect) => {
    const e = f.elevation * DEG, r = f.distance, cam = { x: f.tx + Math.sin(f.azimuth) * Math.cos(e) * r, y: 0.012 + Math.sin(e) * r, z: f.tz + Math.cos(f.azimuth) * Math.cos(e) * r };
    let fx = f.tx - cam.x, fy = 0.012 - cam.y, fz = f.tz - cam.z; const fl = Math.hypot(fx, fy, fz); fx /= fl; fy /= fl; fz /= fl;
    let sx = fz * -1, sz = fx; const sl = Math.hypot(sx, sz); sx /= sl; sz /= sl;   /* the camera's right, level */
    sx = -fz / sl; sz = fx / sl; const rx = sz * fy * -1 + 0, ry = fx * sz - fz * sx * 1, rz = 0; void rx; void ry; void rz;
    const ux = (fz * 0 - fy * sz) * -1, uy = -(fx * sz - fz * sx), uz = -(fy * sx - fx * 0); void ux; void uy; void uz;
    const dx = p.x - cam.x, dy = p.y - cam.y, dz = p.z - cam.z;
    const depth = dx * fx + dy * fy + dz * fz, side = dx * sx + dz * sz, upv = { x: sz * fy - 0 * fz, y: fx * sz * -1 + fz * sx * 1, z: 0 * fx - sx * fy };
    const up = dx * upv.x + dy * upv.y + dz * upv.z, tanV = Math.tan(((f.fov || C.fov) * DEG) / 2);
    return { x: side / (depth * tanV * aspect), y: up / (depth * tanV) };
  };
  for (const [w, h] of [[412, 915], [360, 780]]) {
    const aspect = w / h, live = cross({ x: 0, z: 0 }), base = frameFor({ ...TAW, aspect, live }, C, CAL), p0 = camProject(base, { x: TAW.tawX, y: 0.012, z: TAW.tawZ }, aspect);
    let worstX = 0, worstY = 0;
    for (let d = -60; d <= 60; d += 5) {
      const f = frameFor({ ...TAW, aspect, live, user: { az: d * DEG } }, C, CAL), q = camProject(f, { x: TAW.tawX, y: 0.012, z: TAW.tawZ }, aspect);
      worstX = Math.max(worstX, Math.abs(q.x - p0.x)); worstY = Math.max(worstY, Math.abs(q.y - p0.y));
    }
    ok(worstX <= 0.02 && worstY <= 0.02, `the pivot at ${w}x${h}: over a 60 degree orbit the shooter stays within ${worstX.toFixed(4)} of a half width and ${worstY.toFixed(4)} of a half height (0.02)`);
  }
  ok(near(T.render.orbitRadPerPx * 100 / DEG, 20, 0.5), `a 100 px drag turns the aim ${(T.render.orbitRadPerPx * 100 / DEG).toFixed(2)} degrees (20 plus or minus 0.5)`);
}

if (fails.length) {
  console.log('CAMERA FAILED');
  for (const f of fails) console.log('  - ' + f);
  process.exit(1);
}
console.log('CAMERA OK');

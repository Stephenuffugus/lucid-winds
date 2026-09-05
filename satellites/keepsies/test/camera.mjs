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
import { frameFor } from '../src/core/framing.js?v=20260905a';

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

/* 1. a full cross: the sports framing is unchanged */
{
  const live = cross({ x: 0, z: 0.4 });
  const f = frameFor({ ...TAW, live }, C, CAL);
  const span = 1.9;
  const expect = Math.min(C.maxDistance, Math.max(C.minDistance, span * C.spanFactor + C.spanAdd));
  ok(near(f.distance, expect, 0.02), `full cross: distance ${f.distance.toFixed(3)} should be the sports framing ${expect.toFixed(3)}`);
  ok(near(f.auto.t, 1, 1e-9), `full cross: lean t should be 1, got ${f.auto.t}`);
  ok(near(f.tx, 0 + 0 * C.targetBias, 1e-9) && near(f.tz, -1.5 + 1.9 * C.targetBias, 1e-6), 'full cross: look point should sit at targetBias along the gap');
}

/* 1b. a full board is not the tidy cross for long: a mib knocked to the far ring edge along the
   axis, and one to the side edge, must NOT move the approved framing. The ring is 3 m across and a
   portrait 28 degree lens cannot hold it; the approved frame lets side mibs leave the screen and
   the player orbits or goes top down, and the first lean pulled an eleven mib frame from 3.42 m to
   4.13 m in the engine because a scatter tripped the spread floor. */
{
  const live = cross({ x: 0, z: 0.4 }).slice(0, 11).concat([{ x: 0, z: 1.85 }, { x: 1.4, z: 0.4 }]);
  const f = frameFor({ ...TAW, live }, C, CAL);
  let cx = 0, cz = 0; for (const p of live) { cx += p.x; cz += p.z; } cx /= live.length; cz /= live.length;
  const span = Math.hypot(cx - TAW.tawX, cz - TAW.tawZ);
  const expect = Math.min(C.maxDistance, Math.max(C.minDistance, span * C.spanFactor + C.spanAdd));
  ok(near(f.distance, expect, 0.02), `scattered full board: distance ${f.distance.toFixed(3)} should still be the sports framing ${expect.toFixed(3)} (a stray at the side edge must not pull the whole frame back)`);
}

/* 2. one mib left: the camera leans in, and the mib gets bigger on screen */
let full, lone;
{
  full = frameFor({ ...TAW, live: cross({ x: 0, z: 0.4 }) }, C, CAL);
  lone = frameFor({ ...TAW, live: [{ x: 0, z: -0.5 }] }, C, CAL);       // 1.0 m away
  const oldStyle = 1.0 * C.spanFactor + C.spanAdd;                       // what it used to do
  ok(lone.distance / oldStyle < 0.7, `one mib: distance ${lone.distance.toFixed(3)} is not markedly closer than the old ${oldStyle.toFixed(3)} (ratio ${(lone.distance / oldStyle).toFixed(2)}, want < 0.7)`);
  // the pixels a mib gets depend on the CAMERA TO MIB distance, not the look point distance
  const inpLone = { ...TAW, live: [{ x: 0, z: -0.5 }] };
  const oldFrame = { tx: 0, tz: -1.5 + 1.0 * C.targetBias, distance: oldStyle };
  const oldCam = project(oldFrame, inpLone, { x: 0, z: -0.5 }).camDist;
  const newCam = project(lone, inpLone, { x: 0, z: -0.5 }).camDist;
  ok(mibPx(newCam) / mibPx(oldCam) >= 1.4, `one mib: 16 mm mib is ${mibPx(newCam).toFixed(1)} px from ${newCam.toFixed(2)} m, was ${mibPx(oldCam).toFixed(1)} px from ${oldCam.toFixed(2)} m, want at least 1.4x`);
  lone.px = mibPx(newCam); lone.camDist = newCam;
  ok(near(lone.auto.t, 0, 1e-9), `one mib: the lean should be FULL (t = 0) at exactly one mib, got ${lone.auto.t}`);
  const two = frameFor({ ...TAW, live: [{ x: 0, z: -0.5 }, { x: 0.05, z: -0.5 }] }, C, CAL);
  ok(two.auto.t > 0 && two.auto.t < 1, `two mibs: lean t should be strictly between 0 and 1, got ${two.auto.t}`);
  ok(lone.distance >= C.minDistance, 'one mib: never below minDistance');
}

/* 2b. the fit: from the ring edge (the placing spot, 1.525 m from the centre) at 13, 3, 2 and
   1 mibs, the SHOOTER projects inside the bottom of the frame and every mib inside the top */
{
  // ⛔ the screen's edges are the TEST's numbers, not tuning's: the first fail-watch mutated
  // fitEdge to 9 and this gate, reading its edge from the same field, stayed green. A shooter
  // under the chip cannot be braced. The top edge is under the names and pocket dots.
  // the bottom edge is the SHORT screen's: at 320 by 568 the house rules chip (pixels from the bottom)
  // tops out at 83% of the height, 0.664 of the half height, and the braced reticle needs 24 px more
  const EDGE_B = 0.60, EDGE_T = 0.86;   // the top edge is under the names and pocket dots (7% of the height)
  const RING = { tawX: 0, tawZ: -1.525, aspect: 375 / 667 };
  const lays = {
    13: cross({ x: 0, z: 0 }),
    3: [{ x: -0.075, z: 0 }, { x: 0, z: 0 }, { x: 0.15, z: 0.075 }],
    2: [{ x: -0.3, z: 0.1 }, { x: 0.25, z: -0.05 }],
    1: [{ x: 0, z: 0 }]
  };
  for (const n of Object.keys(lays)) {
    const inp = { ...RING, live: lays[n] };
    const f = frameFor(inp, C, CAL);
    const taw = project(f, inp, { x: inp.tawX, z: inp.tawZ });
    ok(taw.y >= -EDGE_B && Math.abs(taw.x) <= 1 && taw.depth > 0, `fit ${n} mibs: the SHOOTER projects at y ${taw.y.toFixed(2)} x ${taw.x.toFixed(2)} of the half frame (${-EDGE_B} is the top of the HUD chip), camera ${f.distance.toFixed(2)} m, bias ${f.auto.bias.toFixed(2)}`);
    ok(taw.y < 0, `fit ${n} mibs: the shooter should sit BELOW centre, got y ${taw.y.toFixed(2)}`);
    for (const m of lays[n]) {
      const q = project(f, inp, m);
      ok(q.y <= EDGE_T && Math.abs(q.x) <= 1 && q.depth > 0, `fit ${n} mibs: a mib at (${m.x}, ${m.z}) projects at y ${q.y.toFixed(2)} x ${q.x.toFixed(2)}, off the frame or under the top HUD (${EDGE_T})`);
      ok(q.y > taw.y, `fit ${n} mibs: a mib should sit above the shooter`);
    }
    if (n === '1') ok(f.distance <= f.auto.fit + 1e-9, `fit 1 mib: should stand AT the fit ${f.auto.fit.toFixed(3)}, stands at ${f.distance.toFixed(3)}`);
  }
}

/* 3. two survivors on opposite sides: neither can be leaned off the screen */
{
  const live = [{ x: -0.6, z: 0.2 }, { x: 0.6, z: 0.2 }];               // 1.2 m apart
  const f = frameFor({ ...TAW, live }, C, CAL);
  const hHalf = Math.atan(Math.tan((C.fov * DEG) / 2) * TAW.aspect);
  const halfWidthAtTarget = f.distance * Math.tan(hHalf);
  ok(f.auto.spread > 0.59 && f.auto.spread < 0.61, `two wide: spread should be 0.6, got ${f.auto.spread}`);
  ok(f.distance >= f.auto.floor - 1e-9, `two wide: distance ${f.distance.toFixed(3)} fell under the spread floor ${f.auto.floor.toFixed(3)}`);
  ok(halfWidthAtTarget >= f.auto.spread, `two wide: frame half width ${halfWidthAtTarget.toFixed(3)} m does not cover the spread ${f.auto.spread.toFixed(3)} m, a survivor is off screen`);
  ok(f.distance > lone.distance, 'two wide survivors must be framed from further back than one lone mib');
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
  const swung = { ...inpRing, user: { az: -0.84, zoom: 0.24 } };
  const fs = frameFor(swung, C, CAL);
  const ms = project(fs, swung, { x: 0, z: 0 });
  ok(Math.abs(ms.x) <= 0.8 && Math.abs(ms.y) <= 0.8 && ms.depth > 0, `pinch after orbit: the lone mib projects at x ${ms.x.toFixed(2)} y ${ms.y.toFixed(2)}, the scene the Director pinched into is dirt (bias ${fs.auto.bias.toFixed(2)})`);
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

if (fails.length) {
  console.log('CAMERA FAILED');
  for (const f of fails) console.log('  - ' + f);
  process.exit(1);
}
console.log(`CAMERA OK  full cross ${full.distance.toFixed(2)} m, one mib stands ${lone.distance.toFixed(2)} m from the look point and ${lone.camDist.toFixed(2)} m from the mib (${lone.px.toFixed(1)} px/mib, shooter in frame)`);

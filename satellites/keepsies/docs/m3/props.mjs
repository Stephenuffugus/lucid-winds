import { fit, measure } from './solve.mjs';
import { makeCam, place, coverage, ringOnScreen, proj, spherePx } from './viewnum.mjs';
const VPS = [[412, 915], [360, 780]];
function show(label, R, el, fov, farReach) {
  console.log('\n' + label);
  for (const [W, H] of VPS) {
    const f = fit(W, H, R, el, fov, { farReach });
    const m = measure(W, H, R, el, fov, f);
    const cam = makeCam(W, H, fov); place(cam, 0, 0.012, R - f.b * R, 0, el, f.d);
    const cov = coverage(cam, W, H, R, { top: 59, bottom: 94 });
    const ring = ringOnScreen(cam, W, H, R);
    // the cross: nearest arm (z=+0.225), side arm (x=0.225)
    const nearArm = spherePx(cam, W, H, { x: 0, y: 0.008, z: 0.225 }, 0.008), farArm = spherePx(cam, W, H, { x: 0, y: 0.008, z: -0.225 }, 0.008);
    const sideP = proj(cam, W, H, 0.225, 0.008, 0), side2 = proj(cam, W, H, 0.15, 0.008, 0);
    const sideOn = sideP.x <= W && sideP.x >= 0, side2On = side2.x <= W && side2.x >= 0;
    console.log(`  ${W}x${H}: camera ${f.d.toFixed(2)} m from the look point (bias ${f.b.toFixed(2)}), ${m.camH.toFixed(2)} m up, ${m.camToTaw.toFixed(2)} m to the shooter, ${m.camToMib.toFixed(2)} m to the centre mib`);
    console.log(`     shooter ${m.taw.toFixed(1)} px at y=${m.tawY.toFixed(0)}; mibs: near arm ${nearArm.w.toFixed(1)}, centre ${m.mib.toFixed(1)} (y=${m.mibY.toFixed(0)}), far arm ${farArm.w.toFixed(1)} px (y=${m.farY.toFixed(0)}); side arms ${sideOn ? 'on screen' : (side2On ? 'outer one off, two of three on' : 'off')} ; looks down on the cross at ${Math.atan2(m.camH, (R - f.b * R) + Math.cos(el * Math.PI / 180) * f.d).toFixed(2) * 57.3 | 0}°`);
    console.log(`     ring ${m.ringW.toFixed(0)} px across (screen ${W}), ${(ring.onShare * 100).toFixed(0)}% of the chalk on screen, far chalk y=${m.ringFarY.toFixed(0)}${m.ringFarY < 0 ? ' (off the top)' : ''}; inside the ring ${(cov.ring * 100).toFixed(0)}% of the screen, dirt outside ${(cov.dirt * 100).toFixed(0)}%`);
  }
}
const R10 = 1.525, R7 = 1.0668, R5 = 0.762, R4 = 0.6096;
show('TODAY for reference is in scen.mjs. A. TEN FOOT KEPT, closer and lower: el 26, lens 20, whole cross in frame', R10, 26, 20, 0.233);
show('A2. TEN FOOT KEPT, el 24, lens 24, shooter big and the near half of the cross (far arm may leave the top)', R10, 24, 24, 0.008);
show('B. SEVEN FOOT as the default, today\'s pitch and lens (el 30, lens 28), whole cross', R7, 30, 28, 0.233);
show('B2. FIVE FOOT ring, el 30, lens 28, whole cross', R5, 30, 28, 0.233);
show('B3. FOUR FOOT ring, el 34, lens 30, whole cross', R4, 34, 30, 0.233);
show('C. FIVE FOOT ring, shooter close: el 28, lens 34, the centre mib at the top band (near half of the cross framed)', R5, 28, 34, 0.008);
show('C2. FOUR FOOT ring, el 30, lens 36, centre at the top band', R4, 30, 36, 0.008);

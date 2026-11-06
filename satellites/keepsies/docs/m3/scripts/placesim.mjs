// Pure maths replay of main.js attachPlacement + game/ringer.js frameShot + render/scene.js damping (no browser).
import { readFileSync } from 'node:fs';
const K = '/workspaces/lucid-winds/satellites/keepsies/';
const { frameFor } = await import(K + 'src/core/framing.js?v=20261105b');
const T = JSON.parse(readFileSync(K + 'src/data/tuning.json', 'utf8'));
const R = T.ringer.ringRadius;
// the cross lay: 13 mibs at crossSpacing along x and z
const s = T.ringer.crossSpacing, live = [{ x: 0, z: 0 }];
for (let k = 1; k <= 3; k++) live.push({ x: k * s, z: 0 }, { x: -k * s, z: 0 }, { x: 0, z: k * s }, { x: 0, z: -k * s });
function run(label, fingerX) {   // fingerX(frame) in CSS px on a 375 wide screen
  let a = 0;                                    // taw's edge angle (resetPlacement put it at 0)
  let az = a, want = a;                         // the rig starts settled behind the taw
  const k = 1 - Math.pow(1 - 0.18, 1);
  const out = [];
  for (let f = 0; f < 40; f++) {
    const frac = Math.min(1, Math.max(0, fingerX(f) / 375));
    a = az + Math.PI + (frac - 0.5) * Math.PI * 1.4;        // main.js:1462 on every pointermove
    const tx = Math.sin(a) * R, tz = Math.cos(a) * R;       // rules-ringer.js edgePosition
    want = frameFor({ tawX: tx, tawZ: tz, live, aspect: 375 / 667, user: { az: 0, zoom: 1 } }, T.render.ringerCam).azimuth;
    // shortest way round, as an angle difference (the rig itself does not wrap; this only makes it readable)
    az += (want - az) * k;
    const deg = ((a * 180 / Math.PI) % 360 + 540) % 360 - 180;
    out.push(Math.round(deg));
  }
  console.log(label + ': taw edge angle by frame (deg): ' + out.join(' '));
}
run('finger held still at screen centre', () => 187.5);
run('finger held still 40 px right of centre', () => 227.5);
run('finger sliding right 2 px a frame from centre', (f) => 187.5 + 2 * f);

// atan2 wrap: the taw walked SMOOTHLY along the edge through 180 degrees (no feedback loop, 0.5 deg a frame).
import { makeGame } from './harness.mjs';
const D = 180 / Math.PI;
const wrap = (a) => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };
const g = makeGame({ w: 412, h: 839, phase: 'place', placeAngle: 170 / D });
for (let i = 0; i < 120; i++) g.frame(1 / 60);
let prev = g.rig.state.azimuth, maxJ = 0, at = null, off = 0;
for (let i = 0; i <= 40; i++) {
  g.G.R.setPlaceAngle((170 + i * 0.5) / D);
  g.frame(1 / 60);
  const j = Math.abs(wrap(g.rig.state.azimuth - prev)) * D; if (j > maxJ) { maxJ = j; at = 170 + i * 0.5; }
  if (!g.tawOnScreen()) off++;
  prev = g.rig.state.azimuth;
}
for (let i = 0; i < 40; i++) { g.frame(1 / 60); const j = Math.abs(wrap(g.rig.state.azimuth - prev)) * D; if (j > maxJ) { maxJ = j; at = 'after'; } if (!g.tawOnScreen()) off++; prev = g.rig.state.azimuth; }
console.log('taw walked 170 -> 190 deg at 0.5 deg/frame: largest camera step', maxJ.toFixed(1), 'deg/frame (at taw angle', at, '), frames with the shooter off screen', off,
  ', azimuth now', (g.rig.state.azimuth * D).toFixed(1), 'want', (g.rig.state.wantAzimuth * D).toFixed(1));

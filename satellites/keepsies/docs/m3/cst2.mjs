import { frameFor } from '/workspaces/lucid-winds/satellites/keepsies/src/core/framing.js?v=20261105b';
import { makeCam, place, proj, spherePx } from './viewnum.mjs';
import { readFileSync } from 'node:fs';
const T = JSON.parse(readFileSync('/workspaces/lucid-winds/satellites/keepsies/src/data/tuning.json', 'utf8'));
const C0 = T.render.ringerCam, sp = T.ringer.crossSpacing;
const live = [{x:0,z:0}]; for (let k=1;k<=3;k++) live.push({x:k*sp,z:0},{x:-k*sp,z:0},{x:0,z:k*sp},{x:0,z:-k*sp});
function run(label, over, R, n=13, W=412, H=915) {
  const C = Object.assign({}, C0, over);
  const L = live.slice(0, n);
  const f = frameFor({ tawX: 0, tawZ: R, live: L }, C);
  const cam = makeCam(W, H, C.fov); place(cam, f.tx, 0, f.tz, f.azimuth, f.elevation, f.distance);
  const taw = spherePx(cam, W, H, {x:0,y:0.011,z:R}, 0.011), tp = proj(cam, W, H, 0, 0.011, R);
  const mc = spherePx(cam, W, H, {x:0,y:0.008,z:0}, 0.008);
  const far = proj(cam, W, H, 0, 0.008, -3*sp), sideR = proj(cam, W, H, 3*sp, 0.008, 0), sideL = proj(cam, W, H, -3*sp, 0.008, 0);
  console.log(`${label} ${W}x${H} R=${R} n=${n} d=${f.distance.toFixed(2)} shooter ${taw.w.toFixed(1)}px @y${tp.y.toFixed(0)} mib ${mc.w.toFixed(1)}px farArm y${far.y.toFixed(0)} side x ${sideL.x.toFixed(0)}..${sideR.x.toFixed(0)}`);
}
const F1 = { elevationDeg: 26, fov: 20, targetBias: 0.26, spanFactor: 0, spanAdd: 0 };
for (const [W,H] of [[412,915],[412,839],[360,780]]) {
  run('today', {}, 1.525, 13, W, H);
  run('F1   ', F1, 1.525, 13, W, H);
  run('F1 3 ', F1, 1.525, 3, W, H);
  run('F1 7ft', F1, 1.0668, 13, W, H);
}

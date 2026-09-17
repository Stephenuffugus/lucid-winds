// The flick assist (DESIGN 3.1 "arc shot, real rim"; OPUS "cozy first"): idealSpeed really lands a ball in the basket
// in the physics world, and a flick outside the assist window is left alone.
import { suite } from './lib.mjs';
import { initPhysics, Physics, idealSpeed } from '../src/physics.js';
import { BASKET, SHOT, PHYS } from '../src/config.js';

const { ok, done } = suite('shot');
await initPhysics();

function fly(start, speed, ang) {
  const P = new Physics();
  P.addBall(1, { pos: start });
  const hv = speed * Math.cos(SHOT.elevation);
  P.get(1).rb.setLinvel({ x: Math.cos(ang) * hv, y: speed * Math.sin(SHOT.elevation), z: Math.sin(ang) * hv }, true);
  for (let i = 0; i < 240; i++) P.step();
  const p = P.pose(1);
  const inB = P.inBasket(p, 0.02);
  P.free();
  return { inB, p };
}

let landed = 0, n = 0;
for (const [x, z] of [[-0.3, 0.4], [0, 0.3], [0.2, 0.1], [-0.2, 0], [0.3, 0.45], [0, -0.1]]) {
  const start = { x, y: PHYS.holdHeight, z };
  const bx = BASKET.x - x, bz = BASKET.z - z;
  const v = idealSpeed(Math.hypot(bx, bz), BASKET.height - 0.02 - start.y, SHOT.elevation);
  const r = fly(start, v, Math.atan2(bz, bx));
  n++; if (r.inB) landed++;
  console.log(`  info  from (${x}, ${z}): ${v.toFixed(2)} m/s, lands (${r.p.x.toFixed(2)}, ${r.p.y.toFixed(2)}, ${r.p.z.toFixed(2)}) ${r.inB ? 'in' : 'out'}`);
}
ok(landed === n, `the ideal speed lands the ball from ${landed} of ${n} spots on the table`);
// 25% too hard with no assist misses
{
  const start = { x: 0, y: PHYS.holdHeight, z: 0.3 };
  const bx = BASKET.x, bz = BASKET.z - 0.3;
  const v = idealSpeed(Math.hypot(bx, bz), BASKET.height - 0.02 - start.y, SHOT.elevation);
  ok(!fly(start, v * 1.25, Math.atan2(bz, bx)).inB, 'a flick 25% too hard, unassisted, misses (the assist matters)');
  const nudged = v * 1.25 + (v - v * 1.25) * SHOT.rangeAssist;
  ok(fly(start, nudged, Math.atan2(bz, bx)).inB, 'the same flick after the nudge goes in');
}
done();

// DESIGN 15.1 and 15.2 without a browser: the pile settles and sleeps, and a flick is deterministic.
import { suite } from './lib.mjs';
import { initPhysics, Physics } from '../src/physics.js';
import { rng32 } from '../src/mathx.js';
import { TABLE } from '../src/config.js';

const { ok, done } = suite('physics');
await initPhysics();

function pile(n, seed) {
  const r = rng32(1000 + seed);
  return Array.from({ length: n }, (_, i) => ({ id: i + 1, silId: Math.floor(r() * 8), scale: r() < 0.12 ? 0.82 : 1 }));
}

// 15.1 physics smoke: 200 socks dumped settle < 2 s and sleep
let worst = 0, worstMs = 0;
for (const seed of [1, 2, 3, 4, 5]) {
  const P = new Physics();
  const t0 = performance.now();
  const d = P.dump(pile(200, seed), { seed, maxSeconds: 4 });
  const ms = performance.now() - t0;
  worstMs = Math.max(worstMs, ms / d.steps);
  const c = P.counts();
  let below = 0, outside = 0;
  for (const rec of P.bodies.values()) {
    const t = rec.rb.translation();
    if (t.y < -0.01) below++;
    if (Math.abs(t.x) > TABLE.halfW || t.z > TABLE.front || t.z < TABLE.back) outside++;
  }
  worst = Math.max(worst, d.settledAt < 0 ? 99 : d.settledAt);
  ok(d.settledAt > 0 && d.settledAt < 2, `seed ${seed}: 200 socks settle in ${d.settledAt.toFixed(2)} s simulated (< 2 s)`);
  ok(c.total === 200 && c.awake === 0, `seed ${seed}: all 200 asleep (awake ${c.awake})`);
  ok(below === 0 && outside === 0, `seed ${seed}: none under the table (${below}) or off it (${outside})`);
  P.free();
}
console.log(`  info  worst settle ${worst.toFixed(2)} s, worst ${worstMs.toFixed(2)} ms per step in Node`);

// a frozen pile stays put for 5 simulated seconds
{
  const P = new Physics();
  P.dump(pile(120, 9), { seed: 9 });
  const before = [...P.bodies.values()].map((r) => ({ ...r.rb.translation() }));
  for (let i = 0; i < 300; i++) P.step();
  let drift = 0, i = 0;
  for (const r of P.bodies.values()) { const t = r.rb.translation(); drift = Math.max(drift, Math.hypot(t.x - before[i].x, t.y - before[i].y, t.z - before[i].z)); i++; }
  ok(drift < 1e-6 && P.counts().awake === 0, `a settled pile does not creep (max drift ${drift.toExponential(1)} m over 5 s)`);
  // grabbing a sock from the pile wakes its neighbours, and they settle again
  const ids = [...P.bodies.keys()];
  const id = ids[ids.length - 1];
  P.grab(id);
  const t = P.pose(id);
  for (let k = 0; k < 40; k++) { P.setHoldTarget(id, t.x + k * 0.006, t.z); P.step(); }
  const awakeWhileHeld = P.counts().awake;
  ok(awakeWhileHeld > 1, `dragging through the pile wakes neighbours (${awakeWhileHeld - 1} awake)`);
  P.release(id, { x: 0, y: 0, z: 0 });
  let settledIn = -1;
  for (let k = 0; k < 400; k++) { P.step(); if (P.counts().awake === 0) { settledIn = (k + 1) / 60; break; } }
  ok(settledIn > 0 && settledIn < 4, `after release everything sleeps again within 4 s (${settledIn.toFixed(2)} s)`);
  P.free();
}

// 15.2 flick determinism: 100 flicks from a fixed start and velocity land within a 5 cm cluster
{
  const rests = [];
  for (let k = 0; k < 100; k++) {
    const P = new Physics();
    P.addSock(1, 1, { pos: { x: 0, y: 0.1, z: 0.4 }, rot: { x: 0, y: 0, z: 0, w: 1 } });
    P.grab(1);
    P.setHoldTarget(1, 0, 0.4);
    for (let i = 0; i < 5; i++) P.step();
    P.release(1, { x: 0.35, y: 0.4, z: -1.6 }, { x: -2, y: 0, z: 0 });
    for (let i = 0; i < 240; i++) P.step();
    rests.push(P.pose(1));
    P.free();
  }
  const cx = rests.reduce((a, p) => a + p.x, 0) / rests.length, cz = rests.reduce((a, p) => a + p.z, 0) / rests.length;
  const spread = Math.max(...rests.map((p) => Math.hypot(p.x - cx, p.z - cz)));
  const travelled = Math.hypot(cx - 0, cz - 0.4);
  ok(spread <= 0.05, `100 flicks land within a 5 cm cluster (max ${(spread * 100).toFixed(3)} cm from the centre)`);
  ok(travelled > 0.2, `the flick actually travels (${(travelled * 100).toFixed(0)} cm)`);
}

// a ball lobbed at the basket lands inside it, and a ball dropped beside it does not
{
  const { BASKET } = await import('../src/config.js');
  const { lobVelocity } = await import('../src/physics.js');
  const P = new Physics();
  const start = { x: 0, y: 0.1, z: 0.3 };
  P.addBall(1, { pos: start });
  const target = { x: BASKET.x, y: BASKET.height + 0.05, z: BASKET.z };
  const v = lobVelocity(start, target, 0.7);
  P.bodies.get(1).rb.setLinvel(v, true);
  for (let i = 0; i < 180; i++) P.step();
  const p = P.pose(1);
  ok(P.inBasket(p), `a lob lands in the basket (${p.x.toFixed(2)}, ${p.y.toFixed(2)}, ${p.z.toFixed(2)})`);
  P.addBall(2, { pos: { x: BASKET.x + 0.3, y: 0.2, z: BASKET.z + 0.25 } });
  for (let i = 0; i < 120; i++) P.step();
  ok(!P.inBasket(P.pose(2)), 'a ball dropped beside the basket is not counted in it');
  // a ball dropped onto the rim bounces (real rim, DESIGN 3.1)
  P.addBall(3, { pos: { x: BASKET.x + BASKET.radius, y: BASKET.height + 0.25, z: BASKET.z } });
  let peakAfterHit = 0, hit = false, lastVy = 0;
  for (let i = 0; i < 90; i++) {
    P.step();
    const vy = P.velocity(3).y;
    if (lastVy < -0.5 && vy > 0.2) hit = true;
    if (hit) peakAfterHit = Math.max(peakAfterHit, P.pose(3).y);
    lastVy = vy;
  }
  ok(hit, `a ball dropped on the rim bounces off it (rebound peak ${peakAfterHit.toFixed(3)} m)`);
  P.free();
}

done();

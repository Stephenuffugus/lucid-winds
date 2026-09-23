// HOW A HEAP ARRIVES (DESIGN-T2 6.2): "Two new ARRIVALS (code): Hotel Laundry Cart (`cartDump`: a canvas cart tips
// its heap onto the table) and Apartment Laundry Chute (`chuteBursts`: three bursts from above). GPT 1's warning is the
// acceptance test: play begins only when the SAME final heap has settled, so no dryer is secretly the best one."
//
// The heap is worked out ONCE by a headless physics run (Physics.dump: where every sock lands, then the recorded
// frames of it settling). What she watches is a playback: each sock flies in from a start pose, arrives at its own
// time and then plays its own recorded path. So an arrival may choose only start poses and times. This holds that:
// every plan leaves the recording untouched, every plan ends after every sock has played its whole path (so the
// last frame, the same heap, is what play begins on), the door and the clothesline are exactly what they were, and
// the cart and the chute do what the design says. dev/shots-arrivals.mjs holds the same heap in the running game.
import { suite } from './lib.mjs';
import { initPhysics, Physics } from '../src/physics.js';
import { rng32 } from '../src/mathx.js';
import { TABLE, DRYER, PHYS } from '../src/config.js';
import { arrivalPlan, playbackEnd, ARRIVALS, CART, CHUTE, eulerQuat } from '../src/arrivals.js';
import { sha256 } from '../engine/sha256.js';

const { ok, done } = suite('arrivals');
await initPhysics();
const dt = 1 / PHYS.hz;
const pile = (n, seed) => { const r = rng32(2000 + seed); return Array.from({ length: n }, (_, i) => ({ id: i + 1, silId: Math.floor(r() * 8), scale: r() < 0.12 ? 0.82 : 1 })); };
const hashFrames = (d) => sha256(JSON.stringify([d.order, d.ids, d.frames.map((f) => Array.from(f, (v) => Math.round(v * 1e6)))]));

ok(ARRIVALS.join() === 'door,above,cart,chute', `four arrivals: ${ARRIVALS.join(', ')}`);

// ---------- the door and the clothesline are EXACTLY what table.dump made before 6.2 ----------
// the old code, written out here (table.js as of 20260923d), three.js's XYZ Euler to quaternion by hand
function oldPlan(d, seed, fromAbove) {
  const n = d.order.length;
  const spacing = Math.min(0.034, 1.7 / Math.max(1, n));
  const rand = rng32(seed ^ 0x5bd1e995);
  const arrive = new Map();
  d.order.forEach((id, i) => arrive.set(id, 0.45 + i * spacing + rand() * spacing * 0.6));
  const starts = new Map();
  for (const id of d.ids) {
    const a = rand() * Math.PI * 2, r = rand() * DRYER.doorR * 0.55;
    const land = d.landing.get(id);
    const above = fromAbove && land;
    const x = above ? land.x + (rand() - 0.5) * 0.05 : DRYER.x + Math.cos(a) * r;
    const y = above ? 1.15 + rand() * 0.2 : DRYER.doorY + Math.sin(a) * r * 0.8;
    const z = above ? land.z : TABLE.back - 0.1;
    const ex = rand() * 6.28, ey = rand() * 6.28, ez = rand() * 6.28;
    const s1 = [rand() - 0.5, rand() - 0.5, rand() - 0.5], L = Math.hypot(...s1);
    starts.set(id, { x, y, z, q: eulerQuat(ex, ey, ez), spin: s1.map((v) => v / L), lift: 0.12 + rand() * 0.16 });
  }
  return { arrive, starts, flight: 0.5 };
}
const recs = [];
for (const seed of [3, 11, 29]) {
  const P = new Physics();
  const d = P.dump(pile(46, seed), { seed, maxSeconds: 4 });
  recs.push({ seed, d, hash: hashFrames(d), n: 46 });
  P.free();
}
{
  const bad = [];
  for (const { seed, d } of recs) for (const [kind, above] of [['door', false], ['above', true]]) {
    const a = arrivalPlan(kind, d, seed), b = oldPlan(d, seed, above);
    if (a.flight !== b.flight) bad.push(`${kind} flight`);
    for (const id of d.ids) {
      if (a.arrive.get(id) !== b.arrive.get(id)) { bad.push(`${kind} ${seed} arrive ${id}`); break; }
      const s = a.starts.get(id), o = b.starts.get(id);
      const same = ['x', 'y', 'z', 'lift'].every((k) => s[k] === o[k]) && ['x', 'y', 'z', 'w'].every((k) => Math.abs(s.q[k] - o.q[k]) < 1e-12) && s.spin.every((v, i) => Math.abs(v - o.spin[i]) < 1e-12);
      if (!same) { bad.push(`${kind} ${seed} start ${id}`); break; }
    }
  }
  ok(!bad.length, `the dryer door and the clothesline arrive exactly as they did before 6.2${bad.length ? ': ' + bad.slice(0, 4).join('; ') : ''}`);
}

// ---------- THE ACCEPTANCE TEST: the same final heap, whatever brings it ----------
{
  const bad = [];
  for (const { seed, d, hash } of recs) {
    const ends = {};
    for (const kind of ARRIVALS) {
      const p = arrivalPlan(kind, d, seed);
      if (hashFrames(d) !== hash) bad.push(`${kind} changed the recording`);
      // every sock is in the plan, arrives after the playback starts, and has a start pose
      if (d.ids.some((id) => !(p.arrive.get(id) > 0) || !p.starts.get(id))) bad.push(`${kind}: a sock without an arrival`);
      const end = playbackEnd(p, d.frames.length, dt);
      // play begins only after EVERY sock has played its whole recorded path, so what play begins on is the last
      // frame of the one recording: the same heap for every arrival
      const lastSettle = Math.max(...d.ids.map((id) => p.arrive.get(id) + d.frames.length * dt));
      if (end < lastSettle) bad.push(`${kind}: play would begin at ${end.toFixed(2)} s, before the last sock settles at ${lastSettle.toFixed(2)} s`);
      ends[kind] = end;
    }
    // and no arrival keeps her waiting much longer than the dryer door does (nor gets her to the table sooner by much)
    for (const kind of ['cart', 'chute']) if (Math.abs(ends[kind] - ends.door) > 1.6) bad.push(`${kind} ends ${ends[kind].toFixed(2)} s against the door's ${ends.door.toFixed(2)} s`);
  }
  ok(!bad.length, `every arrival leaves the one recorded heap untouched and play begins only when all of it has settled (${recs.length} heaps, 4 arrivals)${bad.length ? ': ' + bad.slice(0, 4).join('; ') : ''}`);
}

// ---------- the cart: a canvas cart tips its heap onto the table ----------
{
  const bad = [];
  for (const { seed, d } of recs) {
    const p = arrivalPlan('cart', d, seed);
    const pr = p.props;
    // every sock starts inside the tipped bin, at its lip, over the back of the table
    for (const id of d.ids) {
      const s = p.starts.get(id);
      if (Math.abs(s.x - CART.x) > CART.w / 2 || s.z < CART.z - CART.d || s.z > TABLE.playBack + 0.02 || s.y < 0.05 || s.y > CART.lipY + 0.06) { bad.push(`sock ${id} starts outside the cart (${s.x.toFixed(2)}, ${s.y.toFixed(2)}, ${s.z.toFixed(2)})`); break; }
    }
    // the pour is ONE tip: it starts once the cart has tipped, runs in the heap's own order, and is over in under 1.6 s
    const times = d.order.map((id) => p.arrive.get(id));
    const sorted = times.every((t, i) => !i || t >= times[i - 1]);
    const first = times[0], last = times[times.length - 1];
    if (!sorted) bad.push('the pour is not in the heap\'s order');
    if (first - p.flight < pr.tipAt + pr.tipDur * 0.5) bad.push(`a sock leaves before the cart has tipped (${(first - p.flight).toFixed(2)} s, tip at ${pr.tipAt})`);
    if (last - first > 1.6) bad.push(`the pour takes ${(last - first).toFixed(2)} s`);
    if (!(pr.rollIn > 0 && pr.untipAt > last - p.flight && pr.rollOut > pr.untipAt)) bad.push('the cart leaves before the pour is over');
  }
  ok(!bad.length, `the cart rolls in, tips once, pours the heap in its order from inside the bin, and leaves after${bad.length ? ': ' + bad.slice(0, 3).join('; ') : ''}`);
}

// ---------- the chute: three bursts from above ----------
{
  const bad = [];
  for (const { seed, d, n } of recs) {
    const p = arrivalPlan('chute', d, seed);
    const leave = d.order.map((id) => p.arrive.get(id) - p.flight);
    // three bursts: the gaps between bursts are far longer than the gaps inside one
    const gaps = leave.slice(1).map((t, i) => t - leave[i]);
    const big = gaps.map((g, i) => [g, i]).filter(([g]) => g > 0.35);
    if (big.length !== 2) bad.push(`${big.length + 1} bursts, not three`);
    const sizes = big.length === 2 ? [big[0][1] + 1, big[1][1] - big[0][1], n - 1 - big[1][1]] : [];
    if (sizes.some((k) => Math.abs(k - n / 3) > 1)) bad.push(`bursts of ${sizes.join(', ')}`);
    if (p.props.bursts.length !== 3) bad.push('the chute flap does not open three times');
    // from the chute's mouth, above the back of the table, falling
    for (const id of d.ids) {
      const s = p.starts.get(id);
      if (Math.hypot(s.x - CHUTE.x, s.z - CHUTE.z) > CHUTE.mouth || Math.abs(s.y - CHUTE.y) > 0.03) { bad.push(`sock ${id} does not start in the mouth`); break; }
      if (s.lift > 0.05) { bad.push('a sock is thrown up out of the chute instead of falling'); break; }
    }
  }
  ok(!bad.length, `the chute drops the heap from its mouth in three bursts of a third each${bad.length ? ': ' + bad.slice(0, 3).join('; ') : ''}`);
}

// an arrival this build does not know is the door, never a crash
{
  const { seed, d } = recs[0];
  const a = arrivalPlan('trebuchet', d, seed), b = arrivalPlan('door', d, seed);
  ok(d.ids.every((id) => a.arrive.get(id) === b.arrive.get(id)), 'an arrival this build does not know arrives through the door');
}

done();

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
import { TABLE, DRYER, PHYS, BASKET, ODDBIN } from '../src/config.js';
import { arrivalPlan, playbackEnd, ARRIVALS, CART, CHUTE, eulerQuat, cartPose, cartToWorld, worldToCart, flightPoint } from '../src/arrivals.js';
import { SILHOUETTES, colliderLayout } from '../src/silhouettes.js';
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
  const items = pile(46, seed);
  const d = P.dump(items, { seed, maxSeconds: 4 });
  recs.push({ seed, d, hash: hashFrames(d), n: 46, items: new Map(items.map((it) => [it.id, it])) });
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
    // the pour is ONE tip: it starts once the cart has tipped all the way, runs in the heap's own order, is over in
    // under 1.6 s and before the cart starts to tip back, and the cart leaves after
    const times = d.order.map((id) => p.arrive.get(id));
    const sorted = times.every((t, i) => !i || t >= times[i - 1]);
    const first = times[0], last = times[times.length - 1];
    if (!sorted) bad.push('the pour is not in the heap\'s order');
    if (first - p.flight < pr.tipAt + pr.tipDur - 1e-9) bad.push(`a sock leaves before the cart has finished tipping (${(first - p.flight).toFixed(2)} s, tipped at ${(pr.tipAt + pr.tipDur).toFixed(2)})`);
    if (last - p.flight > pr.untipAt) bad.push('a sock leaves after the cart starts to tip back');
    if (last - first > 1.6) bad.push(`the pour takes ${(last - first).toFixed(2)} s`);
    if (!(pr.rollIn > 0 && pr.untipAt > last - p.flight && pr.rollOut > pr.untipAt)) bad.push('the cart leaves before the pour is over');
    // the door's coins moment comes out WITH the laundry (at the start the cart is still off screen), from the lip
    const lip = cartToWorld([0, CART.h, 0]);
    if (!(pr.coinsAt === pr.tipAt + pr.tipDur && pr.coinsAt <= first - p.flight)) bad.push(`the coins come out at ${pr.coinsAt} s, not with the first sock`);
    if (!pr.coinsFrom || Math.hypot(pr.coinsFrom.x - lip[0], pr.coinsFrom.y - lip[1], pr.coinsFrom.z - lip[2]) > 1e-9) bad.push('the coins do not come from the lip');
  }
  ok(!bad.length, `the cart rolls in, tips once, pours the heap in its order with the coins, and leaves after${bad.length ? ': ' + bad.slice(0, 3).join('; ') : ''}`);
}

// THE POUR, from the pictures of 23 Sep: the heap sprayed out of the MIDDLE of the bin in every direction, one sock
// straight up. Every sock starts inside the tipped bin, just under its mouth, and its middle leaves the bin through
// the MOUTH, clear of the rim, never through a canvas wall, and never goes back in. Walked along every flight.
{
  const bad = [];
  const m = 0.015;
  const inBin = ([x, y, z]) => Math.abs(x) < CART.w / 2 && y > 0 && y < CART.h && z < 0 && z > -CART.d;
  for (const { seed, d } of recs) {
    const p = arrivalPlan('cart', d, seed);
    const f0 = d.frames[0];
    for (let i = 0; i < d.ids.length && bad.length < 4; i++) {
      const id = d.ids[i], s = p.starts.get(id);
      const L = [f0[i * 7], f0[i * 7 + 1], f0[i * 7 + 2]];
      let state = 'start';
      for (let j = 0; j <= 400; j++) {
        const f = flightPoint(s, L[0], L[1], L[2], j / 400);
        const b = worldToCart([f.x, f.y, f.z]);
        const inside = inBin(b);
        if (state === 'start') {
          if (!inside) { bad.push(`sock ${id} starts outside the tipped bin (bin coordinates ${b.map((v) => v.toFixed(3)).join(', ')})`); break; }
          state = 'in';
        } else if (state === 'in' && !inside) {
          const mouth = b[1] >= CART.h && Math.abs(b[0]) < CART.w / 2 - m && b[2] < -m && b[2] > -CART.d + m;
          if (!mouth) { bad.push(`sock ${id} leaves the bin through a wall or the rim (bin coordinates ${b.map((v) => v.toFixed(3)).join(', ')})`); break; }
          state = 'out';
        } else if (state === 'out' && inside) { bad.push(`sock ${id} falls back into the bin`); break; }
      }
    }
  }
  ok(!bad.length, `every sock starts in the tipped bin and leaves it over the lip, through the mouth, never through its canvas${bad.length ? ': ' + bad.slice(0, 3).join('; ') : ''}`);
}

// WHERE THE CART GOES, from the pictures: it rolled in over the Odd Bin and out THROUGH the basket, and parked it
// stood 4 mm inside the basket (2.6 cm inside the Bigger one). Then the second look: parked, the Odd Bin's folded
// front FLAP and its label stood INSIDE the cart (this law had boxed the Odd Bin at its walls, 8.5 cm, and its flaps
// reach 13.9). So the real outlines: the Odd Bin with its flaps (render.js folds them 0.55 rad outward, 6 cm long,
// from 2.6 cm out), and the basket at its widest style, the floatie's ring at R + 5.2 cm, at either size. Walked
// every 5 ms of its trip: it never passes through the Odd Bin or a basket, upright or tipped; parked it stands on
// the back of the table, not on the play area; its casters ride OVER the table's rail; and it leaves the way it came.
{
  const { seed, d } = recs[0];
  const P = arrivalPlan('cart', d, seed).props;
  const f = CART.frame + 0.003, bad = [];   // the frame, and the push bar's round, which stands 3 mm further back
  const clampv = (v, a, b) => Math.max(a, Math.min(b, v));
  const foot = (x) => ({ x0: x - CART.w / 2 - f, x1: x + CART.w / 2 + f, z0: CART.z - CART.d / 2 - f, z1: CART.z + CART.d / 2 + f });
  const flap = 0.026 + 0.03 * Math.cos(0.55) + 0.002;
  const odd = { x0: ODDBIN.x - ODDBIN.halfW, x1: ODDBIN.x + ODDBIN.halfW, z0: ODDBIN.z - ODDBIN.halfD - flap, z1: ODDBIN.z + ODDBIN.halfD + flap };
  const boxHit = (a, b) => a.x0 < b.x1 && a.x1 > b.x0 && a.z0 < b.z1 && a.z1 > b.z0;
  const baskets = [['the basket', BASKET.radius], ['the Bigger basket', BASKET.bigRadius]].map(([n, r]) => [n, r + 0.052 + 0.004]);
  const discHit = (a, r) => Math.hypot(clampv(BASKET.x, a.x0, a.x1) - BASKET.x, clampv(BASKET.z, a.z0, a.z1) - BASKET.z) < r;
  const rails = [[-TABLE.halfW - TABLE.railT, -TABLE.halfW], [TABLE.halfW, TABLE.halfW + TABLE.railT]];
  const end = P.rollOut + P.outDur;
  for (let t = 0; t <= end + 1e-9 && bad.length < 4; t += 0.005) {
    const c = cartPose(t, P);
    if (c.gone) break;
    const a = foot(c.x);
    if (boxHit(a, odd)) bad.push(`through the Odd Bin at ${t.toFixed(2)} s (x ${c.x.toFixed(2)})`);
    for (const [n, r] of baskets) if (discHit(a, r)) bad.push(`through ${n} at ${t.toFixed(2)} s (x ${c.x.toFixed(2)})`);
    // the tipped bin's corners, in the room, stay out of the Odd Bin and the baskets too
    for (const bx of [-CART.w / 2, CART.w / 2]) for (const by of [0, CART.h]) for (const bz of [0, -CART.d]) {
      const [wx, wy, wz] = cartToWorld([bx, by, bz], c.tilt, c.x, c.y);
      if (wy < ODDBIN.height + 0.02 && wx > odd.x0 && wx < odd.x1 && wz > odd.z0 && wz < odd.z1) bad.push(`the tipped bin in the Odd Bin at ${t.toFixed(2)} s`);
      for (const [n, r] of baskets) if (wy < BASKET.height + 0.01 && Math.hypot(wx - BASKET.x, wz - BASKET.z) < r) bad.push(`the tipped bin in ${n} at ${t.toFixed(2)} s`);
    }
    // a caster is 5 cm across and its bottom 5 mm under the cart's floor line: over the rail it rides on top
    for (const hx of [c.x - CART.w / 2 + 0.03, c.x + CART.w / 2 - 0.03]) for (const [r0, r1] of rails) {
      if (hx + 0.025 > r0 && hx - 0.025 < r1 && c.y + 0.005 < TABLE.railH) bad.push(`a caster through the table's rail at ${t.toFixed(2)} s (x ${c.x.toFixed(2)})`);
    }
  }
  const park = foot(CART.x);
  if (park.x0 < -TABLE.halfW || park.x1 > TABLE.halfW) bad.push('parked, it hangs off the table');
  if (park.z1 > TABLE.playBack + 0.005) bad.push(`parked, it stands on the play area (front ${park.z1.toFixed(3)}, play begins ${TABLE.playBack})`);
  const out = cartPose(end - 1e-6, P);
  if (!(out.x < -TABLE.halfW - CART.w)) bad.push(`it does not leave the way it came (it ends at x ${out.x.toFixed(2)})`);
  ok(!bad.length, `the cart never passes through the Odd Bin or either basket, parks on the back of the table, rides over the rail, and leaves the way it came${bad.length ? ': ' + bad.slice(0, 4).join('; ') : ''}`);
}

// Build 1's arc, written out by hand: the door and the clothesline throw a sock exactly as before 6.2
{
  const bad = [];
  const s = { x: 0.1, y: 0.3, z: -0.9, lift: 0.17 };
  for (const k of [0, 0.13, 0.5, 0.77, 1]) {
    const kk = k * k * (3 - 2 * k);
    const f = flightPoint(s, -0.2, 0.04, 0.3, k);
    const want = [s.x + (-0.2 - s.x) * kk, s.y + (0.04 - s.y) * kk + Math.sin(k * Math.PI) * s.lift, s.z + (0.3 - s.z) * k];
    if (f.x !== want[0] || f.y !== want[1] || f.z !== want[2] || f.scale !== 1 || f.kk !== kk) bad.push(k);
  }
  ok(!bad.length, `a sock from the door or the clothesline flies Build 1's arc exactly${bad.length ? ': differs at k ' + bad.join(', ') : ''}`);
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
    const first = Math.min(...leave);
    if (!(p.props.coinsAt === p.props.bursts[0].at && p.props.coinsAt <= first)) bad.push('the coins do not come down with the first burst');
    if (!p.props.coinsFrom || p.props.coinsFrom.y !== CHUTE.y || p.props.coinsFrom.x !== CHUTE.x || p.props.coinsFrom.z !== CHUTE.z) bad.push('the coins do not come from the mouth');
    // from the chute's mouth, above the back of the table: under the mouth by no more than 4 cm, never above it (so
    // never inside the duct), and FALLING (from rest, never thrown up)
    for (const id of d.ids) {
      const s = p.starts.get(id);
      if (Math.abs(s.x - CHUTE.x) > CHUTE.w / 2 - CHUTE.wall || Math.abs(s.z - CHUTE.z) > CHUTE.d / 2 - CHUTE.wall || s.y > CHUTE.y || s.y < CHUTE.y - 0.04) { bad.push(`sock ${id} does not start in the mouth`); break; }
      if (!s.drop) { bad.push('a sock is thrown out of the chute instead of falling'); break; }
    }
  }
  ok(!bad.length, `the chute drops the heap from its mouth in three bursts of a third each${bad.length ? ': ' + bad.slice(0, 3).join('; ') : ''}`);
}

// THROUGH THE WALLS, from the pictures of 23 Sep: a burst began with socks sticking out through the sides of the
// duct above its mouth (a knee high reaches 20 cm from its middle; the duct is narrower than that). Walked along
// every flight with each sock's real reach (its collider, times its size): whatever part of it is still above the
// mouth is inside the duct's walls.
{
  const reach = SILHOUETTES.map((sil) => {
    let R = 0;
    for (const c of colliderLayout(sil, 1)) {
      if (c.box) { R = Math.max(R, Math.hypot(c.at[0], c.at[2]) + Math.hypot(c.box[0], c.box[2])); continue; }
      for (const q of [c.a, c.b]) R = Math.max(R, Math.hypot(q[0], q[2]) + c.r);
    }
    return R;
  });
  const bad = [];
  let worst = -Infinity;
  for (const { seed, d, items } of recs) {
    const p = arrivalPlan('chute', d, seed);
    const f0 = d.frames[0];
    for (let i = 0; i < d.ids.length && bad.length < 4; i++) {
      const id = d.ids[i], it = items.get(id), s = p.starts.get(id);
      const R0 = reach[it.silId] * (it.scale || 1);
      for (let j = 0; j <= 400; j++) {
        const f = flightPoint(s, f0[i * 7], f0[i * 7 + 1], f0[i * 7 + 2], j / 400);
        const R = R0 * f.scale, below = CHUTE.y - f.y;
        if (R <= below) continue;
        const across = below > 0 ? Math.sqrt(R * R - below * below) : R;
        const over = Math.max(Math.abs(f.x - CHUTE.x) + across - (CHUTE.w / 2 - CHUTE.wall), Math.abs(f.z - CHUTE.z) + across - (CHUTE.d / 2 - CHUTE.wall));
        worst = Math.max(worst, over);
        if (over > 0) { bad.push(`sock ${id} (${SILHOUETTES[it.silId].key}) shows ${(over * 100).toFixed(1)} cm through the duct at k ${(j / 400).toFixed(2)}`); break; }
      }
    }
  }
  ok(!bad.length, `no sock shows through the chute's walls on its way out (the closest comes within ${(-worst * 100).toFixed(1)} cm of the steel)${bad.length ? ': ' + bad.slice(0, 3).join('; ') : ''}`);
}

// NOT THROUGH THE BASKET OR THE ODD BIN: a sock brought by the cart or the chute never passes its middle through
// either on the way to the heap (the chute hangs to the right of the dryer's porthole, in front of the basket).
{
  const bad = [];
  for (const { seed, d } of recs) for (const kind of ['cart', 'chute']) {
    const p = arrivalPlan(kind, d, seed), f0 = d.frames[0];
    for (let i = 0; i < d.ids.length && bad.length < 4; i++) {
      const s = p.starts.get(d.ids[i]);
      for (let j = 0; j <= 200; j++) {
        const f = flightPoint(s, f0[i * 7], f0[i * 7 + 1], f0[i * 7 + 2], j / 200);
        const inBasket = f.y < BASKET.height + 0.03 && Math.hypot(f.x - BASKET.x, f.z - BASKET.z) < BASKET.bigRadius + 0.014 + 0.03;
        const inOdd = f.y < ODDBIN.height + 0.03 && Math.abs(f.x - ODDBIN.x) < ODDBIN.halfW + 0.03 && Math.abs(f.z - ODDBIN.z) < ODDBIN.halfD + 0.03;
        if (inBasket || inOdd) { bad.push(`${kind} sock ${d.ids[i]} passes through the ${inBasket ? 'basket' : 'Odd Bin'} at k ${(j / 200).toFixed(2)}`); break; }
      }
    }
  }
  ok(!bad.length, `no sock from the cart or the chute passes through the basket or the Odd Bin${bad.length ? ': ' + bad.slice(0, 3).join('; ') : ''}`);
}

// an arrival this build does not know is the door, never a crash
{
  const { seed, d } = recs[0];
  const a = arrivalPlan('trebuchet', d, seed), b = arrivalPlan('door', d, seed);
  ok(d.ids.every((id) => a.arrive.get(id) === b.arrive.get(id)), 'an arrival this build does not know arrives through the door');
}

done();

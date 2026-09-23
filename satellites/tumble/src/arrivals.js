// HOW A HEAP ARRIVES (DESIGN-T2 6.2). Pure: tests/arrivals.test.mjs holds it without a browser.
//
// The heap is worked out ONCE by a headless physics run (Physics.dump: where every sock lands, and the recorded
// frames of it settling). What she watches is a playback: each sock flies in from a start pose, arrives at its own
// time, then plays its own recorded path (table.js). An arrival chooses ONLY the start poses and the times, never
// the recording, and play begins after every sock has played its whole path. So every arrival ends on the same
// heap, which is GPT 1's warning answered: no dryer is secretly the best one.
//
//   door    out of the dryer door, one after another (Build 1)
//   above   straight down onto each sock's spot, the Backyard Clothesline (Build 1)
//   cart    the Hotel Laundry Cart: rolls in along the back of the table, tips, pours the heap over its lip in one
//           go, tips back and leaves the way it came
//   chute   the Apartment Laundry Chute: comes down from the ceiling over the back, drops the heap in three bursts
import { rng32, smooth } from './mathx.js';
import { TABLE, DRYER } from './config.js';

export const ARRIVALS = ['door', 'above', 'cart', 'chute'];

// The cart parks just in front of the Odd Bin's folded flap, on the back of the table and off the play area, clear
// of the basket at either size and in every style (the parked cart first stood 4 mm inside the basket; the next one
// had the Odd Bin's flap and label standing inside it). That strip is 13 cm deep, so the cart is slim. It comes in
// from the left and leaves the same way, so it never passes the basket at all. `tip` is how far it tips over its
// front wheels (at 1.15 rad the table camera looked straight into its mouth and saw a flat white card); `frame` is
// the steel round the canvas.
export const CART = { x: -0.07, z: -0.515, w: 0.3, d: 0.13, h: 0.19, wheel: 0.06, frame: 0.012, tip: 0.8, fromX: -1.15, toX: -1.15 };
// The chute's mouth hangs over the back of the table, HIGH: at 0.66 m it hung in front of the dryer's porthole on
// both phones and read as the dryer door. At 0.95 it is above the porthole at 412 and 360 (dev/shots-arrivals.mjs
// holds that on the real camera). w and d are the duct, `wall` its steel.
export const CHUTE = { x: 0.2, z: -0.5, y: 0.95, w: 0.24, d: 0.22, len: 1.2, wall: 0.004 };

// three.js's Euler (order XYZ) to a quaternion, by hand, so the door's start poses stay what they always were
export function eulerQuat(x, y, z) {
  const c1 = Math.cos(x / 2), c2 = Math.cos(y / 2), c3 = Math.cos(z / 2);
  const s1 = Math.sin(x / 2), s2 = Math.sin(y / 2), s3 = Math.sin(z / 2);
  return { x: s1 * c2 * c3 + c1 * s2 * s3, y: c1 * s2 * c3 - s1 * c2 * s3, z: c1 * c2 * s3 + s1 * s2 * c3, w: c1 * c2 * c3 - s1 * s2 * s3 };
}
const unit = (a) => { const L = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / L, a[1] / L, a[2] / L]; };

const ease = (k) => smooth(Math.max(0, Math.min(1, k)));

// WHERE THE CART IS at time t of its arrival (src/render.js draws it from this; tests walk it): x along the back of
// the table, its tilt over the front wheels, and whether it has gone
export function cartPose(t, P) {
  const x = t < P.rollIn ? CART.fromX + (CART.x - CART.fromX) * ease(t / P.rollIn)
    : t > P.rollOut ? CART.x + (CART.toX - CART.x) * ease((t - P.rollOut) / P.outDur) : CART.x;
  const tilt = CART.tip * (ease((t - P.tipAt) / P.tipDur) - ease((t - P.untipAt) / P.untipDur));
  // the table's side rail: while a left caster is over it (or off the table) the cart rides on top of it, and it
  // comes down onto the table as they clear it. A caster is 5 cm across, its hub 3 cm in from the cart's side.
  const casterOut = x - CART.w / 2 + 0.03 - 0.025;
  const y = TABLE.railH * ease((-TABLE.halfW + 0.03 - casterOut) / 0.028);
  return { x, y, tilt, gone: t >= P.rollOut + P.outDur };
}

// a point of the cart's bin to the room: bin coordinates are x across, y up from the bin floor, z back from the
// front wall (0 to -d); the bin tips about its front bottom edge, over the front wheels
export function cartToWorld([x, y, z], tilt = CART.tip, cartX = CART.x, lift = 0) {
  const c = Math.cos(tilt), s = Math.sin(tilt);
  return [cartX + x, CART.wheel + lift + y * c - z * s, CART.z + CART.d / 2 + y * s + z * c];
}
export function worldToCart([x, y, z], tilt = CART.tip, cartX = CART.x, lift = 0) {
  const c = Math.cos(tilt), s = Math.sin(tilt);
  const Y = y - CART.wheel - lift, Z = z - CART.z - CART.d / 2;
  return [x - cartX, Y * c + Z * s, -Y * s + Z * c];
}
export const cartLip = (tilt = CART.tip) => cartToWorld([0, CART.h, 0], tilt);

// WHERE A SOCK IS on its way in, k from 0 (its start) to 1 (the first frame of its recorded path, L). The door and
// the clothesline throw it on an arc (Build 1's curve, unchanged). A sock from the cart is POURED: up out of the
// mouth, over the lip, then down to where it lands (a curve through `over`, a point just past the lip; the back of
// the heap lands under the tipped bin, which a straight arc could only reach through the canvas). A sock from the
// chute FALLS: from rest, straight down first and spreading late, and it comes out of the mouth small and grows to
// its size as it drops, so it never shows through the chute's walls. table.js draws this; the tests walk it.
export function flightPoint(s, lx, ly, lz, k) {
  if (s.over) {
    const a = (1 - k) * (1 - k), b = 2 * k * (1 - k), c = k * k, o = s.over;
    return { x: a * s.x + b * o[0] + c * lx, y: a * s.y + b * o[1] + c * ly, z: a * s.z + b * o[2] + c * lz, kk: smooth(k), scale: 1 };
  }
  if (s.drop) {
    const kv = k * k, kh = kv * k;
    return { x: s.x + (lx - s.x) * kh, y: s.y + (ly - s.y) * kv, z: s.z + (lz - s.z) * kh, kk: smooth(k), scale: s.grow + (1 - s.grow) * kv };
  }
  const kk = smooth(k);
  return { x: s.x + (lx - s.x) * kk, y: s.y + (ly - s.y) * kk + Math.sin(k * Math.PI) * s.lift, z: s.z + (lz - s.z) * k, kk, scale: 1 };
}

// d: { order, ids, landing } from Physics.dump; seed: the Load's dump seed. Returns { arrive, starts, flight, props }.
export function arrivalPlan(kind, d, seed) {
  if (kind === 'cart' || kind === 'chute') return kind === 'cart' ? cartPlan(d, seed) : chutePlan(d, seed);
  // the dryer door and the clothesline: table.dump's code before 6.2, moved here unchanged (same random stream)
  const fromAbove = kind === 'above';
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
    const q = eulerQuat(rand() * 6.28, rand() * 6.28, rand() * 6.28);
    const spin = unit([rand() - 0.5, rand() - 0.5, rand() - 0.5]);
    starts.set(id, { x, y, z, q, spin, lift: 0.12 + rand() * 0.16 });
  }
  return { kind: fromAbove ? 'above' : 'door', arrive, starts, flight: 0.5, props: null };
}

function tumbleStart(rand, x, y, z, lift) {
  return { x, y, z, q: eulerQuat(rand() * 6.28, rand() * 6.28, rand() * 6.28), spin: unit([rand() - 0.5, rand() - 0.5, rand() - 0.5]), lift };
}

// where a sock's recorded path begins (the first frame of the one recording): where its flight must end
const landAt = (d, i) => [d.frames[0][i * 7], d.frames[0][i * 7 + 1], d.frames[0][i * 7 + 2]];

// the cart rolls in from the left (0.45 s), tips forward over its front wheels (0.25 s), pours the heap in the
// order it lands (bottom of the heap first, like the door) once it has tipped all the way, tips back and rolls
// off the way it came. Each sock starts just under the mouth near the lip, on the side of the bin nearest where it
// lands, and is poured over the lip: a pour, not a fountain out of the middle (tests/arrivals.test.mjs walks every
// flight against the bin's walls).
function cartPlan(d, seed) {
  const rand = rng32(seed ^ 0x2545f491);
  const n = d.order.length, flight = 0.5;
  const rollIn = 0.45, tipAt = 0.45, tipDur = 0.25;
  const pourAt = tipAt + tipDur;
  const spacing = Math.min(0.026, 1.1 / Math.max(1, n));
  const arrive = new Map();
  let last = 0;
  d.order.forEach((id, i) => { const leave = pourAt + i * spacing + rand() * spacing * 0.5; last = Math.max(last, leave); arrive.set(id, leave + flight); });
  const starts = new Map();
  const lip = cartLip();
  d.ids.forEach((id, i) => {
    const L = landAt(d, i);
    const bx = Math.max(-CART.w * 0.36, Math.min(CART.w * 0.36, (L[0] - CART.x) * 0.35 + (rand() - 0.5) * 0.08));
    const p = cartToWorld([bx, CART.h - 0.012 - rand() * 0.02, -(0.2 + rand() * 0.3) * CART.d]);
    const s = tumbleStart(rand, p[0], p[1], p[2], 0);
    s.over = [p[0] + (L[0] - p[0]) * 0.2, lip[1] + 0.07, lip[2] + 0.06];   // out over the lip first, sideways after
    starts.set(id, s);
  });
  const untipAt = last + 0.15;
  // the door's coins moment is paid as the pour begins, from the lip (DESIGN-T2 1.2: an arrival never changes what
  // a Load pays, only where the coins come from)
  const coinsFrom = { x: lip[0], y: lip[1], z: lip[2] };
  return { kind: 'cart', arrive, starts, flight, props: { rollIn, tipAt, tipDur, untipAt, untipDur: 0.25, rollOut: untipAt + 0.3, outDur: 0.45, coinsAt: pourAt, coinsFrom } };
}


// the chute: three bursts, each a third of the heap in the order it lands; the chute thumps for each. A sock FALLS
// out of it (flightPoint's `drop`): from rest just under the mouth, small, growing to its size as it drops.
function chutePlan(d, seed) {
  const rand = rng32(seed ^ 0x68e31da4);
  const n = d.order.length, flight = 0.55;
  const cuts = [0, Math.round(n / 3), Math.round((2 * n) / 3), n];
  const burstAt = [0.3, 1.0, 1.7];
  const arrive = new Map(), bursts = [];
  for (let b = 0; b < 3; b++) {
    const ids = d.order.slice(cuts[b], cuts[b + 1]);
    const spacing = Math.min(0.03, 0.3 / Math.max(1, ids.length));
    ids.forEach((id, j) => arrive.set(id, burstAt[b] + j * spacing + rand() * spacing * 0.4 + flight));
    bursts.push({ at: burstAt[b], dur: Math.max(0.2, ids.length * spacing + 0.1) });
  }
  const starts = new Map();
  for (const id of d.ids) {
    const s = tumbleStart(rand, CHUTE.x + (rand() - 0.5) * 0.03, CHUTE.y - 0.03, CHUTE.z + (rand() - 0.5) * 0.03, 0);
    s.drop = true;
    s.grow = 0.4;   // the largest start the chute's wall law allows (0.45 comes within 6 mm of the steel over five heaps)
    starts.set(id, s);
  }
  // the door's coins moment comes down with the first burst, out of the mouth
  return { kind: 'chute', arrive, starts, flight, props: { bursts, coinsAt: burstAt[0], coinsFrom: { x: CHUTE.x, y: CHUTE.y, z: CHUTE.z } } };
}

// when play may begin: after the LAST sock has played its whole recorded path (table.dump's rule before 6.2)
export function playbackEnd(plan, framesLen, dt) {
  let end = 0;
  for (const t of plan.arrive.values()) end = Math.max(end, t + framesLen * dt);
  return end + 0.05;
}

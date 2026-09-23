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
//   cart    the Hotel Laundry Cart: rolls along the back of the table, tips, pours the heap in one go
//   chute   the Apartment Laundry Chute: hangs from the ceiling over the back, drops the heap in three bursts
import { rng32 } from './mathx.js';
import { TABLE, DRYER } from './config.js';

export const ARRIVALS = ['door', 'above', 'cart', 'chute'];

// the cart parks between the Odd Bin and the basket, just behind the play area; its bin's lip is where socks leave
export const CART = { x: -0.02, z: -0.56, w: 0.3, d: 0.2, h: 0.2, wheel: 0.06, lipY: 0.3 };
// the chute's mouth, over the back of the play area, below the top of the table camera's frame
export const CHUTE = { x: 0, z: -0.5, y: 0.66, mouth: 0.08 };

// three.js's Euler (order XYZ) to a quaternion, by hand, so the door's start poses stay what they always were
export function eulerQuat(x, y, z) {
  const c1 = Math.cos(x / 2), c2 = Math.cos(y / 2), c3 = Math.cos(z / 2);
  const s1 = Math.sin(x / 2), s2 = Math.sin(y / 2), s3 = Math.sin(z / 2);
  return { x: s1 * c2 * c3 + c1 * s2 * s3, y: c1 * s2 * c3 - s1 * c2 * s3, z: c1 * c2 * s3 + s1 * s2 * c3, w: c1 * c2 * c3 - s1 * s2 * s3 };
}
const unit = (a) => { const L = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / L, a[1] / L, a[2] / L]; };

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

// the cart rolls in from the left (0.45 s), tips forward over its front wheels (0.25 s), pours the heap in the
// order it lands (bottom of the heap first, like the door), tips back and rolls off to the right
function cartPlan(d, seed) {
  const rand = rng32(seed ^ 0x2545f491);
  const n = d.order.length, flight = 0.5;
  const rollIn = 0.45, tipAt = 0.45, tipDur = 0.25;
  const pourAt = tipAt + tipDur * 0.6;
  const spacing = Math.min(0.026, 1.1 / Math.max(1, n));
  const arrive = new Map();
  let last = 0;
  d.order.forEach((id, i) => { const leave = pourAt + i * spacing + rand() * spacing * 0.5; last = Math.max(last, leave); arrive.set(id, leave + flight); });
  const starts = new Map();
  const front = CART.z + CART.d / 2;
  for (const id of d.ids) {
    // out of the tipped bin, across its lip: spread along its width, a little depth, below the lip
    starts.set(id, tumbleStart(rand, CART.x + (rand() - 0.5) * CART.w * 0.8, 0.12 + rand() * 0.12, front + rand() * 0.04, 0.05 + rand() * 0.08));
  }
  const untipAt = last + 0.15;
  return { kind: 'cart', arrive, starts, flight, props: { rollIn, tipAt, tipDur, untipAt, untipDur: 0.25, rollOut: untipAt + 0.3, outDur: 0.45 } };
}

// the chute: three bursts, each a third of the heap in the order it lands, the flap opening for each
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
  for (const id of d.ids) starts.set(id, tumbleStart(rand, CHUTE.x + (rand() - 0.5) * 0.1, CHUTE.y, CHUTE.z + (rand() - 0.5) * 0.08, rand() * 0.03));
  return { kind: 'chute', arrive, starts, flight, props: { bursts } };
}

// when play may begin: after the LAST sock has played its whole recorded path (table.dump's rule before 6.2)
export function playbackEnd(plan, framesLen, dt) {
  let end = 0;
  for (const t of plan.arrive.values()) end = Math.max(end, t + framesLen * dt);
  return end + 0.05;
}

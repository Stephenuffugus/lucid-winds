// The finger picks the sock the player SEES (Stephen, Sep 21 2026: "like my touch is going through it").
// The physics shape of a sock is two rails with a gap down the middle; the pick uses the footprint instead.
import { suite } from './lib.mjs';
import { SILHOUETTES, centerline, colliderLayout } from '../src/silhouettes.js';
import { pickBoxes, rayFootprint, footprintPick } from '../src/pick.js';
import { initPhysics, Physics } from '../src/physics.js';
import { rng32 } from '../src/mathx.js';

const { ok, done } = suite('pick');
const flat = (x = 0, y = 0, z = 0) => ({ x, y, z, qx: 0, qy: 0, qz: 0, qw: 1 });
const down = { x: 0, y: -1, z: 0 };

// does a straight down ray at (x, z) hit one of the OLD rails (capsules lying flat, radius r, from a to b)?
function hitsRails(sil, x, z) {
  for (const c of colliderLayout(sil, 1)) {
    if (c.box) { // the toe sock's foot is already a box
      const cs = Math.cos(c.yaw), sn = Math.sin(c.yaw), ox = x - c.at[0], oz = z - c.at[2];
      const lx = ox * cs - oz * sn, lz = ox * sn + oz * cs;
      if (Math.abs(lx) <= c.box[0] && Math.abs(lz) <= c.box[2]) return true;
      continue;
    }
    const ax = c.a[0], az = c.a[2], bx = c.b[0], bz = c.b[2], dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz || 1e-9;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / L2));
    if (Math.hypot(x - (ax + dx * t), z - (az + dz * t)) <= c.r) return true;
  }
  return false;
}

// 1. THE HOLE: along the middle of every sock, the old shape is mostly air and the footprint never is
let worstOld = 1;
for (const sil of SILHOUETTES) {
  const cl = centerline(sil, 40), boxes = pickBoxes(sil.id, 1);
  let old = 0, now = 0;
  const pts = cl.pts.slice(2, -2); // the last millimetres are the rounded cuff edge and toe tip
  for (const p of pts) {
    if (hitsRails(sil, p.x, p.z)) old++;
    if (rayFootprint({ x: p.x, y: 1, z: p.z }, down, flat(), boxes) < Infinity) now++;
  }
  worstOld = Math.min(worstOld, old / pts.length);
  ok(now === pts.length, `${sil.key}: a tap anywhere along the middle of the sock lands on the sock (${now}/${pts.length}; the rails caught ${old})`);
}
ok(worstOld < 0.5, `and the old rails really did have the hole: on the worst silhouette only ${(worstOld * 100).toFixed(0)} percent of middle taps touched them`);

// 2. IN A HEAP the top sock wins a tap through its middle
{
  const crew = SILHOUETTES[1], mid = centerline(crew, 40).pts[8];
  const under = { id: 1, silId: 1, scale: 1, pose: flat(0, 0, 0) };
  const onTop = { id: 2, silId: 1, scale: 1, pose: flat(0, crew.t, 0) };
  const hit = footprintPick({ x: mid.x, y: 1, z: mid.z }, down, [under, onTop]);
  ok(hit && hit.id === 2, 'two socks stacked: a tap through the middle of the top one picks the TOP one');
  ok(!hitsRails(crew, mid.x, mid.z), 'and that same tap missed both of the old rails (it used to fall through to the one below)');
}
// 3. it does not steal taps: just off the edge is a miss
{
  const crew = SILHOUETTES[1], pts = centerline(crew, 40).pts, p = pts[8], boxes = pickBoxes(1, 1);
  // across the leg, not along it: the perpendicular of the centreline at that point
  const dx = pts[9].x - pts[7].x, dz = pts[9].z - pts[7].z, L = Math.hypot(dx, dz), nx = dz / L, nz = -dx / L;
  const at = (k) => rayFootprint({ x: p.x + nx * k, y: 1, z: p.z + nz * k }, down, flat(), boxes);
  ok(at(crew.w / 2 + 0.006) === Infinity && at(-crew.w / 2 - 0.006) === Infinity, 'a tap 6 mm outside either edge of the leg does not pick the sock');
  ok(at(crew.w / 2 - 0.004) < Infinity && at(-crew.w / 2 + 0.004) < Infinity, 'and a tap 4 mm inside either edge does');
}
// 4. a sock lying at an angle on the heap: the ray that runs down its own normal still finds it, at the right distance
{
  const a = Math.PI / 5, q = { qx: Math.sin(a / 2), qy: 0, qz: 0, qw: Math.cos(a / 2) }; // tipped 36 degrees about x
  const crew = SILHOUETTES[1], p = centerline(crew, 40).pts[8], boxes = pickBoxes(1, 1);
  const R = (v) => { const y = v[1] * Math.cos(a) - v[2] * Math.sin(a), z = v[1] * Math.sin(a) + v[2] * Math.cos(a); return [v[0], y, z]; };
  const top = R([p.x, crew.t, p.z]), n = R([0, 1, 0]);
  const o = { x: top[0] + n[0] * 0.5, y: top[1] + n[1] * 0.5 + 0.2, z: top[2] + n[2] * 0.5 + 0.1 };
  const t = rayFootprint(o, { x: -n[0], y: -n[1], z: -n[2] }, { x: 0, y: 0.2, z: 0.1, ...q }, boxes);
  ok(Math.abs(t - 0.5) < 1e-6, `a tipped sock is hit where it really is (distance ${t.toFixed(4)}, expected 0.5000)`);
}
// 5. scale: a big sock has a big footprint
{
  const p = centerline(SILHOUETTES[2], 40).pts[10];
  ok(rayFootprint({ x: p.x * 1.4, y: 1, z: p.z * 1.4 }, down, flat(), pickBoxes(2, 1.4)) < Infinity, 'a scaled sock is picked at its scaled size');
}

// 6. THE REAL HEAP, with the real physics pick (Rapier), the size of a Heavy Load: tap straight down on the middle of
//    every sock. Picking a DIFFERENT sock is fine when that sock lies on top. Picking one that lies BELOW the sock
//    under the finger is the fault he felt: the touch went through it.
await initPhysics();
{
  let oldThrough = 0, newThrough = 0, taps = 0;
  for (const seed of [1, 2, 3]) {
    const r = rng32(7000 + seed);
    const items = Array.from({ length: 70 }, (_, i) => ({ id: i + 1, silId: Math.floor(r() * 8), scale: 1 }));
    const P = new Physics();
    P.dump(items, { seed, maxSeconds: 4 });
    const socks = items.map((it) => ({ id: it.id, silId: it.silId, scale: 1, pose: P.pose(it.id) })).filter((x) => x.pose);
    for (const sk of socks) {
      const pts = centerline(SILHOUETTES[sk.silId], 40).pts;
      for (const k of [8, 30]) { // the middle of the leg, the middle of the foot
        // that point on the sock's top face, in the world
        const q = sk.pose, lp = [pts[k].x, SILHOUETTES[sk.silId].t, pts[k].z];
        const tx = 2 * (q.qy * lp[2] - q.qz * lp[1]), ty = 2 * (q.qz * lp[0] - q.qx * lp[2]), tz = 2 * (q.qx * lp[1] - q.qy * lp[0]);
        const w = { x: q.x + lp[0] + q.qw * tx + (q.qy * tz - q.qz * ty), y: q.y + lp[1] + q.qw * ty + (q.qz * tx - q.qx * tz), z: q.z + lp[2] + q.qw * tz + (q.qx * ty - q.qy * tx) };
        const o = { x: w.x, y: 2, z: w.z };
        const oldHit = P.pick(o, down);
        const f = footprintPick(o, down, socks);
        const newHit = f && (!oldHit || f.toi < oldHit.toi) ? f : oldHit;
        const below = (hit) => !!hit && hit.id !== sk.id && (2 - hit.toi) < w.y - 0.004; // it landed lower than the sock the finger is on
        taps++;
        if (below(oldHit) || !oldHit) oldThrough++;
        if (below(newHit) || !newHit) newThrough++;
      }
    }
  }
  ok(newThrough === 0, `a heap of 70 socks, ${taps} taps on the middle of a sock: NONE goes through the sock under the finger (${newThrough})`);
  ok(oldThrough > taps * 0.2, `and with the old pick ${oldThrough} of ${taps} did (${Math.round((oldThrough / taps) * 100)} percent): that is the fault, measured`);
}
done();

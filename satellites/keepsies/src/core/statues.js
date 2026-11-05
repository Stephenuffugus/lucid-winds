/**
 * STATUES, Stephen's idea (4 Nov 2026: "a small statue that may have different shapes"), a Ringer house rule,
 * off by default (KEEPSIES_BUILD_PLAN.md step 9). Pure: no DOM, no three, no transcendental, no clock. The same
 * code places, checks and replays a statue in the game, in the AI and in the harness.
 *
 * Four shapes, each a small stone figure about three marbles high against a ten foot ring. Every size is in
 * metres and every part is a collider the physics builds (core/physics.js addStatue) and the renderer copies
 * (render/statues.js), so what you see is exactly what the marble hits:
 *   column  tall and narrow on a little base: a glancing hit deflects
 *   loaf    wide and low: it blocks
 *   arch    two legs and a lintel: a marble can be shot under it (along z, through a 40 by 48 mm opening)
 *   orb     a ball on a low plinth: round, so a hit scatters
 *
 * A statue is { shape, x, z, owner } and the list is part of the match's setup record.
 */
import { len2 } from './dmath.js?v=20261105b';

export const FOOT = 0.3048;
export const GRID = FOOT / 2;            // statues snap to a half foot grid
export const MOVE_MAX = 2 * FOOT;        // a move is up to two feet (step 10)
export const PER_PLAYER = 2;             // the players alternate placing two each

/* parts: box (half extents) or cyl (radius, half height) or ball (radius), each at an offset from the statue's
   foot point; `foot` is the radius of its chalk footprint, the circle legality uses */
export const SHAPES = {
  column: { name: 'Column', foot: 0.02, height: 0.06, parts: [
    { cyl: { r: 0.018, hh: 0.004 }, at: [0, 0.004, 0] },
    { cyl: { r: 0.012, hh: 0.026 }, at: [0, 0.034, 0] }
  ] },
  loaf: { name: 'Loaf', foot: 0.052, height: 0.034, parts: [
    { box: { hx: 0.045, hy: 0.017, hz: 0.026 }, at: [0, 0.017, 0] }
  ] },
  arch: { name: 'Arch', foot: 0.038, height: 0.06, parts: [
    { box: { hx: 0.008, hy: 0.024, hz: 0.012 }, at: [-0.028, 0.024, 0] },
    { box: { hx: 0.008, hy: 0.024, hz: 0.012 }, at: [0.028, 0.024, 0] },
    { box: { hx: 0.036, hy: 0.006, hz: 0.012 }, at: [0, 0.054, 0] }
  ] },
  orb: { name: 'Orb', foot: 0.022, height: 0.054, parts: [
    { cyl: { r: 0.016, hh: 0.005 }, at: [0, 0.005, 0] },
    { ball: { r: 0.022 }, at: [0, 0.032, 0] }
  ] }
};
export const SHAPE_ORDER = ['column', 'loaf', 'arch', 'orb'];

/** The nearest half foot grid point. */
export function snap(x, z) {
  return { x: Math.round(x / GRID) * GRID, z: Math.round(z / GRID) * GRID };
}

/**
 * May a statue of `shape` stand at (x, z)? Inside the ring but never within one foot of the lay (every mib of
 * the cross as laid) or of the ring's edge, and clear of every other statue. A move (opts.from) is also at most
 * two feet from where it stood and may not touch a marble (opts.marbles: [{x, z, r}]).
 * @returns {{ok:boolean, why:string|null}}
 */
export function legal(shape, x, z, ringRadius, statues, lay, opts) {
  const S = SHAPES[shape];
  if (!S) return { ok: false, why: 'no such statue' };
  const o = opts || {};
  const d = len2(x, z);
  if (d > ringRadius - FOOT) return { ok: false, why: 'too near the ring' };
  for (const p of lay || []) if (len2(x - p.x, z - p.z) < FOOT) return { ok: false, why: 'too near the cross' };
  for (let i = 0; i < (statues || []).length; i++) {
    if (i === o.skip) continue;
    const s = statues[i], T = SHAPES[s.shape];
    if (len2(x - s.x, z - s.z) < S.foot + T.foot + 0.02) return { ok: false, why: 'on another statue' };
  }
  if (o.from && len2(x - o.from.x, z - o.from.z) > MOVE_MAX + 1e-9) return { ok: false, why: 'more than two feet' };
  for (const m of o.marbles || []) if (len2(x - m.x, z - m.z) < S.foot + m.r + 0.005) return { ok: false, why: 'on a marble' };
  return { ok: true, why: null };
}

/** Every legal grid point for a shape, in a fixed order (rows of z, then x), so a seeded pick is a replay. */
export function legalSpots(shape, ringRadius, statues, lay, opts) {
  const out = [];
  const n = Math.floor(ringRadius / GRID);
  for (let k = -n; k <= n; k++) for (let i = -n; i <= n; i++) {
    const x = i * GRID, z = k * GRID;
    if (legal(shape, x, z, ringRadius, statues, lay, opts).ok) out.push({ x, z });
  }
  return out;
}

/**
 * The AI's placement, by a seeded rule: a shape in turn from its own stream, then a legal grid point from the
 * same stream, preferring the half of the ring nearer the opponent's shooter (a statue in their way, not its own).
 * @param {{next:()=>number}} rng
 * @param {{x:number,z:number}} foeTaw where the other player's shooter stands
 */
export function aiPlacement(rng, ringRadius, statues, lay, owner, foeTaw) {
  const shape = SHAPE_ORDER[Math.floor(rng.next() * SHAPE_ORDER.length) % SHAPE_ORDER.length];
  let spots = legalSpots(shape, ringRadius, statues, lay);
  if (foeTaw) {
    const near = spots.filter(p => p.x * foeTaw.x + p.z * foeTaw.z > 0);
    if (near.length) spots = near;
  }
  if (!spots.length) return null;
  const at = spots[Math.floor(rng.next() * spots.length) % spots.length];
  return { shape, x: at.x, z: at.z, owner };
}

/**
 * Does a statue stand in the line from a shooter to a target? The distance from the statue's foot point to the
 * segment, against its footprint plus the shooter's radius. The AI moves its own statue out of its best shot.
 */
export function blocks(statue, from, to, r) {
  const S = SHAPES[statue.shape];
  const dx = to.x - from.x, dz = to.z - from.z, L2 = dx * dx + dz * dz;
  if (L2 < 1e-12) return false;
  let t = ((statue.x - from.x) * dx + (statue.z - from.z) * dz) / L2;
  if (t < 0) t = 0; else if (t > 1) t = 1;
  const px = from.x + dx * t, pz = from.z + dz * t;
  return len2(statue.x - px, statue.z - pz) < S.foot + (r || 0.011);
}

/** Every point a statue could sit inside a footprint: for the harness's "never passes through" check. */
export function inside(statue, x, y, z, r) {
  const S = SHAPES[statue.shape];
  for (const p of S.parts) {
    const cx = statue.x + p.at[0], cy = p.at[1], cz = statue.z + p.at[2];
    if (p.box) {
      if (Math.abs(x - cx) < p.box.hx - r * 0.5 && Math.abs(y - cy) < p.box.hy && Math.abs(z - cz) < p.box.hz - r * 0.5) return true;
    } else if (p.cyl) {
      if (len2(x - cx, z - cz) < p.cyl.r - r * 0.5 && Math.abs(y - cy) < p.cyl.hh) return true;
    } else if (p.ball) {
      const dx = x - cx, dy = y - cy, dz = z - cz;
      if (dx * dx + dy * dy + dz * dz < (p.ball.r - r * 0.5) * (p.ball.r - r * 0.5)) return true;
    }
  }
  return false;
}

// World layout shared by the renderer and input: hex cells on the y = 0 plane, flat-top, size 1.
// World X = 1.5 q, world Z = sqrt(3) (r + q/2) (north is -Z, away from the camera).
import { grid, DIRS } from '../sim/hex.js';

export const SQ3 = Math.sqrt(3);

export function cellPos(g, i) {
  const c = g.cells[i];
  return { x: 1.5 * c.q, z: SQ3 * (c.r + c.q / 2) };
}

export function dirVec(d) {
  const [q, r] = DIRS[d];
  const x = 1.5 * q, z = SQ3 * (r + q / 2);
  const l = Math.hypot(x, z);
  return { x: x / l, z: z / l };
}

// World (x, z) on the board plane -> cell index, or -1 off the board.
export function cellAt(g, x, z) {
  const qf = (2 / 3) * x;
  const rf = z / SQ3 - qf / 2;
  const sf = -qf - rf;
  let q = Math.round(qf), r = Math.round(rf), s = Math.round(sf);
  const dq = Math.abs(q - qf), dr = Math.abs(r - rf), ds = Math.abs(s - sf);
  if (dq > dr && dq > ds) q = -r - s; else if (dr > ds) r = -q - s;
  return g.at(q, r);
}

export function boardExtent(radius) {
  const g = grid(radius);
  let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
  for (let i = 0; i < g.n; i++) { const p = cellPos(g, i); minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x); minZ = Math.min(minZ, p.z); maxZ = Math.max(maxZ, p.z); }
  // The brass frame (render/board.js: vertex radius SQ3 * radius + 1.55, plus its bevel) reaches past the
  // outer cells; fit the frame, not just the cells, so the board never touches the screen edges.
  const frameX = (SQ3 * radius + 1.62) * (SQ3 / 2);
  return { minX: Math.min(minX - 1, -frameX), maxX: Math.max(maxX + 1, frameX), minZ: minZ - SQ3 / 2, maxZ: maxZ + SQ3 / 2 };
}

export const CHANNEL_HEX = { 1: 0xff3148, 2: 0x2fe07a, 4: 0x3f7bff, 3: 0xffd23a, 6: 0x3ff0f0, 5: 0xe05cff, 7: 0xf6f3ff, 0: 0x777777 };
export const colorHex = (mask) => CHANNEL_HEX[mask & 7];

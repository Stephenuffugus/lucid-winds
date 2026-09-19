// Flat-top axial hex grid. Directions clockwise from north: 0 N, 1 NE, 2 SE, 3 S, 4 SW, 5 NW.
// Cell index: q ascending, then r ascending (docs/SIM_SPEC.md section 1).
export const DIRS = [[0, -1], [1, -1], [1, 0], [0, 1], [-1, 1], [-1, 0]];
export const DIR_NAMES = ['N', 'NE', 'SE', 'S', 'SW', 'NW'];
export const opposite = (d) => (d + 3) % 6;
export const rot = (d, k) => (((d + k) % 6) + 6) % 6;

const cache = new Map();

// Precomputed tables for one radius. neighbor[i*6+d] is a cell index or -1; wrap[i*6+d] is the
// opposite edge cell reached by leaving edge cell i in direction d (-1 when the neighbour is on board).
export function grid(radius) {
  let g = cache.get(radius);
  if (g) return g;
  const cells = [];
  const index = new Map();
  for (let q = -radius; q <= radius; q++) {
    for (let r = Math.max(-radius, -q - radius); r <= Math.min(radius, -q + radius); r++) {
      index.set(q * 1000 + r, cells.length);
      cells.push({ q, r, s: -q - r });
    }
  }
  const n = cells.length;
  const at = (q, r) => { const v = index.get(q * 1000 + r); return v === undefined ? -1 : v; };
  const neighbor = new Int16Array(n * 6);
  const wrap = new Int16Array(n * 6).fill(-1);
  const ring = new Uint8Array(n);
  const col = new Int8Array(n);
  for (let i = 0; i < n; i++) {
    const { q, r, s } = cells[i];
    ring[i] = Math.max(Math.abs(q), Math.abs(r), Math.abs(s));
    col[i] = q;
    for (let d = 0; d < 6; d++) neighbor[i * 6 + d] = at(q + DIRS[d][0], r + DIRS[d][1]);
  }
  for (let i = 0; i < n; i++) {
    for (let d = 0; d < 6; d++) {
      if (neighbor[i * 6 + d] !== -1) continue;
      const back = opposite(d);
      let c = i;
      while (neighbor[c * 6 + back] !== -1) c = neighbor[c * 6 + back];
      wrap[i * 6 + d] = c;
    }
  }
  // Edge ring in clockwise order starting from the north-most cell of the NE side, for Drift and UI.
  const edge = [];
  let cur = at(0, -radius);
  if (radius > 0) {
    for (let side = 0; side < 6; side++) {
      const d = (side + 2) % 6; // walk directions SE, S, SW, NW, N, NE around the ring
      for (let k = 0; k < radius; k++) { edge.push(cur); cur = at(cells[cur].q + DIRS[d][0], cells[cur].r + DIRS[d][1]); }
    }
  } else edge.push(cur);
  const center = at(0, 0);
  g = { radius, n, cells, neighbor, wrap, ring, col, edge, center, at,
    pixel: (i) => ({ x: 1.5 * cells[i].q, y: Math.sqrt(3) * (cells[i].r + cells[i].q / 2) }) };
  cache.set(radius, g);
  return g;
}

export function hexDistance(g, a, b) {
  const A = g.cells[a], B = g.cells[b];
  return Math.max(Math.abs(A.q - B.q), Math.abs(A.r - B.r), Math.abs(A.s - B.s));
}

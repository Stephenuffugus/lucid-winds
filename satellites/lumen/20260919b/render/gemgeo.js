// Procedural faceted gem geometry: one base mesh per cut (50-200 triangles), jittered by gemId so every
// copy looks one of a kind (section 3 "Seeded ID": facet jitter). Flat normals give facet sparkle.
import * as THREE from 'three';

function tri(pos, a, b, c) { pos.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]); }

// Outward winding for a convex part: flip any triangle whose normal points toward the part's centre.
function outward(pos) {
  let cx = 0, cy = 0, cz = 0;
  const n = pos.length / 3;
  for (let i = 0; i < pos.length; i += 3) { cx += pos[i]; cy += pos[i + 1]; cz += pos[i + 2]; }
  cx /= n; cy /= n; cz /= n;
  for (let i = 0; i < pos.length; i += 9) {
    const ax = pos[i], ay = pos[i + 1], az = pos[i + 2], bx = pos[i + 3], by = pos[i + 4], bz = pos[i + 5], qx = pos[i + 6], qy = pos[i + 7], qz = pos[i + 8];
    const ux = bx - ax, uy = by - ay, uz = bz - az, vx = qx - ax, vy = qy - ay, vz = qz - az;
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const mx = (ax + bx + qx) / 3 - cx, my = (ay + by + qy) / 3 - cy, mz = (az + bz + qz) / 3 - cz;
    if (nx * mx + ny * my + nz * mz < 0) for (let k = 0; k < 3; k++) { const t = pos[i + 3 + k]; pos[i + 3 + k] = pos[i + 6 + k]; pos[i + 6 + k] = t; }
  }
  return pos;
}

// A round/polygonal brilliant: table polygon on top, girdle ring, pavilion down to a culet point.
function brilliant({ n = 10, table = 0.55, girdle = 0.42, crown = 0.14, pavilion = 0.34, stretch = null, twist = 0.5 }) {
  const pos = [];
  const ring = (r, y, off) => Array.from({ length: n }, (_, k) => {
    const a = ((k + off) / n) * Math.PI * 2;
    let x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (stretch) { if (x > 0) x *= stretch; }
    return [x, y, z];
  });
  const top = ring(girdle * table, crown, twist);
  const mid = ring(girdle, 0, 0);
  const star = ring(girdle * (table + 1) / 2, crown * 0.55, 0);
  const c = [0, crown, 0];
  const cul = [0, -pavilion, 0];
  for (let k = 0; k < n; k++) {
    const k1 = (k + 1) % n;
    tri(pos, c, top[k1], top[k]);
    tri(pos, top[k], top[k1], star[k1]);
    tri(pos, top[k], star[k1], star[k]);
    tri(pos, star[k], star[k1], mid[k1]);
    tri(pos, star[k], mid[k1], mid[k]);
    tri(pos, mid[k], mid[k1], cul);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(outward(pos), 3));
  return g;
}

function slab({ n = 6, r = 0.5, h = 0.1, bevel = 0.12 }) {
  // flat step-cut plate: top table, bevelled edge, flat bottom
  const pos = [];
  const ring = (rr, y) => Array.from({ length: n }, (_, k) => { const a = (k / n) * Math.PI * 2; return [Math.cos(a) * rr, y, Math.sin(a) * rr]; });
  const t = ring(r * (1 - bevel), h), m = ring(r, h * 0.3), b = ring(r * (1 - bevel * 0.5), -h * 0.6);
  const ct = [0, h, 0], cb = [0, -h * 0.6, 0];
  for (let k = 0; k < n; k++) {
    const k1 = (k + 1) % n;
    tri(pos, ct, t[k1], t[k]);
    tri(pos, t[k], t[k1], m[k1]); tri(pos, t[k], m[k1], m[k]);
    tri(pos, m[k], m[k1], b[k1]); tri(pos, m[k], b[k1], b[k]);
    tri(pos, cb, b[k], b[k1]);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(outward(pos), 3));
  return g;
}

function merge(list) {
  const pos = [];
  for (const { g, x = 0, y = 0, z = 0, s = 1, ry = 0 } of list) {
    const gg = g.index ? g.toNonIndexed() : g;
    const p = gg.getAttribute('position');
    const c = Math.cos(ry), sn = Math.sin(ry);
    for (let i = 0; i < p.count; i++) {
      const px = p.getX(i) * s, py = p.getY(i) * s, pz = p.getZ(i) * s;
      pos.push(px * c + pz * sn + x, py + y, -px * sn + pz * c + z);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  return g;
}

const BASE = {
  mirror: () => {
    const shape = new THREE.Shape();
    const w = 0.7, h = 0.3, c = 0.08;
    shape.moveTo(-w + c, -h); shape.lineTo(w - c, -h); shape.lineTo(w, -h + c); shape.lineTo(w, h - c); shape.lineTo(w - c, h);
    shape.lineTo(-w + c, h); shape.lineTo(-w, h - c); shape.lineTo(-w, -h + c); shape.closePath();
    const g = new THREE.ExtrudeGeometry(shape, { depth: 0.06, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.025, bevelSegments: 1 });
    g.translate(0, 0, -0.03);
    return g;
  },
  amplifier: () => brilliant({ n: 10, table: 0.55, girdle: 0.42, crown: 0.15, pavilion: 0.36 }),
  splitter: () => merge([{ g: brilliant({ n: 3, table: 0.35, girdle: 0.48, crown: 0.12, pavilion: 0.28, twist: 0.5 }) }]),
  filter: () => slab({ n: 6, r: 0.5, h: 0.09, bevel: 0.16 }),
  prism: () => new THREE.CylinderGeometry(0.46, 0.46, 0.55, 3, 1).toNonIndexed(),
  lens: () => new THREE.SphereGeometry(0.46, 12, 6).scale(1, 0.36, 1).toNonIndexed(),
  resonator: () => new THREE.TorusGeometry(0.32, 0.1, 6, 12).rotateX(Math.PI / 2).toNonIndexed(),
  echo: () => merge([{ g: brilliant({ n: 8, girdle: 0.26, crown: 0.1, pavilion: 0.24 }), x: -0.2 }, { g: brilliant({ n: 8, girdle: 0.26, crown: 0.1, pavilion: 0.24 }), x: 0.2, y: 0.05 }]),
  tinter: () => brilliant({ n: 10, table: 0.5, girdle: 0.36, crown: 0.14, pavilion: 0.32, stretch: 1.6 }),
  geode: () => merge([
    { g: new THREE.IcosahedronGeometry(0.4, 1) },
    { g: brilliant({ n: 5, girdle: 0.12, crown: 0.05, pavilion: 0.25 }), y: 0.36, s: 1 },
    { g: brilliant({ n: 5, girdle: 0.09, crown: 0.04, pavilion: 0.2 }), x: 0.15, y: 0.3, s: 1, ry: 0.6 },
  ]),
};

const baseCache = {};
function hash01(seed, i) {
  let x = (seed ^ Math.imul(i + 1, 0x9e3779b1)) >>> 0;
  x ^= x >>> 16; x = Math.imul(x, 0x7feb352d) >>> 0; x ^= x >>> 15; x = Math.imul(x, 0x846ca68b) >>> 0; x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
}

// A per-gem copy of the cut's mesh with every vertex nudged by its gemId (shared vertices move together).
export function gemGeometry(cut, gemId) {
  if (!baseCache[cut]) baseCache[cut] = (BASE[cut] || BASE.amplifier)();
  const g = baseCache[cut].clone();
  const p = g.getAttribute('position');
  const amt = cut === 'mirror' ? 0.004 : cut === 'geode' ? 0.05 : 0.022;
  const key = (x, y, z) => `${x.toFixed(3)},${y.toFixed(3)},${z.toFixed(3)}`;
  const moved = new Map();
  let idx = 0;
  for (let i = 0; i < p.count; i++) {
    const k = key(p.getX(i), p.getY(i), p.getZ(i));
    if (!moved.has(k)) { const j = idx++; moved.set(k, [(hash01(gemId, j * 3) - 0.5) * amt, (hash01(gemId, j * 3 + 1) - 0.5) * amt, (hash01(gemId, j * 3 + 2) - 0.5) * amt]); }
    const d = moved.get(k);
    p.setXYZ(i, p.getX(i) + d[0], p.getY(i) + d[1], p.getZ(i) + d[2]);
  }
  g.computeVertexNormals();
  return g;
}

export function triangleCount(cut) {
  if (!baseCache[cut]) baseCache[cut] = (BASE[cut] || BASE.amplifier)();
  return baseCache[cut].getAttribute('position').count / 3;
}

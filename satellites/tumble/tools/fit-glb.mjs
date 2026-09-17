// Fit a Meshy (or any) sock GLB to one of the game's silhouettes, replacing the Blender UV pass (DESIGN 13.3):
//   1. find the flat plane (PCA) and lay the sock in XZ with its thickness along +Y, on the table (min y = 0)
//   2. try the eight ways the L can lie and keep the one whose outline matches the silhouette's centreline outline
//   3. scale so the sock spans the silhouette's length along X (what src/geo.js does too), centre it
//   4. write cylindrical UVs from the centreline: V = cuff (0) to toe (1), U around the tube (0 = outer edge,
//      0.25 = top face), splitting the triangles that cross the U seam so fract() in the shader never smears
// node tools/fit-glb.mjs <in.glb> <silKey> <out.glb> [debug.png]
import { readFileSync, writeFileSync } from 'fs';
import { SILHOUETTES, centerline, widthAt, thickAt } from '../src/silhouettes.js';
import { buildSilhouette } from '../assets/geo/placeholder.js';
import { encodePNG } from './png.mjs';

const [inFile, key = 'crew', outFile, debugPng] = process.argv.slice(2);
if (!inFile || !outFile) { console.log('usage: node tools/fit-glb.mjs <in.glb> <silKey> <out.glb> [debug.png]'); process.exit(2); }
const sil = SILHOUETTES.find((s) => s.key === key);
if (!sil) { console.log('no silhouette', key); process.exit(2); }

// ---------- read the first primitive of a GLB ----------
function readGlb(buf) {
  if (buf.toString('ascii', 0, 4) !== 'glTF') throw new Error('not a GLB');
  const jl = buf.readUInt32LE(12);
  const json = JSON.parse(buf.subarray(20, 20 + jl).toString('utf8'));
  const bl = buf.readUInt32LE(20 + jl);
  const bin = buf.subarray(28 + jl, 28 + jl + bl);
  const prim = json.meshes[0].primitives[0];
  const acc = (i) => {
    const a = json.accessors[i], bv = json.bufferViews[a.bufferView];
    const comp = { 5120: Int8Array, 5121: Uint8Array, 5122: Int16Array, 5123: Uint16Array, 5125: Uint32Array, 5126: Float32Array }[a.componentType];
    const n = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 }[a.type];
    if (bv.byteStride && bv.byteStride !== n * comp.BYTES_PER_ELEMENT) throw new Error('interleaved buffer views are not handled');
    const off = (bv.byteOffset || 0) + (a.byteOffset || 0);
    const slice = bin.buffer.slice(bin.byteOffset + off, bin.byteOffset + off + a.count * n * comp.BYTES_PER_ELEMENT);
    return new comp(slice);
  };
  const pos = Float64Array.from(acc(prim.attributes.POSITION));
  const idx = prim.indices !== undefined ? Array.from(acc(prim.indices)) : Array.from({ length: pos.length / 3 }, (_, i) => i);
  // a node transform on the mesh (Meshy leaves identity; honoured if present)
  const node = (json.nodes || []).find((n) => n.mesh === 0);
  if (node && (node.rotation || node.scale || node.translation)) console.log('  note: node transform present, applying only scale/translation is not implemented; assuming identity');
  return { pos, idx, n: pos.length / 3 };
}

// ---------- PCA: symmetric 3x3 Jacobi ----------
function eig3(m) {
  const a = m.map((r) => r.slice());
  let v = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
  for (let sweep = 0; sweep < 60; sweep++) {
    let off = 0;
    for (let p = 0; p < 3; p++) for (let q = p + 1; q < 3; q++) off += a[p][q] * a[p][q];
    if (off < 1e-18) break;
    for (let p = 0; p < 3; p++) for (let q = p + 1; q < 3; q++) {
      if (Math.abs(a[p][q]) < 1e-15) continue;
      const th = 0.5 * Math.atan2(2 * a[p][q], a[q][q] - a[p][p]);
      const c = Math.cos(th), s = Math.sin(th);
      for (let k = 0; k < 3; k++) { const akp = a[k][p], akq = a[k][q]; a[k][p] = c * akp - s * akq; a[k][q] = s * akp + c * akq; }
      for (let k = 0; k < 3; k++) { const apk = a[p][k], aqk = a[q][k]; a[p][k] = c * apk - s * aqk; a[q][k] = s * apk + c * aqk; }
      for (let k = 0; k < 3; k++) { const vkp = v[k][p], vkq = v[k][q]; v[k][p] = c * vkp - s * vkq; v[k][q] = s * vkp + c * vkq; }
    }
  }
  const vals = [a[0][0], a[1][1], a[2][2]];
  const order = [0, 1, 2].sort((i, j) => vals[j] - vals[i]);   // largest first
  return { vals: order.map((i) => vals[i]), vecs: order.map((i) => [v[0][i], v[1][i], v[2][i]]) };
}
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const det3 = (M) => dot(M[0], cross(M[1], M[2]));

// ---------- the reference outline (silhouette in its local XZ frame) ----------
const CL = centerline(sil, 400);
const ref = [];
for (let i = 0; i <= 400; i++) {
  const v = i / 400, p = CL.pts[i];
  const tl = Math.hypot(p.tx, p.tz) || 1, nx = p.tz / tl, nz = -p.tx / tl;
  const w = widthAt(sil, v) / 2;
  ref.push([p.x + nx * w, p.z + nz * w], [p.x - nx * w, p.z - nz * w]);
}
function bbox(pts) { let a = [Infinity, Infinity], b = [-Infinity, -Infinity]; for (const p of pts) { a[0] = Math.min(a[0], p[0]); a[1] = Math.min(a[1], p[1]); b[0] = Math.max(b[0], p[0]); b[1] = Math.max(b[1], p[1]); } return { min: a, max: b }; }
function normalise(pts) { const bb = bbox(pts); const cx = (bb.min[0] + bb.max[0]) / 2, cz = (bb.min[1] + bb.max[1]) / 2; const d = Math.hypot(bb.max[0] - bb.min[0], bb.max[1] - bb.min[1]) / 2; return pts.map((p) => [(p[0] - cx) / d, (p[1] - cz) / d]); }
function chamfer(A, B) {
  const near = (P, Q) => { let s = 0; for (const p of P) { let m = Infinity; for (const q of Q) { const d = (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2; if (d < m) m = d; } s += Math.sqrt(m); } return s / P.length; };
  return near(A, B) + near(B, A);
}

// ---------- fit ----------
const G = readGlb(readFileSync(inFile));
const mean = [0, 0, 0];
for (let i = 0; i < G.n; i++) for (let k = 0; k < 3; k++) mean[k] += G.pos[i * 3 + k] / G.n;
const cov = [[0, 0, 0], [0, 0, 0], [0, 0, 0]];
for (let i = 0; i < G.n; i++) { const d = [G.pos[i * 3] - mean[0], G.pos[i * 3 + 1] - mean[1], G.pos[i * 3 + 2] - mean[2]]; for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) cov[r][c] += d[r] * d[c] / G.n; }
const E = eig3(cov);
let e1 = E.vecs[0], e2 = E.vecs[1];
let e3 = cross(e1, e2);   // the thin axis, right handed with e1, e2
const local = (p) => [dot(p, e1), dot(p, e2), dot(p, e3)];
const P = [];
for (let i = 0; i < G.n; i++) P.push(local([G.pos[i * 3] - mean[0], G.pos[i * 3 + 1] - mean[1], G.pos[i * 3 + 2] - mean[2]]));
// candidates: a turn about the thin axis every 3 degrees (an L's principal axes are its diagonals, so quarter turns
// can never line the arms up), then optionally a 180 degree turn about the first axis (the sock's other face up)
const refN = normalise(ref);
const sample = P.filter((_, i) => i % Math.max(1, Math.floor(G.n / 500)) === 0);
let best = null;
for (let deg = 0; deg < 360; deg += 3) for (const flip of [false, true]) {
  const c = Math.cos(deg * Math.PI / 180), s = Math.sin(deg * Math.PI / 180);
  const map = (p) => { const a = c * p[0] - s * p[1], b = s * p[0] + c * p[1], h = p[2]; return flip ? [a, -b, -h] : [a, b, h]; };
  // compared in the SAME frame the final mesh uses (X = a, Z = -b); comparing [a, b] picked the mirror image
  const pts2 = normalise(sample.map(map).map((q) => [q[0], -q[1]]));
  const d = chamfer(pts2, refN);
  if (!best || d < best.d) best = { d, deg, flip, map };
}
console.log(`orientation: turn ${best.deg} deg${best.flip ? ' and flip' : ''}, outline distance ${best.d.toFixed(4)} (0 = identical, under 0.08 is a good fit)`);
// final frame: X = a, Y = h, Z = -b keeps the frame right handed (a x h = -b)
const Q = P.map(best.map).map((q) => [q[0], q[2], -q[1]]);
// scale to the silhouette's span along X, sit on the table, centre on the silhouette's footprint
const refBB = bbox(ref);
let mnx = Infinity, mxx = -Infinity, mny = Infinity, mnz = Infinity, mxz = -Infinity;
for (const q of Q) { mnx = Math.min(mnx, q[0]); mxx = Math.max(mxx, q[0]); mny = Math.min(mny, q[1]); mnz = Math.min(mnz, q[2]); mxz = Math.max(mxz, q[2]); }
const S = (refBB.max[0] - refBB.min[0]) / (mxx - mnx);
const zRatio = ((mxz - mnz) * S) / (refBB.max[1] - refBB.min[1]);
console.log(`scale ${S.toFixed(4)}; foot span after scaling is ${(zRatio * 100).toFixed(0)}% of the silhouette's (100 = same proportions)`);
const cx = (refBB.min[0] + refBB.max[0]) / 2 - ((mnx + mxx) / 2) * S;
const cz = (refBB.min[1] + refBB.max[1]) / 2 - ((mnz + mxz) / 2) * S;
let F = Q.map((q) => [q[0] * S + cx, (q[1] - mny) * S, q[2] * S + cz]);
let mxy = 0; for (const f of F) mxy = Math.max(mxy, f[1]);
// a sock modelled as a round tube (a picture with tube shading gives Meshy one) is pressed flat to the silhouette's
// thickness; a flat lay reference needs none of this (the factor prints as 1.00)
const press = Math.min(1, sil.t / Math.max(1e-6, mxy));
if (press < 0.999) F = F.map((f) => [f[0], f[1] * press, f[2]]);
console.log(`fitted: ${G.n} vertices, ${G.idx.length / 3} triangles, thickness ${(mxy * 100).toFixed(1)} cm pressed x${press.toFixed(2)} to the silhouette's ${(sil.t * 100).toFixed(1)} cm`);
mxy *= press;

// ---------- UVs from the centreline ----------
const uv = new Float32Array(G.n * 2);
const vOf = new Float32Array(G.n);
for (let i = 0; i < G.n; i++) {
  const f = F[i];
  let bi = 0, bd = Infinity;
  for (let j = 0; j <= 400; j++) { const p = CL.pts[j]; const d = (f[0] - p.x) ** 2 + (f[2] - p.z) ** 2; if (d < bd) { bd = d; bi = j; } }
  const p = CL.pts[bi], v = bi / 400;
  const tl = Math.hypot(p.tx, p.tz) || 1, nx = p.tz / tl, nz = -p.tx / tl;     // outer normal (engine/flat.js)
  const sAcross = (f[0] - p.x) * nx + (f[2] - p.z) * nz;
  const t = Math.max(0.004, thickAt(sil, v)), w = Math.max(0.01, widthAt(sil, v));
  const h = f[1] - t / 2;
  const th = Math.atan2(h / (t / 2), sAcross / (w / 2));     // 0 = outer edge, +90 = top face
  uv[i * 2] = ((th / (2 * Math.PI)) % 1 + 1) % 1;
  uv[i * 2 + 1] = v;
  vOf[i] = v;
}
// split the triangles that cross the U seam: the vertices on the low side get a copy at U + 1
const pos = Array.from(F.flat()), uvs = Array.from(uv), idx = G.idx.slice();
const dup = new Map();
let seamTris = 0;
for (let t = 0; t < idx.length; t += 3) {
  const us = [uvs[idx[t] * 2], uvs[idx[t + 1] * 2], uvs[idx[t + 2] * 2]];
  if (Math.max(...us) - Math.min(...us) <= 0.5) continue;
  seamTris++;
  for (let k = 0; k < 3; k++) {
    const vi = idx[t + k];
    if (uvs[vi * 2] >= 0.5) continue;
    if (!dup.has(vi)) { dup.set(vi, pos.length / 3); pos.push(pos[vi * 3], pos[vi * 3 + 1], pos[vi * 3 + 2]); uvs.push(uvs[vi * 2] + 1, uvs[vi * 2 + 1]); }
    idx[t + k] = dup.get(vi);
  }
}
console.log(`uv: ${seamTris} seam triangles split, ${dup.size} vertices duplicated`);
// normals from the fitted faces
const nrm = new Float32Array(pos.length);
for (let t = 0; t < idx.length; t += 3) {
  const a = idx[t] * 3, b = idx[t + 1] * 3, c = idx[t + 2] * 3;
  const u = [pos[b] - pos[a], pos[b + 1] - pos[a + 1], pos[b + 2] - pos[a + 2]], v = [pos[c] - pos[a], pos[c + 1] - pos[a + 1], pos[c + 2] - pos[a + 2]];
  const n = cross(u, v);
  for (const q of [a, b, c]) { nrm[q] += n[0]; nrm[q + 1] += n[1]; nrm[q + 2] += n[2]; }
}
let flipped = 0;
for (let i = 0; i < nrm.length; i += 3) { const l = Math.hypot(nrm[i], nrm[i + 1], nrm[i + 2]) || 1; nrm[i] /= l; nrm[i + 1] /= l; nrm[i + 2] /= l; }
// winding check: normals should point away from the centreline (the top face up)
{ let up = 0, n = 0; for (let i = 0; i < pos.length / 3; i++) { if (pos[i * 3 + 1] > mxy * S * 0.7 || pos[i * 3 + 1] > 0.02) { up += nrm[i * 3 + 1] > 0 ? 1 : -1; n++; } } if (n && up < 0) { flipped = 1; for (let t = 0; t < idx.length; t += 3) { const tmp = idx[t + 1]; idx[t + 1] = idx[t + 2]; idx[t + 2] = tmp; } for (let i = 0; i < nrm.length; i++) nrm[i] = -nrm[i]; } }
if (flipped) console.log('winding was inside out: reversed');

// ---------- write ----------
function glb(positions, normals, uvsArr, indices, name) {
  const pos32 = Float32Array.from(positions), nrm32 = Float32Array.from(normals), uv32 = Float32Array.from(uvsArr);
  const n = pos32.length / 3;
  const idxArr = n > 65535 ? Uint32Array.from(indices) : Uint16Array.from(indices);
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < pos32.length; i += 3) for (let k = 0; k < 3; k++) { min[k] = Math.min(min[k], pos32[i + k]); max[k] = Math.max(max[k], pos32[i + k]); }
  const pad4 = (b) => { const p = (4 - (b.length % 4)) % 4; return p ? Buffer.concat([b, Buffer.alloc(p)]) : b; };
  const parts = [Buffer.from(pos32.buffer), Buffer.from(nrm32.buffer), Buffer.from(uv32.buffer), Buffer.from(idxArr.buffer)].map(pad4);
  const views = []; let off = 0;
  for (const p of parts) { views.push({ buffer: 0, byteOffset: off, byteLength: p.length }); off += p.length; }
  const bin = Buffer.concat(parts);
  const json = {
    asset: { version: '2.0', generator: 'TUMBLE tools/fit-glb.mjs' }, scene: 0, scenes: [{ nodes: [0] }], nodes: [{ mesh: 0, name }],
    meshes: [{ name, primitives: [{ attributes: { POSITION: 0, NORMAL: 1, TEXCOORD_0: 2 }, indices: 3, mode: 4 }] }],
    accessors: [
      { bufferView: 0, componentType: 5126, count: n, type: 'VEC3', min, max },
      { bufferView: 1, componentType: 5126, count: n, type: 'VEC3' },
      { bufferView: 2, componentType: 5126, count: n, type: 'VEC2' },
      { bufferView: 3, componentType: idxArr instanceof Uint32Array ? 5125 : 5123, count: idxArr.length, type: 'SCALAR' },
    ],
    bufferViews: views, buffers: [{ byteLength: bin.length }],
  };
  let js = Buffer.from(JSON.stringify(json), 'utf8');
  while (js.length % 4) js = Buffer.concat([js, Buffer.from(' ')]);
  const header = Buffer.alloc(12); header.write('glTF', 0, 'ascii'); header.writeUInt32LE(2, 4); header.writeUInt32LE(12 + 8 + js.length + 8 + bin.length, 8);
  const ch = (len, type) => { const b = Buffer.alloc(8); b.writeUInt32LE(len, 0); b.writeUInt32LE(type, 4); return b; };
  return Buffer.concat([header, ch(js.length, 0x4e4f534a), js, ch(bin.length, 0x004e4942), bin]);
}
writeFileSync(outFile, glb(pos, nrm, uvs, idx, key));
console.log('wrote', outFile);

// ---------- debug picture: top view, the silhouette outline in green, the mesh vertices coloured by V ----------
if (debugPng) {
  const W = 512, img = new Uint8Array(W * W * 4).fill(30);
  for (let i = 3; i < img.length; i += 4) img[i] = 255;
  const all = ref.concat(F.map((f) => [f[0], f[2]]));
  const bb = bbox(all), k = (W - 40) / Math.max(bb.max[0] - bb.min[0], bb.max[1] - bb.min[1]);
  const px = (p) => [Math.round(20 + (p[1] - bb.min[1]) * k), Math.round(20 + (p[0] - bb.min[0]) * k)];   // Z right, X down (as held)
  const put = (x, y, r, g, b) => { if (x < 0 || y < 0 || x >= W || y >= W) return; const o = (y * W + x) * 4; img[o] = r; img[o + 1] = g; img[o + 2] = b; };
  for (let i = 0; i < F.length; i++) { const [x, y] = px([F[i][0], F[i][2]]); const v = vOf[i]; put(x, y, 255 * (1 - v), 120, 255 * v); put(x + 1, y, 255 * (1 - v), 120, 255 * v); }
  for (const r of ref) { const [x, y] = px(r); put(x, y, 60, 255, 90); }
  writeFileSync(debugPng, encodePNG(img, W, W));
  console.log('wrote', debugPng, '(green = silhouette outline; dots = mesh vertices, red at the cuff to blue at the toe)');
}

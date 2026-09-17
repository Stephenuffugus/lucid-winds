// Procedural stand-ins for the eight Meshy silhouettes (DESIGN 14, OPUS_PROMPT "Assets you do not have yet").
// Pure data: no three.js, so Node tests can build and inspect them.
//
// UV contract (the same one the Blender pass must produce, DESIGN 13.3):
//   U runs around the tube, 0 at the outer edge (heel side), 0.25 on the top face.
//   V runs from the cuff (0) to the toe (1).
// Mask contract: R = heel, G = toe, B = cuff, 0..255 with soft edges.

import { SILHOUETTES, centerline, widthAt, thickAt } from '../../src/silhouettes.js';

export const MASK_SIZE = 256;
const RING = 14;   // vertices around (plus a seam duplicate)
const ALONG = 38;  // rings along the centerline

function superCos(a, p) { const c = Math.cos(a); return Math.sign(c) * Math.pow(Math.abs(c), 2 / p); }
function superSin(a, p) { const s = Math.sin(a); return Math.sign(s) * Math.pow(Math.abs(s), 2 / p); }
const gauss = (x, w) => Math.exp(-(x * x) / (w * w));

export function buildSilhouette(sil) {
  const cl = centerline(sil, ALONG);
  const pos = [], nrm = [], uv = [], shade = [];
  const TAU = Math.PI * 2;
  const heel = cl.heelS;
  // ---- outer tube
  for (let i = 0; i <= ALONG; i++) {
    const c = cl.pts[i];
    const v = c.v;
    const nx = c.tz, nz = -c.tx; // outer in-plane normal
    const w = widthAt(sil, v) / 2;
    const t = thickAt(sil, v) / 2;
    for (let j = 0; j <= RING; j++) {
      const u = j / RING;
      const a = u * TAU;
      const co = superCos(a, 2.7), si = superSin(a, 2.4);
      let rx = w * co;
      let ry = t * si;
      // heel cup: a bulge on the outer edge around the bend
      const outer = Math.max(0, Math.cos(a));
      rx += 0.011 * gauss(v - heel, 0.07) * outer * outer;
      ry *= 1 + 0.18 * gauss(v - heel, 0.08) * outer;
      // relaxed fabric: soft wrinkles, stronger on the leg
      const wr = (0.10 + 0.08 * (1 - v)) * t;
      ry += Math.abs(si) > 0.3 ? wr * Math.sin(v * 31 + (si > 0 ? 0.6 : 2.1)) * Math.sin(u * TAU * 1 + v * 9) * 0.5 : 0;
      // rolled cuff on the slipper
      if (sil.rolled && v < sil.cuff) { const k = Math.sin(Math.PI * v / sil.cuff); rx += 0.006 * k * Math.sign(co); ry += 0.008 * k * Math.sign(si); }
      // novelty ridge along the top of the leg, plus two ear bumps by the cuff
      if (sil.fin && v > 0.03 && v < heel) {
        ry += 0.007 * gauss(a - Math.PI / 2, 0.28) * Math.sin(Math.PI * (v - 0.03) / (heel - 0.03));
        rx -= 0.010 * gauss(a - Math.PI, 0.35) * (gauss(v - 0.08, 0.03) + gauss(v - 0.17, 0.03));
      }
      // toe sock: four grooves across the toe box
      if (sil.toes && v > sil.toeV - 0.06) {
        const k = Math.min(1, (v - (sil.toeV - 0.06)) / 0.06);
        const g = Math.pow(Math.abs(Math.sin(co * Math.PI * 2.5 + Math.PI / 2)), 6);
        ry *= 1 - 0.45 * k * g;
      }
      pos.push(c.x + nx * rx, ry + thickAt(sil, v) / 2 + 0.001, c.z + nz * rx);
      nrm.push(0, 0, 0);
      uv.push(u, v);
      shade.push(1);
    }
  }
  const idx = [];
  const W = RING + 1;
  for (let i = 0; i < ALONG; i++) {
    for (let j = 0; j < RING; j++) {
      const a = i * W + j, b = a + 1, c2 = a + W, d = c2 + 1;
      idx.push(a, b, c2, b, d, c2);
    }
  }
  // ---- cuff lip: a folded rim and a dark inner throat so the opening never shows the void
  const c0 = cl.pts[0];
  const nx0 = c0.tz, nz0 = -c0.tx;
  const lipStart = pos.length / 3;
  const lipRings = [
    { s: 0.93, d: 0.000, shade: 0.78 },
    { s: 0.86, d: 0.012, shade: 0.45 },
    { s: 0.70, d: 0.030, shade: 0.22 },
  ];
  const w0 = widthAt(sil, 0) / 2, t0 = thickAt(sil, 0) / 2;
  for (const L of lipRings) {
    for (let j = 0; j <= RING; j++) {
      const u = j / RING, a = u * TAU;
      const rx = w0 * superCos(a, 2.7) * L.s;
      const ry = t0 * superSin(a, 2.4) * L.s;
      pos.push(c0.x + nx0 * rx + c0.tx * L.d, ry + t0 + 0.001, c0.z + nz0 * rx + c0.tz * L.d);
      nrm.push(0, 0, 0);
      uv.push(u, 0.004);
      shade.push(L.shade);
    }
  }
  // connect outer ring 0 -> lip ring 0 -> lip ring 1 -> lip ring 2
  const rings = [0, lipStart, lipStart + W, lipStart + 2 * W];
  for (let r = 0; r < rings.length - 1; r++) {
    for (let j = 0; j < RING; j++) {
      const a = rings[r] + j, b = a + 1, c2 = rings[r + 1] + j, d = c2 + 1;
      idx.push(a, c2, b, b, c2, d);
    }
  }
  // throat cap
  const capC = pos.length / 3;
  pos.push(c0.x + c0.tx * 0.034, t0 + 0.001, c0.z + c0.tz * 0.034); nrm.push(0, 0, 0); uv.push(0.5, 0.004); shade.push(0.15);
  for (let j = 0; j < RING; j++) idx.push(rings[3] + j, capC, rings[3] + j + 1);
  // toe tip cap (the last ring is nearly a point already)
  const tipC = pos.length / 3;
  const cl1 = cl.pts[ALONG];
  pos.push(cl1.x + cl1.tx * 0.002, thickAt(sil, 1) / 2 + 0.001, cl1.z + cl1.tz * 0.002); nrm.push(0, 0, 0); uv.push(0.5, 1); shade.push(1);
  for (let j = 0; j < RING; j++) idx.push(ALONG * W + j, ALONG * W + j + 1, tipC);

  computeNormals(pos, nrm, idx);
  // seam: average duplicated seam normals on the outer tube
  for (let i = 0; i <= ALONG; i++) {
    const a = i * W, b = a + RING;
    for (let k = 0; k < 3; k++) { const m = (nrm[a * 3 + k] + nrm[b * 3 + k]) / 2; nrm[a * 3 + k] = m; nrm[b * 3 + k] = m; }
  }
  normalize(nrm);
  return {
    key: sil.key,
    positions: new Float32Array(pos),
    normals: new Float32Array(nrm),
    uvs: new Float32Array(uv),
    shade: new Float32Array(shade),
    indices: new Uint16Array(idx),
    heelS: heel,
    length: cl.length,
    circumference: approxCircumference(sil),
  };
}

function computeNormals(pos, nrm, idx) {
  for (let i = 0; i < idx.length; i += 3) {
    const a = idx[i] * 3, b = idx[i + 1] * 3, c = idx[i + 2] * 3;
    const ux = pos[b] - pos[a], uy = pos[b + 1] - pos[a + 1], uz = pos[b + 2] - pos[a + 2];
    const vx = pos[c] - pos[a], vy = pos[c + 1] - pos[a + 1], vz = pos[c + 2] - pos[a + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    for (const o of [a, b, c]) { nrm[o] += nx; nrm[o + 1] += ny; nrm[o + 2] += nz; }
  }
}
function normalize(n) {
  for (let i = 0; i < n.length; i += 3) {
    const l = Math.hypot(n[i], n[i + 1], n[i + 2]) || 1;
    n[i] /= l; n[i + 1] /= l; n[i + 2] /= l;
  }
}
function approxCircumference(s) {
  const a = s.w / 2, b = s.t / 2;
  return Math.PI * (3 * (a + b) - Math.sqrt((3 * a + b) * (a + 3 * b)));
}

// Mask for a silhouette in the tile's UV space. R heel, G toe, B cuff.
export function buildMask(sil, size = MASK_SIZE) {
  const cl = centerline(sil, 40);
  const heel = cl.heelS;
  const out = new Uint8ClampedArray(size * size * 4);
  const smooth = (e0, e1, x) => { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
  const heelHalf = 0.075 * (0.34 / cl.length) ** 0.5;
  for (let y = 0; y < size; y++) {
    const v = (y + 0.5) / size;
    for (let x = 0; x < size; x++) {
      const u = (x + 0.5) / size;
      const outer = Math.cos(u * Math.PI * 2); // 1 at the outer edge
      const heelR = smooth(heelHalf, heelHalf * 0.7, Math.abs(v - heel)) * smooth(-0.15, 0.1, outer);
      const toeG = smooth(sil.toeV - 0.03, sil.toeV + 0.005, v);
      const cuffB = smooth(sil.cuff + 0.005, sil.cuff - 0.012, v);
      const o = (y * size + x) * 4;
      out[o] = Math.round(heelR * 255);
      out[o + 1] = Math.round(toeG * 255);
      out[o + 2] = Math.round(cuffB * 255);
      out[o + 3] = 255;
    }
  }
  return out;
}

export function buildAll() {
  return SILHOUETTES.map((s) => ({ ...buildSilhouette(s), mask: buildMask(s) }));
}

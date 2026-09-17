// Flat sock picture: a painted tile wrapped onto the silhouette as a held sock shows it
// (cuff up, foot to the right). Pure RGBA in, RGBA out, so the Drawer, the results cards,
// the share card, the icons and the hero preview sheet all draw socks the same way.

import { SILHOUETTES, centerline, widthAt } from '../src/silhouettes.js';

// render(tile, tileSize, silId, opts) -> { rgba, w, h }
//   opts: { size (px of the longer side), bg [r,g,b,a], insideOut, scale, pad }
export function renderFlat(tile, tileSize, silId, opts = {}) {
  const sil = SILHOUETTES[silId];
  const cl = centerline(sil, 80);
  const pts = cl.pts;
  // screen mapping: local X (leg) -> down, local Z (foot) -> right
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  const half = sil.w / 2 * 1.05;
  for (const p of pts) {
    minX = Math.min(minX, p.z - half); maxX = Math.max(maxX, p.z + half);
    minY = Math.min(minY, p.x - half); maxY = Math.max(maxY, p.x + half);
  }
  const size = opts.size || 128;
  const pad = opts.pad === undefined ? 0.06 : opts.pad;
  const span = Math.max(maxX - minX, maxY - minY) * (1 + pad * 2);
  const W = opts.w || size, H = opts.h || size;
  const k = Math.min(W, H) / span * (opts.scale || 1);
  const ox = W / 2 - ((minX + maxX) / 2) * k, oy = H / 2 - ((minY + maxY) / 2) * k;
  const rgba = new Uint8ClampedArray(W * H * 4);
  if (opts.bg) for (let i = 0; i < W * H; i++) rgba.set(opts.bg, i * 4);
  const depth = new Float32Array(W * H).fill(-1);
  // splat a dense (v, s) grid; later samples along the leg overwrite where the heel folds
  const nv = Math.ceil((cl.length * k) * 2.2), ns = Math.ceil(sil.w * k * 2.4);
  for (let iv = 0; iv <= nv; iv++) {
    const v = iv / nv;
    const f = v * (pts.length - 1);
    const i0 = Math.min(pts.length - 2, Math.floor(f)), t = f - i0;
    const a = pts[i0], b = pts[i0 + 1];
    const cx = a.x + (b.x - a.x) * t, cz = a.z + (b.z - a.z) * t;
    let tx = a.tx + (b.tx - a.tx) * t, tz = a.tz + (b.tz - a.tz) * t;
    const tl = Math.hypot(tx, tz) || 1; tx /= tl; tz /= tl;
    const nx = tz, nz = -tx; // outer normal
    const w = widthAt(sil, v) / 2;
    for (let is = 0; is <= ns; is++) {
      const sn = is / ns * 2 - 1; // -1 inner edge .. +1 outer edge
      const s = sn * w;
      const X = cx + nx * s, Z = cz + nz * s;
      const px = Math.round(Z * k + ox), py = Math.round(X * k + oy);
      if (px < 0 || py < 0 || px >= W || py >= H) continue;
      // visible face U = 0.75, +U toward the outer edge
      const u = 0.75 + 0.25 * sn;
      const tu = Math.min(tileSize - 1, Math.floor(((u % 1) + 1) % 1 * tileSize));
      const tv = Math.min(tileSize - 1, Math.floor(v * tileSize));
      const ti = (tv * tileSize + tu) * 4;
      // soft roundness: darker toward the edges, a highlight along the upper third
      const edge = 1 - Math.pow(Math.abs(sn), 3) * 0.35;
      const hi = 1 + 0.08 * Math.exp(-Math.pow((sn + 0.35) / 0.25, 2));
      let r = tile[ti], g = tile[ti + 1], bb = tile[ti + 2];
      if (opts.insideOut) { const l = r * 0.3 + g * 0.59 + bb * 0.11; r = (l + (r - l) * 0.22) * 0.72 + 40; g = (l + (g - l) * 0.22) * 0.72 + 40; bb = (l + (bb - l) * 0.22) * 0.72 + 40; }
      const shade = edge * hi;
      const o = (py * W + px) * 4;
      rgba[o] = r * shade; rgba[o + 1] = g * shade; rgba[o + 2] = bb * shade; rgba[o + 3] = 255;
      depth[py * W + px] = v;
      // fill the pixel to the right and below so the splat has no pinholes
      if (px + 1 < W && depth[py * W + px + 1] < 0) { rgba.copyWithin(o + 4, o, o + 4); }
      if (py + 1 < H && depth[(py + 1) * W + px] < 0) { rgba.copyWithin(o + W * 4, o, o + 4); }
    }
  }
  // cuff opening: a darker lip along the first rows
  return { rgba, w: W, h: H };
}

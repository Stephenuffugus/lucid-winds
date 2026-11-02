'use strict';
/* The capture oracle (BUILD-PLAN.md T0.5b, H-cap-1): a pure area average downscale and a PNG reader, Node built ins only.
 * test/make.mjs compares the page's canvas path against downscaleRGB on a synthetic gradient (within 2 per channel: a
 * bounded drift check, not a determinism claim, since capture is not cross device deterministic by design, risk 12);
 * harness.js holds the oracle itself to known answers (H-cap-0). One copy, shared, so the gate and the harness cannot
 * disagree about what "the area average" is.
 *
 *   const { readPNG, downscaleRGB, normalizeRGB } = require('./tools/capture-oracle.js');
 *   downscaleRGB({ w, h, bpp, px }, 24, 48)   -> Uint8Array of 24 * 48 * 3, row major, each cell its source block's mean
 *   normalizeRGB(grid)                         -> the capture normalisation of that grid (Q182), the page's step before
 *                                                 nearest: H-norm-1 and the capture gate hold it to the page byte for byte */
const zlib = require('node:zlib'), fs = require('node:fs');

/* 8 bit RGB or RGBA, non interlaced (what Chrome writes); the five PNG filters */
function readPNG(path) {
  const buf = fs.readFileSync(path); let pos = 8, w = 0, h = 0, ct = 0, depth = 0, lace = 0; const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos), type = buf.toString('ascii', pos + 4, pos + 8), d = buf.subarray(pos + 8, pos + 8 + len);
    if (type === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); depth = d[8]; ct = d[9]; lace = d[12]; }
    else if (type === 'IDAT') idat.push(d);
    else if (type === 'IEND') break;
    pos += 12 + len;
  }
  if (depth !== 8 || lace !== 0 || (ct !== 2 && ct !== 6)) throw new Error('readPNG: 8 bit RGB or RGBA, non interlaced only');
  const bpp = ct === 6 ? 4 : 3, raw = zlib.inflateSync(Buffer.concat(idat)), stride = w * bpp, px = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], src = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)), row = px.subarray(y * stride, (y + 1) * stride);
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? row[i - bpp] : 0, b = y ? px[(y - 1) * stride + i] : 0, c = (i >= bpp && y) ? px[(y - 1) * stride + i - bpp] : 0;
      let v = src[i];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      row[i] = v & 255;
    }
  }
  return { w, h, bpp, px };
}

/* the area average: the image divided into W x H blocks by the integer part of each block's edges, each cell the
   rounded mean of its block (the whole image is the crop: the gate's photos are exactly 1:2) */
function downscaleRGB(img, W, H) {
  const out = new Uint8Array(W * H * 3);
  for (let cy = 0; cy < H; cy++) for (let cx = 0; cx < W; cx++) {
    const x0 = Math.floor(cx * img.w / W), x1 = Math.floor((cx + 1) * img.w / W), y0 = Math.floor(cy * img.h / H), y1 = Math.floor((cy + 1) * img.h / H);
    const s = [0, 0, 0]; let n = 0;
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
      const i = (y * img.w + x) * img.bpp; s[0] += img.px[i]; s[1] += img.px[i + 1]; s[2] += img.px[i + 2]; n++;
    }
    for (let k = 0; k < 3; k++) out[(cy * W + cx) * 3 + k] = Math.round(s[k] / n);
  }
  return out;
}

/* the capture normalisation (QUESTIONS Q182): the step shell-capture's C.normalize takes between the area average and
   nearest, written again here from its definition so the page and Node are held to each other (H-norm-1 on Node grids,
   the capture gate on the page's own canvas grid, both byte for byte): a half strength grey world white balance, then
   the luminance stretched so its 10th and 90th percentiles over the cells land on 40 and 224, each cell scaled by its
   new L over its old; the gain at most 4, and as it is held back the window's centre slides from 132 toward the
   photo's own (lo + hi) / 2, in proportion. The same arithmetic in the same order as the page, so the doubles round
   the same way.
     normalizeRGB(rgb) -> a new Uint8Array the length of rgb (any whole number of RGB triples) */
const NORM = Object.freeze({ WB: 0.5, P_LO: 0.1, P_HI: 0.9, L_LO: 40, L_HI: 224, MAX_GAIN: 4 });
function normalizeRGB(rgb) {
  const n = rgb.length / 3, out = new Uint8Array(rgb.length), t = new Float64Array(rgb.length), L = new Float64Array(n), sum = [0, 0, 0];
  for (let i = 0; i < n; i++) for (let c = 0; c < 3; c++) sum[c] += rgb[3 * i + c];
  const mean = (sum[0] + sum[1] + sum[2]) / 3, k = sum.map(s => (s > 0 ? 1 - NORM.WB + NORM.WB * mean / s : 1));
  for (let i = 0; i < n; i++) {
    for (let c = 0; c < 3; c++) t[3 * i + c] = rgb[3 * i + c] * k[c];
    L[i] = 0.299 * t[3 * i] + 0.587 * t[3 * i + 1] + 0.114 * t[3 * i + 2];
  }
  const sorted = Float64Array.from(L).sort(), lo = sorted[Math.floor(NORM.P_LO * n)], hi = sorted[Math.floor(NORM.P_HI * n)];
  const full = (NORM.L_HI - NORM.L_LO) / Math.max(1, hi - lo), gain = Math.min(full, NORM.MAX_GAIN);
  const mid = (lo + hi) / 2, target = (NORM.L_LO + NORM.L_HI) / 2, centre = target + (mid - target) * (1 - gain / full);
  for (let i = 0; i < n; i++) {
    const f = L[i] > 0 ? (centre + (L[i] - mid) * gain) / L[i] : 1;
    for (let c = 0; c < 3; c++) out[3 * i + c] = Math.max(0, Math.min(255, Math.round(t[3 * i + c] * f)));
  }
  return out;
}

module.exports = { readPNG, downscaleRGB, normalizeRGB, NORM };

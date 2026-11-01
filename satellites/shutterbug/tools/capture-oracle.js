'use strict';
/* The capture oracle (BUILD-PLAN.md T0.5b, H-cap-1): a pure area average downscale and a PNG reader, Node built ins only.
 * test/make.mjs compares the page's canvas path against downscaleRGB on a synthetic gradient (within 2 per channel: a
 * bounded drift check, not a determinism claim, since capture is not cross device deterministic by design, risk 12);
 * harness.js holds the oracle itself to known answers (H-cap-0). One copy, shared, so the gate and the harness cannot
 * disagree about what "the area average" is.
 *
 *   const { readPNG, downscaleRGB } = require('./tools/capture-oracle.js');
 *   downscaleRGB({ w, h, bpp, px }, 24, 48)   -> Uint8Array of 24 * 48 * 3, row major, each cell its source block's mean */
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

module.exports = { readPNG, downscaleRGB };

/* The hue vote's oracle (QUESTIONS Q220): the biome from a grid's averaged RGB, written apart from the page's
   SB.capture.hueVote (which never computes a hue: it cross multiplies inside each sector), from the investigation's
   prototype (rgbBiome in /home/codespace/sb-drafts/sameness/colour/analyze.js) with the bright room rule first. K is
   the page's SB.capture.HUE (H-hue-1 holds its numbers to the ones written here). Returns the biome index 0..4. */
const HUE_K = Object.freeze({ FROST_L: 170, ATTIC_LO: 15, GREEN_LO: 70, DEEP_LO: 170, EMBER_LO: 285, C_MIN: 12, S_MIN: 9, WARM_C_MIN: 16, WARM_S_MIN: 30, MIN_PCT: 10 });
function hueVoteRGB(rgb, K) {
  K = K || HUE_K;
  const n = rgb.length / 3, votes = [0, 0, 0, 0, 0];
  let lum = 0, voters = 0;
  for (let i = 0; i < n; i++) lum += (299 * rgb[3 * i] + 587 * rgb[3 * i + 1] + 114 * rgb[3 * i + 2]) / 1000;
  if (lum / n > K.FROST_L) return 1;
  for (let i = 0; i < n; i++) {
    const r = rgb[3 * i], g = rgb[3 * i + 1], b = rgb[3 * i + 2], mx = Math.max(r, g, b), c = mx - Math.min(r, g, b);
    if (c === 0) continue;
    let h = mx === r ? 60 * (g - b) / c : mx === g ? 60 * (b - r) / c + 120 : 60 * (r - g) / c + 240;
    if (h < 0) h += 360;
    const band = h < K.ATTIC_LO || h >= K.EMBER_LO ? 4 : h < K.GREEN_LO ? 0 : h < K.DEEP_LO ? 3 : 2;
    const s100 = 100 * c / mx;
    if (band === 0 ? c < K.WARM_C_MIN || s100 < K.WARM_S_MIN : c < K.C_MIN || s100 < K.S_MIN) continue;
    votes[band]++; voters++;
  }
  if (voters * 100 < K.MIN_PCT * n) return 0;
  let best = 0;
  for (const b of [4, 2, 3]) if (votes[b] > votes[best]) best = b;
  return best;
}
module.exports.hueVoteRGB = hueVoteRGB;
module.exports.HUE_K = HUE_K;

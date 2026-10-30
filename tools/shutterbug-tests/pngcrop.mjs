#!/usr/bin/env node
/* Crop a region of a PNG shot and enlarge it by nearest neighbour, so real device pixels can be LOOKED at (the image
 * reader shows a whole phone shot downscaled, which hides one pixel effects). Node built ins only (zlib).
 *
 *   node tools/shutterbug-tests/pngcrop.mjs <in.png> <out.png> <x> <y> <w> <h> [scale]
 *   x, y, w, h are in the PNG's own pixels (device pixels); scale defaults to 4.
 * Reads 8 bit RGB or RGBA, non interlaced (what Chrome writes). */
import { readFileSync, writeFileSync } from 'node:fs';
import zlib from 'node:zlib';

const [inp, out, X, Y, W, H, S] = process.argv.slice(2);
if (!H) { console.error('usage: pngcrop.mjs in.png out.png x y w h [scale]'); process.exit(2); }
const [x0, y0, cw, ch, scale] = [X, Y, W, H, S || 4].map(Number);
const buf = readFileSync(inp);
let pos = 8, width = 0, height = 0, ctype = 0;
const idat = [];
while (pos < buf.length) {
  const len = buf.readUInt32BE(pos), type = buf.toString('ascii', pos + 4, pos + 8), data = buf.subarray(pos + 8, pos + 8 + len);
  if (type === 'IHDR') { width = data.readUInt32BE(0); height = data.readUInt32BE(4); ctype = data[9]; if (data[8] !== 8 || data[12] !== 0) throw new Error('8 bit, non interlaced only'); }
  else if (type === 'IDAT') idat.push(data);
  else if (type === 'IEND') break;
  pos += 12 + len;
}
const bpp = ctype === 6 ? 4 : ctype === 2 ? 3 : 0;
if (!bpp) throw new Error('RGB or RGBA only (colour type ' + ctype + ')');
const raw = zlib.inflateSync(Buffer.concat(idat)), stride = width * bpp, px = Buffer.alloc(height * stride);
for (let y = 0; y < height; y++) {
  const f = raw[y * (stride + 1)], src = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)), row = px.subarray(y * stride, (y + 1) * stride);
  for (let i = 0; i < stride; i++) {
    const a = i >= bpp ? row[i - bpp] : 0, b = y ? px[(y - 1) * stride + i] : 0, c = (i >= bpp && y) ? px[(y - 1) * stride + i - bpp] : 0;
    let v = src[i];
    if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1;
    else if (f === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
    row[i] = v & 255;
  }
}
const ow = cw * scale, oh = ch * scale, o = Buffer.alloc(oh * (ow * 3 + 1));
for (let y = 0; y < oh; y++) {
  o[y * (ow * 3 + 1)] = 0;
  for (let x = 0; x < ow; x++) {
    const sx = Math.min(width - 1, x0 + Math.floor(x / scale)), sy = Math.min(height - 1, y0 + Math.floor(y / scale)), si = sy * stride + sx * bpp, di = y * (ow * 3 + 1) + 1 + x * 3;
    o[di] = px[si]; o[di + 1] = px[si + 1]; o[di + 2] = px[si + 2];
  }
}
const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = b => { let c = 0xffffffff; for (const v of b) c = crcTable[(c ^ v) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (type, data) => { const l = Buffer.alloc(4); l.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type, 'ascii'), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(ow, 0); ihdr.writeUInt32BE(oh, 4); ihdr[8] = 8; ihdr[9] = 2;
writeFileSync(out, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(o)), chunk('IEND', Buffer.alloc(0))]));
console.log(out + '  ' + ow + 'x' + oh + ' (from ' + inp + ' ' + width + 'x' + height + ' at ' + x0 + ',' + y0 + ' ' + cw + 'x' + ch + ', x' + scale + ')');

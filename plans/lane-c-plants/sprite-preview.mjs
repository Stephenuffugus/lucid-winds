/* A browserless look at a sprites module: every sprite at a whole scale on the palette's colour 0 and on dark, in rows,
   written as a PNG with zlib (no canvas, no lock). Usage: node sprite-preview.mjs <sprites.js> <out.png> [scale] */
import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { resolve } from 'node:path';

const [mod, out, sArg] = process.argv.slice(2);
const { PALETTE, SPRITES } = await import(resolve(mod));
const scale = Number(sArg || 6), pad = 8;
const names = Object.keys(SPRITES);
const hex = c => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
const cellW = Math.max(...names.map(n => SPRITES[n][0].length)) * scale + pad, cellH = Math.max(...names.map(n => SPRITES[n].length)) * scale + pad;
const perRow = 8, rows = Math.ceil(names.length / perRow);
const W = perRow * cellW + pad, H = rows * 2 * cellH + pad;
const px = new Uint8Array(W * H * 3);
const fill = (x0, y0, w, h, rgb) => { for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) { const i = (y * W + x) * 3; px[i] = rgb[0]; px[i + 1] = rgb[1]; px[i + 2] = rgb[2]; } };
fill(0, 0, W, H, [128, 128, 128]);
names.forEach((n, k) => {
  const cx = pad + (k % perRow) * cellW, cy = pad + Math.floor(k / perRow) * 2 * cellH;
  const grid = SPRITES[n];
  for (const [oy, bg] of [[0, hex(PALETTE[0])], [cellH, [34, 32, 28]]]) {
    fill(cx, cy + oy, cellW - pad, cellH - pad, bg);
    grid.forEach((row, y) => Array.from(row).forEach((ch, x) => { if (ch !== '.') fill(cx + x * scale, cy + oy + y * scale, scale, scale, hex(PALETTE[parseInt(ch, 16)])); }));
  }
});
const raw = Buffer.alloc((W * 3 + 1) * H);
for (let y = 0; y < H; y++) { raw[y * (W * 3 + 1)] = 0; Buffer.from(px.buffer, y * W * 3, W * 3).copy(raw, y * (W * 3 + 1) + 1); }
const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc = b => { let c = 0xffffffff; for (const v of b) c = crcTable[(c ^ v) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([len, td, c]); };
const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
writeFileSync(out, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]));
console.log(out + ' ' + W + 'x' + H + ', ' + names.length + ' sprites: ' + names.join(' '));

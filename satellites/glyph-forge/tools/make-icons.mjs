// Generates art-slots/icon-192.png + icon-512.png with ZERO dependencies
// (Node built-in zlib only) — no sharp, no source art needed. Draws an
// on-theme placeholder (ink ground + gilt rune mark, maskable-safe center)
// so the PWA is installable NOW. When real icon art exists, just drop the
// final PNGs at these same paths (see ART_SHOTLIST.md) — nothing else reads
// this. Re-run anytime: node tools/make-icons.mjs
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { writeFileSync } from 'node:fs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const BG   = [0x0a, 0x07, 0x05]; // --ink-deep (matches manifest background_color)
const GILT = [0xcf, 0xa8, 0x4e]; // gilt accent
const GLOW = [0x24, 0x1a, 0x0e]; // dim inner field

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xEDB88320 & -(c & 1));
  }
  return ~c >>> 0;
}
function chunk(type, data) {
  const t = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([t, data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}
function png(S) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(S, 0); ihdr.writeUInt32BE(S, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 2;  // color type 2 = truecolor RGB
  const stride = S * 3;
  const raw = Buffer.alloc((stride + 1) * S);
  const cx = (S - 1) / 2, cy = (S - 1) / 2;
  for (let y = 0; y < S; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    for (let x = 0; x < S; x++) {
      const dx = x - cx, dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const diamond = (Math.abs(dx) + Math.abs(dy)) < S * 0.30; // central rune
      const ring = Math.abs(dist - S * 0.40) < S * 0.018;       // bound circle
      const field = dist < S * 0.44;                            // dim glow
      const c = (diamond || ring) ? GILT : (field ? GLOW : BG);
      const o = y * (stride + 1) + 1 + x * 3;
      raw[o] = c[0]; raw[o + 1] = c[1]; raw[o + 2] = c[2];
    }
  }
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}
for (const s of [192, 512]) {
  const file = join(root, 'art-slots', `icon-${s}.png`);
  writeFileSync(file, png(s));
  console.log(`wrote art-slots/icon-${s}.png`);
}

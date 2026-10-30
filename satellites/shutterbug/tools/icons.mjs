/* The three PWA icons (BUILD-PLAN.md T1.11, section 1.5): the Shutterbug's idle frame from the page's SPRITES block,
 * drawn with its palette on Soot at an integer scale and centred, written as PNG with Node's zlib (no dependency):
 * icons/icon-192.png, icons/icon-512.png and icons/icon-maskable-512.png (the bug inside the maskable safe circle).
 *   node tools/icons.mjs            writes the three files
 *   node tools/icons.mjs --check    exits nonzero if a written file differs from what it would write now */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';
import { createRequire } from 'node:module';
const GAME = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const SB = require(join(GAME, 'tools', 'core-loader.js')).loadCore(join(GAME, 'index.html'));
const html = readFileSync(join(GAME, 'index.html'), 'utf8');
const m = html.match(/\/\* SPRITES BEGIN \*\/([\s\S]*?)\/\* SPRITES END \*\//);
if (!m) throw new Error('no SPRITES fence in index.html');
const SPRITES = require('node:vm').runInNewContext(m[1] + '\n;SPRITES');
const hero = SPRITES.hero, rows = hero.frames.idle0.split('/');
const CRC = new Uint32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc32 = buf => { let c = 0xffffffff; for (const b of buf) c = CRC[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (type, data) => { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type, 'ascii'), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crc32(td)); return Buffer.concat([len, td, c]); };
function png(size, scale) {
  const bg = SB.palette.RGB[SB.palette.I.SOOT], w = hero.w * scale, h = hero.h * scale, x0 = (size - w) >> 1, y0 = (size - h) >> 1;
  const raw = Buffer.alloc(size * (size * 3 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      let c = bg; const sx = Math.floor((x - x0) / scale), sy = Math.floor((y - y0) / scale);
      if (x >= x0 && y >= y0 && sx < hero.w && sy < hero.h) { const ch = rows[sy].charAt(sx); if (ch !== '.') c = SB.palette.RGB[parseInt(ch, 16)]; }
      const o = y * (size * 3 + 1) + 1 + x * 3; raw[o] = c[0]; raw[o + 1] = c[1]; raw[o + 2] = c[2];
    }
  }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}
const OUT = join(GAME, 'icons'), files = { 'icon-192.png': png(192, 9), 'icon-512.png': png(512, 24), 'icon-maskable-512.png': png(512, 16) };
if (process.argv.includes('--check')) {
  const bad = Object.keys(files).filter(f => !existsSync(join(OUT, f)) || !readFileSync(join(OUT, f)).equals(files[f]));
  console.log(bad.length ? 'ICONS DIFFER: ' + bad.join(', ') : 'ICONS OK'); process.exit(bad.length ? 1 : 0);
}
mkdirSync(OUT, { recursive: true });
for (const [f, b] of Object.entries(files)) writeFileSync(join(OUT, f), b);
console.log('wrote ' + Object.keys(files).map(f => f + ' ' + files[f].length + ' bytes').join(', '));

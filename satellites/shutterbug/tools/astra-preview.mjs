/* The hero review shots (the Astra brief: "Before writing APPROVED, Stephen can send the batch 0 checkpoint here.
 * Claude Code then puts the hero in the game and shoots it at 412 and 360 wide, as his phone shows it"): a checked cut
 * (tools/astra_cut.py check --sprites) spliced into a COPY of the page (the page itself is never written), served by the
 * test server through SB_PAGE, and shot in the sample room at 412x915 and 360x780: standing, running, rising and
 * fallen under the death card; plus contact sheets of every cut frame at 8x on Ash and on Soot.
 *   node tools/astra-preview.mjs <sprites.json> <outdir>
 * Prints every file it wrote. Nothing is committed; the shots are for Stephen's APPROVED or CHANGES. */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { deflateSync } from 'node:zlib';
import { createRequire } from 'node:module';

const GAME = join(dirname(fileURLToPath(import.meta.url)), '..');
const [cut, OUT] = process.argv.slice(2);
if (!cut || !OUT) { console.log('usage: node tools/astra-preview.mjs <sprites.json> <outdir>'); process.exit(2); }
mkdirSync(OUT, { recursive: true });
const copy = join(OUT, 'preview-page.html');
const sp = spawnSync('python3', ['-I', join(GAME, 'tools', 'astra_cut.py'), 'splice', cut, join(GAME, 'index.html'), '--out', copy], { encoding: 'utf8' });
if (sp.status !== 0) { console.log(sp.stdout + sp.stderr); process.exit(1); }
const SB = createRequire(import.meta.url)(join(GAME, 'tools', 'core-loader.js')).loadCore(join(GAME, 'index.html'));
const wrote = [copy];

/* the contact sheets: every cut frame at 8x, 4 px apart, on one ground colour */
const CRC = new Uint32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc32 = buf => { let c = 0xffffffff; for (const b of buf) c = CRC[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t, 'ascii'), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc32(td)); return Buffer.concat([l, td, c]); };
function sheet(frames, w, h, ground) {
  const S = 8, G = 4, W = frames.length * (w * S + G) + G, H = h * S + G * 2, raw = Buffer.alloc(H * (W * 3 + 1));
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let c = ground; const k = Math.floor((x - G) / (w * S + G)), fx = Math.floor(((x - G) % (w * S + G)) / S), fy = Math.floor((y - G) / S);
    if (x >= G && y >= G && k < frames.length && fx < w && fy < h && ((x - G) % (w * S + G)) < w * S) { const ch = frames[k].split('/')[fy].charAt(fx); if (ch !== '.') c = SB.palette.RGB[parseInt(ch, 16)]; }
    const o = y * (W * 3 + 1) + 1 + x * 3; raw[o] = c[0]; raw[o + 1] = c[1]; raw[o + 2] = c[2];
  }
  const ih = Buffer.alloc(13); ih.writeUInt32BE(W, 0); ih.writeUInt32BE(H, 4); ih[8] = 8; ih[9] = 2;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ih), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
const cutJson = JSON.parse(readFileSync(cut, 'utf8'));
for (const [key, s] of Object.entries(cutJson)) for (const [gname, gi] of [['ash', SB.palette.I.ASH], ['soot', SB.palette.I.SOOT]]) {
  const f = join(OUT, 'sheet-' + key + '-' + gname + '.png');
  writeFileSync(f, sheet(Object.values(s.frames), s.w, s.h, SB.palette.RGB[gi])); wrote.push(f);
}

/* the hero in the sample room, as the phone shows it */
process.env.SB_PAGE = copy;
const { serve, launch, newPage, gotoGame, ready, tap } = await import(join(GAME, 'test', 'harness.mjs'));
const srv = await serve(), browser = await launch();
try {
  for (const [w, h] of [[412, 915], [360, 780]]) {
    const { page, errors } = await newPage(browser, { width: w, height: h });
    await gotoGame(page, srv.base); await ready(page);
    await page.evaluate(() => { localStorage.clear(); window.SB_DEV.hold(true); });
    await tap(page, '#sample');
    const shot = async (pose) => { const f = join(OUT, 'hero-' + pose + '-' + w + 'x' + h + '.png'); await page.screenshot({ path: f }); wrote.push(f); };
    await page.evaluate(() => window.SB_DEV.step(40)); await shot('standing');
    await page.keyboard.down('ArrowRight'); await page.evaluate(() => window.SB_DEV.step(9)); await shot('running');
    await page.keyboard.down('KeyZ'); await page.evaluate(() => window.SB_DEV.step(4)); await shot('rising');
    await page.keyboard.up('KeyZ'); await page.keyboard.up('ArrowRight');
    await page.evaluate(() => { let k = 0; for (; k < 20000 && !window.SB_DEV.state().room.dead; k += 60) window.SB_DEV.step(60); });
    await shot('fallen');
    if (errors.length) console.log('page errors at ' + w + ': ' + errors.join(' ; '));
    await page.close();
  }
} finally { await browser.close(); await srv.close(); }
console.log(wrote.join('\n'));
console.log('PREVIEW OK: ' + wrote.length + ' files in ' + OUT);

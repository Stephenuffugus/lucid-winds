/* Dewball forge SHOTS: a kind seen from the PLAYER camera, model beside primitive.
 *
 *   node satellites/dewball/tools/forge/shot.mjs --world w1 --kinds teapot,teacup \
 *        [--base assets/3d/] [--D 30] [--sizes 412x915,360x740,915x412] [--out dir] [--pitch 0.42] [--fill 0.2]
 *
 * For each kind and screen size: ONE fresh page (resizing one page between sizes lost the
 * headless GL context and wrote black frames, the first benchmark run); the first run
 * lesson ended; the ball parked at size D (default: the eat moment, size / 0.62) a short
 * roll from one placed instance (the one nearest the world's middle); eight approach
 * directions tried and the one with the clearest line of sight from the lens kept
 * (DB_DEV.occl: a camera parked inside a neighbouring prop sees nothing, the 14 cm sandwich
 * did); the ball walked in until the subject fills about a fifth of the frame, set off to
 * the side so it never stands in front of it; then ONE frame drawn twice, as the model
 * (`-model.png`) and as the primitive it replaces (`-prim.png`), switched by DB_DEV.modelOff.
 * ⛔ A frame that comes back black is drawn again once, then reported as a FAILURE (exit
 *    1), never handed to a sheet. ⛔ No physics tick (a tick eats the world). ⛔ Open every
 *    file this writes.
 */
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { serve } from './serve.mjs';

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const GAME = path.resolve(HERE, '..', '..');
const puppeteer = require(path.resolve(GAME, '..', '..', 'node_modules', 'puppeteer'));
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };

let base = arg('base', 'assets/3d/'); if (!base.endsWith('/')) base += '/';
const world = arg('world', 'w1');
const kinds = arg('kinds', '').split(',').filter(Boolean);
const sizes = arg('sizes', '412x915,360x740,915x412').split(',').map(s => s.split('x').map(Number));
const out = path.resolve(arg('out', '.'));
const forceD = arg('D', null) ? +arg('D') : null;
const pitch = +arg('pitch', '0.42');
const fill = +arg('fill', '0.2');
if (!kinds.length) { console.log('usage: --world w1 --kinds a,b [--base dir] [--D cm] [--sizes WxH,...] [--out dir]'); process.exit(2); }
fs.mkdirSync(out, { recursive: true });

/* share of near black pixels in a PNG screenshot, without a PNG decoder: the page reads it */
async function blackShare(page, file) {
  const b64 = fs.readFileSync(file).toString('base64');
  return page.evaluate(async (b64) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const c = document.createElement('canvas'); c.width = 48; c.height = 96;
    const g = c.getContext('2d'); g.drawImage(img, 0, 0, 48, 96);
    const d = g.getImageData(0, 0, 48, 96).data; let k = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i] + d[i + 1] + d[i + 2] < 30) k++;
    return k / (d.length / 4);
  }, b64);
}

const srv = await serve();
const browser = await puppeteer.launch({ headless: 'new', protocolTimeout: 600000,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
const written = [], failures = [];
try {
  for (const [w, h] of sizes) {
    const page = await browser.newPage();
    const errs = []; page.on('pageerror', e => errs.push(e.message));
    await page.setViewport({ width: w, height: h });
    await page.goto(srv.url + 'index.html?dbtest=1&dbseed=12345&dbglb=' + encodeURIComponent(base), { waitUntil: 'networkidle0' });
    await page.waitForFunction('window.DB_DEV && window.DB_DEV.meshes', { timeout: 20000 });
    await page.evaluate(id => { const D = window.DB_DEV, w = D.worlds().find(x => x.id === id); D.start('level', w.n);
      if (D.endFirstRun) D.endFirstRun(); const c = document.getElementById('introCard'); if (c) c.classList.remove('show'); D.render(); }, world);
    await page.waitForFunction('(function(){var m=window.DB_DEV.meshes();return (m.st===2||m.st===-1)&&m.loading===0;})()', { timeout: 120000, polling: 250 });
    for (const kid of kinds) {
      const where = await page.evaluate((kid, forceD) => {
        const D = window.DB_DEV, st = D.state(), props = D.props();
        const cands = st.objects.filter(o => o.k === kid);
        if (!cands.length) return null;
        cands.sort((a, b) => (a.x * a.x + a.z * a.z) - (b.x * b.x + b.z * b.z));
        const t = cands[0], size = t.s, d = forceD || +(size / 0.62).toFixed(1);
        return { x: t.x, z: t.z, size, D: d, mover: !!t.m, nm: props[kid] ? props[kid].nm : kid };
      }, kid, forceD);
      if (!where) { console.log(kid + ': not placed in ' + world + ', skipped'); continue; }
      const park = await page.evaluate((kid, where, pitch, want) => {
        const D = window.DB_DEV;
        D.modelOff(kid, false); D.setD(where.D);
        /* how much of the subject's box the ball's box covers, on screen */
        const cover = (f, b) => { if (!f || !b || !f.w || !f.h) return 1;
          const ix = Math.max(0, Math.min(f.cx + f.w, b.cx + b.w) - Math.max(f.cx - f.w, b.cx - b.w));
          const iy = Math.max(0, Math.min(f.cy + f.h, b.cy + b.h) - Math.max(f.cy - f.h, b.cy - b.h));
          return Math.min(1, (ix * iy) / (4 * f.w * f.h)); };
        let best = null;
        for (const pt of [pitch, pitch + 0.2, pitch + 0.42]) for (let a = 0; a < 8; a++) {
          const yaw = a * Math.PI / 4, ux = Math.sin(yaw), uz = Math.cos(yaw), vx = -uz, vz = ux;
          const lat = where.D * 0.55 + where.size * 0.35, minOff = where.D * 0.6 + where.size * 0.5;
          /* walk in while the ball leaves the subject clear (under 5% covered); keep the last
             clear stand. A small thing then reads smaller but WHOLE, never hidden behind the
             ball (the first benchmark sandwich and cookie were 59% and 100% covered) */
          let off = where.D * 4.5 + where.size * 1.5, f = null, hid = 1, keep = null;
          for (let i = 0; i < 16; i++) {
            D.setPos(where.x - ux * off + vx * lat, where.z - uz * off + vz * lat);
            D.aimAt(where.x, where.z, pt); D.syncBall(); D.camSettle();
            const fi = D.frame(kid, where.x, where.z), hi = where.mover ? 0 : cover(fi, D.ballBox());
            if (fi && fi.vis >= 0.9 && hi < 0.05) keep = { off, f: fi, hid: hi };
            else if (keep) break;
            if (keep && keep.f.h >= want) break;
            if (off * 0.88 < minOff) break;
            off *= 0.88;
          }
          if (keep) { off = keep.off; f = keep.f; hid = keep.hid; }
          else { D.setPos(where.x - ux * off + vx * lat, where.z - uz * off + vz * lat); D.aimAt(where.x, where.z, pt); D.syncBall(); D.camSettle();
                 f = D.frame(kid, where.x, where.z); hid = where.mover ? 0 : cover(f, D.ballBox()); }
          D.setPos(where.x - ux * off + vx * lat, where.z - uz * off + vz * lat); D.aimAt(where.x, where.z, pt); D.syncBall(); D.camSettle();
          const clear = where.mover ? 1 : D.occl(kid);
          const score = (f ? Math.min(f.h, want) * f.vis : 0) * (1 - hid) * (0.2 + clear);
          if (!best || score > best.score) best = { score, yaw, pt, off, lat, ux, uz, vx, vz, h: f && f.h, vis: f && f.vis, clear, hid };
        }
        D.setPos(where.x - best.ux * best.off + best.vx * best.lat, where.z - best.uz * best.off + best.vz * best.lat);
        D.aimAt(where.x, where.z, best.pt); D.syncBall(); D.camSettle();
        return best;
      }, kid, where, pitch, fill);
      for (const off of [false, true]) {
        const file = path.join(out, `${world}-${kid}-${w}x${h}-${off ? 'prim' : 'model'}.png`);
        let tries = 0, black = 1;
        while (tries < 2) {
          await page.evaluate((kid, off) => { const D = window.DB_DEV; D.modelOff(kid, off); D.syncBall(); D.camSettle(); D.render(); }, kid, off);
          await page.screenshot({ path: file });
          black = await blackShare(page, file);
          if (black < 0.6) break;
          tries++;
        }
        if (black >= 0.6) failures.push(`${path.basename(file)} came back black (${Math.round(black * 100)}%) twice`);
        written.push(file);
        const info = await page.evaluate(kid => { const m = window.DB_DEV.meshes(); return { lod: m.lod[kid] || null, movers: m.movers[kid] || 0 }; }, kid);
        console.log(path.relative(process.cwd(), file), JSON.stringify({ D: where.D, size: +where.size.toFixed(1), lod: info.lod, movers: info.movers,
          fill: park.h && +park.h.toFixed(3), clear: +(+park.clear).toFixed(2), ballCovers: +(+park.hid).toFixed(2), pitch: +park.pt.toFixed(2), approach: Math.round(park.yaw * 180 / Math.PI) + 'deg', black: +black.toFixed(2) }));
      }
      await page.evaluate(kid => window.DB_DEV.modelOff(kid, false), kid);
    }
    if (errs.length) failures.push(`${w}x${h}: page errors: ` + errs.join(' | '));
    await page.close();
  }
} finally { await browser.close(); await srv.close(); }
console.log('SHOTS ' + written.length + ' written to ' + path.relative(process.cwd(), out));
if (failures.length) { console.log('SHOTS_FAIL ' + failures.length + '\n  ' + failures.join('\n  ')); process.exit(1); }

/* Dewball forge SHOTS: a kind seen from the PLAYER camera, model beside primitive.
 *
 *   node satellites/dewball/tools/forge/shot.mjs --world w1 --kinds teapot,teacup \
 *        [--base assets/3d/] [--D 30] [--sizes 412x915,360x740,915x412] [--out docs/briefs/dewball/pilot]
 *
 * For each kind: the ball is parked a short roll from one placed instance at the size a
 * player meets it as food (default D = size / 0.62, the eat moment on the pickup ladder),
 * the camera is aimed so the ball sits between lens and subject (DB_DEV.aimAt, the
 * game's own follow camera, settled, never a debug orbit), then ONE frame is drawn twice:
 * as the model (`-model.png`) and as the primitive it replaces (`-prim.png`), switched by
 * DB_DEV.modelOff so nothing else in the frame can differ.
 * ⛔ No physics tick anywhere in here (a tick eats the world: the parked ball would
 *    swallow the subject). ⛔ One world per run on this box.
 * ⛔ A picture taken is not a picture looked at: open every file this writes.
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
const pitch = arg('pitch', null) ? +arg('pitch') : null;
if (!kinds.length) { console.log('usage: --world w1 --kinds a,b [--base dir] [--D cm] [--sizes WxH,...] [--out dir]'); process.exit(2); }
fs.mkdirSync(out, { recursive: true });

const srv = await serve();
const browser = await puppeteer.launch({ headless: 'new', protocolTimeout: 600000,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
const written = [];
try {
  const page = await browser.newPage();
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.setViewport({ width: sizes[0][0], height: sizes[0][1] });
  await page.goto(srv.url + 'index.html?dbtest=1&dbseed=12345&dbglb=' + encodeURIComponent(base), { waitUntil: 'networkidle0' });
  await page.waitForFunction('window.DB_DEV && window.DB_DEV.meshes', { timeout: 20000 });
  await page.evaluate(id => { const w = window.DB_DEV.worlds().find(x => x.id === id); window.DB_DEV.start('level', w.n); }, world);
  await page.waitForFunction('(function(){var m=window.DB_DEV.meshes();return (m.st===2||m.st===-1)&&m.loading===0;})()', { timeout: 120000, polling: 250 });
  await page.evaluate(() => { const c = document.getElementById('introCard'); if (c) c.classList.remove('show'); });
  const status = await page.evaluate(() => window.DB_DEV.meshes());
  for (const kid of kinds) {
    /* park: one placed instance (the one nearest the world's middle, so the shot has
       the world's own clutter around it rather than an empty rim) */
    const where = await page.evaluate((kid, forceD) => {
      const D = window.DB_DEV, st = D.state(), props = D.props();
      const cands = st.objects.filter(o => o.k === kid);
      if (!cands.length) return null;
      cands.sort((a, b) => (a.x * a.x + a.z * a.z) - (b.x * b.x + b.z * b.z));
      const t = cands[0], size = t.s, d = forceD || +(size / 0.62).toFixed(1);
      return { x: t.x, z: t.z, size, D: d, mover: !!t.m, nm: props[kid] ? props[kid].nm : kid };
    }, kid, forceD);
    if (!where) { console.log(kid + ': not placed in ' + world + ', skipped'); continue; }
    for (const [w, h] of sizes) {
      await page.setViewport({ width: w, height: h });
      /* converge: walk the ball in from three ball widths until the subject fills about a
         fifth of the frame height and is mostly unclipped, the ball set off to one side so
         it never stands in front of what is being judged. Framing reads the instance being
         photographed (frame(kind, x, z)), never the first one in the list. */
      const park = await page.evaluate((kid, where, pitch, want) => {
        const D = window.DB_DEV;
        D.modelOff(kid, false); D.setD(where.D);
        const len = Math.hypot(where.x, where.z) || 1, ux = where.x / len, uz = where.z / len, vx = -uz, vz = ux;
        const lat = where.D * 0.55 + where.size * 0.35, minOff = where.D * 0.6 + where.size * 0.5;
        let off = where.D * 3.2 + where.size, f = null, tries = [];
        for (let i = 0; i < 14; i++) {
          D.setPos(where.x - ux * off + vx * lat, where.z - uz * off + vz * lat);
          D.aimAt(where.x, where.z, pitch); D.syncBall(); D.camSettle();
          f = D.frame(kid, where.x, where.z);
          tries.push({ off: +off.toFixed(1), h: f ? +f.h.toFixed(3) : null, vis: f ? +f.vis.toFixed(2) : null });
          if (f && f.h >= want && f.vis >= 0.9) break;
          if (off * 0.85 < minOff) break;
          off *= 0.85;
        }
        return { off, h: f && f.h, vis: f && f.vis, tries };
      }, kid, where, pitch, +(arg('fill', '0.2')));
      for (const off of [false, true]) {
        const info = await page.evaluate((kid, off) => {
          const D = window.DB_DEV;
          D.modelOff(kid, off); D.syncBall(); D.camSettle(); D.render();
          const m = D.meshes();
          return { lod: m.lod[kid] || null, movers: m.movers[kid] || 0 };
        }, kid, off);
        const file = path.join(out, `${world}-${kid}-${w}x${h}-${off ? 'prim' : 'model'}.png`);
        await page.screenshot({ path: file });
        written.push(file);
        console.log(path.relative(process.cwd(), file), JSON.stringify({ D: where.D, size: where.size, lod: info.lod, movers: info.movers,
          fill: park.h && +park.h.toFixed(3), vis: park.vis && +park.vis.toFixed(2), standoff: +park.off.toFixed(1) }));
      }
      await page.evaluate(kid => window.DB_DEV.modelOff(kid, false), kid);
    }
  }
  console.log('loader', status.st, 'ready', status.ready.join(','), 'failed', status.failed.join(',') || 'none', 'errors', errs.length ? errs.join(' | ') : 'none');
} finally { await browser.close(); await srv.close(); }
console.log('SHOTS ' + written.length + ' written to ' + path.relative(process.cwd(), out));

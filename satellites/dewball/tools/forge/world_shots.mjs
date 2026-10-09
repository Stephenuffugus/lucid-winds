/* Dewball forge WORLD SHOTS: a whole world as the player sees it, every model on, and the
 * same frame with every model off, so a person can say whether the world got better.
 *
 *   node satellites/dewball/tools/forge/world_shots.mjs --world w1 [--base assets/3d/] \
 *        [--D 4,14,24] [--sizes 412x915,360x740] [--out dir] [--skip marble,...]
 *
 * Per screen size, ONE fresh page (resizing a page lost the headless GL context before):
 *   play-D<d>    the ball at spawn, the camera where play leaves it, at each size D
 *   rim-out      THE WORST ANGLE, ON PURPOSE: at the rim, lowest pitch, looking out
 *                (fog band, the world's end, anything visible past the ground)
 *   rim-in       at the rim looking back across the world, low (the skyline of props)
 *   busy-D<mid>  a mid size ball beside the densest cluster of MODELLED props (crumbs aside),
 *                looking at it: the models in company, where a player meets them
 *   above        the goal size, steep pitch, over that same cluster
 * Writes <world>-<shot>-<WxH>-models.png and -today.png. A frame that comes back black is
 * redrawn once and then reported as a FAILURE (exit 1). ⛔ No physics tick after the
 * camera is placed (a tick moves the ball). ⛔ Open every picture this writes.
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
const Ds = arg('D', '4,14,24').split(',').map(Number);
const sizes = arg('sizes', '412x915,360x740').split(',').map(s => s.split('x').map(Number));
const out = path.resolve(arg('out', '.'));
const skip = new Set(['crumb', ...arg('skip', '').split(',').filter(Boolean)]);   /* kinds the busy search ignores (the most numerous small ones) */
fs.mkdirSync(out, { recursive: true });

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
const failures = [], written = [];
try {
  for (const [w, h] of sizes) {
    const page = await browser.newPage();
    const errs = []; page.on('pageerror', e => errs.push(e.message));
    await page.setViewport({ width: w, height: h });
    await page.goto(srv.url + 'index.html?dbtest=1&dbseed=12345&dbglb=' + encodeURIComponent(base), { waitUntil: 'networkidle0' });
    await page.waitForFunction('window.DB_DEV && window.DB_DEV.meshes', { timeout: 20000 });
    const info = await page.evaluate(id => { const D = window.DB_DEV, w = D.worlds().find(x => x.id === id); D.start('level', w.n);
      if (D.endFirstRun) D.endFirstRun(); const c = document.getElementById('introCard'); if (c) c.classList.remove('show');
      for (let i = 0; i < 30; i++) D.step(0.016);
      const st = D.state(); return { bound: w.bound, goal: w.goal, startD: w.startD, x: st.ballX, z: st.ballY }; }, world);
    await page.waitForFunction('(function(){var m=window.DB_DEV.meshes();return (m.st===2||m.st===-1)&&m.loading===0;})()', { timeout: 120000, polling: 250 });
    const kinds = await page.evaluate(() => window.DB_DEV.meshes().ready);
    /* the busiest field OF MODELS: the placed instance of a modelled kind (crumbs aside) with the
       most other modelled instances within 2 m; the first version took the mean of everything
       and shot empty ground */
    const busy = await page.evaluate((kinds, skip) => { const want = new Set(kinds.filter(k => !skip.includes(k)));
      const o = window.DB_DEV.state().objects.filter(o => !o.m && want.has(o.k)); let best = null, bn = -1;
      for (const a of o) { let n = 0; for (const b of o) { const dx = a.x - b.x, dz = a.z - b.z; if (dx * dx + dz * dz < 200 * 200) n++; }
        if (n > bn) { bn = n; best = a; } }
      return best ? { x: best.x, z: best.z, n: bn } : { x: 0, z: 0, n: 0 }; }, kinds, [...skip]);
    console.log('densest modelled cluster', JSON.stringify(busy));
    const shots = [];
    for (const d of Ds) shots.push({ name: 'play-D' + d, D: d, place: { x: info.x, z: info.z }, cam: null });
    const rim = info.bound * 0.93, goal = info.goal || info.startD * 4;
    shots.push({ name: 'rim-out', D: goal * 0.5, place: { x: rim, z: 0 }, cam: [Math.atan2(1, 0), 0.22] });
    shots.push({ name: 'rim-in', D: goal * 0.5, place: { x: rim, z: 0 }, cam: [Math.atan2(-1, 0), 0.3] });
    const mid = Ds[Math.floor(Ds.length / 2)];
    shots.push({ name: 'busy-D' + mid, D: mid, place: { x: busy.x - mid * 5, z: busy.z - mid * 5 }, cam: [Math.PI * 0.25, 0.62] });   // 0.62: the game's own starting pitch
    shots.push({ name: 'above', D: goal, place: { x: busy.x - goal * 2, z: busy.z - goal * 2 }, cam: [Math.PI * 0.25, 0.95] });
    for (const s of shots) {
      for (const off of [false, true]) {
        const file = path.join(out, `${world}-${s.name}-${w}x${h}-${off ? 'today' : 'models'}.png`);
        let black = 1;
        for (let t = 0; t < 2 && black >= 0.6; t++) {
          await page.evaluate((s, kinds, off) => { const D = window.DB_DEV;
            kinds.forEach(k => D.modelOff(k, off));
            D.setD(s.D); D.setPos(s.place.x, s.place.z);
            if (s.cam) D.setCam(s.cam[0], s.cam[1]);
            D.syncBall(); D.camSettle(); D.render(); }, s, kinds, off);
          await page.screenshot({ path: file });
          black = await blackShare(page, file);
        }
        if (black >= 0.6) failures.push(`${path.basename(file)} came back black twice`);
        written.push(file);
        console.log(path.relative(process.cwd(), file), JSON.stringify({ D: s.D, models: off ? 0 : kinds.length, black: +black.toFixed(2) }));
      }
    }
    if (errs.length) failures.push(`${w}x${h}: page errors: ` + errs.join(' | '));
    await page.close();
  }
} finally { await browser.close(); await srv.close(); }
console.log('WORLD_SHOTS ' + written.length + ' written to ' + path.relative(process.cwd(), out));
if (failures.length) { console.log('WORLD_SHOTS_FAIL\n  ' + failures.join('\n  ')); process.exit(1); }

/* Dewball forge PERF probe: what does a world cost to draw, exactly, and what does its
 * per frame JS cost under a phone sized CPU?
 *
 *   node satellites/dewball/tools/forge/perf.mjs --world w7 [--base assets/3d/] [--sizes 45,400,1500] [--frames 40]
 *
 * Exact: draw calls, triangles, textures and geometries from renderer.info after a real
 * render (SwiftShader draws every triangle a phone would). Timed: tick + sync (physics,
 * globe projection, the LOD split: all the JS between input and draw) under a 4x CPU
 * throttle, which is the number the plan's fence means for a phone's main thread.
 * NOT timed under throttle: the draw itself. On this box the GPU is SwiftShader on one
 * physical core, so draw milliseconds are a software rasteriser, not a phone, and the
 * old probe spent ten minutes measuring that noise. They are printed unthrottled with
 * that label.
 * ⛔ Nothing else may run while this measures (one physical core; a second job doubles
 *    every number). ⛔ The ball is parked; no input, so nothing is eaten on purpose.
 */
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';
import { serve } from './serve.mjs';

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const GAME = path.resolve(HERE, '..', '..');
const puppeteer = require(path.resolve(GAME, '..', '..', 'node_modules', 'puppeteer'));
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
let base = arg('base', 'assets/3d/'); if (!base.endsWith('/')) base += '/';
const world = arg('world', 'w7'), frames = +arg('frames', 40);
const sizesArg = arg('sizes', null);

const srv = await serve({ root: arg('root', null) });   /* --root <dir>: an older build, for before/after */
const browser = await puppeteer.launch({ headless: 'new', protocolTimeout: 900000,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
let out;
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 915, height: 412 });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto(srv.url + 'index.html?dbtest=1&dbseed=12345&dbglb=' + encodeURIComponent(base), { waitUntil: 'networkidle0' });
  await page.waitForFunction('window.DB_DEV && window.DB_DEV.perf', { timeout: 20000 });
  const w = await page.evaluate(id => { const D = window.DB_DEV, w = D.worlds().find(x => x.id === id); D.start('level', w.n);
    for (let i = 0; i < 30; i++) D.step(0.016); return w; }, world);
  await page.waitForFunction('(function(){var m=window.DB_DEV.meshes();return (m.st===2||m.st===-1)&&m.loading===0;})()', { timeout: 120000, polling: 250 });
  const sizes = sizesArg ? sizesArg.split(',').map(Number) : [w.startD, Math.round(Math.sqrt(w.startD * w.goal)), w.goal];
  const cdp = await page.target().createCDPSession();
  out = { world, base, viewport: '915x412 dpr1', startD: w.startD, goal: w.goal, sizes: [] };
  for (const d of sizes) {
    const counts = await page.evaluate(d => { const D = window.DB_DEV; D.setD(d); D.syncBall(); D.camSettle(); D.render(); return D.perf(); }, d);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    const tick = await page.evaluate((frames) => { const D = window.DB_DEV, t = [];
      for (let i = 0; i < frames; i++) { const t0 = performance.now(); D.step(0.016); D.sync(); t.push(performance.now() - t0); }
      return t; }, frames);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    const draw = await page.evaluate((frames) => { const D = window.DB_DEV, t = [];
      for (let i = 0; i < frames; i++) { D.sync(); const t0 = performance.now(); D.draw(); t.push(performance.now() - t0); }
      return { t, after: D.perf(), m: D.meshes(), D: D.size() }; }, Math.min(frames, 20));
    const q = (a, p) => { a = a.slice().sort((x, y) => x - y); return +a[Math.min(a.length - 1, Math.floor(a.length * p))].toFixed(2); };
    out.sizes.push({ D: d, Dafter: +draw.D.toFixed(1), calls: counts.calls, tris: counts.tris, textures: counts.textures, texMB: draw.after.texMB, geometries: counts.geometries,
      tickMed4x: q(tick, 0.5), tickP95_4x: q(tick, 0.95), drawMedSwiftShader: q(draw.t, 0.5),
      lodKinds: Object.keys(draw.m.lod).length, nearInstances: Object.values(draw.m.lod).reduce((s, l) => s + l.near, 0) });
  }
  out.pageErrors = errs;
} finally { await browser.close(); await srv.close(); }
console.log(JSON.stringify(out, null, 1));
for (const s of out.sizes) console.log(`PERF ${out.world} D=${s.D}: calls ${s.calls} tris ${s.tris} tex ${s.textures} (${s.texMB} MB) | tick 4x med ${s.tickMed4x} p95 ${s.tickP95_4x} ms | near ${s.nearInstances} in ${s.lodKinds} kinds`);

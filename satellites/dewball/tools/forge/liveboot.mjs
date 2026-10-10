// Live boot: open the LIVE game on each origin, start one world, wait for its models, report what loaded.
//   node satellites/dewball/tools/forge/liveboot.mjs --world w3 --ready 46 https://lucidwinds.com https://www.lucidwinds.com
// Prints LIVE_OK / LIVE_BAD per origin and exits 1 on any bad one: the atlas must load, exactly --ready models, no
// failed model, no page error, at least one draw call. (Lived in a session scratchpad until 10 Oct, when a codespace
// restart wiped it mid deploy; now it lives here.)
// ⛔ ONE world load is a BURST (~100+ requests: the page, three.js, every GLB, the atlas). The host's LiteSpeed origin
// bans this box's address for an hour or more after a few of them (10 Oct: two runs + one debug load = 403 on the whole
// site, players unaffected), and every probe after that re-arms it. Run it ONCE per origin per deploy; on a 403 or a
// timeout, STOP probing and read back later (memory project_cdn_429_lockout_sep15).
import { createRequire } from 'module';
const require = createRequire(new URL('./gate-glb.mjs', import.meta.url));
const puppeteer = require('puppeteer');
const argv = process.argv.slice(2);
const opt = (k) => { const i = argv.indexOf('--' + k); if (i < 0) return null; const v = argv[i + 1]; argv.splice(i, 2); return v; };
const world = opt('world') || 'w3';
const want = Number(opt('ready'));
const origins = argv;
if (!want || !origins.length) { console.log('usage: liveboot.mjs --world wN --ready <models> <origin> [origin...]'); process.exit(2); }
const browser = await puppeteer.launch({ headless: 'new', protocolTimeout: 600000,
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
let bad = 0;
for (const o of origins) {
  const page = await browser.newPage(); await page.setViewport({ width: 412, height: 915 });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.goto(o + '/satellites/dewball/index.html?dbtest=1&dbseed=12345&probe=' + Date.now(), { waitUntil: 'networkidle0', timeout: 120000 });
  await page.waitForFunction('window.DB_DEV && window.DB_DEV.meshes', { timeout: 30000 });
  const n = await page.evaluate((id) => { const w = window.DB_DEV.worlds().find(x => x.id === id); window.DB_DEV.start('level', w.n); return w.n; }, world);
  await page.waitForFunction('(function(){var m=window.DB_DEV.meshes();return (m.st===2||m.st===-1)&&m.loading===0;})()', { timeout: 180000, polling: 500 });
  const r = await page.evaluate(() => { const D = window.DB_DEV; D.camSettle(); D.render(); const m = D.meshes(); return { st: m.st, atlas: m.atlas, ready: m.ready.length, failed: m.failed, calls: D.perf().calls, texMB: D.perf().texMB }; });
  const ok = r.st === 2 && r.atlas && r.ready === want && !r.failed.length && !errs.length && r.calls > 0;
  if (!ok) bad++;
  console.log((ok ? 'LIVE_OK ' : 'LIVE_BAD ') + o + ' world ' + n + ' ' + JSON.stringify(r) + (errs.length ? ' errors: ' + errs.join(' | ') : ''));
  await page.close();
}
await browser.close(); process.exit(bad ? 1 : 0);

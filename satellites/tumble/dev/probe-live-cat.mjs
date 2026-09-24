// Live check of the cat (24 Sep): on lucidwinds.com the host serves .glb as text/plain; GLTFLoader reads bytes, so it should
// not matter, and this proves it: place the cat on the live site, wait for Loaf's cat to replace the blobs.
// node dev/probe-live-cat.mjs [url]
import puppeteer from 'puppeteer';
const base = process.argv[2] || 'https://lucidwinds.com/satellites/tumble/';
const browser = await puppeteer.launch({ headless: 'new', protocolTimeout: 240000, args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage();
await page.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
const errors = [];
page.on('pageerror', (e) => errors.push('pageerror: ' + String(e.message).slice(0, 200)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 200) + ' ' + ((m.location() || {}).url || '')); });
const fails = [];
const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const D = (f, ...a) => page.evaluate(f, ...a);
const until = (f, t = 180000) => page.waitForFunction(f, { timeout: t, polling: 500 }).then(() => true, () => false);
try {
  await page.evaluateOnNewDocument(() => { try { localStorage.setItem('sws_dev_ok', '1'); } catch (e) { /* private */ } });
  await page.goto(base + '?nosw&turbo=1&unlockall=1', { waitUntil: 'load', timeout: 120000 });
  ok(await until(() => window.TUMBLE_DEV && TUMBLE_DEV.state === 'room'), 'the live page boots into the Laundry Room');
  await D(() => { const app = window.TUMBLE, s = app.save; s.equipped.decor = ['decor-laundry-cat']; app.store.save(); app.screens.refresh(); });
  ok(await until(() => !!TUMBLE.game.render.scene.getObjectByName('loafCat') && !TUMBLE.game.render.scene.getObjectByName('catBlob'), 60000), "Loaf's cat loaded from the live host and replaced the blobs");
  const v = await D(() => TUMBLE.game.render.scene.getObjectByName('loafCat') ? TUMBLE.game.render.scene.getObjectByName('loafCat').children[0].children.length : -1);
  ok(v > 0, `the rig has its nodes (${v})`);
  await page.screenshot({ path: 'dev/out/live-cat.png' });
  ok(errors.length === 0, 'no console errors ' + errors.slice(0, 3).join(' | '));
} catch (e) { ok(false, 'crashed: ' + e.message); }
await browser.close();
console.log(fails.length ? `live cat: ${fails.length} FAILED` : 'live cat: all passed');
process.exitCode = fails.length ? 1 : 0;

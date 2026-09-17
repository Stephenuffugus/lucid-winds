// Live check: the deployed game boots on lucidwinds.com, the service worker registers under its versioned URL,
// a second launch is served by the worker, and a Load starts. node dev/probe-live.mjs [url]
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
  await page.goto(base, { waitUntil: 'load', timeout: 120000 });
  ok(await until(() => window.TUMBLE_DEV && TUMBLE_DEV.state === 'room'), 'the live page boots into the Laundry Room');
  ok(await D(() => !!document.getElementById('sws-devgate')), 'a first visit sees the studio workbench gate');
  await page.screenshot({ path: 'dev/out/live-1-gate.png' });
  const reg = await until(() => navigator.serviceWorker && navigator.serviceWorker.getRegistration().then((r) => !!(r && r.active)), 120000);
  const url = await D(() => navigator.serviceWorker.getRegistration().then((r) => r && r.active && r.active.scriptURL));
  ok(reg && /sw\.js\?v=\d{8}[a-z]$/.test(url || ''), `the worker is active under a versioned URL (${url})`);
  // unlock like a tester (the key itself stays with Stephen): the flag the gate sets
  await D(() => localStorage.setItem('sws_dev_ok', '1'));
  await page.reload({ waitUntil: 'load' });
  ok(await until(() => window.TUMBLE_DEV && TUMBLE_DEV.state === 'room'), 'a second launch boots again');
  ok(await D(() => !!navigator.serviceWorker.controller), 'and it is controlled by the worker');
  ok(await D(() => !document.getElementById('sws-devgate')), 'an unlocked tester sees no gate');
  const cached = await D(async () => { const keys = await caches.keys(); const t = keys.filter((k) => k.startsWith('tumble-')); let n = 0; for (const k of t) n += (await (await caches.open(k)).keys()).length; return { t, n }; });
  ok(cached.n >= 40, `the worker cached the game (${cached.t.join(', ')}: ${cached.n} entries)`);
  await page.screenshot({ path: 'dev/out/live-2-room.png' });
  await D(() => TUMBLE_DEV.app.grant({ seenHowTo: true }));
  await D(() => TUMBLE_DEV.app.start({ mode: 'laundry', size: 'small', seed: 'live-check' }));
  ok(await until(() => TUMBLE_DEV.state === 'play', 300000), 'a Load starts on the live site (dryer, dump, play)');
  await page.screenshot({ path: 'dev/out/live-3-play.png' });
  const errs = errors.filter((e) => !/favicon/.test(e));
  ok(errs.length === 0, 'no console errors ' + errs.slice(0, 4).join(' | '));
} catch (e) { ok(false, 'crashed: ' + e.message); }
await browser.close();
console.log(fails.length ? `live probe: ${fails.length} FAILED` : 'live probe: all passed');
process.exitCode = fails.length ? 1 : 0;

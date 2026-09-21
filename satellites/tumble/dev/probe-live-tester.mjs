// The tester button on the LIVE site, service worker ON, on both hosts a phone might be using.
// (Sep 21 2026: the link was proved only on a clean local profile and did nothing for Stephen.) node dev/probe-live-tester.mjs
import puppeteer from 'puppeteer';
const fails = [];
const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ headless: 'new', protocolTimeout: 240000, args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
for (const host of ['https://lucidwinds.com', 'https://www.lucidwinds.com']) {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e.message)));
  await page.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
  const base = host + '/satellites/tumble/';
  const room = () => page.waitForFunction(() => window.TUMBLE_DEV && TUMBLE_DEV.state === 'room', { timeout: 240000, polling: 500 });
  try {
    await page.goto(base, { waitUntil: 'load', timeout: 120000 });
    await page.evaluate(() => localStorage.setItem('sws_dev_ok', '1'));       // the tester key, as the door sets it
    await page.goto(base, { waitUntil: 'load', timeout: 120000 }); await room();
    await page.goto(base, { waitUntil: 'load', timeout: 120000 }); await room(); // a launch the worker controls
    const v = await page.evaluate(() => navigator.serviceWorker.controller && navigator.serviceWorker.controller.scriptURL);
    ok(/v=20260921b/.test(v || ''), `${host}: the worker in control is ${v}`);
    await page.evaluate(() => TUMBLE.openSettings());
    // The sheet SLIDES in, and on this software renderer a slide takes seconds: a fixed wait read the button while
    // the sheet was still moving and called it unreachable (Sep 21). Wait for the settled state: the same element
    // under the finger, at the same place, twice running.
    const measure = () => page.evaluate(() => { const el = document.getElementById('sOpenAll'); if (!el) return null; el.scrollIntoView({ block: 'center' }); const r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2, top = document.elementFromPoint(x, y); return { x, y, h: Math.round(r.height), reach: top === el || el.contains(top) }; });
    let b = null, last = null;
    for (let k = 0; k < 24; k++) { await wait(500); b = await measure(); if (b && last && b.reach && Math.abs(b.y - last.y) < 1) break; last = b; }
    ok(b && b.reach && b.h >= 48, `${host}: Settings shows Open everything, ${b ? b.h : 0} px, under the finger`);
    if (b) await page.touchscreen.tap(b.x, b.y);
    await wait(2500);
    const disk = await page.evaluate(() => new Promise((res) => { const rq = indexedDB.open('tumble', 1); rq.onsuccess = () => { const g = rq.result.transaction('save', 'readonly').objectStore('save').get('main'); g.onsuccess = () => res(g.result || null); g.onerror = () => res(null); }; rq.onerror = () => res(null); }));
    ok(disk && disk.unlocks.length >= 120 && disk.drawer.filter((d) => d.heroId).length === 43 && disk.economy.lint >= 99999, `${host}: a real tap, and the save on disk owns ${disk ? disk.unlocks.length : 0} items and ${disk ? disk.drawer.filter((d) => d.heroId).length : 0} hero socks`);
    ok(errors.length === 0, `${host}: no page errors ${errors.join(' | ')}`);
  } catch (e) { ok(false, `${host}: probe crashed: ${e.message}`); }
  await ctx.close();
}
await browser.close();
console.log(fails.length ? `live tester probe: ${fails.length} FAILED` : 'live tester probe: all passed');
process.exitCode = fails.length ? 1 : 0;

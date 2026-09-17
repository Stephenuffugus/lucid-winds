// Offline cold launch (what a Play reviewer tests): load once so the worker installs, then STOP THE SERVER (a real
// outage, so a worker fetch cannot slip through an emulated one), open a fresh page and expect the Laundry Room.
// node dev/probe-offline.mjs
import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
const PORT = 8790;
const root = new URL('..', import.meta.url).pathname;
const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: root, stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 1500));
const browser = await puppeteer.launch({ headless: 'new', protocolTimeout: 240000, args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const fails = [];
const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const url = `http://127.0.0.1:${PORT}/?turbo=1`;
try {
  const warm = await browser.newPage();
  await warm.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await warm.goto(url, { waitUntil: 'load', timeout: 120000 });
  ok(await warm.waitForFunction(() => window.TUMBLE_DEV && TUMBLE_DEV.state === 'room', { timeout: 180000, polling: 500 }).then(() => true, () => false), 'online: the game boots to the room');
  const cached = await warm.waitForFunction(async () => {
    const r = await navigator.serviceWorker.getRegistration();
    if (!r || !r.active) return false;
    const keys = await caches.keys();
    let local = 0, cdn = 0;
    for (const k of keys) { const n = (await (await caches.open(k)).keys()).length; if (/^tumble-local-/.test(k)) local += n; if (k === 'tumble-cdn-v1') cdn += n; }
    return local >= 40 && cdn >= 5 ? { local, cdn } : false;
  }, { timeout: 180000, polling: 1000 }).then((h) => h.jsonValue(), () => null);
  ok(!!cached, `the worker is active and has precached the game and the engine (${JSON.stringify(cached)})`);
  await warm.close();
  // pull the plug for real
  srv.kill('SIGTERM');
  await new Promise((r) => setTimeout(r, 1500));
  const dead = await fetch(url).then(() => false, () => true);
  ok(dead, 'the server is down (a direct fetch fails)');
  const cold = await browser.newPage();
  await cold.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  const errors = [];
  cold.on('pageerror', (e) => errors.push('pageerror: ' + String(e.message).slice(0, 160)));
  cold.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)); });
  const nav = await cold.goto(url, { waitUntil: 'load', timeout: 120000 }).then(() => true, (e) => { console.log('  info  cold navigation: ' + e.message.slice(0, 120)); return false; });
  ok(nav, 'offline: the page itself is served by the worker');
  const room = await cold.waitForFunction(() => window.TUMBLE_DEV && TUMBLE_DEV.state === 'room', { timeout: 180000, polling: 500 }).then(() => true, () => false);
  ok(room, 'offline: the game boots to the Laundry Room with no server at all');
  const v = await cold.evaluate(() => window.TUMBLE_DEV && TUMBLE_DEV.version).catch(() => null);
  console.log('  info  version offline:', v);
  await cold.screenshot({ path: 'dev/out/offline-room.png' });
  const real = errors.filter((e) => !/favicon|ERR_CONNECTION_REFUSED|ERR_INTERNET_DISCONNECTED|Failed to load resource|dev-gate/.test(e));
  ok(real.length === 0, 'offline: no console errors beyond the refused network ' + real.slice(0, 3).join(' | '));
} catch (e) { ok(false, 'probe crashed: ' + e.message); }
try { srv.kill('SIGKILL'); } catch (e) { /* gone */ }
await browser.close();
console.log(fails.length ? `offline probe: ${fails.length} FAILED` : 'offline probe: all passed');
process.exitCode = fails.length ? 1 : 0;

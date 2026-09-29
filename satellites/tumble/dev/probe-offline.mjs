// Offline cold launch (what a Play reviewer tests): load once so the worker installs, then take EVERY network away
// and cold launch a new browser on the same profile, expecting the Laundry Room.
// node dev/probe-offline.mjs
// 29 Sep: the old probe only stopped the local server, so cdn.jsdelivr.net and the font hosts stayed reachable and the
// browser's HTTP cache still held the first visit's copies. It passed while the worker never stored a CDN module the
// boot needs (BufferGeometryUtils, imported since 23 Sep). Now the cold launch is a NEW browser process on the same
// profile (the worker and its caches survive, the memory caches do not), the CDN and font hosts resolve to a closed
// port, and the HTTP cache is cleared, so only the worker's own caches can serve the game.
import puppeteer from 'puppeteer';
import { spawn } from 'child_process';
import { mkdtempSync, rmSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
const PORT = 8790;
const root = new URL('..', import.meta.url).pathname;
// the engine files the worker must hold, read from sw.js itself so this probe can never drift from the list
const CDN_LIST = [...readFileSync(join(root, 'sw.js'), 'utf8').match(/const CDN_PRECACHE = \[([\s\S]*?)\];/)[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
const OFF_HOSTS = ['cdn.jsdelivr.net', 'fonts.googleapis.com', 'fonts.gstatic.com'];
const ARGS = ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
const profile = mkdtempSync(join(tmpdir(), 'tumble-offline-'));
const srv = spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1'], { cwd: root, stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 1500));
const fails = [];
const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const url = `http://127.0.0.1:${PORT}/?turbo=1`;
let browser = null;
try {
  browser = await puppeteer.launch({ headless: 'new', protocolTimeout: 240000, userDataDir: profile, args: ARGS });
  const warm = await browser.newPage();
  await warm.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  await warm.goto(url, { waitUntil: 'load', timeout: 120000 });
  ok(await warm.waitForFunction(() => window.TUMBLE_DEV && TUMBLE_DEV.state === 'room', { timeout: 180000, polling: 500 }).then(() => true, () => false), 'online: the game boots to the room');
  const cached = await warm.waitForFunction(async (want) => {
    const r = await navigator.serviceWorker.getRegistration();
    if (!r || !r.active) return false;
    let local = 0;
    const cdnHave = new Set();
    for (const k of await caches.keys()) {
      const reqs = await (await caches.open(k)).keys();
      if (/^tumble-local-/.test(k)) local += reqs.length;
      if (k === 'tumble-cdn-v1') for (const q of reqs) cdnHave.add(q.url.split('?')[0]);
    }
    const missing = want.filter((u) => !cdnHave.has(u));
    return local >= 40 && missing.length === 0 ? { local, cdn: cdnHave.size } : false;
  }, { timeout: 180000, polling: 1000 }, CDN_LIST).then((h) => h.jsonValue(), () => null);
  ok(!!cached, `the worker is active and holds the game and all ${CDN_LIST.length} engine files from sw.js (${JSON.stringify(cached)})`);
  await browser.close();
  browser = null;
  // pull every plug: the local server stops, the CDN and font hosts resolve to a closed port
  srv.kill('SIGTERM');
  await new Promise((r) => setTimeout(r, 1500));
  ok(await fetch(url).then(() => false, () => true), 'the local server is down (a direct fetch fails)');
  browser = await puppeteer.launch({ headless: 'new', protocolTimeout: 240000, userDataDir: profile,
    args: [...ARGS, '--host-resolver-rules=' + OFF_HOSTS.map((h) => `MAP ${h} 127.0.0.1:9`).join(', ')] });
  const cold = await browser.newPage();
  await cold.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  const cdp = await cold.createCDPSession();
  await cdp.send('Network.clearBrowserCache');   // the HTTP cache only; the worker's Cache Storage stays
  // about:blank is not controlled by the worker, so this fetch meets the real (cut) network
  const cdnDead = await cold.evaluate((u) => fetch(u, { cache: 'no-store' }).then(() => false, () => true), CDN_LIST[0]);
  ok(cdnDead, 'the CDN is unreachable from the cold browser (a direct fetch fails)');
  const errors = [];
  cold.on('pageerror', (e) => errors.push('pageerror: ' + String(e.message).slice(0, 160)));
  cold.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)); });
  const nav = await cold.goto(url, { waitUntil: 'load', timeout: 120000 }).then(() => true, (e) => { console.log('  info  cold navigation: ' + e.message.slice(0, 120)); return false; });
  ok(nav, 'offline: the page itself is served by the worker');
  const room = await cold.waitForFunction(() => window.TUMBLE_DEV && TUMBLE_DEV.state === 'room', { timeout: 180000, polling: 500 }).then(() => true, () => false);
  ok(room, 'offline: the game boots to the Laundry Room with no server, no CDN and no fonts');
  const v = await cold.evaluate(() => window.TUMBLE_DEV && TUMBLE_DEV.version).catch(() => null);
  console.log('  info  version offline:', v);
  await cold.screenshot({ path: 'dev/out/offline-room.png' });
  const real = errors.filter((e) => !/favicon|ERR_CONNECTION_REFUSED|ERR_INTERNET_DISCONNECTED|ERR_NAME_NOT_RESOLVED|Failed to load resource|dev-gate/.test(e));
  ok(real.length === 0, 'offline: no console errors beyond the refused network ' + real.slice(0, 3).join(' | '));
} catch (e) { ok(false, 'probe crashed: ' + e.message); }
try { srv.kill('SIGKILL'); } catch (e) { /* gone */ }
if (browser) await browser.close().catch(() => {});
rmSync(profile, { recursive: true, force: true });
console.log(fails.length ? `offline probe: ${fails.length} FAILED` : 'offline probe: all passed');
process.exitCode = fails.length ? 1 : 0;

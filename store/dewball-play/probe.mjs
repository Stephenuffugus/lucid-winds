/* DEWBALL PLAY PROBE (13 Nov 2026): the numbers READINESS.md quotes, measured on the real game as served.
     node store/dewball-play/probe.mjs net      a cold start as the Play app (referrer android-app://), no cache,
                                                 network throttled to 1.6 Mbps down / 0.75 up / 150 ms RTT: every
                                                 request (host, bytes, why), time to the menu, time to a rolling ball
                                                 in Crumb Country, time until the world's models stop arriving
     node store/dewball-play/probe.mjs fps [n]  CPU throttled 4x, world n (default the busiest found), ten seconds
                                                 of rolling, frames counted with requestAnimationFrame
     node store/dewball-play/probe.mjs offline  one online visit to Crumb Country, then the network cut and a cold relaunch
     node store/dewball-play/probe.mjs first    a new player's first screens, portrait 412x915 and landscape 915x412,
                                                 saved to raw/first-*.png, plus a rotation mid run
   Respect /home/codespace/lw-drafts/QUIET before running. One browser at a time. */
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire('/workspaces/lucid-winds/x.js'); const puppeteer = require('puppeteer');
const BASE = 'http://127.0.0.1:8777/satellites/dewball/';
const OUT = '/workspaces/lucid-winds/store/dewball-play/raw/'; fs.mkdirSync(OUT, { recursive: true });
const mode = process.argv[2] || 'net';
const twaMode = !process.argv.includes('--web');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const ARGS = ['--no-sandbox', '--disable-dev-shm-usage', '--enable-unsafe-swiftshader', '--use-gl=angle', '--use-angle=swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'];
const browser = await puppeteer.launch({ headless: 'new', args: ARGS });
const errors = [];
async function newPage(w, h, dpr) {
  const ctx = await browser.createBrowserContext(); const p = await ctx.newPage();
  await p.setViewport({ width: w, height: h, isMobile: true, hasTouch: true, deviceScaleFactor: dpr || 1 });
  p.on('pageerror', e => errors.push(String(e.message || e).slice(0, 160)));
  /* Chrome drops an android-app:// Referer from page.goto, so the Play app is played by giving the page the
     document.referrer a Trusted Web Activity gives it (the game's own inTWA test reads exactly this) */
  if (twaMode) await p.evaluateOnNewDocument(() => { try { Object.defineProperty(Document.prototype, 'referrer', { get: () => 'android-app://com.skywolfstudio.dewball/' }); } catch (e) {} });
  p._ctx = ctx; return p;
}
const vis = (p, id) => p.evaluate(id => { const e = document.getElementById(id); if (!e) return false; const s = getComputedStyle(e); return !e.classList.contains('hidden') && s.display !== 'none' && s.visibility !== 'hidden' && e.getBoundingClientRect().height > 0; }, id);
async function waitFor(p, fn, ms) { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { if (await p.evaluate(fn)) return Date.now() - t0; } catch (e) {} await sleep(200); } return -1; }
try {
if (mode === 'net') {
  const p = await newPage(915, 412, 1);
  const cdp = await p.createCDPSession();
  await cdp.send('Network.enable'); await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  await cdp.send('Network.setBypassServiceWorker', { bypass: true });   /* else the worker's own fetches are not counted or throttled */
  await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 0.75e6 / 8 });
  const reqs = {}, t0 = Date.now();
  cdp.on('Network.requestWillBeSent', e => { reqs[e.requestId] = { url: e.request.url, t: Date.now() - t0, type: e.type }; });
  cdp.on('Network.responseReceived', e => { if (reqs[e.requestId]) reqs[e.requestId].status = e.response.status; });
  cdp.on('Network.loadingFinished', e => { if (reqs[e.requestId]) { reqs[e.requestId].bytes = e.encodedDataLength; reqs[e.requestId].done = Date.now() - t0; } });
  cdp.on('Network.loadingFailed', e => { if (reqs[e.requestId]) reqs[e.requestId].failed = e.errorText; });
  await p.goto(BASE, { referer: 'android-app://com.skywolfstudio.dewball/', waitUntil: 'domcontentloaded', timeout: 180000 });
  const tMenu = await waitFor(p, () => { const r = document.getElementById('worldRow'); const m = document.getElementById('menu'); return r && r.children.length > 0 && m && !m.classList.contains('hidden'); }, 180000);
  const twa = await p.evaluate(() => window.SWS_IN_TWA);
  const atMenu = Date.now() - t0;
  await sleep(1500);
  const menuBytes = Object.values(reqs).reduce((a, r) => a + (r.bytes || 0), 0);
  await p.evaluate(() => document.querySelector('#worldRow .wcard').click());
  const tHud = await waitFor(p, () => { const h = document.getElementById('hud'); return h && h.classList.contains('on'); }, 180000);
  const atHud = Date.now() - t0;
  /* the models: wait until no request has finished for 8 s, at most 240 s */
  let last = Date.now();
  for (let i = 0; i < 1200; i++) { const n = Object.values(reqs).filter(r => r.done === undefined && !r.failed).length; const lastDone = Math.max(0, ...Object.values(reqs).map(r => r.done || 0)) + t0; if (n === 0 && Date.now() - lastDone > 8000) break; await sleep(200); }
  const all = Object.values(reqs);
  const total = all.reduce((a, r) => a + (r.bytes || 0), 0);
  const lastDone = Math.max(...all.map(r => r.done || 0));
  const byHost = {}; for (const r of all) { const h = new URL(r.url).host; byHost[h] = (byHost[h] || 0) + (r.bytes || 0); }
  console.log(JSON.stringify({ inTWA: twa, msToMenu: atMenu, menuReadyWait: tMenu, bytesAtMenu: menuBytes, msToRollingBall: atHud, bytesTotalW1: total, msLastByte: lastDone, requests: all.length, byHost }, null, 1));
  for (const r of all.sort((a, b) => a.t - b.t)) console.log(String(r.t).padStart(7), String(r.bytes || 0).padStart(9), r.status || r.failed || '-', r.url.replace(BASE, './'));
}
if (mode === 'fps') {
  const n = +(process.argv[3] || 0);
  const p = await newPage(915, 412, 1);
  await p.goto(BASE + '?dbtest=1&dbseed=7', { waitUntil: 'networkidle2', timeout: 120000 });
  await p.waitForFunction('window.DB_DEV && window.DB_DEV.notes', { timeout: 60000 });
  console.log(JSON.stringify((await p.evaluate(() => window.DB_DEV.worlds())).map(w => [w.n, w.id, w.nm, w.startD, w.goalD])));
  const list = n ? [n] : [1, 5, 6, 7];
  const cdp = await p.createCDPSession();
  for (const wn of list) {
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    await p.evaluate(wn => { const D = window.DB_DEV; D.start(wn === 99 ? 'zen' : 'level', wn); D.endFirstRun(); const c = document.getElementById('introCard'); if (c) c.classList.remove('show'); }, wn);
    await waitFor(p, () => { const m = window.DB_DEV.meshes(); return m.loading === 0; }, 120000);
    await sleep(2000);
    await p.evaluate(() => window.DB_DEV.roll(0.3, 1));
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await sleep(2000);
    const r = await p.evaluate(() => new Promise(res => { let f = 0, worst = 0, prev = performance.now(); const t0 = prev;
      function k(t) { f++; worst = Math.max(worst, t - prev); prev = t; if (t - t0 < 10000) requestAnimationFrame(k); else res({ fps: +(f / ((t - t0) / 1000)).toFixed(1), worstMs: Math.round(worst) }); } requestAnimationFrame(k); }));
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    const perf = await p.evaluate(() => { const q = window.DB_DEV.perf(); return { calls: q.calls, tris: q.tris, size: window.DB_DEV.size(), world: window.DB_DEV.world() }; });
    await p.evaluate(() => window.DB_DEV.roll(0, 0));
    console.log('world', wn, JSON.stringify(r), JSON.stringify(perf));
  }
}
if (mode === 'first') {
  for (const [w, h, tag] of [[412, 915, 'portrait'], [915, 412, 'landscape']]) {
    const p = await newPage(w, h, 2);
    await p.goto(BASE, { referer: 'android-app://com.skywolfstudio.dewball/', waitUntil: 'networkidle2', timeout: 120000 });
    await sleep(2500);
    await p.screenshot({ path: OUT + 'first-' + tag + '-menu.png' });
    const txt = await p.evaluate(() => document.getElementById('menu').innerText.replace(/\s+/g, ' ').slice(0, 900));
    console.log(tag, 'MENU', txt);
    await p.evaluate(() => document.querySelector('#worldRow .wcard').click());
    await sleep(1500); await p.screenshot({ path: OUT + 'first-' + tag + '-intro.png' });
    await sleep(6000); await p.screenshot({ path: OUT + 'first-' + tag + '-6s.png' });
    const fr = await p.evaluate(() => { const e = document.getElementById('firstRun'); return e ? { cls: e.className, text: e.innerText.replace(/\s+/g, ' ') } : null; });
    console.log(tag, 'FIRSTRUN', JSON.stringify(fr));
    /* a thumb on the left half, held for 3 s, as a new player would try */
    const cx = Math.round(w * 0.22), cy = Math.round(h * 0.7);
    const cdp = await p.createCDPSession();
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: cx, y: cy }] });
    for (let i = 1; i <= 15; i++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: cx, y: cy - Math.min(60, i * 6) }] }); await sleep(200); }
    await p.screenshot({ path: OUT + 'first-' + tag + '-rolling.png' });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await sleep(800);
    const hud = await p.evaluate(() => ({ size: document.getElementById('hudSize').textContent, goal: document.getElementById('hudGoal').textContent, timer: document.getElementById('hudTimer').textContent, toast: document.getElementById('toast').textContent }));
    console.log(tag, 'HUD after 3 s roll', JSON.stringify(hud));
    /* rotate mid run */
    await p.setViewport({ width: h, height: w, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    await sleep(2500);
    await p.screenshot({ path: OUT + 'first-' + tag + '-rotated.png' });
    const after = await p.evaluate(() => ({ hudOn: document.getElementById('hud').classList.contains('on'), paused: !document.getElementById('pauseOv').classList.contains('hidden'), canvas: [document.querySelector('#gl canvas').width, document.querySelector('#gl canvas').height], tip: document.getElementById('rotateTip') ? document.getElementById('rotateTip').className : '' }));
    console.log(tag, 'AFTER ROTATE', JSON.stringify(after));
    await p._ctx.close();
  }
}
if (mode === 'fps2') {
  /* the real frame loop (no ?dbtest), a save with the first five worlds starred, a thumb held on the left stick,
     CPU throttled 4x, ten seconds of requestAnimationFrame counted. Crumb Country has the most things of any world
     (6977 at load); The Whole World is the planet (5558 things, 121 movers). */
  for (const [card, nm] of [[0, 'Crumb Country'], [5, 'The Whole World']]) {
    const p = await newPage(915, 412, 2.625);
    await p.evaluateOnNewDocument(() => { try { if (!localStorage.getItem('dewball_save')) { const w = {}; ['w1', 'w2', 'w3', 'w4', 'w5'].forEach(id => { w[id] = { stars: 1, bestD: 0, keeps: [] }; });
      localStorage.setItem('dewball_save', JSON.stringify({ v: 2, worlds: w, seen: { w1: 1, w2: 1, w3: 1, w4: 1, w5: 1, w7: 1 }, tutSeen: true })); } } catch (e) {} });
    await p.goto(BASE + '?nomusic=1', { waitUntil: 'networkidle2', timeout: 120000 });
    await sleep(1500);
    await p.evaluate(c => document.querySelectorAll('#worldRow .wcard')[c].click(), card);
    await sleep(30000);
    const cdp = await p.createCDPSession();
    const cx = 200, cy = 300;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: cx, y: cy }] });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: cx, y: cy - 50 }] });
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await sleep(2000);
    const r = await p.evaluate(() => new Promise(res => { let f = 0, worst = 0, prev = performance.now(); const t0 = prev;
      function k(t) { f++; worst = Math.max(worst, t - prev); prev = t; if (t - t0 < 10000) requestAnimationFrame(k); else res({ fps: +(f / ((t - t0) / 1000)).toFixed(1), worstMs: Math.round(worst) }); } requestAnimationFrame(k); }));
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
    const st = await p.evaluate(() => ({ size: document.getElementById('hudSize').textContent, hud: document.getElementById('hud').classList.contains('on'), dpr: devicePixelRatio, canvas: [document.querySelector('#gl canvas').width, document.querySelector('#gl canvas').height] }));
    await p.screenshot({ path: OUT + 'fps-' + card + '.png' });
    console.log(nm, JSON.stringify(r), JSON.stringify(st));
    await p._ctx.close();
  }
}
if (mode === 'offline') {
  /* one online visit that plays Crumb Country until its models are in, then the network cut and a cold relaunch */
  const p = await newPage(915, 412, 1);
  await p.goto(BASE, { waitUntil: 'networkidle2', timeout: 120000 });
  await p.evaluate(() => document.querySelector('#worldRow .wcard').click());
  await sleep(25000);
  const p2 = await p._ctx.newPage(); await p.close();
  await p2.setViewport({ width: 915, height: 412, isMobile: true, hasTouch: true });
  p2.on('pageerror', e => errors.push(String(e.message || e).slice(0, 160)));
  const fails = []; p2.on('requestfailed', r => fails.push(r.url().replace(BASE, './')));
  const bad = []; p2.on('response', r => { if (r.status() >= 400) bad.push(r.status() + ' ' + r.url().replace(BASE, './')); });
  await p2.setOfflineMode(true);
  await p2.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(e => console.log('goto', e.message));
  const menu = await waitFor(p2, () => { const r = document.getElementById('worldRow'); return r && r.children.length > 0; }, 30000);
  await p2.evaluate(() => document.querySelector('#worldRow .wcard').click()).catch(() => {});
  const hud = await waitFor(p2, () => document.getElementById('hud').classList.contains('on'), 30000);
  await sleep(8000);
  await p2.screenshot({ path: OUT + 'offline-w1.png' });
  console.log(JSON.stringify({ menuMs: menu, hudMs: hud, failed: fails.length, failedSample: fails.slice(0, 8), errorsHttp: bad.slice(0, 8) }));
}
} catch (e) { console.log('PROBE FAILED', e.message); }
console.log('page errors:', errors.length ? errors.join(' | ') : 'none');
await browser.close();

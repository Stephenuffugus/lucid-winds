// node tools/hub-tests/first_run.mjs [url] [shotdir] [tag]   A brand new player on a 412x915 phone: requests, declared bytes, 4xx, page errors, what covers the screen at 1.5 to 22 s, five shots. Repo root on 8777. Analytics and the visit counter are blocked.
import { createRequire } from 'node:module';
const require = createRequire('/workspaces/lucid-winds/x.js'); const puppeteer = require('puppeteer');
const URL = process.argv[2] || 'http://127.0.0.1:8777/index.html'; const OUT = process.argv[3] || '.'; const TAG = process.argv[4] || 'first';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage', '--autoplay-policy=no-user-gesture-required'] });
const ctx = await b.createBrowserContext(); const p = await ctx.newPage();
await p.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
const reqs = [], errs = [], cons = [], failed = [];
await p.setRequestInterception(true);
p.on('request', (r) => { const u = r.url(); if (/google-analytics|googletagmanager|portalPing|doubleclick/.test(u)) return r.abort(); r.continue(); });
p.on('response', async (r) => { const u = r.url(); let len = +(r.headers()['content-length'] || 0); reqs.push({ u: u.slice(0, 140), s: r.status(), len, type: r.request().resourceType(), t: Date.now() }); });
p.on('requestfailed', (r) => { const u = r.url(); if (/google-analytics|googletagmanager|portalPing|doubleclick/.test(u)) return; failed.push(u.slice(0, 140) + ' :: ' + (r.failure() || {}).errorText); });
p.on('pageerror', (e) => errs.push(String(e.message || e).slice(0, 240)));
p.on('console', (m) => { const t = m.type(); if (t === 'error' || t === 'warning' || t === 'warn') cons.push(t + ': ' + m.text().slice(0, 240)); });
const t0 = Date.now();
await p.goto(URL, { waitUntil: 'domcontentloaded', timeout: 120000 }); const tDCL = Date.now() - t0;
const top = () => p.evaluate(() => { const pts = [[206, 120], [206, 300], [206, 457], [206, 650], [206, 860]]; return pts.map(([x, y]) => { let e = document.elementFromPoint(x, y); const chain = []; let k = 0; while (e && k < 4) { chain.push((e.tagName || '').toLowerCase() + (e.id ? '#' + e.id : '') + (e.className && typeof e.className === 'string' ? '.' + e.className.split(' ').slice(0, 2).join('.') : '')); e = e.parentElement; k++; } return y + ': ' + chain.join(' < '); }); });
const vis = () => p.evaluate(() => { // every fixed/absolute full-ish overlay that is showing
  const out = []; document.querySelectorAll('body *').forEach((e) => { const cs = getComputedStyle(e); if ((cs.position === 'fixed') && cs.display !== 'none' && cs.visibility !== 'hidden' && +cs.opacity > 0.05) { const r = e.getBoundingClientRect(); if (r.width >= innerWidth * 0.6 && r.height >= innerHeight * 0.3) out.push((e.id ? '#' + e.id : e.tagName.toLowerCase() + '.' + String(e.className).split(' ')[0]) + ' z' + cs.zIndex + ' ' + Math.round(r.width) + 'x' + Math.round(r.height) + (cs.pointerEvents === 'none' ? ' (no-pointer)' : '')); } }); return out; });
const marks = [1500, 4000, 8000, 14000, 22000]; let last = 0; const frames = [];
for (const m of marks) { await sleep(m - last); last = m; const f = OUT + '/' + TAG + '-' + String(m).padStart(5, '0') + '.png'; await p.screenshot({ path: f }); frames.push({ ms: m, overlays: await vis(), top: await top() }); }
const perf = await p.evaluate(() => { const n = performance.getEntriesByType('navigation')[0] || {}; const paints = {}; performance.getEntriesByType('paint').forEach((e) => (paints[e.name] = Math.round(e.startTime))); return { dcl: Math.round(n.domContentLoadedEventEnd), load: Math.round(n.loadEventEnd), paints, nodes: document.getElementsByTagName('*').length, heapMB: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null, lsKeys: Object.keys(localStorage).length, lsBytes: JSON.stringify(localStorage).length, imgs: document.images.length, brokenImgs: [...document.images].filter((i) => i.complete && !i.naturalWidth && i.src).map((i) => i.src.slice(-70)).slice(0, 30), title: document.title, scrollW: document.documentElement.scrollWidth, audio: document.querySelectorAll('audio').length }; });
const byType = {}; let bytes = 0; const hosts = {}; const bad = [];
for (const r of reqs) { byType[r.type] = (byType[r.type] || 0) + 1; bytes += r.len; const h = (r.u.match(/^https?:\/\/([^/]+)/) || [])[1]; hosts[h] = (hosts[h] || 0) + 1; if (r.s >= 400) bad.push(r.s + ' ' + r.u); }
console.log(JSON.stringify({ url: URL, tDCLms: tDCL, perf, requests: reqs.length, byType, declaredBytes: bytes, hosts, http4xx5xx: bad, failed, pageErrors: errs, consoleErrWarn: cons.slice(0, 40), consoleCount: cons.length }, null, 1));
console.log('FRAMES'); for (const f of frames) { console.log('@' + f.ms + 'ms overlays:', JSON.stringify(f.overlays)); console.log('   top:', f.top.join(' | ')); }
await b.close();

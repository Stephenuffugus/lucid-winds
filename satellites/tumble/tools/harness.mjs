// Shared headless harness: a static server for this folder and a SwiftShader Chrome.
// Usage from a gate:  const H = await harness({ w: 390, h: 844 }); await H.open('?debug=1'); ... await H.close();

import puppeteer from 'puppeteer';
import { createServer } from 'http';
import { readFileSync, existsSync, statSync, mkdirSync } from 'fs';
import { join, extname } from 'path';

export const ROOT = new URL('..', import.meta.url).pathname;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.css': 'text/css', '.webmanifest': 'application/manifest+json', '.glb': 'model/gltf-binary', '.svg': 'image/svg+xml' };

export function serve(port = 8787) {
  const srv = createServer((q, r) => {
    const u = decodeURIComponent(q.url.split('?')[0]);
    let p = join(ROOT, u.endsWith('/') ? u + 'index.html' : u);
    if (!p.startsWith(ROOT) || !existsSync(p) || statSync(p).isDirectory()) { r.writeHead(404); return r.end(); }
    r.writeHead(200, { 'content-type': MIME[extname(p)] || 'application/octet-stream', 'cache-control': 'no-store' });
    r.end(readFileSync(p));
  });
  return new Promise((res) => srv.listen(port, '127.0.0.1', () => res(srv)));
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function harness(opts = {}) {
  const port = opts.port || 8787;
  const srv = await serve(port);
  const browser = await puppeteer.launch({
    headless: 'new',
    protocolTimeout: 240000,
    args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: opts.w || 390, height: opts.h || 844, deviceScaleFactor: opts.dpr || 1, isMobile: opts.mobile !== false, hasTouch: opts.mobile !== false });
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + String(e.message || e).slice(0, 300)));
  page.on('console', (m) => { if (m.type() === 'error' || (opts.verbose && m.type() !== 'debug')) errors.push(m.type() + ': ' + m.text().slice(0, 300)); });
  const out = join(ROOT, opts.outDir || 'dev/out');
  mkdirSync(out, { recursive: true });
  const H = {
    page, browser, errors, out,
    url: (q = '') => `http://127.0.0.1:${port}/${q}`,
    async open(q = '', waitState = 'play', timeout = 180000) {
      await page.goto(H.url(q), { waitUntil: 'load', timeout: 120000 });
      if (waitState) await page.waitForFunction((s) => window.TUMBLE_DEV && window.TUMBLE_DEV.state === s, { timeout, polling: 250 }, waitState);
    },
    frames: (n) => page.evaluate((n) => new Promise((r) => { let k = 0; (function f() { if (++k >= n) r(); else requestAnimationFrame(f); })(); }), n),
    shot: (name) => page.screenshot({ path: join(out, name) }),
    async close() { await browser.close(); srv.close(); },
    // Real pointer events dispatched in the page with controlled timing (the SwiftShader rig runs a few fps,
    // so page.mouse moves arrive seconds apart and read as a stopped finger).
    async swipe(points, ms = 160, opts2 = {}) {
      return page.evaluate(async (points, ms, o) => {
        const el = document.elementFromPoint(points[0][0], points[0][1]);
        const mk = (type, x, y) => new PointerEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, pointerId: o.id || 7, pointerType: o.type || 'touch', isPrimary: true, buttons: type === 'pointerup' ? 0 : 1 });
        el.dispatchEvent(mk('pointerdown', points[0][0], points[0][1]));
        const t0 = performance.now();
        await new Promise((r) => setTimeout(r, o.hold || 30));
        for (let i = 1; i < points.length; i++) {
          const target = t0 + (o.hold || 30) + (ms * i) / (points.length - 1);
          while (performance.now() < target) await new Promise((r) => setTimeout(r, 2));
          el.dispatchEvent(mk('pointermove', points[i][0], points[i][1]));
        }
        if (o.holdEnd) await new Promise((r) => setTimeout(r, o.holdEnd));
        const last = points[points.length - 1];
        el.dispatchEvent(mk('pointerup', last[0], last[1]));
        return el.id || el.tagName;
      }, points, ms, opts2);
    },
    // manual pointer control: down, moves, up as separate steps (so a gate can look mid-gesture)
    async pointer(type, x, y, o = {}) {
      return page.evaluate((type, x, y, o) => {
        window.__ptrEl = type === 'pointerdown' ? document.elementFromPoint(x, y) : (window.__ptrEl || document.elementFromPoint(x, y));
        const el = window.__ptrEl;
        el.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, pointerId: o.id || 7, pointerType: o.type || 'touch', isPrimary: o.primary !== false, buttons: type === 'pointerup' ? 0 : 1 }));
        return el.id || el.tagName;
      }, type, x, y, o);
    },
    async moveOver(from, to, ms, o = {}) {
      return page.evaluate(async (from, to, ms, o) => {
        const el = window.__ptrEl;
        const n = Math.max(2, Math.round(ms / 16));
        const t0 = performance.now();
        for (let i = 1; i <= n; i++) {
          const target = t0 + (ms * i) / n;
          while (performance.now() < target) await new Promise((r) => setTimeout(r, 1));
          const x = from[0] + (to[0] - from[0]) * (i / n), y = from[1] + (to[1] - from[1]) * (i / n);
          el.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, cancelable: true, clientX: x, clientY: y, pointerId: o.id || 7, pointerType: o.type || 'touch', isPrimary: true, buttons: 1 }));
        }
      }, from, to, ms, o);
    },
    async tap(x, y, o = {}) {
      return page.evaluate((x, y, o) => {
        const el = document.elementFromPoint(x, y);
        const mk = (type) => new PointerEvent(type, { bubbles: true, cancelable: true, clientX: x, clientY: y, pointerId: o.id || 9, pointerType: 'touch', isPrimary: !o.secondary, buttons: type === 'pointerup' ? 0 : 1 });
        el.dispatchEvent(mk('pointerdown'));
        el.dispatchEvent(mk('pointerup'));
        if (el.tagName === 'BUTTON' || el.closest('button')) (el.closest('button') || el).click();
        return el.id || el.tagName;
      }, x, y, o);
    },
  };
  return H;
}

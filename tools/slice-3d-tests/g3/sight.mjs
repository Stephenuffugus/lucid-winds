// Part G3: how much shaft does a phone show BELOW a falling knife in Endless? The knife is put at a depth with the fall speed
// that depth gives, falls 2 s (the chase camera's lag settles), then the screen's bottom edge is found on the knife's plane
// (z 0) by bisection on the real camera. 412 x 915. node sight.mjs [depths...]
import { createRequire } from 'node:module';
const require = createRequire('/workspaces/lucid-winds/x.js');
const puppeteer = require('puppeteer');
const depths = process.argv.slice(2).map(Number); if (!depths.length) depths.push(100, 600, 917, 1500, 3000, 5000);
const BASE = process.env.BASE || 'http://127.0.0.1:8777';
const sleep = t => new Promise(r => setTimeout(r, t));
const b = await puppeteer.launch({ headless: 'new', protocolTimeout: 300000, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'] });
const p = await b.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 200)));
await p.setViewport({ width: 412, height: 915, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
await p.evaluateOnNewDocument(() => { try { localStorage.setItem('sws_dev_ok', '1'); localStorage.setItem('lwfb_explained', '1'); localStorage.setItem('rs_set', '{}'); } catch (e) {} });
await p.goto(BASE + '/satellites/slice-3d/' + (process.env.PAGE || '') + '?dev=1', { waitUntil: 'domcontentloaded', timeout: 60000 });
await p.waitForFunction(() => window._S3 && document.readyState === 'complete', { timeout: 30000 });
await sleep(1500);
const out = [];
for (const d of depths) {
  const r = await p.evaluate(d => { const S = window._S3; S.newEndless(); const G = S.g();
    // start a little above the depth at the speed that depth gives, no input, the walls kept away (x 0, blade down)
    G.x = 0; G.y = 4 - (d - 60); G.depth = d - 60; G.vx = 0; G.w = 0; G.ang = Math.PI / 2; G.vy = -19;
    for (let i = 0; i < 125; i++) { G.x = 0; G.vx = 0; G.w = 0; G.ang = Math.PI / 2; S.hold(0); S.stepN(1, 16); if (S.g().done) return { d, died: true }; }
    const g = S.g(), cv = document.querySelector('canvas'), rc = cv.getBoundingClientRect();
    // the bottom edge of the canvas on screen, and of the window, as NDC y; find the world y at the knife's x on z 0
    const ndcAt = y => S.proj(g.x, y, 0)[1];
    const edgeNdc = rc.bottom <= innerHeight ? -1 : -1 + 2 * (rc.bottom - innerHeight) / rc.height;
    let lo = g.y - 200, hi = g.y; for (let i = 0; i < 60; i++) { const m = (lo + hi) / 2; if (ndcAt(m) < edgeNdc) lo = m; else hi = m; }
    return { d: +(4 - g.y).toFixed(0), vy: +g.vy.toFixed(1), below: +(g.y - hi).toFixed(1), canvas: [Math.round(rc.top), Math.round(rc.bottom)], vh: innerHeight };
  }, d);
  out.push(r); console.log(JSON.stringify(r));
}
console.log('errs', errs.join(' | '));
await b.close();

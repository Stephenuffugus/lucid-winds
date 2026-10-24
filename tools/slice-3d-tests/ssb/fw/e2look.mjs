// node e2look.mjs <outdir> <case...>   Part E2 looks from the player's camera: band (a gold banded line stack as the knife
// falls at it), find (the find popping, two frames), won (the end panel after carving the whole line and landing), count
// (the end panel of a failed dive with its count and a new find). VW/VH/DPR env like look.mjs. One browser per case.
import { createRequire } from 'node:module';
const require = createRequire('/workspaces/lucid-winds/x.js'); const puppeteer = require('puppeteer');
const [out, ...cases] = process.argv.slice(2);
const LAUNCH = { headless: 'new', protocolTimeout: 300000, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'] };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const W = +(process.env.VW || 412), H = +(process.env.VH || 915), tag = W + 'x' + H;
for (const c of cases) {
  const b = await puppeteer.launch(LAUNCH); const p = await b.newPage();
  await p.setViewport({ width: W, height: H, deviceScaleFactor: +(process.env.DPR || 2), isMobile: true, hasTouch: true });
  const errs = []; p.on('pageerror', e => errs.push(String(e).slice(0, 200)));
  await p.evaluateOnNewDocument(() => { try { localStorage.setItem('sws_dev_ok', '1'); localStorage.setItem('lwfb_explained', '1'); localStorage.removeItem('s3d_dex'); } catch (e) {} });
  await p.goto('http://127.0.0.1:8777/satellites/slice-3d/?dev=1', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await p.waitForFunction(() => window._S3 && window._S3.art && window._S3.art().json && document.readyState === 'complete', { timeout: 30000 });
  const settle = async () => { const t0 = Date.now(); while (Date.now() - t0 < 20000) { const a = await p.evaluate(() => window._S3.art()); if (a.asked > 0 && a.loaded + a.failed >= a.asked) break; await sleep(400); } };
  await p.evaluate(() => { window._S3.salt(77); window._S3.newFF(1); }); await settle();
  await p.evaluate(() => { window._S3.salt(77); window._S3.newFF(1); }); await settle(); await sleep(400);
  const info = await p.evaluate(kase => { const S = window._S3, G = S.g(), c = S.clean(), D = 1000 / 120, st = new Map();
    c.req.forEach(s => { if (!st.has(s.stk)) st.set(s.stk, []); st.get(s.stk).push(s); });
    const order = [...st.values()].map(a => a.sort((u, v) => v.y - u.y)).sort((a, b) => b[0].y - a[0].y);
    const hold = (x, y, n) => { for (let i = 0; i < n; i++) { G.x = x; G.y = y; G.vx = 0; G.vy = -19; G.w = 0; G.ang = Math.PI / 2; S.hold(0); S.stepN(1, D); } };
    if (kase === 'band') { const a = order[0]; hold(a[0].x + 0.4, a[0].y + 9, 150); }
    if (kase === 'find') { const d = c.disc, a = order.find(o => o.indexOf(d) >= 0); hold(d.x, a[0].y + 6, 150); G.y = a[0].y + 3;
      for (let i = 0; i < 300 && !d.cut; i++) { G.ang = Math.PI / 2; G.w = 0; S.stepN(1, D); } for (let i = 0; i < 18; i++) { G.ang = Math.PI / 2; G.w = 0; S.stepN(1, D); } }
    if (kase === 'won' || kase === 'count') {
      for (const a of order) { G.x = a[0].x; G.y = a[0].y + 3; G.vx = 0; G.vy = -19; G.w = 0; G.ang = Math.PI / 2; S.hold(0);
        for (let n = 0; n < 240 && !G.done && G.y > a[a.length - 1].y - 2; n++) { G.ang = Math.PI / 2; G.w = 0; S.stepN(1, D); } if (kase === 'count') break; }
      if (kase === 'won') { const W = S.world(); G.x = 0; G.y = W.floorY + 3; G.vx = 0; G.vy = -10; G.w = 0; G.ang = Math.PI / 2; S.hold(0); }
      else { G.done = true; G.failed = true; G.doneT = 0; G.stuckY = G.y; }
      const go = document.getElementById('s-go'); for (let n = 0; n < 900 && !go.classList.contains('on'); n++) S.stepN(1, D); }
    return { M: c.M, stacks: c.stacks, n: S.clean().n, found: S.clean().found, finds: S.finds() }; }, c);
  await sleep(c === 'won' || c === 'count' ? 1600 : 300);
  await p.screenshot({ path: `${out}/e2_${c}_${tag}.png` });
  if (c === 'find') { await p.evaluate(() => { const S = window._S3, G = S.g(); for (let i = 0; i < 30; i++) { G.ang = Math.PI / 2; G.w = 0; S.stepN(1, 1000 / 120); } }); await p.screenshot({ path: `${out}/e2_${c}2_${tag}.png` }); }
  console.log(c, tag, JSON.stringify(info), 'errs', JSON.stringify(errs));
  await b.close();
}

import fs from 'node:fs';
/* SUPER SLICE 3D — headless assertion suite (2026-08-16 audit)
 *
 * Run:  node satellites/slice-3d/audit-check.mjs [baseUrl]
 *       default base is http://localhost:8777 — serve the REPO ROOT, not this
 *       folder, or /arcade-exit.js and /feedback.js 404 and the exit checks
 *       fail for the wrong reason.
 *
 * ⛔ NEVER wait on networkidle here. This page streams a 600KB three.js and keeps
 *    a rAF loop running forever, so networkidle never fires and a probe built on
 *    it reports a perfectly healthy page as dead. domcontentloaded + settle.
 *
 * ⛔ Every assertion below was watched FAIL on purpose before it was trusted. A
 *    probe you have not seen go red is decoration. The first draft of the play
 *    check broke its stepping loop the moment G.done flipped, which is 2.4s before
 *    finishLevel() fires, and confidently reported "the end screen never shows".
 */
import {createRequire} from 'node:module';
const require = createRequire('/workspaces/lucid-winds/x.js');
const puppeteer = require('puppeteer');

const BASE = process.argv[2] || 'http://localhost:8777';
const URL = BASE + '/satellites/slice-3d/?dev=1';
let pass = 0, fail = 0;
const ok = (n, c, d) => { if (c) { pass++; console.log('  ok   ' + n); } else { fail++; console.log('  FAIL ' + n + (d ? '  -> ' + d : '')); } };

/* ⛔ ONE BROWSER PER CASE, not one browser with twenty contexts.
   This page builds a real WebGL context and pulls in 600KB of three.js on every
   boot. Reusing a single browser across ~20 of those on a 2-core box exhausts it:
   the run got through the whole corrupt-save phase and then died on a 30s
   NAVIGATION timeout — which looks exactly like "the game stopped loading" and is
   nothing of the kind. Launch, use, close. Slower, and it actually finishes.
   Navigation timeout is raised to 60s for the same reason: a slow box is not a
   broken page. */
const LAUNCH = {
  headless: 'new', protocolTimeout: 300000,
  args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage']
};
const MUT = JSON.parse(process.env.MUT || '[]');   // [[find, replace], ...] applied to the page as served
const SRC = fs.readFileSync('/workspaces/lucid-winds/satellites/slice-3d/index.html', 'utf8');
let BODY = SRC; for (const [f, r] of MUT) { if (BODY.split(f).length !== 2) { console.log('MUTATION NOT UNIQUE: ' + f); process.exit(2); } BODY = BODY.replace(f, r); }
async function intercept(p) {
  await p.setRequestInterception(true);
  p.on('request', q => { const u = q.url(); if (q.isNavigationRequest() && /\/satellites\/slice-3d\/(\?|$)/.test(u)) q.respond({ status: 200, contentType: 'text/html', body: BODY }); else q.continue(); });
}
async function boot() {
  const browser = await puppeteer.launch(LAUNCH); const p = await browser.newPage(); await intercept(p);
  await p.setViewport({ width: 540, height: 960, deviceScaleFactor: 1 });
  await p.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 }); await new Promise(r => setTimeout(r, 3500));
  return { ctx: { close: () => browser.close() }, p };
}
async function clickCentre(p, sel) { const c = await p.evaluate(s => { const b = document.querySelector(s).getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; }, sel); await p.mouse.click(c.x, c.y); }
/* ---- 10. SS21: Endless has no floor. 3000 steps (25 s) of a straight dive never end it, it crosses a world band, and
   the shaft stays a ring of at most four live chunks; 6 km down there is still no floor. The scene itself stays bounded:
   the descent to 6 km goes 100 m at a time so every chunk is built and let go, and the scene (less the moment's sparks,
   pieces and rings) must stay near what it was with the first three chunks live. Watched red with endlessDrop's
   scene.remove taken out. */
console.log('\n[10] Part B: Endless has no floor and keeps a bounded ring');
{
  const { ctx, p } = await boot();
  let r; try { r = await p.evaluate(() => {
    const S = window._S3; S.salt(99); S.newEndless(); const G = S.g();
    const base = S.endless().kids;   // chunks 0 to 2 live, none let go yet
    let maxLive = 0, maxKids = 0;
    for (let i = 0; i < 3000; i++) {
      G.x = 0; G.vx = 0; G.w = 0; G.ang = Math.PI / 2; S.hold(0); S.stepN(1, 1000 / 120);
      const e = S.endless(); if (e) { maxLive = Math.max(maxLive, e.live.length); maxKids = Math.max(maxKids, e.sceneKids); }
      if (S.g().done) break;
    }
    const out = { depth: Math.round(S.g().depth), done: !!S.g().done, mile: S.endless() && S.endless().mile, maxLive, maxKids };
    for (let y = G.y - 100; y > -6000; y -= 100) { G.y = y; G.x = 0; G.vx = 0; G.w = 0; G.ang = Math.PI / 2; S.hold(0); S.stepN(1, 1000 / 120); }
    G.y = -6000; for (let i = 0; i < 40; i++) { G.x = 0; G.vx = 0; G.w = 0; G.ang = Math.PI / 2; S.hold(0); S.stepN(1, 1000 / 120); }
    out.far = S.endless(); out.farDone = !!S.g().done; out.base = base; S.salt(null); return out;
  }); } catch (e) { r = { error: String(e).slice(0, 160) }; }
  ok('Endless runs 3000 steps without ending and passes a world band', !r.done && r.depth > 300, JSON.stringify(r));
  ok('Endless marks every 100 m', r.mile === Math.floor(r.depth / 100), JSON.stringify({ depth: r.depth, mile: r.mile }));
  ok('Endless keeps at most four chunks live', r.maxLive <= 4 && !!r.far && r.far.live.length <= 4, JSON.stringify({ maxLive: r.maxLive, far: r.far }));
  ok('Endless has no floor 6 km down', !r.farDone && !!r.far && r.far.k >= 59, JSON.stringify(r.far));
  ok('Endless lets every dropped chunk leave the scene', !!r.far && r.base > 0 && r.far.kids <= 1.6 * r.base,
    JSON.stringify({ base: r.base, far: r.far && r.far.kids }));
  await ctx.close();
}

/* ---- 14. The fleet's chrome claims the viewport's top right: the feedback chip lives there, and a deep link (?mode=ff)
   boots with the menu hidden, so the arcade exit lands its chip there too and never moves it. Back on the menu, the
   soundtrack and the gear must still be themselves at their centre and four corners. v6.2's first cut put the
   soundtrack top right: 87 percent under the exit chip. */
console.log('\n[14] Part B: the fleet chips never sit on the soundtrack or the gear');
for (const [w, h] of [[360, 640], [375, 667]]) {
  const browser = await puppeteer.launch(LAUNCH);
  const p = await browser.newPage(); await intercept(p);
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
  let r;
  try {
    await p.goto(URL.replace(/\/?(\?|$)/, '/?mode=ff&'), { waitUntil: 'load', timeout: 60000 });
    await new Promise(res => setTimeout(res, 3500));   // the exit chip boots at load + 0.4 s and settles at 2.2 s
    await clickCentre(p, '#b-home'); await new Promise(res => setTimeout(res, 1500));
    r = await p.evaluate(() => {
      const out = [], chip = !!document.getElementById('sws-arcade-exit'), fab = !!document.querySelector('.lwfb-fab');
      for (const id of ['b-music', 'b-set']) {
        const el = document.getElementById(id); if (!el || getComputedStyle(el).display === 'none') continue;
        const b = el.getBoundingClientRect(), i = 5;
        for (const [x, y] of [[b.x + b.width / 2, b.y + b.height / 2], [b.x + i, b.y + i], [b.right - i, b.y + i], [b.x + i, b.bottom - i], [b.right - i, b.bottom - i]]) {
          const t = document.elementFromPoint(x, y);
          if (!(t === el || (t && el.contains(t)))) out.push(id + '@' + Math.round(x) + ',' + Math.round(y) + ' under ' + (t ? (t.id || t.className || t.tagName) : 'nothing'));
        }
      }
      return { title: document.getElementById('s-title').classList.contains('on'), chip, fab, out };
    });
  } catch (e) { r = { error: String(e).slice(0, 160), out: ['error'] }; }
  ok('at ' + w + 'x' + h + ' after a deep link, nothing covers the soundtrack or the gear', !!r.title && r.out.length === 0, JSON.stringify(r));
  await browser.close();
}

console.log('\n=== fw: ' + pass + ' passed, ' + fail + ' failed ===');

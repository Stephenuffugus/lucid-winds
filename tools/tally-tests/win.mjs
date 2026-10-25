// node tools/tally-tests/win.mjs [url] [shotdir]   Tally Part 3 gate and look: the win at 412 x 915 and 360 x 640 (the banner, three
// painted stars, the pal's win loop, the confetti frame), the daily tab's card, the splash plate at 0 ms. Repo root or the dist on a port.
import { createRequire } from 'node:module';
const require = createRequire('/workspaces/lucid-winds/x.js'); const puppeteer = require('puppeteer');
const URL = process.argv[2] || 'http://127.0.0.1:8777/satellites/tally/'; const SHOTS = process.argv[3] && process.argv[3] !== '-' ? process.argv[3] : '';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms)); const fails = [], notes = [];
const F = (ok, msg) => (ok ? notes : fails).push(msg);
import { genPuzzle, levelOpts } from '/workspaces/Tally/src/engine.js';
const glyph = (g) => ({ '-': '\u2212', '*': '\u00d7', 'x': '\u00d7', '/': '\u00f7' })[g] || g;
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
async function open(seed, w, h) { const ctx = await b.createBrowserContext(); const p = await ctx.newPage();
  await p.setViewport({ width: w, height: h, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await p.evaluateOnNewDocument((s) => { try { localStorage.setItem('lwfb_explained', '1'); localStorage.setItem('tally:v1', s); } catch (e) {} }, JSON.stringify(seed));   // the save the app reads (storage.js STORE_KEY)
  await p.goto(URL + '?sstest=1', { waitUntil: 'domcontentloaded' }); return { ctx, p }; }
for (const [w, h] of [[412, 915], [360, 640]]) {
  const { ctx, p } = await open({ seenIntro: true, guideDone: true }, w, h);
  const plateAt0 = await p.evaluate(() => { const e = document.getElementById('mv-splashplate'); return e ? getComputedStyle(e).opacity : 'gone'; });
  if (SHOTS && w === 412) await p.screenshot({ path: `${SHOTS}/splash-0ms-${w}.png` });
  F(plateAt0 !== 'gone', `splash plate present at 0 ms (${plateAt0})`);
  await p.waitForSelector('.mv-beacon-num', { timeout: 15000 }); await sleep(900);
  F(await p.evaluate(() => !document.getElementById('mv-splashplate')), 'the splash plate is gone after mount');
  F(await p.evaluate(() => !!document.querySelector('.mv-wordmark')), 'the wordmark stands in the header');
  const pool = await p.evaluate(() => [...document.querySelectorAll('.mv-tile')].map((t) => parseInt(t.textContent, 10)));
  const target = await p.evaluate(() => parseInt(document.querySelector('.mv-beacon-num').textContent, 10));
  const sols = genPuzzle(1001, levelOpts(1)).solutions.map((x) => x.tokens); let next = false;
  const tapAt = async (sel, match) => { const c = await p.evaluate((sel, match) => { const e = [...document.querySelectorAll(sel)].find((n) => n.textContent.trim() === String(match)); if (!e) return null; const r = e.getBoundingClientRect(); const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { x: r.left + r.width / 2, y: r.top + r.height / 2, top: top ? (top.className || top.tagName) + (e.contains(top) || top === e ? '' : ' (NOT the target)') : 'none' }; }, sel, match);
    if (c && /NOT the target/.test(c.top)) notes.push(`${w}: the tap on ${sel} ${match} at ${Math.round(c.x)},${Math.round(c.y)} is covered by ${c.top}`);
    if (c) await p.touchscreen.tap(c.x, c.y); return !!c; };
  let chips = 0;
  for (const sol of sols.slice(0, 12)) {
    for (const x of sol) { await (typeof x === 'number' ? tapAt('.mv-tile', x) : tapAt('.mv-op', glyph(x))); await sleep(70); }
    await sleep(500); chips = await p.evaluate(() => document.querySelectorAll('.mv-findchip').length);
    if (!chips) notes.push(`${w}: after ${JSON.stringify(sol)} the builder reads "${await p.evaluate(() => (document.querySelector('.mv-builder') || {}).textContent)}" tiles ${await p.evaluate(() => [...document.querySelectorAll('.mv-tile')].map((t) => t.textContent.trim()).join(','))} ops ${await p.evaluate(() => [...document.querySelectorAll('.mv-op')].map((t) => t.textContent.trim()).join(','))}`);
    next = await p.evaluate(() => !!document.querySelector('.mv-ctrl.next')); if (next) break;
    await p.evaluate(() => { const c = [...document.querySelectorAll('.mv-ctrl')].find((b) => /Clear/.test(b.textContent)); if (c && !c.disabled) c.click(); }); await sleep(60);
  }
  F(next, `the level is cleared by the driver (${sols.length} solutions for ${pool} = ${target}, ${chips} chips banked)`);
  if (next) {
    await p.click('.mv-ctrl.next'); await sleep(60);
    const win = await p.evaluate(() => ({ title: !!document.querySelector('.mv-win-title'), banner: !!document.querySelector('.mv-win-banner'), stars: document.querySelectorAll('.mv-starimg').length,
      pal: (document.querySelector('.mv-winpal img') || {}).src || '', confetti: !!document.querySelector('.mv-confetti'), nextBox: (() => { const e = [...document.querySelectorAll('.mv-win-actions button')].pop(); if (!e) return null; const r = e.getBoundingClientRect(); return [r.top, r.bottom, innerHeight]; })() }));
    if (SHOTS) await p.screenshot({ path: `${SHOTS}/win-${w}.png` });
    F(win.title && win.banner && win.stars === 3 && /win_0\d\.webp/.test(win.pal), `${w}: the win shows the banner, three painted stars and the pal's win loop (${JSON.stringify(win)})`);
    F(win.confetti, `${w}: the confetti frame is up right after the win opens`);
    F(win.nextBox && win.nextBox[1] <= win.nextBox[2], `${w}: Next is inside the viewport (${JSON.stringify(win.nextBox)})`);
    await p.click('.mv-win-actions .primary'); await sleep(200);
  }
  await p.evaluate(() => { const e = [...document.querySelectorAll('.mv-navbtn')].find((n) => n.textContent.includes('Daily')); e && e.click(); }); await sleep(300);
  const card = await p.evaluate(() => { const c = document.querySelector('.mv-dailycard'); if (!c) return null; const r = c.getBoundingClientRect(); return { text: c.textContent, w: r.width, h: r.height }; });
  F(card && /Daily for /.test(card.text) && card.w > 100, `${w}: the daily card stands above the target (${card && card.text})`);
  const lay = await p.evaluate(() => { const tiles = [...document.querySelectorAll('.mv-tile')].map((t) => t.getBoundingClientRect().bottom); const ctrls = [...document.querySelectorAll('.mv-ctrl')].map((c) => c.getBoundingClientRect()); return { beadBottom: Math.max(...tiles), ctrlTop: Math.min(...ctrls.map((r) => r.top)), ctrlBottom: Math.max(...ctrls.map((r) => r.bottom)), H: innerHeight }; });
  F(lay.beadBottom <= lay.ctrlTop + 1 && lay.ctrlBottom <= lay.H, `${w}: on the daily the beads clear the controls and the controls are in view (${JSON.stringify(lay)})`);
  if (SHOTS) await p.screenshot({ path: `${SHOTS}/daily-${w}.png` });
  await ctx.close();
}

{ // Part 4: the guide for a fresh save at 360 x 640: the pointed bead and the Skip button inside the viewport, Skip 48 px
  const { ctx, p } = await open({ seenIntro: true }, 360, 640);
  await p.waitForSelector('.mv-beacon-num', { timeout: 15000 }); await sleep(900);
  const g = await p.evaluate(() => { const t = document.querySelector('.guide-target'), sk = document.querySelector('.mv-guideskip'), ln = document.querySelector('.mv-guideline');
    const r = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); return [Math.round(b.left), Math.round(b.top), Math.round(b.width), Math.round(b.height)]; };
    return { target: t && t.textContent, tr: r(t), skip: r(sk), line: ln && ln.textContent, H: innerHeight, W: innerWidth }; });
  F(g.target === '2' && g.tr && g.tr[1] >= 0 && g.tr[1] + g.tr[3] <= g.H, `guide at 360: the pointer is on the 2 and in view (${JSON.stringify(g)})`);
  F(g.skip && g.skip[3] >= 48 && g.skip[2] >= 48 && g.skip[1] + g.skip[3] <= g.H && g.skip[0] + g.skip[2] <= g.W, `guide at 360: Skip is 48 px and in view (${JSON.stringify(g.skip)})`);
  if (SHOTS) await p.screenshot({ path: `${SHOTS}/guide-360.png` });
  await ctx.close();
}
await b.close();
for (const n of notes) console.log(n); if (fails.length) { console.log('FAIL'); for (const f of fails) console.log(f); process.exit(1); } console.log('PASS');

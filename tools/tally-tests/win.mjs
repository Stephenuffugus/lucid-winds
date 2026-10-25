// node tools/tally-tests/win.mjs [url] [shotdir]   Tally Part 3 gate and look: the win at 412 x 915 and 360 x 640 (the banner, three
// painted stars, the pal's win loop, the confetti frame), the daily tab's card, the splash plate at 0 ms. Repo root or the dist on a port.
import { createRequire } from 'node:module';
const require = createRequire('/workspaces/lucid-winds/x.js'); const puppeteer = require('puppeteer');
const URL = process.argv[2] || 'http://127.0.0.1:8777/satellites/tally/'; const SHOTS = process.argv[3] && process.argv[3] !== '-' ? process.argv[3] : '';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms)); const fails = [], notes = [];
const F = (ok, msg) => (ok ? notes : fails).push(msg);
const OPS = ['+', '-', '*', '/'];
function solutions(pool, target) {   // two and three number expressions, left to right with precedence as the engine evaluates (× ÷ first)
  const out = []; const ev = (a, o, b) => o === '+' ? a + b : o === '-' ? a - b : o === '*' ? a * b : (b !== 0 && a % b === 0 ? a / b : NaN);
  for (let i = 0; i < pool.length; i++) for (let j = 0; j < pool.length; j++) { if (i === j) continue; for (const o of OPS) if (ev(pool[i], o, pool[j]) === target) out.push([pool[i], o, pool[j]]); }
  for (let i = 0; i < pool.length; i++) for (let j = 0; j < pool.length; j++) for (let k = 0; k < pool.length; k++) { if (new Set([i, j, k]).size < 3) continue;
    for (const o1 of ['+', '-']) for (const o2 of ['+', '-']) { const v = ev(ev(pool[i], o1, pool[j]), o2, pool[k]); if (v === target) out.push([pool[i], o1, pool[j], o2, pool[k]]); } }
  return out;
}
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
async function open(seed, w, h) { const ctx = await b.createBrowserContext(); const p = await ctx.newPage();
  await p.setViewport({ width: w, height: h, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await p.evaluateOnNewDocument((s) => { try { localStorage.setItem('lwfb_explained', '1'); window.__seedMeta = s; } catch (e) {} }, seed);
  await p.goto(URL + '?sstest=1', { waitUntil: 'domcontentloaded' }); return { ctx, p }; }
const sym = { '+': '+', '-': '−', '*': '×', '/': '÷' };
for (const [w, h] of [[412, 915], [360, 640]]) {
  const { ctx, p } = await open({ seenIntro: true }, w, h);
  const plateAt0 = await p.evaluate(() => { const e = document.getElementById('mv-splashplate'); return e ? getComputedStyle(e).opacity : 'gone'; });
  if (SHOTS && w === 412) await p.screenshot({ path: `${SHOTS}/splash-0ms-${w}.png` });
  F(plateAt0 !== 'gone', `splash plate present at 0 ms (${plateAt0})`);
  await p.waitForSelector('.mv-beacon-num', { timeout: 15000 }); await sleep(900);
  F(await p.evaluate(() => !document.getElementById('mv-splashplate')), 'the splash plate is gone after mount');
  F(await p.evaluate(() => !!document.querySelector('.mv-wordmark')), 'the wordmark stands in the header');
  const pool = await p.evaluate(() => [...document.querySelectorAll('.mv-tile')].map((t) => parseInt(t.textContent, 10)));
  const target = await p.evaluate(() => parseInt(document.querySelector('.mv-beacon-num').textContent, 10));
  const sols = solutions(pool, target); let next = false;
  for (const sol of sols.slice(0, 10)) {
    for (const x of sol) { const sel = typeof x === 'number' ? await p.evaluateHandle((v) => [...document.querySelectorAll('.mv-tile')].find((t) => parseInt(t.textContent, 10) === v), x) : await p.evaluateHandle((g) => [...document.querySelectorAll('.mv-op')].find((o) => o.textContent === g), sym[x]);
      try { await sel.click(); } catch (e) {} await sleep(60); }
    await sleep(450); next = await p.evaluate(() => !!document.querySelector('.mv-ctrl.next')); if (next) break;
    await p.evaluate(() => { const c = document.querySelector('.mv-ctrl.clear'); if (c) c.click(); }); await sleep(60);
  }
  F(next, `the level is cleared by the driver (${sols.length} solutions for ${pool} = ${target})`);
  if (next) {
    await p.click('.mv-ctrl.next'); await sleep(120);
    if (SHOTS) await p.screenshot({ path: `${SHOTS}/win-${w}.png` });
    const win = await p.evaluate(() => ({ title: !!document.querySelector('.mv-win-title'), banner: !!document.querySelector('.mv-win-banner'), stars: document.querySelectorAll('.mv-starimg').length,
      pal: (document.querySelector('.mv-winpal img') || {}).src || '', confetti: !!document.querySelector('.mv-confetti'), nextBox: (() => { const e = [...document.querySelectorAll('.mv-win-actions button')].pop(); if (!e) return null; const r = e.getBoundingClientRect(); return [r.top, r.bottom, innerHeight]; })() }));
    F(win.title && win.banner && win.stars === 3 && /win_0\d\.webp/.test(win.pal), `${w}: the win shows the banner, three painted stars and the pal's win loop (${JSON.stringify(win)})`);
    F(win.confetti, `${w}: the confetti frame is up right after the win opens`);
    F(win.nextBox && win.nextBox[1] <= win.nextBox[2], `${w}: Next is inside the viewport (${JSON.stringify(win.nextBox)})`);
    await p.click('.mv-win-actions .primary'); await sleep(200);
  }
  await p.evaluate(() => { const e = [...document.querySelectorAll('.mv-navbtn')].find((n) => n.textContent.includes('Daily')); e && e.click(); }); await sleep(300);
  const card = await p.evaluate(() => { const c = document.querySelector('.mv-dailycard'); if (!c) return null; const r = c.getBoundingClientRect(); return { text: c.textContent, w: r.width, h: r.height }; });
  F(card && /Daily for /.test(card.text) && card.w > 200, `${w}: the daily card stands above the target (${card && card.text})`);
  if (SHOTS) await p.screenshot({ path: `${SHOTS}/daily-${w}.png` });
  await ctx.close();
}
await b.close();
for (const n of notes) console.log(n); if (fails.length) { console.log('FAIL'); for (const f of fails) console.log(f); process.exit(1); } console.log('PASS');

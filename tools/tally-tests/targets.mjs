// node tools/tally-tests/targets.mjs [url] [shotdir]
// Tally Part 0 gate: every rendered <button> is a real 48 x 48 CSS px target on Play, How to play, Settings, Map, Daily,
// Shop (Pals, Skins, Boosts) and both previews, at 412 x 915 and 360 x 640, on a fresh save AND on a worst case header
// save (a streak, Double Coins, five digit coins). A button passes when its box is 48 x 48 or more, sits inside the
// viewport once scrolled to, and the hit test at its centre and 20 px up, down, left and right of it lands on the
// button itself (so a clipped or covered button fails). Screens are reached with REAL touches (page.touchscreen.tap,
// CDP touch events), never el.click(), and every tap must reach its screen. Serve the repo root on 8777 first.
import { createRequire } from 'node:module';
const require = createRequire('/workspaces/lucid-winds/x.js');
const puppeteer = require('puppeteer');
const URL = process.argv[2] || 'http://127.0.0.1:8777/satellites/tally/';
const SHOTS = process.argv[3] || '';
const MIN = 48 - 0.01;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const VIEWS = [{ w: 412, h: 915 }, { w: 360, h: 640 }];
const SAVES = [
  { tag: 'fresh', seed: null },
  { tag: 'worst', seed: { seenIntro: true, streak: 7, best: 7, boostUntil: Date.now() + 3600e3, coins: 12345, gems: 99 } },
];

const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const fails = []; const errs = []; let measured = 0;
// SAVE=fresh|worst and VIEW=412|360 narrow a run (the fail watch runs one pass per broken copy)
for (const sv of SAVES.filter((x) => !process.env.SAVE || x.tag === process.env.SAVE)) for (const v of VIEWS.filter((x) => !process.env.VIEW || String(x.w) === process.env.VIEW)) {
  const ctx = await b.createBrowserContext();
  const p = await ctx.newPage();
  p.on('pageerror', (e) => errs.push(String(e).slice(0, 140)));
  await p.setViewport({ width: v.w, height: v.h, deviceScaleFactor: SHOTS ? 2 : 1, isMobile: true, hasTouch: true });
  if (sv.seed) await p.evaluateOnNewDocument((s) => { try { localStorage.setItem('tally:v1', s); } catch (e) {} }, JSON.stringify(sv.seed));
  await p.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });
  await p.waitForSelector('.mv-beacon-num', { timeout: 20000 });
  await sleep(400);
  const tag = `${sv.tag} ${v.w}x${v.h}`;
  const centre = (sel, text) => p.evaluate((sel, text) => {
    // the first match that is really on screen and on top at its centre (a scrolled page may hide the first one)
    const els = [...document.querySelectorAll(sel)].filter((e) => { const r = e.getBoundingClientRect(); if (!(r.width > 0 && r.height > 0 && (!text || e.textContent.includes(text)))) return false;
      const h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!h && e.contains(h); });
    if (!els.length) return null; const r = els[0].getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }, sel, text || '');
  // tap, then wait for the screen it must open (a missed tap would measure the previous screen again)
  const tap = async (sel, text, expect) => {
    const c = await centre(sel, text); if (!c) throw new Error(`${tag}: no target ${sel} ${text || ''}; so far: ${fails.slice(-6).join(' / ')}`);
    await p.touchscreen.tap(c.x, c.y);
    if (expect) {
      const ok = await p.waitForFunction((e) => { const [s, t] = e; return [...document.querySelectorAll(s)].some((n) => n.getBoundingClientRect().width > 0 && (!t || n.textContent.includes(t))); },
        { timeout: 4000 }, expect).then(() => true, () => false);
      if (!ok) fails.push(`${tag}: the tap on ${sel} ${text || ''} did not open ${expect.join(' ')}`);
    }
    await sleep(250);
  };
  const check = async (screen) => {
    const all = await p.evaluate((MIN) => {
      const out = [];
      // with a modal up, the buttons behind its scrim are out of play: measure the modal's own
      const scrim = [...document.querySelectorAll('.mv-scrim')].pop();
      for (const e of (scrim || document).querySelectorAll('button')) {
        let r = e.getBoundingClientRect(); const cs = getComputedStyle(e);
        if (r.width === 0 || r.height === 0 || cs.visibility === 'hidden' || cs.display === 'none') continue;
        // only the pages scroll; scrolling a clipped (overflow hidden) box into view would hide an overflow
        const pg = e.closest('.mv-page');
        if (pg) { const pr = pg.getBoundingClientRect(); pg.scrollTop += (r.top + r.height / 2) - (pr.top + pr.height / 2); r = e.getBoundingClientRect(); }
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2; const bad = [];
        if (r.width < MIN || r.height < MIN) bad.push(`box ${r.width.toFixed(1)}x${r.height.toFixed(1)}`);
        if (r.left < -0.5 || r.top < -0.5 || r.right > innerWidth + 0.5 || r.bottom > innerHeight + 0.5) bad.push(`outside the viewport (${r.left.toFixed(0)},${r.top.toFixed(0)},${r.right.toFixed(0)},${r.bottom.toFixed(0)})`);
        for (const [dx, dy] of [[0, 0], [0, -20], [0, 20], [-20, 0], [20, 0]]) {
          const h = document.elementFromPoint(cx + dx, cy + dy);
          if (!h || !e.contains(h)) { bad.push(`hit at ${dx},${dy} lands on ${h ? (h.className || h.tagName).toString().slice(0, 30) : 'nothing'}`); break; }
        }
        out.push({ name: (e.getAttribute('aria-label') || e.textContent || e.className).trim().slice(0, 36), bad });
      }
      for (const s of document.querySelectorAll('.mv-page')) s.scrollTop = 0;   // leave the screen as the player had it
      return out;
    }, MIN);
    measured += all.length;
    for (const x of all) if (x.bad.length) fails.push(`${tag} ${screen}: "${x.name}" ${x.bad.join('; ')}`);
  };
  try {
  if (await centre('.mv-howto')) { await check('How to play (first run)'); await tap('.mv-modal .mv-btn.primary'); }
  if (SHOTS && sv.tag === 'worst') await p.screenshot({ path: `${SHOTS}/worst-${v.w}.png` });
  if (SHOTS && sv.tag === 'fresh') await p.screenshot({ path: `${SHOTS}/play-${v.w}.png` });
  await check('Play');
  await tap('[aria-label="How to play"]', '', ['.mv-howto']); await check('How to play'); await tap('.mv-modal .mv-btn.primary');
  await tap('[aria-label="Settings"]', '', ['.mv-setrow']); await check('Settings');
  await tap('.mv-modal-head .mv-icobtn');
  await tap('.mv-navbtn', 'Map', ['.mv-worldcard']); await check('Map');
  await tap('.mv-navbtn', 'Daily', ['.mv-eyebrow', 'Daily']); await check('Daily');
  await tap('.mv-navbtn', 'Shop', ['.mv-palswatch']); await check('Shop Pals');
  if (SHOTS && v.w === 360 && sv.tag === 'fresh') await p.screenshot({ path: `${SHOTS}/shop-pals-360.png` });
  await tap('.mv-palswatch', '', ['.mv-preview']); await check('Pal preview'); await tap('.mv-preview-x');
  await tap('.mv-shoptab', 'Skins', ['.mv-skinswatch']); await check('Shop Skins');
  await tap('.mv-skinswatch', '', ['.mv-preview']); await check('Skin preview'); await tap('.mv-preview-x');
  await tap('.mv-shoptab', 'Boosts', ['.mv-boostcard']); await check('Shop Boosts');
  await tap('.mv-navbtn', 'Stats', ['.mv-navbtn.active', 'Stats']); await check('Stats');
  } catch (err) { fails.push(String(err.message).split('; so far')[0]); }   // a pass that cannot go on is a failure, the others still run
  await ctx.close();
}
await b.close();
console.log(`measured ${measured} rendered buttons`);
if (errs.length) console.log('page errors:', errs.join(' | '));
if (measured < (process.env.SAVE || process.env.VIEW ? 60 : 200)) fails.push('too few buttons measured: ' + measured);
console.log(fails.length ? 'FAIL\n' + fails.join('\n') : 'PASS every rendered button is a real 48 x 48 target');
process.exit(fails.length || errs.length ? 1 : 0);

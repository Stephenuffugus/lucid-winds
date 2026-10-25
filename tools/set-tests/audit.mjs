// node tools/set-tests/audit.mjs [shotdir]   Three Sisters standalone gate and look (Part 1, the painted deck). Repo root on 8777.
import { createRequire } from 'node:module';
const require = createRequire('/workspaces/lucid-winds/x.js'); const puppeteer = require('puppeteer');
const SHOTS = process.argv[2] && process.argv[2] !== '-' ? process.argv[2] : ''; const URL = 'http://127.0.0.1:8777/play/' + (process.env.TS_PAGE || 'set.html') + '?sstest=1';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms)); const fails = [], notes = []; const F = (ok, msg) => (ok ? notes : fails).push(msg);
const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
async function open(w, h, extra) { const ctx = await b.createBrowserContext(); const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(String(e.message || e).slice(0, 140)));
  await p.setViewport({ width: w, height: h, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await p.evaluateOnNewDocument((x) => { try { localStorage.setItem('sws_dir_set', '1'); localStorage.setItem('lwfb_explained', '1'); if (x) for (const k in x) localStorage.setItem(k, x[k]); } catch (e) {} }, extra || null);
  if (extra && extra.__reduce) await p.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await p.goto(URL, { waitUntil: 'networkidle0', timeout: 60000 }); await p.waitForSelector('.ts-card', { timeout: 20000 }); await sleep(600); return { ctx, p, errs }; }
const rect = (p, sel, i) => p.evaluate((sel, i) => { const e = document.querySelectorAll(sel)[i || 0]; if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, top: r.top, bottom: r.bottom }; }, sel, i);
const tapCard = async (p, i) => { const els = await p.$$('.ts-card'); if (!els[i]) return false; await els[i].scrollIntoViewIfNeeded(); await els[i].tap(); return true; };
const tapText = async (p, sel, text) => { const els = await p.$$(sel); for (const el of els) { const t = await el.evaluate((n) => n.textContent.trim()); if (t.indexOf(text) === 0) { await el.scrollIntoViewIfNeeded(); await el.tap(); return true; } } notes.push('(no ' + sel + ' starting with ' + text + ')'); return false; };
const BAD = /[!‐-―]|[A-Za-z]-[A-Za-z]| - /;
{ // a. the table at 412: twelve painted cards, every glyph and seal loaded, no page errors; the copy law
  const { ctx, p, errs } = await open(412, 915);
  const t = await p.evaluate(async () => { const cards = [...document.querySelectorAll('.ts-card')]; const imgs = [...document.querySelectorAll('.ts-card img')]; await Promise.all(imgs.map((i) => i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; }))); return { n: cards.length, imgs: imgs.length, broken: imgs.filter((i) => !i.naturalWidth).map((i) => i.src.split('/').pop()), seals: document.querySelectorAll('.ts-seal').length, pressed: document.querySelectorAll('.ts-card[aria-pressed="true"]').length, label: cards[0] && cards[0].getAttribute('aria-label'), text: (document.querySelector('.ts-table') || {}).textContent }; });
  F(t.n === 12 && t.seals === 12 && t.pressed === 0, `twelve painted cards with a seal each (${t.n}, seals ${t.seals})`);
  F(t.imgs >= 24 && t.broken.length === 0, `every glyph and seal image loaded (${t.imgs} images, broken ${JSON.stringify(t.broken)})`);
  F(/^Card 1: [123] (corn|bean|squash)( shapes)?, (gold|blue|rose) \((sun|wave|leaf) seal\), (solid|striped|empty) fill$/.test(t.label || ''), `the accessible name reads the four traits (${t.label})`);
  F(!BAD.test((t.text || '').replace(/\s+/g, ' ')), 'no exclamation marks and no dashes in the table copy');
  const a0 = await p.evaluate(() => window.__ts.audio().created); F(a0 === 0, 'no audio context before a gesture');
  // b. a trio found by real taps: the count climbs, the three leave, the board refills, the first card takes focus
  const trio = await p.evaluate(() => window.__ts.trio()); F(!!trio, 'a trio exists on the dealt board');
  if (trio) { for (const i of trio) { await tapCard(p, i); await sleep(120); } if (SHOTS) await p.screenshot({ path: `${SHOTS}/trio-412.png` }); await sleep(900);
    const s = await p.evaluate(() => Object.assign(window.__ts.state(), { n: document.querySelectorAll('.ts-card').length, focused: (document.activeElement || {}).className })); F(s.found === 1 && s.n === 12 && s.deck === 66 && s.selected.length === 0, `a real trio counts and the board refills (${JSON.stringify(s)})`); }
  const a1 = await p.evaluate(() => window.__ts.audio().created); F(a1 === 1, 'one audio context after the taps');
  // c. a wrong trio stays on the table and is explained by the trait that failed; the next tap clears it
  const bad = await p.evaluate(() => { for (let i = 0; i < 12; i++) for (let j = i + 1; j < 12; j++) for (let k = j + 1; k < 12; k++) if (window.__ts.failed(i, j, k).length) return [i, j, k]; return null; });
  if (bad) { for (const i of bad) { await tapCard(p, i); await sleep(100); } await sleep(300);
    const w = await p.evaluate(() => ({ line: document.getElementById('ts-line').textContent, pressed: document.querySelectorAll('.ts-card[aria-pressed="true"]').length, found: window.__ts.state().found }));
    F(/^Check (shape|colour|fill|count)( and (shape|colour|fill|count))*: two match and one differs\.$/.test(w.line) && w.pressed === 3 && w.found === 1, `a wrong trio is explained and kept (${JSON.stringify(w)})`);
    if (SHOTS) await p.screenshot({ path: `${SHOTS}/wrong-412.png` });
    const other = [0, 1, 2, 3, 4, 5].find((i) => bad.indexOf(i) < 0); await tapCard(p, other); await sleep(150);
    F((await p.evaluate(() => document.querySelectorAll('.ts-card[aria-pressed="true"]').length)) === 1, 'the next tap clears a kept wrong trio and starts fresh'); }
  // d. the settings sheet: larger and labels and motion change the board, and survive a reload
  await tapText(p, '.gcr button', 'Settings'); await sleep(300);
  F(await p.evaluate(() => document.getElementById('ts-settings').classList.contains('open')), 'the settings sheet opens (' + (await p.evaluate(() => [...document.querySelectorAll('.gcr button')].map((b) => b.textContent).join('|') + ' sheet ' + document.getElementById('ts-settings').className)) + ')');
  if (SHOTS) await p.screenshot({ path: `${SHOTS}/settings-412.png` });
  await tapText(p, '#ts-larger', 'Off'); await tapText(p, '#ts-labels', 'Off'); await tapText(p, '#ts-motion', 'Follows'); await sleep(200);
  await tapText(p, '#ts-close', 'Done'); await sleep(200);
  await p.reload({ waitUntil: 'networkidle0' }); await p.waitForSelector('.ts-card'); await sleep(500);
  const st = await p.evaluate(() => Object.assign({}, window.__ts.settings(), { large: document.getElementById('ts-board').classList.contains('large'), labels: document.querySelectorAll('.ts-label').length, nomotion: document.querySelector('.ts-nomotion') !== null }));
  F(st.larger === true && st.large && st.labels === 12 && st.motion === 'off' && st.nomotion, `settings survive a reload and shape the board (${JSON.stringify(st)})`);
  if (SHOTS) await p.screenshot({ path: `${SHOTS}/large-labels-412.png` });
  F(errs.length === 0, `no page errors (${JSON.stringify(errs)})`);
  await ctx.close(); }
{ // e. reduced motion from the phone: a trio found shows no frame and no flight
  const { ctx, p } = await open(412, 915, { __reduce: 1 });
  const trio = await p.evaluate(() => window.__ts.trio()); let fx = 0, fly = 0;
  for (const i of trio) { await tapCard(p, i); await sleep(60); }
  for (let k = 0; k < 10; k++) { const c = await p.evaluate(() => [document.querySelectorAll('.ts-fx').length, document.querySelectorAll('.flying').length]); fx = Math.max(fx, c[0]); fly = Math.max(fly, c[1]); await sleep(40); }
  const okm = await p.evaluate(() => window.__ts.state().found === 1 && document.querySelector('.ts-nomotion') !== null);
  F(okm && fx === 0 && fly === 0, `under reduced motion a trio counts with no frames and no flight (frames ${fx}, flights ${fly})`);
  await ctx.close(); }
{ // f. the Daily ends on her results card and is locked in; at 360 the cards stay 40 px glyphs in three columns
  const { ctx, p } = await open(360, 640);
  await tapText(p, '.ts-pill', 'DAILY'); await sleep(400); await p.evaluate(() => window.__ts.setDailyTarget(1));
  const g = await p.evaluate(() => { const i = document.querySelector('.ts-symbols img').getBoundingClientRect(); const cols = getComputedStyle(document.getElementById('ts-board')).gridTemplateColumns.split(' ').length; return { w: i.width, cols, scrollW: document.documentElement.scrollWidth, vw: innerWidth }; });
  F(g.w >= 40 && g.cols === 3 && g.scrollW <= g.vw, `at 360 the glyph box is 40 px or more in three columns with no sideways scroll (${JSON.stringify(g)})`);
  if (SHOTS) await p.screenshot({ path: `${SHOTS}/daily-360.png` });
  const trio = await p.evaluate(() => window.__ts.trio()); for (const i of trio) { await tapCard(p, i); await sleep(120); } await sleep(1100);
  const r = await p.evaluate(() => ({ open: document.getElementById('ts-results').classList.contains('open'), title: document.getElementById('ts-r-title').textContent, big: document.getElementById('ts-r-big').textContent, rec: JSON.parse(localStorage.getItem('lw_set_daily') || 'null') }));
  F(r.open && /^Daily Trio #\d+$/.test(r.title) && /^1 trios in \d+:\d\d$/.test(r.big) && r.rec && r.rec.done === true && r.rec.trios === 1, `the Daily ends on the results card, locked in (${JSON.stringify(r)})`);
  if (SHOTS) await p.screenshot({ path: `${SHOTS}/results-360.png` });
  await ctx.close(); }
await b.close();
for (const n of notes) console.log('  ✓ ' + n); for (const f of fails) console.log('  ✗ ' + f);
console.log(`three-sisters: ${notes.length} passed, ${fails.length} failed`); process.exit(fails.length ? 1 : 0);

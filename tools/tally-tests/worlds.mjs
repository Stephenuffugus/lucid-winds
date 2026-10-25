// node tools/tally-tests/worlds.mjs [url] [shotdir]   Tally Part 2 gate: the seven worlds and the painted map.
// Play at 412 x 915 in each world (seeded level 1, 9, 17, 25, 33, 41, 49) on Abacus (light) and Arcade (dark): every
// text that stands on the plate (the world row, the "find N ways" line) and the numbers (the target's, a bead's) reach
// 4.5:1 against what is really behind them, computed from the pixels: the text is hidden, its box is shot, and the
// worst 5 percent of those background pixels is measured against the text's colour. The map at 360 wide: every level
// button inside the viewport and its panel, 48 x 48 or more. Shots with a shotdir. One browser; repo root on 8777.
import { createRequire } from 'node:module';
const require = createRequire('/workspaces/lucid-winds/x.js');
const puppeteer = require('puppeteer');
const URL = process.argv[2] || 'http://127.0.0.1:8777/satellites/tally/';
const SHOTS = process.argv[3] && process.argv[3] !== '-' ? process.argv[3] : '';
const ONLY = process.env.ONLY || '';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fails = [], notes = [], errs = [];
const F = (ok, msg) => (ok ? notes : fails).push(msg);
const lum = (r, g, b) => { const c = [r, g, b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
const parseRGB = (s) => (s.match(/[\d.]+/g) || []).slice(0, 3).map(Number);

const b = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
async function open(seed, w, h) {
  const ctx = await b.createBrowserContext(); const p = await ctx.newPage();
  p.on('pageerror', (e) => errs.push(String(e).slice(0, 140)));
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await p.evaluateOnNewDocument((s) => { try { localStorage.setItem('tally:v1', s); } catch (e) {} }, JSON.stringify(seed));
  await p.goto(URL, { waitUntil: 'networkidle0', timeout: 60000 }); await p.waitForSelector('.mv-beacon-num'); await sleep(900);
  return { ctx, p };
}
// the contrast of one element's text against its own background, from the pixels
async function contrastOf(p, sel) {
  const info = await p.evaluate((sel) => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height, color: getComputedStyle(e).color }; }, sel);
  if (!info || info.w < 2) return null;
  await p.addStyleTag({ content: `${sel}, ${sel} * { color: transparent !important; text-shadow: none !important; } ${sel} svg, ${sel} img { visibility: hidden !important; }` });
  await sleep(150);
  const b64 = await p.screenshot({ encoding: 'base64', clip: { x: Math.max(0, info.x), y: Math.max(0, info.y), width: Math.max(2, info.w), height: Math.max(2, info.h) } });
  /* the shot decoded in a canvas (no PNG library here): every pixel's relative luminance */
  const L = await p.evaluate((b64) => new Promise((res) => { const im = new Image(); im.onload = () => { const c = document.createElement('canvas'); c.width = im.width; c.height = im.height;
    const g = c.getContext('2d'); g.drawImage(im, 0, 0); const d = g.getImageData(0, 0, c.width, c.height).data, out = [];
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    for (let i = 0; i < d.length; i += 4) out.push(0.2126 * f(d[i]) + 0.7152 * f(d[i + 1]) + 0.0722 * f(d[i + 2])); res(out); }; im.src = 'data:image/png;base64,' + b64; }), b64);
  const tc = parseRGB(info.color), tl = lum(tc[0], tc[1], tc[2]);
  const rs = L.map((l) => ratio(l, tl)).sort((a, b2) => a - b2);
  return +rs[Math.floor(rs.length * 0.05)].toFixed(2);
}
const LEVELS = [1, 9, 17, 25, 33, 41, 49], WORLD = ['meadow', 'bay', 'candy', 'city', 'valley', 'space', 'endless'];
if (!ONLY || ONLY === 'contrast') for (const skin of ['abacus', 'neon']) for (let k = 0; k < LEVELS.length; k++) {
  const seed = { seenIntro: true, level: LEVELS[k], skin, owned: ['abacus', 'twilight', 'sunrise', 'neon'] };
  const { ctx, p } = await open(seed, 412, 915);
  const world = await p.evaluate(() => (document.querySelector('.mv-board') || {}).getAttribute && document.querySelector('.mv-board').getAttribute('data-world'));
  F(world === WORLD[k], `${skin} level ${LEVELS[k]} stands on ${WORLD[k]} (got ${world})`);
  if (SHOTS && skin === 'abacus') await p.screenshot({ path: `${SHOTS}/play-${WORLD[k]}.png` });
  for (const [name, sel] of [['the world row', '.mv-eyebrow-btn'], ['the ways line', '.mv-finds-empty'], ['the target number', '.mv-beacon-num'], ['a bead number', '.mv-tile span']]) {
    const c = await contrastOf(p, sel);
    F(c !== null && c >= 4.5, `${skin} ${WORLD[k]}: ${name} ${c}:1 >= 4.5`);
  }
  await ctx.close();
}
if (!ONLY || ONLY === 'map') for (const [lv, tag] of [[8, 'meadow'], [57, 'endless']]) {
  const { ctx, p } = await open({ seenIntro: true, level: lv }, 360, 640);
  const c = await p.evaluate(() => { const e = [...document.querySelectorAll('.mv-navbtn')].find((n) => n.textContent.includes('Map')); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  await p.touchscreen.tap(c.x, c.y); await sleep(900);
  const r = await p.evaluate(() => [...document.querySelectorAll('.mv-mappanel')].map((s) => { const pr = s.getBoundingClientRect();
    return [...s.querySelectorAll('.mv-lvl')].map((bt) => { const q = bt.getBoundingClientRect(); return { l: q.left, r: q.right, t: q.top - pr.top, b: q.bottom - pr.top, w: q.width, h: q.height, pw: pr.width, ph: pr.height, pl: pr.left }; }); }).flat());
  const bad = r.filter((q) => q.l < -0.5 || q.r > 360.5 || q.w < 48 || q.h < 48 || q.t < -0.5 || q.b > q.ph + 0.5 || q.l < q.pl - 0.5 || q.r > q.pl + q.pw + 0.5);
  F(r.length >= 8 && bad.length === 0, `map at 360 (level ${lv}): ${r.length} buttons inside the viewport and their panels, 48 or more (${bad.length} bad${bad.length ? ': ' + JSON.stringify(bad[0]) : ''})`);
  if (SHOTS) { await p.screenshot({ path: `${SHOTS}/map-${tag}.png` }); }
  await ctx.close();
}
await b.close();
if (errs.length) fails.push('page errors: ' + errs.join(' | '));
console.log(notes.join('\n'));
console.log(fails.length ? 'FAIL\n' + fails.join('\n') : 'PASS');
process.exit(fails.length ? 1 : 0);

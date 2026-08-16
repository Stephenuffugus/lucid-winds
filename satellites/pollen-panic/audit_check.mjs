#!/usr/bin/env node
/* POLLEN PANIC — audit assertion suite (2026-08-16).
 *
 * Run from the repo root:   node satellites/pollen-panic/audit_check.mjs
 * Serves the REPO ROOT (so /feedback.js, /arcade-exit.js and /sunbeam-sdk.js
 * resolve the way they do in production) and drives the real page in headless
 * Chrome at 375x667.
 *
 * Every assertion in here was watched FAIL on purpose before it was trusted
 * green. A probe that cannot fail is not evidence.
 */
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SLUG = 'pollen-panic';
const MIME = { '.html':'text/html', '.js':'text/javascript', '.mjs':'text/javascript',
  '.css':'text/css', '.json':'application/json', '.webmanifest':'application/manifest+json',
  '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.svg':'image/svg+xml',
  '.woff2':'font/woff2', '.ico':'image/x-icon' };

function serve(){
  return new Promise(res => {
    const s = http.createServer((req, rep) => {
      let p = decodeURIComponent(req.url.split('?')[0]);
      if (p.endsWith('/')) p += 'index.html';
      const f = path.join(ROOT, p);
      if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
        rep.writeHead(404); rep.end('nope'); return;
      }
      rep.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' });
      fs.createReadStream(f).pipe(rep);
    });
    s.listen(0, () => res(s));
  });
}

let pass = 0, fail = 0;
const results = [];
function ok(name, cond, detail){
  if (cond) { pass++; results.push(['PASS', name, '']); }
  else { fail++; results.push(['FAIL', name, detail === undefined ? '' : String(detail)]); }
}

const FAB = vp => ({ l: vp.w - 90, r: vp.w - 12, t: vp.h - 174, b: vp.h - 96 });

/* Measure every visible control and return the ones under 48 RENDERED px.
   Rendered, not declared: these stages are transform-scaled, which is exactly
   how a blanket CSS min-height:48px made this worse rather than better. */
const TOUCH_PROBE = `(() => {
  const bad = [];
  const sel = 'button,a[href],input,select,[role="button"],.toggle,.wardcard,.pat,.shopbtn,.dailybtn,.modecard button,.shoprow button,.card .act,.usecustom';
  document.querySelectorAll(sel).forEach(el => {
    if (el.closest('.lwfb-fab, #lwfb-bg')) return;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    if (r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) return;
    // a wrapper may extend the tap zone with a pseudo element; take the union
    let h = r.height, w = r.width;
    for (const pe of ['::before','::after']) {
      const p = getComputedStyle(el, pe);
      if (!p || p.content === 'none') continue;
      const num = v => (v && v !== 'auto') ? parseFloat(v) : 0;
      const grow = (a,b) => (num(a) < 0 ? -num(a) : 0) + (num(b) < 0 ? -num(b) : 0);
      h += grow(p.top, p.bottom); w += grow(p.left, p.right);
    }
    if (h < 47.5 || w < 47.5) bad.push({ id: el.id || el.className || el.tagName, w: +w.toFixed(1), h: +h.toFixed(1), text: (el.textContent||'').trim().slice(0,24) });
  });
  return bad;
})()`;

/* Anything TAPPABLE sitting under the feedback fab's footprint. The root
   feedback.js has a FAB YIELD pass that is supposed to park the chip off
   controls; this asserts it actually did, on this page, rather than assuming. */
const FAB_PROBE = `(box => {
  const SEL = 'button,a[href],input,select,[role="button"],.toggle,.wardcard,.pat,.cup-wrap,.shopbtn,.dailybtn,.modecard,.card .act';
  const f = document.querySelector('.lwfb-fab');
  if (!f) return { mounted: false };
  const cs = getComputedStyle(f);
  const r = f.getBoundingClientRect();
  // The fab yields by fading to opacity:0 / pointer-events:none. That is a PASS:
  // it is not eating anything. The defect is an INTERACTIVE fab painted on top
  // of a control, so test that, not the raw geometry.
  const inert = (+cs.opacity === 0) || cs.pointerEvents === 'none' ||
                cs.display === 'none' || cs.visibility === 'hidden';
  const pts = [[r.x+6, r.y+6], [r.right-6, r.y+6], [r.x+6, r.bottom-6],
               [r.right-6, r.bottom-6], [r.x+r.width/2, r.y+r.height/2]];
  const under = new Set(); let ownsAPoint = false;
  for (const [x, y] of pts) {
    const stack = document.elementsFromPoint(x, y);
    if (stack.length && stack[0].closest && stack[0].closest('.lwfb-fab')) ownsAPoint = true;
    for (const el of stack) {
      if (el.closest && el.closest('.lwfb-fab, #lwfb-bg')) continue;
      const c = el.closest && el.closest(SEL);
      if (c) { under.add((c.id || c.className || c.tagName) + '|' + (c.textContent||'').trim().slice(0,18)); break; }
    }
  }
  return { mounted: true, inert: inert, eats: (!inert && ownsAPoint && under.size > 0),
           under: [...under], rect: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)],
           opacity: cs.opacity };
})`;

/* Dashes in copy the player can actually see. Comments do not count. */
const DASH_PROBE = `(() => {
  const bad = [];
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = w.nextNode())) {
    const p = n.parentElement;
    if (!p || p.closest('script,style,.lwfb-fab,#lwfb-bg')) continue;
    const cs = getComputedStyle(p);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    if (/[\u2013\u2014]/.test(n.nodeValue)) bad.push(n.nodeValue.trim().slice(0,70));
  }
  return bad;
})()`;

const server = await serve();
const PORT = server.address().port;
const URL0 = `http://127.0.0.1:${PORT}/satellites/pollen-panic/`;
const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--disable-dev-shm-usage'] });

async function open(seed = null){
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message || e)));
  if (seed) { await page.goto(URL0, { waitUntil: 'domcontentloaded' }); await page.evaluate(s => { for (const k in s) localStorage.setItem(k, s[k]); }, seed); }
  await page.goto(URL0, { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 900));
  return { ctx, page, errs };
}
const modeButtons = p => p.evaluate(() => document.querySelectorAll('#modeList .modecard button').length);

// ---- 1. boots clean, the menu is real
{
  const { ctx, page, errs } = await open();
  ok('boots with no page error', errs.length === 0, errs[0]);
  ok('all four modes render a button', await modeButtons(page) === 4, 'got ' + await modeButtons(page));
  ok("today's missions render", await page.evaluate(() => (document.getElementById('missionBox').textContent||'').length > 10));
  await ctx.close();
}

// ---- 2. corrupt save (standing classes 3 and 5) — the page used to die silently
const POISONS = {
  'owned is not an array': { owned: 3 },
  'skin names nothing':    { skin: 'nope' },
  'theme names nothing':   { theme: 'nope' },
  'bests is not an object':{ bests: 3 },
  'top is not an object':  { top: 3 },
  'missions is not an object': { missions: 3 },
  'the whole save is a string': 'wrecked'
};
for (const [name, poison] of Object.entries(POISONS)) {
  const { ctx, page, errs } = await open({ 'pollen-save': JSON.stringify(poison) });
  const btns = await modeButtons(page);
  ok('corrupt save (' + name + '): the mode list still builds', btns === 4, 'got ' + btns);
  const started = await page.evaluate(async () => {
    const b = document.querySelector('#modeList .modecard button');
    if (!b || b.disabled) return 'no play button';
    b.click();
    await new Promise(r => setTimeout(r, 300));
    return document.getElementById('menu').classList.contains('hidden') ? 'ok' : 'menu still up';
  });
  ok('corrupt save (' + name + '): a game actually starts', started === 'ok', started);
  ok('corrupt save (' + name + '): no page error', errs.length === 0, errs[0]);
  await ctx.close();
}

// ---- 3. exit affordance exists AND something calls it (standing class 1)
{
  const { ctx, page } = await open();
  ok('SWS_EXIT is defined', await page.evaluate(() => typeof window.SWS_EXIT === 'function'));
  const r = await page.evaluate(() => {
    window.__exit = 0; window.SWS_EXIT = () => { window.__exit++; };
    const b = document.getElementById('lwExit');
    if (!b) return { found: 0 };
    b.click();
    return { found: 1, called: window.__exit };
  });
  ok('the menu exit control invokes SWS_EXIT', r.found === 1 && r.called === 1, JSON.stringify(r));
  await ctx.close();
}

// ---- 4. two tabs must not clobber (standing class 4)
{
  const { ctx, page } = await open();
  await page.evaluate(async () => {
    localStorage.setItem('pollen-save', JSON.stringify({
      petals: 777, bests: { classic: 4242, meadow: 0, superb: 0, rush: 0 },
      owned: ['ladybug','day','dot','none','classic','bee'],
      top: { classic: [{ s: 5555, d: 'x' }] } }));
    document.querySelector('#modeList .modecard button').click();
    await new Promise(r => setTimeout(r, 200));
    await window.gameOver(false);
  });
  const after = await page.evaluate(() => JSON.parse(localStorage['pollen-save']));
  ok('two tabs: petals from the other tab survive and add', after.petals >= 777, 'petals=' + after.petals);
  ok('two tabs: best from the other tab survives (MAX)', after.bests.classic >= 4242, 'best=' + after.bests.classic);
  ok('two tabs: purchases from the other tab survive', after.owned.indexOf('bee') >= 0, JSON.stringify(after.owned));
  ok('two tabs: the top-5 board merges both tabs', (after.top.classic || []).some(r => r.s === 5555), JSON.stringify(after.top.classic));
  ok('two tabs: the merge actually ran (this run was written too)',
    (after.top.classic || []).length >= 2, 'top.classic=' + JSON.stringify(after.top.classic));
  await ctx.close();
}

// ---- 5. touch targets, RENDERED, at 375x667 (standing class 6)
{
  const { ctx, page } = await open();
  ok('menu: no control under 48 rendered px', (await page.evaluate(TOUCH_PROBE)).length === 0, JSON.stringify(await page.evaluate(TOUCH_PROBE)).slice(0,200));
  await page.click('#btnShop');
  await new Promise(r => setTimeout(r, 300));
  const bad = await page.evaluate(TOUCH_PROBE);
  ok('nursery: no control under 48 rendered px', bad.length === 0, JSON.stringify(bad).slice(0, 200));
  await ctx.close();
}

// ---- 6. dashes, and a promise the copy makes (standing class 7)
{
  const { ctx, page } = await open();
  const bad = await page.evaluate(DASH_PROBE);
  ok('no dashes in visible player copy', bad.length === 0, JSON.stringify(bad).slice(0, 200));
  const gustCopy = await page.evaluate(() => document.getElementById('howRules').textContent);
  ok('the GUST copy matches what GUST does', !/nearby/i.test(gustCopy) && /every loose pest/i.test(gustCopy), gustCopy.match(/GUST[^.]*\./) || 'no gust line');
  await ctx.close();
}

// ---- 7. the feedback fab must not sit on a control (standing classes 2 and 8)
{
  const { ctx, page } = await open();
  const box = FAB({ w: 375, h: 667 });
  await new Promise(r => setTimeout(r, 2600));
  ok('fab mounted at all', await page.evaluate(() => !!document.querySelector('.lwfb-fab')));
  let hits = await page.evaluate(FAB_PROBE + '(' + JSON.stringify(box) + ')');
  ok('menu sheet: nothing tappable under the feedback fab', hits.mounted && !hits.eats, JSON.stringify(hits).slice(0, 260));
  await page.click('#btnShop');
  await new Promise(r => setTimeout(r, 2600));
  hits = await page.evaluate(FAB_PROBE + '(' + JSON.stringify(box) + ')');
  ok('nursery sheet: nothing tappable under the feedback fab', hits.mounted && !hits.eats, JSON.stringify(hits).slice(0, 260));
  await ctx.close();
}

// ---- 8. difficulty is real, not flat
{
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true });
  await page.goto(URL0 + '?pptest=1', { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 700));
  ok('test rig is available under ?pptest=1', await page.evaluate(() => !!window.__pp));
  const d = await page.evaluate(() => window.__pp.curve());
  ok('pest speed ramps with level', d[1].speed < d[5].speed && d[5].speed < d[10].speed, JSON.stringify(d));
  ok('the first two levels are eased for a new player', d[1].ease < 1 && d[2].ease < 1 && d[5].ease === 1, JSON.stringify([d[1].ease, d[2].ease, d[5].ease]));
  ok('drones scale in as levels climb', d[1].drones === 0 && d[2].drones === 1 && d[10].drones > d[2].drones, JSON.stringify([d[1].drones, d[2].drones, d[10].drones]));
  ok('the maze actually rotates', new Set([d[1].maze, d[5].maze, d[10].maze, d[20].maze]).size > 1, JSON.stringify([d[1].maze, d[5].maze, d[10].maze, d[20].maze]));
  await ctx.close();
}

await browser.close();
server.close();
report();

function report(){
  for (const [s, n, d] of results) console.log(`  ${s === 'PASS' ? '\u2713' : '\u2717'} ${n}${d ? '  ->  ' + d : ''}`);
  console.log(`\n${SLUG}: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}

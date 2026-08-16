#!/usr/bin/env node
/* BUBBLENAUT — audit assertion suite (2026-08-16).
 *
 * Run from the repo root:   node satellites/bubblenaut/audit_check.mjs
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
const SLUG = 'bubblenaut';
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
  const sel = 'button,a[href],input,select,[role="button"],.toggle,.wardcard,.pat,.day,.modecard button,.shoprow button,.card .act';
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
  const pts = [[box.l+8,box.t+8],[box.r-8,box.t+8],[box.l+8,box.b-8],[box.r-8,box.b-8],
               [(box.l+box.r)/2,(box.t+box.b)/2]];
  const hits = new Set();
  for (const [x,y] of pts) {
    for (const el of document.elementsFromPoint(x,y)) {
      if (el.closest && el.closest('.lwfb-fab, #lwfb-bg')) continue;
      const c = el.closest && el.closest('button,a[href],input,select,[role="button"],.toggle,.wardcard,.pat,.cup-wrap,.shopbtn,.dailybtn');
      if (c) { hits.add((c.id || c.className || c.tagName) + '|' + (c.textContent||'').trim().slice(0,20)); }
    }
  }
  return [...hits];
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
const URL0 = `http://127.0.0.1:${PORT}/satellites/bubblenaut/`;
const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--disable-dev-shm-usage'] });

async function open(seed = null, touch = true){
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport({ width: 375, height: 667, isMobile: touch, hasTouch: touch, deviceScaleFactor: 2 });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message || e)));
  if (seed) { await page.goto(URL0, { waitUntil: 'domcontentloaded' }); await page.evaluate(s => { for (const k in s) localStorage.setItem(k, s[k]); }, seed); }
  await page.goto(URL0, { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 800));
  return { ctx, page, errs };
}
const resume = p => p.evaluate(() => {
  const b = document.getElementById('b-resume');
  return { shown: getComputedStyle(b).display !== 'none', label: b.textContent.trim() };
});

// ---- 1. boots clean
{
  const { ctx, page, errs } = await open();
  ok('boots with no page error', errs.length === 0, errs[0]);
  ok('title screen is visible', await page.$eval('#s-title', e => e.classList.contains('on')));
  ok('the test rig is exposed', await page.evaluate(() => !!window.__bn));
  await ctx.close();
}

// ---- 2. THE CONTINUE BUTTON MUST SURVIVE NAVIGATION
//         It used to be re-hidden by every show('s-title'), so a player who
//         reached room 14 and glanced at their Collection was sent back to room 1.
{
  const { ctx, page } = await open({ bn_furthest: '13', bn_seen: '1' });
  let r = await resume(page);
  ok('continue is offered on boot when a voyage was saved', r.shown && /room 14/.test(r.label), JSON.stringify(r));
  await page.click('#b-how'); await new Promise(r2 => setTimeout(r2, 250));
  await page.click('#how-back'); await new Promise(r2 => setTimeout(r2, 250));
  r = await resume(page);
  ok('continue survives a trip through How To Play', r.shown && /room 14/.test(r.label), JSON.stringify(r));
  await page.click('#b-col'); await new Promise(r2 => setTimeout(r2, 250));
  await page.click('#col-back'); await new Promise(r2 => setTimeout(r2, 250));
  r = await resume(page);
  ok('continue survives a trip through the Collection', r.shown && /room 14/.test(r.label), JSON.stringify(r));
  await page.click('#b-set'); await new Promise(r2 => setTimeout(r2, 250));
  await page.click('#set-back'); await new Promise(r2 => setTimeout(r2, 250));
  r = await resume(page);
  ok('continue survives a trip through Settings', r.shown && /room 14/.test(r.label), JSON.stringify(r));
  const lvl = await page.evaluate(async () => { document.getElementById('b-resume').click(); await new Promise(x => setTimeout(x, 400)); return window.__bn.state.level; });
  ok('continue actually resumes at the saved room', lvl === 13, 'resumed at level index ' + lvl);
  await ctx.close();
}
{
  const { ctx, page } = await open({ bn_seen: '1' });
  const r = await resume(page);
  ok('continue is hidden for a brand new player', !r.shown, JSON.stringify(r));
  await ctx.close();
}

// ---- 3. corrupt save (standing class 3)
{
  // a FIVE CHARACTER STRING passed the old c.length===5 test, and "use strict"
  // then threw on COLLECT[i]++ inside the game loop.
  const { ctx, page, errs } = await open({ bn_collection: JSON.stringify('hello'), bn_seen: '1', bn_furthest: '9999', bn_best: 'oops' });
  const st = await page.evaluate(() => window.__bn.state);
  ok('corrupt save: the collection is repaired to five numbers',
    Array.isArray(st.collect) && st.collect.length === 5 && st.collect.every(n => typeof n === 'number'), JSON.stringify(st.collect));
  ok('corrupt save: furthest room is clamped to the real range', st.furthest <= 24, 'furthest=' + st.furthest);
  const r = await resume(page);
  ok('corrupt save: the continue label is a real room number', /room (\d+)/.test(r.label) && +r.label.match(/room (\d+)/)[1] <= 25, r.label);
  // and a treasure must be collectable without throwing
  const played = await page.evaluate(async () => {
    document.getElementById('b-play').click();
    await new Promise(x => setTimeout(x, 500));
    window.__bn.t.press('KeyD', true);
    await new Promise(x => setTimeout(x, 400));
    window.__bn.t.press('KeyD', false);
    window.__bn.t.press('KeyS', true);
    await new Promise(x => setTimeout(x, 200));
    window.__bn.t.press('KeyS', false);
    await new Promise(x => setTimeout(x, 1200));
    return window.__bn.state;
  });
  ok('corrupt save: a room is playable and does not freeze', played.running === true && played.phase === 'play', JSON.stringify({ r: played.running, p: played.phase }));
  ok('corrupt save: no page error while playing', errs.length === 0, errs[0]);
  await ctx.close();
}

// ---- 4. two tabs must not clobber (standing class 4)
{
  const { ctx, page } = await open({ bn_seen: '1' });
  await page.evaluate(async () => { document.getElementById('b-play').click(); await new Promise(x => setTimeout(x, 400)); });
  await page.evaluate(() => { localStorage.setItem('bn_furthest', '20'); localStorage.setItem('bn_best', '99999'); });
  await page.evaluate(async () => { window.__bn.t.clearCritters(); await new Promise(x => setTimeout(x, 3200)); });
  const far = await page.evaluate(() => localStorage.getItem('bn_furthest'));
  ok('two tabs: the furthest room from the other tab survives (MAX)', +far >= 20, 'bn_furthest=' + far);
  await ctx.close();
}

// ---- 5. exit affordance exists AND something calls it (standing class 1)
{
  const { ctx, page } = await open();
  ok('SWS_EXIT is defined', await page.evaluate(() => typeof window.SWS_EXIT === 'function'));
  const r = await page.evaluate(() => {
    window.__exit = 0; window.SWS_EXIT = () => { window.__exit++; };
    document.getElementById('b-exit').click();
    return window.__exit;
  });
  ok('the title-screen exit invokes SWS_EXIT', r === 1, 'called ' + r + ' times');
  await ctx.close();
}

// ---- 6. one player must be a complete game (co-op brief)
{
  const { ctx, page } = await open({ bn_seen: '1' });
  const st = await page.evaluate(async () => { document.getElementById('b-play').click(); await new Promise(x => setTimeout(x, 500)); return window.__bn.state; });
  ok('a solo run spawns exactly one player', st.players.length === 1, JSON.stringify(st.players));
  ok('a solo run has critters to clear', st.critters > 0, 'critters=' + st.critters);
  const adv = await page.evaluate(async () => { window.__bn.t.clearCritters(); await new Promise(x => setTimeout(x, 3200)); return window.__bn.state; });
  ok('a solo player can clear a room and advance', adv.level === 1, 'level=' + adv.level);
  ok('the second player is never spawned in 1P', adv.players.length === 1, JSON.stringify(adv.players));
  await ctx.close();
}
{
  // and the 2P offer is only made where the second set of controls exists
  const { ctx, page } = await open(null, false);
  ok('two-player is offered on a keyboard', await page.evaluate(() => getComputedStyle(document.getElementById('b-2p')).display !== 'none'));
  await ctx.close();
  const t = await open(null, true);
  ok('two-player is not offered on a touch device with one pad', await t.page.evaluate(() => getComputedStyle(document.getElementById('b-2p')).display === 'none'));
  await t.ctx.close();
}

// ---- 7. touch targets, RENDERED, at 375x667 (standing class 6)
{
  const { ctx, page } = await open({ bn_seen: '1' });
  ok('title screen: no control under 48 rendered px', (await page.evaluate(TOUCH_PROBE)).length === 0, JSON.stringify(await page.evaluate(TOUCH_PROBE)).slice(0,220));
  for (const [go, back, name] of [['b-how','how-back','how to play'], ['b-set','set-back','settings'], ['b-col','col-back','collection']]) {
    await page.click('#' + go); await new Promise(r => setTimeout(r, 250));
    const bad = await page.evaluate(TOUCH_PROBE);
    ok(name + ': no control under 48 rendered px', bad.length === 0, JSON.stringify(bad).slice(0, 220));
    await page.click('#' + back); await new Promise(r => setTimeout(r, 200));
  }
  await page.evaluate(async () => { document.getElementById('b-play').click(); await new Promise(x => setTimeout(x, 500)); });
  const pads = await page.evaluate(() => [...document.querySelectorAll('#ctl .padbtn')].map(b => { const r = b.getBoundingClientRect(); return { id: b.id, w: +r.width.toFixed(1), h: +r.height.toFixed(1) }; }));
  ok('in-play pads render and are all >=48px', pads.length === 4 && pads.every(p => p.h >= 47.5 && p.w >= 47.5), JSON.stringify(pads));
  await ctx.close();
}

// ---- 8. dashes (standing class 7)
{
  const { ctx, page } = await open();
  const bad = await page.evaluate(DASH_PROBE);
  ok('no dashes in visible player copy', bad.length === 0, JSON.stringify(bad).slice(0, 200));
  await ctx.close();
}

// ---- 9. the feedback fab, and the control bar under it (standing classes 2 and 8)
{
  const { ctx, page } = await open({ bn_seen: '1' });
  const box = FAB({ w: 375, h: 667 });
  await new Promise(r => setTimeout(r, 2600));
  ok('fab mounted at all', await page.evaluate(() => !!document.querySelector('.lwfb-fab')));
  let hits = await page.evaluate(FAB_PROBE + '(' + JSON.stringify(box) + ')');
  ok('title screen: nothing tappable under the feedback fab', hits.length === 0, JSON.stringify(hits).slice(0, 200));
  await page.evaluate(async () => { document.getElementById('b-play').click(); await new Promise(x => setTimeout(x, 400)); });
  await new Promise(r => setTimeout(r, 2600));
  hits = await page.evaluate(FAB_PROBE + '(' + JSON.stringify(box) + ')');
  ok('in play: the fab is not sitting on a control pad', hits.length === 0, JSON.stringify(hits).slice(0, 200));
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

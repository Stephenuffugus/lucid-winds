#!/usr/bin/env node
/* SEED FLUTTER (Cosmic Cadets) — audit assertion suite (2026-08-16).
 *
 * Run from the repo root:   node satellites/seed-flutter/audit_check.mjs
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
const SLUG = 'seed-flutter';
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
const URL0 = `http://127.0.0.1:${PORT}/satellites/seed-flutter/`;
const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--disable-dev-shm-usage'] });

async function open(query = '', seed = null, touch = true){
  const ctx = await browser.createBrowserContext();   // fresh storage AND a fresh SW scope
  const page = await ctx.newPage();
  await page.setViewport({ width: 375, height: 667, isMobile: touch, hasTouch: touch, deviceScaleFactor: 2 });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message || e)));
  if (seed) { await page.goto(URL0, { waitUntil: 'domcontentloaded' }); await page.evaluate(s => { for (const k in s) localStorage.setItem(k, s[k]); }, seed); }
  await page.goto(URL0 + query, { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 900));
  return { ctx, page, errs };
}

// ---- 1. boots clean and the title screen is real
{
  const { ctx, page, errs } = await open();
  ok('boots with no page error', errs.length === 0, errs[0]);
  ok('title screen is visible', await page.$eval('#s-title', e => e.classList.contains('on')));
  ok('all four modes are on the title screen',
    await page.evaluate(() => ['b-drift','b-daily','b-gaunt','b-zen'].every(i => !!document.getElementById(i))));
  await ctx.close();
}

// ---- 2. exit affordance exists AND something calls it (standing class 1)
{
  const { ctx, page } = await open();
  ok('SWS_EXIT is defined in the page itself', await page.evaluate(() => typeof window.SWS_EXIT === 'function'));
  const called = await page.evaluate(async () => {
    window.__exit = 0; window.SWS_EXIT = () => { window.__exit++; };
    const cands = [...document.querySelectorAll('#s-title button')]
      .filter(b => /all sky wolf|arcade|portal|all games/i.test(b.textContent||''));
    if (!cands.length) return { found: 0, called: 0 };
    const r = cands[0].getBoundingClientRect();
    cands[0].click();
    return { found: cands.length, called: window.__exit, w: r.width, h: r.height };
  });
  ok('a findable title-screen control invokes SWS_EXIT', called.found > 0 && called.called === 1, JSON.stringify(called));
  ok('exactly one exit button (arcade-exit.js must stand down)', called.found === 1, 'found ' + called.found);
  await ctx.close();
}

// ---- 3. corrupt save (standing class 3): a run must still finish
{
  const seed = { seedflutter_save: JSON.stringify({ blooms: 5, owned: 7, coins: 'x', bestDist: {}, grewTotal: [1,2] }) };
  const { ctx, page, errs } = await open('?sftest=1', seed);
  // the real input path first: a tap on the canvas must actually fly the cadet
  await page.click('#b-drift');
  await new Promise(r => setTimeout(r, 300));
  await page.mouse.click(187, 300);
  await new Promise(r => setTimeout(r, 300));
  const flew = await page.evaluate(() => SF_DEV.snap());
  ok('corrupt save: a tap on the canvas actually flies the cadet', flew && flew.phase === 'play' && flew.vy !== 0, JSON.stringify(flew));
  // then drive the rest deterministically (headless rAF is throttled on this box,
  // so wall-clock waiting is not evidence of anything)
  const end = await page.evaluate(() => {
    // fly a real distance first, so the run actually earns keepsakes and endRun
    // has to write into the (possibly corrupt) blooms list
    SF_DEV.start('drift'); SF_DEV.autoplay(30);
    const gaps = SF_DEV.snap().gaps, best = SF_DEV.snap().best;
    for (let i = 0; i < 1200; i++) { const s = SF_DEV.state(); if (!s || s.phase === 'dead') break; SF_DEV.step(1/60); }
    return { gaps, best, phase: SF_DEV.snap() && SF_DEV.snap().phase,
             go: document.getElementById('s-go').classList.contains('on') };
  });
  ok('corrupt save: the run actually threaded gaps before it ended', end.gaps > 3, JSON.stringify(end));
  ok('corrupt save: a whole run reaches the results screen', end.go === true, JSON.stringify(end));
  ok('corrupt save: no page error during the run', errs.length === 0, errs[0]);
  const stored = await page.evaluate(() => JSON.parse(localStorage.seedflutter_save));
  ok('corrupt save: the keepsake list is repaired to a real array',
    Object.prototype.toString.call(stored.blooms) === '[object Array]', JSON.stringify(stored.blooms).slice(0,40));
  ok('corrupt save: the owned map is repaired to an object', stored.owned && typeof stored.owned === 'object', JSON.stringify(stored.owned).slice(0,40));
  ok('corrupt save: coins are repaired to a number', typeof stored.coins === 'number' && isFinite(stored.coins), 'coins=' + stored.coins);
  const grove = await page.evaluate(() => { document.getElementById('go-grove').click(); const h = document.getElementById('grove-wrap'); return { n: h.children.length, txt: h.textContent.trim().slice(0,20) }; });
  ok('corrupt save: the Sky Map is never silently blank', grove.n > 0, JSON.stringify(grove));
  await ctx.close();
}

// ---- 4. two tabs must not clobber (standing class 4)
{
  const { ctx, page } = await open('?sftest=1');
  const after = await page.evaluate(() => {
    // pretend a second tab wrote while this one was mid-session
    localStorage.setItem('seedflutter_save', JSON.stringify({
      bestDist: 99, bestGauntlet: 4, streak: 3, blooms: [111,222], grewTotal: 40, coins: 500, owned: { 'seed1': 1 } }));
    SF_DEV.start('drift'); SF_DEV.flap();
    for (let i = 0; i < 900; i++) { const s = SF_DEV.state(); if (!s || s.phase === 'dead') break; SF_DEV.step(1/60); }
    return JSON.parse(localStorage.seedflutter_save);
  });
  ok('two tabs: coins from the other tab survive', after.coins >= 500, 'coins=' + after.coins);
  ok('two tabs: best from the other tab survives (MAX)', after.bestDist >= 99, 'bestDist=' + after.bestDist);
  ok('two tabs: keepsakes from the other tab survive', after.blooms.indexOf(111) >= 0, JSON.stringify(after.blooms).slice(0,60));
  ok('two tabs: purchases from the other tab survive', !!after.owned['seed1'], JSON.stringify(after.owned));
  ok('two tabs: this tab\'s own earnings were added, not dropped', after.coins > 500, 'coins=' + after.coins);
  await ctx.close();
}

// ---- 5. touch targets, RENDERED, at 375x667 (standing class 6)
{
  const { ctx, page } = await open();
  ok('title screen: no control under 48 rendered px', (await page.evaluate(TOUCH_PROBE)).length === 0, JSON.stringify(await page.evaluate(TOUCH_PROBE)));
  for (const [id, name] of [['b-ward','wardrobe'], ['b-set','settings'], ['b-grove','sky map']]) {
    await page.click('#' + id);
    await new Promise(r => setTimeout(r, 250));
    const bad = await page.evaluate(TOUCH_PROBE);
    ok(name + ' screen: no control under 48 rendered px', bad.length === 0, JSON.stringify(bad).slice(0, 200));
    const back = await page.evaluate(() => { const b = document.querySelector('.screen.on button[id$="-back"]'); if (b) { b.click(); return 1; } return 0; });
    if (!back) await page.evaluate(() => document.getElementById('s-title').classList.add('on'));
    await new Promise(r => setTimeout(r, 200));
  }
  // the in-play HUD is drawn on the canvas, so measure it from the stage scale
  // The in-play HUD is drawn on the canvas, so its size lives in a constant
  // inside the IIFE. Read the REAL declaration out of the served page and
  // multiply by the measured stage scale — a hardcoded 70 here would be a probe
  // that cannot fail.
  const src = await (await fetch(URL0)).text();
  const digits = str => { const out = []; let cur = '';
    for (const ch of str) { if (ch >= '0' && ch <= '9') cur += ch; else { if (cur) out.push(+cur); cur = ''; } }
    if (cur) out.push(+cur); return out; };
  const at = src.indexOf('var HB_MENU=');
  const nums = at >= 0 ? digits(src.slice(at, at + 44)) : [];   // x, y, w, h
  const scale = await page.evaluate(() => document.getElementById('stage').getBoundingClientRect().height / 960);
  ok('the in-play HUD button constants are readable', nums.length >= 4, 'HB_MENU declaration not found');
  if (nums.length >= 4) {
    const w = nums[2] * scale, h = nums[3] * scale;
    ok('in-play HUD buttons are >=48 RENDERED px', w >= 47.5 && h >= 47.5,
       'declared ' + nums[2] + 'x' + nums[3] + ' stage px -> ' + w.toFixed(1) + 'x' + h.toFixed(1) + ' rendered at scale ' + scale.toFixed(3));
  }
  await ctx.close();
}

// ---- 6. dashes in player copy (standing class 7)
{
  const { ctx, page } = await open();
  const bad = await page.evaluate(DASH_PROBE);
  ok('no dashes in visible player copy', bad.length === 0, JSON.stringify(bad).slice(0, 200));
  await ctx.close();
}

// ---- 7. the feedback fab must not sit on a control (standing classes 2 and 8)
{
  const { ctx, page } = await open();
  await new Promise(r => setTimeout(r, 2600));   // let FAB YIELD settle
  const box = FAB({ w: 375, h: 667 });
  ok('fab mounted at all', await page.evaluate(() => !!document.querySelector('.lwfb-fab')));
  let hits = await page.evaluate(FAB_PROBE + '(' + JSON.stringify(box) + ')');
  ok('title screen: nothing tappable under the feedback fab', hits.mounted && !hits.eats, JSON.stringify(hits).slice(0, 260));
  await page.click('#b-ward');
  await new Promise(r => setTimeout(r, 2600));
  hits = await page.evaluate(FAB_PROBE + '(' + JSON.stringify(box) + ')');
  ok('wardrobe sheet: nothing tappable under the feedback fab', hits.mounted && !hits.eats, JSON.stringify(hits).slice(0, 260));
  await ctx.close();
}

// ---- 8. the first thirty seconds teach the game
{
  const { ctx, page } = await open('?sftest=1');
  const coach = await page.evaluate(() => {
    const src = document.documentElement.innerHTML;
    return /Tap to flap/.test(src) && /Thread the star in the middle/.test(src);
  });
  ok('an on-canvas coach names the Perfect band', coach, 'no in-play coaching copy found');
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

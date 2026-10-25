#!/usr/bin/env node
/* SHELL SHUFFLE — audit assertion suite (2026-08-16).
 *
 * Run from the repo root:   node satellites/shell-shuffle/audit_check.mjs
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
const SLUG = 'shell-shuffle';
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
/* SS_PAGE=<file> runs the suite against a copy beside index.html (the fail watch: a broken copy must go red) */
const BUILD_WANT = 'v1.2';   /* the build this suite was written for: bump with the page's BUILD */
const DIRURL = `http://127.0.0.1:${PORT}/satellites/shell-shuffle/`;
const URL0 = DIRURL + (process.env.SS_PAGE || '');
const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--disable-dev-shm-usage'] });

async function open(query = '', seed = null){
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message || e)));
  if (seed) { await page.goto(URL0, { waitUntil: 'domcontentloaded' }); await page.evaluate(s => { for (const k in s) localStorage.setItem(k, s[k]); }, seed); }
  await page.goto(URL0 + query, { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 700));
  return { ctx, page, errs };
}
/* A real mouse click, never el.click(): el.click() skips hit testing, so it
   would happily "prove" a button works while a sheet sits on top of it. If the
   click cannot land, that IS the finding, so report it instead of crashing. */
async function tap(page, sel){
  try { await page.click(sel); return true; }
  catch (e) { return false; }
}
/* The one that matters: does tapping the button that says "Start Game"
   actually start a game. It looked live and did nothing for a corrupt save. */
async function startsARound(page){
  const landed = await tap(page, '#actBtn');
  await new Promise(r => setTimeout(r, 700));
  return page.evaluate(l => ({
    landed: l,
    status: document.getElementById('status').textContent,
    cups: document.querySelectorAll('#playfield .cup-wrap').length
  }), landed);
}

// ---- 1. boots clean and a round starts
{
  const { ctx, page, errs } = await open();
  ok('boots with no page error', errs.length === 0, errs[0]);
  const r = await startsARound(page);
  ok('Start Game actually starts a round', r.landed && r.cups >= 2, JSON.stringify(r));
  await ctx.close();
}

// ---- 2. corrupt save (standing classes 3 and 5)
//         This is the worst defect found in these four games: load() threw
//         OUTSIDE its try/catch, the async boot died before showBtn(), and the
//         button kept its HTML label "Start Game" while doing nothing forever.
const POISONS = {
  'owned is not an array':     { owned: 3 },
  'ownedCups is not an array': { ownedCups: 3 },
  'daily is a string':         { daily: 'x' },
  'custom is a number':        { custom: 5 },
  'the whole save is a string': 'wrecked',
  'the whole save is an array': [1,2,3]
};
for (const [name, poison] of Object.entries(POISONS)) {
  const { ctx, page, errs } = await open('', { 'shellshuffle:v1': JSON.stringify(poison) });
  const r = await startsARound(page);
  ok('corrupt save (' + name + '): Start Game still starts a round', r.landed && r.cups >= 2, JSON.stringify(r));
  ok('corrupt save (' + name + '): no page error', errs.length === 0, errs[0]);
  await ctx.close();
}

// ---- 3. exit affordance exists AND two controls call it (standing class 1)
{
  const { ctx, page } = await open();
  ok('SWS_EXIT is defined', await page.evaluate(() => typeof window.SWS_EXIT === 'function'));
  const r = await page.evaluate(() => {
    window.__exit = 0; window.SWS_EXIT = () => { window.__exit++; };
    document.getElementById('exitPortal').click();
    const one = window.__exit;
    document.getElementById('pausedExit').click();
    return { one, two: window.__exit };
  });
  ok('the main-screen exit invokes SWS_EXIT', r.one === 1, JSON.stringify(r));
  ok('the pause-sheet exit invokes SWS_EXIT', r.two === 2, JSON.stringify(r));
  await ctx.close();
}

// ---- 4. two tabs must not clobber (standing class 4)
{
  const { ctx, page } = await open();
  await startsARound(page);
  await page.evaluate(() => {
    localStorage.setItem('shellshuffle:v1', JSON.stringify({
      coins: 900, bestLevel: 42, owned: ['classic','gold'], ownedCups: ['sunset'],
      daily: { last: '2099-01-01', streak: 12, best: 30, week: 'x', weekDays: 6, weekStreak: 4 } }));
  });
  // a correct guess triggers save(); find the cup the ball is under by trying all of them
  await page.evaluate(() => { window.__ssTestSave = true; });
  await new Promise(r => setTimeout(r, 9000));
  await page.evaluate(() => { const cups = document.querySelectorAll('#playfield .cup-wrap'); if (cups[0]) cups[0].click(); });
  await new Promise(r => setTimeout(r, 900));
  const after = await page.evaluate(() => JSON.parse(localStorage['shellshuffle:v1']));
  ok('two tabs: coins from the other tab survive', after.coins >= 900, 'coins=' + after.coins);
  ok('two tabs: best level from the other tab survives (MAX)', after.bestLevel >= 42, 'bestLevel=' + after.bestLevel);
  ok('two tabs: purchases from the other tab survive', after.owned.indexOf('gold') >= 0, JSON.stringify(after.owned));
  ok('two tabs: the daily streak from the other tab survives (MAX)', after.daily.streak >= 12, JSON.stringify(after.daily));
  ok('two tabs: the merge actually ran (this tab\'s cups were written too)',
    after.ownedCups.length > 1 && after.ownedCups.indexOf('sunset') >= 0, JSON.stringify(after.ownedCups));
  await ctx.close();
}

// ---- 5. difficulty must not go flat (it did, from level 11, forever)
{
  const { ctx, page } = await open('?sstest=1');
  const rig = await page.evaluate(() => !!window.__ss);
  ok('test rig is available under ?sstest=1', rig);
  if (rig) {
    const d = await page.evaluate(() => {
      const out = {};
      for (const lv of [1,5,9,11,15,20,30]) out[lv] = window.__ss.at(lv);
      return out;
    });
    ok('shuffle count still climbs past level 9', d[20].shuffles > d[9].shuffles, JSON.stringify(d[9]) + ' vs ' + JSON.stringify(d[20]));
    ok('shuffle count is bounded so a round still ends', d[30].shuffles <= 44, JSON.stringify(d[30]));
    ok('double swaps are off below level 11', d[9].dbl === 0 && d[5].dbl === 0, JSON.stringify(d[9]));
    ok('double swaps start after the other knobs cap out', d[15].dbl > 0, JSON.stringify(d[15]));
    ok('double swaps stay followable (capped)', d[30].dbl <= 0.45, JSON.stringify(d[30]));
    ok('level 30 is genuinely harder than level 11', (d[30].shuffles + d[30].dbl * 100) > (d[11].shuffles + d[11].dbl * 100), JSON.stringify([d[11], d[30]]));
  }
  await ctx.close();
}

// ---- 6. the hint must not promise something that stopped being true
{
  const { ctx, page } = await open('?sstest=1');
  const texts = await page.evaluate(() => {
    const out = {};
    for (const lv of [1, 7, 20]) { window.__ss.setLevel(lv); out[lv] = document.getElementById('hint').textContent; }
    return out;
  });
  ok('the hint stops promising more cups once cups cap out', !/adds a cup/i.test(texts[20]), texts[20]);
  ok('the hint names double swaps once they start', /double swap/i.test(texts[20]), texts[20]);
  ok('the hint still teaches the ramp early on', /adds a cup/i.test(texts[1]), texts[1]);
  await ctx.close();
}

// ---- 7. the Daily sheet must not open itself over the Start button
{
  const { ctx, page } = await open();
  await new Promise(r => setTimeout(r, 1600));
  const open2 = await page.evaluate(() => document.getElementById('daily').classList.contains('open'));
  ok('the Daily sheet does not hijack the boot', !open2, 'daily sheet auto-opened');
  ok('but the reward badge is still showing', await page.evaluate(() => getComputedStyle(document.getElementById('dbadge')).display !== 'none'));
  await ctx.close();
}

// ---- 8. sunbeam bucket key must not collide with the rest of the fleet
{
  const { ctx, page } = await open();
  const keys = await page.evaluate(() => { window._sbCapEarn(3, 'probe'); return Object.keys(localStorage).filter(k => k.indexOf('sw_sb_') === 0); });
  ok('sunbeam bucket is keyed to this game', keys.indexOf('sw_sb_shell-shuffle') >= 0, JSON.stringify(keys));
  // and again from the /index.html url, which is where the old pathname-derived
  // key collapsed to the fleet-wide 'sw_sb_index.html' bucket
  const p2 = await ctx.newPage();
  await p2.setViewport({ width: 375, height: 667 });
  await p2.goto(DIRURL + (process.env.SS_PAGE || 'index.html'), { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 500));
  const keys2 = await p2.evaluate(() => { window._sbCapEarn(3, 'probe'); return Object.keys(localStorage).filter(k => k.indexOf('sw_sb_') === 0); });
  ok('served as /index.html the bucket is still this game', keys2.indexOf('sw_sb_shell-shuffle') >= 0, JSON.stringify(keys2));
  ok('the bucket never collapses to the fleet-wide sw_sb_index.html', keys2.indexOf('sw_sb_index.html') < 0, JSON.stringify(keys2));
  await ctx.close();
}

// ---- 9. touch targets, RENDERED, at 375x667 (standing class 6)
{
  const { ctx, page } = await open();
  ok('main screen: no control under 48 rendered px', (await page.evaluate(TOUCH_PROBE)).length === 0, JSON.stringify(await page.evaluate(TOUCH_PROBE)).slice(0,200));
  await tap(page, '#openShop');
  await new Promise(r => setTimeout(r, 400));
  let bad = await page.evaluate(TOUCH_PROBE);
  ok('shop sheet: no control under 48 rendered px', bad.length === 0, JSON.stringify(bad).slice(0, 220));
  await tap(page, '#closeShop'); await tap(page, '#openDaily');
  await new Promise(r => setTimeout(r, 400));
  bad = await page.evaluate(TOUCH_PROBE);
  ok('daily sheet: no control under 48 rendered px', bad.length === 0, JSON.stringify(bad).slice(0, 220));
  await ctx.close();
}

// ---- 10. dashes (standing class 7)
{
  const { ctx, page } = await open();
  const bad = await page.evaluate(DASH_PROBE);
  ok('no dashes in visible player copy', bad.length === 0, JSON.stringify(bad).slice(0, 200));
  await ctx.close();
}

// ---- 11. the feedback fab over the full-screen sheets (standing classes 2 and 8)
{
  const { ctx, page } = await open();
  const box = FAB({ w: 375, h: 667 });
  await new Promise(r => setTimeout(r, 2600));
  ok('fab mounted at all', await page.evaluate(() => !!document.querySelector('.lwfb-fab')));
  let hits = await page.evaluate(FAB_PROBE + '(' + JSON.stringify(box) + ')');
  ok('main screen: nothing tappable under the feedback fab', hits.mounted && !hits.eats, JSON.stringify(hits).slice(0, 260));
  await tap(page, '#openShop');
  await new Promise(r => setTimeout(r, 2600));
  hits = await page.evaluate(FAB_PROBE + '(' + JSON.stringify(box) + ')');
  ok('shop sheet: nothing tappable under the feedback fab', hits.mounted && !hits.eats, JSON.stringify(hits).slice(0, 260));
  await page.evaluate(() => { document.getElementById('closeShop').click(); document.getElementById('openDaily').click(); });
  await new Promise(r => setTimeout(r, 2600));
  hits = await page.evaluate(FAB_PROBE + '(' + JSON.stringify(box) + ')');
  ok('daily sheet: nothing tappable under the feedback fab', hits.mounted && !hits.eats, JSON.stringify(hits).slice(0, 260));
  await ctx.close();
}

// ---- Part 0 (25 Oct): calm copy, the reveal says where the ball was (marks and words), the cups are buttons only while
//      a guess is wanted. Real touches (CDP touch events), never el.click(); expected values worked out here.
{
  /* lwfb_explained: the ladybug's once-per-device tip has been seen (fresh, it sits over Play Again for 7 s: feedback.js, reported) */
  const { ctx, page, errs } = await open('?sstest=1', { lwfb_explained: '1' });
  /* every RENDERED text node (an element with boxes, not inside a closed sheet) that holds an exclamation mark */
  const BANG = () => page.evaluate(() => { const out = [], w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (w.nextNode()) { const n = w.currentNode, p = n.parentElement; if (!p || /^(SCRIPT|STYLE)$/.test(p.tagName) || !p.getClientRects().length) continue;
      const cs = getComputedStyle(p); if (cs.visibility === 'hidden' || +cs.opacity === 0) continue;
      const t = n.data.trim(); if (t.indexOf('!') >= 0) out.push(t.slice(0, 60)); } return out; });
  const touch = async (sel) => { const c = await page.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return r.width ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null; }, sel);
    if (!c) return false; await page.touchscreen.tap(c.x, c.y); return true; };
  const until = async (fn, ms) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await page.evaluate(fn)) return true; await new Promise(r => setTimeout(r, 100)); } return false; };
  const roles = () => page.evaluate(() => [...document.querySelectorAll('#playfield .cup-wrap')].map(w => ({ id: +w.dataset.id, role: w.getAttribute('role'), tab: w.getAttribute('tabindex'), name: w.getAttribute('aria-label') })));
  let r = {};
  try {
    r.mainBang = await BANG();
    r.started = await touch('#actBtn');
    await until(() => window.__ss && window.__ss.ball().phase === 'play', 4000);
    r.playRoles = await roles();
    await until(() => /Shuffling/.test(document.getElementById('status').textContent), 6000); await new Promise(res => setTimeout(res, 250));
    r.playRoles = r.playRoles.concat(await roles());   /* and again in the middle of the swaps */
    r.guessing = await until(() => window.__ss.ball().phase === 'guessing', 20000);
    const b = await page.evaluate(() => window.__ss.ball());
    r.guessRoles = await roles(); r.ball = b;
    /* the names by position from the left, worked out from the order (never read from the page's own labels) */
    r.namesOk = b.order.every((id, s) => { const w = r.guessRoles.find(x => x.id === id); return w && w.role === 'button' && w.tab === '0' && w.name === 'Cup ' + (s + 1) + ' of ' + b.n; });
    const wrong = b.order.find(id => id !== b.ballCup);
    r.tapped = wrong; await touch('#playfield .cup-wrap[data-id="' + wrong + '"]');
    await until(() => window.__ss.ball().phase === 'idle', 4000); await new Promise(res => setTimeout(res, 300));
    const s = b.order.indexOf(b.ballCup);
    const where = b.n <= 3 ? 'the ' + (s === 0 ? 'left' : (s === b.n - 1 ? 'right' : 'middle')) + ' cup' : 'cup ' + (s + 1) + ' of ' + b.n;
    r.wantStatus = 'Not that one. It was ' + where;
    r.miss = await page.evaluate((ballCup, tapped) => {
      const at = id => document.querySelector('#playfield .cup-wrap[data-id="' + id + '"]');
      const ok = at(ballCup) && at(ballCup).querySelector('.cup-mark.ok'), ring = at(tapped) && at(tapped).querySelector('.cup-mark.ring');
      const under = (m, w) => { if (!m || !w) return false; const a = m.getBoundingClientRect(), c = w.getBoundingClientRect(); return Math.abs((a.left + a.right) / 2 - (c.left + c.right) / 2) < 3 && a.top >= c.bottom - 12 && a.width >= 20; };
      const okCs = ok && getComputedStyle(ok);
      const st = document.getElementById('status'), lh = parseFloat(getComputedStyle(st).lineHeight) || 24;
      return { status: st.textContent, oneLine: st.getBoundingClientRect().height < lh * 1.6, okUnder: under(ok, at(ballCup)), ringUnder: under(ring, at(tapped)),
        okCream: !!okCs && okCs.backgroundColor === 'rgb(246, 239, 228)',   /* the cream #f6efe4, written here */
        okCount: document.querySelectorAll('#playfield .cup-mark.ok').length, ringCount: document.querySelectorAll('#playfield .cup-mark.ring').length };
    }, b.ballCup, wrong);
    r.afterRoles = await roles();
    r.missBang = await BANG();
    /* Enter on a focused cup resolves the guess */
    await touch('#actBtn');
    r.guessing2 = await until(() => window.__ss.ball().phase === 'guessing', 20000);
    await page.evaluate(() => { const w = document.querySelector('#playfield .cup-wrap[role="button"]'); if (w) w.focus(); });
    await page.keyboard.press('Enter');
    r.enterResolved = await until(() => window.__ss.ball().phase !== 'guessing', 1500);
    await until(() => window.__ss.ball().phase === 'idle' || window.__ss.ball().phase === 'play', 4000);
    /* a miss at 3 cups and at 6 cups, on purpose, each line worked out here from the ball's place */
    r.more = [];
    for (const lv of [2, 5]) {
      await until(() => window.__ss.ball().phase === 'idle', 15000);
      const started = await page.evaluate(l => window.__ss.start(l), lv);   /* exactly this level (the rig, ?sstest=1 only) */
      const g = await until(() => window.__ss.ball().phase === 'guessing', 30000);
      const bb = await page.evaluate(() => window.__ss.ball());
      const wr = bb.order.find(id => id !== bb.ballCup), s2 = bb.order.indexOf(bb.ballCup);
      /* Space this time, on the wrong cup */
      await page.evaluate(id => document.querySelector('#playfield .cup-wrap[data-id="' + id + '"]').focus(), wr);
      await page.keyboard.press('Space');
      await until(() => window.__ss.ball().phase === 'idle', 5000);
      const want = 'Not that one. It was ' + (bb.n <= 3 ? 'the ' + (s2 === 0 ? 'left' : (s2 === bb.n - 1 ? 'right' : 'middle')) + ' cup' : 'cup ' + (s2 + 1) + ' of ' + bb.n);
      const got = await page.evaluate(() => { const st = document.getElementById('status'), lh = parseFloat(getComputedStyle(st).lineHeight) || 24; return { t: st.textContent, one: st.getBoundingClientRect().height < lh * 1.6 }; });
      r.more.push({ lv, n: bb.n, g, started, want, got: got.t, one: got.one });
    }
    await page.evaluate(() => { const o = document.getElementById('pausedOv'); if (o) o.classList.remove('open'); });
    await touch('#openDaily'); await new Promise(res => setTimeout(res, 2600)); r.dailyBang = await BANG();
    await page.evaluate(() => { const c = document.getElementById('closeDaily'); if (c) c.dispatchEvent(new MouseEvent('click', { bubbles: true })); });
    await new Promise(res => setTimeout(res, 600));
    await touch('#openShop'); await new Promise(res => setTimeout(res, 2600)); r.shopBang = await BANG();
  } catch (e) { r.error = String(e).slice(0, 200); }
  ok('Part 0: no rendered text holds an exclamation mark (main, a miss, the Daily sheet, the Shop)', !r.error && [r.mainBang, r.missBang, r.dailyBang, r.shopBang].every(a => Array.isArray(a) && a.length === 0), JSON.stringify({ e: r.error, m: r.mainBang, x: r.missBang, d: r.dailyBang, s: r.shopBang }));
  ok('Part 0: while the cups shuffle they are not buttons', Array.isArray(r.playRoles) && r.playRoles.length >= 2 && r.playRoles.every(w => !w.role && !w.tab && !w.name), JSON.stringify(r.playRoles));
  ok('Part 0: while a guess is wanted every cup is a button named by its place ("Cup N of M")', r.guessing && r.namesOk === true, JSON.stringify(r.guessRoles));
  ok('Part 0: a miss marks the ball\'s cup with a cream check under it and the tapped cup with a ring', r.miss && r.miss.okUnder && r.miss.ringUnder && r.miss.okCream && r.miss.okCount === 1 && r.miss.ringCount === 1, JSON.stringify(r.miss));
  ok('Part 0: the miss line says where the ball was, in words, worked out from its place, on one line', r.miss && r.miss.status === r.wantStatus && r.miss.oneLine, JSON.stringify({ got: r.miss && r.miss.status, want: r.wantStatus, oneLine: r.miss && r.miss.oneLine }));
  ok('Part 0: after the guess the cups stop being buttons', Array.isArray(r.afterRoles) && r.afterRoles.length >= 2 && r.afterRoles.every(w => !w.role && !w.tab), JSON.stringify(r.afterRoles));
  ok('Part 0: Enter on a focused cup makes the guess', r.guessing2 && r.enterResolved, JSON.stringify({ g: r.guessing2, e: r.enterResolved }));
  ok('Part 0: Space makes the guess, and a miss at 3 and at 6 cups says where in words, on one line at 375', Array.isArray(r.more) && r.more.length === 2 && r.more[0].n === 3 && r.more[1].n === 6 && r.more.every(m => m.g && m.got === m.want && m.one), JSON.stringify(r.more));
  ok('Part 0: How to play shows the build', await page.evaluate((b) => (document.getElementById('buildLine') || {}).textContent === 'Build ' + b, BUILD_WANT));
  ok('Part 0: no page errors', errs.length === 0, errs[0]);
  await ctx.close();
}
// ---- Part 1 (25 Oct): Astra's Midnight Cabinet. Values worked out here: the plate's file and BUILD, 70 percent of the
//      height for the cups' painted feet (read from the cup's own pixels), 48 px hit boxes, the saves' cups.
{
  const feetAt = async (page) => page.evaluate(() => new Promise((res) => {   /* a cup that is standing (a lifted one is not on the line) */
    const im = [...document.querySelectorAll('#playfield .cup-body:not(.lifted) .cup-img')][0]; if (!im) return res(null);
    const go = () => { const cv = document.createElement('canvas'), g = cv.getContext('2d'); cv.width = im.naturalWidth; cv.height = im.naturalHeight; g.drawImage(im, 0, 0);
      const d = g.getImageData(0, 0, cv.width, cv.height).data; let low = -1;
      for (let y = cv.height - 1; y >= 0 && low < 0; y--) for (let x = 0; x < cv.width; x++) if (d[(y * cv.width + x) * 4 + 3] > 24) { low = y; break; }
      const r = im.getBoundingClientRect(); res({ feet: r.top + (low + 1) / cv.height * r.height, H: innerHeight, w: r.width }); };
    if (im.complete && im.naturalWidth) go(); else im.onload = go; }));
  const roundAt = async (page, lv) => { await page.evaluate(l => window.__ss.start(l), lv);
    const t0 = Date.now(); while (Date.now() - t0 < 40000 && !(await page.evaluate(() => window.__ss.ball().phase === 'guessing'))) await new Promise(r => setTimeout(r, 100));
    await new Promise(r => setTimeout(r, 700)); };   /* the last swap's transition settles (a loaded box lags the timers) */
  const out = {};
  for (const [w, h] of [[375, 667], [412, 915], [360, 640], [1024, 768]]) {
    const { ctx, page, errs } = await open('?sstest=1', { lwfb_explained: '1' });
    await page.setViewport({ width: w, height: h, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }); await new Promise(r => setTimeout(r, 600));
    try {
      if (w === 375) out.bg = await page.evaluate(() => { const cs = getComputedStyle(document.body); return { img: cs.backgroundImage, posY: cs.backgroundPositionY.split(',')[0].trim() }; });
      await roundAt(page, 2); out['f' + w] = await feetAt(page);
      if (w === 375 || w === 360) {   /* a real tap on a cup; then the idle state, the logo back: the line and no scroll */
        /* a cup known to be WRONG: a right guess rolls into the next level by itself (a second round on top of it
           shuffled the same cups twice over and read as an overlap) */
        const c = await page.evaluate(() => { const bl = window.__ss.ball(), wr = bl.order.find(id => id !== bl.ballCup);
          const r = document.querySelector('#playfield .cup-wrap[data-id="' + wr + '"]').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
        await page.touchscreen.tap(c.x, c.y);
        const t0 = Date.now(); while (Date.now() - t0 < 6000 && (await page.evaluate(() => window.__ss.ball().phase)) !== 'idle') await new Promise(r => setTimeout(r, 100));
        await new Promise(r => setTimeout(r, 500));
        out['i' + w] = await feetAt(page); out['s' + w] = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight); }
      if (w === 360) {
        await roundAt(page, 5);
        out.six = await page.evaluate(() => { const r = [...document.querySelectorAll('#playfield .cup-wrap')].map(e => { const b = e.getBoundingClientRect(); return { l: b.left, r: b.right, w: b.width, h: b.height }; }).sort((a, b) => a.l - b.l);
          return { n: r.length, minW: Math.min(...r.map(x => x.w)), minH: Math.min(...r.map(x => x.h)), overlap: r.some((x, i) => i && x.l < r[i - 1].r - 0.5), inView: r.every(x => x.l >= -0.5 && x.r <= innerWidth + 0.5),
            boxes: r.map(x => Math.round(x.l) + '-' + Math.round(x.r)).join(' '), phase: window.__ss.ball().phase }; }); }
      out['e' + w] = errs.slice(0, 2);
    } catch (e) { out['x' + w] = String(e).slice(0, 160); }
    await ctx.close();
  }
  ok('Part 1: the page stands on the painted plate (table_main, the 2x file, ?v=BUILD), its 70 percent line on the screen\'s', out.bg && out.bg.img.indexOf('art/s1/scene/table_main.webp?v=' + BUILD_WANT) >= 0 && out.bg.posY === '70%', JSON.stringify(out.bg).slice(0, 200));
  const near = (f) => f && Math.abs(f.feet - 0.70 * f.H) <= 0.02 * f.H;
  ok('Part 1: the cups stand their painted feet on 70 percent of the height, within 2 percent (375 x 667, 412 x 915, 360 x 640, a 1024 x 768 tablet)', near(out.f375) && near(out.f412) && near(out.f360) && near(out.f1024), JSON.stringify({ a: out.f375, b: out.f412, c: out.f360, d: out.f1024 }));
  ok('Part 1: after a miss the standing cup stays on the line and the page does not scroll (375, 360)', near(out.i375) && near(out.i360) && out.s375 <= 0 && out.s360 <= 0, JSON.stringify({ a: out.i375, b: out.i360, s: [out.s375, out.s360] }));
  ok('Part 1: three cups are 100 to 110 px wide at 375 and 412', out.f375 && out.f412 && [out.f375.w, out.f412.w].every(x => x >= 100 && x <= 110), JSON.stringify([out.f375 && out.f375.w, out.f412 && out.f412.w]));
  ok('Part 1: six cups at 360 wide: every hit box 48 or more, none overlapping, all in view', out.six && out.six.n === 6 && out.six.minW >= 48 && out.six.minH >= 48 && !out.six.overlap && out.six.inView, JSON.stringify(out.six));
  ok('Part 1: no page errors in the scene runs', ['e375', 'e412', 'e360', 'e1024'].every(k => Array.isArray(out[k]) && out[k].length === 0) && !out.x375 && !out.x412 && !out.x360 && !out.x1024, JSON.stringify(out).slice(0, 300));
  /* the saves: a fresh one starts on the house cup, an existing one keeps its cup */
  { const a = await open('?sstest=1'); const fresh = await a.page.evaluate(() => window.__ss.state().selectedCup); await a.ctx.close();
    const keep = await open('?sstest=1', { 'shellshuffle:v1': JSON.stringify({ coins: 5, owned: ['classic'], selected: 'classic', selectedCup: 'moonlit', ownedCups: ['sunset', 'moonlit', 'forest'] }) });
    const kept = await keep.page.evaluate(() => ({ sel: window.__ss.state().selectedCup, owned: window.__ss.state().ownedCups.slice() })); await keep.ctx.close();
    ok('Part 1: a fresh save starts on the house cup; a save on Moonlit keeps Moonlit and its own rotation (no house added)', fresh === 'house' && kept.sel === 'moonlit' && kept.owned.indexOf('house') < 0 && ['sunset', 'moonlit', 'forest'].every(c => kept.owned.indexOf(c) >= 0), JSON.stringify({ fresh, kept })); }
  /* the old cups left the page: none of the three redrawn cups' base64 (each one's own prefix from v1.1) */
  { const src = fs.readFileSync(path.join(ROOT, 'satellites/shell-shuffle', process.env.SS_PAGE || 'index.html'), 'utf8');
    const left = { sunset: 'UklGRhINAABXRUJQVlA4WAoAAAAQAAAAWQAAZwAA', moonlit: 'UklGRkgNAABXRUJQVlA4WAoAAAAQAAAAWQAAZQAA', forest: 'UklGRpINAABXRUJQVlA4WAoAAAAQAAAAWQAAZQAA' };
    const still = Object.keys(left).filter(k => src.indexOf(left[k]) >= 0);
    ok('Part 1: the three redrawn cups left the page as base64 (sunset, moonlit, forest)', still.length === 0, still.join(', ') + ' bytes ' + src.length); }
}
/* KNOWN, reported, not counted (feedback.js is the fleet's, outside this game's parts): on a FIRST visit the ladybug's
   explanation tip sits over Play Again for 7 s after the first miss, and a tap there lands on the tip */
{
  const { ctx, page } = await open('?sstest=1');
  let k = null;
  try {
    const c = await page.evaluate(() => { const r = document.getElementById('actBtn').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    await page.touchscreen.tap(c.x, c.y);
    const t0 = Date.now(); while (Date.now() - t0 < 20000 && !(await page.evaluate(() => window.__ss.ball().phase === 'guessing'))) await new Promise(r => setTimeout(r, 100));
    const b = await page.evaluate(() => window.__ss.ball()), wr = b.order.find(id => id !== b.ballCup);
    await page.evaluate(id => document.querySelector('#playfield .cup-wrap[data-id="' + id + '"]').dispatchEvent(new MouseEvent('click', { bubbles: true })), wr);
    await new Promise(r => setTimeout(r, 1200));
    k = await page.evaluate(() => { const e = document.getElementById('actBtn'), r = e.getBoundingClientRect(), h = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { onButton: !!h && e.contains(h), hit: h && (h.id || h.className) }; });
  } catch (e) { k = { error: String(e).slice(0, 120) }; }
  console.log('  ' + (k && k.onButton ? '(known fault now gone: Play Again is clear on a first visit)' : '! KNOWN (feedback.js): on a first visit the ladybug tip covers Play Again after the first miss  ->  ' + JSON.stringify(k)));
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

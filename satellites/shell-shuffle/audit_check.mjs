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
const URL0 = `http://127.0.0.1:${PORT}/satellites/shell-shuffle/`;
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
/* The one that matters: does tapping the button that says "Start Game"
   actually start a game. It looked live and did nothing for a corrupt save. */
async function startsARound(page){
  await page.click('#actBtn');
  await new Promise(r => setTimeout(r, 700));
  return page.evaluate(() => ({
    status: document.getElementById('status').textContent,
    cups: document.querySelectorAll('#playfield .cup-wrap').length
  }));
}

// ---- 1. boots clean and a round starts
{
  const { ctx, page, errs } = await open();
  ok('boots with no page error', errs.length === 0, errs[0]);
  const r = await startsARound(page);
  ok('Start Game actually starts a round', r.cups >= 2, JSON.stringify(r));
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
  ok('corrupt save (' + name + '): Start Game still starts a round', r.cups >= 2, JSON.stringify(r));
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
  ok('sunbeam bucket does not fall back to sw_sb_index.html', keys.indexOf('sw_sb_index.html') < 0, JSON.stringify(keys));
  await ctx.close();
}

// ---- 9. touch targets, RENDERED, at 375x667 (standing class 6)
{
  const { ctx, page } = await open();
  ok('main screen: no control under 48 rendered px', (await page.evaluate(TOUCH_PROBE)).length === 0, JSON.stringify(await page.evaluate(TOUCH_PROBE)).slice(0,200));
  await page.click('#openShop');
  await new Promise(r => setTimeout(r, 400));
  let bad = await page.evaluate(TOUCH_PROBE);
  ok('shop sheet: no control under 48 rendered px', bad.length === 0, JSON.stringify(bad).slice(0, 220));
  await page.click('#closeShop'); await page.click('#openDaily');
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
  await page.click('#openShop');
  await new Promise(r => setTimeout(r, 2600));
  hits = await page.evaluate(FAB_PROBE + '(' + JSON.stringify(box) + ')');
  ok('shop sheet: nothing tappable under the feedback fab', hits.mounted && !hits.eats, JSON.stringify(hits).slice(0, 260));
  await page.evaluate(() => { document.getElementById('closeShop').click(); document.getElementById('openDaily').click(); });
  await new Promise(r => setTimeout(r, 2600));
  hits = await page.evaluate(FAB_PROBE + '(' + JSON.stringify(box) + ')');
  ok('daily sheet: nothing tappable under the feedback fab', hits.mounted && !hits.eats, JSON.stringify(hits).slice(0, 260));
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

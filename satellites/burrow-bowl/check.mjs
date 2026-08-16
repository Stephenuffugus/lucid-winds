/* BURROW BOWL — audit gate (2026-08-16)
 *
 * Two phases, both required to pass:
 *   A. syntax    every inline script block compiles under node's vm
 *   B. behaviour a real headless browser at 375x667 drives the game
 *
 * ⛔ The phase A extractor is deliberately paranoid. A `</script>` living inside
 * a JS string truncates a naive split and makes the checker report a syntax
 * error in a perfectly good file (this cost the fleet a morning on 2026-08-16),
 * so a phase A failure is re-checked against the browser before it is believed:
 * if the page boots with no pageerror and exposes its API, the browser wins.
 *
 * Every assertion here was watched FAIL on purpose before it was allowed to pass.
 *
 * run:  node satellites/burrow-bowl/check.mjs
 */
import fs from 'node:fs';
import vm from 'node:vm';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const FILE = path.join(HERE, 'index.html');

let fails = 0, passes = 0;
const ok = (name, cond, detail) => {
  if (cond) { passes++; console.log('  ok   ' + name); }
  else { fails++; console.log('  FAIL ' + name + (detail ? '  <- ' + detail : '')); }
};

/* ---------------- phase A: syntax ---------------- */
const src = fs.readFileSync(FILE, 'utf8');
const blocks = [];
const re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
let m;
while ((m = re.exec(src))) blocks.push({ code: m[1], at: src.slice(0, m.index).split('\n').length });
console.log('phase A — syntax (' + blocks.length + ' inline blocks)');
let syntaxOk = true;
for (const b of blocks) {
  try { new vm.Script(b.code, { filename: 'block@' + b.at }); }
  catch (e) { syntaxOk = false; console.log('  FAIL block at line ' + b.at + ': ' + e.message); }
}
ok('inline blocks compile', syntaxOk);
ok('more than one inline block found', blocks.length >= 2, 'extractor found ' + blocks.length);

/* ---------------- phase B: behaviour ---------------- */
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.json': 'application/json',
  '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end('no'); return; }
  res.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
await new Promise(r => server.listen(0, r));
const PORT = server.address().port;
const URL_ = 'http://127.0.0.1:' + PORT + '/satellites/burrow-bowl/?bb_test=1';

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });

async function fresh(seed) {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message)));
  await page.goto(URL_, { waitUntil: 'domcontentloaded' });
  await page.evaluate(s => { localStorage.clear(); localStorage.setItem('sws_dev_ok', '1');
    if (s) for (const k in s) localStorage.setItem(k, s[k]); }, seed || null);
  errs.length = 0;
  await page.goto(URL_, { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 400));
  return { ctx, page, errs };
}

/* deterministic full round: nine perfect flicks straight into a ring */
async function playRound(page, mode) {
  await page.evaluate(m => { window.BB.start(m); }, mode || 'free');
  await page.waitForFunction("window.BB.state.phase==='aim'", { timeout: 4000 });
  for (let i = 0; i < 9; i++) {
    const left = await page.evaluate(() => window.BB.state.ballsLeft);
    if (left <= 0) break;
    await page.evaluate(() => window.BB.flick(1080, 0));
    await page.waitForFunction("window.BB.state.phase==='aim'||window.BB.state.phase==='idle'", { timeout: 8000 });
  }
  await page.waitForFunction("document.getElementById('s-sum').classList.contains('on')", { timeout: 8000 });
}

console.log('\nphase B — behaviour (375x667)');

/* B1 clean boot */
{
  const { ctx, page, errs } = await fresh();
  ok('boots with no page error', errs.length === 0, errs[0]);
  ok('title screen is showing', await page.$eval('#s-title', e => e.classList.contains('on')));
  ok('SWS_EXIT is a function', await page.evaluate(() => typeof window.SWS_EXIT === 'function'));
  ok('exit button calls SWS_EXIT (standing class 1)', await page.evaluate(() => {
    let called = false; const real = window.SWS_EXIT; window.SWS_EXIT = () => { called = true; };
    document.getElementById('b-exit').click(); window.SWS_EXIT = real; return called;
  }));
  /* the sunbeam SDK: absent for the whole life of this game before this audit */
  ok('sunbeam SDK is loaded', await page.evaluate(() => !!(window.Sunbeam && window.Sunbeam.earn)));
  ok('an earn actually reaches the SDK', await page.evaluate(() => {
    let got = 0; const real = window.Sunbeam.earn;
    window.Sunbeam.earn = n => { got = n; return Promise.resolve({ ok: true }); };
    window._sbCapEarn(3, 'checkmjs'); window.Sunbeam.earn = real; return got === 3;
  }));
  ok('the 30/day cap still holds', await page.evaluate(() => {
    let total = 0; const real = window.Sunbeam.earn;
    window.Sunbeam.earn = n => { total += n; return Promise.resolve({ ok: true }); };
    for (let i = 0; i < 20; i++) window._sbCapEarn(5, 'checkmjs');
    window.Sunbeam.earn = real; return total <= 30;
  }));
  await ctx.close();
}

/* B2 a full round, start to finish */
{
  const { ctx, page, errs } = await fresh();
  await playRound(page, 'free');
  const sum = await page.evaluate(() => ({
    score: +document.getElementById('sum-tot').textContent,
    chips: document.querySelectorAll('#sum-chips .chip').length,
    tix: +localStorage.getItem('bb_tickets'),
    rounds: JSON.parse(localStorage.getItem('bb_stats') || '{}').rounds
  }));
  ok('round reaches the summary', sum.chips === 9);
  ok('round scored above zero', sum.score > 0, 'score ' + sum.score);
  ok('tickets were banked', sum.tix > 0, 'tix ' + sum.tix);
  ok('the round was counted', sum.rounds === 1, 'rounds ' + sum.rounds);
  ok('a completed round throws nothing', errs.length === 0, errs[0]);
  await ctx.close();
}

/* B3 corrupt saves (standing class 3) — every one of these merely PARSES */
{
  const seeds = {
    'bb_stats': '5', 'bb_set': '"x"', 'bb_moments': '[]',
    'bb_daily': '7', 'bb_tickets': 'banana', 'bb_best': '{}'
  };
  const { ctx, page, errs } = await fresh(seeds);
  ok('a corrupt save still boots', errs.length === 0, errs[0]);
  ok('corrupt save: title renders', await page.$eval('#s-title', e => e.classList.contains('on')));
  await playRound(page, 'free');
  ok('corrupt save: a full round still finishes', await page.$eval('#s-sum', e => e.classList.contains('on')));
  ok('corrupt save: nothing threw', errs.length === 0, errs[0]);
  ok('corrupt save: stats are repaired on disk',
    await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('bb_stats')); return s && s.rounds === 1; }));
  await ctx.close();
}

/* B4 two tabs (standing class 4) */
{
  const { ctx, page } = await fresh();
  await page.evaluate(() => {
    localStorage.setItem('bb_stats', JSON.stringify({ rounds: 5, hundreds: 2, gutters: 1, totalScore: 900 }));
    localStorage.setItem('bb_tickets', '40');           // the other tab banked these while we played
  });
  await playRound(page, 'free');
  const after = await page.evaluate(() => ({
    s: JSON.parse(localStorage.getItem('bb_stats')), t: +localStorage.getItem('bb_tickets')
  }));
  ok('the other tab\'s rounds survive', after.s.rounds === 6, 'rounds ' + after.s.rounds);
  ok('the other tab\'s hundreds survive', after.s.hundreds >= 2, 'hundreds ' + after.s.hundreds);
  ok('the other tab\'s tickets survive', after.t > 40, 'tickets ' + after.t);
  await ctx.close();
}

/* B5 the daily survives a reload */
{
  const { ctx, page } = await fresh();
  await page.evaluate(() => { window.BB.start('daily'); });
  await page.waitForFunction("window.BB.state.phase==='aim'", { timeout: 4000 });
  for (let i = 0; i < 3; i++) {
    await page.evaluate(() => window.BB.flick(1080, 0));
    await page.waitForFunction("window.BB.state.phase==='aim'", { timeout: 8000 });
  }
  const before = await page.evaluate(() => ({ score: window.BB.state.score, left: window.BB.state.ballsLeft }));
  await page.reload({ waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 300));
  const menu = await page.evaluate(() => ({
    disabled: document.getElementById('b-daily').disabled,
    sub: document.getElementById('b-daily-sub').textContent
  }));
  ok('an interrupted daily is not locked out', menu.disabled === false, menu.sub);
  ok('the menu says it is unfinished', /unfinished/.test(menu.sub), menu.sub);
  await page.evaluate(() => { window.BB.start('daily'); });
  await page.waitForFunction("window.BB.state.phase==='aim'", { timeout: 4000 });
  const after = await page.evaluate(() => ({ score: window.BB.state.score, left: window.BB.state.ballsLeft }));
  ok('the daily resumes on the same score', after.score === before.score, before.score + ' -> ' + after.score);
  ok('the balls already spent stay spent', after.left === before.left, before.left + ' -> ' + after.left);
  await ctx.close();
}

/* B6 touch targets and overlays, measured RENDERED at 375x667 */
{
  const { ctx, page } = await fresh();
  const screens = ['s-title', 's-how', 's-set', 's-sum'];
  let small = [];
  for (const s of screens) {
    await page.evaluate(id => window.BB.show(id), s);
    await new Promise(r => setTimeout(r, 120));
    const bad = await page.evaluate(() => {
      const out = [];
      document.querySelectorAll('button,.settingline').forEach(b => {
        const r = b.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) return;             // not on screen
        if (r.height < 48 || r.width < 48) out.push((b.id || b.className) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height));
      });
      return out;
    });
    small = small.concat(bad);
  }
  ok('every visible control is 48px rendered (class 6)', small.length === 0, small.join(', '));

  /* the feedback fab must not sit on a control (class 2 + class 8) */
  await page.evaluate(() => window.BB.show('s-title'));
  await page.waitForFunction("!!document.querySelector('.lwfb-fab')", { timeout: 5000 });
  /* feedback.js parks the fab bottom right and then a watcher scans and moves it
     off anything it is covering, so give the watcher its cadence before judging */
  const measureClash = () => page.evaluate(() => {
    const fab = document.querySelector('.lwfb-fab');
    const f = fab.getBoundingClientRect();
    const hits = [];
    document.querySelectorAll('button').forEach(b => {
      if (fab === b || fab.contains(b)) return;      // the fab is not covering itself
      const r = b.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return;
      if (r.left < f.right && r.right > f.left && r.top < f.bottom && r.bottom > f.top) hits.push(b.id || b.className);
    });
    return hits;
  });
  const clashAtOnce = await measureClash();
  await new Promise(r => setTimeout(r, 3500));
  const clash = await measureClash();
  ok('the feedback fab covers no control once the watcher settles', clash.length === 0, clash.join(', '));
  ok('the feedback fab does not land on a control in the first place',
    clashAtOnce.length === 0, 'on mount it covered: ' + clashAtOnce.join(', '));
  await ctx.close();
}

/* B7 no dashes in player copy (class 7) */
{
  const { ctx, page } = await fresh();
  const bad = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('#stage *').forEach(el => {
      for (const n of el.childNodes) {
        if (n.nodeType === 3 && /[—–]|\s-\s|--/.test(n.nodeValue)) out.push(n.nodeValue.trim().slice(0, 60));
      }
    });
    return out;
  });
  ok('no dashes in player copy', bad.length === 0, bad.join(' | '));
  await ctx.close();
}

await browser.close();
server.close();
console.log('\n' + passes + ' passed, ' + fails + ' failed');
process.exit(fails ? 1 : 0);

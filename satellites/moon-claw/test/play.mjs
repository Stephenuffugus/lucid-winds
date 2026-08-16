/* MOON CLAW — real browser assertions.
 *   node satellites/moon-claw/test/play.mjs            (serves the repo root itself)
 *
 * Proves the things a node check cannot: that a full five token cabinet
 * actually completes, that a malformed save no longer freezes the machine, and
 * that the exit control and the feedback fab do not sit on top of anything.
 *
 * Watched RED before it was trusted: with the pre-audit index.html this run
 * reported "stuck in celebrate, summary never shown" for mc_shelf={}.
 * One browser at a time, on purpose.
 */
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, normalize } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..', '..');
const require = createRequire(join(ROOT, 'x.js'));
const puppeteer = require('puppeteer');

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
               '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json' };
const server = createServer(async (req, res) => {
  let p = normalize(decodeURIComponent(req.url.split('?')[0]));
  if (p.endsWith('/')) p += 'index.html';
  try {
    const buf = await readFile(join(ROOT, p));
    res.writeHead(200, { 'content-type': MIME[p.slice(p.lastIndexOf('.'))] || 'application/octet-stream' });
    res.end(buf);
  } catch { res.writeHead(404); res.end('nope'); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const BASE = 'http://127.0.0.1:' + server.address().port;

let fails = 0;
const ok = (n, c, x) => { if (c) console.log('  ok   ' + n); else { fails++; console.log('  FAIL ' + n + (x !== undefined ? '  -> ' + JSON.stringify(x) : '')); } };

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });

async function open(pre) {
  const ctx = await browser.createBrowserContext();   /* a fresh context per case: a shared one hides first-run bugs */
  const page = await ctx.newPage();
  await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 1 });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message)));
  await page.evaluateOnNewDocument(() => { try { localStorage.setItem('sws_dev_ok', '1'); } catch (e) {} });
  if (pre) await page.evaluateOnNewDocument(pre);
  await page.goto(BASE + '/satellites/moon-claw/?mc_test=1', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction('!!window.MC', { timeout: 8000 }).catch(() => {});
  return { ctx, page, errs };
}

/* one cabinet, five tokens, aiming at the highest body each time */
const PLAY = async () => {
  if (!window.MC) return { fail: 'no test hook' };
  MC.launch('free');
  const wait = ms => new Promise(r => setTimeout(r, ms));
  await wait(120);
  for (let d = 0; d < 6; d++) {
    let w = 0;
    while (MC.state.phase !== 'aim' && MC.state.phase !== 'done' && w < 160) { await wait(40); w++; }
    if (MC.state.phase === 'done') break;
    if (MC.state.phase !== 'aim') return { stuck: MC.state.phase, atDrop: d };
    if (MC.state.credits <= 0) break;
    let best = null;
    for (const b of MC.pile) if (b.zone === 'pile' && (!best || b.y < best.y)) best = b;
    MC.setClaw(best ? best.x : 300);
    MC.drop();
    await wait(60);
  }
  let w = 0;
  while (!document.getElementById('s-sum').classList.contains('on') && w < 200) { await wait(40); w++; }
  return {
    summary: document.getElementById('s-sum').classList.contains('on'),
    rows: document.getElementById('sum-rows').children.length,
    phase: MC.state.phase, haul: MC.state.haul,
    shelfIsArray: Array.isArray(JSON.parse(localStorage.getItem('mc_shelf') || 'null')),
    statsNumeric: (() => { const s = JSON.parse(localStorage.getItem('mc_stats') || '{}');
      return ['rounds','drops','grabs','sheds','koi'].every(k => Number.isFinite(s[k])); })()
  };
};

console.log('a clean cabinet completes');
{
  const { ctx, page, errs } = await open();
  const r = await page.evaluate(PLAY);
  ok('five drops reach the summary', r.summary === true, r);
  ok('the summary has one row per token', r.rows === 5, r.rows);
  ok('no page errors', errs.length === 0, errs);
  await ctx.close();
}

console.log('malformed saves no longer freeze the cabinet');
const POISONS = {
  'mc_shelf={}':        `localStorage.setItem('mc_shelf','{}')`,
  'mc_shelf=5':         `localStorage.setItem('mc_shelf','5')`,
  'mc_shelf=[junk]':    `localStorage.setItem('mc_shelf','[1,"x",{"t":"nope"},null]')`,
  'mc_stats=[]':        `localStorage.setItem('mc_stats','[]')`,
  'mc_stats="7"':       `localStorage.setItem('mc_stats','"7"')`,
  'mc_set=5':           `localStorage.setItem('mc_set','5')`,
  'mc_moments="x"':     `localStorage.setItem('mc_moments','"x"')`,
  'mc_daily=[]':        `localStorage.setItem('mc_daily','[]')`,
  'mc_best=abc':        `localStorage.setItem('mc_best','abc')`,
  'everything bad':     `['mc_shelf','mc_stats','mc_set','mc_moments','mc_daily','mc_best','mc_daily_best'].forEach(k=>localStorage.setItem(k,'{"lol":true}'))`
};
for (const [name, js] of Object.entries(POISONS)) {
  const { ctx, page, errs } = await open(`(()=>{try{${js};}catch(e){}})()`);
  const r = await page.evaluate(PLAY);
  ok(name + ': cabinet still finishes', r.summary === true, r);
  ok(name + ': no page error', errs.length === 0, errs.slice(0, 2));
  ok(name + ': the shelf is repaired to an array', r.shelfIsArray === true, r);
  ok(name + ': the stats are numbers', r.statsNumeric === true, r);
  await ctx.close();
}

console.log('the way out, and nothing sitting on it');
{
  const { ctx, page, errs } = await open();
  await new Promise(r => setTimeout(r, 1600));       /* the fab loads on window load */
  const r = await page.evaluate(() => {
    const b = document.getElementById('b-exit').getBoundingClientRect();
    const f = document.querySelector('.lwfb-fab');
    const fr = f ? f.getBoundingClientRect() : null;
    const covered = [];
    if (fr) document.querySelectorAll('button, .settingline').forEach(el => {
      const q = el.getBoundingClientRect();
      if (q.width && q.right > fr.left && q.left < fr.right && q.bottom > fr.top && q.top < fr.bottom)
        covered.push(el.id || el.className);
    });
    /* the exit must be reachable by a tap at its own centre, not just present */
    const hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
    return { exitH: b.height, exitW: b.width, exitVisible: b.width > 0 && b.height > 0,
             exitHit: hit ? hit.id : null, hasFab: !!f, fab: fr, covered,
             swsExit: typeof window.SWS_EXIT };
  });
  ok('SWS_EXIT is defined', r.swsExit === 'function', r.swsExit);
  ok('the exit button renders', r.exitVisible === true, r);
  ok('the exit is at least 48 rendered px tall', r.exitH >= 48, r.exitH);
  ok('a tap at the exit centre reaches the exit', r.exitHit === 'b-exit', r.exitHit);
  ok('the feedback fab mounted', r.hasFab === true);
  ok('the fab covers no control', r.covered.length === 0, r.covered);
  ok('no page errors', errs.length === 0, errs);
  await ctx.close();
}

console.log('tonight\'s cabinet is spent by the first token, not by opening it');
{
  const { ctx, page } = await open();
  const r = await page.evaluate(async () => {
    const wait = ms => new Promise(r => setTimeout(r, ms));
    document.getElementById('b-daily').click(); await wait(250);
    document.getElementById('how-back').click(); await wait(250);
    const backedOut = localStorage.getItem('mc_daily');
    MC.launch('daily'); await wait(150);
    const openedNoDrop = localStorage.getItem('mc_daily');
    MC.setClaw(300); MC.drop(); await wait(250);
    return { backedOut, openedNoDrop, afterDrop: localStorage.getItem('mc_daily') };
  });
  ok('reading the rules does not spend the day', r.backedOut === null, r);
  ok('opening the cabinet does not spend the day', r.openedNoDrop === null, r);
  ok('the first token does spend the day', /"started":true/.test(r.afterDrop || ''), r.afterDrop);
  await ctx.close();
}

await browser.close();
server.close();
console.log(fails ? '\n' + fails + ' FAILED' : '\nall browser checks passed');
process.exit(fails ? 1 : 0);

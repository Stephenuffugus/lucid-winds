/* BUDBURST — real browser assertions.
 *   node satellites/budburst/test/play.mjs
 *
 * Proves the two things that mattered in the 2026-08-16 audit:
 *   1. a malformed saved value can no longer take the game loop and the exit
 *      down with it (bb.miss = {"date":"<today>"} used to do exactly that:
 *      exitWired false, SWS_EXIT undefined, blank arena, permanent)
 *   2. the NEXT bud swap target is 48 rendered px, measured, not declared
 * plus: Meadow 1 plays to a result, and the feedback fab covers no control.
 *
 * Watched RED first: against the pre-audit file the poison run reported
 * exitWired:false / swsExit:"undefined", and the swap target measured 44.4px.
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
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 1 });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message)));
  if (pre) await page.evaluateOnNewDocument(pre);
  await page.goto(BASE + '/satellites/budburst/', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 700));
  return { ctx, page, errs };
}
const today = (() => { const d = new Date();
  return d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0') + '-' + String(d.getUTCDate()).padStart(2, '0'); })();

/* the boot facts a player depends on, whatever is in storage */
const BOOTSTATE = () => ({
  exitWired: !!document.getElementById('exitLink').onclick,
  swsExit: typeof window.SWS_EXIT,
  missionRows: document.getElementById('missionList').children.length,
  menuUp: document.getElementById('menu').classList.contains('on')
});
/* does the arena actually draw? count non transparent pixels after a level start */
const PLAY_MEADOW_1 = async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  document.querySelector('[data-mode="adventure"]').click(); await wait(250);
  const cell = document.querySelectorAll('#levelGrid .lvl')[0];
  if (!cell) return { fail: 'no level grid' };
  cell.click(); await wait(500);
  const coach = document.getElementById('coachBtn');
  if (document.getElementById('coachCard').classList.contains('on')) { coach.click(); await wait(150); }
  const cv = document.getElementById('arena');
  const c = cv.getContext('2d');
  const d = c.getImageData(0, 0, cv.width, cv.height).data;
  let lit = 0;
  for (let i = 3; i < d.length; i += 4 * 97) if (d[i] > 8) lit++;
  return { screen: document.querySelector('.screen.on').id, litSamples: lit, canvasW: cv.width };
};

console.log('a clean boot');
{
  const { ctx, page, errs } = await open();
  const b = await page.evaluate(BOOTSTATE);
  ok('the exit link is wired', b.exitWired === true, b);
  ok('SWS_EXIT is defined', b.swsExit === 'function', b);
  ok('today\'s goals rendered', b.missionRows === 3, b);
  const r = await page.evaluate(PLAY_MEADOW_1);
  ok('Meadow level 1 opens the game screen', r.screen === 'game', r);
  ok('the arena actually draws', r.litSamples > 50, r);
  ok('no page errors', errs.length === 0, errs);
  await ctx.close();
}

console.log('malformed saves no longer take the loop and the exit with them');
const POISONS = {
  'bb.miss date only':   `localStorage.setItem('bb.miss', JSON.stringify({date:'${today}'}))`,
  'bb.miss items=5':     `localStorage.setItem('bb.miss', JSON.stringify({date:'${today}',items:5}))`,
  'bb.miss items junk':  `localStorage.setItem('bb.miss', JSON.stringify({date:'${today}',items:[1,null,{id:'gone'}]}))`,
  'bb.miss = 7':         `localStorage.setItem('bb.miss','7')`,
  'bb.miss = []':        `localStorage.setItem('bb.miss','[]')`,
  'bb.prog = 5':         `localStorage.setItem('bb.prog','5')`,
  'bb.prog = "x"':       `localStorage.setItem('bb.prog','"x"')`,
  'bb.prog junk stars':  `localStorage.setItem('bb.prog', JSON.stringify({'0-0':'gold','0-1':null}))`,
  'bb.pzProg = true':    `localStorage.setItem('bb.pzProg','true')`,
  'bb.abil = 3':         `localStorage.setItem('bb.abil','3')`,
  'bb.boost = "no"':     `localStorage.setItem('bb.boost','"no"')`,
  'everything bad':      `['bb.miss','bb.prog','bb.pzProg','bb.abil','bb.boost'].forEach(k=>localStorage.setItem(k,'"wrecked"'))`
};
for (const [name, js] of Object.entries(POISONS)) {
  const { ctx, page, errs } = await open(`(()=>{try{${js};}catch(e){}})()`);
  const b = await page.evaluate(BOOTSTATE);
  ok(name + ': the exit link is still wired', b.exitWired === true, b);
  ok(name + ': SWS_EXIT is still defined', b.swsExit === 'function', b);
  const r = await page.evaluate(PLAY_MEADOW_1);
  ok(name + ': the arena still draws', r.litSamples > 50, r);
  ok(name + ': no page error', errs.length === 0, errs.slice(0, 2));
  await ctx.close();
}

console.log('the NEXT swap target, measured');
{
  const { ctx, page } = await open();
  await page.evaluate(PLAY_MEADOW_1);
  const r = await page.evaluate(async () => {
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const cv = document.getElementById('arena');
    const cr = cv.getBoundingClientRect();
    /* the module scope is closed, so probe the behaviour instead of the number:
       sweep points across the band beside the launcher and see where a
       pointerdown swaps the ammo rather than aiming. That is the real target. */
    const arenaW = cr.width, arenaH = cr.height;
    const COLS = 8, band = 94, oy = 10;
    const R = Math.min((arenaW - 20) / (COLS * 2), (arenaH - band - oy) / (9 * Math.sqrt(3) + 2));
    const playW = COLS * R * 2, ox = (arenaW - playW) / 2;
    const sx = ox + playW / 2, sy = arenaH - band / 2;
    const cx = sx + R * 3;                         /* the drawn NEXT bud centre */
    const hitsX = [], hitsY = [];
    const fire = (x, y) => {
      const before = document.getElementById('shotsVal').textContent;
      cv.dispatchEvent(new PointerEvent('pointerdown', { clientX: cr.left + x, clientY: cr.top + y, pointerId: 1, bubbles: true }));
      cv.dispatchEvent(new PointerEvent('pointerup',   { clientX: cr.left + x, clientY: cr.top + y, pointerId: 1, bubbles: true }));
      /* a swap does NOT spend a shot; an aim-and-release DOES */
      return document.getElementById('shotsVal').textContent === before;
    };
    for (let x = Math.round(cx - 60); x <= Math.round(cx + 60); x++) { if (fire(x, cy0())) hitsX.push(x); await wait(0); }
    function cy0(){ return sy + R * 0.3; }
    for (let y = Math.round(cy0() - 60); y <= Math.round(cy0() + 60); y++) { if (fire(cx, y)) hitsY.push(y); await wait(0); }
    const span = a => a.length ? (a[a.length - 1] - a[0] + 1) : 0;
    return { widthPx: span(hitsX), heightPx: span(hitsY), R };
  });
  ok('the swap target is at least 48px wide at 375x667', r.widthPx >= 48, r);
  ok('the swap target is at least 48px tall at 375x667', r.heightPx >= 48, r);
  await ctx.close();
}

console.log('nothing sits on a control, on every screen');
{
  const { ctx, page, errs } = await open();
  await new Promise(r => setTimeout(r, 2200));
  for (const id of ['menu', 'map', 'loadout', 'puzzles', 'shop', 'result']) {
    const cov = await page.evaluate(screen => {
      /* budburst's screens are opacity + pointer-events, never display:none, so
         EVERY screen has a live rect at all times. Scope to the one that is on,
         or this test reports the loadout's button on the shop. */
      for (const k of ['menu', 'map', 'loadout', 'puzzles', 'game', 'result', 'shop'])
        document.getElementById(k).classList.toggle('on', k === screen);
      const f = document.querySelector('.lwfb-fab');
      if (!f) return ['no fab'];
      const out = [];
      document.querySelectorAll('#' + screen + ' button, #' + screen + ' .lvl, #' + screen + ' .gtab, #' + screen + ' .shop-tab, #' + screen + ' .load-slot, #' + screen + ' .load-ab').forEach(el => {
        const q = el.getBoundingClientRect();
        if (!q.width || !q.height) return;
        /* the real question is not overlap, it is reachability: what does a tap
           at the control's own centre actually hit? (never el.click()) */
        const hit = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2);
        if (hit && hit.closest && hit.closest('.lwfb-fab')) out.push(el.id || el.className);
      });
      return out;
    }, id);
    ok('fab covers no control on ' + id, cov.length === 0, cov);
  }
  /* the game screen: the fab must clear the launcher and the swap target */
  const g = await page.evaluate(async () => {
    const wait = ms => new Promise(r => setTimeout(r, ms));
    for (const k of ['menu','map','loadout','puzzles','game','result','shop'])
      document.getElementById(k).classList.toggle('on', k === 'menu');
    document.querySelector('[data-mode="blitz"]').click(); await wait(400);
    const f = document.querySelector('.lwfb-fab'); const fr = f.getBoundingClientRect();
    const cv = document.getElementById('arena'); const cr = cv.getBoundingClientRect();
    const arenaW = cr.width, arenaH = cr.height, COLS = 8, band = 94, oy = 10;
    const R = Math.min((arenaW - 20) / (COLS * 2), (arenaH - band - oy) / (9 * Math.sqrt(3) + 2));
    const playW = COLS * R * 2, ox = (arenaW - playW) / 2;
    const sx = ox + playW / 2, sy = arenaH - band / 2;
    const next = { l: cr.left + sx + R * 3 - 24, r: cr.left + sx + R * 3 + 24,
                   t: cr.top + sy + R * 0.3 - 29, b: cr.top + sy + R * 0.3 + 29 };
    const launcher = { l: cr.left + sx - R * 1.4, r: cr.left + sx + R * 1.4,
                       t: cr.top + sy - R * 1.4, b: cr.top + sy + R * 1.4 };
    const hit = (a) => a.r > fr.left && a.l < fr.right && a.b > fr.top && a.t < fr.bottom;
    const hudBtns = [];
    document.querySelectorAll('#game button').forEach(el => {
      const q = el.getBoundingClientRect();
      if (q.width && q.right > fr.left && q.left < fr.right && q.bottom > fr.top && q.top < fr.bottom)
        hudBtns.push(el.id || el.className);
    });
    return { overNext: hit(next), overLauncher: hit(launcher), hudBtns, fab: [fr.left | 0, fr.top | 0] };
  });
  ok('the fab does not cover the swap target', g.overNext === false, g);
  ok('the fab does not cover the launcher', g.overLauncher === false, g);
  ok('the fab covers no in game button', g.hudBtns.length === 0, g.hudBtns);
  ok('no page errors', errs.length === 0, errs);
  await ctx.close();
}

await browser.close();
server.close();
console.log(fails ? '\n' + fails + ' FAILED' : '\nall browser checks passed');
process.exit(fails ? 1 : 0);

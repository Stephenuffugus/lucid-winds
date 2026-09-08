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
import { outcomeOf, CONST as SIM } from './sim.mjs';

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

/* THE STAMP LAW (2026-09-08). This game has no stamp of its own: it rides the
   portal's ?v=. Three places must agree or the phone keeps an old build. */
{
  const bb = (src.match(/var BB_BUILD='(\d{8}[a-z])'/) || [])[1];
  const cmt = (src.match(/BB_BUILD (\d{8}[a-z]):/) || [])[1];
  const portal = (fs.readFileSync(path.join(ROOT, 'portal/index.html'), 'utf8').match(/\/satellites\/burrow-bowl\/\?v=(\d{8}[a-z])/) || [])[1];
  const tags = (fs.readFileSync(path.join(ROOT, 'portal/catalog-tags.json'), 'utf8').match(/\/satellites\/burrow-bowl\/\?v=(\d{8}[a-z])/) || [])[1];
  ok('BB_BUILD is declared and its comment agrees', !!bb && bb === cmt, bb + ' vs comment ' + cmt);
  ok('portal/index.html ?v= carries the same stamp', !!bb && portal === bb, 'portal ' + portal + ' vs game ' + bb);
  ok('portal/catalog-tags.json ?v= carries the same stamp', !!bb && tags === bb, 'tags ' + tags + ' vs game ' + bb);
}

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

async function fresh(seed, size) {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport({ width: (size && size.width) || 375, height: (size && size.height) || 667, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  /* the game pauses itself on visibilitychange and the loop is rAF driven, so a
     backgrounded tab stalls the round and the wait times out for the wrong reason */
  await page.bringToFront();
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

/* Deterministic full round: nine perfect flicks straight into a ring.
   ⛔ The game's loop is rAF driven and it pauses itself on visibilitychange, so
   this needs a foregrounded page and generous timeouts. On a two core box the
   suite is flaky if another headless browser is running beside it: run it alone. */
async function playRound(page, mode) {
  await page.evaluate(m => { window.BB.start(m); }, mode || 'free');
  await page.waitForFunction("window.BB.state.phase==='aim'", { timeout: 4000 });
  for (let i = 0; i < 9; i++) {
    const left = await page.evaluate(() => window.BB.state.ballsLeft);
    if (left <= 0) break;
    await page.evaluate(() => window.BB.flick(1080, 0));
    await page.waitForFunction("window.BB.state.phase==='aim'||window.BB.state.phase==='idle'", { timeout: 45000 });
  }
  await page.waitForFunction("document.getElementById('s-sum').classList.contains('on')", { timeout: 45000 });
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
    await page.waitForFunction("window.BB.state.phase==='aim'", { timeout: 45000 });
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

  /* the feedback fab must not sit on a control (class 2 + class 8).
     Measured on EVERY screen: this game's menus are a centred button column and
     the fab's default bottom-right footprint covered the right edge of
     "Take the lane", "Settings", "All Sky Wolf games" and "Menu". */
  await page.waitForFunction("!!document.querySelector('.lwfb-fab')", { timeout: 5000 });
  const measureClash = () => page.evaluate(() => {
    const fab = document.querySelector('.lwfb-fab');
    const f = fab.getBoundingClientRect();
    const hits = [];
    document.querySelectorAll('button,.settingline').forEach(b => {
      if (fab === b || fab.contains(b)) return;      // the fab is not covering itself
      const r = b.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return;
      if (r.left < f.right && r.right > f.left && r.top < f.bottom && r.bottom > f.top) hits.push(b.id || b.className);
    });
    return hits;
  });
  let fabHits = [];
  for (const sc of ['s-title', 's-how', 's-set', 's-sum', 's-play']) {
    await page.evaluate(id => window.BB.show(id), sc);
    await new Promise(r => setTimeout(r, 150));
    const h = await measureClash();
    if (h.length) fabHits.push(sc + ':' + h.join('/'));
  }
  ok('the feedback fab covers no control on any screen', fabHits.length === 0, fabHits.join(', '));

  /* ⛔ A fab that has faded itself out would make the collision test above pass
     for the wrong reason, so state the whole invariant: either it is visible and
     clear of every control, or it is invisible AND untappable. feedback.js sets
     pointer-events:none while it is yielding, and its own 20s ceiling brings it
     back, so both halves are legitimate. A hidden fab that still took taps would
     be the worst of both. */
  {
    const v = await page.evaluate(() => {
      const f = document.querySelector('.lwfb-fab'); if (!f) return null;
      const cs = getComputedStyle(f);
      return { op: parseFloat(cs.opacity), pe: cs.pointerEvents };
    });
    ok('the fab is visible-and-clear or invisible-and-untappable',
      !!v && (v.op > 0.05 ? true : v.pe === 'none'), JSON.stringify(v));
  }
  ok('the fab is on screen and tappable', await page.evaluate(() => {
    const r = document.querySelector('.lwfb-fab').getBoundingClientRect();
    return r.width >= 40 && r.height >= 40 && r.left >= 0 && r.top >= 0 &&
           r.right <= innerWidth && r.bottom <= innerHeight;
  }));
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

/* B8 THE FLICK, from where the THUMB stands (2026-09-08; Stephen Sep 07 lines
   30 and 31, the Aug 20 complaint back: "won't let me score the big points in
   the top left and right, it just bounces off them", "impossible to do anything
   except for a 10"). Until today this gate never drove a pointer; its only
   launches were BB.flick(1080,0), 53 percent of the clamp, so a wall that sat
   under any hard thumb stayed green for three weeks.

   Every throw here is a REAL pointer drag on the element under the thumb at a
   412x915 viewport (his phone), in CSS px/s. The points are dispatched inside
   ONE page.evaluate with timer waits between them (the fleet's flick shape,
   satellites/gerplunk/test/harness.mjs): a driver round trip that landed inside
   the release window would read as a slow hand and the gate would measure the
   driver, not the game. One drag is ALSO sent through CDP (page.mouse) so the
   trusted input path is proven end to end. */
{
  const W = 412, Hh = 915;
  const { ctx, page, errs } = await fresh(null, { width: W, height: Hh });
  const scale = W / 540, top = (Hh - 960 * scale) / 2;              /* #stage is scaled and centred by fit() */
  const css = (sx, sy) => ({ x: sx * scale, y: top + sy * scale });
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  /* the game reads the flick in STAGE px/s (stagePt scales by 540/W, 1.311 here);
     every speed in this block is CSS px/s, so a read is brought back to CSS
     before it is compared. The first draft compared the raw stage read with a
     0.75 to 1.35 band and passed by the accident that 540/412 sits inside it. */
  const cssRead = r => r ? Math.round(-r.vy * W / 540) : null;

  /* a throw: speed in CSS px/s along an angle off straight up (negative is
     left), ms long, after an optional slow hold ({speed, ms}). The points are
     placed by the CLOCK, not by count: each is put where a thumb at that speed
     would be at the moment it is dispatched, so a late timer on a loaded box
     changes how many points there are and never the speed the game reads. The
     first draft placed a fixed displacement per timer tick, and on two cores
     under a 4.1 load a 3000 px/s snap read as 491 over 80 ms (its last two
     points 80 ms apart) and the next throw never launched at all. */
  const gesture = (speed, deg, ms, hold) => {
    const a = deg * Math.PI / 180;
    return { ux: Math.sin(a), uy: -Math.cos(a), start: css(270, 905), segs: (hold ? [{ speed: hold.speed, ms: hold.ms }] : []).concat([{ speed, ms }]) };
  };
  const dispatch = g => page.evaluate(async (g) => {
    const el = document.elementFromPoint(g.start.x, g.start.y);
    if (!el) throw new Error('nothing under the thumb at ' + g.start.x + ',' + g.start.y);
    const base = { pointerId: 7, pointerType: 'touch', isPrimary: true, bubbles: true, cancelable: true };
    const ev = (type, x, y) => new PointerEvent(type, Object.assign({}, base, { clientX: x, clientY: y }));
    const wait = ms => new Promise(r => setTimeout(r, ms));
    let x = g.start.x, y = g.start.y; const times = [performance.now()];
    el.dispatchEvent(ev('pointerdown', x, y));
    for (const s of g.segs) {
      const t0 = performance.now(), x0 = x, y0 = y;
      for (;;) {
        await wait(10);
        const t = performance.now() - t0;
        x = x0 + g.ux * s.speed * t / 1000; y = y0 + g.uy * s.speed * t / 1000;
        el.dispatchEvent(ev('pointermove', x, y)); times.push(performance.now());
        if (t >= s.ms) break;
      }
    }
    el.dispatchEvent(ev('pointerup', x, y));
    return { el: el.id || el.tagName, n: times.length, lastGap: times[times.length - 1] - times[times.length - 2], span: times[times.length - 1] - times[0] };
  }, g);
  const cdp = async g => {
    let x = g.start.x, y = g.start.y; const times = [performance.now()];
    await page.mouse.move(x, y); await page.mouse.down();
    for (const s of g.segs) {
      const t0 = performance.now(), x0 = x, y0 = y;
      for (;;) {
        await sleep(10);
        const t = performance.now() - t0;
        x = x0 + g.ux * s.speed * t / 1000; y = y0 + g.uy * s.speed * t / 1000;
        await page.mouse.move(x, y); times.push(performance.now());
        if (t >= s.ms) break;
      }
    }
    await page.mouse.up();
    return { el: 'cdp', n: times.length, lastGap: times[times.length - 1] - times[times.length - 2], span: times[times.length - 1] - times[0] };
  };
  /* rack a ball (a new round when the last one is spent), throw, wait for the
     verdict. Returns the game's own read of the release and its outcome. A drag
     that never launches comes back as kind 'nolaunch' so the assertions go red
     instead of the gate hanging 45 s and crashing (the first run did). */
  const ready = async () => {
    const st = await page.evaluate(() => ({ ph: window.BB.state.phase, on: document.getElementById('s-play').classList.contains('on') }));
    if (!(st.on && st.ph === 'aim')) { await page.evaluate(() => window.BB.start('free')); await page.waitForFunction("window.BB.state.phase==='aim'", { timeout: 4000 }); await sleep(400); }
  };
  const verdict = async () => {
    const left = await page.waitForFunction("window.BB.state.phase!=='aim'&&window.BB.state.phase!=='roll'", { timeout: 4000 }).then(() => true, () => false);
    const v = await page.evaluate(() => { const G = window.BB.state; const r = window.BB.lastRead();
      return { phase: G.phase, out: G.out, land: G.land, read: r ? { vx: Math.round(r.vx), vy: Math.round(r.vy), ms: Math.round(r.ms), n: r.n } : null }; });
    if (!left && v.phase === 'aim') return { kind: 'nolaunch', pts: null, read: v.read };
    await page.waitForFunction("window.BB.state.phase==='aim'||window.BB.state.phase==='idle'", { timeout: 45000 });
    if (v.phase === 'rollback') return { kind: 'rollback', pts: null, read: v.read };
    return { kind: v.out.kind, pts: v.out.pts, landY: v.land ? v.land.y : null, landX: v.land ? Math.round(v.land.x) : null, read: v.read };
  };
  const throwAt = async (speed, deg, via, hold, ms) => {
    await ready();
    await page.evaluate(() => { window.BB.state.hintT = 0; });
    const g = gesture(speed, deg, ms || 90, hold);
    const d = await (via === 'cdp' ? cdp(g) : dispatch(g));
    const v = await verdict();
    v.el = d.el; v.speed = speed; v.deg = deg; v.lastGap = d.lastGap; v.n = d.n; v.span = d.span;
    console.log('       ' + (via === 'cdp' ? 'cdp  ' : 'drag ') + String(speed).padStart(5) + ' px/s at ' + String(deg).padStart(3) + ' deg  (' + d.n + ' pts over ' + Math.round(d.span) + ' ms, last gap ' + Math.round(d.lastGap) + ')  read ' + (v.read ? cssRead(v.read) + ' CSS px/s over ' + v.read.ms + ' ms' : 'none') + '  ->  ' + v.kind + ' ' + v.pts + (v.landY != null ? '  (x ' + v.landX + ', y ' + v.landY + ')' : ''));
    return v;
  };

  /* THE ROUTE IN is the player's, by real taps: Roll a round, Take the lane.
     The fleet's music card (music-unlocks.js) is up at boot on a fresh profile
     and docks over the bottom third of the screen, which is the RACK. The first
     run of this block started the round through BB.start() and found the card
     under the thumb (elementFromPoint gave DIV): every drag was eaten by the
     card and the gate read a fault the player never meets, because the card
     folds into its pill the moment the player touches the game outside it.
     Tapping the title button IS that touch. A tap here is page.touchscreen at
     the control's centre after elementFromPoint has proved the centre is the
     control (never el.click()). */
  const tapId = async id => {
    const c = await page.$eval('#' + id, e => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    const hit = await page.evaluate(([x, y, id]) => { const e = document.elementFromPoint(x, y); return e ? (e.id === id || !!e.closest('#' + id)) ? 'self' : (e.id || e.tagName) : 'null'; }, [c.x, c.y, id]);
    if (hit !== 'self') throw new Error('#' + id + ' is not under its own centre: ' + hit);
    await page.touchscreen.tap(c.x, c.y);
  };
  const cardUp = await page.evaluate(() => { const c = document.getElementById('sws-music-card'); return !!(c && c.style.display !== 'none'); });
  await tapId('b-play');
  await page.waitForFunction("document.getElementById('s-how').classList.contains('on')", { timeout: 4000 }); await sleep(350);
  await tapId('how-go');
  await page.waitForFunction("window.BB.state.phase==='aim'&&document.getElementById('s-play').classList.contains('on')", { timeout: 4000 }); await sleep(400);
  const cardNow = await page.evaluate(() => { const c = document.getElementById('sws-music-card'); return c ? (c.style.display === 'none' ? 'folded' : 'up') : 'gone'; });
  console.log('       music card at boot: ' + (cardUp ? 'up' : 'absent') + ', after the route in: ' + cardNow);
  /* the thumb lands on the canvas, not on a screen, a card or a chip (class 1) */
  const under = await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? e.id || e.tagName : null; }, [css(270, 905).x, css(270, 905).y]);
  ok('the thumb\'s start point is the game canvas', under === 'game', 'elementFromPoint gave ' + under);

  /* THE READ: a hold then a snap reads the SNAP. 320 ms of 200 px/s, then 60 ms
     of 3000 px/s. The 120 ms window averaged the snap with the hold before it;
     the 55 ms window sees only the snap. The window may reach past 55 ms only
     when the last two points are themselves further apart than that (the game
     always reads at least two points). */
  const snap = await throwAt(3000, 0, 'page', { speed: 200, ms: 320 }, 60);
  ok('a hold then a snap reads the snap, not the average', !!snap.read && cssRead(snap.read) >= 0.8 * 3000, 'read ' + cssRead(snap.read) + ' CSS px/s of 3000');
  ok('the read window is the last 55 ms', !!snap.read && snap.read.ms <= Math.max(55, snap.lastGap) + 2, 'window ' + (snap.read && snap.read.ms) + ' ms, last gap ' + Math.round(snap.lastGap));

  /* STRAIGHT at a thumb's speeds: judged by the board, never walled. A straight
     overthrow is the back band and rolls down to the tray for 10 BY THE RULES
     CARD ("Overthrow it and the back wall hands the ball down to the tray"),
     so the law here is "judged at full depth", not "scores". */
  for (const v of [2000, 3000, 5000]) {
    const r = await throwAt(v, 0, 'page');
    ok('straight ' + v + ' px/s is read at speed', !!r.read && Math.abs(cssRead(r.read) - v) <= 0.15 * v, 'read ' + cssRead(r.read) + ' CSS px/s');
    ok('straight ' + v + ' px/s is judged, not walled', r.kind !== 'wall' && (r.kind === 'tray' || r.kind === 'sink'), r.kind);
    ok('straight ' + v + ' px/s reaches full depth', r.landY === SIM.DY1, 'landY ' + r.landY);
  }
  /* the same straight flick through the trusted CDP pointer */
  const c = await throwAt(3000, 0, 'cdp');
  ok('a CDP mouse drag launches the ball', !!c.read && c.kind !== 'rollback', JSON.stringify(c.read));
  ok('the CDP drag is judged, not walled', c.kind !== 'wall', c.kind);

  /* ON A LINE: 15 degrees toward a corner at 2000, 3000 and 5000 sinks the 100.
     The launch clamp scales the send as a vector, so the line survives the
     power; without that the lateral part outran the capped forward part and a
     harder flick on the same line drifted into the air gutter. */
  for (const v of [2000, 3000, 5000]) {
    const r = await throwAt(v, -15, 'page');
    ok('15 deg at ' + v + ' px/s sinks the corner 100', r.kind === 'sink' && r.pts === 100, r.kind + ' ' + r.pts);
  }
  /* a small sweep of lines at a firm 2500, both corners: at least one sinks */
  let sunk = 0;
  for (const d of [-16, -13, 13, 16]) { const r = await throwAt(2500, d, 'page'); if (r.kind === 'sink' && r.pts === 100) sunk++; }
  ok('a sweep of lines at 2500 px/s sinks at least one corner 100', sunk >= 1, sunk + ' sunk');

  /* the wide send is still the gutter, the 100 is still a line */
  const wide = await throwAt(3000, -24, 'page');
  ok('a wide full send still gutters', wide.kind === 'gutterAir', wide.kind);

  /* SCRIPTED full power straight is not a wall, and the gate's old workhorse still sinks */
  await ready();
  await page.evaluate(() => window.BB.flick(2050, 0));
  const full = await verdict();
  ok('BB.flick(2050,0), full power straight, is judged and not a wall', full.kind === 'tray' && full.landY === SIM.DY1, full.kind + ' y ' + full.landY);
  await ready();
  await page.evaluate(() => window.BB.flick(1080, 0));
  const forty = await verdict();
  ok('BB.flick(1080,0) still sinks the 40', forty.kind === 'sink' && forty.pts === 40, forty.kind + ' ' + forty.pts);

  /* THE SEAM: sim.mjs and the game answer the same launches the same way. The
     replica reads every constant and judge() out of index.html; the fifteen
     lines it mirrors (the roll and toFlight) are held to the browser here. */
  const seam = [[1080, 0], [2050, 0], [2050, -230], [1650, -190], [900, 0], [400, 0], [1500, 330], [2050, -300], [1250, 60]];
  const drift = [];
  for (const [vy, vxW] of seam) {
    await ready();
    await page.evaluate(([a, b]) => window.BB.flick(a, b), [vy, vxW]);
    const b = await verdict(), s_ = outcomeOf(vy, vxW);
    if (b.kind !== s_.kind || b.pts !== s_.pts) drift.push(vy + ',' + vxW + ': game ' + b.kind + ' ' + b.pts + ' vs sim ' + s_.kind + ' ' + s_.pts);
  }
  ok('sim.mjs agrees with the game on ' + seam.length + ' launches (the seam)', drift.length === 0, drift.join(' | '));
  ok('the replica reads the launch clamp the game uses', SIM.VY_MAX === await page.evaluate(() => { window.BB.flick(99999, 0); return window.BB.state.vy; }), 'sim ' + SIM.VY_MAX);
  ok('B8 threw nothing', errs.length === 0, errs[0]);
  await ctx.close();
}

await browser.close();
server.close();
console.log('\n' + passes + ' passed, ' + fails + ' failed');
process.exit(fails ? 1 : 0);

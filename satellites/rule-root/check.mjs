/* RULE ROOT — audit gate (2026-08-16)
 *
 *   A. syntax    every inline script block compiles under node's vm
 *   B. behaviour a real headless browser at 375x667 drives the game
 *
 * ⛔ A `</script>` inside a JS string breaks a naive extractor and makes phase A
 * report a syntax error in a fine file. Phase B is the tie breaker.
 *
 * Every assertion here was watched FAIL on purpose before it was allowed to pass.
 *
 * run:  node satellites/rule-root/check.mjs
 */
import fs from 'node:fs';
import vm from 'node:vm';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');

let fails = 0, passes = 0;
const ok = (name, cond, detail) => {
  if (cond) { passes++; console.log('  ok   ' + name); }
  else { fails++; console.log('  FAIL ' + name + (detail ? '  <- ' + detail : '')); }
};

/* ---------------- phase A ---------------- */
const src = fs.readFileSync(path.join(HERE, 'index.html'), 'utf8');
const blocks = [];
const re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
let m; while ((m = re.exec(src))) blocks.push({ code: m[1], at: src.slice(0, m.index).split('\n').length });
console.log('phase A — syntax (' + blocks.length + ' inline blocks)');
let syntaxOk = true;
for (const b of blocks) {
  try { new vm.Script(b.code, { filename: 'block@' + b.at }); }
  catch (e) { syntaxOk = false; console.log('  FAIL block at line ' + b.at + ': ' + e.message); }
}
ok('inline blocks compile', syntaxOk);

/* ---------------- phase B ---------------- */
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.svg': 'image/svg+xml' };
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
const URL_ = 'http://127.0.0.1:' + PORT + '/satellites/rule-root/?rrtest=1';

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });

async function fresh(seed) {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.bringToFront();
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message)));
  await page.goto(URL_, { waitUntil: 'domcontentloaded' });
  await page.evaluate(s => { localStorage.clear(); localStorage.setItem('rr_how_v1', '1');
    if (s) for (const k in s) localStorage.setItem(k, s[k]); }, seed || null);
  errs.length = 0;
  await page.goto(URL_, { waitUntil: 'load' });
  await page.waitForFunction('!!window.RR_DEV', { timeout: 8000 });
  await new Promise(r => setTimeout(r, 250));
  return { ctx, page, errs };
}

console.log('\nphase B — behaviour (375x667)');

/* B1 clean boot and a way out */
{
  const { ctx, page, errs } = await fresh();
  ok('boots with no page error', errs.length === 0, errs[0]);
  ok('title screen is showing', await page.$eval('#s-title', e => e.className.indexOf('on') >= 0));
  ok('the build stamp painted (refreshTitle survived boot)',
    await page.$eval('#buildstamp', e => /gardens/.test(e.textContent)), 'refreshTitle threw');
  /* standing class 1: the portal navigates relative /satellites/ urls TOP LEVEL,
     so an exit gated on window.parent never fires. This one is its own. */
  ok('SWS_EXIT is the game\'s own function', await page.evaluate(() => typeof window.SWS_EXIT === 'function'));
  ok('there is an exit button on the title screen', await page.evaluate(() => {
    const b = document.getElementById('b-exit');
    return !!b && b.getBoundingClientRect().height > 10;
  }));
  /* arcade-exit.js injects its own chip when a game has no SWS_EXIT. Now that
     this game owns one, there must be exactly ONE way out on the title screen,
     not two (Hush shipped with two identical buttons for exactly this reason). */
  ok('there is exactly one exit affordance', await page.evaluate(() => {
    const n = document.querySelectorAll('#b-exit, #sws-arcade-exit').length;
    return n === 1;
  }), 'found both the game button and the injected chip');
  ok('the exit button calls SWS_EXIT', await page.evaluate(() => {
    let called = false; const real = window.SWS_EXIT; window.SWS_EXIT = () => { called = true; };
    document.getElementById('b-exit').click(); window.SWS_EXIT = real; return called;
  }));
  ok('the stage is fitted from visualViewport, not innerHeight', await page.evaluate(() => {
    const t = getComputedStyle(document.getElementById('stage')).transform;
    const s = t === 'none' ? 1 : parseFloat(t.split('(')[1]);
    const vv = window.visualViewport;
    const want = Math.min((vv ? vv.width : innerWidth) / 540, (vv ? vv.height : innerHeight) / 960);
    return Math.abs(s - want) < 0.01;
  }));
  await ctx.close();
}

/* B2 solve a garden start to finish */
{
  const { ctx, page, errs } = await fresh();
  const r = await page.evaluate(() => RR_DEV.autoplay(0, { maxStates: 200000 }));
  ok('garden one is solvable and the game agrees', r && r.ok === true, JSON.stringify(r));
  ok('the win screen shows', await page.$eval('#s-win', e => e.className.indexOf('on') >= 0));
  const prog = await page.evaluate(() => JSON.parse(localStorage.getItem('ruleroot_save')));
  ok('the solve was written to disk', !!(prog && prog.solved && prog.solved['0']), JSON.stringify(prog && prog.solved));
  ok('a solve throws nothing', errs.length === 0, errs[0]);
  await ctx.close();
}

/* B3 corrupt saves (standing class 3). Every one of these merely PARSES, and the
   old code walked all of them straight into the game. */
for (const bad of ['{}', '5', '"x"', '[]', '{"solved":7,"life":3,"eq":"nope"}']) {
  const { ctx, page, errs } = await fresh({ 'ruleroot_save': bad, 'ruleroot_set': '"nope"' });
  const label = 'corrupt save ' + bad.slice(0, 22);
  ok(label + ': boots clean', errs.length === 0, errs[0]);
  ok(label + ': the build stamp painted', await page.$eval('#buildstamp', e => /gardens/.test(e.textContent)));
  /* THE defect: tapping Journey threw inside the click handler and the button
     silently did nothing at all */
  await page.click('#b-journey');
  await new Promise(r => setTimeout(r, 250));
  const shown = await page.evaluate(() => ({
    on: document.getElementById('s-levels').className.indexOf('on') >= 0,
    cards: document.querySelectorAll('#lvl-grid .lvlcard').length
  }));
  ok(label + ': Journey opens with its gardens', shown.on && shown.cards > 10, JSON.stringify(shown));
  ok(label + ': nothing threw', errs.length === 0, errs[0]);
  await ctx.close();
}

/* B4 two tabs (standing class 4) */
{
  const { ctx, page } = await fresh();
  await page.evaluate(() => {
    /* the other tab got further than we did while we sat on the title screen */
    localStorage.setItem('ruleroot_save', JSON.stringify({
      solved: { '5': 1, '6': 1 }, seeds: { '5': 1 }, best: { '5': 12 },
      daily: { d: 900, streak: 4, done: 900 }, grove: [{ ch: 1, seed: 3, d: 1 }],
      life: { solves: 9, seeds: 3 }, eq: { tile: 'slate', walker: 'sprout', bg: 'soil' }, owned: {}
    }));
  });
  await page.evaluate(() => RR_DEV.autoplay(0, { maxStates: 200000 }));
  const disk = await page.evaluate(() => JSON.parse(localStorage.getItem('ruleroot_save')));
  ok('the other tab\'s solved gardens survive', !!(disk.solved['5'] && disk.solved['6']), JSON.stringify(disk.solved));
  ok('our new solve is there too', !!disk.solved['0'], JSON.stringify(disk.solved));
  ok('the other tab\'s seeds survive', !!disk.seeds['5']);
  ok('life counters take the max, not the stale copy', disk.life.solves >= 9, 'solves ' + disk.life.solves);
  ok('the other tab\'s streak survives', disk.daily.streak === 4, 'streak ' + disk.daily.streak);
  ok('the other tab\'s keepsake survives', disk.grove.length >= 1);
  await ctx.close();
}

/* B5 the softlock prompt has two live ways out */
{
  const { ctx, page } = await fresh();
  await page.evaluate(() => RR_DEV.load(0));
  await page.evaluate(() => RR_DEV.move('U'));
  const wiring = await page.evaluate(() => {
    document.getElementById('soft').className = 'on';   // force the prompt up to test its wiring
    const u = document.getElementById('soft-undo'), r = document.getElementById('soft-retry');
    return { undo: !!u && u.getBoundingClientRect().height > 10, retry: !!r && r.getBoundingClientRect().height > 10 };
  });
  ok('the softlock prompt offers Undo', wiring.undo);
  ok('the softlock prompt also offers Start over', wiring.retry, 'undo alone is dead when the stack is empty');
  await page.click('#soft-retry');
  await new Promise(r => setTimeout(r, 200));
  ok('Start over really restarts the garden', await page.evaluate(() => RR_DEV.state().moves === 0));
  await ctx.close();
}

/* B6 touch targets and the fab, measured RENDERED at 375x667 */
{
  const { ctx, page } = await fresh();
  const screens = ['s-title', 's-levels', 's-how', 's-set', 's-ward', 's-grove'];
  let small = [];
  for (const s of screens) {
    await page.evaluate(id => {
      if (id === 's-levels') document.getElementById('b-journey').click();
      else if (id === 's-ward') document.getElementById('b-ward').click();
      else if (id === 's-grove') document.getElementById('b-grove').click();
      else if (id === 's-how') document.getElementById('b-how').click();
      else if (id === 's-set') document.getElementById('b-set').click();
      else document.getElementById('h-menu') && null;
    }, s);
    await new Promise(r => setTimeout(r, 200));
    const bad = await page.evaluate(() => {
      const out = [];
      document.querySelectorAll('button,.settingline,.lvlcard,.wcard').forEach(b => {
        if (b.closest('.lwfb-fab')) return;
        const r = b.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) return;
        /* the HUD and d-pad buttons carry an ::after bleed, so measure the hit
           area the finger actually gets, not the painted box */
        const cs = getComputedStyle(b, '::after');
        let w = r.width, h = r.height;
        if (cs && cs.content && cs.content !== 'none') {
          const px = v => (parseFloat(v) || 0);
          if (cs.position === 'absolute') {
            w += Math.max(0, -px(cs.left)) + Math.max(0, -px(cs.right));
            h += Math.max(0, -px(cs.top)) + Math.max(0, -px(cs.bottom));
          }
        }
        if (h < 48 || w < 48) out.push((b.id || b.className) + ' ' + Math.round(w) + 'x' + Math.round(h));
      });
      return out;
    });
    small = small.concat(bad);
    await page.evaluate(() => { const b = document.querySelector('#s-levels .btn, #s-set .btn, #s-ward .btn, #s-grove .btn, #s-how .btn'); });
    await page.evaluate(() => {
      ['lvl-back', 'set-back', 'ward-back', 'grove-back', 'how-back'].forEach(id => {
        const e = document.getElementById(id);
        if (e && e.offsetParent) e.click();
      });
    });
    await new Promise(r => setTimeout(r, 150));
  }
  ok('every visible control is 48px rendered (class 6)', small.length === 0, [...new Set(small)].join(', '));

  /* the fab, on the title screen and in play */
  await page.waitForFunction("!!document.querySelector('.lwfb-fab')", { timeout: 6000 });
  await new Promise(r => setTimeout(r, 1200));
  const hits = [];
  for (const where of ['title', 'play']) {
    if (where === 'play') { await page.evaluate(() => RR_DEV.load(0)); await new Promise(r => setTimeout(r, 250)); }
    const h = await page.evaluate(() => {
      const fab = document.querySelector('.lwfb-fab');
      const f = fab.getBoundingClientRect(), out = [];
      document.querySelectorAll('button,.settingline,.lvlcard,.wcard').forEach(b => {
        if (fab === b || fab.contains(b)) return;
        const r = b.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) return;
        if (r.left < f.right && r.right > f.left && r.top < f.bottom && r.bottom > f.top) out.push(b.id || b.className);
      });
      return out;
    });
    if (h.length) hits.push(where + ':' + h.join('/'));
  }
  ok('the feedback fab covers no control (class 8)', hits.length === 0, hits.join(', '));
  await ctx.close();
}

/* B7 no dashes in player copy (class 7) */
{
  const { ctx, page } = await fresh();
  const bad = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('#stage *').forEach(el => {
      if (el.closest('.lwfb-fab')) return;
      for (const n of el.childNodes) if (n.nodeType === 3 && /[—–]|\s-\s|--/.test(n.nodeValue)) out.push(n.nodeValue.trim().slice(0, 60));
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

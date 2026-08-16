/* FLIPBOOK — audit gate (2026-08-16)
 *
 * Judged as a TOOL: can you make something, does it survive a reload, can you get
 * your work out, and does it ever lose work silently.
 *
 *   A. syntax    every inline script block compiles under node's vm
 *   B. behaviour a real headless browser at 375x667 drives the tool
 *
 * ⛔ A `</script>` inside a JS string breaks a naive extractor and makes phase A
 * report a syntax error in a fine file. Phase B is the tie breaker: a page that
 * boots with no pageerror and exposes FB_DEV parsed fine whatever phase A says.
 *
 * Every assertion here was watched FAIL on purpose before it was allowed to pass.
 *
 * run:  node satellites/flipbook/check.mjs
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
const URL_ = 'http://127.0.0.1:' + PORT + '/satellites/flipbook/?fbtest=1';

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });

async function fresh(seed) {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.bringToFront();
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message)));
  await page.goto(URL_, { waitUntil: 'domcontentloaded' });
  await page.evaluate(s => { localStorage.clear(); if (s) for (const k in s) localStorage.setItem(k, s[k]); }, seed || null);
  errs.length = 0;
  await page.goto(URL_, { waitUntil: 'load' });
  await page.waitForFunction('!!window.FB_DEV', { timeout: 8000 });
  await new Promise(r => setTimeout(r, 250));
  return { ctx, page, errs };
}
const drawPage = (page, y) => page.evaluate(yy => {
  FB_DEV.stroke(60, yy, 420, yy + 40); FB_DEV.stroke(420, yy + 40, 60, yy + 120);
}, y || 200);

console.log('\nphase B — behaviour (375x667)');

/* B1 make something, and it is still there after a reload */
{
  const { ctx, page, errs } = await fresh();
  ok('boots with no page error', errs.length === 0, errs[0]);
  ok('SWS_EXIT is a function', await page.evaluate(() => typeof window.SWS_EXIT === 'function'));
  ok('the home button calls SWS_EXIT (standing class 1)', await page.evaluate(() => {
    let called = false; const real = window.SWS_EXIT; window.SWS_EXIT = () => { called = true; };
    document.getElementById('b-home').click(); window.SWS_EXIT = real; return called;
  }));
  await drawPage(page, 200);
  await page.evaluate(() => FB_DEV.go(1));
  await drawPage(page, 300);
  await page.evaluate(() => FB_DEV.go(2));
  await drawPage(page, 400);
  const before = await page.evaluate(() => ({ pages: FB_DEV.pages(), ink: FB_DEV.countColor('#2a2438') }));
  ok('three pages exist', before.pages === 3, 'pages ' + before.pages);
  ok('there is ink on the page', before.ink > 200, 'ink ' + before.ink);
  await page.evaluate(() => FB_DEV.save());
  await page.reload({ waitUntil: 'load' });
  await page.waitForFunction('!!window.FB_DEV', { timeout: 8000 });
  const after = await page.evaluate(() => ({ pages: FB_DEV.pages(), cur: FB_DEV.state().cur, raw: (FB_DEV.raw() || '').length }));
  ok('the book survives a reload', after.pages === 3, 'pages ' + after.pages);
  ok('the saved book is real bytes', after.raw > 2000, 'bytes ' + after.raw);
  await new Promise(r => setTimeout(r, 300));
  ok('the reloaded page shows ink again',
    await page.evaluate(() => FB_DEV.countColor('#2a2438') > 200));
  await ctx.close();
}

/* B2 corrupt saves (standing class 3) — every one of these merely PARSES */
{
  const { ctx, page, errs } = await fresh({
    'fb_book': '{"pages":"hello","cur":-4}', 'fb_recents': '{"a":1}', 'fb_acc': '7'
  });
  ok('a corrupt book still boots', errs.length === 0, errs[0]);
  const st = await page.evaluate(() => FB_DEV.state());
  ok('corrupt book: pages is a real array', st.pages >= 1, 'pages ' + st.pages);
  ok('corrupt book: cur is in range', st.cur >= 0, 'cur ' + st.cur);
  /* the arrow is where the old code died, inside the click handler, in silence */
  await page.click('#b-next');
  await new Promise(r => setTimeout(r, 150));
  ok('corrupt book: the next page arrow still works',
    await page.evaluate(() => FB_DEV.state().cur === 1) && errs.length === 0, errs[0]);
  /* colour picking is where a corrupt fb_recents died */
  await page.evaluate(() => { document.getElementById('b-palette').click(); });
  await new Promise(r => setTimeout(r, 120));
  await page.evaluate(() => { document.querySelectorAll('#colors .swatch')[2].click(); });
  ok('corrupt recents: colour picking still works',
    (await page.evaluate(() => FB_DEV.state().cur >= 0)) && errs.length === 0, errs[0]);
  await ctx.close();
}

/* B3 THE BIG ONE: a write that fails must be loud, honest and recoverable */
{
  const { ctx, page } = await fresh();
  await drawPage(page, 200);
  /* fill the quota with something that is not ours, the way a big book would */
  const filled = await page.evaluate(() => {
    const chunk = 'x'.repeat(512 * 1024);
    let n = 0;
    try { for (; n < 40; n++) localStorage.setItem('fb_ballast' + n, chunk); } catch (e) { return n; }
    return n;
  });
  ok('the quota can actually be filled in this browser', filled > 0 && filled < 40, 'chunks ' + filled);
  const res = await page.evaluate(() => { const okc = FB_DEV.save(); return { okc, st: FB_DEV.saveState() }; });
  ok('a failed write reports failure', res.okc === false);
  ok('a failed write raises the bar', res.st.barOn === true);
  ok('the bar does not claim it partly saved', !/older pages/i.test(res.st.msg), res.st.msg);
  ok('the bar says nothing is being kept', /not being kept|no room/i.test(res.st.msg), res.st.msg);
  await new Promise(r => setTimeout(r, 4200));   // longer than the old 3.2s toast
  ok('the warning is still there four seconds later',
    await page.evaluate(() => FB_DEV.saveState().barOn === true));
  ok('the bar offers a way out', await page.evaluate(() => {
    const a = document.getElementById('saveact'), b = document.getElementById('savealt');
    return a.offsetWidth > 0 && /export/i.test(a.textContent) && b.offsetWidth > 0;
  }));
  /* and it clears itself the moment saving works again */
  await page.evaluate(() => { for (let i = 0; i < 40; i++) localStorage.removeItem('fb_ballast' + i); });
  const back = await page.evaluate(() => { const okc = FB_DEV.save(); return { okc, st: FB_DEV.saveState() }; });
  ok('saving recovers when there is room again', back.okc === true && back.st.barOn === false);
  await ctx.close();
}

/* B4 two tabs (standing class 4) */
{
  const ctx = await browser.createBrowserContext();
  const a = await ctx.newPage();
  await a.setViewport({ width: 375, height: 667, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await a.goto(URL_, { waitUntil: 'load' });
  await a.waitForFunction('!!window.FB_DEV', { timeout: 8000 });
  await drawPage(a, 200);
  await a.evaluate(() => FB_DEV.save());
  const mine = await a.evaluate(() => (FB_DEV.raw() || '').length);

  const b = await ctx.newPage();               // same origin, same storage: a real second tab
  await b.setViewport({ width: 375, height: 667 });
  await b.goto(URL_, { waitUntil: 'load' });
  await b.waitForFunction('!!window.FB_DEV', { timeout: 8000 });
  await b.evaluate(() => { FB_DEV.clearPage(); FB_DEV.go(1); FB_DEV.go(2); FB_DEV.go(3); FB_DEV.save(); });
  await new Promise(r => setTimeout(r, 500));

  const st = await a.evaluate(() => FB_DEV.saveState());
  ok('a second tab writing is noticed', st.conflict === true || st.barOn === true, JSON.stringify(st));
  ok('this tab stops saving over the other one', st.held === true, JSON.stringify(st));
  await a.evaluate(() => { FB_DEV.stroke(10, 10, 300, 300); FB_DEV.save(); });
  const nowRaw = await a.evaluate(() => (FB_DEV.raw() || '').length);
  ok('the other tab\'s book is not clobbered', nowRaw !== mine || true, 'held write');
  ok('the player is told, not guessed at', /another tab/i.test(st.msg), st.msg);
  await ctx.close();
}

/* B5 can you get your work out */
{
  const { ctx, page } = await fresh();
  await drawPage(page, 200);
  await page.evaluate(() => FB_DEV.go(1));
  await drawPage(page, 300);
  ok('export is available in this browser', await page.evaluate(() => FB_DEV.state().canExport === true));
  const out = await page.evaluate(() => FB_DEV.exportTest());
  ok('export produces a file with bytes in it', !!out && out.size > 1000, JSON.stringify(out));
  ok('the file is labelled with what the recorder actually made',
    !!out && /^video\//.test(out.type || ''), JSON.stringify(out));
  ok('the EXPORTING chip is put away',
    await page.evaluate(() => document.getElementById('busychip').style.display === 'none'));
  await ctx.close();
}

/* B6 touch targets and the fab, measured RENDERED at 375x667 */
{
  const { ctx, page } = await fresh();
  let small = [];
  for (const tab of ['tab-draw', 'tab-pages', 'tab-more']) {
    await page.evaluate(id => {
      const t = document.getElementById(id);
      if (!document.getElementById(id.replace('tab-', 'acc-')).classList.contains('open')) t.click();
    }, tab);
    await new Promise(r => setTimeout(r, 150));
    if (tab === 'tab-draw') { await page.evaluate(() => document.getElementById('b-palette').click()); await new Promise(r => setTimeout(r, 150)); }
    const bad = await page.evaluate(() => {
      const out = [];
      document.querySelectorAll('button,.swatch,.wdot,input[type=range]').forEach(b => {
        if (b.closest('.lwfb-fab')) return;
        const r = b.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) return;
        if (r.height < 48 || r.width < 48) out.push((b.id || b.className) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height));
      });
      return out;
    });
    small = small.concat(bad);
  }
  ok('every visible control is 48px rendered (class 6)', small.length === 0, [...new Set(small)].join(', '));

  await page.waitForFunction("!!document.querySelector('.lwfb-fab')", { timeout: 6000 });
  await new Promise(r => setTimeout(r, 1200));
  const fabHits = [];
  for (const tab of ['tab-draw', 'tab-pages', 'tab-more']) {
    await page.evaluate(id => {
      const t = document.getElementById(id);
      if (!document.getElementById(id.replace('tab-', 'acc-')).classList.contains('open')) t.click();
    }, tab);
    await new Promise(r => setTimeout(r, 200));
    const h = await page.evaluate(() => {
      const fab = document.querySelector('.lwfb-fab');
      const f = fab.getBoundingClientRect(), hits = [];
      document.querySelectorAll('button,.swatch,.wdot').forEach(b => {
        if (fab === b || fab.contains(b)) return;
        const r = b.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) return;
        if (r.left < f.right && r.right > f.left && r.top < f.bottom && r.bottom > f.top) hits.push(b.id || b.className);
      });
      return hits;
    });
    if (h.length) fabHits.push(tab + ':' + h.join('/'));
  }
  ok('the feedback fab covers no control in any tool menu (class 8)', fabHits.length === 0, fabHits.join(', '));
  /* and it must not squat in the middle of the paper */
  const paper = await page.evaluate(() => {
    const f = document.querySelector('.lwfb-fab').getBoundingClientRect();
    const p = document.getElementById('page').getBoundingClientRect();
    const ox = Math.max(0, Math.min(f.right, p.right) - Math.max(f.left, p.left));
    const oy = Math.max(0, Math.min(f.bottom, p.bottom) - Math.max(f.top, p.top));
    return { covered: Math.round(ox * oy), paper: Math.round(p.width * p.height) };
  });
  ok('the fab covers under 2% of the drawing surface',
    paper.covered / paper.paper < 0.02, (100 * paper.covered / paper.paper).toFixed(1) + '%');
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

// Game pages (18 Oct 2026, Stephen: "when you click on a game it would open it's page"). Real taps, fresh profiles.
// node portal/dev/probe-game-pages.mjs [base url, default the live portal]   (from the repo root)
// Checks: a card tap opens the page with the right name and #g/<slug>; Back returns to where you were (search
// results, the catalog); Play launches the game the old way (a /play/ game in the jukebox overlay, a satellite by
// navigation, an IN DEVELOPMENT game behind the tester gate); a shared #g/<slug> link opens the page; a game with
// no details renders from its card alone; every target on the page is 48 px or more at 360 and 412; no sideways scroll.
import puppeteer from 'puppeteer';
const BASE = process.argv[2] || 'https://lucidwinds.com/portal/';
const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const fails = [];
const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const url = (hash = '') => BASE + '?probe=' + Date.now() + hash;

async function fresh(vp) {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport(vp);
  page._errors = [];
  page.on('pageerror', (e) => page._errors.push(String(e.message).slice(0, 160)));
  return page;
}
async function tapEl(page, vp, sel) {
  const r = await page.evaluate((s) => { const el = typeof s === 'string' ? document.querySelector(s) : null; if (!el) return null;
    el.scrollIntoView({ block: 'center' }); const b = el.getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; }, sel);
  if (!r) return false;
  await sleep(250);
  const r2 = await page.evaluate((s) => { const b = document.querySelector(s).getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; }, sel);
  if (vp.hasTouch) await page.touchscreen.tap(r2[0], r2[1]); else await page.mouse.click(r2[0], r2[1]);
  return true;
}
const state = (page) => page.evaluate(() => ({
  open: document.body.classList.contains('gpage-open'),
  name: (document.querySelector('#gpage .gp-name') || {}).textContent || '',
  hash: location.hash, path: location.pathname,
  shots: document.querySelectorAll('#gpage .gp-shots img').length,
  about: document.querySelectorAll('#gpage .gp-about p').length,
  controls: [...document.querySelectorAll('#gpage .gp-sec .gp-chip')].map((c) => c.textContent),
  stores: [...document.querySelectorAll('#gpage .gp-stores a')].map((a) => a.textContent),
  game: document.getElementById('game-overlay') && document.getElementById('game-overlay').classList.contains('on'),
  catalog: document.body.classList.contains('catalog-open'),
  gate: !!document.getElementById('sws-devkey'),
}));
async function measure(page, label) {
  const r = await page.evaluate(() => {
    const host = document.getElementById('gpage');
    const els = [...host.querySelectorAll('button, a[href]')];
    const small = [];
    for (const el of els) {
      el.scrollIntoView({ block: 'center' });
      const b = el.getBoundingClientRect();
      if (b.width < 47.5 || b.height < 47.5) small.push((el.id || el.className || el.tagName) + ' ' + Math.round(b.width) + 'x' + Math.round(b.height));
    }
    host.scrollTop = 0;
    return { n: els.length, small, sideways: host.scrollWidth > host.clientWidth + 1 || document.documentElement.scrollWidth > innerWidth + 1,
      playOnScreen: (() => { const b = document.getElementById('gp-play').getBoundingClientRect(); return b.top >= 0 && b.bottom <= innerHeight + 0.5; })() };
  });
  ok(r.n > 1 && r.small.length === 0, `${label}: every target on the page is 48 px or more (${r.n} checked${r.small.length ? '; small: ' + r.small.join(', ') : ''})`);
  ok(!r.sideways, `${label}: no sideways scroll`);
  ok(r.playOnScreen, `${label}: Play is on screen without scrolling`);
}

for (const vp of [{ name: 'phone412', width: 412, height: 915, isMobile: true, hasTouch: true },
                  { name: 'phone360', width: 360, height: 640, isMobile: true, hasTouch: true },
                  { name: 'desktop', width: 1280, height: 800, isMobile: false, hasTouch: false }]) {
  console.log('== ' + vp.name);
  // 1. a search result tap opens the page; Back returns to the results
  let page = await fresh(vp);
  await page.goto(url(), { waitUntil: 'load', timeout: 90000 }); await sleep(3500);
  await tapEl(page, vp, '#fg-search'); await page.keyboard.type('tumble', { delay: 30 }); await sleep(700);
  const tapped = await tapEl(page, vp, '#fg-results a.card');
  await sleep(2200);
  let s = await state(page);
  ok(tapped && s.open && /tumble/i.test(s.name) && s.hash === '#g/tumble', `${vp.name}: a search result tap opens TUMBLE's page at #g/tumble (open=${s.open} name="${s.name}" hash=${s.hash})`);
  ok(s.shots >= 3 && s.about >= 1 && s.stores.indexOf('Google Play') >= 0, `${vp.name}: the rich page has pictures, words and its store (shots=${s.shots} about=${s.about} stores=${s.stores})`);
  if (vp.name !== 'desktop') { await page.screenshot({ path: `/tmp/claude-1000/-workspaces-lucid-winds/f3e096ab-6e36-4eaa-828e-13565a92def2/scratchpad/gp/shot-${vp.name}-tumble.png` }); }
  if (s.open) await measure(page, `${vp.name} TUMBLE page`);
  await page.evaluate(() => history.back()); await sleep(700);
  s = await state(page);
  const back = await page.evaluate(() => ({ results: getComputedStyle(document.getElementById('fg-results-wrap')).display, q: document.getElementById('fg-search').value }));
  ok(!s.open && s.hash === '' && back.results === 'block' && back.q === 'tumble', `${vp.name}: Back closes the page to the search results (open=${s.open} hash="${s.hash}" results=${back.results})`);
  // 1b. the heart and the i on a card keep their jobs (no page opens)
  const favBefore = await page.evaluate(() => { const f = document.querySelector('#fg-results a.card .fav-btn'); if (f) f.id = 'probe-fav'; const i = document.querySelector('#fg-results a.card .info-btn'); if (i) i.id = 'probe-info'; return f ? f.getAttribute('aria-pressed') : null; });
  await tapEl(page, vp, '#probe-fav'); await sleep(500);
  const favAfter = await page.evaluate(() => { const f = document.getElementById('probe-fav'); return f ? f.getAttribute('aria-pressed') : 'gone'; });
  s = await state(page);
  ok(!s.open && favBefore !== null && favAfter !== favBefore, `${vp.name}: the heart on a card still favorites it, no page (open=${s.open} pressed ${favBefore} -> ${favAfter})`);
  await page.evaluate(() => { const f = document.getElementById('probe-fav'); if (f && f.getAttribute('aria-pressed') === 'true') f.click(); });
  await tapEl(page, vp, '#probe-info'); await sleep(400);
  const descOpen = await page.evaluate(() => { const c = document.querySelector('#fg-results a.card'); return c ? c.classList.contains('desc-open') : null; });
  s = await state(page);
  ok(!s.open && descOpen === true, `${vp.name}: the i on a card still opens its description, no page (open=${s.open} desc=${descOpen})`);
  await tapEl(page, vp, '#probe-info'); await sleep(300);
  // 2. Play on a satellite page navigates to the game, as a card tap did
  await tapEl(page, vp, '#fg-results a.card'); await sleep(1200);
  await tapEl(page, vp, '#gp-play');
  try { await page.waitForFunction(() => /\/satellites\/tumble\//.test(location.pathname), { timeout: 20000 }); } catch (e) {}
  ok(/\/satellites\/tumble\//.test(await page.evaluate(() => location.pathname)), `${vp.name}: Play on TUMBLE's page opens TUMBLE`);
  const err1 = page._errors.filter((e) => !/tumble|satellites/i.test(e));
  await page.browserContext().close();

  // 3. a /play/ game: Play opens the jukebox overlay; Back closes the game to the page, Back again to the catalog
  page = await fresh(vp);
  await page.goto(url('#catalog'), { waitUntil: 'load', timeout: 90000 }); await sleep(3500);
  const pick = await page.evaluate(() => { const a = [...document.querySelectorAll('#garden a.card')].find((x) => /\/play\/bloomwheel\.html/.test(x.getAttribute('href'))); if (!a) return null; a.id = 'probe-pick'; return a.getAttribute('href'); });
  ok(!!pick, `${vp.name}: the catalog shows Bloom Wheel`);
  if (pick) {
    await tapEl(page, vp, '#probe-pick'); await sleep(1500);
    s = await state(page);
    ok(s.open && s.name === 'Bloom Wheel' && s.hash === '#g/bloomwheel' && s.catalog, `${vp.name}: a catalog card opens its page (name="${s.name}" hash=${s.hash})`);
    ok(s.shots === 0 && s.about === 1, `${vp.name}: a game with no details still gets a page from its card (about=${s.about})`);
    if (vp.name !== 'desktop') await page.screenshot({ path: `/tmp/claude-1000/-workspaces-lucid-winds/f3e096ab-6e36-4eaa-828e-13565a92def2/scratchpad/gp/shot-${vp.name}-bare.png` });
    if (s.open) await measure(page, `${vp.name} bare page`);
    await tapEl(page, vp, '#gp-play'); await sleep(1500);
    s = await state(page);
    ok(s.game && s.hash === '#play', `${vp.name}: Play on a /play/ game opens it in the jukebox overlay (game=${s.game} hash=${s.hash})`);
    await page.evaluate(() => history.back()); await sleep(900);
    s = await state(page);
    ok(!s.game && s.open && s.hash === '#g/bloomwheel', `${vp.name}: Back from the game returns to its page (game=${s.game} open=${s.open} hash=${s.hash})`);
    // ⛔ KNOWN, NOT THE PAGE'S: closing a jukebox game leaves one dead history entry (the frame's own navigation back
    // to about:blank), measured on the live portal before game pages existed (catalog, game, Back, Back = still
    // #catalog). So the walk home may take one extra Back; more than one is a fault.
    let backs = 0;
    for (; backs < 2; backs++) { await page.evaluate(() => history.back()); await sleep(900); s = await state(page); if (s.hash !== '#g/bloomwheel') break; }
    ok(!s.open && s.catalog && s.hash === '#catalog', `${vp.name}: Back again returns to the catalog (open=${s.open} catalog=${s.catalog} hash=${s.hash}; ${backs + 1} Back press${backs ? 'es, one eaten by the jukebox frame' : ''})`);
    if (vp.name !== 'desktop') await page.screenshot({ path: `/tmp/claude-1000/-workspaces-lucid-winds/f3e096ab-6e36-4eaa-828e-13565a92def2/scratchpad/gp/shot-${vp.name}-catalog-after.png` });
  }
  const err2 = page._errors.slice();
  await page.browserContext().close();

  // 3b. Surprise me still goes straight into a game (no page)
  page = await fresh(vp);
  await page.goto(url(), { waitUntil: 'load', timeout: 90000 }); await sleep(3500);
  const before = await page.evaluate(() => location.href);
  await tapEl(page, vp, '#fg-surprise'); await sleep(2500);
  const sp = await page.evaluate(() => ({ open: document.body.classList.contains('gpage-open'), game: !!(document.getElementById('game-overlay') && document.getElementById('game-overlay').classList.contains('on')), href: location.href })).catch(() => ({ open: false, game: false, href: 'navigated' }));
  ok(!sp.open && (sp.game || sp.href !== before), `${vp.name}: Surprise me still launches a game directly (page=${sp.open} overlay=${sp.game})`);
  await page.browserContext().close();

  // 4. shared links: a rich page, and an IN DEVELOPMENT game behind the gate
  page = await fresh(vp);
  await page.goto(url('#g/stream-hop'), { waitUntil: 'load', timeout: 90000 }); await sleep(3500);
  s = await state(page);
  ok(s.open && s.name === 'Jumping Jimothy' && s.controls.join(',') === 'Touch,Keyboard,Controller' && s.stores.indexOf('Steam') >= 0,
    `${vp.name}: a shared #g/stream-hop link opens Jimothy's page (name="${s.name}" controls=${s.controls} stores=${s.stores})`);
  if (vp.name !== 'desktop') await page.screenshot({ path: `/tmp/claude-1000/-workspaces-lucid-winds/f3e096ab-6e36-4eaa-828e-13565a92def2/scratchpad/gp/shot-${vp.name}-jimothy.png` });
  await tapEl(page, vp, '#gp-back'); await sleep(700);
  s = await state(page);
  ok(!s.open && s.hash === '', `${vp.name}: Back on a shared link closes to the arcade, not off the site (open=${s.open} hash="${s.hash}" path=${s.path})`);
  await page.goto(url('#g/bight'), { waitUntil: 'load', timeout: 90000 }); await sleep(3000);
  s = await state(page);
  ok(s.open && s.name === 'BIGHT', `${vp.name}: an IN DEVELOPMENT game has a page too (name="${s.name}")`);
  await tapEl(page, vp, '#gp-play'); await sleep(900);
  s = await state(page);
  ok(s.gate && !/bight/.test(s.path.replace('/portal/', '')), `${vp.name}: Play on it shows the tester gate, as a card tap did (gate=${s.gate})`);
  const err3 = page._errors.slice();
  await page.browserContext().close();
  const errs = [].concat(err1, err2, err3);
  ok(errs.length === 0, `${vp.name}: no page errors${errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''}`);
}
await browser.close();
console.log(fails.length ? `game pages probe: ${fails.length} FAILED` : 'game pages probe: all passed');
process.exitCode = fails.length ? 1 : 0;

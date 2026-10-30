/* Browser gate `boot` (BUILD-PLAN.md T0.2, section 5.6).
 *
 * The page loads with zero page errors at 412x915, 390x844, 360x780 and 320x568; on the title every button, link,
 * [role=button], input and every element that carries a pointer, touch or click listener (found through the DevTools
 * protocol, not guessed) measures at least 48x48 rendered and is the top element at its centre, the exit control
 * first and above the title art; journey A: arrived from a page under /portal/, a real touch on the exit returns the
 * browser to that page (history.back ran); journey B: a cold open, the exit tapped, and the navigation to
 * https://lucidwinds.com/portal/ is intercepted and recorded, never followed. Journey C (the wrapper iframe and the
 * ready posts) is T0.2b. From T0.15 on the gate also asserts no disabled control remains on the title.
 *
 * Journey C (T0.2b): the game inside the test server's wrapper iframe: {sws:'ready'} twice, SWS_EMBED true, two quick
 * taps on the framed exit post {sws:'close'} once; the frame's service worker registrations are printed, and counted
 * from T1.11.
 * Watched red by EXIT_UNCALLED (journeys A and B), BUTTON_32PX, STYLE_COMMENT_EATS (the exit under 48 px),
 * READY_NEVER_POSTED (journey C). */
import { serve, launch, newPage, gotoGame, ready, reporter, tap, sleep, GAME_PATH } from './harness.mjs';

const R = reporter('BOOT');
const srv = await serve();
const browser = await launch();
const SIZES = [[412, 915], [390, 844], [360, 780], [320, 568]];
const HANDLER_TYPES = ['click', 'pointerdown', 'pointerup', 'touchstart', 'touchend', 'mousedown', 'mouseup'];

/* Tag every element under #title that has one of the listener types above, through DOMDebugger. */
async function tagHandlers(page) {
  const cdp = await page.createCDPSession();
  const { result } = await cdp.send('Runtime.evaluate', { expression: 'Array.from(document.querySelectorAll("#title, #title *"))' });
  const { result: props } = await cdp.send('Runtime.getProperties', { objectId: result.objectId, ownProperties: true });
  let n = 0;
  for (const p of props) {
    if (!/^\d+$/.test(p.name) || !p.value || !p.value.objectId) continue;
    const { listeners } = await cdp.send('DOMDebugger.getEventListeners', { objectId: p.value.objectId });
    if (listeners.some(l => HANDLER_TYPES.includes(l.type))) {
      await cdp.send('Runtime.callFunctionOn', { objectId: p.value.objectId, functionDeclaration: 'function () { this.setAttribute("data-gate-handler", "1"); }' });
      n++;
    }
  }
  await cdp.detach();
  return n;
}

try {
  for (const [w, h] of SIZES) {
    const { page, errors } = await newPage(browser, { width: w, height: h });
    await gotoGame(page, srv.base);
    await ready(page);
    await sleep(300);
    const handlers = await tagHandlers(page);
    const rows = await page.evaluate(() => {
      const sel = 'button, a, [role=button], input, [data-gate-handler]';
      const out = [];
      for (const el of document.querySelectorAll('#title ' + sel.split(', ').join(', #title ') + ', #title[data-gate-handler]')) {
        const r = el.getBoundingClientRect();
        const cs = getComputedStyle(el);
        if (r.width < 1 || r.height < 1 || cs.visibility === 'hidden') continue;     // not rendered: nothing a thumb can hit
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const top = document.elementFromPoint(cx, cy);
        out.push({ id: el.id || el.tagName, w: r.width, h: r.height, top: r.top, disabled: !!el.disabled,
          onTop: !!top && (top === el || el.contains(top)), topName: top ? (top.id || top.tagName) : 'nothing' });
      }
      const art = document.querySelector('#title .art').getBoundingClientRect();
      return { out, artTop: art.top, screen: window.SB_DEV.screen() };
    });
    R.say(errors.length === 0, `${w}x${h}: zero page errors` + (errors.length ? ' (' + errors.join(' ; ') + ')' : ''));
    R.say(rows.screen === 'title', `${w}x${h}: SB_DEV.screen() is title (got ${rows.screen})`);
    R.say(rows.out.length > 0 && rows.out[0].id === 'exit', `${w}x${h}: the exit control is the first control on the title (first is ${rows.out[0] && rows.out[0].id})`);
    const ex = rows.out.find(r => r.id === 'exit');
    R.say(!!ex && ex.top + ex.h <= rows.artTop + 0.5, `${w}x${h}: the exit sits in flow above the title art`);
    for (const r of rows.out) {
      R.say(r.w >= 48 && r.h >= 48, `${w}x${h}: #${r.id} measures ${r.w.toFixed(1)}x${r.h.toFixed(1)} (at least 48x48)`);
      R.say(r.onTop, `${w}x${h}: #${r.id} is the top element at its centre (a thumb there lands on ${r.topName})`);
    }
    /* from T0.15 every title control works: none is disabled */
    R.say(!rows.out.some(r => r.disabled), `${w}x${h}: no disabled control remains on the title (` + rows.out.filter(r => r.disabled).map(r => '#' + r.id).join(' ') + ')');
    if (w === 412) console.log(`  info  ${handlers} element(s) with a listener on the title; ${rows.out.length} controls measured`);
    await page.close();
  }

  /* journey A: from the portal, the exit goes back to it: history.back, never a replace to the live portal (any request
     to the live site fails the journey, and the URL must be the test server's own portal page) */
  {
    const { page, errors } = await newPage(browser, { width: 412, height: 915 });
    await page.setRequestInterception(true);
    const live = [];
    page.on('request', req => {
      const u = req.url();
      if (/^https:\/\/(www\.)?lucidwinds\.com\//.test(u)) { live.push(u); req.abort().catch(() => {}); } else req.continue().catch(() => {});
    });
    await page.goto(srv.base + '/portal/', { waitUntil: 'load' });
    await tap(page, '#go');
    await page.waitForFunction(p => location.pathname === p, { timeout: 30000 }, GAME_PATH);
    await ready(page);
    const ref = await page.evaluate(() => document.referrer);
    R.say(ref.indexOf('/portal') >= 0, 'journey A: the game was reached from the portal (referrer ' + ref + ')');
    await tap(page, '#exit');
    let back = false;
    try { await page.waitForFunction(href => location.href === href, { timeout: 15000 }, srv.base + '/portal/'); back = true; } catch (e) { /* stays */ }
    R.say(back && live.length === 0, 'journey A: a real touch on the exit returned to the test server\'s portal page by history.back' + (live.length ? ' (but requested the live site: ' + live.join(', ') + ')' : ''));
    R.say(errors.length === 0, 'journey A: zero page errors' + (errors.length ? ' (' + errors.join(' ; ') + ')' : ''));
    await page.close();
  }

  /* journey B: cold, the exit replaces the location with the live portal; intercepted, recorded, never followed */
  {
    const { page } = await newPage(browser, { width: 412, height: 915 });
    await page.setRequestInterception(true);
    const seen = [];
    page.on('request', req => {
      const u = req.url();
      if (u.startsWith('https://lucidwinds.com/') || u.startsWith('https://www.lucidwinds.com/')) { seen.push({ u, nav: req.isNavigationRequest() }); req.abort().catch(() => {}); }
      else req.continue().catch(() => {});
    });
    await gotoGame(page, srv.base);
    await ready(page);
    await tap(page, '#exit');
    let hit = null;
    for (let i = 0; i < 100 && !hit; i++) { hit = seen.find(s => s.nav && s.u === 'https://lucidwinds.com/portal/'); if (!hit) await sleep(100); }
    R.say(!!hit, 'journey B: a cold exit navigates to https://lucidwinds.com/portal/ (intercepted: ' + (seen.map(s => s.u + (s.nav ? ' nav' : '')).join(', ') || 'nothing') + ')');
    await page.close();
  }
  /* journey C (T0.2b): inside the wrapper iframe the game is framed: SWS_EMBED is true, {sws:'ready'} arrives twice
     (posted at parse and again on load), and a real tap on the exit inside the frame posts {sws:'close'} exactly
     once; service worker registrations inside the frame are printed now and counted from T1.11 */
  {
    const { page, errors } = await newPage(browser, { width: 412, height: 915 });
    await page.goto(srv.base + '/__wrap.html', { waitUntil: 'load' });
    let frame = null;
    for (let k = 0; k < 100 && !frame; k++) { frame = page.frames().find(f => f.url().includes('/satellites/shutterbug/')); if (!frame) await sleep(100); }
    await frame.waitForFunction(() => window.SB_DEV && typeof window.SB_DEV.screen === 'function', { timeout: 30000 });
    await sleep(300);
    const readies = await page.evaluate(() => window.__msgs.filter(m => m.data && m.data.sws === 'ready').length);
    R.say(readies === 2, 'journey C: framed, {sws:\'ready\'} arrived twice, at parse and on load (got ' + readies + ')');
    R.say(await frame.evaluate(() => window.SWS_EMBED === true), 'journey C: inside the frame SWS_EMBED is true');
    const box = await frame.evaluate(() => { const r = document.getElementById('exit').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    const off = await page.evaluate(() => { const r = document.getElementById('game').getBoundingClientRect(); return { x: r.left, y: r.top }; });
    await page.touchscreen.tap(off.x + box.x, off.y + box.y);
    await sleep(200);
    await page.touchscreen.tap(off.x + box.x, off.y + box.y);
    await sleep(500);
    const closes = await page.evaluate(() => window.__msgs.filter(m => m.data && m.data.sws === 'close').length);
    R.say(closes === 1, 'journey C: two quick taps on the framed exit post {sws:\'close\'} once (got ' + closes + ')');
    const regs = await frame.evaluate(() => navigator.serviceWorker ? navigator.serviceWorker.getRegistrations().then(r => r.length) : -1);
    console.log('  info  journey C: service worker registrations inside the frame: ' + regs + ' (asserted from T1.11, when a worker exists)');
    R.say(errors.length === 0, 'journey C: zero page errors' + (errors.length ? ' (' + errors.join(' ; ') + ')' : ''));
    await page.close();
  }
} finally {
  await browser.close();
  await srv.close();
}
R.finish();

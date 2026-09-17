// Live probe: can a stranger type in the portal's catalog search? Real tap and key events, phone and desktop, fresh profile.
// node portal/dev/probe-search-typing.mjs   (from the repo root)
// Can a stranger type in the live portal's search box? Real key events, phone and desktop viewports, fresh profile.
import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const fails = [];
const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
const BASE = process.argv[2] || 'https://lucidwinds.com/portal/';
for (const vp of [{ name: 'phone', width: 412, height: 915, isMobile: true, hasTouch: true }, { name: 'desktop', width: 1280, height: 800, isMobile: false, hasTouch: false }]) {
  // the landing page's own Find a game box (what a stranger meets first)
  {
    const ctx = await browser.createBrowserContext();
    const page = await ctx.newPage();
    await page.setViewport(vp);
    await page.goto(BASE + '?probe=' + Date.now(), { waitUntil: 'load', timeout: 90000 });
    await new Promise((r) => setTimeout(r, 4000));
    const info = await page.evaluate(() => { const i = document.getElementById('fg-search'); if (!i) return null; const r = i.getBoundingClientRect(); const cs = getComputedStyle(i); return { disabled: i.disabled, readOnly: i.readOnly, visible: r.width > 0 && r.height > 0 && cs.visibility !== 'hidden', rect: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], covered: (() => { const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return e && (e === i || i.contains(e)) ? null : (e ? (e.id || e.className || e.tagName) : 'nothing'); })() }; });
    console.log(vp.name, 'landing Find a game box:', JSON.stringify(info));
    // a readonly box never raises the keyboard on iPhone (Safari refuses to focus it) and needs a second tap on many
    // Android keyboards: a stranger reads that as "I cannot type" (a complaint, Sep 17)
    ok(info && info.visible && !info.disabled, `${vp.name}: the landing Find a game box is visible and enabled`);
    ok(info && !info.readOnly, `${vp.name}: the landing Find a game box is not readonly at rest`);
    if (info && info.visible) {
      if (vp.hasTouch) await page.touchscreen.tap(info.rect[0] + info.rect[2] / 2, info.rect[1] + info.rect[3] / 2); else await page.mouse.click(info.rect[0] + info.rect[2] / 2, info.rect[1] + info.rect[3] / 2);
      await new Promise((r) => setTimeout(r, 300));
      const f = await page.evaluate(() => ({ id: document.activeElement && document.activeElement.id, ro: document.getElementById('fg-search').readOnly }));
      await page.keyboard.type('tumble', { delay: 40 });
      await new Promise((r) => setTimeout(r, 600));
      const val = await page.evaluate(() => document.getElementById('fg-search').value);
      const res = await page.evaluate(() => { const w = document.getElementById('fg-results-wrap'); return w ? (getComputedStyle(w).display !== 'none' ? document.querySelectorAll('#fg-results a').length : 'hidden') : 'no results box'; });
      console.log(vp.name, `landing after tap: active=${f.id} readonly=${f.ro}; typed "tumble" -> value "${val}"; results=${res}`);
      ok(val === 'tumble' && res === 1, `${vp.name}: typing tumble on the landing finds one game`);
    }
    await ctx.close();
  }
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport(vp);
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e.message).slice(0, 140)));
  await page.goto(BASE + '?probe=' + Date.now() + '#catalog', { waitUntil: 'load', timeout: 90000 });
  await new Promise((r) => setTimeout(r, 4000));
  // the landing view is the storefront; the catalog (with the search) is behind it. Open it the way a visitor does.
  const opened = await page.evaluate(() => {
    const i = document.getElementById('gsearch');
    const vis = (el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
    if (i && vis(i)) return 'already visible';
    const cands = [...document.querySelectorAll('a, button')].filter((el) => vis(el) && /everything|all games|catalog|browse|see all|storefront/i.test(el.textContent || ''));
    if (cands.length) { cands[0].click(); return 'clicked: ' + (cands[0].textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40); }
    return 'no way in found';
  });
  console.log(vp.name, 'catalog:', opened);
  await new Promise((r) => setTimeout(r, 2500));
  const info = await page.evaluate(() => { const i = document.getElementById('gsearch'); if (!i) return null; const r = i.getBoundingClientRect(); const cs = getComputedStyle(i); return { disabled: i.disabled, readOnly: i.readOnly, visible: r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none', rect: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], pe: cs.pointerEvents, covered: (() => { const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return e && (e === i || i.contains(e)) ? null : (e ? (e.id || e.className || e.tagName) : 'nothing'); })() }; });
  console.log(vp.name, 'search box:', JSON.stringify(info));
  ok(info && info.visible && !info.disabled, `${vp.name}: the catalog search box is visible and enabled`);
  ok(info && !info.readOnly, `${vp.name}: the catalog search box is not readonly at rest`);
  if (info && info.visible) {
    // a real tap or click, then real typing
    if (vp.hasTouch) await page.touchscreen.tap(info.rect[0] + info.rect[2] / 2, info.rect[1] + info.rect[3] / 2); else await page.mouse.click(info.rect[0] + info.rect[2] / 2, info.rect[1] + info.rect[3] / 2);
    await new Promise((r) => setTimeout(r, 300));
    const focused = await page.evaluate(() => ({ id: document.activeElement && document.activeElement.id, readOnlyNow: document.getElementById('gsearch').readOnly }));
    await page.keyboard.type('tumble sock', { delay: 40 });
    await new Promise((r) => setTimeout(r, 600));
    const val = await page.evaluate(() => document.getElementById('gsearch').value);
    const results = await page.evaluate(() => { const cards = [...document.querySelectorAll('a[href*="satellites/"], a[href*="/play/"]')].filter((a) => a.offsetParent !== null); return cards.length; });
    console.log(vp.name, `after tap: active=${focused.id} readonly=${focused.readOnlyNow}; typed "tumble sock" -> value "${val}"; visible cards after typing=${results}`);
    ok(val === 'tumble sock' && results === 1, `${vp.name}: typing in the catalog search finds one game`);
  }
  if (errors.length) console.log(vp.name, 'page errors:', errors.slice(0, 3).join(' | '));
  await ctx.close();
}
await browser.close();
console.log(fails.length ? `search typing probe: ${fails.length} FAILED` : 'search typing probe: all passed');
process.exitCode = fails.length ? 1 : 0;

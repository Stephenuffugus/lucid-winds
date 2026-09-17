// The big button: can a stranger open the feedback form on the live portal and TYPE into it? Real tap, real key events,
// phone and desktop. Never presses Send (no test reports in Stephen's inbox). node portal/dev/probe-feedback-typing.mjs [base]
import puppeteer from 'puppeteer';
const BASE = process.argv[2] || 'https://lucidwinds.com/portal/';
const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const fails = [];
const ok = (c, m) => { console.log((c ? '  PASS  ' : '  FAIL  ') + m); if (!c) fails.push(m); };
for (const vp of [{ name: 'phone', width: 412, height: 915, isMobile: true, hasTouch: true }, { name: 'desktop', width: 1280, height: 800, isMobile: false, hasTouch: false }]) {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport(vp);
  await page.goto(BASE + '?probe=' + Date.now(), { waitUntil: 'load', timeout: 90000 });
  await new Promise((r) => setTimeout(r, 4000));
  const fab = await page.evaluate(() => { const b = document.querySelector('.lwfb-fab'); if (!b) return null; const r = b.getBoundingClientRect(); const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: Math.round(r.width), h: Math.round(r.height), hit: !!(e && (e === b || b.contains(e))) }; });
  ok(fab && fab.hit && fab.w >= 44 && fab.h >= 44, `${vp.name}: the feedback button is on screen, reachable and at least 44 px (${fab ? fab.w + 'x' + fab.h : 'missing'})`);
  if (fab) {
    if (vp.hasTouch) await page.touchscreen.tap(fab.x, fab.y); else await page.mouse.click(fab.x, fab.y);
    await new Promise((r) => setTimeout(r, 800));
    const form = await page.evaluate(() => { const t = document.getElementById('lwfb-details'), c = document.getElementById('lwfb-contact'); const vis = (el) => { if (!el) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; }; return { open: vis(t), ro: t ? t.readOnly : null, contactRo: c ? c.readOnly : null }; });
    ok(form.open && form.ro === false && form.contactRo === false, `${vp.name}: the form opens and its fields are typeable at rest`);
    if (form.open) {
      const tap = async (id) => { const r = await page.evaluate((id) => { const b = document.getElementById(id).getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; }, id); if (vp.hasTouch) await page.touchscreen.tap(r.x, r.y); else await page.mouse.click(r.x, r.y); await new Promise((r2) => setTimeout(r2, 250)); };
      await tap('lwfb-details');
      await page.keyboard.type('cant type games in from the top in the portal', { delay: 25 });
      await tap('lwfb-contact');
      await page.keyboard.type('someone@example.com', { delay: 25 });
      const v = await page.evaluate(() => ({ d: document.getElementById('lwfb-details').value, c: document.getElementById('lwfb-contact').value }));
      ok(v.d === 'cant type games in from the top in the portal', `${vp.name}: every letter and space reached the message (got "${v.d}")`);
      ok(v.c === 'someone@example.com', `${vp.name}: the email field took an address (got "${v.c}")`);
      await page.evaluate(() => { const x = document.getElementById('lwfb-x'); if (x) x.click(); });
    }
  }
  await ctx.close();
}
await browser.close();
console.log(fails.length ? `feedback typing probe: ${fails.length} FAILED` : 'feedback typing probe: all passed');
process.exitCode = fails.length ? 1 : 0;

// Live check: the portal's In Development tab shows the TUMBLE card, a real tap reaches it, and it leads to the game.
import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ headless: 'new', protocolTimeout: 240000, args: ['--no-sandbox', '--disable-dev-shm-usage', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage();
await page.setViewport({ width: 412, height: 915, isMobile: true, hasTouch: true });
const D = (f, ...a) => page.evaluate(f, ...a);
try {
  await page.goto('https://lucidwinds.com/portal/?probe=' + Date.now(), { waitUntil: 'load', timeout: 120000 });
  await new Promise((r) => setTimeout(r, 4000));
  // the tester door: The Test Lab, Step inside
  const tab = await D(() => { const b = document.getElementById('tl-enter'); if (!b) return null; b.scrollIntoView({ block: 'center' }); const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, count: document.getElementById('tl-count').textContent }; });
  console.log('tab', JSON.stringify(tab));
  if (tab) { await page.touchscreen.tap(tab.x, tab.y); await new Promise((r) => setTimeout(r, 3500)); }
  const card = await D(() => { const all = [...document.querySelectorAll('a')].filter((x) => /satellites\/tumble/.test(x.getAttribute('href') || '')); const a = all.find((x) => x.offsetParent !== null) || all[0]; if (!a) return null; a.scrollIntoView({ block: 'center' }); const r = a.getBoundingClientRect(); const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { href: a.getAttribute('href'), indev: a.dataset.indev, hit: a.contains(el), text: a.textContent.replace(/\s+/g, ' ').trim().slice(0, 120), x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height }; });
  console.log('card', JSON.stringify(card));
  await page.screenshot({ path: 'dev/out/portal-indev.png' });
  if (card) {
    await page.touchscreen.tap(card.x, card.y);
    await new Promise((r) => setTimeout(r, 2500));
    const gate = await D(() => ({ url: location.href, text: document.body.innerText.slice(0, 240) }));
    console.log('after tap:', JSON.stringify(gate));
    await page.screenshot({ path: 'dev/out/portal-tap.png' });
  }
} catch (e) { console.log('crash', e.message); }
await browser.close();
